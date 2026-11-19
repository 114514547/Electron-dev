window.WorkspaceStorage=(()=>{
 const bridge=studioDesktop.data,merge=StudioMerge.merge,reconcile=StudioMerge.reconcile;
 let snapshot=bridge.read(),live=null,defaults=null;
 const raw=window.localStorage;
 const keys=['st-v23-demo','st-v22-demo','st-v21-demo','st-v2-demo'];
 function load(initial){
  defaults=structuredClone(initial);
  if(!snapshot.store){
   const legacy=keys.map(k=>raw.getItem(k)).find(Boolean),concept=raw.getItem('st-character-concepts-v3');
   const prefs={};for(const k of ['st_codex_v31_accent','st-v23-view','st-v25-source','st-v25-activity-v1'])if(raw.getItem(k)!=null)prefs[k]=raw.getItem(k);
   snapshot=bridge.initialize({store:legacy?JSON.parse(legacy):structuredClone(initial),concept:concept?JSON.parse(concept):null,prefs});
  }
  // Also finish scrubbing after a crash between the SQLite commit and localStorage cleanup.
  for(const key of keys)if(raw.getItem(key)!=null)raw.setItem(key,JSON.stringify(snapshot.store));
  if(raw.getItem('st-character-concepts-v3'))raw.setItem('st-character-concepts-v3',JSON.stringify(snapshot.concept));
  live=structuredClone(snapshot.store);return live;
 }
 function commit(next){
  const result=bridge.commit(snapshot,next);snapshot=structuredClone(result);
  if(live)reconcile(live,result.store);
  return result;
 }
 function save(store){return commit({...snapshot,store:structuredClone(store)});}
 function getItem(key){
  if(key==='st-v23-demo')return snapshot.store?JSON.stringify(snapshot.store):raw.getItem(key);
  if(key==='st-character-concepts-v3')return snapshot.concept?JSON.stringify(snapshot.concept):snapshot.store?null:raw.getItem(key);
  if(['st_codex_v31_accent','st-v23-view','st-v25-source','st-v25-activity-v1'].includes(key))return snapshot.prefs[key]??null;
  return snapshot.prefs[key]??raw.getItem(key);
 }
 function setItem(key,value){
  if(key==='st-v23-demo')return save(JSON.parse(value));
  if(key==='st-character-concepts-v3')return commit({...snapshot,concept:JSON.parse(value)});
  return commit({...snapshot,prefs:{...snapshot.prefs,[key]:String(value)}});
 }
 function removeItem(key){const next=structuredClone(snapshot);if(key==='st-character-concepts-v3')next.concept=null;else delete next.prefs[key];commit(next);}
 function transact(store,operation,aliases){const before=structuredClone(store);try{const result=structuredClone(operation());save(store);return result;}catch(error){reconcile(store,before);aliases();throw error;}}
 function refresh(){
  const remote=bridge.read();if(!live)return;
  const combined=merge(snapshot.store,live,remote.store);
  const concept=window.ConceptWorkbench?.getState();
  const mergedConcept=concept&&remote.concept?merge(snapshot.concept?.data,concept,remote.concept.data):null;
  snapshot=remote;reconcile(live,combined);if(mergedConcept)reconcile(concept,mergedConcept);
 }
 function reset(){snapshot=bridge.reset(defaults);for(const key of [...keys,'st-character-concepts-v3','st-character-concepts-v2','tag-composer-prototype-v1'])raw.removeItem(key);return snapshot;}
 return {load,save,getItem,setItem,removeItem,writeJSON:(k,v)=>setItem(k,JSON.stringify(v)),transact,refresh,reset,
  restoreBackup:()=>{throw Error('请使用桌面原生备份恢复入口');}};
})();
