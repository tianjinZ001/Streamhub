import Link from "next/link";
import { AssetCard } from "@/components/AssetCard";
import { getCurrentProfile, getMyAssets, getMyFavorites, getMyProfileStats } from "@/lib/queries";

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const sp = await searchParams;
  const tab = sp.tab === "fav" ? "fav" : "mine";

  const [profile, stats, mine, favs] = await Promise.all([
    getCurrentProfile(),
    getMyProfileStats(),
    getMyAssets(),
    getMyFavorites(),
  ]);
  if (!profile) return null;

  const published = mine.filter((a) => a.status === "published");
  const bestScore = published.reduce((m, a) => Math.max(m, a.score), 0);

  const badges = [
    published.length >= 1 && "首个上传",
    published.length >= 3 && "连续上传达人",
    bestScore >= 4.8 && "五星认证",
    stats?.rank === 1 && "本月之星",
  ].filter(Boolean) as string[];

  const list = tab === "fav" ? favs : mine;

  return (
    <div className="page">
      <div className="profile-head">
        <div className="av-lg">{profile.name.slice(0, 1)}</div>
        <div>
          <h1>
            {profile.name} <span className="dept">· {profile.dept}</span>
          </h1>
          <div className="profile-stats">
            <div className="pstat">
              <div className="n">{stats?.contributionScore ?? 0}</div>
              <div className="l">贡献值</div>
            </div>
            <div className="pstat">
              <div className="n">{published.length}</div>
              <div className="l">已上传</div>
            </div>
            <div className="pstat">
              <div className="n">{stats?.avgScore?.toFixed(1) ?? "0.0"}</div>
              <div className="l">平均获评</div>
            </div>
            <div className="pstat">
              <div className="n">{stats?.rank ? `#${stats.rank}` : "—"}</div>
              <div className="l">贡献榜排名</div>
            </div>
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="badge-row">
          {badges.map((b) => (
            <div className="badge" key={b}>
              <span className="dot" />
              {b}
            </div>
          ))}
        </div>
      )}

      <div className="tabs-row">
        <Link href="/profile?tab=mine" className={tab === "mine" ? "active" : ""}>
          我上传的
        </Link>
        <Link href="/profile?tab=fav" className={tab === "fav" ? "active" : ""}>
          我收藏的
        </Link>
      </div>

      {list.length ? (
        <div className="grid">
          {list.map((a) => (
            <AssetCard key={a.id} asset={a} />
          ))}
        </div>
      ) : (
        <p style={{ color: "var(--fg-muted)" }}>
          {tab === "mine" ? "还没有上传过资产，去分享你的第一个 Skill 吧。" : "还没有收藏任何资产。"}
        </p>
      )}
    </div>
  );
}
