"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icons";
import { SearchBox } from "./SearchBox";

const NAV = [
  { href: "/home", label: "首页" },
  { href: "/browse", label: "浏览" },
  { href: "/leaderboard", label: "排行榜" },
];

export function Topbar({ userName, dept }: { userName: string; dept: string }) {
  const pathname = usePathname();

  return (
    <div className="topbar">
      <div className="brand">
        <div className="mark">S</div>
        StreamHub
      </div>
      <div className="nav-links">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={pathname.startsWith(n.href) ? "active" : ""}>
            {n.label}
          </Link>
        ))}
      </div>
      <SearchBox />
      <Link href="/upload" className="btn btn-primary">
        <Icon id="plus" style={{ color: "#fff" }} />
        新建资产
      </Link>
      <Link
        href="/profile"
        className="topbar-avatar"
        title={`${userName} · ${dept}（进入个人中心）`}
      >
        {userName.slice(0, 1)}
      </Link>
    </div>
  );
}
