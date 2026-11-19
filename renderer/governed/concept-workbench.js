window.initializeConceptWorkbench=function(){'use strict';
const KEY='st-character-concepts-v3',PREV_KEY='st-character-concepts-v2',OLD_KEY='tag-composer-prototype-v1';
const DIRECTION_PRESETS={
 campus:'围绕校园生态探索不同人物：学生身份、教职人员、社团组织、日常职责与校园关系',
 nationality:'围绕不同国家与地域背景探索角色身份，不根据国籍预设性格，可以延伸至城市和个人生活经历',
 career:'从不同职业身份、技能与工作环境自由探索人物，不局限于已有职业分类',
 fantasy:'从奇幻种族、身体特征、民俗与虚构文化探索角色，可以适度跨越已有标签分类'
};
// Deliberately curated OFFLINE DEMO only; any unrestricted/custom exploration needs an AI call.
const DIRECTION_LIBRARY={
 campus:{title:'校园生态',branches:[
  {id:'students',name:'学生群体',summary:'身份、成绩、运动与学生生活',concepts:[
   {coarse:'体育生',medium:'女子田径队短跑选手',fine:'因伤退队后负责管理起跑器的短跑选手',category:'校园身份',thread:'她把秒表挂在脖子上，虽然不再参加正式比赛，却仍会在操场边为低年级队员计时。',hook:'不再站上跑道的短跑选手'},
   {coarse:'转学生',medium:'学期中途入学的转学生',fine:'每周都会为旧学校寄明信片的转学生',category:'校园身份',thread:'她的课桌抽屉里塞满寄往远方的明信片，似乎还在努力把两座城市的生活接起来。',hook:'带着两座城市记忆的转学生'},
   {coarse:'优等生',medium:'常年占据年级前三的学生',fine:'把课堂错题抄在旧车票背面的优等生',category:'校园身份',thread:'她的笔记整理得井井有条，只有那些贴在课本里的旧车票透露出另一段不为人知的日常。',hook:'把错题写在旧车票上的学生'}]},
  {id:'staff',name:'教职岗位',summary:'教师、管理者与校园服务角色',concepts:[
   {coarse:'教导主任',medium:'刚上任的年轻女教导主任',fine:'保留了十年前毕业生留言簿的女教导主任',category:'校园岗位',thread:'她每天在走廊里检查纪律，却会把历届学生写下的留言认真收进办公室的旧抽屉。',hook:'收藏毕业生留言的教导主任'},
   {coarse:'校长',medium:'临时代理校长',fine:'在旧校舍重建期间接任的代理女校长',category:'校园岗位',thread:'她每天绕着即将拆除的教学楼走一圈，在施工图上留下许多没有解释的批注。',hook:'守着旧校舍的代理校长'},
   {coarse:'校医',medium:'兼管心理辅导室的校医',fine:'把植物养在校医室窗台的驻校医生',category:'校园岗位',thread:'她把一排绿植摆在医疗室窗台，学生们常以借创可贴为由来向她说出烦恼。',hook:'窗台上养满植物的校医'}]},
  {id:'clubs',name:'社团与组织',summary:'学生会、广播站、兴趣社团',concepts:[
   {coarse:'广播站成员',medium:'午间校园广播主持',fine:'每天在放学铃响前播放一首冷门歌曲的广播员',category:'校园组织',thread:'她负责午间广播，偶尔会在当天节目最后插播一首没有写在节目单上的旧歌。',hook:'为放学铃准备秘密曲目的广播员'},
   {coarse:'学生会成员',medium:'学生会宣传部负责人',fine:'为每场校园活动手绘海报的宣传部长',category:'校园组织',thread:'她拒绝使用现成模板，每一张海报里都藏着一处只有熟人才看得懂的小标记。',hook:'从不重复海报设计的宣传部长'},
   {coarse:'天文社成员',medium:'负责观测记录的天文社骨干',fine:'坚持记录教学楼屋顶光污染变化的天文社员',category:'校园组织',thread:'她的观测本写满光照数据，即使无法再看见星星，也从未停止记录天空。',hook:'在灯光里坚持记录星空的人'}]},
  {id:'duties',name:'校园职责',summary:'班级分工、日常值班与隐秘惯例',concepts:[
   {coarse:'课代表',medium:'数学课代表',fine:'每天替请假同学整理课堂笔记的数学课代表',category:'校园职责',thread:'她按时收齐每一本作业，却总会额外带一份课堂笔记，留给那个经常缺席的同学。',hook:'总在教室多留一份笔记的课代表'},
   {coarse:'图书管理员',medium:'学生图书馆志愿管理员',fine:'为无人借阅的旧书修补书脊的图书管理员',category:'校园职责',thread:'她每周都把积灰的旧书抱到窗边修补书脊，悄悄期待有人再次翻开它们。',hook:'修补旧书的图书馆志愿者'},
   {coarse:'值日班长',medium:'负责晨检的值日班长',fine:'每天提前十分钟为迟到同学留门的值日班长',category:'校园职责',thread:'她认真登记每一位到校同学，偏偏总会在某个熟悉的脚步声出现时稍稍放慢落笔。',hook:'每天提前十分钟到教室的值日班长'}]}
 ]},
 nationality:{title:'国籍与地域',branches:[
  {id:'east-asia',name:'东亚',summary:'在具体城市与个人经历中展开',concepts:[
   {coarse:'日本',medium:'来自京都的交换生',fine:'从京都转来、随身带着手写家书的交换生',category:'国籍与地域',thread:'她正努力适应新的课堂节奏，闲暇时仍坚持用纸笔写家书，把两地日常认真记录下来。',hook:'把家书折进课本的交换生'},
   {coarse:'韩国',medium:'来自釜山的转学生',fine:'从釜山转来、曾参加校园广播社的学生',category:'国籍与地域',thread:'她原先负责学校广播，到新学校后仍习惯收集不同语言的校园广播开场白。',hook:'收集广播开场白的转学生'},
   {coarse:'中国',medium:'来自成都的异地学生',fine:'从成都转学、习惯在周末整理家乡照片的学生',category:'国籍与地域',thread:'她的相册里装满家乡巷口的照片，常在新城市寻找相似的生活细节。',hook:'带着家乡照片来到新校园的人'}]},
  {id:'europe',name:'欧洲',summary:'国家、城市与跨文化学习经历',concepts:[
   {coarse:'法国',medium:'来自马赛的交换生',fine:'从马赛来的交换生兼校园摄影社新人',category:'国籍与地域',thread:'她第一次加入校园摄影社，拿着旧胶片相机拍下那些对本地同学而言再普通不过的走廊与街道。',hook:'用胶片记录新校园的马赛学生'},
   {coarse:'波兰',medium:'来自克拉科夫的学生',fine:'从克拉科夫搬来、喜欢给旧乐谱修订边注的学生',category:'国籍与地域',thread:'她带来的旧乐谱写满家人的手迹，现在又开始把新学校合唱团的练习记录补在边缘。',hook:'在旧乐谱上写下新生活的学生'},
   {coarse:'意大利',medium:'来自都灵的转学生',fine:'从都灵转学、加入了校园机器人社的学生',category:'国籍与地域',thread:'她在机器人社里专注修理电机，手边一直放着父亲送的旧工具盒。',hook:'带着旧工具盒的转学生'}]},
  {id:'mena',name:'北非与西亚',summary:'地域背景、求学经历与文化接触',concepts:[
   {coarse:'埃及',medium:'来自亚历山大的学生',fine:'从亚历山大来到新校园的历史社成员',category:'国籍与地域',thread:'她在历史社整理城市旧照片，特别喜欢比较不同港口的老街景。',hook:'收集港口旧照片的历史社成员'},
   {coarse:'土耳其',medium:'来自伊兹密尔的学生',fine:'从伊兹密尔转来、在新学校组织语言交换的学生',category:'国籍与地域',thread:'她给语言交换活动设计了小卡片，记录同一个词在不同语言中的发音和故事。',hook:'把语言交换办成小型社团的学生'},
   {coarse:'摩洛哥',medium:'来自拉巴特的交换生',fine:'从拉巴特交换来、每周写一篇校园观察的学生',category:'国籍与地域',thread:'她把陌生校园里细碎的观察写成短篇日记，学期结束时准备装订成一本小册子。',hook:'把校园观察写成小册子的交换生'}]},
  {id:'americas',name:'美洲',summary:'不同教育环境与城市生活经验',concepts:[
   {coarse:'巴西',medium:'来自累西腓的交换生',fine:'来自累西腓、报名了校园电影社的交换生',category:'国籍与地域',thread:'她报名电影社后开始拍摄教室窗外的日常，打算把新城市的一学期剪成短片。',hook:'把交换学期拍成短片的学生'},
   {coarse:'加拿大',medium:'来自温哥华的学生',fine:'从温哥华转来、参与校园志愿项目的学生',category:'国籍与地域',thread:'她喜欢在志愿活动结束后整理照片，并把小组里每个人的名字认真写在背面。',hook:'在照片背面记名字的志愿者'},
   {coarse:'墨西哥',medium:'来自瓜达拉哈拉的学生',fine:'从瓜达拉哈拉来到新学校的戏剧社成员',category:'国籍与地域',thread:'她在戏剧社负责道具整理，渐渐为每一件破旧道具编出一段小小的来历。',hook:'给道具编故事的转学生'}]}
 ]},
 career:{title:'职业身份',branches:[
  {id:'science',name:'科研与技术',summary:'实验室、工程岗位与技术工作',concepts:[
   {coarse:'研究员',medium:'无线电研究助理',fine:'专门修复旧无线电记录的研究助理',category:'职业身份',thread:'她每晚把旧录音中几乎听不见的呼号记在笔记本上，像是在等某个人答复。',hook:'寻找旧无线电呼号的人'},
   {coarse:'工程师',medium:'机械维修工程师',fine:'把退休机器零件做成手工玩具的维修工程师',category:'职业身份',thread:'她把每一颗更换下来的零件清洗干净，再拼成小小的活动雕塑。',hook:'用旧零件造玩具的工程师'}]},
  {id:'arts',name:'艺术与传播',summary:'视觉艺术、传播与创意表达',concepts:[
   {coarse:'摄影师',medium:'校园纪录摄影师',fine:'专门拍摄毕业季空教室的纪录摄影师',category:'职业身份',thread:'她总在毕业典礼结束之后留下，拍下只剩阳光和纸屑的教室。',hook:'拍摄空教室的摄影师'},
   {coarse:'音乐人',medium:'独立声音设计师',fine:'专门收集城市夜晚环境音的声音设计师',category:'职业身份',thread:'她把街角风声、便利店门铃和晚班公交的声音剪辑成一首首短曲。',hook:'把城市杂音剪成音乐的人'}]},
  {id:'service',name:'公共与服务',summary:'医疗、管理、服务和人际工作',concepts:[
   {coarse:'医生',medium:'校医院实习医生',fine:'每天给深夜值班室换鲜花的实习医生',category:'职业身份',thread:'她总在最忙的工作日后留下一束鲜花，让值班室多一点生活气息。',hook:'在值班室摆鲜花的实习医生'},
   {coarse:'管理员',medium:'旧档案馆管理员',fine:'会为无名照片写说明的档案馆管理员',category:'职业身份',thread:'她整理档案时会给没有标注的人像补上一段温柔的猜想，却把它们单独收进虚构档案盒。',hook:'替无名照片写故事的管理员'}]}
 ]},
 fantasy:{title:'奇幻种族与文化',branches:[
  {id:'beings',name:'异族与混血',summary:'非人角色与生物特征',concepts:[
   {coarse:'猫娘',medium:'黑猫族转学生',fine:'在校舍屋顶寻找消失猫神的黑猫族转学生',category:'种族',thread:'她的猫耳总比本人更早察觉访客，袖口还藏着一枚旧神殿留下的铜铃。',hook:'在屋顶寻找旧猫神的转学生'},
   {coarse:'精灵',medium:'半精灵图书管理员',fine:'专门修复树叶制成的旧书页的半精灵管理员',category:'种族',thread:'她用极薄的叶片修补书页，似乎能从书脊里听见森林的风声。',hook:'修补叶片书页的半精灵'}]},
  {id:'constructs',name:'人工生命',summary:'人造身体、意识与存在形式',concepts:[
   {coarse:'机器人',medium:'校园机器人实习生',fine:'偷偷收藏旧学生证的校园机器人实习生',category:'角色类型',thread:'她的胸前口袋里装着一张过期学生证，证件照上的表情与今天几乎没有变化。',hook:'收藏旧学生证的机器人'},
   {coarse:'机械人偶',medium:'机械义体人偶',fine:'用手工修理自己的旧式人偶',category:'角色类型',thread:'她能熟练拆装腕部关节，却始终舍不得更换那枚已经磨损的发条。',hook:'舍不得更换发条的人偶'}]},
  {id:'lore',name:'传说与仪式',summary:'民俗母题、约定与奇幻日常',concepts:[
   {coarse:'古老誓约',medium:'守护古钟的誓约者',fine:'只在午夜为学校古钟上弦的守约人',category:'文化母题',thread:'她每晚走进无人使用的钟楼，准时为那座不会报时的古钟上弦。',hook:'为静止古钟上弦的人'},
   {coarse:'狐火',medium:'掌灯的狐族使者',fine:'在雨夜引路却从不留下脚印的狐火使者',category:'文化母题',thread:'她只在下雨的夜晚提灯出门，路边水洼映出灯火，却照不见她的鞋印。',hook:'雨夜里没有脚印的掌灯人'}]}
 ]}
};
function directionProfile(direction){
 const s=String(direction||'').trim();if(!s)return 'none';
 // Offline recognizer intentionally handles only named presets and simple topic keywords.
 // Longer natural-language instructions are passed to external AI without pretending a keyword pool understood them.
 for(const [key,text] of Object.entries(DIRECTION_PRESETS))if(s===text)return key;
 const simple=s.replace(/^(探索|围绕|按照|关于|从|尝试|请探索|请围绕)\s*/, '').replace(/(的)?(方向|主题|自由探索|角色探索|题材|相关元素)$/, '').trim();
 if(/^(国籍|不同国籍|不同国家|国家|各国|地域|国籍地域)$/.test(simple))return 'nationality';
 if(/^(校园|校园生态|学校|校园角色)$/.test(simple))return 'campus';
 if(/^(职业|职业身份|行业职业)$/.test(simple))return 'career';
 if(/^(奇幻|奇幻种族|种族|兽耳种族)$/.test(simple))return 'fantasy';
 return 'custom';
}
function dirBranches(){const ex=state.explorer||defaultExplorer();const key=directionProfile(ex.direction);const lib=DIRECTION_LIBRARY[key];if(lib)return lib.branches;
 return ex.aiDirection===ex.direction&&ex.aiBranches?.length?ex.aiBranches.map((b,i)=>({id:b.id||'ai-'+i,name:b.name,summary:b.summary||'来自外部 AI 的探索分支',concepts:[]})):[];}
function directionTitle(key=directionProfile(state.explorer.direction)){return DIRECTION_LIBRARY[key]?.title|| (key==='none'?'不限方向':'自定义主题')}
function parseBranchList(value){if(!Array.isArray(value))return [];return value.slice(0,12).filter(x=>x&&typeof x.name==='string'&&x.name.trim()&&x.name.length<=42).map((x,i)=>({id:'ai-'+i,name:x.name.trim(),summary:String(x.summary||'').slice(0,180)}));}
function conceptFromBranch(branch,rng,used,depth){const available=(branch.concepts||[]).filter(x=>!used.includes(x[depth]||x.medium||x.coarse)&&!state.excluded.some(z=>String(x[depth]||x.medium||x.coarse).includes(z)));
 if(!available.length)return null;const c=available[Math.floor(rng()*available.length)];return {tag:c[depth]||c.medium||c.coarse,category:c.category||'未分类',thread:c.thread||'',hook:c.hook||'',branch:branch.name,branchId:branch.id,status:'proposal',from:'offline-directed-demo',level:depth};}
function sampleDirectedFree(rng,existing=[],skip='',profile=null,primaryBranchId=null){const branches=DIRECTION_LIBRARY[profile||directionProfile(state.explorer.direction)]?.branches||[];const focus=primaryBranchId||state.explorer.focus;let candidates=focus&&focus!=='auto'?branches.filter(b=>b.id===focus):branches;
 if(!candidates.length)candidates=branches;if(!candidates.length)return null;const shuffled=[...candidates].sort(()=>rng()-.5);for(const branch of shuffled){const item=conceptFromBranch(branch,rng,[...existing,skip],state.explorer.depth);if(item&&!catIds(state).some(k=>state.library[k].items.some(t=>t[0]===item.tag)))return item;}return null;}
const FREE_POOL=[
 {tag:'猫娘',category:'种族',thread:'她习惯在午后的屋顶躲开喧闹，细小的猫耳却总比本人更早察觉有人靠近。'},
 {tag:'古埃及',category:'文化元素',thread:'一枚古埃及风格的青金石护符随她走进现代校园，吊坠背面刻着早已失传的名字。'},
 {tag:'独臂骑士',category:'身份与经历',thread:'她失去一只手臂后仍保留着旧日宣誓的动作，仿佛习惯比伤口更难改变。'},
 {tag:'失落的星图',category:'故事母题',thread:'她在旧天文教室找到半幅星图，图上记录着一颗不曾出现在任何课本里的星。'},
 {tag:'冬季列车',category:'场景主题',thread:'放学时，她总去站台等一班不会停靠这座城市的冬季列车。'},
 {tag:'旧式无线电',category:'道具与技术',thread:'她的书包里常放着一台旧式收音机，每到黄昏便收到一段陌生的呼号。'},
 {tag:'纸鹤信使',category:'身份与经历',thread:'她在抽屉里积攒折好的纸鹤，每一只都写着一封没有寄出的短笺。'},
 {tag:'月食仪式',category:'故事母题',thread:'她总会提前记下月食的时间，却从不解释那天为什么必须待在图书馆。'},
 {tag:'机械义肢',category:'身体特征',thread:'她的袖口下藏着一截磨损的轻型机械义肢，关节传来很轻的金属声。'},
 {tag:'古希腊',category:'文化元素',thread:'她在校刊上画满古希腊柱式与残缺石像，像是在整理某个遗落的文明。'},
 {tag:'沙漠考古',category:'背景主题',thread:'她从不把书包底层的沙粒清理干净，说那是某次夏天留下的纪念。'},
 {tag:'漂流灯塔',category:'场景主题',thread:'她画过一座漂流的灯塔，灯塔的光只会照向被遗忘的海岸。'},
 {tag:'钟表修复师',category:'职业与技能',thread:'她能修复坏掉的机械表，却总把自己的腕表停在同一分钟。'},
 {tag:'隐秘猫神',category:'故事母题',thread:'她在笔记页角反复描绘一尊无名猫神像，画完又悄悄擦去。'},
 {tag:'气象观测员',category:'职业与技能',thread:'她每天记录云层与风向，连校舍外一次细微的气压变化都不会错过。'},
 {tag:'异界邮差',category:'身份与经历',thread:'她总收到收件人不存在的信，信封上却有学校的真实邮戳。'},
 {tag:'水下图书馆',category:'场景主题',thread:'她梦见一座浸在水中的图书馆，书页却始终保持干燥。'},
 {tag:'古老誓约',category:'故事母题',thread:'她认真对待一些无人知晓的约定，仿佛违背它们会失去比成绩更重要的东西。'},
 {tag:'日蚀社团',category:'组织与身份',thread:'她参加了一个只有两名成员的社团，活动记录却写满整整十年的日期。'},
 {tag:'北境游骑兵',category:'身份与经历',thread:'她仍保存着一枚来自北境的旧徽章，没人知道它为何出现在校园里。'},
 {tag:'玻璃温室',category:'场景主题',thread:'她在教学楼顶照料一间废弃的玻璃温室，花朵开得与季节完全相反。'},
 {tag:'无声歌剧',category:'艺术主题',thread:'她收藏着没有声音的歌剧唱片，封套上的演员每年都会少一个人。'},
 {tag:'人造羽翼',category:'身体特征',thread:'她总把一副折叠的人造羽翼藏在更衣柜里，羽片上留着手工修补的痕迹。'},
 {tag:'古代天文学',category:'学科主题',thread:'她用旧历法计算星象，推算出的日子常比现代天文台早上一夜。'}
];
const $=s=>document.querySelector(s), $$=s=>Array.from(document.querySelectorAll(s));
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
const catIds=s=>Object.keys(s.library);
const defaultExplorer=()=>({direction:DIRECTION_PRESETS.campus,depth:'medium',breadth:'diverse',focus:'auto',aiBranches:[],aiDirection:''});
const defaultState=()=>({version:3,library:{},fixed:[],excluded:[],explore:{},weights:{},freeSlots:2,style:'balanced',showNames:false,count:4,mode:'algorithm',filter:'all',batch:0,lastSeed:null,nextId:1,selected:null,compare:[],candidates:[],drafts:[],explorer:defaultExplorer()});
let state=defaultState(),modalType='',comparePicks={},draftID=null,toastTimer;
function migrate(){
 try{const saved=JSON.parse(WorkspaceStorage.getItem(KEY));if(saved?.version===3&&saved.data){state={...defaultState(),...saved.data};state.explorer={...defaultExplorer(),...(state.explorer||{})};return;}}catch{}
 try{const prev=JSON.parse(WorkspaceStorage.getItem(PREV_KEY));if(prev?.version===2&&prev.data){state={...defaultState(),...prev.data,version:3,explorer:defaultExplorer()};save();return;}}catch{}
 try{const old=JSON.parse(WorkspaceStorage.getItem(OLD_KEY));if(old?.version!==1||!old.data)return;const d=old.data;state={...defaultState(),fixed:Array.isArray(d.fixed)?d.fixed:['女性','校园题材'],excluded:Array.isArray(d.excluded)?d.excluded:[],explore:{...state.explore,...(d.explore||{})},weights:d.weights||{},count:d.count||4,batch:d.batch||0,nextId:d.nextId||1,lastSeed:d.lastSeed??null,drafts:[],candidates:(d.candidates||[]).map(c=>({...c,free:[],narrative:null,history:c.history||[],locked:c.locked||{}})),selected:d.selected,compare:[]};
 for(const c of state.candidates)refreshConcept(c);save();}catch{}
}
function save(){try{tagBridge.commit();WorkspaceStorage.writeJSON(KEY,{version:3,data:{...state,library:{},weights:{}}});window.CreationWorkflow?.syncConcepts(state.candidates);}catch(e){notice('保存失败：'+e.message);throw e;}}
function notice(msg){const node=$('#toast');node.textContent=msg;node.style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.style.display='none',2700)}
function randSeed(){if(crypto?.getRandomValues){const n=new Uint32Array(1);crypto.getRandomValues(n);return n[0]}return (Date.now()>>>0)}
function seeded(s){let a=s>>>0;return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return ((t^t>>>14)>>>0)/4294967296}}
function nextId(){return 'C'+String(state.nextId++).padStart(3,'0')}
function weighted(k,rng,except=''){const cfg=state.library[k];if(!cfg)return null;const items=cfg.items.filter(x=> !state.excluded.includes(x[0])&&!(x[2]||[]).some(z=>state.excluded.includes(z))&&Number(state.weights?.[k]?.[x[0]]??x[1])>0);let arr=items.filter(x=>x[0]!==except);if(!arr.length)arr=items;if(!arr.length)return null;const total=arr.reduce((sum,x)=>sum+Number(state.weights?.[k]?.[x[0]]??x[1]),0);let p=rng()*total;for(const x of arr){p-=Number(state.weights?.[k]?.[x[0]]??x[1]);if(p<0)return x[0]}return arr.at(-1)[0]}
// Secondary slots are complementary details, not additional mutually exclusive main identities.
// This prevents implausible combinations such as "校长 + 课代表" inside one candidate.
const SUPPORT_SEEDS={
 students:['旧校刊','折角的课程表','放学后的空教室','一张未寄出的明信片','磨旧的运动计时器','写满批注的借阅卡','学生节旧合影'],
 staff:['历届毕业生留言簿','旧校舍修缮图','贴满便利贴的会议手册','校庆合影','图书室备用钥匙','校园巡查路线图','尚未拆封的毕业信'],
 clubs:['社团活动室钥匙','十年前的社团照片','没有署名的活动海报','广播节目单','褪色的社团旗帜','社团借用登记簿','无人认领的奖杯'],
 duties:['班级值日登记表','压在书页间的值班纸条','借阅卡上的铅笔字','粉笔灰沾到的袖口','教室门的备用钥匙','课本背面的备忘录','每周更换的值日名单'],
 'east-asia':['两地的列车时刻表','家乡的旧明信片','语言交换记录卡','折叠的城市地图','社团合照','跨校笔友信','手抄的家常菜谱'],
 europe:['胶片照片底片','交换生宿舍地图','旧音乐会票根','写满注释的城市图册','二手唱片','手写邮寄地址','校园剧场节目单'],
 mena:['港口城市老照片','旧城区速写本','不同语言的问候卡片','博物馆门票','校刊采访记录','一册手写旅行笔记','家乡街道地图'],
 americas:['校园短片分镜本','寄回家乡的照片','社团活动剪报','城市地铁路线图','交换日记','旧比赛入场券','周末志愿服务记录'],
 science:['实验室旧记录本','反复修过的螺丝刀','泛黄的电路草图','用过的测量仪','写着频率的便签','长年保留的检修清单','几次失败的实验标记'],
 arts:['背面有日期的照片','演出废弃节目单','一盘未命名录音带','旧颜料盒','手工修补的画框','一张铅笔速写','没有寄出的展览邀请函'],
 service:['值班室的植物','一本旧访客登记册','已经磨软的工作证套','备份钥匙','工作台边的保温杯','一张手写感谢卡','迟到的交接记录'],
 beings:['缝在衣角的铃铛','藏在课本里的叶片','一枚旧神殿徽章','屋顶晒太阳的位置','某次节日的邀请函','不肯离身的护身符','记录梦境的小册子'],
 constructs:['旧型号说明书','被小心保管的发条','磨损的充电插头','旧学生证','手工缝制的布套','不再生产的备用零件','记着第一次维修日期的标签'],
 lore:['无声的古钟','一封未兑现的约定书','雨夜残留的灯火','褪色的祭典纸签','被遗忘的旧历法','月食时留下的笔记','磨旧的引路铃']
};
function supportConcept(branch,depth,rng,used,excluded){
 const items=SUPPORT_SEEDS[branch.id]||[];
 const available=items.filter(t=>!used.includes(t)&&!excluded.some(x=>t.includes(x)));
 if(!available.length)return null;
 const tag=available[Math.floor(rng()*available.length)];
 return {tag,category:'生活与视觉线索',thread:`她把${tag}小心收在随身物品里，像是在为一段记忆留下证据。`,hook:'',branch:branch.name,branchId:branch.id,level:depth,kind:'support',status:'proposal',from:'offline-directed-demo'};
}
function sampleFree(rng,existing=[],excludeName='',snapshot=null,branchOverride=null,kind='primary'){
 const ex=snapshot||state.explorer,profile=directionProfile(ex.direction),taken=[...existing,excludeName,...state.excluded,...state.fixed,...catIds(state).flatMap(k=>state.library[k].items.map(t=>t[0]))];
 if(DIRECTION_LIBRARY[profile]){
  const branches=DIRECTION_LIBRARY[profile].branches,options=branchOverride?branches.filter(b=>b.id===branchOverride):ex.focus&&ex.focus!=='auto'?branches.filter(b=>b.id===ex.focus):branches;
  if(!options.length)return null;
  const candidates=[];for(const branch of options){
   if(kind==='support'){
    const labels=(SUPPORT_SEEDS[branch.id]||[]).filter(name=>!taken.includes(name)&&!state.excluded.some(ex=>name.includes(ex)));
    for(const name of labels)candidates.push({tag:name,category:'生活与视觉线索',thread:`她将${name}留在手边，仿佛那是连接日常与某段记忆的微小线索。`,hook:'',branch:branch.name,branchId:branch.id,level:ex.depth,kind:'support',status:'proposal',from:'offline-directed-demo'});
   }else for(const c of branch.concepts){const name=c[ex.depth]||c.medium||c.coarse;if(!taken.includes(name)&&!state.excluded.some(t=>name.includes(t)))candidates.push({tag:name,category:c.category,thread:c.thread,hook:c.hook,branch:branch.name,branchId:branch.id,level:ex.depth,kind:'primary',status:'proposal',from:'offline-directed-demo'});}
  }
  if(!candidates.length)return null;return clone(candidates[Math.floor(rng()*candidates.length)]);
 }
 if(profile==='custom')return null;
 const choices=FREE_POOL.filter(x=>!taken.includes(x.tag)&&!state.excluded.some(t=>x.tag.includes(t)));if(!choices.length)return null;return {...clone(choices[Math.floor(rng()*choices.length)]),status:'proposal',from:'offline-demo'};
}
function chooseFree(rng,amount,index=0,roundBranch=null,ex=state.explorer){
 const profile=directionProfile(ex.direction),lib=DIRECTION_LIBRARY[profile];if(!lib){const out=[];for(let i=0;i<amount;i++){const x=sampleFree(rng,out.map(y=>y.tag),'',ex);if(x)out.push(x);}return out;}
 const branches=lib.branches,forced=ex.focus!=='auto'?branches.find(x=>x.id===ex.focus):null;
 const branch=forced||(ex.breadth==='focused'&&roundBranch?roundBranch:branches[index%branches.length]);
 const out=[];for(let i=0;i<amount;i++){
  const x=sampleFree(rng,out.map(y=>y.tag),'',ex,branch?.id,i===0?'primary':'support');if(x)out.push(x);
 }
 return out;
}
function signature(tags,free){return catIds(state).map(k=>tags[k]||'-').join('|')+'::'+(free||[]).map(x=>x.tag).sort().join('|')}
const REF={
  '银白短发':'银白色短发','黑色长发':'黑色长发','棕色双马尾':'棕色双马尾','蓝黑侧马尾':'蓝黑色侧马尾','深栗色低马尾':'深栗色低马尾','灰紫色中长发':'灰紫色中长发',
  '深色西式校服':'剪裁干净的深色校服','白衬衫与百褶裙':'白衬衫与百褶裙','针织背心套装':'柔软的针织背心与制服裙','校园运动外套':'略显宽大的校园运动外套','浅色水手服':'浅色水手服','简约学院西装':'版型挺括的学院西装','简约职业套装':'剪裁利落的深色职业套装','米白色针织开衫':'米白色针织开衫','深色衬衫与长裙':'深色衬衫和简洁的长裙',
  '细框眼镜':'细框眼镜','简约发夹':'发间的素色发夹','运动护腕':'已经磨旧的运动护腕','书包挂饰':'书包边的小小挂饰','小型耳饰':'一枚低调的耳饰','纯色发带':'素色发带','无装饰':'几乎没有额外装饰',
  '沉静':'安静而克制','开朗':'明亮又坦率','自信':'笃定而自信','内敛':'内敛而谨慎','俏皮':'带着一点狡黠','理性':'冷静而理性'
};
const HOOKS={
 '猫娘':'在天台晒太阳的猫耳转学生','古埃及':'校服袖口藏着古老的沙漠纹样','独臂骑士':'仍然记得骑士誓言的少女','旧式无线电':'黄昏时分收到陌生呼号的学生','失落的星图':'寻找课本里不存在的那颗星','冬季列车':'每天等一班不存在的列车','月食仪式':'把月食日期写满笔记本的少女','机械义肢':'把机械关节藏进校服袖口的学生','纸鹤信使':'为无人收信的地址折纸鹤','古希腊':'在校刊里描摹断裂石柱的学生','钟表修复师':'让所有钟表停在同一分钟的少女','漂流灯塔':'反复画着不存在海岸线的人','隐秘猫神':'课本角落画着无名猫神的转学生','古老誓约':'仍遵守着一份无人记得的约定','沙漠考古':'从校外带回一袋细沙的转学生','气象观测员':'记录着一场无人察觉的暴风雨','异界邮差':'总替陌生人领取来信的少女','水下图书馆':'梦见过水下图书馆的读书人','日蚀社团':'只有两名社员的日蚀研究会','北境游骑兵':'把北境徽章别在校服里的少女','玻璃温室':'守护屋顶废弃温室的学生','无声歌剧':'收藏着无声唱片的神秘少女','人造羽翼':'把折叠羽翼藏在更衣柜的学生','古代天文学':'用旧历法计算星辰的天文少女','失落的星图':'寻找课本里不存在的那颗星'
};
const NAMES=['林槿','白栖','陆澄','孟葵','宋知遥','顾青葵','苏绘','周弥'];
function describe(c,variant=0){
 const hair=REF[c.tags.hair]||c.tags.hair||'头发被风吹得有些凌乱';
 const outfit=REF[c.tags.clothes]||c.tags.clothes||'日常的校园衣装';
 const accessory=REF[c.tags.accessory]||c.tags.accessory||'不起眼的小物件';
 const vibe=REF[c.tags.vibe]||c.tags.vibe||'若有所思';
 const themes=(c.free||[]).map(x=>x.thread).filter(Boolean);
 const freeNames=(c.free||[]).map(x=>x.tag);
 let title=(c.free?.[0]?.hook)||HOOKS[freeNames[0]]|| (c.tags.vibe==='开朗'?'总把放学路走成冒险的少女':c.tags.vibe==='沉静'?'总在放学后留到最后的学生':'藏着一段故事的校园人物');
 if(freeNames.includes('猫娘')&&freeNames.includes('古埃及')) title='在校园里寻找失落神明的猫娘';
 if(freeNames.includes('独臂骑士'))title='把旧誓言藏在校服里的独臂骑士';
 const start=[`她留着${hair}，身穿${outfit}。${accessory==='几乎没有额外装饰'?'周身几乎没有多余点缀':accessory+'是最容易被注意到的细节'}，举止${vibe}。`,`放学后的走廊里，她的${hair}被穿堂风轻轻拨动。她穿着${outfit}，${accessory==='几乎没有额外装饰'?'身上没有刻意的装饰':accessory+'为整体添了一点个人痕迹'}。`,`${outfit}让她看起来与普通学生没有太大差别。再走近些，才会注意到她的${hair}，以及${accessory==='几乎没有额外装饰'?'几乎没有装饰的克制打扮':accessory}。`][variant%3];
 const scenic=[`她${vibe}，却对某些细节有着出人意料的执拗。`,`这样的形象很容易被当作寻常的校园一景，直到她拿出一直随身保存的东西。`,`旁人通常只记得她${vibe}的样子，很少有人知道她放学后究竟去了哪里。`][variant%3];
 if(freeNames.includes('猫娘')&&freeNames.includes('古埃及'))return {title,description:`她有一对会随着声响轻轻转动的黑色猫耳，留着${hair}，穿着${outfit}。颈间的青金石吊坠雕着古埃及风格的圣甲虫，背面刻有无法辨认的名字。她自称来自一个早已消失的神庙家族，却记不起自己究竟在寻找哪位神明。放学后，她总在教学楼最高处晒太阳，偶尔会对历史课本里的某幅壁画久久出神。`};
 if(freeNames.includes('独臂骑士'))return {title,description:`${start}她失去一只手臂后仍保留着旧日宣誓的动作；袖管空空地垂在身侧，她却每天认真擦拭那枚过时的骑士徽章。很少有人知道她曾经守护过什么。谈起未来时，她总是停顿片刻，仿佛还有一句誓言没有说完。`};
 if((c.style||state.style)==='visual')return {title,description:`${start}${themes.length?themes.slice(0,2).join(''):''}目前优先保留视觉特征的对照，人物经历仍可以留白。`};
 if((c.style||state.style)==='story')return {title,description:`${themes.length?themes.slice(0,2).join(''):''}${scenic}${start}这些经历只是等待审阅的故事种子，尚未进入正式设定。`};
 return {title,description:`${start}${themes.length?themes.slice(0,2).join(''):scenic}${themes.length===1?scenic:''}`};
}
function refreshConcept(c,force=false){if(c.narrative?.manual&&!force){c.narrative.stale=true;return}const d=describe(c,c.variant||0);const n=state.showNames||c.showNames?NAMES[((Number(c.id?.slice(1))||1)+(c.variant||0))%NAMES.length]:'';c.narrative={title:d.title,description:d.description,manual:false,stale:false,name:n};}
function constraints(){const conflict=state.fixed.filter(x=>state.excluded.includes(x));if(conflict.length)return '固定条件与排除项冲突：'+conflict.join('、');const active=catIds(state).filter(k=>state.explore[k]);if(!active.length&&state.freeSlots===0)return '请开启至少一个探索类别或增加自由槽位';const empty=active.filter(k=>!state.library[k]?.items?.some(x=>!state.excluded.includes(x[0])&&!(x[2]||[]).some(q=>state.excluded.includes(q))&&Number(state.weights?.[k]?.[x[0]]??x[1])>0));if(empty.length)return '没有可用标签：'+empty.map(k=>state.library[k].name).join('、');return ''}
function generate(quiet=false){const error=constraints();$('#conditionError').textContent=error;if(error)return;const raw=$('#seedInput').value.trim();const seed=raw===''?randSeed():Number(raw);if(!Number.isSafeInteger(seed)||seed<0||seed>4294967295){$('#conditionError').textContent='种子请填写 0～4294967295 的整数';return}
 const rng=seeded(seed);const prof=directionProfile(state.explorer.direction),available=DIRECTION_LIBRARY[prof]?.branches||[];const roundBranch=available.length?available[Math.floor(rng()*available.length)]:null;const retained=state.candidates.filter(c=>c.saved);const seen=new Set(retained.map(c=>signature(c.tags,c.free)));const result=[];let loops=0;
 while(result.length<state.count && loops++<state.count*120){
 const free=chooseFree(rng,state.freeSlots,result.length,roundBranch,state.explorer);
 const tags={};for(const k of catIds(state)){
  let selected=state.explore[k]?weighted(k,rng):null;
  if(k==='clothes'&&free.some(x=>x.branchId==='staff')){
   const acceptable=['简约职业套装','米白色针织开衫','深色衬衫与长裙','简约学院西装'];
   const choices=state.library.clothes.items.filter(x=>acceptable.includes(x[0])&&!state.excluded.includes(x[0])&&Number(state.weights?.clothes?.[x[0]]??x[1])>0);
   if(choices.length){let total=choices.reduce((sum,x)=>sum+Number(state.weights?.clothes?.[x[0]]??x[1]),0),p=rng()*total;for(const x of choices){p-=Number(state.weights?.clothes?.[x[0]]??x[1]);if(p<0){selected=x[0];break;}}}
  }
  tags[k]=selected;
 }
 const sig=signature(tags,free);if(seen.has(sig))continue;seen.add(sig);const c={id:nextId(),tags,free,fixed:clone(state.fixed),excluded:clone(state.excluded),locked:{},saved:false,history:[],variant:Math.floor(rng()*3),style:state.style,showNames:state.showNames,lineage:`第 ${state.batch+1} 轮 · ${state.mode==='algorithm'?'本地生成':(state.mode==='hybrid'?'AI 协作':'AI 自由探索')}`,sourceSeed:seed,exploration:clone({...state.explorer,aiBranches:[]}),exploreProfile:prof,branch:free[0]?.branch||'',branchId:free[0]?.branchId||'',narrative:null};refreshConcept(c);result.push(c)}
 state.batch++;state.lastSeed=seed;state.candidates=[...retained,...result];state.selected=result[0]?.id||retained[0]?.id||null;state.compare=[];state.filter='all';if(quiet)return true;save();render();notice('已生成 '+result.length+' 个概念 · 种子 '+seed+(prof==='custom'?' · 自定义方向需外部 AI 扩展':'')+(result.length<state.count?'（可用组合不足）':''));}
function current(){return state.candidates.find(c=>c.id===state.selected)||null}
function catName(k){return state.library[k]?.name||k}
function iconTone(c){const map={'深色西式校服':'#919191','校园运动外套':'#a1a1a1','白衬衫与百褶裙':'#a1a1a1','针织背心套装':'#a7a7a7','浅色水手服':'#9d9d9d','简约学院西装':'#9d9d9d'};return map[c.tags.clothes]||'#9f9f9f'}
function smallTags(arr,klass=''){return arr.map(x=>`<span class="chip ${klass}">${esc(x)}</span>`).join('')}
function renderExplore(){
 const ex=state.explorer;$('#directionInput').value=ex.direction;$('#depthSelect').value=ex.depth;$('#breadthSelect').value=ex.breadth;
 $$('[data-direction-preset]').forEach(b=>b.classList.toggle('active',ex.direction===DIRECTION_PRESETS[b.dataset.directionPreset]));
 const profile=directionProfile(ex.direction),branches=dirBranches();const selected=branches.find(x=>x.id===ex.focus);
 $('#focusName').textContent=selected?.name||'自动选择';const status=$('#exploreStatus');status.classList.toggle('attention',profile==='custom');
 status.textContent=profile==='custom'?'自定义方向已设定。系统将结合当前固定约束与自由特征项生成初始概念方案。':profile==='none'?'当前未限定探索方向，系统将基于全库视觉特征进行发散推荐。':`已识别「${directionTitle(profile)}」：${branches.length} 条示例分支。${ex.breadth==='focused'?'集中探索将优先沿同一分支展开。':'广泛探索将轮换不同分支。'}`;
 const ribbon=$('#directionBar');ribbon.innerHTML=`<span class="directionlabel">探索分支 · ${esc(directionTitle(profile))}</span><button class="branch-pill ${ex.focus==='auto'?'active':''}" data-focus="auto" title="由当前策略自动选择">自动分配</button>${branches.slice(0,7).map(b=>`<button class="branch-pill ${ex.focus===b.id?'active':''}" title="${esc(b.summary)}" data-focus="${esc(b.id)}">${esc(b.name)}</button>`).join('')}<button class="button small" id="branchMapInline">查看分支地图 →</button>`;
}
function showBranchMap(){
 const profile=directionProfile(state.explorer.direction),branches=dirBranches();const selected=state.explorer.focus;
 const topBar = `
  <div class="v3-branch-top-bar">
    <div class="v3-branch-top-info">
      <span class="chip" style="background:#282828;border-color:#3d3d3d;color:#e8e8e8;font-size:10.5px;font-weight:600">探索方向 · ${esc(directionTitle(profile))}</span>
      <span style="color:#8f8f8f;font-size:11px">选定分支后后续生成将聚焦该领域；亦可恢复全部分支自动轮换。</span>
    </div>
    <button type="button" class="v3-branch-auto-btn ${selected==='auto'?'active':''}" data-focus="auto">
      ${selected==='auto'?'✓ 自动全部分支轮换':'✦ 切换为全部分支自动轮换'}
    </button>
  </div>
 `;
 const cards=branches.length?`<div class="map-grid">${branches.map(branch=>{
   const isSelected = (selected===branch.id);
   const conceptList = (branch.concepts||[]).slice(0,3).map(c=>esc(c[state.explorer.depth]||c.medium||c.coarse));
   return `
    <article class="map-card ${isSelected?'selected':''}" data-focus="${esc(branch.id)}">
      <div class="map-card-head">
        <div class="map-card-title-group">
          <span class="map-card-indicator ${isSelected?'active':''}"></span>
          <h3 class="map-card-title">${esc(branch.name)}</h3>
        </div>
        <span class="map-card-badge">${isSelected?'✓ 当前深入':'点击选定'}</span>
      </div>
      <p class="map-card-desc">${esc(branch.summary)}</p>
      <div class="map-pills-section">
        <div class="map-pills-label">典型角色原型</div>
        <div class="map-pills-wrap">
          ${conceptList.length?conceptList.map(tag=>`<span class="map-pill-chip">${tag}</span>`).join(''):'<span class="map-pill-chip muted">外部扩展分支</span>'}
        </div>
      </div>
      <div class="map-card-foot">
        <span class="map-card-meta">${(branch.concepts||[]).length?((branch.concepts||[]).length+' 个设定原型'):'AI 定制分支'}</span>
        <button type="button" class="button small map-card-btn ${isSelected?'primary':''}" data-focus="${esc(branch.id)}">
          ${isSelected?'✓ 已选定深入':'沿此分支深入 →'}
        </button>
      </div>
    </article>
   `;
 }).join('')}</div>`:`<div class="status warn">当前没有可展示的本地分支。可在左侧填写「校园」「国籍」「职业」「奇幻」体验演示，也可以复制外部 AI 任务让模型探索任意自定义方向。</div>`;

 modal(
  '方向分支地图',
  `探索方向：${directionTitle(profile)} · 探索范围：${state.explorer.breadth==='focused'?'集中深入':'广泛轮换'} · 粒度：${state.explorer.depth==='fine'?'细 (经历细节)':(state.explorer.depth==='coarse'?'粗 (广义概念)':'中 (具体身份)')}`,
  `${topBar}${cards}`,
  `<span class="muted" style="font-size:11px;color:#777">切换分支仅定向下一轮生成，不修改已有候选。</span><div class="toolbar"><button type="button" class="button" data-close>返回工作台</button><button type="button" class="button primary" id="branchGenerateBtn">${I('spark')} 按当前选择生成新一轮</button></div>`,
  'branches'
 );
}
function setFocus(id){const branches=dirBranches();if(id!=='auto'&&!branches.some(b=>b.id===id)){notice('此分支不存在或方向已改变');return;}state.explorer.focus=id;save();renderExplore();if(modalType==='branches')showBranchMap();}
function adjustExplorer(patch){const before=state.explorer.direction;Object.assign(state.explorer,patch);if('direction' in patch&&patch.direction!==before){state.explorer.focus='auto';state.explorer.aiBranches=[];state.explorer.aiDirection='';}
 if(state.explorer.focus!=='auto'&&!dirBranches().some(b=>b.id===state.explorer.focus))state.explorer.focus='auto';save();renderExplore();}
function deepenBranch(){const c=current();if(!c)return;const ex=c.exploration||state.explorer;const branchId=c.branchId||c.free?.find(x=>x.branchId)?.branchId;
 if(!branchId){notice('当前方案暂无方向分支；可先选择示例方向或导入 AI 分支');return;}
 const levels=['coarse','medium','fine'];const currentLevel=levels.indexOf(ex.depth);if(currentLevel>=2){notice('当前已达到最细粒度；可使用外部 AI 继续拓展更具体的设定');return;}
 const d=clone(c);d.id=nextId();d.saved=false;d.history=[];d.lineage='沿 '+(c.branch||'当前分支')+' 深化自 '+c.id;d.exploration={...clone(ex),depth:levels[currentLevel+1],focus:branchId};d.variant=(d.variant||0)+1;
 const branch=(DIRECTION_LIBRARY[d.exploreProfile]?.branches||[]).find(b=>b.id===branchId),old=d.free||[];if(branch){const used=[];d.free=old.map(x=>{const prevConcept=branch.concepts.find(z=>[z.coarse,z.medium,z.fine].includes(x.tag));const nextTag=prevConcept?.[d.exploration.depth];if(nextTag&&!used.includes(nextTag)){used.push(nextTag);return {...x,tag:nextTag,level:d.exploration.depth,thread:prevConcept.thread,hook:prevConcept.hook}}return x;});}
 refreshConcept(d,true);state.candidates.unshift(d);state.selected=d.id;state.compare=[];state.filter='all';save();render();notice('已衍生下一层细节 '+d.id+'；原方案完整保留');
}
function renderConditions(){const mk=(kind,klass)=>state[kind].map(t=>`<span class="chip ${klass}">${esc(t)}<button class="x" data-remove="${kind}" data-label="${esc(t)}" title="移除" aria-label="移除${esc(t)}">×</button></span>`).join('');$('#fixedChips').innerHTML=mk('fixed','fixed')||'<span class="hint">尚未设置</span>';$('#excludedChips').innerHTML=mk('excluded','excluded')||'<span class="hint">尚未设置</span>';
 $('#exploreList').innerHTML=catIds(state).map(k=>`<label class="toggleline" for="explore-${esc(k)}"><span>${esc(catName(k))}</span><input id="explore-${esc(k)}" type="checkbox" data-explore="${esc(k)}" ${state.explore[k]?'checked':''}></label>`).join('');$('#freeSlider').value=state.freeSlots;$('#freeNum').textContent=state.freeSlots+' 个';$('#styleSelect').value=state.style;$('#showNames').checked=!!state.showNames;$$('[data-count]').forEach(b=>b.classList.toggle('active',Number(b.dataset.count)===state.count));$$('[data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));const mh=$('#modeHelp');if(mh){if(state.mode==='algorithm')mh.textContent='本地按权重抽样；概念描写与库外灵感使用内置词库。纯离线运行。';else if(state.mode==='hybrid')mh.textContent='大模型推演与本地约束结合；根据定向提示词发散具象设定并提取标签。';else if(state.mode==='creative')mh.textContent='全开放发散；解除预设类别限制，由大模型自主推演人物设定与故事脉络。';}
 const cb=$('#constraintsBadge');if(cb)cb.textContent=(state.fixed.length+state.excluded.length)?(state.fixed.length+state.excluded.length+'项已设'):'展开设置';}
function teaserExcerpt(text){const source=String(text||'').trim();if(source.length<=133)return source;let cut=0;const punctuation=/[。！？]/g;let m;while((m=punctuation.exec(source))){if(m.index+1>=85&&m.index+1<=142){cut=m.index+1;break}}if(!cut){const all=[...source.matchAll(/[。！？]/g)].map(x=>x.index+1);cut=all.filter(x=>x<143).at(-1)||Math.min(source.length,130)}return source.slice(0,cut)+(cut<source.length?' · 点开查看完整设定':'')}

function importCandidateToSillyTavern(c){
  if(!c) return;
  if(!c.narrative) refreshConcept(c);
  if(window.CreationWorkflow){
    try{const imported=window.CreationWorkflow.importConceptRole(c);notice('已导入角色「'+imported.name+'」，来源候选已记录');if(typeof visit==='function')visit('role',{roleId:imported.id,roleTab:'visual'});}catch(e){notice('导入失败：'+e.message);}
    return;
  }
  const rawName = c.narrative?.name || (c.narrative?.title ? c.narrative.title.split(/[·\s]/)[0] : '') || ('概念角色 ' + c.id);
  const name = rawName.trim().slice(0, 16);
  const newId = 'concept-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 5);
  const visualTags = [...new Set([
    ...(c.fixed || state.fixed || []),
    ...catIds(state).map(k=>c.tags[k]).filter(Boolean),
    ...(c.free||[]).map(f=>f.tag)
  ])];
  const tones = ['peach', 'blue', 'sage', 'amber', 'pink'];
  const tone = tones[Math.floor(Math.random() * tones.length)];
  const desc = c.narrative?.title || ((c.branch ? c.branch + ' · ' : '') + '由概念工坊定向探索生成的角色方案');
  const visualDesc = c.narrative?.description || '';

  const newRole = {
    id: newId,
    name: name,
    icon: name.slice(0, 1),
    tone: tone,
    series: c.branch ? (c.branch + '系列') : '概念工坊探索',
    desc: desc,
    tags: visualTags,
    visual: visualDesc
  };

  if(typeof roles !== 'undefined' && Array.isArray(roles)){
    roles.unshift(newRole);
    if(typeof store !== 'undefined' && store){
      store.roles = roles;
    }
    if(typeof persistMainWorkspace === 'function') persistMainWorkspace();
  }

  notice('已成功将角色「' + name + '」导入至角色资料库！');
  if(typeof visit === 'function'){
    visit('role', { roleId: newId, roleTab: 'visual' });
  }
}


function renderCards(){
  state.viewMode = state.viewMode || 'cards';
  const items = state.candidates.filter(c => state.filter === 'all' || c.saved);
  const countEl = $('#candidateCount');
  if(countEl) countEl.textContent = state.candidates.length + ' 组 · 第 ' + state.batch + ' 轮';
  $$('[data-filter]').forEach(b => b.classList.toggle('active', b.dataset.filter === state.filter));
  const compareCountEl = $('#compareCount');
  if(compareCountEl) compareCountEl.textContent = state.compare.length + '/2';
  const compareBtnEl = $('#compareBtn');
  if(compareBtnEl) compareBtnEl.disabled = state.compare.length !== 2;

  const grid = $('#candidateGrid');
  if(!grid) return;
  grid.className = 'resultgrid ' + (state.viewMode === 'compact' ? 'compact' : 'cards');
  $('#viewModeCardsBtn')?.classList.toggle('active', state.viewMode !== 'compact');
  $('#viewModeCompactBtn')?.classList.toggle('active', state.viewMode === 'compact');

  if (!items.length) {
    grid.innerHTML = '<div class="empty"><strong>还没有匹配的候选</strong><span>调整左侧条件并生成，或者切回“全部”查看。</span></div>';
    return;
  }

  if (state.viewMode === 'compact') {
    grid.innerHTML = items.map(c => {
      if (!c.narrative) refreshConcept(c);
      const newtags = c.free || [];
      const base = [...new Set([...(c.fixed || state.fixed), ...catIds(state).map(k => c.tags[k]).filter(Boolean)])];
      const idDisplay = (c.id.startsWith('#') ? c.id : '#' + c.id);
      const branchDisplay = c.branch ? (' · ' + esc(c.branch)) : '';

      return '<article class="compact-item ' + (state.selected === c.id ? 'selected' : '') + '" data-open="' + esc(c.id) + '" tabindex="0" role="button" aria-label="打开候选 ' + esc(c.id) + '">' +
        '<span class="compact-left">' + idDisplay + branchDisplay + '</span>' +
        '<div class="compact-main">' +
          '<div class="compact-title">' + esc(c.narrative?.title || '未命名构想') + '</div>' +
          '<div class="compact-tags">' +
            base.slice(0, 3).map(t => '<span class="chip">' + esc(t) + '</span>').join('') +
            newtags.slice(0, 2).map(t => '<span class="chip new">+' + esc(t.tag) + '</span>').join('') +
            (newtags.length > 2 ? '<span class="chip new">+' + (newtags.length - 2) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="compact-actions">' +
          '<button class="button icon small ' + (c.saved ? 'active' : '') + '" data-save="' + esc(c.id) + '" title="' + (c.saved ? '取消收藏' : '收藏') + '">' + (c.saved ? '★' : '☆') + '</button>' +
          '<button class="button icon small" data-import-st="' + esc(c.id) + '" title="一键推送到酒馆角色库" style="color:var(--sage,#e2e2e2);font-weight:bold">✦</button>' +
        '</div>' +
      '</article>';
    }).join('');
  } else {
    grid.innerHTML = items.map(c => {
      if(!c.narrative) refreshConcept(c);
      const newtags = c.free || [];
      const base = [...new Set([...(c.fixed || state.fixed), ...catIds(state).map(k => c.tags[k]).filter(Boolean)])];
      const chosen = state.compare.includes(c.id);

      // 1. Header: Merge candidate ID and exploration branch (#C001 · 校园生态)
      const idDisplay = (c.id.startsWith('#') ? c.id : '#' + c.id);
      const headerTitle = idDisplay + (c.branch ? ' · ' + esc(c.branch) : '');

      // 2. Status Badge: Only show when there is an actual actionable state (待审核 or 描述待更新)
      let stateBadge = '';
      if (c.narrative?.stale) {
        stateBadge = '<span class="tiny-state warn">描述待更新</span>';
      } else if (newtags.length > 0) {
        stateBadge = '<span class="tiny-state new">待审核</span>';
      }

      // 3. Bottom Note: Eliminate meaningless repetitive "候选" or "第 1 轮 · 本地生成"
      let bottomNote = '';
      if (c.narrative?.name && c.narrative.name !== '未命名' && c.narrative.name !== '候选') {
        bottomNote = esc(c.narrative.name);
      } else if (c.lineage && !c.lineage.includes('本地生成') && c.lineage !== '候选') {
        bottomNote = esc(c.lineage);
      }

      return '<article class="concept ' + (state.selected === c.id ? 'selected' : '') + '" style="--concept-accent:' + iconTone(c) + '" data-open="' + esc(c.id) + '" tabindex="0" role="button" aria-label="打开候选 ' + esc(c.id) + '">' +
        '<div class="concept-top">' +
          '<span class="concept-id">' + headerTitle + '</span>' +
          stateBadge +
        '</div>' +
        '<div class="concept-content">' +
          '<h3>' + esc(c.narrative?.title || '未命名构想') + '</h3>' +
          '<p class="teaser">' + esc(teaserExcerpt(c.narrative?.description || '')) + '</p>' +
          '<div class="source-tags">' +
            base.slice(0, 4).map(t => '<span class="chip">' + esc(t) + '</span>').join('') +
            newtags.slice(0, 3).map(t => '<span class="chip new">+' + esc(t.tag) + '</span>').join('') +
          '</div>' +
        '</div>' +
        '<div class="conceptfoot">' +
          '<span class="source-note">' + bottomNote + '</span>' +
          '<div class="foot-actions">' +
            '<button class="button icon small ' + (c.saved ? 'active' : '') + '" data-save="' + esc(c.id) + '" title="' + (c.saved ? '取消收藏' : '收藏') + '">' + (c.saved ? '★' : '☆') + '</button>' +
            '<button class="button small ' + (chosen ? 'active' : '') + '" data-compare="' + esc(c.id) + '">' + (chosen ? '✓ 已选' : '⇄ 对比') + '</button>' +
            '<button class="button icon small" data-import-st="' + esc(c.id) + '" title="推送到酒馆角色资料库" style="color:var(--sage,#e2e2e2);font-weight:bold">✦</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('');
  }
}
function audit(c){const fixed=c.fixed||state.fixed,excluded=c.excluded||state.excluded;const conflicts=fixed.filter(x=>excluded.includes(x));const forbidden=[...Object.values(c.tags),...(c.free||[]).map(x=>x.tag)].filter(Boolean).filter(x=>excluded.includes(x));const soft=c.tags.clothes==='简约学院西装'&&c.tags.accessory==='运动护腕';if(conflicts.length||forbidden.length)return {warn:true,text:'固定/排除冲突：'+[...new Set([...conflicts,...forbidden])].join('、')+'。请手动调整。'};if(c.narrative?.stale)return {warn:true,text:'标签发生变化，手工描写保留原文。请核对后继续，或点击“重写描述”。'};if(soft)return {warn:true,text:'学院西装与运动护腕存在风格反差，可以保留，但建议进一步解释。'};return {warn:false,text:'已通过当前已知的硬约束检查。库外概念仍处于提案状态，不会自动写入标签库。'} }

function renderEditor(){
  const c = current();
  state.edTab = state.edTab || 'narrative';
  $$('.editor-tab-btn').forEach(btn => {
    const isActive = btn.dataset.edtab === state.edTab;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  const candidateSubEl = $('#editorCandidateId');
  if (!c) {
    if (candidateSubEl) candidateSubEl.textContent = '未选择候选';
    $('#editorContent').innerHTML = '<div class="empty" style="padding:24px 8px"><strong>选择一个候选</strong>在中间候选列表中点击任意卡片或条目即可开始编辑。</div>';
    return;
  }

  if (!c.narrative) refreshConcept(c);
  if (candidateSubEl) candidateSubEl.textContent = c.id + ' · ' + (c.narrative?.name || '未命名') + ' · ' + (c.branch || c.lineage || '本地生成');

  const status = audit(c);

  if (state.edTab === 'narrative') {
    const allTags = [...new Set([...(c.fixed || state.fixed), ...catIds(state).map(k => c.tags[k]).filter(Boolean), ...(c.free || []).map(x => x.tag)])];
    $('#editorContent').innerHTML = '' +
      '<div class="edblock">' +
        '<div class="grouphead"><span>角色印象与定位</span><button class="button small" id="rewriteNarrative" style="padding:3px 7px;font-size:10px">⤨ 换一种写法</button></div>' +
        '<input class="field" id="draftName" style="font-weight:700;font-size:12px;margin-bottom:8px" value="' + esc(c.narrative?.title || '') + '" placeholder="概念标题 / 定位">' +
        '<div class="grouphead" style="margin-top:8px"><span>外貌与故事描写</span></div>' +
        '<textarea class="field textarea" id="draftDescription" style="min-height:95px;font-size:11px;line-height:1.6" placeholder="角色外貌特征与故事背景描写...">' + esc(c.narrative?.description || '') + '</textarea>' +
        '<button class="button small" id="saveNarrative" style="margin-top:6px;width:100%">保存描写修改</button>' +
      '</div>' +
      '<div class="edblock">' +
        '<div class="grouphead"><span>当前组合标签 (' + allTags.length + ' 项)</span></div>' +
        '<div class="chips" style="max-height:85px;overflow-y:auto;padding:2px">' +
          allTags.map(t => '<span class="chip ' + (state.fixed.includes(t) ? 'fixed' : (c.free || []).some(x => x.tag === t) ? 'new' : '') + '">' + esc(t) + '</span>').join('') +
        '</div>' +
      '</div>' +
      (status.warn ? '<div class="status warn" style="margin-top:8px">' + esc(status.text) + '</div>' : '');
  } else if (state.edTab === 'tags') {
    const props = catIds(state).map(k => {
      const choices = state.library[k].items.filter(x => !state.excluded.includes(x[0]) && !(x[2] || []).some(z => state.excluded.includes(z)));
      return '<div class="prop">' +
        '<label for="edit-' + esc(k) + '">' + esc(catName(k)) + '</label>' +
        '<select class="field" data-prop="' + esc(k) + '" id="edit-' + esc(k) + '">' +
          '<option value="">未设</option>' +
          choices.map(x => '<option value="' + esc(x[0]) + '" ' + (c.tags[k] === x[0] ? 'selected' : '') + '>' + esc(x[0]) + '</option>').join('') +
        '</select>' +
        '<button class="button icon ' + (c.locked?.[k] ? 'active' : '') + '" data-lock="' + esc(k) + '" title="锁定此类别">' + (c.locked?.[k] ? '▣' : '◇') + '</button>' +
        '<button class="button icon" data-reroll="' + esc(k) + '" ' + (c.locked?.[k] || !state.explore[k] ? 'disabled' : '') + ' title="仅重抽此类别">⤨</button>' +
      '</div>';
    }).join('');

    const free = (c.free || []).map((x, i) => '' +
      '<div class="freeitem">' +
        '<div>' +
          '<strong>' + esc(x.tag) + '</strong>' +
          '<small>' + esc(x.category || '未分类') + ' · ' + (x.status === 'imported' ? '已入库' : x.status === 'approved' ? '已认可' : '待审阅') + '</small>' +
        '</div>' +
        '<div class="toolbar" style="gap:4px">' +
          '<button class="button small" data-approve="' + i + '" title="认可这项提案">' + (x.status === 'approved' ? '✓' : '认可') + '</button>' +
          '<button class="button small" data-accept="' + i + '" ' + (x.status === 'imported' ? 'disabled' : '') + ' title="加入标签库">' + (x.status === 'imported' ? '已入库' : '入库') + '</button>' +
          '<button class="button icon small" data-reroll-free="' + i + '" title="重抽该自由槽">⤨</button>' +
        '</div>' +
      '</div>'
    ).join('');

    $('#editorContent').innerHTML = '' +
      '<div class="edblock">' +
        '<div class="grouphead"><span>按分类选择与锁定</span></div>' +
        props +
      '</div>' +
      '<div class="edblock">' +
        '<div class="grouphead"><span>探索库外概念 (' + (c.free || []).length + ')</span></div>' +
        (free || '<div class="empty-quiet" style="margin:4px 0">本轮未产生库外概念</div>') +
        '<div class="inputrow" style="margin-top:6px">' +
          '<input class="field" id="customFree" placeholder="自行补充新概念..." maxlength="30">' +
          '<button class="button small" id="addFree">补充</button>' +
        '</div>' +
      '</div>';
  } else {
    $('#editorContent').innerHTML = '' +
      '<div class="edblock">' +
        '<div class="grouphead"><span>约束核验状态</span></div>' +
        '<div class="status ' + (status.warn ? 'warn' : '') + '">' + esc(status.text) + '</div>' +
      '</div>' +
      '<div class="edblock">' +
        '<div class="grouphead"><span>衍生与辅助操作</span></div>' +
        '<div class="edactions">' +
          '<button class="button" id="rerollAll">⤨ 重抽未锁定项</button>' +
          '<button class="button" id="undoBtn" ' + (!c.history?.length ? 'disabled' : '') + '>↶ 撤销一步</button>' +
          '<button class="button" id="forkBtn">⑂ 衍生新方案</button>' +
          '<button class="button" id="deepenBranchBtn" ' + (!c.branchId || c.exploration?.depth === 'fine' ? 'disabled' : '') + '>↳ 沿分支深入</button>' +
          '<button class="button" id="aiTaskBtn" style="grid-column:1/-1">✧ 复制外部 AI 任务提示词</button>' +
        '</div>' +
      '</div>' +
      '<div class="edblock">' +
        '<div class="grouphead"><span>创作记录 (最近修改)</span></div>' +
        '<div class="history">' +
          ((c.history || []).slice(-6).reverse().map(x => '<div>' + esc(x.text) + '</div>').join('') || '<span class="muted">暂无修改记录</span>') +
        '</div>' +
      '</div>';
  }
  if (typeof enhanceSelects === 'function') enhanceSelects();
}

function render(){tagBridge.refresh();renderConditions();renderExplore();renderCards();renderEditor();$('#draftCount').textContent=state.drafts.length}
function capture(c){return {tags:clone(c.tags),free:clone(c.free||[]),narrative:clone(c.narrative),variant:c.variant,locked:clone(c.locked||{})}}
function record(c,text){c.history??=[];c.history.push({text,previous:capture(c)});if(c.history.length>35)c.history.shift()}
function changed(c){refreshConcept(c);save();renderCards();renderEditor()}
function editTag(k,value){const c=current();if(!c||!(k in state.library))return;const old=c.tags[k]||'';if(old===value)return;record(c,catName(k)+'：'+(old||'未设置')+' → '+(value||'未设置'));c.tags[k]=value||null;changed(c)}
function reroll(k){const c=current();if(!c||c.locked?.[k]||!state.explore[k])return;const value=weighted(k,seeded(randSeed()),c.tags[k]);if(!value){notice('该类别没有可重抽的标签');return}editTag(k,value)}
function rerollAll(){const c=current();if(!c)return;const rng=seeded(randSeed()),next={...c.tags};let n=0;for(const k of catIds(state)){if(!state.explore[k]||c.locked?.[k])continue;const v=weighted(k,rng,c.tags[k]);if(v&&v!==c.tags[k]){next[k]=v;n++}}if(!n){notice('当前没有可重抽的类别');return}record(c,'重抽 '+n+' 个未锁定类别');c.tags=next;changed(c)}
function rerollFree(index){const c=current();if(!c)return;const old=c.free?.[index];if(!old)return;const rng=seeded(randSeed()),used=c.free.filter((x,i)=>i!==index).map(x=>x.tag);const snapshot=c.exploration||state.explorer;const next=old.from==='external-ai'?null:sampleFree(rng,used,old.tag,snapshot,old.branchId,old.kind==='support'?'support':'primary');if(!next){notice(old.from==='external-ai'?'这是外部 AI 提案，请复制 AI 任务重新探索此概念':'本地概念词典暂无更多匹配特征项');return}record(c,`自由槽位：${old.tag} → ${next.tag}`);c.free[index]=next;changed(c)}
function addFree(){const c=current(),input=$('#customFree');if(!c||!input)return;const name=input.value.trim().replace(/\s+/g,' ');if(!name)return;if(name.length>36){notice('概念名称最多 36 字');return}if(state.excluded.includes(name)||state.fixed.includes(name)){notice('此项与本轮固定/排除规则重叠');return}if(c.free.some(x=>x.tag===name)||catIds(state).some(k=>state.library[k].items.some(x=>x[0]===name))){notice('该概念已经存在');return}record(c,'手动新增自由概念：'+name);c.free.push({tag:name,category:'未分类',thread:'',status:'proposal',from:'manual'});changed(c)}
function rewrite(){const c=current();if(!c)return;if(c.narrative?.manual&&!confirm('当前描写经过手工编辑。是否用本地示例模板重新生成并覆盖？'))return;record(c,'更换角色描写');c.variant=(c.variant||0)+1;c.narrative.manual=false;refreshConcept(c,true);save();renderCards();renderEditor()}
function saveNarrative(){const c=current();if(!c)return;const title=$('#conceptTitle')?.value.trim(),desc=$('#conceptDescription')?.value.trim();if(!title||!desc){notice('概念标题和角色描述不能为空');return}record(c,'手工编辑角色描写');c.narrative={...c.narrative,title:title.slice(0,90),description:desc.slice(0,2500),manual:true,stale:false};save();renderCards();renderEditor();notice('已保存人物描写')}
function undo(){const c=current();if(!c?.history?.length)return;const h=c.history.pop();if(!h.previous)return;c.tags=h.previous.tags;c.free=h.previous.free;c.narrative=h.previous.narrative;c.variant=h.previous.variant;c.locked=h.previous.locked;save();renderCards();renderEditor()}
function fork(){const c=current();if(!c)return;const d=clone(c);d.id=nextId();d.saved=false;d.history=[];d.lineage='衍生自 '+c.id;state.candidates.unshift(d);state.selected=d.id;state.compare=[];state.filter='all';save();render();notice('已创建独立方案 '+d.id+'，原方案保留')}
function addCondition(kind){const input=$(kind==='fixed'?'#fixedInput':'#excludedInput');const v=input.value.trim().replace(/\s+/g,' ');if(!v)return;if(v.length>36){notice('标签最多 36 字');return}if(state[kind].includes(v)){notice('已存在该条件');return}state[kind].push(v);input.value='';save();renderConditions();$('#conditionError').textContent=constraints()}
function modal(title,sub,body,foot='',type=''){
  modalType=type;
  const dlg=$('#conceptOverlay .dialog');
  if(dlg) dlg.className = 'dialog' + (type ? ' modal-' + type : '');
  $('#conceptModalTitle').textContent=title;
  $('#conceptModalSub').textContent=sub;
  $('#conceptModalBody').innerHTML=body;
  $('#conceptModalFoot').innerHTML=foot;
  $('#conceptOverlay').classList.add('visible');
  if(typeof enhanceSelects === 'function') enhanceSelects();
  $('#closeConceptModal')?.focus();
}
function closeModal(){
  if(typeof closeSelectMenu === 'function') closeSelectMenu();
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
  ui.modal='';
  ui.modalStack = [];
  overlay();
  if (typeof modalType !== 'undefined') modalType='';
  const conOv = typeof $ === 'function' ? $('#conceptOverlay') : null;
  if (conOv) conOv.classList.remove('visible');
  const dlg = conOv ? conOv.querySelector('.dialog') : null;
  if (dlg) dlg.className = 'dialog';
}
function closeSettingsModal(){
  ui.modalStack = [];
  ui.modal = '';
  overlay();
}
function showCompare(){
  const a=state.candidates.find(x=>x.id===state.compare[0]),b=state.candidates.find(x=>x.id===state.compare[1]);
  if(!a||!b)return;
  comparePicks=Object.fromEntries(catIds(state).map(k=>[k,'a']));
  comparePicks.free='both';
  const rows=catIds(state).map(k=>{
    const valA = a.tags[k]||'未设置', valB = b.tags[k]||'未设置';
    return `<div class="v3-compare-row">
      <button class="choice chosen" data-compare-pick="${esc(k)}:a" title="采纳方案 A 的 ${esc(catName(k))}">
        <span>${esc(valA)}</span>
        <span style="font-size:10px;opacity:0.6;">A</span>
      </button>
      <div class="v3-compare-cat-label">${esc(catName(k))}</div>
      <button class="choice" data-compare-pick="${esc(k)}:b" title="采纳方案 B 的 ${esc(catName(k))}">
        <span style="font-size:10px;opacity:0.6;">B</span>
        <span>${esc(valB)}</span>
      </button>
    </div>`;
  }).join('');
  const topCards=`<div class="v3-compare-top-grid">
    <div class="v3-compare-card">
      <div class="v3-compare-card-head">
        <span class="v3-compare-badge">方案 A</span>
        <span class="v3-compare-card-title">${esc(a.id)} · ${esc(a.narrative.title)}</span>
      </div>
      <p class="v3-compare-card-desc">${esc(a.narrative.description)}</p>
    </div>
    <div class="v3-compare-card">
      <div class="v3-compare-card-head">
        <span class="v3-compare-badge">方案 B</span>
        <span class="v3-compare-card-title">${esc(b.id)} · ${esc(b.narrative.title)}</span>
      </div>
      <p class="v3-compare-card-desc">${esc(b.narrative.description)}</p>
    </div>
  </div>`;
  const matrix=`<div class="v3-compare-matrix">
    <div class="v3-compare-matrix-head">
      <div>方案 A 选项目录</div>
      <div>属性维度</div>
      <div>方案 B 选项目录</div>
    </div>
    <div class="v3-compare-matrix-body">${rows}</div>
  </div>`;
  const freeBar=`<div class="v3-compare-free-bar">
    <div style="display:flex;align-items:center;gap:8px;min-width:0;overflow:hidden;">
      <span class="muted" style="font-weight:600;white-space:nowrap;">库外概念：</span>
      <span style="font-size:11px;color:#a0a0a0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">A: ${(a.free||[]).map(x=>esc(x.tag)).join('、')||'无'} ｜ B: ${(b.free||[]).map(x=>esc(x.tag)).join('、')||'无'}</span>
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
      <span class="muted" style="font-size:11px;white-space:nowrap;">合并策略：</span>
      <select id="compareFree" class="field select-mini" style="width:175px;">
        <option value="both">保留两边（最多4项）</option>
        <option value="a">只取 A</option>
        <option value="b">只取 B</option>
        <option value="none">不保留</option>
      </select>
    </div>
  </div>`;
  modal('对比与融合','选出更喜欢的属性组合，融合为独立候选。原方案会完整保留。',`${topCards}${matrix}${freeBar}`,`<span class="muted" style="font-size:11.5px">融合后将生成新的独立候选，来源方案完整保留。</span><div class="toolbar" style="gap:8px"><button class="button" data-close>取消</button><button class="button primary" id="mergeBtn">融合为新候选</button></div>`,'compare');
}
function merge(){const [a,b]=state.compare.map(id=>state.candidates.find(x=>x.id===id));if(!a||!b)return;const tags={};for(const k of catIds(state))tags[k]=(comparePicks[k]==='b'?b:a).tags[k]||null;const mode=$('#compareFree')?.value||'both';let free=(mode==='none'?[]:mode==='a'?a.free:mode==='b'?b.free:[...a.free,...b.free]);free=[...new Map(free.map(x=>[x.tag,x])).values()].slice(0,4);const c={id:nextId(),tags,free:clone(free),fixed:clone(a.fixed||state.fixed),excluded:clone(a.excluded||state.excluded),locked:{},saved:false,history:[],variant:0,style:a.style||state.style,showNames:a.showNames||state.showNames,lineage:'融合自 '+a.id+' + '+b.id,sourceSeed:null,exploration:clone(a.exploration||state.explorer),exploreProfile:a.exploreProfile||directionProfile(state.explorer.direction),branch:free[0]?.branch||'',branchId:free[0]?.branchId||'',narrative:null};refreshConcept(c);state.candidates.unshift(c);state.selected=c.id;state.compare=[];state.filter='all';save();closeModal();render();notice('融合成功，来源候选完整保留')}

let _v3WeightCat = 'all';
let _v3WeightSearch = '';

function calculateCatProbabilities(catKey){
  const items = state.library[catKey]?.items || [];
  let total = 0;
  let activeCount = 0;
  items.forEach(x => {
    const val = Number(state.weights?.[catKey]?.[x[0]] ?? x[1]);
    total += val;
    if(val > 0) activeCount++;
  });
  return { total, count: items.length, activeCount };
}

function getProbTier(prob, val, activeCount = 0){
  if(val <= 0) return { label: '停抽', cls: 'tier-zero', icon: '✕' };
  if(activeCount === 1) return { label: '独占', cls: 'tier-solo', icon: '★' };
  if(prob >= 25) return { label: '主力', cls: 'tier-main', icon: '✦' };
  if(prob >= 10) return { label: '常规', cls: 'tier-normal', icon: '●' };
  return { label: '低频', cls: 'tier-low', icon: '○' };
}

function renderWeightCard(catKey, label, defaultWeight, catTotal, activeCount = 0){
  const value = Number(state.weights?.[catKey]?.[label] ?? defaultWeight);
  const prob = catTotal > 0 ? (value / catTotal * 100) : 0;
  const tier = getProbTier(prob, value, activeCount);
  const isZero = value === 0;

  let probTitle = '当前分类相对抽取概率：' + prob.toFixed(1) + '%';
  if(activeCount === 1 && value > 0) {
    probTitle = '当前分类其余标签权重均为 0，此标签独占必出。调节其他标签权重可恢复概率竞争。';
  } else if(value === 0) {
    probTitle = '权重为 0，抽取时已停用。';
  }

  return '<div class="v3-weight-card ' + (isZero ? 'zero-weight' : '') + '" data-cat="' + esc(catKey) + '" data-label="' + esc(label) + '">' +
    '<div class="v3-wt-card-top">' +
      '<span class="v3-wt-tag-name" title="' + esc(label) + '">' + esc(label) + '</span>' +
      '<span class="v3-wt-prob ' + tier.cls + '" title="' + esc(probTitle) + '">' + prob.toFixed(1) + '% ' + tier.icon + ' ' + tier.label + '</span>' +
    '</div>' +
    '<div class="v3-wt-card-row">' +
      '<button class="v3-wt-step" data-wt-step="-1" data-cat="' + esc(catKey) + '" data-label="' + esc(label) + '" title="减少 5 权重">-</button>' +
      '<div class="v3-wt-slider-wrap">' +
        '<input type="range" class="v3-wt-slider" min="0" max="100" step="1" value="' + value + '" data-weight-cat="' + esc(catKey) + '" data-weight-label="' + esc(label) + '" style="background: linear-gradient(to right, #dedede 0%, #dedede ' + value + '%, #262626 ' + value + '%, #262626 100%);">' +
      '</div>' +
      '<button class="v3-wt-step" data-wt-step="1" data-cat="' + esc(catKey) + '" data-label="' + esc(label) + '" title="增加 5 权重">+</button>' +
      '<input type="number" class="v3-wt-num" min="0" max="100" value="' + value + '" data-weight-cat="' + esc(catKey) + '" data-weight-label="' + esc(label) + '" title="直接输入具体数值">' +
    '</div>' +
    '<div class="v3-wt-pct-bar" title="在当前分类中的相对概率条">' +
      '<div class="v3-wt-pct-fill" style="width: ' + Math.min(100, prob) + '%"></div>' +
    '</div>' +
  '</div>';
}

function renderWeightMainContent(){
  const allCats = catIds(state);
  const targetCats = _v3WeightCat === 'all' ? allCats : [_v3WeightCat];
  const query = _v3WeightSearch.trim().toLowerCase();

  let html = '';

  targetCats.forEach(k => {
    const catObj = state.library[k];
    if(!catObj) return;
    const { total, count, activeCount } = calculateCatProbabilities(k);
    
    let filteredItems = catObj.items;
    if(query){
      filteredItems = filteredItems.filter(x => x[0].toLowerCase().includes(query));
    }

    if(query && filteredItems.length === 0) return;

    let totalDisplay = '' + total;

    html += '<div class="v3-wt-cat-section" data-cat-section="' + esc(k) + '" style="margin-bottom: 22px;">' +
      '<div class="v3-weight-topbar">' +
        '<div class="v3-weight-cat-title">' +
          '<h3>✦ ' + esc(catName(k)) + '</h3>' +
          '<span class="v3-weight-total-pill">共 ' + count + ' 标签 · 总权重: <strong id="v3CatTotalWt_' + esc(k) + '">' + totalDisplay + '</strong></span>' +
        '</div>' +
        '<div class="v3-weight-batch-bar">' +
          '<span style="font-size:10.5px;color:#969696;margin-right:2px">批处理:</span>' +
          '<button class="v3-wt-pill-btn" data-wt-batch="equal" data-cat="' + esc(k) + '" title="全成分配为等概率 50">⚖ 均等平权(50)</button>' +
          '<button class="v3-wt-pill-btn" data-wt-batch="random" data-cat="' + esc(k) + '" title="随机离散赋予自然权重">🎲 随机离散</button>' +
          '<button class="v3-wt-pill-btn" data-wt-batch="top3" data-cat="' + esc(k) + '" title="强化前三项，其余转长尾">✦ 聚焦前三</button>' +
          '<button class="v3-wt-pill-btn" data-wt-batch="zero" data-cat="' + esc(k) + '" title="此分类全部设为 0 (暂停抽取)">✕ 全部归零</button>' +
          '<button class="v3-wt-pill-btn" data-wt-batch="reset" data-cat="' + esc(k) + '" title="恢复为库内置默认权重">↺ 恢复默认</button>' +
        '</div>' +
      '</div>' +
      '<div class="v3-weight-grid">' +
        filteredItems.map(x => renderWeightCard(k, x[0], x[1], total, activeCount)).join('') +
      '</div>' +
    '</div>';
  });

  if(!html){
    html = '<div class="empty" style="padding:48px 16px;text-align:center">' +
      '<div style="font-size:24px;margin-bottom:8px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div>' +
      '<strong style="font-size:13px;color:#f9f9f9">未找到匹配「' + esc(query) + '」的标签</strong>' +
      '<p style="font-size:11px;color:#969696;margin-top:4px">请尝试更换搜索关键词，或在左侧切换分类。</p>' +
    '</div>';
  }

  const container = document.getElementById('v3WeightMainArea');
  if(container) container.innerHTML = html;
}

function updateTagWeightInDOM(catKey, label, newVal){
  newVal = Math.max(0, Math.min(100, Math.round(Number(newVal) || 0)));
  state.weights[catKey] = state.weights[catKey] || {};
  state.weights[catKey][label] = newVal;
  save();

  const { total, activeCount } = calculateCatProbabilities(catKey);
  const totEl = document.getElementById('v3CatTotalWt_' + catKey);
  if(totEl) totEl.textContent = total;

  const cards = document.querySelectorAll('.v3-weight-card[data-cat="' + catKey + '"]');
  cards.forEach(card => {
    const cardLabel = card.dataset.label;
    const cardVal = Number(state.weights[catKey]?.[cardLabel] ?? 0);
    const prob = total > 0 ? (cardVal / total * 100) : 0;
    const tier = getProbTier(prob, cardVal, activeCount);

    if(cardLabel === label){
      const slider = card.querySelector('.v3-wt-slider');
      const numInput = card.querySelector('.v3-wt-num');
      if(slider){
        if(Number(slider.value) !== newVal) slider.value = newVal;
        slider.style.background = 'linear-gradient(to right, #dedede 0%, #dedede ' + newVal + '%, #262626 ' + newVal + '%, #262626 100%)';
      }
      if(numInput && Number(numInput.value) !== newVal) numInput.value = newVal;
      card.classList.toggle('zero-weight', newVal === 0);
    }

    const probEl = card.querySelector('.v3-wt-prob');
    if(probEl){
      probEl.className = 'v3-wt-prob ' + tier.cls;
      probEl.textContent = prob.toFixed(1) + '% ' + tier.icon + ' ' + tier.label;
      if(activeCount === 1 && cardVal > 0) probEl.title = '当前分类其余标签权重均为 0，此标签独占必出。调节其他标签权重可恢复概率竞争。';
      else if(cardVal === 0) probEl.title = '权重为 0，抽取时已停用。';
      else probEl.title = '当前分类相对抽取概率：' + prob.toFixed(1) + '%';
    }
    const fillEl = card.querySelector('.v3-wt-pct-fill');
    if(fillEl){
      fillEl.style.width = Math.min(100, prob) + '%';
    }
  });
}

function applyWeightBatch(catKey, action){
  const items = state.library[catKey]?.items || [];
  if(!items.length) return;
  state.weights[catKey] = state.weights[catKey] || {};

  if(action === 'equal'){
    items.forEach(x => { state.weights[catKey][x[0]] = 50; });
  } else if(action === 'random'){
    items.forEach(x => { state.weights[catKey][x[0]] = Math.floor(Math.random() * 60) + 20; });
  } else if(action === 'top3'){
    const sorted = [...items].sort((a,b) => (Number(state.weights[catKey]?.[b[0]] ?? b[1]) - Number(state.weights[catKey]?.[a[0]] ?? a[1])));
    sorted.forEach((x, idx) => {
      state.weights[catKey][x[0]] = idx < 3 ? 75 : 15;
    });
  } else if(action === 'zero'){
    items.forEach(x => { state.weights[catKey][x[0]] = 0; });
  } else if(action === 'reset'){
    items.forEach(x => { state.weights[catKey][x[0]] = x[1]; });
  }

  save();
  renderWeightMainContent();
  refreshLibraryUI();
  notice('已对「' + catName(catKey) + '」应用批量调整');
}

function showWeights(){tagBridge.refresh();
  return showLibrary();
}

function categoryOptions(v='未分类'){const vals=[v,...catIds(state).map(k=>state.library[k].name),'未分类'];return [...new Set(vals)].map(n=>`<option ${v===n?'selected':''} value="${esc(n)}">${esc(n)}</option>`).join('')}
function showAccept(index){const c=current(),x=c?.free?.[index];if(!x)return;modal('将新概念加入标签库','先检查同义词及分类。入库后可参与今后的标签组合。',`<div class="modalbox"><h3>${esc(x.tag)}</h3><p>来源：${x.from==='manual'?'手动添加':'本地演示提案'} · 当前分类建议：${esc(x.category||'未分类')}</p></div><label class="mini-label" for="acceptCategory">归入分类</label><select id="acceptCategory" class="field">${categoryOptions(x.category)}</select><label class="mini-label" for="acceptNewCategory">或创建新分类（可留空）</label><input id="acceptNewCategory" class="field" maxlength="24" placeholder="例如 种族、文化主题"><label class="mini-label" for="acceptWeight">初始权重</label><input id="acceptWeight" class="range" type="range" min="0" max="100" value="35"><p class="muted">入库后仍保留候选中的来源记录。不会自动覆盖已生成的角色概念。</p>`,`<span class="muted">重复同名标签将被阻止。</span><div class="toolbar"><button class="button" data-close>取消</button><button class="button primary" id="confirmAccept" data-index="${index}">确认入库</button></div>`,'accept')}
function ensureCategory(name){const key=catIds(state).find(k=>state.library[k].name===name);if(key)return key;const id='extra_'+(Date.now().toString(36))+'_'+Math.floor(Math.random()*1000);state.library[id]={name,items:[]};state.explore[id]=false;return id}
function acceptTag(index){const c=current(),free=c?.free?.[index];if(!free)return;let category=$('#dbdbdbeeptNewCategory')?.value.trim()||$('#dbdbdbeeptCategory')?.value||'未分类';if(category.length>24){notice('分类名称请控制在 24 字以内');return}if(catIds(state).some(k=>state.library[k].items.some(x=>x[0]===free.tag))){notice('标签库已经存在相同名称');return}const cat=ensureCategory(category);const weight=Number($('#dbdbdbeeptWeight')?.value||35);state.library[cat].items.push([free.tag,weight]);free.status='imported';free.category=category;save();closeModal();render();notice('已入库「'+free.tag+'」，分类：'+category)}

let _v3LibActiveCat = 'hair';
let _v3LibSearch = '';

function updateLibCategoryProbabilitiesInDOM(catKey) {
  const { total } = calculateCatProbabilities(catKey);
  const totEl = document.getElementById('v3CatTotalWt_' + catKey);
  if(totEl) totEl.textContent = total;

  const cards = document.querySelectorAll('.v3-lib-meter-card[data-cat="' + catKey + '"]');
  cards.forEach(card => {
    const tagName = card.dataset.tag;
    const item = state.library[catKey]?.items.find(x => x[0] === tagName);
    const val = Number(state.weights?.[catKey]?.[tagName] ?? item?.[1] ?? 40);

    card.classList.toggle('zero-weight', val === 0);
    const slider = card.querySelector('.v3-lib-slider');
    if(slider) {
      if(Number(slider.value) !== val) slider.value = val;
      slider.title = '拖拽滑动调节权重 (当前: ' + val + ')';
      slider.style.background = 'linear-gradient(to right, #dedede 0%, #dedede ' + val + '%, #262626 ' + val + '%, #262626 100%)';
    }
    const numInput = card.querySelector('.v3-meter-wt-input, .v3-cap-wt-input');
    if(numInput && Number(numInput.value) !== val) {
      numInput.value = val;
    }
  });
}

function renderLibrarySidebarHtml(allCats) {
  const totalCount = allCats.reduce((s, k) => s + (state.library[k]?.items.length || 0), 0);

  let html = '<div class="v3-weight-search-box" style="padding:6px 10px 8px;border-bottom:1px solid #2a2a2a">' +
    '<input type="text" id="v3LibSearchInput" class="v3-weight-search-input" placeholder="快速搜索标签..." value="' + esc(_v3LibSearch) + '">' +
  '</div>';

  html += '<button type="button" class="v3-lib-cat-btn ' + (_v3LibActiveCat === 'all' ? 'active' : '') + '" data-lib-cat="all">' +
    '<span>✦ 全部汇总</span>' +
    '<span class="v3-lib-cat-badge">' + totalCount + '</span>' +
  '</button>';

  html += allCats.map(k => {
    const isActive = k === _v3LibActiveCat;
    const cat = state.library[k];
    const items = cat?.items || [];
    return '<div class="v3-lib-cat-item ' + (isActive ? 'active' : '') + '">' +
      '<button type="button" class="v3-lib-cat-btn ' + (isActive ? 'active' : '') + '" data-lib-cat="' + esc(k) + '">' +
        '<span>● ' + esc(catName(k)) + '</span>' +
        '<span class="v3-lib-cat-badge">' + items.length + '</span>' +
      '</button>' +
      '<div class="v3-lib-cat-actions">' +
        '<button type="button" class="v3-lib-cat-act-btn" data-shelf-rename="' + esc(k) + '" title="重命名此分类">✎</button>' +
        '<button type="button" class="v3-lib-cat-act-btn del" data-shelf-del="' + esc(k) + '" title="清空或删除此分类">🗑</button>' +
      '</div>' +
    '</div>';
  }).join('');

  return html;
}

function renderLibraryMainHtml(allCats) {
  const isAll = _v3LibActiveCat === 'all';
  const targetCats = isAll ? allCats : [_v3LibActiveCat];
  const catTitle = isAll ? '全部汇总' : catName(_v3LibActiveCat);
  const currentItemsCount = targetCats.reduce((s, k) => s + (state.library[k]?.items.length || 0), 0);
  const query = _v3LibSearch.trim().toLowerCase();

  let addBarHtml = '';
  if (!isAll) {
    addBarHtml = '<div class="v3-lib-fast-add-bar">' +
      '<input type="text" id="v3LibFastTagName" class="field" placeholder="在「' + esc(catTitle) + '」中快速录入新标签（回车直接添加）..." maxlength="36" style="flex:2;min-width:180px">' +
      '<div style="display:flex;align-items:center;gap:6px;flex-shrink:0">' +
        '<span style="font-size:11px;color:#a5a5a5">初始权重:</span>' +
        '<input type="number" id="v3LibFastTagWt" class="field" min="0" max="100" value="40" style="width:52px;text-align:center">' +
      '</div>' +
      '<button type="button" id="v3LibFastAddBtn" class="button primary" style="padding:6px 14px;white-space:nowrap">＋ 添加到库</button>' +
    '</div>';
  }

  let sectionsHtml = targetCats.map(k => {
    const cat = state.library[k];
    if(!cat) return '';
    const { total: catTotal } = calculateCatProbabilities(k);
    let items = cat.items || [];
    if(query){
      items = items.filter(x => x[0].toLowerCase().includes(query) || catName(k).toLowerCase().includes(query));
    }
    if(query && !items.length) return '';

    const meterCards = items.map(x => {
      const name = x[0];
      const wt = Number(state.weights?.[k]?.[name] ?? x[1]);
      const isZero = wt === 0;

      return '<div class="v3-lib-meter-card ' + (isZero ? 'zero-weight' : '') + '" data-cat="' + esc(k) + '" data-tag="' + esc(name) + '">' +
        '<div class="v3-meter-top">' +
          '<span class="v3-cap-name-wrap" data-cat="' + esc(k) + '" data-tag="' + esc(name) + '" title="点击文字可直接原地改名">' +
            '<span class="v3-cap-name-text">' + esc(name) + '</span>' +
          '</span>' +
          '<div class="v3-meter-stepper">' +
            '<button type="button" class="v3-meter-step-btn" data-lib-step="-5" data-cat="' + esc(k) + '" data-tag="' + esc(name) + '" title="权重 -5">-</button>' +
            '<input type="number" class="v3-meter-wt-input" min="0" max="100" value="' + wt + '" data-cat="' + esc(k) + '" data-tag="' + esc(name) + '" title="直接输入权重 (0~100)">' +
            '<button type="button" class="v3-meter-step-btn" data-lib-step="5" data-cat="' + esc(k) + '" data-tag="' + esc(name) + '" title="权重 +5">+</button>' +
            '<button type="button" class="v3-meter-del-btn" data-del-cat="' + esc(k) + '" data-del-tag="' + esc(name) + '" title="从词库中移除此标签">✕</button>' +
          '</div>' +
        '</div>' +
        '<div class="v3-wt-slider-wrap" style="width:100%;margin-top:2px;">' +
          '<input type="range" class="v3-wt-slider v3-lib-slider" min="0" max="100" step="1" value="' + wt + '" data-cat="' + esc(k) + '" data-tag="' + esc(name) + '" title="拖拽滑动调节权重 (当前: ' + wt + ')" style="background: linear-gradient(to right, #dedede 0%, #dedede ' + wt + '%, #262626 ' + wt + '%, #262626 100%);">' +
        '</div>' +
      '</div>';
    }).join('');

    const batchToolbar = '<div class="v3-weight-batch-bar">' +
      '<span style="font-size:10px;color:#969696;margin-right:2px">批处理:</span>' +
      '<button class="v3-wt-pill-btn" data-wt-batch="equal" data-cat="' + esc(k) + '" title="全成分配为等概率 50">⚖ 均等(50)</button>' +
      '<button class="v3-wt-pill-btn" data-wt-batch="top3" data-cat="' + esc(k) + '" title="强化前三项，其余转长尾">✦ 聚焦前三</button>' +
      '<button class="v3-wt-pill-btn" data-wt-batch="zero" data-cat="' + esc(k) + '" title="此分类全部设为 0 (暂停抽取)">✕ 全部归零</button>' +
      '<button class="v3-wt-pill-btn" data-wt-batch="reset" data-cat="' + esc(k) + '" title="恢复为库内置默认权重">↺ 恢复默认</button>' +
    '</div>';

    return '<section class="v3-lib-cat-section" data-section-cat="' + esc(k) + '">' +
      '<div class="v3-lib-section-head">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
          '<h4>✦ ' + esc(catName(k)) + '</h4>' +
          '<span class="v3-lib-section-count">' + (cat.items?.length || 0) + ' 个标签 · 总权重: <strong id="v3CatTotalWt_' + esc(k) + '">' + catTotal + '</strong></span>' +
        '</div>' +
        batchToolbar +
      '</div>' +
      '<div class="v3-lib-shelf-pool">' +
        (meterCards || '<div class="v3-shelf-empty">' + (query ? '未找到匹配关键词的标签' : '当前分类暂无标签，在上方输入名称即可快速录入。') + '</div>') +
      '</div>' +
    '</section>';
  }).join('');

  if(!sectionsHtml && query){
    sectionsHtml = '<div class="empty" style="padding:48px 16px;text-align:center">' +
      '<strong style="font-size:13px;color:#f9f9f9">未找到匹配「' + esc(query) + '」的标签</strong>' +
      '<p style="font-size:11px;color:#969696;margin-top:4px">请尝试更换搜索词，或在左侧切换分类。</p>' +
    '</div>';
  }

  return '<div class="v3-lib-main-topbar">' +
      '<div class="v3-lib-main-title">' +
        '<h3>✦ ' + esc(catTitle) + '</h3>' +
        '<span class="v3-lib-stats-badge">' + currentItemsCount + ' 个标签</span>' +
      '</div>' +
      '<div style="display:flex;align-items:center;gap:8px;margin-right:38px">' +
        '<button class="button small" id="v3LibResetAllWeightsBtn" title="全部恢复为预设初始权重" style="background:#282828;border-color:#3c3c3c;color:#a4a4a4;border-radius:20px;padding:4px 10px;font-size:11px;cursor:pointer">↺ 恢复初始</button>' +
        '<button class="button small" id="v3GoFullTagMatrix" style="background:#282828;border-color:#3c3c3c;color:#e2e2e2;border-radius:20px;padding:4px 12px;font-weight:600">🏷 前往全屏视觉标签库 →</button>' +
      '</div>' +
    '</div>' +
    addBarHtml +
    '<div class="v3-lib-main-scroll">' +
      sectionsHtml +
    '</div>';
}

function refreshLibraryUI(){
  const allCats = catIds(state);
  if(_v3LibActiveCat !== 'all' && !allCats.includes(_v3LibActiveCat)){
    _v3LibActiveCat = allCats[0] || 'all';
  }
  const catList = document.getElementById('v3LibCatList');
  if(catList) catList.innerHTML = renderLibrarySidebarHtml(allCats);
  const main = document.getElementById('v3LibMain');
  if(main) main.innerHTML = renderLibraryMainHtml(allCats);
}

function updateLibTagWeight(cat, tag, newWeight) {
  const num = Math.max(0, Math.min(100, Number(newWeight) || 0));
  state.weights[cat] = state.weights[cat] || {};
  state.weights[cat][tag] = num;
  const item = state.library[cat]?.items.find(x => x[0] === tag);
  if (item) item[1] = num;
  save();
  renderConditions();
  updateLibCategoryProbabilitiesInDOM(cat);
}


function startInlineRenameTag(capWrap) {
  const cat = capWrap.dataset.cat;
  const oldName = capWrap.dataset.tag;
  if (!cat || !oldName || capWrap.querySelector('input')) return;

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'v3-cap-name-input';
  input.value = oldName;
  input.maxLength = 36;
  input.dataset.cat = cat;
  input.dataset.oldName = oldName;

  capWrap.innerHTML = '';
  capWrap.appendChild(input);
  input.focus();
  input.select();

  let finished = false;
  function finishRename(saveChanges) {
    if (finished) return;
    finished = true;
    const newName = input.value.trim();
    if (saveChanges && newName && newName !== oldName) {
      const duplicate = catIds(state).some(k => state.library[k].items.some(x => x[0] === newName));
      if (duplicate) {
        notice('词库中已存在同名标签「' + newName + '」');
        capWrap.innerHTML = '<span class="v3-cap-name-text">' + esc(oldName) + '</span>';
        return;
      }
      const item = state.library[cat].items.find(x => x[0] === oldName);
      if (item) item[0] = newName;
      if (state.weights?.[cat]?.[oldName] !== undefined) {
        state.weights[cat][newName] = state.weights[cat][oldName];
        delete state.weights[cat][oldName];
      }
      save();
      renderConditions();
      notice('已更名为「' + newName + '」');
      capWrap.dataset.tag = newName;
      const capsule = capWrap.closest('.v3-lib-meter-card, .v3-lib-capsule');
      if (capsule) {
        capsule.dataset.tag = newName;
        capsule.querySelectorAll('[data-tag]').forEach(el => el.dataset.tag = newName);
      }
      capWrap.innerHTML = '<span class="v3-cap-name-text">' + esc(newName) + '</span>';
    } else {
      capWrap.innerHTML = '<span class="v3-cap-name-text">' + esc(oldName) + '</span>';
    }
  }

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      finishRename(true);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      finishRename(false);
    }
  });

  input.addEventListener('blur', () => {
    finishRename(true);
  });
}

function addLibraryTagFast(){
  const nameInput = document.getElementById('v3LibFastTagName');
  const wtInput = document.getElementById('v3LibFastTagWt');
  const name = nameInput?.value.trim();
  if(!name) return notice('请输入标签名称');

  const catKey = _v3LibActiveCat === 'all' ? (catIds(state)[0] || ensureCategory('未分类')) : _v3LibActiveCat;
  if(!catKey || !state.library[catKey]) return notice('请先在左侧选择一个目标分类');

  if(catIds(state).some(k => state.library[k].items.some(x => x[0] === name))){
    return notice('标签「' + name + '」已存在于词库中');
  }

  const weight = Math.max(1, Math.min(100, Number(wtInput?.value) || 40));
  state.library[catKey].items.push([name, weight]);
  state.weights[catKey] = state.weights[catKey] || {};
  state.weights[catKey][name] = weight;

  save();
  renderConditions();
  refreshLibraryUI();
  notice('已添加「' + name + '」到 ' + catName(catKey));

  if(nameInput) {
    nameInput.value = '';
    nameInput.focus();
  }
}

function showLibrary(){tagBridge.refresh();
  const allCats = catIds(state);
  if(_v3LibActiveCat !== 'all' && !allCats.includes(_v3LibActiveCat)){
    _v3LibActiveCat = allCats[0] || 'all';
  }

  const body = '<div class="v3-library-layout">' +
    '<aside class="v3-lib-sidebar">' +
      '<div class="v3-lib-sidebar-head">' +
        '<h4>词库分类</h4>' +
        '<button type="button" class="v3-lib-newcat-mini-btn" id="v3LibNewCatBtn" title="新建自定义分类">＋ 新建</button>' +
      '</div>' +
      '<div class="v3-lib-cat-list" id="v3LibCatList">' +
        renderLibrarySidebarHtml(allCats) +
      '</div>' +
    '</aside>' +
    '<main class="v3-lib-main" id="v3LibMain">' +
      renderLibraryMainHtml(allCats) +
    '</main>' +
  '</div>';

  const foot = '';

  modal('', '', body, foot, 'library');

  setTimeout(() => {
    const input = document.getElementById('v3LibFastTagName');
    if (input) input.focus();
  }, 60);
}

// ========================================================
// Tag Picker Modal Logic (Constraint & Exclude Selection)
// ========================================================
let _v3PickerCategory = '全部分类';
let _v3PickerQuery = '';
let _v3PickerFilter = 'all'; // 'all' | 'fixed' | 'excluded' | 'unselected'

function getAllPickerTags() {
  const list = [];
  const seen = new Set();

  if (typeof store !== 'undefined' && Array.isArray(store.tagItems)) {
    store.tagItems.forEach(t => {
      if (t && t.name && !seen.has(t.name)) {
        seen.add(t.name);
        list.push({
          name: t.name,
          category: t.category || '未分类',
          desc: t.desc || '',
          source: '视觉标签库'
        });
      }
    });
  }

  if (typeof state !== 'undefined') {
    (state.fixed || []).concat(state.excluded || []).forEach(name => {
      if (name && !seen.has(name)) {
        seen.add(name);
        list.push({
          name: name,
          category: '当前已设',
          desc: '',
          source: '已设约束'
        });
      }
    });
  }

  return list;
}

function getFilteredPickerTags(allTags) {
  return allTags.filter(t => {
    if (_v3PickerCategory !== '全部分类' && t.category !== _v3PickerCategory) {
      return false;
    }
    if (_v3PickerQuery) {
      const q = _v3PickerQuery.toLowerCase().trim();
      const matchName = t.name.toLowerCase().includes(q);
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchDesc = (t.desc || '').toLowerCase().includes(q);
      if (!matchName && !matchCat && !matchDesc) return false;
    }
    const isFixed = state.fixed.includes(t.name);
    const isExcluded = state.excluded.includes(t.name);
    if (_v3PickerFilter === 'fixed' && !isFixed) return false;
    if (_v3PickerFilter === 'excluded' && !isExcluded) return false;
    if (_v3PickerFilter === 'unselected' && (isFixed || isExcluded)) return false;
    return true;
  });
}

function renderTagPickerSidebarHtml(orderedCats, allTags) {
  return orderedCats.map(c => {
    const isActive = c === _v3PickerCategory;
    const catTags = c === '全部分类' ? allTags : allTags.filter(t => t.category === c);
    const fixedInCat = catTags.filter(t => state.fixed.includes(t.name)).length;
    const excludedInCat = catTags.filter(t => state.excluded.includes(t.name)).length;

    let miniBadges = '';
    if (fixedInCat > 0) miniBadges += '<span class="v3-picker-mini-indicator fixed">✔' + fixedInCat + '</span>';
    if (excludedInCat > 0) miniBadges += '<span class="v3-picker-mini-indicator excluded">✖' + excludedInCat + '</span>';

    return '<button type="button" class="v3-picker-cat-btn ' + (isActive ? 'active' : '') + '" data-picker-cat="' + esc(c) + '">' +
      '<span>' + esc(c) + '</span>' +
      '<div class="v3-picker-cat-badges">' + miniBadges + '<span class="v3-picker-cat-badge">' + catTags.length + '</span></div>' +
    '</button>';
  }).join('');
}

function renderTagPickerFilterTabsHtml(allTags) {
  const fixedCount = state.fixed.length;
  const excludedCount = state.excluded.length;
  const unselectedCount = allTags.filter(t => !state.fixed.includes(t.name) && !state.excluded.includes(t.name)).length;

  const tabs = [
    { id: 'all', label: '全部', count: allTags.length },
    { id: 'fixed', label: '✔ 必须保留', count: fixedCount, color: '#9ec7a3' },
    { id: 'excluded', label: '✖ 本轮排除', count: excludedCount, color: '#c89f9f' },
    { id: 'unselected', label: '○ 未选择', count: unselectedCount }
  ];

  return tabs.map(tab => {
    const isActive = _v3PickerFilter === tab.id;
    return '<button type="button" class="v3-picker-filter-btn ' + (isActive ? 'active' : '') + '" data-picker-filter="' + tab.id + '">' +
      '<span>' + esc(tab.label) + '</span>' +
      '<span style="opacity:0.85;font-size:10px;' + (tab.color ? 'color:' + tab.color : '') + '">(' + tab.count + ')</span>' +
    '</button>';
  }).join('');
}

function renderTagPickerSubbarHtml(allTags) {
  const filtered = getFilteredPickerTags(allTags);
  const catText = _v3PickerCategory === '全部分类' ? '全部分类' : '分类：' + _v3PickerCategory;
  const queryText = _v3PickerQuery ? ' · 搜索关键词「' + esc(_v3PickerQuery) + '」' : '';

  return '<span>' + catText + queryText + ' · 显示 <strong>' + filtered.length + '</strong> / ' + allTags.length + ' 项</span>' +
    '<div class="v3-picker-subbar-actions">' +
      '<button type="button" class="v3-picker-subbar-btn" data-picker-batch="fixed" title="将当前列表显示的标签全部设为保留">＋ 显示项全保留</button>' +
      '<button type="button" class="v3-picker-subbar-btn" data-picker-batch="excluded" title="将当前列表显示的标签全部设为排除">－ 显示项全排除</button>' +
      '<button type="button" class="v3-picker-subbar-btn" data-picker-batch="clear" title="清除当前列表显示标签的保留与排除状态">↺ 重置显示项</button>' +
    '</div>';
}

function renderTagPickerMatrixHtml(allTags) {
  const filtered = getFilteredPickerTags(allTags);
  const q = _v3PickerQuery.trim();

  let bannerHtml = '';
  if (q && !allTags.some(t => t.name === q)) {
    const isQFixed = state.fixed.includes(q);
    const isQExcluded = state.excluded.includes(q);
    bannerHtml = '<div class="v3-picker-add-banner">' +
      '<span>未在库中找到「<strong>' + esc(q) + '</strong>」，可直接作为自定义约束添加：</span>' +
      '<div class="v3-picker-add-banner-actions">' +
        '<button type="button" class="button small ' + (isQFixed ? 'active' : '') + '" data-picker-custom="fixed" data-tag="' + esc(q) + '">✔ 设为保留</button>' +
        '<button type="button" class="button small ' + (isQExcluded ? 'active' : '') + '" data-picker-custom="excluded" data-tag="' + esc(q) + '">✖ 设为排除</button>' +
      '</div>' +
    '</div>';
  }

  if (filtered.length === 0) {
    return bannerHtml +
      '<div style="text-align:center;padding:40px 20px;color:#7a7a7a;font-size:12px;">' +
        '<p style="margin-bottom:8px">没有找到符合条件的标签</p>' +
        '<button type="button" class="button small" id="v3TagPickerResetFilter" style="background:#282828;color:#ccc">重置筛选与搜索</button>' +
      '</div>';
  }

  const cardsHtml = filtered.map(t => {
    const isFixed = state.fixed.includes(t.name);
    const isExcluded = state.excluded.includes(t.name);
    let cardCls = '';
    let statusText = '';
    if (isFixed) {
      cardCls = 'is-fixed';
      statusText = '<span style="font-size:10px;color:#9ec7a3;font-weight:700">✔ 已保留</span>';
    } else if (isExcluded) {
      cardCls = 'is-excluded';
      statusText = '<span style="font-size:10px;color:#c89f9f;font-weight:700">✖ 已排除</span>';
    } else {
      statusText = '<span class="v3-picker-card-cat">' + esc(t.category) + '</span>';
    }

    return '<div class="v3-picker-card ' + cardCls + '" data-picker-tag-toggle="' + esc(t.name) + '" title="点击在 中立 ➔ 保留 ➔ 排除 间循环切换">' +
      '<div class="v3-picker-card-top">' +
        '<div>' +
          '<div class="v3-picker-card-name">' + esc(t.name) + '</div>' +
          statusText +
        '</div>' +
        '<div class="v3-picker-card-actions">' +
          '<button type="button" class="v3-picker-opt-btn opt-fixed" data-picker-set="fixed" data-tag="' + esc(t.name) + '" title="设为必须保留">✔</button>' +
          '<button type="button" class="v3-picker-opt-btn opt-excluded" data-picker-set="excluded" data-tag="' + esc(t.name) + '" title="设为本轮排除">✖</button>' +
        '</div>' +
      '</div>' +
    '</div>';
  }).join('');

  return bannerHtml + '<div class="v3-picker-cards-grid">' + cardsHtml + '</div>';
}

function togglePickerTag(name, action) {
  const isFixed = state.fixed.includes(name);
  const isExcluded = state.excluded.includes(name);

  if (action === 'fixed') {
    if (isFixed) {
      state.fixed = state.fixed.filter(x => x !== name);
    } else {
      state.fixed.push(name);
      state.excluded = state.excluded.filter(x => x !== name);
    }
  } else if (action === 'excluded') {
    if (isExcluded) {
      state.excluded = state.excluded.filter(x => x !== name);
    } else {
      state.excluded.push(name);
      state.fixed = state.fixed.filter(x => x !== name);
    }
  } else {
    // Cycle: neutral -> fixed -> excluded -> neutral
    if (!isFixed && !isExcluded) {
      state.fixed.push(name);
    } else if (isFixed) {
      state.fixed = state.fixed.filter(x => x !== name);
      state.excluded.push(name);
    } else {
      state.excluded = state.excluded.filter(x => x !== name);
    }
  }
}

function batchSetPickerTags(action) {
  const allTags = getAllPickerTags();
  const filtered = getFilteredPickerTags(allTags);
  if (!filtered.length) return;

  filtered.forEach(t => {
    const name = t.name;
    if (action === 'fixed') {
      if (!state.fixed.includes(name)) state.fixed.push(name);
      state.excluded = state.excluded.filter(x => x !== name);
    } else if (action === 'excluded') {
      if (!state.excluded.includes(name)) state.excluded.push(name);
      state.fixed = state.fixed.filter(x => x !== name);
    } else if (action === 'clear') {
      state.fixed = state.fixed.filter(x => x !== name);
      state.excluded = state.excluded.filter(x => x !== name);
    }
  });
}

function refreshTagPickerUI() {
  const allTags = getAllPickerTags();
  const rawCats = [...new Set(allTags.map(t => t.category))].filter(Boolean);
  const preferredOrder = ['外貌特征', '种族与身份', '服装与配饰', '职业与背景', '环境与场景', '动作与构图', '艺术风格', '发型', '服装', '装饰', '气质'];
  const orderedCats = ['全部分类'];
  preferredOrder.forEach(c => { if (rawCats.includes(c)) orderedCats.push(c); });
  rawCats.forEach(c => { if (!orderedCats.includes(c)) orderedCats.push(c); });

  const catList = $('#v3PickerCatList');
  if (catList) catList.innerHTML = renderTagPickerSidebarHtml(orderedCats, allTags);

  const filterTabs = $('#v3PickerFilterTabs');
  if (filterTabs) filterTabs.innerHTML = renderTagPickerFilterTabsHtml(allTags);

  const subbar = $('#v3PickerSubbar');
  if (subbar) subbar.innerHTML = renderTagPickerSubbarHtml(allTags);

  const matrix = $('#v3PickerMatrix');
  if (matrix) matrix.innerHTML = renderTagPickerMatrixHtml(allTags);

  const footInfo = $('#v3PickerFootInfo');
  if (footInfo) {
    footInfo.innerHTML = '已设必须保留：<strong style="color:#9ec7a3">' + state.fixed.length + '</strong> 项 · ' +
      '已设本轮排除：<strong style="color:#c89f9f">' + state.excluded.length + '</strong> 项';
  }

  const clearBtn = $('#v3TagPickerClearSearch');
  if (clearBtn) {
    clearBtn.style.display = _v3PickerQuery ? 'block' : 'none';
  }
}

function openTagPickerModal() {tagBridge.refresh();
  const allTags = getAllPickerTags();
  const rawCats = [...new Set(allTags.map(t => t.category))].filter(Boolean);
  const preferredOrder = ['外貌特征', '种族与身份', '服装与配饰', '职业与背景', '环境与场景', '动作与构图', '艺术风格', '发型', '服装', '装饰', '气质'];
  const orderedCats = ['全部分类'];
  preferredOrder.forEach(c => { if (rawCats.includes(c)) orderedCats.push(c); });
  rawCats.forEach(c => { if (!orderedCats.includes(c)) orderedCats.push(c); });

  if (!orderedCats.includes(_v3PickerCategory)) {
    _v3PickerCategory = '全部分类';
  }

  const body = '<div class="v3-picker-layout">' +
    '<aside class="v3-picker-sidebar">' +
      '<div class="v3-picker-sidebar-head">' +
        '<h4>标签分类库</h4>' +
        '<span style="font-size:10.5px;color:#7a7a7a">共 ' + allTags.length + ' 项</span>' +
      '</div>' +
      '<div class="v3-picker-cat-list" id="v3PickerCatList">' +
        renderTagPickerSidebarHtml(orderedCats, allTags) +
      '</div>' +
    '</aside>' +
    '<main class="v3-picker-main">' +
      '<div class="v3-picker-topbar">' +
        '<div class="v3-picker-filter-row">' +
          '<div class="v3-picker-search-wrap">' +
            '<span class="v3-picker-search-icon"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="display:block;opacity:0.75"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></span>' +
            '<input type="text" id="v3TagPickerSearch" class="v3-picker-search-input" placeholder="在标签库中搜索（如：猫耳、百褶裙、银发）..." value="' + esc(_v3PickerQuery) + '">' +
            ( _v3PickerQuery ? '<button id="v3TagPickerClearSearch" class="v3-picker-search-clear" title="清空搜索">✕</button>' : '' ) +
          '</div>' +
          '<div class="v3-picker-status-filters" id="v3PickerFilterTabs">' +
            renderTagPickerFilterTabsHtml(allTags) +
          '</div>' +
        '</div>' +
        '<div class="v3-picker-subbar" id="v3PickerSubbar">' +
          renderTagPickerSubbarHtml(allTags) +
        '</div>' +
      '</div>' +
      '<div class="v3-picker-matrix" id="v3PickerMatrix">' +
        renderTagPickerMatrixHtml(allTags) +
      '</div>' +
    '</main>' +
  '</div>';

  const foot = '<div id="v3PickerFootInfo" style="font-size:11.5px;color:#a8a8a8">' +
      '已设必须保留：<strong style="color:#9ec7a3">' + state.fixed.length + '</strong> 项 · ' +
      '已设本轮排除：<strong style="color:#c89f9f">' + state.excluded.length + '</strong> 项' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:8px">' +
      '<button class="button small" id="v3TagPickerClearAllBtn" style="background:#282828;border-color:#3c3c3c;color:#bfbfbf">清空全部约束</button>' +
      '<button class="button primary" id="v3TagPickerDoneBtn">完成选择并生效</button>' +
    '</div>';

  modal('从标签库点选标签（硬性约束与排除）', '点选标签快速切换状态：中立未选 ➔ ✔ 必须保留 ➔ ✖ 本轮排除。支持左侧分类与顶部实时检索。', body, foot, 'tag-picker');
}

window.openTagPickerModal = openTagPickerModal;
window.getAllPickerTags = getAllPickerTags;
window.togglePickerTag = togglePickerTag;
window.refreshTagPickerUI = refreshTagPickerUI;


function addLibraryTagV3(){
  const nameInput = document.getElementById('v3LibTagName');
  const catSelect = document.getElementById('v3LibTagCat');
  const newCatInput = document.getElementById('v3LibNewCatName');
  const wtInput = document.getElementById('v3LibTagWt');

  const name = nameInput?.value.trim();
  if(!name) return notice('请输入标签名称');

  let catKey = catSelect?.value;
  if(catKey === '__NEW__'){
    const customName = newCatInput?.value.trim();
    if(!customName) return notice('请输入新分类名称');
    catKey = ensureCategory(customName);
  }

  if(!catKey || !state.library[catKey]) catKey = ensureCategory('未分类');

  if(catIds(state).some(k => state.library[k].items.some(x => x[0] === name))){
    return notice('标签「' + name + '」已存在于词库中');
  }

  const weight = Math.max(1, Math.min(100, Number(wtInput?.value) || 40));
  state.library[catKey].items.push([name, weight]);
  state.weights[catKey] = state.weights[catKey] || {};
  state.weights[catKey][name] = weight;

  save();
  refreshLibraryUI();
  renderConditions();
  notice('已成功添加标签「' + name + '」至「' + catName(catKey) + '」');
}

function draftText(d){const fixed=d.fixed||state.fixed;const tags=Object.keys(d.tags).map(k=>`${catName(k)}：${d.tags[k]||'待探索'}`).join('；');const free=(d.free||[]).map(x=>x.tag+'（库外概念）').join('、')||'无';const action={visual:'请提出三个造型深化方向，重点讨论轮廓、配色、服饰材质和视觉记忆点。',story:'请提出三个不同的人物经历与性格发展方向，先供选择，不要直接定稿。',rp:'请讨论互动方式、说话风格与开场白，再提出适合 SillyTavern 角色卡的字段草案。'}[d.direction]||'';return `请与我逐步完善一个原创角色概念。所有内容均为待审阅提案；未经确认不可写入正式角色档案。\n固定条件：${fixed.join('、')||'无'}\n排除条件：${(d.excluded||[]).join('、')||'无'}\n已抽取标签：${tags}\n库外探索概念：${free}\n候选概念标题：${d.hook}\n候选描写：${d.description}\n角色姓名：${d.name||'未设定，不必强制命名'}\n经确认的视觉设定：${d.visual||'尚无'}\n其他备注：${d.notes||'无'}\n初始探索方向：${d.exploration?.direction||'不限定'}；粒度：${d.exploration?.depth||'中'}；范围：${d.exploration?.breadth||'广泛'}
讨论目标：${action}\n请先提出可选方向并指出需要我决定的关键问题。`}
function draftFrom(c){return {id:'D'+String(state.drafts.length+1).padStart(3,'0'),candidateId:c.id,created:Date.now(),updated:Date.now(),fixed:clone(c.fixed||state.fixed),excluded:clone(c.excluded||state.excluded),tags:clone(c.tags),free:clone(c.free||[]),exploration:clone(c.exploration||state.explorer),hook:c.narrative.title,description:c.narrative.description,name:c.narrative.name||'',visual:'',notes:'',direction:'visual'}}
function openDraft(id){
  let d=id?state.drafts.find(x=>x.id===id):null;
  if(!d){
    const c=current();
    if(!c)return notice('请先选择候选');
    d=draftFrom(c);
    state.drafts.unshift(d);
    save();
  }
  draftID=d.id;
  const tags=Object.keys(d.tags).map(k=>d.tags[k]?catName(k)+' · '+d.tags[k]:null).filter(Boolean);
  const leftHtml=`<div class="v3-draft-left">
    <div class="v3-draft-name-row">
      <label class="mini-label" style="margin:0;width:56px;flex-shrink:0;">暂定姓名</label>
      <input class="field" id="draftName" value="${esc(d.name)}" placeholder="不强制命名，可留空" style="flex:1;">
    </div>
    <div style="display:flex;flex-direction:column;gap:4px;">
      <label class="mini-label" style="margin:0;">标签快照</label>
      <div class="v3-draft-chips chips">
        ${smallTags(tags)}${smallTags(d.free.map(x=>x.tag),'new')}
      </div>
    </div>
    <div class="v3-draft-tabs">
      <button type="button" class="v3-draft-tab active" data-draft-tab="desc">候选角色印象</button>
      <button type="button" class="v3-draft-tab" data-draft-tab="visual">已确认视觉设定</button>
      <button type="button" class="v3-draft-tab" data-draft-tab="notes">创作备注与灵感</button>
    </div>
    <div class="v3-draft-tab-panes">
      <div class="v3-draft-tab-pane active" data-pane="desc">
        <textarea class="field textarea" id="draftDescription" placeholder="详细描述角色外观、性格与行为线索...">${esc(d.description)}</textarea>
      </div>
      <div class="v3-draft-tab-pane" data-pane="visual">
        <textarea class="field textarea" id="draftVisual" placeholder="可以留空，日后逐步确认视觉特征、发色、服饰等细节...">${esc(d.visual)}</textarea>
      </div>
      <div class="v3-draft-tab-pane" data-pane="notes">
        <textarea class="field textarea" id="draftNotes" placeholder="保留设计过程中的疑问、备选设定、灵感线索与未确定的细节...">${esc(d.notes)}</textarea>
      </div>
    </div>
  </div>`;
  const rightHtml=`<div class="v3-draft-right">
    <div style="display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
      <span style="font-size:12px;font-weight:700;color:#f0f0f0;">外部 AI 对话起点预览</span>
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="muted" style="font-size:11px;">深化方向：</span>
        <select class="field select-mini" id="draftDirection" style="width:115px;">
          <option value="visual" ${d.direction==='visual'?'selected':''}>视觉设计</option>
          <option value="story" ${d.direction==='story'?'selected':''}>人物设定</option>
          <option value="rp" ${d.direction==='rp'?'selected':''}>RP 准备</option>
        </select>
      </div>
    </div>
    <div id="draftPreview" class="v3-draft-preview-box"></div>
    <div style="display:flex;justify-content:space-between;align-items:center;flex-shrink:0;padding-top:2px;">
      <span class="mini-desc" style="margin:0;font-size:10px;color:#888;">复制后交给外部模型，避免虚构回复</span>
      <button type="button" class="button small" id="quickCopyPreviewBtn" style="font-size:11px;display:inline-flex;align-items:center;gap:4px;">
        <svg style="width:13px;height:13px;stroke:currentColor;fill:none;vertical-align:middle;"><use href="#i-copy"/></svg>
        <span>复制讨论提示词</span>
      </button>
    </div>
  </div>`;
  modal('角色设计草稿','将候选与创意深化分开保存。这里可以导出 JSON 或复制讨论提示词。',`<div class="v3-draft-split">${leftHtml}${rightHtml}</div>`,`<span class="muted" style="font-size:11.5px">草稿已保存在本地，独立于正式角色档案。</span><div class="toolbar" style="gap:8px"><button class="button" id="copyDraft">复制讨论提示词</button><button class="button" id="exportDraft">导出草稿</button><button class="button primary" id="saveDraft">保存草稿</button></div>`,'draft');
  previewDraft();
}
function syncDraft(){const d=state.drafts.find(x=>x.id===draftID);if(!d)return null;d.name=$('#draftName')?.value||'';d.description=$('#draftDescription')?.value||'';d.visual=$('#draftVisual')?.value||'';d.notes=$('#draftNotes')?.value||'';d.direction=$('#draftDirection')?.value||'visual';d.updated=Date.now();save();return d}
function previewDraft(){const d=state.drafts.find(x=>x.id===draftID);if(!d)return;const cur={...d,name:$('#draftName')?.value??d.name,description:$('#draftDescription')?.value??d.description,visual:$('#draftVisual')?.value??d.visual,notes:$('#draftNotes')?.value??d.notes,direction:$('#draftDirection')?.value??d.direction};const n=$('#draftPreview');if(n)n.textContent=draftText(cur)}
function draftList(){
  const body=state.drafts.length?state.drafts.map(d=>`<div class="v3-draftlist-row">
    <div class="v3-draftlist-item-left">
      <span class="v3-draftlist-title">${esc(d.name||d.hook||'未命名草稿')}</span>
      <div class="v3-draftlist-meta">
        <span class="v3-draftlist-badge">${esc(d.id)}</span>
        <span>来源候选 ${esc(d.candidateId)}</span>
        <span>·</span>
        <span>${new Date(d.updated).toLocaleDateString('zh-CN')}</span>
      </div>
    </div>
    <div class="v3-draftlist-item-right">
      <button class="button small primary" data-open-draft="${esc(d.id)}">打开草稿</button>
    </div>
  </div>`).join(''):'<p class="modaltext">暂无设计草稿。选择一个候选并点击「将概念保存为设计草稿」。</p>';
  modal('设计草稿库','正式角色档案暂未接入，此处仅保存独立草稿。',body,`<span class="muted">不会自动写入 RP 卡或现有酒馆数据。</span><button class="button" data-close>完成</button>`,'draftlist');
}
function taskPrompt(c){const base=catIds(state).filter(k=>c.tags[k]).map(k=>catName(k)+'：'+c.tags[k]).join('；');const free=(c.free||[]).map(x=>x.tag).join('、');return `你是一位原创角色概念设计协作者。请用中文返回且只返回以下 JSON（不要 Markdown 代码块）：\n{\n "title": "一句有画面感的角色概念标题，尽量不要强制取姓名",\n "description": "120～220 字连贯、传神的角色印象，具体描写外貌、一个经历或动机、性格与行为线索",\n "newTags": [{"name":"库外新概念","category":"建议的分类名称"}]\n}\n本轮固定条件：${(c.fixed||state.fixed).join('、')||'无'}。\n排除：${(c.excluded||state.excluded).join('、')||'无'}。\n基础标签：${base||'无'}。\n已有库外概念：${free||'无'}。\n新增库外概念的目标数量：${state.freeSlots}，可以提出新分类，但不要只换已有标签的同义词。\n本轮定向探索主题：${(c.exploration||state.explorer).direction||'不限定'}。
粒度：${(c.exploration||state.explorer).depth}（coarse=宽泛类别、medium=具体身份、fine=带经历的具体概念）；广度：${(c.exploration||state.explorer).breadth}（focused=集中、diverse=多分支）；指定分支：${c.branch||'不限'}。
请先在该方向下发散多个有差异的分支，最后挑出 ${(c.free||[]).length||state.freeSlots} 个与基础标签相协调的库外概念，允许新的标签分类。
角色当前概念：${c.narrative.title}。\n当前描述：${c.narrative.description}。\n要求：尽可能将各要素串成能让人形成画面的角色初稿，保留固定条件，不要出现排除条件；描述可以留有悬念，作为候选提案而非最终事实。`}
function batchTaskText(){
 const ex=state.explorer,base=state.candidates.slice(0,Math.max(1,Math.min(state.count,20))).map(c=>({baseId:c.id,locked:c.fixed,tags:Object.fromEntries(catIds(state).map(k=>[catName(k),c.tags[k]]).filter(x=>x[1])),existingNewTags:(c.free||[]).map(x=>x.tag)}));
 return `你是一位擅长角色设计、概念发散和叙事提案的创作协作者。请为本轮角色候选进行「定向开放探索」。要求先探索可能分支，再将合适的新概念融入角色。\n探索方向：${ex.direction||'开放探索'}\n探索粒度：${ex.depth}（coarse：宽泛类别；medium：具体身份；fine：细节与背景线索）\n探索范围：${ex.breadth}（focused：围绕较少分支深入；diverse：候选之间覆盖多个不同分支）\n优先分支：${ex.focus==='auto'?'自动发现':dirBranches().find(b=>b.id===ex.focus)?.name||ex.focus}\n每张候选的库外核心概念目标数量：${state.freeSlots}。可先发散更多候选概念，再筛选；数量是目标，质量、冲突和约束优先。\n必须保留：${state.fixed.join('、')||'无'}\n排除条件：${state.excluded.join('、')||'无'}\n生成表现：${state.style==='visual'?'视觉优先':state.style==='story'?'人物经历优先':'视觉与故事均衡'}，${state.showNames?'可提出名字':'默认不要命名'}。\n基础候选 JSON：\n${JSON.stringify(base,null,2)}\n请返回严格 JSON（不要 Markdown 代码块），结构：\n{\n "branches":[{"name":"探索分支名称","summary":"分支说明"}],\n "candidates":[{"baseId":"C001","branch":"分支名称","title":"有画面感的一句话概念，不强制名字","description":"120～220字自然连贯的人物形象、可见细节、经历或行动线索；避免只复述标签","newTags":[{"name":"库外概念","category":"建议类别","branch":"分支名称"}]}]\n}\n每个 baseId 对应一条候选，保留对应基础属性。每组候选围绕一个主要身份展开，其余自由槽位优先补充经历、道具、关系或视觉特征，避免同时给同一人物安排互斥的身份，例如既是校长又是课代表。不同候选要体现方向内的差异。可以创造新的标签类别；不要用既有标签的同义词冒充新概念。国籍只表示人物背景，不应直接推断性格。所有人物经历均是待采纳提案，避免擅自写入正式档案。请明确、具体、有创造力。`;
}
async function generateAIRound(button){
 if(remoteBatchPending)return;remoteBatchPending=true;button.disabled=true;
 const original=state;let working,batches=[],completed=0,baseline=JSON.stringify(state);
 const label=button.textContent;
 try{
   state=clone(original);
   if(!generate(true))return;
   working=state;
   const generated=working.candidates.filter(c=>!c.saved);
   if(!generated.length)throw Error('没有可生成的候选');
   // Two candidates per request bound JSON size without changing the requested round size.
   for(let i=0;i<generated.length;i+=2){
     working.candidates=generated.slice(i,i+2);
     batches.push({cards:clone(working.candidates),prompt:batchTaskText()});
   }
 }catch(e){notice(e.message);return;}finally{state=original;if(!batches.length){remoteBatchPending=false;button.disabled=false;}}
 const total=batches.reduce((n,b)=>n+b.cards.length,0);
 try{
   for(let i=0;i<batches.length;i++){
     if(JSON.stringify(state)!==baseline)throw Error('本轮条件或候选已变化，已停止后续请求');
     const batch=batches[i],expected=batch.cards.map(c=>c.id);
     const progress='AI 生成 '+(i+1)+'/'+batches.length+' 批（已完成 '+completed+'/'+total+'）';
     if(button.isConnected)button.textContent=progress;notice(progress);
     const options={featureKey:'concept_desc_gen',input:batch.prompt};
     const preview=CreationWorkflow.buildRequest(options);
     // Task-local budget, visible in the request snapshot; never rewrite the user's preset.
     options.maxTokens=Math.max(8192,Number(preview.payload.max_tokens)||0);
     const result=await window.StudioTasks.json(options);
     if(JSON.stringify(state)!==baseline)throw Error('本轮条件或候选已变化，本批结果保留在请求记录');
     if(!Array.isArray(result.data?.candidates)||result.data.candidates.length!==expected.length||result.data.candidates.some(c=>!expected.includes(c.baseId)))throw Error('模型未返回本批全部候选');
     const before=state;state=clone(state);
     try{
       if(!completed){state.candidates=state.candidates.filter(c=>c.saved);state.batch=working.batch;state.lastSeed=working.lastSeed;state.compare=[];state.filter='all';}
       state.candidates.push(...batch.cards);
       if(!importBatchAI(result.data,true))throw Error('模型结果未通过候选校验');
       for(const c of state.candidates.filter(c=>expected.includes(c.id))){c.generatedBy='ai';c.requestId=result.request.id;}
       save();
     }catch(e){state=before;throw e;}
     completed+=expected.length;baseline=JSON.stringify(state);
     if($('#generateBtn')){render();button=$('#generateBtn');button.disabled=true;button.textContent=progress;}
   }
   notice('AI 已生成 '+completed+' 个候选，尚未写入正式资料');
 }catch(e){notice('生成中止：已保存 '+completed+'/'+total+' 个候选；'+e.message);}
 finally{remoteBatchPending=false;if(button?.isConnected){button.disabled=false;button.textContent=label;}}
}
function batchAITask(){
 modal('整轮 AI 定向探索','导出完整探索任务提示词，支持将外部模型生成的 JSON 结果直接导入当前候选分支。',`<label class="mini-label">探索任务 · 包含方向与本轮候选</label><textarea class="field textarea" id="batchPrompt" rows="11" readonly>${esc(batchTaskText())}</textarea><label class="mini-label">粘贴 AI 返回的 JSON</label><textarea class="field textarea" id="batchResult" rows="9" placeholder='{"branches":[{"name":"校园组织","summary":"..."}],"candidates":[{"baseId":"C001","branch":"校园组织","title":"...","description":"...","newTags":[{"name":"广播站成员","category":"校园组织","branch":"校园组织"}]}]}'></textarea><div class="status" style="margin-top:10px">导入将更新 JSON 中指向的现存候选；原始标签、固定和排除条件不会改变。修改记录允许撤销。AI 建议的新概念先留在候选中，需要人工认可后才能入库。</div>`,`<span class="muted">生成结果先填入预览，确认导入后更新候选。</span><div class="toolbar"><button class="button" id="generateBatchRemote">使用已配置模型生成</button><button class="button" id="copyBatchTask">复制完整任务</button><button class="button primary" id="importBatchAI">导入探索结果</button></div>`,'batch-ai');
}
let remoteBatchPending=false;
async function generateBatchRemote(button){
 if(remoteBatchPending)return;remoteBatchPending=true;button.disabled=true;
 const target=$('#batchResult'),prompt=batchTaskText();
 try{
  const result=await window.StudioTasks.json({featureKey:'discussion',input:prompt});
  if(!Array.isArray(result.data?.candidates)||!result.data.candidates.length)throw Error('模型未返回候选列表，原候选未修改');
  if(target?.isConnected){target.value=JSON.stringify(result.data,null,2);notice('已获取真实模型结果，请检查并点击导入探索结果');}
  else notice('探索已完成，结果保留在请求记录；未更改候选');
 }catch(e){notice(e.message)}finally{remoteBatchPending=false;if(button.isConnected)button.disabled=false;}
}
function importBatchAI(dataOverride=null,quiet=false){
 const raw=$('#batchResult')?.value.trim();if(!raw&&!dataOverride)return notice('请粘贴 AI 返回的 JSON');let data;try{data=dataOverride||JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''))}catch{return notice('JSON 无法解析，请检查格式')}
 if(!data||!Array.isArray(data.candidates)||!data.candidates.length||data.candidates.length>20){if(quiet)throw Error('candidates 必须是包含 1～20 项的数组');return notice('candidates 必须是包含 1～20 项的数组');}
 const changes=[],errors=[],existingNames=new Set(catIds(state).flatMap(k=>state.library[k].items.map(x=>x[0])));let branches=parseBranchList(data.branches);const seen=new Set();
 for(const item of data.candidates){
  if(!item||typeof item.baseId!=='string'||seen.has(item.baseId)){errors.push('候选 ID 重复或缺失');continue}seen.add(item.baseId);
  const c=state.candidates.find(x=>x.id===item.baseId);if(!c){errors.push('找不到候选 '+item.baseId);continue}
  if(typeof item.title!=='string'||!item.title.trim()||item.title.length>120||typeof item.description!=='string'||!item.description.trim()||item.description.length>3500){errors.push(item.baseId+' 标题或描述无效');continue}
  if(!Array.isArray(item.newTags)||item.newTags.length>8){errors.push(item.baseId+' newTags 必须是最多 8 项');continue}
  const free=[];let failed=false;
  for(const f of item.newTags){if(!f||typeof f.name!=='string'||!f.name.trim()||f.name.length>45||typeof f.category!=='string'||f.category.length>32){failed=true;break}
   const name=f.name.trim();if(state.excluded.some(t=>name.includes(t))||state.fixed.includes(name)||existingNames.has(name)){failed=true;break}
   if(!free.some(x=>x.tag===name))free.push({tag:name,category:f.category.trim()||'未分类',thread:'',hook:'',status:'proposal',from:'external-ai',branch:String(f.branch||item.branch||'').slice(0,60),branchId:'',level:state.explorer.depth});
  }
  if(failed){errors.push(item.baseId+' 包含无效或已有的库外标签');continue}
  changes.push({c,item,free});
 }
 if(errors.length){if(quiet)throw Error(errors.join('；'));return notice('导入已取消：'+errors.slice(0,2).join('；'))}
 if(!changes.length)return notice('没有可更新的候选');
 for(const {c,item,free} of changes){record(c,'导入定向开放探索提案');c.generatedBy='external-ai';c.free=free;c.branch=String(item.branch||free[0]?.branch||'').slice(0,60);c.branchId='';c.exploration=clone({...state.explorer,aiBranches:[],aiDirection:''});c.narrative={...c.narrative,title:item.title.trim(),description:item.description.trim(),manual:true,stale:false};c.lineage=(c.lineage||'')+' · 外部 AI 深化';}
 if(branches.length){state.explorer.aiBranches=branches;state.explorer.aiDirection=state.explorer.direction;}state.selected=changes[0].c.id;if(quiet)return true;save();closeModal();render();notice('已导入 '+changes.length+' 组角色概念与 '+branches.length+' 条探索分支，建议逐项审阅');
}
function aiTask(){const c=current();if(!c)return;modal('与外部 AI 协作', '当前分配模型：' + getEffectiveModelConfig('concept_desc_gen').modelName + ' (' + getEffectiveModelConfig('concept_desc_gen').connectionName + ')。支持在原型中直接测试生成或复制完整任务指令：',`<label class="mini-label">完整任务提示词</label><textarea class="field textarea" id="aiPrompt" readonly rows="11">${esc(taskPrompt(c))}</textarea><label class="mini-label">粘贴 AI 返回的 JSON</label><textarea class="field textarea" id="aiResult" rows="7" placeholder='{"title":"...","description":"...","newTags":[{"name":"猫娘","category":"种族"}]}'></textarea><p class="mini-desc">导入只更新当前候选的标题、描述和库外提案，不写入标签库。JSON 会被检查，固定条件与排除条件仍然保留。</p>`,`<span class="muted">只有人工确认后才入库。</span><div class="toolbar"><button class="button" id="copyTask">复制任务</button><button class="button primary" id="importAI">导入 AI 描写</button></div>`,'aitask')}
function importAI(){const c=current(),raw=$('#aiResult')?.value.trim();if(!c||!raw)return notice('请粘贴 AI 返回的 JSON');let obj;try{obj=JSON.parse(raw.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''))}catch{return notice('无法解析 JSON，请检查格式')}if(typeof obj.title!=='string'||typeof obj.description!=='string'||obj.title.length>120||obj.description.length>3000||!obj.title.trim()||!obj.description.trim())return notice('标题或描述缺失，或字数超出允许范围');let free=[];if(obj.newTags!==undefined){if(!Array.isArray(obj.newTags)||obj.newTags.length>8)return notice('newTags 需为不超过 8 项的数组');for(const t of obj.newTags){if(!t||typeof t.name!=='string'||t.name.length>36||typeof t.category!=='string'||t.category.length>24)return notice('库外标签格式错误');const name=t.name.trim();if(!name||state.excluded.some(x=>name.includes(x))||state.fixed.includes(name))return notice('AI 新标签与当前条件冲突');if(catIds(state).some(k=>state.library[k].items.some(item=>item[0]===name)))return notice('AI 提案包含已有标签：'+name+'。请移出 newTags 或更换概念');if(!free.some(x=>x.tag===name))free.push({tag:name,category:t.category.trim()||'未分类',thread:'',status:'proposal',from:'external-ai'})}}
 record(c,'导入外部 AI 提案');c.generatedBy='external-ai';c.narrative={...c.narrative,title:obj.title.trim(),description:obj.description.trim(),manual:true,stale:false};if(obj.newTags!==undefined)c.free=free;save();closeModal();renderCards();renderEditor();notice('AI 创意已导入当前候选，可进一步审阅和入库')}
function exportFile(filename,obj){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
async function copy(text){try{await navigator.clipboard.writeText(text)}catch{const a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.left='-9999px';document.body.append(a);a.select();document.execCommand('copy');a.remove()}notice('已复制到剪贴板')}
function help(){modal('概念工坊指南','通过输入自然语言设定或点击快速方向，系统将联动保留与排除规则生成多维概念方案。',`<div class="modaltext"><p><b>01 · 指定方向：</b>输入自然语言，或使用「校园生态／国籍地域／职业身份／奇幻种族」示例。设置粗中细、集中或广泛、库外槽位目标数。</p><p><b>02 · 查看分支：</b>打开概念分支地图，可选择自动分配或锁定某一分支。新一轮会从所选分支产生候选；切换方向不会修改已有候选。</p><p><b>03 · 生成并比较：</b>标签按权重抽取；本地示例为识别的方向组合对应演示概念，并生成简短人物印象。收藏、融合、局部重抽、编辑、草稿和权重均保留。</p><p><b>04 · 进一步深化：</b>在右侧选择「沿分支深入」，可从粗粒度衍生成更具体的角色方案。原方案完整保留。</p><p><b>05 · 真正自由探索：</b>点击「整轮 AI 探索任务」，将自然语言方向、标签约束和候选一起交给外部模型。导入返回的 JSON 后，新分支、新标签和描述会加入待审阅候选。</p><p><b>06 · 人工确认：</b>AI 提案不会自动写入标签库。先认可，再确认分类并入库，也可以放入「未分类」。</p><p><b>重要说明：</b>本地示例词池具有有限覆盖范围；对任意自定义方向的真实语义发散，必须接入 AI。离线示例不代表模型理解或真实生成。</p></div>`,`<span class="muted">数据只保存在当前浏览器。建议定期导出。</span><button class="button primary" data-close>开始体验</button>`,'help')}
function onClick(e){
  const b=e.target.closest('button, [data-focus]');
  if(!b)return;
  if(b.classList.contains('select-trigger') || b.closest('.select-shell')) return;
  if(!b.closest('.concept-workbench-root') && !b.closest('#conceptOverlay'))return;
  if(b.id==='closeConceptModal' || b.id==='closeModal') return closeModal();
  if(b.id === 'openTagPickerBtn') return openTagPickerModal();
  if(b.dataset.pickerCat){ _v3PickerCategory = b.dataset.pickerCat; refreshTagPickerUI(); return; }
  if(b.dataset.pickerFilter){ _v3PickerFilter = b.dataset.pickerFilter; refreshTagPickerUI(); return; }
  if(b.id === 'v3TagPickerClearSearch'){ _v3PickerQuery = ''; const si = $('#v3TagPickerSearch'); if(si) si.value = ''; refreshTagPickerUI(); return; }
  if(b.id === 'v3TagPickerResetFilter'){ _v3PickerCategory = '全部分类'; _v3PickerQuery = ''; _v3PickerFilter = 'all'; const si = $('#v3TagPickerSearch'); if(si) si.value = ''; refreshTagPickerUI(); return; }
  if(b.dataset.pickerSet){ togglePickerTag(b.dataset.tag, b.dataset.pickerSet); save(); renderConditions(); refreshTagPickerUI(); return; }
  if(b.dataset.pickerCustom){ togglePickerTag(b.dataset.tag, b.dataset.pickerCustom); save(); renderConditions(); refreshTagPickerUI(); return; }
  if(b.dataset.pickerBatch){ batchSetPickerTags(b.dataset.pickerBatch); save(); renderConditions(); refreshTagPickerUI(); return; }
  if(b.id === 'v3TagPickerClearAllBtn'){ state.fixed = []; state.excluded = []; save(); renderConditions(); refreshTagPickerUI(); notice('已清空全部保留与排除约束'); return; }
  if(b.id === 'v3TagPickerDoneBtn'){ save(); renderConditions(); closeModal(); notice('已应用标签约束：' + state.fixed.length + ' 项保留，' + state.excluded.length + ' 项排除'); return; }
  const _cardToggle = b.closest('[data-picker-tag-toggle]');
  if(_cardToggle && !b.closest('.v3-picker-opt-btn')){ togglePickerTag(_cardToggle.dataset.pickerTagToggle); save(); renderConditions(); refreshTagPickerUI(); return; }

  if(b.id === 'v3WtResetAllBtn' || b.id === 'v3LibResetAllWeightsBtn'){
    catIds(state).forEach(k => {
      state.library[k].items.forEach(x => {
        state.weights[k] = state.weights[k] || {};
        state.weights[k][x[0]] = x[1];
      });
    });
    save();
    renderWeightMainContent();
    refreshLibraryUI();
    notice('全部分类已恢复默认初始权重');
    return;
  }
  if(b.dataset.wtCatNav){
    _v3WeightCat = b.dataset.wtCatNav;
    document.querySelectorAll('.v3-weight-cat-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.wtCatNav === _v3WeightCat));
    renderWeightMainContent();
    return;
  }
  if(b.dataset.wtBatch){
    applyWeightBatch(b.dataset.cat, b.dataset.wtBatch);
    return;
  }
  if(b.dataset.wtStep){
    const step = Number(b.dataset.wtStep) * 5;
    const cat = b.dataset.cat, label = b.dataset.label;
    const curVal = Number(state.weights?.[cat]?.[label] ?? 50);
    updateTagWeightInDOM(cat, label, curVal + step);
    return;
  }
  if(b.id === 'v3GoFullTagMatrix'){
    closeModal();
    if(typeof visit === 'function') visit('tags');
    return;
  }
  if(b.dataset.libCat){
    _v3LibActiveCat = b.dataset.libCat;
    refreshLibraryUI();
    return;
  }
  if(b.id === 'v3LibFastAddBtn'){
    addLibraryTagFast();
    return;
  }
  if(b.id === 'v3LibNewCatBtn'){
    const newName = prompt('请输入新分类名称（例如：场景特质、专属配饰）：');
    if(newName && newName.trim()){
      const newKey = ensureCategory(newName.trim());
      _v3LibActiveCat = newKey;
      save();
      renderConditions();
      refreshLibraryUI();
      notice('已新建分类「' + newName.trim() + '」');
    }
    return;
  }
  if(b.id === 'v3LibAddTagBtn'){
    addLibraryTagV3();
    return;
  }
  if(b.dataset.delCat){
    const cat = b.dataset.delCat, tag = b.dataset.delTag;
    state.library[cat].items = state.library[cat].items.filter(x => x[0] !== tag);
    if(state.weights?.[cat]?.[tag] !== undefined) delete state.weights[cat][tag];
    save();
    refreshLibraryUI();
    renderConditions();
    notice('已从词库中移除「' + tag + '」');
    return;
  }
  if(b.dataset.shelfAdd){
    const catKey = b.dataset.shelfAdd;
    const catSel = $('#v3LibTagCat');
    if(catSel) {
      catSel.value = catKey;
      $('#v3LibNewCatName').style.display = 'none';
    }
    const nameInput = $('#v3LibTagName');
    if(nameInput) {
      nameInput.focus();
      nameInput.placeholder = '向「' + catName(catKey) + '」录入标签...';
    }
    return;
  }
  if(b.dataset.shelfRename){
    const catKey = b.dataset.shelfRename;
    const curName = catName(catKey);
    const newName = prompt('请输入分类「' + curName + '」的新名称：', curName);
    if(newName && newName.trim() && newName.trim() !== curName){
      state.library[catKey].name = newName.trim();
      save();
      refreshLibraryUI();
      renderConditions();
      notice('分类已更名为「' + newName.trim() + '」');
    }
    return;
  }
  if(b.dataset.shelfDel){
    const catKey = b.dataset.shelfDel;
    const items = state.library[catKey].items;
    if(items.length > 0){
      if(confirm('确定要清空「' + catName(catKey) + '」下的全部 ' + items.length + ' 个标签吗？')){
        state.library[catKey].items = [];
        save();
        refreshLibraryUI();
        renderConditions();
        notice('已清空分类「' + catName(catKey) + '」');
      }
    } else {
      delete state.library[catKey];
      delete state.explore[catKey];
      save();
      refreshLibraryUI();
      renderConditions();
      notice('已删除分类「' + catName(catKey) + '」');
    }
    return;
  }

  if(b.id==='importToSillyTavernBtn'){ const c=current(); if(c) importCandidateToSillyTavern(c); return; }
  if(b.dataset.importSt){ const c=state.candidates.find(x=>x.id===b.dataset.importSt); if(c) importCandidateToSillyTavern(c); return; }
  if(b.dataset.viewmode){
    state.viewMode = b.dataset.viewmode;
    $('#viewModeCardsBtn')?.classList.toggle('active', state.viewMode==='cards');
    $('#viewModeCompactBtn')?.classList.toggle('active', state.viewMode==='compact');
    save();
    renderCards();
    return;
  }
  if(b.dataset.edtab){
    state.edTab = b.dataset.edtab;
    $$('.editor-tab-btn').forEach(btn => {
      const isActive = btn.dataset.edtab === state.edTab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    save();
    renderEditor();
    return;
  }
  if(b.dataset.nav){
    const navMap = {'首页':'home','会话':'sessions','角色':'roles','标签库':'tags','标签':'tags','作品':'works','RP':'rp','概念工坊':'concept'};
    if(navMap[b.dataset.nav] && typeof visit==='function'){ visit(navMap[b.dataset.nav]); return; }
  }
 if(b.dataset.directionPreset){adjustExplorer({direction:DIRECTION_PRESETS[b.dataset.directionPreset]});return}
 if(b.dataset.focus){setFocus(b.dataset.focus);return}
 if(b.dataset.remove){state[b.dataset.remove]=state[b.dataset.remove].filter(x=>x!==b.dataset.label);save();renderConditions();$('#conditionError').textContent=constraints();return}
 if(b.dataset.mode){
  state.mode=b.dataset.mode;
  save();
  renderConditions();
  if(state.mode==='hybrid') notice('AI 协作：点击生成一轮即可调用模型');
  else if(state.mode==='creative') notice('AI 自由探索：点击生成一轮即可调用模型');
  else notice('已切换至「本地算法模式」');
  return;
 }
 if(b.dataset.count){state.count=Number(b.dataset.count);save();renderConditions();return}
 if(b.dataset.filter){state.filter=b.dataset.filter;save();renderCards();return}
 if(b.dataset.save){const c=state.candidates.find(x=>x.id===b.dataset.save);if(c){c.saved=!c.saved;save();renderCards();renderEditor();notice(c.saved?'已收藏 '+c.id:'已取消收藏')}return}
 if(b.dataset.compare){const id=b.dataset.compare;if(state.compare.includes(id))state.compare=state.compare.filter(x=>x!==id);else{if(state.compare.length===2)state.compare.shift();state.compare.push(id)}save();renderCards();return}
 if(b.dataset.lock){const c=current();if(c){c.locked[b.dataset.lock]=!c.locked[b.dataset.lock];save();renderEditor()}return}
 if(b.dataset.reroll)return reroll(b.dataset.reroll);
 if(b.dataset.rerollFree!==undefined)return rerollFree(Number(b.dataset.rerollFree));
 if(b.dataset.approve!==undefined){const c=current();if(c){c.free[Number(b.dataset.approve)].status='approved';save();renderEditor();renderCards();notice('已认可该创意，仍未入库')}return}
 if(b.dataset.accept!==undefined)return showAccept(Number(b.dataset.accept));
 if(b.dataset.openDraft)return openDraft(b.dataset.openDraft);
 if(b.dataset.draftTab){
   const tab = b.dataset.draftTab;
   $$('.v3-draft-tab').forEach(btn => btn.classList.toggle('active', btn.dataset.draftTab === tab));
   $$('.v3-draft-tab-pane').forEach(p => {
     const isMatch = p.dataset.pane === tab;
     p.classList.toggle('active', isMatch);
     p.style.display = isMatch ? 'flex' : 'none';
   });
   return;
 }
 if(b.id === 'quickCopyPreviewBtn'){
   const text = $('#draftPreview')?.textContent || '';
   if(text) copy(text);
   return;
 }
 if(b.dataset.comparePick){const [k,side]=b.dataset.comparePick.split(':');comparePicks[k]=side;$$('[data-compare-pick]').filter(x=>x.dataset.comparePick.startsWith(k+':')).forEach(x=>x.classList.toggle('chosen',x.dataset.comparePick.endsWith(':'+side)));return}
 if(b.dataset.close!==undefined)return closeModal();
 if(b.id==='branchMapBtn'||b.id==='branchMapInline')return showBranchMap();
 if(b.id==='branchGenerateBtn'){closeModal();return generate()}
 if(b.id==='generateBatchRemote')return generateBatchRemote(b);
 if(b.id==='batchAIBtn')return batchAITask();
 if(b.id==='copyBatchTask')return copy($('#batchPrompt').value);
 if(b.id==='importBatchAI')return importBatchAI();
 if(b.id==='deepenBranchBtn')return deepenBranch();
 switch(b.id){
 case 'addFixed':return addCondition('fixed');case 'addExcluded':return addCondition('excluded');case 'generateBtn':return ['hybrid','creative'].includes(state.mode)?generateAIRound(b):generate();case 'weightBtn':return showWeights();case 'libraryBtn':return showLibrary();case 'draftsBtn':return draftList();case 'helpBtn':return help();case 'compareBtn':return showCompare();case 'mergeBtn':return merge();case 'rerollAll':return rerollAll();case 'undoBtn':return undo();case 'forkBtn':return fork();case 'addFree':return addFree();case 'rewriteNarrative':return rewrite();case 'saveNarrative':return saveNarrative();case 'draftBtn':return openDraft();case 'aiTaskBtn':return aiTask();case 'confirmAccept':return acceptTag(Number(b.dataset.index));case 'addLibraryTag':return addLibraryTag();case 'saveDraft':syncDraft();closeModal();render();return notice('设计草稿已保存');case 'copyDraft':{const d=syncDraft();if(d)copy(draftText(d));return}case 'exportDraft':{const d=syncDraft();if(d)exportFile('character-draft-'+d.id+'.json',{version:2,data:d});return}case 'copyTask':return copy($('#aiPrompt')?.value||'');case 'importAI':return importAI();case 'exportBtn':exportFile('character-concept-workbench-v2.json',{version:2,exportedAt:new Date().toISOString(),data:state});return notice('已导出完整数据');case 'closeModal':return closeModal();case 'resetBtn':if(confirm('将清除 V2 原型候选、草稿、权重和新标签（不删除 V1 数据）。确定吗？')){WorkspaceStorage.removeItem(KEY);state=defaultState();$('#seedInput').value='';generate();notice('V2 已恢复默认设置')}return;
 }
}
document.addEventListener('click',onClick);
document.addEventListener('click', e => {
  const capWrap = e.target.closest('.v3-cap-name-wrap');
  if(capWrap && capWrap.closest('#conceptOverlay')){
    startInlineRenameTag(capWrap);
    return;
  }
  const stepBtn = e.target.closest('[data-lib-step]');
  if(stepBtn && stepBtn.closest('#conceptOverlay')){
    const step = Number(stepBtn.dataset.libStep);
    const cat = stepBtn.dataset.cat, tag = stepBtn.dataset.tag;
    const item = state.library[cat]?.items.find(x => x[0] === tag);
    const curVal = Number(state.weights?.[cat]?.[tag] ?? item?.[1] ?? 40);
    const newVal = Math.max(0, Math.min(100, curVal + step));
    updateLibTagWeight(cat, tag, newVal);
    const card = stepBtn.closest('.v3-lib-meter-card');
    const wtInput = card?.querySelector('.v3-meter-wt-input, .v3-cap-wt-input');
    if(wtInput) wtInput.value = newVal;
    const slider = card?.querySelector('.v3-lib-slider');
    if(slider) {
      slider.value = newVal;
      slider.title = '拖拽滑动调节权重 (当前: ' + newVal + ')';
      slider.style.background = 'linear-gradient(to right, #dedede 0%, #dedede ' + newVal + '%, #262626 ' + newVal + '%, #262626 100%)';
    }
    return;
  }
});
document.addEventListener('click', e => {
  const conOv = typeof $ === 'function' ? $('#conceptOverlay') : null;
  if (conOv && conOv.classList.contains('visible')) {
    if (e.target === conOv || (conOv.contains(e.target) && !e.target.closest('.dialog'))) {
      closeModal();
      return;
    }
  }
  if (e.target.closest('button')) return;
  const card = e.target.closest('[data-open]');
  if (card && (card.closest('.concept-workbench-root') || card.closest('#conceptOverlay'))) {
    state.selected = card.dataset.open;
    save();
    renderCards();
    renderEditor();
  }
});
document.addEventListener('input', e => {
  if (e.target && e.target.id === 'v3TagPickerSearch') {
    _v3PickerQuery = e.target.value;
    refreshTagPickerUI();
  }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target && e.target.id === 'v3LibFastTagName') {
    e.preventDefault();
    addLibraryTagFast();
  }
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(!t.closest('.concept-workbench-root') && !t.closest('#conceptOverlay')) return;
  if(t.classList.contains('v3-cap-wt-input') || t.classList.contains('v3-meter-wt-input')){
    const cat = t.dataset.cat, tag = t.dataset.tag;
    const newVal = Math.max(0, Math.min(100, Number(t.value) || 0));
    t.value = newVal;
    updateLibTagWeight(cat, tag, newVal);
    const card = t.closest('.v3-lib-meter-card');
    const slider = card?.querySelector('.v3-lib-slider');
    if(slider) {
      slider.value = newVal;
      slider.title = '拖拽滑动调节权重 (当前: ' + newVal + ')';
      slider.style.background = 'linear-gradient(to right, #dedede 0%, #dedede ' + newVal + '%, #262626 ' + newVal + '%, #262626 100%)';
    }
    return;
  }

  if(t.id === 'v3LibTagCat'){
    const isNew = t.value === '__NEW__';
    const newCatInput = $('#v3LibNewCatName');
    if(newCatInput){
      newCatInput.style.display = isNew ? 'block' : 'none';
      if(isNew) newCatInput.focus();
    }
    return;
  }

 if(t.dataset.explore){state.explore[t.dataset.explore]=t.checked;save();$('#conditionError').textContent=constraints();return}
 if(t.dataset.prop){editTag(t.dataset.prop,t.value);return}
 if(t.dataset.weightCat){const k=t.dataset.weightCat,n=t.dataset.weightLabel;state.weights[k]??={};state.weights[k][n]=Number(t.value);save();t.nextElementSibling.textContent=t.value;return}
 if(t.id==='styleSelect'){state.style=t.value;save();return}
 if(t.id==='directionInput'){adjustExplorer({direction:t.value.trim()});return}
 if(t.id==='depthSelect'){adjustExplorer({depth:t.value});return}
 if(t.id==='breadthSelect'){adjustExplorer({breadth:t.value});return}
 if(t.id==='showNames'){state.showNames=t.checked;save();return}
 if(t.id==='draftDirection')return previewDraft();
});
document.addEventListener('input',e=>{const t=e.target; if(!t.closest('.concept-workbench-root') && !t.closest('#conceptOverlay')) return;

  if(t.classList.contains('v3-lib-slider')){
    const cat = t.dataset.cat;
    const tag = t.dataset.tag;
    const val = Math.max(0, Math.min(100, Number(t.value) || 0));
    t.title = '拖拽滑动调节权重 (当前: ' + val + ')';
    t.style.background = 'linear-gradient(to right, #dedede 0%, #dedede ' + val + '%, #262626 ' + val + '%, #262626 100%)';
    const card = t.closest('.v3-lib-meter-card');
    if(card) {
      const numInput = card.querySelector('.v3-meter-wt-input, .v3-cap-wt-input');
      if(numInput && Number(numInput.value) !== val) {
        numInput.value = val;
      }
    }
    updateLibTagWeight(cat, tag, val);
    return;
  }

  if(t.classList.contains('v3-meter-wt-input')){
    const cat = t.dataset.cat;
    const tag = t.dataset.tag;
    const rawVal = t.value.trim();
    if(rawVal === '') return;
    const val = Math.max(0, Math.min(100, Number(rawVal) || 0));
    const card = t.closest('.v3-lib-meter-card');
    const slider = card?.querySelector('.v3-lib-slider');
    if(slider) {
      slider.value = val;
      slider.title = '拖拽滑动调节权重 (当前: ' + val + ')';
      slider.style.background = 'linear-gradient(to right, #dedede 0%, #dedede ' + val + '%, #262626 ' + val + '%, #262626 100%)';
    }
    updateLibTagWeight(cat, tag, val);
    return;
  }

  if(t.classList.contains('v3-wt-slider') || t.classList.contains('v3-wt-num')){
    const val = Math.max(0, Math.min(100, Number(t.value) || 0));
    if(t.classList.contains('v3-wt-slider')){
      t.style.background = 'linear-gradient(to right, #dedede 0%, #dedede ' + val + '%, #262626 ' + val + '%, #262626 100%)';
    }
    updateTagWeightInDOM(t.dataset.weightCat, t.dataset.weightLabel, val);
    return;
  }
  if(t.id === 'v3WeightSearchInput'){
    _v3WeightSearch = t.value;
    renderWeightMainContent();
    return;
  }
  if(t.id === 'v3LibSearchInput'){
    _v3LibSearch = t.value;
    const main = document.getElementById('v3LibMain');
    if(main) main.innerHTML = renderLibraryMainHtml(catIds(state));
    return;
  }
if(t.id==='freeSlider'){state.freeSlots=Number(t.value);$('#freeNum').textContent=state.freeSlots+' 个';save();return}if(t.dataset.weightCat){const k=t.dataset.weightCat,n=t.dataset.weightLabel;state.weights[k]??={};state.weights[k][n]=Number(t.value);save();t.nextElementSibling.textContent=t.value;return}if(['draftName','draftDescription','draftVisual','draftNotes'].includes(t.id))return previewDraft()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalType){closeModal();return}if(e.key==='Enter'&&e.target.id==='fixedInput'){e.preventDefault();addCondition('fixed')}if(e.key==='Enter'&&e.target.id==='excludedInput'){e.preventDefault();addCondition('excluded')}if(e.key==='Enter'&&e.target.id==='customFree'){e.preventDefault();addFree()}const card=e.target.closest?.('[data-open]');if(card&&(e.key==='Enter'||e.key===' ')&&!e.target.closest('button')){e.preventDefault();state.selected=card.dataset.open;save();renderCards();renderEditor()}});
const tagBridge=createVisualTagBridge(()=>state,()=>store,()=>WorkspaceStorage.save(store));
migrate();
tagBridge.refresh();
 window.ConceptWorkbench = {
   init: () => {
     render();
     if(typeof enhanceSelects === 'function') enhanceSelects();
   },
   render: () => {
     render();
     if(typeof enhanceSelects === 'function') enhanceSelects();
   },
   openWithRole: (roleId) => {
     if(typeof role !== 'function') return;
     const r = role(roleId);
     if(!r) return;
     if(r.tags && r.tags.length){
       state.fixed = [...new Set([...state.fixed, ...r.tags.slice(0, 3)])];
     }
     if(r.name){
       adjustExplorer({ direction: '围绕 ' + r.name + '（' + (r.series||'角色') + '）的发散与衍生概念探索' });
     }
     save();
     if(typeof visit === 'function') visit('concept');
   },
   setDirection: (direction) => {
     if(typeof adjustExplorer === 'function') adjustExplorer({ direction });
     if(typeof save === 'function') save();
     if(typeof render === 'function') render();
   },
   addSparkTags: (tags) => {
     if(Array.isArray(tags)){
       state.fixed = [...new Set([...state.fixed, ...tags])];
       if(typeof adjustExplorer === 'function'){
         adjustExplorer({ direction: '围绕【' + tags.join('、') + '】展开的灵感探索与角色方案' });
       }
       if(typeof save === 'function') save();
       if(typeof render === 'function') render();
     }
   },
   getState: () => state,
   importCandidateToSillyTavern
 };
 render();
};
