const {_electron:electron}=require('playwright-core');
const assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),env={...process.env,STUDIO_TEST_PROFILE:path.join(root,'.test-data','empty-library-'+Date.now())};delete env.ELECTRON_RUN_AS_NODE;
(async()=>{const app=await electron.launch({executablePath:require('electron'),args:[root,'--dev'],env});try{
 const p=await app.firstWindow(),errors=[];p.on('pageerror',e=>errors.push(e.message));await p.waitForFunction(()=>window.ConceptWorkbench&&window.CreationWorkflow);
 assert.equal(await p.evaluate(()=>store.apiConnections.length),0);
 assert.equal(await p.evaluate(()=>ConceptWorkbench.getState().candidates.length),0);
 await p.evaluate(()=>{store.tagItems=[{id:'shared-tag',name:'Shared tag',category:'Test category',weight:35,enabled:true,desc:'Preserve me'}];store.tagCategories=['Test category'];save();visit('concept');});
 const result=await p.evaluate(()=>{
  const state=ConceptWorkbench.getState();const bridge=createVisualTagBridge(()=>state,()=>store,()=>WorkspaceStorage.save(store));bridge.refresh();
  let key=Object.keys(state.library).find(k=>state.library[k].name==='Test category');
  state.weights[key]['Shared tag']=72;bridge.commit();
  const weight=store.tagItems[0].weight;
  state.library[key].items[0][0]='Renamed tag';delete state.weights[key]['Shared tag'];bridge.commit();
  const renamed=structuredClone(store.tagItems[0]);
  state.library[key].items=[];bridge.commit();
  return {weight,renamed,remaining:store.tagItems.length};
 });assert.equal(result.weight,72);assert.equal(result.renamed.id,'shared-tag');assert.equal(result.renamed.name,'Renamed tag');assert.equal(result.renamed.desc,'Preserve me');assert.equal(result.remaining,0);
 await p.reload();await p.waitForFunction(()=>window.ConceptWorkbench&&window.CreationWorkflow);await p.evaluate(()=>visit('concept'));
 assert.deepEqual(await p.evaluate(()=>[store.apiConnections.length,store.tagItems.length,ConceptWorkbench.getState().candidates.length,Object.values(ConceptWorkbench.getState().library).reduce((n,c)=>n+c.items.length,0)]),[0,0,0,0]);
 await p.locator('#libraryBtn').click();assert.ok(await p.locator('#conceptOverlay').isVisible());
 assert.deepEqual(errors,[]);console.log('PASS empty startup/reload, unified tag CRUD/weight and empty library UI');
}finally{await app.close();}})().catch(e=>{console.error(e);process.exitCode=1});
