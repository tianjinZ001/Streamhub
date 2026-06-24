"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEPTS } from "@/lib/constants";

const TABS = [
  { key: "overall", label: "综合榜" },
  { key: "rating", label: "好评榜" },
  { key: "rising", label: "上升最快" },
  { key: "contrib", label: "贡献榜" },
  { key: "dept", label: "部门榜" },
];

export function LeaderboardTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "overall";
  const dept = searchParams.get("dept") || DEPTS[0];

  function setMode(m: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", m);
    if (m === "dept" && !params.get("dept")) params.set("dept", DEPTS[0]);
    router.push(`${pathname}?${params.toString()}`);
  }
  function setDept(d: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("mode", "dept");
    params.set("dept", d);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <>
      <div className="seg lb-tabs">
        {TABS.map((t) => (
          <button key={t.key} className={mode === t.key ? "active" : ""} onClick={() => setMode(t.key)} type="button">
            {t.label}
          </button>
        ))}
      </div>
      {mode === "dept" && (
        <div style={{ marginBottom: 14 }}>
          <select value={dept} onChange={(e) => setDept(e.target.value)}>
            {DEPTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}
    </>
  );
}
