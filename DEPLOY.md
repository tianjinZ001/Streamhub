# StreamHub / 流枢 —— 部署 & 开发指南

这是按 `design/README.md`（原始 handoff 文档）和 `design/StreamHub_原型.html`（高保真原型）实现的
Next.js + Supabase 版本。代码已经写好，但**这边的沙盒环境没有联网权限，没有跑过
`npm install` / `npm run build`**，所以请按下面步骤在你自己的电脑或 Claude Code 里跑一遍——
如果遇到个别 TypeScript 类型报错或 Supabase 查询语法报错，照着报错信息调整即可，这是正常的脚手架交付流程。

---

---

> **关于"演示模式"**：当前 `src/middleware.ts` 暂时跳过了真实登录——没有登录就自动开一个
> Supabase 匿名 session，方便你先把网站跑起来看效果（点赞/评分/上传都能正常用）。
> 等你准备好接公司 SSO 时，把 `middleware.ts` 换成下面「切换回真实登录」一节的代码即可。

## 1. 本地跑起来

```bash
npm install
cp .env.example .env.local
# 把 .env.local 里的三个 Supabase 变量填好（见下一步）
npm run dev
```

## 2. 建 Supabase 项目

1. 在 https://supabase.com 新建一个项目（选离公司机房近的区域）。
2. 进 **SQL Editor**，把 `supabase/migrations/0001_init.sql` 整个粘进去执行。
   这一步会建好所有表、触发器、RLS 策略，以及一个私有的 `asset-files` Storage bucket。
3. 进 **Settings > API**，把 `Project URL`、`anon public key` 复制到 `.env.local` 里的
   `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
   （Supabase 最近在把 anon/service_role key 改名成 publishable/secret key，新旧两种命名
   在过渡期都能用，复制哪个能用的就填哪个。）
4. `SUPABASE_SERVICE_ROLE_KEY` 这版代码暂时没用到（所有写操作都是以登录用户身份走 RLS），
   先填上以防后面要写管理后台时要用。**千万不要把这个 key 暴露到前端 / 打进 git。**
5. **演示模式额外要做一步**：进 **Authentication > Sign In / Providers**，找到
   **Anonymous Sign-Ins**，把它打开（toggle on）。这是匿名登录能用的开关，不开的话
   网站会一直转圈圈进不去。

## 3. 接入公司 SSO

原型里的"使用企业账号登录"按钮，代码里走的是 `supabase.auth.signInWithOAuth()`。
具体接哪种协议取决于你们公司的身份源：

- **如果是 Azure AD / Google Workspace / Okta 等标准 OAuth provider**：
  在 Supabase Dashboard > Authentication > Providers 里直接启用对应的，填上 Client ID/Secret，
  然后把 `.env.local` 里的 `NEXT_PUBLIC_SSO_PROVIDER` 改成对应值（如 `azure`）。
- **如果是飞书 / 企业微信 / 自建 OIDC**（大概率是这种）：
  Supabase 支持「Custom OIDC Provider」，在 Providers 页面找 **Add provider > OpenID Connect**，
  把贵司 IdP 的 issuer / client id / secret 填进去，`NEXT_PUBLIC_SSO_PROVIDER` 改成 `oidc`。
  另外要把回跳地址 `https://你的域名/auth/callback` 加到 IdP 的白名单里。
- 用户首次登录会自动建一条 `profiles` 行（`supabase/migrations/0001_init.sql` 里的
  `handle_new_user()` 触发器），姓名/部门取自 IdP 返回的 `user_metadata.name` /
  `user_metadata.dept`—— **这两个字段名需要按你们 IdP 实际返回的字段映射做调整**，
  多半要在 Supabase 的 "Auth Hook" 或 Provider 的属性映射里配一下。

## 4. 部署到 Vercel

```bash
git init && git add -A && git commit -m "init"
# 推到你们公司的 GitHub/GitLab，然后在 vercel.com 里 Import 这个仓库
```
在 Vercel 项目的 Environment Variables 里填上 `.env.local` 里的同名变量。
Build 命令、输出目录用 Next.js 默认值即可，不需要额外配置。

如果是内网 Docker 部署：`next build` 产出 standalone 输出 + Nginx 反代，
Supabase 也可以自托管（Docker Compose），具体可以参考 Supabase 官方的 self-hosting 文档。

## 5. 管理员 / 审核

这一版**没有做管理后台 UI**（README 里也没有详细规格，MVP 先跳过）。
当前的审核方式是手工 SQL：

```sql
-- 把某人设为管理员
update public.profiles set is_admin = true where id = '用户的 uuid';

-- 审核通过一个资产
update public.assets set status = 'published' where id = '资产的 uuid';
```

后面要做审核队列页面的话，思路很简单：一个 `/admin` 路由，查 `status='pending'` 的资产列一个表，
按钮调 `update assets set status=...`，照抄 `upload/actions.ts` 的写法即可。

## 6. 已知缺口 / 下一步可以做的事

- **维度评分（实用性/文档清晰/安装简单/稳定好用）**：原型的上传表单里其实没有让创作者填这四个
  维度分的输入框，所以这版上传流程也没有——目前 `asset_dims` 表对新资产是空的，详情页会显示
  "创作者还没有填写维度评分"。如果要做，思路是在上传表单加 4 个滑杆，或者让评价者在打分时顺便
  评 4 个维度（后者更符合数据真实性，但要改 `reviews` 表结构）。
- **"关注/订阅"按钮**：现在只是个 UI 占位（点了 toast 一下），没有真的存到数据库、也没有真的发通
  知。要做的话加一张 `watches(user_id, asset_id)` 表，结构照抄 `favorites` 即可。
- **排行榜"上升最快"**：现在用"最近创建时间"做了个粗糙近似。真正的"上升趋势"需要曝光/评分的时
  间序列埋点，目前数据模型里没有，先这样顶着。
- **评价机制**：原型里每次提交评价都是新增一条评论（同一人可以刷很多条好评）；这版改成了
  "每人对每个资产只保留一条评价，重复提交=更新"（数据库加了 `unique(asset_id, user_id)`），
  我认为这样更合理也更难刷分，但如果你们想保留"可以多次留言但只算最后一次评分"之类的设计，
  需要再调整 `reviews` 表结构和 `submitReview`。
- **搜索**：目前是数据库 `ilike` 模糊匹配 name/description/dept，没有走全文检索，量大了之后
  (上千条资产) 建议换成 Postgres 的 `tsvector` 全文索引或者 Supabase 的 pgvector 语义搜索。
- 文件上传到 Storage 后，目前没有在前端做"下载/预览"入口（详情页只展示了 install_cmd，
  没有列出已上传的核心文件清单）。如果需要，从 `asset_files` 表查出来，用
  `supabase.storage.from('asset-files').createSignedUrl(path, 60)` 生成临时下载链接即可
  （bucket 是私有的，不能直接拼公开 URL）。

## 7. 切换回真实登录（接公司 SSO 时再做这一步）

把 `src/middleware.ts` 整个替换成下面这版，恢复"未登录就跳 /login"的逻辑：

```ts
import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isAuthRoute = path.startsWith("/login") || path.startsWith("/auth");

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (user && path === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/home";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

然后去 Supabase Dashboard 把 Authentication > Providers 里对应的 SSO provider 配好（见上面
「接入公司 SSO」一节），再把 `.env.local` 里 `NEXT_PUBLIC_SSO_PROVIDER` 改成对应值。

## 8. 目录结构


```
src/
  app/
    login/page.tsx          落地页（未登录态）
    auth/callback/route.ts  OAuth 回调
    (app)/                  登录后的所有页面，共享 Topbar
      home/                 首页（趋势+最新）
      browse/                浏览/搜索/筛选
      assets/[id]/           详情页 + 收藏/评价 Server Actions
      upload/                新建资产表单 + Server Action
      leaderboard/           排行榜（综合/好评/上升/贡献/部门）
      profile/               个人中心
  components/                可复用 UI（卡片、表单控件、Toast 等）
  lib/
    supabase/                浏览器端 / 服务端 Supabase client
    queries.ts               所有数据读取逻辑
    constants.ts / types.ts / format.ts
  middleware.ts               登录态校验 + session 刷新
supabase/migrations/0001_init.sql   建表 + RLS + 触发器 + Storage bucket
```
