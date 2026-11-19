const {ipcMain,dialog,BrowserWindow}=require('electron');
const fs=require('node:fs'),path=require('node:path');
const {WorkspaceDB}=require('../database/workspace.cjs');
const {same}=require('../renderer/adapters/merge.js');
function installIPC({repo,vault,ai,files,windows,entryURL}){
 const valid=e=>{if(e.senderFrame!==e.sender.mainFrame||e.sender.getURL().split('#')[0]!==entryURL||!windows.owns(e.sender))throw Error('不允许的调用来源');};
 const error=e=>({ok:false,error:{message:e.message,code:e.code||'operation'}});
 const notify=sender=>{for(const win of windows.all())if(win.webContents.id!==sender&&!win.isDestroyed())win.webContents.send('studio:data-changed',{});};
 const sync=(name,fn)=>ipcMain.on(name,(e,...args)=>{try{valid(e);e.returnValue={ok:true,value:fn(e,...args)};}catch(err){e.returnValue=error(err);}});
 const asyncHandler=(name,fn)=>ipcMain.handle(name,async(e,...args)=>{try{valid(e);return {ok:true,value:await fn(e,...args)};}catch(err){return error(err);}});
 sync('studio:data-read',()=>repo.snapshot());
 sync('studio:data-init',(e,input)=>{
  if(repo.snapshot().store)return repo.snapshot();
  vault.put('legacy-migration-'+Date.now(),JSON.stringify(input));
  const next=vault.sanitize(input);repo.save(next);notify(e.sender.id);return next;
 });
 sync('studio:data-commit',(e,base,next)=>{
  const clean=vault.sanitize(next),current=repo.snapshot();if(same(clean,current))return current;
  const result=repo.merge(base,clean);setImmediate(()=>notify(e.sender.id));return result;
 });
 sync('studio:data-reset',(e,initial)=>{
  if(ai.active.size)throw Error('请取消生成后再重置');
  files.recoveryPoint();
  const next=vault.sanitize({store:initial,concept:null,prefs:{}});repo.save(next);
  setImmediate(()=>{for(const win of windows.all())if(win.webContents.id!==e.sender.id)win.webContents.reload();});
  return next;
 });
 asyncHandler('studio:ai-execute',(e,options)=>ai.execute(e.sender.id,options,data=>{if(!e.sender.isDestroyed())e.sender.send('studio:ai-event',data);}));
 asyncHandler('studio:ai-cancel',(e,id)=>ai.cancel(e.sender.id,id));
 asyncHandler('studio:ai-models',(_e,id)=>ai.models(id));
 asyncHandler('studio:file-save',async(e,name,text)=>{
  if(typeof text!=='string'||text.length>50*1024*1024)throw Error('导出内容无效或过大');
  const picked=await dialog.showSaveDialog(BrowserWindow.fromWebContents(e.sender),{defaultPath:path.basename(String(name))});if(picked.canceled)return null;
  fs.writeFileSync(picked.filePath,text,'utf8');return {name:path.basename(picked.filePath)};
 });
 asyncHandler('studio:file-open',async e=>{const r=await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender),{properties:['openFile'],filters:[{name:'文本与 JSON',extensions:['json','txt','md']}]});if(r.canceled)return null;const file=r.filePaths[0];if(fs.statSync(file).size>50*1024*1024)throw Error('文件过大');return {name:path.basename(file),text:fs.readFileSync(file,'utf8')};});
 asyncHandler('studio:backup-export',async(e,format='bundle')=>{
  if(!['bundle','sqlite'].includes(format))throw Error('备份格式无效');
  const r=await dialog.showSaveDialog(BrowserWindow.fromWebContents(e.sender),{defaultPath:'CreativeStudio-'+Date.now()+(format==='sqlite'?'.sqlite':'.json')});if(r.canceled)return null;
  if(format==='sqlite')await repo.backup(r.filePath);else fs.writeFileSync(r.filePath,JSON.stringify(files.exportBundle()),'utf8');return {name:path.basename(r.filePath)};
 });
 asyncHandler('studio:backup-restore',async e=>{
  if(ai.active.size)throw Error('请等待生成结束或取消后再恢复');
  const owner=BrowserWindow.fromWebContents(e.sender),r=await dialog.showOpenDialog(owner,{properties:['openFile'],filters:[{name:'工作区备份',extensions:['json','sqlite']}]});if(r.canceled)return false;
  const answer=await dialog.showMessageBox(owner,{type:'warning',message:'恢复会替换当前创作资料。恢复前会保存数据库副本。普通备份不含 API Key，其他设备上需要重新配置凭据。',buttons:['取消','恢复'],defaultId:0,cancelId:0});if(answer.response!==1)return false;
  let value;if(path.extname(r.filePaths[0]).toLowerCase()==='.sqlite'){
   const {DatabaseSync}=require('node:sqlite');const probe=new DatabaseSync(r.filePaths[0],{readOnly:true});try{if(probe.prepare('PRAGMA user_version').get().user_version!==1)throw Error('不支持此数据库版本');}finally{probe.close();}
   const source=Object.create(WorkspaceDB.prototype);source.db=new DatabaseSync(r.filePaths[0],{readOnly:true});try{value={format:'creative-studio',version:1,data:source.snapshot(),attachments:[]};}finally{source.close();}
  }else value=JSON.parse(fs.readFileSync(r.filePaths[0],'utf8'));
  await files.restore(value);for(const win of windows.all())win.webContents.reload();return true;
 });
 asyncHandler('studio:attachment-import',async e=>{const r=await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender),{properties:['openFile'],filters:[{name:'附件',extensions:['png','jpg','jpeg','webp','gif','pdf','txt','md']}]});return r.canceled?null:files.importAttachment(r.filePaths[0]);});
 asyncHandler('studio:images-import',async e=>{
  const r=await dialog.showOpenDialog(BrowserWindow.fromWebContents(e.sender),{properties:['openFile','multiSelections'],filters:[{name:'角色图片',extensions:['png','jpg','jpeg','webp','gif']}]});
  if(r.canceled)return [];
  if(r.filePaths.some(file=>!/^\.(png|jpe?g|webp|gif)$/i.test(path.extname(file))))throw Error('请选择支持的图片格式');
  return r.filePaths.map(file=>files.importAttachment(file));
 });
 asyncHandler('studio:attachment-drop',async(e,file)=>{
  if(typeof file!=='string'||!path.isAbsolute(file))throw Error('拖入文件无效');
  const answer=await dialog.showMessageBox(BrowserWindow.fromWebContents(e.sender),{message:'将此文件复制为应用附件？',detail:path.basename(file),buttons:['取消','导入'],defaultId:0,cancelId:0});return answer.response===1?files.importAttachment(file):null;
 });
 return {notify};
}
module.exports={installIPC};
