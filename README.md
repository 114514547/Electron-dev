# 个人创作工作室 · Electron 源码开发版

## 启动与体验

Windows 11，Node.js 22.12 或更新（推荐 Node 24），npm。首次执行 `npm install`，之后双击 **start-dev.bat**，或执行 `npm run dev`。无需前端构建。`npm start` 使用独立预览数据目录并关闭 DevTools。

依赖锁定为 Electron **43.8.10**、playwright-core **1.58.2**；SQLite 使用 Electron 内置 Node 24 的 `node:sqlite`，没有额外原生驱动和 ABI 编译步骤。保留 package-lock.json。

- `Ctrl+,` 或页面设置按钮打开当前页面内的设置弹窗，不创建第二个 Windows 窗口。
- `Ctrl+K` 保留原搜索；`Ctrl+.` 取消当前窗口发起的生成。
- `F5` 刷新，`F12` DevTools；原生菜单提供编辑、缩放和文件操作。
- 文件菜单提供完整创作备份、SQLite 导出、备份恢复及附件导入。角色图片入口支持多选，文件实际复制到应用目录。
- 关闭设置只收起页内弹窗，保留原页面及草稿。设置的放大按钮只放大页内面板；Windows 标题栏控制整个应用。主窗口记住位置与普通尺寸。

## 模块与接口

```text
04-Electron开发/
  main/index.cjs                 生命周期、原生菜单、窗口安全、附件协议
  preload/index.cjs              数据/AI/文件白名单接口及原生菜单事件
  database/workspace.cjs         SQLite Schema v1、对象映射、事务、Repository、在线备份
  services/
    credentials.cjs              Windows safeStorage 加密凭据
    ai.cjs                       主进程网络、流式协议、取消及错误分类
    files.cjs                    原生文件操作、附件、完整备份与恢复
    ipc.cjs                      调用来源检查、固定 IPC 路由
    windows.cjs                  单例窗口、几何状态、窗口生命周期
  renderer/
    index.html                   原治理版入口，保留视觉和页面结构
    governed/                    原有业务模块、模板及 CSS
    adapters/storage.js          WorkspaceStorage → SQLite
    adapters/merge.js            多窗口三方合并、原对象引用保持
    adapters/desktop.js          既有 UI → 原生服务
  scripts/start.cjs              启动并显示错误
  scripts/install-runtime.cjs    安装 Electron 运行时
  tests/desktop.cjs              原有桌面功能与关闭重启验收
  tests/engineering.cjs          第二轮迁移、AI、文件、多窗口验收
  start-dev.bat
  package.json / package-lock.json
```

开发基础仍为第一轮选用的 `ST_V3_governed_optimized.html` / `governed` 副本，没有更换为 governed-v2，也没有修改 `03-界面设计` 原目录。本轮未改变颜色、字体、布局、尺寸、组件或动效。仅调整服务调用、加载顺序、安全策略及少量原型状态说明文字。

业务逻辑留在 Renderer；SQLite、文件和网络由 Main 管理。Preload 不暴露通用 IPC、SQL、Node 或任意路径读取。数据适配暂时保留同步 IPC，兼容现有同步 `save`/事务接口；长网络调用、原生对话框和 SQLite 导出异步处理。未来大数据量编辑可以分步改为对象级异步提交，本轮没有引入新框架。

## 数据目录与迁移

日常开发目录：`%APPDATA%\CreativeStudio-Dev`，本机为：
`C:\Users\wang\AppData\Roaming\CreativeStudio-Dev`

```text
workspace.sqlite                正式创作数据（运行中可有 -wal/-shm）
credentials/*.bin                safeStorage 加密 API Key、迁移原始副本
attachments/                    导入图片及附件
recovery/before-restore-*.json   恢复或重置前的完整资料与附件副本
Chromium/                       Electron 自身浏览器会话目录
```

`npm start` 使用 `CreativeStudio-Preview`。测试只使用项目 `.test-data` 下独立合成资料。不会读取 Chrome 的用户目录。源码更新和重新安装依赖不删除 userData。

首次启动自动读取**当前 Electron**原 localStorage：先以系统凭据加密保存原始迁移副本，再迁移 SQLite，验证往返内容和外键一致性后才清理旧明文凭据。失败抛出真实错误，不以空库覆盖原始资料；下次可重试。旧 HTML 资料通过导出的 JSON 备份和“导入创作备份”接收。

Schema 使用 `PRAGMA user_version=1`；对象分别存入 `objects`（角色、作品、章节正文、会话、RP、候选、角色版本、世界书、请求等），集合顺序存入 `membership`，扩展状态和偏好存入 `fields`。已存在对象间的关系写入具有外键的 `links`。没有将工作区重新塞入单个 JSON；复杂对象内字段保留 JSON。原 ID、顺序、时间戳、归档和来源不变；旧悬空引用保留在对象资料中，不伪造关联目标。写入使用事务、结构复核和失败回滚；备份重复恢复是替换，不追加重复记录。

多窗口保存按共同基线合并不同字段/对象；同字段冲突明确报错，不静默覆盖。远端更新保留对象引用，并避免重绘正在编辑的输入框或未提交表单。设置连接草稿仍需用户保存才生效。

## AI 与凭据

Windows safeStorage 使用系统 DPAPI 保护凭据。SQLite 仅保存引用及存在标记；凭据加密验证成功后才移除明文。设置页 Key 输入框留空保留已有凭据，输入新 Key 替换。没有明文回退，不提供 Renderer 解密接口。加密文件绑定当前 Windows 用户环境，不是跨设备凭据备份。

请求路径：既有上下文构建与配置解析 → 保存实际请求预览 → Preload → Main AI 服务 → Provider。主进程从凭据库取 Key；请求预览和正文一致。支持 OpenAI 兼容（含 DeepSeek）、Anthropic Messages、Ollama；分别解析 SSE 与 NDJSON。保留全局、功能、作品及会话覆盖规则，提供流式进度、60 秒超时、取消和错误分类；取消或截断不自动采纳到正式历史。监听在请求结束时清理。请求中断后下次启动记录为 interrupted，不自动重发。

“测试格式”仍只验证配置；“获取模型”实际请求模型目录（OpenAI/Ollama），可用于非生成连通性检查。Anthropic 暂未接入模型发现。Gemini、KoboldCpp、代理及自定义请求头仍未完成协议接入，明确报错，不伪装成 OpenAI 请求。不自动发送真实付费请求。

## 备份与文件边界

- 完整 JSON 备份包含 SQLite 中的创作资料、设置与偏好、工坊状态和附件字节，**不包含 API Key 或凭据文件**。迁移到别的 Windows 环境后重新配置 Key。
- SQLite 导出通过在线备份 API 生成一致快照；它只包含数据库，**不包含附件和凭据**。跨设备迁移优先用完整 JSON。
- 恢复和重置前保存完整恢复点，覆盖旧附件前保留原字节；数据库事务失败时恢复附件。恢复完成后所有窗口重新加载。
- 附件采用 UUID 内部文件名，受限 `studio-asset://local/` 协议提供图片/文本/PDF，不能读取任意磁盘路径。单附件上限 50 MB；拖入需原生确认。
- 原生选择/保存对话框决定路径，Renderer 只能请求具体业务动作。没有通用文件浏览器或目录自动扫描。
- JSON 备份目前采用完整读取和 Base64 附件，适合当前个人工作区；很大附件库将增加内存占用，尚未做分卷或流式归档。异常断电发生在附件写入过程中可用恢复点手动恢复，不声称跨 SQLite 和文件系统具备断电原子性。

## 安全与验收

`contextIsolation=true`、`nodeIntegration=false`、`sandbox=true`、`webSecurity=true`。IPC 检查受管窗口、主 frame 和入口地址；外部网页不得调用。禁止任意导航、新窗口和 webview；外部 HTTP(S) 链接确认后交给系统浏览器。没有绕过 CORS 或关闭沙箱；附件协议显式启用 CORS，仅提供应用自己的附件。现有内联事件保留必要 CSP `unsafe-inline`，远程脚本/eval/frame/object 禁止。

执行 `npm test`，在真实 Electron 中跑两组隔离测试，本地 HTTP 模拟服务，付费请求数为 0。摘要在 `test-results/result.json`、`engineering.json`。包含启动/导航、角色创建、作品编辑、普通/RP 草稿、关闭重启、窗口缩放与 150% DPI；以及旧数据/凭据迁移、作品角色隔离、候选采纳与来源、RP 分支试演、设置同步/冲突、三协议流式/取消/认证错误、附件、备份恢复/重复导入/回滚。

原生文件服务自动测试只替换对话框选择结果，实际文件和 SQLite 写入、IPC、窗口与网络均真实执行。真实供应商服务、多显示器混合 DPI、断电恢复和全部边缘业务操作不在自动验收结论内。

## 本机运行时说明

第一轮 Electron 曾因 `node_modules\electron\dist` 继承 Low 完整性而在启动前崩溃。此前经用户授权设置为 Medium；临时 WRITE_OWNER 已移除并核实原 DACL 恢复。安装/启动脚本不会改 ACL，也不会加入 `--no-sandbox`。重新安装运行时如复现，应针对运行时目录诊断，不批量修改工作区权限。

本轮不制作安装包、不做云同步、不扩展插件系统。参考：[Node SQLite](https://nodejs.org/download/release/v24.11.0/docs/api/sqlite.html)、[Electron safeStorage](https://www.electronjs.org/docs/latest/api/safe-storage/)、[Electron 安全指南](https://www.electronjs.org/docs/latest/tutorial/security/)。

### 本轮实际验收结果（2026-11-15）

两组测试均通过，捕获到的页面异常为 0，付费请求为 0；新增图片实际解码显示、重置恢复点也已验证。已查看首页与独立设置窗口截图，保持原有样式。实际执行 start-dev.bat 后正常开发窗口打开，开发 userData 中的 workspace.sqlite 已建立，启动错误日志为空。

### 设置交互最终调整：单窗口页内弹窗

按最新确认，取消独立设置 BrowserWindow，恢复 HTML 原有设置模态框、背景遮罩以及页内放大/关闭操作。页面 show/openSettings 与原生菜单均进入主窗口内设置；移除独立窗口 IPC 和专用铺满样式，不改设置组件的配色或布局。SQLite、加密凭据、AI 和文件服务保持原接口。

`npm run test:settings` 已通过：仅一个系统窗口、设置遮罩、原生菜单入口、模型管理子弹窗、页内放大、关闭/Escape、RP 草稿保留和 SQLite 保存后刷新。截图：test-results/desktop-settings-modal.png。前文涉及多窗口的验收为第二轮历史记录，不代表当前设置交互。

本次涉及主进程和 Preload：保存工作后关闭所有旧工作室窗口，再运行 start-dev.bat；仅 F5 不足以加载修改。
### Renderer 集成修复（2026-11-17）

- 请求透视器读取当前会话真实记录；移除虚构的十轮数据、模拟发送成功和假耗时。查看预览不再写入请求历史，也不注入全局选中的角色、作品和章节。空输入保持为空，发送前检查会话和上下文变化。
- 候选保存不再默认写入第一个角色；目标不明确时要求明确关联。
- 普通会话使用独立 adapters/message-renderer.js 渲染 Markdown 与 LaTeX，原始消息不变，原始 HTML 转义且输出经过 DOMPurify。RP 的现有对白高亮保留，尚未统一富文本。
- 本地依赖位于 renderer/vendor，版本锁定；资源随项目保留。如需恢复依赖，运行 npm ci --prefix renderer/vendor --ignore-scripts。主项目依赖与 Main/Preload/IPC 未改动。
- 验证：npm test 全部通过；node tests/renderer-integration.cjs 验证 Markdown、行内/块公式、代码转义、危险 HTML 隔离，以及预览不持久化、不串用全局角色、不生成占位输入。使用隔离 Electron profile 和本地 HTTP，无真实付费请求。已查看真实窗口的透视器截图。
- 尚未接通：透视器下一轮编辑、永久保存/跨模块应用、跨轮实验对比；相关设计入口保留，但明确显示未接通，不能模拟成功。供应商推理内容、工具调用的采集与持久化，以及 API 编辑态模型发现涉及当前 AGENTS 排除的底层服务/IPC，未擅自修改。既有被污染的历史记录没有自动删除。

### 核心 AI 工作流接通（2026-11-18）

- 普通会话与 RP 发送统一走真实请求；连接无效会报错并保留输入，不再自动生成本地演示回复。角色字段候选在无有效连接时也不会生成演示候选。
- 标签库「分析修改意图」使用已配置的讨论模型，校验结构化操作后预览；确认前不修改标签库。非法 JSON 或操作结构不生效。
- 概念工坊：打开「整轮 AI 探索任务」→「使用已配置模型生成」→查看结果→「导入探索结果」。AI 模式点击生成后会进入探索窗口；本地抽样仍保留。请求完成不自动写正式角色或标签库，继续复用原有候选校验与采纳。导入 AI 候选来源不再标为 local-demo。
- RP 四档推演使用当前会话真实上下文；试演再次请求模型，结果独立保存，明确采纳才写入历史。生成期间历史发生变化则拒绝采纳过期试演。旧本地方向明确标注。修复异步请求事务替换状态对象后结果写入旧引用的问题。
- 新增 tests/ai-workflows.cjs：本地 HTTP + 隔离 Electron，验证标签请求/预览/采纳、非法输出隔离、四方向生成、试演历史隔离、采纳与刷新持久化、概念真实请求后预览及显式导入。npm test 完整回归通过。未调用真实付费供应商。
- 仍未完成：透视器临时编辑/永久保存/跨轮比较、供应商推理及工具调用记录持久化、RP 富文本统一、模型发现编辑态及选择导入的完整适配。透视器相关入口已显示未接入；不宣称全软件全部功能已验收。当前只支持现有请求服务已支持的供应商协议；其他协议会明确报错。

### RP 消息操作与直接 AI 候选（2026-11-18）

- 重试/续写/旁白已接入真实请求，删除固定演示回复。重试请求仅包含目标回复前的历史；最后一条成功后替换，中间消息成功后创建重试分支，原会话后续消息保留。失败或历史变化不覆盖原文，原回复也保存在请求快照。续写和旁白只追加模型回复，不向正式历史插入操作指令。
- AI 自由/协作的「生成一轮」直接请求 concept_desc_gen 配置并显示经过校验的候选卡片，不再打开 JSON 窗口。后台准备的本地标签不当作生成成功；整个模型结果有效后才发布候选，缺项/非法 JSON/条件已修改均保留原候选。手动任务导入窗口继续作为高级入口。
- 新增验证：三个 RP 操作、历史重试分支、直接 AI 候选、空响应与非法 JSON 不覆盖原数据、候选刷新恢复。tests/ai-workflows.cjs 与 npm test 通过；本地 HTTP+隔离 Electron，未调用真实付费 API。已检查候选页面截图。现有演示历史不自动删除，dotnet 崩溃不属于本次修改范围。

### 概念生成长度限制修复（2026-11-18）

直接 AI 生成每批最多 2 张候选，按整轮数量顺序请求；任务级 max_tokens 至少 8192，保留更高的已有配置，不修改全局预设。按钮显示批次与完成数，每批通过全部校验后立即保存。后续批次截断、JSON 无效或条件变化时停止，保留已保存成果并报告数量；不自动重试。供应商仍可能有自己的输出/推理/上下文限制，因此不能保证所有模型均不截断。

专项 Electron 测试验证 4/16 组分别发送 2/8 次请求、较长 JSON、第二批 length 截断保留首批且刷新恢复；原有工作流测试及 npm test 通过。本轮未发送真实付费请求。

### 空状态与统一视觉词库（2026-11-19）

- 空 API 连接库不补种演示连接，修复空目录反复初始化导致的递归；工坊初始化、重新进入时不自动生成候选。
- 标签点选、工坊词条库、概率面板共用 store.tagItems；visual-tag-bridge.js 将旧组件的数组视图转换为同一视觉标签库的增删改与权重操作，保留稳定标签 ID 和说明。工坊不再持久化独立的词库/权重副本；默认固定/排除条件为空。未调整布局和新空状态 UI。
- 已按授权、不备份地清空 CreativeStudio-Dev：38 条视觉标签、12 条统一候选、4 条工坊候选及固定/排除/词库缓存。角色、小说、真实连接与凭据未动。该目录数量与用户截图 390 条不符，不能宣称截图实例已被清理；Preview 目录未动。
- empty-library.cjs 与 npm test 通过，验证空库刷新不补种、词库修改/权重/删除持久化和空库窗口；ai-workflows.cjs 已验证统一词库下原有 AI/RP 流程。

### Markdown 消息适配（2026-11-19）
- 普通会话与 RP 共用现有 marked / DOMPurify / KaTeX 渲染链；RP 不再对原始字符串进行易冲突的正则 HTML 替换。
- 支持标题、强调、列表、引用、表格、代码及公式；RP 对白与动作保留既有样式类，代码和公式不参与动作匹配。不修改 CSS 或存储中的消息原文。
- 验证：`node tests/renderer-integration.cjs` 与 `npm test` 通过，使用隔离 Electron 数据和本地测试服务，未调用付费 API。
