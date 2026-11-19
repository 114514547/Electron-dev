const {_electron:electron}=require('playwright-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const http=require('node:http');
const root=path.resolve(__dirname,'..');
const profile=path.join(root,'.test-data','desktop-'+Date.now());
const results=path.join(root,'test-results');fs.mkdirSync(results,{recursive:true});
const env={...process.env,STUDIO_TEST_PROFILE:profile};delete env.ELECTRON_RUN_AS_NODE;
let application, server;
const errors=[];
async function launch(scale){
 application=await electron.launch({executablePath:require('electron'),args:[root,'--dev',...(scale?['--force-device-scale-factor='+scale]:[])],env,timeout:30000});
 const page=await application.firstWindow();page.setDefaultTimeout(10000);
 page.on('pageerror',error=>errors.push(error.message));
 await page.waitForFunction(()=>!!window.CreationWorkflow&&!!window.ConceptWorkbench&&!!document.querySelector('#st-main-shell'));
 return page;
}
async function closeWindow(){const closed=application.waitForEvent('close');await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')).close());await closed;application=null;}
(async()=>{
 let received;
 server=http.createServer(async(req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');res.setHeader('Access-Control-Allow-Headers','Content-Type,Authorization');
  if(req.method==='OPTIONS'){res.writeHead(204);res.end();return;}
  let text='';for await(const chunk of req)text+=chunk;received=JSON.parse(text);
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify({choices:[{finish_reason:'stop',message:{content:'Synthetic desktop response'}}]}));
 });await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let page=await launch();
 const flags=await application.evaluate(({BrowserWindow,app,screen})=>{
  const win=BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')),p=win.webContents.getLastWebPreferences();
  return {isolation:p.contextIsolation,node:p.nodeIntegration,sandbox:p.sandbox,security:p.webSecurity,profile:app.getPath('userData'),dpi:screen.getPrimaryDisplay().scaleFactor};
 });
 assert.deepEqual([flags.isolation,flags.node,flags.sandbox,flags.security],[true,false,true,true]);assert.equal(flags.profile,profile);
 assert.deepEqual(await page.evaluate(()=>[typeof require,typeof process,studioDesktop.runtime]),['undefined','undefined','electron']);
 console.log('PASS native Electron startup and isolated sandbox',JSON.stringify(flags));
 for(const route of ['home','roles','works','sessions','rp','concept','tags']){
  await page.evaluate(route=>visit(route),route);assert.ok(await page.locator('#st-main-shell').isVisible());
 }
 for(const modal of ['worldinfo','settings']){await page.evaluate(modal=>show(modal),modal);assert.ok(await page.locator('body').innerText());await page.evaluate(()=>closeModal());}
 await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>w.webContents.getURL().endsWith('#settings'))?.close());
 await page.evaluate(()=>{visit('home');});await page.screenshot({path:path.join(results,'desktop-home.png')});
 console.log('PASS navigation, roles/works/chat/RP/concepts/tags/worldbook/settings');
 await page.evaluate(()=>{visit('roles');show('roleCreate');});
 await page.locator('#roleNewName').fill('Desktop persistence role');await page.locator('#roleNewDescription').fill('Synthetic desktop test');
 await page.locator('button[onclick="saveNewRole()"]').click();
 await page.evaluate(()=>{
  store.desktopSmoke={roleId:ui.roleId};
  const w=store.works[0];w.description='Desktop persisted work';store.desktopSmoke.workId=w.id;
  ui.newKind='free';ui.newRole='none';ui.newTitle='Desktop persistence chat';newSession();store.desktopSmoke.sessionId=ui.sessionId;
  startRpForRole('yiwen');store.desktopSmoke.rpId=ui.rpSessionId;save();
 });
 await page.locator('#rpInput').fill('Desktop persisted RP draft');
 await page.evaluate(()=>{goSession(store.desktopSmoke.sessionId);});
 await page.locator('#chatinput').fill('Desktop persisted chat draft');
 const network=await page.evaluate(async endpoint=>{
  store.apiConnections.push({id:'desktop-fixture',name:'Local test',provider:'openai-compatible',baseUrl:endpoint,apiKey:'synthetic',enabled:true,models:[{id:'fixture'}]});
  session(store.desktopSmoke.sessionId).modelOverride={connectionId:'desktop-fixture',modelId:'fixture'};
  const r=CreationWorkflow.prepareRequest({featureKey:'discussion',sessionId:store.desktopSmoke.sessionId,input:'Only synthetic data'});
  const answer=await CreationWorkflow.executeRequest(r.id);store.desktopSmoke.requestId=r.id;save();
  return {status:answer.status,body:r.transport.body};
 },`http://127.0.0.1:${server.address().port}/v1`);
 assert.equal(network.status,'succeeded');assert.deepEqual(received,network.body);
 console.log('PASS real renderer fetch to local HTTP fixture with webSecurity enabled');
 // Local file boundary and frame restrictions do not require opening an external browser.
 const blocked=await page.evaluate(async()=>{try{await fetch(new URL('../package.json',location.href));return false}catch{return true}});assert.equal(blocked,true);
 await page.evaluate(()=>window.open('file:///C:/Windows/win.ini'));
 assert.equal(await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().filter(w=>!w.webContents.getURL().endsWith('#settings')).length),1);
 console.log('PASS outside-file read and additional window blocked');
 await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')).maximize());
 await page.waitForTimeout(300);assert.equal(await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')).isMaximized()),true);
 await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')).unmaximize());
 await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')).minimize());
 await page.waitForTimeout(300);assert.equal(await application.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings')).isMinimized()),true);
 await application.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows().find(w=>!w.webContents.getURL().endsWith('#settings'));w.restore();w.setSize(1024,800);});
 await page.evaluate(()=>visit('tags'));await page.screenshot({path:path.join(results,'desktop-1024.png')});
 console.log('PASS native maximize/restore/minimize and 1024px window');
 await closeWindow();
 page=await launch(1.5);
 const persisted=await page.evaluate(()=>{
  const m=store.desktopSmoke;
  return {role:role(m.roleId)?.name,work:workById(m.workId)?.description,session:session(m.sessionId)?.title,rp:store.workspaceDrafts.rp[m.rpId],chat:store.workspaceDrafts.chat[m.sessionId],request:CreationWorkflow.listRequests().find(r=>r.id===m.requestId)?.status,dpi:devicePixelRatio};
 });
 assert.deepEqual({...persisted,dpi:undefined},{role:'Desktop persistence role',work:'Desktop persisted work',session:'Desktop persistence chat',rp:'Desktop persisted RP draft',chat:'Desktop persisted chat draft',request:'succeeded',dpi:undefined});
 assert.equal(persisted.dpi,1.5);
 await page.screenshot({path:path.join(results,'desktop-dpi150.png')});
 await page.reload();await page.waitForFunction(()=>!!window.CreationWorkflow);assert.equal(await page.evaluate(()=>!!role(store.desktopSmoke.roleId)),true);
 assert.deepEqual(errors,[]);
 console.log('PASS native close/relaunch persistence, refresh and forced 150% DPI rendering');
 fs.writeFileSync(path.join(results,'result.json'),JSON.stringify({passed:true,flags,persisted,errors,paidRequests:0,profile},null,2));
 await closeWindow();
})().catch(error=>{console.error(error,errors);process.exitCode=1;}).finally(async()=>{if(application)await application.close();if(server)await new Promise(resolve=>server.close(resolve));});
