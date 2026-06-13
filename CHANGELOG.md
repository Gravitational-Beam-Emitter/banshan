## [0.4.0] - 2026-06-13
### 新增
- 流式输出（SSE）：API 响应逐 token 到达，JSON 完整即渲染，减少等待时间
- 流式进度提示：骨架屏加载时显示已接收字符数
- History 单条删除（✕ 按钮）
- KeepAlive 保持页面状态（切换路由不丢失分析结果）
- 页脚免责声明
### 修改
- api.js 增加 analyzeSymptomStream 流式函数 + JSON 格式校验
- Home.vue 骨架屏 + 流式进度 + 提前渲染逻辑

## [0.3.0] - 2026-06-13
### 新增
- History.vue：历史记录列表，点击展开详情（复用 ResultCard）
- 清空历史记录功能（二次确认）

## [0.2.0] - 2026-06-13
### 新增
- Vite 代理配置，安全转发 DeepSeek API 请求（API Key 不暴露到前端）
- api.js：封装 analyzeSymptom() 调用函数
- Home.vue 症状输入逻辑：v-model 绑定、表单校验、loading/error 状态
- ResultCard.vue：绿/黄/红三色卡片展示分析结果
- 分析结果自动保存到 localStorage 历史记录

## [0.1.0] - 2026-06-13
### 新增
- 项目初始化，Vue 3 + Vite + Tailwind CSS 脚手架
- 目录结构：frontend/src/pages、components、utils，shared/
- vue-router 路由配置（首页 /、历史记录 /history）
- DeepSeek API system prompt 模板（shared/prompts.js）
- 用户界面文本集中管理（shared/strings.js）
- 环境变量模板（.env.example）
- 项目治理方案（CLAUDE.md + docs/governance.md）
