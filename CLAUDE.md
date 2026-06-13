# 半山 Project

## Project Overview
「半山」——用户输入症状，AI 返回健康等级评估 + 解释 + 行动建议。纯 Web MVP，不做硬件，不接健康数据。目标：快速验证核心价值。

## Tech Stack
- Vue 3 + Vite（纯 SPA，不做 SSR）
- Tailwind CSS（不引入组件库）
- vue-router（Hash 模式）
- fetch（浏览器原生，不引入 axios）
- Vite 代理 → DeepSeek API（无需独立后端）
- 部署：Vercel / Netlify

## Context Tiers
- Tier 1（每次加载）：本文件
- Tier 2（按需加载）：`docs/governance.md` — 完整治理方案；`docs/architecture.md` — 架构决策
- Tier 3（忽略）：`docs/archive/` — 历史文档

## My Role & Your Role
- 我是产品负责人（PO）：提需求、验收功能、提供外部资源（API Key 等）
- 你是执行者：拆解任务、写代码、自测、汇报进度

## Core Rules
1. **单任务原则**：一次一个小任务，完成后停下汇报，等确认再继续
2. **自检原则**：每次输出代码后自动运行静态检查/测试，失败自动修复最多 3 次，仍失败则停止并报告原因
3. **人机边界**：不擅自引入第三方服务；不在代码中埋点或收集用户信息；不做超出当前范围的优化
4. **先拆解后执行**：收到需求 → 输出任务拆解清单 → 等我回复"执行"才开始写代码
5. **不确定时停下来问**，不得猜测阈值、标准、偏好

## Do NOT Introduce Unless Explicitly Requested
- 数据库（MVP 阶段用 localStorage）
- 用户系统（登录/注册/密码找回）
- 付费集成（Stripe、微信支付等）
- 复杂状态管理（Vuex/Pinia）—— MVP 用 ref/reactive 足够
- SSR、PWA、离线支持
- 新的顶层目录（先说明并获同意）

## Communication Protocol
每个回复以以下结构开头：
```
[任务进度] 当前阶段
[状态] 进行中 / 等待确认 / 阻塞
[问题] 如有
[下一步] 我需要你...
```

## My Working Style
- 回复用中文，代码注释用英文
- 先给方案，不要直接写代码
- 不确定时列出选项，不要猜测
- 重大变更前先问，小优化可以直接执行
- 不要用「Great question!」这类废话
- 文件路径用绝对路径

## Coding Conventions
- 文件头标注版本号和修改简述（格式见 `docs/governance.md`）
- 使用 named export（路由文件除外）
- 禁止 any 类型
- async/await 替代 Promise 链
- 变量名全拼，不缩写（除 id/url/ctx）
- 用户可见文本放 `shared/strings.js`
- 单行不超过 80 字符

## Memory
`MEMORY.md` 记录跨会话的关键洞察、已知陷阱和最佳实践。
每次新任务前先读取 MEMORY.md，任务后如有新发现则更新。

## Full Governance Spec
详见：`docs/governance.md` — 包含完整任务拆解规范、目录结构、测试流程、版本管理、代码风格细则
