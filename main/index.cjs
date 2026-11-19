const {app, BrowserWindow, Menu, dialog, shell, safeStorage, protocol} = require('electron');
const {WorkspaceDB}=require('../database/workspace.cjs');
const {Credentials}=require('../services/credentials.cjs');
const {AIService}=require('../services/ai.cjs');
const {FileService}=require('../services/files.cjs');
const {Windows}=require('../services/windows.cjs');
const {installIPC}=require('../services/ipc.cjs');
const path = require('node:path');
const {fileURLToPath, pathToFileURL} = require('node:url');
const fs = require('node:fs');

const dev = process.argv.includes('--dev');
const renderer = path.resolve(__dirname, '../renderer');
const entry = path.join(renderer, 'index.html');
const entryURL = pathToFileURL(entry).href;
// Test profiles are opt-in and never share the everyday development profile.
const testProfile = process.env.STUDIO_TEST_PROFILE;
const profile = testProfile ? path.resolve(testProfile) : path.join(app.getPath('appData'), dev ? 'CreativeStudio-Dev' : 'CreativeStudio-Preview');
fs.mkdirSync(profile, {recursive:true});
app.setPath('userData', profile);
app.setPath('sessionData', path.join(profile, 'Chromium'));
app.setAppUserModelId('local.creative-studio.development');

let mainWindow;
let repository,manager,aiService;
protocol.registerSchemesAsPrivileged([{scheme:'studio-asset',privileges:{standard:true,secure:true,supportFetchAPI:true,corsEnabled:true}}]);
let externalPrompt = false;
async function externalLink(url) {
  let parsed;
  try {parsed = new URL(url);} catch {return;}
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || externalPrompt) return;
  externalPrompt = true;
  try {
    const result = await dialog.showMessageBox(mainWindow, {type:'question', title:'打开外部链接', message:'在系统浏览器中打开此链接？', detail:parsed.href, buttons:['取消','打开'], defaultId:0, cancelId:0});
    if (result.response === 1) await shell.openExternal(parsed.href);
  } catch (error) {console.error('External link failed:', error.message);}
  finally {externalPrompt = false;}
}
function createWindow(kind,bounds) {
  const win = new BrowserWindow({
    width:1440, height:960, minWidth:867, minHeight:722,...bounds,
    title:'个人创作工作室 · 开发版', show:false,
    webPreferences:{
      preload:path.resolve(__dirname,'../preload/index.cjs'),
      contextIsolation:true, nodeIntegration:false, sandbox:true, webSecurity:true,
      webviewTag:false, devTools:dev
    }
  });
  if(kind==='main')mainWindow=win;
  const contents = win.webContents;
  const session = contents.session;
  const permitted = (wc, permission) => manager.owns(wc) && wc.getURL().split('#')[0] === entryURL && permission === 'clipboard-sanitized-write';
  session.setPermissionRequestHandler((wc,permission,callback)=>callback(permitted(wc,permission)));
  session.setPermissionCheckHandler((wc,permission)=>permitted(wc,permission));
  session.webRequest.onBeforeRequest({urls:['file://*/*']}, (details, callback) => {
    try {
      const file = path.resolve(fileURLToPath(details.url));
      callback({cancel: file !== entry && !file.startsWith(renderer + path.sep)});
    } catch {callback({cancel:true});}
  });
  contents.on('will-navigate',(event,url)=>{if(url.split('#')[0] !== entryURL){event.preventDefault();void externalLink(url);}});
  contents.on('will-redirect',event=>event.preventDefault());
  contents.setWindowOpenHandler(({url})=>{void externalLink(url);return {action:'deny'};});
  contents.on('will-attach-webview',event=>event.preventDefault());
  contents.on('render-process-gone',(_event,details)=>console.error('Renderer stopped:',details.reason));
  contents.on('preload-error',(_event,_file,error)=>console.error('Preload failed:',error.message));
  contents.on('did-fail-load',(_event,code,description,_url,isMainFrame)=>{if(isMainFrame)console.error('Page failed to load:',code,description);});
  win.once('ready-to-show',()=>win.show());
  if(kind==='main')win.on('closed',()=>{mainWindow=null;app.quit();});
  void win.loadFile(entry).catch(error=>{console.error(error);win.close();});
  return win;
}
const locked = app.requestSingleInstanceLock();
if (!locked) app.quit();
else {
  app.on('second-instance',()=>{if(mainWindow){if(mainWindow.isMinimized())mainWindow.restore();mainWindow.focus();}});
  app.whenReady().then(()=>{
    repository=new WorkspaceDB(path.join(profile,'workspace.sqlite'));
    const interrupted=repository.snapshot();
    if(interrupted.store){let changed=false;for(const r of interrupted.store.creationWorkflow?.requests||[])if(r.status==='sending'){r.status='interrupted';r.error='应用关闭中断；服务可能已接收请求，请确认后重试';changed=true;}if(changed)repository.save(interrupted);}
    const vault=new Credentials(path.join(profile,'credentials'),safeStorage);
    aiService=new AIService(repository,vault);
    const files=new FileService(profile,repository,vault);
    manager=new Windows(createWindow,repository,aiService);
    installIPC({repo:repository,vault,ai:aiService,files,windows:manager,entryURL});
    protocol.handle('studio-asset',request=>{
      const url=new URL(request.url),name=decodeURIComponent(url.pathname.slice(1));
      if(url.hostname!=='local'||!/^[a-f0-9-]+\.(png|jpe?g|webp|gif|txt|md|pdf)$/i.test(name))return new Response('Not found',{status:404});
      const file=path.join(files.assets,name);if(!fs.existsSync(file))return new Response('Not found',{status:404});
      const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.pdf':'application/pdf'}[path.extname(name)]||'text/plain';
      return new Response(fs.readFileSync(file),{headers:{'Content-Type':mime,'Access-Control-Allow-Origin':'*','Content-Security-Policy':"default-src 'none'"}});
    });
    const action=script=>()=>mainWindow?.webContents.executeJavaScript(script).catch(error=>console.error('Menu action:',error.message));
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      {label:'应用',submenu:[{label:'设置',accelerator:'CommandOrControl+,',click:()=>mainWindow?.webContents.send('studio:settings-navigate',{tab:'api_connections'})},{type:'separator'},{role:'quit',label:'退出'}]},
      {label:'文件',submenu:[{label:'导入创作备份',click:action('importWorkspaceBackup()')},{label:'导出完整备份（含附件）',click:action('exportWorkspaceBackup()')},{label:'导出 SQLite 数据库',click:action('DesktopActions.backupDatabase()')},{label:'导入图片或附件',click:action('DesktopActions.importAttachment()')}]},
      {label:'编辑',submenu:[{role:'undo'},{role:'redo'},{type:'separator'},{role:'cut'},{role:'copy'},{role:'paste'},{role:'selectAll'}]},
      {label:'查看',submenu:[...(dev?[{role:'reload',label:'刷新',accelerator:'F5'},{role:'toggleDevTools',label:'开发者工具',accelerator:'F12'},{type:'separator'}]:[]),{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]},
      {label:'生成',submenu:[{label:'取消生成',accelerator:'CommandOrControl+.',click:action('DesktopActions.cancelActive()')}]}
    ]));
    console.log('Creative Studio', dev?'development':'preview', 'userData:',app.getPath('userData'));
    manager.open('main');
    app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)manager.open('main');});
  }).catch(error=>{console.error(error);app.exit(1);});
  app.on('window-all-closed',()=>app.quit());
  app.on('will-quit',()=>repository?.close());
}
