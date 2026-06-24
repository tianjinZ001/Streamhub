import { Suspense } from "react";
import { AssetCard } from "@/components/AssetCard";
import { Filters } from "@/components/Filters";
import { getAssets } from "@/lib/queries";
import type { AssetType } from "@/lib/constants";

type SearchParams = { type?: string; dept?: string; sort?: string; q?: string };

async function BrowseResults({ searchParams }: { searchParams: SearchParams }) {
  const assets = await getAssets({
    type: (searchParams.type as AssetType | "all") || "all",
    dept: searchParams.dept || "all",
    sort: (searchParams.sort as "hot" | "score" | "new") || "hot",
    q: searchParams.q,
  });

  if (!assets.length) {
    return (
      <p style={{ color: "var(--fg-muted)" }}>
        {searchParams.q
          ? `没有匹配 "${searchParams.q}" 的资产，换个关键词试试。`
          : "没有匹配的资产，换个筛选条件试试。"}
      </p>
    );
  }
  return (
    <div className="grid">
      {assets.map((a) => (
        <AssetCard key={a.id} asset={a} />
      ))}
    </div>
  );
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>浏览资产库</h1>
          <p>
            {sp.q
              ? `"${sp.q}" 的搜索结果`
              : "按类型、部门、标签筛选，找到你需要的 Skill / MCP / Agent。"}
          </p>
        </div>
      </div>
      <Suspense>
        <Filters />
      </Suspense>
      <Suspense fallback={<p style={{ color: "var(--fg-muted)" }}>加载中…</p>}>
        <BrowseResults searchParams={sp} />
      </Suspense>
    </div>
  );
}
