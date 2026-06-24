import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { FavoriteButton } from "@/components/FavoriteButton";
import { CopyInstallBox } from "@/components/CopyInstallBox";
import { RatingComposer } from "@/components/RatingComposer";
import { WatchButton } from "@/components/WatchButton";
import { TYPE_META } from "@/lib/constants";
import { relativeTime } from "@/lib/format";
import { getAssetDetail, getAssetFavoriters, getCurrentProfile, getMyFavoriteIds } from "@/lib/queries";

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [asset, favIds, profile] = await Promise.all([
    getAssetDetail(id),
    getMyFavoriteIds(),
    getCurrentProfile(),
  ]);
  if (!asset) notFound();

  const favoriters = await getAssetFavoriters(id, 6);
  const tm = TYPE_META[asset.type];
  const isFav = favIds.has(asset.id);

  return (
    <div className="page">
      <Link href="/browse" className="back-link">
        <Icon id="arrow-left" style={{ width: 13, height: 13 }} />
        返回浏览
      </Link>

      <div className="layout-2col">
        <div>
          <div className="detail-head">
            <div className="detail-meta">
              <span className={`type-dot ${tm.cls}`} />
              {tm.label}
              <span className="sep">·</span>
              {asset.dept}
              <span className="sep">·</span>
              <span className="mono">{asset.version}</span>
            </div>
            <h1>{asset.name}</h1>
            <div className="detail-meta">
              由 <b style={{ color: "var(--fg)", fontWeight: 500 }}>{asset.author?.name}</b> 创建 · 更新于{" "}
              {relativeTime(asset.updated_at)}
            </div>
          </div>

          <div className="section">
            <h3>简介</h3>
            <div className="md-body">{asset.detail_md || asset.description}</div>
          </div>

          <div className="section">
            <h3>评分详情</h3>
            <div className="big-score">
              <span className="num">{asset.score.toFixed(1)}</span>
              <span className="of5">/ 5</span>
              <span className="meta">
                <Icon id="star" className="ic star" />
                基于 {asset.votes} 条评价 · {asset.uses} 人使用
              </span>
            </div>
            {Object.entries(asset.dims).map(([k, v]) => (
              <div className="dim-row" key={k}>
                <span className="lbl">{k}</span>
                <div className="bar-wrap">
                  <div className="bar" style={{ width: `${v}%` }} />
                </div>
                <span className="pct">{v}%</span>
              </div>
            ))}
            {Object.keys(asset.dims).length === 0 && (
              <p style={{ color: "var(--fg-subtle)", fontSize: 12.5 }}>创作者还没有填写维度评分。</p>
            )}
          </div>

          <div className="section">
            <h3>评价（{asset.reviews.length}）</h3>
            {profile && <RatingComposer assetId={asset.id} />}
            {asset.reviews.map((c) => (
              <div className="comment" key={c.id}>
                <div className="comment-av">{c.reviewer?.name?.slice(0, 1)}</div>
                <div style={{ flex: 1 }}>
                  <div className="comment-head">
                    <b>{c.reviewer?.name}</b>
                    <span className="dept">{c.reviewer?.dept}</span>
                    <span className="rating">
                      <Icon id="star" className="ic star" />
                      {c.stars}
                    </span>
                  </div>
                  <p>{c.text || "（未填写文字评价）"}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="section">
            <h3>版本历史</h3>
            {asset.versions.length === 0 && (
              <p style={{ color: "var(--fg-subtle)", fontSize: 12.5 }}>暂无版本记录。</p>
            )}
            {asset.versions.map((v, i) => (
              <div className="meta-row" key={i}>
                <span>
                  <b>{v.version}</b> {v.note ? `— ${v.note}` : ""}
                </span>
                <span>{relativeTime(v.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="box box-body">
          <div className="action-row">
            <FavoriteButton assetId={asset.id} initialFavorited={isFav} />
            <WatchButton />
          </div>
          {asset.install_cmd && <CopyInstallBox command={asset.install_cmd} />}
          <div style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 18 }}>
            所需环境：内部网络可访问 · 已通过轻量审核
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, margin: "0 0 12px", color: "var(--fg)" }}>谁在用</h3>
            {favoriters.names.length ? (
              <>
                <div className="av-stack">
                  {favoriters.names.map((n, i) => (
                    <div className="av" key={i}>
                      {n.slice(0, 1)}
                    </div>
                  ))}
                </div>
                {favoriters.total > favoriters.names.length && (
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 10 }}>
                    还有 {favoriters.total - favoriters.names.length} 位同事在使用
                  </div>
                )}
              </>
            ) : (
              <div style={{ fontSize: 12, color: "var(--fg-subtle)" }}>还没有人收藏，做第一个使用者吧。</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
