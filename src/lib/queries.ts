import { createClient } from "./supabase/server";
import type { AssetCardData, AssetDetail, Profile } from "./types";
import type { AssetType } from "./constants";

const CARD_FIELDS = `
  id, type, name, dept, description, version, score, votes, uses,
  status, created_at, updated_at,
  asset_tags ( tags ( name ) )
`;

function mapCard(row: any): AssetCardData {
  return {
    id: row.id,
    type: row.type,
    name: row.name,
    dept: row.dept,
    description: row.description,
    version: row.version,
    score: Number(row.score),
    votes: row.votes,
    uses: row.uses,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    tags: (row.asset_tags ?? []).map((t: any) => t.tags?.name).filter(Boolean),
  };
}

/** 当前登录用户的 profile（name / dept / 是否管理员） */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("id, name, dept, avatar_url, is_admin")
    .eq("id", user.id)
    .single();
  return data as Profile | null;
}

export type BrowseFilters = {
  type?: AssetType | "all";
  dept?: string | "all";
  sort?: "hot" | "score" | "new";
  q?: string;
};

/** 浏览/搜索资产列表（仅返回已发布的） */
export async function getAssets(filters: BrowseFilters = {}): Promise<AssetCardData[]> {
  const supabase = await createClient();
  let query = supabase.from("assets").select(CARD_FIELDS).eq("status", "published");

  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.dept && filters.dept !== "all") query = query.eq("dept", filters.dept);
  if (filters.q) {
    query = query.or(
      `name.ilike.%${filters.q}%,description.ilike.%${filters.q}%,dept.ilike.%${filters.q}%`
    );
  }

  if (filters.sort === "score") query = query.order("score", { ascending: false });
  else if (filters.sort === "new") query = query.order("created_at", { ascending: false });
  // "hot"（综合排序）在数据库里没有 score*log(votes) 的现成列，取回来后在内存里排序更简单可靠
  const { data, error } = await query;
  if (error) throw error;
  const list = (data ?? []).map(mapCard);
  if (!filters.sort || filters.sort === "hot") {
    list.sort((a, b) => b.score * Math.log(1 + b.votes) - a.score * Math.log(1 + a.votes));
  }
  return list;
}

/** 首页用：本周上升最快 + 最新发布（用 created_at 近似代替"trend"，没有曝光/点击埋点前的合理简化） */
export async function getHomeSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select(CARD_FIELDS)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) throw error;
  const all = (data ?? []).map(mapCard);
  const trending = [...all].sort((a, b) => b.score * Math.log(1 + b.votes) - a.score * Math.log(1 + a.votes)).slice(0, 3);
  const latest = all.slice(0, 3);
  return { trending, latest };
}

export async function getStats() {
  const supabase = await createClient();
  const { count: assetCount } = await supabase
    .from("assets")
    .select("*", { count: "exact", head: true })
    .eq("status", "published");
  const { data: rows } = await supabase
    .from("assets")
    .select("author_id, score, votes")
    .eq("status", "published");
  const list = rows ?? [];
  const contributorCount = new Set(list.map((r: any) => r.author_id)).size;
  const totalVotes = list.reduce((s: number, r: any) => s + r.votes, 0);
  const avg = totalVotes
    ? list.reduce((s: number, r: any) => s + r.score * r.votes, 0) / totalVotes
    : 0;
  return {
    assetCount: assetCount ?? 0,
    contributorCount,
    totalVotes,
    avgScore: Math.round(avg * 10) / 10,
  };
}

/** Landing 页（未登录态）用的公开统计，走 RPC（security definer）拿聚合数字 */
export async function getPublicStats() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_stats").single();
  if (error || !data) return { assetCount: 0, contributorCount: 0, totalVotes: 0, avgScore: 0 };
  const row = data as any;
  return {
    assetCount: Number(row.asset_count) || 0,
    contributorCount: Number(row.contributor_count) || 0,
    totalVotes: Number(row.total_votes) || 0,
    avgScore: Number(row.avg_score) || 0,
  };
}

/** 资产详情：基本信息 + 部门作者 + 标签 + 维度 + 版本历史 + 评价列表 */
export async function getAssetDetail(id: string): Promise<AssetDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("assets")
    .select(`
      id, type, name, dept, description, detail_md, install_cmd, version,
      score, votes, uses, status, created_at, updated_at,
      author:profiles!assets_author_id_fkey ( id, name, dept ),
      asset_tags ( tags ( name ) ),
      asset_dims ( key, value ),
      asset_versions ( version, note, created_at )
    `)
    .eq("id", id)
    .single();
  if (error || !data) return null;

  const { data: reviewRows } = await supabase
    .from("reviews")
    .select(`
      id, stars, text, created_at,
      reviewer:profiles!reviews_user_id_fkey ( name, dept )
    `)
    .eq("asset_id", id)
    .order("created_at", { ascending: false });

  const dims: Record<string, number> = {};
  for (const d of (data as any).asset_dims ?? []) dims[d.key] = d.value;

  return {
    ...mapCard(data),
    detail_md: (data as any).detail_md,
    install_cmd: (data as any).install_cmd,
    author: (data as any).author,
    dims,
    versions: ((data as any).asset_versions ?? []).sort(
      (a: any, b: any) => +new Date(b.created_at) - +new Date(a.created_at)
    ),
    reviews: (reviewRows ?? []) as any,
  };
}

/** 我上传的（含 pending/rejected，仅本人可见） */
export async function getMyAssets(): Promise<AssetCardData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("assets")
    .select(CARD_FIELDS)
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapCard);
}

/** 我收藏的 */
export async function getMyFavorites(): Promise<AssetCardData[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase
    .from("favorites")
    .select(`assets ( ${CARD_FIELDS} )`)
    .eq("user_id", user.id);
  if (error) throw error;
  return (data ?? []).map((r: any) => mapCard(r.assets)).filter((a) => a.id);
}

export async function getMyFavoriteIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Set();
  const { data } = await supabase.from("favorites").select("asset_id").eq("user_id", user.id);
  return new Set((data ?? []).map((r: any) => r.asset_id));
}

export type LeaderboardMode = "overall" | "rating" | "rising" | "contrib" | "dept";

export async function getLeaderboard(mode: LeaderboardMode, dept?: string) {
  const supabase = await createClient();

  if (mode === "contrib") {
    const { data, error } = await supabase
      .from("contributor_leaderboard")
      .select("*")
      .order("contribution_score", { ascending: false })
      .limit(20);
    if (error) throw error;
    return { kind: "contrib" as const, rows: data ?? [] };
  }

  let query = supabase.from("assets").select(CARD_FIELDS).eq("status", "published");
  if (mode === "dept" && dept) query = query.eq("dept", dept);
  const { data, error } = await query;
  if (error) throw error;
  let list = (data ?? []).map(mapCard);

  if (mode === "rating" || mode === "dept") list.sort((a, b) => b.score - a.score);
  else list.sort((a, b) => b.score * Math.log(1 + b.votes) - a.score * Math.log(1 + a.votes));
  // "rising"（上升最快）需要历史曝光/评分增量数据，目前没有埋点，先用"近 7 天新增评分数"近似
  // TODO：接入真实埋点后替换这里的近似逻辑
  if (mode === "rising") list.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  return { kind: "asset" as const, rows: list.slice(0, 20) };
}

export async function getAssetFavoriters(assetId: string, limit = 6) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favorites")
    .select("profiles ( name )")
    .eq("asset_id", assetId)
    .limit(limit);
  if (error) return { names: [] as string[], total: 0 };
  const { count } = await supabase
    .from("favorites")
    .select("*", { count: "exact", head: true })
    .eq("asset_id", assetId);
  return {
    names: (data ?? []).map((r: any) => r.profiles?.name).filter(Boolean),
    total: count ?? 0,
  };
}

/** 个人中心头部用的统计：贡献值 / 本榜排名 / 已发布数 / 平均获评 */
export async function getMyProfileStats() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: board } = await supabase
    .from("contributor_leaderboard")
    .select("*")
    .order("contribution_score", { ascending: false });
  const rows = board ?? [];
  const idx = rows.findIndex((r: any) => r.user_id === user.id);
  const mine = idx >= 0 ? (rows[idx] as any) : null;

  const { data: myAssets } = await supabase
    .from("assets")
    .select("score, votes")
    .eq("author_id", user.id)
    .eq("status", "published");
  const totalVotes = (myAssets ?? []).reduce((s: number, a: any) => s + a.votes, 0);
  const avgScore = totalVotes
    ? (myAssets ?? []).reduce((s: number, a: any) => s + a.score * a.votes, 0) / totalVotes
    : 0;

  return {
    contributionScore: mine?.contribution_score ?? 0,
    assetsPublished: mine?.assets_published ?? 0,
    avgScore: Math.round(avgScore * 10) / 10,
    rank: idx >= 0 ? idx + 1 : null,
  };
}

export async function getAllTags(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("tags").select("name").order("id");
  return (data ?? []).map((t: any) => t.name);
}
