const {BrowserWindow,screen}=require('electron');
class Windows{
 constructor(create,repo,ai){this.create=create;this.repo=repo;this.ai=ai;this.items=new Map();}
 all(){return [...this.items.values()].filter(w=>!w.isDestroyed());}
 owns(contents){return this.all().some(w=>w.webContents===contents);}
 open(kind){
  const existing=this.items.get(kind);if(existing&&!existing.isDestroyed()){if(existing.isMinimized())existing.restore();existing.show();existing.focus();return existing;}
  const saved=this.repo.snapshot().prefs.windowBounds?.[kind];
  const visible=saved&&screen.getAllDisplays().some(({workArea:a})=>saved.x<a.x+a.width&&saved.y<a.y+a.height&&saved.x+saved.width>a.x&&saved.y+saved.height>a.y);
  const win=this.create(kind,visible?saved:null);this.items.set(kind,win);
  win.on('close',()=>{
   const before=this.repo.snapshot();if(before.store){const next=structuredClone(before);next.prefs.windowBounds??={};next.prefs.windowBounds[kind]=win.getNormalBounds();this.repo.merge(before,next);}
   if(kind==='main')for(const other of this.all())if(other!==win)other.close();
  });
  const owner=win.webContents.id;
  win.on('closed',()=>{this.ai.cancelOwner(owner);this.items.delete(kind);});
  return win;
 }
}
module.exports={Windows};
