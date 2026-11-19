// Shared three-way merge. Arrays with stable IDs merge by object; ordered scalar arrays conflict.
(function(root){
  const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
  const same=(a,b)=>JSON.stringify(canonical(a))===JSON.stringify(canonical(b));
  const object=x=>x&&typeof x==='object'&&!Array.isArray(x);
  function merge(base,local,remote,path='workspace'){
    if(same(local,base))return structuredClone(remote);
    if(same(remote,base)||same(local,remote))return structuredClone(local);
    if(object(local)&&object(remote)&&(object(base)||base===undefined)){
      const out={};
      for(const key of new Set([...Object.keys(base||{}),...Object.keys(local),...Object.keys(remote)])){
        if(['__proto__','constructor','prototype'].includes(key))throw Error('不支持的字段名称');
        const value=merge(base?.[key],local[key],remote[key],path+'.'+key);if(value!==undefined)out[key]=value;
      }return out;
    }
    const identified=x=>Array.isArray(x)&&x.every(v=>object(v)&&v.id!=null)&&new Set(x.map(v=>String(v.id))).size===x.length;
    if(identified(local)&&identified(remote)&&(identified(base)||base===undefined)){
      const maps=[base||[],local,remote].map(a=>new Map(a.map(v=>[String(v.id),v]))),out=[];
      for(const id of new Set([...maps[2].keys(),...maps[1].keys()])){
        const value=merge(maps[0].get(id),maps[1].get(id),maps[2].get(id),path+'['+id+']');if(value!==undefined)out.push(value);
      }return out;
    }
    throw Error('数据冲突，请保留当前编辑并重新读取：'+path);
  }
  function reconcile(target,next){
    if(Array.isArray(target)&&Array.isArray(next)){
      const old=new Map(target.filter(v=>v&&v.id!=null).map(v=>[String(v.id),v]));
      target.splice(0,target.length,...next.map(v=>{const previous=v&&old.get(String(v.id));return previous&&object(v)?reconcile(previous,v):structuredClone(v)}));return target;
    }
    for(const key of Object.keys(target))if(!Object.hasOwn(next,key))delete target[key];
    for(const [key,value] of Object.entries(next)){
      if((object(value)&&object(target[key]))||(Array.isArray(value)&&Array.isArray(target[key])))reconcile(target[key],value);
      else target[key]=structuredClone(value);
    }return target;
  }
  const api={merge,reconcile,same};if(typeof module==='object')module.exports=api;else root.StudioMerge=api;
})(globalThis);
