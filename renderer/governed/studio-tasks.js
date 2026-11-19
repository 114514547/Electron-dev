// Shared real-generation path. No automatic formal-history commits or demo fallback.
(() => {
  async function text(options) {
    const request=CreationWorkflow.prepareRequest(options);
    return CreationWorkflow.executeRequest(request.id);
  }
  async function json(options) {
    const request=await text(options);
    let data;
    try { data=JSON.parse(request.response.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'')); }
    catch { throw Error('模型未返回有效 JSON；结果保留在请求记录，原资料未修改'); }
    return {request,data};
  }
  window.StudioTasks={text,json};
  let tagsPending=false;
  planTagAI=async function() {
    const input=document.getElementById('tagCommand')?.value.trim();
    if(!input||tagsPending)return;
    tagsPending=true;ui.aiDraft=input;ui.preview=[];
    try {
      const result=await json({featureKey:'discussion',input:'解析标签修改指令，仅返回 JSON：{"operations":[{"kind":"add 或 remove","name":"标签名"}]}。无法识别则返回空 operations，不要猜测删除目标。现有标签：'+JSON.stringify(store.tagItems.map(t=>t.name))+'\n用户指令：'+input});
      const rows=result.data?.operations;
      if(!Array.isArray(rows)||rows.length>100||rows.some(p=>!p||!['add','remove'].includes(p.kind)||typeof p.name!=='string'||!p.name.trim()||p.name.length>100))throw Error('标签操作格式无效，未修改标签库');
      ui.preview=rows.map(p=>({kind:p.kind,name:p.name.trim()}));
      show('aiPreview');
    }catch(e){toast(e.message)}finally{tagsPending=false}
  };
})();
