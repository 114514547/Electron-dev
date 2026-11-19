// Legacy workbench views project the canonical visual library; they do not own a second library.
window.createVisualTagBridge=function(getState,getStore,persist){
 let baseline=new Map(),ready=false;
 function rows(){const s=getState(),out=[];for(const [key,cat] of Object.entries(s.library))for(const item of cat.items)out.push({id:item[3],name:item[0],category:cat.name,weight:Number(s.weights[key]?.[item[0]]??item[1])});return out;}
 function refresh(){
  const s=getState(),db=getStore(),old=s.library,lib={},weights={};
  const categories=[...new Set([...(db.tagCategories||[]),...(db.tagItems||[]).map(t=>t.category||'未分类')])];
  for(const category of categories){
   const key=Object.keys(old).find(k=>old[k].name===category)||'visual_'+encodeURIComponent(category);
   lib[key]={name:category,items:[]};weights[key]={};
   for(const t of db.tagItems||[])if((t.category||'未分类')===category){const weight=t.enabled===false?0:Number(t.weight??50);lib[key].items.push([t.name,weight,[],t.id]);weights[key][t.name]=weight;}
   s.explore[key]??=lib[key].items.length>0;
  }
  s.library=lib;s.weights=weights;baseline=new Map(rows().map(r=>[r.id,r]));ready=true;
 }
 function commit(){
  if(!ready){refresh();return;}
  const db=getStore(),current=rows(),ids=new Set(current.map(r=>r.id)),updates=[],removed=[];
  for(const [id] of baseline)if(!ids.has(id))removed.push(id);
  for(const r of current){const before=baseline.get(r.id);if(JSON.stringify(r)!==JSON.stringify(before))updates.push(r);}
  if(!updates.length&&!removed.length)return;
  // Preserve IDs and unrelated metadata when editing names, categories and probability.
  const next=structuredClone(db.tagItems||[]).filter(t=>!removed.includes(t.id));
  for(const r of updates){
   let t=next.find(t=>t.id===r.id);
   if(!t&&r.id&&baseline.has(r.id))throw Error('标签已在视觉标签库中删除，请重新打开词条库');
   if(!t){t={id:crypto.randomUUID(),desc:'',source:'工坊手动入库',enabled:true};next.push(t);}
   Object.assign(t,{name:r.name,category:r.category,weight:Math.max(0,Math.min(100,r.weight))});
   if(baseline.get(r.id)?.weight!==r.weight)t.enabled=r.weight>0;
  }
  const categories=[...new Set(Object.values(getState().library).map(c=>c.name))];
  const previous=db.tagItems,previousCategories=db.tagCategories;
  db.tagItems=next;db.tagCategories=[...new Set([...categories,...next.map(t=>t.category)])];
  try{persist();}catch(e){db.tagItems=previous;db.tagCategories=previousCategories;throw e;}
  if(typeof syncCategories==='function')syncCategories();refresh();
 }
 return {refresh,commit};
};
