const {DatabaseSync,backup}=require('node:sqlite');
const {merge,same}=require('../renderer/adapters/merge.js');
const collections={roles:'role',works:'work',sessions:'session',worldInfoBooks:'worldbook',apiConnections:'connection',tagItems:'tag'};
const workflow={workRoles:'workRole',candidates:'candidate',adoptions:'adoption',requests:'request',detachedRp:'detachedRp'};
const encode=JSON.stringify,decode=JSON.parse;
class WorkspaceDB{
 constructor(filename){
  this.db=new DatabaseSync(filename);this.filename=filename;
  this.db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  const version=this.db.prepare('PRAGMA user_version').get().user_version;
  if(version>1)throw Error('数据库版本比当前软件新');
  if(!version)this.db.exec(`BEGIN;
   CREATE TABLE objects(kind TEXT NOT NULL,id TEXT NOT NULL,json TEXT NOT NULL CHECK(json_valid(json)),PRIMARY KEY(kind,id));
   CREATE TABLE fields(scope TEXT NOT NULL,name TEXT NOT NULL,json TEXT NOT NULL CHECK(json_valid(json)),PRIMARY KEY(scope,name));
   CREATE TABLE membership(path TEXT PRIMARY KEY,kind TEXT NOT NULL,ids TEXT NOT NULL CHECK(json_valid(ids)));
   CREATE TABLE links(source_kind TEXT,source_id TEXT,target_kind TEXT,target_id TEXT,relation TEXT,
    PRIMARY KEY(source_kind,source_id,target_kind,target_id,relation),
    FOREIGN KEY(source_kind,source_id) REFERENCES objects(kind,id) ON DELETE CASCADE,
    FOREIGN KEY(target_kind,target_id) REFERENCES objects(kind,id) ON DELETE CASCADE);
   CREATE INDEX links_target ON links(target_kind,target_id);
   CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
   PRAGMA user_version=1; COMMIT;`);
 }
 snapshot(){
  if(!this.db.prepare("SELECT 1 FROM meta WHERE key='initialized'").get())return {store:null,concept:null,prefs:{}};
  const result={store:{},concept:null,prefs:{}};
  for(const f of this.db.prepare('SELECT * FROM fields').all()){
   if(f.scope==='store')result.store[f.name]=decode(f.json);
   else if(f.scope==='workflow')(result.store.creationWorkflow??={})[f.name]=decode(f.json);
   else if(f.scope==='concept'){result.concept??={version:3,data:{}};if(f.name==='$meta')Object.assign(result.concept,decode(f.json));else result.concept.data[f.name]=decode(f.json);}
   else if(f.scope==='prefs')result.prefs[f.name]=decode(f.json);
  }
  const lookup=this.db.prepare('SELECT json FROM objects WHERE kind=? AND id=?');
  for(const group of this.db.prepare('SELECT * FROM membership').all()){
   const values=decode(group.ids).map(id=>decode(lookup.get(group.kind,String(id)).json));
   if(group.path.startsWith('workflow/'))(result.store.creationWorkflow??={})[group.path.slice(9)]=values;
   else if(group.path.startsWith('rp/'))(result.store.rpSessions??={})[group.path.slice(3)]=values;
   else if(group.path.startsWith('concept/')){result.concept??={version:3,data:{}};result.concept.data[group.path.slice(8)]=values;}
   else result.store[group.path]=values;
  }
  for(const row of this.db.prepare("SELECT id,json FROM objects WHERE kind='chapter'").all())(result.store.chapters??={})[row.id]=decode(row.json);
  return result;
 }
 save(snapshot){
  if(!snapshot.store||!Array.isArray(snapshot.store.roles)||!Array.isArray(snapshot.store.sessions)||!Array.isArray(snapshot.store.tagItems))throw Error('工作区结构无效');
  const objects=new Map(),fields=new Map(),groups=new Map();
  const field=(scope,name,value)=>fields.set(scope+'\0'+name,[scope,name,encode(value)]);
  const group=(path,kind,items)=>{
   if(!Array.isArray(items))throw Error('集合不是数组：'+path);
   const ids=[];for(const item of items){if(item?.id==null)throw Error('缺少稳定 ID：'+path);const id=String(item.id),key=kind+'\0'+id;if(objects.has(key))throw Error('重复对象 ID：'+path);objects.set(key,[kind,id,encode(item)]);ids.push(id)}
   groups.set(path,[path,kind,encode(ids)]);
  };
  for(const [key,value] of Object.entries(snapshot.store)){
   if(collections[key])group(key,collections[key],value);
   else if(key==='creationWorkflow'){for(const [k,v] of Object.entries(value))workflow[k]?group('workflow/'+k,workflow[k],v):field('workflow',k,v);}
   else if(key==='rpSessions'){field('store','rpSessions',{});for(const [owner,items] of Object.entries(value))group('rp/'+owner,'rp',items);}
   else if(key==='chapters'){field('store','chapters',{});for(const [id,text] of Object.entries(value))objects.set('chapter\0'+id,['chapter',id,encode(text)]);}
   else field('store',key,value);
  }
  if(snapshot.concept){const {data,...meta}=snapshot.concept;field('concept','$meta',meta);for(const [k,v] of Object.entries(data||{})){if(['candidates','drafts'].includes(k)&&Array.isArray(v)&&v.every(x=>x?.id!=null))group('concept/'+k,'concept-'+k,v);else field('concept',k,v);}}
  for(const [key,value] of Object.entries(snapshot.prefs||{}))field('prefs',key,value);
  const db=this.db;
  db.exec('BEGIN IMMEDIATE');
  try{
   for(const [table,map,keys] of [['objects',objects,['kind','id']],['fields',fields,['scope','name']],['membership',groups,['path']]]){
    const columns=table==='objects'?['kind','id','json']:table==='fields'?['scope','name','json']:['path','kind','ids'];
    const previous=new Map(db.prepare('SELECT * FROM '+table).all().map(row=>[keys.map(k=>row[k]).join('\0'),row]));
    const put=db.prepare(`INSERT INTO ${table} (${columns}) VALUES (${columns.map(()=>'?')}) ON CONFLICT(${keys}) DO UPDATE SET ${columns.filter(c=>!keys.includes(c)).map(c=>`${c}=excluded.${c}`).join(',')}`);
    const remove=db.prepare(`DELETE FROM ${table} WHERE ${keys.map(k=>k+'=?').join(' AND ')}`);
    for(const [key,values] of map){const old=previous.get(key);if(!old||columns.some((c,i)=>old[c]!==values[i]))put.run(...values);previous.delete(key);}
    for(const old of previous.values())remove.run(...keys.map(k=>old[k]));
   }
   db.exec('DELETE FROM links');
   const link=db.prepare('INSERT OR IGNORE INTO links VALUES (?,?,?,?,?)');
   const add=(sk,si,tk,ti,rel)=>{if(ti!=null&&objects.has(sk+'\0'+si)&&objects.has(tk+'\0'+ti))link.run(sk,String(si),tk,String(ti),rel);};
   for(const r of snapshot.store.creationWorkflow?.workRoles||[]){add('workRole',r.id,'role',r.sourceRoleId,'source');add('workRole',r.id,'work',r.workId,'work');}
   for(const w of snapshot.store.works||[]){for(const r of w.roles||[])add('work',w.id,'role',r,'cast');for(const c of w.chapters||[])add('work',w.id,'chapter',c.id,'chapter');}
   for(const s of snapshot.store.sessions||[]){add('session',s.id,'work',s.work||s.workId,'work');for(const r of s.roles||[])add('session',s.id,'role',r,'cast');}
   for(const [owner,sessions] of Object.entries(snapshot.store.rpSessions||{}))for(const s of sessions){add('rp',s.id,'role',owner,'role');add('rp',s.id,'rp',s.parentSessionId,'parent');}
   for(const c of snapshot.store.creationWorkflow?.candidates||[])add('candidate',c.id,c.target?.type,c.target?.id,'target');
   db.prepare("INSERT OR REPLACE INTO meta VALUES ('initialized','1')").run();
   if(db.prepare('PRAGMA foreign_key_check').all().length)throw Error('关联检查失败');
   if(!same(this.snapshot(),snapshot))throw Error('数据库写入复核不一致');
   db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');throw error;}
  return snapshot;
 }
 merge(base,next){const current=this.snapshot();return this.save(merge(base,next,current));}
 backup(file){return backup(this.db,file);}
 close(){this.db.close();}
}
module.exports={WorkspaceDB};
