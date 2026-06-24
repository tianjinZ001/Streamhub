import Link from "next/link";
import { AssetCard } from "@/components/AssetCard";
import { getHomeSections, getStats } from "@/lib/queries";

export default async function HomePage() {
  const [{ trending, latest }, stats] = await Promise.all([getHomeSections(), getStats()]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>首页</h1>
          <p>看看本周同事们都在用什么、新发布了什么。</p>
        </div>
      </div>
      <div className="stat-line">
        <b>{stats.assetCount}</b> 个资产<span className="dot-sep">·</span>
        <b>{stats.contributorCount}</b> 位贡献者<span className="dot-sep">·</span>
        <b>{stats.totalVotes}</b> 次评分<span className="dot-sep">·</span>
        平均 <b>{stats.avgScore.toFixed(1)}</b> 分
      </div>

      <div className="section-title">
        <h3>本周上升最快</h3>
        <Link href="/leaderboard">查看排行榜 →</Link>
      </div>
      <div className="grid">
        {trending.length ? (
          trending.map((a) => <AssetCard key={a.id} asset={a} />)
        ) : (
          <p style={{ color: "var(--fg-muted)" }}>还没有资产，去新建第一个吧。</p>
        )}
      </div>

      <div className="section-title">
        <h3>最新发布</h3>
        <Link href="/browse">查看全部 →</Link>
      </div>
      <div className="grid">
        {latest.length ? (
          latest.map((a) => <AssetCard key={a.id} asset={a} />)
        ) : (
          <p style={{ color: "var(--fg-muted)" }}>还没有资产。</p>
        )}
      </div>
    </div>
  );
}
