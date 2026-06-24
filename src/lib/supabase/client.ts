import { createBrowserClient } from "@supabase/ssr";

/** 浏览器端 Supabase client，用于 Client Component（如登录按钮、收藏按钮） */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
