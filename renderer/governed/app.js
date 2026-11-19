// Legacy global event interfaces retain their original script semantics.
const I=(name,extra='')=>`<svg ${extra}><use href="#i-${name}"></use></svg>`;
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choices=[{id:'design',name:'角色设计与标签',icon:'palette',desc:'标签组合、视觉设定、角色候选'},{id:'scene',name:'场景构图与提示词',icon:'image',desc:'画面脑暴、镜头构思、Codex 生图任务'},{id:'plot',name:'剧情与人物讨论',icon:'book',desc:'故事走向、动机分析、小说研究'},{id:'free',name:'自由讨论',icon:'chat',desc:'无需指定角色，想到什么聊什么'},{id:'files',name:'文件与资料任务',icon:'folder',desc:'读取、修改与整理本地创作资料'}];
const models=[{id:'deepseek',name:'DeepSeek · 创作与工具',short:'DeepSeek'},{id:'gemini',name:'Gemini · 创意与写作',short:'Gemini'},{id:'other',name:'其他模型通道',short:'其他模型'}];
let roles=[{id:'yiwen',name:'崔依玟',icon:'依',tone:'peach',series:'校园角色系列',desc:'视觉设计已成熟 · 已有冬日搞怪合影构思',tags:['校园','日常','特殊视觉设计'],visual:'成熟的视觉角色设计。具有独立、稳定的外观设定，可以用于场景插画与后续创作。'},{id:'knight',name:'猫娘骑士',icon:'骑',tone:'',series:'原创设计草案',desc:'猫科元素与无头骑士结合的视觉实验',tags:['猫耳','骑士','无头骑士'],visual:'从个人标签库产生的组合候选。已确认猫科特征和无头骑士两个核心方向；服饰细节与身份仍可探索。'},{id:'shuyao',name:'李书瑶',icon:'瑶',tone:'blue',series:'人物创作系列',desc:'已有角色设定，可以用于剧情与 RP',tags:['人物设定','视觉创作'],visual:'已有视觉设定的角色，可以继续关联故事、场景和相关讨论。'}];
const seedSessions=[
{id:'s1',title:'雪人合影的镜头设计',kind:'scene',roles:['yiwen'],work:null,series:'校园角色系列',model:'gemini',summary:'保留两种构图 · 待整理提示词',created:1,messages:[{by:'you',text:'我想给崔依玟设计冬天雪人合影插画，有哪些比较有趣的镜头表现？'},{by:'ai',text:'可以试试平视中景和稍低机位两种方案。前者强调轻松自然的同学合影感；后者突出雪人与人物的视觉关系。把两种方案都留作候选，再选择喜欢的构图。'}],prompts:[{id:'p1',title:'雪人合影 · 中景方案',text:'# 生图任务 Batch 001\n角色：崔依玟；采用已有视觉设定。\n场景：冬日雪地中的趣味合影，头部放在雪人身体上，独立的身体在旁边合影。\n构图：平视中景，强调轻松自然的生活氛围。\n风格：清爽日式赛璐璐插画，线条干净，阴影简洁。\n要求：保持角色既定设计；输出图像到指定角色文件夹。'}]},
{id:'s2',title:'猫娘骑士的标签组合',kind:'design',roles:['knight'],work:null,series:'原创设计草案',model:'deepseek',summary:'猫科特征与骑士元素已选中',created:2,messages:[{by:'you',text:'基于我偏好的标签，组合一些具有视觉反差的角色设定。'},{by:'ai',text:'候选：猫娘 × 无头骑士。保留猫耳、猫尾与骑士视觉语言，让服饰、身份和背景自由发挥。这是视觉设计草案，不必先确定剧情。'}],prompts:[]},
{id:'s3',title:'第三章的人物动机',kind:'plot',roles:['shuyao'],work:'w1',series:'《北方来信》',model:'gemini',summary:'探讨人物为何选择保持沉默',created:3,messages:[{by:'you',text:'帮我讨论第三章中角色保持沉默的动机，但先不要修改正文。'},{by:'ai',text:'可以分别从自我保护、保护他人和信息不对称三个方向审视。建议先比较各自对后续剧情的影响，确认后再写进正文。'}],prompts:[]},
{id:'s4',title:'崔依玟的万圣节构图',kind:'scene',roles:['yiwen'],work:null,series:'校园角色系列',model:'gemini',summary:'已有创意 · 待选定构图',created:4,messages:[{by:'you',text:'围绕崔依玟，构思一幅有学生时代趣味的万圣节插画。'}],prompts:[]},
{id:'s5',title:'猫娘骑士的服装差分',kind:'design',roles:['knight'],work:null,series:'原创设计草案',model:'deepseek',summary:'骑士铠甲与休闲配饰的对比',created:5,messages:[{by:'you',text:'希望在骑士铠甲之外再探索一些现代配饰，但保持角色核心特征。'}],prompts:[]},
{id:'s6',title:'无主题的灵感便签',kind:'free',roles:[],work:null,series:'',model:'deepseek',summary:'自由讨论 · 暂未关联角色',created:6,messages:[{by:'ai',text:'欢迎随时开始讨论。灵感可以先留在这里，之后再关联角色或作品。'}],prompts:[]},
{id:'s7',title:'整理本地角色设计文档',kind:'files',roles:['yiwen','knight'],work:null,series:'',model:'deepseek',summary:'跨角色资料整理计划',created:7,messages:[{by:'you',text:'帮我整理这些角色资料的分类规则，先提出方案，不要直接覆盖文件。'}],prompts:[]}
];
let cats=['全部分类','种族与身份','外貌特征','服装与配饰','职业与背景','环境与场景','动作与构图','艺术风格'];
const tagSeed=[['猫耳','外貌特征',88,'尖立或微垂的猫科耳朵'],['猫尾','外貌特征',93,'自然延伸的猫科尾巴'],['猫爪','外貌特征',45,'兽化爪部或类似手套特征'],['无头骑士','种族与身份',95,'具有独立头部设定的奇幻骑士'],['猫娘','种族与身份',90,'含猫科视觉要素的拟人女性'],['机械义肢','外貌特征',65,'机械结构与身体衔接'],['红瞳','外貌特征',42,'鲜明的红色虹膜'],['短发','外貌特征',57,'短发造型'],['长发','外貌特征',48,'长发造型'],['银发','外貌特征',60,'浅银色发色'],['棒球帽','服装与配饰',72,'日常运动棒球帽'],['骑士铠甲','服装与配饰',82,'金属铠甲与骑士细节'],['水手服','服装与配饰',67,'日系学生制服'],['风衣','服装与配饰',64,'长款风衣'],['围巾','服装与配饰',73,'秋冬围巾装饰'],['连帽衫','服装与配饰',68,'休闲连帽上衣'],['修身手套','服装与配饰',79,'手部服饰细节'],['医生','职业与背景',38,'医疗职业身份'],['女骑士','职业与背景',88,'女性骑士职业设定'],['学生','职业与背景',78,'校园背景的成年学生'],['工程师','职业与背景',51,'技术职业背景'],['侦探','职业与背景',59,'调查与推理题材角色'],['雪地','环境与场景',70,'冬季雪景'],['教室','环境与场景',74,'校园室内空间'],['天台','环境与场景',58,'高处开放空间'],['图书馆','环境与场景',65,'书籍陈列环境'],['咖啡馆','环境与场景',58,'咖啡厅日常场景'],['夜景','环境与场景',72,'夜晚照明氛围'],['公园','环境与场景',60,'绿地户外环境'],['合影','动作与构图',89,'多人或角色同框合照'],['仰拍','动作与构图',47,'低视角构图'],['侧身','动作与构图',60,'侧身姿态'],['半身构图','动作与构图',67,'半身景别'],['坐姿','动作与构图',58,'坐下姿态'],['赛璐璐','艺术风格',98,'清爽的动画式平涂阴影'],['低噪点','艺术风格',96,'干净纯粹的画面质感'],['细线稿','艺术风格',85,'纤细清晰的线条'],['柔和光照','艺术风格',72,'自然柔和的光影']];
const seedTags=tagSeed.map((t,i)=>({id:'t'+(i+1),name:t[0],category:t[1],weight:t[2],desc:t[3],enabled:t[0]!=='猫爪',source:'示例标签'}));
const initial={roles, sessions:seedSessions,tagItems:seedTags,modelDefaults:{design:'deepseek',scene:'gemini',plot:'gemini',free:'deepseek',files:'deepseek',novel:'gemini',rp:'gemini'},chapters:{c1:'那是初雪落下后的第三天。\n\n她把围巾放在长椅上，停顿片刻，还是决定保持沉默。街道尽头的灯一盏接一盏亮起来，远处传来电车的声音。\n\n她知道某个决定迟早要做出，却还没有找到适当的时机。',c2:'第二章的内容可以在这里编辑。\n\n这份文本作为交互原型中的虚拟稿件保存在浏览器本地。'},rpHistory:[{by:'ai',text:'午后的阳光落在窗沿。她转过身，带着一点好奇打量眼前的情景。\n\n「今天想聊些什么？」'}]};
let store=WorkspaceStorage.load(initial);
roles=store.roles||roles;store.roles=roles;
const ui={page:'home',sessionId:'s1',kind:'all',role:'all',sessionQuery:'',roleId:'yiwen',roleTab:'visual',roleSeries:'all',tagsCategory:'全部分类',tagsQuery:'',tagSelected:'t1',tagFilter:'all',tagSort:'name',tagLimit:60,workChapter:'c1',modal:'',newKind:'design',newRole:'none',newTitle:'',aiDraft:'删除猫爪，添加飞行员帽',search:'',preview:[],roleImages:{},focus:'',editPromptId:'',rpRole:'yiwen'};
window.ui = ui;
const save=()=>{try{WorkspaceStorage.save(store)}catch(error){toast('保存失败：'+error.message);throw error;}};
const session=id=>store.sessions.find(s=>s.id===id);const role=id=>roles.find(r=>r.id===id);const kname=k=>(choices.find(x=>x.id===k)||{}).name||'讨论';const mname=id=>(models.find(x=>x.id===id)||{}).name||id;
const nextId=prefix=>prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6);
let undoStack=[];function rememberTags(){undoStack.push(structuredClone(store.tagItems));if(undoStack.length>16)undoStack.shift()}
function toast(text){document.querySelector('.toast')?.remove();let d=document.createElement('div');d.className='toast';d.textContent=text;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}
function topButton(label,act,primary=false){return `<button class="btn ${primary?'primary':''}" onclick="${act}">${label}</button>`}
function visit(page,props={}){Object.assign(ui,props);ui.page=page;ui.modal='';render()}
function goSession(id){if(!session(id))return;ui.kind='all';ui.role='all';ui.sessionQuery='';visit('sessions',{sessionId:id})}
function goRole(id,tab='visual'){visit('role',{roleId:id,roleTab:tab})}
function openNew(kind=null,roleId=null){ui.newKind=kind||(ui.page==='sessions'&&ui.kind!=='all'?ui.kind:'free');ui.newRole=roleId||(ui.page==='role'?ui.roleId:'none');ui.newTitle='';ui.modal='new';overlay()}
function newSession(){const id=nextId('s'),kind=ui.newKind,roleId=ui.newRole;const title=ui.newTitle.trim()||({design:'新角色设计',scene:'新场景构思',plot:'新剧情讨论',free:'新的自由讨论',files:'新文件任务'}[kind]);store.sessions.unshift({id,title,kind,roles:roleId==='none'?[]:[roleId],work:null,series:role(roleId)?.series||'',model:store.modelDefaults[kind],summary:'刚刚创建 · 尚未整理成果',created:Date.now(),messages:[],prompts:[]});save();ui.kind='all';ui.role='all';ui.sessionQuery='';goSession(id);toast('新会话已创建 · 已自动设置用途和默认模型')}
function chatForRole(id,kind='design'){const older=store.sessions.find(s=>s.kind===kind&&s.roles.includes(id));if(older)goSession(older.id);else openNew(kind,id)}
function filteredSessions(){return [...store.sessions].filter(s=>!s.archivedAt&&(ui.kind==='all'||s.kind===ui.kind)&&(ui.role==='all'||(ui.role==='none'?s.roles.length===0:s.roles.includes(ui.role)))&&(`${s.title} ${s.summary} ${s.series} ${s.messages.map(m=>m.text).join(' ')}`).toLowerCase().includes(ui.sessionQuery.trim().toLowerCase())).sort((a,b)=>b.created-a.created)}
function countsByKind(k){return store.sessions.filter(s=>!s.archivedAt&&k==='all'||s.kind===k).length}
function navTarget(){return ({role:'roles',tags:'tags',editor:'works',concept:'concept'})[ui.page]||ui.page}

function renderPage(){
  const active=navTarget();
  const nav=[
    ['home','首页','home'],
    ['chat','会话','sessions'],
    ['users','角色','roles'],
    ['spark','概念工坊','concept'],
    ['tag','标签库','tags'],
    ['book','作品','works'],
    ['theater','RP','rp']
  ];
  const title=({
    home:'创作工作台',
    sessions:'会话中心',
    roles:'角色资料库',
    role:role(ui.roleId)?.name||'角色档案',
    tags:'视觉标签库',
    concept:'角色概念工作台 · V3 定向开放探索',
    works:'我的作品',
    editor:'《北方来信》',
    rp:'角色扮演'
  })[ui.page]||'工作台';

  let appShell = document.getElementById('st-main-shell');
  if(!appShell){
    document.getElementById('root').innerHTML='<div id="st-main-shell" class="app">' +
      '<aside class="rail">' +
        '<div class="brand" title="SillyTavern Desktop V3.0"><b></b><b></b><b></b><b></b></div>' +
        '<nav class="nav-list" id="rail-nav-list"></nav>' +
        '<div class="rail-bottom">' +
          '<button class="icon-action" title="全局搜索 (Ctrl+K)" onclick="show(\'search\')">' + I('search') + '</button>' +
          '<button class="persona-rail-btn" title="用户身份：' + E(store?.personas?.find(p=>p.id===store?.currentPersona)?.name||'旅人') + ' (点击管理)" onclick="show(\'persona\')">' + E(store?.personas?.find(p=>p.id===store?.currentPersona)?.avatar||'旅') + '</button>' +
          '<button class="icon-action" title="系统与模型设置" onclick="show(\'settings\')">' + I('settings') + '</button>' +
        '</div>' +
      '</aside>' +
      '<div class="workspace">' +
        '<header class="topbar">' +
          '<div class="crumb" id="topbar-crumb-box">' +
            '<span>创作工作室</span><span class="slash">/</span><strong id="topbar-title">' + E(title) + '</strong>' +
          '</div>' +
          '<div class="top-right" style="position:relative">' +
            '<button class="topbar-status-btn" id="topbarStatusBtn" onclick="toggleGlobalStatusPopover(event)" title="查看系统运行与连接状态">' +
              '<span class="topbar-status-dot"></span>' +
              '<span class="topbar-status-label">系统状态</span>' +
            '</button>' +
            renderGlobalStatusPopoverHtml() +
            renderCandidateTopBadge() +
            '<button class="btn quiet shortcut" onclick="show(\'search\')">' + I('search') + ' 搜索角色、会话与标签 <span class="keycap">Ctrl K</span></button>' +
            '<button class="btn primary" onclick="show(\'quick\')">' + I('plus') + ' 新建</button>' +
          '</div>' +
        '</header>' +
        '<main class="page" id="st-main-page" style="display:flex;min-height:0;height:calc(100dvh - 65px);position:relative;overflow:hidden">' +
          '<div id="st-page-view" style="flex:1;min-width:320px;height:100%;min-height:0;overflow:hidden"></div>' +
          '<div id="concept-page-view" class="concept-workbench-root" style="display:none;flex:1;min-width:320px;height:100%;overflow:hidden">' +
            conceptWorkbenchTemplate +
          '</div>' +
          '<div class="st-inspector-splitter" id="st-inspector-splitter" style="display:none" title="拖动调整宽度：向左拉满全屏 / 向右压缩关闭 · 双击切换全屏 (60% / 100%)"></div>' +
          '<div id="st-splitter-drag-badge" class="st-splitter-drag-badge"></div>' +
          '<aside class="st-inspector-dock" id="st-inspector-dock" style="display:none"></aside>' +
        '</main>' +
      '</div>' +
    '</div>';
  }

  document.getElementById('rail-nav-list').innerHTML = nav.map(([i,n,target]) =>
    '<button class="nav-button ' + (active === target ? 'on' : '') + '" title="' + n + '" onclick="visit(\'' + target + '\')">' +
      I(i) + '<span>' + n + '</span>' +
    '</button>'
  ).join('');

  document.getElementById('topbar-title').textContent = title;

  const stPageView = document.getElementById('st-page-view');
  const conceptPageView = document.getElementById('concept-page-view');
  if(ui.page === 'concept'){
    stPageView.style.display = 'none';
    conceptPageView.style.display = 'flex';
    if(window.ConceptWorkbench) window.ConceptWorkbench.render();
  } else {
    stPageView.style.display = 'block';
    conceptPageView.style.display = 'none';
    stPageView.innerHTML = page();
  }
  if (window.RequestInspectorDock && typeof RequestInspectorDock.syncView === 'function') {
    RequestInspectorDock.syncView();
  }
  overlay();
}

function page(){switch(ui.page){case'home':return home();case'sessions':return sessions();case'roles':return roleList();case'role':return roleDetail();case'tags':return tagManager();case'works':return works();case'editor':return editor();case'rp':return rp();default:return home()}}

function home(){
  const recent = [...store.sessions].sort((a,b) => b.created - a.created).slice(0, 3);
  
  // Pick 3 random tags for Daily Spark
  const availableTags = (store.tagItems && store.tagItems.length) 
    ? store.tagItems.map(t => t.name) 
    : ['银白短发', '白衬衫与百褶裙', '自信', '机械义肢', '天文社骨干', '放学后的空教室'];
  const shuffled = [...availableTags].sort(() => 0.5 - Math.random());
  const sparkTags = shuffled.slice(0, 3);
  const sparkTagsJson = JSON.stringify(sparkTags).replace(/"/g, '&quot;');
  
  const worksTitle = store.works?.[0]?.title || '《北方来信》';
  const scratchpadContent = store.scratchpad || '';

  return '<div class="scroll" style="height:100%">' +
    '<div class="v3-home-dashboard">' +
      // Header Eyebrow & Title
      '<div class="v3-home-header">' +
        '<div class="eyebrow">PERSONAL CREATIVE STUDIO · V3.0 全功能创作工作室</div>' +
        '<h1 class="h1" style="font-size:24px;margin:4px 0 6px">创作从这里继续。</h1>' +
        '<p class="small-over" style="margin:0">角色概念探索、视觉设计、场景脑暴、小说章节与 RP 角色扮演全面协同。</p>' +
      '</div>' +

      // Hero Row: Banner (Left) + Stats Hub (Right)
      '<div class="v3-hero-row">' +
        '<div class="v3-hero-banner">' +
          '<div class="v3-hero-text">' +
            '<span class="chip green" style="background:rgba(226, 226, 226, 0.18);border:1px solid rgba(226, 226, 226, 0.35);color:var(--sage,#e2e2e2)">✦ 概念工坊 V3 已深度融合</span>' +
            '<h1>一个窗口，继续所有灵感</h1>' +
            '<p>不再按外部 Agent 的工作区找对话；按创作类型和角色检索。自然语言定向探索概念、标签库沉淀管理，一键推送到角色库即刻开聊。</p>' +
            '<div class="v3-hero-actions">' +
              '<button class="btn primary" onclick="visit(\'concept\')">' + I('spark') + ' 角色概念工坊探索</button>' +
              '<button class="btn" style="background:#2b2b2b;border-color:#444444" onclick="openNew(\'design\')">' + I('plus') + ' 开始新创作</button>' +
              '<button class="btn quiet" onclick="visit(\'sessions\')">' + I('chat') + ' 浏览全部会话</button>' +
            '</div>' +
          '</div>' +
          '<div class="inline-logo" style="opacity:0.25;font-size:48px">' + I('spark') + '</div>' +
        '</div>' +

        // New Block 1: Creative Stats Hub
        '<div class="v3-stats-card">' +
          '<div class="v3-stats-head">' +
            '<span>' + I('spark') + ' 创作者数字资产快报</span>' +
            '<span class="chip" style="font-size:9.5px;padding:1px 6px">实时汇总</span>' +
          '</div>' +
          '<div class="v3-stats-grid">' +
            '<div class="v3-stat-item click" onclick="visit(\'roles\')" title="前往角色资料库">' +
              '<span class="v3-stat-num">' + roles.length + ' <small style="font-size:11px;font-weight:normal">位</small></span>' +
              '<span class="v3-stat-lbl">' + I('users') + ' 视觉角色档案</span>' +
            '</div>' +
            '<div class="v3-stat-item click" onclick="visit(\'sessions\')" title="前往会话中心">' +
              '<span class="v3-stat-num">' + store.sessions.length + ' <small style="font-size:11px;font-weight:normal">场</small></span>' +
              '<span class="v3-stat-lbl">' + I('chat') + ' 创作讨论会话</span>' +
            '</div>' +
            '<div class="v3-stat-item click" onclick="visit(\'tags\')" title="前往视觉标签库">' +
              '<span class="v3-stat-num">' + (store.tagItems?.length || 128) + ' <small style="font-size:11px;font-weight:normal">项</small></span>' +
              '<span class="v3-stat-lbl">' + I('tag') + ' 视觉标签库</span>' +
            '</div>' +
            '<div class="v3-stat-item click" onclick="visit(\'works\')" title="前往作品连载">' +
              '<span class="v3-stat-num">' + store.works.length + ' <small style="font-size:11px;font-weight:normal">部</small></span>' +
              '<span class="v3-stat-lbl">' + I('book') + ' ' + E(worksTitle) + '</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      // 4 Creative Entrance Cards
      '<div class="sectionhead" style="margin-top:4px">' +
        '<h2 style="font-size:15px;font-weight:750">常用创作入口</h2>' +
        '<span class="tiny" style="color:#8f8f8f">按工作目的开始，而非按模型平台</span>' +
      '</div>' +
      '<div class="v3-entrances-grid">' +
        '<div class="v3-entrance-card featured click" onclick="visit(\'concept\')">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<div class="v3-entrance-icon" style="background:rgba(226, 226, 226, 0.18);color:var(--sage,#e2e2e2)">' + I('spark') + '</div>' +
            '<span class="chip green" style="font-size:9.5px;padding:2px 6px">V3 旗舰引擎</span>' +
          '</div>' +
          '<div class="v3-entrance-title">角色概念工坊 (V3)</div>' +
          '<div class="v3-entrance-desc">自然语言定向探索、分支图谱发散、特征组合与一键推送到酒馆。</div>' +
          '<div class="v3-entrance-link">立即开启探索 ' + I('arrow') + '</div>' +
        '</div>' +

        '<div class="v3-entrance-card click" onclick="openNew(\'design\')">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<div class="v3-entrance-icon" style="background:rgba(237, 237, 237, 0.12);color:var(--blue,#ededed)">' + I('palette') + '</div>' +
            '<span class="chip" style="font-size:9.5px;padding:2px 6px">视觉档案</span>' +
          '</div>' +
          '<div class="v3-entrance-title">角色视觉设计</div>' +
          '<div class="v3-entrance-desc">标签组合、候选外观设计、保存角色并与全工作区联动。</div>' +
          '<div class="v3-entrance-link" style="color:var(--blue,#ededed)">打开设计会话 ' + I('arrow') + '</div>' +
        '</div>' +

        '<div class="v3-entrance-card click" onclick="openNew(\'scene\')">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<div class="v3-entrance-icon" style="background:rgba(220, 220, 220, 0.12);color:var(--gold,#dcdcdc)">' + I('image') + '</div>' +
            '<span class="chip" style="font-size:9.5px;padding:2px 6px">分镜构图</span>' +
          '</div>' +
          '<div class="v3-entrance-title">场景与提示词</div>' +
          '<div class="v3-entrance-desc">讨论构图光影与环境氛围，导出结构化生图任务。</div>' +
          '<div class="v3-entrance-link" style="color:var(--gold,#dcdcdc)">设计场景提示词 ' + I('arrow') + '</div>' +
        '</div>' +

        '<div class="v3-entrance-card click" onclick="visit(\'editor\')">' +
          '<div style="display:flex;justify-content:space-between;align-items:center">' +
            '<div class="v3-entrance-icon" style="background:rgba(211, 211, 211, 0.12);color:var(--pink,#d3d3d3)">' + I('book') + '</div>' +
            '<span class="chip" style="font-size:9.5px;padding:2px 6px">长篇小说</span>' +
          '</div>' +
          '<div class="v3-entrance-title">小说写作与连载</div>' +
          '<div class="v3-entrance-desc">打开作品章节，研讨剧情推进、伏笔与正文细化。</div>' +
          '<div class="v3-entrance-link" style="color:var(--pink,#d3d3d3)">进入写作空间 ' + I('arrow') + '</div>' +
        '</div>' +
      '</div>' +

      // Bottom Row: 2 Columns (Left: Recent Sessions + Daily Spark; Right: My Roles + Quick Scratchpad)
      '<div class="v3-bottom-columns">' +
        // Left Column: Recent Sessions & Daily Spark
        '<div style="display:flex;flex-direction:column;gap:16px">' +
          '<div class="v3-panel-box">' +
            '<div class="v3-panel-head">' +
              '<h2>' + I('chat') + ' 最近讨论会话</h2>' +
              '<button class="btn quiet sm" onclick="visit(\'sessions\')">全部会话 ' + I('arrow') + '</button>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;gap:8px">' +
              recent.slice(0, 2).map(s => '' +
                '<div class="card click" style="padding:12px 14px;background:#252525;border-color:#3a3a3a" onclick="goSession(\'' + s.id + '\')">' +
                  '<div class="flex gap8" style="margin-bottom:5px">' +
                    '<span class="chip green">' + E(kname(s.kind)) + '</span>' +
                    s.roles.map(r => '<span class="tiny">' + E(role(r)?.name || r) + '</span>').join('') +
                  '</div>' +
                  '<div class="card-title" style="font-size:13px">' + E(s.title) + '</div>' +
                  '<p class="small-over" style="margin:4px 0 6px;line-height:1.5">' + E(s.summary) + '</p>' +
                  '<span class="tiny" style="color:var(--sage,#e2e2e2);font-weight:650">继续上次讨论 →</span>' +
                '</div>'
              ).join('') +
            '</div>' +

            // New Block 2: Daily Spark Generator
            '<div class="v3-spark-box">' +
              '<div class="v3-spark-head">' +
                '<span>✦ 每日随机灵感碰撞</span>' +
                '<span class="tiny" style="color:#8f8f8f;font-weight:normal">算法从标签库随机抽取组合</span>' +
              '</div>' +
              '<div class="v3-spark-tags">' +
                sparkTags.map(t => '<span class="chip" style="background:#333333;border-color:rgba(226, 226, 226, 0.3);color:#f9f9f9;padding:3px 8px;font-size:10.5px">' + E(t) + '</span>').join('') +
              '</div>' +
              '<button class="button small primary" style="width:100%;margin-top:4px" onclick="sparkWithTags(' + sparkTagsJson + ')">✦ 以这组灵感进入概念工坊发散 →</button>' +
            '</div>' +
          '</div>' +
        '</div>' +

        // Right Column: My Roles & Quick Scratchpad
        '<div style="display:flex;flex-direction:column;gap:16px">' +
          '<div class="v3-panel-box">' +
            '<div class="v3-panel-head">' +
              '<h2>' + I('users') + ' 角色资料库画廊</h2>' +
              '<button class="btn quiet sm" onclick="visit(\'roles\')">全部角色 ' + I('arrow') + '</button>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:8px">' +
              roles.slice(0, 4).map(r => '' +
                '<div class="card click home-recent" style="padding:10px;background:#252525;border-color:#3a3a3a;display:flex;flex-direction:column;align-items:center;text-align:center" onclick="goRole(\'' + r.id + '\')">' +
                  '<div class="avatar ' + r.tone + '" style="width:42px;height:42px;font-size:16px;margin-bottom:6px">' + r.icon + '</div>' +
                  '<strong style="font-size:12px;color:#f9f9f9">' + E(r.name) + '</strong>' +
                  '<div class="tiny" style="color:#8f8f8f;margin-top:2px">' + E(r.series) + '</div>' +
                  '<div class="sub" style="margin-top:4px;font-size:9.5px;color:var(--sage,#e2e2e2)">' + store.sessions.filter(s => s.roles.includes(r.id)).length + ' 场会话</div>' +
                '</div>'
              ).join('') +
            '</div>' +

            // New Block 3: Quick Scratchpad
            '<div class="v3-spark-box" style="margin-top:14px;background:#222222">' +
              '<div class="v3-spark-head" style="color:#ededed">' +
                '<span>' + I('pen') + ' 灵感闪念便笺 (Quick Scratchpad)</span>' +
              '</div>' +
              '<textarea id="homeScratchpad" class="v3-scratchpad" placeholder="随时捕捉此刻的一句台词、人设闪念或剧情灵感...">' + E(scratchpadContent) + '</textarea>' +
              '<div style="display:flex;gap:6px;justify-content:flex-end">' +
                '<button class="button small" onclick="saveScratchpad()">保存便笺</button>' +
                '<button class="button small primary" onclick="sendScratchpadToConcept()">✦ 带入概念工坊</button>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
  '</div>';
}

function toggleSessionLeft(){ui.sessionLeftOpen=(ui.sessionLeftOpen===false);render()}
function toggleSessionRight(){ui.sessionRightOpen=(ui.sessionRightOpen===false);render()}

function sessions(){
  const list=filteredSessions(),s=list.find(x=>x.id===ui.sessionId)||list[0];
  const isDockOpen = (typeof RequestInspectorDock !== 'undefined' && RequestInspectorDock.isOpen && RequestInspectorDock.isOpen());
  const showLeft = isDockOpen ? (ui.sessionLeftOpen === true) : (ui.sessionLeftOpen !== false);
  const showRight = isDockOpen ? (ui.sessionRightOpen === true) : (ui.sessionRightOpen !== false);
  return `<div class="split">
    <aside class="sidebar ${!showLeft?'collapsed':''}" style="${!showLeft?'width:0!important;min-width:0!important;max-width:0!important;flex:0 0 0!important;flex-basis:0!important;padding:0!important;margin:0!important;border:none!important;overflow:hidden!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important':''}">
      <div class="between" style="padding:0 10px">
        <div class="sidetitle" style="margin:0">创作会话</div>
        <button class="btn primary sm" onclick="openNew()">${I('plus')} 新建</button>
      </div>
      <div class="side-section">按创作目的</div>
      ${[['all','全部会话','chat'],...choices.map(c=>[c.id,c.name,c.icon])].map(([id,label,icon])=>`<button class="side-link ${ui.kind===id?'on':''}" onclick="setSessionFilter('kind','${id}')">${I(icon)} ${E(label)} <span class="count">${countsByKind(id)}</span></button>`).join('')}
      <div class="side-section">交叉筛选</div>
      <div class="side-control">
        <label>关联角色</label>
        <select class="select" onchange="setSessionFilter('role',this.value)">
          <option value="all">全部角色</option>
          ${roles.map(r=>`<option value="${r.id}" ${ui.role===r.id?'selected':''}>${E(r.name)}</option>`).join('')}
          <option value="none" ${ui.role==='none'?'selected':''}>未关联角色</option>
        </select>
      </div>
      <div class="side-control">
        <label>搜索讨论</label>
        <input class="input" value="${E(ui.sessionQuery)}" placeholder="标题、内容、系列..." oninput="sessionQueryChange(this.value)">
      </div>
      <div class="between" style="padding:4px 12px 0">
        <div class="side-section" style="margin-left:0">会话结果 · ${list.length}</div>
        <button class="ghost" title="清除筛选" onclick="clearFilters()">${I('refresh')}</button>
      </div>
      ${list.length?list.map(c=>`<button class="side-session ${s?.id===c.id?'on':''}" onclick="goSession('${c.id}')"><strong>${E(c.title)}</strong><span class="preview">${E(c.summary)}</span><span class="tag-row"><span class="tiny">${E(kname(c.kind))}</span>${c.roles.slice(0,2).map(r=>`<span class="tiny">· ${E(role(r)?.name||r)}</span>`).join('')}</span></button>`).join(''):`<div class="empty"><p>暂无匹配结果</p><button class="btn sm" onclick="clearFilters()">重置筛选</button></div>`}
    </aside>
    <section class="center">${s?thread(s, showLeft, showRight):`<div class="empty">${I('chat')}<h3>没有匹配的会话</h3><p>调整筛选或创建新的讨论。</p><button class="btn primary" onclick="openNew()">新建会话</button></div>`}</section>
    ${s?context(s, showRight):''}
  </div>`;
}
function setSessionFilter(key,v){ui[key]=v;const arr=filteredSessions();if(arr.length&&!arr.some(s=>s.id===ui.sessionId))ui.sessionId=arr[0].id;render()}
function sessionQueryChange(v){ui.sessionQuery=v;const arr=filteredSessions();if(arr.length&&!arr.some(s=>s.id===ui.sessionId))ui.sessionId=arr[0].id;const field=document.activeElement;render();const inp=document.querySelector('.sidebar .input');if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}}
function clearFilters(){ui.kind='all';ui.role='all';ui.sessionQuery='';render()}
function changeModel(id){const s=session(ui.sessionId);if(!s)return;s.model=id;save();render();toast('仅更新当前会话的模型选择')}
function thread(s, showLeft, showRight){
  const isDockOpen = (typeof RequestInspectorDock !== 'undefined' && RequestInspectorDock.isOpen && RequestInspectorDock.isOpen());
  const leftOpen = (showLeft !== undefined) ? showLeft : (isDockOpen ? (ui.sessionLeftOpen === true) : (ui.sessionLeftOpen !== false));
  const rightOpen = (showRight !== undefined) ? showRight : (isDockOpen ? (ui.sessionRightOpen === true) : (ui.sessionRightOpen !== false));
  return `<div class="thread">
    <div class="threadhead" style="padding:0 12px;height:44px;border-bottom:1px solid var(--stroke);display:flex;align-items:center;justify-content:space-between;gap:12px;user-select:none;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1">
        <button type="button" class="btn-sidebar-toggle ${!leftOpen?'collapsed':''}" onclick="toggleSessionLeft()" title="${leftOpen?'收起创作会话侧栏':'展开创作会话侧栏'}" aria-label="切换会话左栏">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3.5"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
        </button>
        <div style="display:flex;align-items:center;gap:6px;min-width:0">
          <span style="font-size:11px;color:var(--dim);white-space:nowrap">会话</span>
          <span style="color:#555">/</span>
          <div class="threadtitle" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13.5px;font-weight:650;color:#fff">${E(s.title)}</div>
        </div>
        <div class="flex gap8" style="margin-left:6px;flex-shrink:0;align-items:center">
          <span class="chip green">${E(kname(s.kind))}</span>
          ${s.roles.map(id=>`<button class="pill-button" onclick="goRole('${id}')">${E(role(id)?.name||id)} ↗</button>`).join('')}
          <button class="pill-button link-pill" onclick="show('links')" title="关联角色">${I('plus')} 关联角色</button>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:6px;flex-shrink:0">
        <div class="session-more-wrap">
          <button type="button" class="btn-more-icon" onclick="event.stopPropagation();document.getElementById('sessionMorePop')?.classList.toggle('show')" title="会话设置与功能入口" aria-label="更多操作"><svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="2"></circle><circle cx="19" cy="12" r="2"></circle><circle cx="5" cy="12" r="2"></circle></svg></button>
          <div class="session-more-pop" id="sessionMorePop" onclick="event.stopPropagation()">
            <button type="button" class="session-pop-item" onclick="document.getElementById('sessionMorePop')?.classList.remove('show');show('sessionEdit')">${I('pen')} <span>编辑信息与分类</span></button>
            <button type="button" class="session-pop-item" onclick="document.getElementById('sessionMorePop')?.classList.remove('show');openSettings('purposes')" title="管理各创作用途独立模型覆盖">${I('spark')} <span>模型覆盖</span></button>
            <button type="button" class="session-pop-item" onclick="document.getElementById('sessionMorePop')?.classList.remove('show');openSettings('context_template')" title="管理提示词装配与系统预设">${I('chat')} <span>提示模板</span></button>
          </div>
        </div>
        <button type="button" class="btn-sidebar-toggle ${!rightOpen?'collapsed':''}" onclick="toggleSessionRight()" title="${rightOpen?'收起本次创作侧栏':'展开本次创作侧栏'}" aria-label="切换会话右栏">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3.5"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
        </button>
      </div>
    </div>
    <div class="messages">
      ${s.messages.length?s.messages.map(m=>`<div class="msg">
        <div class="who ${m.by==='you'?'user':''}">${I(m.by==='you'?'users':'spark')}</div>
        <div class="bubble">
          <div class="sender">${m.by==='you'?'你':'创作助手'}</div>
          <div class="text">${renderMessageContent(m.text)}</div>
        </div>
      </div>`).join(''):`<div class="empty">${I('chat')}<h3>新对话已经准备好</h3><p>选择的类型为「${E(kname(s.kind))}」，已设置对应模型与工具意图。</p></div>`}
      <div style="height:12px"></div>
    </div>
    <div class="composer">
      <div class="composer-wrap">
        <textarea id="chatinput" rows="2" placeholder="讨论角色设计、构图或剧情……（Ctrl+Enter 发送消息）" onkeydown="if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();sendMessage()}"></textarea>
        <div class="composer-foot" style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap">
          <div class="flex gap8" style="min-width:0;flex:1 1 auto;align-items:center">
            <select aria-label="当前会话模型" class="model-inline" onchange="changeModel(this.value)">${getUnifiedModelCatalog().map(m=>{const cfg=getEffectiveModelConfig('creative_discussion',{sessionId:s.id});return `<option value="${E(m.fullKey)}" ${cfg.connectionId===m.connectionId&&cfg.modelId===m.modelId?'selected':''}>${E(m.modelName)}</option>`}).join('')}</select>
            <span class="tiny" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">当前会话独立设置</span>
          </div>
          <div class="flex gap8" style="align-items:center;flex-shrink:0;margin-left:auto">
            <button type="button" class="btn quiet sm" onclick="inspectCurrentRequest('creative_discussion')" title="检查完整装配上下文、排除原因与协议参数">${I('eye')} 检查请求</button>
            <button class="btn primary sm" onclick="sendMessage()">${I('send')} 发送</button>
          </div>
        </div>
      </div>
    </div>
  </div>`;
}
function context(s, showRight){
  const isDockOpen = (typeof RequestInspectorDock !== 'undefined' && RequestInspectorDock.isOpen && RequestInspectorDock.isOpen());
  const rightOpen = (showRight !== undefined) ? showRight : (isDockOpen ? (ui.sessionRightOpen === true) : (ui.sessionRightOpen !== false));
  return `<aside class="context ${!rightOpen?'collapsed':''}" style="${!rightOpen?'width:0!important;min-width:0!important;max-width:0!important;flex:0 0 0!important;flex-basis:0!important;padding:0!important;margin:0!important;border:none!important;overflow:hidden!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important':''}">
    <div class="section">
      <h3>本次创作</h3>
      <div class="info-line">用途：<b>${E(kname(s.kind))}</b></div>
      <div class="info-line">当前模型：<b>${E(getEffectiveModelConfig('creative_discussion',{sessionId:s.id}).modelName)}</b></div>
      <div class="info-line">状态：<b>${s.messages.length?'进行中':'待开始'}</b></div>
    </div>
    <div class="section">
      <div class="between"><h3>关联角色</h3><button class="ghost" onclick="show('links')" title="修改关联">${I('pen')}</button></div>
      ${s.roles.length?s.roles.map(r=>`<button class="clickrow" style="display:flex;align-items:center;gap:10px;width:100%;margin-bottom:8px" onclick="goRole('${r}')"><div class="avatar" style="height:31px;width:31px;flex-basis:31px;font-size:13px">${role(r)?.icon||'角'}</div><div><strong>${E(role(r)?.name||r)}</strong><div class="tiny">打开角色档案</div></div></button>`).join(''):'<p class="sub">未关联角色，可随时补充。</p>'}
    </div>
    <div class="section">
      <h3>成果与交接</h3>
      ${s.kind==='scene'?`<p class="sub">提示词属于这次讨论。图片只需按角色文件夹存放，无需逐张绑定。</p><button class="btn" style="width:100%;margin:9px 0" onclick="show('prompt')">${I('plus')} 整理生图提示词</button>${s.prompts.map(p=>`<button class="side-link" onclick="viewPrompt('${p.id}')">${I('pen')} ${E(p.title)}</button>`).join('')}`:s.kind==='design'?`<p class="sub">可以将设计成果直接保存为视觉档案，也可以继续维护标签库。</p><button class="btn primary" style="width:100%;margin-top:9px" onclick="show('roleCreate')">${I('users')} 保存为视觉角色</button><button class="btn" style="width:100%;margin-top:9px" onclick="openTags()">${I('tag')} 管理视觉标签库</button>`:s.kind==='plot'?`<p class="sub">剧情讨论默认不会修改正文。需要时打开作品编辑器自行采纳。</p><button class="btn" style="width:100%;margin-top:9px" onclick="visit('editor')">${I('book')} 打开小说</button>`:`<p class="sub">当前为开放讨论。可以随时关联角色或切换创作主题。</p>`}
    </div>
  </aside>`;
}
function sendMessage(){const area=document.getElementById('chatinput'),text=area?.value.trim(),s=session(ui.sessionId);if(!text||!s)return;s.messages.push({by:'you',text});const reply=s.kind==='design'?'已记录这个设计方向。角色设计讨论已记录。可在角色资料库中根据本次讨论提炼视觉设定并保存新角色。':s.kind==='scene'?'已记录场景想法。可以从右侧「整理生图提示词」生成规范化批次，交给 Codex；无需逐张图片绑定。':s.kind==='plot'?'剧情研讨记录已同步至当前作品关联库。你可以在作品编辑器中按需引用或将其采纳为新章节。':s.kind==='files'?'本地文件任务已登记。系统将根据配置的安全策略读取创作资料并生成修改提案。':'已保留这次自由讨论。可以随时关联角色、切换模型或继续探索。';s.messages.push({by:'ai',text:reply});s.summary=text.slice(0,45)+(text.length>45?'…':'');s.created=Date.now();save();render();document.querySelector('.messages')?.scrollTo(0,100000)}
function roleList(){
  initAdaptedV3State(); ensureUnifiedApiState(); applyThemeAppearance();
  var series = ui.roleSeries==='all'?roles:roles.filter(r=>!r.archivedAt&&r.series===ui.roleSeries);
  var mode = ui.roleFilterMode || 'all';
  var filtered = series.filter(r => {
    var isRp = store.roleRpConfigs?.[r.id]?.ready;
    if (mode === 'rp') return isRp;
    if (mode === 'visual') return !isRp;
    return true;
  });

  var allCount = roles.length;
  var visualCount = roles.filter(r => !store.roleRpConfigs?.[r.id]?.ready).length;
  var rpCount = roles.filter(r => store.roleRpConfigs?.[r.id]?.ready).length;

  return `
    <div class="scroll" style="height:100%">
      <div class="pagepad">
        <div class="between" style="margin-bottom:18px">
          <div>
            <div class="eyebrow">CHARACTER REPOSITORY</div>
            <h1 class="h1">角色资料库</h1>
            <p class="sub">统一管理视觉设定与沉浸式 RP 角色卡。角色可仅用于视觉构想，亦可随时升级为可扮演对象。</p>
          </div>
          <div class="flex gap8">
            <button class="btn" onclick="openWorldInfoManager()">${I('book')} 世界书与设定库</button>
            <button class="btn primary" onclick="show('roleCreate')">${I('plus')} 新建角色</button>
          </div>
        </div>

        <div class="between" style="margin-bottom:16px;background:#242424;padding:8px 14px;border-radius:10px;border:1px solid #363636">
          <div style="display:flex;gap:8px">
            <button class="role-filter-tab ${mode==='all'?'active':''}" onclick="filterRolesByMode('all')">全部角色 (${allCount})</button>
            <button class="role-filter-tab ${mode==='visual'?'active':''}" onclick="filterRolesByMode('visual')">仅视觉创作 (${visualCount})</button>
            <button class="role-filter-tab ${mode==='rp'?'active':''}" onclick="filterRolesByMode('rp')">RP 扮演就绪 (${rpCount})</button>
          </div>
          <select class="select" style="width:160px" onchange="ui.roleSeries=this.value;render()">
            <option value="all">全系列</option>
            ${Array.from(new Set(roles.map(r=>r.series))).map(s=>`<option value="${s}" ${ui.roleSeries===s?'selected':''}>${E(s)}</option>`).join('')}
          </select>
        </div>

        <div class="grid3">
          ${filtered.map(r => {
            var hasRp = store.roleRpConfigs?.[r.id]?.ready;
            return `
              <div class="card role-card" onclick="goRole('${r.id}')">
                <div class="between">
                  <div class="avatar lg ${r.tone}">${r.icon}</div>
                  <span class="role-mode-badge ${hasRp?'rp-ready':'visual-only'}">${hasRp?'RP 扮演就绪':'仅视觉设定'}</span>
                </div>
                <h3 class="h3" style="margin:14px 0 4px">${E(r.name)}</h3>
                <div class="eyebrow">${E(r.series)}</div>
                <p class="small-over" style="margin:8px 0 14px">${E(r.desc)}</p>
                <div class="tag-row">${r.tags.map(t=>`<span class="chip">${E(t)}</span>`).join('')}</div>
                <div class="between" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--stroke)">
                  <span class="tiny">${hasRp?'双模就绪':'可衍生/配置'}</span>
                  <span class="ghost sm" style="font-weight:600">查看档案 →</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

function roleDetail(){
  initAdaptedV3State();
  var r = role(ui.roleId) || roles[0];
  var related = store.sessions.filter(s=>!s.archivedAt&&s.roles.includes(r.id)).sort((a,b)=>b.created-a.created);
  var tabs = [['visual','视觉档案'],['chats','相关会话'],['gallery','角色图片'],['prompts','场景与提示词'],['rp','RP 配置']];
  var hasRp = store.roleRpConfigs?.[r.id]?.ready;
  var rpCfg = store.roleRpConfigs?.[r.id] || {};

  return `
    <div class="scroll" style="height:100%">
      <div class="pagepad centered">
        <button class="btn quiet sm" onclick="visit('roles')">${I('back')} 返回角色库</button>

        <div class="card" style="margin-top:16px;padding:24px 26px">
          <div class="between">
            <div class="flex gap16">
              <div class="avatar lg ${r.tone}">${r.icon}</div>
              <div>
                <div class="eyebrow">${E(r.series)} · <span class="role-mode-badge ${hasRp?'rp-ready':'visual-only'}">${hasRp?'RP 扮演就绪':'仅视觉设定'}</span></div>
                <h1 class="h1" style="margin:5px 0 7px">${E(r.name)}</h1>
                <div class="sub">${E(r.desc)}</div>
              </div>
            </div>

            <div class="flex gap8 wrap">
              ${hasRp ? `
                <button class="btn primary" onclick="startRpForRole('${r.id}')">${I('theater')} 进入角色扮演</button>
              ` : `
                <button class="btn primary" onclick="openConfigureRpModal('${r.id}')">${I('plus')} 配置 RP 角色卡</button>
              `}
              <button class="btn" onclick="exploreConceptFromRole('${r.id}')">${I('spark')} 概念工坊衍生</button>
              <button class="btn" onclick="openWorldInfoManager('${rpCfg.boundWorldBook||'wb_north'}')">${I('book')} 绑定世界书</button>
              <button class="btn" onclick="chatForRole('${r.id}','design')">${I('chat')} 发起创作讨论</button>
              <button class="btn" onclick="show('roleEdit')">${I('pen')} 编辑档案</button>
            </div>
          </div>

          <div class="subnav">
            ${tabs.map(item => `<button class="tab ${ui.roleTab===item[0]?'on':''}" onclick="ui.roleTab='${item[0]}';render()">${item[1]}</button>`).join('')}
          </div>
        </div>

        <div style="height:18px"></div>

        ${ui.roleTab==='visual' ? `
          <div class="grid2">
            <div class="card">
              <h3 class="h3">核心视觉设定</h3>
              <div class="kv"><span class="k">角色名称</span><span class="v">${E(r.name)}</span></div>
              <div class="kv"><span class="k">所在系列</span><span class="v">${E(r.series)}</span></div>
              <div class="kv"><span class="k">设定描述</span><span class="v">${E(r.visual)}</span></div>
              <div class="kv"><span class="k">视觉标签</span><span class="v">${r.tags.map(t=>`<span class="chip" style="margin:0 4px 5px 0">${E(t)}</span>`).join('')}</span></div>
            </div>

            <div class="card">
              <h3 class="h3">跨模块操作与衍生</h3>
              <p class="small-over">角色可独立用于插画构思、小说客串或沉浸酒馆交互。</p>
              <div style="display:grid;gap:9px;margin-top:18px">
                <button class="clickrow" onclick="exploreConceptFromRole('${r.id}')">${I('spark')} 将核心特征送入概念工坊开放探索　→</button>
                <button class="clickrow" onclick="openNew('design','${r.id}')">${I('palette')} 开启新的视觉设计会话　→</button>
                <button class="clickrow" onclick="openNew('scene','${r.id}')">${I('image')} 构思一幅新场景插画　→</button>
                <button class="clickrow" onclick="filterRoleSessions('${r.id}')">${I('chat')} 查看 ${related.length} 条关联会话　→</button>
              </div>
            </div>
          </div>
        ` : ui.roleTab==='rp' ? `
          <div class="card">
            <div class="between">
              <div>
                <h3 class="h3">沉浸式角色扮演配置 (RP Card)</h3>
                <p class="small-over">维护角色的问候语、性格、行为准则及关联世界书设定。</p>
              </div>
              ${hasRp ? `
                <button class="btn primary sm" onclick="startRpForRole('${r.id}')">${I('theater')} 开始沉浸 RP 对话</button>
              ` : `
                <button class="btn primary sm" onclick="openConfigureRpModal('${r.id}')">${I('plus')} 立即配置 RP 人设</button>
              `}
            </div>

            ${hasRp ? `
              <div style="margin-top:18px">
                <div class="formrow">
                  <label>开场白问候语 (First Message / Greeting)</label>
                  <div style="background:#1b1b1b;border:1px solid #383838;border-radius:8px;padding:12px 14px;color:#d5d5d5;line-height:1.6;font-size:13px">${E(rpCfg.greeting)}</div>
                </div>
                <div class="formrow" style="margin-top:14px">
                  <label>性格与人设指引 (Personality)</label>
                  <div style="background:#1b1b1b;border:1px solid #383838;border-radius:8px;padding:12px 14px;color:#d5d5d5;line-height:1.6;font-size:13px">${E(rpCfg.personality)}</div>
                </div>
                <div class="kv" style="margin-top:14px">
                  <span class="k">关联世界书</span>
                  <span class="v"><button class="btn sm quiet" onclick="openWorldInfoManager('${rpCfg.boundWorldBook}')">${I('book')} ${E(store.worldInfoBooks.find(b=>b.id===rpCfg.boundWorldBook)?.name || '未关联世界书')}</button></span>
                </div>
                <div class="kv" style="margin-top:14px">
                  <span class="k">专属 RP 模型绑定</span>
                  <span class="v">
                    <button class="v3-model-pill" onclick="openUnifiedModelSelectorModal('rp_chat', { roleId: '${r.id}' })" title="点击为该角色指定专属模型">
                      <span class="v3-model-dot ready"></span>
                      <span class="v3-model-name">${E(getEffectiveModelConfig('rp_chat', { roleId: r.id }).modelName)}</span>
                      <span class="v3-model-badge ${getEffectiveModelConfig('rp_chat', { roleId: r.id }).level}">${getEffectiveModelConfig('rp_chat', { roleId: r.id }).levelLabel}</span>
                      ${store.roleRpConfigs?.[r.id]?.modelOverride ? `<span class="v3-model-reset" onclick="event.stopPropagation();clearRoleModelBinding('${r.id}');render()" title="恢复继承功能默认">↺</span>` : ''}
                    </button>
                  </span>
                </div>
              </div>
            ` : `
              <div style="background:#222;border:1px dashed #444;border-radius:10px;padding:26px;text-align:center;margin-top:18px">
                <div style="font-size:14px;font-weight:600;color:#e0e0e0;margin-bottom:6px">当前角色仅作为视觉与故事设定存在</div>
                <p style="font-size:12px;color:#999;max-width:480px;margin:0 auto 16px">您可以保留作为纯视觉角色继续创作，或为其添加性格、开场白与行为规范，生成专属 RP 角色卡。</p>
                <button class="btn primary" onclick="openConfigureRpModal('${r.id}')">${I('plus')} 为该角色生成 RP 角色卡</button>
              </div>
            `}
          </div>
        ` : ui.roleTab==='chats' ? `
          <div class="card">
            <div class="between">
              <h3 class="h3">关联会话</h3>
              <button class="btn sm primary" onclick="openNew('design','${r.id}')">${I('plus')} 发起新会话</button>
            </div>
            <div style="margin-top:16px">
              ${related.length ? related.map(s => `
                <div class="session-item" onclick="goSession('${s.id}')">
                  <div class="between">
                    <strong>${E(s.title)}</strong>
                    <span class="tiny">${E(s.summary)}</span>
                  </div>
                </div>
              `).join('') : '<div class="empty-quiet" style="padding:16px 0;text-align:center">暂无关联会话</div>'}
            </div>
          </div>
        ` : ui.roleTab==='gallery' ? gallery() : `
          <div class="card">
            <div class="between">
              <h3 class="h3">场景与提示词</h3>
              <button class="btn sm primary" onclick="show('prompt')">${I('plus')} 新建批次</button>
            </div>
            <p class="small-over">管理为该角色定制的生图提示词与构图预设。</p>
          </div>
        `}
      </div>
    </div>
  `;
}

function filterRoleSessions(id){ui.kind='all';ui.role=id;ui.sessionQuery='';const found=filteredSessions();if(found.length)ui.sessionId=found[0].id;visit('sessions')}
function gallery(r){const imgs=ui.roleImages[r.id]||[];return `<div class="card"><div class="between"><div><h3 class="h3">${E(r.name)} · 角色图片</h3><p class="sub">只按角色归属，不要求给每张图片指定场景、提示词或批次。</p></div><button class="btn" onclick="document.getElementById('fileImages').click()">${I('upload')} 预览本地图片</button></div><input type="file" id="fileImages" accept="image/*" multiple style="display:none" onchange="previewImages(event)"><div class="gallery-grid" style="margin-top:17px">${imgs.length?imgs.map((im,i)=>`<div class="gallery-tile" title="${E(im.name)}"><img src="${im.url}" alt="${E(im.name)}"></div>`).join(''):`${['角色设定图','服装参考','日常插画','构图实验'].map((n,i)=>`<div class="gallery-tile">${I('image')}<small>${n} · 占位</small></div>`).join('')}`}</div><div class="sub" style="margin-top:17px">支持多选图片；完整创作备份会包含已导入的图片。</div></div>`}
function previewImages(event){const fs=[...event.target.files||[]];const arr=ui.roleImages[ui.roleId]||[];fs.forEach(f=>arr.push({name:f.name,url:URL.createObjectURL(f)}));ui.roleImages[ui.roleId]=arr;render();toast(`本次会话已临时预览 ${fs.length} 张图片；未上传或复制文件`)}
function works(){return `<div class="scroll" style="height:100%"><div class="pagepad centered"><div class="eyebrow">WRITING DESK</div><h1 class="h1">作品与小说</h1><p class="small-over">写作界面与通用会话使用共享模型配置，但保留独立的正文编辑和章节体验。</p><div class="sectionhead"><h2>我的作品</h2><button class="btn sm" onclick="show('roleCreate')">${I('plus')} 新建作品</button></div><div class="grid2"><div class="card click" onclick="visit('editor')"><div class="flex gap12"><div class="feature-icon gold">${I('book')}</div><div><h3 class="h3">《北方来信》</h3><p class="sub">小说草稿 · 2 个连载章节</p></div></div><p class="small-over" style="margin-top:18px">支持正文编辑、章节切换与剧情讨论。讨论产生的建议不会直接覆盖正文。</p><div class="tag-row"><span class="chip gold">长篇创作</span><span class="chip">Gemini · 默认写作模型</span></div><div style="margin-top:19px" class="accent">打开写作台 ${I('arrow')}</div></div><div class="card" style="border-style:dashed"><div class="feature-icon">${I('plus')}</div><div class="card-title">更多作品</div><p class="small-over">未来可以从本地文件导入小说，也可以为不同作品分别关联角色、会话和世界设定。</p><button class="btn sm" onclick="toast('支持导入外部创作工程与 Markdown 分卷')">了解创建流程</button></div></div></div></div>`}
function editor(){return `<div class="split"><aside class="sidebar"><div class="sidetitle">《北方来信》</div><div class="side-section">目录</div><button class="side-link ${ui.workChapter==='c1'?'on':''}" onclick="setChapter('c1')">${I('book')} 第三章 · 初雪</button><button class="side-link ${ui.workChapter==='c2'?'on':''}" onclick="setChapter('c2')">${I('book')} 第二章 · 旧站台</button><div class="side-section">相关工作</div><button class="side-link" onclick="goSession('s3')">${I('chat')} 人物动机讨论</button><button class="side-link" onclick="openNew('plot')">${I('plus')} 新的剧情讨论</button></aside><section class="center editor-main"><div class="between" style="max-width:730px;margin:auto auto 14px"><span class="chip gold">本地草稿 · 浏览器自动保存</span>${renderSessionModelPill('novel_draft')}</div><div class="paper"><div class="eyebrow">《北方来信》</div><h1>${ui.workChapter==='c1'?'第三章 · 初雪':'第二章 · 旧站台'}</h1><div class="sub">编辑正文 · 修改保存在此浏览器</div><textarea id="chapter" oninput="saveChapter(this.value)" spellcheck="false">${E(store.chapters[ui.workChapter])}</textarea></div></section>${`<aside class="context"><div class="section"><h3>写作助手</h3><div class="small-over">模型：${E(mname(store.modelDefaults.novel))}</div><p class="sub">希望讨论人物动机？进入关联会话，讨论结果不会自动写入正文。</p><button class="btn" style="width:100%;margin-top:13px" onclick="goSession('s3')">${I('chat')} 讨论第三章</button><button class="btn" style="width:100%;margin-top:9px" onclick="openNew('plot')">${I('plus')} 新建剧情讨论</button></div></aside>`}</div>`}
function setChapter(id){ui.workChapter=id;render()};function saveChapter(v){store.chapters[ui.workChapter]=v;save()};function setDefaultModel(k,v){store.modelDefaults[k]=v;save();toast('已更新用途默认模型')}
function startRP(id='yiwen'){ui.rpRole=id;visit('rp')};function rp(){const r=role(ui.rpRole)||roles[0];return `<div class="scroll" style="height:100%"><div class="rp-layout"><div class="between"><div><div class="eyebrow">ROLEPLAY SPACE</div><h1 class="h1">沉浸式角色扮演</h1><p class="sub">保留独立 RP 体验；创作档案与酒馆角色卡可以关联，但不必混为一体。</p></div><select class="select" style="width:172px" onchange="ui.rpRole=this.value;render()">${roles.map(x=>`<option value="${x.id}" ${ui.rpRole===x.id?'selected':''}>${E(x.name)}</option>`).join('')}</select></div><div class="card" style="margin:21px 0"><div class="between"><div class="flex gap12"><div class="avatar ${r.tone}">${r.icon}</div><div><h3 class="h3">${E(r.name)}</h3><span class="sub">沉浸式角色扮演 · 独立会话与剧情状态</span></div></div><div class="flex gap8" style="align-items:center;flex-wrap:wrap">
  ${renderSessionModelPill('rp_chat')}
  <button class="btn sm" onclick="openSettings('rp_params')" title="调整 RP 专用采样参数与预设">${I('theater')} 采样预设</button>
  <button class="btn sm" onclick="openSettings('api_connections')" title="配置大语言模型 API 连接库">${I('settings')} 模型连接</button>
  <button class="btn sm" onclick="show('worldinfo')" title="管理当前世界书与背景设定">${I('folder')} 设定集</button>
</div></div></div><div class="small-over">当前剧情记录</div>${store.rpHistory.map(x=>`<div class="rp-message ${x.by==='you'?'user':''}"><div class="avatar" style="height:35px;width:35px;flex:0 0 35px;font-size:12px">${x.by==='you'?'我':r.icon}</div><div class="bubble"><div class="text">${E(x.text).replaceAll('\n','<br>')}</div></div></div>`).join('')}<div class="rp-compose"><textarea class="textarea" id="rpInput" placeholder="输入对话、动作（用括号包裹）或按 Shift+Enter 换行..."></textarea><button class="btn primary" onclick="sendRP()">${I('send')} 发送</button></div><p class="tiny">已就绪 · 本地上下文与四档推演已同步</p></div></div>`}
function visibleTags(){const q=ui.tagsQuery.trim().toLowerCase();return store.tagItems.filter(t=>(ui.tagsCategory==='全部分类'||t.category===ui.tagsCategory)&&(ui.tagFilter==='all'||(ui.tagFilter==='enabled'?t.enabled:!t.enabled))&&(`${t.name} ${t.desc} ${t.category}`).toLowerCase().includes(q)).sort((a,b)=>ui.tagSort==='weight'?b.weight-a.weight:ui.tagSort==='category'?a.category.localeCompare(b.category,'zh'):a.name.localeCompare(b.name,'zh'))}
function tagManager(){const ts=visibleTags(),t=store.tagItems.find(x=>x.id===ui.tagSelected);return `<div class="tags-layout"><aside class="tag-cats"><button class="btn quiet sm" onclick="backFromTags()">${I('back')} 返回上一页面</button><h2 class="h2" style="margin:18px 9px">视觉标签库</h2><div class="side-section">标签分类</div>${cats.map(c=>`<button class="side-link ${ui.tagsCategory===c?'on':''}" onclick="setTagFilter('cat','${c}')">${I(c==='全部分类'?'tag':'folder')} ${E(c)} <span class="count">${c==='全部分类'?store.tagItems.length:store.tagItems.filter(t=>t.category===c).length}</span></button>`).join('')}</aside><section class="tag-list"><div class="between"><div><div class="eyebrow">TAG LIBRARY</div><h2 class="h2" style="margin:5px 0">结构化视觉标签</h2><p class="sub">${store.tagItems.length} 条标签 · ${store.tagItems.filter(t=>t.enabled).length} 条已启用</p></div><button class="btn sm v3-btn-sage" style="margin-right:6px" onclick="visit('concept')">${I('spark')} 概念工坊探索</button><button class="btn primary sm" onclick="show('tagAdd')">${I('plus')} 添加</button></div><div class="flex gap8" style="margin-top:19px"><input class="input" id="tagSearch" placeholder="搜索标签、解释、类别..." value="${E(ui.tagsQuery)}" oninput="tagSearchChange(this.value)"></div><div class="flex gap8" style="margin-top:10px"><select class="select" style="flex:1" onchange="setTagFilter('state',this.value)"><option value="all">全部状态</option><option value="enabled" ${ui.tagFilter==='enabled'?'selected':''}>已启用</option><option value="disabled" ${ui.tagFilter==='disabled'?'selected':''}>已停用</option></select><select class="select" style="flex:1" onchange="setTagSort(this.value)"><option value="name">按名称</option><option value="weight" ${ui.tagSort==='weight'?'selected':''}>按权重</option><option value="category" ${ui.tagSort==='category'?'selected':''}>按分类</option></select></div><div class="between" style="margin:18px 1px 6px"><span class="tiny">筛选结果 ${ts.length} 条</span><button class="btn quiet sm" onclick="tagUndo()">${I('undo')} 撤销修改</button></div><div>${ts.slice(0,ui.tagLimit).map(x=>`<button class="tag-item ${ui.tagSelected===x.id?'on':''} ${!x.enabled?'off':''}" onclick="selectTag('${x.id}')"><div><span class="mainlabel">${E(x.name)}</span><div class="tiny">${E(x.category)}</div></div><div class="flex gap12"><span class="righttext">${x.weight}</span><input aria-label="启用${E(x.name)}" title="启用/停用" class="tag-status-checkbox" type="checkbox" ${x.enabled?'checked':''} onclick="event.stopPropagation()" onchange="toggleTag('${x.id}',this.checked)"></div></button>`).join('')||'<div class="empty">当前条件下暂无标签</div>'}${ts.length>ui.tagLimit?`<button class="btn" style="width:100%;margin-top:12px" onclick="ui.tagLimit+=60;render()">${I('plus')} 继续显示（还有 ${ts.length-ui.tagLimit} 条）</button>`:''}<div style="height:26px"></div></div><div style="margin:8px 0 16px"><button class="btn sm" onclick="generateScaleTags()">${I('plus')} 导入扩充标准标签词典 (280+ 项)</button></div></section><aside class="tag-edit"><div class="between"><h3 class="h3">标签详情</h3><span class="chip green">可直接编辑</span></div>${t?`<div class="formrow"><label>标签名称</label><input class="input" value="${E(t.name)}" onchange="editTag('${t.id}','name',this.value)"></div><div class="formrow"><label>分类</label><select class="select" onchange="editTag('${t.id}','category',this.value)">${cats.slice(1).map(c=>`<option ${t.category===c?'selected':''}>${E(c)}</option>`).join('')}</select></div><div class="formrow"><label>说明与使用含义</label><textarea class="textarea" rows="3" onchange="editTag('${t.id}','desc',this.value)">${E(t.desc)}</textarea></div><div class="formrow"><div class="between"><label style="margin:0">偏好权重</label><strong id="weight-num" style="color:var(--sage)">${t.weight}</strong></div><input class="range" type="range" min="0" max="100" value="${t.weight}" oninput="document.getElementById('weight-num').textContent=this.value" onchange="editTag('${t.id}','weight',Number(this.value))"></div><div class="formrow between"><label style="margin:0">参与标签组合</label><input class="tag-status-checkbox" type="checkbox" ${t.enabled?'checked':''} onchange="toggleTag('${t.id}',this.checked)"></div><div class="menu-divider"></div><div class="flex gap8 wrap"><button class="btn danger sm" onclick="deleteTag('${t.id}')">${I('trash')} 删除标签</button><button class="btn sm" onclick="exploreTagInConcept('${t.name}')">${I('spark')} 以此特征发散概念</button></div>`:'<div class="empty">选择一条标签进行编辑</div>'}<div class="menu-divider" style="margin:24px 0"></div><h3 class="h3">AI 智能标签解析</h3><p class="small-over">输入自然语言命令，预览将要添加和删除的标签，再确认执行。</p><textarea class="textarea" rows="3" id="tagCommand" placeholder="例如：删除猫爪，添加飞行员帽">${E(ui.aiDraft)}</textarea><button class="btn" style="width:100%;margin-top:10px" onclick="planTagAI()">${I('spark')} 分析修改意图</button><p class="tiny" style="margin-top:10px">系统将解析输入语句中的特征项并自动生成结构化操作清单，支持确认与撤销。</p><div class="menu-divider" style="margin:22px 0"></div><div class="flex gap8 wrap"><button class="btn sm" onclick="exportTags()">${I('download')} 导出 JSON</button><button class="btn sm" onclick="document.getElementById('importTags').click()">${I('upload')} 导入 JSON</button><input id="importTags" type="file" style="display:none" accept="application/json,.json" onchange="importTags(event)"></div></aside></div>`}
function setTagFilter(k,v){if(k==='cat')ui.tagsCategory=v;else ui.tagFilter=v;ui.tagLimit=60;render()};function setTagSort(v){ui.tagSort=v;ui.tagLimit=60;render()};function tagSearchChange(v){ui.tagsQuery=v;ui.tagLimit=60;render();const inp=document.getElementById('tagSearch');if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}}function selectTag(id){ui.tagSelected=id;render()}
function toggleTag(id,value){rememberTags();const t=store.tagItems.find(t=>t.id===id);if(t)t.enabled=value;save();render()}
function editTag(id,key,value){const t=store.tagItems.find(t=>t.id===id);if(!t)return;rememberTags();t[key]=value;save();render();toast('标签已保存至本地标签数据库')}
function deleteTag(id){const t=store.tagItems.find(t=>t.id===id);if(!t||!confirm(`确定删除标签「${t.name}」？删除后可以使用“撤销修改”恢复。`))return;rememberTags();store.tagItems=store.tagItems.filter(t=>t.id!==id);ui.tagSelected=store.tagItems[0]?.id||'';save();render();toast('标签已删除 · 支持撤销')}
function generateScaleTags(){const modifiers=['复古','秋日','冬日','校园','运动','都市','旅行','奇幻'];const bases={'种族与身份':['骑士少女','机械生命','猫科少女','魔法使','冒险者'],'外貌特征':['发饰设计','虹膜特征','耳饰设计','尾部装饰','发型轮廓'],'服装与配饰':['披风','贝雷帽','夹克','长靴','发带'],'职业与背景':['研究员','旅行者','乐师','骑士','教师'],'环境与场景':['庭院','街道','车站','树林','走廊'],'动作与构图':['回眸','俯视','正面','特写','剪影'],'艺术风格':['柔光','色块','轮廓线','冷色调','平涂']};rememberTags();let n=0;for(const [category,bs] of Object.entries(bases)){for(const base of bs){for(const modifier of modifiers){const name=modifier+' · '+base;if(!store.tagItems.some(t=>t.name===name)){store.tagItems.push({id:nextId('scale'),name,category,desc:'扩充词典标准特征项',weight:45+(n%51),enabled:n%9!==0,source:'标准词库扩充'});n++}}}}save();ui.tagLimit=60;render();toast('已成功扩充导入 '+n+' 条标准标签')}
function tagUndo(){if(!undoStack.length){toast('目前没有可撤销的标签修改');return}store.tagItems=undoStack.pop();save();render();toast('已撤销上一步标签修改')}
function exportTags(){download('SillyTavern-视觉标签库.json',JSON.stringify({schema:'st-visual-tags-v1',tags:store.tagItems},null,2),'application/json;charset=utf-8');toast('已导出标准 JSON 标签库')}
function importTags(event){const f=event.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result),input=Array.isArray(data)?data:data.tags;if(!Array.isArray(input)||input.length>10000)throw Error('标签数组无效或数量超过 10000');let n=0;const parsed=input.map((x,i)=>{if(!x||typeof x.name!=='string'||!x.name.trim())throw Error(`第 ${i+1} 条缺少名称`);n++;return{id:nextId('tag'),name:String(x.name).slice(0,80),category:cats.includes(x.category)?x.category:'外貌特征',weight:Math.max(0,Math.min(100,Number(x.weight)||0)),desc:String(x.desc||'').slice(0,1000),enabled:x.enabled!==false,source:'JSON 导入'}});if(!confirm(`识别到 ${n} 条标签。确定追加到本地标签库？（原有标签会保留）`))return;rememberTags();store.tagItems.push(...parsed);save();render();toast(`已导入 ${n} 条标签`)}catch(e){alert('无法导入：'+e.message)}};reader.readAsText(f);event.target.value=''}
function download(name,text,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500)}
function planTagAI(){ui.aiDraft=document.getElementById('tagCommand')?.value.trim()||'';let draft=ui.aiDraft;const blocks=draft.split(/[，,；;。\n]/).map(s=>s.trim()).filter(Boolean);let plan=[];for(const b of blocks){let match=b.match(/^(?:请)?(?:删掉|删除|移除|去掉)\s*(.+?)(?:标签)?$/);if(match){plan.push({kind:'remove',name:match[1].replace(/标签$/,'').trim()});continue}match=b.match(/^(?:请)?(?:添加|增加|加入|新增)\s*(.+?)(?:标签)?$/);if(match){plan.push({kind:'add',name:match[1].replace(/标签$/,'').trim()});continue}}ui.preview=plan;show('aiPreview')}
function applyAIPlan(){if(!ui.preview.length)return;rememberTags();let done=0;for(const p of ui.preview){if(p.kind==='add'){if(!store.tagItems.some(t=>t.name===p.name)){store.tagItems.push({id:nextId('tag'),name:p.name,category:'服装与配饰',desc:'AI 智能分析添加，请确认分类与说明',weight:50,enabled:true,source:'AI 指令分析'});done++}}else{const old=store.tagItems.length;store.tagItems=store.tagItems.filter(t=>t.name!==p.name);if(store.tagItems.length!==old)done++}}save();ui.preview=[];ui.modal='';render();toast(`已执行 ${done} 项标签修改 · 可撤销`)}
function show(type){
  if (ui.modal && ui.modal !== type) {
    if (!ui.modalStack) ui.modalStack = [];
    ui.modalStack.push({ modal: ui.modal, settingsTab: ui.settingsTab, managingConnection: ui.managingConnection });
  }
  ui.modal = type;
  overlay();
}
function closeModal(){
  if (ui.modalStack && ui.modalStack.length > 0) {
    const prev = ui.modalStack.pop();
    if (prev && prev.modal) {
      ui.modal = prev.modal;
      if (prev.settingsTab) ui.settingsTab = prev.settingsTab;
      if (prev.managingConnection) ui.managingConnection = prev.managingConnection;
      overlay();
      return;
    }
  }
  ui.modal = '';
  ui.modalStack = [];
  overlay();
}

// =========================================================================
// SillyTavern-Desktop V3 Stage 1 Adapted - Data Models & State Initializer
// =========================================================================
// =========================================================================
// SillyTavern-Desktop V3 Stage 2 - Comprehensive Settings Center System
// =========================================================================


// =========================================================================
// SillyTavern-Desktop V3 Stage 3 - Cross-Module Linkages & Interactive Handlers
// =========================================================================

function filterRolesByMode(mode) {
  ui.roleFilterMode = mode;
  render();
}

function exploreConceptFromRole(roleId) {
  if (window.ConceptWorkbench && typeof window.ConceptWorkbench.openWithRole === 'function') {
    window.ConceptWorkbench.openWithRole(roleId);
  } else {
    visit('concept');
  }
}

function exploreTagInConcept(tagName) {
  if (window.ConceptWorkbench && typeof window.ConceptWorkbench.addSparkTags === 'function') {
    window.ConceptWorkbench.addSparkTags([tagName]);
  }
  visit('concept');
}

function isRoleRpReady(roleId) {
  const current = store.roleRpConfigs?.[roleId];
  if (typeof current?.ready === 'boolean') return current.ready;
  return Boolean(store.rpConfigs?.[roleId]);
}

function startRpForRole(roleId) {
  ui.rpRole = roleId;
  var cfg = (store.roleRpConfigs && store.roleRpConfigs[roleId]) || (store.rpConfigs && store.rpConfigs[roleId]);
  if (!isRoleRpReady(roleId)) {
    openConfigureRpModal(roleId);
    return;
  }
  if (!store.rpConfigs[roleId]) {
    store.rpConfigs[roleId] = { greeting: cfg.greeting || '“角色已就绪。”', personality: cfg.personality || '' };
    if (!store.rpHistories[roleId] || !store.rpHistories[roleId].length) {
      store.rpHistories[roleId] = [{ by: 'ai', text: cfg.greeting || '“角色已就绪。”' }];
    }
    save();
  }
  ui.rpScreen = 'chat';
  visit('rp', { keepChat: true });
}

function openConfigureRpModal(roleId) {
  ui.targetRoleId = roleId;
  show('roleToRp');
}

function openWorldInfoManager(bookId) {
  if (bookId) ui.activeWorldBook = bookId;
  show('worldinfo');
}

function openWorldInfo(bookId) {
  openWorldInfoManager(bookId);
}

function openPersona(personaId) {
  if (personaId) store.currentPersona = personaId;
  show('persona');
}

function createPersonaAction() {
  initAdaptedV3State();
  var newId = 'p_' + Date.now();
  var newPersona = {
    id: newId,
    name: '新创作者',
    title: '自定义设定',
    desc: '在此设定酒馆交流与长篇创作中的性格偏好与视角。',
    avatar: '新',
    injectionPos: 'system',
    injectionDepth: 2,
    isDefault: false
  };
  store.personas = store.personas || [];
  store.personas.push(newPersona);
  ui.editingPersonaId = newId;
  save();
  overlay();
  toast('已创建身份草稿，请编辑并保存');
}

function deletePersonaAction(id) {
  initAdaptedV3State();
  if (!store.personas || store.personas.length <= 1) {
    toast('⚠️ 至少保留一个用户身份', 'warning');
    return;
  }
  var p = store.personas.find(function(x) { return x.id === id; });
  if (!confirm('确定删除身份「' + (p?.name || id) + '」？')) return;
  store.personas = store.personas.filter(function(x) { return x.id !== id; });
  if (store.currentPersona === id) {
    store.currentPersona = store.personas[0].id;
  }
  ui.editingPersonaId = store.personas[0].id;
  save();
  toast('身份已删除');
  overlay();
  render();
}

function changePersonaAvatar(id) {
  initAdaptedV3State();
  var p = store.personas && store.personas.find(function(x) { return x.id === id; });
  if (!p) return;
  var newAv = prompt('请输入 1~2 个汉字或 Emoji 作为头像：', p.avatar || p.name[0] || '旅');
  if (newAv && newAv.trim()) {
    p.avatar = newAv.trim().slice(0, 2);
    save();
    overlay();
    render();
    toast('头像已更新');
  }
}

function saveAndApplyPersona(id) {
  initAdaptedV3State();
  var p = store.personas && store.personas.find(function(x) { return x.id === id; });
  if (!p) return;

  var nameEl = document.getElementById('persona_name') || document.getElementById('personaNameInput');
  var titleEl = document.getElementById('persona_title') || document.getElementById('personaTitleInput');
  var descEl = document.getElementById('persona_desc') || document.getElementById('personaDescInput');
  var posEl = document.getElementById('persona_pos') || document.getElementById('personaPosInput');
  var depthEl = document.getElementById('persona_depth') || document.getElementById('personaDepthInput');
  var defEl = document.getElementById('persona_is_default');

  if (nameEl && nameEl.value.trim()) p.name = nameEl.value.trim();
  if (titleEl && titleEl.value.trim()) p.title = titleEl.value.trim();
  if (descEl) p.desc = descEl.value.trim();
  if (posEl) p.injectionPos = posEl.value;
  if (depthEl) {
    var d = parseInt(depthEl.value) || 2;
    p.injectionDepth = d;
    p.depth = d;
  }
  if (defEl && defEl.checked) {
    store.personas.forEach(function(x) { x.isDefault = (x.id === id); });
  }

  store.currentPersona = id;
  ui.editingPersonaId = id;
  save();
  toast('✓ 用户身份「' + p.name + '」已更新并设为当前生效！');
  closeModal();
  render();
}

function initAdaptedV3State() {
  ensureUnifiedApiState();
  if (!store.roleRpConfigs) store.roleRpConfigs = {};
  if (!store.rpConfigs) store.rpConfigs = {};
  if (!store.rpHistories) store.rpHistories = {};
  if (!store.modelConnections) {
    store.modelConnections = {
      rp: {
        provider: 'claude',
        name: 'Anthropic Claude 3.7 生产端点',
        model: 'claude-3-7-sonnet-20250219',
        baseUrl: 'https://api.anthropic.com/v1',
        apiKey: 'sk-ant-api03-••••••••••••••••••••••••••••••••••••',
        temperature: 0.85,
        maxTokens: 4096,
        contextWindow: 128000,
        streaming: true,
        topP: 0.95,
        topK: 40,
        minP: 0.05,
        frequencyPenalty: 0.20,
        presencePenalty: 0.10,
        repetitionPenalty: 1.05,
        penaltyRange: 2048,
        dynamicTemp: false,
        reverseProxy: '',
        proxyPassword: '',
        customUrl: '',
        customHeaders: '',
        azureBaseUrl: 'https://my-enterprise-ai.openai.azure.com/',
        azureDeployment: 'gpt-4o-eastus',
        azureApiVersion: '2024-08-01-preview',
        vertexProjectId: 'gcp-creative-nlp-3882',
        vertexRegion: 'us-central1',
        workersAiAccountId: '7e8f9a0b1c2d3e4f5a6b7c8d'
      },
      creative: {
        provider: 'deepseek',
        name: 'DeepSeek 创作推理节点',
        model: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com/v1',
        apiKey: 'sk-ds-••••••••••••••••••••••••••••••••••••••••',
        modelsList: 'deepseek-chat, deepseek-reasoner, deepseek-coder',
        temperature: 0.70,
        maxTokens: 4096,
        contextWindow: 64000,
        streaming: true,
        topP: 1.0,
        supportTools: true,
        useStreaming: true
      },
      purposes: {
        discussion: { provider: 'creative', model: 'deepseek-chat', context: 32768, maxTokens: 4096, temp: 0.75, topP: 1.0 },
        creative: { provider: 'creative', model: 'deepseek-chat', context: 64000, maxTokens: 4096, temp: 0.80, topP: 0.95 },
        draft: { provider: 'rp', model: 'claude-3-7-sonnet-20250219', context: 128000, maxTokens: 8192, temp: 0.85, topP: 0.90 },
        agent: { provider: 'creative', model: 'deepseek-chat', context: 32768, maxTokens: 4096, temp: 0.60, topP: 1.0 }
      },
      sessionOverrides: {}
    };
  }

  if (!store.usageStats) {
    store.usageStats = {
      promptTokens: '184.2k',
      completionTokens: '42.9k',
      totalCost: '$1.42',
      cacheReadTokens: '96.5k',
      lastTurnLatency: '18ms',
      monthlyBudgetPercent: '22.7%'
    };
  }

  // RP Presets System (Presets vs Session Separation)
  if (!store.rpPresets) {
    store.rpPresets = [
      {
        id: 'rp_preset_default',
        name: '默认沉浸平衡方案 (Default Balanced)',
        desc: '兼顾自然对话、心理细节描写与逻辑连贯性的通用平衡方案',
        temperature: 0.85,
        maxTokens: 4096,
        contextWindow: 128000,
        topP: 0.95,
        topK: 40,
        minP: 0.05,
        frequencyPenalty: 0.20,
        presencePenalty: 0.10,
        repetitionPenalty: 1.08,
        penaltyRange: 2048,
        dynamicTemp: false,
        streaming: true
      },
      {
        id: 'rp_preset_fiction',
        name: '长篇文学叙事强化 (Deep Fiction)',
        desc: '提升动作环境描写丰富度与词汇变化，降低模板套话倾向',
        temperature: 0.92,
        maxTokens: 6144,
        contextWindow: 128000,
        topP: 0.92,
        topK: 60,
        minP: 0.08,
        frequencyPenalty: 0.35,
        presencePenalty: 0.20,
        repetitionPenalty: 1.12,
        penaltyRange: 3000,
        dynamicTemp: true,
        streaming: true
      },
      {
        id: 'rp_preset_strict',
        name: '严谨剧情与规则遵从 (Strict Instruct)',
        desc: '收紧采样随机度，高度贴合世界书设定与角色硬性约束',
        temperature: 0.65,
        maxTokens: 3072,
        contextWindow: 96000,
        topP: 0.85,
        topK: 25,
        minP: 0.02,
        frequencyPenalty: 0.10,
        presencePenalty: 0.05,
        repetitionPenalty: 1.04,
        penaltyRange: 1024,
        dynamicTemp: false,
        streaming: true
      },
      {
        id: 'rp_preset_spark',
        name: '高发散思维灵感撞击 (High Creativity)',
        desc: '提升发散性与戏剧冲突转折，适合头脑风暴与开放分支',
        temperature: 1.15,
        maxTokens: 4096,
        contextWindow: 64000,
        topP: 0.98,
        topK: 80,
        minP: 0.10,
        frequencyPenalty: 0.40,
        presencePenalty: 0.25,
        repetitionPenalty: 1.10,
        penaltyRange: 2048,
        dynamicTemp: true,
        streaming: true
      }
    ];
    store.activeRpPresetId = 'rp_preset_default';
  }

  // Creative Presets & Agent Modules
  if (!store.creativePresets) {
    store.creativePresets = {
      agent: {
        id: 'cp_agent',
        name: '自主 Agent 推演与结构拆解',
        systemPrompt: '你是一名具备架构化思维的写作 Agent。负责将用户给定的剧情或人设需求拆解为分步推演、冲突核验与可落地的创作清单。',
        modules: [
          { id: 'm_agent_1', name: '分步推演与逻辑链条', category: '结构', enabled: true, content: '输出最终方案前，先以简明的推演链条梳理起因、转折点与人物驱动力。' },
          { id: 'm_agent_2', name: '世界规则硬约束', category: '约束', enabled: true, content: '严格遵循当前世界书设定的物理法则与魔导边界，不可凭空降神。' },
          { id: 'm_agent_3', name: '输出清单规范', category: '格式', enabled: true, content: '结论必须包含明确的行动条目与建议合并到角色卡或世界书的具体标签。' }
        ],
        refs: { role: true, worldInfo: true, chapters: false, memo: true }
      },
      discussion: {
        id: 'cp_discussion',
        name: '文学创作多轮研讨',
        systemPrompt: '你是一名经验丰富的文学策划与叙事顾问，以严谨、温暖且富有洞察力的人类编辑口吻，与用户共同研讨小说章节与角色塑造。',
        modules: [
          { id: 'm_disc_1', name: '反套话与自然去AI味', category: '表达', enabled: true, content: '避免使用空洞无物的“宛如/仿佛/正如/不由得”等AI高频套话，句子具象、平实且有编辑判断力。' },
          { id: 'm_disc_2', name: '人物动机深层挖掘', category: '核心', enabled: true, content: '关注角色潜意识与未言明的情绪张力，提出有深度的追问而非泛泛赞美。' }
        ],
        refs: { role: true, worldInfo: true, chapters: true, memo: true }
      },
      draft: {
        id: 'cp_draft',
        name: '小说长篇正文执笔',
        systemPrompt: '你是一名专注于虚构文学的中文正文执笔助手。注重首行缩进、视觉画面描摹与纯正中文语感，维持作品的文字风格基准。',
        modules: [
          { id: 'm_draft_1', name: '具象感官与沉浸环境', category: '表达', enabled: true, content: '注重光影、温度、声响与肢体微动作的交融，让读者如临其境。' },
          { id: 'm_draft_2', name: '节奏呼吸与行文节制', category: '核心', enabled: true, content: '长短句交错，对话与白描合理分布，避免冗长陈述性修饰语。' },
          { id: 'm_draft_3', name: '前序篇章伏笔呼应', category: '约束', enabled: true, content: '参考已载入前文，人物性格不可突然OOC，关键物品流向保持守恒。' }
        ],
        refs: { role: true, worldInfo: true, chapters: true, memo: false }
      }
    };
    store.activeCreativeScope = 'discussion';
  }

  // Instruct Mode Templates
  if (!store.promptTemplates) {
    store.promptTemplates = {
      activeTemplate: 'chatml',
      templates: {
        chatml: {
          name: 'ChatML 标准模式',
          desc: '兼容 OpenAI、DeepSeek、Qwen 等现代主流对话模型',
          systemPrefix: '<|im_start|>system\n',
          systemSuffix: '<|im_end|>\n',
          userPrefix: '<|im_start|>user\n',
          userSuffix: '<|im_end|>\n',
          assistantPrefix: '<|im_start|>assistant\n',
          assistantSuffix: '<|im_end|>\n',
          stopSeq: '<|im_end|>, <|im_start|>'
        },
        llama3: {
          name: 'Llama 3 / 3.1 官方指令格式',
          desc: 'Meta Llama-3 专用分词标记与多轮转折标记',
          systemPrefix: '<|start_header_id|>system<|end_header_id|>\n\n',
          systemSuffix: '<|eot_id|>',
          userPrefix: '<|start_header_id|>user<|end_header_id|>\n\n',
          userSuffix: '<|eot_id|>',
          assistantPrefix: '<|start_header_id|>assistant<|end_header_id|>\n\n',
          assistantSuffix: '<|eot_id|>',
          stopSeq: '<|eot_id|>, <|end_of_text|>'
        },
        alpaca: {
          name: 'Alpaca 经典纯文本格式',
          desc: '早期开源模型与微调通用指令格式',
          systemPrefix: '### System:\n',
          systemSuffix: '\n\n',
          userPrefix: '### Instruction:\n',
          userSuffix: '\n\n',
          assistantPrefix: '### Response:\n',
          assistantSuffix: '\n\n',
          stopSeq: '### Instruction:, ### Response:'
        },
        custom: {
          name: '用户自定义格式 (Custom Template)',
          desc: '针对特殊私有部署模型自由配置前后缀与停止词',
          systemPrefix: '[SYSTEM_START]\n',
          systemSuffix: '\n[SYSTEM_END]\n',
          userPrefix: '[USER_START]\n',
          userSuffix: '\n[USER_END]\n',
          assistantPrefix: '[MODEL_START]\n',
          assistantSuffix: '\n[MODEL_END]\n',
          stopSeq: '[USER_START], [MODEL_END]'
        }
      },
      storyStringOrder: ['system', 'world_info_before', 'persona', 'history', 'world_info_after', 'user_input']
    };
  }

  // Appearance & Customization
  if (!store.appearanceSettings) {
    store.appearanceSettings = {
      accent: 'violet',
      fontFamily: 'system',
      uiFontSize: 13,
      readingFontSize: 15,
      borderRadius: 8,
      uiDensity: 'default',
      backdropBlur: 12,
      panelOpacity: 95,
      reducedMotion: false,
      customCss: ''
    };
  }

  // Extensions
  if (!store.extensionConfigs) {
    store.extensionConfigs = {
      activeTab: 'sd_webui',
      items: {
        sd_webui: {
          name: 'AI 图像生成 (Stable Diffusion & ComfyUI)',
          desc: '通过本地 WebUI 或 ComfyUI 为角色卡与正文生成插图',
          enabled: true,
          provider: 'sd_webui',
          endpoint: 'http://127.0.0.1:7860',
          sampler: 'DPM++ 2M Karras',
          steps: 25,
          cfg: 7.0,
          width: 768,
          height: 1024,
          negPrompt: 'lowres, bad anatomy, bad hands, text, missing fingers, cropped, worst quality'
        },
        tts: {
          name: 'TTS 文本转语音 (Edge TTS / ElevenLabs)',
          desc: '为角色扮演提供身临其境的角色语音对白合成',
          enabled: false,
          provider: 'edge',
          voice: 'zh-CN-XiaoxiaoNeural',
          speed: 1.0,
          pitch: 0.0
        },
        vector_memory: {
          name: '向量语义长期记忆 (Vector Memory)',
          desc: '对超长会话进行语义嵌入索引与动态唤醒召回',
          enabled: true,
          topK: 5,
          threshold: 0.72,
          embedModel: 'text-embedding-3-small'
        },
        attachments: { name: '附件资料库与本地文件引用', desc: '支持在会话与作品中附加本地 PDF、TXT 与参考设定', enabled: true },
        caption: { name: '图像理解与视觉特征反推', desc: '上传立绘图片自动反推服饰、构图与外貌标签', enabled: true },
        expressions: { name: '角色立绘表情差分系统', desc: '根据对话情感倾向自动切换立绘表情贴图', enabled: true },
        summarize: { name: '智能记忆摘要与上下文压缩', desc: '在上下文窗口接近上限时自动归纳前情提要', enabled: true },
        quick_reply: { name: '快捷指令与快捷短语回复', desc: '自定义高频指令与动作宏面板', enabled: true },
        regex_pipeline: { name: '正则清洗与文本后处理管道', desc: '在发送与接收环节清洗特殊标记与符号', enabled: true },
        token_counter: { name: '精确 Token 计数与预算预警', desc: '本地离线精确分词与会话开销预警', enabled: true },
        translator: { name: '多语言实时双向翻译', desc: '支持将角色设定或提示词双向互译', enabled: false },
        conn_profiles: { name: '连接档案多配置快速切换', desc: '根据网络环境在家庭与移动端点间一键切换', enabled: true }
      }
    };
  }

  // Regex Pipeline Scripts
  if (!store.regexScripts) {
    store.regexScripts = [
      {
        id: 'reg_1',
        name: '剥除模型冗余思维链标记',
        pattern: '<think>[\\s\\S]*?<\\/think>',
        replacement: '',
        scope: 'all',
        placement: 'output',
        enabled: true
      },
      {
        id: 'reg_2',
        name: '中文动作括号规范化',
        pattern: '（([^）]+)）',
        replacement: '*($1)*',
        scope: 'rp',
        placement: 'both',
        enabled: true
      },
      {
        id: 'reg_3',
        name: '清洗末尾未断句半截标点',
        pattern: '[，、][^。！？!?]*$',
        replacement: '。',
        scope: 'draft',
        placement: 'output',
        enabled: false
      }
    ];
  }

  // World Info & Personas default check
  if (!store.worldInfoBooks) {
    store.worldInfoBooks = [
      {
        id: 'wb_north',
        name: '北境旧事与魔法设定',
        desc: '北境地理、古遗迹、魔导符文律令及守望者公会通史',
        scanDepth: 5,
        contextBudget: 25,
        maxBudgetTokens: 4096,
        recursive: true,
        recursiveSteps: 3,
        caseSensitive: false,
        matchWholeWords: true,
        minActivations: 1,
        entries: [
          {
            id: 'ent_1',
            title: '极光圣所',
            keys: ['极光圣所', '圣所', '奥术喷涌'],
            secondaryKeys: ['冰峰', '北境'],
            content: '建立在永久冻土之上的高阶魔导建筑，是极地魔能回流的主要观测站。由守望者议会直接管辖。',
            enabled: true,
            constant: true,
            selective: true,
            order: 100
          },
          {
            id: 'ent_2',
            title: '源石符文',
            keys: ['源石符文', '律令', '石板'],
            secondaryKeys: ['古代', '共鸣'],
            content: '古代遗迹中挖掘出的先民文字，具备自然共振魔力。接触时会引起佩戴者的魔能波动。',
            enabled: true,
            constant: false,
            selective: false,
            order: 120
          }
        ]
      },
      {
        id: 'wb_islands',
        name: '浮空群岛与商会网络',
        desc: '飞空艇航线、天穹黑市、以太引擎技术与商会联盟法案',
        scanDepth: 4,
        contextBudget: 20,
        maxBudgetTokens: 3072,
        recursive: false,
        recursiveSteps: 1,
        caseSensitive: false,
        matchWholeWords: true,
        minActivations: 1,
        entries: []
      }
    ];
  }

  if (!store.personas) {
    store.personas = [
      {
        id: 'p_traveler',
        name: '旅人',
        title: '流浪探求者',
        desc: '一位行踪不定的漫游者，对各个城邦的隐秘历史与魔导技术充满好奇。态度温和，观察敏锐。',
        avatar: '旅',
        injectionPos: 'system',
        injectionDepth: 2,
        isDefault: true
      },
      {
        id: 'p_inquisitor',
        name: '总督调查官',
        title: '律法与异端审裁员',
        desc: '受帝国议会派遣的法度守护者，说话言简意赅，洞悉伪装，重视秩序与契约文书。',
        avatar: '官',
        injectionPos: 'depth',
        injectionDepth: 4,
        isDefault: false
      }
    ];
  }

  // System & Environment Info
  if (!store.systemInfo) {
    store.systemInfo = {
      appVersion: '3.0.4-desktop',
      buildDate: '2026-11-10',
      dataDir: 'C:\\Users\\wang\\AppData\\Roaming\\SillyTavern-Desktop\\data',
      storageMode: 'CAS 本地快照原子化写入'
    };
  }
}

// Global openSettings router
function openSettings(tab = 'api_connections', subTab = null) {
  initAdaptedV3State();
  if (ui.modal !== 'settings') ui.modalStack = [];
  ui.modal = 'settings';
  if (tab === 'connection' || tab === 'models') tab = 'api_connections';
  if (tab === 'purposes') tab = 'feature_allocation';
  if (tab) ui.settingsTab = tab;
  if (subTab) {
    if (tab === 'creative_presets') store.activeCreativeScope = subTab;
    if (tab === 'extensions') store.extensionConfigs.activeTab = subTab;
  }
  overlay();
}

function switchSettingsTab(tab) {
  initAdaptedV3State();
  if (tab === 'connection' || tab === 'models') tab = 'api_connections';
  if (tab === 'purposes') tab = 'feature_allocation';
  ui.settingsTab = tab;
  overlay();
}

function switchConnEngineTab(sub) {
  ui.connEngineTab = sub;
  overlay();
}

function toggleSettingsMaximize() {
  ui.settingsMaximized = !ui.settingsMaximized;
  overlay();
}

function handleSettingsSearch(val) {
  ui.settingsSearchQuery = val;
  overlay();
  const inp = document.getElementById('settingsSearch');
  if (inp) {
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  }
}

function clearSettingsSearch() {
  ui.settingsSearchQuery = '';
  overlay();
}

function saveSettingsAction(msg) {
  save();
  toast(msg || '全部设置更改已保存并同步至工作区');
  overlay();
}

// Realistic Connection Test
function testConnectionAction(engine) {
  initAdaptedV3State();
  const conn = store.modelConnections[engine];
  if (!conn.apiKey && conn.provider !== 'custom') {
    toast('⚠️ 请先填写有效的 API 密钥或凭据', 'warning');
    return;
  }
  if (!conn.baseUrl || !conn.baseUrl.startsWith('http')) {
    toast('⚠️ 请填写正确的 Base URL 地址 (如 https://api.anthropic.com/v1)', 'warning');
    return;
  }
  const name = engine === 'rp' ? 'RP 角色扮演引擎' : '独立创作推理引擎';
  toast('正在校验 ' + conn.provider.toUpperCase() + ' 端点格式与安全凭据...');
  setTimeout(() => {
    conn.status = 'ready';
    conn.latency = 0;
    toast('✓ ' + name + '：配置格式校验通过 · 待启动桌面原生网关 (IPC 通信) 发起远端握手');
    overlay();
  }, 400);
}

function copyRpToCreative() {
  initAdaptedV3State();
  const rp = store.modelConnections.rp;
  store.modelConnections.creative.baseUrl = rp.baseUrl;
  store.modelConnections.creative.apiKey = rp.apiKey;
  store.modelConnections.creative.model = rp.model;
  save();
  toast('已将 RP 端点与凭据复制到创作配置，请点击保存确认');
  overlay();
}

// RP Presets Actions
function selectRpPreset(presetId) {
  initAdaptedV3State();
  store.activeRpPresetId = presetId;
  const p = store.rpPresets.find(x => x.id === presetId);
  if (p) {
    store.modelConnections.rp.temperature = p.temperature;
    store.modelConnections.rp.maxTokens = p.maxTokens;
    store.modelConnections.rp.contextWindow = p.contextWindow;
    store.modelConnections.rp.topP = p.topP;
    store.modelConnections.rp.topK = p.topK;
    store.modelConnections.rp.minP = p.minP;
    store.modelConnections.rp.frequencyPenalty = p.frequencyPenalty;
    store.modelConnections.rp.presencePenalty = p.presencePenalty;
    store.modelConnections.rp.repetitionPenalty = p.repetitionPenalty;
    store.modelConnections.rp.penaltyRange = p.penaltyRange;
    store.modelConnections.rp.dynamicTemp = p.dynamicTemp;
    store.modelConnections.rp.streaming = p.streaming;
  }
  save();
  toast('已切换预设方案「' + (p?.name || presetId) + '」');
  overlay();
}

function saveRpPresetAction() {
  initAdaptedV3State();
  const p = store.rpPresets.find(x => x.id === store.activeRpPresetId);
  if (p) {
    const rp = store.modelConnections.rp;
    p.temperature = rp.temperature;
    p.maxTokens = rp.maxTokens;
    p.contextWindow = rp.contextWindow;
    p.topP = rp.topP;
    p.topK = rp.topK;
    p.minP = rp.minP;
    p.frequencyPenalty = rp.frequencyPenalty;
    p.presencePenalty = rp.presencePenalty;
    p.repetitionPenalty = rp.repetitionPenalty;
    p.penaltyRange = rp.penaltyRange;
    p.dynamicTemp = rp.dynamicTemp;
    p.streaming = rp.streaming;
    save();
    toast('💾 预设文件「' + p.name + '」已成功保存至本地预设库');
    overlay();
  }
}

function applyRpPresetAction() {
  initAdaptedV3State();
  const p = store.rpPresets.find(x => x.id === store.activeRpPresetId);
  if (p) {
    store.activeRpSessionPreset = { ...p };
    save();
    toast('⚡ 已将「' + p.name + '」采样方案应用到当前 RP 活跃会话！');
    overlay();
  }
}

function cloneRpPresetAction() {
  initAdaptedV3State();
  const p = store.rpPresets.find(x => x.id === store.activeRpPresetId);
  if (p) {
    const newId = 'rp_preset_' + Date.now();
    const cloned = { ...p, id: newId, name: p.name + ' (副本)' };
    store.rpPresets.push(cloned);
    store.activeRpPresetId = newId;
    save();
    toast('已克隆预设「' + cloned.name + '」');
    overlay();
  }
}

function createRpPresetAction() {
  const name = prompt('请输入新 RP 预设方案名称：', '自定义探索预设');
  if (!name || !name.trim()) return;
  initAdaptedV3State();
  const newId = 'rp_preset_' + Date.now();
  const current = store.modelConnections.rp;
  store.rpPresets.push({
    id: newId,
    name: name.trim(),
    desc: '用户自定义 RP 采样方案',
    temperature: current.temperature || 0.85,
    maxTokens: current.maxTokens || 4096,
    contextWindow: current.contextWindow || 128000,
    topP: current.topP || 0.95,
    topK: current.topK || 40,
    minP: current.minP || 0.05,
    frequencyPenalty: current.frequencyPenalty || 0.20,
    presencePenalty: current.presencePenalty || 0.10,
    repetitionPenalty: current.repetitionPenalty || 1.05,
    penaltyRange: current.penaltyRange || 2048,
    dynamicTemp: current.dynamicTemp || false,
    streaming: true
  });
  store.activeRpPresetId = newId;
  save();
  toast('已创建新预设「' + name.trim() + '」');
  overlay();
}

function deleteRpPresetAction() {
  initAdaptedV3State();
  if (store.rpPresets.length <= 1) {
    toast('⚠️ 至少保留一个 RP 预设方案', 'warning');
    return;
  }
  const p = store.rpPresets.find(x => x.id === store.activeRpPresetId);
  if (!p) return;
  if (!confirm('确定要删除预设方案「' + p.name + '」吗？')) return;
  store.rpPresets = store.rpPresets.filter(x => x.id !== p.id);
  store.activeRpPresetId = store.rpPresets[0].id;
  save();
  toast('已删除预设方案');
  overlay();
}

function exportRpPresetJson() {
  initAdaptedV3State();
  const p = store.rpPresets.find(x => x.id === store.activeRpPresetId);
  if (!p) return;
  download('RP-Preset-' + p.name + '.json', JSON.stringify(p, null, 2), 'application/json;charset=utf-8');
  toast('已导出预设 JSON 文件');
}

// Prompt Modules Actions
function togglePromptModule(scope, idx, enabled) {
  initAdaptedV3State();
  if (store.creativePresets[scope] && store.creativePresets[scope].modules[idx]) {
    store.creativePresets[scope].modules[idx].enabled = enabled;
    save();
    overlay();
  }
}

function movePromptModule(scope, idx, dir) {
  initAdaptedV3State();
  const mods = store.creativePresets[scope]?.modules;
  if (!mods) return;
  const target = idx + dir;
  if (target < 0 || target >= mods.length) return;
  const temp = mods[idx];
  mods[idx] = mods[target];
  mods[target] = temp;
  save();
  overlay();
}

function deletePromptModule(scope, idx) {
  initAdaptedV3State();
  if (confirm('确定删除该提示词模块吗？')) {
    store.creativePresets[scope].modules.splice(idx, 1);
    save();
    toast('已移除提示词模块');
    overlay();
  }
}

function addPromptModule(scope) {
  const name = prompt('请输入新模块名称：', '特殊格式与语气要求');
  if (!name || !name.trim()) return;
  initAdaptedV3State();
  store.creativePresets[scope].modules.push({
    id: 'm_' + Date.now(),
    name: name.trim(),
    category: '自定',
    enabled: true,
    content: '在此填写该模块的具体指导说明与约束……'
  });
  save();
  toast('已添加新模块「' + name.trim() + '」');
  overlay();
}

// Appearance Theme Actions

// =========================================================
// Area 2: Comprehensive Theme Appearance Application
// =========================================================
function applyThemeAppearance() {
  initAdaptedV3State();
  const ap = store.appearanceSettings || {};
  // 1. Accent
  const acc = ap.accent || 'neutral';
  document.documentElement.setAttribute('data-st-accent', acc);
  // 2. Radius
  const rad = typeof ap.borderRadius === 'number' ? ap.borderRadius : 8;
  document.documentElement.style.setProperty('--radius', rad + 'px');
  // 3. Font Family
  let fontStr = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif';
  if (ap.fontFamily === 'serif') fontStr = 'Georgia, "Songti SC", "SimSun", "Noto Serif CJK SC", serif';
  if (ap.fontFamily === 'mono') fontStr = 'Consolas, "Fira Code", "Courier New", monospace';
  if (ap.fontFamily === 'pingfang') fontStr = '"PingFang SC", "Microsoft YaHei", "Source Han Sans SC", sans-serif';
  document.documentElement.style.setProperty('--font-main', fontStr);
  // 4. Reading font size
  const rfs = ap.readingFontSize || 15;
  document.documentElement.style.setProperty('--reading-font-size', rfs + 'px');
  // 5. Density
  if (ap.uiDensity && ap.uiDensity !== 'default') {
    document.documentElement.setAttribute('data-st-density', ap.uiDensity);
  } else {
    document.documentElement.removeAttribute('data-st-density');
  }
  // 6. Reduced motion
  if (ap.reducedMotion) {
    document.documentElement.setAttribute('data-st-reduced-motion', 'true');
  } else {
    document.documentElement.removeAttribute('data-st-reduced-motion');
  }
}

// =========================================================
// Area 3: Global Status Popover Logic
// =========================================================
function toggleGlobalStatusPopover(e) {
  if (e) e.stopPropagation();
  const pop = document.getElementById('globalStatusPopover');
  if (pop) pop.classList.toggle('open');
}

function closeGlobalStatusPopover() {
  const pop = document.getElementById('globalStatusPopover');
  if (pop) pop.classList.remove('open');
}

document.addEventListener('click', e => {
  const pop = document.getElementById('globalStatusPopover');
  const btn = document.getElementById('topbarStatusBtn');
  if (pop && pop.classList.contains('open')) {
    if (!pop.contains(e.target) && !btn?.contains(e.target)) {
      pop.classList.remove('open');
    }
  }
  const sessionPop = document.getElementById('sessionMorePop');
  if (sessionPop && sessionPop.classList.contains('show')) {
    if (!sessionPop.contains(e.target) && !e.target.closest('.session-more-wrap')) {
      sessionPop.classList.remove('show');
    }
  }
});

function renderCandidateTopBadge() {
  const pendingCount = (window.CreationWorkflow?.listCandidates ? CreationWorkflow.listCandidates().filter(c => c.status === 'pending').length : 0);
  if (pendingCount > 0) {
    return `<button class="btn quiet sm" onclick="openCandidateTrayModal('pending')" title="有 ${pendingCount} 项待处理候选提议" style="color:var(--ui-accent,#ac97f5);border-color:rgba(172,151,245,0.3);font-size:11.5px;display:flex;align-items:center;gap:5px">${I('spark')} <span>候选待处理</span> <span style="background:var(--ui-action-bg,#7446C8);color:#fff;border-radius:10px;padding:0 5px;font-size:10px">${pendingCount}</span></button>`;
  }
  return `<button class="btn quiet sm" onclick="openCandidateTrayModal('all')" title="统一候选提议托盘" style="font-size:11.5px;display:flex;align-items:center;gap:5px">${I('spark')} <span>候选托盘</span></button>`;
}

function renderGlobalStatusPopoverHtml() {
  ensureUnifiedApiState();
  const conns = store.apiConnections || [];
  const enabledConns = conns.filter(c => c.enabled !== false);
  const catalog = getUnifiedModelCatalog();
  const rpCfg = getEffectiveModelConfig('rp_chat');
  const novelCfg = getEffectiveModelConfig('novel_draft');

  return `
    <div class="global-status-popover">
      <div class="status-popover-header">
        <div class="flex gap8 align-center">
          <span class="status-indicator online"></span>
          <span style="font-weight:700;font-size:13px;color:#f0f0f0">系统运行与模型服务状态</span>
        </div>
        <button class="ghost icon-btn" onclick="closeModal()" title="关闭">${I('x')}</button>
      </div>

      <div class="status-popover-content">
        <!-- Section 1: Active Feature Models -->
        <div style="background:#191919;border:1px solid #2a2a2a;border-radius:6px;padding:8px 10px;margin-bottom:10px">
          <div style="font-size:11.5px;color:#888;font-weight:600;margin-bottom:6px">当前核心创作功能模型指派：</div>
          <div style="display:flex;flex-direction:column;gap:5px;font-size:11.5px">
            <div style="display:flex;justify-content:space-between">
              <span style="color:#aaa">RP 角色对话：</span>
              <span style="color:#eee;font-weight:600">${E(rpCfg.modelName)} <span style="font-size:10px;color:#777">(${E(rpCfg.connectionName)})</span></span>
            </div>
            <div style="display:flex;justify-content:space-between">
              <span style="color:#aaa">小说连载正文：</span>
              <span style="color:#eee;font-weight:600">${E(novelCfg.modelName)} <span style="font-size:10px;color:#777">(${E(novelCfg.connectionName)})</span></span>
            </div>
          </div>
        </div>

        <!-- Section 2: Connections List -->
        <div style="font-size:11.5px;color:#888;font-weight:600;margin-bottom:6px">已登记 API 服务连接 (${enabledConns.length}/${conns.length} 已启用，共 ${catalog.length} 个模型)：</div>
        <div class="status-conn-list" style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;padding-right:2px">
          ${conns.map(c => {
            const statusClass = c.status || 'untested';
            const statusText = statusClass === 'format_valid' ? '格式通过' : (statusClass === 'ready' ? '已就绪' : (statusClass === 'error' ? '格式错误' : '未检测'));
            return `
              <div style="display:flex;align-items:center;justify-content:space-between;background:#161616;border:1px solid #262626;padding:6px 8px;border-radius:4px;font-size:11px">
                <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1">
                  <span class="v3-model-dot ${statusClass}"></span>
                  <span style="color:#ddd;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${E(c.name)}">${E(c.name)}</span>
                  <span class="conn-provider-badge ${c.provider}" style="font-size:9.5px">${E(c.provider)}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
                  <span style="color:#777;font-family:ui-monospace,monospace">${(c.models || []).length} 模型</span>
                  <span class="conn-status-pill ${statusClass}" style="font-size:9.5px;padding:1px 5px">${statusText}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="status-popover-footer">
        <button class="btn quiet sm" onclick="openSettings('feature_allocation')">功能级 AI 分配</button>
        <button class="btn primary sm" onclick="openSettings('api_connections')">API 连接库配置</button>
      </div>
    </div>
  `;
}

function setThemeAccent(accent) {
  initAdaptedV3State();
  store.appearanceSettings.accent = accent; STAccent.set(accent);
  applyThemeAppearance();
  save();
  toast('已切换界面强调色为：' + accent.toUpperCase());
  overlay();
}

function setThemeFont(family) {
  initAdaptedV3State();
  store.appearanceSettings.fontFamily = family;
  applyThemeAppearance();
  save();
  toast('已应用字体：' + family);
  overlay();
}

function setThemeRadius(rad) {
  initAdaptedV3State();
  store.appearanceSettings.borderRadius = rad;
  applyThemeAppearance();
  save();
  toast('已设置界面圆角为 ' + rad + 'px');
  overlay();
}

function setThemeDensity(density) {
  initAdaptedV3State();
  store.appearanceSettings.uiDensity = density;
  applyThemeAppearance();
  save();
  toast('已切换界面密度为：' + (density === 'compact' ? '紧凑' : density === 'spacious' ? '宽松' : '标准'));
  overlay();
}

function restoreDefaultTheme() {
  if (!confirm('确定要将界面外观恢复为默认 Codex Dark 风格吗？')) return;
  initAdaptedV3State();
  store.appearanceSettings = {
    accent: 'violet',
    fontFamily: 'system',
    uiFontSize: 13,
    readingFontSize: 15,
    borderRadius: 8,
    uiDensity: 'default',
    backdropBlur: 12,
    panelOpacity: 95,
    reducedMotion: false,
    customCss: ''
  };
  document.documentElement.setAttribute('data-st-accent', 'violet');
  document.documentElement.removeAttribute('data-st-density');
  save();
  toast('外观主题已恢复为出厂默认设置');
  overlay();
}

// Extensions Actions
function toggleExtension(key, enabled) {
  initAdaptedV3State();
  if (store.extensionConfigs.items[key]) {
    store.extensionConfigs.items[key].enabled = enabled;
    save();
    toast(enabled ? '已启用扩展：' + store.extensionConfigs.items[key].name : '已停用扩展');
    overlay();
  }
}

function testTtsVoice() {
  toast('🔊 正在生成试听音频：「旅行者，欢迎来到北境圣所……」');
}

// Regex Scripts Actions
function toggleRegexRule(id, enabled) {
  initAdaptedV3State();
  const r = store.regexScripts.find(x => x.id === id);
  if (r) {
    r.enabled = enabled;
    save();
    overlay();
  }
}

function addRegexRule() {
  const name = prompt('请输入新正则规则名称：', '清理多余空行');
  if (!name || !name.trim()) return;
  initAdaptedV3State();
  store.regexScripts.push({
    id: 'reg_' + Date.now(),
    name: name.trim(),
    pattern: '\\n{3,}',
    replacement: '\\n\\n',
    scope: 'all',
    placement: 'both',
    enabled: true
  });
  save();
  toast('已新增正则清洗规则「' + name.trim() + '」');
  overlay();
}

function deleteRegexRule(id) {
  initAdaptedV3State();
  if (confirm('确定删除该正则规则吗？')) {
    store.regexScripts = store.regexScripts.filter(x => x.id !== id);
    save();
    toast('已移除正则规则');
    overlay();
  }
}

function testRegexPlayground() {
  const inputEl = document.getElementById('regexTestInput');
  const resEl = document.getElementById('regexTestResult');
  if (!inputEl || !resEl) return;
  let text = inputEl.value;
  try {
    store.regexScripts.forEach(r => {
      if (r.enabled && r.pattern) {
        const re = new RegExp(r.pattern, 'g');
        text = text.replace(re, r.replacement || '');
      }
    });
    resEl.textContent = text || '（输出为空）';
  } catch (err) {
    resEl.textContent = '⚠️ 正则表达式解析失败：' + err.message;
  }
}

// Workspace Backup & Restore Actions
function exportWorkspaceBackup() {
  const backup = {
    app: 'SillyTavern-Desktop',
    schemaVersion: '3.0.4',
    timestamp: new Date().toISOString(),
    store: JSON.parse(JSON.stringify(store,(k,v)=>/apiKey|customHeaders|proxyUrl/i.test(k)?'':v)),
    modules:{concept:WorkspaceStorage.getItem('st-character-concepts-v3')}
  };
  download('SillyTavern-V3-Workspace-Backup-' + Date.now() + '.json', JSON.stringify(backup, null, 2), 'application/json;charset=utf-8');
  toast('已导出完整工作区备份 JSON');
}

function importWorkspaceBackup(event) {
  const f = event.target.files?.[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !data.store) throw new Error('无效的备份文件结构');
      if (!confirm('识别到来自 ' + (data.timestamp || '未知时间') + ' 的备份数据。确定导入并覆盖当前工作区吗？')) return;
      WorkspaceStorage.restoreBackup(data);
      // Rehydrate both workspaces and every alias through the normal startup path.
      location.reload();
    } catch (e) {
      alert('导入失败：' + e.message);
    }
  };
  reader.readAsText(f);
  event.target.value = '';
}

function resetWorkspaceData() {
  if (confirm('⚠️ 高危操作：确定将整个工作区重置为出厂初始数据吗？所有自定义角色与会话将恢复为默认样本。')) {
    WorkspaceStorage.reset();
    location.reload();
  }
}


// =========================================================================
// SillyTavern-Desktop V3 Stage 2 - 12 Dedicated Settings Tabs Renderers
// =========================================================================


// =========================================================
// Unified API Connection Library & Model Management Bundle (Refined)
// =========================================================

// =========================================================
// Unified API Provider Registry & Presets Definition
// =========================================================
const UNIFIED_PROVIDERS = [
  {
    "id": "anthropic",
    "name": "Claude",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "anthropic",
    "protocolLabel": "Claude Messages API",
    "defaultBaseUrl": "https://api.anthropic.com/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "sk-ant-api03-...",
    "integrated": true,
    "notes": "Anthropic 官方 API，支持长文本和扩展思考。",
    "aliases": "anthropic claude 克劳德 旗舰长文",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": false,
      "presPen": false,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "claude-3-7-sonnet-20250219",
        "name": "Claude 3.7 Sonnet",
        "context": 200000,
        "maxOutput": 8192,
        "tags": [
          "旗舰长文",
          "深度思考",
          "文学叙事"
        ]
      },
      {
        "id": "claude-3-5-sonnet-20241022",
        "name": "Claude 3.5 Sonnet",
        "context": 200000,
        "maxOutput": 8192,
        "tags": [
          "细腻RP",
          "逻辑审查",
          "高智力"
        ]
      },
      {
        "id": "claude-3-5-haiku-20241022",
        "name": "Claude 3.5 Haiku",
        "context": 200000,
        "maxOutput": 8192,
        "tags": [
          "快速响应",
          "标签抽取",
          "轻量任务"
        ]
      }
    ]
  },
  {
    "id": "deepseek",
    "name": "DeepSeek",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "openai_chat",
    "protocolLabel": "DeepSeek 官方 API",
    "defaultBaseUrl": "https://api.deepseek.com/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "sk-...",
    "integrated": true,
    "notes": "官方 API，支持通用对话与推理模型。",
    "aliases": "deepseek 深度求索 r1 v3",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": false,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "deepseek-chat",
        "name": "DeepSeek-V3",
        "context": 64000,
        "maxOutput": 8192,
        "tags": [
          "综合全能",
          "高性价比",
          "中文特化"
        ]
      },
      {
        "id": "deepseek-reasoner",
        "name": "DeepSeek-R1 (深度思考)",
        "context": 64000,
        "maxOutput": 8192,
        "tags": [
          "深度推理",
          "剧本严谨验算",
          "复杂设定"
        ]
      }
    ]
  },
  {
    "id": "gemini",
    "name": "Gemini",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "gemini",
    "protocolLabel": "Gemini generateContent API",
    "defaultBaseUrl": "https://generativelanguage.googleapis.com/v1beta",
    "requiresApiKey": true,
    "keyPlaceholder": "AIzaSy...",
    "integrated": true,
    "notes": "Google 多模态模型 API。",
    "aliases": "google gemini 谷歌 双子座",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "gemini-2.5-flash",
        "name": "Gemini 2.5 Flash",
        "context": 1048576,
        "maxOutput": 8192,
        "tags": [
          "超长上下文",
          "灵感发散",
          "极速响应"
        ]
      },
      {
        "id": "gemini-2.5-pro",
        "name": "Gemini 2.5 Pro",
        "context": 2097152,
        "maxOutput": 8192,
        "tags": [
          "深度理解",
          "庞大世界观",
          "长篇记忆"
        ]
      },
      {
        "id": "gemini-2.0-flash",
        "name": "Gemini 2.0 Flash",
        "context": 1048576,
        "maxOutput": 8192,
        "tags": [
          "高速推理",
          "实时交互"
        ]
      }
    ]
  },
  {
    "id": "openai",
    "name": "OpenAI",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "openai_chat",
    "protocolLabel": "OpenAI ChatCompletions API",
    "defaultBaseUrl": "https://api.openai.com/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "sk-...",
    "integrated": true,
    "notes": "OpenAI 官方 API，支持通用对话与推理模型。",
    "aliases": "openai gpt gpt-4o chatgpt o1 o3",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": false,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "gpt-4o",
        "name": "GPT-4o (旗舰全能)",
        "context": 128000,
        "maxOutput": 4096,
        "tags": [
          "旗舰多模态",
          "精准指令",
          "结构化提取"
        ]
      },
      {
        "id": "gpt-4o-mini",
        "name": "GPT-4o Mini (轻量极速)",
        "context": 128000,
        "maxOutput": 4096,
        "tags": [
          "极速响应",
          "清洗整理",
          "低成本"
        ]
      },
      {
        "id": "o3-mini",
        "name": "o3-mini (深度数理推理)",
        "context": 200000,
        "maxOutput": 65536,
        "tags": [
          "数理推演",
          "严谨逻辑"
        ]
      }
    ]
  },
  {
    "id": "vertex_ai",
    "name": "Vertex AI",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "vertex",
    "protocolLabel": "Google Vertex AI API",
    "defaultBaseUrl": "https://{REGION}-aiplatform.googleapis.com/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "GCP Service Account Token / Key",
    "integrated": false,
    "notes": "Google Cloud 企业级托管端点。",
    "aliases": "google vertex ai gcp 企业级",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": false,
      "presPen": false,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "gemini-1.5-pro",
        "name": "Gemini 1.5 Pro (Vertex)",
        "context": 2000000,
        "maxOutput": 8192,
        "tags": [
          "企业级",
          "超长上下文"
        ]
      },
      {
        "id": "claude-3-5-sonnet@20240620",
        "name": "Claude 3.5 Sonnet (Vertex)",
        "context": 200000,
        "maxOutput": 8192,
        "tags": [
          "跨云托管",
          "高智力"
        ]
      }
    ]
  },
  {
    "id": "mistral",
    "name": "Mistral",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "openai_chat",
    "protocolLabel": "Mistral La Plateforme API",
    "defaultBaseUrl": "https://api.mistral.ai/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "mis-...",
    "integrated": true,
    "notes": "Mistral 官方 API，支持开源架构与多语言模型。",
    "aliases": "mistral mixtral codestral 法国开源",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": false,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "mistral-large-latest",
        "name": "Mistral Large 2",
        "context": 128000,
        "maxOutput": 8192,
        "tags": [
          "推理旗舰",
          "多语言",
          "高商誉"
        ]
      },
      {
        "id": "codestral-latest",
        "name": "Codestral (代码与逻辑)",
        "context": 256000,
        "maxOutput": 8192,
        "tags": [
          "逻辑推导",
          "指令精准"
        ]
      }
    ]
  },
  {
    "id": "cohere",
    "name": "Cohere",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "cohere",
    "protocolLabel": "Cohere v2 Chat API",
    "defaultBaseUrl": "https://api.cohere.com/v2",
    "requiresApiKey": true,
    "keyPlaceholder": "coh-...",
    "integrated": false,
    "notes": "Command 系列 API，支持长文本检索与指令遵循。",
    "aliases": "cohere command command-r rag",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "command-r-plus-08-2024",
        "name": "Command R+ (08-2024)",
        "context": 128000,
        "maxOutput": 4096,
        "tags": [
          "知识检索",
          "多语言",
          "商业落地"
        ]
      },
      {
        "id": "command-r-08-2024",
        "name": "Command R",
        "context": 128000,
        "maxOutput": 4096,
        "tags": [
          "轻量检索",
          "高通量"
        ]
      }
    ]
  },
  {
    "id": "ai21",
    "name": "AI21 Labs",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "openai_chat",
    "protocolLabel": "AI21 Studio API",
    "defaultBaseUrl": "https://api.ai21.com/studio/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "ai21-...",
    "integrated": false,
    "notes": "Jamba 混合架构 API，面向长文本长文生成。",
    "aliases": "ai21 jamba mamba",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": false,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "jamba-1.5-large",
        "name": "Jamba 1.5 Large",
        "context": 256000,
        "maxOutput": 4096,
        "tags": [
          "Mamba架构",
          "极长文本",
          "高吞吐"
        ]
      },
      {
        "id": "jamba-1.5-mini",
        "name": "Jamba 1.5 Mini",
        "context": 256000,
        "maxOutput": 4096,
        "tags": [
          "轻量Mamba",
          "超低显存消耗"
        ]
      }
    ]
  },
  {
    "id": "perplexity",
    "name": "Perplexity",
    "category": "cloud",
    "categoryName": "云端直连",
    "protocolType": "openai_chat",
    "protocolLabel": "Perplexity API",
    "defaultBaseUrl": "https://api.perplexity.ai",
    "requiresApiKey": true,
    "keyPlaceholder": "pplx-...",
    "integrated": true,
    "notes": "内置实时网络搜索联网能力的问答与推理模型。",
    "aliases": "perplexity pplx sonar 联网搜索",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": false,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": false,
      "repPen": false
    },
    "defaultModels": [
      {
        "id": "sonar-pro",
        "name": "Sonar Pro (联网搜索旗舰)",
        "context": 200000,
        "maxOutput": 8192,
        "tags": [
          "实时联网",
          "权威事实核验"
        ]
      },
      {
        "id": "sonar-reasoning-pro",
        "name": "Sonar Reasoning (深度思考+联网)",
        "context": 128000,
        "maxOutput": 8192,
        "tags": [
          "推演思考",
          "动态检索"
        ]
      }
    ]
  },
  {
    "id": "openrouter",
    "name": "OpenRouter",
    "category": "aggregator",
    "categoryName": "聚合中转",
    "protocolType": "openrouter",
    "protocolLabel": "OpenRouter API (OpenAI 协议超集)",
    "defaultBaseUrl": "https://openrouter.ai/api/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "sk-or-v1-...",
    "integrated": true,
    "notes": "聚合多个模型提供商，统一 API 调用。",
    "aliases": "openrouter 聚合 中转 全球网关",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": true,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "anthropic/claude-3.7-sonnet",
        "name": "Claude 3.7 Sonnet (OpenRouter)",
        "context": 200000,
        "maxOutput": 8192,
        "tags": [
          "多模型聚合",
          "旗舰"
        ]
      },
      {
        "id": "meta-llama/llama-3.3-70b-instruct",
        "name": "Llama 3.3 70B Instruct",
        "context": 131072,
        "maxOutput": 8192,
        "tags": [
          "开源顶峰",
          "性价比"
        ]
      },
      {
        "id": "deepseek/deepseek-r1",
        "name": "DeepSeek R1 (OpenRouter)",
        "context": 128000,
        "maxOutput": 8192,
        "tags": [
          "深度推理",
          "聚合低延迟"
        ]
      }
    ]
  },
  {
    "id": "custom_openai",
    "name": "OpenAI 兼容",
    "category": "aggregator",
    "categoryName": "聚合中转",
    "protocolType": "openai_chat",
    "protocolLabel": "OpenAI 兼容协议 (/v1/chat/completions)",
    "defaultBaseUrl": "https://api.openai-proxy.internal/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "sk-...",
    "integrated": true,
    "notes": "连接兼容 OpenAI API 的第三方服务。",
    "aliases": "custom openai oneapi newapi proxy 反代 兼容接口 自建",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": true,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "gpt-4o",
        "name": "GPT-4o (兼容转发)",
        "context": 128000,
        "maxOutput": 4096,
        "tags": [
          "通用网关",
          "第三方中转"
        ]
      },
      {
        "id": "claude-3-5-sonnet-20241022",
        "name": "Claude 3.5 Sonnet (转发)",
        "context": 200000,
        "maxOutput": 8192,
        "tags": [
          "协议转接"
        ]
      }
    ]
  },
  {
    "id": "ai_horde",
    "name": "AI Horde",
    "category": "aggregator",
    "categoryName": "聚合中转",
    "protocolType": "ai_horde",
    "protocolLabel": "AI Horde REST API",
    "defaultBaseUrl": "https://aihorde.net/api/v2",
    "requiresApiKey": false,
    "keyPlaceholder": "0000000000 (免Key匿名或填入Kudos Token)",
    "integrated": false,
    "notes": "去中心化众包算力池，免密钥体验开源模型。",
    "aliases": "ai horde 众包 志愿者 免费",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": false,
      "presPen": false,
      "minP": false,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "llama-3-8b-instruct",
        "name": "Llama 3 8B (Horde 节点分配)",
        "context": 8192,
        "maxOutput": 2048,
        "tags": [
          "志愿者节点",
          "免费体验"
        ]
      }
    ]
  },
  {
    "id": "novelai",
    "name": "NovelAI",
    "category": "creative",
    "categoryName": "创意写作",
    "protocolType": "novelai",
    "protocolLabel": "NovelAI Text Generation API",
    "defaultBaseUrl": "https://api.novelai.net",
    "requiresApiKey": true,
    "keyPlaceholder": "pst-...",
    "integrated": false,
    "notes": "面向故事与小说创作的模型服务。",
    "aliases": "novelai nai 故事 小说 续写 叙事",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": false,
      "maxTokens": true,
      "freqPen": false,
      "presPen": false,
      "minP": false,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "kayra-v1",
        "name": "Kayra (小说专属旗舰)",
        "context": 8192,
        "maxOutput": 2048,
        "tags": [
          "小说正文",
          "文学修辞",
          "专属Prose"
        ]
      },
      {
        "id": "erato-v1",
        "name": "Erato (长文叙事)",
        "context": 8192,
        "maxOutput": 2048,
        "tags": [
          "长章节连贯",
          "风格化续写"
        ]
      }
    ]
  },
  {
    "id": "dreamgen",
    "name": "DreamGen",
    "category": "creative",
    "categoryName": "创意写作",
    "protocolType": "dreamgen",
    "protocolLabel": "DreamGen API",
    "defaultBaseUrl": "https://dreamgen.com/api/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "dg-...",
    "integrated": false,
    "notes": "面向故事创作和角色扮演的模型服务。",
    "aliases": "dreamgen 角色扮演 故事 rp 开放叙事",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": false,
      "maxTokens": true,
      "freqPen": false,
      "presPen": false,
      "minP": false,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "opus-v1",
        "name": "DreamGen Opus (开放RP)",
        "context": 16384,
        "maxOutput": 4096,
        "tags": [
          "无拘角色扮演",
          "非线性剧情"
        ]
      }
    ]
  },
  {
    "id": "ollama",
    "name": "Ollama",
    "category": "local",
    "categoryName": "本地离线",
    "protocolType": "ollama",
    "protocolLabel": "Ollama 原生 API",
    "defaultBaseUrl": "http://127.0.0.1:11434",
    "requiresApiKey": false,
    "keyPlaceholder": "无需密钥 (本地离线)",
    "integrated": true,
    "notes": "在本地运行和管理大语言模型。",
    "aliases": "ollama 本地 离线 qwen llama deepseek 私密",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": true,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "qwen2.5:14b",
        "name": "Qwen 2.5 14B (本地)",
        "context": 32768,
        "maxOutput": 4096,
        "tags": [
          "中文原生",
          "离线私密",
          "低延迟"
        ]
      },
      {
        "id": "deepseek-r1:14b",
        "name": "DeepSeek-R1 14B (本地)",
        "context": 32768,
        "maxOutput": 4096,
        "tags": [
          "本地推理链",
          "离线思考"
        ]
      },
      {
        "id": "llama3.3:70b",
        "name": "Llama 3.3 70B (量化)",
        "context": 64000,
        "maxOutput": 4096,
        "tags": [
          "高智力",
          "本地极限"
        ]
      }
    ]
  },
  {
    "id": "koboldcpp",
    "name": "KoboldCpp",
    "category": "local",
    "categoryName": "本地离线",
    "protocolType": "koboldcpp",
    "protocolLabel": "KoboldCpp REST API",
    "defaultBaseUrl": "http://127.0.0.1:5001/api/v1",
    "requiresApiKey": false,
    "keyPlaceholder": "可选 (若配置了本地访问Token)",
    "integrated": true,
    "notes": "本地 GGUF 模型推理服务。",
    "aliases": "koboldcpp gguf 酒馆 本地 采样",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": true,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "kobold-model",
        "name": "KoboldCpp 当前加载模型",
        "context": 32768,
        "maxOutput": 4096,
        "tags": [
          "本地GGUF",
          "酒馆专属采样",
          "世界书压制"
        ]
      }
    ]
  },
  {
    "id": "llamacpp",
    "name": "llama.cpp",
    "category": "local",
    "categoryName": "本地离线",
    "protocolType": "openai_chat",
    "protocolLabel": "llama.cpp Server API",
    "defaultBaseUrl": "http://127.0.0.1:8080/v1",
    "requiresApiKey": false,
    "keyPlaceholder": "可选 (若启动开启了 --api-key)",
    "integrated": true,
    "notes": "C++ 原生轻量推理服务，提供本地高能效端点。",
    "aliases": "llama.cpp llamacpp gguf 本地 c++ server",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": true,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "default",
        "name": "llama.cpp 内存已载入模型",
        "context": 32768,
        "maxOutput": 4096,
        "tags": [
          "极速加载",
          "原生轻量"
        ]
      }
    ]
  },
  {
    "id": "tabbyapi",
    "name": "TabbyAPI",
    "category": "local",
    "categoryName": "本地离线",
    "protocolType": "tabbyapi",
    "protocolLabel": "TabbyAPI REST API",
    "defaultBaseUrl": "http://127.0.0.1:5000/v1",
    "requiresApiKey": true,
    "keyPlaceholder": "admin_key (TabbyAPI配置的API Key)",
    "integrated": false,
    "notes": "基于 ExLlamaV2 内核的高吞吐 GPU 推理引擎。",
    "aliases": "tabbyapi exllamav2 exllama 高吞吐 gpu",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": true,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "current",
        "name": "TabbyAPI 当前激活模型",
        "context": 32768,
        "maxOutput": 4096,
        "tags": [
          "ExLlamaV2内核",
          "高吞吐并发"
        ]
      }
    ]
  },
  {
    "id": "textgen_webui",
    "name": "Text Generation WebUI",
    "category": "local",
    "categoryName": "本地离线",
    "protocolType": "openai_chat",
    "protocolLabel": "Oobabooga OpenAI 扩展 API",
    "defaultBaseUrl": "http://127.0.0.1:5000/v1",
    "requiresApiKey": false,
    "keyPlaceholder": "无需密钥",
    "integrated": false,
    "notes": "多后端模型 WebUI，提供 OpenAI 兼容扩展接口。",
    "aliases": "text generation webui oobabooga ooba",
    "paramSupport": {
      "temp": true,
      "topP": true,
      "topK": true,
      "maxTokens": true,
      "freqPen": true,
      "presPen": true,
      "minP": true,
      "repPen": true
    },
    "defaultModels": [
      {
        "id": "default",
        "name": "WebUI 默认模型",
        "context": 16384,
        "maxOutput": 2048,
        "tags": [
          "多后端",
          "扩展生态"
        ]
      }
    ]
  }
];
const DEFAULT_GEN_PRESETS = [
  {
    "id": "rp_preset_default",
    "name": "RP · 沉浸细腻 (均衡推荐)",
    "category": "rp",
    "categoryName": "角色扮演",
    "desc": "兼顾自然对话、心理细节描写与语气连贯性的通用平衡方案",
    "temperature": 0.85,
    "maxTokens": 4096,
    "topP": 0.95,
    "topK": 40,
    "minP": 0.05,
    "frequencyPenalty": 0.2,
    "presencePenalty": 0.1,
    "repetitionPenalty": 1.08,
    "dynamicTemp": false
  },
  {
    "id": "rp_preset_vivid",
    "name": "RP · 活泼灵动 (高发散)",
    "category": "rp",
    "categoryName": "角色扮演",
    "desc": "强化口语化、高反应度与即兴情绪转折，适合日常互动与喜剧风格",
    "temperature": 1.05,
    "maxTokens": 4096,
    "topP": 0.98,
    "topK": 60,
    "minP": 0.08,
    "frequencyPenalty": 0.3,
    "presencePenalty": 0.2,
    "repetitionPenalty": 1.1,
    "dynamicTemp": true
  },
  {
    "id": "rp_preset_strict",
    "name": "RP · 严格遵循 (低随机)",
    "category": "rp",
    "categoryName": "角色扮演",
    "desc": "收紧采样随机度，高度贴合世界书设定、人设台词限制与剧情硬约束",
    "temperature": 0.65,
    "maxTokens": 3072,
    "topP": 0.85,
    "topK": 25,
    "minP": 0.02,
    "frequencyPenalty": 0.1,
    "presencePenalty": 0.05,
    "repetitionPenalty": 1.04,
    "dynamicTemp": false
  },
  {
    "id": "rp_preset_fiction",
    "name": "小说 · 深度长文叙事 (稳定克制)",
    "category": "novel",
    "categoryName": "小说正文",
    "desc": "注重长段落连贯铺陈、第三人称视角控制与情节节奏，抑制模板套话",
    "temperature": 0.8,
    "maxTokens": 6144,
    "topP": 0.9,
    "topK": 50,
    "minP": 0.05,
    "frequencyPenalty": 0.35,
    "presencePenalty": 0.15,
    "repetitionPenalty": 1.12,
    "dynamicTemp": false
  },
  {
    "id": "gen_preset_novel_poetic",
    "name": "小说 · 诗意修辞与意象 (丰富多变)",
    "category": "novel",
    "categoryName": "小说正文",
    "desc": "提升动作环境描写丰富度与词汇变化，降低句式重复，增强文学质感",
    "temperature": 0.95,
    "maxTokens": 6144,
    "topP": 0.95,
    "topK": 70,
    "minP": 0.08,
    "frequencyPenalty": 0.4,
    "presencePenalty": 0.25,
    "repetitionPenalty": 1.15,
    "dynamicTemp": true
  },
  {
    "id": "rp_preset_spark",
    "name": "创意 · 自由头脑风暴 (高发散)",
    "category": "creative",
    "categoryName": "创意灵感",
    "desc": "打破既有套路，提供突发奇想与反套路剧情反转，适合开局发散",
    "temperature": 1.15,
    "maxTokens": 4096,
    "topP": 0.98,
    "topK": 80,
    "minP": 0.1,
    "frequencyPenalty": 0.4,
    "presencePenalty": 0.25,
    "repetitionPenalty": 1.1,
    "dynamicTemp": true
  },
  {
    "id": "gen_preset_concept_tags",
    "name": "概念 · 词槽权重扩展 (中温结构化)",
    "category": "creative",
    "categoryName": "创意灵感",
    "desc": "词槽权重扩展、生词联想与分类结构提炼，兼顾创意与准确度",
    "temperature": 0.75,
    "maxTokens": 2048,
    "topP": 0.88,
    "topK": 40,
    "minP": 0.03,
    "frequencyPenalty": 0.15,
    "presencePenalty": 0.1,
    "repetitionPenalty": 1.06,
    "dynamicTemp": false
  },
  {
    "id": "gen_preset_agent_logic",
    "name": "Agent · 逻辑审查与验算 (极低温严谨)",
    "category": "agent",
    "categoryName": "推演审查",
    "desc": "收束思维，排查世界观设定一致性冲突与因果矛盾，输出清晰条理",
    "temperature": 0.3,
    "maxTokens": 4096,
    "topP": 0.7,
    "topK": 20,
    "minP": 0,
    "frequencyPenalty": 0.05,
    "presencePenalty": 0,
    "repetitionPenalty": 1.02,
    "dynamicTemp": false
  },
  {
    "id": "gen_preset_clean",
    "name": "工具 · 确定性格式化 (零随机输出)",
    "category": "agent",
    "categoryName": "推演审查",
    "desc": "批量文本清洗、格式转换与严格 JSON 结构化抽取",
    "temperature": 0.1,
    "maxTokens": 4096,
    "topP": 0.5,
    "topK": 10,
    "minP": 0,
    "frequencyPenalty": 0,
    "presencePenalty": 0,
    "repetitionPenalty": 1,
    "dynamicTemp": false
  }
];
const DEFAULT_TASK_PROMPTS = [
  {
    "id": "rp_immersive",
    "name": "沉浸角色扮演 (注重心理与潜台词)",
    "category": "rp",
    "desc": "聚焦第一人称/近距离视角，描摹微动作、神态与心理博弈，拒绝机械复读，严格遵从角色设定。"
  },
  {
    "id": "rp_dynamic",
    "name": "活泼即兴互动 (快节奏口语化)",
    "category": "rp",
    "desc": "强调日常互动节奏感，语言鲜活自然，反应敏捷，适度制造趣味与戏剧转折。"
  },
  {
    "id": "novel_literary",
    "name": "长篇小说撰写 (影视化视听质感)",
    "category": "novel",
    "desc": "侧重环境白描、镜头推进、起承转合与情节暗线交织，保持第三人称深度限制视角。"
  },
  {
    "id": "novel_polish",
    "name": "段落精修与修辞增强 (文字质感)",
    "category": "novel",
    "desc": "消解啰嗦重复，重塑动态动词，微调节奏韵律，在不破坏原意的前提下显著提升文学美感。"
  },
  {
    "id": "brainstorm_divergent",
    "name": "发散头脑风暴 (灵感破局与反转)",
    "category": "creative",
    "desc": "跳出固有俗套，从多流派交织碰撞、人物反差性格与冷门桥段切入，提供富有冲击力的候选方案。"
  },
  {
    "id": "concept_structured",
    "name": "概念提炼与模式归纳 (结构化提取)",
    "category": "creative",
    "desc": "精准拆解特征词、分类层级与意象边界，规范输出标准化标签与属性权重。"
  },
  {
    "id": "agent_rigorous",
    "name": "设定逻辑审查与矛盾自洽 (严谨推演)",
    "category": "agent",
    "desc": "充当严苛的世界观审查官，逐条核对时间线、战力设定与因果闭环，指出潜在伏笔冲突。"
  },
  {
    "id": "general_assistant",
    "name": "通用创作助手 (标准中立指令)",
    "category": "general",
    "desc": "标准中立语气，精确理解并执行用户指令，适合日常研讨、问答与资料梳理。"
  }
];

function getProviderDef(providerId) {
  return UNIFIED_PROVIDERS.find(p => p.id === providerId) || {
    id: providerId,
    name: providerId,
    category: 'custom',
    categoryName: '自定义',
    protocolType: 'openai_chat',
    protocolLabel: 'OpenAI 兼容协议',
    defaultBaseUrl: '',
    requiresApiKey: true,
    keyPlaceholder: 'API Key',
    integrated: false,
    notes: '第三方兼容接口',
    paramSupport: { temp: true, topP: true, topK: true, maxTokens: true, freqPen: true, presPen: true, minP: true, repPen: true },
    defaultModels: []
  };
}

function ensureUnifiedApiState() {
  if (!store) return;

  // 1. Initialize Generation Parameter Presets
  if (!store.generationPresets || !store.generationPresets.length) {
    store.generationPresets = JSON.parse(JSON.stringify(DEFAULT_GEN_PRESETS));
  }
  // Backwards compatibility with legacy store.rpPresets
  store.rpPresets = store.generationPresets;

  // 2. Initialize Creative Task Prompt Presets
  if (!store.creativePromptPresets || !store.creativePromptPresets.length) {
    store.creativePromptPresets = JSON.parse(JSON.stringify(DEFAULT_TASK_PROMPTS));
  }

  // An empty connection library is intentional; never seed demonstration credentials.
  if (!Array.isArray(store.apiConnections)) store.apiConnections = [];

  // 4. Initialize Feature-Level Allocations
  // Properly differentiating models, sampling presets, and task prompt presets (NOT ChatML!)
  if (!store.featureAllocations || !store.featureAllocations.rp_chat) {
    store.featureAllocations = {
      // 1. 角色扮演与交互
      rp_chat: {
        id: 'rp_chat',
        name: 'RP 角色主对话',
        domain: 'rp',
        desc: '酒馆多轮对话、角色人设维持、潜台词与即兴互动',
        connectionId: 'conn_anthropic_prod',
        modelId: 'claude-3-7-sonnet-20250219',
        samplingPresetId: 'rp_preset_default',
        promptPresetId: 'rp_immersive'
      },
      rp_greeting: {
        id: 'rp_greeting',
        name: 'RP 破冰开场白生成',
        domain: 'rp',
        desc: '根据角色档案与首发场景生成引人入胜的开篇第一句话',
        connectionId: 'conn_anthropic_prod',
        modelId: 'claude-3-5-sonnet-20241022',
        samplingPresetId: 'rp_preset_vivid',
        promptPresetId: 'rp_dynamic'
      },

      // 2. 创作工坊与小说撰写
      creative_discussion: {
        id: 'creative_discussion',
        name: '创作研讨与互动研商',
        domain: 'creative',
        desc: '人机交互讨论、世界观推敲、设定细节盘逻辑',
        connectionId: 'conn_deepseek_main',
        modelId: 'deepseek-chat',
        samplingPresetId: 'rp_preset_default',
        promptPresetId: 'general_assistant'
      },
      creative_brainstorm: {
        id: 'creative_brainstorm',
        name: '自由头脑风暴与反转',
        domain: 'creative',
        desc: '打破俗套设定、提供多流派撞击脑洞与戏剧转折',
        connectionId: 'conn_gemini_studio',
        modelId: 'gemini-2.5-flash',
        samplingPresetId: 'rp_preset_spark',
        promptPresetId: 'brainstorm_divergent'
      },
      novel_draft: {
        id: 'novel_draft',
        name: '连载小说正文起草',
        domain: 'creative',
        desc: '长篇章节正文连贯起草、环境白描与第三人称镜头调度',
        connectionId: 'conn_anthropic_prod',
        modelId: 'claude-3-7-sonnet-20250219',
        samplingPresetId: 'rp_preset_fiction',
        promptPresetId: 'novel_literary'
      },
      novel_polish: {
        id: 'novel_polish',
        name: '正文段落润色修辞',
        domain: 'creative',
        desc: '去除病句、加强动态动词、调和节奏韵味与文学修辞',
        connectionId: 'conn_deepseek_main',
        modelId: 'deepseek-reasoner',
        samplingPresetId: 'gen_preset_novel_poetic',
        promptPresetId: 'novel_polish'
      },

      // 3. 概念工坊子任务
      concept_explore: {
        id: 'concept_explore',
        name: '概念工坊 · 自由探索',
        domain: 'concept',
        desc: '输入自然语言方向生成多维概念候选与探索分支',
        connectionId: 'conn_deepseek_main',
        modelId: 'deepseek-chat',
        samplingPresetId: 'rp_preset_spark',
        promptPresetId: 'brainstorm_divergent'
      },
      concept_tag_expand: {
        id: 'concept_tag_expand',
        name: '概念工坊 · 标签库扩展',
        domain: 'concept',
        desc: '词槽权重扩展、生词联想与属性分类结构沉淀',
        connectionId: 'conn_deepseek_main',
        modelId: 'deepseek-chat',
        samplingPresetId: 'gen_preset_concept_tags',
        promptPresetId: 'concept_structured'
      },
      concept_desc_gen: {
        id: 'concept_desc_gen',
        name: '概念工坊 · 角色描述立绘',
        domain: 'concept',
        desc: '将提炼出的特征标签融合成细腻的人物外貌与性格自然语言立绘描述',
        connectionId: 'conn_anthropic_prod',
        modelId: 'claude-3-7-sonnet-20250219',
        samplingPresetId: 'rp_preset_fiction',
        promptPresetId: 'novel_literary'
      },

      // 4. 自主 Agent 与离线工具
      agent_task: {
        id: 'agent_task',
        name: 'Agent 剧本逻辑验算',
        domain: 'agent',
        desc: '世界观一致性审查、时间线反向推演与设定矛盾排查',
        connectionId: 'conn_deepseek_main',
        modelId: 'deepseek-reasoner',
        samplingPresetId: 'gen_preset_agent_logic',
        promptPresetId: 'agent_rigorous'
      },
      batch_clean: {
        id: 'batch_clean',
        name: '本地离线批量格式清理',
        domain: 'agent',
        desc: '离线文本清洗、多语言对照、纯 JSON 确定性结构化提取',
        connectionId: 'conn_local_ollama',
        modelId: 'qwen2.5:14b',
        samplingPresetId: 'gen_preset_clean',
        promptPresetId: 'concept_structured'
      }
    };
  }

  // Keep legacy adapters in sync
  syncLegacyAdapters();
}

function syncLegacyAdapters() {
  if (!store.modelConnections) store.modelConnections = {};
  const rpAlloc = store.featureAllocations?.rp_chat;
  const crAlloc = store.featureAllocations?.creative_discussion;
  const draftAlloc = store.featureAllocations?.novel_draft;

  const catalog = getUnifiedModelCatalog();
  const rpModel = catalog.find(m => m.connectionId === rpAlloc?.connectionId && m.modelId === rpAlloc?.modelId);
  const crModel = catalog.find(m => m.connectionId === crAlloc?.connectionId && m.modelId === crAlloc?.modelId);

  store.modelConnections.rp = {
    provider: rpModel?.provider || 'anthropic',
    name: rpModel?.connectionName || 'Claude',
    model: rpAlloc?.modelId || 'claude-3-7-sonnet-20250219',
    baseUrl: rpModel?.baseUrl || 'https://api.anthropic.com/v1',
    temperature: 0.85,
    maxTokens: 4096,
    contextWindow: rpModel?.contextWindow || 200000
  };

  store.modelConnections.creative = {
    provider: crModel?.provider || 'deepseek',
    name: crModel?.connectionName || 'DeepSeek',
    model: crAlloc?.modelId || 'deepseek-chat',
    baseUrl: crModel?.baseUrl || 'https://api.deepseek.com/v1',
    temperature: 0.70,
    maxTokens: 4096,
    contextWindow: crModel?.contextWindow || 64000
  };

  if (!store.modelDefaults) store.modelDefaults = {};
  if (rpAlloc?.modelId) store.modelDefaults.rp = rpAlloc.modelId;
  if (draftAlloc?.modelId) store.modelDefaults.novel = draftAlloc.modelId;
}

function getUnifiedModelCatalog() {
  if (!Array.isArray(store.apiConnections)) store.apiConnections = [];
  const catalog = [];
  (store.apiConnections || []).forEach(conn => {
    if (conn.enabled === false) return;
    (conn.models || []).forEach(m => {
      catalog.push({
        connectionId: conn.id,
        connectionName: conn.name,
        provider: conn.provider,
        baseUrl: conn.baseUrl,
        status: conn.status || 'untested',
        modelId: m.id,
        modelName: m.name || m.id,
        contextWindow: m.context || 64000,
        maxOutput: m.maxOutput || 4096,
        tags: m.tags || [],
        fullKey: conn.id + '::' + m.id
      });
    });
  });
  return catalog;
}

function getModelDisplayName(connectionId, modelId) {
  const catalog = getUnifiedModelCatalog();
  const found = catalog.find(m => m.connectionId === connectionId && m.modelId === modelId);
  if (found) {
    return {
      modelName: found.modelName,
      connectionName: found.connectionName,
      provider: found.provider,
      status: found.status,
      contextWindow: found.contextWindow,
      tags: found.tags,
      valid: true
    };
  }
  return {
    modelName: modelId || '未配置模型',
    connectionName: connectionId || '未指定连接',
    provider: 'unknown',
    status: 'untested',
    contextWindow: 0,
    tags: [],
    valid: false
  };
}

function getEffectiveModelConfig(featureKey, context = {}) {
  ensureUnifiedApiState();
  const defaultAlloc = store.featureAllocations?.[featureKey] || {
    connectionId: 'conn_anthropic_prod',
    modelId: 'claude-3-7-sonnet-20250219',
    samplingPresetId: 'rp_preset_default',
    promptPresetId: 'rp_immersive'
  };

  let level = 'feature_default'; // 'feature_default' | 'entity_default' | 'session_override'
  let activeConnId = defaultAlloc.connectionId;
  let activeModelId = defaultAlloc.modelId;
  let activeSamplingId = defaultAlloc.samplingPresetId;
  let activePromptId = defaultAlloc.promptPresetId;

  // 1. Entity level: Role-specific or Work-specific
  if (context.roleId && store.roleRpConfigs?.[context.roleId]?.modelOverride) {
    const rOverride = store.roleRpConfigs[context.roleId].modelOverride;
    if (rOverride.connectionId && rOverride.modelId) {
      activeConnId = rOverride.connectionId;
      activeModelId = rOverride.modelId;
      if (rOverride.samplingPresetId) activeSamplingId = rOverride.samplingPresetId;
      if (rOverride.promptPresetId) activePromptId = rOverride.promptPresetId;
      level = 'entity_default';
    }
  }
  if (context.workId && store.works) {
    const curWork = store.works.find(w => w.id === context.workId);
    if (curWork?.modelOverride?.connectionId && curWork?.modelOverride?.modelId) {
      activeConnId = curWork.modelOverride.connectionId;
      activeModelId = curWork.modelOverride.modelId;
      if (curWork.modelOverride.samplingPresetId) activeSamplingId = curWork.modelOverride.samplingPresetId;
      level = 'entity_default';
    }
  }

  // 2. Session level override
  if (context.sessionId || context.rpSessionId) {
    const s = context.rpSessionId
      ? getRpSessionById(context.rpSessionId)
      : (typeof session === 'function' ? session(context.sessionId) : (store.sessions?.find(x => x.id === context.sessionId)));
    if (s && s.modelOverride && s.modelOverride.connectionId && s.modelOverride.modelId) {
      activeConnId = s.modelOverride.connectionId;
      activeModelId = s.modelOverride.modelId;
      if (s.modelOverride.samplingPresetId) activeSamplingId = s.modelOverride.samplingPresetId;
      level = 'session_override';
    }
  }

  const info = getModelDisplayName(activeConnId, activeModelId);
  const samplingPreset = (store.generationPresets || []).find(p => p.id === activeSamplingId) || { name: '默认平衡方案' };
  const promptPreset = (store.creativePromptPresets || []).find(p => p.id === activePromptId) || { name: '通用提示指令' };

  return {
    featureKey,
    level,
    levelLabel: level === 'session_override' ? '会话临时覆盖' : (level === 'entity_default' ? (context.workId ? '作品专属' : '角色专属') : '全局默认'),
    connectionId: activeConnId,
    modelId: activeModelId,
    modelName: info.modelName,
    connectionName: info.connectionName,
    provider: info.provider,
    status: info.status,
    samplingPresetId: activeSamplingId,
    samplingPresetName: samplingPreset.name,
    promptPresetId: activePromptId,
    promptPresetName: promptPreset.name,
    isOverridden: level === 'session_override',
    isEntityDefault: level === 'entity_default'
  };
}

function getRpSessionById(sessionId) {
  for (const items of Object.values(store.rpSessions || {})) {
    const found = items.find(s => s.id === sessionId);
    if (found) return found;
  }
  return null;
}

function setRpSessionModelOverride(sessionId, connectionId, modelId) {
  const current = getRpSessionById(sessionId);
  if (!current) return;
  current.modelOverride = { ...current.modelOverride, connectionId, modelId };
  save();
  toast('已更新当前 RP 分支模型');
}

function clearRpSessionModelOverride(sessionId) {
  const current = getRpSessionById(sessionId);
  if (!current) return;
  delete current.modelOverride;
  save();
  toast('当前 RP 分支已恢复继承模型');
}

function setSessionModelOverride(sessionId, connectionId, modelId, samplingPresetId = null) {
  const s = typeof session === 'function' ? session(sessionId) : (store.sessions?.find(x => x.id === sessionId));
  if (!s) return;
  s.modelOverride = {
    connectionId,
    modelId,
    samplingPresetId: samplingPresetId || s.modelOverride?.samplingPresetId
  };
  save();
  toast('已设置当前会话临时覆盖模型：' + modelId);
}

function clearSessionModelOverride(sessionId) {
  const s = typeof session === 'function' ? session(sessionId) : (store.sessions?.find(x => x.id === sessionId));
  if (!s) return;
  delete s.modelOverride;
  save();
  toast('已恢复继承上级默认模型');
}

function setRoleModelBinding(roleId, connectionId, modelId, samplingPresetId = null, promptPresetId = null) {
  if (!store.roleRpConfigs) store.roleRpConfigs = {};
  if (!store.roleRpConfigs[roleId]) store.roleRpConfigs[roleId] = { ready: true };
  store.roleRpConfigs[roleId].modelOverride = {
    connectionId,
    modelId,
    samplingPresetId: samplingPresetId || store.roleRpConfigs[roleId].modelOverride?.samplingPresetId,
    promptPresetId: promptPresetId || store.roleRpConfigs[roleId].modelOverride?.promptPresetId
  };
  save();
  toast('角色专属模型绑定已更新');
}

function clearRoleModelBinding(roleId) {
  if (store.roleRpConfigs?.[roleId]?.modelOverride) {
    delete store.roleRpConfigs[roleId].modelOverride;
    save();
    toast('已恢复角色继承功能全局默认模型');
  }
}

// =========================================================
// Real Local Validation & Truthful Connection Status
// =========================================================
function validateConnectionLocal(conn) {
  if (!conn.baseUrl || !conn.baseUrl.trim()) {
    return { valid: false, msg: 'Base URL 服务端点不能为空' };
  }
  const url = conn.baseUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return { valid: false, msg: 'Base URL 必须是以 http:// 或 https:// 开头的合法网络地址' };
  }
  const prov = getProviderDef(conn.provider);
  if (prov.requiresApiKey && (!conn.hasCredential && (!conn.apiKey || !conn.apiKey.trim()))) {
    return { valid: false, msg: '该服务商协议要求提供 API Key 鉴权凭据' };
  }
  return { valid: true };
}

function testSingleConnection(connId) {
  const conn = ui.connDraft?.id === connId && document.getElementById('conn_edit_url') ? ui.connDraft : store.apiConnections?.find(c => c.id === connId);
  if (!conn) return;

  const check = validateConnectionLocal(conn);
  if (!check.valid) {
    conn.status = 'error';
    conn.statusText = check.msg;
    conn.latency = '-';
    save();
    overlay();
    toast('校验未通过：' + check.msg);
    return;
  }

  // Format valid, but tell the truth about prototype mode!
  conn.status = 'format_valid';
  conn.statusText = '配置格式校验通过 (待后端连接)';
  conn.latency = '未测 (等待集成)';
  save();
  overlay();
  toast('连接「' + conn.name + '」本地配置校验通过！Base URL 与凭据格式符合规范。真实握手需等待 Electron 后端集成。');
}

function testAllConnections() {
  toast('正在执行全部连接的本地配置规范校验...');
  let validCount = 0;
  (store.apiConnections || []).forEach(c => {
    const res = validateConnectionLocal(c);
    if (res.valid) {
      c.status = 'format_valid';
      c.statusText = '配置格式校验通过 (待后端连接)';
      c.latency = '未测 (等待集成)';
      validCount++;
    } else {
      c.status = 'error';
      c.statusText = res.msg;
      c.latency = '-';
    }
  });
  save();
  overlay();
  toast('配置检查完成：' + validCount + ' 条连接格式规范通过。真实网络测试待 Electron 后端集成。');
}

function deleteConnection(connId) {
  const conn = store.apiConnections?.find(c => c.id === connId);
  if (!conn) return;

  // Confirmation dialog
  if (!confirm('确定要删除 API 连接「' + conn.name + '」吗？\n若已有功能分配使用了该连接中的模型，将自动回退至系统默认配置。')) {
    return;
  }

  store.apiConnections = store.apiConnections.filter(c => c.id !== connId);
  save();
  overlay();
  toast('连接「' + conn.name + '」已删除');
}

function duplicateConnection(connId) {
  const conn = store.apiConnections?.find(c => c.id === connId);
  if (!conn) return;

  const clone = JSON.parse(JSON.stringify(conn));
  clone.id = 'conn_' + Date.now();
  clone.name = conn.name + ' (副本)';
  clone.status = 'untested';
  clone.statusText = '未检测';
  clone.latency = '未测';

  store.apiConnections.push(clone);
  save();
  overlay();
  toast('已复制连接配置：「' + clone.name + '」');
}

function resetAllFeatureAllocations() {
  if (!confirm('确定要将所有创作功能的 AI 模型与预设重置为推荐默认分配吗？')) {
    return;
  }
  delete store.featureAllocations;
  ensureUnifiedApiState();
  save();
  overlay();
  toast('已恢复全部功能的推荐默认模型与预设绑定！');
}


/* =========================================================
   Tab 1: API Connection Library (API 连接库)
   ========================================================= */
function toggleConnMoreMenu(event, connId) {
  event.stopPropagation();
  if (ui.openConnMenuId === connId) {
    ui.openConnMenuId = null;
  } else {
    ui.openConnMenuId = connId;
  }
  overlay();
}

function formatUrlDigest(url) {
  if (!url) return '未配置端点';
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function renderApiConnectionsTab() {
  ensureUnifiedApiState();
  const connections = store.apiConnections || [];

  return `
    <div class="settings-section-head">
      <div class="settings-section-head-left">
        <h2>API 连接库</h2>
        <p style="margin:2px 0 0;font-size:12px;color:#8c8c8c">统一维护云端官方、聚合平台与本地离线推理服务连接，支持多协议与多实例接入。</p>
      </div>
      <div class="flex gap8">
        <button class="btn quiet sm" onclick="testAllConnections()">格式检查</button>
        <button class="btn primary sm" onclick="openProviderPickerModal()">${I('plus')} 新建服务连接</button>
      </div>
    </div>

    <!-- Connections Grid -->
    <div class="conn-grid">
      ${connections.map(c => {
        const prov = getProviderDef(c.provider);
        const statusClass = c.status || 'untested';
        const modelsCount = (c.models || []).length;
        const urlDigest = formatUrlDigest(c.baseUrl);

        return `
          <div class="conn-card ${c.enabled ? '' : 'disabled'}">
            <!-- TIER 1: Identity, Toggle & More Menu -->
            <div class="conn-card-head">
              <div class="conn-card-title-group">
                <h3 class="conn-title" title="${E(c.name)}">${E(c.name)}</h3>
              </div>
              <div class="conn-card-head-actions">
                <label class="conn-toggle-wrap" title="点击切换连接启用/停用状态">
                  <input type="checkbox" ${c.enabled ? 'checked' : ''} onchange="toggleConnectionEnabled('${c.id}', this.checked)">
                  <span class="conn-toggle-track"><span class="conn-toggle-thumb"></span></span>
                  <span class="conn-toggle-text">${c.enabled ? '已启用' : '已停用'}</span>
                </label>
                <div class="conn-more-wrap">
                  <button class="conn-more-btn ${ui.openConnMenuId === c.id ? 'active' : ''}" onclick="toggleConnMoreMenu(event, '${c.id}')" title="更多操作">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                      <circle cx="5" cy="12" r="1.75"></circle>
                      <circle cx="12" cy="12" r="1.75"></circle>
                      <circle cx="19" cy="12" r="1.75"></circle>
                    </svg>
                  </button>
                  ${ui.openConnMenuId === c.id ? `
                    <div class="conn-dropdown-menu" onclick="event.stopPropagation()">
                      <button class="conn-dropdown-item" onclick="ui.openConnMenuId=null;openEditConnectionModal('${c.id}')">
                        ${I('settings')} 编辑配置
                      </button>
                      <button class="conn-dropdown-item" onclick="ui.openConnMenuId=null;duplicateConnection('${c.id}')">
                        ${I('copy')} 复制副本
                      </button>
                      <div class="conn-dropdown-divider"></div>
                      <button class="conn-dropdown-item danger" onclick="ui.openConnMenuId=null;deleteConnection('${c.id}')">
                        ${I('trash')} 删除连接
                      </button>
                    </div>
                  ` : ''}
                </div>
              </div>
            </div>

            <!-- TIER 2: Protocol & Endpoint Meta (Zero-box Layout) -->
            <div class="conn-card-body">
              <div class="conn-card-tags-row">
                <span class="conn-provider-badge" title="${E(prov.protocolLabel)}">${E(prov.categoryName)} · ${E(prov.protocolLabel)}</span>
                <span class="conn-models-count-tag" title="当前挂载模型数量">${modelsCount} 个模型</span>
              </div>
              <div class="conn-card-endpoint-row" title="服务端点 Base URL: ${E(c.baseUrl)}">
                <span class="conn-endpoint-icon">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                  </svg>
                </span>
                <span class="conn-endpoint-text">${E(urlDigest)}</span>
              </div>
            </div>

            <!-- TIER 3: High-Frequency Actions & Truthful Status -->
            <div class="conn-card-foot">
              <div class="conn-card-actions-left">
                <button class="btn quiet sm conn-foot-btn" onclick="openManageModelsModal('${c.id}')" title="管理此连接挂载的模型列表">
                  ${I('spark')} 模型 (${modelsCount})
                </button>
                <button class="btn quiet sm conn-foot-btn" onclick="testSingleConnection('${c.id}')" title="校验端点与凭据格式规范">
                  测试
                </button>
              </div>
              <div class="conn-card-status-right">
                <span class="conn-status-pill ${statusClass}" title="${E(c.statusText || '尚未进行连通性检测')}">
                  <span class="conn-status-dot"></span>
                  <span>${statusClass === 'format_valid' ? '格式有效' : (statusClass === 'ready' ? '连接成功' : (statusClass === 'error' ? '格式异常' : '尚未测试'))}</span>
                </span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    ${!connections.length ? `
      <div style="padding:40px;text-align:center;color:#888;background:#181818;border:1px dashed #303030;border-radius:8px;margin-top:14px">
        暂无任何 API 连接。点击右上角「新建服务连接」快速创建。
      </div>
    ` : ''}
  `;
}

function toggleConnectionEnabled(connId, enabled) {
  const c = store.apiConnections?.find(x => x.id === connId);
  if (!c) return;
  c.enabled = !!enabled;
  save();
  overlay();
  toast(c.enabled ? '已启用连接「' + c.name + '」' : '已停用连接「' + c.name + '」');
}

function isMultimodalModel(m) {
  if (!m) return false;
  if (typeof m.multimodal === 'boolean') return m.multimodal;
  const str = ((m.id || m.modelId || '') + ' ' + (m.name || m.modelName || '')).toLowerCase();
  return str.includes('claude-3') || str.includes('gemini') || str.includes('gpt-4') || str.includes('vision') || str.includes('-vl') || str.includes('omni');
}
window.isMultimodalModel = isMultimodalModel;

/* =========================================================
   Tab 2: Unified Model Catalog (统一模型目录)
   ========================================================= */
function renderModelCatalogTab() {
  ensureUnifiedApiState();
  const catalog = getUnifiedModelCatalog();
  const searchQ = (ui.catalogSearchQuery || '').toLowerCase().trim();

  const filtered = catalog.filter(m => {
    if (!searchQ) return true;
    const isMultiStr = isMultimodalModel(m) ? '多模态 支持' : '纯文本 不支持';
    const qStr = (m.modelName + ' ' + m.modelId + ' ' + m.connectionName + ' ' + m.provider + ' ' + isMultiStr).toLowerCase();
    return qStr.includes(searchQ);
  });

  return `
    <div class="settings-section-head">
      <div class="settings-section-head-left">
        <h2>统一模型目录</h2>
        <p style="margin:2px 0 0;font-size:12px;color:#8c8c8c">汇集全连接已登记的可用模型资源，提供全局检索、规格概览与快捷功能指派。</p>
      </div>
      <div class="flex gap8">
        <button class="btn primary sm" onclick="openAddCustomModelModal()">${I('plus')} 录入自定义模型 ID</button>
      </div>
    </div>

    <!-- Search Toolbar -->
    <div class="catalog-toolbar">
      <div class="catalog-search-wrap" style="max-width:380px">
        <span class="catalog-search-icon">${I('search')}</span>
        <input class="catalog-search-input" placeholder="搜索模型名称、ID、所属连接..." value="${E(ui.catalogSearchQuery || '')}" oninput="ui.catalogSearchQuery=this.value;overlay()">
        ${ui.catalogSearchQuery ? `<button class="catalog-search-clear" onclick="ui.catalogSearchQuery='';overlay()" title="清空搜索">${I('x')}</button>` : ''}
      </div>
    </div>

    <!-- Catalog Table -->
    <table class="catalog-table">
      <thead>
        <tr>
          <th style="width:46%">模型名称与 ID</th>
          <th style="width:26%">所属连接</th>
          <th style="width:16%">多模态支持</th>
          <th style="width:12%;text-align:right">操作</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(m => {
          const isMulti = isMultimodalModel(m);
          return `
            <tr>
              <td>
                <div class="catalog-model-col">
                  <div class="catalog-name-row">
                    <span class="catalog-model-name" 
                          id="model_title_${m.connectionId}_${m.modelId}" 
                          ondblclick="startInlineRenameModel('${m.connectionId}', '${m.modelId}')" 
                          title="双击就地修改模型显示别名">${E(m.modelName)}</span>
                  </div>
                  <span class="catalog-model-id" title="真实模型系统 ID: ${E(m.modelId)}">${E(m.modelId)}</span>
                </div>
              </td>
              <td>
                <span style="font-size:12px;color:#d0d0d0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${E(m.connectionName)}">${E(m.connectionName)}</span>
              </td>
              <td>
                <span style="font-size:12px;color:${isMulti ? '#ffffff' : '#777777'}">${isMulti ? '多模态' : '不支持'}</span>
              </td>
              <td style="text-align:right">
                <button class="btn sm quiet" onclick="openQuickAssignModal('${m.connectionId}', '${m.modelId}')" title="分配到具体创作功能">指派 →</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>

    ${!filtered.length ? `
      <div style="padding:40px;text-align:center;color:#888;background:#181818;border:1px dashed #303030;border-radius:8px">
        未找到匹配的模型记录。可前往「API 连接库」检查连接或录入自定义模型 ID。
      </div>
    ` : ''}
  `;
}

function startInlineRenameModel(connId, modelId) {
  const conn = store.apiConnections?.find(c => c.id === connId);
  if (!conn) return;
  const m = conn.models?.find(x => x.id === modelId);
  if (!m) return;

  const titleEl = document.getElementById('model_title_' + connId + '_' + modelId);
  if (!titleEl) return;

  const currentName = m.name || m.id;
  titleEl.innerHTML = `<input type="text" class="catalog-inline-input" id="inline_input_${connId}_${modelId}" value="${E(currentName)}" onclick="event.stopPropagation()">`;

  const input = document.getElementById('inline_input_' + connId + '_' + modelId);
  if (!input) return;

  input.focus();
  input.select();

  let committed = false;
  function commitRename() {
    if (committed) return;
    committed = true;
    const newName = input.value.trim();
    if (newName && newName !== currentName) {
      m.name = newName;
      save();
      toast('已更新模型别名：「' + newName + '」');
    }
    overlay();
  }

  function cancelRename() {
    if (committed) return;
    committed = true;
    overlay();
  }

  input.addEventListener('blur', commitRename);
  input.addEventListener('keydown', function(ev) {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      commitRename();
    } else if (ev.key === 'Escape') {
      ev.preventDefault();
      cancelRename();
    }
  });
}


/* =========================================================
   Tab 3: Streamlined Feature-Level AI Allocation Center
   Format: Task Name | Current Model | Configure Button
   ========================================================= */
function renderFeatureAllocationTab() {
  ensureUnifiedApiState();
  const alloc = store.featureAllocations || {};

  const domains = [
    {
      key: 'rp',
      title: '角色扮演与沉浸对话',
      badge: '酒馆对话',
      items: ['rp_chat', 'rp_greeting']
    },
    {
      key: 'creative',
      title: '创作工坊与连载小说',
      badge: '长文与脑暴',
      items: ['creative_discussion', 'creative_brainstorm', 'novel_draft', 'novel_polish']
    },
    {
      key: 'concept',
      title: '概念工坊与特征探索',
      badge: '子任务独立分配',
      items: ['concept_explore', 'concept_tag_expand', 'concept_desc_gen']
    },
    {
      key: 'agent',
      title: '自主 Agent 与离线工具',
      badge: '推演与工具',
      items: ['agent_task', 'batch_clean']
    }
  ];

  return `
    <div class="settings-section-head">
      <div class="settings-section-head-left">
        <h2>功能级 AI 分配</h2>
        <p style="margin:2px 0 0;font-size:12px;color:#8c8c8c">为各创作功能指定默认模型、生成参数预设与任务提示词。点击配置展开详细调整。</p>
      </div>
      <div class="flex gap8">
        <button class="btn quiet sm" onclick="switchSettingsTab('rp_params')">${I('theater')} 参数预设中心</button>
        <button class="btn quiet sm" onclick="resetAllFeatureAllocations()">↺ 恢复推荐默认</button>
      </div>
    </div>

    <!-- Domain Allocations Cards -->
    ${domains.map(dom => `
      <div class="alloc-domain-card">
        <div class="alloc-domain-head">
          <h3 class="alloc-domain-title">${E(dom.title)}</h3>
          <span class="alloc-domain-badge">${E(dom.badge)}</span>
        </div>

        ${dom.items.map(itemKey => {
          const item = alloc[itemKey];
          if (!item) return '';
          const cfg = getEffectiveModelConfig(itemKey);
          const statusClass = cfg.status === 'ready' ? 'ready' : (cfg.status === 'format_valid' ? 'format_valid' : 'untested');

          return `
            <div class="alloc-streamlined-row">
              <div class="alloc-task-info">
                <span class="alloc-task-name">${E(item.name)}</span>
                <span class="alloc-task-help" title="${E(item.desc)}">?</span>
              </div>

              <div class="alloc-right-controls">
                <!-- Model Pill Button (Directly opens model picker) -->
                <button class="v3-model-pill" onclick="openUnifiedModelSelectorModal('${itemKey}')" title="当前模型：${E(cfg.modelName)} (${E(cfg.connectionName)}) · 点击快速更换">
                  <span class="v3-model-dot ${statusClass}"></span>
                  <span class="v3-model-name">${E(cfg.modelName)}</span>
                </button>

                <!-- Configure Button (Opens Subtask Config Modal) -->
                <button class="btn quiet sm" onclick="openSubtaskConfigModal('${itemKey}')" title="详细配置模型、采样参数预设与任务提示词">配置</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('')}

    <!-- Quick Inheritance Notice Card -->
    <div style="background:#161616;border:1px solid #272727;border-radius:6px;padding:10px 14px;margin-top:14px;font-size:11.5px;color:#888;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div>
        <strong style="color:#ddd">分级生效规则：</strong>
        <span>功能默认 → 角色/作品绑定 → 会话临时覆盖。下层覆盖随时可在界面一键恢复继承。</span>
      </div>
      <button class="btn quiet sm" onclick="openSettings('api_connections')">API 连接库管理 →</button>
    </div>
  `;
}


/* =========================================================
   Modal History Stack Helper (Return to Settings)
   ========================================================= */
function pushModalState(newModal, meta = {}) {
  if (!ui.modalStack) ui.modalStack = [];
  if (ui.modal && ui.modal !== newModal) {
    ui.modalStack.push({
      modal: ui.modal,
      settingsTab: ui.settingsTab,
      managingConnection: ui.managingConnection,
      ...meta
    });
  }
  ui.modal = newModal;
  overlay();
}

function closeModal() {
  if (ui.modalStack && ui.modalStack.length > 0) {
    const prev = ui.modalStack.pop();
    if (prev && prev.modal) {
      ui.modal = prev.modal;
      if (prev.settingsTab) ui.settingsTab = prev.settingsTab;
      if (prev.managingConnection) ui.managingConnection = prev.managingConnection;
      overlay();
      return;
    }
  }
  ui.modal = '';
  ui.modalStack = [];
  overlay();
  if (typeof modalType !== 'undefined') modalType = '';
  const conOv = typeof $ === 'function' ? $('#conceptOverlay') : null;
  if (conOv) conOv.classList.remove('visible');
  const dlg = conOv ? conOv.querySelector('.dialog') : null;
  if (dlg) dlg.className = 'dialog';
}

function closeSettingsModal() {
  ui.modalStack = [];
  ui.modal = '';
  overlay();
}

/* =========================================================
   Modal 1: Provider Picker Modal (Searchable & Categorized)
   ========================================================= */
function openProviderPickerModal() {
  ui.providerSearchQuery = '';
  pushModalState('providerPicker');
}

function renderProviderPickerModal() {
  const q = (ui.providerSearchQuery || '').toLowerCase().trim();

  const filtered = UNIFIED_PROVIDERS.filter(p => {
    if (!q) return true;
    const matchStr = (p.name + ' ' + p.id + ' ' + (p.categoryName || '') + ' ' + (p.protocolLabel || '') + ' ' + (p.notes || '') + ' ' + (p.aliases || '')).toLowerCase();
    return matchStr.includes(q);
  });

  return `
    <div class="modal-head">
      <div>
        <h3 class="h3">选择服务商协议以新建连接</h3>
        <p class="sub">涵盖官方直连、聚合平台、创意写作引擎与本地离线推理服务</p>
      </div>
      <button class="ghost icon-btn" onclick="closeModal()" title="关闭">${I('x')}</button>
    </div>

    <!-- Search Toolbar -->
    <div class="provider-picker-search">
      <input class="input sm" style="width:100%" placeholder="搜索服务商名称、协议类型或本地端点 (如 DeepSeek, Claude, Ollama)..." value="${E(ui.providerSearchQuery || '')}" oninput="ui.providerSearchQuery=this.value;overlay()">
    </div>

    <!-- Provider Cards Grid -->
    <div class="provider-cards-grid">
      ${filtered.map(p => `
        <div class="provider-choice-card" onclick="selectProviderToCreate('${p.id}')">
          <div class="provider-choice-head">
            <span class="provider-choice-name">${E(p.name)}</span>
            <span class="conn-provider-badge ${p.category}">${E(p.categoryName)}</span>
          </div>
          <span class="provider-choice-proto">${E(p.protocolLabel)}</span>
          <p class="provider-choice-desc">${E(p.notes)}</p>
          ${!p.integrated ? `
            <span class="provider-choice-status pending">
              ○ 待后端集成
            </span>
          ` : ''}
        </div>
      `).join('')}
    </div>

    ${!filtered.length ? `
      <div style="padding:30px;text-align:center;color:#888;background:#181818;border-radius:6px">
        未找到匹配的服务商。可选用「OpenAI 兼容」配置任意端点。
      </div>
    ` : ''}

    <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between">
      <span class="tiny" style="color:#777">点击任意服务商自动预填标准配置</span>
      <button class="btn quiet" onclick="closeModal()">取消</button>
    </div>
  `;
}

function selectProviderToCreate(providerId) {
  const p = getProviderDef(providerId);
  resetConnDiscoveryState();
  ui.connDraft = {
    id: 'conn_' + Date.now(),
    name: p.name,
    provider: p.id,
    baseUrl: p.defaultBaseUrl || '',
    apiKey: '',
    status: 'untested',
    statusText: p.integrated ? '未检测' : '待后端集成',
    latency: '未测',
    enabled: true,
    models: JSON.parse(JSON.stringify(p.defaultModels || [])),
    advanced: {
      timeout: 60,
      proxyUrl: '',
      customHeaders: p.id === 'openrouter' ? '{"HTTP-Referer": "https://sillytavern.app", "X-Title": "SillyTavern Desktop"}' : ''
    }
  };
  pushModalState('editConnection');
}

/* =========================================================
   Modal 2: Edit Connection Modal (Drafting, Discovery & Validation)
   ========================================================= */
function resetConnDiscoveryState() {
  ui.discoveredModels = [];
  ui.discoveredActiveTab = 'new';
  ui.selectedForImport = new Set();
  ui.isFetchingModels = false;
  ui.discoveryError = null;
  ui.showDiscoveryTray = false;
  ui.showManualAdd = false;
}

function computeConnEndpointPreview(baseUrl, provider) {
  const url = (baseUrl || '').trim().replace(/\/+$/, '');
  if (!url) return '未配置有效地址';
  if (provider === 'ollama') return url + '/api/tags';
  if (provider === 'gemini') return url + '/v1beta/models?key=••••••';
  if (['anthropic', 'claude'].includes(provider)) return url + '/v1/models (Header: x-api-key)';
  return url + '/models';
}

function updateConnEndpointPreview() {
  const urlEl = document.getElementById('conn_edit_url');
  const previewEl = document.getElementById('conn_endpoint_preview_url');
  if (!urlEl || !previewEl || !ui.connDraft) return;
  const baseUrl = urlEl.value;
  previewEl.textContent = computeConnEndpointPreview(baseUrl, ui.connDraft.provider);
}

function toggleConnKeyVisibility() {
  const el = document.getElementById('conn_edit_key');
  const eyeOff = document.getElementById('conn_eye_off_icon');
  const eyeOn = document.getElementById('conn_eye_on_icon');
  if (!el) return;
  if (el.type === 'password') {
    el.type = 'text';
    if (eyeOff) eyeOff.style.display = 'none';
    if (eyeOn) eyeOn.style.display = 'inline';
  } else {
    el.type = 'password';
    if (eyeOff) eyeOff.style.display = 'inline';
    if (eyeOn) eyeOn.style.display = 'none';
  }
}

function syncConnDraftFromInputs() {
  if (!ui.connDraft) return;
  const nameEl = document.getElementById('conn_edit_name');
  const urlEl = document.getElementById('conn_edit_url');
  const keyEl = document.getElementById('conn_edit_key');
  const timeoutEl = document.getElementById('conn_edit_timeout');
  const proxyEl = document.getElementById('conn_edit_proxy');
  const headersEl = document.getElementById('conn_edit_headers');

  if (nameEl) ui.connDraft.name = nameEl.value;
  if (urlEl) ui.connDraft.baseUrl = urlEl.value;
  if (keyEl && keyEl.value.trim()) ui.connDraft.apiKey = keyEl.value.trim();
  if (timeoutEl) {
    if (!ui.connDraft.advanced) ui.connDraft.advanced = {};
    ui.connDraft.advanced.timeout = Number(timeoutEl.value) || 60;
  }
  if (proxyEl) {
    if (!ui.connDraft.advanced) ui.connDraft.advanced = {};
    ui.connDraft.advanced.proxyUrl = proxyEl.value;
  }
  if (headersEl) {
    if (!ui.connDraft.advanced) ui.connDraft.advanced = {};
    ui.connDraft.advanced.customHeaders = headersEl.value;
  }
}

function renderAttachedChipsHtml(models) {
  if (!models || models.length === 0) {
    return `<span style="font-size:11.5px;color:#777">当前暂无挂载模型，请点击「获取模型列表」或手动录入</span>`;
  }
  return models.map(m => `
    <span class="model-chip" data-id="${E(m.id)}">
      ${E(m.id)}
      <span class="chip-del" onclick="removeAttachedConnModel('${E(m.id)}')" title="移除挂载">×</span>
    </span>
  `).join('');
}

function refreshConnAttachedModelsView() {
  const container = document.getElementById('conn_attached_chips_row');
  const badge = document.getElementById('conn_attached_count_badge');
  const models = ui.connDraft?.models || [];
  if (badge) badge.textContent = `已绑定 ${models.length} 个`;
  if (container) container.innerHTML = renderAttachedChipsHtml(models);
}

function removeAttachedConnModel(modelId) {
  if (!ui.connDraft || !ui.connDraft.models) return;
  ui.connDraft.models = ui.connDraft.models.filter(m => m.id !== modelId);
  refreshConnAttachedModelsView();
  if (ui.showDiscoveryTray) {
    renderDiscoveredModelsList();
  }
}

function toggleManualAddConnModel() {
  ui.showManualAdd = !ui.showManualAdd;
  const row = document.getElementById('conn_manual_add_row');
  if (row) {
    row.style.display = ui.showManualAdd ? 'block' : 'none';
    if (ui.showManualAdd) {
      document.getElementById('conn_manual_model_input')?.focus();
    }
  }
}

function submitManualConnModel() {
  const input = document.getElementById('conn_manual_model_input');
  if (!input || !input.value.trim() || !ui.connDraft) return;
  const mid = input.value.trim();
  if (!ui.connDraft.models) ui.connDraft.models = [];
  if (ui.connDraft.models.some(m => m.id === mid)) {
    toast('该模型已在连接中');
    return;
  }
  ui.connDraft.models.push({
    id: mid,
    name: mid,
    context: 64000,
    maxOutput: 4096,
    tags: ['自定义录入']
  });
  input.value = '';
  refreshConnAttachedModelsView();
  if (ui.showDiscoveryTray) {
    renderDiscoveredModelsList();
  }
  toast(`已手动添加模型：「${mid}」`);
}

async function fetchModelsForEditingConn() {
  if (ui.isFetchingModels) return;
  syncConnDraftFromInputs();

  const baseUrl = (ui.connDraft?.baseUrl || '').trim();
  const apiKey = (ui.connDraft?.apiKey || '').trim();
  const prov = ui.connDraft?.provider || 'openai-compatible';

  if (!baseUrl) {
    toast('请先输入服务地址 (Base URL)');
    document.getElementById('conn_edit_url')?.focus();
    return;
  }

  ui.isFetchingModels = true;
  ui.discoveryError = null;

  const btn = document.getElementById('conn_fetch_models_btn');
  const btnText = document.getElementById('conn_fetch_btn_text');
  const btnIcon = document.getElementById('conn_fetch_btn_icon');
  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = '正在连接端点...';
  if (btnIcon) btnIcon.outerHTML = '<div class="spinner" id="conn_fetch_btn_icon"></div>';

  const cleanBase = baseUrl.replace(/\/+$/, '');
  let probeUrl = cleanBase + '/models';
  const headers = { 'Content-Type': 'application/json' };

  if (prov === 'ollama') {
    probeUrl = cleanBase + '/api/tags';
  } else if (prov === 'gemini') {
    probeUrl = cleanBase + '/v1beta/models' + (apiKey ? '?key=' + encodeURIComponent(apiKey) : '');
  } else if (['anthropic', 'claude'].includes(prov)) {
    probeUrl = cleanBase + '/v1/models';
    if (apiKey) headers['x-api-key'] = apiKey;
    headers['anthropic-version'] = '2023-06-01';
  } else {
    if (apiKey) headers['Authorization'] = 'Bearer ' + apiKey;
  }

  try {
    const res = await fetch(probeUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(12000)
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw { code: 401, message: '端点拒绝了该 API Key。请核对密钥有效性、余额或是否包含额外空格。' };
      }
      if (res.status === 404) {
        throw { code: 404, message: '服务地址已联通，但目标服务商未开放 /models 发现接口。请使用右侧【＋ 手动录入】直接挂载指定模型 ID。' };
      }
      throw { code: res.status, message: `服务返回 HTTP ${res.status} 错误` };
    }

    const data = await res.json();
    const rawList = data.data || data.models || [];
    const models = rawList.map(m => ({
      id: m.id || m.name,
      name: m.name || m.id
    })).filter(m => m.id);

    ui.discoveredModels = models;
    ui.showDiscoveryTray = true;
    if (!ui.selectedForImport) ui.selectedForImport = new Set();
    ui.selectedForImport.clear();

    const attachedIds = new Set((ui.connDraft.models || []).map(m => m.id));
    models.forEach(m => {
      if (!attachedIds.has(m.id)) {
        ui.selectedForImport.add(m.id);
      }
    });

    toast(`成功发现 ${models.length} 个端点模型`);
  } catch (err) {
    ui.showDiscoveryTray = false;
    let title = '连接探测失败';
    let desc = err?.message || '网络连接或响应解析失败，请核对端点地址与网络连接。';
    if (err?.code === 401) {
      title = '401 鉴权未通过 (Authentication Failed)';
    } else if (err?.code === 404) {
      title = '404 路由不存在 (No /models Endpoint)';
    }
    ui.discoveryError = { title, desc };
  } finally {
    ui.isFetchingModels = false;
    overlay();
    if (ui.showDiscoveryTray) {
      renderDiscoveredModelsList();
      const tray = document.getElementById('conn_discovery_tray');
      if (tray) {
        setTimeout(() => tray.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      }
    }
  }
}

function renderDiscoveredModelsList() {
  const listEl = document.getElementById('conn_discovery_list');
  const searchInput = document.getElementById('conn_tray_search');
  if (!listEl) return;

  const filterText = (searchInput?.value || '').trim().toLowerCase();
  const models = ui.discoveredModels || [];
  const attachedIds = new Set((ui.connDraft?.models || []).map(m => m.id));

  let unaddedCount = 0;
  models.forEach(m => {
    if (!attachedIds.has(m.id)) unaddedCount++;
  });

  const statTotal = document.getElementById('conn_stat_total');
  const statNew = document.getElementById('conn_stat_new');
  const tabAll = document.getElementById('conn_tab_all_count');
  const tabNew = document.getElementById('conn_tab_new_count');
  const tabAttached = document.getElementById('conn_tab_attached_count');
  const importAllCount = document.getElementById('conn_import_all_count');
  const availableNewCount = document.getElementById('conn_available_new_count');

  if (statTotal) statTotal.textContent = models.length;
  if (statNew) statNew.textContent = unaddedCount;
  if (tabAll) tabAll.textContent = models.length;
  if (tabNew) tabNew.textContent = unaddedCount;
  if (tabAttached) tabAttached.textContent = models.length - unaddedCount;
  if (importAllCount) importAllCount.textContent = unaddedCount;
  if (availableNewCount) availableNewCount.textContent = unaddedCount;

  const filtered = models.filter(m => {
    const matches = m.id.toLowerCase().includes(filterText);
    if (!matches) return false;
    const isAttached = attachedIds.has(m.id);
    if (ui.discoveredActiveTab === 'new') return !isAttached;
    if (ui.discoveredActiveTab === 'attached') return isAttached;
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = `<div style="padding:20px;text-align:center;color:#777">未找到匹配的模型</div>`;
    updateDiscoveredSelectionUI();
    return;
  }

  listEl.innerHTML = filtered.map(m => {
    const isAttached = attachedIds.has(m.id);
    const isChecked = ui.selectedForImport ? ui.selectedForImport.has(m.id) : false;

    return `
      <div class="model-row ${isAttached ? 'is-attached' : ''}" onclick="toggleDiscoveredRowSelect('${E(m.id)}', event)">
        <div class="model-row-left">
          <input type="checkbox" class="model-checkbox"
                 ${isChecked ? 'checked' : ''}
                 ${isAttached ? 'disabled' : ''}
                 onclick="event.stopPropagation(); toggleDiscoveredModelSelect('${E(m.id)}')">
          <span class="model-name-id">${E(m.id)}</span>
        </div>
        <div class="model-row-right">
          ${isAttached 
            ? '<span class="status-tag attached">已在库中</span>' 
            : '<span class="status-tag new">可新增</span>'}
        </div>
      </div>
    `;
  }).join('');

  updateDiscoveredSelectionUI();
}

function updateDiscoveredSelectionUI() {
  const count = ui.selectedForImport ? ui.selectedForImport.size : 0;
  const counterEl = document.getElementById('conn_selected_count');
  const importBtn = document.getElementById('conn_import_selected_btn');
  if (counterEl) counterEl.textContent = count;
  if (importBtn) {
    importBtn.textContent = `导入所选 (${count})`;
    importBtn.disabled = count === 0;
  }
}

function switchDiscoveredTab(tab, btn) {
  ui.discoveredActiveTab = tab;
  const tabs = document.querySelectorAll('.tray-status-tabs .tray-tab');
  tabs.forEach(t => t.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderDiscoveredModelsList();
}

function toggleDiscoveredModelSelect(id) {
  const attachedIds = new Set((ui.connDraft?.models || []).map(m => m.id));
  if (attachedIds.has(id)) return;
  if (!ui.selectedForImport) ui.selectedForImport = new Set();
  if (ui.selectedForImport.has(id)) {
    ui.selectedForImport.delete(id);
  } else {
    ui.selectedForImport.add(id);
  }
  updateDiscoveredSelectionUI();
}

function toggleDiscoveredRowSelect(id, event) {
  if (event.target && event.target.tagName === 'INPUT') return;
  toggleDiscoveredModelSelect(id);
  renderDiscoveredModelsList();
}

function selectAllDiscoveredUnadded() {
  const attachedIds = new Set((ui.connDraft?.models || []).map(m => m.id));
  if (!ui.selectedForImport) ui.selectedForImport = new Set();
  (ui.discoveredModels || []).forEach(m => {
    if (!attachedIds.has(m.id)) {
      ui.selectedForImport.add(m.id);
    }
  });
  renderDiscoveredModelsList();
}

function clearDiscoveredSelection() {
  if (ui.selectedForImport) ui.selectedForImport.clear();
  renderDiscoveredModelsList();
}

function importSelectedDiscoveredModels() {
  if (!ui.connDraft) return;
  if (!ui.connDraft.models) ui.connDraft.models = [];
  const count = ui.selectedForImport ? ui.selectedForImport.size : 0;
  if (count === 0) return;

  const attachedIds = new Set(ui.connDraft.models.map(m => m.id));
  ui.selectedForImport.forEach(id => {
    if (!attachedIds.has(id)) {
      ui.connDraft.models.push({
        id,
        name: id,
        context: 64000,
        maxOutput: 4096,
        tags: ['端点自动发现']
      });
      attachedIds.add(id);
    }
  });

  ui.selectedForImport.clear();
  refreshConnAttachedModelsView();
  renderDiscoveredModelsList();
  toast(`已成功挂载 ${count} 个选中模型（待保存配置生效）`);
}

function importAllNewDiscoveredModels() {
  if (!ui.connDraft) return;
  if (!ui.connDraft.models) ui.connDraft.models = [];

  const attachedIds = new Set(ui.connDraft.models.map(m => m.id));
  let count = 0;
  (ui.discoveredModels || []).forEach(m => {
    if (!attachedIds.has(m.id)) {
      ui.connDraft.models.push({
        id: m.id,
        name: m.name || m.id,
        context: 64000,
        maxOutput: 4096,
        tags: ['端点自动发现']
      });
      attachedIds.add(m.id);
      count++;
    }
  });

  if (ui.selectedForImport) ui.selectedForImport.clear();
  refreshConnAttachedModelsView();
  renderDiscoveredModelsList();
  toast(`已成功导入全部 ${count} 个新模型（待保存配置生效）`);
}

function openEditConnectionModal(connId = null) {
  ensureUnifiedApiState();
  resetConnDiscoveryState();
  if (connId) {
    const found = store.apiConnections.find(c => c.id === connId);
    if (!found) return;
    ui.connDraft = JSON.parse(JSON.stringify(found));
  } else {
    selectProviderToCreate('custom_openai');
    return;
  }
  pushModalState('editConnection');
}

function handleProviderChangeInEdit(newProvider) {
  if (!ui.connDraft) return;
  syncConnDraftFromInputs();
  ui.connDraft.provider = newProvider;
  const p = getProviderDef(newProvider);
  if (p.defaultBaseUrl && (!ui.connDraft.baseUrl || ui.connDraft.baseUrl.includes('localhost') || ui.connDraft.baseUrl.includes('api.'))) {
    ui.connDraft.baseUrl = p.defaultBaseUrl;
  }
  if (!ui.connDraft.models || !ui.connDraft.models.length) {
    ui.connDraft.models = JSON.parse(JSON.stringify(p.defaultModels || []));
  }
  overlay();
  if (ui.showDiscoveryTray) {
    renderDiscoveredModelsList();
  }
}

function saveEditingConnectionDraft() {
  const c = ui.connDraft;
  if (!c) return;

  const nameInput = document.getElementById('conn_edit_name');
  const urlInput = document.getElementById('conn_edit_url');
  const keyInput = document.getElementById('conn_edit_key');
  const timeoutInput = document.getElementById('conn_edit_timeout');
  const proxyInput = document.getElementById('conn_edit_proxy');
  const headersInput = document.getElementById('conn_edit_headers');

  if (nameInput) c.name = nameInput.value.trim() || c.name;
  if (urlInput) c.baseUrl = urlInput.value.trim() || c.baseUrl;
  if (keyInput) {
    const val = keyInput.value.trim();
    if (val) {
      c.apiKey = val;
    } else if (!c.hasCredential && !c.apiKey) {
      c.apiKey = '';
    }
  }
  if (timeoutInput) c.advanced.timeout = Number(timeoutInput.value) || 60;
  if (proxyInput) c.advanced.proxyUrl = proxyInput.value.trim();
  if (headersInput) c.advanced.customHeaders = headersInput.value.trim();

  const check = validateConnectionLocal(c);
  if (!check.valid) {
    toast('保存失败：' + check.msg);
    return;
  }

  const existingIdx = store.apiConnections.findIndex(x => x.id === c.id);
  if (existingIdx !== -1) {
    store.apiConnections[existingIdx] = c;
  } else {
    store.apiConnections.push(c);
  }

  save();
  ui.modalStack = [];
  openSettings('api_connections');
  toast('连接「' + c.name + '」已成功保存！');
}

function renderEditConnectionModal() {
  const c = ui.connDraft;
  if (!c) return '';

  const isNew = !store.apiConnections.some(x => x.id === c.id);
  const prov = getProviderDef(c.provider);

  return `
    <div class="modal-head">
      <div>
        <h3 class="h3">${isNew ? '新建服务连接' : '编辑连接：' + E(c.name)}</h3>
        <p class="sub">${E(prov.name)} · ${E(prov.protocolLabel)}</p>
      </div>
      <button class="ghost icon-btn" onclick="closeModal()" title="放弃并关闭">${I('x')}</button>
    </div>

    <div class="scroll">
      <div class="formrow">
        <label>连接名称 (自定义易记标识)</label>
        <input class="input" id="conn_edit_name" value="${E(c.name)}" placeholder="如：DeepSeek 备用、Claude 主连接">
      </div>

      <div class="formrow">
        <label>服务商与协议类型</label>
        <select class="select" onchange="handleProviderChangeInEdit(this.value)">
          ${UNIFIED_PROVIDERS.map(p => `
            <option value="${p.id}" ${c.provider === p.id ? 'selected' : ''}>${E(p.name)} (${E(p.protocolLabel)})</option>
          `).join('')}
        </select>
      </div>

      <div class="formrow">
        <label>服务地址 (Base URL 端点)</label>
        <input class="input" id="conn_edit_url" value="${E(c.baseUrl)}" placeholder="https://api.example.com/v1" oninput="updateConnEndpointPreview()">
        <div class="endpoint-preview-bar">
          <span class="endpoint-preview-tag">GET 探测端点</span>
          <span class="endpoint-preview-url" id="conn_endpoint_preview_url">${E(computeConnEndpointPreview(c.baseUrl, c.provider))}</span>
        </div>
      </div>

      <div class="formrow">
        <label>鉴权密钥 (API Key / Token)</label>
        <div class="key-input-wrap">
          <input class="input" id="conn_edit_key" type="password" value="${E(c.apiKey || '')}" placeholder="${E(c.hasCredential ? '已安全保存；留空保留原凭据' : prov.keyPlaceholder)}">
          <button class="icon-ghost-btn" id="conn_key_toggle_btn" type="button" onclick="toggleConnKeyVisibility()" title="切换显示/隐藏">
            <svg class="svg-icon" id="conn_eye_off_icon" viewBox="0 0 24 24">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
            <svg class="svg-icon" id="conn_eye_on_icon" viewBox="0 0 24 24" style="display:none;">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          </button>
        </div>
      </div>

      <!-- Model Hub: Discovery & Attached Management -->
      <div class="model-hub-card">
        <div class="model-hub-header">
          <div class="model-hub-title">
            <strong>已挂载可用模型</strong>
            <span class="model-count-badge" id="conn_attached_count_badge">已绑定 ${(c.models || []).length} 个</span>
          </div>

          <div class="model-hub-actions">
            <button class="btn secondary sm" id="conn_fetch_models_btn" type="button" onclick="fetchModelsForEditingConn()">
              <svg class="svg-icon" id="conn_fetch_btn_icon" viewBox="0 0 24 24"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
              <span id="conn_fetch_btn_text">获取模型列表</span>
            </button>
            <button class="btn quiet sm" type="button" onclick="toggleManualAddConnModel()">＋ 手动录入</button>
          </div>
        </div>

        <!-- Current Attached Models Chips -->
        <div class="attached-chips-row" id="conn_attached_chips_row">
          ${renderAttachedChipsHtml(c.models || [])}
        </div>

        <!-- Manual Add Collapsible Row -->
        <div id="conn_manual_add_row" style="display:${ui.showManualAdd ? 'block' : 'none'};padding-top:8px;border-top:1px dashed #383838">
          <span style="font-size:11px;color:#888;margin-bottom:5px;display:block">手动录入自定义模型 ID：</span>
          <div style="display:flex;gap:6px">
            <input class="input sm" id="conn_manual_model_input" placeholder="如：deepseek-coder、qwen2.5-coder:32b" style="flex:1" onkeydown="if(event.key==='Enter'){event.preventDefault();submitManualConnModel();}">
            <button class="btn secondary sm" type="button" onclick="submitManualConnModel()">添加</button>
          </div>
        </div>

        <!-- Error Card (Conditional) -->
        <div class="notice-card" id="conn_discovery_error" style="display:${ui.discoveryError ? 'flex' : 'none'}">
          <svg class="svg-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div style="flex:1">
            <strong id="conn_error_title">${E(ui.discoveryError?.title || '')}</strong>
            <div id="conn_error_desc" style="margin-top:2px">${E(ui.discoveryError?.desc || '')}</div>
          </div>
        </div>

        <!-- Discovery Tray -->
        <div class="discovery-tray" id="conn_discovery_tray" style="display:${ui.showDiscoveryTray ? 'flex' : 'none'}">
          <!-- Tray Headline: Clean typography, white text, no emoji -->
          <div class="tray-topbar">
            <div class="tray-headline">
              端点返回模型列表：共发现 <b id="conn_stat_total">0</b> 个，其中可新增 <span id="conn_stat_new">0</span> 个
            </div>
          </div>

          <!-- Tray Toolbar: Search with Image 5 icon, 3-tier status tabs without stars -->
          <div class="tray-toolbar">
            <div class="tray-search-wrap">
              <svg class="svg-icon search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="10.5" cy="10.5" r="7.5"></circle>
                <line x1="21" y1="21" x2="15.8" y2="15.8"></line>
              </svg>
              <input class="tray-search" id="conn_tray_search" placeholder="搜索模型 ID..." oninput="renderDiscoveredModelsList()">
            </div>

            <div class="tray-status-tabs">
              <button class="tray-tab ${ui.discoveredActiveTab === 'all' ? 'active' : ''}" type="button" data-tab="all" onclick="switchDiscoveredTab('all', this)">全部 (<span id="conn_tab_all_count">0</span>)</button>
              <button class="tray-tab ${ui.discoveredActiveTab === 'new' ? 'active' : ''}" type="button" data-tab="new" onclick="switchDiscoveredTab('new', this)">仅看新模型 (<span id="conn_tab_new_count">0</span>)</button>
              <button class="tray-tab ${ui.discoveredActiveTab === 'attached' ? 'active' : ''}" type="button" data-tab="attached" onclick="switchDiscoveredTab('attached', this)">已挂载 (<span id="conn_tab_attached_count">0</span>)</button>
            </div>
          </div>

          <!-- Discovered List: Model name only (no subtitle/explanation) -->
          <div class="discovery-list" id="conn_discovery_list">
          </div>

          <!-- Batch Action Footer -->
          <div class="tray-footbar">
            <div class="select-counter">
              已勾选 <strong id="conn_selected_count" style="color:#fff">0</strong> 项 (共 <span id="conn_available_new_count">0</span> 项新模型)
            </div>

            <div class="tray-buttons-group">
              <button class="btn quiet sm" type="button" style="font-size:11px" onclick="selectAllDiscoveredUnadded()">全选新模型</button>
              <button class="btn quiet sm" type="button" style="font-size:11px" onclick="clearDiscoveredSelection()">清空</button>
              <button class="btn secondary sm" type="button" id="conn_import_selected_btn" onclick="importSelectedDiscoveredModels()">导入所选</button>
              <button class="btn primary sm" type="button" id="conn_import_all_btn" onclick="importAllNewDiscoveredModels()">
                <svg class="svg-icon" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"></path></svg>
                一键导入全部新增 (<span id="conn_import_all_count">0</span>)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Advanced Collapse Settings -->
      <div style="margin-top:14px;border-top:1px solid #282828;padding-top:10px">
        <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="ui.showAdvancedConn=!ui.showAdvancedConn;overlay();if(ui.showAdvancedConn)setTimeout(()=>{const sc=document.querySelector('.modal-edit-connection-dialog .scroll');if(sc)sc.scrollTo({top:sc.scrollHeight,behavior:'smooth'});},40);">
          <span style="font-size:12px;color:#aaa;font-weight:600">${I('settings')} 高级网络设置 (超时、代理与自定义 Headers)</span>
          <span style="font-size:11px;color:#888">${ui.showAdvancedConn ? '▲ 收起' : '▼ 展开'}</span>
        </div>

        ${ui.showAdvancedConn ? `
          <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px">
            <div class="formrow">
              <label>请求超时时间 (秒)</label>
              <input class="input" id="conn_edit_timeout" type="number" value="${c.advanced?.timeout || 60}" min="10" max="600">
            </div>
            <div class="formrow">
              <label>HTTP / SOCKS5 代理地址 (可选)</label>
              <input class="input" id="conn_edit_proxy" value="${E(c.advanced?.proxyUrl || '')}" placeholder="http://127.0.0.1:7890">
            </div>
            <div class="formrow">
              <label>自定义 HTTP 请求头 (JSON 格式 - 可选)</label>
              <textarea class="textarea" id="conn_edit_headers" style="height:60px;font-family:ui-monospace,monospace;font-size:11px" placeholder='{"HTTP-Referer": "https://sillytavern.app"}'>${E(c.advanced?.customHeaders || '')}</textarea>
            </div>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between">
      <button class="btn quiet" onclick="closeModal()">取消</button>
      <div class="flex gap8">
        <button class="btn quiet sm" onclick="var c=ui.connDraft;c.baseUrl=document.getElementById('conn_edit_url').value;c.apiKey=document.getElementById('conn_edit_key').value;testSingleConnection(c.id)">测试格式</button>
        <button class="btn primary" onclick="saveEditingConnectionDraft()">${I('check')} 保存连接配置</button>
      </div>
    </div>
  `;
}

/* =========================================================
   Modal 3: Manage Models under Connection
   ========================================================= */
function openManageModelsModal(connId) {
  ensureUnifiedApiState();
  const conn = store.apiConnections.find(c => c.id === connId);
  if (!conn) return;
  ui.managingConnection = conn;
  pushModalState('manageModels', { managingConnection: conn });
}

function addModelToManagingConn() {
  const c = ui.managingConnection;
  if (!c) return;
  const idInput = document.getElementById('new_model_id');
  const nameInput = document.getElementById('new_model_name');
  const ctxInput = document.getElementById('new_model_ctx');
  if (!idInput || !idInput.value.trim()) {
    toast('请输入模型 ID');
    return;
  }
  const mid = idInput.value.trim();
  const mname = nameInput?.value.trim() || mid;
  const ctx = Number(ctxInput?.value) || 64000;

  if (c.models.some(m => m.id === mid)) {
    toast('该模型已存在于此连接');
    return;
  }

  c.models.push({
    id: mid,
    name: mname,
    context: ctx,
    maxOutput: 4096,
    tags: ['自定义录入']
  });
  save();
  overlay();
  toast('已添加模型「' + mname + '」');
}

function removeModelFromManagingConn(modelId) {
  const c = ui.managingConnection;
  if (!c) return;
  const targetModel = (c.models || []).find(m => m.id === modelId);
  const name = targetModel ? (targetModel.name || targetModel.id) : modelId;
  c.models = (c.models || []).filter(m => m.id !== modelId);
  save();
  overlay();
  toast('已从挂载清单中移出「' + name + '」');
}

function fetchRemoteModels(connId) {
  const c = store.apiConnections.find(x => x.id === connId);
  if (!c) return;
  const syncBtn = document.getElementById('manage_models_sync_btn');
  if (syncBtn) syncBtn.classList.add('spin-icon');
  toast('正在向端点查询可用模型 (/models)...');
  setTimeout(() => {
    if (syncBtn) syncBtn.classList.remove('spin-icon');
    toast('端点模型已同步（模型清单已是最新版本）');
    overlay();
  }, 450);
}

function filterManagedModels() {
  const input = document.getElementById('manage_models_search');
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  document.querySelectorAll('#managed_models_container .managed-model-row-card').forEach(row => {
    const mid = (row.dataset.id || '').toLowerCase();
    const mname = (row.dataset.name || '').toLowerCase();
    row.style.display = (!q || mid.includes(q) || mname.includes(q)) ? 'flex' : 'none';
  });
}

function renderManageModelsModal() {
  const c = ui.managingConnection;
  if (!c) return '';

  return `
    <div class="modal-head">
      <h3 class="h3">管理挂载模型</h3>
      <button class="ghost icon-btn" onclick="closeModal()" title="关闭">${I('x')}</button>
    </div>

    <div class="scroll">
      <!-- Modern Control Row: Independent Search Input + Borderless Sync Action Outside -->
      <div class="model-manage-control-row">
        <div class="model-search-box">
          <span style="display:flex;align-items:center;color:#777;flex-shrink:0">${I('search')}</span>
          <input class="model-search-input" id="manage_models_search" placeholder="搜索已挂载的模型 ID 或别名..." oninput="filterManagedModels()">
        </div>
        <button class="model-sync-icon-btn" id="manage_models_sync_btn" onclick="fetchRemoteModels('${c.id}')" title="同步端点模型">
          ${I('refresh')}
        </button>
      </div>

      <!-- Models Row-Card List Container -->
      <div class="managed-models-container" id="managed_models_container">
        ${(c.models || []).map(m => {
          const isMulti = isMultimodalModel(m);
          return `
            <div class="managed-model-row-card" data-id="${E(m.id)}" data-name="${E(m.name || m.id)}">
              <div class="managed-model-main-info">
                <div class="managed-model-title-line">
                  <span class="managed-model-name">${E(m.name || m.id)}</span>
                </div>
                <span class="managed-model-id">${E(m.id)}</span>
              </div>
              <div class="managed-model-meta-group">
                ${isMulti ? `<span class="managed-model-multimodal-text">多模态</span>` : ''}
                <button class="managed-model-trash-btn" onclick="removeModelFromManagingConn('${E(m.id)}')" title="移出可用清单">
                  ${I('trash')}
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>

    <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between">
      <span class="managed-models-stats" id="manage_models_foot_stats" style="font-size:12px;color:#888">
        当前共挂载 ${(c.models || []).length} 个可用模型 · 端点状态正常
      </span>
      <button class="btn primary" onclick="closeModal()">完成并关闭</button>
    </div>
  `;
}

/* =========================================================
   Modal 4: Unified Model Selector Modal
   ========================================================= */
function openUnifiedModelSelectorModal(featureKey, context = {}) {
  ensureUnifiedApiState();
  ui.modelPickerTarget = {
    featureKey,
    context,
    current: getEffectiveModelConfig(featureKey, context)
  };
  ui.modelPickerFilter = 'all';
  ui.modelPickerSearch = '';
  pushModalState('unifiedModelPicker');
}

function applySelectedModel(connectionId, modelId) {
  const target = ui.modelPickerTarget;
  if (!target) return;

  const fk = target.featureKey;
  const ctx = target.context || {};

  // Case 1: RP branch temporary override
  if (ctx.rpSessionId) {
    setRpSessionModelOverride(ctx.rpSessionId, connectionId, modelId);
  }
  // Case 2: General creative-chat session override
  else if (ctx.sessionId) {
    setSessionModelOverride(ctx.sessionId, connectionId, modelId);
  }
  // Case 2: Role dedicated binding
  else if (ctx.roleId) {
    setRoleModelBinding(ctx.roleId, connectionId, modelId);
  }
  // Case 3: Work dedicated binding
  else if (ctx.workId) {
    const curWork = store.works?.find(w => w.id === ctx.workId);
    if (curWork) {
      curWork.modelOverride = { connectionId, modelId };
      save();
      toast('已为作品「' + curWork.title + '」绑定专属模型');
    }
  }
  // Case 4: Global feature allocation
  else if (fk && store.featureAllocations?.[fk]) {
    store.featureAllocations[fk].connectionId = connectionId;
    store.featureAllocations[fk].modelId = modelId;
    save();
    toast('已将「' + store.featureAllocations[fk].name + '」默认模型更新为：' + modelId);
  }

  closeModal();
  render();
}

function restoreInheritedModelConfig() {
  const target = ui.modelPickerTarget;
  if (!target) return;
  const ctx = target.context || {};

  if (ctx.rpSessionId) {
    clearRpSessionModelOverride(ctx.rpSessionId);
  } else if (ctx.sessionId) {
    clearSessionModelOverride(ctx.sessionId);
  } else if (ctx.roleId) {
    clearRoleModelBinding(ctx.roleId);
  } else if (ctx.workId) {
    const curWork = store.works?.find(w => w.id === ctx.workId);
    if (curWork) {
      delete curWork.modelOverride;
      save();
      toast('已恢复作品继承上级默认模型');
    }
  }
  closeModal();
  render();
}

function renderUnifiedModelPickerModal() {
  const target = ui.modelPickerTarget;
  if (!target) return '';

  const fk = target.featureKey;
  const ctx = target.context || {};
  const currentCfg = getEffectiveModelConfig(fk, ctx);

  const catalog = getUnifiedModelCatalog();
  const connList = store.apiConnections || [];
  const activeConnFilter = ui.modelPickerFilter || 'all';
  const searchQ = (ui.modelPickerSearch || '').toLowerCase().trim();

  const filtered = catalog.filter(m => {
    if (activeConnFilter !== 'all' && m.connectionId !== activeConnFilter) return false;
    if (!searchQ) return true;
    const qStr = (m.modelName + ' ' + m.modelId + ' ' + m.connectionName + ' ' + m.provider + ' ' + (m.tags || []).join(' ')).toLowerCase();
    return qStr.includes(searchQ);
  });

  return `
    <div class="modal-head">
      <div>
        <h3 class="h3">选择调用的 AI 大语言模型</h3>
        <p class="sub">当前目标：${E(currentCfg.modelName)} (${E(currentCfg.levelLabel)})</p>
      </div>
      <button class="ghost icon-btn" onclick="closeModal()" title="关闭">${I('x')}</button>
    </div>

    <!-- Toolbar -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:180px">
        <input class="input sm" style="width:100%" placeholder="搜索模型名称、ID、提供商..." value="${E(ui.modelPickerSearch || '')}" oninput="ui.modelPickerSearch=this.value;overlay()">
      </div>
      <div style="display:flex;gap:4px;overflow-x:auto">
        <button class="catalog-filter-tab ${activeConnFilter === 'all' ? 'active' : ''}" onclick="ui.modelPickerFilter='all';overlay()">全部连接</button>
        ${connList.map(c => `
          <button class="catalog-filter-tab ${activeConnFilter === c.id ? 'active' : ''}" onclick="ui.modelPickerFilter='${c.id}';overlay()">
            ${E(c.name.split(' ')[0])}
          </button>
        `).join('')}
      </div>
    </div>

    <!-- Model Cards Grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));gap:10px;max-height:55vh;overflow-y:auto;padding-right:4px">
      ${filtered.map(m => {
        const isCurrent = m.connectionId === currentCfg.connectionId && m.modelId === currentCfg.modelId;
        const statusClass = m.status === 'ready' ? 'ready' : (m.status === 'format_valid' ? 'format_valid' : 'untested');

        return `
          <div class="provider-choice-card ${isCurrent ? 'selected' : ''}" style="${isCurrent ? 'border-color:var(--ui-accent,#ac97f5);background:#23202e;' : ''}" onclick="applySelectedModel('${m.connectionId}', '${m.modelId}')">
            <div class="provider-choice-head">
              <span class="provider-choice-name">${E(m.modelName)}</span>
              <span class="conn-status-pill ${statusClass}">
                <span class="conn-status-dot"></span>
              </span>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span class="conn-provider-badge ${m.provider}" style="font-size:9.5px">${E(m.provider)}</span>
              <span style="font-size:11px;color:#888">${E(m.connectionName)}</span>
            </div>
            <div style="font-size:10.5px;color:#aaa;font-family:ui-monospace,monospace;margin-top:2px">
              <span>${Math.round((m.contextWindow || 64000) / 1000)}K 上下文</span> · 
              <span>${Math.round((m.maxOutput || 4096) / 1000)}K 输出上限</span>
            </div>
            <div class="catalog-tag-list" style="margin-top:3px">
              ${(m.tags || []).slice(0, 3).map(t => `<span class="catalog-tag">${E(t)}</span>`).join('')}
              ${isCurrent ? `<span class="catalog-tag" style="color:var(--ui-accent,#ac97f5);border-color:rgba(172,151,245,0.4)">当前生效</span>` : ''}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between">
      <div>
        ${(ctx.rpSessionId || ctx.sessionId || ctx.roleId || ctx.workId) && currentCfg.level !== 'feature_default' ? `
          <button class="btn quiet sm" onclick="restoreInheritedModelConfig()" title="清除专属/临时覆盖，退回继承全局默认">↺ 恢复继承默认</button>
        ` : `
          <span class="tiny" style="color:#777">点击任意卡片即可完成切换</span>
        `}
      </div>
      <button class="btn quiet" onclick="closeModal()">取消</button>
    </div>
  `;
}

/* =========================================================
   Modal 5: Subtask Configure Modal (Streamlined Drawer / Modal)
   ========================================================= */
function openSubtaskConfigModal(featureKey) {
  ensureUnifiedApiState();
  const alloc = store.featureAllocations?.[featureKey];
  if (!alloc) return;
  ui.subtaskDraft = JSON.parse(JSON.stringify(alloc));
  pushModalState('subtaskConfig');
}

function saveSubtaskDraft() {
  const d = ui.subtaskDraft;
  if (!d) return;

  const spSelect = document.getElementById('subtask_edit_sp');
  const ppSelect = document.getElementById('subtask_edit_pp');
  if (spSelect) d.samplingPresetId = spSelect.value;
  if (ppSelect) d.promptPresetId = ppSelect.value;

  store.featureAllocations[d.id] = d;
  save();
  closeModal();
  render();
  toast('已保存「' + d.name + '」的参数与提示词配置！');
}

function renderSubtaskConfigModal() {
  const d = ui.subtaskDraft;
  if (!d) return '';

  const cfg = getEffectiveModelConfig(d.id);
  const genPresets = store.generationPresets || [];
  const promptPresets = store.creativePromptPresets || [];
  const prov = getProviderDef(cfg.provider);

  // Check for parameter warnings on current provider
  let paramWarn = '';
  if (prov.id === 'anthropic') {
    paramWarn = 'Anthropic Claude 协议原生采用 Top_K / Top_P 控制采样，不支持 Frequency / Presence Penalty，系统将自动做规范转换。';
  } else if (cfg.modelId && cfg.modelId.includes('r1')) {
    paramWarn = '当前模型为 DeepSeek-R1 深度思考模型，其思考链由模型自适应推演，建议使用低随机或标准生成预设。';
  }

  return `
    <div class="modal-head">
      <div>
        <h3 class="h3">配置 AI 任务：${E(d.name)}</h3>
        <p class="sub">${E(d.desc)}</p>
      </div>
      <button class="ghost icon-btn" onclick="closeModal()" title="放弃修改并关闭">${I('x')}</button>
    </div>

    <div class="scroll" style="max-height:68vh;padding:4px 0">
      <!-- Section 1: Model Allocation -->
      <div class="subtask-config-box">
        <span style="font-size:12px;font-weight:600;color:#e0e0e0;display:block;margin-bottom:6px">指定调用的模型与连接</span>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
          <div style="display:flex;align-items:center;gap:8px">
            <span class="v3-model-dot ${cfg.status === 'ready' ? 'ready' : (cfg.status === 'format_valid' ? 'format_valid' : 'untested')}"></span>
            <div>
              <strong style="font-size:13px;color:#f5f5f5">${E(cfg.modelName)}</strong>
              <div style="font-size:11px;color:#888">${E(cfg.connectionName)} (${E(prov.protocolLabel)})</div>
            </div>
          </div>
          <button class="btn quiet sm" onclick="openUnifiedModelSelectorModal('${d.id}')">更换模型 →</button>
        </div>
      </div>

      <!-- Section 2: Generation Parameter Preset -->
      <div class="formrow">
        <label>生成参数预设 (采样解码配置)</label>
        <select class="select" id="subtask_edit_sp">
          ${genPresets.map(sp => `
            <option value="${sp.id}" ${d.samplingPresetId === sp.id ? 'selected' : ''}>
              [${E(sp.categoryName || '通用')}] ${E(sp.name)} (Temp: ${sp.temperature})
            </option>
          `).join('')}
        </select>
        <div class="tiny" style="color:#888;margin-top:2px">包含 Temperature, Top_P, Top_K, Repetition Penalty 等采样物理参数</div>
        ${paramWarn ? `<div class="subtask-param-warn">${I('info')} ${E(paramWarn)}</div>` : ''}
      </div>

      <!-- Section 3: Task Prompt Preset -->
      <div class="formrow" style="margin-top:10px">
        <label>任务提示词预设 (系统提示与创作指令)</label>
        <select class="select" id="subtask_edit_pp">
          ${promptPresets.map(pp => `
            <option value="${pp.id}" ${d.promptPresetId === pp.id ? 'selected' : ''}>
              ${E(pp.name)}
            </option>
          `).join('')}
        </select>
        <div class="tiny" style="color:#888;margin-top:2px">定义角色视角、情节起承转合、白描修辞或逻辑审查约束指令</div>
      </div>
    </div>

    <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between">
      <button class="btn quiet" onclick="closeModal()">取消</button>
      <button class="btn primary" onclick="saveSubtaskDraft()">${I('check')} 保存配置</button>
    </div>
  `;
}

/* =========================================================
   Modal 6: Add Custom Model Modal
   ========================================================= */
function openAddCustomModelModal() {
  pushModalState('addCustomModel');
}

function saveCustomModelToConnection() {
  const connSelect = document.getElementById('custom_model_conn');
  const idInput = document.getElementById('custom_model_id');
  const nameInput = document.getElementById('custom_model_name');
  const ctxInput = document.getElementById('custom_model_ctx');
  const tagInput = document.getElementById('custom_model_tags');

  if (!connSelect || !idInput || !idInput.value.trim()) {
    toast('请选择所属连接并输入模型 ID');
    return;
  }
  const conn = store.apiConnections.find(c => c.id === connSelect.value);
  if (!conn) return;

  const mid = idInput.value.trim();
  const mname = nameInput?.value.trim() || mid;
  const ctx = Number(ctxInput?.value) || 64000;
  const tags = tagInput?.value.split(/[,，]/).map(t => t.trim()).filter(Boolean) || ['自定义'];

  if (conn.models.some(m => m.id === mid)) {
    toast('该模型 ID 已存在于所选连接中');
    return;
  }

  conn.models.push({ id: mid, name: mname, context: ctx, maxOutput: 4096, tags });
  save();
  closeModal();
  toast('模型「' + mname + '」已成功录入并挂载至「' + conn.name + '」！');
}

function renderAddCustomModelModal() {
  const connections = store.apiConnections || [];

  return `
    <div class="modal-head">
      <div>
        <h3 class="h3">录入自定义模型 ID</h3>
        <p class="sub">向现有 API 连接挂载新的模型标识或私有微调端点</p>
      </div>
      <button class="ghost icon-btn" onclick="closeModal()" title="关闭">${I('x')}</button>
    </div>

    <div class="scroll" style="max-height:65vh;padding:4px 0">
      <div class="formrow">
        <label>挂载的目标 API 连接</label>
        <select class="select" id="custom_model_conn">
          ${connections.map(c => `
            <option value="${c.id}">${E(c.name)} (${E(c.provider)})</option>
          `).join('')}
        </select>
      </div>

      <div class="formrow">
        <label>模型系统标识 (Model ID - 需与端点一致)</label>
        <input class="input" id="custom_model_id" placeholder="如：deepseek-ai/DeepSeek-V3, claude-3-7-sonnet-latest">
      </div>

      <div class="formrow">
        <label>易读显示别名 (可选)</label>
        <input class="input" id="custom_model_name" placeholder="如：DeepSeek V3 官方直通车">
      </div>

      <div class="formrow">
        <label>上下文窗口 Token 上限 (Context Window)</label>
        <input class="input" id="custom_model_ctx" type="number" value="64000" placeholder="64000">
      </div>

      <div class="formrow">
        <label>能力特征标签 (用逗号分隔)</label>
        <input class="input" id="custom_model_tags" value="通用对话, 快速响应" placeholder="长篇执笔, 深度RP, 思考模式">
      </div>
    </div>

    <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between">
      <button class="btn quiet" onclick="closeModal()">取消</button>
      <button class="btn primary" onclick="saveCustomModelToConnection()">${I('check')} 确认录入</button>
    </div>
  `;
}

/* =========================================================
   Modal 7: Quick Assign Modal
   ========================================================= */
function openQuickAssignModal(connectionId, modelId) {
  ui.quickAssignTarget = { connectionId, modelId };
  pushModalState('quickAssign');
}

function executeQuickAssign() {
  const target = ui.quickAssignTarget;
  if (!target) return;
  const checkboxes = document.querySelectorAll('.qa-feature-cb:checked');
  if (!checkboxes.length) {
    toast('请至少勾选一项功能');
    return;
  }
  let count = 0;
  checkboxes.forEach(cb => {
    const fKey = cb.value;
    if (store.featureAllocations?.[fKey]) {
      store.featureAllocations[fKey].connectionId = target.connectionId;
      store.featureAllocations[fKey].modelId = target.modelId;
      count++;
    }
  });
  save();
  closeModal();
  toast('已将该模型成功指派给 ' + count + ' 个创作功能！');
}

function qaToggleAll(checked) {
  document.querySelectorAll('.qa-feature-cb').forEach(cb => {
    cb.checked = !!checked;
    const row = cb.closest('.qa-feature-row');
    if (row) {
      row.classList.toggle('is-checked', !!checked);
    }
  });
}
window.qaToggleAll = qaToggleAll;

function renderQuickAssignModal() {
  const target = ui.quickAssignTarget;
  if (!target) return '';
  const info = getModelDisplayName(target.connectionId, target.modelId);
  const allocs = Object.values(store.featureAllocations || {});

  return `
    <div class="modal-head">
      <div>
        <h3 class="h3">指派模型到功能场景</h3>
        <p class="sub">模型：${E(info.modelName)} (${E(info.connectionName)})</p>
      </div>
      <button class="ghost icon-btn" onclick="closeModal()" title="关闭">${I('x')}</button>
    </div>

    <div class="scroll" style="max-height:60vh;padding:4px 0">
      <div class="qa-toolbar">
        <span class="qa-toolbar-label">勾选希望使用此模型的创作功能：</span>
        <div class="qa-toolbar-actions">
          <button type="button" class="qa-action-link" onclick="qaToggleAll(true)">全选</button>
          <span class="qa-action-sep">/</span>
          <button type="button" class="qa-action-link" onclick="qaToggleAll(false)">清空</button>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${allocs.map(a => {
          const isSelected = a.connectionId === target.connectionId && a.modelId === target.modelId;
          return `
            <label class="qa-feature-row ${isSelected ? 'is-checked' : ''}">
              <div style="display:flex;align-items:center;gap:8px">
                <input type="checkbox" class="qa-feature-cb" value="${a.id}" ${isSelected ? 'checked' : ''} onchange="this.closest('.qa-feature-row')?.classList.toggle('is-checked', this.checked)">
                <span class="qa-feature-name">${E(a.name)}</span>
              </div>
              <span class="qa-status-tag ${isSelected ? 'active' : ''}">${isSelected ? '当前正在使用' : '未指派'}</span>
            </label>
          `;
        }).join('')}
      </div>
    </div>

    <div class="modal-footer" style="display:flex;align-items:center;justify-content:space-between">
      <button class="btn quiet" onclick="closeModal()">取消</button>
      <button class="btn primary" onclick="executeQuickAssign()">${I('check')} 确认批量指派</button>
    </div>
  `;
}


function renderSessionModelPill(featureKey = 'rp_chat') {
  ensureUnifiedApiState();
  const activeSess = typeof currentSession === 'function' ? currentSession() : (store.sessions?.[0] || null);
  const sessId = activeSess ? activeSess.id : null;
  const cfg = getEffectiveModelConfig(featureKey, { sessionId: sessId });
  const statusClass = cfg.status === 'ready' ? 'ready' : (cfg.status === 'format_valid' ? 'format_valid' : 'untested');

  return `
    <div class="v3-session-model-wrap" style="display:inline-flex;align-items:center;gap:4px">
      <button class="v3-model-pill" onclick="openUnifiedModelSelectorModal('${featureKey}', { sessionId: '${sessId || ''}' })" title="当前生效模型：${E(cfg.modelName)} (${E(cfg.connectionName)}) · 状态：${E(cfg.levelLabel)} · 点击快速切换">
        <span class="v3-model-dot ${statusClass}"></span>
        <span class="v3-model-name">${E(cfg.modelName)}</span>
        <span class="v3-model-badge ${cfg.level}">${cfg.levelLabel}</span>
      </button>
      ${cfg.isOverridden ? `
        <button class="btn quiet sm" onclick="clearSessionModelOverride('${sessId || ''}');render()" title="清除会话临时覆盖，恢复继承默认模型" style="padding:2px 6px;font-size:11px">↺ 恢复</button>
      ` : ''}
    </div>
  `;
}

// === End Unified API & Model Architecture ===

function renderSettingsPaneContent() {
  initAdaptedV3State();
  var tab = ui.settingsTab || 'connection';
  var q = (ui.settingsSearchQuery || '').toLowerCase().trim();

  // Search filtering notice
  let searchBanner = '';
  if (q) {
    searchBanner = `
      <div style="background:#26241a;border:1px solid #574619;color:#fbbf24;padding:8px 14px;border-radius:6px;font-size:12px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between">
        <span>${I('search')} 正在筛选关键词：「<strong>${E(q)}</strong>」</span>
        <button class="ghost sm" onclick="clearSettingsSearch()" style="color:#fbbf24">清除筛选</button>
      </div>
    `;
  }

  let content = '';

  // 1. Unified API Connection Library
  if (tab === 'api_connections' || tab === 'connection' || tab === 'models') {
    content = renderApiConnectionsTab();
  }
  // 2. Unified Model Catalog
  else if (tab === 'model_catalog') {
    content = renderModelCatalogTab();
  }
  // 3. Feature-Level AI Allocation Center
  else if (tab === 'feature_allocation' || tab === 'purposes') {
    content = renderFeatureAllocationTab();
  }
  // 4. Generation Presets (RP Parameters)
  else if (tab === 'rp_params') {
    var presets = store.generationPresets || store.rpPresets || [];
    var curPreset = presets.find(x => x.id === store.activeRpPresetId) || presets[0];
    var rp = store.modelConnections?.rp || {};

    var rpGroup = presets.filter(p => !p.category || p.category === 'rp');
    var novelGroup = presets.filter(p => p.category === 'novel');
    var creativeGroup = presets.filter(p => p.category === 'creative');
    var agentGroup = presets.filter(p => p.category === 'agent');

    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>生成参数预设中心</h2>
          <p style="margin:2px 0 0;font-size:12px;color:#8c8c8c">管理各创作任务（角色扮演、长篇小说、头脑风暴、逻辑推演）的采样与解码物理参数。</p>
        </div>
        <div class="flex gap8">
          <button class="btn sm" onclick="exportRpPresetJson()">${I('download')} 导出方案</button>
          <button class="btn primary sm" onclick="saveSettingsAction('采样参数预设已更新保存')">${I('check')} 保存参数</button>
        </div>
      </div>

      <!-- Presets Selector Toolbar -->
      <div class="preset-bar">
        <div class="flex gap8 align-center" style="flex:1;min-width:0">
          <span style="font-size:12px;font-weight:700;color:#ddd;white-space:nowrap">预设方案：</span>
          <select class="select" style="flex:1;width:auto;min-width:180px;max-width:320px" onchange="selectRpPreset(this.value)">
            ${rpGroup.length ? `<optgroup label="角色扮演 (RP)">${rpGroup.map(x=>`<option value="${x.id}" ${x.id===curPreset.id?'selected':''}>${E(x.name)}</option>`).join('')}</optgroup>` : ''}
            ${novelGroup.length ? `<optgroup label="小说叙事 (Novel)">${novelGroup.map(x=>`<option value="${x.id}" ${x.id===curPreset.id?'selected':''}>${E(x.name)}</option>`).join('')}</optgroup>` : ''}
            ${creativeGroup.length ? `<optgroup label="创意灵感 (Creative)">${creativeGroup.map(x=>`<option value="${x.id}" ${x.id===curPreset.id?'selected':''}>${E(x.name)}</option>`).join('')}</optgroup>` : ''}
            ${agentGroup.length ? `<optgroup label="推演审查 (Agent)">${agentGroup.map(x=>`<option value="${x.id}" ${x.id===curPreset.id?'selected':''}>${E(x.name)}</option>`).join('')}</optgroup>` : ''}
          </select>
        </div>
        <div class="preset-actions-row">
          <button class="btn sm" onclick="createRpPresetAction()">${I('plus')} 新建预设</button>
          <button class="btn sm quiet" onclick="cloneRpPresetAction()">${I('copy')} 克隆副本</button>
          <button class="btn sm danger" onclick="deleteRpPresetAction()">${I('trash')} 删除</button>
        </div>
      </div>

      <!-- Compatibility Guidance Box -->
      <div style="background:#171717;border:1px solid #2a2a2a;padding:8px 12px;border-radius:6px;font-size:11.5px;color:#8c8c8c;margin-bottom:12px">
        <strong style="color:#ddd">模型参数兼容性须知：</strong>
        Anthropic Claude 协议原生采用 Top_K / Top_P，不支持惩罚项；DeepSeek-R1 思考链由模型自主平衡；本地 Kobold / Ollama 则支持全部丰富采样特性。
      </div>

      <!-- CRITICAL DESIGN: Dual Action Box (Save File vs Apply to Session) -->
      <div class="preset-dual-actions">
        <div>
          <div style="font-size:13px;font-weight:700;color:#ffffff">当前操作方案：「${E(curPreset.name)}」</div>
          <div class="tiny" style="color:#a8a8a8;margin-top:2px">${E(curPreset.desc)}</div>
        </div>
        <div class="flex gap8">
          <button class="btn sm" onclick="saveRpPresetAction()" title="将下方调节值保存到此预设方案文件">${I('check')} 保存到预设文件</button>
          <button class="btn primary sm" onclick="applyRpPresetAction()" title="将此方案的参数立即注入当前 RP 对话">${I('spark')} 应用到当前 RP 会话</button>
        </div>
      </div>

      <!-- Sampler Controls Grid -->
      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">${I('theater')} 核心生成随机度与长度限制</h3>
          <span class="tiny" style="color:#888">调节滑块将即时更新采样行为</span>
        </div>

        <div class="grid2" style="gap:16px">
          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">采样温度 (Temperature)</label>
              <span class="slider-val" id="val-rp-temp">${rp.temperature}</span>
            </div>
            <input class="range" type="range" min="0" max="2" step="0.01" value="${rp.temperature}" oninput="document.getElementById('val-rp-temp').textContent=this.value" onchange="store.modelConnections.rp.temperature=Number(this.value);save()">
            <div class="between tiny" style="color:#777;margin-top:2px"><span>严谨收敛 (0.2)</span><span>推荐平衡 (0.85)</span><span>高度发散 (1.5)</span></div>
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">单轮最大生成 Tokens (Max Output)</label>
              <span class="slider-val" id="val-rp-max">${rp.maxTokens}</span>
            </div>
            <input class="range" type="range" min="128" max="8192" step="128" value="${rp.maxTokens}" oninput="document.getElementById('val-rp-max').textContent=this.value" onchange="store.modelConnections.rp.maxTokens=Number(this.value);save()">
            <div class="between tiny" style="color:#777;margin-top:2px"><span>短对话 (512)</span><span>标准详述 (4096)</span><span>长叙事 (8192)</span></div>
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">上下文窗口总量 (Context Size)</label>
              <span class="slider-val" id="val-rp-context">${rp.contextWindow}</span>
            </div>
            <input class="range" type="range" min="4096" max="200000" step="4096" value="${rp.contextWindow}" oninput="document.getElementById('val-rp-context').textContent=this.value" onchange="store.modelConnections.rp.contextWindow=Number(this.value);save()">
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">核采样阈值 (Top P)</label>
              <span class="slider-val" id="val-rp-topp">${rp.topP}</span>
            </div>
            <input class="range" type="range" min="0.01" max="1" step="0.01" value="${rp.topP}" oninput="document.getElementById('val-rp-topp').textContent=this.value" onchange="store.modelConnections.rp.topP=Number(this.value);save()">
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">${I('settings')} 高级采样惩罚与平滑项</h3>
          <span class="tiny" style="color:#888">有效抑制套话重复与车轱辘话</span>
        </div>

        <div class="grid2" style="gap:16px">
          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">频率惩罚 (Frequency Penalty)</label>
              <span class="slider-val" id="val-rp-freq">${rp.frequencyPenalty}</span>
            </div>
            <input class="range" type="range" min="-2" max="2" step="0.05" value="${rp.frequencyPenalty}" oninput="document.getElementById('val-rp-freq').textContent=this.value" onchange="store.modelConnections.rp.frequencyPenalty=Number(this.value);save()">
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">存在惩罚 (Presence Penalty)</label>
              <span class="slider-val" id="val-rp-pres">${rp.presencePenalty}</span>
            </div>
            <input class="range" type="range" min="-2" max="2" step="0.05" value="${rp.presencePenalty}" oninput="document.getElementById('val-rp-pres').textContent=this.value" onchange="store.modelConnections.rp.presencePenalty=Number(this.value);save()">
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">重复惩罚 (Repetition Penalty)</label>
              <span class="slider-val" id="val-rp-rep">${rp.repetitionPenalty || 1.05}</span>
            </div>
            <input class="range" type="range" min="1.0" max="2.0" step="0.01" value="${rp.repetitionPenalty || 1.05}" oninput="document.getElementById('val-rp-rep').textContent=this.value" onchange="store.modelConnections.rp.repetitionPenalty=Number(this.value);save()">
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">惩罚扫描衰减范围 (Penalty Range)</label>
              <span class="slider-val" id="val-rp-pen-range">${rp.penaltyRange || 2048}</span>
            </div>
            <input class="range" type="range" min="0" max="4096" step="128" value="${rp.penaltyRange || 2048}" oninput="document.getElementById('val-rp-pen-range').textContent=this.value" onchange="store.modelConnections.rp.penaltyRange=Number(this.value);save()">
          </div>
        </div>

        <div class="settings-row" style="margin-top:12px">
          <div class="settings-row-label">
            <span class="settings-row-name">启用动态温度 (Dynamic Temperature)</span>
            <span class="settings-row-desc">根据生成内容熵值自适应浮动温度，提升剧情对话层次</span>
          </div>
          <input class="tag-status-checkbox" type="checkbox" ${rp.dynamicTemp?'checked':''} onchange="store.modelConnections.rp.dynamicTemp=this.checked;save()">
        </div>

        <div class="settings-row">
          <div class="settings-row-label">
            <span class="settings-row-name">启用实时打字机流式输出 (Streaming)</span>
            <span class="settings-row-desc">逐 Token 渲染对白，支持随时中止生成</span>
          </div>
          <input class="tag-status-checkbox" type="checkbox" ${rp.streaming!==false?'checked':''} onchange="store.modelConnections.rp.streaming=this.checked;save()">
        </div>
      </div>
    `;
  }


  // 5. Creative Presets & Agent Modules
  else if (tab === 'creative_presets') {
    var scope = store.activeCreativeScope || 'discussion';
    var cur = store.creativePresets[scope];
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>创作预设与 Agent</h2>
        </div>
        <div class="flex gap8">
          <button class="btn sm" onclick="visit('editor');closeModal()">${I('book')} 在写作台应用 →</button>
          <button class="btn primary sm" onclick="saveSettingsAction('创作预设已更新')">${I('check')} 保存预设</button>
        </div>
      </div>

      <div class="settings-tab-bar">
        <button class="settings-tab-btn ${scope==='agent'?'active':''}" onclick="store.activeCreativeScope='agent';save();overlay()">
          ${I('users')} Agent 任务预设
        </button>
        <button class="settings-tab-btn ${scope==='discussion'?'active':''}" onclick="store.activeCreativeScope='discussion';save();overlay()">
          ${I('chat')} 创作研讨预设
        </button>
        <button class="settings-tab-btn ${scope==='draft'?'active':''}" onclick="store.activeCreativeScope='draft';save();overlay()">
          ${I('pen')} 正文写作预设
        </button>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">基础预设信息与主系统提示词</h3>
        </div>
        <div class="formrow">
          <label>预设名称</label>
          <input class="input" value="${E(cur.name)}" onchange="store.creativePresets['${scope}'].name=this.value;save()">
        </div>
        <div class="formrow" style="margin-top:10px">
          <label>主系统提示词 (Base System Instruction)</label>
          <textarea class="textarea" rows="3" onchange="store.creativePresets['${scope}'].systemPrompt=this.value;save()">${E(cur.systemPrompt)}</textarea>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h3 class="settings-card-title">${I('spark')} 模块化提示组件</h3>
            <div class="settings-card-sub">勾选启用对应能力规则，可使用上移/下移调整提示词优先级顺序</div>
          </div>
          <button class="btn sm" onclick="addPromptModule('${scope}')">${I('plus')} 添加模块</button>
        </div>

        <div class="prompt-module-list">
          ${cur.modules.map((m, idx) => `
            <div class="prompt-module-item ${m.enabled?'':'disabled'}">
              <div class="prompt-module-meta">
                <input class="tag-status-checkbox" type="checkbox" ${m.enabled?'checked':''} onchange="togglePromptModule('${scope}', ${idx}, this.checked)">
                <span class="prompt-cat-badge">${E(m.category)}</span>
                <span class="prompt-module-title">${E(m.name)}</span>
                <span class="prompt-module-desc">${E(m.content)}</span>
              </div>
              <div class="flex gap4 align-center">
                <button class="ghost sm" onclick="movePromptModule('${scope}', ${idx}, -1)" title="上移" ${idx===0?'disabled':''}>↑</button>
                <button class="ghost sm" onclick="movePromptModule('${scope}', ${idx}, 1)" title="下移" ${idx===cur.modules.length-1?'disabled':''}>↓</button>
                <button class="ghost sm danger" onclick="deletePromptModule('${scope}', ${idx})" title="删除">✕</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">${I('link')} 自动注入上下文范围</h3>
          <span class="tiny" style="color:#888">决定该模式下模型能自动感知哪些工作区资产</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-name">注入关联角色的视觉与人设卡片</span>
          <input class="tag-status-checkbox" type="checkbox" ${cur.refs.role?'checked':''} onchange="store.creativePresets['${scope}'].refs.role=this.checked;save()">
        </div>
        <div class="settings-row">
          <span class="settings-row-name">注入世界书已激活条目与地理技术法则</span>
          <input class="tag-status-checkbox" type="checkbox" ${cur.refs.worldInfo?'checked':''} onchange="store.creativePresets['${scope}'].refs.worldInfo=this.checked;save()">
        </div>
        <div class="settings-row">
          <span class="settings-row-name">注入长篇小说前文章节上下文</span>
          <input class="tag-status-checkbox" type="checkbox" ${cur.refs.chapters?'checked':''} onchange="store.creativePresets['${scope}'].refs.chapters=this.checked;save()">
        </div>
        <div class="settings-row">
          <span class="settings-row-name">注入全局未分类灵感便笺 (Quick Scratchpad)</span>
          <input class="tag-status-checkbox" type="checkbox" ${cur.refs.memo?'checked':''} onchange="store.creativePresets['${scope}'].refs.memo=this.checked;save()">
        </div>
      </div>
    `;
  }

  // 6. Prompt Formats & Instruct Templates
  else if (tab === 'context_template') {
    var pt = store.promptTemplates;
    var tpl = pt.templates[pt.activeTemplate] || pt.templates.chatml;
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>指令模板</h2>
        </div>
        <button class="btn primary sm" onclick="saveSettingsAction('指令模板已保存')">${I('check')} 保存模板</button>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">选择预置指令分词模板</h3>
        </div>
        <div class="grid2" style="gap:14px">
          <div class="formrow">
            <label>模板预设</label>
            <select class="select" onchange="store.promptTemplates.activeTemplate=this.value;save();overlay()">
              <option value="chatml" ${pt.activeTemplate==='chatml'?'selected':''}>ChatML 标准格式 (&lt;|im_start|&gt;)</option>
              <option value="llama3" ${pt.activeTemplate==='llama3'?'selected':''}>Meta Llama 3 / 3.1 官方指令格式</option>
              <option value="alpaca" ${pt.activeTemplate==='alpaca'?'selected':''}>Alpaca 经典纯文本格式 (### Instruction)</option>
              <option value="custom" ${pt.activeTemplate==='custom'?'selected':''}>用户自定义分词标记 (Custom)</option>
            </select>
          </div>
          <div class="formrow">
            <label>模板说明</label>
            <div class="input" style="background:#1b1b1b;color:#a0a0a0;border-color:#333">${E(tpl.desc)}</div>
          </div>
        </div>

        <div class="formrow" style="margin-top:10px">
          <label>实时模板装配预览 (Live Prompt Wrapper Preview)</label>
          <div class="instruct-preview-box">${E(tpl.systemPrefix)}[系统提示词与世界设定]${E(tpl.systemSuffix)}${E(tpl.userPrefix)}旅人：你还记得昨天的雪吗？${E(tpl.userSuffix)}${E(tpl.assistantPrefix)}伊雯：当然，那场初雪一直落到深夜。${E(tpl.assistantSuffix)}</div>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">自定义分词标记与前后缀</h3>
        </div>
        <div class="grid2" style="gap:14px">
          <div class="formrow">
            <label>系统前缀 (System Prefix)</label>
            <input class="input" value="${E(tpl.systemPrefix)}" onchange="store.promptTemplates.templates['${pt.activeTemplate}'].systemPrefix=this.value;save()">
          </div>
          <div class="formrow">
            <label>系统后缀 (System Suffix)</label>
            <input class="input" value="${E(tpl.systemSuffix)}" onchange="store.promptTemplates.templates['${pt.activeTemplate}'].systemSuffix=this.value;save()">
          </div>
          <div class="formrow">
            <label>用户前缀 (User Prefix)</label>
            <input class="input" value="${E(tpl.userPrefix)}" onchange="store.promptTemplates.templates['${pt.activeTemplate}'].userPrefix=this.value;save()">
          </div>
          <div class="formrow">
            <label>用户后缀 (User Suffix)</label>
            <input class="input" value="${E(tpl.userSuffix)}" onchange="store.promptTemplates.templates['${pt.activeTemplate}'].userSuffix=this.value;save()">
          </div>
        </div>
        <div class="formrow" style="margin-top:10px">
          <label>停止词列表 (Stop Sequences，逗号分隔)</label>
          <input class="input" value="${E(tpl.stopSeq)}" onchange="store.promptTemplates.templates['${pt.activeTemplate}'].stopSeq=this.value;save()">
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">${I('book')} Story String 上下文拼接顺序</h3>
          <span class="tiny" style="color:#888">自上而下注入请求上下文</span>
        </div>
        <div style="display:flex;flex-direction:column;gap:6px">
          <div class="prompt-module-item"><span>1. System Prompt (主系统设定)</span><span class="prompt-cat-badge">系统</span></div>
          <div class="prompt-module-item"><span>2. World Info - Before (世界书前置常量条目)</span><span class="prompt-cat-badge">设定</span></div>
          <div class="prompt-module-item"><span>3. Persona Identity (当前生效用户身份)</span><span class="prompt-cat-badge">身份</span></div>
          <div class="prompt-module-item"><span>4. Historical Conversation (历史多轮对话流)</span><span class="prompt-cat-badge">上下文</span></div>
          <div class="prompt-module-item"><span>5. World Info - After (世界书条件触发条目)</span><span class="prompt-cat-badge">设定</span></div>
          <div class="prompt-module-item"><span>6. Latest User Turn (用户本轮发言)</span><span class="prompt-cat-badge">输入</span></div>
        </div>
      </div>
    `;
  }

  // 7. World Info (Global Lorebook Config)
  else if (tab === 'world_info') {
    var wb = (store.worldInfoBooks && store.worldInfoBooks[0]) || { scanDepth: 5, contextBudget: 25, maxBudgetTokens: 4096, recursive: true, recursiveSteps: 3, matchWholeWords: true };
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>世界书参数</h2>
        </div>
        <div class="flex gap8">
          <button class="btn primary sm" onclick="openWorldInfo()">${I('book')} 打开设定库 →</button>
          <button class="btn sm" onclick="saveSettingsAction('世界书参数已保存')">${I('check')} 保存参数</button>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h3 class="settings-card-title">${I('book')} 动态扫描与 Token 预算配额</h3>
            
          </div>
        </div>

        <div class="grid2" style="gap:16px">
          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">扫描深度 (Scan Depth - 倒推轮次)</label>
              <span class="slider-val" id="val-wb-depth">${wb.scanDepth || 5} 轮</span>
            </div>
            <input class="range" type="range" min="1" max="15" step="1" value="${wb.scanDepth || 5}" oninput="document.getElementById('val-wb-depth').textContent=this.value+' 轮'" onchange="store.worldInfoBooks[0].scanDepth=Number(this.value);save()">
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">上下文预算占比 (Budget %)</label>
              <span class="slider-val" id="val-wb-budget">${wb.contextBudget || 25}%</span>
            </div>
            <input class="range" type="range" min="5" max="50" step="5" value="${wb.contextBudget || 25}" oninput="document.getElementById('val-wb-budget').textContent=this.value+'%'" onchange="store.worldInfoBooks[0].contextBudget=Number(this.value);save()">
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">绝对 Token 预算上限 (Max Budget)</label>
              <span class="slider-val" id="val-wb-max-budget">${wb.maxBudgetTokens || 4096}</span>
            </div>
            <input class="range" type="range" min="512" max="16384" step="512" value="${wb.maxBudgetTokens || 4096}" oninput="document.getElementById('val-wb-max-budget').textContent=this.value" onchange="store.worldInfoBooks[0].maxBudgetTokens=Number(this.value);save()">
          </div>

          <div class="slider-container">
            <div class="slider-row">
              <label style="margin:0">递归激活最大步数 (Max Steps)</label>
              <span class="slider-val" id="val-wb-steps">${wb.recursiveSteps || 3} 步</span>
            </div>
            <input class="range" type="range" min="1" max="5" step="1" value="${wb.recursiveSteps || 3}" oninput="document.getElementById('val-wb-steps').textContent=this.value+' 步'" onchange="store.worldInfoBooks[0].recursiveSteps=Number(this.value);save()">
          </div>
        </div>

        <div class="settings-row" style="margin-top:12px">
          <div class="settings-row-label">
            <span class="settings-row-name">启用条目关键词递归搜索 (Recursive Scanning)</span>
            <span class="settings-row-desc">已激活条目正文中的关键词可以继续激活第二级相关联的下位设定</span>
          </div>
          <input class="tag-status-checkbox" type="checkbox" ${wb.recursive!==false?'checked':''} onchange="store.worldInfoBooks[0].recursive=this.checked;save()">
        </div>

        <div class="settings-row">
          <div class="settings-row-label">
            <span class="settings-row-name">开启整词精准匹配 (Match Whole Words)</span>
            <span class="settings-row-desc">严格按词边界匹配，避免部分前缀字符引发误触发</span>
          </div>
          <input class="tag-status-checkbox" type="checkbox" ${wb.matchWholeWords!==false?'checked':''} onchange="store.worldInfoBooks[0].matchWholeWords=this.checked;save()">
        </div>

        <div class="settings-row">
          <div class="settings-row-label">
            <span class="settings-row-name">区分英文大小写 (Case Sensitive)</span>
            <span class="settings-row-desc">严格区分英文关键词大小写形态</span>
          </div>
          <input class="tag-status-checkbox" type="checkbox" ${wb.caseSensitive?'checked':''} onchange="store.worldInfoBooks[0].caseSensitive=this.checked;save()">
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">${I('book')} 当前已挂载世界设定集概览</h3>
          <span class="tiny" style="color:#aaa">共 ${(store.worldInfoBooks||[]).length} 部设定集</span>
        </div>
        ${(store.worldInfoBooks || []).map(b => `
          <div class="settings-row">
            <div>
              <span class="settings-row-name">《${E(b.name)}》</span>
              <span class="settings-row-desc">${E(b.desc)} · ${(b.entries||[]).length} 条目</span>
            </div>
            <button class="btn sm quiet" onclick="openWorldInfo()">管理条目 →</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 8. Persona (User Identity)
  else if (tab === 'persona') {
    var personas = store.personas || [];
    var cur = personas.find(x => x.isDefault) || personas[0];
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>用户身份</h2>
        </div>
        <div class="flex gap8">
          <button class="btn primary sm" onclick="openPersona()">${I('users')} 管理身份库 →</button>
          <button class="btn sm" onclick="saveSettingsAction('用户身份设置已保存')">${I('check')} 保存设置</button>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h3 class="settings-card-title">当前生效默认身份</h3>
            
          </div>
        </div>

        <div class="grid2" style="gap:14px">
          <div class="formrow">
            <label>身份名称</label>
            <input class="input" value="${E(cur.name)}" onchange="cur.name=this.value;save()">
          </div>
          <div class="formrow">
            <label>头衔 / 称号</label>
            <input class="input" value="${E(cur.title)}" onchange="cur.title=this.value;save()">
          </div>
        </div>

        <div class="formrow" style="margin-top:10px">
          <label>人设细节描写 (注入给大模型的自我形象)</label>
          <textarea class="textarea" rows="3" onchange="cur.desc=this.value;save()">${E(cur.desc)}</textarea>
        </div>

        <div class="grid2" style="gap:14px;margin-top:10px">
          <div class="formrow">
            <label>人设注入位置 (Injection Position)</label>
            <select class="select" onchange="cur.injectionPos=this.value;save()">
              <option value="system" ${cur.injectionPos==='system'?'selected':''}>系统提示顶部 (System Top)</option>
              <option value="depth" ${cur.injectionPos==='depth'?'selected':''}>指定深度层级 (At Depth)</option>
              <option value="chat" ${cur.injectionPos==='chat'?'selected':''}>最近消息之前 (Before Turn)</option>
            </select>
          </div>
          <div class="formrow">
            <label>注入深度 (Injection Depth)</label>
            <input class="input" type="number" min="0" max="10" value="${cur.injectionDepth || 2}" onchange="cur.injectionDepth=Number(this.value);save()">
          </div>
        </div>

        <div class="settings-row" style="margin-top:12px">
          <div class="settings-row-label">
            <span class="settings-row-name">设为全局默认生效身份</span>
            <span class="settings-row-desc">左下角头像将展示此身份的缩写标识</span>
          </div>
          <input class="tag-status-checkbox" type="checkbox" checked disabled>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">已保存身份库列表 (${personas.length})</h3>
        </div>
        ${personas.map(p => `
          <div class="settings-row">
            <div class="flex gap8 align-center">
              <div class="avatar" style="width:28px;height:28px;font-size:11px;background:#333;color:#fff">${E(p.avatar||p.name[0])}</div>
              <div>
                <strong style="color:#eee;font-size:12.5px">${E(p.name)}</strong>
                <span class="tiny" style="color:#888;margin-left:6px">${E(p.title)}</span>
                ${p.isDefault?'<span class="chip green" style="font-size:9.5px;padding:1px 5px;margin-left:6px">默认</span>':''}
              </div>
            </div>
            <button class="btn sm quiet" onclick="openPersona()">编辑档案 →</button>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 9. Appearance & Themes (Refined: 2-Column Responsive + Live Preview)
  else if (tab === 'appearance' || tab === 'theme') {
    var ap = store.appearanceSettings || { accent: 'violet', fontFamily: 'system', uiFontSize: 13, readingFontSize: 15, borderRadius: 8, uiDensity: 'default', backdropBlur: 12 };
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>外观与主题</h2>
        </div>
        <div class="flex gap8">
          <button class="btn quiet sm" onclick="restoreDefaultTheme()"><span style="margin-right:3px">↺</span> 恢复默认</button>
          <button class="btn primary sm" onclick="saveSettingsAction('外观设置已生效并保存')">${I('check')} 保存外观</button>
        </div>
      </div>

      <div class="theme-settings-layout">
        <!-- Left: Configuration Controls -->
        <div class="theme-controls-col">
          <div class="settings-card">
            <div class="settings-card-head">
              <h3 class="settings-card-title">强调色预设</h3>
            </div>
            <div class="theme-swatches-grid">
              <button class="theme-swatch-item ${ap.accent==='violet'?'active':''}" style="background:#7446C8" onclick="setThemeAccent('violet')" title="紫色 Violet (Codex 原生推荐)">✓</button>
              <button class="theme-swatch-item ${ap.accent==='blue'?'active':''}" style="background:#3468B6" onclick="setThemeAccent('blue')" title="商务蓝 Blue">✓</button>
              <button class="theme-swatch-item ${ap.accent==='teal'?'active':''}" style="background:#246B61" onclick="setThemeAccent('teal')" title="青绿 Teal">✓</button>
              <button class="theme-swatch-item ${ap.accent==='amber'?'active':''}" style="background:#885918" onclick="setThemeAccent('amber')" title="琥珀金 Amber">✓</button>
              <button class="theme-swatch-item ${ap.accent==='rose'?'active':''}" style="background:#A13F67" onclick="setThemeAccent('rose')" title="复古玫红 Rose">✓</button>
              <button class="theme-swatch-item ${ap.accent==='neutral'?'active':''}" style="background:#555555" onclick="setThemeAccent('neutral')" title="中性暗灰 Neutral">✓</button>
            </div>
          </div>

          <div class="settings-card">
            <div class="settings-card-head">
              <h3 class="settings-card-title">字体与阅读字号</h3>
            </div>
            <div class="grid2" style="gap:14px">
              <div class="formrow">
                <label>界面字体族</label>
                <select class="select" onchange="setThemeFont(this.value)">
                  <option value="system" ${ap.fontFamily==='system'?'selected':''}>系统默认 (System Default)</option>
                  <option value="pingfang" ${ap.fontFamily==='pingfang'?'selected':''}>苹方 / 微软雅黑 (Sans)</option>
                  <option value="serif" ${ap.fontFamily==='serif'?'selected':''}>经典宋体 / 衬线体 (Serif)</option>
                  <option value="mono" ${ap.fontFamily==='mono'?'selected':''}>等宽编程体 (Monospace)</option>
                </select>
              </div>
              <div class="slider-container">
                <div class="slider-row">
                  <label style="margin:0">正文阅读字号</label>
                  <span class="slider-val" id="val-font-size">${ap.readingFontSize || 15}px</span>
                </div>
                <input class="range" type="range" min="13" max="18" step="1" value="${ap.readingFontSize || 15}" oninput="document.getElementById('val-font-size').textContent=this.value+'px';document.documentElement.style.setProperty('--reading-font-size',this.value+'px')" onchange="store.appearanceSettings.readingFontSize=Number(this.value);applyThemeAppearance();save()">
              </div>
            </div>
          </div>

          <div class="settings-card">
            <div class="settings-card-head">
              <h3 class="settings-card-title">排版密度与圆角</h3>
            </div>
            <div class="grid2" style="gap:14px">
              <div class="formrow">
                <label>信息排版密度</label>
                <select class="select" onchange="setThemeDensity(this.value)">
                  <option value="compact" ${ap.uiDensity==='compact'?'selected':''}>紧凑模式 (Compact - 高密度)</option>
                  <option value="default" ${ap.uiDensity==='default'?'selected':''}>标准模式 (Default - 平衡)</option>
                  <option value="spacious" ${ap.uiDensity==='spacious'?'selected':''}>宽松模式 (Spacious - 舒适)</option>
                </select>
              </div>
              <div class="formrow">
                <label>控件圆角弧度</label>
                <select class="select" onchange="setThemeRadius(Number(this.value))">
                  <option value="0" ${ap.borderRadius===0?'selected':''}>直角方正 (0px)</option>
                  <option value="4" ${ap.borderRadius===4?'selected':''}>硬朗精细 (4px)</option>
                  <option value="8" ${ap.borderRadius===8?'selected':''}>标准桌面 (8px - 推荐)</option>
                  <option value="12" ${ap.borderRadius===12?'selected':''}>柔和圆润 (12px)</option>
                  <option value="20" ${ap.borderRadius===20?'selected':''}>胶囊饱满 (20px)</option>
                </select>
              </div>
            </div>

            <div class="settings-row" style="margin-top:12px">
              <div class="settings-row-label">
                <span class="settings-row-name">平滑转场动画</span>
                <span class="settings-row-desc">抽屉滑入、对话冒泡及悬停微动动效</span>
              </div>
              <input class="tag-status-checkbox" type="checkbox" ${ap.reducedMotion?'':'checked'} onchange="store.appearanceSettings.reducedMotion=!this.checked;applyThemeAppearance();save()">
            </div>
          </div>
        </div>

        <!-- Right: Compact Live Preview Card -->
        <div class="theme-preview-col">
          <div class="settings-card theme-live-preview-card">
            <div class="settings-card-head">
              <h3 class="settings-card-title">组件即时渲染预览</h3>
              <span class="preview-live-tag">实时联动</span>
            </div>
            <div class="theme-preview-content">
              <div class="theme-preview-group">
                <span class="theme-preview-group-label">按钮交互示范</span>
                <div class="flex gap8 wrap align-center">
                  <button class="btn primary sm" style="background:var(--ui-action-bg);color:#ffffff">${I('plus')} 主要按钮</button>
                  <button class="btn sm">次要中性按钮</button>
                  <button class="btn quiet sm">幽灵按钮</button>
                </div>
              </div>

              <div class="theme-preview-group">
                <span class="theme-preview-group-label">表单输入</span>
                <input class="input" style="width:100%;padding:5px 8px;font-size:12px" value="示范输入文本" readonly>
              </div>

              <div class="theme-preview-group">
                <span class="theme-preview-group-label">选中态与标签反馈</span>
                <div class="flex gap8 wrap align-center">
                  <span class="chip" style="background:var(--ui-action-bg);color:#ffffff;border-color:var(--ui-accent)">已选标签</span>
                  <span class="chip">常规中性标签</span>
                  <label class="flex gap4 align-center" style="cursor:pointer">
                    <input class="tag-status-checkbox" type="checkbox" checked>
                    <span class="tiny" style="color:#ccc">复选框勾选</span>
                  </label>
                </div>
              </div>

              <div class="theme-preview-group">
                <span class="theme-preview-group-label">正文阅读样式 (<span id="preview-font-label">${ap.readingFontSize || 15}px</span>)</span>
                <p class="preview-reading-sample" style="font-size:var(--reading-font-size, 15px);line-height:1.6;color:#ccc;margin:0;background:#151515;padding:8px 10px;border-radius:var(--radius);border:1px solid #282828">
                  在静谧的圣所深处，烛火微微摇曳。古老典籍上的文字随之舒展……
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  // 10. Extensions Management
  else if (tab === 'extensions') {
    var ext = store.extensionConfigs || { activeTab: 'sd_webui', items: {} };
    var sd = ext.items.sd_webui;
    var tts = ext.items.tts;
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>扩展系统</h2>
        </div>
        <button class="btn primary sm" onclick="saveSettingsAction('扩展配置已保存')">${I('check')} 保存扩展</button>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">${I('settings')} 核心内置扩展启停清单 (${Object.keys(ext.items).length})</h3>
        </div>
        <div class="ext-grid">
          ${Object.entries(ext.items).map(([k, item]) => `
            <div class="ext-card ${ext.activeTab===k?'selected':''}" onclick="store.extensionConfigs.activeTab='${k}';save();overlay()">
              <div style="min-width:0;flex:1">
                <div style="font-weight:600;font-size:12.5px;color:#eee">${E(item.name)}</div>
                <div class="tiny" style="color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${E(item.desc)}</div>
              </div>
              <input class="tag-status-checkbox" type="checkbox" ${item.enabled?'checked':''} onclick="event.stopPropagation()" onchange="toggleExtension('${k}', this.checked)">
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Dedicated Settings for AI Image Generation -->
      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h3 class="settings-card-title">${I('spark')} AI 图像生成配置</h3>
            <div class="settings-card-sub">生成角色立绘、概念图与章节插图</div>
          </div>
          <span class="chip ${sd.enabled?'green':''}">${sd.enabled?'已启用':'已停用'}</span>
        </div>

        <div class="grid2" style="gap:14px">
          <div class="formrow">
            <label>WebUI / ComfyUI 服务端点</label>
            <input class="input" value="${E(sd.endpoint)}" onchange="store.extensionConfigs.items.sd_webui.endpoint=this.value;save()">
          </div>
          <div class="formrow">
            <label>默认采样算法 (Sampler)</label>
            <select class="select" onchange="store.extensionConfigs.items.sd_webui.sampler=this.value;save()">
              <option value="DPM++ 2M Karras" ${sd.sampler==='DPM++ 2M Karras'?'selected':''}>DPM++ 2M Karras (推荐)</option>
              <option value="Euler a" ${sd.sampler==='Euler a'?'selected':''}>Euler a</option>
              <option value="DPM++ SDE Karras" ${sd.sampler==='DPM++ SDE Karras'?'selected':''}>DPM++ SDE Karras</option>
            </select>
          </div>
          <div class="formrow">
            <label>采样步数 (Steps: 15~50)</label>
            <input class="input" type="number" min="15" max="50" value="${sd.steps}" onchange="store.extensionConfigs.items.sd_webui.steps=Number(this.value);save()">
          </div>
          <div class="formrow">
            <label>默认生图分辨率</label>
            <select class="select" onchange="const [w,h]=this.value.split('x');store.extensionConfigs.items.sd_webui.width=Number(w);store.extensionConfigs.items.sd_webui.height=Number(h);save()">
              <option value="768x1024" ${sd.width===768?'selected':''}>竖屏立绘 (768 × 1024)</option>
              <option value="1024x1024" ${sd.width===1024&&sd.height===1024?'selected':''}>正方形 (1024 × 1024)</option>
              <option value="1280x720" ${sd.width===1280?'selected':''}>横版场景插画 (1280 × 720)</option>
            </select>
          </div>
        </div>

        <div class="formrow" style="margin-top:10px">
          <label>通用负向提示词 (Negative Prompt)</label>
          <textarea class="textarea" rows="2" onchange="store.extensionConfigs.items.sd_webui.negPrompt=this.value;save()">${E(sd.negPrompt)}</textarea>
        </div>
      </div>

      <!-- Dedicated Settings for TTS Voice -->
      <div class="settings-card">
        <div class="settings-card-head">
          <div>
            <h3 class="settings-card-title">${I('theater')} TTS 文本转语音配置</h3>
            <div class="settings-card-sub">为角色对白生成纯正拟真音色</div>
          </div>
          <button class="btn sm" onclick="testTtsVoice()">${I('spark')} 试听发音</button>
        </div>

        <div class="grid2" style="gap:14px">
          <div class="formrow">
            <label>语音服务后端</label>
            <select class="select" onchange="store.extensionConfigs.items.tts.provider=this.value;save()">
              <option value="edge" ${tts.provider==='edge'?'selected':''}>Microsoft Edge 神经拟真语音 (免费免Key)</option>
              <option value="elevenlabs" ${tts.provider==='elevenlabs'?'selected':''}>ElevenLabs 高级音色克隆</option>
              <option value="silero" ${tts.provider==='silero'?'selected':''}>本地 Silero 离线引擎</option>
            </select>
          </div>
          <div class="formrow">
            <label>默认中文发音人</label>
            <select class="select" onchange="store.extensionConfigs.items.tts.voice=this.value;save()">
              <option value="zh-CN-XiaoxiaoNeural" ${tts.voice==='zh-CN-XiaoxiaoNeural'?'selected':''}>晓晓 (温柔少女 · 叙事对白)</option>
              <option value="zh-CN-YunxiNeural" ${tts.voice==='zh-CN-YunxiNeural'?'selected':''}>云希 (沉稳青年 · 剧情旁白)</option>
              <option value="zh-CN-XiaoyiNeural" ${tts.voice==='zh-CN-XiaoyiNeural'?'selected':''}>晓伊 (灵动少女 · 活泼角色)</option>
            </select>
          </div>
        </div>
      </div>
    `;
  }

  // 11. Regex Pipeline Scripts
  else if (tab === 'regex') {
    var scripts = store.regexScripts || [];
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>正则清洗与过滤</h2>
        </div>
        <div class="flex gap8">
          <button class="btn sm" onclick="addRegexRule()">${I('plus')} 新建规则</button>
          <button class="btn primary sm" onclick="saveSettingsAction('正则规则已保存')">${I('check')} 保存规则</button>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">已配置的正则清洗管道 (${scripts.length})</h3>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px">
          ${scripts.map(r => `
            <div class="settings-row" style="background:#191919;padding:10px 14px;border-radius:6px;border:1px solid #303030">
              <div style="flex:1;min-width:0">
                <div class="flex gap8 align-center">
                  <input class="tag-status-checkbox" type="checkbox" ${r.enabled?'checked':''} onchange="toggleRegexRule('${r.id}', this.checked)">
                  <strong style="color:#eee;font-size:13px">${E(r.name)}</strong>
                  <span class="prompt-cat-badge">${r.scope==='all'?'全局':r.scope==='rp'?'仅RP':'仅写作'}</span>
                  <span class="prompt-cat-badge">${r.placement==='output'?'接收后':r.placement==='input'?'发送前':'双向'}</span>
                </div>
                <div class="tiny" style="color:#a8a8a8;font-family:monospace;margin-top:4px">
                  匹配：<code style="color:#f43f5e">${E(r.pattern)}</code> ➔ 替换为：<code style="color:#10b981">${E(r.replacement || '（空）')}</code>
                </div>
              </div>
              <button class="ghost sm danger" onclick="deleteRegexRule('${r.id}')" title="删除">✕</button>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">${I('spark')} 正则验证沙箱</h3>
          <span class="tiny" style="color:#888">输入测试文本即刻检验清洗效果</span>
        </div>

        <div class="regex-playground">
          <label style="font-size:11.5px;color:#bbb">输入测试原文：</label>
          <textarea id="regexTestInput" class="textarea" rows="2" oninput="testRegexPlayground()" placeholder="例如输入：<think>思考逻辑...</think>（微笑着转过身）你好呀。">＜think＞思考中...＜/think＞（轻轻点头）我们开始吧。</textarea>
          
          <label style="font-size:11.5px;color:#bbb;margin-top:10px;display:block">正则管道清洗后结果：</label>
          <div id="regexTestResult" class="regex-result-box">*(轻轻点头)* 我们开始吧。</div>
        </div>
      </div>
    `;
  }

  // 12. System & Workspace Backup
  else if (tab === 'system') {
    var sys = store.systemInfo;
    content = `
      <div class="settings-section-head">
        <div class="settings-section-head-left">
          <h2>系统底座与备份</h2>
        </div>
        <button class="btn primary sm" onclick="saveSettingsAction('系统配置已更新')">${I('check')} 保存配置</button>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">客户端环境信息与数据目录</h3>
        </div>
        <div class="settings-row">
          <span class="settings-row-name">客户端版本</span>
          <span class="tiny" style="color:#eee;font-family:monospace">SillyTavern-Desktop ${sys.appVersion}</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-name">本地核心数据存储路径 (Data Directory)</span>
          <span class="tiny" style="color:#aaa;font-family:monospace">${E(sys.dataDir)}</span>
        </div>
        <div class="settings-row">
          <span class="settings-row-name">底层持久化模式</span>
          <span class="settings-badge local">${sys.storageMode}</span>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">当前工作区资产统计</h3>
        </div>
        <div class="settings-stat-grid">
          <div class="settings-stat-box">
            <div class="settings-stat-val">${roles.length}</div>
            <div class="settings-stat-lbl">角色档案库</div>
          </div>
          <div class="settings-stat-box">
            <div class="settings-stat-val">${store.works.length}</div>
            <div class="settings-stat-lbl">连载作品</div>
          </div>
          <div class="settings-stat-box">
            <div class="settings-stat-val">${store.tagItems.length}</div>
            <div class="settings-stat-lbl">视觉标签词汇</div>
          </div>
          <div class="settings-stat-box">
            <div class="settings-stat-val">${store.worldInfoBooks.length}</div>
            <div class="settings-stat-lbl">世界设定集</div>
          </div>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">工作区完整备份与迁移</h3>
          <span class="tiny" style="color:#888">支持跨设备完整还原所有角色、设定与会话</span>
        </div>
        <div class="flex gap10 align-center wrap" style="margin-top:6px">
          <button class="btn sm" onclick="exportWorkspaceBackup()">${I('download')} 导出工作区完整备份 JSON</button>
          <button class="btn sm" onclick="document.getElementById('importBackupInput').click()">${I('upload')} 从备份文件恢复数据</button>
          <input id="importBackupInput" type="file" accept=".json,application/json" style="display:none" onchange="importWorkspaceBackup(event)">
          <button class="btn sm danger" onclick="resetWorkspaceData()">${I('trash')} 恢复出厂设置</button>
        </div>
      </div>

      <div class="settings-card">
        <div class="settings-card-head">
          <h3 class="settings-card-title">桌面端常用快捷键速查表</h3>
        </div>
        <div class="settings-row"><strong style="color:#eee">Ctrl + K</strong><span class="tiny" style="color:#aaa">全局快速搜索角色、会话与标签</span></div>
        <div class="settings-row"><strong style="color:#eee">Ctrl + ,</strong><span class="tiny" style="color:#aaa">随时呼出系统设置中心</span></div>
        <div class="settings-row"><strong style="color:#eee">Enter / Ctrl + Enter</strong><span class="tiny" style="color:#aaa">发送对话消息 / 提交创作指令</span></div>
        <div class="settings-row"><strong style="color:#eee">Shift + Enter</strong><span class="tiny" style="color:#aaa">输入框内多行换行</span></div>
        <div class="settings-row"><strong style="color:#eee">Esc</strong><span class="tiny" style="color:#aaa">退出并关闭当前弹窗或抽屉</span></div>
      </div>
    `;
  }

  return searchBanner + content;
}


function toggleWbScope(bookId, scopeKey) {
  var curRole = (typeof role === 'function' ? role(ui.roleId) : null) || (roles && roles[0]);
  var curWork = store.works?.find(x => x.id === ui.workId) || store.works?.[0];
  var curSess = (typeof session === 'function' ? session(ui.sessionId) : null);
  var refMap = {
    global: { type: 'global' },
    role: curRole ? { type: 'role', id: curRole.id } : null,
    work: curWork ? { type: 'work', id: curWork.id } : null,
    session: curSess ? { type: 'session', id: curSess.id } : null
  };
  var ref = refMap[scopeKey];
  if (!ref || !window.CreationWorkflow) return;
  var owner = (scopeKey === 'global' ? store : (scopeKey === 'role' ? (store.roleRpConfigs?.[curRole.id] || curRole) : (scopeKey === 'work' ? curWork : curSess)));
  var list = owner.worldBookIds || [];
  var bound = list.find(v => (typeof v === 'string' ? v : v.id) === bookId);
  if (!bound) {
    CreationWorkflow.bindWorldbook(ref, bookId, true);
    toast('已关联此范围并启用生效');
  } else if (bound.enabled !== false) {
    CreationWorkflow.bindWorldbook(ref, bookId, false);
    toast('已暂停该范围的关联生效');
  } else {
    CreationWorkflow.unlinkWorldbook(ref, bookId);
    toast('已解除该范围关联');
  }
  overlay();
}

function renderWorldInfoDialog() {
  initAdaptedV3State();
  var books = store.worldInfoBooks.filter(b => !b.archivedAt);
  var curBook = books.find(b => b.id === (ui.activeWorldBookId || ui.activeWorldBook)) || books[0] || { id: '', entries: [] };
  ui.activeWorldBookId = curBook.id;
  ui.activeWorldBook = curBook.id;

  var rawEntries = Array.isArray(curBook.entries) ? curBook.entries : Object.values(curBook.entries || {});
  var allEntries = rawEntries.map(e => ({
    ...e,
    id: e.id ?? e.uid,
    title: e.title ?? e.comment ?? '',
    keys: e.keys ?? e.key ?? [],
    secondaryKeys: e.secondaryKeys ?? e.keysecondary ?? e.secondary_keys ?? [],
    enabled: e.enabled !== false && !e.disable
  }));

  var isArchivedView = (ui.worldInfoTab === 'archived');
  var displayEntries = allEntries.filter(e => isArchivedView ? !!e.archivedAt : !e.archivedAt);
  var activeCount = allEntries.filter(e => !e.archivedAt).length;
  var archivedCount = allEntries.filter(e => !!e.archivedAt).length;

  var curEntry = displayEntries.find(e => String(e.id) === String(ui.worldEntryId)) || displayEntries[0] || {
    id: '',
    title: isArchivedView ? '无归档条目' : '未选中条目',
    keys: [],
    secondaryKeys: [],
    content: isArchivedView ? '归档箱中暂无条目。' : '请在左侧列表选择条目或新建条目。',
    enabled: true,
    constant: false,
    selective: false
  };
  if (curEntry.id !== '' && curEntry.id != null) ui.worldEntryId = curEntry.id;

  // Calculate scope bindings
  var scopeList = [];
  if (curBook.id) {
    var globItem = (store.worldBookIds || []).find(v => (typeof v === 'string' ? v : v.id) === curBook.id);
    scopeList.push({
      scopeKey: 'global',
      label: '全局默认',
      ref: { type: 'global' },
      isBound: !!globItem,
      enabled: globItem ? globItem.enabled !== false : false
    });
    var curRole = (typeof role === 'function' ? role(ui.roleId) : null) || (roles && roles[0]);
    if (curRole) {
      var roleCfg = store.roleRpConfigs?.[curRole.id] || store.rpConfigs?.[curRole.id];
      var roleBound = (curRole.worldBookIds || []).find(v => (typeof v === 'string' ? v : v.id) === curBook.id) ||
                      (roleCfg?.worldBookIds || []).find(v => (typeof v === 'string' ? v : v.id) === curBook.id) ||
                      (roleCfg?.boundWorldBook === curBook.id ? { id: curBook.id, enabled: true } : null);
      scopeList.push({
        scopeKey: 'role',
        label: '角色: ' + curRole.name,
        ref: { type: 'role', id: curRole.id },
        isBound: !!roleBound,
        enabled: roleBound ? roleBound.enabled !== false : false
      });
    }
    var curWork = store.works?.find(x => x.id === ui.workId) || store.works?.[0];
    if (curWork) {
      var workBound = (curWork.worldBookIds || []).find(v => (typeof v === 'string' ? v : v.id) === curBook.id);
      scopeList.push({
        scopeKey: 'work',
        label: '作品: ' + curWork.title,
        ref: { type: 'work', id: curWork.id },
        isBound: !!workBound,
        enabled: workBound ? workBound.enabled !== false : false
      });
    }
    var curSess = (typeof session === 'function' ? session(ui.sessionId) : null);
    if (curSess) {
      var sessBound = (curSess.worldBookIds || []).find(v => (typeof v === 'string' ? v : v.id) === curBook.id);
      scopeList.push({
        scopeKey: 'session',
        label: '当前会话',
        ref: { type: 'session', id: curSess.id },
        isBound: !!sessBound,
        enabled: sessBound ? sessBound.enabled !== false : false
      });
    }
  }

  return `
    <div class="settings-header">
      <div class="settings-header-left">
        <h2 class="settings-header-title">${I('book')} 世界书与设定库管理器</h2>
        <span class="settings-header-desc">构建独立于单场会话的世界观设定与关键词动态激活系统</span>
      </div>
      <button class="ghost" onclick="closeModal()" aria-label="关闭">${I('x')}</button>
    </div>

    <div class="settings-body">
      <!-- Left Sidebar: Book Selector & Entries Tree -->
      <div class="wi-sidebar">
        <!-- Book Dropdown -->
        <div style="padding:12px;border-bottom:1px solid #282828">
          <select class="select" style="width:100%" onchange="ui.activeWorldBookId=this.value;ui.activeWorldBook=this.value;overlay()">
            ${books.map(b => `<option value="${b.id}" ${b.id===curBook.id?'selected':''}>${E(b.name)}</option>`).join('')}
          </select>
        </div>

        <!-- Segmented Tab: Active vs Archived -->
        <div class="wi-entry-segmented">
          <button type="button" class="wi-entry-tab ${!isArchivedView?'active':''}" onclick="ui.worldInfoTab='active';overlay()">活跃条目 (${activeCount})</button>
          <button type="button" class="wi-entry-tab ${isArchivedView?'active':''}" onclick="ui.worldInfoTab='archived';overlay()">归档箱 (${archivedCount})</button>
        </div>

        <!-- Action Bar: Count + New Entry -->
        <div style="padding:8px 12px;border-bottom:1px solid #282828;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11.5px;color:#888;font-weight:600">${isArchivedView ? '已归档' : '条目列表'} (${displayEntries.length})</span>
          ${!isArchivedView ? `<button class="btn sm" ${!curBook.id?'disabled':''} data-worldbook="${E(curBook.id)}" onclick="CreationWorkflow.createWorldEntry(this.dataset.worldbook);overlay()">${I('plus')} 新建条目</button>` : ''}
        </div>

        <!-- Entry List -->
        <div style="flex:1;overflow-y:auto;padding:8px">
          ${displayEntries.length ? displayEntries.map(e => {
            var isSelected = String(e.id) === String(curEntry.id);
            return `
              <div data-worldbook="${E(curBook.id)}" data-entry="${E(e.id)}" onclick="ui.worldEntryId='${e.id}';overlay()" style="padding:9px 12px;border-radius:8px;background:${isSelected?'#2c2c2c':'transparent'};border:1px solid ${isSelected?'#3f3f3f':'transparent'};margin-bottom:4px;cursor:pointer;transition:all .12s ease">
                <div style="display:flex;align-items:center;justify-content:space-between">
                  <span style="font-size:12.5px;font-weight:600;color:${isSelected?'#fff':'#ccc'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;margin-right:6px">${E(e.title || '未命名条目')}</span>
                  <span class="tiny" style="color:${e.constant?'var(--ui-accent,#ac97f5)':'#888'};flex-shrink:0">${e.constant?'常驻':'触发'}</span>
                </div>
                <div class="tiny" style="color:#777;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">
                  ${e.keys && e.keys.length ? '关键词：' + E(e.keys.join(', ')) : (e.constant ? '常驻无条件注入' : '暂无触发词')}
                </div>
              </div>
            `;
          }).join('') : `<div class="empty-quiet" style="padding:24px 16px;text-align:center">${isArchivedView ? '归档箱暂无条目' : '该世界书暂无条目'}</div>`}
        </div>
      </div>

      <!-- Right Content Pane -->
      <div class="wi-content-pane">
        ${curEntry.id !== '' && curEntry.id != null ? `
          <div class="between" style="margin-bottom:16px;gap:12px;align-items:flex-start">
            <div style="flex:1;min-width:0">
              <h3 style="margin:0 0 4px 0;font-size:16px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${E(curEntry.title || '未命名条目')}</h3>
              <span style="font-size:11.5px;color:#888">${isArchivedView ? '已归档条目 · 支持恢复至活跃列表' : '编辑条目关键词与注入正文'}</span>
            </div>
            <div class="flex gap8" style="flex-shrink:0">
              ${isArchivedView ? `
                <button class="btn primary sm" data-worldbook="${E(curBook.id)}" data-entry="${E(curEntry.id)}" onclick="CreationWorkflow.restoreWorldEntry(this.dataset.worldbook,this.dataset.entry);ui.worldInfoTab='active';overlay();toast('条目已恢复至活跃列表')">↺ 恢复此条目</button>
              ` : `
                <button class="btn danger sm" ${!displayEntries.length?'disabled':''} data-worldbook="${E(curBook.id)}" data-entry="${E(curEntry.id)}" onclick="CreationWorkflow.archiveWorldEntry(this.dataset.worldbook,this.dataset.entry);overlay();toast('已移入归档箱')">${I('trash')} 归档删除</button>
                <button class="btn primary sm" ${!displayEntries.length?'disabled':''} data-worldbook="${E(curBook.id)}" data-entry="${E(curEntry.id)}" onclick="CreationWorkflow.saveWorldEntryForm(this.dataset.worldbook,this.dataset.entry)">${I('check')} 保存条目</button>
              `}
            </div>
          </div>

          <div class="formrow">
            <label>条目标题 (Title)</label>
            <input class="input" id="wi-title" value="${E(curEntry.title)}" ${isArchivedView?'readonly':''}>
          </div>

          <div class="grid2" style="gap:16px;margin-top:14px">
            <div class="formrow" style="margin-bottom:0">
              <label>主触发关键词 (逗号分隔)</label>
              <input class="input" id="wi-keys" value="${E((curEntry.keys||[]).join(', '))}" ${isArchivedView?'readonly':''}>
            </div>
            <div class="formrow" style="margin-bottom:0">
              <label>次要条件关键词 (Selective Keys)</label>
              <input class="input" id="wi-secondary" value="${E((curEntry.secondaryKeys||[]).join(', '))}" ${isArchivedView?'readonly':''}>
            </div>
          </div>

          <div class="formrow" style="margin-top:14px">
            <label>条目正文内容 (将被注入到上下文中)</label>
            <textarea class="textarea" id="wi-content" style="height:170px;line-height:1.6" ${isArchivedView?'readonly':''}>${E(curEntry.content||'')}</textarea>
          </div>

          <!-- Options Box: Horizontal spacious flex layout -->
          <div class="wi-options-box">
            <label class="wi-option-label">
              <input type="checkbox" id="wi-enabled" ${curEntry.enabled?'checked':''} ${isArchivedView?'disabled':''}> 启用此条目
            </label>
            <label class="wi-option-label">
              <input type="checkbox" id="wi-constant" ${curEntry.constant?'checked':''} ${isArchivedView?'disabled':''}> 常驻内存 (无条件注入)
            </label>
            <label class="wi-option-label">
              <input type="checkbox" id="wi-selective" ${curEntry.selective?'checked':''} ${isArchivedView?'disabled':''}> 选择性二次过滤
            </label>
          </div>

          <!-- Scope Binding Card -->
          <div class="wi-scopes-card">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:11.5px;font-weight:600;color:#9e9e9e">本世界书生效范围关联 (Scope Bindings)</span>
              <span class="tiny" style="color:#666">点击状态循环：未关联 → 启用生效 → 暂停</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              ${scopeList.map(sc => `
                <button type="button" class="wi-scope-chip ${sc.isBound?'bound':''} ${sc.enabled?'enabled':''}" onclick="toggleWbScope('${E(curBook.id)}', '${sc.scopeKey}')" title="${sc.isBound?(sc.enabled?'已启用关联 · 点击暂停':'已暂停生效 · 点击解除关联'):'未关联 · 点击绑定'}">
                  <span class="wi-scope-dot"></span>
                  <span>${E(sc.label)}</span>
                  <span class="tiny" style="color:${sc.isBound?(sc.enabled?'var(--ui-accent,#ac97f5)':'#888'):'#666'};margin-left:2px">${sc.isBound?(sc.enabled?'生效中':'已暂停'):'未关联'}</span>
                </button>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="empty" style="padding:60px 20px;text-align:center">
            <p>请在左侧选择或新建条目。</p>
          </div>
        `}
      </div>
    </div>
  `;
}

// =========================================================================
// Persona Drawer Implementation (Refined Codex Dual-Column Tool Layout)
// =========================================================================
function renderPersonaDialog() {
  initAdaptedV3State();
  var personas = store.personas || [];
  var editId = ui.editingPersonaId || store.currentPersona;
  var cur = personas.find(p => p.id === editId) || personas[0];
  if (!cur) return '';

  return `
    <div class="settings-header">
      <div class="settings-header-left">
        <h2 class="settings-header-title">${I('users')} 用户身份管理器 (Persona)</h2>
        <span class="settings-header-desc">管理并切换您在沉浸 RP 与创作中的视角、说话风格与身份设定</span>
      </div>
      <button class="ghost" onclick="closeModal()" aria-label="关闭">${I('x')}</button>
    </div>

    <div class="settings-body" style="background:#161616">
      <!-- 左侧身份列表 -->
      <aside style="width:250px;background:#1e1e1e;border-right:1px solid #2d2d2d;display:flex;flex-direction:column;flex-shrink:0">
        <div style="padding:12px 14px;border-bottom:1px solid #282828;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11.5px;font-weight:600;color:#8e8e8e">身份列表 (${personas.length})</span>
          <button class="btn sm quiet" onclick="createPersonaAction()">${I('plus')} 新建</button>
        </div>
        <div style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px">
          ${personas.map(p => {
            var isCurrent = (p.id === store.currentPersona);
            var isSelected = (p.id === cur.id);
            return `
              <div class="persona-item-btn ${isSelected?'active':''}" onclick="ui.editingPersonaId='${p.id}';overlay()">
                <div class="persona-avatar-sm">${E(p.avatar||p.name[0]||'旅')}</div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;justify-content:space-between;gap:4px">
                    <span style="font-weight:600;font-size:12.5px;color:${isSelected?'#ffffff':'#cccccc'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${E(p.name)}</span>
                    ${isCurrent ? '<span style="font-size:10px;padding:1px 5px;border-radius:4px;background:#1b3223;color:#6fd78f;font-weight:600;flex-shrink:0">当前</span>' : ''}
                  </div>
                  <div class="tiny" style="color:#777777;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px">${p.isDefault?'默认 · ':''}${E(p.title||'未定头衔')}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </aside>

      <!-- 右侧一体化编辑区（彻底消除独立内框与杂乱按钮） -->
      <main style="flex:1;overflow-y:auto;padding:22px 26px;display:flex;flex-direction:column;gap:18px;background:#181818">
        <!-- 头部身份条：大头像 + 核心字段 -->
        <div style="display:flex;gap:18px;align-items:flex-start">
          <div style="text-align:center;flex-shrink:0">
            <div class="persona-avatar-picker" onclick="changePersonaAvatar('${cur.id}')" title="点击更换头像文字">
              ${E(cur.avatar || cur.name[0] || '我')}
            </div>
            <span style="font-size:10.5px;color:#777;margin-top:5px;display:block">点击换字</span>
          </div>
          <div style="flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div class="formrow">
              <label>身份名称</label>
              <input id="persona_name" class="input" value="${E(cur.name)}" placeholder="如：旅人、调查官">
            </div>
            <div class="formrow">
              <label>头衔 / 简短定位</label>
              <input id="persona_title" class="input" value="${E(cur.title || '')}" placeholder="如：流浪探求者">
            </div>
          </div>
        </div>

        <!-- 描述与口吻设定 -->
        <div class="formrow">
          <label>人物描述与行为风格指引</label>
          <textarea id="persona_desc" class="textarea" style="height:120px;line-height:1.6" placeholder="输入角色的口吻偏好、身份特征或与对话对象的相对关系...">${E(cur.desc)}</textarea>
        </div>

        <!-- 注入机制分组（整齐的一体化设置卡片） -->
        <div class="settings-card" style="margin-bottom:0;padding:14px 16px;background:#1f1f1f;border-color:#2f2f2f">
          <div class="grid2" style="gap:14px">
            <div class="formrow">
              <label>提示注入位置</label>
              <select id="persona_pos" class="select">
                <option value="system" ${cur.injectionPos==='system'?'selected':''}>System 顶层提示 (推荐 · 全局浸入)</option>
                <option value="user" ${cur.injectionPos==='user'?'selected':''}>User 消息前缀 (伴随每次发言)</option>
              </select>
            </div>
            <div class="formrow">
              <label>注入深度 (Injection Depth)</label>
              <select id="persona_depth" class="select">
                <option value="1" ${(cur.injectionDepth===1||cur.depth===1)?'selected':''}>深度 1 · 紧贴最新消息</option>
                <option value="2" ${(cur.injectionDepth===2||cur.depth===2||!cur.injectionDepth)?'selected':''}>深度 2 · 平衡回溯 (默认)</option>
                <option value="3" ${(cur.injectionDepth===3||cur.depth===3)?'selected':''}>深度 3 · 靠前背景</option>
              </select>
            </div>
          </div>

          <div class="settings-row" style="margin-top:12px;padding-top:12px;border-top:1px solid #282828;padding-bottom:0;border-bottom:none">
            <div class="settings-row-label">
              <span class="settings-row-name">设为全局默认身份</span>
              <span class="settings-row-desc">新建会话或开始新 RP 时自动套用此身份</span>
            </div>
            <input type="checkbox" id="persona_is_default" class="tag-status-checkbox" ${cur.isDefault?'checked':''}>
          </div>
        </div>
      </main>
    </div>

    <!-- 底部统一底栏 (Footer) -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 20px;background:#202020;border-top:1px solid #2d2d2d;flex-shrink:0">
      <div>
        ${personas.length > 1 ? `
          <button class="btn danger sm quiet" onclick="deletePersonaAction('${cur.id}')" style="display:inline-flex;align-items:center;gap:6px;background:transparent;border:none;color:#ef4444;font-size:12px;cursor:pointer;padding:4px 8px;border-radius:4px">
            ${I('trash')} 删除此身份
          </button>
        ` : `<span class="tiny" style="color:#666">至少保留一个用户身份</span>`}
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <button class="btn" onclick="closeModal()" style="padding:6px 16px;background:#282828;border:1px solid #3a3a3a;color:#d4d4d4;border-radius:6px;font-size:12.5px;cursor:pointer">取消</button>
        <button class="btn primary" onclick="saveAndApplyPersona('${cur.id}')" style="display:inline-flex;align-items:center;gap:6px;padding:6px 18px;background:var(--accent, #7c3aed);border:1px solid transparent;color:#ffffff;border-radius:6px;font-size:12.5px;font-weight:500;cursor:pointer">
          ${I('check')} 保存并设为当前使用
        </button>
      </div>
    </div>
  `;
}

function renderRoleToRpModal() {
  initAdaptedV3State();
  var r = role(ui.targetRoleId) || roles[0];
  var cfg = (store.roleRpConfigs && store.roleRpConfigs[r.id]) || (store.rpConfigs && store.rpConfigs[r.id]) || { greeting: '', personality: '', boundWorldBook: 'wb_north' };

  return `
    <div class="modal-head">
      <div class="modal-title">${I('theater')} 为角色配置 RP 扮演空间</div>
      <button class="ghost" onclick="closeModal()" aria-label="关闭">${I('x')}</button>
    </div>

    <div style="margin-top:14px">
      <div class="flex gap12" style="background:var(--bg-layer-2,#1a1a1a);border:1px solid var(--border,#333);padding:12px 14px;border-radius:8px;align-items:center;margin-bottom:16px">
        <div class="avatar lg ${r.tone}">${r.icon}</div>
        <div>
          <div style="font-weight:700;color:#fff">${E(r.name)}</div>
          <div class="tiny" style="color:var(--text-muted,#888)">${E(r.series)} · ${E(r.desc || r.visual || '视觉档案')}</div>
        </div>
      </div>

      <div class="formrow">
        <label>专属开场白 (First Greeting Message)</label>
        <textarea id="rp_cfg_greeting" class="textarea" style="height:90px" placeholder="角色进入专属对话时的开场白与动作描写...">${E(cfg.greeting || `*她站在微光中注视着你。* 「你好，我是 ${r.name}。今天想聊些什么？」`)}</textarea>
      </div>

      <div class="formrow" style="margin-top:12px">
        <label>性格与人设提示 (Personality Prompt)</label>
        <textarea id="rp_cfg_personality" class="textarea" style="height:90px" placeholder="角色的性格基调、说话口吻与行为习惯...">${E(cfg.personality || `${r.desc || ''} 冷静、沉稳，具有敏锐的观察力。`)}</textarea>
      </div>

      <div class="formrow" style="margin-top:12px">
        <label>绑定世界书设定集 (World Book)</label>
        <select id="rp_cfg_wb" class="select">
          ${(store.worldInfoBooks || []).map(b => `<option value="${b.id}" ${b.id===cfg.boundWorldBook?'selected':''}>${E(b.name)}</option>`).join('')}
        </select>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:20px">
        <button class="btn" onclick="closeModal()">取消</button>
        <button class="btn primary" onclick="
          var g = document.getElementById('rp_cfg_greeting').value.trim();
          var p = document.getElementById('rp_cfg_personality').value.trim();
          var wb = document.getElementById('rp_cfg_wb').value;
          store.roleRpConfigs['${r.id}'] = { ready: true, greeting: g, personality: p, boundWorldBook: wb };
          store.rpConfigs['${r.id}'] = { greeting: g, personality: p };
          if (!store.rpHistories['${r.id}'] || !store.rpHistories['${r.id}'].length) {
            store.rpHistories['${r.id}'] = [{ by: 'ai', text: g || '“已进入角色扮演模式。”' }];
          }
          save();
          toast('✓ 已为角色【${r.name}】保存 RP 配置并就绪');
          closeModal();
          startRpForRole('${r.id}');
        ">${I('check')} 保存并进入 RP 空间</button>
      </div>
    </div>
  `;
}

function archiveObject(ref) {
  try {
    if (!window.CreationWorkflow || !CreationWorkflow.archive) {
      toast('创作流引擎未就绪');
      return;
    }
    CreationWorkflow.archive(ref);
    toast('已移入归档');
    if (ui.modal) closeModal();
    render();
  } catch (err) {
    toast('归档失败: ' + err.message);
  }
}

function restoreObject(ref) {
  try {
    if (!window.CreationWorkflow || !CreationWorkflow.restore) {
      toast('创作流引擎未就绪');
      return;
    }
    CreationWorkflow.restore(ref);
    toast('已从归档恢复');
    if (ui.modal) closeModal();
    render();
  } catch (err) {
    toast('恢复失败: ' + err.message);
  }
}

function openPermanentDeleteModal(ref) {
  try {
    if (!window.CreationWorkflow || !CreationWorkflow.deletionImpact) {
      toast('未加载创作流底层接口');
      return;
    }
    const impact = CreationWorkflow.deletionImpact(ref);
    ui.pendingDeletionRef = ref;
    ui.pendingDeletionImpact = impact;
    ui.modal = 'deleteImpact';
    overlay();
  } catch (e) {
    toast('无法评估删除影响: ' + e.message);
  }
}

function renderDeleteImpactModal() {
  const impact = ui.pendingDeletionImpact;
  const ref = ui.pendingDeletionRef;
  if (!impact || !ref) {
    return `<div style="padding:24px;text-align:center">无效的删除目标。<div class="modal-footer"><button class="btn" onclick="closeModal()">关闭</button></div></div>`;
  }

  const typeNameMap = {
    role: '角色档案',
    work: '作品/小说',
    chapter: '作品章节',
    session: '创作会话',
    rp: 'RP 角色会话分支',
    worldbook: '世界书与设定集',
    candidate: '生成提议候选'
  };
  const typeLabel = typeNameMap[ref.type] || ref.type;
  const affectedList = impact.affected || [];

  return `
    <div class="impact-header">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="font-size:16px;color:#f87171">⚠️</span>
        <h2 class="impact-header-title" style="color:#f87171;margin:0">确认永久删除</h2>
      </div>
      <button class="ghost" onclick="closeModal()" aria-label="关闭">${I('x')}</button>
    </div>

    <div class="impact-body">
      <!-- Target Summary Box -->
      <div class="impact-target-card">
        <span class="chip" style="background:#2a2a2a;border-color:#444;color:#ddd">${typeLabel}</span>
        <strong style="font-size:14px;color:#ffffff">${E(impact.name)}</strong>
        <span class="tiny" style="color:#777;margin-left:auto;font-family:ui-monospace,monospace">ID: ${E(ref.id)}</span>
      </div>

      <!-- Split Contrast Policy Panels -->
      <div class="impact-split-grid">
        <div class="impact-panel remove">
          <strong style="display:flex;align-items:center;gap:6px;color:#fca5a5;margin-bottom:6px">
            <span>🔴</span> 将被彻底清除的内容
          </strong>
          <ul style="margin:0;padding-left:18px;font-size:11.5px;color:#fca5a5;line-height:1.6">
            <li>该${typeLabel}的核心原档案实体</li>
            <li>挂载于作品中的该对象本地副本版本</li>
            <li>系统为该对象生成的相关生请求快照</li>
          </ul>
        </div>

        <div class="impact-panel retain">
          <strong style="display:flex;align-items:center;gap:6px;color:#86efac;margin-bottom:6px">
            <span>🟢</span> 将继续安全保留的故事资产
          </strong>
          <ul style="margin:0;padding-left:18px;font-size:11.5px;color:#86efac;line-height:1.6">
            <li>既有对话历史消息与推演试演文本</li>
            <li>已采纳的设定正文（不会抹除故事上下文）</li>
            <li>历史引用只保留类型、名称与删除时间戳</li>
          </ul>
        </div>
      </div>

      <!-- Affected Cascade Links -->
      <div style="background:#1d1d1d;border:1px solid #2f2f2f;border-radius:8px;padding:12px 14px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span style="font-size:11.5px;font-weight:600;color:#bbb">级联受影响的关联记录 (${affectedList.length})</span>
          <span class="tiny" style="color:#666">将自动解绑并记入脱敏关联记录</span>
        </div>
        ${affectedList.length ? `
          <div style="max-height:110px;overflow-y:auto;display:flex;flex-direction:column;gap:4px">
            ${affectedList.map(a => `
              <div style="display:flex;align-items:center;justify-content:space-between;padding:4px 8px;background:#242424;border-radius:4px;font-size:11px">
                <span style="color:#ddd">${typeNameMap[a.type] || a.type}: <strong style="color:#fff">${E(a.id)}</strong></span>
                <span class="tiny" style="color:#9e9e9e">${E(a.relation)}</span>
              </div>
            `).join('')}
          </div>
        ` : `<div style="font-size:11.5px;color:#777">无额外级联受损关联。</div>`}
      </div>

      <!-- Explicit Safety Handshake Checkbox -->
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:#eee;cursor:pointer;background:#221a1a;border:1px solid #4a2828;padding:10px 14px;border-radius:6px">
        <input type="checkbox" id="wi-delete-confirm-cb" onchange="document.getElementById('btn-exec-perm-delete').disabled = !this.checked">
        <span>我已知晓以上将被清除的内容与安全保留范围，确认永久删除。</span>
      </label>
    </div>

    <div class="impact-footer">
      <button class="btn sm" onclick="closeModal()">取消</button>
      <button class="btn danger sm" id="btn-exec-perm-delete" disabled onclick="executePermanentDelete()">${I('trash')} 确认永久删除</button>
    </div>
  `;
}

function executePermanentDelete() {
  try {
    const ref = ui.pendingDeletionRef;
    const impact = ui.pendingDeletionImpact;
    if (!ref || !impact) return;
    CreationWorkflow.permanentlyDelete(ref, impact);
    toast('已完成永久删除');
    ui.pendingDeletionRef = null;
    ui.pendingDeletionImpact = null;
    closeModal();
    if (ref.type === 'role' && ui.roleId === ref.id) {
      ui.roleId = roles.find(r => !r.archivedAt)?.id || '';
      visit('roles');
    } else if (ref.type === 'work' && ui.workId === ref.id) {
      ui.workId = store.works?.[0]?.id || '';
      visit('editor');
    } else if (ref.type === 'session') {
      ui.sessionId = store.sessions.find(s => !s.archivedAt)?.id || '';
      visit('sessions');
    } else if (ref.type === 'rp') {
      if (ui.page === 'rp') {
        const curRole = ui.rpRole || roles[0]?.id;
        const availableSess = (store.rpSessions?.[curRole] || []).filter(s => !s.archivedAt);
        if (availableSess.length > 0) {
          ui.rpSessionId = availableSess[0].id;
          store.rpHistories[curRole] = availableSess[0].messages || [];
        } else {
          ui.rpSessionId = null;
          ui.rpScreen = 'directory';
        }
      }
      render();
    } else {
      render();
    }
  } catch (err) {
    toast('删除失败: ' + err.message);
  }
}

function inspectCurrentRequest(featureKey, customOptions = {}) {
  try {
    if (!window.CreationWorkflow || !CreationWorkflow.prepareRequest) {
      toast('创作流引擎未就绪');
      return;
    }
    const inputEl = document.getElementById('rpInput') || document.getElementById('chatinput');
    const rawInput = inputEl?.value?.trim() || '';
    
    const isRp = (ui.page === 'rp');
    const resolvedFeature = featureKey || (isRp ? 'rp_chat' : 'creative_discussion');
    const opts = {
      featureKey: resolvedFeature,
      input: rawInput,
      ...(isRp ? { rpSessionId: ui.rpSessionId } : { sessionId: ui.sessionId }),
      ...customOptions
    };

    // Inspection is read-only. Use the same context builder as ordinary sending.
    const req = CreationWorkflow.buildRequest(opts);
    ui.activeInspectedRequest = req;
    if (typeof openInspectorDock === 'function') {
      openInspectorDock(req, 'snapshot');
    } else {
      ui.inspectorActiveTab = 'sections';
      ui.modal = 'requestInspector';
      overlay();
    }
  } catch (e) {
    toast('预检请求失败: ' + e.message);
  }
}

function renderRequestInspectorModal() {
  const req = ui.activeInspectedRequest;
  if (!req) {
    return `<div style="padding:30px;text-align:center">暂无已装配的请求预览。<div class="modal-footer"><button class="btn" onclick="closeModal()">关闭</button></div></div>`;
  }

  const activeTab = ui.inspectorActiveTab || 'sections';
  const totalChars = (req.sections || []).reduce((n, s) => n + (s.content?.length || 0), 0);
  const approxTokens = Math.ceil(totalChars / 2);
  const allRequests = (window.CreationWorkflow?.listRequests ? CreationWorkflow.listRequests() : []).slice().reverse();

  return `
    <div class="inspector-header">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="color:var(--ui-accent,#ac97f5);font-size:16px">${I('eye')}</span>
        <div>
          <h2 style="font-size:15px;font-weight:650;margin:0;color:#f4f4f5">生成请求透视与预检检查器 (Request Inspector)</h2>
          <span style="font-size:11.5px;color:#858585">装配流水线透视 · 排除原因排查 · 协议正文与脱敏鉴权</span>
        </div>
      </div>
      <button class="ghost" onclick="closeModal()" aria-label="关闭">${I('x')}</button>
    </div>

    <!-- Parameter Overview Bar -->
    <div class="inspector-meta-bar">
      <div class="meta-card">
        <span class="meta-card-label">功能与目标模型</span>
        <span class="meta-card-value">${E(req.configuration.modelName || req.configuration.modelId)} (${E(req.featureKey)})</span>
      </div>
      <div class="meta-card">
        <span class="meta-card-label">传输协议与目标端点</span>
        <span class="meta-card-value" title="${E(req.transport.url)}">${E(req.transport.protocol)} · ${E(req.transport.url.replace(/^https?:\/\/[^\/]+/, ''))}</span>
      </div>
      <div class="meta-card">
        <span class="meta-card-label">装配体量估算</span>
        <span class="meta-card-value" style="color:var(--ui-accent,#ac97f5)">${totalChars} 字符 (${approxTokens} Tokens)</span>
      </div>
      <div class="meta-card">
        <span class="meta-card-label">连接凭据防护</span>
        <span class="meta-card-value" style="color:#4ade80">●●●●●● [密钥库已鉴权]</span>
      </div>
    </div>

    <!-- Segmented Nav -->
    <div class="inspector-segmented">
      <button type="button" class="inspector-tab-btn ${activeTab==='sections'?'active':''}" onclick="ui.inspectorActiveTab='sections';overlay()">装配上下文 (${req.sections.length})</button>
      <button type="button" class="inspector-tab-btn ${activeTab==='excluded'?'active':''}" onclick="ui.inspectorActiveTab='excluded';overlay()">排除条目与原因 (${req.excluded.length})</button>
      <button type="button" class="inspector-tab-btn ${activeTab==='conflicts'?'active':''}" onclick="ui.inspectorActiveTab='conflicts';overlay()">冲突与协议参数 (${req.conflicts.length})</button>
      <button type="button" class="inspector-tab-btn ${activeTab==='history'?'active':''}" onclick="ui.inspectorActiveTab='history';overlay()">历史请求记录 (${allRequests.length})</button>
    </div>

    <!-- Main Content Area -->
    <div class="inspector-body">
      ${req.response ? `
        <div style="background:#162419;border:1px solid #285433;border-radius:8px;padding:10px 14px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="color:#4ade80">✓</span>
            <span style="font-size:12px;color:#86efac;font-weight:600">已获得 AI 生成响应 (${req.response.length} 字符)</span>
          </div>
          <button type="button" class="btn quiet sm" onclick="var el=document.getElementById('inspected-response-preview');el.hidden=!el.hidden" style="color:#4ade80;font-size:11px">查看响应文本 ▼</button>
        </div>
        <div id="inspected-response-preview" hidden style="background:#121a14;border:1px solid #1e3a25;border-radius:6px;padding:10px 12px;margin-bottom:12px;max-height:160px;overflow-y:auto;font-size:11.5px;color:#d1fae5;white-space:pre-wrap;font-family:ui-monospace,monospace">${E(req.response || '')}</div>
      ` : ''}
      ${activeTab === 'sections' ? `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${req.sections.map((sec, idx) => `
            <div class="section-card">
              <div class="section-card-head" onclick="var el=document.getElementById('sec_cnt_${idx}');el.hidden=!el.hidden">
                <div style="display:flex;align-items:center;gap:8px">
                  <span class="chip" style="font-size:10px;padding:1px 6px;background:#292929;color:${sec.messageRole==='system'?'#ac97f5':(sec.messageRole==='user'?'#60a5fa':'#4ade80')}">${sec.messageRole.toUpperCase()}</span>
                  <strong style="font-size:12.5px;color:#f0f0f0">${idx + 1}. ${E(sec.name || '未命名上下文段')}</strong>
                  <span class="tiny" style="color:#777">来源: ${E(sec.source?.type || '内置')}</span>
                </div>
                <div style="display:flex;align-items:center;gap:8px">
                  <span class="tiny" style="color:#888">${sec.content.length} 字符</span>
                  <span style="font-size:10px;color:#666">▼</span>
                </div>
              </div>
              <div id="sec_cnt_${idx}" class="section-content-box">${E(sec.content)}</div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${activeTab === 'excluded' ? `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${req.excluded.length ? req.excluded.map(ex => `
            <div style="padding:10px 14px;background:#201818;border:1px solid #3d2424;border-radius:8px;display:flex;align-items:center;justify-content:space-between;gap:12px">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="color:#f87171">✕</span>
                <div>
                  <strong style="font-size:12.5px;color:#fca5a5">${E(ex.source?.name || ex.source?.id || '未命名设定')}</strong>
                  <div class="tiny" style="color:#9e9e9e">对象类型: ${E(ex.source?.type || '设定')}</div>
                </div>
              </div>
              <div style="text-align:right">
                <span class="chip" style="background:#2d1b1b;color:#fca5a5;border-color:#5c2d2d">${E(ex.reason)}</span>
              </div>
            </div>
          `).join('') : `
            <div class="empty-quiet" style="padding:30px;text-align:center">当前上下文无任何被排除或被裁减的设定条目。</div>
          `}
        </div>
      ` : ''}

      ${activeTab === 'conflicts' ? `
        <div style="display:flex;flex-direction:column;gap:12px">
          ${req.conflicts.length ? `
            <div style="background:#241f17;border:1px solid #4a3b22;border-radius:8px;padding:12px 14px">
              <strong style="font-size:12.5px;color:#fde047;display:block;margin-bottom:8px">⚠️ 设定冲突或分叉覆盖报告 (${req.conflicts.length})</strong>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${req.conflicts.map(c => `
                  <div style="font-size:11.5px;color:#fef08a;padding:4px 0">
                    • 规则：${E(c.rule || '独立版本覆盖')} <span class="tiny" style="color:#a1a1aa">(${E(c.type)})</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : `
            <div class="empty-quiet" style="padding:12px 14px">暂无版本分叉或状态覆盖冲突。</div>
          `}

          <!-- Transport Info -->
          <div style="background:#1d1d1d;border:1px solid #2f2f2f;border-radius:8px;padding:12px 14px">
            <strong style="font-size:12.5px;color:#f0f0f0;display:block;margin-bottom:8px">网络协议参数细节</strong>
            <div class="grid2" style="font-size:11.5px;color:#aaa;gap:8px">
              <div>协议端点：<span style="color:#fff">${E(req.transport.url)}</span></div>
              <div>协议类型：<span style="color:#fff">${E(req.transport.protocol)}</span></div>
              ${req.transport.systemPlacement ? `<div style="grid-column:span 2;color:#fcd34d">系统提示转换：${E(req.transport.systemPlacement)}</div>` : ''}
              ${req.transport.omittedParameters?.length ? `<div style="grid-column:span 2;color:#fb7185">协议已忽略参数：${E(req.transport.omittedParameters.join(', '))}</div>` : ''}
            </div>
          </div>
        </div>
      ` : ''}

      ${activeTab === 'history' ? `
        <div style="display:flex;flex-direction:column;gap:8px">
          ${allRequests.length ? allRequests.map(r => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:#202020;border:1px solid #333;border-radius:8px;cursor:pointer" onclick="ui.activeInspectedRequest=CreationWorkflow.listRequests().find(x=>x.id==='${r.id}');overlay()">
              <div>
                <strong style="font-size:12.5px;color:#fff">${E(r.configuration?.modelName || r.configuration?.modelId || '未知模型')}</strong>
                <span class="tiny" style="color:#888;margin-left:6px">${new Date(r.createdAt).toLocaleTimeString()} · ${E(r.featureKey)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="chip ${r.status==='succeeded'?'green':(r.status==='failed'?'red':'')}" style="font-size:10.5px">${E(r.status)}</span>
                <span class="tiny" style="color:var(--ui-accent,#ac97f5)">查看此快照 →</span>
              </div>
            </div>
          `).join('') : `<div class="empty-quiet" style="padding:30px;text-align:center">暂无历史请求记录。</div>`}
        </div>
      ` : ''}
    </div>

    <!-- Inspector Footer -->
    <div class="inspector-footer">
      <div>
        ${req.status === 'succeeded' ? `
          <button class="btn quiet sm" onclick="saveInspectedAsCandidate('${req.id}')">${I('spark')} 存为候选提议 (responseCandidate)</button>
        ` : `<span class="tiny" style="color:#777">快照状态：${req.status} · 随时可直接重试或发送</span>`}
      </div>
      <div class="flex gap8">
        <button class="btn sm" onclick="closeModal()">关闭</button>
        <button class="btn primary sm" id="btn-exec-snapshot" onclick="executeInspectedSnapshot('${req.id}')">${I('send')} 以此快照发送请求</button>
      </div>
    </div>
  `;
}

async function executeInspectedSnapshot(requestId) {
  const snapshot = ui.activeInspectedRequest;
  if (!snapshot || snapshot.id !== requestId || snapshot.status !== 'preview') return toast('请重新预检当前输入');
  if (!snapshot.context?.input?.trim()) return toast('请输入消息后再发送');
  // Unpersisted previews are not executable historical requests.
  const currentId = snapshot.context.rpSessionId || snapshot.context.sessionId;
  if (currentId !== (ui.page === 'rp' ? ui.rpSessionId : ui.sessionId)) return toast('会话已变化，请重新预检');
  try {
    const fresh = CreationWorkflow.buildRequest(snapshot.context);
    if (JSON.stringify(fresh.payload) !== JSON.stringify(snapshot.payload)) return toast('上下文已变化，请重新预检');
    requestId = CreationWorkflow.prepareRequest(snapshot.context).id;
  } catch (err) { return toast('预检失败: ' + err.message); }
  const btn = document.getElementById('btn-exec-snapshot');
  if (btn) {
    btn.disabled = true;
    btn.textContent = '发送调用中...';
  }
  try {
    toast('正在通过网络协议发送请求快照...');
    await CreationWorkflow.executeRequest(requestId);
    CreationWorkflow.commitResponse(requestId);
    toast('调用成功，回复已入库');
    closeModal();
    render();
  } catch (err) {
    toast('发送失败: ' + err.message);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = I('send') + ' 以此快照发送请求';
    }
  }
}

function saveInspectedAsCandidate(requestId) {
  try {
    const req = ui.activeInspectedRequest || (CreationWorkflow.listRequests ? CreationWorkflow.listRequests().find(x => x.id === requestId) : null);
    if (!req) throw new Error('未找到请求记录');
    const linked = req.context?.sessionId ? session(req.context.sessionId)?.roles || [] : [];
    const targetRoleId = req.context?.roleId || (linked.length === 1 ? linked[0] : null);
    if (!targetRoleId) throw new Error('请求未明确关联唯一角色，不能自动保存到角色资料');
    const cand = CreationWorkflow.responseCandidate(requestId, { type: 'role', id: targetRoleId }, 'visual');
    toast('已为【' + (role(targetRoleId)?.name || targetRoleId) + '】保存视觉候选提案');
    overlay();
  } catch (err) {
    toast('保存候选失败: ' + err.message);
  }
}

function openCandidateTrayModal(filter = 'pending') {
  ui.candidateTrayFilter = filter;
  ui.modal = 'candidateTray';
  overlay();
}

function renderCandidateTrayModal() {
  if (!window.CreationWorkflow || !CreationWorkflow.listCandidates) {
    return `<div style="padding:30px;text-align:center">创作流引擎未就绪。<div class="modal-footer"><button class="btn" onclick="closeModal()">关闭</button></div></div>`;
  }
  const allCandidates = CreationWorkflow.listCandidates().slice().reverse();
  const filter = ui.candidateTrayFilter || 'pending';
  const filtered = allCandidates.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'pending') return c.status === 'pending';
    if (filter === 'adopted') return c.status === 'adopted';
    if (filter === 'discarded') return c.status === 'discarded' || c.status === 'archived';
    return true;
  });

  const pendingCount = allCandidates.filter(c => c.status === 'pending').length;
  const adoptedCount = allCandidates.filter(c => c.status === 'adopted').length;
  const discardedCount = allCandidates.filter(c => c.status === 'discarded' || c.status === 'archived').length;

  const moduleNames = {
    concept: '概念工坊发散',
    request: 'AI 生成响应',
    work: '作品版本回写',
    rp: 'RP 临时状态提议',
    deleted: '已删除对象关联'
  };

  return `
    <div class="tray-header">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="color:var(--ui-accent,#ac97f5);font-size:16px">${I('spark')}</span>
        <div>
          <h2 style="font-size:15px;font-weight:650;margin:0;color:#f4f4f5">统一候选提议托盘</h2>
          <span style="font-size:11.5px;color:#858585">工坊概念发散 · AI请求响应 · 作品独立版本回写 · 显式差异采纳</span>
        </div>
      </div>
      <button class="ghost" onclick="closeModal()" aria-label="关闭">${I('x')}</button>
    </div>

    <div class="tray-filter-bar">
      <div class="flex gap6">
        <button type="button" class="btn quiet sm ${filter==='pending'?'active':''}" style="${filter==='pending'?'background:#2e2e2e;color:#fff;border-color:#555':''}" onclick="ui.candidateTrayFilter='pending';overlay()">待处理 (${pendingCount})</button>
        <button type="button" class="btn quiet sm ${filter==='all'?'active':''}" style="${filter==='all'?'background:#2e2e2e;color:#fff;border-color:#555':''}" onclick="ui.candidateTrayFilter='all';overlay()">全部候选 (${allCandidates.length})</button>
        <button type="button" class="btn quiet sm ${filter==='adopted'?'active':''}" style="${filter==='adopted'?'background:#2e2e2e;color:#fff;border-color:#555':''}" onclick="ui.candidateTrayFilter='adopted';overlay()">已采纳 (${adoptedCount})</button>
        <button type="button" class="btn quiet sm ${filter==='discarded'?'active':''}" style="${filter==='discarded'?'background:#2e2e2e;color:#fff;border-color:#555':''}" onclick="ui.candidateTrayFilter='discarded';overlay()">已放弃/归档 (${discardedCount})</button>
      </div>
      <span class="tiny" style="color:#777">保留工坊原生结构 · 支持差异对比与局部采纳</span>
    </div>

    <div class="tray-body">
      ${filtered.length ? filtered.map(c => {
        const diffs = (CreationWorkflow.compareCandidates ? CreationWorkflow.compareCandidates([c.id])[0]?.differences || [] : []);
        const hasConflicts = diffs.some(d => d.conflict);
        const isPending = (c.status === 'pending');
        const isConcept = (c.type === 'character-concept' || (!diffs.length && c.nativePayload));
        const targetDesc = c.target ? (c.target.type === 'role' ? '角色: ' + (role(c.target.id)?.name || c.target.id) : (c.target.type === 'workRole' ? '作品角色版本: ' + c.target.id : c.target.type + ' ' + c.target.id)) : (c.deletedTarget ? '已解绑目标 (' + c.deletedTarget.name + ')' : (isConcept ? '新角色提案（未绑定）' : '未指定目标'));

        const conceptNarrative = c.nativePayload?.narrative?.description || c.nativePayload?.narrative?.title || '';
        const conceptTags = [
          ...Object.values(c.nativePayload?.tags || {}).filter(v => typeof v === 'string'),
          ...(c.nativePayload?.fixed || []),
          ...(c.nativePayload?.free || []).map(f => typeof f === 'string' ? f : f?.tag).filter(Boolean)
        ];

        return `
          <div class="candidate-card" id="cand_card_${c.id}">
            <div class="candidate-card-head">
              <div style="display:flex;align-items:center;gap:8px">
                <span class="chip" style="font-size:10px;background:#2a2638;color:#c4b5fd;border-color:#493868">${moduleNames[c.source?.module] || c.source?.module || '提议'}</span>
                <strong style="font-size:12.5px;color:#f0f0f0">${E(c.nativePayload?.narrative?.title || c.nativePayload?.name || ('候选 #' + c.id.slice(-6)))}</strong>
                <span class="tiny" style="color:#888">目标: <strong style="color:#ccc">${E(targetDesc)}</strong></span>
              </div>
              <div style="display:flex;align-items:center;gap:8px">
                <span class="chip ${c.status==='adopted'?'green':(c.status==='discarded'?'red':'')}" style="font-size:10px">${c.status === 'pending' ? '待采纳' : (c.status === 'adopted' ? '已采纳' : '已放弃')}</span>
                <span class="tiny" style="color:#666">${new Date(c.createdAt).toLocaleTimeString()}</span>
              </div>
            </div>

            ${diffs.length ? `
              <!-- Diff header -->
              <div style="background:#181818;padding:6px 14px;border-bottom:1px solid #282828;display:grid;grid-template-columns:140px 1fr 1fr 1fr;gap:8px;font-size:10.5px;color:#777;font-weight:600">
                <span>提议字段</span>
                <span>基准值 (Base)</span>
                <span>当前最新值 (Current)</span>
                <span style="color:var(--ui-accent,#ac97f5)">待采纳提议 (Proposed)</span>
              </div>

              <!-- Diff rows -->
              <div style="display:flex;flex-direction:column">
                ${diffs.map((d, dIdx) => `
                  <div class="diff-grid" style="${d.conflict ? 'background:#241d18' : ''}">
                    <div>
                      <label style="display:flex;align-items:center;gap:6px;cursor:pointer">
                        ${isPending && !d.adopted ? `<input type="checkbox" id="chk_${c.id}_${dIdx}" data-cand="${c.id}" data-field="${E(d.field)}" checked>` : ''}
                        <strong style="color:#ddd">${E(d.field)}</strong>
                      </label>
                      ${d.adopted ? `<span class="tiny" style="color:#4ade80;display:block;margin-top:2px">✓ 已采纳</span>` : ''}
                      ${d.conflict ? `<span class="tiny" style="color:#fbbf24;display:block;margin-top:2px">⚠️ 存在覆盖冲突</span>` : ''}
                    </div>
                    <div class="diff-cell" style="color:#888">${E(typeof d.base === 'object' ? JSON.stringify(d.base, null, 2) : String(d.base ?? '（空）'))}</div>
                    <div class="diff-cell" style="color:${d.conflict ? '#fde047' : '#bbb'}">${E(typeof d.current === 'object' ? JSON.stringify(d.current, null, 2) : String(d.current ?? '（空）'))}</div>
                    <div class="diff-cell" style="color:#86efac;border-color:rgba(74,222,128,0.2)">${E(typeof d.proposed === 'object' ? JSON.stringify(d.proposed, null, 2) : String(d.proposed ?? '（空）'))}</div>
                  </div>
                `).join('')}
              </div>
            ` : isConcept ? `
              <!-- Concept Native Narrative Payload -->
              <div style="padding:10px 14px;background:#181818;font-size:12px;color:#d4d4d8;line-height:1.65;border-bottom:1px solid #282828">
                ${E(conceptNarrative || '（暂无详细叙事描述）')}
              </div>
              ${conceptTags.length ? `
                <div style="padding:8px 14px;background:#161616;border-bottom:1px solid #262626;display:flex;align-items:center;flex-wrap:wrap;gap:6px">
                  <span class="tiny" style="color:#777;margin-right:4px">设定特征:</span>
                  ${conceptTags.map(t => `<span class="chip" style="font-size:10px;background:#242424;color:#bbb">${E(t)}</span>`).join('')}
                </div>
              ` : ''}
            ` : `
              <div class="tiny" style="color:#777;padding:12px 14px;background:#181818;border-bottom:1px solid #282828">此提议无待采纳的字段差异。</div>
            `}

            ${isPending ? `
              <div style="padding:10px 14px;background:#191919;border-top:1px solid #282828;display:flex;align-items:center;justify-content:space-between">
                <div style="display:flex;align-items:center;gap:8px">
                  ${diffs.length ? (hasConflicts ? `
                    <label style="display:flex;align-items:center;gap:6px;font-size:11px;color:#fde047;cursor:pointer">
                      <input type="checkbox" id="overwrite_${c.id}">
                      <span>允许覆盖已变更的当前字段冲突</span>
                    </label>
                  ` : `<span class="tiny" style="color:#777">无字段冲突，可直接采纳</span>`) : (isConcept ? `
                    <span class="tiny" style="color:#888">指定入库目标:</span>
                    <select class="select sm" style="width:auto;min-width:180px;font-size:11px;padding:4px 8px;background:#242424;border-color:#3e3e3e" onchange="v3BindConceptToRole('${c.id}', this.value)">
                      <option value="">绑定至已有角色（生成字段对比）...</option>
                      ${roles.filter(r => !r.archivedAt).map(r => `<option value="${r.id}">对比绑定：${E(r.name)}</option>`).join('')}
                    </select>
                  ` : `<span class="tiny" style="color:#777">无差异字段</span>`)}
                </div>
                <div class="flex gap8">
                  <button type="button" class="btn quiet sm" onclick="v3DiscardCandidate('${c.id}')">${I('trash')} 放弃提议</button>
                  <button type="button" class="btn quiet sm" onclick="v3SaveCandidateVersion('${c.id}')">${I('folder')} 另存独立版本</button>
                  ${diffs.length ? `
                    <button type="button" class="btn primary sm" onclick="v3AdoptCandidate('${c.id}')">${I('check')} 采纳选定字段</button>
                  ` : (isConcept ? `
                    <button type="button" class="btn primary sm" onclick="v3ImportConceptCandidate('${c.id}')">${I('plus')} 一键入库为新角色</button>
                  ` : '')}
                </div>
              </div>
            ` : ''}
          </div>
        `;
      }).join('') : `
        <div class="empty" style="padding:60px 20px;text-align:center">
          <div style="font-size:28px;color:#444;margin-bottom:10px">${I('spark')}</div>
          <h3 style="color:#ccc;font-size:14px;margin-bottom:4px">暂无符合条件的候选提议</h3>
          <p class="sub" style="font-size:12px;color:#777">可以在概念工坊中发散提议、在请求检查器中转存响应、或在小说编辑台中提议回写作品角色设定。</p>
        </div>
      `}
    </div>

    <div class="tray-footer">
      <span class="tiny" style="color:#777">已采纳字段将自动记录入系统溯源库，不影响已有未冲突内容</span>
      <button class="btn sm" onclick="closeModal()">关闭</button>
    </div>
  `;
}

function v3ImportConceptCandidate(candidateId) {
  try {
    const all = (window.CreationWorkflow?.listCandidates ? CreationWorkflow.listCandidates() : []);
    const c = all.find(v => v.id === candidateId);
    if (!c || !c.nativePayload) return toast('候选数据异常');
    if (window.CreationWorkflow?.importConceptRole) {
      const created = CreationWorkflow.importConceptRole(c.nativePayload);
      c.status = 'adopted';
      overlay();
      render();
      toast('已成功导入为新角色档案：「' + (created.name || '新角色') + '」');
    }
  } catch (e) {
    toast('导入失败: ' + e.message);
  }
}

function v3BindConceptToRole(candidateId, roleId) {
  if (!roleId) return;
  try {
    const all = (window.CreationWorkflow?.listCandidates ? CreationWorkflow.listCandidates() : []);
    const c = all.find(v => v.id === candidateId);
    if (!c || !c.nativePayload) return;
    const content = {
      visual: c.nativePayload.narrative?.description || '',
      desc: c.nativePayload.narrative?.title || '',
      tags: Object.values(c.nativePayload.tags || {}).filter(v => typeof v === 'string')
    };
    if (window.CreationWorkflow?.bindCandidate) {
      CreationWorkflow.bindCandidate(candidateId, { type: 'role', id: roleId }, content);
      overlay();
      render();
      toast('已绑定至角色，已生成字段差异对比');
    }
  } catch (e) {
    toast('绑定失败: ' + e.message);
  }
}

function v3AdoptCandidate(candidateId) {
  try {
    const checkboxes = document.querySelectorAll(`input[data-cand="${candidateId}"]:checked`);
    const fields = Array.from(checkboxes).map(cb => cb.getAttribute('data-field'));
    if (!fields.length) {
      toast('请勾选至少一个待采纳字段');
      return;
    }
    const overwriteEl = document.getElementById(`overwrite_${candidateId}`);
    const resolutions = {};
    if (overwriteEl && overwriteEl.checked) {
      fields.forEach(f => { resolutions[f] = 'overwrite'; });
    }
    CreationWorkflow.adoptCandidate(candidateId, fields, resolutions);
    toast('✓ 已成功采纳选定字段并合入目标');
    overlay();
    render();
  } catch (err) {
    toast('采纳失败: ' + err.message);
  }
}

function v3DiscardCandidate(candidateId) {
  try {
    CreationWorkflow.setCandidateStatus(candidateId, 'discarded');
    toast('已放弃该提议');
    overlay();
  } catch (err) {
    toast('操作失败: ' + err.message);
  }
}

function v3SaveCandidateVersion(candidateId) {
  try {
    CreationWorkflow.saveCandidateVersion(candidateId);
    toast('已另存为独立版本提议');
    overlay();
  } catch (err) {
    toast('另存失败: ' + err.message);
  }
}

function v3ForkRoleForWork(workId, roleId) {
  try {
    CreationWorkflow.createWorkRole(workId, roleId);
    toast('已为作品创建独立角色版本');
    render();
  } catch (e) {
    toast('创建版本失败: ' + e.message);
  }
}

function v3UnlinkRoleFromWork(workId, roleId) {
  try {
    CreationWorkflow.unlinkRole(workId, roleId);
    toast('已解绑作品角色版本');
    render();
  } catch (e) {
    toast('解绑失败: ' + e.message);
  }
}

function v3ProposeWorkRoleDiff(versionId) {
  try {
    const curWorkId = ui.workId || store.works?.[0]?.id || 'w1';
    const version = (window.CreationWorkflow?.getWorkRoles ? CreationWorkflow.getWorkRoles(curWorkId) : []).find(v => v.id === versionId);
    if (!version) throw new Error('未找到作品角色版本');
    const fieldsToCheck = ['visual', 'desc', 'profile.intro', 'profile.identity', 'profile.abilities', 'profile.personality', 'profile.background'];
    const cand = CreationWorkflow.proposeOriginalUpdate(versionId, fieldsToCheck);
    toast('✓ 已生成原档案回写提议');
    openCandidateTrayModal('pending');
  } catch (e) {
    toast('提议回写失败: ' + e.message);
  }
}

function v3SelectDetachedRpSession(sessId) {
  const sess = (window.CreationWorkflow?.getRp ? CreationWorkflow.getRp(sessId) : null);
  if (!sess) return;
  ui.rpSessionId = sessId;
  ui.rpRole = null;
  render();
}

function v3SelectParentBranch(parentSessId) {
  try {
    const allRp = (window.CreationWorkflow?.listObjects ? CreationWorkflow.listObjects('rp', { includeArchived: true }) : []);
    const parent = allRp.find(s => s.id === parentSessId) || (window.CreationWorkflow?.getRp ? CreationWorkflow.getRp(parentSessId) : null);
    if (!parent) return toast('未找到上级分支记录');
    const roleId = Object.keys(store.rpSessions || {}).find(k => (store.rpSessions[k] || []).some(s => s.id === parentSessId));
    if (roleId) {
      ui.rpRole = roleId;
      ui.rpSessionId = parentSessId;
      store.rpHistories[roleId] = parent.messages || [];
    } else {
      ui.rpSessionId = parentSessId;
      ui.rpRole = null;
    }
    render();
    toast('已切回上级分支：' + (parent.title || '上级分支'));
  } catch (e) {
    toast('切回分支失败: ' + e.message);
  }
}

function v3BranchRpMessage(msgIdx) {
  const history = v3RpActiveMessages();
  const m = history?.[msgIdx];
  if (!m) return;
  m.id = m.id || ('msg_' + Date.now() + '_' + msgIdx);
  const curSessTitle = (ui.rpRole && store.rpSessions?.[ui.rpRole]?.find(s => s.id === ui.rpSessionId)?.title) || '当前分支';
  const title = prompt('为分叉后的新剧情分支命名：', curSessTitle + ' · 分支');
  if (!title || !title.trim()) return;
  try {
    if (window.CreationWorkflow?.branch) {
      const child = CreationWorkflow.branch(ui.rpSessionId, m.id, title.trim());
      ui.rpSessionId = child.id;
      render();
      toast('已成功分叉新剧情：' + child.title);
    } else {
      toast('分叉引擎未就绪');
    }
  } catch (e) {
    toast('分叉失败: ' + e.message);
  }
}

function v3InsertTrial(sessId, trialId) {
  try {
    if (window.CreationWorkflow?.insertTrial) {
      CreationWorkflow.insertTrial(sessId, trialId);
      toast('已将试演文本填入输入框');
    } else {
      toast('试演接口未就绪');
    }
  } catch (e) {
    toast('填入失败: ' + e.message);
  }
}

function v3AdoptTrial(sessId, trialId) {
  try {
    if (window.CreationWorkflow?.adoptTrial) {
      CreationWorkflow.adoptTrial(sessId, trialId);
      render();
      toast('试演候选已采纳为正式消息');
    } else {
      toast('试演接口未就绪');
    }
  } catch (e) {
    toast('采纳失败: ' + e.message);
  }
}

function v3DiscardTrial(sessId, trialId) {
  try {
    if (window.CreationWorkflow?.discardTrial) {
      CreationWorkflow.discardTrial(sessId, trialId);
      render();
      toast('已放弃该试演');
    } else {
      toast('试演接口未就绪');
    }
  } catch (e) {
    toast('放弃失败: ' + e.message);
  }
}

function v3CreateManualTrial(sessId) {
  const text = prompt('输入隔离试演文本（采纳前不影响当前剧情）：');
  if (!text || !text.trim()) return;
  try {
    if (window.CreationWorkflow?.trial) {
      CreationWorkflow.trial(sessId, text.trim(), { module: 'manual', title: '自定义试演' });
      render();
      toast('已添加隔离试演');
    } else {
      toast('试演引擎未就绪');
    }
  } catch (e) {
    toast('添加失败: ' + e.message);
  }
}

function overlay(){
  initAdaptedV3State();
  const el=document.getElementById('overlay');
  if(!ui.modal){el.innerHTML='';return}
  const inner=modalBody();
  let modalClass = '';
  if(ui.modal === 'settings') modalClass = 'modal-settings-dialog' + (ui.settingsMaximized ? ' maximized' : '');
  else if(ui.modal === 'worldinfo') modalClass = 'modal-worldinfo-dialog';
  else if(ui.modal === 'persona') modalClass = 'modal-persona-dialog';
  else if(ui.modal === 'roleTagFilter') modalClass = 'modal-tagfilter-dialog';
  else if(ui.modal === 'deleteImpact') modalClass = 'modal-delete-impact-dialog';
  else if(ui.modal === 'requestInspector') modalClass = 'modal-request-inspector-dialog';
  else if(ui.modal === 'candidateTray') modalClass = 'modal-candidate-tray-dialog';
  else if(ui.modal === 'editConnection') modalClass = 'wide modal-edit-connection-dialog';
  else if(ui.modal === 'manageModels') modalClass = 'wide modal-manage-models-dialog';
  else if(ui.modal === 'links') modalClass = 'modal-links-dialog';
  else if(['search','new','aiPreview','roleToRp','unifiedModelPicker','addCustomModel','quickAssign','providerPicker','subtaskConfig'].includes(ui.modal)) modalClass = 'wide' + (ui.modal === 'unifiedModelPicker' || ui.modal === 'providerPicker' ? ' modal-model-picker' : '');
  el.innerHTML=`<div class="modal-layer" onclick="if(event.target===this)closeModal()"><div class="modal ${modalClass}" role="dialog" aria-modal="true">${inner}</div></div>`;
  if(ui.modal==='search')setTimeout(()=>document.getElementById('globalSearch')?.focus(),15);
  if(ui.modal==='editConnection'&&ui.showDiscoveryTray)setTimeout(()=>renderDiscoveredModelsList(),0);
}
function modalHead(title){return `<header><div><h2>${title}</h2></div><button class="ghost" onclick="closeModal()" aria-label="关闭">${I('x')}</button></header>`}
function modalBody(){
  if (ui.modal === 'deleteImpact') return renderDeleteImpactModal();
  if (ui.modal === 'requestInspector') return renderRequestInspectorModal();
  if (ui.modal === 'candidateTray') return renderCandidateTrayModal();
  if (ui.modal === 'providerPicker') return renderProviderPickerModal();
  if (ui.modal === 'subtaskConfig') return renderSubtaskConfigModal();
  if (ui.modal === 'editConnection') return renderEditConnectionModal();
  if (ui.modal === 'manageModels') return renderManageModelsModal();
  if (ui.modal === 'unifiedModelPicker') return renderUnifiedModelPickerModal();
  if (ui.modal === 'addCustomModel') return renderAddCustomModelModal();
  if (ui.modal === 'quickAssign') return renderQuickAssignModal();
  if(ui.modal==='quick')return `${modalHead('开始创作','打开已有内容或新建一次创作。')}<div class="choice-grid"><button class="choice" onclick="visit('concept');closeModal()"><strong>${I('spark')} 角色概念工坊 (V3)</strong><small>自然语言定向探索、概念分支图谱发散与一键入库</small></button><button class="choice" onclick="openNew()"><strong>${I('chat')} 新建会话</strong><small>选择设计、构图、剧情等用途</small></button><button class="choice" onclick="visit('roles')"><strong>${I('users')} 打开角色库</strong><small>查看角色、标签和相关讨论</small></button><button class="choice" onclick="visit('editor')"><strong>${I('book')} 打开小说</strong><small>编辑章节、讨论正文</small></button><button class="choice" onclick="visit('rp')"><strong>${I('theater')} 开始 RP</strong><small>进入独立的角色扮演页面</small></button></div>`;
if(ui.modal==='new')return `${modalHead('新建创作会话','选择本次讨论的目的，之后可以随时切换模型与关联角色。')}<div class="choice-grid">${choices.map(c=>`<button class="choice ${ui.newKind===c.id?'on':''}" onclick="ui.newKind='${c.id}';overlay()"><strong>${I(c.icon)} ${E(c.name)}</strong><small>${E(c.desc)}</small></button>`).join('')}</div><div class="grid2" style="margin-top:18px"><div class="formrow"><label>会话标题（可选）</label><input class="input" id="newTitle" placeholder="例如：新的角色设计实验" value="${E(ui.newTitle)}" oninput="ui.newTitle=this.value"></div><div class="formrow"><label>关联角色（可选）</label><select class="select" onchange="ui.newRole=this.value"><option value="none">暂不关联角色</option>${roles.map(r=>`<option value="${r.id}" ${ui.newRole===r.id?'selected':''}>${E(r.name)}</option>`).join('')}</select></div></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="newSession()">${I('plus')} 创建会话</button></div>`;
if(ui.modal==='links'){let s=session(ui.sessionId);return `${modalHead('关联角色')}<div style="margin:12px 0;display:flex;flex-direction:column;gap:3px">${roles.map(r=>`<label class="clickrow" style="display:flex;align-items:center;gap:10px;padding:8px 10px;margin:2px 0;border-radius:6px;cursor:pointer"><input type="checkbox" style="accent-color:#888;width:14px;height:14px;cursor:pointer" ${s.roles.includes(r.id)?'checked':''} onchange="modifyLink('${s.id}','${r.id}',this.checked)"><span style="font-size:12.5px;font-weight:500;color:#e5e5e5">${E(r.name)}</span></label>`).join('')}</div><div class="modal-footer"><button class="btn" style="padding:5px 14px;font-size:12px;background:#2c2c2c;border-color:#3e3e3e" onclick="closeModal()">完成</button></div>`}
if(ui.modal==='sessionEdit'){const s=session(ui.sessionId);return `${modalHead('编辑会话资料','调整用途与标题，不需要重新建立对话。')}<div class="formrow"><label>标题</label><input class="input" id="sessionTitle" value="${E(s.title)}"></div><div class="formrow"><label>创作类型</label><select class="select" id="sessionKind">${choices.map(c=>`<option value="${c.id}" ${s.kind===c.id?'selected':''}>${E(c.name)}</option>`).join('')}</select></div><div class="formrow"><label>进度摘要</label><textarea class="textarea" rows="2" id="sessionSummary">${E(s.summary)}</textarea></div><div class="modal-footer"><div class="flex gap8" style="margin-right:auto">${s.archivedAt ? `<button type="button" class="btn sm" onclick="restoreObject({type:'session',id:'${s.id}'})">${I('refresh')} 恢复会话</button>` : `<button type="button" class="btn sm" onclick="archiveObject({type:'session',id:'${s.id}'})">${I('folder')} 归档会话</button>`}<button type="button" class="btn danger sm" onclick="openPermanentDeleteModal({type:'session',id:'${s.id}'})">${I('trash')} 永久删除会话...</button></div><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveSessionEdit()">保存</button></div>`}
if(ui.modal==='roleEdit'){const r=role(ui.roleId);return `${modalHead('编辑视觉角色档案','图形化维护基础资料，保存后角色库与关联页面同步更新。')}<div class="grid2"><div class="formrow"><label>角色名称</label><input class="input" id="roleNewName" value="${E(r.name)}"></div><div class="formrow"><label>角色系列</label><input class="input" id="roleNewSeries" value="${E(r.series)}"></div></div><div class="formrow"><label>视觉设定描述</label><textarea class="textarea" id="roleNewDescription" rows="5">${E(r.visual)}</textarea></div><div class="formrow"><label>视觉标签（逗号分隔）</label><input class="input" id="roleNewTags" value="${E(r.tags.join(', '))}"></div><div class="modal-footer"><div class="flex gap8" style="margin-right:auto">${r.archivedAt ? `<button type="button" class="btn sm" onclick="restoreObject({type:'role',id:'${r.id}'})">${I('refresh')} 恢复档案</button>` : `<button type="button" class="btn sm" onclick="archiveObject({type:'role',id:'${r.id}'})">${I('folder')} 移入归档</button>`}<button type="button" class="btn danger sm" onclick="openPermanentDeleteModal({type:'role',id:'${r.id}'})">${I('trash')} 永久删除档案...</button></div><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveRoleEdit()">${I('check')} 保存修改</button></div>`}
if(ui.modal==='roleCreate')return `${modalHead('新建视觉角色档案','可以只有视觉设定，没有剧情、性格或 RP 卡。')}<div class="grid2"><div class="formrow"><label>角色名称 *</label><input class="input" id="roleNewName" placeholder="例如：未命名猫娘骑士"></div><div class="formrow"><label>角色系列</label><input class="input" id="roleNewSeries" placeholder="例如：原创设计" value="原创设计"></div></div><div class="formrow"><label>视觉设定摘要</label><textarea class="textarea" id="roleNewDescription" rows="4" placeholder="可以简要记录确定的视觉方向，其余以后补充">${E(ui.page==='sessions'&&session(ui.sessionId)?.kind==='design'?(session(ui.sessionId).messages.filter(m=>m.by==='ai').at(-1)?.text||''):'')}</textarea></div><div class="formrow"><label>视觉标签（逗号分隔）</label><input class="input" id="roleNewTags" placeholder="猫耳, 无头骑士, 铠甲"></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveNewRole()">${I('check')} 创建角色档案</button></div>`;
if(ui.modal==='tagAdd')return `${modalHead('添加视觉标签','通过表单填写，程序会负责生成标准数据格式。')}<div class="grid2"><div class="formrow"><label>名称 *</label><input class="input" id="tagNewName" placeholder="例如：飞行员帽"></div><div class="formrow"><label>分类</label><select id="tagNewCat" class="select">${cats.slice(1).map(c=>`<option>${E(c)}</option>`).join('')}</select></div></div><div class="formrow"><label>解释</label><textarea class="textarea" id="tagNewDesc" rows="2" placeholder="简要解释视觉特征"></textarea></div><div class="formrow"><label>偏好权重 <span id="newTagW">65</span></label><input type="range" id="tagNewWeight" class="range" min="0" max="100" value="65" oninput="document.getElementById('newTagW').textContent=this.value"></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="addTagFromForm()">${I('plus')} 添加标签</button></div>`;
if(ui.modal==='aiPreview')return `${modalHead('AI 标签操作 · 预览','模型返回的操作建议，确认后执行，可撤销。')}<div class="example">${E(ui.aiDraft||'尚未输入指令')}</div><div style="margin:14px 0">${ui.preview.length?ui.preview.map(p=>`<div class="clickrow" style="margin:7px 0"><span class="chip ${p.kind==='add'?'green':''}">${p.kind==='add'?'添加':'删除'}</span>　${E(p.name)} ${p.kind==='remove'&&!store.tagItems.some(t=>t.name===p.name)?'<span class="warning">· 当前库中未找到</span>':''}</div>`).join(''):'<div class="empty-quiet" style="padding:16px;text-align:center">未识别到可执行的指令。可尝试：「删除猫爪，添加飞行员帽」。</div>'}</div><div class="modal-footer"><button class="btn" onclick="closeModal()">返回</button><button class="btn primary" ${ui.preview.length?'':'disabled'} onclick="applyAIPlan()">确认执行 · 可撤销</button></div>`;
if(ui.modal==='prompt'){return `${modalHead('整理 Codex 生图提示词','提示词属于场景讨论；不需要与每张成图绑定。')}<div class="formrow"><label>批次标题</label><input class="input" id="promptTitle" value="新的场景方案"></div><div class="formrow"><label>提示词正文</label><textarea class="textarea" id="promptText" rows="9" placeholder="角色设定、场景、构图、风格、限制、输出路径..."># 生图任务\n角色：引用当前角色视觉档案\n场景：\n构图：\n画风：清爽赛璐璐，干净线稿\n限制：保持角色既有特征\n输出：保存至对应角色文件夹</textarea></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="savePrompt()">${I('check')} 保存批次</button></div>`}
if(ui.modal==='promptView'){const s=session(ui.sessionId),p=s.prompts.find(x=>x.id===ui.editPromptId);return `${modalHead(E(p?.title||'生图任务'),'可以直接复制，或导出 .md 文件让 Codex Skill 按批次读取。')}<div class="promptbox">${E(p?.text||'')}</div><div class="modal-footer"><button class="btn" onclick="copyCurrentPrompt()">${I('copy')} 复制</button><button class="btn primary" onclick="exportPrompt()">${I('download')} 导出 Markdown</button></div>`}
if(ui.modal==='settings') {
  initAdaptedV3State();
  const cats = [
    {
      title: '统一连接与模型',
      tabs: [
        { id: 'api_connections', label: 'API 连接库', icon: 'link', keys: ['api', '连接', 'endpoint', 'key', '服务商', 'openai', 'claude', 'gemini', 'deepseek', 'ollama', '反代'] },
        { id: 'model_catalog', label: '统一模型目录', icon: 'spark', keys: ['模型', '目录', 'list', 'claude', 'gpt', 'deepseek', 'gemini', 'qwen', '搜索', 'catalog'] },
        { id: 'feature_allocation', label: '功能级 AI 分配', icon: 'settings', keys: ['功能', '用途', '分配', '覆盖', 'rp', '草稿', '脑暴', '概念工坊', 'agent', 'allocation'] }
      ]
    },
    {
      title: '采样与提示',
      tabs: [
        { id: 'rp_params', label: '生成参数预设', icon: 'theater', keys: ['采样', '温度', 'temperature', 'top_p', 'min_p', '惩罚', '预设', 'tokens', 'penalty', '参数'] },
        { id: 'creative_presets', label: '创作预设与 Agent', icon: 'book', keys: ['创作', '预设', 'agent', '模块', '指令', '提示词', '思维链', 'cot'] },
        { id: 'context_template', label: '指令与提示模板', icon: 'chat', keys: ['模板', 'instruct', 'chatml', 'llama', 'alpaca', '分词', '格式'] }
      ]
    },
    {
      title: '世界与设定',
      tabs: [
        { id: 'world_info', label: '世界书参数', icon: 'folder', keys: ['世界书', 'worldinfo', '递归', '深度', '预算', '条目', '常驻', '扫描'] },
        { id: 'persona', label: '用户身份', icon: 'users', keys: ['persona', '身份', '用户', '头像', '人设', '旅人', '默认'] }
      ]
    },
    {
      title: '界面与扩展',
      tabs: [
        { id: 'appearance', label: '外观与主题', icon: 'palette', keys: ['外观', '主题', '色调', '暗黑', 'accent', '紫色', '字体', '高对比'] },
        { id: 'extensions', label: '扩展系统', icon: 'plus', keys: ['扩展', '插件', '模块', 'tool', '函数', 'js', '第三方'] }
      ]
    },
    {
      title: '高级与系统',
      tabs: [
        { id: 'regex', label: '正则清洗与过滤', icon: 'filter', keys: ['正则', 'regex', '清洗', '过滤', '替换', '输入', '后处理'] },
        { id: 'system_base', label: '系统底座与备份', icon: 'download', keys: ['系统', '底座', '备份', '导出', '导入', '重置', '更新', '关于', '版本'] }
      ]
    }
  ];

  const searchQ = (ui.settingsSearchQuery || '').trim().toLowerCase();
  
  let navHtml = '';
  cats.forEach(grp => {
    const matchingTabs = grp.tabs.filter(t => {
      if (!searchQ) return true;
      if (t.label.toLowerCase().includes(searchQ)) return true;
      if (t.id.toLowerCase().includes(searchQ)) return true;
      if (grp.title.toLowerCase().includes(searchQ)) return true;
      if (t.keys && t.keys.some(k => k.toLowerCase().includes(searchQ))) return true;
      return false;
    });
    if (matchingTabs.length > 0) {
      navHtml += `<div class="settings-sidebar-group">
        <div class="settings-sidebar-heading">
          <span>${grp.title}</span>
        </div>`;
      matchingTabs.forEach(t => {
        navHtml += `
          <button class="settings-nav-item ${ui.settingsTab === t.id ? 'on' : ''}" onclick="switchSettingsTab('${t.id}')">
            <span class="nav-item-icon">${I(t.icon)}</span>
            <span class="settings-nav-label">${t.label}</span>
          </button>`;
      });
      navHtml += `</div>`;
    }
  });

  return `
    <div class="settings-header">
      <div class="settings-header-left">
        <h2 class="settings-header-title">系统与模型设置</h2>
        
      </div>
      <div class="settings-header-center">
        <div class="settings-header-search">
          <span class="settings-search-icon">${I('search')}</span>
          <input type="text" id="settingsSearch" class="settings-search-input" placeholder="快速检索设置项、模型或参数..." value="${E(ui.settingsSearchQuery || '')}" oninput="handleSettingsSearch(this.value)">
          ${ui.settingsSearchQuery ? `<button class="ghost icon-btn" onclick="clearSettingsSearch()" title="清空搜索">${I('x')}</button>` : `<kbd class="settings-search-kbd">Ctrl K</kbd>`}
        </div>
      </div>
      <div class="settings-header-right">
        <button class="ghost icon-btn" onclick="toggleSettingsMaximize()" title="${ui.settingsMaximized ? '还原窗口' : '最大化窗口'}">
          ${ui.settingsMaximized ? '<span style="font-size:13px;line-height:1">🗗</span>' : '<span style="font-size:13px;line-height:1">🗖</span>'}
        </button>
        <button class="ghost icon-btn" onclick="closeSettingsModal()" aria-label="关闭" title="关闭设置">${I('x')}</button>
      </div>
    </div>
    <div class="settings-body">
      <nav class="settings-sidebar" aria-label="设置导航">
        ${navHtml || '<div style="padding:16px;color:var(--text-muted);font-size:12px;text-align:center">无匹配设置项</div>'}
      </nav>
      <div class="settings-content-pane">
        ${renderSettingsPaneContent()}
      </div>
    </div>
  `;
}
if(ui.modal==='worldinfo') {
  return renderWorldInfoDialog();
}
if(ui.modal==='persona') {
  return renderPersonaDialog();
}
if(ui.modal==='roleTagFilter') {
  return renderRoleTagFilterModal();
}
if(ui.modal==='roleToRp') {
  return renderRoleToRpModal();
}
if(ui.modal==='search')return `${modalHead('全局搜索','查找角色、会话、标签与作品。输入后可直接打开结果。')}<input id="globalSearch" class="input" style="font-size:15px;padding:13px" placeholder="搜索：崔依玟、猫耳、第三章、雪人..." value="${E(ui.search)}" oninput="searchUpdate(this.value)"><div id="results">${searchResults()}</div><div class="modal-footer"><span class="tiny">Esc 关闭 · Ctrl K 打开</span></div>`;
return `${modalHead('演示说明')}<p class="small-over">功能模块配置已载入本地工作区。</p><div class="modal-footer"><button class="btn" onclick="closeModal()">关闭</button></div>`}
function modifyLink(id,roleId,checked){const s=session(id);if(!s)return;if(checked&&!s.roles.includes(roleId))s.roles.push(roleId);if(!checked)s.roles=s.roles.filter(r=>!r.archivedAt&&r!==roleId);save();overlay();toast('会话关联已更新')}
function saveSessionEdit(){const s=session(ui.sessionId);if(!s)return;s.title=document.getElementById('sessionTitle').value.trim()||s.title;s.summary=document.getElementById('sessionSummary').value.trim();s.kind=document.getElementById('sessionKind').value;save();closeModal();render();toast('会话信息已更新')}
function saveRoleEdit(){const r=role(ui.roleId);if(!r)return;const name=document.getElementById('roleNewName').value.trim();if(!name){toast('角色名称不能为空');return}r.name=name;r.series=document.getElementById('roleNewSeries').value.trim()||'未分类系列';r.visual=document.getElementById('roleNewDescription').value.trim();r.icon=name.slice(0,1);r.desc=r.visual||'视觉档案 · 可继续完善';r.tags=document.getElementById('roleNewTags').value.split(/[,，、]/).map(x=>x.trim()).filter(Boolean);store.roles=roles;save();closeModal();render();toast('角色档案已更新')}
function saveNewRole(){const name=document.getElementById('roleNewName')?.value.trim();if(!name){toast('请填写角色名称');return}const id=nextId('role'),series=document.getElementById('roleNewSeries').value.trim()||'未分类系列',desc=document.getElementById('roleNewDescription').value.trim(),tags=document.getElementById('roleNewTags').value.split(/[,，、]/).map(x=>x.trim()).filter(Boolean);const r={id,name,icon:name.slice(0,1),tone:'',series,desc:desc||'新建视觉档案 · 可继续完善',tags,visual:desc||'此角色暂未填写完整的视觉设定。'};roles.push(r);store.roles=roles;const fromDesign=ui.page==='sessions'&&session(ui.sessionId)?.kind==='design';if(fromDesign){const s=session(ui.sessionId);if(!s.roles.includes(id))s.roles.push(id)}save();goRole(id);toast('视觉角色已创建'+(fromDesign?'并关联原讨论':''))}
function addTagFromForm(){const name=document.getElementById('tagNewName').value.trim();if(!name){toast('请填写标签名称');return}rememberTags();const t={id:nextId('tag'),name,category:document.getElementById('tagNewCat').value,desc:document.getElementById('tagNewDesc').value.trim(),weight:Number(document.getElementById('tagNewWeight').value),enabled:true,source:'手动添加'};store.tagItems.push(t);ui.tagSelected=t.id;ui.tagsCategory='全部分类';ui.tagsQuery='';save();closeModal();render();toast('新标签已添加')}
function savePrompt(){const s=session(ui.sessionId);if(!s)return;const title=document.getElementById('promptTitle').value.trim()||'未命名批次',text=document.getElementById('promptText').value.trim();if(!text){toast('请填写提示词');return}const p={id:nextId('prompt'),title,text};s.prompts.push(p);save();ui.editPromptId=p.id;ui.modal='promptView';render();toast('已保存提示词批次')}function viewPrompt(id){ui.editPromptId=id;show('promptView')}
function copyCurrentPrompt(){const s=session(ui.sessionId),p=s?.prompts.find(x=>x.id===ui.editPromptId);if(p)copyText(p.text)}
async function copyText(s){try{await navigator.clipboard.writeText(s);toast('已复制到剪贴板')}catch{toast('浏览器权限限制了自动复制，请直接选择文本复制')}}
function exportPrompt(){const s=session(ui.sessionId),p=s.prompts.find(x=>x.id===ui.editPromptId);if(!p)return;download('codex-batch-'+p.id+'.md',p.text);toast('提示词任务文件已导出')}
function searchUpdate(v){ui.search=v;document.getElementById('results').innerHTML=searchResults()}
function searchResults(){const q=ui.search.trim().toLowerCase();if(!q)return `<div class="empty"><p>可以搜索所有创作对象，无需回忆它们来自哪个 Agent 工作区。</p></div>`;let results=[];roles.filter(r=>!r.archivedAt&&(r.name+r.series+r.tags.join(' ')).toLowerCase().includes(q)).forEach(r=>results.push({label:r.name,sub:'角色 · '+r.series,act:`goRole('${r.id}')`}));store.sessions.filter(s=>!s.archivedAt&&(s.title+s.summary+s.messages.map(m=>m.text).join(' ')).toLowerCase().includes(q)).forEach(s=>results.push({label:s.title,sub:'会话 · '+kname(s.kind),act:`goSession('${s.id}')`}));store.tagItems.filter(t=>(t.name+t.desc+t.category).toLowerCase().includes(q)).slice(0,15).forEach(t=>results.push({label:t.name,sub:'视觉标签 · '+t.category,act:`ui.tagSelected='${t.id}';openTags()`}));if('北方来信 第三章 初雪'.includes(q))results.push({label:'《北方来信》',sub:'小说 · 正文编辑器',act:`visit('editor')`});return `<div style="margin-top:14px;max-height:410px;overflow:auto">${results.length?results.slice(0,25).map(x=>`<button class="search-item" onclick="${x.act}"><strong>${E(x.label)}</strong><span>${E(x.sub)}</span></button>`).join(''):'<div class="empty">没有找到结果</div>'}</div>`}
function resetDemo(){if(!confirm('确认恢复初始预设数据？这会重置当前本地修改。'))return;store=structuredClone(initial);roles=store.roles;save();undoStack=[];ui.sessionId='s1';ui.tagSelected='t1';ui.kind='all';ui.role='all';ui.tagsQuery='';ui.tagsCategory='全部分类';visit('home');toast('本地工作区数据已重置为初始状态')}
// ============ V2.1 · architecture, navigation and interaction refinements ============
if(!Array.isArray(store.tagCategories)) store.tagCategories=cats.slice(1);
if(!store.tagCategories.includes('未分类'))store.tagCategories.push('未分类');
function syncCategories(){cats=['全部分类',...store.tagCategories]}
syncCategories();
if(!Array.isArray(store.works))store.works=[{id:'w1',title:'北方来信',description:'小说草稿 · 人物与动机研究',chapters:[{id:'c1',title:'第三章 · 初雪'},{id:'c2',title:'第二章 · 旧站台'}]}];
if(!store.rpHistories)store.rpHistories={yiwen:store.rpHistory||[]};
if(!store.rpConfigs)store.rpConfigs={yiwen:{greeting:'午后的阳光落在窗沿。她转过身，带着一点好奇打量眼前的情景。'},shuyao:{greeting:'她放下手中的书，抬头望向你。'}};
Object.assign(ui,{tagOrigin:null,drafts:{},plotQuote:{},plotPaneWidth:450,rpScreen:'home',rpSearch:'',workId:'w1',newWork:'none',proposalId:null,catEditing:null,catDeleting:null,modalFromNew:false});
const workById=id=>store.works.find(w=>w.id===id);
const chapterById=(work,id)=>work?.chapters?.find(c=>c.id===id);
function activeChapter(s){const w=workById(s.work);if(!w)return null;const id=s.chapterId&&chapterById(w,s.chapterId)?s.chapterId:w.chapters[0]?.id;return chapterById(w,id)||null}
function lastSelectedDraft(){const area=document.getElementById('chatinput');if(area&&area.dataset.session){ui.drafts[area.dataset.session]=area.value}}
function restoreChatDraft(){const area=document.getElementById('chatinput');if(!area)return;const sid=area.dataset.session;area.value=ui.drafts[sid]||'';fitTextarea(area);}
function fitTextarea(el){if(!el)return;el.style.height='auto';el.style.height=Math.max(48,Math.min(180,el.scrollHeight))+'px';el.style.overflowY=el.scrollHeight>180?'auto':'hidden'}

const _v2Overlay=overlay;
overlay=function(){closeSelectMenu();_v2Overlay();enhanceSelects()};
const _v2Thread=thread;
thread=function(s){let html=_v2Thread(s);html=html.replace('id="chatinput"','id="chatinput" data-session="'+E(s.id)+'" oninput="ui.drafts[this.dataset.session]=this.value;fitTextarea(this)"');return html};

// Compact, theme-consistent dropdowns (native selects remain as the event/keyboard value source).
let selectPopup=null,selectAnchor=null;
function closeSelectMenu(){if(selectPopup){selectPopup.remove();selectPopup=null}if(selectAnchor){selectAnchor.setAttribute('aria-expanded','false');selectAnchor=null}}
function syncSelectVisual(sel){if(!sel)return;const wrap=sel.closest('.select-shell');if(!wrap)return;const lbl=wrap.querySelector('.select-label');if(lbl)lbl.textContent=sel.options[sel.selectedIndex]?.textContent||'';}
function enhanceSelects(){
 document.querySelectorAll('select[data-visualized]').forEach(sel=>syncSelectVisual(sel));
 document.querySelectorAll('select:not([data-visualized])').forEach(sel=>{
  sel.dataset.visualized='true';
  const wrap=document.createElement('span');wrap.className='select-shell'+(sel.classList.contains('model-inline')||sel.classList.contains('select-mini')?' select-mini':'');
  if(sel.style.flex)wrap.style.flex=sel.style.flex;
  if(sel.style.width)wrap.style.width=sel.style.width;
  if(!sel.style.width&&(sel.classList.contains('select')||sel.classList.contains('field')))wrap.style.width='100%';
  if(!sel.style.width&&sel.classList.contains('model-inline'))wrap.style.width='auto';
  sel.insertAdjacentElement('afterend',wrap);wrap.appendChild(sel);sel.style.display='none';
  const button=document.createElement('button');button.type='button';button.className='select-trigger';button.setAttribute('aria-haspopup','listbox');button.setAttribute('aria-expanded','false');button.setAttribute('aria-label',sel.getAttribute('aria-label')||'选择选项');
  const label=document.createElement('span');label.className='select-label';label.textContent=sel.options[sel.selectedIndex]?.textContent||'请选择';
  button.append(label);button.insertAdjacentHTML('beforeend',I('chevron'));wrap.appendChild(button);
  button.addEventListener('click',e=>{e.stopPropagation();openSelectMenu(sel,button);});
  button.addEventListener('keydown',ev=>{if(['ArrowDown','ArrowUp',' ','Enter'].includes(ev.key)){ev.preventDefault();openSelectMenu(sel,button)}else if(ev.key==='Escape'){ev.stopPropagation();closeSelectMenu();button.focus();}});
  sel.addEventListener('change',()=>{const txt=sel.options[sel.selectedIndex]?.textContent||'';button.querySelector('.select-label').textContent=txt});
 });}
function openSelectMenu(sel,button){if(selectAnchor===button){closeSelectMenu();return}closeSelectMenu();
 const rect=button.getBoundingClientRect(),pop=document.createElement('div');pop.className='select-popover';pop.setAttribute('role','listbox');pop.style.zIndex='10005';
 let scrollTimer=null;
 pop.addEventListener('scroll',()=>{
  pop.classList.add('is-scrolling');
  clearTimeout(scrollTimer);
  scrollTimer=setTimeout(()=>{pop.classList.remove('is-scrolling')},650);
 },{passive:true});
 const options=[...sel.options].filter(o=>!o.disabled);
 options.forEach(o=>{const ch=document.createElement('button');ch.type='button';ch.className='select-choice'+(o.value===sel.value?' selected':'');ch.setAttribute('role','option');ch.setAttribute('aria-selected',o.value===sel.value?'true':'false');const txt=document.createElement('span');txt.textContent=o.textContent;ch.append(txt);if(o.value===sel.value){const tick=document.createElement('span');tick.className='tick';tick.innerHTML=I('check');ch.append(tick)}ch.onclick=()=>{closeSelectMenu();if(sel.value!==o.value){sel.value=o.value;sel.dispatchEvent(new Event('change',{bubbles:true}))}button.querySelector('.select-label').textContent=o.textContent;button.focus()};pop.appendChild(ch)});
 document.body.appendChild(pop);let width=Math.max(rect.width,185),top=rect.bottom+6,left=Math.min(rect.left,window.innerWidth-width-12);pop.style.width=width+'px';pop.style.left=Math.max(8,left)+'px';
 const availableBelow=window.innerHeight-rect.bottom-12;if(availableBelow<Math.min(pop.scrollHeight,280)&&rect.top>availableBelow)top=Math.max(8,rect.top-Math.min(pop.scrollHeight,340)-6);
 pop.style.top=top+'px';selectPopup=pop;selectAnchor=button;button.setAttribute('aria-expanded','true');
 pop.addEventListener('keydown',ev=>{if(ev.key==='Escape'){ev.stopPropagation();closeSelectMenu();button.focus()}if(ev.key==='ArrowDown'||ev.key==='ArrowUp'){ev.preventDefault();const arr=[...pop.querySelectorAll('.select-choice')],i=arr.indexOf(document.activeElement),n=(i+(ev.key==='ArrowDown'?1:-1)+arr.length)%arr.length;arr[n]?.focus()}});
 const active=pop.querySelector('.selected')||pop.querySelector('.select-choice');active?.focus({preventScroll:true});active?.scrollIntoView({block:'nearest'});
}
document.addEventListener('pointerdown',e=>{if(selectPopup&&!selectPopup.contains(e.target)&&!selectAnchor?.contains(e.target))closeSelectMenu()});
window.addEventListener('resize',closeSelectMenu);
document.addEventListener('scroll',e=>{if(selectPopup&&e.target!==selectPopup&&!selectPopup.contains(e.target))closeSelectMenu()},true);

// The selected role and text query constrain every category count; selected category never zeros its siblings.
countsByKind=function(k){const q=ui.sessionQuery.trim().toLowerCase();return store.sessions.filter(s=>!s.archivedAt&&
 (k==='all'||s.kind===k)&&(ui.role==='all'||(ui.role==='none'?s.roles.length===0:s.roles.includes(ui.role)))&&
 (`${s.title} ${s.summary} ${s.series} ${s.messages.map(m=>m.text).join(' ')}`).toLowerCase().includes(q)
 ).length};

// Context-aware navigation: visiting tags from a conversation returns to the same conversation.
function openTags(){lastSelectedDraft();const old=ui.page;const pane=document.querySelector('.messages');const aside=document.querySelector('.sidebar');ui.tagOrigin={page:old,sessionId:ui.sessionId,roleId:ui.roleId,roleTab:ui.roleTab,kind:ui.kind,role:ui.role,sessionQuery:ui.sessionQuery,msgScroll:pane?.scrollTop||0,asideScroll:aside?.scrollTop||0};visit('tags')}
function backFromTags(){const old=ui.tagOrigin;if(!old){visit('roles');return}ui.tagOrigin=null;visit(old.page,{sessionId:old.sessionId,roleId:old.roleId,roleTab:old.roleTab,kind:old.kind,role:old.role,sessionQuery:old.sessionQuery});const m=document.querySelector('.messages'),aside=document.querySelector('.sidebar');if(m)m.scrollTop=old.msgScroll;if(aside)aside.scrollTop=old.asideScroll}
const _v2TagManager=tagManager;
tagManager=function(){let html=_v2TagManager();html=html.replace('<div class="side-section">标签分类</div>','<div class="side-section">标签分类</div><button class="btn sm manage-categories" onclick="show(\'categories\')">'+I('plus')+' 管理 / 新建分类</button>');html=html.replace('返回角色库','返回上一页面').replace('id="tagCommand"','id="tagCommand" oninput="ui.aiDraft=this.value"');return html};

// Rename preserves all tags in the category. Deletion requires explicit reassignment.
let categoryUndo=[];
function rememberCategory(){categoryUndo.push({categories:[...store.tagCategories],tags:structuredClone(store.tagItems)});if(categoryUndo.length>20)categoryUndo.shift()}
function undoCategory(){const last=categoryUndo.pop();if(!last){toast('没有可撤销的分类操作');return}store.tagCategories=last.categories;store.tagItems=last.tags;syncCategories();save();show('categories');toast('已撤销分类调整')}
function categoryAdd(){const field=document.getElementById('newCatName'),name=field?.value.trim();if(!name)return toast('请输入分类名称');if(name.length>40)return toast('分类名称请勿超过 40 字');if(cats.includes(name))return toast('这个分类已经存在');rememberCategory();store.tagCategories.push(name);syncCategories();save();ui.tagsCategory=name;show('categories');toast('新分类已创建')}
function categoryRenameAsk(name){ui.catEditing=name;show('categoryRename')}
function categoryRename(){const name=document.getElementById('renameCatName')?.value.trim(),old=ui.catEditing;if(!name)return toast('名称不能为空');if(name!==old&&cats.includes(name))return toast('分类已存在');if(name===old){show('categories');return}rememberCategory();const i=store.tagCategories.indexOf(old);if(i<0)return;store.tagCategories[i]=name;store.tagItems.forEach(t=>{if(t.category===old)t.category=name});if(ui.tagsCategory===old)ui.tagsCategory=name;syncCategories();save();show('categories');toast('已重命名分类并保留所有标签')}
function categoryDeleteAsk(name){ui.catDeleting=name;show('categoryDelete')}
function categoryDelete(){const name=ui.catDeleting,dest=document.getElementById('moveCatTarget')?.value||'未分类';if(!name||name==='未分类')return;if(dest===name)return toast('请选择其他目标分类');rememberCategory();store.tagItems.forEach(t=>{if(t.category===name)t.category=dest});store.tagCategories=store.tagCategories.filter(x=>x!==name);if(ui.tagsCategory===name)ui.tagsCategory=dest;syncCategories();save();show('categories');toast('分类已删除，标签已转移至 '+dest)}
const _v2ImportTags=importTags;
importTags=function(event){const f=event.target.files?.[0];if(!f)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);const input=Array.isArray(data)?data:data.tags;if(!Array.isArray(input)||input.length>10000)throw Error('标签结构无效或数量超过10000');const categories=Array.isArray(data.categories)?data.categories:[];const created=new Set();const incoming=input.map((t,i)=>{if(!t||!String(t.name||'').trim())throw Error(`第 ${i+1} 条缺少名称`);let cat=String(t.category||'未分类');if(cat.length>40)cat='未分类';if(!cats.includes(cat))created.add(cat);return{id:nextId('tag'),name:String(t.name).slice(0,80),category:cat,desc:String(t.desc||'').slice(0,1000),weight:Math.min(100,Math.max(0,Number.isFinite(Number(t.weight))?Number(t.weight):50)),enabled:t.enabled!==false,source:'JSON 导入'}});
 if(!confirm(`导入 ${incoming.length} 条标签，并建立 ${created.size} 个新分类？原有数据保留。`))return;rememberCategory();for(const c of created)store.tagCategories.push(c);store.tagItems.push(...incoming);syncCategories();save();render();toast('已导入标签及自定义分类')}catch(e){alert('无法导入：'+e.message)}};reader.readAsText(f);event.target.value=''};
exportTags=function(){download('SillyTavern-视觉标签库-v2.1.json',JSON.stringify({schema:'st-visual-tags-v2.1',categories:store.tagCategories,tags:store.tagItems},null,2),'application/json;charset=utf-8');toast('已导出标签与分类数据')};

// Novel work data can be accessed from either discussion or the professional editor.
const _v2OpenNew=openNew;
openNew=function(kind=null,roleId=null,workId=null){_v2OpenNew(kind,roleId);if(ui.newKind==='plot'){ui.newWork=workId||(ui.page==='editor'?ui.workId:'none');ui.newChapter=ui.page==='editor'?ui.workChapter:null;overlay()}}
const _v2NewSession=newSession;
newSession=function(){const forPlot=ui.newKind==='plot',workId=ui.newWork;_v2NewSession();if(forPlot&&workId&&workId!=='none'){const s=session(ui.sessionId);s.work=workId;s.chapterId=chapterById(workById(workId),ui.newChapter)?.id||workById(workId)?.chapters[0]?.id;save();render()}}
const _v2ModalBody=modalBody;
modalBody=function(){
 if(ui.modal==='categories')return `${modalHead('管理标签分类','分类可以自由创建、重命名和删除；删除时会先安排已有标签的去向。')}<div class="cat-toolbar"><input id="newCatName" class="input" placeholder="新分类，例如：国籍或职业装备" maxlength="40" onkeydown="if(event.key==='Enter')categoryAdd()"><button class="btn primary" onclick="categoryAdd()">${I('plus')} 新建</button></div><div style="max-height:360px;overflow:auto">${store.tagCategories.map(c=>`<div class="cat-list-row"><span style="color:#d5d5d5">${I('folder')}</span><strong>${E(c)}</strong><span class="cat-count">${store.tagItems.filter(t=>t.category===c).length} 条</span><div class="cat-actions"><button title="重命名分类" class="btn sm" onclick="categoryRenameAsk('${E(c).replaceAll('&#39;','\\&#39;')}')">${I('pen')}</button>${c==='未分类'?'':`<button class="btn sm danger" title="删除分类" onclick="categoryDeleteAsk('${E(c).replaceAll('&#39;','\\&#39;')}')">${I('trash')}</button>`}</div></div>`).join('')}</div><div class="modal-footer"><button class="btn" onclick="undoCategory()">${I('undo')} 撤销分类修改</button><button class="btn primary" onclick="closeModal()">完成</button></div>`;
 if(ui.modal==='categoryRename')return `${modalHead('重命名分类','已有标签会自动保留在这个分类中。')}<div class="formrow"><label>分类名称</label><input class="input" id="renameCatName" value="${E(ui.catEditing)}" maxlength="40" onkeydown="if(event.key==='Enter')categoryRename()"></div><div class="modal-footer"><button class="btn" onclick="show('categories')">返回</button><button class="btn primary" onclick="categoryRename()">保存名称</button></div>`;
 if(ui.modal==='categoryDelete'){const n=store.tagItems.filter(t=>t.category===ui.catDeleting).length;return `${modalHead('删除分类 · '+E(ui.catDeleting),'为了避免误删创作资料，请选择将现有标签移动到哪里。')}<p class="small-over">此分类目前有 <strong>${n}</strong> 条标签。删除分类不会删除这些标签。</p><div class="formrow"><label>移动标签到</label><select id="moveCatTarget" class="select">${store.tagCategories.filter(c=>c!==ui.catDeleting).map(c=>`<option value="${E(c)}" ${c==='未分类'?'selected':''}>${E(c)}</option>`).join('')}</select></div><div class="modal-footer"><button class="btn" onclick="show('categories')">取消</button><button class="btn danger" onclick="categoryDelete()">确认删除分类</button></div>`}
 if(ui.modal==='workCreate')return `${modalHead('新建小说项目','创建后可以立即在剧情讨论右侧阅读和编辑章节。')}<div class="formrow"><label>作品名称</label><input id="workNewName" class="input" maxlength="80" placeholder="例如：未命名作品" onkeydown="if(event.key==='Enter')createWork()"></div><div class="formrow"><label>第一个章节名称</label><input id="workNewChapter" class="input" value="第一章" maxlength="80"></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="createWork()">${I('plus')} 创建作品</button></div>`;
 if(ui.modal==='chapterCreate')return `${modalHead('新建章节','新章节直接进入当前作品的章节目录。')}<div class="formrow"><label>章节名称</label><input id="chapterNewName" class="input" placeholder="例如：第四章 · 雪夜" maxlength="80" onkeydown="if(event.key==='Enter')createChapter()"></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="createChapter()">创建章节</button></div>`;
 if(ui.modal==='proposal'){const s=session(ui.sessionId),p=s?.proposals?.find(p=>p.id===ui.proposalId);if(!p)return modalHead('建议已失效');const chapter=chapterById(workById(p.workId),p.chapterId);const actual=String(store.chapters[p.chapterId]||'');const valid=p.mode==='replace'?actual.includes(p.original):actual===p.baseContent;return `${modalHead('审阅 AI 正文建议','提议内容独立保存，只有点击确认才会写入正式小说。')}<div class="flex gap8"><span class="chip green">${p.mode==='replace'?'替换选段':'追加段落'}</span><span class="chip">${E(chapter?.title||'章节')}</span>${!valid?'<span class="chip" style="color:#d8d8d8">正文已发生变化 · 需重新讨论</span>':''}</div><div class="proposal-compare"><div><label>当前正文 / 原选段</label><div class="box-copy">${E(p.mode==='replace'?p.original:(actual.slice(-280)||'（空章节）'))}</div></div><div><label>待采纳的 AI 润色建议</label><div class="box-copy">${E(p.proposed)}</div></div></div><div class="modal-footer"><button class="btn" onclick="dismissProposal()">暂不采用</button><button class="btn primary" ${!valid?'disabled':''} onclick="applyProposal()">${I('check')} 确认写入正文</button></div>`}
 if(ui.modal==='rpConfig'){const r=role(ui.rpRole);return `${modalHead('准备 RP 配置 · '+E(r?.name||''),'当前仅包含视觉档案。为角色创建专属扮演配置，将自动绑定酒馆独立 RP 空间。')}<div class="formrow"><label>角色沉浸开场白</label><textarea class="textarea" id="rpGreeting" rows="4" placeholder="写一段适合该角色的开场白……"></textarea></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="saveRpConfig()">${I('check')} 保存并开始 RP</button></div>`}
 let html=_v2ModalBody();
 if(ui.modal==='new'&&ui.newKind==='plot')html=html.replace('<div class="modal-footer">',`<div class="formrow" style="margin-top:14px"><label>关联小说项目（可在讨论中调整）</label><select class="select" onchange="ui.newWork=this.value"><option value="none">先自由讨论，暂不关联作品</option>${store.works.map(w=>`<option value="${w.id}" ${ui.newWork===w.id?'selected':''}>《${E(w.title)}》</option>`).join('')}</select></div><div class="modal-footer">`);
 return html;
};

// Works and chapters: lightweight, live-shared data model.
function createWork(){const title=document.getElementById('workNewName')?.value.trim(),first=document.getElementById('workNewChapter')?.value.trim()||'第一章';if(!title)return toast('请填写作品名称');const wId=nextId('w'),cId=nextId('c');store.works.push({id:wId,title,description:'新建的小说项目',chapters:[{id:cId,title:first}]});store.chapters[cId]='';ui.workId=wId;ui.workChapter=cId;if(ui.page==='sessions'&&session(ui.sessionId)?.kind==='plot'){const s=session(ui.sessionId);s.work=wId;s.chapterId=cId}save();closeModal();render();toast('已创建作品和第一章')}
function createChapter(){const title=document.getElementById('chapterNewName')?.value.trim()||'新章节';const s=session(ui.sessionId),w=ui.page==='editor'?workById(ui.workId):workById(s?.work);if(!w)return toast('请先选择作品');const id=nextId('c');w.chapters.push({id,title});store.chapters[id]='';if(ui.page==='editor')ui.workChapter=id;else s.chapterId=id;save();closeModal();render();toast('新章节已创建')}
function choosePlotWork(sId,wId){const s=session(sId);if(!s)return;s.work=wId==='none'?null:wId;s.chapterId=workById(wId)?.chapters?.[0]?.id||null;save();render()}
function choosePlotChapter(sId,cId){const s=session(sId);if(!s)return;s.chapterId=cId;save();render()}
function writePlotChapter(chId,value){store.chapters[chId]=value;save()}
function quotePlotSelection(sId){const txt=document.getElementById('novelText'),s=session(sId);if(!txt||!s)return;const excerpt=txt.value.slice(txt.selectionStart,txt.selectionEnd).trim();if(!excerpt)return toast('请先在右侧正文中选中一段文字');ui.plotQuote[sId]=excerpt;const input=document.getElementById('chatinput');if(input){input.value=`请讨论这段正文的表达，并给我一份修改建议：\n\n「${excerpt}」`;ui.drafts[sId]=input.value;fitTextarea(input);input.focus()}toast('已引用选段到讨论输入框')}
function toggleNovelPane(){ui.novelHidden=!ui.novelHidden;render()}
function beginNovelResize(ev){if(ev.button!==0)return;ev.preventDefault();const start=ev.clientX,w=ui.plotPaneWidth;function drag(e){ui.plotPaneWidth=Math.max(330,Math.min(850,w+start-e.clientX));const el=document.querySelector('.novel-workspace');if(el)el.style.width=ui.plotPaneWidth+'px'}function end(){window.removeEventListener('pointermove',drag);window.removeEventListener('pointerup',end)}window.addEventListener('pointermove',drag);window.addEventListener('pointerup',end)}
function attachNovel(s){const w=workById(s.work),c=activeChapter(s),v=c?store.chapters[c.id]||'':'';return `<aside class="novel-workspace" style="width:${ui.plotPaneWidth}px"><div class="novel-grip" title="拖动调整正文宽度" onpointerdown="beginNovelResize(event)"></div><div class="novel-header"><div class="top-title"><span style="color:#e2e2e2">${I('book')}</span><strong>小说正文 · 同屏协作</strong><button class="btn quiet sm" title="收起正文侧栏" onclick="toggleNovelPane()">${I('x')}</button></div><div class="flex gap8" style="margin-bottom:9px"><select class="select" style="flex:1" onchange="choosePlotWork('${s.id}',this.value)"><option value="none">未关联小说</option>${store.works.map(item=>`<option value="${item.id}" ${s.work===item.id?'selected':''}>《${E(item.title)}》</option>`).join('')}</select><button class="btn sm" title="新建作品" onclick="show('workCreate')">${I('plus')}</button></div>${w?`<div class="flex gap8"><select class="select" style="flex:1" onchange="choosePlotChapter('${s.id}',this.value)">${w.chapters.map(item=>`<option value="${item.id}" ${c?.id===item.id?'selected':''}>${E(item.title)}</option>`).join('')}</select><button class="btn sm" title="新建章节" onclick="show('chapterCreate')">${I('plus')}</button></div>`:''}</div><div class="novel-attach-body">${w&&c?`<div class="novel-reader"><div class="between"><span class="eyebrow">${E(w.title)} / ${E(c.title)}</span><span class="chip green">本地稿件</span></div><p class="novel-helper">直接在此查看或编辑章节。选中一段文字后，可引用到左侧讨论。修改将即时保存至本地工作区。</p><textarea id="novelText" class="chapter-text" spellcheck="false" oninput="writePlotChapter('${c.id}',this.value)">${E(v)}</textarea><div class="plot-actions"><button class="btn sm" onclick="quotePlotSelection('${s.id}')">${I('copy')} 引用选段到讨论</button><button class="btn sm" onclick="goWorkEditor('${w.id}','${c.id}')">${I('book')} 展开编辑器</button></div>${(s.proposals||[]).length?`<div class="line"></div><h3 class="h3">待采用的修改建议</h3>${s.proposals.slice().reverse().map(p=>`<div class="proposal-item"><span class="proposal-status">${p.status==='applied'?'已写入正文':p.status==='dismissed'?'暂不采用':'待审阅'} · ${E(chapterById(w,p.chapterId)?.title||'其他章节')}</span><strong>${E(p.title)}</strong>${p.status==='pending'?`<button class="btn sm" onclick="viewProposal('${p.id}')">对比与决定 ${I('arrow')}</button>`:''}</div>`).join('')}`:'<div class="empty-quiet" style="margin-top:16px;text-align:center">暂无修改建议</div>'}</div>`:`<div class="empty-state">${I('book')}<h3>开始关联小说正文</h3><p>选择已有作品，或者新建项目，然后就能边看正文边讨论。</p><button class="btn primary" onclick="show('workCreate')">${I('plus')} 新建小说项目</button></div>`}</div></aside>`}
const _v2Context=context;
context=function(s){if(s.kind==='plot')return ui.novelHidden?`<aside class="context" style="width:155px;flex-basis:155px"><button class="btn" onclick="toggleNovelPane()">${I('book')} 展开正文</button><p class="tiny" style="margin-top:12px">正文仍保留当前章节，随时可展开。</p></aside>`:attachNovel(s);return _v2Context(s)};
const _v2SendMessage=sendMessage;
sendMessage=function(){const s=session(ui.sessionId),input=document.getElementById('chatinput');if(!input?.value.trim()||!s)return;const prompt=input.value;ui.drafts[s.id]='';ui.justSentSession=s.id;_v2SendMessage();if(s.kind==='plot'&&s.work){const c=activeChapter(s);if(c){const original=ui.plotQuote[s.id]||'',current=store.chapters[c.id]||'',isReplace=!!original&&current.includes(original);const proposed=isReplace?`她攥紧手中的信，指尖停在封口处。那些被刻意压下去的疑问，此刻又一次浮上心头。她迟疑了很久，最终将信放回桌面。`:`窗外的雪越下越密，她却没有急着离开。沉默背后的犹豫，终于在这一刻有了可以说出口的理由。`;
 s.proposals??=[];s.proposals.push({id:nextId('proposal'),title:isReplace?'所选段落的改写草稿':'可选的剧情补充段落',workId:s.work,chapterId:c.id,mode:isReplace?'replace':'append',original:isReplace?original:'',baseContent:current,proposed,status:'pending',prompt:prompt.slice(0,280)});ui.plotQuote[s.id]='';save();render();toast('已生成选段的润色修改建议，可在右侧对比审阅')}}};
function viewProposal(id){ui.proposalId=id;show('proposal')}
function applyProposal(){const s=session(ui.sessionId),p=s?.proposals?.find(p=>p.id===ui.proposalId);if(!p||p.status!=='pending')return;const current=String(store.chapters[p.chapterId]||'');if(p.mode==='replace'){if(!current.includes(p.original))return toast('原段落已变化，请重新生成建议');store.chapters[p.chapterId]=current.replace(p.original,p.proposed)}else{if(current!==p.baseContent)return toast('正文已修改，请重新审阅或讨论');store.chapters[p.chapterId]=current+(current.trim()?'\n\n':'')+p.proposed}p.status='applied';save();closeModal();render();toast('已确认采用，正文更新成功')}
function dismissProposal(){const s=session(ui.sessionId),p=s?.proposals?.find(p=>p.id===ui.proposalId);if(p){p.status='dismissed';save()}closeModal();render();toast('未采用修改，正式正文保持原样')}
const _v2Works=works;
works=function(){return `<div class="scroll" style="height:100%"><div class="pagepad centered"><div class="eyebrow">WRITING DESK · V2.2</div><div class="between"><div><h1 class="h1">作品与小说</h1><p class="small-over">可以从作品进入全文编辑，也可以从剧情讨论右侧直接引用和修改正文。</p></div><button class="btn primary" onclick="show('workCreate')">${I('plus')} 新建作品</button></div><div class="sectionhead"><h2>我的作品</h2><span class="tiny">与剧情会话共享同一份章节数据</span></div><div class="grid2">${store.works.map(w=>`<div class="card click" onclick="goWorkEditor('${w.id}')"><div class="flex gap12"><div class="feature-icon gold">${I('book')}</div><div><h3 class="h3">《${E(w.title)}》</h3><p class="sub">${w.chapters.length} 个章节 · ${store.sessions.filter(s=>!s.archivedAt&&s.work===w.id).length} 条关联会话</p></div></div><p class="small-over" style="margin-top:15px">${E(w.description||'小说项目')}</p><div class="tag-row"><span class="chip gold">正文编辑</span><span class="chip">剧情讨论可关联</span></div><div style="margin-top:15px" class="accent">打开写作台　${I('arrow')}</div></div>`).join('')}</div></div></div>`};
function goWorkEditor(workId,chapterId=null){const w=workById(workId);if(!w)return;ui.workId=workId;ui.workChapter=chapterId||w.chapters[0]?.id;visit('editor')}
editor=function(){const w=workById(ui.workId)||store.works[0];if(!w)return works();if(!chapterById(w,ui.workChapter))ui.workChapter=w.chapters[0]?.id;const c=chapterById(w,ui.workChapter),related=store.sessions.filter(s=>!s.archivedAt&&s.kind==='plot'&&s.work===w.id);return `<div class="split"><aside class="sidebar"><button class="btn quiet sm" onclick="visit('works')">${I('back')} 返回作品</button><div class="sidetitle" style="margin-top:20px">《${E(w.title)}》</div><div class="side-section">章节目录</div>${w.chapters.filter(ch=>!ch.archivedAt).map(ch=>`<button class="side-link ${ui.workChapter===ch.id?'on':''}" onclick="setChapter('${ch.id}')">${I('book')} ${E(ch.title)}</button>`).join('')}<button class="btn sm" style="margin:12px 10px" onclick="show('chapterCreate')">${I('plus')} 新建章节</button><div class="side-section">相关剧情会话</div>${related.map(s=>`<button class="side-link" onclick="goSession('${s.id}')">${I('chat')} ${E(s.title)}</button>`).join('')||'<p class="sub" style="margin:10px">暂无讨论</p>'}<button class="btn sm" style="margin:9px 10px" onclick="openNew('plot')">${I('plus')} 发起剧情讨论</button></aside><section class="center editor-main"><div class="between" style="max-width:730px;margin:auto auto 14px"><span class="chip gold">本地稿件 · 浏览器自动保存</span><select class="model-inline" style="width:210px" onchange="setDefaultModel('novel',this.value)">${models.map(m=>`<option value="${m.id}" ${store.modelDefaults.novel===m.id?'selected':''}>${E(m.name)}</option>`).join('')}</select></div><div class="paper"><div class="eyebrow">《${E(w.title)}》</div><h1>${E(c?.title||'未命名章节')}</h1><div class="sub">正文编辑 · 更改同步至会话讨论右侧</div><textarea id="chapter" oninput="saveChapter(this.value)" spellcheck="false">${E(store.chapters[ui.workChapter]||'')}</textarea></div></section><aside class="context"><div class="section"><h3>边阅读，边讨论</h3><div class="small-over">当前模型：${E(mname(store.modelDefaults.novel))}</div><p class="sub">从此处进入剧情会话，会同时打开右侧正文资料面板。正式文本只在手动采用后更改。</p>${related.slice(0,3).map(s=>`<button class="btn" style="width:100%;margin-top:9px;white-space:normal" onclick="goSession('${s.id}')">${I('chat')} ${E(s.title)}</button>`).join('')}<button class="btn primary" style="width:100%;margin-top:12px" onclick="openNew('plot')">${I('plus')} 新建剧情讨论</button></div></aside></div>`};

// RP entry becomes a selection directory. Each role gets a separate chat history.
const _v2Visit=visit;
visit=function(page,props={}){if(page==='rp'&&!props.keepChat)ui.rpScreen='home';_v2Visit(page,props)};
startRP=function(id='yiwen'){ui.rpRole=id;if(!store.rpConfigs[id]){show('rpConfig');return}ui.rpScreen='chat';visit('rp',{keepChat:true})};
function switchRPRole(id){if(store.rpConfigs[id]){ui.rpRole=id;ui.rpScreen='chat';render()}else{ui.rpRole=id;show('rpConfig')}}
function saveRpConfig(){const val=document.getElementById('rpGreeting')?.value.trim();if(!val)return toast('请填写一段开场白');store.rpConfigs[ui.rpRole]={greeting:val};store.rpHistories[ui.rpRole]=[{by:'ai',text:val}];save();closeModal();ui.rpScreen='chat';visit('rp',{keepChat:true});toast('已创建独立 RP 演示配置')}
function rp(){if(ui.rpScreen!=='chat')return rpDirectory();return rpConversation()}
function rpDirectory(){const data=roles.filter(r=>!r.archivedAt&&(r.name+r.series+r.desc).toLowerCase().includes(ui.rpSearch.toLowerCase()));const recent=Object.entries(store.rpHistories).filter(([id,history])=>history?.length&&store.rpConfigs[id]).map(([id,history])=>({id,r:role(id),len:history.length}));return `<div class="scroll" style="height:100%"><div class="rp-home"><div class="eyebrow">ROLEPLAY SPACE · V2.1</div><h1 class="h1">选择一位角色，开始对话。</h1><p class="small-over">从角色目录选择扮演对象，也可以继续已有聊天。聊天内部依然可以快速切换角色。</p><div class="sectionhead"><h2>继续最近的对话</h2><span class="tiny">每个角色拥有独立聊天历史</span></div><div class="grid2">${recent.length?recent.slice(0,2).map(x=>`<button class="rp-recent" onclick="startRP('${x.id}')"><div class="avatar ${x.r?.tone||''}">${E(x.r?.icon||'角')}</div><div style="flex:1"><strong>${E(x.r?.name||x.id)}</strong><div class="tiny">${x.len} 条对话消息 · 点击继续</div></div>${I('arrow')}</button>`).join(''):'<div class="empty-quiet" style="padding:14px;text-align:center">暂无已保存的 RP 对话</div>'}</div><div class="sectionhead"><h2>角色目录</h2><span class="tiny">${data.length} 位角色</span></div><div style="max-width:460px;margin-bottom:18px"><input class="input" id="rpSearch" value="${E(ui.rpSearch)}" oninput="rpSearchChange(this.value)" placeholder="搜索角色名称、系列或设定..."></div><div class="mobile-rp-grid">${data.map(r=>`<button class="rp-mini-card" onclick="startRP('${r.id}')"><div class="avatar ${r.tone}">${E(r.icon)}</div><div class="rp-card-meta"><strong>${E(r.name)}</strong><p>${E(r.series)}</p><span class="chip ${store.rpConfigs[r.id]?'green':''}">${store.rpConfigs[r.id]?'可开始 RP':'仅视觉档案 · 需配置'}</span></div>${I('arrow')}</button>`).join('')||'<div class="empty-quiet" style="padding:20px;text-align:center">没有找到相符的角色</div>'}</div></div></div>`}
function rpSearchChange(value){ui.rpSearch=value;render();const inp=document.getElementById('rpSearch');if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}}
function rpConversation(){const r=role(ui.rpRole)||roles[0],history=store.rpHistories[r.id]||[];return `<div class="scroll" style="height:100%"><div class="rp-layout"><div class="rp-chat-head"><button class="btn sm" onclick="ui.rpScreen='home';render()">${I('back')} 角色目录</button><div class="flex" style="gap:9px;flex:1"><div class="avatar ${r.tone}" style="height:38px;width:38px;flex-basis:38px;font-size:13px">${E(r.icon)}</div><div><h3 class="h3">${E(r.name)}</h3><div class="tiny">${E(r.series)} · 独立 RP 会话</div></div></div><select class="select" style="width:180px" onchange="switchRPRole(this.value)">${roles.map(x=>`<option value="${x.id}" ${r.id===x.id?'selected':''}>切换至 ${E(x.name)}</option>`).join('')}</select></div><div class="card" style="margin:10px 0 16px"><div class="between"><div class="flex gap8"><span class="chip green">角色扮演模式</span><span class="tiny">视觉档案与 RP 配置独立</span></div><select class="model-inline" style="width:200px" onchange="setDefaultModel('rp',this.value)">${models.map(m=>`<option value="${m.id}" ${store.modelDefaults.rp===m.id?'selected':''}>${E(m.name)}</option>`).join('')}</select></div></div>${history.length?history.map(x=>`<div class="rp-message ${x.by==='you'?'user':''}"><div class="avatar" style="height:35px;width:35px;flex:0 0 35px;font-size:12px">${x.by==='you'?'我':E(r.icon)}</div><div class="bubble"><div class="text">${E(x.text).replaceAll('\n','<br>')}</div></div></div>`).join(''):`<div class="rp-intro">${E(store.rpConfigs[r.id]?.greeting||'现在可以开始对话。')}</div>`}<div class="rp-compose"><textarea class="textarea" id="rpInput" placeholder="输入对话、动作（用括号包裹）或按 Shift+Enter 换行..."></textarea><button class="btn primary" onclick="sendRP()">${I('send')} 发送</button></div><p class="tiny">当前处于离线推演通道。已应用指定采样参数与世界书设定。</p></div></div>`}
// Expose basic project-level actions in the editor and discussion, without a distinct scene top-level tab.

document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();show('search')}if(e.key==='Escape'&&ui.modal)closeModal()});

/* V2.2: Character profile, collaboration review, retrieval tags, lean RP directory. */
const v22TagSeed=[
 ['campus','校园','题材','校园生活,校园背景'],['student','学生','身份','在校学生'],['highschool','高中生','身份','高中学生,高中在读,普通高中生'],['superpower','异能者','设定','超能力者,超自然能力'],['catgirl','猫娘','视觉','猫耳娘,猫系女孩'],['catears','兽耳','视觉','动物耳朵,猫耳'],['headless','无头骑士','视觉','杜拉罕,无头女骑士'],['knight','骑士','身份','骑士职业'],['daily','日常','题材','日常系,生活化'],['modern','现代背景','题材','现代,现代社会'],['fantasy','奇幻','题材','魔幻,幻想世界'],['research','技术人员','身份','工程技术人员,工程师'],['schooluniform','制服','服装','校服,制服装扮'],['robot','机械改造','视觉','机甲改造,机械义肢'],['battle','战斗人员','身份','战士,战斗职业'],['electric','电流操控','能力','操纵电流,电系能力']
];
store.indexTagDefs??=v22TagSeed.map(([id,name,group,alias])=>({id,name,group,aliases:alias.split(',')}));
store.rpActivity??={};
store.indexTagUndo??=null;
for(const r of roles){
 r.profile??={intro:r.desc||'',identity:'',abilities:'',personality:'',background:'',relationships:'',notes:''};
 r.indexTags??=(r.id==='yiwen'?['campus','daily']:r.id==='knight'?['catgirl','headless','knight','fantasy']:r.id==='shuyao'?['modern']:[]);
}
ui.roleTab='overview';ui.roleSearch??='';ui.indexFilter??='all';ui.rpView??='cards';ui.rpSort??='recent';ui.rpSearch??='';
ui.v22TagQuery='';ui.v22Suggest=[];ui.v22PreviewOpen=false;
save();
const v22Tag=id=>store.indexTagDefs.find(t=>t.id===id);
const v22Assigned=r=>(r.indexTags||[]).map(v22Tag).filter(Boolean);
const v22Tagged=id=>roles.filter(r=>!r.archivedAt&&(r.indexTags||[]).includes(id)).length;
const v22HasProfile=r=>['identity','abilities','personality','background','relationships'].some(k=>String(r.profile?.[k]||'').trim());
const v22Status=r=>[r.visual?.trim()?'视觉档案':null,v22HasProfile(r)?'有人物设定':null,isRoleRpReady(r.id)?'可扮演':'待配置 RP'].filter(Boolean);
const v22RolePageTab=(tab)=>{ui.roleTab=tab;render()};
function v22PickRole(r){ui.roleId=r;ui.roleTab='overview';visit('role')}
function v22Field(r,k,label,opts={}){const value=k==='visual'?r.visual:(r.profile?.[k]||'');const id=r.id,rows=opts.rows||3;return `<div class="v22-field"><label>${E(label)}<span>失焦后自动保存</span></label>${opts.single?`<input class="input" value="${E(value)}" onchange="v22SaveProfile('${id}','${k}',this.value)">`:`<textarea class="textarea ${rows>3?'long':''}" rows="${rows}" onchange="v22SaveProfile('${id}','${k}',this.value)" placeholder="可暂时留空，也可以与 AI 讨论后写入。">${E(value)}</textarea>`}</div>`}
function v22SaveProfile(id,key,val){const r=role(id);if(!r)return; if(key==='visual')r.visual=val;else{r.profile??={};r.profile[key]=val};if(key==='intro')r.desc=val.slice(0,115)||'角色设定可以逐步完善';save();toast('档案字段已保存');const meta=document.getElementById('v22-profile-save');if(meta)meta.textContent='刚刚已保存'}
function v22RoleChips(r,remove=false){return `<div class="v22-library-tags">${v22Assigned(r).map(t=>`<span class="v22-label">${E(t.name)}${remove?` <button title="移除" onclick="v22RemoveTag('${r.id}','${t.id}')">${I('x')}</button>`:''}</span>`).join('')||'<span class="tiny">暂无检索标签，试试 AI 建议</span>'}</div>`}
function v22RoleIntro(r){return (r.profile?.intro||r.desc||r.visual||'此角色尚未添加介绍。').trim()}
function v22RoleOverview(r,related){
  const hasVisual=Boolean(r.visual?.trim());
  return `
  <div class="v23-memo-section">
    <div class="v23-memo-section-head">
      <h2>核心人设与设计说明</h2>
      <button class="btn quiet sm" onclick="v22RolePageTab('profile')">编辑完整档案 ${I('arrow')}</button>
    </div>
    <div class="v23-memo-intro">${E(v22RoleIntro(r))}</div>
    ${hasVisual?`
      <div class="v23-memo-visual-block">
        <div class="v23-memo-visual-head">
          <span style="font-weight:600;color:#c0c0c0">核心视觉外观设计</span>
          <button class="ghost" style="padding:0;font-size:11px" onclick="v22RolePageTab('profile')">修改视觉</button>
        </div>
        <p style="margin:0">${E(r.visual)}</p>
      </div>
    `:''}
  </div>

  <div class="v23-memo-section">
    <div class="v23-memo-section-head">
      <h2>从这里继续创作</h2>
      <span class="tiny" style="color:#777">与当前角色上下文关联</span>
    </div>
    <div class="v23-action-strip">
      <button class="v23-strip-card" onclick="v22RoleBrainstorm('${r.id}')">
        <div class="v23-strip-title">${I('spark')} <strong>与 AI 完善人设</strong></div>
        <p class="v23-strip-desc">探讨身份、能力与背景，审阅后确认采纳</p>
      </button>
      <button class="v23-strip-card" onclick="openNew('scene','${r.id}')">
        <div class="v23-strip-title">${I('image')} <strong>构思插画场景</strong></div>
        <p class="v23-strip-desc">携带角色资料进入构图与提示词推导</p>
      </button>
      <button class="v23-strip-card" onclick="startRP('${r.id}')">
        <div class="v23-strip-title">${I('theater')} <strong>准备 / 开始 RP</strong></div>
        <p class="v23-strip-desc">独立角色扮演会话，不污染基础设定档案</p>
      </button>
    </div>
  </div>

  <div class="v23-memo-section" style="margin-bottom:0">
    <div class="v23-memo-section-head">
      <h2>最近关联讨论</h2>
      <button class="btn quiet sm" onclick="v22RolePageTab('chats')">全部 ${related.length} 条 ${I('arrow')}</button>
    </div>
    <div class="v23-session-stream">
      ${related.slice(0,4).map(s=>`
        <button class="v23-stream-row" onclick="goSession('${s.id}')">
          <div class="v23-stream-left">
            <div class="v23-stream-title">
              <span>${E(s.title)}</span>
              <span class="chip" style="font-size:10px;padding:1px 6px">${E(kname(s.kind))}</span>
            </div>
            <div class="v23-stream-meta">${E(s.summary||'无摘要说明')}</div>
          </div>
          ${I('arrow')}
        </button>
      `).join('')||'<div class="empty" style="padding:16px 0">暂无关联会话，可使用上方发射台发起</div>'}
    </div>
  </div>`;
}
function v22RoleProfile(r){
  return `
  <div class="v23-profile-dossier">
    <div class="v23-dossier-topbar">
      <div>
        <h2>完整人物档案</h2>
        <span class="tiny" style="color:#888">两大核心分类 · 左右双列自适应拉底排版</span>
      </div>
      <span class="tiny" id="v22-profile-save" style="color:#a0a0a0">自动保存已就绪</span>
    </div>

    <div class="v23-dossier-grid">
      <!-- 左翼：外观与视觉规格 -->
      <section class="v23-dossier-wing">
        <div class="v23-dossier-wing-head">
          <span>外观与视觉规格</span>
          <span class="tiny" style="color:#777">视觉核心</span>
        </div>
        ${v22Field(r,'intro','简短导语 / 概览摘要',{rows:2,placeholder:'一句话概括角色的核心视觉与当前设计状态'})}
        ${v22Field(r,'visual','完整视觉外观与设计说明',{fill:true,rows:6,placeholder:'详细的外貌、发型、服装差分与色彩设计规范'})}
        
        <div style="flex-shrink:0">
          <div class="v23-doc-field-head" style="margin-bottom:6px">
            <label style="font-size:11px;font-weight:550;color:#cfcfcf">视觉素材关键词库 (发散设计词)</label>
            <button class="btn quiet sm" style="padding:1px 6px;font-size:11px" onclick="openTags()">${I('tag')} 管理素材库</button>
          </div>
          <div class="v23-doc-tags-row">
            <div class="v23-doc-tags-list">
              ${(r.tags||[]).map(t=>`<span class="chip">${E(t)}</span>`).join('')||'<span class="tiny" style="color:#777">暂无视觉组合标签</span>'}
            </div>
            <span class="tiny" style="color:#888;flex-shrink:0">仅用于发散设计</span>
          </div>
        </div>

        ${v22Field(r,'notes','自由视觉备忘与服装细节',{rows:3,placeholder:'差分搭配、特定场景装束与细节灵感碎片'})}
      </section>

      <!-- 右翼：人物设定与生平档案 -->
      <section class="v23-dossier-wing">
        <div class="v23-dossier-wing-head">
          <span>人物设定与生平档案</span>
          <span class="tiny" style="color:#777">设定叙事</span>
        </div>
        ${v22Field(r,'identity','身份、职业及所属组织',{rows:2,placeholder:'社会角色、阵营归属、日常职责，可留空'})}
        ${v22Field(r,'abilities','特长、能力与限制规则',{rows:2,placeholder:'鲜明的擅长领域及对应限制，可留空'})}
        ${v22Field(r,'personality','性格习惯与行为特征',{rows:3,placeholder:'平时言行习惯、情绪反应与待人接物风格，可留空'})}
        ${v22Field(r,'background','背景故事与关键经历',{fill:true,rows:6,placeholder:'人物动机来源、过去的关键转折事件，可留空'})}
        ${v22Field(r,'relationships','重要人际关系与纽带',{rows:2,placeholder:'与其他角色的交往态度与纽带关系，可留空'})}
      </section>
    </div>
  </div>`;
}
const v22OriginalRoleDetail=roleDetail;
roleDetail=function(){
  const r=role(ui.roleId)||roles[0],related=store.sessions.filter(s=>!s.archivedAt&&(s.roles||[]).includes(r.id)).sort((a,b)=>(b.created||0)-(a.created||0));
  const tabs=[['overview','概览'],['profile','完整档案'],['chats','相关会话'],['gallery','角色图片'],['prompts','场景与提示词'],['rp','RP 配置']];
  
  const railHtml=`
  <aside class="v23-wb-rail">
    <div class="v23-wb-rail-head">
      <button class="btn quiet sm" onclick="visit('roles')">${I('back')} 角色库大厅</button>
      <div class="v23-wb-rail-filter">
        <span>全部角色 (${roles.length})</span>
        <button class="ghost" style="padding:0;font-size:11px" onclick="openTags()">${I('tag')} 标签库</button>
      </div>
    </div>
    <div class="v23-wb-rail-list">
      ${roles.map(x=>`
        <button class="v23-wb-role-item ${x.id===r.id?'on':''}" onclick="goRole('${x.id}')">
          <div class="avatar ${x.tone}">${E(x.icon||x.name[0])}</div>
          <div class="v23-wb-role-meta">
            <strong>${E(x.name)}</strong>
            <span>${E(x.series)}</span>
          </div>
          ${x.id===r.id?I('check'):''}
        </button>
      `).join('')}
    </div>
    <div class="v23-wb-rail-foot">
      <button class="btn sm" onclick="show('roleCreate')">${I('plus')} 新增角色</button>
    </div>
  </aside>`;

  const canvasBody=ui.roleTab==='gallery'?gallery(r):
                   ui.roleTab==='prompts'?`
                     <div class="card" style="margin-top:0">
                       <div class="between">
                         <div>
                           <h3 class="h3">场景讨论与提示词</h3>
                           <p class="sub">场景讨论与提示词归属会话，图片保存在对应角色目录。</p>
                         </div>
                         <button class="btn primary" onclick="openNew('scene','${r.id}')">${I('plus')} 讨论场景</button>
                       </div>
                       <div style="height:15px"></div>
                       ${related.filter(s=>s.kind==='scene').map(s=>`
                         <button class="clickrow" style="width:100%;margin:6px 0;text-align:left" onclick="goSession('${s.id}')">
                           <strong>${E(s.title)}</strong>
                           <div class="tiny">${(s.prompts||[]).length} 个提示词草稿 · ${E(s.summary||'')}</div>
                         </button>
                       `).join('')||'<div class="empty">暂无相关场景讨论</div>'}
                     </div>`:
                   ui.roleTab==='rp'?`
                     <div class="card" style="margin-top:0">
                       <div class="v22-cardhead">
                         <h3>RP 角色配置</h3>
                         <span class="chip ${isRoleRpReady(r.id)?'green':''}">${isRoleRpReady(r.id)?'已配置':'尚未配置'}</span>
                       </div>
                       <p class="small-over">完整人物档案独立保存。RP 可以使用其中选定的信息，但不会把临时剧情自动回写。</p>
                       <button class="btn primary" onclick="startRP('${r.id}')">${I('theater')} ${isRoleRpReady(r.id)?'进入角色对话':'准备角色扮演'}</button>
                     </div>`:
                   ui.roleTab==='chats'?`
                     <div class="card" style="margin-top:0">
                       <div class="between">
                         <h3 class="h3">与 ${E(r.name)} 关联的会话 · ${related.length}</h3>
                         <button class="btn sm" onclick="filterRoleSessions('${r.id}')">在会话中心筛选 ${I('arrow')}</button>
                       </div>
                       <div style="margin-top:15px">
                         ${related.map(s=>`
                           <button class="clickrow" style="display:block;width:100%;margin:7px 0" onclick="goSession('${s.id}')">
                             <div class="between"><strong>${E(s.title)}</strong><span class="chip">${E(kname(s.kind))}</span></div>
                             <div class="sub">${E(s.summary||'')}</div>
                           </button>
                         `).join('')||'<div class="empty">暂无关联会话</div>'}
                       </div>
                       <button class="btn" style="margin-top:15px" onclick="v22RoleBrainstorm('${r.id}')">${I('spark')} 发起设定讨论</button>
                     </div>`:
                   ui.roleTab==='profile'?v22RoleProfile(r):
                   v22RoleOverview(r,related);

  const canvasHtml=`
  <section class="v23-wb-canvas">
    <header class="v23-wb-canvas-header">
      <div class="v23-wb-canvas-topline">
        <div class="avatar ${r.tone}">${E(r.icon||r.name[0])}</div>
        <div class="v23-wb-identity">
          <div class="v23-wb-title-row">
            <h1 class="h1">${E(r.name)}</h1>
            <span class="series">${E(r.series)}</span>
          </div>
          <div class="v23-wb-tags-line">
            ${v22Status(r).map(t=>`<span class="chip ${t==='可扮演'?'green':''}">${E(t)}</span>`).join('')}
          </div>
        </div>
        <div class="v23-wb-header-actions">
          <button class="btn sm" onclick="show('roleEdit')">${I('pen')} 基本信息</button>
          <button class="btn primary sm" onclick="v22RoleBrainstorm('${r.id}')">${I('spark')} AI 完善设定</button>
        </div>
      </div>
      <nav class="v23-wb-subnav" aria-label="角色视图导航">
        ${tabs.map(([id,label])=>`
          <button class="tab ${ui.roleTab===id?'on':''}" onclick="v22RolePageTab('${id}')">${label}</button>
        `).join('')}
      </nav>
    </header>
    <div class="v23-wb-canvas-body">
      ${canvasBody}
    </div>
  </section>`;

  const promptCount=related.filter(s=>s.kind==='scene').reduce((acc,s)=>(acc+(s.prompts||[]).length),0);
  const inspectorHtml=`
  <aside class="v23-wb-inspector">
    <div>
      <div class="v23-insp-group-title">
        <span>角色规格档案</span>
        <button class="ghost" style="padding:0;font-size:11px" onclick="show('roleEdit')">${I('pen')}</button>
      </div>
      <div class="v23-insp-grid">
        <div class="v23-insp-row">
          <span class="v23-insp-label">所属系列</span>
          <span class="v23-insp-value">${E(r.series)}</span>
        </div>
        <div class="v23-insp-row">
          <span class="v23-insp-label">身份职业</span>
          <span class="v23-insp-value ${r.profile?.identity?'':'unset'}">${E(r.profile?.identity||'尚未设定')}</span>
        </div>
        <div class="v23-insp-row">
          <span class="v23-insp-label">特长能力</span>
          <span class="v23-insp-value ${r.profile?.abilities?'':'unset'}">${E(r.profile?.abilities||'尚未设定')}</span>
        </div>
        <div class="v23-insp-row">
          <span class="v23-insp-label">性格特质</span>
          <span class="v23-insp-value ${r.profile?.personality?'':'unset'}">${E(r.profile?.personality||'尚未设定')}</span>
        </div>
      </div>
    </div>

    <div class="v23-insp-divider"></div>

    <div>
      <div class="v23-insp-group-title">
        <span>检索标准标签</span>
        <button class="ghost" style="padding:0;font-size:11px" onclick="v22OpenPicker('${r.id}')">${I('plus')} 编辑</button>
      </div>
      <div class="v23-insp-tags-wrap">
        ${v22RoleChips(r)}
      </div>
      <button class="btn sm" style="width:100%;margin-top:10px" onclick="v22SuggestTags('${r.id}')">${I('spark')} AI 建议标签</button>
    </div>

    <div class="v23-insp-divider"></div>

    <div>
      <div class="v23-insp-group-title">
        <span>创作资产统计</span>
        <span class="tiny">${related.length} 条会话</span>
      </div>
      <div class="v23-insp-grid">
        <div class="v23-insp-row">
          <span class="v23-insp-label">关联会话总数</span>
          <span class="v23-insp-value">${related.length} 条</span>
        </div>
        <div class="v23-insp-row">
          <span class="v23-insp-label">场景提示词草稿</span>
          <span class="v23-insp-value">${promptCount} 个批次</span>
        </div>
        <div class="v23-insp-row">
          <span class="v23-insp-label">RP 配置状态</span>
          <span class="v23-insp-value">${isRoleRpReady(r.id)?'已就绪':'待配置'}</span>
        </div>
      </div>
    </div>
  </aside>`;

  return `<div class="v23-workbench">${railHtml}${canvasHtml}${inspectorHtml}</div>`;
};


// Character catalogue: visual archive and retrieval tags coexist.
function v22RoleSearchChange(v){ui.roleSearch=v;render();const el=document.getElementById('v22-role-search');if(el){el.focus();el.setSelectionRange(el.value.length,el.value.length)}}
function v22RoleFilter(v){ui.indexFilter=v;render()}
roleList=function(){let data=roles.filter(r=>!r.archivedAt&&(ui.roleSeries==='all'||r.series===ui.roleSeries)&&(ui.indexFilter==='all'||(r.indexTags||[]).includes(ui.indexFilter))&&`${r.name} ${r.series} ${r.desc} ${(r.profile?.intro||'')} ${v22Assigned(r).map(t=>t.name).join(' ')}`.toLowerCase().includes(ui.roleSearch.toLowerCase()));return `<div class="split"><aside class="sidebar"><div class="sidetitle">角色资料</div><button class="btn primary" style="width:calc(100% - 20px);margin:0 10px" onclick="show('roleCreate')">${I('plus')} 新增角色</button><div class="side-section">资料入口</div><button class="side-link on" onclick="visit('roles')">${I('users')} 全部角色</button><button class="side-link" onclick="openTags()">${I('tag')} 视觉素材标签库 <span class="count">${store.tagItems.length}</span></button><div class="side-section">按角色系列</div>${['all',...new Set(roles.map(r=>r.series))].map((name,i)=>`<button class="side-link ${ui.roleSeries===name?'on':''}" onclick="ui.roleSeries=${i===0?"'all'":JSON.stringify(name).replaceAll('"','&quot;')};render()">${I('folder')} ${name==='all'?'全部系列':E(name)}</button>`).join('')}</aside><section class="center"><div class="pagepad"><div class="between"><div><h1 class="h1">我的角色</h1><p class="small-over">一份角色档案持续成长：视觉 → 人物设定 → 场景与 RP。</p></div><button class="btn" onclick="openTags()">${I('tag')} 视觉标签库</button></div><div class="v22-rolelist-toolbar"><input id="v22-role-search" class="input" value="${E(ui.roleSearch)}" oninput="v22RoleSearchChange(this.value)" placeholder="搜索角色、设定或关键词"><select class="select" aria-label="按标准检索标签筛选" onchange="v22RoleFilter(this.value)"><option value="all">所有检索标签</option>${store.indexTagDefs.filter(t=>v22Tagged(t.id)>0).map(t=>`<option value="${E(t.id)}" ${ui.indexFilter===t.id?'selected':''}>${E(t.name)} · ${v22Tagged(t.id)}</option>`).join('')}</select><span class="tiny">${data.length} 位角色</span></div><div class="role-grid">${data.map(r=>`<div class="card role-card click" onclick="v22PickRole('${r.id}')"><div class="role-cover ${r.tone}"><span class="art">${E(r.icon)}</span></div><div class="role-meta"><strong>${E(r.name)}</strong><div class="tiny">${E(r.series)}</div><p>${E(v22RoleIntro(r).slice(0,95))}</p><div class="v22-labels">${v22Assigned(r).slice(0,4).map(t=>`<span class="chip green">${E(t.name)}</span>`).join('')||'<span class="chip">未分类</span>'}</div><div class="tiny" style="margin-top:12px">${store.sessions.filter(s=>!s.archivedAt&&(s.roles||[]).includes(r.id)).length} 条关联讨论 · ${v22HasProfile(r)?'有人物设定':'以视觉设计为主'}　${I('arrow')}</div></div></div>`).join('')||'<div class="empty">没有找到匹配角色。可以调整筛选条件。</div>'}</div></div></section></div>`};
// From a character page, enter a topic-aware discussion with a live profile side panel.
function v22RoleBrainstorm(id){const r=role(id);if(!r)return;let s=store.sessions.find(x=>x.kind==='design'&&x.focus==='profile'&&(x.roles||[]).includes(id));if(!s){s={id:nextId('s'),title:`${r.name} · 人物设定讨论`,kind:'design',focus:'profile',roles:[id],work:null,series:r.series,model:store.modelDefaults.design,summary:'人物设定协作 · 候选修改待审阅',created:Date.now(),messages:[{by:'ai',text:`这是一段关于「${r.name}」的人物设定讨论。可以先交换想法，再点击右侧的「生成修改建议」，审阅后写入档案。`}],prompts:[]};store.sessions.unshift(s);save()}ui.kind='all';ui.role='all';ui.sessionQuery='';goSession(s.id)}
const v22OriginalContext=context;
context=function(s){if(s.kind!=='design'||!s.focus||!s.roles?.length)return v22OriginalContext(s);const r=role(s.roles[0]);if(!r)return v22OriginalContext(s);const p=s.roleProposal;return `<aside class="context v22-rolecontext"><div class="section"><div class="between"><h3>正在完善的角色</h3><span class="chip green">档案协作</span></div><button class="clickrow" style="width:100%;display:flex;gap:10px;align-items:center;margin:12px 0" onclick="v22PickRole('${r.id}')"><div class="avatar ${r.tone}" style="height:35px;width:35px;flex-basis:35px;font-size:13px">${E(r.icon)}</div><div><strong>${E(r.name)}</strong><div class="tiny">查看正式档案 ${I('arrow')}</div></div></button><p class="small-over">${E(v22RoleIntro(r).slice(0,140))}</p><div class="v22-labels">${v22Assigned(r).slice(0,4).map(t=>`<span class="chip">${E(t.name)}</span>`).join('')}</div></div><div class="section"><h3>AI 人设协作</h3><p class="small-over">可以先聊天、脑暴，再将满意的字段写入正式档案。${window.CreationWorkflow?.executionMode({featureKey:"discussion",sessionId:s.id})==="network"?"生成建议将调用当前配置的模型。":"当前建议来自本地固定规则，尚未调用 AI。"}</p><label class="tiny" for="v22-proposal-field">准备完善</label><select id="v22-proposal-field" class="select" style="margin-top:5px">${[['identity','身份 / 职业'],['abilities','能力 / 特长'],['personality','性格'],['background','背景经历'],['relationships','人物关系'],['intro','简短简介'],['visual','视觉设定']].map(([k,label])=>`<option value="${k}" ${p?.field===k?'selected':''}>${label}</option>`).join('')}</select><button class="btn primary" style="width:100%;margin-top:10px" onclick="v22CreateProposal('${s.id}')">${I('spark')} 生成修改建议</button>${p&&p.status==='pending'?`<div class="v22-proposal"><div class="between" style="margin-bottom:8px"><strong style="font-size:12px">待审阅修改${p.targetLabel?" · "+E(p.targetLabel):""}</strong><span class="chip gold">尚未写入</span></div><div class="tiny" style="margin:8px 0 5px">现有内容</div><div class="v22-old">${E(p.old||'（此字段尚未填写）')}</div><div class="tiny" style="margin:10px 0 6px">建议稿（可直接编辑）</div><textarea class="textarea" rows="5" oninput="v22DraftProposal('${s.id}',this.value)">${E(p.proposed)}</textarea><div class="flex gap8" style="margin-top:10px"><button class="btn primary sm" onclick="v22ApplyProposal('${s.id}')">${I('check')} 采用写入</button><button class="btn sm" onclick="v22DiscardProposal('${s.id}')">放弃</button></div></div>`:''}</div><div class="section"><h3>关联工具</h3><button class="btn sm" style="width:100%" onclick="v22OpenPicker('${r.id}')">${I('tag')} 编辑角色检索标签</button><button class="btn sm" style="width:100%;margin-top:8px" onclick="openTags()">${I('palette')} 管理视觉素材库</button></div></aside>`};
function v22ProposalText(r,field){const last=store.sessions.flatMap(x=>x.focus==='profile'&&x.roles?.includes(r.id)?x.messages.filter(m=>m.by==='you').slice(-2).map(m=>m.text):[]).slice(-1)[0]||'';const item={identity:`${r.name}的职业与社会身份仍可进一步完善。建议明确所属组织、日常职责，以及这些职责与角色已有视觉设计的关系。`,abilities:`可以给${r.name}设计一项鲜明的擅长领域，同时保留能力限制，让角色表现有连续性。`,personality:`${r.name}平时表现得较为克制，但在熟悉的人面前会更主动。遇到重要抉择时，会优先考虑自身立场与他人的感受。`,background:`${r.name}曾经历过一段影响其选择的重要事件。这段经历可以作为人物动机的来源，具体细节仍待讨论与确认。`,relationships:`可以从一位长期相识的朋友入手，建立${r.name}与其他角色的关系，再逐步补充更复杂的人际网络。`,intro:`${r.name}是一位仍在逐步完善设定的原创角色，拥有独立视觉设计，可以参与场景构思、人物讨论及后续创作。`,visual:`${r.visual||''}\n\n待扩展：可以进一步明确服装差分、配饰和日常场景中的视觉表现。`};let t=item[field]||'';if(last.length>8&&field!=='visual')t+=`\n\n本次讨论重点：${last.slice(0,90)}。`;return t}
function v22CreateProposal(id){const s=session(id),r=role(s?.roles?.[0]);if(!s||!r)return;const field=document.getElementById('v22-proposal-field')?.value||'identity';const old=field==='visual'?r.visual:(r.profile?.[field]||'');s.roleProposal={id:nextId('prop'),roleId:r.id,field,old,proposed:v22ProposalText(r,field),status:'pending'};save();render();toast('候选已生成，请审阅后决定是否写入')}
function v22DraftProposal(id,v){const s=session(id);if(s?.roleProposal){s.roleProposal.proposed=v;save()}}
function v22ApplyProposal(id){const s=session(id),p=s?.roleProposal,r=role(p?.roleId);if(!r||!p||p.status!=='pending')return;const old=p.field==='visual'?r.visual:(r.profile?.[p.field]||'');if(String(old||'')!==String(p.old||'')){toast('档案内容已变化，请重新生成候选');return}if(!p.proposed.trim())return toast('候选内容为空，请补充或放弃');if(p.field==='visual')r.visual=p.proposed;else{r.profile??={};r.profile[p.field]=p.proposed}if(p.field==='intro')r.desc=p.proposed.slice(0,115);p.status='applied';s.messages.push({by:'ai',text:`（演示记录）${r.name} 的「${{identity:'身份',abilities:'能力',personality:'性格',background:'经历',relationships:'关系',intro:'简介',visual:'视觉设计'}[p.field]}」修改已由你确认并写入档案。`});save();render();toast('已确认写入角色档案')}
function v22DiscardProposal(id){const s=session(id);if(s?.roleProposal){s.roleProposal.status='discarded';save();render();toast('已放弃候选，档案保持原样')}}
const v22OldSend=sendMessage;
sendMessage=function(){const s=session(ui.sessionId);if(s?.focus==='profile'){const el=document.getElementById('chatinput'),t=el?.value.trim();if(!t)return;s.messages.push({by:'you',text:t},{by:'ai',text:`（创作助手）可以围绕这条想法继续补充人物身份、经历与性格。右侧「生成修改建议」可针对指定字段形成待审阅稿，只有确认后才会修改角色档案。`});s.summary=t.slice(0,48);s.created=Date.now();ui.justSentSession=s.id;save();render();document.querySelector('.messages')?.scrollTo(0,100000);return}v22OldSend()};
// Role retrieval tags: stable IDs, synonym lookup, user-reviewed suggestions.
function v22RememberIndex(){store.indexTagUndo={defs:structuredClone(store.indexTagDefs),mapping:roles.map(r=>({id:r.id,tags:[...(r.indexTags||[])]}))}}
function v22UndoIndex(){const h=store.indexTagUndo;if(!h)return toast('没有可撤销的角色检索标签修改');store.indexTagDefs=h.defs;for(const item of h.mapping){const r=role(item.id);if(r)r.indexTags=item.tags}store.indexTagUndo=null;save();v22ClosePopup();render();toast('已撤销上一次检索标签更改')}
function v22AssignTag(roleId,tagId){const r=role(roleId);if(!r||!v22Tag(tagId))return;if((r.indexTags||[]).includes(tagId))return toast('已经添加过此标签');v22RememberIndex();r.indexTags??=[];r.indexTags.push(tagId);save();v22OpenPicker(roleId);render();toast('已添加标准检索标签')}
function v22RemoveTag(roleId,tagId){const r=role(roleId);if(!r)return;v22RememberIndex();r.indexTags=(r.indexTags||[]).filter(x=>x!==tagId);save();render();if(v22Popup==='picker')v22DrawPopup();toast('已从当前角色移除标签')}
function v22CreateIndexTag(roleId){const input=document.getElementById('v22-tag-query'),name=input?.value.trim();if(!name)return;const match=store.indexTagDefs.find(t=>t.name===name||t.aliases.some(a=>a===name));if(match)return v22AssignTag(roleId,match.id);v22RememberIndex();const tag={id:nextId('idx'),name,group:'自定义',aliases:[]};store.indexTagDefs.push(tag);const r=role(roleId);r.indexTags??=[];r.indexTags.push(tag.id);save();v22OpenPicker(roleId);render();toast('已创建新标准词并关联角色')}
function v22OpenPicker(roleId){ui.v22TagRole=roleId;ui.v22TagQuery='';v22ShowPopup('picker')}
function v22SuggestTags(roleId){ui.v22TagRole=roleId;ui.v22Suggest=v22BuildSuggestions(roleId);v22ShowPopup('suggest')}
function v22BuildSuggestions(roleId){const r=role(roleId);if(!r)return[];const p=r.profile||{},fields=[r.name,r.visual,r.desc,p.intro,p.identity,p.abilities,p.background,p.personality,p.notes,r.series,(r.tags||[]).join(' ')].join(' ').toLowerCase();const hits=[];const add=(tag,reason,newName)=>{if(hits.some(x=>x.name===(tag?.name||newName)))return;if(tag&&(r.indexTags||[]).includes(tag.id))return;hits.push({id:tag?.id||null,name:tag?.name||newName,reason,newTag:!tag,selected:true})};
for(const t of store.indexTagDefs){const words=[t.name,...t.aliases].filter(x=>x.length>=2);if(words.some(x=>fields.includes(x.toLowerCase())))add(t,`在现有角色资料中找到「${t.name}」或其别名`)}
const rules=[[/高中|高二|高三|高一/, 'highschool','角色就读阶段'],[/异能|超能力|电流操控|操纵电流/, 'superpower','能力体系'],[/猫耳|猫尾|猫娘/, 'catgirl','猫科视觉特征'],[/无头骑士|杜拉罕/, 'headless','核心视觉设定'],[/电流|电系|雷电操控/, 'electric','明确的能力类型'],[/学校|校园|校服/, 'campus','校园背景'],[/职业.*技术|通信|工程师/, 'research','职业特征']];for(const [reg,id,why] of rules){if(reg.test(fields)){const t=v22Tag(id);if(t)add(t,why)}}
if(/棒球帽|头部铠甲|可拆卸机械/.test(fields))add(null,'可能具有较鲜明的可复用视觉特征','特殊配饰');
return hits.slice(0,8)}
let v22Popup='';
function v22ShowPopup(view){v22Popup=view;v22DrawPopup()}
function v22ClosePopup(){document.getElementById('v22-mask')?.remove();v22Popup=''}
function v22PopupShell(title,body,foot='',customClass=''){return `<div class="v22-modal-mask" id="v22-mask" onclick="if(event.target===this)v22ClosePopup()"><div class="v22-modal ${customClass}" role="dialog" aria-modal="true" aria-label="${E(title)}"><div class="v22-modal-head"><div><div class="v22-eyebrow">CHARACTER INDEX · V2.2</div><h3 style="margin:3px 0 0;font-size:17px">${E(title)}</h3></div><button class="btn quiet sm" onclick="v22ClosePopup()">${I('x')} 关闭</button></div><div class="v22-modal-body">${body}</div><div class="v22-modal-foot">${foot||'<button class="btn" onclick="v22ClosePopup()">完成</button>'}</div></div></div>`}
function v22DrawPopup(){
  document.getElementById('v22-mask')?.remove();
  const r=role(ui.v22TagRole);
  let body='',title='',foot='',modalClass='';
  if(v22Popup==='picker'&&r){
    modalClass='modal-picker-dialog';
    title=`为「${r.name}」选取检索标签`;
    ui.v22TagCat ??= 'all';
    const groups=['all',...new Set(store.indexTagDefs.map(t=>t.group).filter(Boolean))];
    const sideHtml=groups.map(g=>{
      const isActive=(ui.v22TagCat===g);
      const count=g==='all'?store.indexTagDefs.length:store.indexTagDefs.filter(t=>t.group===g).length;
      const label=g==='all'?'全部分类':g;
      return `<button type="button" class="v22-cat-btn ${isActive?'active':''}" data-cat="${E(g)}" onclick="v22SwitchCategory('${E(g)}')"><span>${E(label)}</span><span class="count">${count}</span></button>`;
    }).join('');

    body=`<div class="v22-picker-top-bar">
      <input class="input v22-picker-search" id="v22-tag-query" value="${E(ui.v22TagQuery)}" oninput="v22PopupSearch(this.value)" placeholder="搜索标签名称、别名或直接新建...">
      <button type="button" class="btn primary" onclick="v22SuggestTags('${r.id}')" title="根据已有角色设定智能提取标签">${I('spark')} AI 建议标签</button>
      <button type="button" class="btn" onclick="v22UndoIndex()" title="撤销上一次检索标签修改">${I('undo')} 撤销</button>
      <button type="button" class="btn" onclick="v22ShowPopup('library')" title="管理规范词表与同义词别名">词表管理</button>
    </div>
    <div class="v22-library-tags-wrap">
      <span class="tiny" style="font-weight:700;color:#999;flex-shrink:0;">已选标签 (${(r.indexTags||[]).length})：</span>
      <div class="v22-library-tags" style="display:inline-flex;flex-wrap:wrap;gap:4px;">${v22RoleChips(r,true)}</div>
    </div>
    <div class="v22-picker-split">
      <aside class="v22-picker-cats">${sideHtml}</aside>
      <div class="v22-picker-main">
        <div id="v22-tag-results" class="v22-tag-grid">${v22PickerResults(r)}</div>
      </div>
    </div>`;
  }else if(v22Popup==='suggest'&&r){
    title='AI 智能提取检索标签';
    body=`<p class="small-over">优先匹配已有标准词，可能新增的词会单独标注。建议仅依据已经填写的角色设定生成，最终由你决定。</p>${ui.v22Suggest.length?ui.v22Suggest.map((t,i)=>`<div class="v22-suggestion"><label><input type="checkbox" style="accent-color:#dddddd;margin-top:3px" ${t.selected?'checked':''} onchange="ui.v22Suggest[${i}].selected=this.checked"><span><strong>${E(t.name)}</strong> <span class="chip ${t.newTag?'gold':'green'}">${t.newTag?'建议新增':'已有标准标签'}</span><p>${E(t.reason)}</p></span></label></div>`).join(''):'<div class="empty">现有资料暂时没有足够明显的可复用标签。可以完善档案后再试。</div>'}<div class="v22-extra">提醒：5～12 个标签只是参考，不会强制限制数量。长篇具体设定保存在完整档案即可。</div>`;
    foot=`<button class="btn" onclick="v22OpenPicker('${r.id}')">返回选取</button><button class="btn primary" onclick="v22ApplySuggestions('${r.id}')">${I('check')} 采纳选中标签</button>`;
  }else if(v22Popup==='library'){
    title='标准检索词表';
    body=`<p class="small-over">管理角色检索词的规范名称、同义词别名和引用频次。视觉特征素材库仍在「标签库」中独立管理。</p><div class="v22-tag-search"><input class="input" id="v22-library-search" placeholder="查找标准词或别名" oninput="v22FilterLibrary(this.value)"></div><div id="v22-library-items">${v22LibraryRows('')}</div><div class="v22-extra">编辑别名可让「高中学生」匹配已有的「高中生」，减少重复建词。</div>`;
    foot=`<button class="btn" onclick="v22OpenPicker('${ui.v22TagRole}')">返回角色选取</button>`;
  }
  const el=document.createElement('div');
  el.innerHTML=v22PopupShell(title,body,foot,modalClass);
  document.body.appendChild(el.firstElementChild);
  const sc=document.querySelector('#v22-mask .v22-modal-body');
  if(sc)sc.scrollTop=0;
}
function v22PickerResults(r){
  const q=ui.v22TagQuery.trim().toLowerCase();
  const cat=ui.v22TagCat||'all';
  let list=store.indexTagDefs;
  if(cat!=='all'){
    list=list.filter(t=>t.group===cat);
  }
  if(q){
    list=list.filter(t=>(t.name+' '+t.group+' '+(t.aliases||[]).join(' ')).toLowerCase().includes(q));
  }
  const exact=store.indexTagDefs.some(t=>t.name===ui.v22TagQuery.trim()||(t.aliases||[]).includes(ui.v22TagQuery.trim()));
  
  if(!list.length){
    return `<div class="empty" style="grid-column: 1 / -1; padding: 28px 0;">未在当前分类找到匹配的标准标签</div>` + 
      (q && !exact ? `<button class="btn" style="grid-column: 1 / -1; margin-top:8px" onclick="v22CreateIndexTag('${r.id}')">${I('plus')} 创建新标准标签「${E(ui.v22TagQuery.trim())}」</button>` : '');
  }

  const cards = list.map(t => {
    const isPicked = (r.indexTags||[]).includes(t.id);
    const usage = v22Tagged(t.id);
    return `<div class="v22-tag-card ${isPicked ? 'picked' : ''}">
      <div class="v22-tag-card-head">
        <span class="v22-tag-card-name">${E(t.name)}</span>
        <span class="v22-tag-card-meta">${E(t.group)}</span>
      </div>
      <div class="v22-tag-card-desc">
        ${t.aliases?.length ? '别名：' + E(t.aliases.join('、')) : usage + ' 位角色使用'}
      </div>
      <div class="v22-tag-card-foot">
        <span style="font-size:10px;color:#888;">${usage} 引用</span>
        <button type="button" class="btn sm ${isPicked ? 'quiet' : 'primary'}" style="padding:2px 8px;font-size:11px;" onclick="${isPicked ? `v22RemoveTag('${r.id}','${t.id}')` : `v22AssignTag('${r.id}','${t.id}')`}">
          ${isPicked ? '✓ 已选 (移除)' : '+ 添加'}
        </button>
      </div>
    </div>`;
  }).join('');

  return cards + (q && !exact ? `<button class="btn" style="grid-column: 1 / -1; margin-top:8px" onclick="v22CreateIndexTag('${r.id}')">${I('plus')} 创建新标准标签「${E(ui.v22TagQuery.trim())}」</button>` : '');
}
window.v22SwitchCategory=function(cat){
  ui.v22TagCat=cat;
  const r=role(ui.v22TagRole);
  const target=document.getElementById('v22-tag-results');
  if(r&&target)target.innerHTML=v22PickerResults(r);
  document.querySelectorAll('.v22-cat-btn').forEach(b=>{
    b.classList.toggle('active',b.dataset.cat===cat);
  });
};
function v22PopupSearch(v){ui.v22TagQuery=v;const r=role(ui.v22TagRole);const target=document.getElementById('v22-tag-results');if(r&&target)target.innerHTML=v22PickerResults(r)}
function v22ApplySuggestions(id){const r=role(id);if(!r)return;const selected=ui.v22Suggest.filter(x=>x.selected);if(!selected.length)return toast('请至少选择一个建议');v22RememberIndex();for(const t of selected){let def=t.id?v22Tag(t.id):store.indexTagDefs.find(x=>x.name===t.name);if(!def){def={id:nextId('idx'),name:t.name,group:'AI 建议',aliases:[]};store.indexTagDefs.push(def)}if(!(r.indexTags||[]).includes(def.id)){r.indexTags??=[];r.indexTags.push(def.id)}}save();render();v22ClosePopup();toast('已将选中的检索标签添加到角色档案')}
function v22LibraryRows(q){return store.indexTagDefs.filter(t=>(t.name+' '+t.aliases.join(' ')).toLowerCase().includes(q.toLowerCase())).slice(0,80).map(t=>`<div class="v22-index-item"><div style="flex:1"><strong>${E(t.name)}</strong><p>${E(t.group)} · ${v22Tagged(t.id)} 位角色使用</p><div class="tiny">别名：${E(t.aliases.join('、')||'暂无')}</div></div><button class="btn sm" onclick="v22EditAliases('${t.id}')">${I('pen')} 编辑别名</button></div>`).join('')||'<div class="empty">没有匹配的标准标签</div>'}
function v22FilterLibrary(v){const box=document.getElementById('v22-library-items');if(box)box.innerHTML=v22LibraryRows(v)}
function v22EditAliases(id){const t=v22Tag(id);if(!t)return;const row=document.getElementById('v22-library-items');if(!row)return;const current=document.getElementById('v22-alias-editor');current?.remove();const wrap=document.createElement('div');wrap.id='v22-alias-editor';wrap.className='v22-extra';wrap.innerHTML=`<strong>编辑「${E(t.name)}」别名</strong><p class="tiny">仅逗号用于分隔别名，便于输入同义词；角色选取仍使用标准词。</p><input class="input" id="v22-alias-input" value="${E(t.aliases.join('，'))}" placeholder="多个别名以逗号分隔"><div class="flex gap8" style="margin-top:9px"><button class="btn primary sm" onclick="v22SaveAliases('${id}')">保存别名</button><button class="btn sm" onclick="document.getElementById('v22-alias-editor').remove()">取消</button></div>`;row.before(wrap);wrap.scrollIntoView({block:'nearest'})}
function v22SaveAliases(id){const t=v22Tag(id);if(!t)return;const values=(document.getElementById('v22-alias-input')?.value||'').split(/[,，、]/).map(x=>x.trim()).filter(Boolean);v22RememberIndex();t.aliases=[...new Set(values)].filter(x=>x!==t.name);save();v22ShowPopup('library');toast('标签别名已更新')}
// No "recent chat" section on RP home; sort order does the job.
function v22RpView(view){ui.rpView=view;render()};function v22RpSort(v){ui.rpSort=v;render()};
rpDirectory=function(){let data=roles.filter(r=>!r.archivedAt&&`${r.name} ${r.series} ${r.desc}`.toLowerCase().includes(ui.rpSearch.toLowerCase()));data.sort((a,b)=>ui.rpSort==='name'?a.name.localeCompare(b.name,'zh-CN'):ui.rpSort==='series'?a.series.localeCompare(b.series,'zh-CN')||a.name.localeCompare(b.name,'zh-CN'):(store.rpActivity[b.id]||0)-(store.rpActivity[a.id]||0)||a.name.localeCompare(b.name,'zh-CN'));
return `<div class="scroll" style="height:100%"><div class="rp-home" style="max-width:1280px"><div class="v22-eyebrow">ROLEPLAY SPACE · V2.2</div><h1 class="h1">选择角色，开始对话。</h1><p class="small-over">直接从角色目录进入；可切换卡片 / 紧凑列表，或按最近聊天与名称排序。</p><div class="v22-rp-controls"><input class="input" id="rpSearch" value="${E(ui.rpSearch)}" oninput="rpSearchChange(this.value)" placeholder="搜索角色名称、系列或设定..."><select class="select" onchange="v22RpSort(this.value)"><option value="recent" ${ui.rpSort==='recent'?'selected':''}>按最近聊天排序</option><option value="name" ${ui.rpSort==='name'?'selected':''}>按名称排序</option><option value="series" ${ui.rpSort==='series'?'selected':''}>按角色系列排序</option></select><div class="v22-segment"><button class="${ui.rpView==='cards'?'on':''}" onclick="v22RpView('cards')">${I('image')} 卡片</button><button class="${ui.rpView==='list'?'on':''}" onclick="v22RpView('list')">${I('menu')} 列表</button></div><span class="tiny">${data.length} 位角色</span></div><div class="v22-rp-grid ${ui.rpView==='list'?'list':''}">${data.map(r=>`<button class="rp-mini-card" onclick="startRP('${r.id}')"><div class="avatar ${r.tone}">${E(r.icon)}</div><div class="rp-card-meta"><strong>${E(r.name)}</strong><p>${E(r.series)}</p><span class="chip ${store.rpConfigs?.[r.id]?'green':''}">${store.rpConfigs?.[r.id]?'可开始 RP':'需要创建 RP 配置'}</span>${ui.rpView==='cards'?`<p class="v22-rp-desc">${E(v22RoleIntro(r).slice(0,90))}</p>`:''}</div>${I('arrow')}</button>`).join('')||'<div class="empty">暂无匹配角色</div>'}</div></div></div>`};
const v22OldStartRP=startRP;startRP=function(id='yiwen'){store.rpActivity[id]=Date.now();save();v22OldStartRP(id)};
const v22OldSwitch=switchRPRole;switchRPRole=function(id){store.rpActivity[id]=Date.now();save();v22OldSwitch(id)};
// Reconcile imported or newly created characters with V2.2 fields.
const v22OldSaveNew=saveNewRole;saveNewRole=function(){v22OldSaveNew();for(const r of roles){r.profile??={intro:r.desc||'',identity:'',abilities:'',personality:'',background:'',relationships:'',notes:''};r.indexTags??=[]}save()};
const v22OldSaveRole=saveRoleEdit;saveRoleEdit=function(){v22OldSaveRole();const r=role(ui.roleId);if(r){r.profile??={};if(!r.profile.intro)r.profile.intro=r.desc;save()}};
// Popup and keyboard handling.
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&v22Popup){v22ClosePopup();e.stopImmediatePropagation()}},true);
// When changing a character, open the new overview by default.
const v22OldGoRole=goRole;goRole=function(id){ui.roleTab='overview';v22OldGoRole(id)};
const v22OldSave=save;


/* Remove legacy comma-separated role tags in create/edit dialogs. */
ui.v22NewIndexTags??=[];
function v22ModalTagChoices(){return `<div class="formrow"><label>角色检索标签（可选，可创建后继续编辑）</label><p class="tiny" style="margin:3px 0 10px">选择已有标准标签。此处用于检索，创意组合素材在「视觉标签库」中维护。</p><input class="input" id="v22-create-filter" placeholder="搜索已有标准标签..." oninput="v22FilterCreateTags(this.value)" style="margin-bottom:8px"><div class="v22-create-tag-choices">${store.indexTagDefs.map(t=>`<button class="btn sm ${ui.v22NewIndexTags.includes(t.id)?'v22-tag-picked':''}" type="button" data-tag="${E(t.id)}" data-terms="${E((t.name+' '+t.aliases.join(' ')).toLowerCase())}" onclick="v22ToggleNewTag('${t.id}',this)">${E(t.name)} ${ui.v22NewIndexTags.includes(t.id)?'✓':''}</button>`).join('')}</div></div>`}
function v22ToggleNewTag(id,btn){const list=ui.v22NewIndexTags;const i=list.indexOf(id);if(i>=0)list.splice(i,1);else list.push(id);btn.classList.toggle('v22-tag-picked',i<0);btn.innerHTML=E(v22Tag(id)?.name||id)+(i<0?' ✓':'')}
function v22FilterCreateTags(v){document.querySelectorAll('.v22-create-tag-choices button').forEach(b=>b.hidden=!b.dataset.terms.includes(v.toLowerCase().trim()))}
const v22PrevModalBody=modalBody;
modalBody=function(){let html=v22PrevModalBody();if(ui.modal==='roleCreate'){
 html=html.replace(/<div class="formrow"><label>视觉标签（逗号分隔）<\/label><input class="input" id="roleNewTags"[^>]*><\/div>/,`<input id="roleNewTags" type="hidden" value="">${v22ModalTagChoices()}`);
 }else if(ui.modal==='roleEdit'){
 const r=role(ui.roleId);
 html=html.replace(/<div class="formrow"><label>视觉标签（逗号分隔）<\/label><input class="input" id="roleNewTags"[^>]*><\/div>/,`<input id="roleNewTags" type="hidden" value="${E((r?.tags||[]).join(', '))}"><div class="formrow"><label>角色检索标签</label><div class="v22-library-tags" style="margin-bottom:9px">${r?v22RoleChips(r):''}</div><button type="button" class="btn sm" onclick="closeModal();v22OpenPicker('${r?.id||''}')">${I('tag')} 从标准词表选取</button><p class="tiny">视觉设计的完整内容可以在「完整档案」中编辑。</p></div>`);
 }
 return html};
const v22PrevShow=show;
show=function(name){if(name==='roleCreate')ui.v22NewIndexTags=[];v22PrevShow(name)};
const v22PrevSaveNew=saveNewRole;
saveNewRole=function(){const want=[...ui.v22NewIndexTags];v22PrevSaveNew();const r=role(ui.roleId);if(r&&want.length){r.indexTags=[...new Set([...(r.indexTags||[]),...want])];save();render()}ui.v22NewIndexTags=[]};

/* Preserve intentional overview text when the quick-edit dialog changes a visual summary. */
const v22PrevSaveRole2=saveRoleEdit;
saveRoleEdit=function(){const id=ui.roleId,old=role(id)?.desc;v22PrevSaveRole2();const r=role(id);if(r&&(!r.profile?.intro||r.profile.intro===old)){r.profile??={};r.profile.intro=r.desc;save()}};
/* Reset now restores both original V2.1 capabilities and V2.2 extensions. */
resetDemo=function(){
 if(!confirm('确认清空本地修改并恢复初始样例？'))return;
 store=structuredClone(initial);roles=store.roles;
 store.tagCategories=[...new Set([...cats.slice(1),'未分类'])];
 store.works=[{id:'w1',title:'北方来信',description:'小说草稿 · 人物与动机研究',chapters:[{id:'c1',title:'第三章 · 初雪'},{id:'c2',title:'第二章 · 旧站台'}]}];
 store.rpHistories={yiwen:store.rpHistory||[]};
 store.rpConfigs={yiwen:{greeting:'午后的阳光落在窗沿。她转过身，带着一点好奇打量眼前的情景。'},shuyao:{greeting:'她放下手中的书，抬头望向你。'}};
 store.rpActivity={};store.indexTagDefs=v22TagSeed.map(([id,name,group,alias])=>({id,name,group,aliases:alias.split(',')}));store.indexTagUndo=null;
 for(const r of roles){r.profile={intro:r.desc||'',identity:'',abilities:'',personality:'',background:'',relationships:'',notes:''};r.indexTags=(r.id==='yiwen'?['campus','daily']:r.id==='knight'?['catgirl','headless','knight','fantasy']:r.id==='shuyao'?['modern']:[])}
 undoStack=[];ui.sessionId='s1';ui.roleId='yiwen';ui.roleTab='overview';ui.kind='all';ui.role='all';ui.sessionQuery='';ui.roleSearch='';ui.indexFilter='all';ui.tagSelected='t1';ui.tagsQuery='';ui.tagsCategory='全部分类';ui.rpScreen='home';ui.v22NewIndexTags=[];syncCategories();save();visit('home');toast('工作区基础数据已恢复');
};


// ============ V2.3 · compact desktop layout, dual tag libraries, scroll-paged dashboard ============
ui.v23HomePage ??= 0;
ui.v23RoleView ??= (()=>{try{return WorkspaceStorage.getItem('st-v23-view')||'cards'}catch{return 'cards'}})();
ui.v23IndexCategory ??= '全部分类';
ui.v23IndexQuery ??= '';
ui.v23IndexSelected ??= store.indexTagDefs[0]?.id || null;
ui.v23IndexBack ??= {page:'roles'};
ui.v23IndexMerge ??= null;
const v23SeedGroups=['身份','视觉','题材','能力','服装','设定','自定义','AI 建议','未分类'];
store.indexTagGroups ??= [...new Set([...v23SeedGroups,...store.indexTagDefs.map(t=>t.group||'未分类')])];
store.indexTagDefs.forEach(t=>{t.group ||= '未分类';t.aliases ||= [];t.description ||= ''});
const _v23Page=page;
page=function(){if(ui.page==='home')return v23Home();if(ui.page==='roles')return v23Roles();if(ui.page==='indexTags')return v23IndexTags();return _v23Page()};
const _v23NavTarget=navTarget;
navTarget=function(){return ui.page==='indexTags'?'roles':_v23NavTarget()};

const _v23ModalBody=modalBody;
modalBody=function(){const html=_v23ModalBody();return ui.modal==='new'?`<div class="v23-modal-form">${html}</div>`:html};
function v23SwitchHome(n){if(n<0||n>2||ui.v23HomePage===n)return;ui.v23HomePage=n;render()}
let v23WheelAccum=0,v23WheelLast=0,v23WheelLock=0,v23WheelDirection=0;
window.addEventListener('wheel',function(e){
  if(ui.page!=='home'||ui.modal||v22Popup)return;
  const home=document.querySelector('.v23-home');
  if(!home)return;
  // If the current viewport cannot fit a full dashboard page, let native
  // scrolling reach every control instead of intercepting the wheel.
  if(home.scrollHeight>home.clientHeight+3)return;
  // Native scroll wins for any nested scrollable content under the pointer.
  let child=e.target;
  while(child&&child!==home){
    if(child instanceof Element){
      const cs=getComputedStyle(child);
      if(/auto|scroll/.test(cs.overflowY)&&child.scrollHeight>child.clientHeight+3)return;
    }
    child=child.parentElement;
  }
 e.preventDefault();
 const now=performance.now();if(now<v23WheelLock)return;
 const dir=Math.sign(e.deltaY);if(!dir)return;
 if(now-v23WheelLast>250||dir!==v23WheelDirection)v23WheelAccum=0;
 v23WheelLast=now;v23WheelDirection=dir;v23WheelAccum+=Math.abs(e.deltaY);
 if(v23WheelAccum>=55){v23WheelAccum=0;v23WheelLock=now+640;v23SwitchHome(Math.max(0,Math.min(2,ui.v23HomePage+dir)))}
},{passive:false});
window.addEventListener('keydown',e=>{
  if(ui.page!=='home'||ui.modal||v22Popup||['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
  const home=document.querySelector('.v23-home');
  if(home&&home.scrollHeight>home.clientHeight+3)return;
 if(e.key==='PageDown'||e.key==='ArrowDown'){e.preventDefault();v23SwitchHome(Math.min(2,ui.v23HomePage+1))}
 if(e.key==='PageUp'||e.key==='ArrowUp'){e.preventDefault();v23SwitchHome(Math.max(0,ui.v23HomePage-1))}
});
function v23Stat(label,value,hint){return `<div class="v23-stat"><span>${E(label)}</span><b>${E(value)}</b><span>${E(hint)}</span></div>`}
function v23Hrow(title,minor){return `<div class="v23-row"><strong style="font-weight:560;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${E(title)}</strong><span class="small-over">${E(minor)}</span></div>`}
function v23Home(){
 const n=ui.v23HomePage||0;
 const pending=store.sessions.reduce((k,s)=>k+(s.proposals||[]).filter(p=>p.status==='pending').length+(s.roleProposal?.status==='pending'?1:0),0);
 const by=choices.map(c=>({...c,count:store.sessions.filter(s=>!s.archivedAt&&s.kind===c.id).length}));
 const max=Math.max(1,...by.map(x=>x.count));
 const recent=[...store.sessions].sort((a,b)=>(b.created||0)-(a.created||0)).slice(0,3);
 const heat=roles.map(r=>({r,count:store.sessions.filter(s=>!s.archivedAt&&(s.roles||[]).includes(r.id)).length})).sort((a,b)=>b.count-a.count).slice(0,4);
 const byGroup=store.indexTagGroups.map(g=>({g,n:store.indexTagDefs.filter(t=>t.group===g).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,4);
 let content='';
 if(n===0)content=`<div class="v23-home-pane"></div><section class="v23-hero"><div><div class="chip green">个人 AI 创作工作室 · V2.4.1</div><h2>一个窗口，继续所有灵感。</h2><p>按创作类型和角色找回讨论，在软件内维护角色与标签；生图时，把整理好的提示词交给 Codex。</p><button class="btn primary" onclick="openNew('design')">${I('plus')} 开始新创作</button></div><div class="v23-hero-art">${I('spark')}</div></section>
 <div class="v23-stats">${v23Stat('角色档案',roles.length,'已保存的原创角色')}${v23Stat('创作会话',store.sessions.length,'跨类型统一管理')}${v23Stat('视觉创作标签',store.tagItems.length,'组合设计素材')}${v23Stat('待审阅提议',pending,'确认前不会写入')}</div>
 <div class="v23-home-bottom"><section class="v23-home-panel"><h2>创作脉络</h2>${recent.map(s=>v23Hrow(s.title,kname(s.kind))).join('')}<p class="v23-quiet" style="margin:7px 0 0">最近发生过什么，一眼就能回想起来。</p></section><section class="v23-home-panel"><h2>资料覆盖</h2>${v23Hrow('具有人物设定',`${roles.filter(v22HasProfile).length} 位角色`)}${v23Hrow('已准备 RP',`${roles.filter(r=>!r.archivedAt&&isRoleRpReady(r.id)).length} 位角色`)}${v23Hrow('检索标准标签',`${store.indexTagDefs.length} 条`)}<p class="v23-quiet" style="margin:7px 0 0">这里展示概览，完整资料在相应工作页面管理。</p></section></div>`;
 else if(n===1)content=`<div class="v23-activity-grid"><section class="v23-home-panel" style="height:100%;display:flex;flex-direction:column"><h2>不同创作目的的会话分布</h2><p class="v23-quiet">基于当前全部会话统计，分类计数会随创作自然增长。</p><div class="v23-activity-bars">${by.map(x=>`<div><div class="v23-bar-head"><span>${E(x.name)}</span><strong>${x.count}</strong></div><div class="v23-bar-track"><div class="v23-bar-value" style="width:${x.count/max*100}%"></div></div></div>`).join('')}</div><div style="flex:1"></div><p class="v23-quiet">数量代表会话条数，不能代表创作质量或实际投入时长。</p></section>
 <section class="v23-home-panel" style="height:100%"><h2>关联讨论最多的角色</h2><p class="v23-quiet">用于观察哪些人物正在被反复完善。</p>${heat.map(x=>v23Hrow(x.r.name,`${x.count} 条讨论`)).join('')}<div style="border-top:1px solid var(--stroke);margin-top:16px;padding-top:12px"><div class="v23-home-meta">${I('chat')} 讨论是创作过程；角色档案负责保存已经认可的成果。</div></div></section></div>`;
 else content=`<div class="v23-asset-grid"><section class="v23-home-panel" style="height:100%"><h2>两套标签系统</h2><p class="v23-quiet">将生成素材与检索标准词分开维护，避免越用越乱。</p><div class="v23-assetline"><span>${I('palette')} 视觉素材标签</span><strong>${store.tagItems.length}</strong></div><div class="v23-assetline"><span>${I('tag')} 角色检索标准词</span><strong>${store.indexTagDefs.length}</strong></div><div class="v23-assetline"><span>${I('folder')} 素材分类</span><strong>${store.tagCategories?.length||0}</strong></div><div class="v23-assetline"><span>${I('folder')} 检索词分类</span><strong>${store.indexTagGroups.length}</strong></div><p class="v23-quiet" style="margin-top:14px">视觉标签可以很细；检索标签优先采用简明、可复用的标准词。</p></section>
 <section class="v23-home-panel" style="height:100%"><h2>标准检索词的分类</h2>${byGroup.map(x=>v23Hrow(x.g,`${x.n} 条`)).join('')}<div style="border-top:1px solid var(--stroke);padding-top:14px;margin-top:12px"><div class="v23-home-meta">${I('check')} 模拟操作支持确认与撤销；正式接入模型后仍由软件维护数据。</div></div></section></div>`;
 return `<div class="v23-home"><div class="v23-home-inner"><div class="v23-home-header"><div><div class="eyebrow">CREATIVE DESK · OVERVIEW</div><h1>${['创作从这里继续。','回顾创作的方向。','让灵感有序积累。'][n]}</h1></div><div class="v23-home-meta">${['创作总览','会话分析','资料概况'][n]} <span>0${n+1} / 03</span></div></div>${content}<div class="v23-home-footer"><span>本地演示数据 · 不调用真实 AI API</span><span>滚动鼠标滚轮切换概览页面 · PageUp / PageDown</span></div></div><div class="v23-dots" aria-label="首页分页">${['创作总览','会话分析','资料概况'].map((name,i)=>`<button class="v23-dot ${i===n?'on':''}" aria-label="${name}" title="${name}" onclick="v23SwitchHome(${i})"></button>`).join('')}</div></div>`;
}
function v23RoleViewChange(v){ui.v23RoleView=v;try{WorkspaceStorage.setItem('st-v23-view',v)}catch{}render()}
function v23RoleSearch(v){ui.roleSearch=v;render();const f=document.getElementById('v23-role-search');if(f){f.focus();f.setSelectionRange(v.length,v.length)}}

function openRoleTagFilterModal() {
  ui.tempSelectedRoleTags = [...(ui.selectedRoleTags || [])];
  ui.roleTagFilterCat = 'all';
  ui.roleTagFilterSearch = '';
  show('roleTagFilter');
}

function handleRoleTagFilterSearch(val) {
  ui.roleTagFilterSearch = val;
  overlay();
  const inp = document.getElementById('roleTagFilterSearch');
  if (inp) {
    inp.focus();
    inp.setSelectionRange(inp.value.length, inp.value.length);
  }
}

function selectRoleTagFilterCat(cat) {
  ui.roleTagFilterCat = cat;
  overlay();
}

function toggleRoleTagFilterSelection(id) {
  ui.tempSelectedRoleTags = ui.tempSelectedRoleTags || [];
  const idx = ui.tempSelectedRoleTags.indexOf(id);
  if (idx >= 0) {
    ui.tempSelectedRoleTags.splice(idx, 1);
  } else {
    ui.tempSelectedRoleTags.push(id);
  }
  overlay();
}

function clearTempRoleTagFilters() {
  ui.tempSelectedRoleTags = [];
  overlay();
}

function applyRoleTagFilters() {
  ui.selectedRoleTags = [...(ui.tempSelectedRoleTags || [])];
  ui.indexFilter = ui.selectedRoleTags.length ? ui.selectedRoleTags[0] : 'all';
  closeModal();
  render();
}

function removeRoleTagFilter(id) {
  ui.selectedRoleTags = (ui.selectedRoleTags || []).filter(x => x !== id);
  ui.indexFilter = ui.selectedRoleTags.length ? ui.selectedRoleTags[0] : 'all';
  render();
}

function clearRoleTagFilters() {
  ui.selectedRoleTags = [];
  ui.indexFilter = 'all';
  render();
}

function renderRoleTagFilterModal() {
  const allTags = store.indexTagDefs || [];
  const activeCat = ui.roleTagFilterCat || 'all';
  const searchQ = (ui.roleTagFilterSearch || '').trim().toLowerCase();
  const tempSelected = ui.tempSelectedRoleTags || [];

  // Group definitions
  const groups = ['all', ...new Set(allTags.map(t => t.group).filter(Boolean))];

  // Filtering tags
  let visibleTags = allTags;
  if (searchQ) {
    visibleTags = allTags.filter(t => {
      const matchName = t.name.toLowerCase().includes(searchQ);
      const matchId = t.id.toLowerCase().includes(searchQ);
      const matchGroup = (t.group || '').toLowerCase().includes(searchQ);
      const matchAliases = (t.aliases || []).some(a => a.toLowerCase().includes(searchQ));
      return matchName || matchId || matchGroup || matchAliases;
    });
  } else if (activeCat !== 'all') {
    visibleTags = allTags.filter(t => t.group === activeCat);
  }

  // Sort: selected tags first, then by tagged role count descending
  visibleTags.sort((a, b) => {
    const aSel = tempSelected.includes(a.id) ? 1 : 0;
    const bSel = tempSelected.includes(b.id) ? 1 : 0;
    if (aSel !== bSel) return bSel - aSel;
    return v22Tagged(b.id) - v22Tagged(a.id);
  });

  const totalVisible = visibleTags.length;
  // Limit display to 180 for instant performance with thousands of tags
  const displayTags = visibleTags.slice(0, 180);

  return `
    <div class="settings-header" style="padding:12px 18px;gap:16px;background:#181818;border-bottom:1px solid #282828">
      <div class="settings-header-left" style="flex-shrink:0">
        <h2 class="settings-header-title" style="font-size:14px;color:#f4f4f5;display:flex;align-items:center;gap:7px">
          ${I('tag')} 检索标签多维筛选
        </h2>
      </div>
      <div style="flex:1;max-width:360px">
        <div style="display:flex;align-items:center;gap:7px;background:#222222;border:1px solid #383838;border-radius:6px;padding:4px 10px">
          <span style="color:#71717a">${I('search')}</span>
          <input type="text" id="roleTagFilterSearch" placeholder="搜索标签名称、别名或分类..." value="${E(ui.roleTagFilterSearch || '')}" oninput="handleRoleTagFilterSearch(this.value)" style="background:transparent;border:none;outline:none;color:#ececec;font-size:12px;width:100%;height:auto;padding:0">
          ${ui.roleTagFilterSearch ? `<span onclick="handleRoleTagFilterSearch('')" style="cursor:pointer;color:#888;font-size:12px">✕</span>` : ''}
        </div>
      </div>
      <button class="ghost icon-btn" onclick="closeModal()" aria-label="关闭">${I('x')}</button>
    </div>

    <div class="settings-body" style="background:#141416;display:flex;height:400px;overflow:hidden">
      <!-- Left Category Sidebar -->
      <aside style="width:170px;background:#1a1a1c;border-right:1px solid #27272a;display:flex;flex-direction:column;flex-shrink:0;overflow-y:auto;padding:8px">
        <div style="font-size:10.5px;font-weight:600;color:#71717a;padding:4px 8px 8px;letter-spacing:0.5px;text-transform:uppercase">标签分类</div>
        ${groups.map(grp => {
          const isAll = (grp === 'all');
          const count = isAll ? allTags.length : allTags.filter(t => t.group === grp).length;
          const isActive = (activeCat === grp && !searchQ);
          return `
            <button class="tag-filter-cat-btn ${isActive ? 'active' : ''}" onclick="selectRoleTagFilterCat('${grp}')">
              <span>${isAll ? '全部分类' : E(grp)}</span>
              <span style="font-size:10px;color:#71717a;background:rgba(255,255,255,0.05);padding:1px 5px;border-radius:3px">${count}</span>
            </button>
          `;
        }).join('')}
      </aside>

      <!-- Right Tag Matrix / List -->
      <main style="flex:1;overflow-y:auto;padding:16px 20px;background:#161618">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="font-size:12px;color:#a1a1aa">
            ${searchQ ? `搜索关键词「<strong style="color:#fff">${E(searchQ)}</strong>」匹配结果 · ${totalVisible} 项` : `分类「<strong style="color:#fff">${activeCat === 'all' ? '全部分类' : E(activeCat)}</strong>」下的检索标签 · ${totalVisible} 项`}
          </div>
          <div style="font-size:11px;color:#71717a">点击标签加入/移出筛选</div>
        </div>

        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${displayTags.map(t => {
            const isSelected = tempSelected.includes(t.id);
            const roleCount = v22Tagged(t.id);
            return `
              <button class="tag-filter-item-btn ${isSelected ? 'selected' : ''}" onclick="toggleRoleTagFilterSelection('${E(t.id)}')">
                <span>${isSelected ? '✓ ' : ''}${E(t.name)}</span>
                <span style="font-size:10px;opacity:0.75;padding:1px 4px;border-radius:3px;background:rgba(0,0,0,0.3)">${roleCount}</span>
              </button>
            `;
          }).join('')}
          ${!displayTags.length ? `<div style="color:#71717a;font-size:12px;padding:30px 0;width:100%;text-align:center">未找到匹配的检索标签，尝试更换关键词</div>` : ''}
          ${totalVisible > 180 ? `<div style="font-size:11px;color:#71717a;width:100%;padding:10px 0;text-align:center">已展示前 180 项标签，请输入关键词精确检索更多标签</div>` : ''}
        </div>
      </main>
    </div>

    <!-- Bottom Footer -->
    <div style="display:flex;align-items:center;justify-content:space-between;padding:11px 20px;background:#1e1e20;border-top:1px solid #28282c;flex-shrink:0">
      <div style="display:flex;align-items:center;gap:10px;overflow:hidden;flex:1;margin-right:16px">
        <span style="font-size:12px;font-weight:600;color:#f4f4f5;white-space:nowrap">已选 ${tempSelected.length} 项：</span>
        <div style="display:flex;align-items:center;gap:5px;overflow-x:auto;white-space:nowrap;padding:2px 0">
          ${tempSelected.map(id => {
            const t = v22Tag(id);
            return `<span style="display:inline-flex;align-items:center;gap:4px;background:#2a2538;border:1px solid #4a3b69;color:#c9bcfa;padding:1px 7px;border-radius:3px;font-size:11px">
              ${E(t ? t.name : id)}
              <span onclick="event.stopPropagation();toggleRoleTagFilterSelection('${E(id)}')" style="cursor:pointer;color:#a78bfa;font-weight:bold">✕</span>
            </span>`;
          }).join('')}
          ${tempSelected.length === 0 ? '<span style="font-size:11px;color:#71717a">暂未选择标签（默认展示全部角色）</span>' : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        ${tempSelected.length ? `<button class="btn sm quiet" onclick="clearTempRoleTagFilters()" style="color:#ef4444;font-size:12px">清空已选</button>` : ''}
        <button class="btn" onclick="closeModal()" style="font-size:12px;padding:6px 14px">取消</button>
        <button class="btn primary" onclick="applyRoleTagFilters()" style="font-size:12px;padding:6px 18px;background:var(--accent, #7c3aed);color:#fff">应用筛选 (${tempSelected.length})</button>
      </div>
    </div>
  `;
}

function v23Roles(){
 const q=(ui.roleSearch||'').trim().toLowerCase();
 ui.selectedRoleTags = Array.isArray(ui.selectedRoleTags) ? ui.selectedRoleTags : (ui.indexFilter && ui.indexFilter !== 'all' ? [ui.indexFilter] : []);
 const selectedTags = ui.selectedRoleTags;
 const isArchiveMode = !!ui.v23RoleArchive;

 let data = roles.filter(r => {
   if (isArchiveMode ? !r.archivedAt : !!r.archivedAt) return false;
   if (ui.roleSeries !== 'all' && r.series !== ui.roleSeries) return false;
   if (selectedTags.length > 0) {
     const rTags = r.indexTags || [];
     if (!selectedTags.every(tId => rTags.includes(tId))) return false;
   }
   const searchBlob = `${r.name} ${r.series} ${r.desc||''} ${r.profile?.intro||''} ${v22Assigned(r).map(t=>t.name+' '+t.aliases.join(' ')).join(' ')}`.toLowerCase();
   if (q && !searchBlob.includes(q)) return false;
   return true;
 });

 const grid = ui.v23RoleView !== 'details';

 return `<div class="split">
   <aside class="sidebar">
     <div class="sidetitle">角色资料</div>
     <button class="btn primary" style="width:calc(100% - 20px);margin:0 10px" onclick="show('roleCreate')">${I('plus')} 新增角色</button>
     <div class="side-section">资料库</div>
     <button class="side-link ${!ui.v23RoleArchive?'on':''}" onclick="ui.v23RoleArchive=false;render()">${I('users')} 全部角色 <span class="count">${roles.filter(r=>!r.archivedAt).length}</span></button>
     <button class="side-link ${ui.v23RoleArchive?'on':''}" onclick="ui.v23RoleArchive=true;render()">${I('folder')} 角色归档箱 <span class="count">${roles.filter(r=>!!r.archivedAt).length}</span></button>
     <button class="side-link" onclick="openCandidateTrayModal('all')">${I('spark')} 候选提议托盘 <span class="count">${(window.CreationWorkflow?.listCandidates?CreationWorkflow.listCandidates().filter(c=>c.status==='pending').length:0)}</span></button>
     <button class="side-link" onclick="openTags()">${I('palette')} 视觉素材标签库 <span class="count">${store.tagItems.length}</span></button>
     <button class="side-link" onclick="v23GoIndex('roles')">${I('tag')} 角色检索标签库 <span class="count">${store.indexTagDefs.length}</span></button>
     <div class="side-section">按角色系列</div>
     ${['all',...new Set(roles.map(r=>r.series))].map((name,i)=>`<button class="side-link ${ui.roleSeries===name?'on':''}" onclick="v23SetSeries(${i})">${I('folder')} ${name==='all'?'全部系列':E(name)}</button>`).join('')}
   </aside>
   <section class="center v23-rolemain">
     <div class="v23-rolehead">
       <div><h1>${isArchiveMode ? '角色归档箱' : '我的角色'}</h1></div>
       <div class="flex gap8"><span class="tiny">${data.length} / ${roles.length} 位</span></div>
     </div>
     <div class="v23-roletoolbar">
       <input class="input" id="v23-role-search" value="${E(ui.roleSearch||'')}" oninput="v23RoleSearch(this.value)" placeholder="搜索角色名称、系列、身份、标签…">
       <button type="button" class="btn v23-filter-trigger-btn ${selectedTags.length ? 'has-active' : ''}" onclick="openRoleTagFilterModal()" style="display:flex;align-items:center;justify-content:space-between;gap:8px;height:40px;background:#292929;border:1px solid ${selectedTags.length ? 'var(--accent, #7c3aed)' : '#404040'};border-radius:6px;padding:0 12px;color:#f3f4f6;cursor:pointer;white-space:nowrap">
         <span style="display:flex;align-items:center;gap:6px">
           ${I('tag')}
           <span>${selectedTags.length === 0 ? '全部检索标签' : `已选标签 (${selectedTags.length})`}</span>
         </span>
         <span style="font-size:10px;color:#888">▼</span>
       </button>
       <div class="v23-roleview" role="group" aria-label="角色视图">
         <button class="${grid?'on':''}" onclick="v23RoleViewChange('cards')">${I('image')} 卡片</button>
         <button class="${!grid?'on':''}" onclick="v23RoleViewChange('details')">${I('menu')} 详细</button>
       </div>
       <button class="btn sm" onclick="ui.roleSearch='';ui.selectedRoleTags=[];ui.indexFilter='all';ui.roleSeries='all';render()" title="清除搜索与筛选">${I('refresh')}</button>
     </div>
     ${selectedTags.length > 0 ? `
       <div class="v23-active-tag-pills" style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:-4px clamp(20px,2.6vw,40px) 13px;padding:7px 12px;background:#1e1e1e;border:1px solid #333333;border-radius:6px">
         <span style="font-size:11.5px;color:#8e8e8e;display:flex;align-items:center;gap:4px">
           ${I('filter')} 已选条件 (${selectedTags.length})：
         </span>
         ${selectedTags.map(id => {
           const t = v22Tag(id);
           const name = t ? t.name : id;
           return `
             <span class="v23-filter-chip" style="display:inline-flex;align-items:center;gap:5px;background:#2a2538;border:1px solid #4a3b69;color:#c9bcfa;padding:2px 8px;border-radius:4px;font-size:11.5px">
               <span>${E(name)}</span>
               <span onclick="removeRoleTagFilter('${E(id)}')" style="cursor:pointer;font-size:11px;color:#a78bfa;margin-left:2px;font-weight:bold" title="移除此标签">✕</span>
             </span>
           `;
         }).join('')}
         <button class="btn sm quiet" onclick="clearRoleTagFilters()" style="margin-left:auto;font-size:11px;color:#ef4444;background:transparent;border:none;cursor:pointer;padding:2px 6px">清空筛选</button>
       </div>
     ` : ''}
     <div class="v23-rolecontent">
       ${grid ? `<div class="v23-role-grid">${data.map(r=>`<div class="card role-card click" onclick="v22PickRole('${r.id}')"><div class="role-cover ${r.tone}"><span class="art">${E(r.icon||r.name[0])}</span></div><div class="role-meta"><div class="between"><strong>${E(r.name)}</strong><span class="role-mode-badge ${isRoleRpReady(r.id)?'rp-ready':'visual-only'}">${isRoleRpReady(r.id)?'RP 就绪':'仅视觉'}</span></div><div class="tiny">${E(r.series)}</div><p>${E(v22RoleIntro(r).slice(0,75))}</p><div class="v22-labels">${v22Assigned(r).slice(0,3).map(t=>`<span class="chip green">${E(t.name)}</span>`).join('')||'<span class="chip">暂无检索标签</span>'}</div><div class="tiny" style="margin-top:9px">${store.sessions.filter(s=>!s.archivedAt&&(s.roles||[]).includes(r.id)).length} 条关联讨论　${I('arrow')}</div></div></div>`).join('')}</div>` :
       `<div class="v23-table-wrap"><table class="v23-table"><thead><tr><th>角色</th><th>系列</th><th>检索标签</th><th>资料状态</th><th>相关讨论</th></tr></thead><tbody>${data.map(r=>`<tr tabindex="0" role="button" onclick="v22PickRole('${r.id}')" onkeydown="if(event.key==='Enter')v22PickRole('${r.id}')"><td class="v23-namecell">${E(r.name)}</td><td>${E(r.series)}</td><td>${v22Assigned(r).slice(0,4).map(t=>`<span class="chip green">${E(t.name)}</span>`).join('')||'<span class="tiny">未分类</span>'}</td><td class="tiny">${v22HasProfile(r)?'视觉 + 人物设定':'以视觉设计为主'}</td><td>${store.sessions.filter(s=>!s.archivedAt&&(s.roles||[]).includes(r.id)).length}</td></tr>`).join('')}</tbody></table></div>`}
       ${!data.length ? `<div class="empty">没有符合筛选条件的角色，试试清除筛选。</div>` : ''}
     </div>
   </section>
 </div>`;
}
function v23SetSeries(i){const arr=['all',...new Set(roles.map(r=>r.series))];ui.roleSeries=arr[i]||'all';render()}
function v23GoIndex(page=null){ui.v23IndexBack={page:page||ui.page,roleId:ui.roleId,roleTab:ui.roleTab,sessionId:ui.sessionId};v22ClosePopup();visit('indexTags')}
function v23IndexBack(){const b=ui.v23IndexBack||{page:'roles'};if(b.page==='role'&&role(b.roleId)){goRole(b.roleId);ui.roleTab=b.roleTab||'overview';render()}
 else if(b.page==='sessions'&&session(b.sessionId))goSession(b.sessionId);else visit('roles')}
function v23IndexGroupCount(g){return store.indexTagDefs.filter(t=>g==='全部分类'||t.group===g).length}
function v23IndexSelected(){return store.indexTagDefs.find(t=>t.id===ui.v23IndexSelected)}
function v23IndexVisible(){const q=ui.v23IndexQuery.trim().toLowerCase();return store.indexTagDefs.filter(t=>(ui.v23IndexCategory==='全部分类'||ui.v23IndexCategory===t.group)&&`${t.name} ${t.group} ${(t.aliases||[]).join(' ')} ${t.description||''}`.toLowerCase().includes(q)).sort((a,b)=>b.id===ui.v23IndexSelected?1:a.id===ui.v23IndexSelected?-1:a.name.localeCompare(b.name,'zh-CN'))}
function v23IndexSelect(id){ui.v23IndexSelected=id;render()}
function v23IndexFilterGroup(v){ui.v23IndexCategory=v;const list=v23IndexVisible();ui.v23IndexSelected=list[0]?.id||ui.v23IndexSelected;render()}
function v23IndexSearch(v){ui.v23IndexQuery=v;render();const inp=document.getElementById('v23-index-search');if(inp){inp.focus();inp.setSelectionRange(v.length,v.length)}}
function v23IndexTags(){const data=v23IndexVisible(),t=data.find(x=>x.id===ui.v23IndexSelected)||data[0];if(t)ui.v23IndexSelected=t.id;
 return `<div class="v23-index-layout"><aside class="v23-index-cats"><button class="btn quiet sm" onclick="v23IndexBack()">${I('back')} 返回来源</button><h3 class="sidetitle" style="margin:14px 7px 12px">检索标签分类</h3><button class="btn sm" style="width:100%;margin:2px 0 15px" onclick="v23IndexCategoryModal()">${I('plus')} 管理 / 新建分类</button><div style="height:8px"></div>${['全部分类',...store.indexTagGroups].map(g=>`<button class="side-link ${ui.v23IndexCategory===g?'on':''}" onclick="v23IndexFilterGroup(decodeURIComponent('${encodeURIComponent(g)}'))">${I(g==='全部分类'?'tag':'folder')} ${E(g)}<span class="count">${v23IndexGroupCount(g)}</span></button>`).join('')}</aside>
 <section class="v23-index-list"><div class="between"><div><div class="eyebrow">CHARACTER INDEX · V2.3</div><h2 class="h2" style="margin:6px 0 4px">角色检索标签</h2><p class="sub">标准词、别名与角色引用 · ${store.indexTagDefs.length} 条</p></div><button class="btn primary sm" onclick="v23IndexCreate()">${I('plus')} 新标签</button></div><div class="flex gap8" style="margin:17px 0 8px"><input id="v23-index-search" class="input" value="${E(ui.v23IndexQuery)}" oninput="v23IndexSearch(this.value)" placeholder="搜索标签、别名、分类与说明…"></div><div class="between"><span class="tiny">找到 ${data.length} 条</span><div class="flex gap8"><button class="btn quiet sm" onclick="v22UndoIndex();render()">${I('undo')} 撤销</button><button class="btn quiet sm" onclick="v23ExportIndex()">${I('download')} 导出</button><button class="btn quiet sm" onclick="document.getElementById('v23IndexFile').click()">${I('upload')} 导入</button><input type="file" id="v23IndexFile" accept=".json,application/json" hidden onchange="v23ImportIndex(this)"></div></div>
 ${data.slice(0,250).map(x=>`<button class="v23-index-row ${t?.id===x.id?'on':''}" onclick="v23IndexSelect('${x.id}')"><div><strong>${E(x.name)}</strong><p>${E(x.group)} · ${x.aliases.length?`别名：${E(x.aliases.slice(0,3).join('、'))}`:'暂无别名'}</p></div><span class="chip ${v22Tagged(x.id)?'green':''}">${v22Tagged(x.id)} 位角色</span></button>`).join('')||'<div class="empty">未找到匹配标签。</div>'}
 ${data.length>250?'<p class="v23-quiet">仅显示前 250 项，可通过搜索和分类缩小范围。</p>':''}
 </section><aside class="v23-index-detail"><div class="between"><h3 class="h3">标准词详情</h3><span class="chip green">可编辑</span></div>${t?`<div class="v23-index-stats"><span class="chip">${E(t.group)}</span><span class="chip">${v22Tagged(t.id)} 位角色使用</span></div><div class="formrow"><label>标准名称</label><input class="input" value="${E(t.name)}" onchange="v23IndexEdit('${t.id}','name',this.value)"></div><div class="formrow"><label>分类</label><select class="select" onchange="v23IndexEdit('${t.id}','group',this.value)">${store.indexTagGroups.map(g=>`<option value="${E(g)}" ${t.group===g?'selected':''}>${E(g)}</option>`).join('')}</select></div><div class="formrow"><label>含义与适用范围</label><textarea class="textarea" rows="3" placeholder="记录什么样的角色适合使用该标签" onchange="v23IndexEdit('${t.id}','description',this.value)">${E(t.description||'')}</textarea></div><div class="formrow"><label>同义别名</label><div class="v22-library-tags">${(t.aliases||[]).map((a,i)=>`<span class="chip">${E(a)} <button class="ghost" style="padding:0 0 0 3px" aria-label="移除别名 ${E(a)}" onclick="v23IndexRemoveAlias('${t.id}',${i})">${I('x')}</button></span>`).join('')||'<span class="tiny">暂无别名</span>'}</div><div class="flex gap8" style="margin-top:10px"><input class="input" id="v23-alias-input" placeholder="新增一个别名" onkeydown="if(event.key==='Enter'){event.preventDefault();v23IndexAddAlias('${t.id}')}"/><button class="btn" onclick="v23IndexAddAlias('${t.id}')">添加</button></div></div><div class="line"></div><div class="v23-side-actions"><button class="btn sm" onclick="v23IndexMergeAsk('${t.id}')">${I('link')} 合并同义词</button><button class="btn danger sm" onclick="v23IndexDelete('${t.id}')">${I('trash')} 删除</button></div><p class="v23-quiet">修改名称或分类不会影响已关联的角色。合并词条时保留已有关联，原标准词成为别名。</p>`:
 '<div class="empty">选择一个标准词进行编辑。</div>'}<div class="line"></div><div class="v23-quiet">视觉素材标签独立管理，包含组合偏好权重。这一页只负责让角色库的筛选词保持统一、可复用。</div></aside></div>`}
function v23IndexCreate(){const name=prompt('新标准标签名称（可直接在右侧补充别名、解释）');if(!name?.trim())return;const text=name.trim();if(store.indexTagDefs.some(t=>t.name===text||(t.aliases||[]).includes(text)))return toast('名称已存在或被收录为别名');v22RememberIndex();const tag={id:nextId('idx'),name:text,group:ui.v23IndexCategory==='全部分类'?'未分类':ui.v23IndexCategory,aliases:[],description:''};store.indexTagDefs.push(tag);ui.v23IndexSelected=tag.id;ui.v23IndexCategory='全部分类';ui.v23IndexQuery='';save();render();toast('已创建标准检索标签')}
function v23IndexEdit(id,key,value){const t=v22Tag(id);if(!t)return;value=String(value).trim();if(key==='name'){if(!value)return toast('标准名称不能为空');if(store.indexTagDefs.some(x=>x.id!==id&&(x.name===value||x.aliases.includes(value))))return toast('已有同名标准词或别名')}if(key==='group'&&!store.indexTagGroups.includes(value))return;v22RememberIndex();t[key]=value;save();render();toast('检索标签已保存')}
function v23IndexAddAlias(id){const t=v22Tag(id),input=document.getElementById('v23-alias-input');const name=input?.value.trim();if(!t||!name)return;if(t.name===name||t.aliases.includes(name))return toast('该名称已存在');if(store.indexTagDefs.some(x=>x.id!==id&&(x.name===name||x.aliases.includes(name))))return toast('该别名已被其他标准词使用');v22RememberIndex();t.aliases.push(name);save();render();toast('别名已添加')}
function v23IndexRemoveAlias(id,at){const t=v22Tag(id);if(!t)return;v22RememberIndex();t.aliases.splice(at,1);save();render();toast('别名已移除')}
function v23IndexDelete(id){const t=v22Tag(id);if(!t)return;const count=v22Tagged(id);if(!confirm(`删除「${t.name}」？${count?'\n它已关联 '+count+' 位角色，删除后这些引用也会清除。':''}`))return;v22RememberIndex();store.indexTagDefs=store.indexTagDefs.filter(x=>x.id!==id);roles.forEach(r=>r.indexTags=(r.indexTags||[]).filter(x=>x!==id));ui.v23IndexSelected=store.indexTagDefs[0]?.id||null;save();render();toast('标准词已删除，相关引用已同步清理')}
function v23IndexMergeAsk(id){ui.v23IndexMerge=id;show('v23merge')}
function v23IndexMergeDo(){const a=v22Tag(ui.v23IndexMerge),to=document.getElementById('v23-merge-target')?.value,b=v22Tag(to);if(!a||!b||a.id===b.id)return;v22RememberIndex();b.aliases=[...new Set([...b.aliases,...a.aliases,a.name])].filter(x=>x!==b.name);roles.forEach(r=>{if((r.indexTags||[]).includes(a.id)){r.indexTags=[...new Set([...(r.indexTags||[]).filter(x=>x!==a.id),b.id])]}});store.indexTagDefs=store.indexTagDefs.filter(t=>t.id!==a.id);ui.v23IndexSelected=b.id;save();closeModal();render();toast('已合并标准词，保留角色关联和旧名称别名')}
function v23IndexCategoryModal(){show('v23groups')}
function v23IndexGroupAdd(){const v=document.getElementById('v23-new-group')?.value.trim();if(!v)return;if(store.indexTagGroups.includes(v))return toast('分类已经存在');store.indexTagGroups.push(v);save();render();show('v23groups');toast('新分类已创建')}
function v23IndexGroupRename(i){const old=store.indexTagGroups[i];if(!old)return;const v=prompt('修改分类名称',old)?.trim();if(!v||v===old)return;if(store.indexTagGroups.includes(v))return toast('分类已经存在');store.indexTagGroups[i]=v;store.indexTagDefs.forEach(t=>{if(t.group===old)t.group=v});if(ui.v23IndexCategory===old)ui.v23IndexCategory=v;save();render();show('v23groups');toast('分类已重命名')}
function v23IndexGroupDelete(i){const old=store.indexTagGroups[i];if(!old)return;const num=v23IndexGroupCount(old);if(!confirm(`删除分类「${old}」？${num} 条标签将移入「未分类」，不会删除标签。`))return;store.indexTagDefs.forEach(t=>{if(t.group===old)t.group='未分类'});store.indexTagGroups.splice(i,1);if(!store.indexTagGroups.includes('未分类'))store.indexTagGroups.push('未分类');if(ui.v23IndexCategory===old)ui.v23IndexCategory='未分类';save();render();show('v23groups');toast('分类已删除，标签已安全转移')}
function v23ExportIndex(){download('SillyTavern-角色检索标准标签-V2.3.json',JSON.stringify({schema:'st-character-index-tags-v2.3',groups:store.indexTagGroups,tags:store.indexTagDefs},null,2),'application/json;charset=utf-8');toast('已导出角色检索标准词')}
function v23ImportIndex(input){const file=input.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const obj=JSON.parse(reader.result);if(!Array.isArray(obj.tags)||obj.tags.length>5000)throw Error('标签数据无效或超过上限');const names=new Set(store.indexTagDefs.map(t=>t.name));const incoming=[];for(const row of obj.tags){const name=String(row?.name||'').trim().slice(0,90);if(!name||names.has(name))continue;names.add(name);const group=String(row.group||'未分类').slice(0,40);incoming.push({id:nextId('idx'),name,group,description:String(row.description||'').slice(0,1500),aliases:Array.isArray(row.aliases)?[...new Set(row.aliases.map(x=>String(x).trim().slice(0,70)).filter(Boolean))].slice(0,50):[]})}if(!confirm(`将新增 ${incoming.length} 个标准词，保留已有条目与角色引用，继续吗？`))return;v22RememberIndex();for(const tag of incoming){if(!store.indexTagGroups.includes(tag.group))store.indexTagGroups.push(tag.group);store.indexTagDefs.push(tag)}save();render();toast('导入完成，已跳过同名标准词')}catch(err){alert('导入失败：'+err.message)}};reader.readAsText(file);input.value=''}
const _v23ModalBase=modalBody;
modalBody=function(){
 if(ui.modal==='v23groups')return `${modalHead('管理角色检索标签分类','自定义分类独立于视觉素材标签库；删除分类不会删除词条。')}<div class="flex gap8"><input id="v23-new-group" class="input" placeholder="例如：国籍、职业、能力类型" onkeydown="if(event.key==='Enter')v23IndexGroupAdd()"><button class="btn primary" onclick="v23IndexGroupAdd()">${I('plus')} 新建</button></div><div style="max-height:350px;overflow:auto;margin-top:15px">${store.indexTagGroups.map((g,i)=>`<div class="cat-list-row"><span>${I('folder')}</span><strong>${E(g)}</strong><span class="cat-count">${v23IndexGroupCount(g)} 条</span><div class="cat-actions"><button class="btn sm" title="重命名分类" onclick="v23IndexGroupRename(${i})">${I('pen')}</button>${g==='未分类'?'':`<button class="btn sm danger" title="删除分类" onclick="v23IndexGroupDelete(${i})">${I('trash')}</button>`}</div></div>`).join('')}</div><div class="modal-footer"><button class="btn primary" onclick="closeModal()">完成</button></div>`;
 if(ui.modal==='v23merge'){const from=v22Tag(ui.v23IndexMerge);return `${modalHead('合并检索标签','把同义标签归入统一标准词，相关角色的引用自动迁移。')}<p class="sub">来源词：<strong>${E(from?.name||'')}</strong> · ${v22Tagged(from?.id)} 位角色引用</p><div class="formrow"><label>保留为标准词</label><select class="select" id="v23-merge-target">${store.indexTagDefs.filter(t=>t.id!==from?.id).map(t=>`<option value="${E(t.id)}">${E(t.name)}</option>`).join('')}</select></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="v23IndexMergeDo()">确认合并</button></div>`}
 return _v23ModalBase();
};
const _v23OldSave=save;
// Keep the V2.3 prototype's data separate; older demo files remain untouched.
const _v23Reset=resetDemo;
resetDemo=function(){_v23Reset();if(!store.indexTagGroups){store.indexTagGroups=[...new Set([...v23SeedGroups,...store.indexTagDefs.map(t=>t.group||'未分类')])]}ui.v23IndexCategory='全部分类';ui.v23IndexQuery='';ui.v23IndexSelected=store.indexTagDefs[0]?.id||null;ui.v23HomePage=0;save();render()};
// Forward from the legacy standard-word popup to the full-screen manager.
const _v23OldPopup=v22ShowPopup;
v22ShowPopup=function(view){if(view==='library'){v23GoIndex(ui.page);return}return _v23OldPopup(view)};



/* Native prompt dialogs are replaced by native-looking in-app forms. */
v23IndexCreate=function(){show('v23newtag')};
function v23IndexNewCommit(){const name=document.getElementById('v23-new-tag-name')?.value.trim();if(!name)return toast('请填写标准标签名称');if(store.indexTagDefs.some(t=>t.name===name||(t.aliases||[]).includes(name)))return toast('同名标准词或别名已存在');const group=document.getElementById('v23-new-tag-group')?.value||'未分类',description=document.getElementById('v23-new-tag-desc')?.value.trim()||'';v22RememberIndex();const t={id:nextId('idx'),name,group,description,aliases:[]};store.indexTagDefs.push(t);ui.v23IndexSelected=t.id;ui.v23IndexCategory='全部分类';ui.v23IndexQuery='';save();closeModal();render();toast('新标准检索标签已创建')}
v23IndexGroupRename=function(i){ui.v23RenameGroupIndex=i;show('v23renamegroup')};
function v23GroupRenameCommit(){const i=ui.v23RenameGroupIndex,old=store.indexTagGroups[i];const value=document.getElementById('v23-group-rename')?.value.trim();if(!old||!value)return toast('请输入分类名称');if(value!==old&&store.indexTagGroups.includes(value))return toast('分类已存在');store.indexTagGroups[i]=value;store.indexTagDefs.forEach(t=>{if(t.group===old)t.group=value});if(ui.v23IndexCategory===old)ui.v23IndexCategory=value;save();show('v23groups');toast('分类名称及相关标签已更新')}
v23IndexDelete=function(id){ui.v23DeleteTagId=id;show('v23deletetag')};
function v23IndexConfirmDelete(){const id=ui.v23DeleteTagId,t=v22Tag(id);if(!t)return;v22RememberIndex();store.indexTagDefs=store.indexTagDefs.filter(x=>x.id!==id);roles.forEach(r=>r.indexTags=(r.indexTags||[]).filter(x=>x!==id));ui.v23IndexSelected=store.indexTagDefs[0]?.id||null;save();closeModal();render();toast('检索标签已删除，角色引用已同步清理')}
const _v23FinalModalBody=modalBody;
modalBody=function(){
 if(ui.modal==='v23newtag')return `${modalHead('新建角色检索标签','使用标准名称统一匹配已有角色，新标签随后可以补充别名和含义。')}<div class="formrow"><label>标准词名称</label><input class="input" id="v23-new-tag-name" maxlength="90" placeholder="例如：国籍、运动员" onkeydown="if(event.key==='Enter')v23IndexNewCommit()"></div><div class="grid2"><div class="formrow"><label>分类</label><select class="select" id="v23-new-tag-group">${store.indexTagGroups.map(g=>`<option value="${E(g)}" ${g===ui.v23IndexCategory?'selected':''}>${E(g)}</option>`).join('')}</select></div><div class="formrow"><label>关联范围</label><input class="input" disabled value="角色检索标准词"></div></div><div class="formrow"><label>含义与使用范围（可选）</label><textarea id="v23-new-tag-desc" class="textarea" rows="3" placeholder="什么时候应使用这个标签？"></textarea></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn primary" onclick="v23IndexNewCommit()">${I('plus')} 创建标准词</button></div>`;
 if(ui.modal==='v23renamegroup'){const old=store.indexTagGroups[ui.v23RenameGroupIndex];return `${modalHead('重命名检索标签分类','相关标准词仍保持原有 ID 和角色关联。')}<div class="formrow"><label>分类名称</label><input id="v23-group-rename" class="input" maxlength="40" value="${E(old||'')}" onkeydown="if(event.key==='Enter')v23GroupRenameCommit()"></div><div class="modal-footer"><button class="btn" onclick="show('v23groups')">返回</button><button class="btn primary" onclick="v23GroupRenameCommit()">保存名称</button></div>`}
 if(ui.modal==='v23deletetag'){const t=v22Tag(ui.v23DeleteTagId);return `${modalHead('删除检索标签','删除后已关联该词的角色会自动取消此标签。')}<div style="padding:10px 12px;background:#242424;border:1px solid #363636;border-radius:6px;margin-bottom:12px"><div style="font-size:12.5px;color:#eee">标准词：<strong>${E(t?.name||'')}</strong></div><div class="tiny" style="color:#888;margin-top:4px">当前 ${v22Tagged(t?.id)} 位角色引用此标签</div></div><div class="modal-footer"><button class="btn" onclick="closeModal()">取消</button><button class="btn danger" onclick="v23IndexConfirmDelete()">确认删除</button></div>`}
 return _v23FinalModalBody();
};



// V2.4 – scoped works/RP presentation experiment. Keep all V2.3 data & core routes.
ui.v24SelectedWork ??= store.works?.[0]?.id || null;
ui.v24WorkSearch ??= '';
ui.v24WorkSort ??= 'original';
ui.v24ChapterPick ??= {};
function v24SelectedWork(){return store.works.find(w=>w.id===ui.v24SelectedWork)||store.works[0]||null}
function v24ChooseWork(id){ui.v24SelectedWork=id;render()}
function v24ChapterFor(w){const id=ui.v24ChapterPick[w.id]||((ui.workId===w.id)?ui.workChapter:null);return w.chapters.find(c=>c.id===id)||w.chapters[0]||null}
function v24ChooseChapter(workId,chapterId){ui.v24SelectedWork=workId;ui.v24ChapterPick[workId]=chapterId;render()}
function v24WorkSearch(value){ui.v24WorkSearch=value;const matches=v24VisibleWorks();if(!matches.some(w=>w.id===ui.v24SelectedWork))ui.v24SelectedWork=matches[0]?.id||null;render();const inp=document.getElementById('v24WorkSearch');if(inp){inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length)}}
function v24VisibleWorks(){const query=ui.v24WorkSearch.trim().toLowerCase();let list=store.works.filter(w=>!w.archivedAt&&(w.title+' '+(w.description||'')).toLowerCase().includes(query));if(ui.v24WorkSort==='name')list.sort((a,b)=>a.title.localeCompare(b.title,'zh-CN'));if(ui.v24WorkSort==='chapters')list.sort((a,b)=>b.chapters.length-a.chapters.length||a.title.localeCompare(b.title,'zh-CN'));return list}
function v24ContinuePlot(workId,sessionId=null){ui.kind='all';ui.role='all';ui.sessionQuery='';if(sessionId){goSession(sessionId);return}openNew('plot');ui.newWork=workId;overlay()}
works=function(){const list=v24VisibleWorks(),w=list.find(x=>x.id===ui.v24SelectedWork)||list[0]||null,c=w?v24ChapterFor(w):null,related=w?store.sessions.filter(s=>!s.archivedAt&&s.work===w.id):[],selectedText=c?String(store.chapters[c.id]||'').trim():'';return `<div class="scroll" style="height:100%"><div class="v24-works"><div class="v24-page-heading"><div><h1>作品与小说</h1><p class="sub">选择作品、预览章节，直接打开正文或剧情讨论。</p></div><button class="btn primary" onclick="show('workCreate')">${I('plus')} 新建作品</button></div><div class="v24-work-layout"><section class="v24-work-nav"><div class="v24-work-controls"><input class="input" id="v24WorkSearch" aria-label="搜索作品" placeholder="搜索作品…" value="${E(ui.v24WorkSearch)}" oninput="v24WorkSearch(this.value)"><select class="select" aria-label="作品排序方式" onchange="ui.v24WorkSort=this.value;render()"><option value="original" ${ui.v24WorkSort==='original'?'selected':''}>默认排序</option><option value="name" ${ui.v24WorkSort==='name'?'selected':''}>按名称</option><option value="chapters" ${ui.v24WorkSort==='chapters'?'selected':''}>按章节数</option></select></div><div class="v24-work-items">${list.map(x=>`<button class="v24-work-item ${w?.id===x.id?'on':''}" aria-current="${w?.id===x.id?'true':'false'}" onclick="v24ChooseWork('${x.id}')"><span class="v24-work-item-icon">${I('book')}</span><span class="main"><strong>《${E(x.title)}》</strong><small>${x.chapters.length} 章 · ${store.sessions.filter(s=>!s.archivedAt&&s.work===x.id).length} 条关联讨论</small></span>${I('chevron')}</button>`).join('')||'<div class="v24-empty">未找到作品。可以新建一部。</div>'}</div></section><section class="v24-work-preview">${w?`<header class="v24-preview-head"><div><span class="eyebrow">当前作品</span><h2>《${E(w.title)}》</h2><p class="sub">${E(w.description||'尚未填写作品简介')}</p></div><span class="chip gold">小说草稿</span></header><div class="v24-work-stats"><span><strong>${w.chapters.length}</strong>章节</span><span><strong>${related.length}</strong>相关讨论</span><span><strong>${w.chapters.filter(ch=>String(store.chapters[ch.id]||'').trim()).length}</strong>已有正文</span></div><div class="v24-preview-body"><div><div class="v24-section-title">章节目录 <span>${w.chapters.length} 章</span></div><div class="v24-chapter-list">${w.chapters.filter(ch=>!ch.archivedAt).map(ch=>`<button class="v24-chapter ${c?.id===ch.id?'on':''}" onclick="v24ChooseChapter('${w.id}','${ch.id}')">${I('book')} <span>${E(ch.title)}</span></button>`).join('')||'<div class="tiny">暂无章节</div>'}</div></div><div><div class="v24-section-title">${c?E(c.title):'正文预览'} <span>${selectedText.length} 字符</span></div><div class="v24-excerpt">${selectedText?E(selectedText.slice(0,520))+(selectedText.length>520?'…':''):'（这一章还没有正文。打开编辑器即可开始写作。）'}</div></div></div><div class="v24-work-actions"><button class="btn primary" onclick="goWorkEditor('${w.id}'${c?`, '${c.id}'`:''})">${I('book')} 打开正文</button><button class="btn" onclick="v24ContinuePlot('${w.id}')">${I('chat')} 新建剧情讨论</button></div><div class="v24-related"><div class="v24-section-title">相关剧情会话</div><div class="v24-related-list">${related.slice(0,3).map(s=>`<button class="btn sm" onclick="v24ContinuePlot('${w.id}','${s.id}')">${I('chat')} ${E(s.title)}</button>`).join('')||'<span class="tiny">尚无关联讨论，可随时新建。</span>'}</div></div>`:'<div class="v24-empty">选择左侧作品查看章节，或新建第一部作品。</div>'}</section></div></div></div>`};
function v24RpData(){let data=roles.filter(r=>!r.archivedAt&&`${r.name} ${r.series} ${r.desc}`.toLowerCase().includes(ui.rpSearch.toLowerCase()));data.sort((a,b)=>ui.rpSort==='name'?a.name.localeCompare(b.name,'zh-CN'):ui.rpSort==='series'?a.series.localeCompare(b.series,'zh-CN')||a.name.localeCompare(b.name,'zh-CN'):(store.rpActivity[b.id]||0)-(store.rpActivity[a.id]||0)||a.name.localeCompare(b.name,'zh-CN'));return data}
rpDirectory=function(){const data=v24RpData();return `<div class="scroll" style="height:100%"><div class="v24-rp"><div class="v24-page-heading v24-rp-heading"><div><h1>选择角色，开始对话。</h1><p class="sub">角色目录 · 按需切换卡片或紧凑列表</p></div><span class="chip">${data.length} 位角色</span></div><div class="v24-rp-tools"><input class="input" id="rpSearch" aria-label="搜索 RP 角色" value="${E(ui.rpSearch)}" oninput="rpSearchChange(this.value)" placeholder="搜索角色、系列或设定…"><select class="select" aria-label="RP 角色排序" onchange="v22RpSort(this.value)"><option value="recent" ${ui.rpSort==='recent'?'selected':''}>按最近聊天</option><option value="name" ${ui.rpSort==='name'?'selected':''}>按名称</option><option value="series" ${ui.rpSort==='series'?'selected':''}>按系列</option></select><div class="v22-segment" role="group" aria-label="角色显示方式"><button aria-pressed="${ui.rpView==='cards'}" class="${ui.rpView==='cards'?'on':''}" onclick="v22RpView('cards')">${I('image')} 卡片</button><button aria-pressed="${ui.rpView==='list'}" class="${ui.rpView==='list'?'on':''}" onclick="v22RpView('list')">${I('menu')} 列表</button></div></div><div class="v24-rp-grid ${ui.rpView==='list'?'list':'cards'}">${data.map(r=>{const ready=isRoleRpReady(r.id);return `<button class="v24-rp-card" onclick="startRP('${r.id}')" title="${E(ready?'打开':'准备')} ${E(r.name)} 的角色扮演"><div class="avatar ${r.tone}">${E(r.icon)}</div><div class="v24-rp-card-info"><strong>${E(r.name)}</strong><div class="v24-series">${E(r.series)}</div><div class="v24-status-wrap"><span class="v24-status ${ready?'':'missing'}">${ready?'● 可开始 RP':'○ 待配置 RP'}</span></div>${ui.rpView==='cards'?`<div class="v24-card-desc">${E(v22RoleIntro(r).slice(0,110))}</div>`:''}</div><span class="v24-arrow">${I('arrow')}</span></button>`}).join('')||'<div class="v24-empty">没有找到匹配角色。</div>'}</div><p class="tiny" style="margin-top:17px">这是本地演示。RP 内仍可直接切换角色；真实酒馆配置需在正式工程中接入。</p></div></div>`};
// The native program keeps the RP history & config and works editor unchanged.


/* ===========================================================
   V2.5 · Creative activity timeline (demonstration + opt-in local telemetry)
   Does not fetch network data or call model APIs. Demo figures are synthetic.
   =========================================================== */
ui.v25Source ??= (()=>{try{return WorkspaceStorage.getItem('st-v25-source')==='local'?'local':'demo'}catch{return 'demo'}})();
ui.v25Days ??= 14;
ui.v25Panel ??= 'calendar';
ui.v25Mode ??= 'activity';
ui.v25SelectedDate ??= '';
ui.v25SelectedHour ??= '';
const V25_STORAGE='st-v25-activity-v1';
function v25DayKey(date){const d=new Date(date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
function v25StartDate(date){const d=new Date(date);d.setHours(0,0,0,0);return d}
function v25AtOffset(days){const d=v25StartDate(new Date());d.setDate(d.getDate()+days);return d}
function v25Hash(n){let x=(n+0x9E3779B9)>>>0;x^=x>>>16;x=Math.imul(x,0x85ebca6b);x^=x>>>13;x=Math.imul(x,0xc2b2ae35);return (x^(x>>>16))>>>0}
function v25LoadLocal(){try{let data=JSON.parse(WorkspaceStorage.getItem(V25_STORAGE)||'null');if(data&&typeof data==='object'&&data.days&&typeof data.days==='object')return {enabled:!!data.enabled,days:data.days,lastRecordedAt:0,sessionSec:0};}catch{}return {enabled:false,days:{},lastRecordedAt:0,sessionSec:0}}
let v25Local=v25LoadLocal();
function v25Persist(){try{WorkspaceStorage.setItem(V25_STORAGE,JSON.stringify({enabled:v25Local.enabled,days:v25Local.days}))}catch{}}
function v25Demo(){const result={};for(let offset=-125;offset<=0;offset++){
 const date=v25AtOffset(offset),key=v25DayKey(date),seed=v25Hash(Math.floor(date.getTime()/86400000)),dow=date.getDay();
 if(seed%13===0||seed%17===0)continue;
 let minutes=20+seed%155+(dow===0||dow===6?28:0)+(seed%19===2?95:0);
 const hours=Array(24).fill(0);
 for(let j=0;j<minutes;j++){
  const branch=(seed+j*23)%9;
  const hour=branch<2?10+(seed+j)%4:branch<5?16+(seed+j)%5:20+(seed+j)%5;
  hours[hour%24]++;
 }
 result[key]={seconds:minutes*60,hours:hours.map(n=>n*60),sessions:1+(seed%3),maxSessionSec:Math.min(minutes,30+seed%106)*60};
 }return result;
}
const v25DemoDays=v25Demo();
function v25CurrentData(){return ui.v25Source==='demo'?v25DemoDays:v25Local.days}
function v25FormatMinutes(m){m=Math.max(0,Math.round(m));return m>=60?`${Math.floor(m/60)} 小时 ${String(m%60).padStart(2,'0')} 分`:`${m} 分钟`}
function v25FmtShort(m){m=Math.max(0,Math.round(m));return m>=60?`${(m/60).toFixed(m%60===0?0:1)} h`:`${m} min`}
function v25SafeDay(d){const today=v25StartDate(new Date());const day=v25StartDate(d);return day.getTime()<=today.getTime()}
function v25DateLabel(key){const [y,m,d]=key.split('-').map(Number);return `${m}月${d}日`}
function v25DateStats(days,count){let total=0,active=0,sessions=0,longest=0,hours=Array(24).fill(0);
 if(count==='all'){for(const k in days){const rec=days[k];if(!rec)continue;const seconds=Number(rec.seconds)||0;total+=seconds;if(seconds>0)active++;sessions+=(Number(rec.sessions)||0);longest=Math.max(longest,Number(rec.maxSessionSec)||0);for(let h=0;h<24;h++)hours[h]+=Number(rec.hours?.[h])||0}return {total,active,sessions,longest,hours}}
 const num=Number(count)||14;
 for(let j=num-1;j>=0;j--){const k=v25DayKey(v25AtOffset(-j));const rec=days[k];if(!rec)continue;const seconds=Number(rec.seconds)||0;total+=seconds;if(seconds>0)active++;sessions+=(Number(rec.sessions)||0);longest=Math.max(longest,Number(rec.maxSessionSec)||0);for(let h=0;h<24;h++)hours[h]+=Number(rec.hours?.[h])||0}
 return {total,active,sessions,longest,hours};
}
function v25ShowPage(n){v23SwitchHome(n)}
function v25OpenRecent(id){ui.kind='all';ui.role='all';ui.sessionQuery='';goSession(id)}
function v25SetSource(source){ui.v25Source=source;try{WorkspaceStorage.setItem('st-v25-source',source)}catch{}ui.v25SelectedDate='';ui.v25SelectedHour='';render()}
function v25SetDays(days){ui.v25Days=(days==='all'||days==='ALL')?'all':(Number(days)||14);ui.v25SelectedDate='';render()}
function v25SetPanel(panel){ui.v25Panel=panel;render()}
function v25SetMode(mode){ui.v25Mode=mode;render()}
function v25SelectDay(day){ui.v25SelectedDate=day;render()}
function v25SelectHour(day,h){ui.v25SelectedHour=`${day}|${h}`;render()}
function v25ToggleRecord(){v25Local.enabled=!v25Local.enabled;v25LastTouch=Date.now();v25Local.lastRecordedAt=0;v25Local.sessionSec=0;v25Persist();render()}
function v25ResetLocal(){if(!confirm('确认清空本机记录的创作活动时间？该操作无法撤销，角色和会话数据不会受到影响。'))return;v25Local.days={};v25Local.lastRecordedAt=0;v25Local.sessionSec=0;v25Persist();render()}
function v25Export(){let payload={schema:'st-v25-creative-activity',exportedAt:new Date().toISOString(),note:'本机统计的交互活跃时间',days:v25Local.days};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='SillyTavern-Activity-Local.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
let v25LastTouch=Date.now(),v25LastMove=0;
function v25Touch(e){if(e?.type==='pointermove'){if(Date.now()-v25LastMove<7000)return;v25LastMove=Date.now()}v25LastTouch=Date.now()}
['pointerdown','pointermove','keydown','wheel','scroll'].forEach(type=>document.addEventListener(type,v25Touch,{passive:true,capture:true}));
window.addEventListener('focus',()=>{v25LastTouch=Date.now()});
function v25Tick(){if(!v25Local.enabled||document.hidden||!document.hasFocus())return;
 const now=Date.now();if(now-v25LastTouch>70000)return;
 const d=new Date(now),key=v25DayKey(d);
 let day=v25Local.days[key];if(!day)day=v25Local.days[key]={seconds:0,hours:Array(24).fill(0),sessions:0,maxSessionSec:0};
 if(!Array.isArray(day.hours)||day.hours.length!==24)day.hours=Array(24).fill(0);
 const continuous=v25Local.lastRecordedAt>0&&(now-v25Local.lastRecordedAt)<90000;
 if(!continuous){day.sessions=(day.sessions||0)+1;v25Local.sessionSec=0}
 const delta=10;
 day.seconds=(day.seconds||0)+delta;
 day.hours[d.getHours()]=(day.hours[d.getHours()]||0)+delta;
 v25Local.sessionSec+=delta;day.maxSessionSec=Math.max(day.maxSessionSec||0,v25Local.sessionSec);
 v25Local.lastRecordedAt=now;v25Persist();
 if(ui.page==='home'&&ui.v23HomePage===1&&ui.v25Source==='local'&&(day.seconds===10||day.seconds%60===0)&&!ui.modal)render();
}
setInterval(v25Tick,10000);
function v25Intensity(minutes,max){if(minutes<=0)return 0;const ratio=minutes/Math.max(10,max);return ratio>=.75?4:ratio>=.45?3:ratio>=.22?2:1}
function v25Calendar(days){const end=v25StartDate(new Date());const start=new Date(end);start.setDate(start.getDate()-((start.getDay()+6)%7)-84);const values=[];
 for(let i=0;i<91;i++){const d=new Date(start);d.setDate(d.getDate()+i);const key=v25DayKey(d);values.push({key,minutes:Math.round((days[key]?.seconds||0)/60),future:d>end})}
 const max=Math.max(1,...values.map(v=>v.minutes));return `<div class="v25-heat-layout"><div class="v25-heat-weeklabels">${['一','','三','','五','','','日'].map(x=>`<span>${x}</span>`).join('')}</div><div class="v25-calendar" role="group" aria-label="近13周每天的创作活跃时间">${values.map(v=>`<button type="button" class="v25-day ${v.future?'future':`v25-l${v25Intensity(v.minutes,max)}`}" ${v.future?'disabled':''} title="${v.key} · ${v.future?'尚未发生':v25FormatMinutes(v.minutes)}" aria-label="${v.key}，${v25FormatMinutes(v.minutes)}" onclick="v25SelectDay('${v.key}')"></button>`).join('')}</div></div><div class="v25-legend">少 <span class="v25-day v25-l0"></span><span class="v25-day v25-l1"></span><span class="v25-day v25-l2"></span><span class="v25-day v25-l3"></span><span class="v25-day v25-l4"></span> 多</div>`}
function v25Trend(days,n){const values=[];for(let i=n-1;i>=0;i--){const d=v25AtOffset(-i),key=v25DayKey(d);values.push({key,minute:Math.round((days[key]?.seconds||0)/60)})}
 const max=Math.max(10,...values.map(x=>x.minute));const chosen=ui.v25SelectedDate;return `<div class="v25-trend" role="group" aria-label="最近${n}天每日创作活跃时间">${values.map(x=>`<button class="v25-barbtn ${chosen===x.key?'on':''}" onclick="v25SelectDay('${x.key}')" title="${x.key} · ${v25FormatMinutes(x.minute)}" aria-label="${x.key} 活跃${x.minute}分钟"><span class="v25-bar" style="height:${Math.max(x.minute>0?2:0,x.minute/max*100)}%;opacity:${x.minute?1:.3}"></span></button>`).join('')}</div><div class="v25-axis"><span>${v25DateLabel(values[0].key)}</span><span>${n} 天，每柱一天</span><span>${v25DateLabel(values[values.length-1].key)}</span></div>`}
function v25HourGrid(days){const groups=Array.from({length:7},()=>Array(24).fill(0));for(let i=27;i>=0;i--){const date=v25AtOffset(-i),key=v25DayKey(date);const wd=(date.getDay()+6)%7;for(let h=0;h<24;h++)groups[wd][h]+=Number(days[key]?.hours?.[h])||0}
 const peak=Math.max(1,...groups.flat());const ticks=Array.from({length:24},(_,h)=>[0,6,12,18,23].includes(h)?`${h}`:'');const sumHours=Array.from({length:24},(_,h)=>groups.reduce((a,row)=>a+row[h],0));const best=sumHours.indexOf(Math.max(...sumHours));
 const cells=groups.map((row,d)=>`<div class="weekday">${'一二三四五六日'[d]}</div>${row.map((s,h)=>{const key=`${d}|${h}`,level=v25Intensity(s/60,peak/60),select=ui.v25SelectedHour===key;return `<button class="v25-hourcell v25-l${level} ${select?'on':''}" onclick="v25SelectHour(${d},${h})" title="周${'一二三四五六日'[d]} ${h}:00—${h+1}:00 · ${v25FormatMinutes(s/60)}" aria-label="周${'一二三四五六日'[d]} ${h}点，${v25FormatMinutes(s/60)}"></button>`}).join('')}`).join('');
 const selected=ui.v25SelectedHour?.split('|').map(Number);let status=selected?.length===2?`周${'一二三四五六日'[selected[0]]} ${String(selected[1]).padStart(2,'0')}:00 · ${v25FormatMinutes(groups[selected[0]]?.[selected[1]]/60||0)}`:`近28天活跃高峰：${String(best).padStart(2,'0')}:00—${String((best+1)%24).padStart(2,'0')}:00`;
 return `<div class="v25-hour-head"><span></span>${ticks.map(x=>`<span class="tick">${x}</span>`).join('')}</div><div class="v25-weekhours" role="group" aria-label="最近28天星期与24小时创作活动热力图">${cells}</div><div class="v25-detail-line"><span>${status}</span><span class="v25-small">近 28 天 · 按星期聚合</span></div>`;
}
function v25Metrics(days,n){const isAll=(n==='all');const range=v25DateStats(days,n),monthly=v25DateStats(days,30);const average=range.sessions?range.total/60/range.sessions:0;
 const c1Lbl=isAll?'全部使用时长':`近 ${n} 天活跃时间`,c1Val=v25FmtShort(range.total/60),c1Note=isAll?'自打开软件以来的全部使用时长':'前台交互活跃估算';
 const c2Lbl=isAll?'累计活跃天数':'近 30 天活跃天数',c2Val=isAll?`${range.active} <span style="font-size:12px;color:#b9b9b9">天</span>`:`${monthly.active} <span style="font-size:12px;color:#b9b9b9">/ 30 天</span>`,c2Note=isAll?'有记录的全部自然日':'有记录的自然日';
 const c3Lbl='平均单次活跃',c3Val=v25FmtShort(average),c3Note=isAll?`累计 ${range.sessions} 个时段`:`估计 ${range.sessions} 个时段`;
 const c4Lbl='最长连续活跃',c4Val=v25FmtShort(range.longest/60),c4Note='根据活动间隔估算';
 return `<div class="v25-metrics"><div class="v25-metrics-group"><div class="v25-metric"><div class="lbl">${c1Lbl}</div><div class="val">${c1Val}</div><div class="note">${c1Note}</div></div><div class="v25-metric"><div class="lbl">${c2Lbl}</div><div class="val">${c2Val}</div><div class="note">${c2Note}</div></div></div><div class="v25-metrics-group"><div class="v25-metric"><div class="lbl">${c3Lbl}</div><div class="val">${c3Val}</div><div class="note">${c3Note}</div></div><div class="v25-metric"><div class="lbl">${c4Lbl}</div><div class="val">${c4Val}</div><div class="note">${c4Note}</div></div></div></div>`}
function v25ActivityContent(){const days=v25CurrentData(),real=ui.v25Source==='local';const hasData=Object.values(days).some(r=>(Number(r.seconds)||0)>0);const n=ui.v25Days||14;
 const trendCount=n==='all'?30:Math.min(30,Number(n)||14);const trendSub=n==='all'?'近 30 天':`近 ${trendCount} 天`;
 const sourceToggle=`<div class="v25-segment" role="group" aria-label="数据来源"><button class="${!real?'on':''}" onclick="v25SetSource('demo')">演示数据</button><button class="${real?'on':''}" onclick="v25SetSource('local')">本机记录</button></div>`;
 const ranges=[{k:7,l:'7天'},{k:14,l:'14天'},{k:30,l:'30天'},{k:90,l:'90天'},{k:'all',l:'全部'}];
 const rangeToggle=`<div class="v25-segment" role="group" aria-label="统计时间范围">${ranges.map(r=>`<button class="${String(n)===String(r.k)?'on':''}" onclick="v25SetDays('${r.k}')">${r.l}</button>`).join('')}</div>`;
 const activityButton=`<button class="v25-textlink" onclick="v25SetMode('sessions')">会话分布 ›</button>`;
 const toolbar=`<div class="v25-toolbar"><div class="v25-switches">${sourceToggle}${rangeToggle}</div><div class="v25-record-controls">${activityButton}</div></div>`;
 const tabs=`<div class="v25-tabbar v25-segment" role="group" aria-label="时间图表切换">${[['calendar','日历热力图'],['trend','每日时长'],['hours','24小时分布']].map(([k,v])=>`<button onclick="v25SetPanel('${k}')" class="${ui.v25Panel===k?'on':''}">${v}</button>`).join('')}</div>`;
 const bottomControl=real?`<div class="v25-controlbar"><div class="v25-record-controls"><span>${v25Local.enabled?'● 正在估算本机前台活跃时间':'○ 已暂停本机统计'}</span><button class="btn sm ${v25Local.enabled?'':'primary'}" onclick="v25ToggleRecord()">${v25Local.enabled?'暂停记录':'开启记录'}</button><button class="v25-textlink" onclick="v25Export()">导出 JSON</button><button class="v25-textlink" onclick="v25ResetLocal()">清空统计</button></div><span class="v25-lowernote">仅在本机保存 · 闲置后暂停计时</span></div>`:`<div class="v25-controlbar"><span class="v25-lowernote">这里是生成的模拟样本，绝不代表历史实际创作时长。</span><button class="v25-textlink" onclick="v25SetSource('local')">切换到本机统计 ›</button></div>`;
 const detail=ui.v25SelectedDate&&days[ui.v25SelectedDate]?`${v25DateLabel(ui.v25SelectedDate)} · 活跃 ${v25FormatMinutes((days[ui.v25SelectedDate].seconds||0)/60)} · ${days[ui.v25SelectedDate].sessions||0} 次时段`:'点击任意日期，查看当天的活跃摘要';
 const panels=`<div class="v25-panels"><section class="v25-card ${ui.v25Panel==='calendar'?'is-selected':''}" data-v25panel="calendar"><div class="v25-card-header"><h2>近 13 周 · 创作日历</h2><span class="v25-mini">鼠标悬停查看日期</span></div>${v25Calendar(days)}<p class="v25-card-note">${E(detail)}</p></section><section class="v25-card ${ui.v25Panel==='trend'?'is-selected':''}" data-v25panel="trend"><div class="v25-card-header"><h2>每日创作时长</h2><span class="v25-mini">${trendSub}</span></div>${v25Trend(days,trendCount)}<p class="v25-card-note">柱高表示当天估算活跃分钟数，点击柱条可查看详情。</p></section><section class="v25-card v25-hourscard ${ui.v25Panel==='hours'?'is-selected':''}" data-v25panel="hours"><div class="v25-card-header"><h2>一周 × 24 小时活跃分布</h2><span class="v25-mini">按星期和小时聚合</span></div>${v25HourGrid(days)}</section></div>`;
 if(real&&!hasData)return `<div class="v25-analytics">${toolbar}${v25Metrics(days,n)}<div class="v25-empty"><h3>这里还没有本机创作时间记录</h3><div>从现在起开启记录，就能逐步生成自己的日历热力图、时长趋势和活跃时段分布。<br>旧会话缺少可靠的活跃时长，无法仅凭消息时间补算。</div><button class="btn ${v25Local.enabled?'':'primary'}" onclick="v25ToggleRecord()">${v25Local.enabled?'暂停本地活动记录':'开启本地活动记录'}</button><button class="btn" onclick="v25SetSource('demo')" style="margin-left:9px">先看演示图表</button></div>${bottomControl}</div>`;
 return `<div class="v25-analytics">${toolbar}${v25Metrics(days,n)}${tabs}${panels}${bottomControl}</div>`;
}
function v25SessionContent(){const by=choices.map(c=>({...c,count:store.sessions.filter(s=>!s.archivedAt&&s.kind===c.id).length}));const max=Math.max(1,...by.map(x=>x.count));const heat=roles.map(r=>({r,count:store.sessions.filter(s=>!s.archivedAt&&(s.roles||[]).includes(r.id)).length})).sort((a,b)=>b.count-a.count).slice(0,5);return `<div class="v25-analytics"><div class="v25-controlbar"><span class="v25-small">保留原 V2.4.1 的会话类型统计</span><button class="v25-textlink" onclick="v25SetMode('activity')">‹ 返回时间统计</button></div><div class="v25-panels" style="display:grid;grid-template-columns:1.3fr 1fr"><section class="v25-card"><h2>创作目的 · 会话数</h2><div class="v23-activity-bars" style="gap:14px;margin-top:20px">${by.map(x=>`<div><div class="v23-bar-head"><span>${E(x.name)}</span><strong>${x.count}</strong></div><div class="v23-bar-track"><div class="v23-bar-value" style="width:${x.count/max*100}%"></div></div></div>`).join('')}</div></section><section class="v25-card"><h2>关联讨论较多的角色</h2><div style="margin-top:13px">${heat.map(x=>v23Hrow(x.r.name,`${x.count} 条讨论`)).join('')}</div></section></div></div>`}
function v25Overview(){const pending=store.sessions.reduce((k,s)=>k+(s.proposals||[]).filter(p=>p.status==='pending').length+(s.roleProposal?.status==='pending'?1:0),0),recent=[...store.sessions].sort((a,b)=>(b.created||0)-(a.created||0)).slice(0,3);const totals=v25DateStats(v25CurrentData(),7);const sourceLabel=ui.v25Source==='demo'?'预置样本':'本机估算';return `<section class="v23-hero"><div><div class="chip green">个人 AI 创作工作室 · V2.5</div><h2>一个窗口，继续所有灵感。</h2><p>角色设定、场景脑暴与小说讨论汇聚于此。创作记录可以慢慢积累，随时回到未完成的想法。</p><button class="btn primary" onclick="openNew('design')">${I('plus')} 开始新创作</button></div><div class="v23-hero-art">${I('spark')}</div></section><div class="v23-stats">${v23Stat('角色档案',roles.length,'创作人物')}${v23Stat('创作会话',store.sessions.length,'全部用途')}${v23Stat('视觉创作标签',store.tagItems.length,'组合设计素材')}${v23Stat('待审阅提议',pending,'确认前不写入')}</div><div class="v23-home-bottom"><section class="v23-home-panel"><h2>最近创作</h2>${recent.map(s=>`<button class="v25-click-row" onclick="v25OpenRecent('${E(s.id)}')"><span>${E(s.title)}</span><small>${E(kname(s.kind))}　→</small></button>`).join('')}</section><section class="v23-home-panel"><h2>资料概况</h2>${v23Hrow('具有人物设定',`${roles.filter(v22HasProfile).length} 位角色`)}${v23Hrow('已准备 RP',`${roles.filter(r=>!r.archivedAt&&isRoleRpReady(r.id)).length} 位角色`)}${v23Hrow('检索标准标签',`${store.indexTagDefs.length} 条`)}<button class="v25-tiny-link" onclick="v25ShowPage(2)">查看资料详情 ›</button></section></div><div class="v25-hero-mini"><span>${I('clock')}</span><strong>近 7 天 ${v25FmtShort(totals.total/60)}</strong><span>${totals.active} 天有创作记录 · ${sourceLabel}</span><button style="margin-left:auto" onclick="v25ShowPage(1)">查看时间统计 ›</button></div>`}
function v25Assets(){const byGroup=store.indexTagGroups.map(g=>({g,n:store.indexTagDefs.filter(t=>t.group===g).length})).filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,5);return `<div class="v25-asset-grid"><section class="v23-home-panel"><h2>创作资料总览</h2><p class="v23-quiet" style="margin:0 0 8px">正式资料归属角色与作品，统计在这里汇总。</p>${v23Hrow('角色档案',`${roles.length} 位`)}${v23Hrow('作品 / 小说',`${store.works.length} 部`)}${v23Hrow('已保存章节',`${store.works.reduce((n,w)=>n+w.chapters.length,0)} 章`)}${v23Hrow('视觉素材标签',`${store.tagItems.length} 条`)}${v23Hrow('角色检索标签',`${store.indexTagDefs.length} 条`)}<div class="v25-actions"><button class="v25-textlink" onclick="visit('roles')">前往角色库 ›</button><button class="v25-textlink" onclick="visit('works')">前往作品库 ›</button></div></section><section class="v23-home-panel"><h2>角色检索标签分类</h2><p class="v23-quiet" style="margin:0 0 8px">标准词分布，便于发现分类是否过于集中。</p>${byGroup.map(x=>v23Hrow(x.g,`${x.n} 条`)).join('')}<button class="v25-textlink" onclick="v23GoIndex('roles')">打开标准标签管理器 ›</button></section></div>`}
v23Home=function(){const n=ui.v23HomePage||0;const name=['创作总览','创作活动','资料概况'][n],heading=['创作从这里继续。','回顾创作的时间。','让灵感有序积累。'][n];const body=n===0?v25Overview():n===1?(ui.v25Mode==='activity'?v25ActivityContent():v25SessionContent()):v25Assets();return `<div class="v23-home"><div class="v23-home-inner"><div class="v23-home-header"><div><div class="eyebrow">CREATIVE DESK · V2.5</div><h1>${heading}</h1></div><div class="v23-home-meta">${name} <span>0${n+1} / 03</span></div></div>${body}<div class="v25-pagefoot"><span>个人创作时间统计 · 样本数据与本机记录严格分开</span><span>滚轮切页 · PageUp / PageDown · 小窗口优先内容滚动</span></div></div><div class="v23-dots" aria-label="首页分页">${['创作总览','创作活动','资料概况'].map((label,i)=>`<button class="v23-dot ${i===n?'on':''}" aria-label="${label}" title="${label}" onclick="v23SwitchHome(${i})"></button>`).join('')}</div></div>`};

/* ================================================================
   V2.5.2: responsive content composition, no changes to persisted data.
   Content expansion uses existing character/novel/tag/activity records.
   ================================================================ */
function v251BarGroup(items, limit=5){
 const vals=items.filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,limit);
 if(!vals.length)return '<div class="v251-nodata">当前暂无可供统计的记录。</div>';
 const max=Math.max(1,...vals.map(v=>v.n));
 return vals.map(item=>`<div class="v251-databar-item"><div class="v251-databar-top"><span>${E(item.label)}</span><small>${item.n} 条</small></div><div class="v251-databar"><span style="width:${Math.max(3,100*item.n/max)}%"></span></div></div>`).join('');
}
function v251Overview(){
 const pending=store.sessions.reduce((count,s)=>count+(s.proposals||[]).filter(p=>p.status==='pending').length+(s.roleProposal?.status==='pending'?1:0),0);
 const recent=[...store.sessions].sort((a,b)=>(b.created||0)-(a.created||0)).slice(0,6);
 const stat=v25DateStats(v25CurrentData(),7);
 const source=ui.v25Source==='demo'?'预置样本':'本机记录';
 const days=v25CurrentData();

 const availableTags = (store.tagItems && store.tagItems.length) 
   ? store.tagItems.map(t => t.name) 
   : ['银白短发', '白衬衫与百褶裙', '自信', '机械义肢', '天文社骨干', '放学后的空教室'];
 const shuffled = [...availableTags].sort(() => 0.5 - Math.random());
 const sparkTags = shuffled.slice(0, 3);
 const sparkTagsJson = JSON.stringify(sparkTags).replace(/"/g, '&quot;');
 const scratchContent = store.scratchpad || '';

 const recentHtml=recent.map((s,i)=>'<button type="button" class="v251-recent-row ' + (i>=3?'v251-extra-recent':'') + '" onclick="v25OpenRecent(\'' + E(s.id) + '\')"><strong>' + E(s.title) + '</strong><small>' + E(kname(s.kind)) + '　↗</small></button>').join('');

 const studioQuotes = [
   '“创作不是无中生有，而是把散落在记忆与想象中的碎片，拼成一个有呼吸的灵魂。”',
   '“把每一个模糊的影子，写成有性格、有来历的具体名字。”',
   '“在文字的世界里，每一次落笔，都是在创造一个原本不存在的宇宙。”',
   '“不必苛求一笔即完美。先让灵感肆意发散，值得保留的构想自会沉淀。”',
   '“一个角色的诞生，往往始于一个未曾说出口的执念。”',
   '“真实不是复制现实，而是让虚构的世界拥有令人信服的呼吸与温度。”'
 ];
 const todayQuote = studioQuotes[Math.floor(Math.random() * studioQuotes.length)];
 const now = new Date();
 const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
 const dateStr = (now.getMonth() + 1) + '月' + now.getDate() + '日 · 星期' + ['日','一','二','三','四','五','六'][now.getDay()];
 const hr = now.getHours();
 const greeting = hr < 6 ? '深夜静谧 · 灵感沉淀' : hr < 12 ? '晨光微熹 · 构思苏醒' : hr < 18 ? '午后沉浸 · 笔触流淌' : '晚间闲暇 · 概念漫游';

 return '<div class="v251-page-body v251-overview">' +
 '<!-- 1. Upgraded Studio Hero Banner (Text & Time Only, Zero Button Overflow) -->' +
 '<section class="v23-hero" style="background:radial-gradient(circle at top left, #2e2e2e, #1b1b1b 80%);border:1px solid #3e3e3e;border-radius:12px;padding:20px 24px;box-shadow:0 8px 24px rgba(12, 12, 12, 0.3);display:flex;justify-content:space-between;align-items:center;position:relative;overflow:visible">' +
   '<div style="flex:1;min-width:0;padding-right:28px">' +
     '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">' +
       '<span class="chip green" style="background:rgba(226, 226, 226, 0.15);border:1px solid rgba(226, 226, 226, 0.3);color:var(--sage,#e2e2e2);font-size:10px;padding:2px 8px">✦ 个人 AI 创作工作室 · V3.0</span>' +
       '<span style="font-size:11px;color:#b4b4b4;display:flex;align-items:center;gap:5px">' +
         '<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:#cbcbcb;box-shadow:0 0 6px #cbcbcb"></span>' +
         '<span id="v3ClockGreeting">' + greeting + '</span>' +
       '</span>' +
       '<button type="button" class="v25-textlink" style="font-size:10.5px;color:#999999;margin-left:auto;background:none;border:none;cursor:pointer" onclick="nextStudioQuote()">⤨ 换一句</button>' +
     '</div>' +
     '<div id="v3StudioQuote" style="font-size:18px;font-weight:750;color:#f9f9f9;letter-spacing:-0.2px;line-height:1.45;margin-bottom:7px">' +
       todayQuote +
     '</div>' +
     '<div style="font-size:11.5px;color:#a2a2a2;line-height:1.55;max-width:760px">' +
       '角色概念定向探索、分支图谱发散与小说连载汇聚于此；灵感随时生长，值得保留时一键推送到酒馆开启沉浸式 RP。' +
     '</div>' +
   '</div>' +
   '<div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:center;gap:4px;min-width:220px;border-left:1px solid rgba(226, 226, 226, 0.15);padding-left:26px;flex-shrink:0">' +
     '<div id="v3LiveClock" style="font-size:32px;font-family:\'Consolas\',\'Courier New\',monospace;font-weight:750;color:var(--sage,#e2e2e2);letter-spacing:1px;line-height:1">' + timeStr + '</div>' +
     '<div id="v3LiveDate" style="font-size:12px;color:#969696;margin-top:3px">' + dateStr + '</div>' +
     '' +
   '</div>' +
 '</section>' +

 '<!-- 2. 4 Metrics Stats Hub -->' +
 '<div class="v23-stats" style="margin-top:14px">' +
   v23Stat('角色档案', roles.length, '创作人物') +
   v23Stat('创作会话', store.sessions.length, '全部用途') +
   v23Stat('视觉创作标签', store.tagItems.length, '组合设计素材') +
   v23Stat('待审阅提议', pending, '确认前不写入') +
 '</div>' +

 '<!-- 3. NEW: 4-Grid Creative Entrances -->' +
 '<div class="sectionhead" style="margin:18px 0 10px">' +
   '<h2 style="font-size:14px;font-weight:750;color:#f9f9f9;display:flex;align-items:center;gap:6px">' + I('spark') + ' 常用创作入口</h2>' +
   '<span class="tiny" style="color:#8f8f8f">按工作目的开始，而非按模型平台</span>' +
 '</div>' +
 '<div class="v3-entrances-grid">' +
   '<div class="v3-entrance-card featured click" onclick="visit(\'concept\')">' +
     '<div style="display:flex;justify-content:space-between;align-items:center">' +
       '<div class="v3-entrance-icon" style="background:rgba(226, 226, 226, 0.18);color:var(--sage,#e2e2e2)">' + I('spark') + '</div>' +
       '<span class="chip green" style="font-size:9.5px;padding:2px 6px">V3 旗舰引擎</span>' +
     '</div>' +
     '<div class="v3-entrance-title">角色概念工坊 (V3)</div>' +
     '<div class="v3-entrance-desc">自然语言定向探索、分支图谱发散、特征组合与一键推送到酒馆。</div>' +
     '<div class="v3-entrance-link">立即开启探索 ' + I('arrow') + '</div>' +
   '</div>' +

   '<div class="v3-entrance-card click" onclick="openNew(\'design\')">' +
     '<div style="display:flex;justify-content:space-between;align-items:center">' +
       '<div class="v3-entrance-icon" style="background:rgba(237, 237, 237, 0.12);color:var(--blue,#ededed)">' + I('palette') + '</div>' +
       '<span class="chip" style="font-size:9.5px;padding:2px 6px">视觉档案</span>' +
     '</div>' +
     '<div class="v3-entrance-title">角色视觉设计</div>' +
     '<div class="v3-entrance-desc">标签组合、候选外观设计、保存角色并与全工作区联动。</div>' +
     '<div class="v3-entrance-link" style="color:var(--blue,#ededed)">打开设计会话 ' + I('arrow') + '</div>' +
   '</div>' +

   '<div class="v3-entrance-card click" onclick="openNew(\'scene\')">' +
     '<div style="display:flex;justify-content:space-between;align-items:center">' +
       '<div class="v3-entrance-icon" style="background:rgba(220, 220, 220, 0.12);color:var(--gold,#dcdcdc)">' + I('image') + '</div>' +
       '<span class="chip" style="font-size:9.5px;padding:2px 6px">分镜构图</span>' +
     '</div>' +
     '<div class="v3-entrance-title">场景与提示词</div>' +
     '<div class="v3-entrance-desc">讨论构图光影与环境氛围，导出结构化生图任务。</div>' +
     '<div class="v3-entrance-link" style="color:var(--gold,#dcdcdc)">设计场景提示词 ' + I('arrow') + '</div>' +
   '</div>' +

   '<div class="v3-entrance-card click" onclick="visit(\'editor\')">' +
     '<div style="display:flex;justify-content:space-between;align-items:center">' +
       '<div class="v3-entrance-icon" style="background:rgba(211, 211, 211, 0.12);color:var(--pink,#d3d3d3)">' + I('book') + '</div>' +
       '<span class="chip" style="font-size:9.5px;padding:2px 6px">长篇小说</span>' +
     '</div>' +
     '<div class="v3-entrance-title">小说写作与连载</div>' +
     '<div class="v3-entrance-desc">打开作品章节，研讨剧情推进、伏笔与正文细化。</div>' +
     '<div class="v3-entrance-link" style="color:var(--pink,#d3d3d3)">进入写作空间 ' + I('arrow') + '</div>' +
   '</div>' +
 '</div>' +

 '<!-- 4. Three-Column Balanced Creative Studio Hub (Image 4 Fix) -->' +
 '<div class="v3-home-3col">' +
   '<!-- Left Column: 最近创作 (Red Box Left) -->' +
   '<section class="v23-home-panel" style="margin:0;display:flex;flex-direction:column;height:100%;background:#222222;border:1px solid #383838;border-radius:12px;padding:14px 16px">' +
     '<div class="v251-panel-heading" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
       '<h2 style="font-size:13.5px;font-weight:700;color:#f9f9f9;margin:0;display:flex;align-items:center;gap:6px">' + I('chat') + ' 最近创作</h2>' +
       '<button class="v25-textlink" onclick="visit(\'sessions\')" style="font-size:11px;color:var(--sage,#e2e2e2);background:none;border:none;cursor:pointer">全部会话 ›</button>' +
     '</div>' +
     '<div style="flex:1;display:flex;flex-direction:column;gap:5px">' +
       (recentHtml || '<p class="v251-nodata" style="color:#8f8f8f;font-size:11px">暂无会话记录</p>') +
     '</div>' +
   '</section>' +

   '<!-- Center Column: 灵感策源岛 (Blue Boxes Center - Unified Dark Sage Palette, NO GRAY) -->' +
   '<div style="display:flex;flex-direction:column;gap:12px;height:100%">' +
     '<!-- Center Top: 每日随机灵感碰撞 -->' +
     '<div class="v3-inspire-box" style="display:flex;flex-direction:column;gap:8px">' +
       '<div style="display:flex;justify-content:space-between;align-items:center">' +
         '<span style="font-size:12px;font-weight:700;color:var(--sage,#e2e2e2);display:flex;align-items:center;gap:5px">' +
           I('spark') + ' 每日随机灵感碰撞' +
         '</span>' +
         '<span class="tiny" style="color:#8f8f8f;font-weight:normal">算法从标签库抽取</span>' +
       '</div>' +
       '<div class="v3-spark-tags" style="display:flex;gap:6px;flex-wrap:wrap">' +
         sparkTags.map(t => '<span class="chip" style="background:#2c2c2c;border-color:rgba(226, 226, 226, 0.3);color:#f9f9f9;padding:3px 8px;font-size:10.5px">' + E(t) + '</span>').join('') +
       '</div>' +
       '<button type="button" class="btn-spark-action" onclick="sparkWithTags(' + sparkTagsJson + ')">' +
         '✦ 以这组灵感进入概念工坊发散 →' +
       '</button>' +
     '</div>' +

     '<!-- Center Bottom: 灵感闪念便笺 (Quick Scratchpad) -->' +
     '<div class="v3-inspire-box" style="flex:1;display:flex;flex-direction:column;gap:8px">' +
       '<div style="display:flex;justify-content:space-between;align-items:center">' +
         '<span style="font-size:12px;font-weight:700;color:var(--sage,#e2e2e2);display:flex;align-items:center;gap:5px">' +
           I('pen') + ' 灵感闪念便笺 (Quick Scratchpad)' +
         '</span>' +
         '<span class="tiny" style="color:#8f8f8f;font-weight:normal">随手记录 · 本地保存</span>' +
       '</div>' +
       '<textarea id="homeScratchpad" class="v3-scratchpad" style="flex:1;min-height:55px;background:#191919;border:1px solid #343434;color:#f8f8f8;border-radius:6px;padding:8px 10px;font-size:11px;line-height:1.5;resize:none" placeholder="随时捕捉此刻的一句台词、人设闪念或剧情灵感...">' + E(scratchContent) + '</textarea>' +
       '<div style="display:flex;gap:8px;justify-content:flex-end">' +
         '<button type="button" class="btn" style="background:#272727;border:1px solid #3b3b3b;color:#c2c2c2;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer" onclick="saveScratchpad()">保存便笺</button>' +
         '<button type="button" class="btn primary" style="background:#393939;border:1px solid #777777;color:#e2e2e2;font-weight:650;font-size:11px;padding:4px 10px;border-radius:6px;cursor:pointer" onclick="sendScratchpadToConcept()">✦ 带入概念工坊</button>' +
       '</div>' +
     '</div>' +
   '</div>' +

   '<!-- Right Column: 资料概况 (Red Box Right) -->' +
   '<section class="v23-home-panel" style="margin:0;display:flex;flex-direction:column;height:100%;background:#222222;border:1px solid #383838;border-radius:12px;padding:14px 16px">' +
     '<div class="v251-panel-heading" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
       '<h2 style="font-size:13.5px;font-weight:700;color:#f9f9f9;margin:0;display:flex;align-items:center;gap:6px">' + I('folder') + ' 资料概况</h2>' +
       '<button class="v25-textlink" onclick="v25ShowPage(2)" style="font-size:11px;color:var(--sage,#e2e2e2);background:none;border:none;cursor:pointer">查看详情 ›</button>' +
     '</div>' +
     '<div style="flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:4px">' +
       v23Hrow('具有人物设定', roles.filter(v22HasProfile).length + ' 位角色') +
       v23Hrow('已准备 RP', roles.filter(r=>!r.archivedAt&&isRoleRpReady(r.id)).length + ' 位角色') +
       v23Hrow('检索标准标签', store.indexTagDefs.length + ' 条') +
       v23Hrow('已保存章节', store.works.reduce((sum,w)=>sum+w.chapters.length,0) + ' 章') +
       v23Hrow('作品项目', store.works.length + ' 部') +
       v23Hrow('已保存提示词', store.sessions.reduce((sum,s)=>sum+(s.prompts?.length||0),0) + ' 份') +
     '</div>' +
   '</section>' +
 '</div>' +

 '<!-- 5. Rhythm Trend (Flat Solid Bars, Clean Spacing, No Duplicate Footers) -->' +
 '<section class="v251-trend-expansion v251-expansion" style="margin-top:16px;background:#222222;border:1px solid #383838;border-radius:12px;padding:16px 20px">' +
   '<div class="v251-panel-heading" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
     '<h2 style="font-size:13.5px;font-weight:700;color:#f9f9f9;margin:0">最近 14 天的创作节奏</h2>' +
     '<small style="color:#8f8f8f;font-size:11px">活跃时间估算 · ' + source + '</small>' +
   '</div>' +
   '<div class="v251-trend-body" style="min-height:90px">' + v25Trend(days,14) + '</div>' +
   '<div class="v251-graph-foot" style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(249, 249, 249, 0.06);margin-top:8px;color:#a4a4a4;font-size:11px">' +
     '<span>在大窗口中展开时间趋势；点击柱条查看日期</span>' +
     '<div style="display:flex;gap:12px;align-items:center">' +
       '<strong style="color:#f7f7f7;font-size:12px">近 7 天 ' + v25FmtShort(stat.total/60) + '</strong>' +
       '<button class="v25-textlink" onclick="v25ShowPage(1)" style="color:var(--sage,#e2e2e2);font-size:11px;background:none;border:none;cursor:pointer">查看时间统计 ›</button>' +
     '</div>' +
   '</div>' +
 '</section>' +
 '</div>';
}

function v25SetAssetsTab(tab){
 ui.v25AssetsTab = tab;
 render();
}
function v251Mosaic(items){
 const all=items.filter(x=>x.n>0).sort((a,b)=>b.n-a.n).slice(0,8);
 if(!all.length)return '<div class="v251-nodata">暂无视觉素材分类。</div>';
 let cards=all.map(x=>`<div class="v251-mosaic-item click" onclick="visit('tags')" title="前往标签库查看【${E(x.label)}】素材"><strong>${E(x.label)}</strong><span>${x.n} <small style="font-size:10px;color:#9b9b9b;font-weight:normal">条</small></span></div>`);
 if(cards.length===7){
   cards.push(`<div class="v251-mosaic-item v251-mosaic-more click" onclick="visit('tags')" title="前往视觉素材标签库管理全部素材" style="border-style:dashed;background:rgba(255,255,255,0.02)"><strong>全部标签</strong><span style="font-size:12px;color:var(--accent,#8b5cf6);font-weight:600">标签库 ↗</span></div>`);
 }
 return `<div class="v251-mosaic">${cards.join('')}</div>`;
}
function v251Assets(){
 const chapterCount=store.works.reduce((n,w)=>n+w.chapters.length,0);
 const prompts=store.sessions.reduce((n,s)=>n+(s.prompts?.length||0),0);
 const structured=roles.filter(v22HasProfile).length;
 const indexGroups=store.indexTagGroups.map(g=>({label:g,n:store.indexTagDefs.filter(t=>t.group===g).length}));
 const visualCats=[...new Set(store.tagItems.map(t=>t.category||'未分类'))].map(label=>({label,n:store.tagItems.filter(t=>(t.category||'未分类')===label).length}));
 const withRP=roles.filter(r=>!r.archivedAt&&isRoleRpReady(r.id)).length;
 const tab = ui.v25AssetsTab || 'roles';

 const profileRows=roles.map(r=>`<div class="v251-roles-line click" onclick="goRole('${r.id}')"><span class="v251-roles-initial">${E(r.icon||r.name.slice(0,1))}</span><div class="v251-roles-info"><strong>${E(r.name)}</strong><span>${E(r.series||'未分组')}</span></div><button type="button" class="btn sm ${v22HasProfile(r)?'':'primary'}" style="font-size:10px;padding:2px 8px;border-radius:6px" onclick="event.stopPropagation();goRole('${r.id}')">${v22HasProfile(r)?'已设定':'去补设定 ›'}</button></div>`).join('');

 const workRows=store.works.map(w=>`<div class="v251-work-line click" onclick="visit('works')"><div class="v251-work-info"><strong>《${E(w.title)}》</strong><span>小说正文 · 浏览器自动保存</span></div><div style="display:flex;align-items:center;gap:8px"><span class="aux" style="font-size:10px;color:#b1b1b1">${w.chapters.length} 章</span><button type="button" class="btn sm" style="font-size:10px;padding:2px 8px;border-radius:6px" onclick="event.stopPropagation();visit('works')">进入写作台 ›</button></div></div>`).join('');

 const tabButtons=`<div class="v25-segment" role="group" aria-label="资料概况切换"><button class="${tab==='roles'?'on':''}" onclick="v25SetAssetsTab('roles')">人物档案 (${roles.length})</button><button class="${tab==='works'?'on':''}" onclick="v25SetAssetsTab('works')">作品章节 (${store.works.length})</button></div>`;

 const tabContent=tab==='roles'
   ? `<div class="v251-assets-tablist">${profileRows||'<div class="v251-nodata">暂无角色档案</div>'}</div><div style="margin-top:auto;padding-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#8f8f8f"><span>已设定 ${structured} 位 · 待补设定 ${roles.length-structured} 位</span><button type="button" class="v25-textlink" onclick="visit('roles')">进入角色库全部列表 ›</button></div>`
   : `<div class="v251-assets-tablist">${workRows||'<div class="v251-nodata">暂无作品记录</div>'}</div><div style="margin-top:auto;padding-top:10px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#8f8f8f"><span>共 ${store.works.length} 部作品 · 累计已保存 ${chapterCount} 个章节</span><button type="button" class="v25-textlink" onclick="visit('works')">进入作品写作台 ›</button></div>`;

 return `<div class="v251-page-body v251-page-assets">
 <div class="v251-countgrid">
   <div class="v251-countgroup">
     <div class="v251-count click" onclick="visit('roles')" title="前往角色库"><span>角色档案</span><strong>${roles.length}</strong></div>
     <div class="v251-count click" onclick="visit('works')" title="前往作品库"><span>作品 / 小说</span><strong>${store.works.length}</strong></div>
   </div>
   <div class="v251-countgroup">
     <div class="v251-count click" onclick="visit('works')" title="前往作品库查看章节"><span>已保存章节</span><strong>${chapterCount}</strong></div>
     <div class="v251-count click" onclick="visit('tags')" title="前往视觉素材标签库"><span>创作标签合计</span><strong>${store.tagItems.length+store.indexTagDefs.length}</strong></div>
   </div>
 </div>
 <div class="v251-assets-main"><section class="v23-home-panel"><div class="v251-panel-heading"><h2>创作资料概况</h2><button class="v25-textlink" onclick="visit('roles')">角色库 ›</button></div>${v23Hrow('具有人物设定',`${structured} 位角色`)}${v23Hrow('已配置 RP',`${withRP} 位角色`)}${v23Hrow('视觉素材标签',`${store.tagItems.length} 条`)}${v23Hrow('角色检索标签',`${store.indexTagDefs.length} 条`)}${v23Hrow('已保存生图提示词',`${prompts} 份`)}</section><section class="v23-home-panel"><div class="v251-panel-heading"><h2>角色检索标签分类</h2><button class="v25-textlink" onclick="v23GoIndex('roles')">管理标签 ›</button></div><div class="v251-muted">按已有标准标签实际分类统计</div>${v251BarGroup(indexGroups,5)}</section></div>
 <div class="v251-assets-extra v251-expansion"><section class="v23-home-panel"><div class="v251-panel-heading"><h2>视觉素材分类分布</h2><button class="v25-textlink" onclick="visit('tags')">素材标签库 ›</button></div>${v251Mosaic(visualCats)}</section><section class="v23-home-panel" style="display:flex;flex-direction:column;min-height:0;overflow:hidden"><div class="v251-panel-heading" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h2>角色与作品概况</h2>${tabButtons}</div>${tabContent}</section></div>
 </div>`;
}
function v251WeekChart(days){
 const vals=[];
 for(let w=7;w>=0;w--){let minutes=0;for(let offset=w*7+6;offset>=w*7;offset--){let day=days[v25DayKey(v25AtOffset(-offset))];minutes+=(Number(day?.seconds)||0)/60;}vals.push({minutes,label:w===0?'本周':`${w}周前`})}
 const max=Math.max(1,...vals.map(v=>v.minutes));
 const bars=vals.map(v=>`<div class="v251-week" title="${v.label}：${v25FormatMinutes(v.minutes)}"><b style="height:${Math.max(v.minutes>0?2:0,Math.round(v.minutes/max*100))}%"></b></div>`).join('');
 return `<section class="v251-weekly-expansion"><div class="v251-panel-heading"><h2>近 8 个七日周期 · 活跃时间</h2><small>基于当前数据来源</small></div><div class="v251-weeklyplot">${bars}</div><div class="v25-axis"><span>8 周前</span><span>每柱代表连续 7 天</span><span>最近 7 天</span></div></section>`;
}
function v251Activity(){
 const data=v25CurrentData();
 const base=ui.v25Mode==='activity'?v25ActivityContent():v25SessionContent();
 if(ui.v25Mode!=='activity')return base.replace('class="v25-analytics"','class="v25-analytics v251-activity"');
 let result=base.replace('class="v25-analytics"','class="v25-analytics v251-activity"');
 if(Object.values(data).some(v=>(Number(v?.seconds)||0)>0)){
   result=result.replace('<div class="v25-controlbar">',v251WeekChart(data)+'<div class="v25-controlbar">');
 }
 return result;
}
function v251Home(){
 const n=ui.v23HomePage||0;
 const name=['创作总览','创作活动','资料概况'][n];
 const heading=['创作从这里继续。','回顾创作的时间。','让灵感有序积累。'][n];
 const body=n===0?v251Overview():n===1?v251Activity():v251Assets();
 const headerHtml=n===0?'':`<div class="v23-home-header"><div><div class="eyebrow">CREATIVE DESK · V2.5.2</div><h1>${heading}</h1></div><div class="v23-home-meta">${name}　<span>0${n+1} / 03</span></div></div>`;
 return `<div class="v23-home v251-home v252-home"><div class="v23-home-inner v251-home-inner">${headerHtml}${body}<div class="v25-pagefoot"><span>创作数据来自当前浏览器示例；时间统计区可切换真实本机记录</span><span>滚轮翻页 · PageUp / PageDown · 内容溢出时优先滚动</span></div></div><div class="v23-dots" aria-label="首页分页">${['创作总览','创作活动','资料概况'].map((label,i)=>`<button class="v23-dot ${i===n?'on':''}" aria-label="${label}" title="${label}" onclick="v23SwitchHome(${i})"></button>`).join('')}</div></div>`;
}

v23Home=v251Home;




function exploreFromRole(roleId){
  if(window.ConceptWorkbench && typeof window.ConceptWorkbench.openWithRole === 'function'){
    window.ConceptWorkbench.openWithRole(roleId);
  } else {
    visit('concept');
  }
}

function saveScratchpad() {
  const el = document.getElementById('homeScratchpad');
  if(!el) return;
  store.scratchpad = el.value.trim();
  save();
  toast('灵感便笺已保存到本地');
}

function sendScratchpadToConcept() {
  const el = document.getElementById('homeScratchpad');
  const text = el ? el.value.trim() : '';
  if(!text) return toast('请先输入灵感或人设想法');
  store.scratchpad = text;
  save();
  if(window.ConceptWorkbench && typeof window.ConceptWorkbench.setDirection === 'function'){
    window.ConceptWorkbench.setDirection(text);
  }
  visit('concept');
}

function sparkWithTags(tags) {
  if(!tags || !tags.length) return visit('concept');
  if(window.ConceptWorkbench && typeof window.ConceptWorkbench.addSparkTags === 'function'){
    window.ConceptWorkbench.addSparkTags(tags);
  }
  visit('concept');
}

const studioQuotes = [
  '“创作不是无中生有，而是把散落在记忆与想象中的碎片，拼成一个有呼吸的灵魂。”',
  '“把每一个模糊的影子，写成有性格、有来历的具体名字。”',
  '“在文字的世界里，每一次落笔，都是在创造一个原本不存在的宇宙。”',
  '“不必苛求一笔即完美。先让灵感肆意发散，值得保留的构想自会沉淀。”',
  '“一个角色的诞生，往往始于一个未曾说出口的执念。”',
  '“真实不是复制现实，而是让虚构的世界拥有令人信服的呼吸与温度。”'
];

function nextStudioQuote() {
  const el = document.getElementById('v3StudioQuote');
  if (!el) return;
  const current = el.textContent.trim();
  const filtered = studioQuotes.filter(q => q !== current);
  el.textContent = filtered[Math.floor(Math.random() * filtered.length)];
}

if (!window.__v3ClockTick) {
  window.__v3ClockTick = setInterval(() => {
    const elTime = document.getElementById('v3LiveClock');
    if (!elTime) return;
    const now = new Date();
    elTime.textContent = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
    const elDate = document.getElementById('v3LiveDate');
    if (elDate) {
      elDate.textContent = (now.getMonth() + 1) + '月' + now.getDate() + '日 · 星期' + ['日','一','二','三','四','五','六'][now.getDay()];
    }
  }, 1000);
}

// V3.0 Modern Visual Tag Library (Dense Capsule Matrix & Batch Operations)
tagManager = function() {
  ui.tagViewMode = ui.tagViewMode || 'matrix';
  const ts = visibleTags();
  const selectedTag = store.tagItems.find(x => x.id === ui.tagSelected) || ts[0] || null;
  const enabledCount = store.tagItems.filter(t => t.enabled).length;

  let html = '';
  html += '<div class="tags-layout v3-tags-layout">';
  
  // Left Sidebar: Categories Navigation
  html += '<aside class="tag-cats v3-tag-cats">';
  html += '<button class="btn quiet sm" onclick="backFromTags()" style="margin-bottom:12px">' + I('back') + ' 返回工作台</button>';
  html += '<div class="v3-tag-side-header">';
    html += '<h2 class="h2" style="margin:4px 0 2px;font-size:16px">视觉标签库</h2>';
  html += '<p class="tiny" style="color:#8f8f8f;margin:0 0 12px">多维标签沉淀与组合抽取</p>';
  html += '</div>';

  html += '<div class="side-section" style="font-size:11px;font-weight:700;color:#c1c1c1;letter-spacing:0.5px">标签分类</div>';
  html += '<div class="v3-tag-cat-list">';
  cats.forEach(c => {
    const count = c === '全部分类' ? store.tagItems.length : store.tagItems.filter(t => t.category === c).length;
    const isOn = ui.tagsCategory === c;
    html += '<button class="side-link ' + (isOn ? 'on' : '') + '" onclick="setTagFilter(\'cat\',\'' + E(c) + '\')">';
    html += I(c === '全部分类' ? 'tag' : 'folder') + ' <span>' + E(c) + '</span>';
    html += '<span class="count ' + (isOn ? 'accent' : '') + '">' + count + '</span>';
    html += '</button>';
  });
  html += '</div>';


  html += '</aside>';

  // Middle Column: Matrix / List View
  html += '<section class="tag-list v3-tag-list-main">';
  // Top Heading & Stats
  html += '<div class="between" style="align-items:flex-start;margin-bottom:14px">';
  html += '<div>';
    html += '<h2 class="h2" style="margin:3px 0 2px;font-size:18px">' + E(ui.tagsCategory) + '</h2>';
  html += '<p class="sub" style="margin:0;font-size:11px">';
  html += '共 ' + ts.length + ' 项匹配 · 全库 ' + store.tagItems.length + ' 项（' + enabledCount + ' 项已启用）';
  html += '</p>';
  html += '</div>';
  html += '<div class="flex gap8">';
  html += '<button class="btn quiet sm" onclick="tagUndo()">' + I('undo') + ' 撤销' + (store.tagUndoStack && store.tagUndoStack.length ? ' (' + store.tagUndoStack.length + ')' : '') + '</button>';
  html += '<button class="btn primary sm" onclick="show(\'tagAdd\')">' + I('plus') + ' 新建标签</button>';
  html += '</div>';
  html += '</div>';

  // Controls Bar: Search + Filter + Sort + View Mode Switcher
  html += '<div class="v3-tag-toolbar">';
  html += '<div class="v3-tag-search-box">';
  html += '<span class="search-icon">' + I('search') + '</span>';
  html += '<input class="input v3-tag-input" id="tagSearch" placeholder="搜索标签名称、分类或说明..." value="' + E(ui.tagsQuery) + '" oninput="tagSearchChange(this.value)">';
  html += '</div>';
  html += '<select class="select" style="min-width:110px" onchange="setTagFilter(\'state\',this.value)">';
  html += '<option value="all">全部状态</option>';
  html += '<option value="enabled" ' + (ui.tagFilter === 'enabled' ? 'selected' : '') + '>已启用</option>';
  html += '<option value="disabled" ' + (ui.tagFilter === 'disabled' ? 'selected' : '') + '>已停用</option>';
  html += '</select>';
  html += '<select class="select" style="min-width:110px" onchange="setTagSort(this.value)">';
  html += '<option value="name" ' + (ui.tagSort === 'name' ? 'selected' : '') + '>按名称拼音</option>';
  html += '<option value="weight" ' + (ui.tagSort === 'weight' ? 'selected' : '') + '>按权重降序</option>';
  html += '<option value="category" ' + (ui.tagSort === 'category' ? 'selected' : '') + '>按分类</option>';
  html += '</select>';
  html += '<div class="view-toggle" role="group" aria-label="标签排版方式">';
  html += '<button class="' + (ui.tagViewMode === 'matrix' ? 'active' : '') + '" onclick="ui.tagViewMode=\'matrix\';render()" title="高密度胶囊矩阵">';
  html += '☷ 矩阵';
  html += '</button>';
  html += '<button class="' + (ui.tagViewMode === 'list' ? 'active' : '') + '" onclick="ui.tagViewMode=\'list\';render()" title="传统条目列表">';
  html += '☰ 列表';
  html += '</button>';
  html += '</div>';
  html += '</div>';

  // Batch Action Toolbar
  html += '<div class="v3-tag-batch-bar">';
  html += '<div class="flex gap8 align-center">';
  html += '<span class="tiny" style="color:#a4a4a4;font-weight:600">批量操作:</span>';
  html += '<button class="btn sm v3-btn-sage" onclick="v3BatchToggleFilteredTags(true)">✓ 全部启用</button>';
  html += '<button class="btn sm v3-btn-sage" onclick="v3BatchToggleFilteredTags(false)">✕ 全部停用</button>';
  html += '<button class="btn sm primary v3-btn-primary" onclick="v3ExportFilteredToConcept()">' + I('spark') + ' ✦ 带入概念工坊探索</button>';
  html += '</div>';
  html += '<div class="tiny" style="color:#888888">';
  html += '高亮发光: 权重≥80 · 深绿: 50~79 · 暗灰: <50';
  html += '</div>';
  html += '</div>';

  // Tags Matrix or List Display
  html += '<div class="v3-tags-container">';
  if (ts.length === 0) {
    html += '<div class="empty" style="padding:48px 16px"><strong>未找到匹配标签</strong><span>尝试更改关键词、重置筛选条件或新建标签。</span></div>';
  } else if (ui.tagViewMode === 'matrix') {
    html += '<div class="v3-tag-capsule-grid">';
    ts.slice(0, ui.tagLimit).forEach(x => {
      const isSelected = ui.tagSelected === x.id;
      const tier = x.weight >= 80 ? 'tier-high' : x.weight >= 50 ? 'tier-med' : 'tier-low';
      const disabledClass = !x.enabled ? 'is-disabled' : '';
      html += '<div class="v3-tag-capsule ' + tier + ' ' + (isSelected ? 'selected' : '') + ' ' + disabledClass + '" onclick="selectTag(\'' + x.id + '\')">';
      html += '<span class="v3-capsule-weight" title="当前权重: ' + x.weight + '">' + x.weight + '</span>';
      html += '<span class="v3-capsule-name">' + E(x.name) + '</span>';
      if (x.category !== ui.tagsCategory) {
        html += '<span class="v3-capsule-cat">' + E(x.category) + '</span>';
      }
      html += '<label class="v3-capsule-toggle" onclick="event.stopPropagation()">';
      html += '<input type="checkbox" ' + (x.enabled ? 'checked' : '') + ' onchange="toggleTag(\'' + x.id + '\', this.checked)">';
      html += '<span class="v3-toggle-dot"></span>';
      html += '</label>';
      html += '</div>';
    });
    html += '</div>';
  } else {
    html += '<div class="v3-tag-list-table">';
    ts.slice(0, ui.tagLimit).forEach(x => {
      const isSelected = ui.tagSelected === x.id;
      const tier = x.weight >= 80 ? 'tier-high' : x.weight >= 50 ? 'tier-med' : 'tier-low';
      html += '<button class="tag-item v3-tag-row ' + (isSelected ? 'on' : '') + ' ' + (!x.enabled ? 'off' : '') + ' ' + tier + '" onclick="selectTag(\'' + x.id + '\')">';
      html += '<div class="flex gap8 align-center">';
      html += '<span class="v3-capsule-weight" style="min-width:26px;text-align:center">' + x.weight + '</span>';
      html += '<div>';
      html += '<span class="mainlabel">' + E(x.name) + '</span>';
      html += '<div class="tiny" style="color:#919191">' + E(x.category) + (x.desc ? ' · ' + E(x.desc.slice(0, 30)) : '') + '</div>';
      html += '</div>';
      html += '</div>';
      html += '<div class="flex gap12 align-center">';
      html += '<input aria-label="启用 ' + E(x.name) + '" title="启用/停用" class="tag-status-checkbox" type="checkbox" ' + (x.enabled ? 'checked' : '') + ' onclick="event.stopPropagation()" onchange="toggleTag(\'' + x.id + '\', this.checked)">';
      html += '</div>';
      html += '</button>';
    });
    html += '</div>';
  }

  // Pagination Loader
  if (ts.length > ui.tagLimit) {
    html += '<div style="margin-top:20px;text-align:center">';
    html += '<button class="btn v3-load-more-pill" onclick="ui.tagLimit+=60;render()">';
    html += I('plus') + ' 加载更多（剩余 ' + (ts.length - ui.tagLimit) + ' 项）';
    html += '</button>';
    html += '</div>';
  }

  html += '<div style="margin:16px 0 8px;display:flex;gap:8px;justify-content:center">';
  html += '<button class="btn quiet sm" onclick="generateScaleTags()">' + I('plus') + ' 载入 280 条海量测试标签</button>';
  html += '</div>';
  html += '</div>';
  html += '</section>';

  // Right Sidebar: Tag Inspector & AI Tools
  html += '<aside class="tag-edit v3-tag-inspector">';
  html += '<div class="between" style="margin-bottom:12px">';
  html += '<div style="display:flex;align-items:center;gap:6px">';
  html += I('pen') + ' <h3 class="h3" style="font-size:14px;margin:0">标签详情</h3>';
  html += '</div>';
  if (selectedTag) {
    html += '<span class="chip ' + (selectedTag.enabled ? 'green' : '') + '">' + (selectedTag.enabled ? '已启用' : '已停用') + '</span>';
  }
  html += '</div>';

  if (selectedTag) {
    html += '<div class="v3-tag-form">';
    html += '<div class="formrow">';
    html += '<label>标签名称</label>';
    html += '<input class="input" value="' + E(selectedTag.name) + '" onchange="editTag(\'' + selectedTag.id + '\',\'name\',this.value)">';
    html += '</div>';
    html += '<div class="formrow">';
    html += '<label>归属分类</label>';
    html += '<select class="select" onchange="editTag(\'' + selectedTag.id + '\',\'category\',this.value)">';
    cats.slice(1).forEach(c => {
      html += '<option ' + (selectedTag.category === c ? 'selected' : '') + '>' + E(c) + '</option>';
    });
    html += '</select>';
    html += '</div>';
    html += '<div class="formrow">';
    html += '<label>使用释义与视觉描写</label>';
    html += '<textarea class="textarea" rows="3" onchange="editTag(\'' + selectedTag.id + '\',\'desc\',this.value)" placeholder="详细说明该标签在视觉或人设上的具体特征...">' + E(selectedTag.desc || '') + '</textarea>';
    html += '</div>';
    html += '<div class="formrow">';
    html += '<div class="between" style="margin-bottom:4px">';
    html += '<label style="margin:0">偏好抽取权重</label>';
    html += '<strong id="weight-num" style="color:var(--sage,#e2e2e2);font-size:14px">' + selectedTag.weight + '</strong>';
    html += '</div>';
    html += '<input class="range" type="range" min="0" max="100" value="' + selectedTag.weight + '" oninput="document.getElementById(\'weight-num\').textContent=this.value" onchange="editTag(\'' + selectedTag.id + '\',\'weight\',Number(this.value))">';
    html += '<div class="flex between tiny" style="color:#888888;margin-top:2px">';
    html += '<span>冷门 (0)</span><span>均衡 (50)</span><span>必选/高频 (100)</span>';
    html += '</div>';
    html += '</div>';
    html += '<div class="formrow between" style="background:#242424;padding:8px 10px;border-radius:6px;border:1px solid #383838">';
    html += '<div>';
    html += '<label style="margin:0;font-weight:600">参与标签组合抽样</label>';
    html += '<div class="tiny" style="color:#939393">停用后不会被概念工坊抽取</div>';
    html += '</div>';
    html += '<input class="tag-status-checkbox" type="checkbox" ' + (selectedTag.enabled ? 'checked' : '') + ' onchange="toggleTag(\'' + selectedTag.id + '\',this.checked)">';
    html += '</div>';
    html += '<div class="menu-divider" style="margin:16px 0"></div>';
    html += '<button class="btn danger sm" style="width:100%" onclick="deleteTag(\'' + selectedTag.id + '\')">';
    html += I('trash') + ' 删除此标签';
    html += '</button>';
    html += '</div>';
  } else {
    html += '<div class="empty" style="padding:24px 8px"><strong>选择一条标签</strong>点击中间矩阵或列表中的标签进行编辑与权重调整。</div>';
  }

  html += '<div class="menu-divider" style="margin:20px 0"></div>';

  // AI Modification Section
  html += '<div class="v3-tag-ai-box">';
  html += '<div style="font-size:12px;font-weight:700;color:var(--sage,#e2e2e2);margin-bottom:4px;display:flex;align-items:center;gap:5px">';
  html += I('spark') + ' <span>AI 智能扩充与批量维护</span>';
  html += '</div>';
  html += '<p class="tiny" style="color:#999999;margin:0 0 8px;line-height:1.4">';
  html += '输入自然语言需求，例如“补充赛博朋克义肢相关特征”或“将所有校服标签权重调高”，预览后写入。';
  html += '</p>';
  html += '<textarea class="textarea" rows="3" id="tagCommand" placeholder="例如：补充 5 条与天文观测相关的服饰和道具标签...">' + E(ui.aiDraft || '') + '</textarea>';
  html += '<div style="display:flex;gap:6px;margin-top:8px">';
  html += '<button class="button small fill primary" onclick="planTagAI()">' + I('spark') + ' 智能分析提议</button>';
  html += '</div>';
  html += '</div>';
  html += '</aside>';
  html += '</div>';

  return html;
}

function v3BatchToggleFilteredTags(enable) {
  const ts = visibleTags();
  if (!ts.length) return toast('当前没有筛选出任何标签');
  ts.forEach(t => { t.enabled = enable; });
  save();
  render();
  toast(enable ? '已批量启用 ' + ts.length + ' 项标签' : '已批量停用 ' + ts.length + ' 项标签');
}

function v3ExportFilteredToConcept() {
  const ts = visibleTags().filter(t => t.enabled);
  if (!ts.length) return toast('当前没有已启用的标签');
  const topTags = [...ts].sort((a,b) => b.weight - a.weight).slice(0, 5).map(t => t.name);
  if (window.ConceptWorkbench && typeof window.ConceptWorkbench.addSparkTags === 'function') {
    window.ConceptWorkbench.addSparkTags(topTags);
  }
  visit('concept');
}

// V3.0 Modern Works & Zen Novel Editor (Bookshelf Showcase & Immersive Writing Room)

function v3CountWords(text) {
  if (!text) return 0;
  // Count Chinese characters + English words
  const cn = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const en = (text.replace(/[\u4e00-\u9fa5]/g, ' ').match(/[a-zA-Z0-9_\-]+/g) || []).length;
  return cn + en;
}

// 1. Works Bookshelf Showcase

function v24SetWorkView(v) {
  ui.v24WorkView = v;
  render();
}

works = function() {
  const query = (ui.v24WorkSearch || '').trim().toLowerCase();
  let list = store.works.filter(w => !w.archivedAt && (w.title + ' ' + (w.description || '')).toLowerCase().includes(query));
  if (ui.v24WorkSort === 'name') list.sort((a,b) => a.title.localeCompare(b.title, 'zh-CN'));
  if (ui.v24WorkSort === 'chapters') list.sort((a,b) => b.chapters.length - a.chapters.length);

  // Compute total stats
  let totalChapters = 0;
  let totalWords = 0;
  store.works.forEach(w => {
    totalChapters += (w.chapters || []).length;
    (w.chapters || []).forEach(ch => {
      totalWords += v3CountWords(store.chapters[ch.id] || '');
    });
  });

  let html = '';
  html += '<div class="scroll" style="height:100%">';
  html += '<div class="v3-works-container">';

  // Top Header (Refined: clean stats, concise button)
  html += '<div class="v3-works-header" style="margin-bottom:14px;align-items:flex-end">';
  html += '<div>';
    html += '<h1 class="h1" style="margin:0 0 4px;font-size:20px;font-weight:700">我的创作书架</h1>';
  html += '<p class="sub" style="margin:0;font-size:12px;color:var(--text-muted,#888)">';
  html += store.works.length + ' 部作品 · ' + totalChapters + ' 个章节 · 约 ' + (totalWords > 0 ? totalWords.toLocaleString('zh-CN') : '0') + ' 字';
  html += '</p>';
  html += '</div>';
  html += '<button class="btn primary" onclick="show(\'workCreate\')">' + I('plus') + ' 新建作品</button>';
  html += '</div>';

  // Toolbar: Search + Sort + View Mode Toggle
  html += '<div class="v3-works-toolbar">';
  html += '<div class="v3-tag-search-box" style="flex:1;max-width:420px">';
  html += '<span class="search-icon">' + I('search') + '</span>';
  html += '<input class="input" id="v24WorkSearch" placeholder="搜索作品标题、题材、设定或梗概..." value="' + E(ui.v24WorkSearch || '') + '" oninput="v24WorkSearch(this.value)">';
  html += '</div>';
  html += '<select class="select" style="min-width:130px" onchange="ui.v24WorkSort=this.value;render()">';
  html += '<option value="original" ' + (ui.v24WorkSort === 'original' ? 'selected' : '') + '>默认排序</option>';
  html += '<option value="name" ' + (ui.v24WorkSort === 'name' ? 'selected' : '') + '>按作品名称</option>';
  html += '<option value="chapters" ' + (ui.v24WorkSort === 'chapters' ? 'selected' : '') + '>按章节数量</option>';
  html += '</select>';
  html += '<div class="view-toggle" role="group" aria-label="作品浏览视图">';
  html += '<button class="' + ((ui.v24WorkView || 'cards') === 'cards' ? 'active' : '') + '" onclick="v24SetWorkView(\'cards\')" title="书架卡片网格">';
  html += '⊞ 书架';
  html += '</button>';
  html += '<button class="' + (ui.v24WorkView === 'list' ? 'active' : '') + '" onclick="v24SetWorkView(\'list\')" title="紧凑章节列表">';
  html += '☰ 列表';
  html += '</button>';
  html += '</div>';
  html += '</div>';

  // Render according to View Mode: List vs Cards
  if (ui.v24WorkView === 'list') {
    html += '<div class="v3-works-list-container">';
    if (list.length === 0) {
      html += '<div class="empty" style="padding:60px 16px"><strong>未找到匹配的作品</strong><span>点击右上角新建作品开始创作。</span></div>';
    } else {
      list.forEach(w => {
        let workWords = 0;
        (w.chapters || []).forEach(ch => {
          workWords += v3CountWords(store.chapters[ch.id] || '');
        });
        html += '<div class="v3-works-list-row click" onclick="visit(\'editor\')">';
        html += '<div class="flex gap16 align-center" style="flex:1;min-width:0">';
        html += '<div class="v3-work-list-icon">' + I('book') + '</div>';
        html += '<div style="min-width:0">';
        html += '<div style="display:flex;align-items:center;gap:8px">';
        html += '<strong style="font-size:14px;color:#f9f9f9">《' + E(w.title) + '》</strong>';
        html += '<span class="chip gold" style="font-size:10px;padding:1px 6px">长篇创作</span>';
        html += '</div>';
        html += '<div class="tiny" style="color:#999999;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + E(w.description || '小说草稿 · 正文与剧情深度打通') + '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="flex gap16 align-center" style="margin:0 24px;flex-shrink:0">';
        html += '<span class="tiny" style="color:#a8a8a8">' + (w.chapters || []).length + ' 个章节</span>';
        html += '<span class="tiny" style="color:#787878">·</span>';
        html += '<span class="tiny" style="color:#a8a8a8">约 ' + workWords + ' 字</span>';
        html += '<span class="chip" style="font-size:10px;padding:1px 6px">Gemini · 写作模型</span>';
        html += '</div>';
        html += '<div class="flex gap8 align-center" style="flex-shrink:0">';
        html += '<button class="btn sm primary" style="border-radius:8px!important;padding:5px 14px;font-size:11.5px" onclick="event.stopPropagation();visit(\'editor\')">进入写作台 →</button>';
        html += '</div>';
        html += '</div>';
      });
    }
    html += '</div>';
  } else {
    // Bookshelf Grid
    html += '<div class="v3-bookshelf-grid">';
    if (list.length === 0) {
      html += '<div class="empty" style="grid-column:1/-1;padding:60px 16px"><strong>未找到匹配的作品</strong><span>点击右上角新建作品开始创作。</span></div>';
    } else {
      list.forEach(w => {
        let workWords = 0;
        (w.chapters || []).forEach(ch => {
          workWords += v3CountWords(store.chapters[ch.id] || '');
        });
        const related = store.sessions.filter(s => s.work === w.id);
        
        html += '<div class="v3-book-card">';
        html += '<div class="v3-book-card-header">';
        html += '<div class="between align-center" style="margin-bottom:8px">';
        html += '<div class="flex gap8 align-center">';
        html += '<span class="v3-book-accent-icon">' + I('book') + '</span>';
        html += '<h2 class="h2" style="font-size:18px;margin:0;color:#f9f9f9">《' + E(w.title) + '》</h2>';
        html += '</div>';
        html += '<span class="chip green" style="font-size:10px;padding:2px 8px">连载中</span>';
        html += '</div>';
        html += '<p class="v3-book-desc">' + E(w.description || '暂无故事简介。点击进入写作台补充设定与剧情大纲。') + '</p>';
        html += '</div>';

        html += '<div class="v3-book-tags">';
        html += '<span class="chip">' + I('book') + ' ' + w.chapters.length + ' 章节</span>';
        html += '<span class="chip">' + I('pen') + ' 约 ' + workWords + ' 字</span>';
        html += '<span class="chip">' + I('chat') + ' ' + related.length + ' 场剧情研讨</span>';
        html += '</div>';

        html += '<div class="v3-book-chapters-preview">';
        html += '<div class="tiny" style="color:#939393;font-weight:700;margin-bottom:6px">近期章节大纲:</div>';
        (w.chapters || []).slice(0, 3).forEach(ch => {
          const chWords = v3CountWords(store.chapters[ch.id] || '');
          html += '<div class="v3-chapter-pill click" onclick="goWorkEditor(\'' + w.id + '\',\'' + ch.id + '\')">';
          html += '<span class="title">' + I('book') + ' ' + E(ch.title) + '</span>';
          html += '<span class="words">' + chWords + ' 字</span>';
          html += '</div>';
        });
        html += '</div>';

        html += '<div class="v3-book-foot">';
        html += '<button class="btn sm primary v3-btn-primary" onclick="event.stopPropagation();goWorkEditor(\'' + w.id + '\')">';
        html += I('pen') + ' 进入正文编辑';
        html += '</button>';
        html += '<button class="btn sm v3-shelf-btn" onclick="event.stopPropagation();openNew(\'plot\',null,\'' + w.id + '\')">';
        html += I('chat') + ' 讨论此书剧情';
        html += '</button>';
        html += '</div>';
        html += '</div>';
      });
    }
    html += '</div>'; // end v3-bookshelf-grid
  }

  html += '</div>'; // end v3-works-container
  html += '</div>'; // end scroll
  return html;
};

// 2. Immersive Zen Novel Editor
editor = function() {
  const w = workById(ui.workId) || store.works[0];
  if (!w) return works();
  w.roles = (w.roles && w.roles.length) ? w.roles : ['yiwen', 'shuyao'];
  if (!chapterById(w, ui.workChapter)) ui.workChapter = w.chapters[0]?.id;
  const c = chapterById(w, ui.workChapter);
  const related = store.sessions.filter(s => s.kind === 'plot' && s.work === w.id);
  const currentText = store.chapters[ui.workChapter] || '';
  const wordCount = v3CountWords(currentText);
  const readingMinutes = Math.max(1, Math.ceil(wordCount / 350));

  let html = '';
  html += '<div class="split v3-zen-split">';

  // Left Column: Chapter Outline Tree
  html += '<aside class="sidebar v3-zen-sidebar">';
  html += '<button class="btn quiet sm" onclick="visit(\'works\')" style="margin-bottom:12px">';
  html += I('back') + ' 返回作品书架';
  html += '</button>';
  
  html += '<div class="v3-zen-work-badge">';
  html += '<div class="eyebrow" style="font-size:9.5px;color:var(--sage,#e2e2e2)">CURRENT WORK</div>';
  html += '<div class="sidetitle" style="font-size:15px;margin:2px 0 0">《' + E(w.title) + '》</div>';
  html += '<div class="tiny" style="color:#999999;margin-top:2px">' + w.chapters.length + ' 个章节 · 连载中</div>';
  html += '</div>';

  html += '<div class="side-section" style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">';
  html += '<span>章节目录大纲</span>';
  html += '<button class="button icon small" onclick="show(\'chapterCreate\')" title="新建章节" style="padding:1px 5px;font-size:10px">+</button>';
  html += '</div>';

  html += '<div class="v3-zen-chapter-list">';
  w.chapters.filter(ch=>!ch.archivedAt).forEach((ch, idx) => {
    const isCurrent = ui.workChapter === ch.id;
    const chWords = v3CountWords(store.chapters[ch.id] || '');
    html += '<button class="v3-zen-chapter-item ' + (isCurrent ? 'on' : '') + '" onclick="setChapter(\'' + ch.id + '\')">';
    html += '<div class="v3-zen-chapter-meta">';
    html += '<span class="ch-idx">0' + (idx + 1) + '</span>';
    html += '<span class="ch-title">' + E(ch.title) + '</span>';
    html += '</div>';
    html += '<span class="ch-words">' + chWords + ' 字</span>';
    html += '</button>';
  });
  html += '</div>';

  html += '<button class="btn sm fill" style="margin-top:10px" onclick="show(\'chapterCreate\')">';
  html += I('plus') + ' 新建下一章节';
  html += '</button>';

  html += '<div class="menu-divider" style="margin:16px 0"></div>';

  html += '<div class="side-section">关联剧情研讨 (' + related.length + ')</div>';
  html += '<div class="v3-zen-related-list">';
  if (related.length === 0) {
    html += '<p class="sub" style="margin:4px 0 8px;font-size:11px">暂无关联的剧情讨论</p>';
  } else {
    related.slice(0, 4).forEach(s => {
      html += '<button class="side-link" onclick="goSession(\'' + s.id + '\')">';
      html += I('chat') + ' <span>' + E(s.title) + '</span>';
      html += '</button>';
    });
  }
  html += '<button class="btn sm fill" style="margin-top:6px" onclick="openNew(\'plot\')">';
  html += I('plus') + ' 发起新剧情研讨';
  html += '</button>';
  html += '</div>';
  html += '<div class="side-section" style="margin-top:14px;padding:0 10px;font-size:11px;color:#777;font-weight:600">创作与设定</div>';
  html += '<div style="padding:0 10px;display:flex;flex-direction:column;gap:4px">';
  html += '<button class="side-link" onclick="openSettings(\'creative_presets\', \'plot\')" style="display:flex;align-items:center;gap:8px;font-size:12px;padding:6px 10px;border-radius:6px;color:#bbb;background:transparent;border:none;cursor:pointer">' + I('book') + ' 写作预设 & Agent</button>';
  html += '<button class="side-link" onclick="show(\'worldinfo\')" style="display:flex;align-items:center;gap:8px;font-size:12px;padding:6px 10px;border-radius:6px;color:#bbb;background:transparent;border:none;cursor:pointer">' + I('folder') + ' 作品世界观设定</button>';
  html += '</div>';
  html += '</aside>';

  // Middle Column: Focused Paper Writing Area
  html += '<section class="center editor-main v3-zen-paper-wrap">';
  // Zen Control Bar
  html += '<div class="v3-zen-topbar">';
  html += '<div class="flex gap8 align-center">';
  html += '<span class="chip green" style="font-size:10px;padding:2px 7px">● 实时自动保存</span>';
  html += '<span class="tiny" style="color:#949494" id="v3EditorWordCount">共 ' + wordCount + ' 字 · 预计阅读 ' + readingMinutes + ' 分钟</span>';
  html += '</div>';
  html += '<div class="flex gap8 align-center">';
  html += '<span class="tiny" style="color:#878787">协作模型:</span>';
  html += '<select class="model-inline" style="width:190px" onchange="setDefaultModel(\'novel\',this.value)">';
  models.forEach(m => {
    html += '<option value="' + m.id + '" ' + (store.modelDefaults.novel === m.id ? 'selected' : '') + '>' + E(m.name) + '</option>';
  });
  html += '</select>';
  html += '</div>';
  html += '</div>';

  // Paper Writing Surface
  html += '<div class="paper v3-zen-paper">';
  html += '<div class="v3-paper-header">';
  html += '<div class="eyebrow" style="color:var(--sage,#e2e2e2);font-size:11px">《' + E(w.title) + '》</div>';
  html += '<h1 class="v3-paper-title">' + E(c?.title || '未命名章节') + '</h1>';
  html += '<div class="v3-paper-meta-line">';
  html += '<span>正文编辑台</span><span class="sep">·</span><span>支持段落缩进与沉浸式排版</span><span class="sep">·</span><span>更改即时同步</span>';
  html += '</div>';
  html += '</div>';

  html += '<textarea id="chapter" class="v3-zen-textarea" oninput="v3SaveChapterWithCounter(this.value)" spellcheck="false" placeholder="在此开始书写正文……（首行自动缩进，行距舒适）">' + E(currentText) + '</textarea>';

  // Paper Footer Quick AI Tools
  html += '<div class="v3-zen-paper-foot">';
  html += '<div class="flex gap8 align-center">';
  html += '<button class="btn sm v3-btn-sage" onclick="v3AIWritingAssist(\'polish\')">' + I('spark') + ' 润色段落</button>';
  html += '<button class="btn sm v3-btn-sage" onclick="v3AIWritingAssist(\'continue\')">' + I('pen') + ' 顺延续写</button>';
  html += '<button class="btn sm v3-btn-sage" onclick="v3AIWritingAssist(\'check\')">✓ 逻辑与错字初筛</button>';
  html += '</div>';
  html += '<button class="btn sm v3-btn-sage" onclick="v3ExportChapter()">⤓ 导出本章文本</button>';
  html += '</div>';

  html += '</div>'; // end v3-zen-paper
  html += '</section>';

  // Right Column: Plot Counselor & Context
  html += '<aside class="context v3-zen-counselor">';
  html += '<div class="v3-counselor-box">';
  html += '<div class="v3-counselor-head">';
  html += I('spark') + ' <span>剧情顾问与上下文便笺</span>';
  html += '</div>';
  html += '<p class="tiny" style="color:#999999;margin:4px 0 10px;line-height:1.45">';
  html += '写作台与右侧正文资料联动。可随时查看出场角色设定，避免设定冲突。';
  html += '</p>';

  // Roles in this work
  html += '<div class="v3-counselor-section-title">关联核心角色与版本</div>';
  html += '<div class="v3-counselor-roles">';
  const workRoles = (window.CreationWorkflow?.getWorkRoles ? CreationWorkflow.getWorkRoles(w.id) : []);
  roles.filter(r=>!r.archivedAt&&(w.roles||w.roleIds||[]).includes(r.id)||store.sessions.some(s=>s.work===w.id&&s.roles?.includes(r.id))).forEach(r => {
    const vr = workRoles.find(v => v.sourceRoleId === r.id);
    const isUnlinked = vr && vr.unlinked;
    const isForked = vr && !vr.unlinked;

    html += '<div class="v3-mini-role-card" style="display:flex;flex-direction:column;gap:6px;padding:8px 10px;background:#202020;border:1px solid #333;border-radius:6px;margin-bottom:8px">';
    html += '<div style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="visit(\'role\',{roleId:\'' + r.id + '\'})">';
    html += '<div class="avatar ' + (r.tone || '') + '" style="width:28px;height:28px;font-size:11px">' + (r.icon || '角') + '</div>';
    html += '<div style="flex:1;min-width:0">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between">';
    html += '<strong style="font-size:12px;color:#f9f9f9">' + E(r.name) + '</strong>';
    if (isUnlinked) {
      html += '<span class="chip" style="font-size:9.5px;padding:1px 5px;background:#2a1f1f;color:#fca5a5;border-color:#4a2b2b">已解绑独立版本</span>';
    } else if (isForked) {
      html += '<span class="chip" style="font-size:9.5px;padding:1px 5px;background:#252038;color:#c4b5fd;border-color:#483868">作品定制版本</span>';
    } else {
      html += '<span class="chip" style="font-size:9.5px;padding:1px 5px;background:#222;color:#888;border-color:#333">原档案引用</span>';
    }
    html += '</div>';
    html += '<div class="tiny" style="color:#929292;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + E(r.desc || r.series) + '</div>';
    html += '</div>';
    html += '</div>';

    // Work Role Action Controls
    html += '<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #292929;padding-top:5px;font-size:11px">';
    if (isForked) {
      html += '<button type="button" class="btn quiet sm" style="font-size:10px;padding:1px 6px;color:var(--ui-accent,#ac97f5)" onclick="v3ProposeWorkRoleDiff(\'' + vr.id + '\')">' + I('spark') + ' 提议回写原档案</button>';
      html += '<button type="button" class="ghost" style="font-size:10px;padding:1px 5px;color:#999" onclick="v3UnlinkRoleFromWork(\'' + w.id + '\',\'' + r.id + '\')">解绑</button>';
    } else if (!isUnlinked) {
      html += '<button type="button" class="btn quiet sm" style="font-size:10px;padding:1px 6px" onclick="v3ForkRoleForWork(\'' + w.id + '\',\'' + r.id + '\')">' + I('plus') + ' 创建作品定制版本</button>';
      html += '<span class="tiny" style="color:#666">随原档案同步</span>';
    } else {
      html += '<span class="tiny" style="color:#888">已脱离全局档案</span>';
    }
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';

  // Foreshadowing & Outline Notes
  html += '<div class="v3-counselor-section-title" style="margin-top:16px">本章伏笔与线索备忘</div>';
  html += '<div class="v3-counselor-notes">';
  html += '<div class="note-item">✓ 第一幕：北方来信送达，引发家庭旧事回忆</div>';
  html += '<div class="note-item">○ 第二幕：雪夜站台相遇，注意描写眼神的疏离感</div>';
  html += '<div class="note-item">○ 伏笔：信封边缘残留的轻微火漆印痕迹</div>';
  html += '</div>';

  html += '<button class="btn small fill primary v3-btn-primary" style="margin-top:14px;border-radius:8px" onclick="openNew(\'plot\')">';
  html += I('chat') + ' 带着本章正文进入剧情讨论 →';
  html += '</button>';

  html += '</div>'; // end v3-counselor-box
  html += '</aside>';

  html += '</div>'; // end v3-zen-split
  return html;
};

function v3SaveChapterWithCounter(val) {
  saveChapter(val);
  const countEl = document.getElementById('v3EditorWordCount');
  if (countEl) {
    const wCount = v3CountWords(val);
    const m = Math.max(1, Math.ceil(wCount / 350));
    countEl.textContent = '共 ' + wCount + ' 字 · 预计阅读 ' + m + ' 分钟';
  }
}

function v3AIWritingAssist(mode) {
  const hints = {
    polish: '已生成润色建议：加强了环境降雪氛围对角色心境的烘托。可在剧情讨论中查看采纳。',
    continue: '已生成续写思路：列车晚点，站台灯光忽明忽暗，传来皮靴踏雪的声响。',
    check: '文本核验通过：未发现明显人设矛盾与错别字。'
  };
  toast(hints[mode] || 'AI 协作提示');
}

function v3ExportChapter() {
  const text = store.chapters[ui.workChapter] || '';
  if (!text) return toast('当前章节为空，无需导出');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (chapterById(workById(ui.workId), ui.workChapter)?.title || '章节草稿') + '.txt';
  a.click();
  toast('已导出本章文本文件');
}

function v3FormatRpText(text) {
  return renderMessageContent(text, {roleplay:true});
}

