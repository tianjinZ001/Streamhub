"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFavorite(assetId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "请先登录" };

  const { data: existing } = await supabase
    .from("favorites")
    .select("*")
    .eq("asset_id", assetId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("asset_id", assetId).eq("user_id", user.id);
    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/profile");
    return { ok: true, favorited: false };
  } else {
    await supabase.from("favorites").insert({ asset_id: assetId, user_id: user.id });
    revalidatePath(`/assets/${assetId}`);
    revalidatePath("/profile");
    return { ok: true, favorited: true };
  }
}

export async function submitReview(assetId: string, stars: number, text: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "请先登录" };
  if (!stars || stars < 1 || stars > 5) return { ok: false, message: "请先点击星星选择评分" };

  // 同一用户对同一资产只保留一条评价：再次提交即更新（upsert）
  const { error } = await supabase
    .from("reviews")
    .upsert(
      { asset_id: assetId, user_id: user.id, stars, text: text.trim() || null },
      { onConflict: "asset_id,user_id" }
    );
  if (error) return { ok: false, message: "提交失败，请稍后再试" };

  revalidatePath(`/assets/${assetId}`);
  revalidatePath("/home");
  revalidatePath("/browse");
  revalidatePath("/leaderboard");
  return { ok: true };
}
