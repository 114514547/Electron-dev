// SillyTavern-Desktop V3 Stage 5 Refined: RP Unified Studio
// ========================================================

// 1. Role Monogram Generator (Clean 2-Letter Badge)
function v3GetRoleMonogram(r) {
  if (!r) return '角';
  if (r.monogram) return r.monogram;
  if (r.name) {
    if (r.name.length >= 2) return r.name.slice(0, 2);
    return r.name;
  }
  return 'RP';
}

// 2. Data Initialization
function v3EnsureRpData() {
  if (ui.rpLeftOpen === undefined) ui.rpLeftOpen = true;
  if (ui.rpRightOpen === undefined) ui.rpRightOpen = true;
  if (!ui.rpRightTab) ui.rpRightTab = 'tasks';
  if (!ui.rpViewMode) ui.rpViewMode = 'sessions'; // 'sessions' | 'tree'
  if (!ui.rpLeftWidth) ui.rpLeftWidth = 265;
  if (!ui.rpRightWidth) ui.rpRightWidth = 280;
  if (!ui.rpSessionQuery) ui.rpSessionQuery = '';

  if (!store.rpSessions) {
    store.rpSessions = {
      yiwen: [
        { id: 's_yiwen_1', title: '冬日雪人与校园日常', updated: '10分钟前', preview: '你来啦，我们继续上次的话题吧？', messages: [
          { by: 'ai', text: '“午后的阳光落在窗沿。她转过身，带着一点好奇打量眼前的情景：‘你来啦，我们继续上次的话题吧？’”' },
          { by: 'you', text: '“我把上次讨论的雪人插画线稿整理好了，你来看看构图合不合适。”' },
          { by: 'ai', text: '“她凑近屏幕，细长的睫毛微微颤动，嘴角勾起一丝浅笑：‘看起来比我想象的还要生动呢。不过左边的围巾阴影，可以再稍稍柔和一点吗？’”' }
        ]},
        { id: 's_yiwen_2', title: '放学后的图书馆自习', updated: '昨天 17:20', preview: '窗外的雨淅淅沥沥地下着。', messages: [
          { by: 'ai', text: '“窗外的雨淅淅沥沥地下着。崔依玟将一杯热可可推到你面前：‘辛苦啦，今天先把数学卷子讲完吧。’”' }
        ]}
      ],
      shuyao: [
        { id: 's_shuyao_1', title: '第三章剧情动机研讨', updated: '2小时前', preview: '今天打算从哪一段剧情开始讨论？', messages: [
          { by: 'ai', text: '“她合上手中的精装书，抬起清澈的眼眸：‘今天打算从哪一段剧情开始讨论？我随时准备好了。’”' },
          { by: 'you', text: '“我想聊聊主角在宴会上为什么选择保持沉默。”' },
          { by: 'ai', text: '“‘沉默往往不是妥协，而是最沉重的抵抗。’李书瑶微微颔首，‘或许他是在等待一个更决绝的时机。’”' }
        ]},
        { id: 's_shuyao_2', title: '古籍文献考证随记', updated: '前天 14:00', preview: '这卷拓本的字迹有些模糊。', messages: [
          { by: 'ai', text: '“‘这卷拓本的字迹有些模糊，但落款的印鉴确实是前朝官修风格。’她轻声推敲着。”' }
        ]}
      ],
      knight: [
        { id: 's_knight_1', title: '机械工坊与猫耳共鸣', updated: '3天前', preview: '旅人，你是在找我吗？', messages: [
          { by: 'ai', text: '“（无头的铠甲发出沉稳的金属碰撞声，身旁的猫耳投影闪烁着微光）……旅人，你是在找我吗？”' },
          { by: 'you', text: '“我带了新的能量核心，来看看适不适合你的武器模块。”' },
          { by: 'ai', text: '“（铠甲胸前的指示灯由微蓝转为淡金）……感应灵敏，核心频率匹配度 94.2%。多谢。”' }
        ]}
      ]
    };
  }

  // Ensure default role
  if (!ui.rpRole || !roles.some(r => r.id === ui.rpRole)) {
    ui.rpRole = roles[0]?.id || 'yiwen';
  }

  // Ensure current active session
  const curSessions = (store.rpSessions[ui.rpRole] || []).filter(s => !s.archivedAt);
  if (!ui.rpSessionId || !curSessions.some(s => s.id === ui.rpSessionId)) {
    ui.rpSessionId = curSessions[0]?.id || 's_' + ui.rpRole + '_default';
  }

  // Auto-clean any legacy ★ prefixes from titles (persisted in user localStorage)
  if (store.rpSessions) {
    Object.values(store.rpSessions).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(s => {
          if (s && s.title && s.title.startsWith('★')) {
            s.title = s.title.replace(/^★\s*/, '').trim();
          }
        });
      }
    });
  }

  // Seed demo detached session and work roles in creationWorkflow database
  if (typeof database === 'function') {
    try {
      const db = database();
      db.detachedRp = db.detachedRp || [];
      if (!db.detachedRp.length) {
        db.detachedRp.push({
          id: 's_detached_demo',
          title: '旧日余响 · 独立留存分支',
          updated: '前天 16:40',
          preview: '此角色原档案已注销，剧情作为独立案卷永久保留。',
          messages: [
            { id: 'm_det_1', by: 'ai', text: '“这里记录着已脱离角色的历史剧情。原角色档案即使被注销删除，所有对话历史与世界线依然完整封存在此。”' }
          ],
          branchContext: {
            roleName: '前尘旧友 (已注销角色)',
            parentTitle: '旧日回忆录',
            capturedAt: Date.now() - 86400000,
            note: '角色删除后自动解绑保留的历史剧情'
          },
          trials: []
        });
      }

      db.workRoles = db.workRoles || [];
      if (!db.workRoles.some(v => v.workId === 'w1' && v.sourceRoleId === 'yiwen')) {
        db.workRoles.push({
          id: 'wv_w1_yiwen',
          workId: 'w1',
          sourceRoleId: 'yiwen',
          visual: '身着带有学院徽记的深色呢子大衣，长发束起，神色沉静克制。（《北方来信》作品定制版）',
          desc: '《北方来信》特约出场版本',
          unlinked: false,
          base: { visual: '深蓝毛衣，格子短裙，长发微卷，温柔文静。', desc: '学生 / 原创设计' }
        });
      }
    } catch (_) {}
  }

  if (store.works && store.works[0] && (!store.works[0].roles || !store.works[0].roles.length)) {
    store.works[0].roles = ['yiwen', 'shuyao'];
  }

  // RP side information is keyed to branch ID. Keep legacy global objects intact.
  v3GetRpAux();
  v3RpActiveMessages();
}

// RP model widgets always use the actual RP branch, not the unrelated discussion center.
function v3RpModelContext() {
  return { roleId: ui.rpRole, rpSessionId: ui.rpSessionId };
}
function v3RpModelSummary() {
  return getEffectiveModelConfig('rp_chat', v3RpModelContext());
}
function changeRpModel(fullKey) {
  if (!fullKey) return;
  const parts = fullKey.split('::');
  if (parts.length < 2) return;
  const connectionId = parts[0];
  const modelId = parts.slice(1).join('::');
  const ctx = v3RpModelContext();
  if (ctx && ctx.rpSessionId) {
    setRpSessionModelOverride(ctx.rpSessionId, connectionId, modelId);
    render();
  }
}
function v3RpModelPill() {
  const cfg = v3RpModelSummary();
  const statusClass = cfg.status === 'ready' ? 'ready' : (cfg.status === 'format_valid' ? 'format_valid' : 'untested');
  return `<div class="v3-session-model-wrap" style="display:inline-flex;align-items:center;gap:4px">
    <button class="v3-model-pill" onclick="openUnifiedModelSelectorModal('rp_chat',v3RpModelContext())" title="当前生效模型：${E(cfg.modelName)} (${E(cfg.connectionName)}) · ${E(cfg.levelLabel)} · 点击切换">
      <span class="v3-model-dot ${statusClass}"></span>
      <span class="v3-model-name">${E(cfg.modelName)}</span>
      <span class="v3-model-badge ${cfg.level}">${E(cfg.levelLabel)}</span>
    </button>
    ${cfg.isOverridden ? `<button class="btn quiet sm" onclick="clearRpSessionModelOverride(ui.rpSessionId);render()" title="恢复继承模型" style="padding:2px 6px;font-size:11px">↺ 恢复</button>` : ''}
  </div>`;
}

// Responsive panels preserve wide-screen visibility and compact-screen manual access.
function v3RpNarrowRight() { return window.innerWidth <= 1180; }
function v3RpNarrowLeft() { return window.innerWidth <= 860; }

function v3RpShowRight() {
  if (typeof RequestInspectorDock !== 'undefined' && RequestInspectorDock.isOpen && RequestInspectorDock.isOpen()) {
    return ui.rpRightOpen === true;
  }
  return v3RpNarrowRight() ? ui.rpRightCompactOpen === true : ui.rpRightOpen !== false;
}
function v3RpShowLeft() {
  if (typeof RequestInspectorDock !== 'undefined' && RequestInspectorDock.isOpen && RequestInspectorDock.isOpen()) {
    return ui.rpLeftOpen === true;
  }
  return v3RpNarrowLeft() ? ui.rpLeftCompactOpen === true : ui.rpLeftOpen !== false;
}

// Scene-matched sample content preserves the original panel density for built-in demos.
// New user-created branches start empty until explicitly edited or AI-generated.
function v3RpInitialAux(sessionId) {
  const empty = {status:{time:'',location:'',stage:'',goal:'',tasks:[]},deductions:[],worldEvents:[]};
  const examples = {
    s_yiwen_1: {
      time:'周五 16:20 · 雪后放晴', location:'校园操场 · 雪人旁', stage:'冬日插画 · 构图完善', goal:'调整围巾阴影，完成画面细节',
      tasks:['整理雪人插画线稿','完善围巾褶皱与投影','讨论背景冷暖对比','确定最终色彩稿'],
      tiers:[['延续画面细节','先解决围巾的阴影和轮廓','继续核对衣物的暗部'],['转向人物互动','邀请她共同观察操场积雪','提出共同取景的想法'],['加入意外插曲','风吹落树枝上的积雪，改变构图','重新调整拍摄视角'],['推动场景转换','带上画具前往温暖的活动室','收拾线稿转移创作地点']],
      events:[['气象','积雪开始融化','午后气温略有回升，操场边出现浅浅的水痕。'],['校园','摄影社在操场布置器材','社团成员准备拍摄今天的冬景。'],['日常','放学铃声刚刚响起','教学楼的学生逐渐走向操场和校门。']]
    },
    s_yiwen_2: {
      time:'周三 17:20 · 小雨', location:'学校图书馆 · 靠窗座位', stage:'课后自习 · 互相陪伴', goal:'完成数学复习，等待雨停',
      tasks:['带齐数学练习册','完成待订正题目','交换复习思路','决定雨停后的安排'],
      tiers:[['继续温习','从一道未完成的题目切入','翻开练习册讨论解法'],['日常闲聊','谈谈窗外连绵不断的雨','询问她最近读的书'],['突发小状况','图书馆广播提醒即将闭馆','收拾桌面准备离开'],['延伸场景','两人在雨廊下继续交谈','撑伞走向校园小路']],
      events:[['天气','细雨持续','窗台上凝聚了新的雨珠。'],['图书馆','借阅柜台即将结束服务','馆员整理当日归还的书籍。'],['校园','食堂晚餐时段开始','楼外撑伞的学生逐渐增多。']]
    },
    s_shuyao_1: {
      time:'周六 20:40 · 夜宴', location:'宴会厅 · 侧厅长廊', stage:'第三章 · 动机研讨', goal:'理解主角保持沉默的原因',
      tasks:['确认主角掌握的信息','梳理宴会现场人物关系','讨论沉默造成的后果','记录下一章可用的伏笔'],
      tiers:[['保持观察','继续分析主角在场上的措辞','梳理对话隐藏信息'],['试探立场','让配角提起敏感旧事','讨论主角的反应'],['正面冲突','关键人物当众提出质疑','模拟主角的回应'],['改变形势','一封急信打断宴会','引入新的叙事线索']],
      events:[['宴会','侧厅传来低声争执','两位来宾正在讨论未公开的决定。'],['人物','一名侍从暂时离席','他的去向尚未被注意。'],['情报','新的邀请函送达','宴会主持人正在核对最后一位宾客。']]
    },
    s_shuyao_2: {
      time:'周二 15:10 · 阴天', location:'旧书斋 · 文献案桌', stage:'古籍文献考证', goal:'辨析拓本落款和印鉴',
      tasks:['核对拓本文字','检索印鉴样式','整理可疑年代线索','保存校勘笔记'],
      tiers:[['谨慎考证','逐字对照现存拓本','标记不确定字形'],['交叉比对','寻找同时代的类似碑刻','翻阅馆藏目录'],['发现疑点','拓本边款与落款年代出现冲突','请她检查印鉴细节'],['另辟线索','发现另一个版本的文献记录','追踪原始收藏来源']],
      events:[['馆藏','新一批拓片完成整理','管理员更新了目录编号。'],['考证','研究笔记出现新的注释','前人对同一字形有不同解释。'],['环境','窗外天色渐暗','案头的台灯已经亮起。']]
    },
    s_knight_1: {
      time:'周日 19:30 · 晚间', location:'机械工坊 · 调试台', stage:'能量核心 · 共鸣测试', goal:'检查新核心与骑士武装的兼容性',
      tasks:['测量核心输出','核验武器接口尺寸','观察共鸣频率变化','记录异常温升'],
      tiers:[['稳定调试','维持现有能量输出进行校准','核对核心频率'],['追加测试','启动低功率武器模块','检查结构共振'],['出现变量','感应回路出现短暂波动','读取故障记录'],['拓展实验','准备尝试全新共鸣模式','启动备用隔离装置']],
      events:[['设备','工坊备用电源启动自检','工作台指示灯依次亮起。'],['外界','补给队抵达工坊门口','新的工具箱和材料被送入。'],['记录','上一轮实验日志已归档','数据中的频率峰值仍待解释。']]
    }
  };
  const scene=examples[sessionId];
  if(!scene) return empty;
  return {
    status:{time:scene.time,location:scene.location,stage:scene.stage,goal:scene.goal,
      tasks:scene.tasks.map((text,i)=>({id:'demo_'+i,text,done:i===0,tag:i===0?'已完成':'进行中'}))},
    deductions:scene.tiers.map((x,i)=>({num:['一档','二档','三档','四档'][i],tag:['平稳推进','张力升级','破局逆转','变局重塑'][i],title:x[0],desc:x[1],action:x[2]})),
    worldEvents:scene.events.map((x,i)=>({title:x[1],role:x[0],time:['刚刚','10分钟前','半小时前'][i],status:'动态',desc:x[2]}))
  };
}

// Each RP branch owns its own auxiliary context. Original global demo values stay
// in storage for compatibility, but are no longer shown across unrelated stories.
function v3GetRpAux() {
  store.rpAuxBySession = store.rpAuxBySession || {};
  const key = ui.rpSessionId;
  if (!store.rpAuxBySession[key]) {
    store.rpAuxBySession[key] = v3RpInitialAux(key);
  }
  return store.rpAuxBySession[key];
}
function v3RpActiveMessages() {
  const sess = getRpSessionById(ui.rpSessionId);
  if (!sess) return null;
  if (!Array.isArray(sess.messages)) sess.messages = [];
  store.rpHistories = store.rpHistories || {};
  store.rpHistories[ui.rpRole] = sess.messages;
  return sess.messages;
}

// 3. Router Overrides: Directly to Unified Studio
rp = function() {
  ui.rpScreen = 'chat';
  return rpConversation();
};

rpDirectory = function() {
  ui.rpScreen = 'chat';
  return rpConversation();
};

startRP = function(id = 'yiwen') {
  ui.rpRole = id;
  ui.rpScreen = 'chat';
  visit('rp', { keepChat: true });
};

switchRPRole = function(id) {
  ui.rpRole = id;
  ui.rpScreen = 'chat';
  const list = store.rpSessions?.[id] || [];
  if (list.length > 0) {
    ui.rpSessionId = list[0].id;
    store.rpHistories[id] = list[0].messages || [];
  }
  render();
};

// 4. Unified RP Studio Implementation
rpConversation = function() {
  v3EnsureRpData();
  v3LastRpCompactMode = (v3RpNarrowRight() ? 1 : 0) + (v3RpNarrowLeft() ? 2 : 0);

  let r = role(ui.rpRole);
  let curSession = null;
  if (ui.rpSessionId) {
    try {
      curSession = (r && store.rpSessions?.[r.id]?.find(s => s.id === ui.rpSessionId)) ||
                   Object.values(store.rpSessions || {}).flat().find(s => s.id === ui.rpSessionId) ||
                   (window.CreationWorkflow?.getRp ? CreationWorkflow.getRp(ui.rpSessionId) : null);
    } catch (_) {
      curSession = null;
    }
  }
  if (!r) {
    if (curSession) {
      r = {
        id: 'detached',
        name: curSession.branchContext?.roleName || (curSession.branchContext?.parentTitle ? ('独立分支 · ' + curSession.branchContext.parentTitle) : '独立剧情归档'),
        icon: '文',
        tone: '',
        series: curSession.branchContext?.workName || '已归档独立会话'
      };
    } else {
      r = roles[0];
    }
  }
  if (!r) return rpDirectory();
  const roleSessions = ((store.rpSessions && store.rpSessions[r.id]) || []).filter(s => !s.archivedAt);
  if (!curSession && roleSessions.length > 0) {
    curSession = roleSessions[0];
    ui.rpSessionId = curSession.id;
  }
  if (!curSession) {
    curSession = { id: 's_' + r.id + '_1', title: '新会话', messages: [], updated: '刚刚', preview: '新剧情开启' };
    (store.rpSessions[r.id] ??= []).push(curSession);
    ui.rpSessionId = curSession.id;
  }

  // Sync messages
  const history = curSession.messages || store.rpHistories?.[r.id] || [];

  // Opening greeting text
  const defaultGreetings = {
    yiwen: '“午后的阳光落在窗沿。她转过身，带着一点好奇打量眼前的情景：‘你来啦，我们继续上次的话题吧？’”',
    shuyao: '“她合上手中的精装书，抬起清澈的眼眸：‘今天打算从哪一段剧情开始讨论？我随时准备好了。’”',
    knight: '“（无头的铠甲发出沉稳的金属碰撞声，身旁的猫耳投影闪烁着微光）……旅人，你是在找我吗？”'
  };
  const greeting = store.rpConfigs?.[r.id]?.greeting || defaultGreetings[r.id] || (r.desc ? '“' + r.desc.slice(0, 80) + '……”' : '“你好，今天想从哪一段剧情开始对戏？”');

  // Compute flattened sessions for Stream Mode
  let allFlattened = [];
  roles.filter(r => !r.archivedAt).forEach(roleItem => {
    const list = (store.rpSessions?.[roleItem.id] || []).filter(s => !s.archivedAt);
    list.forEach(sessItem => {
      allFlattened.push({ role: roleItem, session: sessItem });
    });
  });

  // Filter if query exists
  const query = (ui.rpSessionQuery || '').toLowerCase().trim();
  if (query) {
    allFlattened = allFlattened.filter(item => 
      item.role.name.toLowerCase().includes(query) ||
      (item.role.series && item.role.series.toLowerCase().includes(query)) ||
      item.session.title.toLowerCase().includes(query) ||
      (item.session.preview && item.session.preview.toLowerCase().includes(query))
    );
  }

  const showLeft = v3RpShowLeft();
  const showRight = v3RpShowRight();
  const aux = v3GetRpAux();
  let html = '<div class="v3-rp-workspace-split" id="v3RpWorkspaceSplit">';

  /* ========================================================
     LEFT SIDEBAR: 多态超级案卷导航 (紧凑双行排版)
     ======================================================== */
  const leftW = ui.rpLeftWidth || 265;
  const leftStyle = !showLeft ? 'width:0!important;min-width:0!important;max-width:0!important;flex:0 0 0!important;flex-basis:0!important;padding:0!important;margin:0!important;border:none!important;overflow:hidden!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important' : ('width:' + leftW + 'px');
  html += '<aside class="v3-rp-left-sidebar ' + (showLeft ? (v3RpNarrowLeft() ? 'compact-open' : '') : 'collapsed') + '" style="' + leftStyle + '" id="v3RpLeftSidebar">';
  
  // Left Sidebar Head
  html += '<div class="v3-rp-left-head-box">';
  html += '<div class="v3-rp-left-title-row">';
  html += '<div class="v3-rp-left-title">';
  html += '<svg><use href="#i-theater"></use></svg> 角色与剧情案卷';
  html += '</div>';
  html += '</div>';

  // Search input
  html += '<div class="v3-rp-search-wrap">';
  html += '<input placeholder="跨角色检索剧情或分支..." value="' + E(ui.rpSessionQuery) + '" oninput="v3OnRpSearchInput(this.value)">';
  html += '<span class="v3-rp-search-icon">' + I('search') + '</span>';
  html += '</div>';

  // View Switcher (Stream vs Tree)
  const isStreamView = (ui.rpViewMode !== 'tree');
  html += '<div class="v3-rp-view-switcher">';
  html += '<button class="v3-rp-view-btn ' + (isStreamView ? 'active' : '') + '" onclick="v3SetRpViewMode(\'sessions\')">活跃会话流 (' + allFlattened.length + ')</button>';
  html += '<button class="v3-rp-view-btn ' + (!isStreamView ? 'active' : '') + '" onclick="v3SetRpViewMode(\'tree\')">角色案卷树 (' + roles.length + ')</button>';
  html += '</div>';
  html += '</div>'; // end left head box

  // Left Sidebar Body
  html += '<div class="v3-rp-tree-container">';
  
  const detachedRpList = (window.CreationWorkflow?.listObjects ? CreationWorkflow.listObjects('rp', { includeArchived: true }).filter(s => !roles.some(ro => (store.rpSessions?.[ro.id] || []).some(x => x.id === s.id))) : []);

  // MODE 1: Streamlined Sessions List (Scheme C: Role-Centric Minimalist Dot, Zero-Box, No Name Redundancy)
  if (isStreamView) {
    if (allFlattened.length === 0 && detachedRpList.length === 0) {
      html += '<div style="padding:24px 10px;text-align:center;color:#666;font-size:11.5px">未找到匹配的剧情分支</div>';
    } else {
      allFlattened.forEach(item => {
        const isSessActive = (item.role.id === r.id && item.session.id === curSession.id);
        
        // Check main branch: either marked or is the canonical first session of this role
        const rawTitle = (item.session.title || '新会话');
        const isMain = rawTitle.startsWith('★') || (store.rpSessions?.[item.role.id]?.[0]?.id === item.session.id);
        const cleanTitle = rawTitle.replace(/^★\s*/, '').trim();
        
        // Clean preview dialogue snippet (100% pure dialogue, eliminate redundant role name repetition)
        let previewText = (item.session.preview || '').trim();
        if (!previewText && item.session.messages && item.session.messages.length) {
          previewText = item.session.messages[item.session.messages.length - 1]?.text || '';
        }
        if (!previewText) previewText = '“暂无对白记录，点击进入会话……”';
        // Strip out redundant prefix if present like "角色名 · "
        if (previewText.startsWith(item.role.name + ' · ')) {
          previewText = previewText.slice(item.role.name.length + 3).trim();
        }

        html += '<div class="v3-rp-session-card ' + (isSessActive ? 'active' : '') + '" onclick="v3SelectRpSession(\'' + item.role.id + '\', \'' + item.session.id + '\')" title="' + E(item.role.name + ' · ' + cleanTitle) + '">';
        
        // Line 1: [Dot] [RoleName · CleanTitle]  [Badge: 主线] [Time]
        html += '<div class="v3-rp-session-title-line">';
        html += '<div class="v3-rp-session-title-wrap">';
        html += '<span class="v3-rp-role-dot"></span>';
        html += '<span class="v3-rp-session-title">';
        html += '<strong class="v3-rp-role-name">' + E(item.role.name) + '</strong>';
        html += '<span class="v3-rp-title-sep"> · </span>';
        html += E(cleanTitle);
        html += '</span>';
        html += '</div>';
        
        html += '<div class="v3-rp-session-right-meta">';
        if (isMain) {
          html += '<span class="v3-rp-badge-main">主线</span>';
        }
        html += '<span class="v3-rp-session-time">' + E(item.session.updated || '刚刚') + '</span>';
        html += '</div>';
        html += '</div>'; // end title-line

        // Line 2: 100% Pure Dialogue / Plot Preview (Indented 13px to align with text above)
        html += '<div class="v3-rp-session-subline">' + E(previewText) + '</div>';

        html += '</div>'; // end card
      });

      // Render Detached Sessions in Stream View
      if (detachedRpList.length > 0) {
        html += '<div style="margin-top:14px;padding:8px 6px 4px;border-top:1px dashed #303030">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px">';
        html += '<span style="font-size:11px;font-weight:700;color:#999;display:flex;align-items:center;gap:5px">' + I('book') + ' 独立剧情归档 (解绑留存)</span>';
        html += '<span class="v3-rp-tree-badge" style="background:#282828;color:#aaa">' + detachedRpList.length + '</span>';
        html += '</div>';
        detachedRpList.forEach(s => {
          const isSessActive = (ui.rpSessionId === s.id);
          const preview = (s.messages && s.messages.length) ? s.messages[s.messages.length - 1].text : (s.preview || '暂无对白记录');
          html += '<div class="v3-rp-session-card ' + (isSessActive ? 'active' : '') + '" style="margin-bottom:6px;border-left:2px solid #555" onclick="v3SelectDetachedRpSession(\'' + s.id + '\')" title="' + E(s.title) + '">';
          html += '<div class="v3-rp-session-title-line">';
          html += '<div class="v3-rp-session-title-wrap">';
          html += '<span class="chip" style="font-size:9.5px;padding:0 5px;background:#2a2a2a;color:#a8a8a8;border-color:#3a3a3a">独立分支</span>';
          html += '<span class="v3-rp-session-title"><strong class="v3-rp-role-name">' + E(s.title || '独立历史剧情') + '</strong></span>';
          html += '</div>';
          html += '<div class="v3-rp-session-right-meta">';
          html += '<span class="v3-rp-session-time">' + E(s.branchContext?.roleName ? ('原: ' + s.branchContext.roleName) : (s.updated || '刚刚')) + '</span>';
          html += '</div>';
          html += '</div>';
          html += '<div class="v3-rp-session-subline" style="color:#888;font-size:11px;margin-top:3px">' + E(preview) + '</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    }
  }

  // MODE 2: Character Folders Tree
  else {
    roles.filter(r => !r.archivedAt).forEach(roleItem => {
      const isCurrentRole = roleItem.id === r.id;
      const xSessions = ((store.rpSessions && store.rpSessions[roleItem.id]) || []).filter(s => !s.archivedAt);
      const isExpanded = ui.rpExpandedRoles ? (ui.rpExpandedRoles[roleItem.id] !== false) : true;

      const matchedSessions = xSessions.filter(s => {
        if (!query) return true;
        return s.title.toLowerCase().includes(query) || (s.preview && s.preview.toLowerCase().includes(query));
      });

      if (query && matchedSessions.length === 0) return;

      html += '<div class="v3-rp-tree-folder ' + (isCurrentRole ? 'active-role' : '') + '" onclick="v3ToggleRpRoleFolder(\'' + roleItem.id + '\')">';
      html += '<div class="v3-rp-tree-folder-left">';
      html += '<span class="v3-rp-tree-arrow">' + (isExpanded ? '▾' : '▸') + '</span>';
      html += '<span class="v3-rp-tree-folder-name" title="' + E(roleItem.name) + '">' + E(roleItem.name) + '</span>';
      html += '</div>';
      html += '<div class="flex gap4 align-center">';
      html += '<span class="v3-rp-tree-badge">' + xSessions.length + '</span>';
      html += '<button class="v3-rp-tree-plus-btn" onclick="event.stopPropagation();v3CreateRpSession(\'' + roleItem.id + '\')" title="新建会话">+</button>';
      html += '</div>';
      html += '</div>';

      if (isExpanded) {
        html += '<div class="v3-rp-tree-children">';
        if (matchedSessions.length === 0) {
          html += '<div style="padding:4px 8px 4px 24px;font-size:10.5px;color:#666">暂无会话</div>';
        } else {
          matchedSessions.forEach(s => {
            const isSessActive = (isCurrentRole && s.id === curSession.id);
            html += '<div class="v3-rp-tree-item ' + (isSessActive ? 'active' : '') + '" onclick="v3SelectRpSession(\'' + roleItem.id + '\', \'' + s.id + '\')" title="' + E(s.title) + '">';
            const treeItemTitle = (s.title || '').replace(/^★\s*/, '').trim();
            html += '<span class="v3-rp-tree-item-title">' + E(treeItemTitle) + '</span>';
            html += '<span class="v3-rp-tree-item-time">' + E(s.updated || '刚刚') + '</span>';
            html += '<div class="v3-rp-tree-item-actions" onclick="event.stopPropagation()">';
            html += '<button class="v3-rp-tree-action-btn" onclick="v3RenameRpSession(\'' + roleItem.id + '\', \'' + s.id + '\')" title="重命名">' + I('pen') + '</button>';
            if (xSessions.length > 1) {
              html += '<button class="v3-rp-tree-action-btn" onclick="v3DeleteRpSession(\'' + roleItem.id + '\', \'' + s.id + '\')" title="删除">' + I('x') + '</button>';
            }
            html += '</div>';
            html += '</div>';
          });
        }
        html += '</div>';
      }
    });

    if (detachedRpList.length > 0) {
      const isDetachedExpanded = (ui.rpExpandedRoles?.['detached_rp'] !== false);
      html += '<div class="v3-rp-tree-folder" onclick="v3ToggleRpRoleFolder(\'detached_rp\')" style="margin-top:6px;border-top:1px dashed #2f2f2f;padding-top:6px">';
      html += '<div class="v3-rp-tree-folder-left">';
      html += '<span class="v3-rp-tree-arrow">' + (isDetachedExpanded ? '▾' : '▸') + '</span>';
      html += '<span class="v3-rp-tree-folder-name" title="角色已删除的独立保留剧情分支" style="color:#a1a1aa">独立剧情归档 (解绑)</span>';
      html += '</div>';
      html += '<div class="flex gap4 align-center">';
      html += '<span class="v3-rp-tree-badge" style="background:#282828;color:#999">' + detachedRpList.length + '</span>';
      html += '</div>';
      html += '</div>';

      if (isDetachedExpanded) {
        html += '<div class="v3-rp-tree-children">';
        detachedRpList.forEach(s => {
          const isSessActive = (ui.rpSessionId === s.id);
          html += '<div class="v3-rp-tree-item ' + (isSessActive ? 'active' : '') + '" onclick="v3SelectDetachedRpSession(\'' + s.id + '\')" title="' + E(s.title) + '">';
          html += '<span class="v3-rp-tree-item-title" style="color:#b5b5b5">' + E(s.title || '独立分支') + '</span>';
          html += '<span class="v3-rp-tree-item-time">' + E(s.branchContext?.roleName ? ('原: ' + s.branchContext.roleName) : '历史') + '</span>';
          html += '<div class="v3-rp-tree-item-actions" onclick="event.stopPropagation()">';
          html += '<button class="v3-rp-tree-action-btn" onclick="openPermanentDeleteModal({type:\'rp\',id:\'' + s.id + '\'})" title="永久删除此独立剧情">' + I('x') + '</button>';
          html += '</div>';
          html += '</div>';
        });
        html += '</div>';
      }
    }
  }

  html += '</div>'; // end tree container

  // Bottom action bar
  html += '<div class="v3-rp-side-foot">';
  html += '<span class="tiny" style="color:#777">' + roles.length + ' 位角色 · ' + allFlattened.length + ' 场剧情 · ' + detachedRpList.length + ' 独立归档</span>';
  html += '<button class="ghost" style="padding:2px 6px;font-size:11px;color:#aaa" onclick="visit(\'role\',{roleId:\'' + r.id + '\'})">完整档案 →</button>';
  html += '</div>';
  html += '</aside>'; // end left sidebar

  // Left Resizer Handle (Draggable Splitter)
  html += '<div class="v3-rp-resizer left" id="v3RpResizerLeft" style="' + (!showLeft ? 'display:none!important' : '') + '" onmousedown="v3InitRpDrag(event, \'left\')" ondblclick="v3ToggleRpLeft()" title="拖拽调整宽度，双击快速收起/展开"></div>';

  /* ========================================================
     CENTER PANEL: 黄金行宽沉浸会话流 & 单层外框输入框
     ======================================================== */
  html += '<main class="v3-rp-center-panel" id="v3RpCenterPanel">';
  
  // Chat Top Header (Fixed: Breadcrumb layout, deduplicated toggle, compact icon actions)
  html += '<div class="v3-rp-chat-head">';
  
  html += '<div class="v3-rp-head-left">';
  html += '<button type="button" class="btn-sidebar-toggle ' + (!showLeft ? 'collapsed' : '') + '" onclick="v3ToggleRpLeft()" title="' + (showLeft ? '收起角色与剧情案卷 (图二样式)' : '展开角色与剧情案卷 (图二样式)') + '" aria-label="切换左侧栏">';
  html += '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3.5"/><line x1="9" y1="3" x2="9" y2="21"/></svg>';
  html += '</button>';

  html += '<div class="v3-rp-head-breadcrumb">';
  html += '<span class="v3-rp-head-role">' + E(r.name) + '</span>';
  html += '<span class="v3-rp-head-divider">/</span>';
  const headSessTitle = (curSession.title || '').replace(/^★\s*/, '').trim();
  html += '<span class="v3-rp-head-sess" title="' + E(headSessTitle) + '">' + E(headSessTitle) + '</span>';
  if (curSession.parentSessionId) {
    const parentTitle = curSession.branchContext?.parentTitle || '上级分支';
    html += '<button type="button" class="btn quiet sm" onclick="v3SelectParentBranch(\'' + curSession.parentSessionId + '\')" title="返回此剧情分支的分叉来源" style="font-size:10.5px;padding:1px 6px;margin-left:6px;color:var(--ui-accent,#ac97f5);border-color:rgba(172,151,245,0.25)">' + I('back') + ' 来源: ' + E(parentTitle) + '</button>';
  }
  html += '</div>';
  html += '<span class="v3-rp-head-turns">' + history.length + ' 轮</span>';
  html += '</div>'; // end head left

  html += '<div class="v3-rp-head-actions">';
  html += '<button class="btn quiet sm" onclick="v3CreateRpSession(\'' + r.id + '\')" title="为此角色新建对话"><svg><use href="#i-plus"></use></svg> 新建对话</button>';
  html += '<button class="v3-rp-icon-btn" onclick="openSettings(\'rp_params\')" title="采样预设与参数">' + I('theater') + '</button>';
  html += '<button class="v3-rp-icon-btn" onclick="openSettings(\'models\', \'rp\')" title="模型连接与反代">' + I('settings') + '</button>';
  html += '<button class="v3-rp-icon-btn" onclick="show(\'worldinfo\')" title="设定集与世界书">' + I('folder') + '</button>';
  html += '<button type="button" class="btn-sidebar-toggle ' + (!showRight ? 'collapsed' : '') + '" onclick="v3ToggleRpRight()" title="' + (showRight ? '收起剧情辅助面板 (图三样式)' : '展开剧情辅助面板 (图三样式)') + '" aria-label="切换右侧栏">';
  html += '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3.5"/><line x1="15" y1="3" x2="15" y2="21"/></svg>';
  html += '</button>';
  html += '</div>';
  html += '</div>'; // end v3-rp-chat-head

  // Message Stream Container (Inner Width Restrained to 780px, No Duplicate Banner)
  html += '<div class="v3-rp-msg-stream" id="v3RpMsgStream">';
  html += '<div class="v3-rp-stream-inner">';
  
  // Message bubbles
  const roleMonogram = v3GetRoleMonogram(r);
  history.forEach((x, idx) => {
    const isUser = (x.by === 'you');
    html += '<div class="v3-rp-message ' + (isUser ? 'user' : 'ai') + '">';
    
    // Avatar / Monogram
    if (isUser) {
      html += '<span class="v3-rp-monogram lg" style="background:#2e2e2e;color:#ffffff">我</span>';
    } else {
      if (r.icon && r.icon.length > 2) {
        html += '<div class="avatar ' + (r.tone || '') + '" style="height:30px;width:30px;font-size:12px;flex:0 0 30px;border-radius:6px">' + E(r.icon) + '</div>';
      } else {
        html += '<span class="v3-rp-monogram lg">' + E(roleMonogram) + '</span>';
      }
    }

    html += '<div class="v3-rp-bubble-wrap">';
    html += '<div class="v3-rp-bubble">';
    html += '<div class="text v3-rp-text">' + v3FormatRpText(x.text) + '</div>';
    html += '</div>';
    
    // Quick AI message toolbar
    if (!isUser) {
      html += '<div class="v3-rp-action-pills">';
      html += '<button class="pill-btn" onclick="v3RerollRp(' + idx + ')" title="重新生成此条回复">⤨ 重试</button>';
      html += '<button class="pill-btn" onclick="v3ContinueRp()" title="顺着当前剧情继续写">' + I('pen') + ' 续写</button>';
      html += '<button class="pill-btn" onclick="v3SwitchNarrator()" title="切换旁白补充情境">' + I('spark') + ' 旁白视角</button>';
      html += '<button class="pill-btn" onclick="v3BranchRpMessage(' + idx + ')" title="以此条消息为分叉点创建新剧情分支">' + I('link') + ' 分叉</button>';
      html += '</div>';
    }

    html += '</div>'; // end v3-rp-bubble-wrap
    html += '</div>'; // end rp-message
  });

  html += '</div>'; // end v3-rp-stream-inner
  html += '</div>'; // end v3-rp-msg-stream

  // Slimmed-Down Composer Matching Figure 2 (Single surface rounded card)
  html += '<div class="composer v3-rp-composer-container">';
  html += '<div class="composer-wrap v3-rp-composer-wrap">';
  html += '<textarea id="rpInput" class="textarea" rows="1" placeholder="输入台词或剧情描写……（Enter 发送 · Shift+Enter 换行）" onkeydown="v3HandleRpInputKey(event)"></textarea>';
  html += '<div class="composer-foot">';
  html += '<div class="flex gap8" style="align-items:center">';
  const effectiveRpModel = v3RpModelSummary();
  const rpModelCatalog = (typeof getUnifiedModelCatalog === 'function') ? getUnifiedModelCatalog() : [];
  html += '<select aria-label="当前分支模型" class="model-inline" onchange="changeRpModel(this.value)">';
  if (!rpModelCatalog.length && effectiveRpModel?.modelName) {
    html += '<option value="" selected>' + E(effectiveRpModel.modelName) + '</option>';
  } else {
    html += rpModelCatalog.map(m => {
      const isSelected = (effectiveRpModel.connectionId === m.connectionId && effectiveRpModel.modelId === m.modelId);
      return '<option value="' + E(m.fullKey) + '" ' + (isSelected ? 'selected' : '') + '>' + E(m.modelName) + '</option>';
    }).join('');
  }
  html += '</select>';
  html += '<span class="tiny" style="color:#888888">当前分支会话独立记录</span>';
  html += '</div>';
  html += '<div class="flex gap8" style="align-items:center">';
  html += '<button type="button" class="btn quiet sm" onclick="inspectCurrentRequest(\'rp_chat\')" title="检查完整装配上下文、排除原因与协议参数">' + I('eye') + ' 检查请求</button>';
  html += '<button class="btn primary sm v3-rp-send-btn" onclick="sendRP()">' + I('send') + ' 发送</button>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</div>';
  html += '</main>'; // end center panel

  // Invisible dismiss target for compact overlay panels; the normal desktop layout is unchanged.
  if ((v3RpNarrowRight() && showRight) || (v3RpNarrowLeft() && showLeft)) {
    html += '<button type="button" class="v3-rp-dismiss-layer" onclick="v3DismissRpPanels()" aria-label="关闭展开的辅助侧栏"></button>';
  }

  // Right Resizer Handle (Draggable Splitter)
  html += '<div class="v3-rp-resizer right" id="v3RpResizerRight" style="' + (!showRight ? 'display:none!important' : '') + '" onmousedown="v3InitRpDrag(event, \'right\')" ondblclick="v3ToggleRpRight()" title="拖拽调整宽度，双击快速收起/展开"></div>';

  /* ========================================================
     RIGHT SIDEBAR: 剧情实验与辅助 (纯文字案卷风格)
     ======================================================== */
  const rightW = ui.rpRightWidth || 280;
  const rightStyle = !showRight ? 'width:0!important;min-width:0!important;max-width:0!important;flex:0 0 0!important;flex-basis:0!important;padding:0!important;margin:0!important;border:none!important;overflow:hidden!important;opacity:0!important;visibility:hidden!important;pointer-events:none!important' : ('width:' + rightW + 'px');
  html += '<aside class="v3-rp-right-sidebar ' + (showRight ? (v3RpNarrowRight() ? 'compact-open' : '') : 'collapsed') + '" style="' + rightStyle + '" id="v3RpRightSidebar">';
  
  // Tabs Nav
  html += '<div class="v3-rp-tab-nav">';
  html += '<button class="v3-rp-tab-btn ' + (ui.rpRightTab === 'tasks' ? 'active' : '') + '" onclick="v3SetRpRightTab(\'tasks\')">状态与任务</button>';
  html += '<button class="v3-rp-tab-btn ' + (ui.rpRightTab === 'deduction' ? 'active' : '') + '" onclick="v3SetRpRightTab(\'deduction\')">四档推演</button>';
  html += '<button class="v3-rp-tab-btn ' + (ui.rpRightTab === 'world' ? 'active' : '') + '" onclick="v3SetRpRightTab(\'world\')">世界动态</button>';
  html += '</div>';

  html += '<div class="v3-rp-right-content">';

  // TAB 1: 状态与任务记录
  if (ui.rpRightTab === 'tasks') {
    const st = aux.status || {};
    html += '<div class="v3-rp-status-box">';
    html += '<div style="font-weight:700;font-size:11.5px;color:#e8e8e8;display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">';
    html += '<span>时空与剧情状态</span>';
    html += '<span class="tiny" style="color:#888888">当前会话锚点</span>';
    html += '</div>';
    html += '<div class="v3-rp-meta-grid">';
    html += '<div class="v3-rp-meta-row"><span class="v3-rp-meta-label">时间</span><span class="v3-rp-meta-val">' + E(st.time || '未记录') + '</span></div>';
    html += '<div class="v3-rp-meta-row"><span class="v3-rp-meta-label">地点</span><span class="v3-rp-meta-val">' + E(st.location || '未记录') + '</span></div>';
    html += '<div class="v3-rp-meta-row"><span class="v3-rp-meta-label">阶段</span><span class="v3-rp-meta-val">' + E(st.stage || '未记录') + '</span></div>';
    html += '<div class="v3-rp-meta-row"><span class="v3-rp-meta-label">目标</span><span class="v3-rp-meta-val">' + E(st.goal || '未记录') + '</span></div>';
    html += '</div>';
    html += '</div>';

    // Checklist
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px">';
    html += '<span style="font-weight:700;font-size:11.5px;color:#e8e8e8">任务与羁绊约定</span>';
    html += '<button class="ghost" style="padding:1px 6px;font-size:10px;color:#999999" onclick="v3AddRpTask()">' + I('plus') + ' 添加</button>';
    html += '</div>';

    const tasks = st.tasks || [];
    html += '<div style="display:flex;flex-direction:column;gap:6px">';
    tasks.forEach(t => {
      html += '<div class="v3-rp-task-item ' + (t.done ? 'done' : '') + '" onclick="v3ToggleRpTask(\'' + t.id + '\')">';
      html += '<input type="checkbox" ' + (t.done ? 'checked' : '') + ' style="margin-top:2px" onclick="event.stopPropagation();v3ToggleRpTask(\'' + t.id + '\')">';
      html += '<div style="flex:1;line-height:1.4">';
      html += '<div>' + E(t.text) + '</div>';
      html += '<div class="tiny" style="color:#777777;margin-top:2px">状态：' + E(t.tag || (t.done ? '已完成' : '进行中')) + '</div>';
      html += '</div>';
      html += '<button class="ghost" style="padding:1px 4px;font-size:10px;color:#666666" onclick="event.stopPropagation();v3DeleteRpTask(\'' + t.id + '\')" title="删除">' + I('x') + '</button>';
      html += '</div>';
    });
    html += '</div>';
  }

  // TAB 2: 四档剧情推演与试演列表
  else if (ui.rpRightTab === 'deduction') {
    html += '<div style="display:flex;align-items:center;justify-content:space-between">';
    html += '<span style="font-weight:700;font-size:11.5px;color:#e8e8e8">四档剧情走向推演</span>';
    html += '<button class="ghost" style="padding:1px 6px;font-size:10px;color:#999999" onclick="v3RerollDeductions()">' + I('refresh') + ' 重新生成</button>';
    html += '</div>';
    html += '<div class="tiny" style="color:#888888;line-height:1.4">基于当前剧情上下文生成四种张力分支；试演完全隔离，采纳前不影响正式会话。</div>';

    const deductions = aux.deductions || [];
    deductions.forEach((d, idx) => {
      html += '<div class="v3-rp-tier-card">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between">';
      html += '<span class="v3-rp-tier-tag">' + E(d.num) + ' ' + E(d.tag) + '</span>';
      html += '<span class="tiny" style="color:#777777">' + E((d.generatedBy==='network'?'':'本地方向 · ')+d.title) + '</span>';
      html += '</div>';
      html += '<div style="font-size:11.5px;color:#cccccc;line-height:1.45;margin-top:2px">' + E(d.desc) + '</div>';
      html += '<div style="display:flex;align-items:center;justify-content:flex-end;gap:8px;margin-top:6px;border-top:1px solid #282828;padding-top:6px">';
      html += '<button type="button" class="btn quiet sm" style="font-size:11px;padding:3px 9px;color:#b4b4b4;white-space:nowrap;display:inline-flex;align-items:center;gap:4px" onclick="v3PreviewDeduction(' + idx + ')" title="生成为独立试演候选">' + I('spark') + ' 试演</button>';
      html += '<button type="button" class="btn primary sm" style="font-size:11px;padding:3px 10px;white-space:nowrap;display:inline-flex;align-items:center;gap:4px" onclick="v3AdoptDeduction(' + idx + ')" title="采纳此走向写入当前剧情">' + I('check') + ' 采纳走向</button>';
      html += '</div>';
      html += '</div>';
    });

    // 隔离试演记录与回写列表
    let curSessObj = null;
    try {
      curSessObj = (window.CreationWorkflow?.getRp ? CreationWorkflow.getRp(curSession.id) : null);
    } catch (_) { curSessObj = null; }
    curSessObj = curSessObj || curSession;
    const trials = curSessObj?.trials || [];
    html += '<div style="margin-top:14px;border-top:1px solid #282828;padding-top:10px">';
    html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">';
    html += '<span style="font-weight:700;font-size:11.5px;color:#e8e8e8">隔离试演候选 (' + trials.length + ')</span>';
    html += '<button class="ghost" style="padding:1px 6px;font-size:10px;color:var(--ui-accent,#ac97f5)" onclick="v3CreateManualTrial(\'' + curSession.id + '\')">' + I('plus') + ' 新建试演</button>';
    html += '</div>';
    html += '<div class="tiny" style="color:#888888;line-height:1.4;margin-bottom:8px">试演独立保存，支持随时填入输入框或直接采纳为回复。</div>';

    if (!trials.length) {
      html += '<div class="tiny" style="color:#666666;padding:12px 0;text-align:center;background:#181818;border:1px dashed #282828;border-radius:4px">暂无试演候选。点击上方四档推演的「试演」可生成分支候选。</div>';
    } else {
      trials.slice().reverse().forEach(t => {
        const isAdopted = (t.status === 'adopted');
        const isDiscarded = (t.status === 'discarded');
        const statusBadge = isAdopted 
          ? '<span class="chip green" style="font-size:9.5px;padding:0 5px">已采纳</span>' 
          : isDiscarded 
            ? '<span class="chip" style="font-size:9.5px;padding:0 5px;color:#777">已放弃</span>' 
            : '<span class="chip gold" style="font-size:9.5px;padding:0 5px">待审阅</span>';
        const timeStr = t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        
        html += '<div class="v3-rp-tier-card" style="margin-bottom:7px;border-color:' + (isAdopted ? '#3b2d54' : '#282828') + ';background:' + (isAdopted ? 'rgba(116,70,200,0.06)' : '#191919') + '">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between">';
        html += '<div class="flex gap4 align-center">' + statusBadge + '<span class="tiny" style="color:#888888;font-weight:600">' + E(t.source?.title || t.source?.module || '试演') + '</span></div>';
        html += '<span class="tiny" style="color:#666666">' + timeStr + '</span>';
        html += '</div>';
        html += '<div style="font-size:11.5px;color:#cccccc;margin:6px 0;line-height:1.45;word-break:break-word">' + E(t.text) + '</div>';
        
        html += '<div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #242424;padding-top:5px;margin-top:4px">';
        html += '<button type="button" class="btn quiet sm" style="font-size:10px;padding:1px 6px" onclick="v3InsertTrial(\'' + curSession.id + '\', \'' + t.id + '\')" title="填入下方输入框进行修改">' + I('pen') + ' 填入输入框</button>';
        html += '<div class="flex gap4 align-center">';
        if (!isAdopted && !isDiscarded) {
          html += '<button type="button" class="btn quiet sm" style="font-size:10px;padding:1px 6px;color:#888888" onclick="v3DiscardTrial(\'' + curSession.id + '\', \'' + t.id + '\')">放弃</button>';
          html += '<button type="button" class="btn primary sm" style="font-size:10px;padding:1px 8px" onclick="v3AdoptTrial(\'' + curSession.id + '\', \'' + t.id + '\')">' + I('check') + ' 采纳为回复</button>';
        } else if (isAdopted) {
          html += '<span class="tiny" style="color:var(--ui-accent,#ac97f5)">已作为消息插入会话</span>';
        } else if (isDiscarded) {
          html += '<span class="tiny" style="color:#666666">已放弃</span>';
        }
        html += '</div>';
        html += '</div>';
        html += '</div>';
      });
    }
  }

  // TAB 3: 世界动态
  else if (ui.rpRightTab === 'world') {
    html += '<div style="display:flex;align-items:center;justify-content:space-between">';
    html += '<span style="font-weight:700;font-size:11.5px;color:#e8e8e8">世界脉动 · 视线之外</span>';
    html += '<button class="ghost" style="padding:1px 6px;font-size:10px;color:#999999" onclick="v3AddWorldEvent()">' + I('plus') + ' 添加动态</button>';
    html += '</div>';
    html += '<div class="tiny" style="color:#888888;line-height:1.4">展示主角视角之外其他角色与舞台的异步进展。</div>';

    const events = aux.worldEvents || [];
    events.forEach(ev => {
      html += '<div class="v3-rp-event-item">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between">';
      html += '<span class="chip" style="font-size:9.5px">' + E(ev.status || '动态') + ' · ' + E(ev.role || '世界') + '</span>';
      html += '<span class="tiny" style="color:#777777">' + E(ev.time || '刚刚') + '</span>';
      html += '</div>';
      html += '<div style="font-size:11.5px;font-weight:600;color:#efefef">' + E(ev.title) + '</div>';
      html += '<div class="tiny" style="color:#9e9e9e;line-height:1.45">' + E(ev.desc) + '</div>';
      html += '</div>';
    });
  }

  html += '</div>'; // end v3-rp-right-content
  html += '</aside>'; // end v3-rp-right-sidebar

  // Auto-scroll on view load
  html += '<img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E" style="display:none" onload="setTimeout(()=>{const s=document.getElementById(\'v3RpMsgStream\');if(s)s.scrollTop=s.scrollHeight;},10);">';
  html += '</div>'; // end v3-rp-workspace-split
  return html;
};

// On responsive breakpoint crossing, rebuild RP layout without losing the typed draft.
let v3LastRpCompactMode = null;
window.addEventListener('resize', () => {
  if (ui.page !== 'rp' || !document.getElementById('v3RpWorkspaceSplit')) return;
  const next = (v3RpNarrowRight() ? 1 : 0) + (v3RpNarrowLeft() ? 2 : 0);
  if (v3LastRpCompactMode === null) { v3LastRpCompactMode = next; return; }
  if (next === v3LastRpCompactMode) return;
  const input = document.getElementById('rpInput');
  const draft = input?.value || '';
  v3LastRpCompactMode = next;
  render();
  const replacement = document.getElementById('rpInput');
  if (replacement) replacement.value = draft;
});

// 5. Interactive Handlers & Resizer Logic
let v3RpDragState = null;

function v3InitRpDrag(e, type) {
  e.preventDefault();
  v3RpDragState = {
    type: type,
    startX: e.clientX,
    startLeft: ui.rpLeftWidth || 265,
    startRight: ui.rpRightWidth || 280
  };
  document.body.style.cursor = 'col-resize';
  const leftEl = document.getElementById('v3RpLeftSidebar');
  const rightEl = document.getElementById('v3RpRightSidebar');
  if (leftEl) leftEl.classList.add('resizing');
  if (rightEl) rightEl.classList.add('resizing');

  window.addEventListener('mousemove', v3OnRpDragMove);
  window.addEventListener('mouseup', v3EndRpDrag);
}

function v3OnRpDragMove(e) {
  if (!v3RpDragState) return;
  const deltaX = e.clientX - v3RpDragState.startX;
  
  if (v3RpDragState.type === 'left') {
    let newW = v3RpDragState.startLeft + deltaX;
    newW = Math.max(180, Math.min(newW, 440));
    ui.rpLeftWidth = newW;
    const el = document.getElementById('v3RpLeftSidebar');
    if (el) el.style.setProperty('width', newW + 'px', 'important');
  } else if (v3RpDragState.type === 'right') {
    let newW = v3RpDragState.startRight - deltaX;
    newW = Math.max(200, Math.min(newW, 480));
    ui.rpRightWidth = newW;
    const el = document.getElementById('v3RpRightSidebar');
    if (el) el.style.setProperty('width', newW + 'px', 'important');
  }
}

function v3EndRpDrag() {
  if (!v3RpDragState) return;
  v3RpDragState = null;
  document.body.style.cursor = '';
  const leftEl = document.getElementById('v3RpLeftSidebar');
  const rightEl = document.getElementById('v3RpRightSidebar');
  if (leftEl) leftEl.classList.remove('resizing');
  if (rightEl) rightEl.classList.remove('resizing');

  window.removeEventListener('mousemove', v3OnRpDragMove);
  window.removeEventListener('mouseup', v3EndRpDrag);
  save();
}

function v3ToggleRpRoleFolder(roleId) {
  ui.rpExpandedRoles = ui.rpExpandedRoles || {};
  ui.rpExpandedRoles[roleId] = !ui.rpExpandedRoles[roleId];
  if (roleId !== 'detached_rp' && ui.rpExpandedRoles[roleId] && ui.rpRole !== roleId) {
    switchRPRole(roleId);
    return;
  }
  render();
}

function v3SetRpViewMode(mode) {
  ui.rpViewMode = mode;
  render();
}

function v3OnRpSearchInput(val) {
  ui.rpSessionQuery = val;
  render();
  const input = document.querySelector('.v3-rp-search-wrap input');
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function v3DismissRpPanels() {
  ui.rpLeftCompactOpen = false;
  ui.rpRightCompactOpen = false;
  render();
}

function v3ToggleRpLeft() {
  const isDock = (typeof RequestInspectorDock !== 'undefined' && RequestInspectorDock.isOpen && RequestInspectorDock.isOpen());
  if (isDock) {
    ui.rpLeftOpen = !ui.rpLeftOpen;
  } else if (v3RpNarrowLeft()) {
    ui.rpLeftCompactOpen = !ui.rpLeftCompactOpen;
  } else {
    ui.rpLeftOpen = !ui.rpLeftOpen;
  }
  render();
}

function v3ToggleRpRight() {
  const isDock = (typeof RequestInspectorDock !== 'undefined' && RequestInspectorDock.isOpen && RequestInspectorDock.isOpen());
  if (isDock) {
    ui.rpRightOpen = !ui.rpRightOpen;
  } else if (v3RpNarrowRight()) {
    ui.rpRightCompactOpen = !ui.rpRightCompactOpen;
  } else {
    ui.rpRightOpen = !ui.rpRightOpen;
  }
  render();
}

function v3SetRpRightTab(tab) {
  ui.rpRightTab = tab;
  render();
}

function v3SelectRpSession(roleId, sessId) {
  ui.rpRole = roleId;
  ui.rpSessionId = sessId;
  const list = store.rpSessions?.[roleId] || [];
  const target = list.find(s => s.id === sessId) || list[0];
  if (target) {
    if (!Array.isArray(target.messages)) target.messages = [];
    store.rpHistories[roleId] = target.messages;
  }
  render();
}

function v3CreateRpSession(roleId) {
 const r=role(roleId);if(!r)return;
 document.getElementById('rp-create-dialog')?.remove();
 const greeting=store.roleRpConfigs?.[roleId]?.greeting ?? store.rpConfigs?.[roleId]?.greeting ?? '';
 let mode=store.rpOpeningModes?.[roleId]||'custom';
 if(mode!=='none'&&mode!=='custom')mode='custom';
 const previousFocus=document.activeElement;
 const dialog=document.createElement('dialog');dialog.id='rp-create-dialog';
 dialog.innerHTML='<form><header class="between" style="margin-bottom:14px"><div class="flex gap8"><h2>新建对话</h2><span class="chip" style="font-size:11px;padding:1px 7px">'+E(r.name)+'</span></div><button type="button" class="btn quiet sm" data-cancel aria-label="关闭" style="font-size:16px;width:24px;height:24px;padding:0;color:#8f8f8f">×</button></header><div class="formrow"><label for="rp-new-title">对话名称</label><input class="input" id="rp-new-title" value="新的对话"></div><div class="formrow"><label>开场方式</label><div class="rp-opening-segmented"><label><input type="radio" name="opening" value="none">无开场白</label><label><input type="radio" name="opening" value="custom">自定义开场白</label></div></div><div class="rp-opening-collapsible" id="rp-opening-collapsible"><div class="rp-opening-collapsible-inner"><div class="formrow" id="rp-opening-editor"><label for="rp-custom-opening">本次开场白内容</label><textarea class="textarea" id="rp-custom-opening" rows="4" placeholder="输入本次对话的开场白……"></textarea></div></div></div><footer><button type="button" class="btn quiet" data-cancel>取消</button><button class="btn primary" type="submit">创建对话</button></footer></form>';
 document.body.appendChild(dialog);
 const custom=dialog.querySelector('#rp-custom-opening');
 if(!custom.value)custom.value=greeting;
 function update(){
  const isNone = (mode === 'none');
  dialog.querySelector('[value="'+mode+'"]').checked = true;
  const coll = dialog.querySelector('#rp-opening-collapsible');
  if (coll) {
    if (isNone) {
      coll.classList.add('is-collapsed');
    } else {
      coll.classList.remove('is-collapsed');
    }
  }
  custom.required = (mode === 'custom');
 }
 dialog.addEventListener('change',e=>{if(e.target.name==='opening'){mode=e.target.value;update();}});
 dialog.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>dialog.close());
 dialog.addEventListener('close',()=>{dialog.remove();if(previousFocus?.isConnected)previousFocus.focus();});
 dialog.querySelector('form').onsubmit=e=>{
  e.preventDefault();const opening=mode==='custom'?custom.value.trim():'';
  if(mode==='custom'&&!opening){custom.setCustomValidity('请填写开场白，或选择无开场白');custom.reportValidity();return;}
  const id=nextId('rp');const messages=opening?[{by:'ai',text:opening}]:[];
  const entry={id,title:dialog.querySelector('#rp-new-title').value.trim()||'新的对话',updated:'刚刚',preview:opening.slice(0,50)||'新的对话',messages,openingMode:mode};
  store.rpSessions=store.rpSessions||{};store.rpSessions[roleId]=store.rpSessions[roleId]||[];store.rpSessions[roleId].unshift(entry);
  store.rpOpeningModes=store.rpOpeningModes||{};store.rpOpeningModes[roleId]=mode;
  store.rpHistories[roleId]=messages;ui.rpRole=roleId;ui.rpSessionId=id;save();dialog.close();visit('rp',{keepChat:true});document.getElementById('rpInput')?.focus();
 };
 custom.oninput=()=>custom.setCustomValidity('');update();dialog.showModal();dialog.querySelector('#rp-new-title').focus();
}

function v3RenameRpSession(roleId, sessId) {
  const list = store.rpSessions?.[roleId] || [];
  const s = list.find(x => x.id === sessId);
  if (!s) return;
  const newTitle = prompt('重命名会话分支：', s.title);
  if (!newTitle || !newTitle.trim()) return;
  s.title = newTitle.trim();
  save();
  render();
  toast('已重命名会话');
}

function v3DeleteRpSession(roleId, sessId) {
  const list = store.rpSessions?.[roleId] || [];
  if (list.length <= 1) {
    return toast('至少保留一个剧情分支');
  }
  openPermanentDeleteModal({ type: 'rp', id: sessId });
}

function v3ToggleRpTask(taskId) {
  const st = v3GetRpAux().status;
  if (!st || !st.tasks) return;
  const t = st.tasks.find(x => x.id === taskId);
  if (t) {
    t.done = !t.done;
    save();
    render();
  }
}

function v3AddRpTask() {
  const text = prompt('请输入新剧情约定或任务：');
  if (!text || !text.trim()) return;
  const st = v3GetRpAux().status;
  st.tasks = st.tasks || [];
  st.tasks.push({
    id: 't_' + Date.now(),
    text: text.trim(),
    done: false,
    tag: '进行中'
  });
  save();
  render();
  toast('已添加任务约定');
}

function v3DeleteRpTask(taskId) {
  const st = v3GetRpAux().status;
  if (!st.tasks) return;
  st.tasks = st.tasks.filter(x => x.id !== taskId);
  save();
  render();
}

function v3RerollDeductions() {
  toast('当前是本地演示方案；正式接入 AI 后可重新生成四档推演');
}

function v3PreviewDeduction(idx) {
  const d = v3GetRpAux().deductions?.[idx];
  if (!d) return;
  const inp = document.getElementById('rpInput');
  if (inp) {
    inp.value = '*' + d.action + '* ';
    inp.focus();
  }
}

function v3AdoptDeduction(idx) {
  const d = v3GetRpAux().deductions?.[idx];
  if (!d) return;
  const id = ui.rpRole || roles[0]?.id;
  const history = v3RpActiveMessages();
  if (!history) return;
  history.push({
    by: 'ai',
    text: '“（剧情走向采纳）' + d.desc + '”'
  });
  if (store.rpSessions?.[id]) {
    const s = store.rpSessions[id].find(x => x.id === ui.rpSessionId) || store.rpSessions[id][0];
    if (s) {
      s.messages = history;
      s.preview = d.desc.slice(0, 30);
      s.updated = '刚刚';
    }
  }
  save();
  render();
  toast('已采纳并注入剧情走向');
}

function v3AddWorldEvent() {
  const title = prompt('请输入新世界动态标题：');
  if (!title || !title.trim()) return;
  const desc = prompt('请输入动态简要描述：');
  const ev = v3GetRpAux().worldEvents;
  ev.unshift({
    title: title.trim(),
    desc: desc ? desc.trim() : '',
    status: '新进展',
    role: '外部事件',
    time: '刚刚'
  });
  save();
  render();
  toast('已记录世界动态');
}

function v3HandleRpInputKey(e) {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && e.keyCode !== 229) {
    e.preventDefault();
    sendRP();
  }
}

function v3InsertDelimiter(open, close) {
  const inp = document.getElementById('rpInput');
  if (!inp) return;
  const start = inp.selectionStart;
  const end = inp.selectionEnd;
  const val = inp.value;
  const selected = val.substring(start, end);
  inp.value = val.substring(0, start) + open + selected + close + val.substring(end);
  inp.focus();
  inp.setSelectionRange(start + open.length, end + open.length);
}

// Bound to the real request workflow by installWorkflowUI during initialization.
function v3RerollRp(){toast('请求服务尚未就绪');}
function v3ContinueRp(){toast('请求服务尚未就绪');}
function v3SwitchNarrator(){toast('请求服务尚未就绪');}

function sendLocalRpDemo() {
  const inp = document.getElementById('rpInput');
  if (!inp || !inp.value.trim()) return;
  const userText = inp.value.trim();
  const id = ui.rpRole || roles[0]?.id;
  
  const history = v3RpActiveMessages();
  if (!history) return;
  
  // Add user message
  const userMsg = { by: 'you', text: userText };
  history.push(userMsg);
  inp.value = '';
  store.workspaceDrafts.rp[ui.rpSessionId] = '';

  // Generate dynamic contextual reply
  const sampleReplies = [
    '「如果是这样的话……」她轻轻弯起嘴角，眸子里闪过一丝认真的光芒，「那我们现在就出发吧，可别迟到了。」',
    '她若有所思地停顿了片刻，随后温和地笑了笑：「听起来是个不错的提议，那我们就按照这个步调继续。」',
    '*她轻轻放下手中的物件，抬起头专注地注视着你。* 「既然决定了，那就一起走到底吧。」',
    '“（在物证台前停下脚步，微微侧过脸，镜片折射出冷光）……你注意到了关键细节。把那份记录拿过来，我们重新对一遍时间轴。”'
  ];
  const replyText = sampleReplies[Math.floor(Math.random() * sampleReplies.length)];
  const aiMsg = { by: 'ai', text: replyText };
  history.push(aiMsg);

  // Sync to active session
  if (store.rpSessions && store.rpSessions[id]) {
    const curSess = store.rpSessions[id].find(s => s.id === ui.rpSessionId) || store.rpSessions[id][0];
    if (curSess) {
      curSess.messages = history;
      curSess.updated = '刚刚';
      curSess.preview = userText.length > 25 ? userText.slice(0, 25) + '...' : userText;
    }
  }

  save();
  render();
  setTimeout(() => {
    const s = document.getElementById('v3RpMsgStream');
    if (s) s.scrollTop = s.scrollHeight;
  }, 10);
};





// ========================================================
