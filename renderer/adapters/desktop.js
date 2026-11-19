// Thin bindings to existing controls. No styling or replacement component markup.
(()=>{
 download=async function(name,text){try{const result=await studioDesktop.files.saveText(name,text);if(result)toast('文件已保存');}catch(error){toast(error.message);}};
 exportWorkspaceBackup=async()=>{try{WorkspaceStorage.save(store);if(await studioDesktop.files.exportBackup('bundle'))toast('完整备份已保存，不含 API Key');}catch(error){toast(error.message);}};
 importWorkspaceBackup=async()=>{try{await studioDesktop.files.restoreBackup();}catch(error){toast(error.message);}};
 // Use native dialogs for the existing hidden-input launchers, without changing their UI.
 document.addEventListener('click',async event=>{
  const input=event.target;if(!(input instanceof HTMLInputElement)||input.type!=='file')return;
  event.preventDefault();
  try{
   if(input.id==='importBackupInput'){await importWorkspaceBackup();return;}
   if(input.id==='fileImages'){
    const roleId=ui.roleId,images=await studioDesktop.files.importImages();if(!images.length)return;
    store.roleImages??={};(store.roleImages[roleId]??=[]).push(...images);ui.roleImages=store.roleImages;save();render();return;
   }
   const result=await studioDesktop.files.openText();if(!result)return;
   const transfer=new DataTransfer();transfer.items.add(new File([result.text],result.name,{type:'application/json'}));input.files=transfer.files;input.dispatchEvent(new Event('change',{bubbles:true}));
  }catch(error){toast(error.message);}
 },true);
 ui.roleImages=store.roleImages||{};
 const unsubscribe=studioDesktop.data.onChanged(()=>{
  try{
   WorkspaceStorage.refresh();roles=store.roles;ui.drafts=store.workspaceDrafts.chat;ui.roleImages=store.roleImages||{};
   // Remote saves must not replace a local form whose values still live in its inputs.
   const editing=document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
   if(!ui.connDraft&&!editing&&(!ui.modal||ui.modal==='settings')){applyThemeAppearance();render();}
  }
  catch(error){toast(error.message);}
 });
 window.addEventListener('unload',unsubscribe,{once:true});
 window.addEventListener('studio-ai-progress',event=>{
  if(event.detail.type==='delta'){
   const request=CreationWorkflow.listRequests().find(r=>r.id===event.detail.requestId);
   const current=document.querySelector('.toast');if(current)current.textContent='生成中 · '+(request?.partialResponse||event.detail.text).slice(-80)+' · Ctrl+. 取消';
  }
 });
 window.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
   const request=CreationWorkflow.listRequests().find(r=>r.status==='sending'&&(r.context?.sessionId===ui.sessionId||r.context?.rpSessionId===ui.rpSessionId));
   if(request)void studioDesktop.ai.cancel(request.id);
  }
 });
 window.DesktopActions={
  backupDatabase:()=>studioDesktop.files.exportBackup('sqlite'),
  importAttachment:async()=>{const attachment=await studioDesktop.files.importAttachment();if(attachment){store.attachments??=[];store.attachments.push(attachment);save();toast('附件已保存');}return attachment;},
  cancelActive:()=>Promise.all(CreationWorkflow.listRequests().filter(r=>r.status==='sending').map(r=>studioDesktop.ai.cancel(r.id)))
 };
 document.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault();});
 document.addEventListener('drop',async e=>{if(!e.dataTransfer?.files.length)return;e.preventDefault();try{for(const file of e.dataTransfer.files){const a=await studioDesktop.files.importDropped(file);if(a){store.attachments??=[];store.attachments.push(a);save();}}toast('附件导入完成');}catch(error){toast(error.message);}});
 const stopNavigation=studioDesktop.windows.onNavigate(options=>openSettings(options?.tab||'api_connections',options?.subTab));
 window.addEventListener('unload',stopNavigation,{once:true});
})();
