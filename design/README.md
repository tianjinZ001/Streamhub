# Handoff: StreamHub / 流枢 —— Streamax 内部 AI 能力库

## Overview
StreamHub 是 Streamax 的内部 AI 能力库（internal AI capability hub）。它把散落在各团队的 **Skill / MCP / Agent** 沉淀到一处，让全员可以**发现、复用、评价**彼此的 AI 实践。

核心场景：
- 浏览/搜索/筛选已有的 AI 资产
- 查看资产详情（说明、安装命令、评分维度、版本历史、评价）
- 给资产打分 + 写评价
- 上传新资产（含核心文件 + 图文/文档说明）
- 排行榜（综合榜 / 上升最快 / 贡献榜 / 部门榜）
- 个人中心（我上传的 / 我收藏的）

## About the Design Files
本包内 `design/StreamHub_原型.html` 是用 **单文件 HTML 制作的设计参考原型**（含全部样式与交互逻辑，数据为写死的 mock）。它表达的是**目标外观与交互行为**，不是可直接上线的生产代码。

任务是**在目标技术栈中重新实现这些设计**，使用该工程既有的组件库与模式。如果目前还没有工程环境，建议采用下方「推荐技术栈」从零搭建。原型中所有 CSS 与 HTML 结构可以高度复用，但数据层、鉴权、文件存储、后端接口需要真实实现。

## Fidelity
**High-fidelity（hifi）**。原型为像素级稿，颜色、字号、间距、圆角、阴影、hover/active/focus 状态均为最终值。请按本文档中的设计 token 与各页说明精确还原。

---

## 推荐技术栈（若从零开始）
- **前端 + 后端一体**：Next.js（App Router）+ TypeScript + React
- **数据库 + 鉴权 + 文件存储**：Supabase（PostgreSQL + Auth + Storage），或自建 PostgreSQL + S3/MinIO
- **样式**：Tailwind CSS（原型用的是原生 CSS，token 见下方，可直接映射成 Tailwind theme）或直接沿用原型 CSS 变量
- **部署**：Vercel（前端/SSR）+ Supabase 托管；或公司内网 Docker（Next.js standalone + Postgres + MinIO + Nginx）
- **SSO**：对接公司现有身份源（OAuth2 / OIDC / LDAP / 飞书 / 企业微信）。原型里的「SSO 登录」按钮为占位，需替换为真实登录跳转。

---

## Screens / Views

原型是 SPA，通过 `goPage(name)` 在以下页面间切换。建议在 Next.js 中映射为对应路由。

### 1. Landing / 登录页 (`#login-screen`)
- **路由建议**：`/` （未登录时）
- **Purpose**：品牌入口 + SSO 登录
- **Layout**：全屏暗色背景 `#0a111c`，两径向渐变光晕。顶部 nav（logo + 「StreamHub」+ 右上「SSO 登录 →」）；主体两栏栅格（`1.08fr .92fr`，gap 72px，max-width 1180px）：左为文案，右为悬浮的资产卡片预览；底部一行制作者署名。
- **左栏组件**：
  - eyebrow 胶囊标签：`● STREAMAX 内部 AI 能力库`，蓝点 `#3b8bff`
  - 主标题：`Stream Hub` 白色 + ` / 流枢` 半透明白 `rgba(255,255,255,.42)`，`clamp(34px,3.8vw,52px)`，weight 700，letter-spacing -.02em
  - 副标语（蓝）：`让团队的 AI 能力，自由流动起来。` 颜色 `#5fa0ff`，weight 600
  - 说明段（灰 `#9caec2`）：`"流枢"是 AI 能力的汇流中枢，名字与 Streamax 同源。它把散落在各团队的 Skill、MCP 与 Agent 沉淀到一处 —— 可发现、可复用、可评价。好的能力，不该只待在一个人的电脑里。`
  - CTA：主按钮「使用企业账号登录」(`#2b7de9`，圆角 10px，阴影 `0 8px 24px rgba(43,125,233,.32)`) + 幽灵按钮「浏览能力库」
  - 数据条：`86 个资产 / 37 位贡献者 / 4.6 平均评分`，数字用等宽字体 26px
- **右栏组件**：白色资产卡片（投影 `0 24px 60px rgba(0,0,0,.4)`，轻微旋转 `-1.5deg`），后方一张半透明叠卡 `rotate(3deg)`。内容：评分行（金星 4.9 (41)）+ 类型徽章 Skill；标题「设计稿转组件 Skill」；描述；标签；底部「更新于昨天 · 88 位同事在用」
- **Logo**：当前为纯 CSS 文字标识 —— `Streama` 白色 + `x` 绿色 `#3fb950`，Helvetica 粗体斜体。生产环境建议替换为 Streamax 官方 SVG logo。
- **底部**：`沉淀 · 发现 · 评价 —— Nick ZHAO / 赵添进 · 海外货运产品线制作`

### 2. 首页 / 浏览 (`#page-home` → 实为 browse)
- **Purpose**：浏览全部资产，筛选 + 搜索
- **Layout**：顶部 topbar（logo「S」+ StreamHub 品牌 + nav「浏览 / 排行榜」+ 搜索框 + 头像）；下方 page-head（标题 + 副标题）+ 筛选区（类型分段控件、部门、标签 chips）+ 资产卡片网格
- **资产卡片**（关键组件，复用于多处）：
  - 容器：白底，border `1px #e4e7eb`，圆角 8px，padding 14px 16px，hover 上浮 2px + 阴影 `0 1px 2px rgba(31,35,40,.05),0 4px 12px rgba(31,35,40,.04)`，点击进详情
  - **首部**：左上角评分（金色五角星 `#e3b341` + 分数 + 灰色票数）
  - **标题行**：资产名（weight 600，14.5px）+ 紧随类型徽章（Skill 蓝 / MCP 绿 / Agent 紫，见 token）
  - **描述**：13px 灰 `#697077`，min-height 38px
  - **标签**：灰底胶囊 chips
  - **底部**：分隔线上方一行「时钟图标 + 更新于 X」（时钟 `#9aa1a9`）
  - ⚠ 注意：卡片**不**显示所属团队（团队信息只在详情页展示）
- **搜索**：输入框回车触发，匹配 名称/简介/部门/标签/类型；`/` 快捷键聚焦；Esc 清空；结果页显示命中数

### 3. 资产详情 (`#page-detail`)
- **Purpose**：查看单个资产全部信息 + 打分评价
- **Layout**：返回链接；头部（类型徽章 + 名称 + 评分 + 收藏按钮 + 所属团队/作者/版本）；安装命令代码块（可复制）；详细说明区；评分维度条形图（实用性/文档清晰/安装简单/稳定好用，0-100，蓝条带 width 过渡动画）；版本历史；**评价区**
- **评价区（打分功能，重点实现）**：
  - 评分盒 `.rate-box`：灰底卡片
  - **星级选择器**：5 颗星，hover 预览（放大 1.18×）、点击选定（变金色 `#e3b341`），右侧实时显示「N 分」
  - **文本框**：placeholder = `写下你的使用体验，帮助创作者迭代版本，亦可帮助同事判断是否适合自己…`，focus 蓝色光晕
  - **提交按钮**：右对齐主按钮「提交评价」。提交后：新评价插入列表顶部；资产 `score` 按加权重算 `(score*votes + newStars)/(votes+1)`，`votes+1`；未选星级时提示「请先点击星星选择评分」
  - 已有评价列表：头像（姓名首字）+ 姓名 + 部门 + 金星分数 + 评价正文

### 4. 新建资产 (`#page-upload`)
- **Purpose**：上传新的 AI 资产
- **表单字段顺序（重要，已按使用习惯调整）**：
  1. **类型**：三选一卡片（Skill / MCP 配置 / Agent 配置），各带彩色圆点 + 副说明
  2. **名称**：单行输入
  3. **简介**：单行输入（一句话）
  4. **所属部门**：下拉
  5. **标签（可多选）**：chips 多选
  6. **详细说明**：多行文本框（支持 Markdown）+ 下方一个「上传图片 / 文档」按钮（带说明文字），上传后以缩略图（图片）或类型角标（文档）卡片展示，可单独移除。接受 `image/*,.pdf,.doc,.docx,.md,.txt`
  7. **文件 / 内容**（必填 *）：放在**最后**，醒目的大号 dropzone（上传图标 + 「点击上传 或拖拽文件到此」+ 「SKILL.md · mcp.json · agent 配置 —— 资产的核心内容」），接受核心资产文件
  - **底部操作栏** `.form-actions`：细分隔线上方右对齐，「取消」(次按钮，返回首页) + 「提交审核」(加大主按钮)
- 提交流程建议：上传到对象存储 → 创建 `status='pending'` 资产记录 → 进审核队列

### 5. 排行榜 (`#page-leaderboard`)
- **Tabs**：综合榜（默认）/ 上升最快 / 贡献榜 / 部门榜
- 综合榜/上升榜：资产行（排名 + 名称 + 进度条 + 分数）。综合排序权重 ≈ `score * log(1 + votes)`
- 贡献榜：按贡献者聚合（姓名 + 部门 + 贡献值），属公共信息
- 部门榜：带部门选择器

### 6. 个人中心 (`#page-profile`)
- **入口**：点击右上角头像（非导航栏，导航栏不含个人中心）
- **Tabs**：我上传的 / 我收藏的（**不含**月度贡献榜——贡献排名是公共信息，已并入排行榜页）

---

## Interactions & Behavior
- **页面切换**：`pageIn` 淡入动画 .28s `cubic-bezier(.4,0,.2,1)`（注意：keyframes 从 opacity .4 起，避免捕获时全透明）
- **卡片 hover**：上浮 2px + 柔和阴影
- **按钮**：hover 变深，active `scale(.97)`；过渡 .15s ease
- **搜索**：见上「搜索」；`/` 全局快捷键聚焦搜索框（输入框聚焦时不触发）
- **打分**：星级 hover 预览、点击锁定，提交后重算平均分
- **收藏**：toggle，详情页星标/心形按钮
- **进度条 / 维度条**：width `.5s` 过渡
- **Toast**：底部居中黑色提示条，淡入 .25s
- **复制安装命令**：点击复制并 toast
- **响应式**：landing 在 ≤900px 收为单栏并隐藏右侧预览卡

## State Management
真实实现所需的状态/数据：
- `currentUser`：{ name, dept, avatar }（来自 SSO）
- `assets`：列表 + 详情（含 comments、versions、dims）
- `favorites`：当前用户收藏集合
- 筛选状态：type / dept / tags / 搜索词
- 排行榜模式：overall / rising / contrib / dept(+ 选中部门)
- 上传草稿：表单字段 + 两个文件列表（main-files 核心文件、desc-files 说明附件）
- 打分草稿：draftRating + 评价文本

## Design Tokens

颜色（原型 `:root` 变量）：
- `--canvas` #ffffff，`--canvas-subtle` #fafbfc，`--canvas-inset` #f1f3f5
- `--border` #e4e7eb，`--border-muted` #eceef1
- `--fg` #1f2328，`--fg-muted` #697077，`--fg-subtle` #9aa1a9
- `--accent` #0969da，`--accent-hover` #0857b3，`--accent-subtle` #eef4fd
- `--danger` #cf222e
- 类型色：Skill `--c-skill` #0969da / bg #ddf0ff；MCP `--c-mcp` #1a7f37 / bg #dafbe1；Agent `--c-agent` #8250df / bg #f1ebff
- 星标金色 #e3b341
- Landing 暗色：底 #0a111c，主蓝 #2b7de9，标语蓝 #5fa0ff，logo 绿 #3fb950

其它 token：
- 圆角：`--radius` 8px（卡片/按钮），landing 卡片 10–14px，胶囊 2em
- 阴影：`--shadow-sm` `0 1px 1px rgba(31,35,40,.03)`；`--shadow-card` `0 1px 2px rgba(31,35,40,.05),0 4px 12px rgba(31,35,40,.04)`
- 缓动：`--ease` `cubic-bezier(.4,0,.2,1)`
- 字体：系统 UI sans（正文）+ ui-monospace（数字/命令）
- 正文 13–15.5px；卡片标题 14.5px；landing 主标题 clamp(34px,3.8vw,52px)

## Assets
- Logo：当前为纯 CSS 文字（无图片依赖）。生产请替换为 Streamax 官方矢量 logo。
- 图标：内联 SVG sprite（`<symbol>` 定义于 HTML 顶部，id 形如 `i-star`, `i-star-o`, `i-clock`, `i-upload`, `i-lock` 等）。可改用任意图标库（Lucide / Heroicons）等价替换。
- 无外部图片资源。

## Data Model（建议）
- **assets**: id, type(skill|mcp|agent), name, dept, desc, detail_md, install_cmd, version, score, votes, uses, author_id, status, created_at, updated_at
- **asset_files**: id, asset_id, kind(core|attachment), url, filename, mime
- **asset_versions**: id, asset_id, version, note, created_at
- **asset_dims**: asset_id, key, value(0-100)  // 实用性/文档清晰/安装简单/稳定好用
- **reviews**: id, asset_id, user_id, stars(1-5), text, created_at
- **favorites**: user_id, asset_id
- **tags** / **asset_tags**（多对多）
- **users**: id, name, dept, avatar（由 SSO 同步）

## API（建议）
- `GET /api/assets`（筛选/搜索/排序参数）
- `GET /api/assets/:id`
- `POST /api/assets`（含文件上传，建草稿 pending）
- `POST /api/assets/:id/reviews`（提交评分+评价，服务端重算 score/votes）
- `POST /api/assets/:id/favorite` / `DELETE`
- `GET /api/leaderboard?mode=overall|rising|contrib|dept&dept=`
- `GET /api/me`（个人中心：上传/收藏）
- 鉴权中间件对接 SSO

## Deployment
- Vercel：连接 Git 仓库自动部署；环境变量配 Supabase URL/Key + SSO 凭据
- 内网 Docker：`next build`（standalone）+ Postgres + MinIO + Nginx 反代；SSO 走公司 OIDC
- 文件存储设访问控制（内部资产不应公开可读）

## Files
- `design/StreamHub_原型.html` —— 完整高保真原型（所有页面、样式、交互、mock 数据）。直接在浏览器打开即可逐页参考；mock 数据结构（ASSETS / DEPTS / TAGS / TYPE_META）见文件内 `<script>` 顶部，可作为数据模型参照。
