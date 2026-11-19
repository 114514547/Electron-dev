const {_electron:electron}=require('playwright-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const env={...process.env,STUDIO_TEST_PROFILE:path.join(root,'.test-data','renderer-'+Date.now())};
delete env.ELECTRON_RUN_AS_NODE;
(async()=>{
 const app=await electron.launch({executablePath:require('electron'),args:[root,'--dev'],env});
 try{
  const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.waitForFunction(()=>window.CreationWorkflow&&window.renderMessageContent);
  const output=await page.evaluate(()=>{
   const el=document.createElement('div');el.innerHTML=renderMessageContent('**bold**\n\\(x^2\\)\n\\[E=mc^2\\]\n`<script>`\n<img src=x onerror="alert(1)">\n[bad](javascript:alert(1))');
   return {bold:el.querySelector('strong')?.textContent,math:el.querySelectorAll('.katex').length,unsafe:!!el.querySelector('script,img,[onerror],a[href^="javascript:"]'),code:el.querySelector('code')?.textContent};
  });
  assert.equal(output.bold,'bold');assert.equal(output.math,2);assert.equal(output.unsafe,false);assert.equal(output.code,'<script>');
  console.log('PASS Markdown, inline/display math, code and unsafe HTML isolation');
  const markdown = await page.evaluate(()=>{
   const source='# Heading\n\n**bold** and *action*\n\n- first\n- second\n\n> quote\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```js\nconst x = "（code）";\n```\n\n「hello」 （nod）\n\n\\(x^2\\)\n\n[bad](javascript:alert(1))';
   const host=document.createElement('div');host.innerHTML=v3FormatRpText(source);document.body.append(host);
   const result={heading:host.querySelector('h1')?.textContent,bold:host.querySelector('strong')?.textContent,items:host.querySelectorAll('li').length,table:!!host.querySelector('table'),quote:!!host.querySelector('blockquote'),code:host.querySelector('pre code')?.textContent,codeDecorated:!!host.querySelector('pre span'),dialogue:host.querySelector('.v3-rp-dialogue')?.textContent,action:!!host.querySelector('em.v3-rp-action'),math:host.querySelectorAll('.katex').length,unsafe:!!host.querySelector('a[href^="javascript:"]'),plainWhitespace:getComputedStyle(host.firstElementChild).whiteSpace};host.remove();return result;
  });
  assert.equal(markdown.heading,'Heading');assert.equal(markdown.bold,'bold');assert.equal(markdown.items,2);
  assert.ok(markdown.table&&markdown.quote&&markdown.action);assert.equal(markdown.dialogue,'「hello」');
  assert.equal(markdown.code,'const x = "（code）";\n');assert.equal(markdown.codeDecorated,false);
  assert.equal(markdown.math,1);assert.equal(markdown.unsafe,false);assert.equal(markdown.plainWhitespace,'normal');
  console.log('PASS RP Markdown lists/tables/code/math and existing dialogue/action classes');
  const inspected=await page.evaluate(()=>{
   ui.newKind='free';ui.newRole='none';ui.newTitle='Inspector isolation';newSession();
   const before=CreationWorkflow.listRequests().length;
   inspectCurrentRequest();
   return {before,after:CreationWorkflow.listRequests().length,input:ui.activeInspectedRequest.context.input,role:ui.activeInspectedRequest.context.roleId,sections:ui.activeInspectedRequest.sections.map(s=>s.name),text:document.getElementById('st-inspector-dock')?.textContent};
  });
  assert.equal(inspected.before,inspected.after);assert.equal(inspected.input,'');assert.ok(!inspected.role);assert.ok(!inspected.sections.includes('角色资料'));assert.ok(inspected.text.includes('尚未发送'));
  console.log('PASS preview does not persist, inject global role or invent input');
  await page.screenshot({path:path.join(root,'test-results','renderer-inspector.png')});
  assert.deepEqual(errors,[]);
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
