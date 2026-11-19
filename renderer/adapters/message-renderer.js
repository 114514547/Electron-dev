/* Presentation only: stored message text remains unchanged. */
(() => {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const parser = new marked.Marked({breaks:true, gfm:true});
  parser.use({renderer:{html:token => escape(token.text)}, extensions:[{
    name:'studioMath', level:'inline',
    start:src => {const i=src.search(/\\[([]|\$/);return i<0?undefined:i;},
    tokenizer(src) {
      const match=/^\\\[([\s\S]+?)\\\]/.exec(src)||/^\$\$([\s\S]+?)\$\$/.exec(src)||/^\\\(([^\n]+?)\\\)/.exec(src)||/^\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)/.exec(src);
      if(match)return {type:'studioMath',raw:match[0],text:match[1],displayMode:src.startsWith('\\[')||src.startsWith('$$')};
    },
    renderer:token => katex.renderToString(token.text,{displayMode:token.displayMode,throwOnError:false,trust:false,strict:'ignore'})
  }]});
  window.renderMessageContent = (text, options = {}) => {
   const clean = DOMPurify.sanitize(parser.parse(String(text??'')),{
    FORBID_TAGS:['script','style','iframe','object','embed','form','input','button'],
    FORBID_ATTR:['id','name']
   });
   const root = document.createElement('div');
   root.className = 'message-rich-text';
   root.innerHTML = clean;
   if (options.roleplay) {
    // Decorate parsed text only: never rewrite HTML, code, links or math markup.
    root.querySelectorAll('em').forEach(el => el.classList.add('v3-rp-action'));
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
     const node = walker.currentNode;
     if (!node.parentElement.closest('pre,code,a,.katex,em')) nodes.push(node);
    }
    for (const node of nodes) {
     const pattern = /(「[^」]+」|“[^”]+”)|(（[^）]+）|\([^\)]+\))/g;
     const fragment = document.createDocumentFragment();
     let offset = 0, match;
     while ((match = pattern.exec(node.data))) {
      fragment.append(node.data.slice(offset, match.index));
      const span = document.createElement('span');
      span.className = match[1] ? 'v3-rp-dialogue' : 'v3-rp-action';
      span.textContent = match[0];
      fragment.append(span);
      offset = pattern.lastIndex;
     }
     if (offset) { fragment.append(node.data.slice(offset)); node.replaceWith(fragment); }
    }
   }
   return root.outerHTML;
  };
})();
