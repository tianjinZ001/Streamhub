import Link from "next/link";
import { SsoButton } from "@/components/SsoButton";
import { Icon } from "@/components/Icons";
import { getPublicStats } from "@/lib/queries";

export default async function LoginPage() {
  const stats = await getPublicStats();

  return (
    <div id="login-screen">
      <header className="lp-nav">
        <span className="lp-logo">
          Streama<span className="lp-logo-x">x</span>
        </span>
        <span className="lp-nav-div" />
        <span className="lp-nav-sub">StreamHub</span>
        <SsoButton className="lp-login-mini">SSO 登录 →</SsoButton>
      </header>

      <div className="lp-hero">
        <div className="lp-left">
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-dot" />
            STREAMAX 内部 AI 能力库
          </div>
          <h1 className="lp-title">
            Stream Hub <span className="lp-title-cn">/ 流枢</span>
          </h1>
          <p className="lp-tagline">让团队的 AI 能力，自由流动起来。</p>
          <p className="lp-sub">
            "流枢"是 AI 能力的汇流中枢，名字与 Streamax 同源。它把散落在各团队的 Skill、MCP 与
            Agent 沉淀到一处 —— 可发现、可复用、可评价。好的能力，不该只待在一个人的电脑里。
          </p>
          <div className="lp-cta">
            <SsoButton className="lp-btn">使用企业账号登录</SsoButton>
            <Link href="/browse" className="lp-btn-ghost">浏览能力库</Link>
          </div>
          <div className="lp-stats">
            <div className="lp-stat">
              <b>{stats.assetCount}</b>
              <span>个资产</span>
            </div>
            <div className="lp-stat">
              <b>{stats.contributorCount}</b>
              <span>位贡献者</span>
            </div>
            <div className="lp-stat">
              <b>{stats.avgScore.toFixed(1)}</b>
              <span>平均评分</span>
            </div>
          </div>
        </div>

        <div className="lp-preview">
          <div className="lp-card lp-card-back" />
          <div className="lp-card lp-card-front">
            <div className="lpc-head">
              <span className="lpc-score">
                <Icon id="star" className="ic star" style={{ width: 14, height: 14 }} />
                4.9<i>(41)</i>
              </span>
              <span className="lpc-badge">
                <span className="lpc-dot" />
                Skill
              </span>
            </div>
            <div className="lpc-name">设计稿转组件 Skill</div>
            <p className="lpc-desc">读取 Figma 链接，输出符合公司组件规范的 React 代码骨架。</p>
            <div className="lpc-tags">
              <span>设计辅助</span>
              <span>UI开发</span>
            </div>
            <div className="lpc-foot">更新于昨天 · 88 位同事在用</div>
          </div>
        </div>
      </div>

      <footer className="lp-foot-bar">沉淀 · 发现 · 评价 —— Nick ZHAO / 赵添进 · 海外货运产品线制作</footer>
    </div>
  );
}
