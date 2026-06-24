import { Suspense } from "react";
import { LeaderboardTabs } from "@/components/LeaderboardTabs";
import { getLeaderboard, type LeaderboardMode } from "@/lib/queries";
import { DEPTS } from "@/lib/constants";

async function LeaderboardList({ mode, dept }: { mode: LeaderboardMode; dept?: string }) {
  const result = await getLeaderboard(mode, dept);

  if (result.kind === "contrib") {
    const rows = result.rows as any[];
    if (!rows.length) return <div className="box box-body" style={{ color: "var(--fg-muted)" }}>暂无贡献数据。</div>;
    const max = Math.max(...rows.map((r) => r.contribution_score), 1);
    return (
      <div>
        {rows.map((c, i) => (
          <div className="lb-row" key={c.user_id}>
            <div className="lb-rank">{i + 1}</div>
            <div className="lb-name">
              {c.name}
              <span className="sub">{c.dept}</span>
            </div>
            <div className="lb-bar-wrap">
              <div className="lb-bar" style={{ width: `${(c.contribution_score / max) * 100}%` }} />
            </div>
            <div className="lb-score">{c.contribution_score}</div>
          </div>
        ))}
      </div>
    );
  }

  const rows = result.rows;
  if (!rows.length) {
    return <div className="box box-body" style={{ color: "var(--fg-muted)" }}>该筛选条件下暂无资产上榜。</div>;
  }
  const scored = rows.map((a) => ({ a, composite: a.score * Math.log(1 + a.votes) }));
  const max = Math.max(...scored.map((s) => s.composite), 1);

  return (
    <div>
      {scored.map(({ a, composite }, i) => {
        const pct = mode === "rating" || mode === "dept" ? (a.score / 5) * 100 : (composite / max) * 100;
        const metric = mode === "rating" || mode === "dept" ? a.score.toFixed(1) : composite.toFixed(1);
        return (
          <a className="lb-row clickable" href={`/assets/${a.id}`} key={a.id}>
            <div className="lb-rank">{i + 1}</div>
            <div className="lb-name">
              {a.name}
              <span className="sub">{a.dept}</span>
            </div>
            <div className="lb-bar-wrap">
              <div className="lb-bar" style={{ width: `${pct}%` }} />
            </div>
            <div className="lb-score">{metric}</div>
          </a>
        );
      })}
    </div>
  );
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; dept?: string }>;
}) {
  const sp = await searchParams;
  const mode = (sp.mode || "overall") as LeaderboardMode;
  const dept = sp.dept || DEPTS[0];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>排行榜</h1>
          <p>综合分 = 平均评分 × 热度加权，避免新资产长期垫底或单凭人情刷分常年霸榜。</p>
        </div>
      </div>
      <Suspense>
        <LeaderboardTabs />
      </Suspense>
      <Suspense fallback={<p style={{ color: "var(--fg-muted)" }}>加载中…</p>}>
        <LeaderboardList mode={mode} dept={mode === "dept" ? dept : undefined} />
      </Suspense>
    </div>
  );
}
