"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

/**
 * 点击后跳转到 Supabase Auth 的 OAuth/OIDC 登录流程。
 * provider 对应在 Supabase Dashboard > Authentication > Providers 里启用的那个。
 * 如果公司用的是飞书 / 企业微信 / 自建 OIDC（不在 Supabase 内置 provider 列表里），
 * 需要在 Supabase 里配置「Custom OIDC Provider」，provider 值固定写 "oidc"，
 * 详见 DEPLOY.md「接入公司 SSO」一节。
 */
export function SsoButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const supabase = createClient();
    const provider = (process.env.NEXT_PUBLIC_SSO_PROVIDER || "azure") as
      | "azure"
      | "google"
      | "oidc"
      | "okta";
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/auth/callback?next=/home` },
    });
  }

  return (
    <button className={className} onClick={handleLogin} disabled={loading}>
      {loading ? "正在跳转登录…" : children}
    </button>
  );
}
