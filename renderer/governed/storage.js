/* Browser persistence boundary. No DOM or feature dependencies. */
window.WorkspaceStorage = (() => {
  const key = 'st-v23-demo';
  function writeJSON(storageKey, value) {
    localStorage.setItem(storageKey, JSON.stringify(value));
  }
  function load(initial) {
    const raw = [key, 'st-v22-demo', 'st-v21-demo', 'st-v2-demo']
      .map(k => localStorage.getItem(k)).find(Boolean);
    if (!raw) return structuredClone(initial);
    try {
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.sessions) || !Array.isArray(data.tagItems)) throw Error('工作区格式无效');
      return data;
    } catch (error) {
      console.warn('工作区无法读取，使用演示初始数据', error);
      return structuredClone(initial);
    }
  }
  const save = store => writeJSON(key, store);
  function restoreBackup(backup) {
    if (!backup?.store || !Array.isArray(backup.store.sessions) || !Array.isArray(backup.store.tagItems)) throw Error('无效的工作区备份');
    const writes = [[key, JSON.stringify(backup.store)]];
    if (backup.modules?.concept != null) {
      const raw = backup.modules.concept;
      const concept = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (concept?.version !== 3 || !concept.data || !Array.isArray(concept.data.candidates)) throw Error('无效的概念工坊备份');
      writes.push(['st-character-concepts-v3', JSON.stringify(concept)]);
    }
    const before = writes.map(([k]) => [k, localStorage.getItem(k)]);
    try {
      for (const [k, value] of writes) localStorage.setItem(k, value);
    } catch (error) {
      for (const [k, value] of before) {
        if (value === null) localStorage.removeItem(k);
        else localStorage.setItem(k, value);
      }
      throw error;
    }
  }
  function reset() {
    // Only this app's known keys; unrelated data on the same origin is preserved.
    for (const k of [key,'st-v22-demo','st-v21-demo','st-v2-demo',
      'st-character-concepts-v3','st-character-concepts-v2','tag-composer-prototype-v1',
      'st_codex_v31_accent','st-v23-view','st-v25-source','st-v25-activity-v1']) localStorage.removeItem(k);
  }
  function transact(store, operation, restoreAliases) {
    const before = structuredClone(store);
    try {
      const result = operation();
      const detached = structuredClone(result);
      save(store);
      return detached;
    } catch (error) {
      Object.keys(store).forEach(key => delete store[key]);
      Object.assign(store, before);
      restoreAliases();
      throw error;
    }
  }
  return Object.freeze({load, save, writeJSON, transact, restoreBackup, reset});
})();
