// One render lifecycle owns both chat and RP drafts. Existing inline event names stay stable.
function persistMainWorkspace(){save();}
store.appearanceSettings ||= {};
store.appearanceSettings.accent=STAccent.get();
applyThemeAppearance();
store.workspaceDrafts ||= {rp:{},chat:{}};
ui.drafts=store.workspaceDrafts.chat;
function captureRpDraft(){
  const el=document.getElementById('rpInput');
  if(el?.dataset.draftId)store.workspaceDrafts.rp[el.dataset.draftId]=el.value;
}
function sendRP(){return sendLocalRpDemo();}
function render(){
  captureRpDraft();
  if(ui.justSentSession){ui.drafts[ui.justSentSession]='';ui.justSentSession=null;}
  else lastSelectedDraft();
  closeSelectMenu();
  renderPage();
  enhanceSelects();
  restoreChatDraft();
  if(ui.page==='indexTags'){
    const name=document.querySelector('.topbar .crumb strong');
    if(name)name.textContent='角色检索标签库';
  }
  const el=document.getElementById('rpInput');
  if(el){el.dataset.draftId=ui.rpSessionId;el.value=store.workspaceDrafts.rp[ui.rpSessionId]||'';}
}
document.addEventListener('input',e=>{
  if(e.target.id==='rpInput'||e.target.id==='chatinput'){
    captureRpDraft();
    store.workspaceDrafts.chat=ui.drafts;
    save();
  }
});
