// Protocol conversion and request lifecycle: no DOM, no direct localStorage access.
window.createRequestService = function({getStore, clone, equal, required, transact, database, buildRequest, rp, session}) {
  const inFlight = new Map();
  function transportFor(preview, connection) {
    const provider = connection.provider;
    const base = new URL(connection.baseUrl);
    if (!['https:', 'http:'].includes(base.protocol) || base.username || base.password || base.search) throw new Error('连接地址应为无凭据、无查询参数的 HTTP(S) 基础地址');
    const root = base.href.replace(/\/$/, ''), p = clone(preview.payload);
    const result = { protocol: provider, url: '', body: p, omittedParameters: [] };
    if (['openai', 'openai-compatible', 'custom', 'custom_openai', 'deepseek'].includes(provider)) {
      result.url = root + '/chat/completions';
      if (p.top_k !== undefined) { delete p.top_k; result.omittedParameters.push('top_k'); }
    } else if (['anthropic', 'claude'].includes(provider)) {
      result.url = root + '/messages';
      result.body = { model: p.model, max_tokens: p.max_tokens || 1024, system: p.messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n'), messages: p.messages.filter(m => m.role !== 'system') };
      // This protocol accepts a top-level system prompt only: expose this movement in preview.
      result.systemPlacement = '所有 system 段按相对顺序合并到顶层 system；深度 system 段无法保留交错位置';
      for (const k of ['temperature', 'top_p', 'top_k']) if (p[k] !== undefined) result.body[k] = p[k];
    } else if (provider === 'ollama') {
      result.url = root + '/api/chat'; result.body = { model: p.model, messages: p.messages, stream: false, options: {} };
      for (const k of ['temperature', 'top_p', 'top_k']) if (p[k] !== undefined) result.body.options[k] = p[k];
      if (p.max_tokens !== undefined) result.body.options.num_predict = p.max_tokens;
    } else throw new Error('当前真实发送未支持该协议：' + provider);
    result.body.stream = true;
    return result;
  }
  function prepareRequest(options) {
    const preview = buildRequest(options);
    const connection = required(getStore().apiConnections.find(c => c.id === preview.configuration.connectionId), 'API 连接');
    if (!connection.enabled) throw new Error('API 连接已禁用');
    if (!(connection.models || []).some(m => m.id === preview.configuration.modelId && m.enabled !== false)) throw new Error('当前模型不在连接模型目录或已禁用');
    preview.transport = transportFor(preview, connection);
    const history = options.rpSessionId ? rp(options.rpSessionId).messages : options.sessionId ? session(options.sessionId)?.messages : [];
    preview.historyAtPreview = (history || []).map(m => ({ id: m.id, by: m.by, text: m.text }));
    return transact(() => { database().requests.push(preview); return preview; });
  }
  function safeError(error, connection) {
    let message = String(error?.message || error);
    if (connection?.apiKey) message = message.split(connection.apiKey).join('[REDACTED]');
    return message.replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED]').slice(0, 500);
  }
  async function executeRequest(requestId) {
    if (inFlight.has(requestId)) return inFlight.get(requestId);
    const task = (async () => {
      let request = required(database().requests.find(r => r.id === requestId), '请求预览');
      if (request.status === 'succeeded') return clone(request);
      if (request.status === 'incomplete') throw new Error('该响应未完整结束，请调整输出额度或推理设置后重新预览');
      if (!request.transport || request.contentRemoved) throw new Error('请求正文已移除，请重新预览');
      const connection = required(getStore().apiConnections.find(c => c.id === request.configuration.connectionId), 'API 连接');
      if (!connection.enabled) throw new Error('API 连接已禁用');
      if (!equal(transportFor(request, connection), request.transport)) throw new Error('连接或协议已改变，请重新预览');
      const local = new URL(connection.baseUrl).hostname;
      if ((!connection.hasCredential && (!connection.apiKey || /demo-placeholder|not-connected/.test(connection.apiKey))) && !['localhost', '127.0.0.1', '[::1]'].includes(local)) throw new Error('请配置有效 API Key；演示占位值不能发送');
      if (connection.advanced?.proxyUrl || connection.proxyUrl || connection.advanced?.customHeaders || connection.customHeaders) throw new Error('当前浏览器发送不支持代理及自定义请求头，请在正式工程接入');
      transact(() => { request.status = 'sending'; request.execution = 'network'; request.attempts = (request.attempts || 0) + 1; delete request.error; return request; });
      try {
        const unsubscribe = studioDesktop.ai.onEvent(event => {
          if(event.requestId !== requestId) return;
          if(event.type === 'delta') request.partialResponse = (request.partialResponse || '') + event.text;
          window.dispatchEvent(new CustomEvent('studio-ai-progress', {detail:event}));
        });
        let received;
        try {
          const result = await studioDesktop.ai.execute({requestId, stream:request.transport.body.stream});
          if (!result.ok) throw Object.assign(new Error(result.error.message), {code:result.error.code});
          received = result.value;
        }
        finally { unsubscribe(); }
        const body = received;
        const text = body.choices?.[0]?.message?.content ?? body.content?.filter(v => v.type === 'text').map(v => v.text).join('\n') ?? body.message?.content;
        const finishReason = body.choices?.[0]?.finish_reason ?? body.stop_reason ?? body.done_reason ?? null;
        const incomplete = finishReason && !['stop', 'end_turn', 'stop_sequence'].includes(finishReason);
        if (incomplete) {
          const message = '模型响应未完整结束（' + finishReason + '），已保留请求记录，未写入正式历史或生成可采纳候选';
          transact(() => { request = database().requests.find(r => r.id === requestId); Object.assign(request, { status: 'incomplete', finishReason, truncated: ['length', 'max_tokens'].includes(finishReason), response: typeof text === 'string' ? text : '', usage: body.usage || null, responseModel: body.model || request.configuration.modelId, completedAt: Date.now(), error: message }); return request; });
          throw new Error(message);
        }
        if (typeof text !== 'string' || !text.trim()) throw new Error('服务未返回可用文本');
        return transact(() => { request = database().requests.find(r => r.id === requestId); request.status = 'succeeded'; request.completedAt = Date.now(); request.response = text; request.usage = body.usage || null; request.finishReason = finishReason; request.truncated = false; request.responseModel = body.model || request.configuration.modelId; return request; });
      } catch (error) {
        const message = safeError(error, connection);
        transact(() => { request = database().requests.find(r => r.id === requestId); if (request.status !== 'incomplete') request.status = error.code === 'cancelled' ? 'cancelled' : 'failed'; request.errorCode = error.code || 'request'; request.error = message; return request; });
        throw new Error(message);
      }
    })();
    inFlight.set(requestId, task);
    try { return await task; }
    catch (error) {
      const current = database().requests.find(r => r.id === requestId);
      if (current && !['failed', 'incomplete', 'cancelled'].includes(current.status)) transact(() => { current.status = 'failed'; current.error = safeError(error, getStore().apiConnections.find(c => c.id === current.configuration.connectionId)); return current; });
      throw error;
    } finally { inFlight.delete(requestId); }
  }
  async function discoverModels(connectionId) { return studioDesktop.ai.models(connectionId); }

  return {prepareRequest, executeRequest, discoverModels, isInFlight: id => id === undefined ? inFlight.size > 0 : inFlight.has(id)};
};
