/**
 * 个人创作工作室 · 请求透视器 (Request Inspector Dock & Cross-Turn Tracking)
 * 模式 1：本次请求 (Network & Trace 快照分析)
 * 模式 2：下一轮编辑 (Prompt Experimenter 草稿实验)
 * 模式 3：跨轮次上下文追踪 (Cross-Turn Context Tracking 演变分析)
 */

(function () {
  'use strict';

  function currentRecords(){
 const rp=ui.page==='rp',id=rp?ui.rpSessionId:ui.sessionId,match=r=>rp?r.context?.rpSessionId===id:r.context?.sessionId===id;
 const rows=(window.CreationWorkflow?.listRequests()||[]).filter(r=>match(r)&&r.status!=='preview'),p=ui.activeInspectedRequest;
 if(p&&match(p)&&!rows.some(r=>r.id===p.id))rows.push(p);return rows;
 }
 function requestRows(){return currentRecords().map((r,i)=>({turn:i+1,request:r,status:r.status,model:r.configuration?.modelName||r.configuration?.modelId||'未配置',query:r.context?.input||'空输入预览',tokens:(r.sections||[]).reduce((n,v)=>n+Math.ceil((v.content||'').length/2),0),modules:(r.sections||[]).map((v,j)=>({id:'sec_'+j,type:v.source?.type||v.messageRole,name:v.name,tokens:Math.ceil((v.content||'').length/2),reason:'来源：'+(v.source?.name||v.source?.id||v.source?.type||'未知'),content:v.content||''})),rawPayload:r.transport?.body||null}));}
  // --- 状态控制器 ---
  const state = {
    isOpen: false,
    isMaximized: false,
    dockWidth: '60%',
    currentMode: 'snapshot', // 'snapshot' | 'draft' | 'tracking'
    selectedSnapshotTurn: 10,
    snapshotSubTab: 'context', // 'context' | 'timing' | 'payload'
    trackingSubTab: 'compare', // 'compare' | 'trajectory' | 'history-matrix' | 'tokens'
    baseCompareTurn: 4,
    targetCompareTurn: 10,
    collapsedCards: {},
    editOverrides: {
      sysPrompt: "你是一个专业的严肃奇幻小说协作者。严禁输出总结性陈词或教条式评价。重点描写环境冷峻质感与人物微动作。",
      roleOverride: "（继承自崔依玟正式档案）补充特征：左手冻伤抽搐加剧，只能单手持剑。",
      worldOverride: "保持默认自动检索状态。",
      historyWindowDepth: 3,
      historyExclusions: {},
      directorNote: "",
      currentInput: "请描写崔依玟拾起半截信纸时的动作与心理防备，字数 200 字左右。"
    }
  };

  // --- 初始化与拖拽分屏交互 ---
  let isDragging = false;
  let startX = 0;
  let startW = 0;

  function initSplitterDragger() {
    const splitter = document.getElementById('st-inspector-splitter');
    if (!splitter) return;

    splitter.onmousedown = function (e) {
      isDragging = true;
      startX = e.clientX;
      const dock = document.getElementById('st-inspector-dock');
      const pageView = document.getElementById('st-page-view') || document.querySelector('.workspace');
      const containerW = pageView ? (pageView.parentElement?.offsetWidth || window.innerWidth) : window.innerWidth;

      if (state.isMaximized) {
        startW = containerW;
      } else {
        startW = dock ? dock.offsetWidth : Math.round(containerW * 0.6);
      }

      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      splitter.classList.add('dragging');

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    };

    // 双击分隔条：在 60% 与 100% 全屏之间智能切换
    splitter.ondblclick = function () {
      toggleMaximizeInspectorDock();
    };
  }

  function onMouseMove(e) {
    if (!isDragging) return;
    const dx = startX - e.clientX;
    const pageView = document.getElementById('st-page-view') || document.querySelector('.workspace');
    const containerW = pageView ? (pageView.parentElement?.offsetWidth || window.innerWidth) : window.innerWidth;
    
    let newW = startW + dx;
    const badge = document.getElementById('st-splitter-drag-badge');
    const splitter = document.getElementById('st-inspector-splitter');

    // 1. 自由压缩到右侧关闭判定 (阈值 < 220px)
    if (newW < 220) {
      if (splitter) {
        splitter.classList.add('snap-close');
        splitter.classList.remove('snap-maximize');
      }
      if (badge) {
        badge.style.display = 'flex';
        badge.style.left = Math.max(10, e.clientX - 160) + 'px';
        badge.style.borderColor = '#ef4444';
        badge.innerHTML = '<span style="color:#ef4444;font-weight:600">👉 释放即关闭透视器</span>';
      }
      const dock = document.getElementById('st-inspector-dock');
      if (dock) dock.style.width = Math.max(120, newW) + 'px';
      return;
    }

    // 2. 自由拉伸到全屏判定 (阈值 > containerW * 0.82 或剩余中央空间 < 200px)
    if (newW > containerW * 0.82) {
      if (splitter) {
        splitter.classList.add('snap-maximize');
        splitter.classList.remove('snap-close');
      }
      if (badge) {
        badge.style.display = 'flex';
        badge.style.left = Math.min(window.innerWidth - 220, e.clientX + 20) + 'px';
        badge.style.borderColor = '#22c55e';
        badge.innerHTML = '<span style="color:#4ade80;font-weight:600">👈 释放即全屏独占 (100%)</span>';
      }
      const dock = document.getElementById('st-inspector-dock');
      if (dock) dock.style.width = Math.min(containerW, newW) + 'px';
      return;
    }

    // 3. 常规自由拖拽区间
    if (splitter) {
      splitter.classList.remove('snap-close');
      splitter.classList.remove('snap-maximize');
    }
    if (badge) {
      badge.style.display = 'flex';
      badge.style.left = (e.clientX - 75) + 'px';
      badge.style.borderColor = 'var(--stroke2, #3c3c3c)';
      const pct = Math.round((newW / containerW) * 100);
      badge.innerHTML = `<span>透视器宽度: ${Math.round(newW)}px (${pct}%)</span>`;
    }

    state.isMaximized = false;
    state.dockWidth = newW + 'px';
    const dock = document.getElementById('st-inspector-dock');
    if (dock) {
      dock.classList.remove('maximized');
      dock.style.width = newW + 'px';
    }
    if (pageView) {
      pageView.style.display = 'block';
      pageView.style.flex = '1';
    }
  }

  function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    const splitter = document.getElementById('st-inspector-splitter');
    const badge = document.getElementById('st-splitter-drag-badge');
    if (badge) badge.style.display = 'none';

    const dx = startX - (e ? e.clientX : startX);
    const pageView = document.getElementById('st-page-view') || document.querySelector('.workspace');
    const containerW = pageView ? (pageView.parentElement?.offsetWidth || window.innerWidth) : window.innerWidth;
    const finalW = startW + dx;

    if (splitter) {
      splitter.classList.remove('dragging');
      splitter.classList.remove('snap-close');
      splitter.classList.remove('snap-maximize');
    }

    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);

    // 判定 1: 压缩到右侧关闭
    if (finalW < 220) {
      closeInspectorDock();
      toast('已向右自由压缩关闭透视器，并自动恢复工作区侧栏');
      return;
    }

    // 判定 2: 拉伸到全屏独占
    if (finalW > containerW * 0.82) {
      if (!state.isMaximized) {
        toggleMaximizeInspectorDock();
      }
      toast('已向左自由拉伸至全屏独占 (按 Esc 或双击左边缘还原 60%)');
      return;
    }

    // 常规停靠
    state.isMaximized = false;
    state.dockWidth = finalW + 'px';
    const dock = document.getElementById('st-inspector-dock');
    if (dock) {
      dock.classList.remove('maximized');
      dock.style.width = finalW + 'px';
    }
    if (pageView) {
      pageView.style.display = 'block';
      pageView.style.flex = '1';
    }
  }

  function resetDockWidth() {
    const pageView = document.getElementById('st-page-view');
    const containerW = pageView?.parentElement?.offsetWidth || window.innerWidth;
    const defW = Math.round(containerW * 0.6);
    state.dockWidth = Math.max(680, defW) + 'px';
    state.isMaximized = false;
    const dock = document.getElementById('st-inspector-dock');
    if (dock) {
      dock.classList.remove('maximized');
      dock.style.width = state.dockWidth;
    }
    if (pageView) {
      pageView.style.display = 'block';
      pageView.style.flex = '1';
    }
    toast('已恢复默认黄金分屏比例 (60%)');
  }

  // --- 全局暴露的开/关/模式切换方法 ---
  function openInspectorDock(req, targetMode) {
    if(req)ui.activeInspectedRequest=req;
    state.selectedSnapshotTurn=requestRows().length;
    state.isOpen = true;
    if (targetMode) state.currentMode = targetMode;

    const splitter = document.getElementById('st-inspector-splitter');
    const dock = document.getElementById('st-inspector-dock');
    const pageView = document.getElementById('st-page-view');

    if (splitter) {
      splitter.style.display = 'block';
      splitter.classList.toggle('maximized-splitter', state.isMaximized);
      splitter.title = state.isMaximized 
        ? '双击或向右拖动还原 60% 分屏 · 按 Esc 退出全屏' 
        : '拖动调整宽度：向左拉满全屏 / 向右压缩关闭 · 双击切换全屏 (60% / 100%)';
    }
    if (dock) {
      dock.style.display = 'flex';
      dock.style.width = state.isMaximized ? '100%' : (state.dockWidth || '60%');
    }
    if (pageView) {
      pageView.style.flex = state.isMaximized ? '0 0 0' : '1';
      if (state.isMaximized) pageView.style.display = 'none';
      else pageView.style.display = 'block';
    }

    // 同步输入框内容到编辑模式
    const inputEl = document.getElementById('chatinput') || document.getElementById('rpInput');
    if (inputEl && typeof inputEl.value === 'string' && inputEl.value.trim()) {
      state.editOverrides.currentInput = inputEl.value.trim();
    }

    // 关闭任何弹窗（如果有）
    if (typeof closeModal === 'function' && window.ui?.modal === 'requestInspector') {
      closeModal();
    }

    // 在会话或 RP 模式下，展开透视器自动收缩左右栏，避免居中会话框变形
    if (typeof window !== 'undefined' && window.ui) {
      if (state.prevSessLeftOpen === undefined) state.prevSessLeftOpen = (window.ui.sessionLeftOpen !== false);
      if (state.prevSessRightOpen === undefined) state.prevSessRightOpen = (window.ui.sessionRightOpen !== false);
      window.ui.sessionLeftOpen = false;
      window.ui.sessionRightOpen = false;

      if (state.prevRpLeftOpen === undefined) state.prevRpLeftOpen = (window.ui.rpLeftOpen !== false);
      if (state.prevRpRightOpen === undefined) state.prevRpRightOpen = (window.ui.rpRightOpen !== false);
      window.ui.rpLeftOpen = false;
      window.ui.rpRightOpen = false;
      window.ui.rpLeftCompactOpen = false;
      window.ui.rpRightCompactOpen = false;

      if (typeof render === 'function') render();
    }

    renderInspectorDock();
  }

  function closeInspectorDock() {
    state.isOpen = false;
    state.isMaximized = false;

    const splitter = document.getElementById('st-inspector-splitter');
    const dock = document.getElementById('st-inspector-dock');
    const pageView = document.getElementById('st-page-view');

    if (splitter) {
      splitter.style.display = 'none';
      splitter.classList.remove('maximized-splitter');
    }
    if (dock) {
      dock.style.display = 'none';
      dock.classList.remove('maximized');
    }
    if (pageView) {
      pageView.style.flex = '1';
      pageView.style.display = 'block';
      pageView.style.width = '100%';
    }

    // 关闭透视器时，自动恢复侧栏原状态
    if (typeof window !== 'undefined' && window.ui) {
      if (state.prevSessLeftOpen !== undefined) {
        window.ui.sessionLeftOpen = state.prevSessLeftOpen;
        delete state.prevSessLeftOpen;
      } else {
        window.ui.sessionLeftOpen = true;
      }
      if (state.prevSessRightOpen !== undefined) {
        window.ui.sessionRightOpen = state.prevSessRightOpen;
        delete state.prevSessRightOpen;
      } else {
        window.ui.sessionRightOpen = true;
      }

      if (state.prevRpLeftOpen !== undefined) {
        window.ui.rpLeftOpen = state.prevRpLeftOpen;
        delete state.prevRpLeftOpen;
      } else {
        window.ui.rpLeftOpen = true;
      }
      if (state.prevRpRightOpen !== undefined) {
        window.ui.rpRightOpen = state.prevRpRightOpen;
        delete state.prevRpRightOpen;
      } else {
        window.ui.rpRightOpen = true;
      }
      window.ui.rpLeftCompactOpen = false;
      window.ui.rpRightCompactOpen = false;

      if (typeof render === 'function') render();
    }
  }

  function toggleInspectorDock() {
    if (state.isOpen) closeInspectorDock();
    else openInspectorDock();
  }

  function toggleMaximizeInspectorDock() {
    state.isMaximized = !state.isMaximized;
    const dock = document.getElementById('st-inspector-dock');
    const pageView = document.getElementById('st-page-view');
    const splitter = document.getElementById('st-inspector-splitter');

    if (dock) {
      dock.classList.toggle('maximized', state.isMaximized);
      dock.style.width = state.isMaximized ? '100%' : (state.dockWidth || '60%');
    }
    if (splitter) {
      splitter.style.display = 'block';
      splitter.classList.toggle('maximized-splitter', state.isMaximized);
      splitter.title = state.isMaximized 
        ? '双击或向右拖动还原 60% 分屏 · 按 Esc 退出全屏' 
        : '拖动调整宽度：向左拉满全屏 / 向右压缩关闭 · 双击切换全屏 (60% / 100%)';
    }
    if (pageView) {
      pageView.style.display = state.isMaximized ? 'none' : 'block';
      pageView.style.flex = state.isMaximized ? '0 0 0' : '1';
    }
    renderInspectorDock();
  }

  function switchInspectorMode(mode) {
    state.currentMode = mode;
    renderInspectorDock();
  }

  // --- 数据源适配器 (优先读取真实会话请求) ---
  function getActiveSnapshotData(){const rows=requestRows();return rows.find(r=>r.turn===state.selectedSnapshotTurn)||rows.at(-1)||{turn:0,model:'无请求记录',tokens:0,modules:[],status:'empty'};}
  // --- 主渲染入口 ---
  function renderInspectorDock() {
    const dock = document.getElementById('st-inspector-dock');
    if (!dock || !state.isOpen) return;

    const data = getActiveSnapshotData();

    dock.innerHTML = `
      <!-- 1. 置顶工作模式胶囊与运行元数据 (已删除旧版丑陋的 [×] 和 [□] 顶栏) -->
      <div class="st-dock-mode-bar">
        <div style="display:flex;align-items:center;gap:8px">
          <div style="display:flex;align-items:center;gap:6px">
            <svg viewBox="0 0 24 24" style="color:var(--ui-accent,#ac97f5);width:14px;height:14px"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <strong style="font-size:12px;color:#eee;font-weight:650">请求透视</strong>
          </div>
          <div class="st-mode-segmented-pills">
            <button class="st-mode-tab-btn ${state.currentMode === 'snapshot' ? 'active' : ''}" onclick="RequestInspectorDock.setMode('snapshot')">
              <svg viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
              本次请求 (快照)
            </button>
            <button class="st-mode-tab-btn editing ${state.currentMode === 'draft' ? 'active' : ''}" onclick="RequestInspectorDock.setMode('draft')">
              <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
              下一轮编辑 (实验草稿)
            </button>
            <button class="st-mode-tab-btn tracking ${state.currentMode === 'tracking' ? 'active' : ''}" onclick="RequestInspectorDock.setMode('tracking')">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 14"/></svg>
              跨轮次追踪 (演变)
            </button>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:10.5px;font-family:ui-monospace,monospace;color:var(--dim,#888)">
          <span style="background:#1d1d1d;border:1px solid #303030;border-radius:4px;padding:2px 6px;color:#ccc">${E(data.model)} · ${data.tokens} tokens（估算）</span>
          <span>#${data.turn} · ${E(data.status)}</span>
        </div>
      </div>

      <!-- 2. 主视口 -->
      <div class="st-dock-viewport">
        ${state.currentMode === 'snapshot' ? renderSnapshotView(data) : ''}
        ${state.currentMode === 'draft' ? '<div class="st-readonly-box">一次性编辑与持久化尚未接入；当前不发送或应用实验修改。</div>' : ''}
        ${state.currentMode === 'tracking' ? '<div class="st-readonly-box">演变分析尚未接入。请在快照列表查看当前会话的真实记录。</div>' : ''}
      </div>
    `;

    // 绑定内部次级交互
    if (state.currentMode === 'snapshot') bindSnapshotEvents();
    if (state.currentMode === 'tracking' && state.trackingSubTab === 'tokens') renderTokenChart();
  }

  // --- 模式 1：本次请求 (Network & Trace 快照) ---
  function renderSnapshotView(data) {
    return `
      <div class="st-inner-split-container">
        <!-- 内部左栏：10 轮纯净历史发送时序列表 -->
        <div class="st-inner-left-table-pane" id="st-inner-table-pane">
          <div class="st-inner-table-head">
            <span style="flex:1;">当前会话记录 (${requestRows().length})</span>
            <span>Tokens</span>
          </div>
          <div class="st-req-list-scroll">
            ${requestRows().map(t => `
              <div class="st-req-item-row ${t.turn === state.selectedSnapshotTurn ? 'active' : ''}" onclick="RequestInspectorDock.selectSnapshotTurn(${t.turn})">
                <div class="st-req-item-top">
                  <span class="st-req-item-name">#${String(t.turn).padStart(2, '0')} · ${E(t.model.split(' ')[0])}</span>
                  <span class="st-req-item-tokens">${t.tokens}t</span>
                </div>
                <div class="st-req-item-query">${E(t.query)}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 内部左右可拖拽分隔线 -->
        <div class="st-inner-splitter" id="st-inner-splitter" title="拖拽调整列表与详情区域宽度"></div>

        <!-- 内部右栏：详情视口 -->
        <div class="st-inner-right-detail-pane">
          <div class="st-detail-sub-tabbar">
            <div class="st-sub-tabs-group">
              <div class="st-sub-tab-btn ${state.snapshotSubTab === 'context' ? 'active' : ''}" onclick="RequestInspectorDock.setSnapshotTab('context')">
                上下文组装 (Context)
              </div>
              <div class="st-sub-tab-btn ${state.snapshotSubTab === 'timing' ? 'active' : ''}" onclick="RequestInspectorDock.setSnapshotTab('timing')">
                调用时序 (Trace & Timing)
              </div>
              <div class="st-sub-tab-btn ${state.snapshotSubTab === 'payload' ? 'active' : ''}" onclick="RequestInspectorDock.setSnapshotTab('payload')">
                协议 Payload (JSON)
              </div>
            </div>
          </div>

          <div class="st-detail-tab-viewport">
            ${state.snapshotSubTab === 'context' ? renderSnapshotContext(data) : ''}
            ${state.snapshotSubTab === 'timing' ? renderSnapshotTiming(data) : ''}
            ${state.snapshotSubTab === 'payload' ? renderSnapshotPayload(data) : ''}
          </div>
        </div>
      </div>
    `;
  }

  function renderSnapshotContext(data) {
    return `
      <div style="padding:6px 10px;background:#1b221d;border:1px solid #234c38;border-radius:5px;font-size:11px;color:#7ee2a8;margin-bottom:12px;display:flex;align-items:center;gap:6px">
        <svg viewBox="0 0 24 24" style="width:13px;height:13px"><polyline points="20 6 9 17 4 12"/></svg>
        <span>${data.status === 'preview' ? '下一轮预览，尚未发送' : '请求快照'} · ${data.modules.length} 个模块；包含不代表模型遵守。</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${data.modules.map((m, idx) => `
          <div class="st-module-card" id="st_snap_card_${m.id}">
            <div class="st-card-topbar">
              <div class="st-card-meta-left">
                <span class="st-card-seq">#${idx + 1}</span>
                <span class="chip-norm" style="background:#262626;font-size:10px;text-transform:uppercase">${m.type}</span>
                <span class="st-card-title">${E(m.name)}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px">
                <span class="chip-norm" style="font-family:ui-monospace,monospace;font-size:10.5px;color:var(--dim,#888);background:#1a1a1a">${m.tokens} tokens</span>
                <button class="btn sm quiet" onclick="RequestInspectorDock.copyText('${E(escapeQuotes(m.content))}')">复制</button>
              </div>
            </div>
            <div class="st-card-body">
              <div class="st-card-reason-box">引用原因：${E(m.reason)}</div>
              <pre class="st-readonly-box">${E(m.content)}</pre>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderSnapshotTiming(){return '<div class="st-readonly-box">尚未采集分阶段耗时，不展示演示时延。</div>';}
  function renderTimingBar(label, ms, unit, pct, color) {
    return `
      <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted,#b4b4b4)">
          <span>${label}</span>
          <span style="font-family:ui-monospace,monospace">${ms} ${unit}</span>
        </div>
        <div style="height:6px;border-radius:3px;background:#242424;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:3px"></div>
        </div>
      </div>
    `;
  }

  function renderSnapshotPayload(data) {
    const raw=data.rawPayload||data.request?.payload||{};
    return `
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:11px;color:var(--dim,#888)">${data.rawPayload ? '实际协议正文' : '规范化预览正文（尚未协议转换）'} · 不包含认证请求头</span>
          <button class="btn sm quiet" onclick="RequestInspectorDock.copyText('${E(escapeQuotes(JSON.stringify(raw, null, 2)))}')">复制完整 JSON</button>
        </div>
        <pre class="st-readonly-box" style="max-height:480px;color:#a8c0e8">${E(JSON.stringify(raw, null, 2))}</pre>
      </div>
    `;
  }

  function bindSnapshotEvents() {
    const splitter = document.getElementById('st-inner-splitter');
    if (!splitter) return;
    let isInnerDragging = false;
    let startX = 0;
    let startW = 0;

    splitter.onmousedown = function (e) {
      isInnerDragging = true;
      startX = e.clientX;
      const leftPane = document.getElementById('st-inner-table-pane');
      startW = leftPane ? leftPane.offsetWidth : 240;
      document.body.style.userSelect = 'none';

      const move = (ev) => {
        if (!isInnerDragging) return;
        const dx = ev.clientX - startX;
        let newW = startW + dx;
        if (newW < 180) newW = 180;
        if (newW > 380) newW = 380;
        if (leftPane) leftPane.style.width = newW + 'px';
      };
      const up = () => {
        isInnerDragging = false;
        document.body.style.userSelect = '';
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    };
  }

  // --- 模式 2：下一轮编辑 (Prompt Experimenter 草稿实验) ---
  function renderDraftView() {
    const o = state.editOverrides;
    return `
      <div class="st-edit-mode-container">
        <!-- 左侧模块快速定位目录 -->
        <aside class="st-edit-nav-sidebar">
          <div style="padding:8px 10px;font-size:11px;font-weight:650;color:var(--muted,#b4b4b4);border-bottom:1px solid var(--stroke,#333)">
            组装目录 (点击定位)
          </div>
          <div class="st-edit-nav-list">
            <div class="st-edit-nav-item" onclick="RequestInspectorDock.scrollToCard('edit_card_sys')">
              <span>1. 系统提示词</span>
              <span class="st-card-seq">自由</span>
            </div>
            <div class="st-edit-nav-item" onclick="RequestInspectorDock.scrollToCard('edit_card_role')">
              <span>2. 角色卡设定</span>
              <span class="st-card-seq">修正</span>
            </div>
            <div class="st-edit-nav-item" onclick="RequestInspectorDock.scrollToCard('edit_card_world')">
              <span>3. 世界书检索</span>
              <span class="st-card-seq">条目</span>
            </div>
            <div class="st-edit-nav-item" onclick="RequestInspectorDock.scrollToCard('edit_card_history')">
              <span>4. 滑动历史窗口</span>
              <span class="st-card-seq">${o.historyWindowDepth}轮</span>
            </div>
            <div class="st-edit-nav-item" onclick="RequestInspectorDock.scrollToCard('edit_card_input')">
              <span>5. 创作者输入</span>
              <span class="st-card-seq">联动</span>
            </div>
          </div>
        </aside>

        <!-- 右侧卡片滚动编辑区 -->
        <div class="st-edit-cards-stage">
          <div style="padding:7px 12px;background:#251d14;border:1px solid #4a3416;border-radius:5px;font-size:11px;color:#ffd895;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
            <span>本轮临时修改仅对下一次请求有效，发送后自动失效，不污染底层预设。</span>
            <button class="btn sm quiet" onclick="RequestInspectorDock.insertDirectorNote()">+ 插入导演指令</button>
          </div>

          <!-- 模块 1: 系统词 (全自由) -->
          <div class="st-module-card" id="edit_card_sys">
            <div class="st-card-topbar">
              <div class="st-card-meta-left">
                <span class="st-card-seq">#1</span>
                <span class="chip-norm" style="background:#262626;font-size:10px">SYSTEM</span>
                <span class="st-card-title">系统核心提示词</span>
              </div>
              <div style="display:flex;gap:6px">
                <button class="btn sm quiet" onclick="RequestInspectorDock.resetSysPrompt()">恢复原文</button>
              </div>
            </div>
            <div class="st-card-body">
              <div class="st-card-reason-box">允许直接自由编辑全量提示词：</div>
              <textarea class="st-module-editor-textarea" oninput="RequestInspectorDock.updateEdit('sysPrompt', this.value)">${E(o.sysPrompt)}</textarea>
            </div>
          </div>

          <!-- 模块 2: 角色卡 (结构化保护 + 临时修正) -->
          <div class="st-module-card" id="edit_card_role">
            <div class="st-card-topbar">
              <div class="st-card-meta-left">
                <span class="st-card-seq">#2</span>
                <span class="chip-norm" style="background:#262626;font-size:10px">ROLE</span>
                <span class="st-card-title">角色卡：崔依玟 (结构化保护)</span>
              </div>
            </div>
            <div class="st-card-body">
              <div class="st-card-reason-box">核心设定已锁定只读保护，可在下方追加临时生理/心理状态修正：</div>
              <textarea class="st-module-editor-textarea" style="min-height:60px" placeholder="输入追加临时修正..." oninput="RequestInspectorDock.updateEdit('roleOverride', this.value)">${E(o.roleOverride)}</textarea>
            </div>
          </div>

          <!-- 模块 3: 滑动历史窗口调节 -->
          <div class="st-module-card" id="edit_card_history">
            <div class="st-card-topbar">
              <div class="st-card-meta-left">
                <span class="st-card-seq">#3</span>
                <span class="chip-norm" style="background:#262626;font-size:10px">HISTORY</span>
                <span class="st-card-title">历史消息滑动窗口深度</span>
              </div>
              <span class="chip-norm" id="st-window-depth-label" style="background:#1a1a1a;font-family:ui-monospace,monospace">${o.historyWindowDepth} 轮</span>
            </div>
            <div class="st-card-body">
              <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">
                <input type="range" class="range" min="1" max="10" value="${o.historyWindowDepth}" oninput="RequestInspectorDock.updateHistoryDepth(this.value)">
              </div>
              <div class="st-card-reason-box">调节包含进请求的会话轮数；单条消息排除请在下方勾选：</div>
              <label class="clickrow" style="display:flex;align-items:center;gap:8px;padding:6px 10px;font-size:11px">
                <input type="checkbox" onchange="RequestInspectorDock.toggleMsgExclusion('turn_01', this.checked)">
                <span>临时排除 Turn #01 暴风雪开场叙述</span>
              </label>
            </div>
          </div>

          <!-- 模块 4: 创作者输入 (双向联动) -->
          <div class="st-module-card" id="edit_card_input">
            <div class="st-card-topbar">
              <div class="st-card-meta-left">
                <span class="st-card-seq">#4</span>
                <span class="chip-norm" style="background:#262626;font-size:10px">INPUT</span>
                <span class="st-card-title">创作者下一轮指令 (与主输入框双向同步)</span>
              </div>
            </div>
            <div class="st-card-body">
              <textarea class="st-module-editor-textarea" style="min-height:80px" oninput="RequestInspectorDock.syncEditInputToChat(this.value)">${E(o.currentInput)}</textarea>
            </div>
          </div>
        </div>
      </div>

      <!-- 编辑模式底栏操作 -->
      <footer class="st-edit-foot-actions">
        <div style="font-size:11px;color:var(--muted,#b4b4b4)">
          预估体量：<strong>~1,520 tokens</strong> · 已应用临时覆盖
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn sm" onclick="RequestInspectorDock.resetEditOverrides()">重置修改</button>
          <button class="btn primary sm" id="st-btn-send-draft" onclick="RequestInspectorDock.sendDraft()">
            <svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            以此配置发送本轮请求
          </button>
        </div>
      </footer>
    `;
  }

  // --- 模式 3：跨轮次上下文追踪 (Cross-Turn Context Tracking) ---
  function renderTrackingView() {
    return `
      <div class="st-cross-turn-container">
        <!-- 顶部 10 轮横向时间线轨 -->
        <div class="st-timeline-strip-wrap">
          ${requestRows().map(t => `
            <div class="st-timeline-node ${t.turn === state.baseCompareTurn ? 'active-base' : ''} ${t.turn === state.targetCompareTurn ? 'active-target' : ''}" onclick="RequestInspectorDock.quickSelectTimelineNode(${t.turn})">
              <div class="st-node-head">
                <span class="st-node-turn-id">#${String(t.turn).padStart(2, '0')}</span>
                <span class="st-node-tokens">${t.tokens}t</span>
              </div>
              <div class="st-node-desc">${E(t.reasonSummary)}</div>
            </div>
          `).join('')}
        </div>

        <!-- 追踪二级子视图切换条 -->
        <div class="st-tracking-subnav">
          <div class="st-tracking-tabs">
            <div class="st-tracking-tab-btn ${state.trackingSubTab === 'compare' ? 'active' : ''}" onclick="RequestInspectorDock.setTrackingTab('compare')">
              任意轮次对比 (Diff)
            </div>
            <div class="st-tracking-tab-btn ${state.trackingSubTab === 'trajectory' ? 'active' : ''}" onclick="RequestInspectorDock.setTrackingTab('trajectory')">
              模块连续变化轨迹
            </div>
            <div class="st-tracking-tab-btn ${state.trackingSubTab === 'history-matrix' ? 'active' : ''}" onclick="RequestInspectorDock.setTrackingTab('history-matrix')">
              历史消息滑动窗口追踪
            </div>
            <div class="st-tracking-tab-btn ${state.trackingSubTab === 'tokens' ? 'active' : ''}" onclick="RequestInspectorDock.setTrackingTab('tokens')">
              Token 趋势分析
            </div>
          </div>
          <span style="font-size:10.5px;color:var(--dim,#888)">覆盖全会话 10 轮演变</span>
        </div>

        <!-- 追踪主视口 -->
        <div class="st-tracking-body-viewport">
          ${state.trackingSubTab === 'compare' ? renderTrackingCompare() : ''}
          ${state.trackingSubTab === 'trajectory' ? renderTrackingTrajectory() : ''}
          ${state.trackingSubTab === 'history-matrix' ? renderTrackingMatrix() : ''}
          ${state.trackingSubTab === 'tokens' ? renderTrackingTokens() : ''}
        </div>
      </div>
    `;
  }

  // 子视图 1: 任意轮次对比
  function renderTrackingCompare() {
    const base = requestRows().find(t => t.turn === state.baseCompareTurn) || requestRows()[3];
    const target = requestRows().find(t => t.turn === state.targetCompareTurn) || requestRows()[9];
    const diffs = computeTurnDiff(base, target);

    return `
      <div>
        <div class="st-compare-controls-bar">
          <div class="st-turn-select-group">
            <span style="color:var(--muted,#b4b4b4);font-size:11px">基准轮次：</span>
            <select class="st-turn-picker-select" onchange="RequestInspectorDock.setBaseTurn(Number(this.value))">
              ${requestRows().map(t => `<option value="${t.turn}" ${t.turn === state.baseCompareTurn ? 'selected' : ''}>Turn #${t.turn} (${t.tokens}t)</option>`).join('')}
            </select>
            <span style="color:var(--muted,#b4b4b4);font-size:11px;margin-left:6px">对比目标：</span>
            <select class="st-turn-picker-select" onchange="RequestInspectorDock.setTargetTurn(Number(this.value))">
              ${requestRows().map(t => `<option value="${t.turn}" ${t.turn === state.targetCompareTurn ? 'selected' : ''}>Turn #${t.turn} (${t.tokens}t)</option>`).join('')}
            </select>
          </div>
          <div style="display:flex;gap:6px">
            <button class="btn sm quiet" onclick="RequestInspectorDock.setQuickCompare('prev')">对比上一轮</button>
            <button class="btn sm quiet" onclick="RequestInspectorDock.setQuickCompare('first')">对比开局 (#01)</button>
          </div>
        </div>

        <div style="display:flex;flex-direction:column;gap:10px">
          ${diffs.map((d, i) => `
            <div class="st-module-card">
              <div class="st-card-topbar">
                <div class="st-card-meta-left">
                  <span class="st-diff-status-tag ${d.statusType}">${d.statusLabel}</span>
                  <span class="st-card-title">${E(d.name)}</span>
                </div>
                <span class="chip-norm" style="background:#1a1a1a;font-family:ui-monospace,monospace;font-size:10.5px;color:var(--dim,#888)">${d.tokenDiff}</span>
              </div>
              <div class="st-card-body">
                <div class="st-card-reason-box">${E(d.reason)}</div>
                ${d.statusType === 'modified' ? `
                  <div class="st-inline-diff-view">
                    <div>
                      <div style="font-size:10.5px;color:var(--dim,#888);margin-bottom:4px">Turn #${base.turn} (基准)</div>
                      <div class="st-diff-block orig">${E(d.baseContent)}</div>
                    </div>
                    <div>
                      <div style="font-size:10.5px;color:var(--dim,#888);margin-bottom:4px">Turn #${target.turn} (对比)</div>
                      <div class="st-diff-block curr">${E(d.targetContent)}</div>
                    </div>
                  </div>
                ` : `
                  <pre class="st-readonly-box">${E(d.targetContent || d.baseContent)}</pre>
                `}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function computeTurnDiff(base, target) {
    const list = [];
    const baseRole = base.modules.find(m => m.id === "role");
    const targetRole = target.modules.find(m => m.id === "role");
    if (baseRole && targetRole) {
      if (baseRole.content !== targetRole.content) {
        list.push({
          name: "角色卡：崔依玟",
          statusType: "modified",
          statusLabel: "内容修改",
          reason: "中途遭遇严寒暴雪，动态追加左手负伤抽搐生理特征",
          tokenDiff: `+${targetRole.tokens - baseRole.tokens} tokens`,
          baseContent: baseRole.content,
          targetContent: targetRole.content
        });
      } else {
        list.push({
          name: "角色卡：崔依玟",
          statusType: "unchanged",
          statusLabel: "保持不变",
          reason: "常驻核心人设基线稳定",
          tokenDiff: "0 tokens",
          baseContent: baseRole.content,
          targetContent: targetRole.content
        });
      }
    }

    // 世界书演化
    const baseWorld = base.modules.filter(m => m.id.startsWith("world"));
    const targetWorld = target.modules.filter(m => m.id.startsWith("world"));
    targetWorld.forEach(tw => {
      const found = baseWorld.find(bw => bw.id === tw.id);
      if (!found) {
        list.push({
          name: tw.name,
          statusType: "added",
          statusLabel: "新增触发",
          reason: tw.reason,
          tokenDiff: `+${tw.tokens} tokens`,
          baseContent: "",
          targetContent: tw.content
        });
      }
    });

    // 创作者指令演化
    const baseInput = base.modules.find(m => m.id === "input");
    const targetInput = target.modules.find(m => m.id === "input");
    if (baseInput && targetInput) {
      list.push({
        name: "创作者输入指令",
        statusType: "modified",
        statusLabel: "轮次演进",
        reason: "推进剧情至新节点目标",
        tokenDiff: `${targetInput.tokens - baseInput.tokens >= 0 ? '+' : ''}${targetInput.tokens - baseInput.tokens} tokens`,
        baseContent: baseInput.content,
        targetContent: targetInput.content
      });
    }

    return list;
  }

  // 子视图 2: 模块连续轨迹
  function renderTrackingTrajectory() {
    return `
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:11px;color:var(--muted,#b4b4b4)">选择追踪模块：</span>
            <select class="st-turn-picker-select" id="st-select-trajectory" onchange="RequestInspectorDock.renderTrajectoryTable(this.value)">
              <option value="role_profile">角色卡正式档案 · 崔依玟</option>
              <option value="world_chapel">世界书条目 · 白银旧圣堂</option>
              <option value="world_sword">世界书条目 · 破晓之剑</option>
              <option value="world_letter">世界书条目 · 半截烧焦信纸</option>
            </select>
          </div>
          <span style="font-size:10.5px;color:var(--dim,#888)">展示该模块在 10 轮会话中的生命周期与激活原因</span>
        </div>

        <table class="st-trajectory-table">
          <thead>
            <tr>
              <th style="width:65px">轮次</th>
              <th style="width:110px">生命周期状态</th>
              <th style="width:180px">推导原因</th>
              <th>内容快照或说明</th>
            </tr>
          </thead>
          <tbody id="st-trajectory-tbody">
            ${getTrajectoryRowsHtml('role_profile')}
          </tbody>
        </table>
      </div>
    `;
  }

  function getTrajectoryRowsHtml(modKey) {
    return requestRows().map(t => {
      let status = "持续包含";
      let reason = "规则稳定";
      let snippet = "基础档案";

      if (modKey === "role_profile") {
        if (t.turn < 5) {
          status = t.turn === 1 ? "首次载入" : "持续包含";
          snippet = "版本 A · 戒律骑士裁决官档案 (340t)";
        } else {
          status = t.turn === 5 ? "状态更新" : "持续包含";
          reason = "Turn #05 遭遇暴风雪，追加左手神经冻伤痉挛特征";
          snippet = "版本 B · 追加左手冻伤生理特征 (360t)";
        }
      } else if (modKey === "world_chapel") {
        if (t.turn < 4) {
          status = "未触发";
          reason = "尚未命中关键词";
          snippet = "(未包含)";
        } else {
          status = t.turn === 4 ? "首次触发" : "持续包含";
          reason = "命中【圣殿/誓约】";
          snippet = "【白银旧圣堂】位于西风隘口北侧，三年前政变焚毁...";
        }
      } else if (modKey === "world_sword") {
        if (t.turn < 7) {
          status = "未触发";
          reason = "尚未命中关键词";
          snippet = "(未包含)";
        } else {
          status = t.turn === 7 ? "首次触发" : "持续包含";
          reason = "命中【破晓之剑】";
          snippet = "【破晓之剑】圣堂三圣器之首，残留苍白日芒...";
        }
      } else if (modKey === "world_letter") {
        if (t.turn < 10) {
          status = "未触发";
          reason = "尚未命中关键词";
          snippet = "(未包含)";
        } else {
          status = "首次触发";
          reason = "命中【信纸/告解室】";
          snippet = "【半截烧焦信纸】审判所朱红火漆残印...";
        }
      }

      return `
        <tr>
          <td style="font-weight:700;font-family:ui-monospace,monospace">#${String(t.turn).padStart(2, '0')}</td>
          <td><span class="st-diff-status-tag ${status.includes('首次') || status.includes('更新') ? 'modified' : (status === '未触发' ? 'unchanged' : 'added')}">${status}</span></td>
          <td style="font-size:11px;color:var(--muted,#b4b4b4)">${reason}</td>
          <td style="font-size:11px;color:var(--ink,#eee);font-family:ui-monospace,monospace">${snippet}</td>
        </tr>
      `;
    }).join('');
  }

  // 子视图 3: 历史消息滑动窗口矩阵
  function renderTrackingMatrix() {
    const sampleMsgs = [
      { id: "msg-01", role: "User", summary: "设定初始场景：崔依玟在暴风雪中行进", start: 1, end: 5 },
      { id: "msg-02", role: "AI", summary: "石阶碎裂声，她踏入风雪...", start: 1, end: 5 },
      { id: "msg-03", role: "User", summary: "观察哨塔外围异样脚印", start: 2, end: 7 },
      { id: "msg-04", role: "AI", summary: "手扣剑柄吞口，察觉脚印深浅不一", start: 2, end: 7 },
      { id: "msg-05", role: "User", summary: "拔出断誓剑，左手旧伤冻僵", start: 5, end: 9 },
      { id: "msg-06", role: "User", summary: "确认听到破晓之剑传说时的微表情", start: 7, end: 10 },
      { id: "msg-07", role: "User", summary: "走向告解室并发现烧焦信纸", start: 9, end: 10 }
    ];

    return `
      <div style="display:flex;flex-direction:column;gap:10px">
        <div style="font-size:11px;color:var(--muted,#b4b4b4);display:flex;justify-content:space-between">
          <span>观察对话历史如何随滑动窗口滚动进入、保留与移出上下文：</span>
          <span style="font-size:10px;color:var(--dim,#888)">[绿格: 包含在请求] [灰格: 移出窗口]</span>
        </div>
        ${sampleMsgs.map(m => {
          let cells = "";
          for (let i = 1; i <= 10; i++) {
            const inScope = (i >= m.start && i <= m.end);
            cells += `<div class="st-matrix-cell ${inScope ? 'in' : 'out'}" title="Turn #${i}: ${inScope ? '包含' : '移出'}">${i}</div>`;
          }
          return `
            <div class="st-matrix-card">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div style="display:flex;align-items:center;gap:6px">
                  <span class="chip-norm" style="background:#222;font-size:9.5px">${m.role}</span>
                  <strong style="font-size:11.5px;color:var(--ink,#eee)">${m.summary}</strong>
                </div>
                <span style="font-size:10px;color:var(--dim,#888);font-family:ui-monospace,monospace">生命周期: #${m.start} ~ #${m.end}</span>
              </div>
              <div class="st-matrix-node-strip">
                <span style="font-size:10px;color:var(--dim,#888);margin-right:4px">10 轮覆盖:</span>
                ${cells}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // 子视图 4: Token 趋势柱状图
  function renderTrackingTokens() {
    return `
      <div class="st-token-chart-box">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <strong style="color:var(--ink,#eee);font-size:12px">连续 10 轮 Token 消耗趋势与模块占比堆叠图</strong>
            <div style="font-size:10.5px;color:var(--dim,#888);margin-top:2px">点击柱子可直接选中并查看分项详情</div>
          </div>
          <div style="display:flex;gap:8px;font-size:10px;color:var(--muted,#b4b4b4)">
            <span style="display:flex;align-items:center;gap:3px"><span style="width:7px;height:7px;background:var(--color-purple,#ab8eef);border-radius:2px"></span>系统</span>
            <span style="display:flex;align-items:center;gap:3px"><span style="width:7px;height:7px;background:var(--color-info,#6fa6e8);border-radius:2px"></span>角色</span>
            <span style="display:flex;align-items:center;gap:3px"><span style="width:7px;height:7px;background:var(--ui-accent,#ac97f5);border-radius:2px"></span>世界书</span>
            <span style="display:flex;align-items:center;gap:3px"><span style="width:7px;height:7px;background:var(--color-success,#67b57e);border-radius:2px"></span>历史</span>
            <span style="display:flex;align-items:center;gap:3px"><span style="width:7px;height:7px;background:var(--color-warning,#e09f48);border-radius:2px"></span>输入</span>
          </div>
        </div>

        <div class="st-chart-columns-grid" id="st-token-chart-grid"></div>

        <div id="st-chart-hover-detail" style="background:#171717;border:1px solid #383838;border-radius:5px;padding:8px 12px;font-size:11px;display:flex;justify-content:space-between">
          <span>当前选中：<strong>Turn #10</strong> · 总 Token: <strong>1,510</strong></span>
          <span style="color:var(--dim,#888)">系统 185t · 角色 360t · 世界书 390t · 历史 515t · 输入 60t</span>
        </div>
      </div>
    `;
  }

  function renderTokenChart() {
    const grid = document.getElementById('st-token-chart-grid');
    if (!grid) return;
    grid.innerHTML = "";
    const maxTokens = 1600;

    requestRows().forEach(t => {
      const col = document.createElement("div");
      col.className = "st-chart-col";
      col.onclick = () => {
        const detail = document.getElementById("st-chart-hover-detail");
        if (detail) {
          detail.innerHTML = `
            <span>当前选中：<strong>Turn #${t.turn}</strong> · 总 Token: <strong>${t.tokens}</strong></span>
            <span style="color:var(--dim,#888)">系统 ${t.tokenBreakdown.system}t · 角色 ${t.tokenBreakdown.role}t · 世界书 ${t.tokenBreakdown.world}t · 历史 ${t.tokenBreakdown.history}t · 输入 ${t.tokenBreakdown.input}t</span>
          `;
        }
        toast(`已选中 Turn #${t.turn}，总 Token: ${t.tokens}`);
      };

      const totalH = Math.round((t.tokens / maxTokens) * 125);
      const hSys = Math.round((t.tokenBreakdown.system / t.tokens) * totalH);
      const hRole = Math.round((t.tokenBreakdown.role / t.tokens) * totalH);
      const hWorld = Math.round((t.tokenBreakdown.world / t.tokens) * totalH);
      const hHist = Math.round((t.tokenBreakdown.history / t.tokens) * totalH);
      const hInput = Math.max(3, totalH - hSys - hRole - hWorld - hHist);

      col.innerHTML = `
        <span style="font-size:9.5px;color:var(--dim,#888);font-family:ui-monospace,monospace">${t.tokens}</span>
        <div class="st-chart-bar-stack" style="height:${totalH}px">
          <div class="st-bar-slice" style="height:${hSys}px;background:var(--color-purple,#ab8eef)" title="系统: ${t.tokenBreakdown.system}t"></div>
          <div class="st-bar-slice" style="height:${hRole}px;background:var(--color-info,#6fa6e8)" title="角色: ${t.tokenBreakdown.role}t"></div>
          <div class="st-bar-slice" style="height:${hWorld}px;background:var(--ui-accent,#ac97f5)" title="世界书: ${t.tokenBreakdown.world}t"></div>
          <div class="st-bar-slice" style="height:${hHist}px;background:var(--color-success,#67b57e)" title="历史: ${t.tokenBreakdown.history}t"></div>
          <div class="st-bar-slice" style="height:${hInput}px;background:var(--color-warning,#e09f48)" title="输入: ${t.tokenBreakdown.input}t"></div>
        </div>
        <span class="st-chart-label">#${t.turn}</span>
      `;
      grid.appendChild(col);
    });
  }

  // --- 辅助工具 ---
  function escapeQuotes(str){return JSON.stringify(String(str??'')).slice(1,-1).replace(/'/g,"\\'");}
  // --- 对外公开 API ---
  window.RequestInspectorDock = {
    isOpen: function () {
      return !!state.isOpen;
    },
    open: openInspectorDock,
    close: closeInspectorDock,
    toggle: toggleInspectorDock,
    toggleMaximize: toggleMaximizeInspectorDock,
    setMode: switchInspectorMode,
    selectSnapshotTurn: function (turn) {
      state.selectedSnapshotTurn = turn;
      renderInspectorDock();
    },
    setSnapshotTab: function (tab) {
      state.snapshotSubTab = tab;
      renderInspectorDock();
    },
    setTrackingTab: function (tab) {
      state.trackingSubTab = tab;
      renderInspectorDock();
    },
    setBaseTurn: function (turn) {
      state.baseCompareTurn = turn;
      renderInspectorDock();
    },
    setTargetTurn: function (turn) {
      state.targetCompareTurn = turn;
      renderInspectorDock();
    },
    quickSelectTimelineNode: function (turn) {
      state.targetCompareTurn = turn;
      state.selectedSnapshotTurn = turn;
      renderInspectorDock();
    },
    setQuickCompare: function (type) {
      if (type === 'first') state.baseCompareTurn = 1;
      if (type === 'prev') state.baseCompareTurn = Math.max(1, state.targetCompareTurn - 1);
      renderInspectorDock();
    },
    renderTrajectoryTable: function (modKey) {
      const tbody = document.getElementById('st-trajectory-tbody');
      if (tbody) tbody.innerHTML = getTrajectoryRowsHtml(modKey);
    },
    scrollToCard: function (id) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    forkToDraft: function () {
      state.currentMode = 'draft';
      renderInspectorDock();
      toast('已载入本轮快照至草稿工作区');
    },
    updateEdit: function (key, val) {
      state.editOverrides[key] = val;
    },
    updateHistoryDepth: function (val) {
      state.editOverrides.historyWindowDepth = val;
      const label = document.getElementById('st-window-depth-label');
      if (label) label.textContent = val + ' 轮';
    },
    toggleMsgExclusion: function (id, checked) {
      state.editOverrides.historyExclusions[id] = checked;
    },
    syncEditInputToChat: function (val) {
      state.editOverrides.currentInput = val;
      const chatInp = document.getElementById('chatinput') || document.getElementById('rpInput');
      if (chatInp && chatInp.value !== val) {
        chatInp.value = val;
      }
    },
    insertDirectorNote: function () {
      state.editOverrides.sysPrompt += "\n[临时导演指令]: 严格使用第三人称冷峻旁白，削减心理词，突出环境与微动作。";
      renderInspectorDock();
      toast('已注入临时导演指令');
    },
    resetSysPrompt: function () {
      state.editOverrides.sysPrompt = "你是一个专业的严肃奇幻小说协作者。严禁输出总结性陈词或教条式评价。重点描写环境冷峻质感与人物微动作。";
      renderInspectorDock();
      toast('已恢复系统提示词原文');
    },
    resetEditOverrides: function () {
      state.editOverrides.sysPrompt = "你是一个专业的严肃奇幻小说协作者。严禁输出总结性陈词或教条式评价。重点描写环境冷峻质感与人物微动作。";
      state.editOverrides.roleOverride = "";
      state.editOverrides.historyWindowDepth = 3;
      state.editOverrides.historyExclusions = {};
      renderInspectorDock();
      toast('已重置全部临时修改');
    },
    sendDraft:function(){toast('实验编辑发送尚未接入，未发送任何请求');},
    copyText:async function(txt){try{await navigator.clipboard.writeText(txt);toast('已复制到剪贴板');}catch{toast('复制失败，请手动选择文本复制');}},
    syncView: function () {
      if (!state.isOpen) return;
      const splitter = document.getElementById('st-inspector-splitter');
      const dock = document.getElementById('st-inspector-dock');
      const pageView = document.getElementById('st-page-view');
      if (splitter) splitter.style.display = 'block';
      if (dock) {
        dock.style.display = 'flex';
        dock.style.width = state.isMaximized ? '100%' : state.dockWidth;
      }
      if (pageView && state.isMaximized) {
        pageView.style.display = 'none';
        pageView.style.flex = '0 0 0';
      }
      renderInspectorDock();
    },
    initDragger: initSplitterDragger
  };

  // --- 键盘 Esc 全局监听：退出全屏独占或关闭透视器 ---
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.isOpen) {
      if (state.isMaximized) {
        state.isMaximized = false;
        state.dockWidth = '60%';
        const dock = document.getElementById('st-inspector-dock');
        const pageView = document.getElementById('st-page-view');
        const splitter = document.getElementById('st-inspector-splitter');
        if (dock) {
          dock.classList.remove('maximized');
          dock.style.width = '60%';
        }
        if (splitter) {
          splitter.classList.remove('maximized-splitter');
          splitter.style.display = 'block';
        }
        if (pageView) {
          pageView.style.display = 'block';
          pageView.style.flex = '1';
        }
        renderInspectorDock();
        toast('已按 Esc 退出全屏独占，还原 60% 停靠');
      } else {
        closeInspectorDock();
        toast('已按 Esc 关闭请求透视器，并自动恢复左右侧栏');
      }
    }
  });

  // 全局简便别名
  window.openInspectorDock = openInspectorDock;
  window.closeInspectorDock = closeInspectorDock;
  window.toggleInspectorDock = toggleInspectorDock;

  // DOM 就绪后挂载拖拽器
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSplitterDragger);
  } else {
    setTimeout(initSplitterDragger, 100);
  }
})();
