# StreamHub / 流枢

Streamax 内部 AI 能力库 —— Next.js (App Router) + Supabase 实现。

按 `design/StreamHub_原型.html`（高保真原型）与 `design/README.md`（设计 handoff 文档）实现，
样式直接复用了原型的设计 token 和 CSS（见 `src/app/globals.css`）。

**先看 [`DEPLOY.md`](./DEPLOY.md)** —— 里面有完整的本地启动 / 建 Supabase 项目 / 接 SSO / 部署到
Vercel 的步骤，以及目前还没做的部分（已知缺口）。

## 技术栈
- Next.js 15（App Router）+ TypeScript + React 19
- Supabase（Postgres + Auth + Storage），通过 `@supabase/ssr` 接入
- 原生 CSS（沿用原型变量，未引入 Tailwind）

## 功能覆盖
首页 · 浏览/搜索/筛选 · 资产详情（评分维度/评价/版本历史/收藏） · 新建资产（含文件上传到
Supabase Storage） · 排行榜（综合/好评/上升/贡献/部门） · 个人中心（我上传的/我收藏的/勋章）
