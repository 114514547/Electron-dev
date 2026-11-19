# Electron 项目协作规范

本目录及子目录遵循上级 [AGENTS.md](../AGENTS.md) 的双 Agent 分工、执行规则与设计规范，不在此复制维护第二套角色规则。

- Codex：内部工程负责人，可修改 Main、Preload、IPC、SQLite、服务层及 Renderer 功能逻辑；保留现有视觉设计。
- Antigravity：UI 负责人，负责 Renderer 展示与交互设计，不擅自修改核心服务、数据结构或接口约定。
- 明确授权的工程修复可直接实施；视觉改版按上级 UI 方案流程执行。
- 修改应用源码后在本目录运行 npm test；文档或规范修改不触发无关回归。
- 生产入口为 renderer/index.html；保留 governed、adapters 与其他依赖的引用关系，不覆盖原始 HTML 专项目录。
