/* Creative object operations. UI ownership remains with Antigravity. */
(() => {
  const clone = value => structuredClone(value);
  const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const sameRef = (a, b) => !!a && !!b && a.type === b.type && a.id === b.id && (a.type !== 'chapter' || a.workId === b.workId);
  const id = kind => nextId(kind);
  const legacyResolveModel = getEffectiveModelConfig;
  const featureId = value => ({ discussion: 'creative_discussion', creative: 'creative_brainstorm', draft: 'novel_draft', agent: 'agent_task' })[value] || value;
  const required = (value, label) => {
    if (value === undefined || value === null) throw new Error(label + '不存在');
    return value;
  };
  function database() {
    store.creationWorkflow ??= { version: 1, workRoles: [], candidates: [], adoptions: [], requests: [] };
    return store.creationWorkflow;
  }
  function persist() {
    WorkspaceStorage.save(store);
  }
  const transact = operation => WorkspaceStorage.transact(store, operation, () => {
    roles = store.roles;
    if (store.workspaceDrafts) ui.drafts = store.workspaceDrafts.chat;
  });
  function rp(sessionId) {
    const s = required(getRpSessionById(sessionId) || database().detachedRp?.find(v => v.id === sessionId), 'RP 会话');
    s.messages ??= [];
    s.runtimeState ??= {};
    s.initialRuntimeState ??= clone(s.runtimeState);
    s.stateEvents ??= [];
    s.trials ??= [];
    s.messages.forEach(message => { message.id ??= id('message'); });
    return s;
  }
  function target(ref) {
    if (ref.type === 'role') return required(role(ref.id), '角色');
    if (ref.type === 'workRole') return required(database().workRoles.find(v => v.id === ref.id), '作品角色版本').data;
    if (ref.type === 'work') return required(workById(ref.id), '作品');
    if (ref.type === 'chapter') {
      const work = required(workById(ref.workId), '作品');
      required(chapterById(work, ref.id), '章节');
      return { text: store.chapters[ref.id] || '' };
    }
    throw new Error('未知目标类型');
  }
  const forbidden = new Set(['__proto__', 'prototype', 'constructor', 'id', 'sourceRoleId', 'workId']);
  function parts(field) {
    const keys = field.split('.');
    if (keys.some(key => !key || forbidden.has(key))) throw new Error('不可修改的字段');
    return keys;
  }
  function read(object, field) {
    return parts(field).reduce((value, key) => value?.[key], object);
  }
  function write(object, field, value) {
    const keys = parts(field);
    const last = keys.pop();
    for (const key of keys) {
      if (object[key] != null && (typeof object[key] !== 'object' || Array.isArray(object[key]))) throw new Error('字段路径中间项不是对象：' + field);
      object = Object.hasOwn(object, key) && object[key] != null ? object[key] : (object[key] = {});
    }
    object[last] = clone(value);
  }
  function createCandidate({ source, target: ref = null, content = {}, base, generatedBy = 'user', type = 'fields', nativePayload = null }) {
    const current = ref ? target(ref) : {};
    const fields = Object.keys(content);
    fields.forEach(parts);
    if (ref?.type === 'chapter' && fields.some(f => f !== 'text')) throw new Error('章节候选只支持正文 text 字段');
    if (fields.some(a => fields.some(b => b !== a && b.startsWith(a + '.')))) throw new Error('不可同时采纳父字段与其子字段');
    const baseline = base || Object.fromEntries(fields.map(field => [field, clone(read(current, field))]));
    const candidate = { id: id('candidate'), type, nativePayload: clone(nativePayload), source: clone(source), target: clone(ref), createdAt: Date.now(), content: clone(content), base: clone(baseline), status: 'pending', generatedBy, adoptedFields: [] };
    database().candidates.push(candidate);
    return candidate;
  }
  function differences(candidateId) {
    const c = required(database().candidates.find(v => v.id === candidateId), '候选');
    const current = c.target ? target(c.target) : {};
    return Object.keys(c.content).map(field => ({ field, base: clone(c.base[field]), current: clone(read(current, field)), proposed: clone(c.content[field]), conflict: !equal(read(current, field), c.base[field]), adopted: c.adoptedFields.includes(field) }));
  }
  function adopt(candidateId, fields, resolutions = {}) {
    return transact(() => {
      const c = required(database().candidates.find(v => v.id === candidateId), '候选');
      if (c.status !== 'pending' || c.archivedAt) throw new Error('候选已结束或归档');
      if (!c.target) throw new Error('请先指定采纳目标与字段映射');
      const selected = [...new Set(fields)];
      if (!selected.length) throw new Error('请选择采纳字段');
      const changes = differences(candidateId);
      const applicable = selected.map(field => required(changes.find(d => d.field === field && !d.adopted), '候选字段'));
      for (const change of applicable) {
        if (change.conflict && resolutions[change.field] !== 'overwrite') throw new Error('字段冲突：' + change.field);
      }
      const current = target(c.target);
      for (const change of applicable) write(current, change.field, change.proposed);
      if (c.target.type === 'chapter') store.chapters[c.target.id] = current.text;
      c.adoptedFields.push(...selected);
      c.status = c.adoptedFields.length === Object.keys(c.content).length ? 'adopted' : 'pending';
      const record = { id: id('adoption'), candidateId, source: clone(c.source), target: clone(c.target), createdAt: Date.now(), changes: applicable };
      database().adoptions.push(record);
      return record;
    });
  }
  function createWorkRole(workId, roleId) {
    return transact(() => {
      const work = required(workById(workId), '作品');
      const original = required(role(roleId), '角色');
      const existing = database().workRoles.find(v => v.workId === workId && v.sourceRoleId === roleId);
      if (existing) { existing.unlinked = false; work.roles = [...new Set([...(work.roles || []), roleId])]; return existing; }
      const version = { id: id('work-role'), workId, sourceRoleId: roleId, createdAt: Date.now(), data: clone(original), sourceSnapshot: clone(original) };
      database().workRoles.push(version);
      work.roles = [...new Set([...(work.roles || []), roleId])];
      return version;
    });
  }
  function branch(sessionId, messageId, title) { return transact(() => branchInternal(sessionId,messageId,title)); }
  function branchInternal(sessionId, messageId, title) {
      const parent = rp(sessionId);
      const index = parent.messages.findIndex(m => m.id === messageId);
      if (index < 0) throw new Error('分叉消息不存在');
      const child = clone(parent);
      child.id = id('rp'); child.title = title || parent.title + ' · 分支';
      child.parentSessionId = sessionId; child.forkMessageId = messageId;
      child.messages = clone(parent.messages.slice(0, index + 1));
      child.trials = [];
      child.runtimeState = clone(parent.initialRuntimeState || {});
      const included = new Set(child.messages.map(m => m.id));
      child.stateEvents = parent.stateEvents.filter(e => !e.messageId || included.has(e.messageId)).map(clone);
      child.stateEvents.forEach(e => Object.assign(child.runtimeState, clone(e.patch)));
      const roleId = Object.keys(store.rpSessions).find(key => store.rpSessions[key].some(s => s.id === sessionId));
      if (roleId) store.rpSessions[roleId].push(child); else database().detachedRp.push(child);
      child.createdAt = Date.now();
      child.branchContext = { capturedAt: Date.now(), parentTitle: parent.title, workName: workById(parent.work || parent.workId)?.title, roleName: role(roleId)?.name, note: '保留分叉消息与分叉点状态；不复制完整角色原档案' };
      return child;
  }
  function stateChange(sessionId, patch) {
    return transact(() => {
      const s = rp(sessionId);
      Object.keys(patch).forEach(parts);
      Object.assign(s.runtimeState, clone(patch));
      s.stateEvents.push({ id: id('state'), messageId: s.messages.at(-1)?.id || null, patch: clone(patch), createdAt: Date.now() });
      return s.runtimeState;
    });
  }
  function trial(sessionId, text, source = {}) {
    return transact(() => {
      const s = rp(sessionId);
      const result = { id: id('trial'), createdAt: Date.now(), text, source: clone(source), status: 'pending', baseMessageIds: s.messages.map(m => m.id), context: buildRequest({ featureKey: 'rp_chat', rpSessionId: sessionId, input: text }) };
      s.trials.push(result);
      return result;
    });
  }
  function adoptTrial(sessionId, trialId) {
    return transact(() => {
      const s = rp(sessionId), t = required(s.trials.find(v => v.id === trialId), '试演');
      if (t.status !== 'pending') throw new Error('试演已经处理');
      if (!equal(t.baseMessageIds, s.messages.map(m => m.id))) throw new Error('正式历史已变化，请重新试演');
      const message = { id: id('message'), by: 'ai', text: t.text, sourceTrialId: trialId };
      s.messages.push(message); t.status = 'adopted';
      return message;
    });
  }
  function resolveConfiguration(feature, context = {}) {
    const featureKey = featureId(feature);
    const s = context.rpSessionId ? getRpSessionById(context.rpSessionId) || database().detachedRp?.find(v => v.id === context.rpSessionId) : context.sessionId ? session(context.sessionId) : null;
    context = { ...context, workId: context.workId || s?.work || s?.workId, roleId: context.roleId || (context.rpSessionId ? Object.keys(store.rpSessions || {}).find(key => store.rpSessions[key].some(v => v.id === context.rpSessionId)) : undefined) };
    const resolved = legacyResolveModel(featureKey, context);
    const sources = Object.fromEntries(['connectionId', 'modelId', 'samplingPresetId', 'promptPresetId'].map(k => [k, 'legacy-default'])), overrides = [];
    const layers = [
      ['global', store.globalModelConfig],
      ['feature', store.featureAllocations?.[featureKey]],
      ['role', store.roleRpConfigs?.[context.roleId]?.modelOverride],
      ['work', workById(context.workId)?.modelOverride],
      ['session', s?.modelOverride]
    ];
    for (const [level, values] of layers) {
      for (const key of ['connectionId', 'modelId', 'samplingPresetId', 'promptPresetId']) {
        if (values?.[key]) {
          if (sources[key] && resolved[key] !== values[key]) overrides.push({ type: 'configuration', field: key, previous: resolved[key], value: values[key], from: sources[key], to: level });
          resolved[key] = values[key]; sources[key] = level;
        }
      }
    }
    Object.assign(resolved, getModelDisplayName(resolved.connectionId, resolved.modelId));
    resolved.sources = sources;
    resolved.overrides = overrides;
    resolved.samplingPresetName = store.generationPresets?.find(v => v.id === resolved.samplingPresetId)?.name || '未找到采样预设';
    resolved.promptPresetName = store.creativePromptPresets?.find(v => v.id === resolved.promptPresetId)?.name || '未找到提示词预设';
    resolved.levelLabel = ({ global: '全局默认', feature: '功能配置', role: '角色配置', work: '作品配置', session: '会话配置' })[sources.modelId] || resolved.levelLabel;
    if (s?.legacyModelUnresolved) resolved.legacySelection = { value: s.legacyModelUnresolved, reason: '旧值是通道别名，无法唯一映射连接和模型；本次使用上面标明的统一配置，可在现有模型下拉框重新绑定' };
    return resolved;
  }
  function buildRequest(options) {
    const context = { ...options };
    const s = options.rpSessionId ? rp(options.rpSessionId) : options.sessionId ? required(session(options.sessionId), '会话') : null;
    context.workId ||= s?.work || s?.workId;
    context.chapterId ||= s?.chapterId;
    context.roleId ||= options.rpSessionId ? Object.keys(store.rpSessions).find(key => store.rpSessions[key].some(v => v.id === options.rpSessionId)) : null;
    const featureKey = featureId(options.featureKey || 'rp_chat');
    const resolved = resolveConfiguration(featureKey, context);
    const sections = [], excluded = [];
    function add(name, source, text, messageRole = 'system') {
      if (text == null || text === '') return;
      const content = typeof text === 'string' ? text : JSON.stringify(text);
      sections.push({ name, source, content, enabled: true, triggered: true, truncated: false, position: source.type === 'message' ? 'history' : source.type === 'input' ? 'input' : 'system', conflicts: [], estimatedTokens: Math.ceil(content.length / 2), messageRole });
    }
    const preset = (store.creativePromptPresets || []).find(p => p.id === resolved.promptPresetId);
    add('全局系统提示词', { type: 'global', id: 'systemPrompt' }, store.globalSystemPrompt);
    const presetScope = ({ creative_discussion: 'discussion', creative_brainstorm: 'discussion', novel_draft: 'draft', novel_polish: 'draft', agent_task: 'agent' })[featureKey] || featureKey;
    const creative = store.creativePresets?.[presetScope];
    add('功能系统提示词', { type: 'feature', id: featureKey }, store.featureAllocations?.[featureKey]?.systemPrompt || creative?.systemPrompt);
    for (const module of creative?.modules || []) {
      if (module.enabled !== false) add(module.name, { type: 'prompt-module', id: module.id }, module.content);
      else excluded.push({ source: { type: 'prompt-module', id: module.id, name: module.name }, content: module.content, enabled: false, triggered: false, reason: '提示词模块已禁用' });
    }
    add('提示词预设', { type: 'preset', id: preset?.id }, preset?.content || preset?.prompt || preset?.systemPrompt);
    if (preset && !(preset.content || preset.prompt || preset.systemPrompt)) excluded.push({ source: { type: 'preset', id: preset.id, name: preset.name }, enabled: true, triggered: false, reason: '预设只有用途描述，没有可发送的提示词正文' });
    const roleIds = context.roleId ? [context.roleId] : s?.roles || [];
    for (const roleId of roleIds) {
      required(role(roleId), '上下文角色');
      if (creative?.refs?.role === false) { excluded.push({ source: { type: 'role', id: roleId }, enabled: false, reason: '功能配置不引用角色' }); continue; }
      const version = database().workRoles.find(v => v.workId === context.workId && v.sourceRoleId === roleId && !v.unlinked);
      add('角色资料', { type: version ? 'workRole' : 'role', id: version?.id || roleId, name: (version?.data || role(roleId))?.name }, version?.data || role(roleId));
      if (options.rpSessionId) add('角色 RP 性格配置', { type: 'role-rp', id: roleId, name: role(roleId)?.name }, store.roleRpConfigs?.[roleId]?.personality || store.rpConfigs?.[roleId]?.personality);
    }
    if (context.workId) { const work = required(workById(context.workId), '上下文作品'); add('作品资料', { type: 'work', id: context.workId, name: work.title }, work.description); }
    if (context.chapterId && creative?.refs?.chapters !== false) {
      required(chapterById(workById(context.workId), context.chapterId), '当前作品章节');
      add('章节正文', { type: 'chapter', id: context.chapterId, name: chapterById(workById(context.workId), context.chapterId)?.title }, store.chapters[context.chapterId]);
    }
    if (options.rpSessionId) add('RP 临时状态', { type: 'rp', id: s.id }, s.runtimeState);
    const persona = store.personas?.find(p => p.id === (s?.personaId || store.currentPersona)) || store.personas?.find(p => p.isDefault);
    if (options.rpSessionId && persona) {
      if (!persona.injectionPos || persona.injectionPos === 'system') add('用户身份', { type: 'persona', id: persona.id, name: persona.name }, persona.desc);
      else excluded.push({ source: { type: 'persona', id: persona.id, name: persona.name }, enabled: true, triggered: false, reason: '当前尚未实现用户身份的非 system 插入位置' });
    }
    const history = (s?.messages || []).slice(0, options.historyTo ?? s?.messages?.length);
    const from = Math.max(0, options.historyFrom || 0);
    history.slice(from).forEach((m, index) => add('历史消息', { type: 'message', id: m.id || index + from, sessionId: s.id }, m.text, ['you','user'].includes(m.by) ? 'user' : 'assistant'));
    add('当前输入', { type: 'input' }, options.input, 'user');
    const parameters = (store.generationPresets || []).find(p => p.id === resolved.samplingPresetId);
    const sampling = {};
    if (options.thinking !== undefined) {
      if (resolved.provider !== 'deepseek' || !['enabled', 'disabled'].includes(options.thinking)) throw new Error('thinking 仅支持 DeepSeek 的 enabled/disabled');
      sampling.thinking = { type: options.thinking };
      resolved.requestOverrides = { thinking: { value: options.thinking, source: 'request' } };
    }
    for (const [key, alias] of Object.entries({ temperature: 'temperature', top_p: 'topP', top_k: 'topK', max_tokens: 'maxTokens', frequency_penalty: 'frequencyPenalty', presence_penalty: 'presencePenalty' })) {
      const value = parameters?.[key] ?? parameters?.[alias] ?? parameters?.params?.[key];
      if (value !== undefined) sampling[key] = value;
    }
    if (context.chapterId && creative?.refs?.chapters === false) excluded.push({ source: { type: 'chapter', id: context.chapterId }, enabled: false, reason: '功能配置不引用章节' });
    const world = assembleWorldbooks(context, s ? {...s,messages:history} : s, options.input || '');
    if (creative?.refs?.worldInfo === false) {
      world.excluded.push(...world.sections.map(v => ({ ...v, enabled: false, reason: '功能配置不引用世界书' }))); world.sections = [];
    }
    const before = sections.findIndex(v => ['role', 'workRole'].includes(v.source.type));
    sections.splice(before < 0 ? sections.findIndex(v => ['history', 'input'].includes(v.position)) >>> 0 : before, 0, ...world.sections.filter(v => v.position === 'before_character'));
    const after = sections.findLastIndex(v => ['role', 'workRole'].includes(v.source.type));
    sections.splice(after < 0 ? sections.findIndex(v => ['history', 'input'].includes(v.position)) >>> 0 : after + 1, 0, ...world.sections.filter(v => v.position === 'after_character'));
    for (const entry of world.sections.filter(v => v.position === 'depth')) {
      const messages = sections.map((v, i) => ['history', 'input'].includes(v.position) ? i : -1).filter(i => i >= 0);
      sections.splice(messages[Math.max(0, messages.length - entry.depth)] ?? sections.length, 0, entry);
    }
    sections.forEach((v, index) => { v.order = index; v.source.name ||= v.name; });
    const conflicts = [...resolved.overrides];
    for (const roleId of roleIds) {
      const version = database().workRoles.find(v => v.workId === context.workId && v.sourceRoleId === roleId);
      if (version && !equal(version.data, role(roleId))) conflicts.push({ type: 'material', sources: [version.id, roleId], rule: '使用当前作品独立版本，原档案不覆盖作品版本' });
    }
    if (s?.stateEvents?.length) conflicts.push({ type: 'historical-state', source: s.id, rule: '临时状态作为独立上下文附加，正式档案不覆盖', changes: clone(s.stateEvents) });
    for (const conflict of conflicts) for (const section of sections) if (conflict.sources?.includes(section.source.id) || conflict.source === section.source.id) section.conflicts.push(clone(conflict));
    return { id: id('request'), createdAt: Date.now(), status: 'preview', featureKey, context: clone(context), configuration: clone(resolved), sections, excluded: [...excluded, ...world.excluded], conflicts: [...conflicts, ...world.sections.flatMap(v => v.conflicts)], historyRange: { from, to: history.length }, tokenEstimateMethod: '字符数 / 2，非模型 tokenizer', payload: { model: resolved.modelId, ...sampling, ...(options.maxTokens ? { max_tokens: options.maxTokens } : {}), messages: sections.map(s => ({ role: s.messageRole, content: s.content })) }, omitted: world.unsupported };
  }
  // Raw SillyTavern exports are retained; supported fields are normalized only while scanning.
  function worldOwner(ref) {
    if (ref.type === 'global') return store;
    if (ref.type === 'rp') return rp(ref.id);
    if (ref.type === 'session') return required(session(ref.id), '会话');
    return target(ref);
  }
  function assembleWorldbooks(context, activeSession, input) {
    const bindings = new Map(), disabled = new Set();
    const canonicalBook = bookId => store.worldInfoBooks.find(b => b.id === bookId || b.name === bookId)?.id || bookId;
    function collect(owner, source) {
      for (const binding of owner?.worldBookIds || []) {
        const bookId = canonicalBook(typeof binding === 'string' ? binding : binding.id);
        if (binding.enabled === false) disabled.add(source + ':' + bookId);
        if (!bindings.has(bookId)) bindings.set(bookId, []);
        bindings.get(bookId).push(source);
      }
      if (owner?.boundWorldBook) collect({ worldBookIds: [owner.boundWorldBook] }, source);
    }
    collect(store, 'global'); collect(workById(context.workId), 'work');
    const roleIds = context.roleId ? [context.roleId] : activeSession?.roles || [];
    for (const roleId of roleIds) {
      collect(role(roleId), 'role:' + roleId); collect(store.roleRpConfigs?.[roleId], 'role:' + roleId); collect(store.rpConfigs?.[roleId], 'role:' + roleId);
      const version = database().workRoles.find(v => v.workId === context.workId && v.sourceRoleId === roleId && !v.unlinked);
      if (version) collect(version.data, 'workRole:' + version.id);
    }
    collect(activeSession, 'session');
    const sections = [], excluded = [], unsupported = new Set(), scan = [...(activeSession?.messages || []).map(m => m.text), input];
    const pending = [], seenBooks = new Set();
    for (const [bookId, boundScopes] of bindings) {
      const scopes = [...new Set(boundScopes)].filter(scope => !disabled.has(scope + ':' + bookId));
      if (!scopes.length) { excluded.push({ source: { type: 'worldbook', id: bookId }, enabled: false, triggered: false, reason: '关联已禁用' }); continue; }
      const book = (store.worldInfoBooks || []).find(b => b.id === bookId || b.name === bookId);
      if (!book || book.archivedAt || book.enabled === false) { excluded.push({ source: { type: 'worldbook', id: bookId }, reason: !book ? '世界书不存在' : '世界书禁用或归档' }); continue; }
      if (seenBooks.has(book.id)) { pending.filter(v => v.book.id === book.id).forEach(v => v.scopes = [...new Set([...v.scopes, ...scopes])]); continue; }
      seenBooks.add(book.id);
      const entries = Array.isArray(book.entries) ? book.entries : Object.values(book.entries || {});
      entries.forEach((raw, index) => {
        const entry = { ...raw };
        const aliases = { key: 'keys', keysecondary: 'secondary_keys', order: 'insertion_order' };
        for (const [field, alias] of Object.entries(aliases)) entry[field] ??= raw[alias];
        const extensions = { excludeRecursion: 'exclude_recursion', preventRecursion: 'prevent_recursion', delayUntilRecursion: 'delay_until_recursion', matchWholeWords: 'match_whole_words', caseSensitive: 'case_sensitive', scanDepth: 'scan_depth', position: 'position', depth: 'depth', role: 'role', probability: 'probability', useProbability: 'use_probability', vectorized: 'vectorized', group: 'group', sticky: 'sticky', cooldown: 'cooldown', delay: 'delay' };
        for (const [field, alias] of Object.entries(extensions)) entry[field] ??= raw.extensions?.[alias];
        entry.selectiveLogic ??= raw.extensions?.selectiveLogic;
        entry.useProbability ??= raw.extensions?.useProbability ?? true;
        if (raw.extensions?.position != null && typeof raw.position === 'string') entry.position = raw.extensions.position;
        pending.push({ book, entry, scopes, entryId: raw.id ?? raw.uid ?? index });
      });
    }
    const activated = new Set(), recursionText = [];
    const budget = new Map();
    const maxSteps = Math.max(0, ...pending.map(v => (v.book.recursive ?? v.book.recursive_scanning) ? Math.min(10, v.book.recursiveSteps ?? 3) : 0));
    const keyList = value => Array.isArray(value) ? value : typeof value === 'string' ? value.split(',').map(v => v.trim()).filter(Boolean) : [];
    function matches(key, text, entry, book) {
      if (key.startsWith('/')) { const end = key.lastIndexOf('/'); if (end > 0) { try { return new RegExp(key.slice(1, end), key.slice(end + 1).replace(/[gy]/g, '')).test(text); } catch { return false; } } }
      if (!(entry.caseSensitive ?? book.caseSensitive)) { key = key.toLocaleLowerCase(); text = text.toLocaleLowerCase(); }
      if (!(entry.matchWholeWords ?? book.matchWholeWords)) return text.includes(key);
      const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match the vendored ST implementation, including its multiword and CJK behavior.
      return key.split(/\s+/).length > 1 ? text.includes(key) : new RegExp('(?:^|\\W)(' + escaped + ')(?:$|\\W)').test(text);
    }
    pending.sort((a, b) => Number(!!b.entry.constant) - Number(!!a.entry.constant) || (b.entry.order ?? 100) - (a.entry.order ?? 100));
    for (let step = 0; step <= maxSteps; step++) {
      let added = false;
      const recursiveScanText = recursionText.join('\n');
      for (const item of pending) {
        const { book, entry: e, entryId, scopes } = item;
        const key = book.id + ':' + entryId;
        if (activated.has(key) || item.final) continue;
        const source = { type: 'worldbook-entry', id: entryId, bookId: book.id, name: e.title || e.comment || String(entryId), scopes };
        const reject = reason => { item.final = true; excluded.push({ source, content: e.content || '', enabled: e.enabled !== false && !e.disable, triggered: false, truncated: false, reason }); };
        if (e.archivedAt || e.enabled === false || e.disable) { reject('条目禁用或归档'); continue; }
        const position = e.position ?? e.extensions?.position ?? 0;
        const positionName = ({ 0: 'before_character', 1: 'after_character', 4: 'depth', before_char: 'before_character', after_char: 'after_character', before_character: 'before_character', after_character: 'after_character', depth: 'depth' })[position];
        const missing = [];
        if (!positionName) missing.push('示例消息、作者注释或 Outlet 位置');
        if (e.group || e.sticky || e.cooldown || e.delay) missing.push('分组或时效条件');
        if (Object.entries(e).some(([k, v]) => /^match(Persona|Character|Scenario|Creator)/.test(k) && v) || Object.entries(e.extensions || {}).some(([k, v]) => /^match_(persona|character|scenario|creator)/.test(k) && v)) missing.push('角色或身份字段额外扫描');
        if (e.vectorized) missing.push('向量触发');
        if (e.useProbability && (e.probability ?? 100) !== 100) missing.push('概率触发');
        if (/\{\{/.test(e.content || '') || [...keyList(e.key || e.keys), ...keyList(e.keysecondary || e.secondaryKeys)].some(k => k.includes('{{'))) missing.push('宏展开');
        if (missing.length) { missing.forEach(v => unsupported.add(v)); reject('当前未支持：' + missing.join('、')); continue; }
        if (step && (!(book.recursive ?? book.recursive_scanning) || step > (book.recursiveSteps ?? 3) || e.excludeRecursion)) continue;
        if (step < Number(e.delayUntilRecursion || 0)) continue;
        const depth = Math.max(0, Number(e.scanDepth ?? book.scanDepth ?? book.scan_depth ?? 2));
        const text = (depth ? scan.slice(-depth) : []).join('\n') + (step ? '\n' + recursiveScanText : '');
        const primary = keyList(e.key || e.keys).some(k => matches(k, text, e, book));
        const secondary = keyList(e.keysecondary || e.secondaryKeys).map(k => matches(k, text, e, book));
        const logic = e.selectiveLogic ?? 0;
        const condition = !e.selective || !secondary.length || ({ 0: secondary.some(Boolean), 1: !secondary.every(Boolean), 2: !secondary.some(Boolean), 3: secondary.every(Boolean) })[logic];
        if (!e.constant && !(primary && condition)) continue;
        const content = String(e.content || ''), estimatedTokens = Math.ceil(content.length / 2);
        const used = budget.get(book.id) || 0;
        if (!e.ignoreBudget && used + estimatedTokens > (book.maxBudgetTokens ?? book.token_budget ?? 4096)) { reject('世界书 Token 预算不足，整条排除'); continue; }
        budget.set(book.id, used + estimatedTokens); activated.add(key); added = true;
        sections.push({ name: source.name, source, content, enabled: true, triggered: true, trigger: e.constant ? 'constant' : step ? 'recursive-keyword' : 'keyword', recursionStep: step, truncated: false, position: positionName, insertionOrder: e.order ?? 100, depth: e.depth ?? 4, conflicts: [], estimatedTokens, messageRole: ({ 0: 'system', 1: 'user', 2: 'assistant' })[e.role] || 'system' });
        if (!e.preventRecursion) recursionText.push(content);
      }
      if (!added) break;
    }
    pending.filter(v => !v.final && !activated.has(v.book.id + ':' + v.entryId)).forEach(v => excluded.push({ source: { type: 'worldbook-entry', bookId: v.book.id, id: v.entryId }, content: v.entry.content, enabled: true, triggered: false, reason: '关键词、次级条件或扫描范围未满足' }));
    sections.sort((a, b) => a.insertionOrder - b.insertionOrder);
    for (const section of sections) {
      const sameName = sections.filter(v => v !== section && v.name === section.name && v.content !== section.content);
      if (sameName.length) section.conflicts.push({ type: 'worldbook', reason: '同名条目内容不同，全部保留；非语义矛盾判定', sources: sameName.map(v => v.source) });
    }
    return { sections, excluded, unsupported: [...unsupported, '非完整 SillyTavern 引擎：未实现最少激活扩展扫描、比例预算、向量、分组、时效、宏及语义冲突识别'] };
  }

  function syncConcepts(candidates) {
    return transact(() => candidates.map(native => {
      const existing = database().candidates.find(c => c.source?.module === 'concept' && c.source.id === native.id && c.status === 'pending' && !c.target && !c.adoptedFields.length);
      if (existing) { existing.nativePayload = clone(native); return existing; }
      const same = database().candidates.find(c => c.source?.module === 'concept' && c.source.id === native.id && equal(c.nativePayload, native));
      return same || createCandidate({ type: native.type || 'character-concept', nativePayload: native, source: { module: 'concept', id: native.id }, generatedBy: native.generatedBy || 'local-demo' });
    }));
  }
  function bindCandidate(candidateId, ref, content) {
    return transact(() => {
      const c = required(database().candidates.find(v => v.id === candidateId), '候选');
      if (c.status !== 'pending' || c.adoptedFields.length) throw new Error('已处理候选不能重新指定目标，请保存独立版本');
      const current = target(ref); Object.keys(content).forEach(parts);
      c.target = clone(ref); c.content = clone(content);
      c.base = Object.fromEntries(Object.keys(content).map(field => [field, clone(read(current, field))]));
      return c;
    });
  }

  function object(ref) {
    if (ref.type === 'rp') return rp(ref.id);
    if (ref.type === 'session') return required(session(ref.id), '会话');
    if (ref.type === 'chapter') return required(chapterById(required(workById(ref.workId), '作品'), ref.id), '章节');
    if (ref.type === 'worldbook') return required(store.worldInfoBooks.find(v => v.id === ref.id), '世界书');
    if (ref.type === 'candidate') return required(database().candidates.find(v => v.id === ref.id), '候选');
    return target(ref);
  }
  function lifecycle(ref, archived) {
    return transact(() => { const value = object(ref); if (archived) value.archivedAt = Date.now(); else delete value.archivedAt; return value; });
  }
  function deletionImpact(ref) {
    if (!['role', 'work', 'chapter', 'session', 'rp', 'worldbook', 'candidate'].includes(ref.type)) throw new Error('该对象尚未提供永久删除接口');
    const value = object(ref);
    const affected = [];
    function add(type, id, relation) { affected.push({ type, id, relation }); }
    for (const w of store.works || []) {
      if (ref.type === 'role' && (w.roles || w.roleIds || []).includes(ref.id)) add('work', w.id, '角色关联');
      if (ref.type === 'work' && w.id === ref.id) (w.chapters || []).forEach(c => add('chapter', c.id, '随作品永久删除'));
    }
    for (const s of [...store.sessions, ...Object.values(store.rpSessions || {}).flat(), ...(database().detachedRp || [])]) {
      if ((ref.type === 'role' && ((s.roles || []).includes(ref.id) || (store.rpSessions[ref.id] || []).includes(s))) || (ref.type === 'work' && (s.work === ref.id || s.workId === ref.id)) || (ref.type === 'chapter' && s.chapterId === ref.id) || (ref.type === 'rp' && s.parentSessionId === ref.id)) add('session', s.id, '解除当前引用，保留历史对话');
    }
    database().workRoles.filter(v => ref.type === 'role' ? v.sourceRoleId === ref.id : ref.type === 'work' && v.workId === ref.id).forEach(v => add('workRole', v.id, '作品版本随对象删除'));
    const versionIds = affected.filter(v => v.type === 'workRole').map(v => v.id);
    database().candidates.filter(c => c.target && (sameRef(c.target, ref) || ref.type === 'work' && c.target.workId === ref.id || c.target.type === 'workRole' && versionIds.includes(c.target.id))).forEach(c => add('candidate', c.id, '解除目标并归档候选'));
    return { ref: clone(ref), name: value.name || value.title || ref.id, affected, retention: '保留既有对话消息、试演文本、候选提议字段和已采纳字段记录；删除角色完整快照、相关请求正文及作品角色副本。历史关联只保留名称与对象类型，角色原档案不会完整隐藏保留。' };
  }
  function permanentlyDelete(ref, confirmedImpact) {
    if (!equal(deletionImpact(ref), confirmedImpact)) throw new Error('请先查看最新删除影响并确认');
    if (isInFlight()) throw new Error('有请求进行中，请等待结束后删除关联对象');
    return transact(() => {
      const report = deletionImpact(ref), old = object(ref), db = database();
      const removedVersions = db.workRoles.filter(v => ref.type === 'role' ? v.sourceRoleId === ref.id : ref.type === 'work' && v.workId === ref.id).map(v => v.id);
      const removedChapters = ref.type === 'work' ? (old.chapters || []).map(c => c.id) : ref.type === 'chapter' ? [ref.id] : [];
      const matchesRef = r => r && (sameRef(r, ref) || r.type === 'workRole' && removedVersions.includes(r.id) || r.type === 'chapter' && removedChapters.includes(r.id));
      const historical = { type: ref.type, name: report.name, deletedAt: Date.now() };
      for (const s of [...store.sessions, ...Object.values(store.rpSessions || {}).flat(), ...(db.detachedRp || [])]) {
        if (report.affected.some(a => a.type === 'session' && a.id === s.id)) (s.deletedLinks ??= []).push(clone(historical));
        if (ref.type === 'role') { s.roles = (s.roles || []).filter(v => v !== ref.id); delete s.roleSnapshots?.[ref.id]; }
        if (ref.type === 'work') { if (s.work === ref.id) delete s.work; if (s.workId === ref.id) delete s.workId; }
        if (removedChapters.includes(s.chapterId)) delete s.chapterId;
        if (ref.type === 'rp' && s.parentSessionId === ref.id) { delete s.parentSessionId; delete s.forkMessageId; }
        if (s.roleProposal?.roleId === ref.id && ref.type === 'role') delete s.roleProposal;
        s.proposals = (s.proposals || []).filter(p => !removedChapters.includes(p.chapterId));
        if (report.affected.some(a => a.type === 'session' && a.id === s.id)) for (const t of s.trials || []) delete t.context;
      }
      for (const c of db.candidates) {
        if (matchesRef(c.target)) { c.deletedTarget = historical; c.target = null; c.status = 'archived'; c.base = {}; }
        if (c.source?.id === ref.id || removedVersions.includes(c.source?.id) || removedChapters.includes(c.source?.id)) c.source = { module: 'deleted', name: report.name };
      }
      for (const a of db.adoptions) {
        if (matchesRef(a.target)) { a.deletedTarget = historical; a.target = null; }
        if (a.source?.id === ref.id || removedVersions.includes(a.source?.id)) a.source = { module: 'deleted', name: report.name };
      }
      // Request snapshots may contain full profiles. Retain execution metadata, not hidden copies.
      db.requests.filter(r => r.context?.roleId === ref.id || r.context?.workId === ref.id || r.context?.chapterId === ref.id || r.context?.rpSessionId === ref.id || r.context?.sessionId === ref.id || r.sections?.some(s => s.source.id === ref.id || removedVersions.includes(s.source.id) || removedChapters.includes(s.source.id) || s.source.bookId === ref.id)).forEach(r => { delete r.sections; delete r.payload; delete r.transport; delete r.context; delete r.response; delete r.conflicts; delete r.excluded; delete r.historyAtPreview; r.contentRemoved = true; });
      db.workRoles = db.workRoles.filter(v => !removedVersions.includes(v.id));
      if (ref.type === 'role') {
        store.roles = store.roles.filter(v => v.id !== ref.id); roles = store.roles;
        for (const w of store.works) { w.roles = (w.roles || []).filter(v => v !== ref.id); if (w.roleIds) w.roleIds = w.roleIds.filter(v => v !== ref.id); }
        const orphaned = store.rpSessions[ref.id] || [];
        if (orphaned.length) { db.detachedRp ??= []; db.detachedRp.push(...orphaned); }
        for (const key of ['rpSessions', 'rpHistories', 'rpConfigs', 'roleRpConfigs', 'rpActivity', 'rpOpeningModes']) delete store[key]?.[ref.id];
        if (ui.role === ref.id) ui.role = 'all';
        if (ui.newRoles) ui.newRoles = ui.newRoles.filter(v => v !== ref.id);
        if (store.indexTagUndo?.mapping) store.indexTagUndo.mapping = store.indexTagUndo.mapping.filter(v => v.id !== ref.id);
        if (ui.roleId === ref.id || ui.rpRole === ref.id) { ui.roleId = roles[0]?.id; ui.rpRole = roles[0]?.id; ui.page = 'roles'; ui.rpSessionId = null; }
      }
      if (ref.type === 'work') { store.works = store.works.filter(v => v.id !== ref.id); if (ui.workId === ref.id) { ui.workId = store.works[0]?.id; ui.page = 'works'; } }
      for (const chapterId of removedChapters) { delete store.chapters[chapterId]; for (const w of store.works) w.chapters = (w.chapters || []).filter(c => c.id !== chapterId); }
      if (removedChapters.includes(ui.workChapter)) ui.workChapter = workById(ui.workId)?.chapters?.[0]?.id;
      if (ref.type === 'session') { store.sessions = store.sessions.filter(v => v.id !== ref.id); delete store.workspaceDrafts?.chat?.[ref.id]; if (ui.sessionId === ref.id) ui.sessionId = store.sessions[0]?.id; }
      if (ref.type === 'rp') { db.detachedRp = db.detachedRp.filter(v => v.id !== ref.id); for (const key of Object.keys(store.rpSessions)) { store.rpSessions[key] = store.rpSessions[key].filter(v => v.id !== ref.id); store.rpHistories[key] = store.rpSessions[key][0]?.messages || []; } delete store.rpAuxBySession?.[ref.id]; delete store.workspaceDrafts?.rp?.[ref.id]; if (ui.rpSessionId === ref.id) { ui.rpSessionId = null; ui.rpScreen = 'directory'; } }
      if (ref.type === 'worldbook') {
        store.worldInfoBooks = store.worldInfoBooks.filter(v => v.id !== ref.id);
        for (const owner of [store, ...store.roles, ...store.works, ...store.sessions, ...db.detachedRp, ...Object.values(store.roleRpConfigs || {}), ...Object.values(store.rpConfigs || {}), ...Object.values(store.rpSessions).flat(), ...db.workRoles.map(v => v.data)]) { owner.worldBookIds = (owner.worldBookIds || []).filter(v => ![ref.id, old.name].includes(typeof v === 'string' ? v : v.id)); if (owner.boundWorldBook === ref.id || owner.boundWorldBook === old.name) delete owner.boundWorldBook; }
      }
      if (ref.type === 'candidate') { db.candidates = db.candidates.filter(v => v.id !== ref.id); db.adoptions.forEach(a => { if (a.candidateId === ref.id) { delete a.candidateId; a.deletedCandidate = true; } }); }
      return report;
    });
  }

  const {prepareRequest, executeRequest, discoverModels, isInFlight} = createRequestService({
    getStore: () => store, clone, equal, required, transact, database, buildRequest, rp, session
  });
  function responseCandidate(requestId, ref, field) {
    return transact(() => {
      const request = required(database().requests.find(r => r.id === requestId && r.status === 'succeeded'), '成功响应');
      const existing = database().candidates.find(c => c.source?.module === 'request' && c.source.id === requestId && equal(c.target, ref) && Object.hasOwn(c.content, field));
      const section = request.sections.find(v => v.source.id === ref.id);
      let baseValue;
      if (section) { if (ref.type === 'chapter' || ref.type === 'work' && field === 'description') baseValue = section.content; else { try { baseValue = read(JSON.parse(section.content), field); } catch { /* Non-object sources cannot provide a field baseline. */ } } }
      if (!section) throw new Error('请求未包含此目标的资料，请重新选择目标并生成，避免覆盖请求后的修改');
      return existing || createCandidate({ source: { module: 'request', id: requestId }, target: ref, content: { [field]: request.response }, base: { [field]: baseValue }, generatedBy: 'ai', type: 'ai-response' });
    });
  }
  function commitResponse(requestId) {
    return transact(() => {
      const request = required(database().requests.find(r => r.id === requestId && r.status === 'succeeded'), '成功响应');
      if (request.committed) return request;
      const options = required(request.context, '请求上下文');
      const current = options.rpSessionId ? rp(options.rpSessionId) : required(session(options.sessionId), '会话');
      if (current.archivedAt) throw new Error('会话已归档，响应保留在请求记录中');
      if (!equal(current.messages.map(m => ({ id: m.id, by: m.by, text: m.text })), request.historyAtPreview)) throw new Error('会话历史已改变，响应已保存但未写入历史');
      if(options.rpAction){
        let target=current;
        if(options.rpAction==='retry'){
          const index=options.retryIndex;
          if(!Number.isInteger(index)||current.messages[index]?.by!=='ai')throw Error('重试目标不存在');
          if(index<current.messages.length-1){
            current.messages[index].id ||= id('message');
            const child=branchInternal(current.id,current.messages[index].id,current.title+' · 重试分支');
            target=rp(child.id);
          }
          target.messages[index]={...target.messages[index],text:request.response,requestId};
        }else if(['continue','narrator'].includes(options.rpAction)){
          target.messages.push({id:id('message'),by:'ai',text:request.response,requestId});
        }else throw Error('未知 RP 操作');
        target.preview=request.response.slice(0,90);target.updated='刚刚';
        request.committed=true;request.resultSessionId=target.id;return request;
      }
      current.messages.push({ id: id('message'), by: 'you', text: options.input, requestId }, { id: id('message'), by: 'ai', text: request.response, requestId });
      current.preview = request.response.slice(0, 90); current.updated = '刚刚';
      request.committed = true;
      return request;
    });
  }
  function worldEntries(bookId) {
    const book = object({ type: 'worldbook', id: bookId });
    return Array.isArray(book.entries) ? book.entries : Object.values(book.entries || {});
  }
  function updateWorldEntry(bookId, entryId, patch) {
    return transact(() => {
      const entry = required(worldEntries(bookId).find(e => String(e.id ?? e.uid) === String(entryId)), '世界书条目');
      const allowed = ['title', 'keys', 'secondaryKeys', 'content', 'enabled', 'constant', 'selective'];
      if (Object.keys(patch).some(k => !allowed.includes(k))) throw new Error('未知世界书表单字段');
      Object.assign(entry, clone(patch));
      if ('title' in patch && 'comment' in entry) entry.comment = patch.title;
      if ('keys' in patch && 'key' in entry) entry.key = clone(patch.keys);
      if ('secondaryKeys' in patch) { if ('keysecondary' in entry) entry.keysecondary = clone(patch.secondaryKeys); if ('secondary_keys' in entry) entry.secondary_keys = clone(patch.secondaryKeys); }
      if ('enabled' in patch && 'disable' in entry) entry.disable = !patch.enabled;
      return entry;
    });
  }
  function usesNetwork(options) {
    const config = buildRequest(options).configuration;
    const connection = store.apiConnections.find(c => c.id === config.connectionId);
    if (!connection) throw new Error('选定连接不存在');
    return ['localhost', '127.0.0.1', '[::1]'].includes(new URL(connection.baseUrl).hostname) || connection.hasCredential || !!connection.apiKey && !/demo-placeholder|not-connected/.test(connection.apiKey);
  }
  const api = {
    createBackup: () => {
      const sanitize = value => JSON.parse(JSON.stringify(value, (key, item) => /apiKey|customHeaders|proxyUrl|authorization|access_token/i.test(key) ? '' : item));
      const concept = WorkspaceStorage.getItem('st-character-concepts-v3');
      return { app: 'SillyTavern-Desktop', schemaVersion: '3.0.4', timestamp: new Date().toISOString(), store: sanitize(store), modules: { concept: concept ? JSON.stringify(sanitize(JSON.parse(concept))) : null } };
    },
    executionMode: options => { try { return usesNetwork(options) ? 'network' : 'local-demo'; } catch { return 'unavailable'; } },
    prepareRequest, executeRequest, responseCandidate, discoverModels, commitResponse, resolveConfiguration,
    archive: ref => lifecycle(ref, true), restore: ref => lifecycle(ref, false), deletionImpact, permanentlyDelete,
    listObjects: (type, options = {}) => clone((type === 'role' ? store.roles : type === 'work' ? store.works : type === 'session' ? store.sessions : type === 'rp' ? [...Object.values(store.rpSessions || {}).flat(), ...(database().detachedRp || [])] : type === 'worldbook' ? store.worldInfoBooks : type === 'chapter' ? store.works.flatMap(w => w.chapters.map(c => ({ ...c, workId: w.id }))) : []).filter(v => options.includeArchived || !v.archivedAt)),
    unlinkRole: (workId, roleId) => transact(() => { const w = required(workById(workId), '作品'); w.roles = (w.roles || []).filter(v => v !== roleId); if (w.roleIds) w.roleIds = w.roleIds.filter(v => v !== roleId); database().workRoles.filter(v => v.workId === workId && v.sourceRoleId === roleId).forEach(v => { v.unlinked = true; }); return w; }),
    bindWorldbook: (ref, bookId, enabled = true) => transact(() => { object({ type: 'worldbook', id: bookId }); const owner = worldOwner(ref); owner.worldBookIds = (owner.worldBookIds || []).filter(v => (typeof v === 'string' ? v : v.id) !== bookId); owner.worldBookIds.push({ id: bookId, enabled }); return owner.worldBookIds; }),
    unlinkWorldbook: (ref, bookId) => transact(() => {
      const owner = worldOwner(ref), book = store.worldInfoBooks.find(b => b.id === bookId);
      const ids = [bookId, book?.name].filter(Boolean);
      for (const linked of [owner, ...(ref.type === 'role' ? [store.roleRpConfigs?.[ref.id], store.rpConfigs?.[ref.id]] : [])].filter(Boolean)) {
        linked.worldBookIds = (linked.worldBookIds || []).filter(v => !ids.includes(typeof v === 'string' ? v : v.id));
        if (ids.includes(linked.boundWorldBook)) delete linked.boundWorldBook;
      }
      return owner.worldBookIds;
    }),
    importWorldbook: raw => transact(() => { const book = clone(raw); book.id = id('worldbook'); book.name ||= book.title || '导入世界书'; for (const entry of Array.isArray(book.entries) ? book.entries : Object.values(book.entries || {})) if (entry.id == null && entry.uid == null) entry.id = id('entry'); store.worldInfoBooks.push(book); return book; }),
    syncConcepts, bindCandidate,
    worldEntries: bookId => clone(worldEntries(bookId)), updateWorldEntry,
    selectWorldEntry: (bookId, entryId) => { ui.activeWorldBookId = bookId; ui.worldEntryId = entryId; render(); },
    createWorldEntry: bookId => {
      const entry = transact(() => { const book = object({ type: 'worldbook', id: bookId }); const e = { id: id('entry'), title: '新条目', keys: [], secondaryKeys: [], content: '', enabled: true, constant: false, selective: false }; if (Array.isArray(book.entries)) book.entries.push(e); else (book.entries ??= {})[e.id] = e; return e; });
      ui.worldEntryId = entry.id; render(); return entry;
    },
    archiveWorldEntry: (bookId, entryId) => { const result = transact(() => { const entry = required(worldEntries(bookId).find(e => String(e.id ?? e.uid) === String(entryId)), '世界书条目'); entry.archivedAt = Date.now(); return entry; }); render(); return result; },
    restoreWorldEntry: (bookId, entryId) => transact(() => { const entry = required(worldEntries(bookId).find(e => String(e.id ?? e.uid) === String(entryId)), '世界书条目'); delete entry.archivedAt; return entry; }),
    saveWorldEntryForm: (bookId, entryId) => {
      try { const val = key => document.getElementById('wi-' + key); const list = key => val(key).value.split(/[,，]/).map(v => v.trim()).filter(Boolean); updateWorldEntry(bookId, entryId, { title: val('title').value, keys: list('keys'), secondaryKeys: list('secondary'), content: val('content').value, enabled: val('enabled').checked, constant: val('constant').checked, selective: val('selective').checked }); render(); toast('世界书条目已保存'); } catch (error) { toast(error.message); }
    },
    importConceptRole: native => transact(() => {
      const existing = database().adoptions.find(a => a.source?.module === 'concept' && a.source.id === native.id && a.target?.type === 'role' && role(a.target.id));
      if (existing) return role(existing.target.id);
      const name = (native.narrative?.name || native.narrative?.title || '概念角色').slice(0, 32);
      const created = { id: id('role'), name, icon: name.slice(0, 1), tone: '', series: native.branch || '概念工坊探索', tags: Object.values(native.tags || {}).filter(v => typeof v === 'string'), visual: native.narrative?.description || '', desc: native.narrative?.title || name };
      store.roles.push(created); roles = store.roles;
      const c = createCandidate({ type: native.type || 'character-concept', source: { module: 'concept', id: native.id }, nativePayload: native, target: { type: 'role', id: created.id }, content: { visual: created.visual, desc: created.desc, tags: created.tags }, generatedBy: native.generatedBy || 'local-demo' });
      c.adoptedFields = Object.keys(c.content); c.status = 'adopted';
      database().adoptions.push({ id: id('adoption'), candidateId: c.id, source: clone(c.source), target: clone(c.target), createdAt: Date.now(), changes: Object.entries(c.content).map(([field, proposed]) => ({ field, current: null, proposed })) });
      return created;
    }),
    createWorkRole,
    getWorkRoles: workId => clone(database().workRoles.filter(v => v.workId === workId)),
    updateWorkRole: (versionId, patch) => transact(() => { const data = target({ type: 'workRole', id: versionId }); Object.entries(patch).forEach(([field, value]) => write(data, field, value)); return data; }),
    proposeOriginalUpdate: (versionId, fields) => transact(() => {
      const version = required(database().workRoles.find(v => v.id === versionId), '作品角色版本');
      return createCandidate({ source: { module: 'work', id: versionId }, target: { type: 'role', id: version.sourceRoleId }, content: Object.fromEntries(fields.map(f => [f, read(version.data, f)])), base: Object.fromEntries(fields.map(f => [f, read(version.sourceSnapshot, f)])) });
    }),
    createCandidate: options => transact(() => createCandidate(options)),
    compareCandidates: ids => ids.map(candidateId => ({ candidateId, differences: differences(candidateId) })),
    adoptCandidate: adopt,
    setCandidateStatus: (candidateId, status) => transact(() => { if (!['discarded', 'archived'].includes(status)) throw new Error('状态无效'); const c = required(database().candidates.find(v => v.id === candidateId), '候选'); c.status = status; return c; }),
    saveCandidateVersion: candidateId => transact(() => { const c = required(database().candidates.find(v => v.id === candidateId), '候选'); const copy = clone(c); copy.id = id('candidate'); copy.source = { module: 'candidate', id: candidateId }; copy.status = 'pending'; copy.adoptedFields = []; copy.createdAt = Date.now(); database().candidates.push(copy); return copy; }),
    provenance: ref => clone(database().adoptions.filter(a => sameRef(a.target, ref))),
    branch, stateChange,
    getRp: sessionId => clone(rp(sessionId)),
    proposeStateAdoption: (sessionId, versionId, mapping) => transact(() => {
      const s = rp(sessionId);
      return createCandidate({ source: { module: 'rp', id: sessionId }, target: { type: 'workRole', id: versionId }, content: Object.fromEntries(Object.entries(mapping).map(([field, stateKey]) => [field, required(s.runtimeState[stateKey], '状态字段')])) });
    }),
    trial, adoptTrial,
    discardTrial: (sessionId, trialId) => transact(() => { const t = required(rp(sessionId).trials.find(v => v.id === trialId), '试演'); if (t.status !== 'pending') throw new Error('试演已经处理'); t.status = 'discarded'; return t; }),
    insertTrial: (sessionId, trialId) => {
      const t = required(rp(sessionId).trials.find(v => v.id === trialId), '试演');
      if (sessionId !== ui.rpSessionId) throw new Error('请先打开对应会话');
      const input = required(document.getElementById('rpInput'), '输入框');
      input.setRangeText(t.text, input.selectionStart, input.selectionEnd, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    },
    buildRequest,
    listCandidates: () => clone(database().candidates),
    listRequests: () => clone(database().requests)
  };
  window.CreationWorkflow = api;
  installWorkflowUI({api, discoverModels, transact, required, resolveConfiguration, usesNetwork, commitResponse, buildRequest, database, persist, rp, prepareRequest, executeRequest, responseCandidate, id});
  function migrate() {
    const db = database();
    store.rpSessions ??= {};
    db.detachedRp ??= [];
    for (const c of db.candidates) { c.type ??= 'fields'; c.nativePayload ??= null; c.adoptedFields ??= []; }
    for (const s of store.sessions || []) {
      s.messages?.forEach(m => { m.id ??= id('message'); });
      if (s.model && !s.modelOverride && !s.legacyModelUnresolved) s.legacyModelUnresolved = s.model;
    }
    for (const book of store.worldInfoBooks || []) for (const entry of Array.isArray(book.entries) ? book.entries : Object.values(book.entries || {})) if (entry.id == null && entry.uid == null) entry.id = id('entry');
    db.version = 2;
    persist();
  }
  api.migrate = migrate;
  migrate();
  Object.values(store.rpSessions || {}).flat().forEach(s => rp(s.id));
  if (window.ConceptWorkbench?.getState) syncConcepts(ConceptWorkbench.getState().candidates || []);
  persist();
})();
