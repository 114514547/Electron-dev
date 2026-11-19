// Legacy UI adapters receive explicit business capabilities; no storage ownership.
window.installWorkflowUI = function({api, discoverModels, transact, required, resolveConfiguration, usesNetwork, commitResponse, buildRequest, database, persist, rp, prepareRequest, executeRequest, responseCandidate, id}) {
  const pendingSessions = new Set();
  async function sendToSession(options, rawInput, inputId) {
    const key = options.rpSessionId || options.sessionId;
    if (pendingSessions.has(key)) { toast('此会话的请求仍在进行'); return; }
    pendingSessions.add(key);
    try {
      const request = prepareRequest(options);
      toast('正在请求已配置的模型');
      await executeRequest(request.id);
      commitResponse(request.id);
      const drafts = options.rpSessionId ? store.workspaceDrafts.rp : store.workspaceDrafts.chat;
      const active = options.rpSessionId ? ui.rpSessionId === key : ui.sessionId === key;
      const input = active ? document.getElementById(inputId) : null;
      if (input?.value === rawInput) { input.value = ''; drafts[key] = ''; }
      else if (!active && drafts[key] === rawInput) drafts[key] = '';
      persist(); if (active) render(); toast('AI 响应已保存');
    } catch (error) { toast(error.message); }
    finally { pendingSessions.delete(key); }
  }
  fetchRemoteModels = async function(connectionId) {
    try {
      const models = await discoverModels(connectionId);
      transact(() => { const c = required(store.apiConnections.find(v => v.id === connectionId), '连接'); for (const model of models) if (model.id && !c.models.some(m => m.id === model.id)) c.models.push(model); c.modelsFetchedAt = Date.now(); return c; });
      if (ui.managingConnection?.id === connectionId) { ui.managingConnection = store.apiConnections.find(c => c.id === connectionId); render(); }
      toast('已从端点读取 ' + models.length + ' 个模型，保留已有模型配置');
    } catch (error) { toast(error.message); }
  };
  exportWorkspaceBackup = function() { try { download('SillyTavern-V3-Workspace-Backup-' + Date.now() + '.json', JSON.stringify(api.createBackup(), null, 2), 'application/json;charset=utf-8'); toast('已导出创作数据备份，不含 API 凭据'); } catch (error) { toast('备份失败：' + error.message); } };
  getEffectiveModelConfig = resolveConfiguration;
  changeModel = function(fullKey) {
    const model = getUnifiedModelCatalog().find(m => m.fullKey === fullKey), current = session(ui.sessionId);
    if (!model || !current) return toast('请选择连接库中的有效模型');
    transact(() => { current.modelOverride = { ...current.modelOverride, connectionId: model.connectionId, modelId: model.modelId }; current.model = model.modelId; delete current.legacyModelUnresolved; return current; });
    render(); toast('当前会话已绑定统一连接与模型');
  };
  sendRP = function () {
    const raw=document.getElementById('rpInput')?.value||'';
    if(raw.trim()) return sendToSession({featureKey:'rp_chat',rpSessionId:ui.rpSessionId,input:raw.trim()},raw,'rpInput');
  };
  sendMessage = function () {
    const raw=document.getElementById('chatinput')?.value||'';
    if(raw.trim()) return sendToSession({featureKey:'discussion',sessionId:ui.sessionId,input:raw.trim()},raw,'chatinput');
  };
  async function rpMessageAction(action,index){
    const sessionId=ui.rpSessionId;
    if(pendingSessions.has(sessionId))return toast('此会话的请求仍在进行');
    const current=rp(sessionId);
    if(action==='retry'&&current.messages[index]?.by!=='ai')return toast('请选择 AI 回复');
    pendingSessions.add(sessionId);
    try{
      const options={featureKey:'rp_chat',rpSessionId:sessionId,rpAction:action,input:action==='retry'?'请重新回答最后一条用户消息，给出新的合理演绎。':action==='continue'?'请沿当前剧情继续写下一段，不重复已有内容。':'请以第三人称旁白补充当前情境，不代替用户决定行动。'};
      if(action==='retry'){options.historyTo=index;options.retryIndex=index;}
      const request=prepareRequest(options);toast('正在生成');await executeRequest(request.id);
      const committed=commitResponse(request.id);
      if(ui.rpSessionId===sessionId){ui.rpSessionId=committed.resultSessionId||sessionId;render();}
      toast(committed.resultSessionId!==sessionId?'已在独立分支保存重试回复':'回复已保存');
    }catch(e){toast(e.message)}finally{pendingSessions.delete(sessionId)}
  }
  v3RerollRp=index=>rpMessageAction('retry',index);
  v3ContinueRp=()=>rpMessageAction('continue');
  v3SwitchNarrator=()=>rpMessageAction('narrator');
  const previousApplyChapter = applyProposal;
  applyProposal = function () {
    const p = session(ui.sessionId)?.proposals?.find(v => v.id === ui.proposalId);
    if (!p?.candidateId) return previousApplyChapter();
    try { api.adoptCandidate(p.candidateId, ['text']); p.status = 'applied'; persist(); closeModal(); render(); }
    catch (error) { toast(error.message); }
  };
  const proposalJobs = new Set();
  v22CreateProposal = async function (sessionId) {
    const discussion = session(sessionId), roleId = discussion?.roles?.[0];
    if (!discussion || !roleId) return;
    const selected = document.getElementById('v22-proposal-field')?.value || 'identity';
    const fieldPath = selected === 'visual' ? 'visual' : 'profile.' + selected;
    const options = { featureKey: 'discussion', sessionId, input: '基于已提供的角色资料与讨论，只给出 ' + selected + ' 字段的新建议正文，不修改或输出其他字段。', maxTokens: 512 };
    try {
      if (usesNetwork(options)) {
        if (proposalJobs.has(sessionId)) return toast('此会话的候选正在生成');
        proposalJobs.add(sessionId);
        try {
          const version = database().workRoles.find(v => v.workId === (discussion.work || discussion.workId) && v.sourceRoleId === roleId && !v.unlinked);
          const ref = { type: version ? 'workRole' : 'role', id: version?.id || roleId };
          const request = prepareRequest(options); toast('正在生成字段候选');
          await executeRequest(request.id);
          const c = responseCandidate(request.id, ref, fieldPath);
          transact(() => { required(session(sessionId), '会话').roleProposal = { id: id('proposal'), roleId, field: selected, old: c.base[fieldPath], proposed: c.content[fieldPath], status: 'pending', candidateId: c.id, targetLabel: version ? '当前作品版本' : '角色原始档案' }; return c; });
          if (ui.sessionId === sessionId) render(); toast('AI 候选已保存，请审阅后采纳');
        } finally { proposalJobs.delete(sessionId); }
        return;
      }
    } catch (error) { toast(error.message); return; }
    toast('请先配置可用模型，未生成演示候选');
  };
  v22DraftProposal = function(sessionId, value) {
    transact(() => { const p = required(session(sessionId)?.roleProposal, '候选'); p.proposed = value; const c = database().candidates.find(c => c.id === p.candidateId); if (c?.status === 'pending') c.content[Object.keys(c.content)[0]] = value; return p; });
  };
  const previousApplyRole = v22ApplyProposal;
  v22ApplyProposal = function (sessionId) {
    const p = session(sessionId)?.roleProposal;
    if (!p?.candidateId) return previousApplyRole(sessionId);
    try {
      const c = database().candidates.find(v => v.id === p.candidateId);
      const field = Object.keys(c.content)[0];
      if (!p.proposed.trim()) return toast('候选内容为空，请补充或放弃');
      api.adoptCandidate(c.id, [field]);
      p.status = 'applied'; persist(); render();
    } catch (error) { toast(error.message); }
  };
  const previousDiscardRole = v22DiscardProposal;
  v22DiscardProposal = function (sessionId) {
    const p = session(sessionId)?.roleProposal;
    if (p?.candidateId) api.setCandidateStatus(p.candidateId, 'discarded');
    previousDiscardRole(sessionId);
  };
  const explorationJobs = new Set();
  v3RerollDeductions = async function () {
    const sessionId=ui.rpSessionId, aux=v3GetRpAux();
    if(explorationJobs.has(sessionId))return toast('当前推演仍在生成');
    explorationJobs.add(sessionId);
    try {
      const result=await StudioTasks.json({featureKey:'rp_chat',rpSessionId:sessionId,input:'根据当前剧情提供四个真正不同的方向，依次为平稳推进、人物冲突升级、反证逆转、外部变故。仅返回 JSON：{"directions":[{"title":"标题","desc":"简短解释","action":"具体剧情走向"}]}，必须恰好四项。此为独立探索，不续写正式历史。'});
      const rows=result.data.directions;
      if(!Array.isArray(rows)||rows.length!==4||rows.some(d=>!d||['title','desc','action'].some(k=>typeof d[k]!=='string'||!d[k].trim())))throw Error('模型未返回四个完整方向，原候选保留');
      if(new Set(rows.map(d=>d.action.trim())).size!==4)throw Error('模型返回重复方向，请重试');
      store.rpAuxBySession[sessionId].deductions=rows.map((d,i)=>({...d,num:['一档','二档','三档','四档'][i],tag:['平稳推进','张力升级','破局逆转','变局重塑'][i],generatedBy:'network',requestId:result.request.id}));
      persist();if(ui.rpSessionId===sessionId)render();toast('四种方向已保存，尚未写入正式历史');
    }catch(e){toast(e.message)}finally{explorationJobs.delete(sessionId)}
  };
  v3PreviewDeduction = async function(index) {
    const sessionId=ui.rpSessionId,d=v3GetRpAux().deductions?.[index];if(!d)return;
    if(explorationJobs.has(sessionId))return toast('当前试演仍在生成');
    explorationJobs.add(sessionId);
    const base=JSON.stringify(rp(sessionId).messages);
    try {
      const request=await StudioTasks.text({featureKey:'rp_chat',rpSessionId:sessionId,input:'独立试演以下走向，输出一段可直接采纳的剧情正文，不添加解释：'+d.action});
      if(JSON.stringify(rp(sessionId).messages)!==base)throw Error('正式历史已变化，结果保留在请求记录，请重新试演');
      const trialId=api.trial(sessionId,request.response,{module:'deduction',index,requestId:request.id}).id;
      const current=store.rpAuxBySession[sessionId]?.deductions?.[index];
      if(current && current.action===d.action)current.trialId=trialId;
      persist();if(ui.rpSessionId===sessionId)render();toast('真实试演已保存，尚未写入正式历史');
    }catch(e){toast(e.message)}finally{explorationJobs.delete(sessionId)}
  };
  v3AdoptDeduction = function(index) {
    const d=v3GetRpAux().deductions?.[index];if(!d)return;
    if(!d.trialId)return toast('请先试演，审阅后再采纳');
    try{api.adoptTrial(ui.rpSessionId,d.trialId);persist();render();}catch(e){toast(e.message)}
  };
  v3DeleteRpSession = function(roleId, sessionId) {
    if (!confirm('将此会话归档？历史和关联会保留，可通过归档接口恢复。')) return;
    try { api.archive({ type: 'rp', id: sessionId }); if (ui.rpSessionId === sessionId) { ui.rpSessionId = (store.rpSessions[roleId] || []).find(s => !s.archivedAt)?.id; ui.rpScreen = 'directory'; } render(); toast('会话已归档'); } catch (error) { toast(error.message); }
  };

};
