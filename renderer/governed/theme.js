
/* Accent preference stays separate from demo content and is stored locally. */
(function(){
  const KEY='st_codex_v31_accent';
  const presets=[
    {id:'neutral',name:'原生银灰',hex:'#d1d1d1'},
    {id:'violet',name:'紫罗兰',hex:'#ac97f5'},
    {id:'blue',name:'天空蓝',hex:'#82b4f3'},
    {id:'teal',name:'青绿色',hex:'#79c4b2'},
    {id:'amber',name:'暖琥珀',hex:'#e1b878'},
    {id:'rose',name:'玫瑰粉',hex:'#e9a0b6'}
  ];
  const valid = id => presets.some(p=>p.id===id);
  let current='neutral';
  let storageAvailable=true;
  try {const stored=WorkspaceStorage.getItem(KEY); if(valid(stored))current=stored;} catch(_e){storageAvailable=false;}
  function set(id){
    if(!valid(id))return;
    current=id;
    document.documentElement.dataset.stAccent=id;
    try{WorkspaceStorage.setItem(KEY,id);storageAvailable=true;}catch(_e){storageAvailable=false;}
    document.querySelectorAll('.accent-preset').forEach(b=>{
      const chosen=b.dataset.accent===id;
      b.setAttribute('aria-pressed',String(chosen));
    });
    const value=document.getElementById('accent-current-name');
    if(value)value.textContent=presets.find(p=>p.id===id).name+(storageAvailable?' · 已保存':' · 本次有效');
  }
  window.STAccent={presets,get:()=>current,isPersistent:()=>storageAvailable,set};
  // Apply the saved color before the app's initial UI render.
  document.documentElement.dataset.stAccent=current;
})();
