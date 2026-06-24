import Link from "next/link";
import { Icon } from "./Icons";
import { TYPE_META } from "@/lib/constants";
import { relativeTime } from "@/lib/format";
import type { AssetCardData } from "@/lib/types";

export function AssetCard({ asset }: { asset: AssetCardData }) {
  const tm = TYPE_META[asset.type];
  return (
    <Link href={`/assets/${asset.id}`} className="card">
      <div className="card-head">
        <span className="card-score">
          <Icon id="star" className="ic star" />
          {asset.score.toFixed(1)}
          <span className="votes">({asset.votes})</span>
        </span>
        {asset.status !== "published" && (
          <span
            className="topic"
            style={{
              color: asset.status === "pending" ? "var(--fg-muted)" : "var(--danger)",
            }}
          >
            {asset.status === "pending" ? "审核中" : "未通过"}
          </span>
        )}
      </div>
      <div className="card-name">
        {asset.name}
        <span className={`type-badge ${tm.cls}`}>
          <span className={`type-dot ${tm.cls}`} />
          {tm.label}
        </span>
      </div>
      <p className="desc">{asset.description}</p>
      <div className="card-tags">
        {asset.tags.map((t) => (
          <span key={t} className="topic">
            {t}
          </span>
        ))}
      </div>
      <div className="card-foot">
        <span className="foot-item">
          <Icon id="clock" className="ic clock" />
          更新于 {relativeTime(asset.updated_at)}
        </span>
      </div>
    </Link>
  );
}
