const {_electron:electron}=require('playwright-core');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'..'),profile=path.join(root,'.test-data','engineering-'+Date.now());
fs.mkdirSync(profile,{recursive:true});
const env={...process.env,STUDIO_TEST_PROFILE:profile};delete env.ELECTRON_RUN_AS_NODE;
let app,page,server;const errors=[],checks=[],received=[];
const pass=name=>{checks.push(name);console.log('PASS '+name);};
async function launch(){
 app=await electron.launch({executablePath:require('electron'),args:[root,'--dev'],env});
 page=await app.firstWindow();page.on('requestfailed',r=>console.log('REQUEST FAILED',r.url().split('/').slice(0,3).join('/'),r.failure()));page.on('console',m=>{if(m.type()==='error')console.log(m.text().slice(0,300));});page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.CreationWorkflow&&window.DesktopActions);
}
async function close(){const done=app.waitForEvent('close');await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')).close());await done;app=null;}
async function selectFile(file){await app.evaluate(({dialog},file)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[file]});dialog.showSaveDialog=async()=>({canceled:false,filePath:file});dialog.showMessageBox=async()=>({response:1});},file);}
async function reloadDone(){await page.waitForFunction(()=>window.CreationWorkflow&&window.DesktopActions);}
(async()=>{
 server=http.createServer(async(req,res)=>{
  if(req.method==='GET'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({data:[{id:'fixture'}]}));return;}
  let raw='';for await(const chunk of req)raw+=chunk;const body=JSON.parse(raw);received.push({body,auth:req.headers.authorization,key:req.headers['x-api-key']});
  if(req.url.includes('/denied/')){res.writeHead(401);res.end('secret provider diagnostic must not escape');return;}
  const ollama=req.url.endsWith('/api/chat'),claude=req.url.endsWith('/messages');
  res.setHeader('Content-Type',ollama?'application/x-ndjson':'text/event-stream');
  if(ollama){res.end(JSON.stringify({message:{content:'streamed'},done:false})+'\n'+JSON.stringify({done:true,done_reason:'stop'})+'\n');return;}
  const event=claude?{type:'content_block_delta',delta:{text:'streamed'}}:{choices:[{delta:{content:'streamed'}}]};
  res.write('data: '+JSON.stringify(event)+'\n\n');
  if(req.url.includes('/slow/')){const timer=setTimeout(()=>res.end('data: [DONE]\n\n'),20000);res.on('close',()=>clearTimeout(timer));return;}
  res.end(claude?'data: '+JSON.stringify({type:'message_delta',delta:{stop_reason:'end_turn'}})+'\n\n':'data: [DONE]\n\n');
 });await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const endpoint='http://127.0.0.1:'+server.address().port;
 await launch();
 // Create a genuine first-round localStorage profile, then restart without the new database.
 await page.evaluate(endpoint=>{
  const legacy=structuredClone(store);legacy.round2Marker='legacy-preserved';
  legacy.apiConnections.push({id:'fixture',name:'Fixture',provider:'openai-compatible',baseUrl:endpoint+'/v1',apiKey:'synthetic-private-key',enabled:true,models:[{id:'fixture'}]});
  localStorage.setItem('st-v23-demo',JSON.stringify(legacy));
 },endpoint);
 await close();
 for(const suffix of ['','-wal','-shm']){const file=path.join(profile,'workspace.sqlite'+suffix);if(fs.existsSync(file))fs.unlinkSync(file);}
 await launch();
 const migrated=await page.evaluate(()=>({marker:store.round2Marker,c:store.apiConnections.find(c=>c.id==='fixture'),legacy:localStorage.getItem('st-v23-demo')}));
 assert.equal(migrated.marker,'legacy-preserved');assert.equal(migrated.c.hasCredential,true);assert.equal(migrated.c.apiKey,undefined);assert.ok(!migrated.legacy.includes('synthetic-private-key'));
 assert.ok(fs.readdirSync(path.join(profile,'credentials')).length>=2);
 for(const name of fs.readdirSync(path.join(profile,'credentials')))assert.ok(!fs.readFileSync(path.join(profile,'credentials',name)).includes(Buffer.from('synthetic-private-key')));
 pass('legacy migration, encrypted recovery and credential scrubbing');
 const business=await page.evaluate(()=>{
  const api=CreationWorkflow,r=store.roles[0],w=store.works[0],original=r.visual;
  store.works.push({...structuredClone(w),id:'round2-work',title:'Synthetic second work'});save();
  const a=api.createWorkRole(w.id,r.id),b=api.createWorkRole('round2-work',r.id);
  api.updateWorkRole(a.id,{visual:'Only first work'});
  const candidate=api.createCandidate({source:{module:'test',id:'origin'},target:{type:'role',id:r.id},content:{desc:'adopted',visual:'must not apply'}});
  api.adoptCandidate(candidate.id,['desc']);
  startRpForRole(r.id);const rpId=ui.rpSessionId;const rp=store.rpSessions[r.id].find(s=>s.id===rpId);
  rp.messages=[{id:'point',by:'user',text:'Synthetic branch point'}];save();
  const branch=api.branch(rpId,'point','Synthetic branch');api.stateChange(branch.id,{mood:'branch only'});
  const trial=api.trial(branch.id,'isolated rehearsal');const before=api.getRp(branch.id).messages.length;api.adoptTrial(branch.id,trial.id);
  const book=api.importWorldbook({name:'Synthetic world',entries:[{id:'synthetic-entry',keys:['trigger'],content:'WORLD_MARKER',enabled:true,constant:true}]});
  store.worldInfoBooks.find(v=>v.id===book.id).global=true;save();
  return {isolated:api.getWorkRoles('round2-work').find(v=>v.id===b.id).data.visual===original&&r.visual===original,adoption:api.provenance({type:'role',id:r.id}).some(v=>v.candidateId===candidate.id),before,after:api.getRp(branch.id).messages.length,parentCount:api.getRp(rpId).messages.length,parentMood:api.getRp(rpId).runtimeState.mood,branchMood:api.getRp(branch.id).runtimeState.mood};
 });
 assert.equal(business.isolated,true);assert.equal(business.adoption,true);assert.equal(business.before,1);assert.equal(business.after,2);assert.equal(business.parentCount,1);assert.equal(business.parentMood,undefined);assert.equal(business.branchMood,'branch only');
 pass('work role isolation, field adoption, provenance, RP branch and trial isolation');
 await page.evaluate(()=>{openSettings('api_connections');store.settingsModalTest='saved';save();closeSettingsModal();});
 assert.equal((await app.windows()).length,1);
 pass('in-page settings saves through shared SQLite without another window');
 await page.evaluate(endpoint=>{
  for(const [id,provider,suffix] of [['claude-test','anthropic','/v1'],['ollama-test','ollama',''],['slow','openai','/slow'],['denied','openai','/denied']])store.apiConnections.push({id,name:id,provider,baseUrl:endpoint+suffix,apiKey:'synthetic-private-key',enabled:true,models:[{id:'fixture'}]});
  store.globalModelConfig={...store.globalModelConfig,connectionId:'fixture',modelId:'fixture'};save();
 },endpoint);
 for(const id of ['fixture','claude-test','ollama-test']){
  const result=await page.evaluate(async id=>{
   store.globalModelConfig={...store.globalModelConfig,connectionId:id,modelId:'fixture'};store.featureAllocations.creative_discussion={connectionId:id,modelId:'fixture'};save();
   const req=CreationWorkflow.prepareRequest({featureKey:'discussion',input:'Synthetic input'}),deltas=[];
   const off=studioDesktop.ai.onEvent(e=>{if(e.requestId===req.id&&e.type==='delta')deltas.push(e.text);});
   try{const answer=await CreationWorkflow.executeRequest(req.id);return {status:answer.status,text:answer.response,body:req.transport.body,deltas};}finally{off();}
  },id);
  assert.equal(result.status,'succeeded');assert.equal(result.text,'streamed');assert.deepEqual(result.deltas,['streamed']);assert.deepEqual(received.at(-1).body,result.body);
  assert.equal(received.at(-1)[id==='claude-test'?'key':'auth'],id==='claude-test'?'synthetic-private-key':'Bearer synthetic-private-key');
 }
 assert.equal((await page.evaluate(()=>studioDesktop.ai.models('fixture')))[0].id,'fixture');
 const failures=await page.evaluate(async()=>{
  const results=[];
  for(const id of ['slow','denied']){
   store.globalModelConfig={...store.globalModelConfig,connectionId:id,modelId:'fixture'};store.featureAllocations.creative_discussion={connectionId:id,modelId:'fixture'};save();
   const req=CreationWorkflow.prepareRequest({featureKey:'discussion',input:'test'});
   const off=studioDesktop.ai.onEvent(e=>{if(id==='slow'&&e.requestId===req.id&&e.type==='delta')void studioDesktop.ai.cancel(req.id);});
   try{await CreationWorkflow.executeRequest(req.id);}catch{}finally{off();}
   const saved=CreationWorkflow.listRequests().find(r=>r.id===req.id);results.push({status:saved.status,code:saved.errorCode,error:saved.error});
  }return results;
 });assert.equal(failures[0].status,'cancelled');assert.equal(failures[1].code,'authentication');assert.ok(!JSON.stringify(failures).includes('secret provider'));
 pass('three provider streams, model discovery, exact request preview, cancel and authentication errors');
 const attachment=path.join(profile,'synthetic.txt');fs.writeFileSync(attachment,'ATTACHMENT_MARKER');await selectFile(attachment);
 const asset=await page.evaluate(()=>DesktopActions.importAttachment());assert.equal(await page.evaluate(async url=>(await fetch(url)).text(),asset.url),'ATTACHMENT_MARKER');
 const bundle=path.join(profile,'bundle.json');await selectFile(bundle);await page.evaluate(()=>studioDesktop.files.exportBackup('bundle'));
 const exported=JSON.parse(fs.readFileSync(bundle,'utf8'));assert.equal(exported.attachments.length,1);assert.ok(!JSON.stringify(exported).includes('synthetic-private-key'));
 const sqlite=path.join(profile,'export.sqlite');await selectFile(sqlite);await page.evaluate(()=>studioDesktop.files.exportBackup('sqlite'));assert.ok(fs.statSync(sqlite).size>0);
 await page.evaluate(()=>{store.round2Marker='changed';save();});await selectFile(bundle);await page.evaluate(()=>studioDesktop.files.restoreBackup()).catch(e=>{if(!/context|closed/i.test(e.message))throw e;});await reloadDone();await page.waitForFunction(()=>store.round2Marker==='legacy-preserved');
 await selectFile(bundle);await page.evaluate(()=>studioDesktop.files.restoreBackup()).catch(e=>{if(!/context|closed/i.test(e.message))throw e;});await reloadDone();
 assert.equal(await page.evaluate(()=>store.roles.length),exported.data.store.roles.length);
 const invalid=structuredClone(exported);invalid.data.store.roles.push(invalid.data.store.roles[0]);invalid.attachments[0].data=Buffer.from('WRONG').toString('base64');const bad=path.join(profile,'invalid.json');fs.writeFileSync(bad,JSON.stringify(invalid));await selectFile(bad);
 assert.equal(await page.evaluate(async()=>{try{await studioDesktop.files.restoreBackup();return false}catch{return true}}),true);
 assert.equal(await page.evaluate(async url=>(await fetch(url)).text(),asset.url),'ATTACHMENT_MARKER');
 assert.equal(await page.evaluate(()=>store.round2Marker),'legacy-preserved');
 await selectFile(sqlite);await page.evaluate(()=>studioDesktop.files.restoreBackup()).catch(e=>{if(!/context|closed/i.test(e.message))throw e;});await reloadDone();
 pass('native dialog adapters, attachments, bundle/SQLite restore, repeated import and failure rollback');
 const png=path.join(profile,'synthetic.png');fs.writeFileSync(png,Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7XcAAAAASUVORK5CYII=','base64'));await selectFile(png);
 const images=await page.evaluate(()=>studioDesktop.files.importImages());assert.equal(images.length,1);
 assert.equal(await page.evaluate(url=>new Promise(resolve=>{const image=new Image();image.onload=()=>resolve(image.naturalWidth);image.onerror=()=>resolve(0);image.src=url;}),images[0].url),1);
 const recoveryBefore=fs.readdirSync(path.join(profile,'recovery')).length;
 await page.evaluate(()=>{WorkspaceStorage.reset();location.reload();});await reloadDone();
 assert.equal(await page.evaluate(()=>store.round2Marker),undefined);assert.ok(fs.readdirSync(path.join(profile,'recovery')).length>recoveryBefore);
 await selectFile(bundle);await page.evaluate(()=>studioDesktop.files.restoreBackup()).catch(e=>{if(!/context|closed/i.test(e.message))throw e;});await reloadDone();
 pass('native image import/rendering and reset with recovery point');
 await close();await launch();assert.equal(await page.evaluate(()=>store.round2Marker),'legacy-preserved');
 assert.deepEqual(errors,[]);await close();
 for(const name of ['workspace.sqlite','workspace.sqlite-wal']){const file=path.join(profile,name);if(fs.existsSync(file))assert.ok(!fs.readFileSync(file).includes(Buffer.from('synthetic-private-key')));}
 pass('restart persistence and no plaintext credentials in SQLite');
 fs.writeFileSync(path.join(root,'test-results','engineering.json'),JSON.stringify({passed:true,checks,errors,profile,paidRequests:0},null,2));
})().catch(e=>{console.error(e,errors);process.exitCode=1;}).finally(async()=>{if(app)await app.close();if(server){server.closeAllConnections();await new Promise(r=>server.close(r));}});
