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

  // ============================================================
  // 【演示模式】还没接真实公司 SSO 之前，没有 session 就自动开一个匿名 session，
  // 这样网站不用登录就能直接跑起来看效果（点赞/评分/上传都能正常用，
  // 因为匿名用户在 Supabase 里也是一个真实的 auth.users 行，RLS 照常生效）。
  //
  // 等接好真实 SSO 之后，把下面这一段换成「未登录就跳转 /login」的逻辑，
  // 具体代码见项目里的 DEPLOY.md「切换回真实登录」一节。
  // ============================================================
  if (!user) {
    await supabase.auth.signInAnonymously();
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
