# StreamHub · 流枢

> **Streamax 内部 AI 能力共享平台** —— 让每一个人做出来的 AI 工具都能被找到、被用起来、被持续打磨。

---

## 这是什么

StreamHub 是为 **锐明技术（Streamax）** 定制开发的一套内部 AI 能力库平台。

公司里不同团队、不同同事都在尝试用 AI 解决各自领域的问题——有人写了提示词模板，有人封装了工作流，有人做了小工具。但这些成果往往停留在个人电脑或小群里，别人根本不知道它存在，更谈不上复用和迭代。

StreamHub 解决的就是这个问题：**一个集中的地方，让所有人都能上传、发现、评价、收藏公司内部的 AI 资产。**

---

## 平台能做什么

| 功能 | 说明 |
|------|------|
| **浏览 & 搜索** | 按名称、描述、部门模糊搜索，按类型（技能/工具/提示词/数据集）和部门筛选 |
| **资产详情** | 查看简介、安装/使用方法、维度评分、用户评价、版本历史、相关文件 |
| **上传资产** | 填写基本信息、上传核心文件和附件，提交后直接发布供全员访问 |
| **评分 & 评价** | 对资产打星、留下文字评价，每人每个资产一条（防刷分） |
| **收藏** | 一键收藏，个人中心随时找回 |
| **排行榜** | 综合榜 / 好评榜 / 上升最快 / 贡献者榜 / 部门榜，发现最值得用的资产 |
| **个人中心** | 管理自己上传的资产、收藏列表、获得的贡献勋章 |
| **SSO 登录** | 支持对接企业身份源（Azure AD / 飞书 / 企业微信 / 自建 OIDC） |

---

## 在线体验

平台目前以**演示模式**运行：访问后无需注册或登录，系统自动创建匿名 session，浏览、上传、评分、收藏等所有功能均可直接试用。

如果你想本地把它跑起来，按下方步骤操作，5 分钟内可以看到完整界面。

---

## 本地启动

```bash
# 1. 克隆仓库
git clone https://github.com/tianjinZ001/Streamhub.git
cd Streamhub

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 打开 .env.local，填入 Supabase 项目地址和 anon key
# 没有 Supabase 项目？去 https://supabase.com 免费新建一个

# 4. 初始化数据库
# 在 Supabase SQL Editor 里执行 supabase/migrations/0001_init.sql

# 5. 启动开发服务器
npm run dev
# 打开 http://localhost:3000
```

完整的 Supabase 配置、SSO 接入、Vercel 部署步骤见 [DEPLOY.md](./DEPLOY.md)。

---

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | Next.js 15（App Router）+ React 19 + TypeScript |
| 样式 | 原生 CSS，复用高保真原型的设计 token |
| 后端 / 数据库 | Supabase（Postgres + Row Level Security） |
| 认证 | Supabase Auth，支持匿名登录 & OAuth / OIDC |
| 文件存储 | Supabase Storage（私有 bucket，签名 URL 下载） |
| 部署 | Vercel（推荐）或自托管 Docker + Nginx |

---

## 目录结构

```
src/
  app/
    login/                  登录落地页
    auth/callback/          OAuth 回调
    (app)/                  登录后页面（共享顶栏）
      home/                 首页（趋势 + 最新）
      browse/               浏览 / 搜索 / 筛选
      assets/[id]/          资产详情
      upload/               上传新资产
      leaderboard/          排行榜
      profile/              个人中心
  components/               可复用 UI 组件
  lib/                      Supabase client、数据查询、工具函数
  middleware.ts             登录态校验 + session 刷新
supabase/
  migrations/0001_init.sql  全部建表 / RLS / 触发器 / Storage bucket
design/
  StreamHub_原型.html        高保真原型（可直接在浏览器打开预览）
  README.md                 UI 设计 handoff 文档
```

---

## 关于这个项目

该平台由 **Tianjin** 独立设计并开发，交付给锐明技术（Streamax）作为内部 AI 能力共享基础设施。

如有问题或建议，欢迎提 [Issue](https://github.com/tianjinZ001/Streamhub/issues)。
