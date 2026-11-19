const {contextBridge,ipcRenderer,webUtils}=require('electron');
const unwrap=r=>{if(!r.ok)throw Object.assign(new Error(r.error.message),{code:r.error.code});return r.value;};
const sync=(channel,...args)=>unwrap(ipcRenderer.sendSync(channel,...args));
const invoke=async(channel,...args)=>unwrap(await ipcRenderer.invoke(channel,...args));
const listen=(channel,fn)=>{const listener=(_event,value)=>fn(value);ipcRenderer.on(channel,listener);return()=>ipcRenderer.removeListener(channel,listener);};
contextBridge.exposeInMainWorld('studioDesktop',Object.freeze({
 platform:process.platform,runtime:'electron',
 data:{read:()=>sync('studio:data-read'),initialize:value=>sync('studio:data-init',value),commit:(base,next)=>sync('studio:data-commit',base,next),reset:initial=>sync('studio:data-reset',initial),onChanged:fn=>listen('studio:data-changed',fn)},
 // Error properties do not survive contextBridge's Error cloning; keep AI results structured.
 ai:{execute:options=>ipcRenderer.invoke('studio:ai-execute',options),cancel:id=>invoke('studio:ai-cancel',id),models:id=>invoke('studio:ai-models',id),onEvent:fn=>listen('studio:ai-event',fn)},
 files:{saveText:(name,text)=>invoke('studio:file-save',name,text),openText:()=>invoke('studio:file-open'),exportBackup:format=>invoke('studio:backup-export',format),restoreBackup:()=>invoke('studio:backup-restore'),importAttachment:()=>invoke('studio:attachment-import'),importImages:()=>invoke('studio:images-import'),importDropped:file=>invoke('studio:attachment-drop',webUtils.getPathForFile(file))},
 windows:{onNavigate:fn=>listen('studio:settings-navigate',fn)}
}));
