// One-time, exact-boundary migration of the existing renderer service calls.
const fs=require('fs'),path=require('path');const root=path.resolve(__dirname,'..');
function edit(file,fn){const p=path.join(root,file);fs.writeFileSync(p,fn(fs.readFileSync(p,'utf8')));}
function once(s,a,b){if(s.split(a).length!==2)throw Error('Changed source: '+a.slice(0,70));return s.replace(a,b);}
edit('renderer/index.html',s=>{
 s=once(s,'<script src="governed/storage.js"></script>','<script src="adapters/merge.js"></script>\n<script src="adapters/storage.js"></script>');
 s=once(s,'<script src="governed/bootstrap.js"></script>','<script src="governed/bootstrap.js"></script>\n<script src="adapters/desktop.js"></script>');
 return s.replace("img-src 'self' data: blob: https: http:","img-src 'self' data: blob: https: http: studio-asset:");
});
for(const file of ['app.js','theme.js','concept-workbench.js','creation-workflow.js'])edit('renderer/governed/'+file,s=>s.replaceAll('localStorage.','WorkspaceStorage.'));
edit('renderer/governed/app.js',s=>{
 s=once(s,'(!conn.apiKey || !conn.apiKey.trim())','(!conn.hasCredential && (!conn.apiKey || !conn.apiKey.trim()))');
 s=once(s,'placeholder="${E(prov.keyPlaceholder)}"','placeholder="${E(c.hasCredential ? \'已安全保存；留空保留原凭据\' : prov.keyPlaceholder)}"');
 return s;
});
edit('renderer/governed/creation-workflow.js',s=>once(s,"|| !!connection.apiKey && !/demo-placeholder|not-connected/.test(connection.apiKey)","|| connection.hasCredential || !!connection.apiKey && !/demo-placeholder|not-connected/.test(connection.apiKey)"));
edit('renderer/governed/request-service.js',s=>{
 s=once(s,'    return result;','    result.body.stream = true;\n    return result;');
 s=once(s,"if ((!connection.apiKey || /demo-placeholder|not-connected/.test(connection.apiKey))","if ((!connection.hasCredential && (!connection.apiKey || /demo-placeholder|not-connected/.test(connection.apiKey)))");
 s=once(s,"        const response = await fetchRequest(request.transport.url, { method: 'POST', headers, body: JSON.stringify(request.transport.body), signal: AbortSignal.timeout(60000), redirect: 'error' });",`        const unsubscribe = studioDesktop.ai.onEvent(event => {
          if(event.requestId !== requestId) return;
          if(event.type === 'delta') request.partialResponse = (request.partialResponse || '') + event.text;
          window.dispatchEvent(new CustomEvent('studio-ai-progress', {detail:event}));
        });
        let received;
        try { received = await studioDesktop.ai.execute({requestId, stream:request.transport.body.stream}); }
        finally { unsubscribe(); }
        const response = {ok:true,json:async()=>received};`);
 const start=s.indexOf('  async function discoverModels(connectionId) {'),end=s.indexOf('\n  return {prepareRequest',start);
 s=s.slice(0,start)+'  async function discoverModels(connectionId) { return studioDesktop.ai.models(connectionId); }\n'+s.slice(end);
 s=s.replace("if (request.status !== 'incomplete') request.status = 'failed';","if (request.status !== 'incomplete') request.status = error.code === 'cancelled' ? 'cancelled' : 'failed'; request.errorCode = error.code || 'request';");
 s=s.replace("!['failed', 'incomplete'].includes(current.status)","!['failed', 'incomplete', 'cancelled'].includes(current.status)");
 return s;
});
