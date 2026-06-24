"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEPTS, TYPE_META } from "@/lib/constants";

const TYPES = ["all", ...Object.keys(TYPE_META)] as const;

export function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const type = searchParams.get("type") || "all";
  const dept = searchParams.get("dept") || "all";
  const sort = searchParams.get("sort") || "hot";

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all" || !value) params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="filters">
      <div className="seg">
        {TYPES.map((t) => (
          <button
            key={t}
            className={type === t ? "active" : ""}
            onClick={() => setParam("type", t)}
            type="button"
          >
            {t === "all" ? "全部" : TYPE_META[t as keyof typeof TYPE_META].label}
          </button>
        ))}
      </div>
      <select value={dept} onChange={(e) => setParam("dept", e.target.value)}>
        <option value="all">全部部门</option>
        {DEPTS.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
      <select value={sort} onChange={(e) => setParam("sort", e.target.value)}>
        <option value="hot">综合排序</option>
        <option value="score">评分最高</option>
        <option value="new">最新发布</option>
      </select>
    </div>
  );
}
