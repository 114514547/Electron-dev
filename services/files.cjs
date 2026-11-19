const fs=require('node:fs'),path=require('node:path'),{randomUUID}=require('node:crypto');
class FileService{
 constructor(profile,repo,vault){this.profile=profile;this.repo=repo;this.vault=vault;this.assets=path.join(profile,'attachments');this.recovery=path.join(profile,'recovery');fs.mkdirSync(this.assets,{recursive:true});fs.mkdirSync(this.recovery,{recursive:true});}
 recoveryPoint(){
  // The recovery point must also preserve bytes at any attachment names being replaced.
  const file=path.join(this.recovery,'before-restore-'+Date.now()+'.json');
  fs.writeFileSync(file,JSON.stringify(this.exportBundle()),{encoding:'utf8',flag:'wx'});
  return file;
 }
 exportBundle(){const data=this.repo.snapshot();const attachments=fs.readdirSync(this.assets).filter(n=>/^[a-f0-9-]+\.[a-z0-9]+$/i.test(n)).map(name=>({name,data:fs.readFileSync(path.join(this.assets,name)).toString('base64')}));return {format:'creative-studio',version:1,data,attachments,credentialsIncluded:false};}
 importAttachment(filename){const bytes=fs.readFileSync(filename);if(bytes.length>50*1024*1024)throw Error('附件超过 50 MB');const ext=path.extname(filename).toLowerCase();if(!/^(\.(png|jpe?g|webp|gif|txt|md|pdf))$/.test(ext))throw Error('附件格式不支持');const name=randomUUID()+ext;fs.writeFileSync(path.join(this.assets,name),bytes,{flag:'wx'});return {id:name,name:path.basename(filename),url:'studio-asset://local/'+name,size:bytes.length};}
 normalize(raw){
  if(raw.format==='creative-studio'&&raw.version===1)return raw;
  if(raw.store)return {format:'creative-studio',version:1,data:{store:raw.store,concept:raw.modules?.concept?typeof raw.modules.concept==='string'?JSON.parse(raw.modules.concept):raw.modules.concept:null,prefs:{}},attachments:[]};
  throw Error('备份格式不支持');
 }
 async restore(raw){
  const bundle=this.normalize(raw),snapshot=this.vault.sanitize(bundle.data);
  if(!Array.isArray(snapshot.store?.roles)||!Array.isArray(snapshot.store?.sessions)||!Array.isArray(snapshot.store?.tagItems))throw Error('备份工作区无效');
  const resources=(bundle.attachments||[]).map(a=>{if(!/^[a-f0-9-]+\.(png|jpe?g|webp|gif|txt|md|pdf)$/i.test(a.name))throw Error('附件路径无效');const bytes=Buffer.from(a.data,'base64');if(bytes.length>50*1024*1024)throw Error('附件过大');return {...a,bytes};});
  await this.recoveryPoint();
  // Stage attachment writes and roll them back if the SQLite transaction rejects data.
  const previous=[];
  try{for(const a of resources){const file=path.join(this.assets,a.name);previous.push([file,fs.existsSync(file)?fs.readFileSync(file):null]);fs.writeFileSync(file,a.bytes);}this.repo.save(snapshot);}
  catch(error){for(const [file,bytes] of previous)bytes===null?fs.rmSync(file,{force:true}):fs.writeFileSync(file,bytes);throw error;}
  return snapshot;
 }
}
module.exports={FileService};
