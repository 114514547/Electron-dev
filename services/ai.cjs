class AIService{
 constructor(repository,vault){this.repo=repository;this.vault=vault;this.active=new Map();}
 connection(id){const c=this.repo.snapshot().store?.apiConnections?.find(c=>c.id===id);if(!c||!c.enabled)throw Error('连接不存在或已停用');return c;}
 headers(c){const h={'Content-Type':'application/json'};if(c.credentialRef&&this.vault.has(c.credentialRef)){const key=this.vault.get(c.credentialRef);if(['anthropic','claude'].includes(c.provider)){h['x-api-key']=key;h['anthropic-version']='2023-06-01';}else h.Authorization='Bearer '+key;}return h;}
 endpoint(c,models=false){
  const base=new URL(c.baseUrl);if(!['https:','http:'].includes(base.protocol)||base.username||base.password||base.search||base.hash)throw Error('连接地址无效');
  if(c.proxyUrl||c.advanced?.proxyUrl)throw Error('尚未接入代理，请使用直连地址');
  if(c.customHeadersRef||c.advanced?.customHeadersRef)throw Error('自定义请求头已安全保存，但当前协议尚未接入，请使用标准认证配置');
  const provider=c.provider;
  const suffix=models?(provider==='ollama'?'/api/tags':'/models'):provider==='ollama'?'/api/chat':['anthropic','claude'].includes(provider)?'/messages':'/chat/completions';
  if(!['openai','openai-compatible','custom','custom_openai','deepseek','anthropic','claude','ollama'].includes(provider))throw Error('当前协议未接入：'+provider);
  if(models&&['anthropic','claude'].includes(provider))throw Error('此协议未接入模型发现');
  return base.href.replace(/\/$/,'')+suffix;
 }
 async models(id){const c=this.connection(id);const r=await fetch(this.endpoint(c,true),{headers:this.headers(c),signal:AbortSignal.timeout(15000),redirect:'error'});if(!r.ok)throw Error('模型发现 HTTP '+r.status);const b=await r.json();return (b.data||b.models||[]).map(m=>({id:m.id||m.name,name:m.name||m.id}));}
 async execute(owner,{requestId,stream=true},emit){
  if(this.active.has(requestId))throw Error('请求已在执行');
  const saved=this.repo.snapshot().store?.creationWorkflow?.requests?.find(r=>r.id===requestId);
  if(!saved?.transport||saved.contentRemoved)throw Error('请求预览不存在');
  const c=this.connection(saved.configuration.connectionId),url=this.endpoint(c);
  if(url!==saved.transport.url)throw Error('连接已变化，请重新预览');
  const body=structuredClone(saved.transport.body);
  if(!(c.models||[]).some(m=>m.id===body.model&&m.enabled!==false))throw Error('模型不可用');
  // stream changes only the wire encoding, never the preview's context or sampling values.
  body.stream=!!stream;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort('timeout'),60000);
  this.active.set(requestId,{owner,controller});
  let text='',finish=null,usage=null,model=body.model;
  try{
   const response=await fetch(url,{method:'POST',headers:this.headers(c),body:JSON.stringify(body),signal:controller.signal,redirect:'error'});
   if(!response.ok){const e=Error('服务返回 HTTP '+response.status);e.code=response.status===401||response.status===403?'authentication':response.status===429?'rate_limit':'http';throw e;}
   const type=response.headers.get('content-type')||'';
   if(type.includes('application/json'))return await response.json();
   const consume=data=>{
    if(data==='[DONE]'){finish??='stop';return;}
    const event=JSON.parse(data);let delta='';
    if(c.provider==='ollama'){delta=event.message?.content||'';if(event.done)finish=event.done_reason||'stop';}
    else if(['anthropic','claude'].includes(c.provider)){delta=event.type==='content_block_delta'?event.delta?.text||'':'';finish=event.delta?.stop_reason||finish;usage=event.usage||usage;}
    else{delta=event.choices?.[0]?.delta?.content||'';finish=event.choices?.[0]?.finish_reason||finish;usage=event.usage||usage;model=event.model||model;}
    if(delta){text+=delta;emit({requestId,type:'delta',text:delta});}
   };
   let buffer='';const decoder=new TextDecoder();
   for await(const chunk of response.body){buffer+=decoder.decode(chunk,{stream:true});let at;while((at=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,at).trim();buffer=buffer.slice(at+1);if(c.provider==='ollama'){if(line)consume(line);}else if(line.startsWith('data:'))consume(line.slice(5).trim());}}
   buffer+=decoder.decode();if(buffer.trim()){const line=buffer.trim();if(c.provider==='ollama')consume(line);else if(line.startsWith('data:'))consume(line.slice(5).trim());}
   if(!finish)throw Object.assign(Error('流式响应中断，未收到结束标记'),{code:'incomplete'});
   emit({requestId,type:'complete'});
   return {model,usage,choices:[{finish_reason:finish,message:{content:text}}]};
  }catch(error){
   const code=controller.signal.aborted?(controller.signal.reason==='timeout'?'timeout':'cancelled'):error.code||'network';
   // Never forward provider text, request headers or URL credentials into logs/IPC errors.
   const message=code==='timeout'?'请求超时':code==='cancelled'?'请求已取消':error.code?error.message:'网络或响应解析失败';
   emit({requestId,type:'error',code,message});throw Object.assign(Error(message),{code});
  }finally{clearTimeout(timer);this.active.delete(requestId);}
 }
 cancel(owner,id){const job=this.active.get(id);if(job?.owner===owner){job.controller.abort('cancelled');return true;}return false;}
 cancelOwner(owner){for(const [id,job] of this.active)if(job.owner===owner)this.cancel(owner,id);}
}
module.exports={AIService};
