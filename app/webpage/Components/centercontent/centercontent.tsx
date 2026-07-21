"use client";
import { useEffect, useRef, useState } from "react";
import Holidaycalender from "../centercontent/Holidaycalender";
import ComingSoon from "./comingsoon";
import EmployeeCorner from "./EmployeeCorner";

type AppItem = {
  name: string;
  description: string;
  icon: string;
  bg: string;
  hoverDescription: string;
  url?: string;
  isAI?: boolean;
};
type CenterContentProps = {
  activeView:
    | "home"
    | "holiday"
    | "events"
    | "learning"
    | "articles"
    | "corner";
};
const apps: AppItem[] = [
  {
    name: "AATMA",
    description: "Talent Management System",
    icon: "/icons/aatma_icon.svg",
    hoverDescription: "Adroitent Advanced Talent Management System",
    bg: "#1F3A68",
    url: "http://202.153.39.93:8092/",
  },
  {
    name: "AHDAR",
    description: "Help Desk",
    hoverDescription: "Adroitent Helpdesk Application Request",
    icon: "/icons/help_desk_icon.svg",
    bg: "#1F3A68",
    url: "http://202.153.39.93:8085/ticket/",
  },
  {
    name: "AARNA",
    description: "Invoicing System",
    hoverDescription: "Adroitent Advanced Revenue Navigation System",
    icon: "/icons/droit_icon.svg",
    bg: "#1F3A68",
    url: "http://aarna.adroitent.ai/Home/Index",
  },
  {
    name: "DEVAILEY",
    description: "AI Software Engineering",
    hoverDescription: "Agentic AI Software Engineering Platform",
    icon: "/icons/devalley_icon.svg",
    bg: "#1F3A68",
    url: "http://202.153.39.93:7067/",
    isAI: true,
  },
  {
    name: "AARAM",
    description: "Leave & Attendance",
    hoverDescription: "Adroitent Absence Request and Attendance Management",
    icon: "/icons/aaram_icon.svg",
    bg: "#1F3A68",
    url: "http://aaram.adroitent.ai",
  },
  {
    name: "ACARSH",
    description: "Sales CRM",
    hoverDescription:
      "Adroitent Customer Acquisition and Relationship Management",
    icon: "/icons/knowledge_portal_icon.svg",
    bg: "#1F3A68",
    url: "http://acarsh.adroitent.ai/webpage",
  },
  {
    name: "DROIT",
    description: "AI Engineering Platform",
    hoverDescription: "Deploying Robust AI for Optimization and Transformation",
    icon: "/icons/code_gen_icon.svg",
    bg: "#1F3A68",
    url: "http://droit.adroitent.ai:7081/login",
    isAI: true,
  },
  {
    name: "AAPTA",
    description: "Talent Referral Portal",
    hoverDescription: "Adroitent Associate Portal for Talent Referral",
    icon: "/icons/code_gen_icon.svg",
    bg: "#1F3A68",
    url: "http://referrals.adroitent.ai:8092/referral/index",
  },
  {
    name: "TALENTALIGN",
    description: "AI Talent Sourcing",
    hoverDescription: "Agentic AI Talent Sourcing Platform",
    icon: "/icons/code_gen_icon.svg",
    bg: "#1F3A68",
    url: "http://talentalign.ai/",
  },
  {
    name: "DELIVERY METRICS",
    description: "AI Delivery Metrics",
    hoverDescription: "Agentic AI Delivery Metrics Platform",
    icon: "/icons/code_gen_icon.svg",
    bg: "#1F3A68",
    url: "http://13.127.101.147:8010/",
  },
];

const coreValues = [
  "Treat others the way you want to be treated",
  "Be Productive and Be Useful",
  "Make a Difference",
  "Be Resourceful and Enterprising",
  "Think Outside the Box",
  "Deliver Value, Always",
  "Ever Forward",
  "Profit is a Strategic Necessity",
  "Customer Partnerships First",
];

export default function CenterContent({ activeView }: CenterContentProps) {
  const [allowedApps, setAllowedApps] = useState<string[]>([]);
  const slides = ["mission", "vision", "values1", "values2"] as const;
  type SlideType = (typeof slides)[number];
  const [activeSlide, setActiveSlide] = useState<SlideType>("mission");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goNext = () =>
    setActiveSlide((p) => {
      const i = slides.indexOf(p);
      return slides[(i + 1) % slides.length];
    });
  const goPrev = () =>
    setActiveSlide((p) => {
      const i = slides.indexOf(p);
      return slides[(i - 1 + slides.length) % slides.length];
    });
  const startAuto = () => {
    stopAuto();
    intervalRef.current = setInterval(goNext, 5000);
  };
  const stopAuto = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    startAuto();
    return stopAuto;
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me");
        if (!r.ok) return;
        const d = await r.json();
        setAllowedApps(d.apps || []);
      } catch {}
    })();
  }, []);

  if (activeView === "holiday") return <Holidaycalender />;
  if (activeView === "events") return <ComingSoon page="Events" />;
  if (activeView === "learning") return <ComingSoon page="Learning & Dev" />;
  if (activeView === "articles") return <ComingSoon page="Featured Articles" />;
  if (activeView === "corner") return <EmployeeCorner />;

  return (
    <div className="center-wrapper">
      {/* ======== HERO SLIDER ======== */}
      <div className="hero-card glass-card">
        <div
          className="hero-slider"
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
        >
          {/* <div className="hero-curve" />
          <div className="hero-circle hero-circle-1" />
          <div className="hero-circle hero-circle-2" />
          <div className="hero-mesh" />
          <div className="hero-particles" /> */}

          <button className="nav-arrow left" onClick={goPrev}>‹</button>
          <button className="nav-arrow right" onClick={goNext}>›</button>

          <div className={`slide ${activeSlide === "mission" ? "active" : ""}`}>
            <div className="slide-badge">Our Mission</div>
            <p>
              To become the <strong className="hl">most sought-after</strong>{" "}
              Technology Partner for Enterprise AI Solutions in the market.
            </p>
          </div>

          <div className={`slide ${activeSlide === "vision" ? "active" : ""}`}>
            <div className="slide-badge">Our Vision</div>
            <p>
              We aspire to be the <strong className="hl">indispensable</strong>{" "}
              Partner that enterprises turn to for AI-driven transformation –
              delivering enduring value and growth.
            </p>
          </div>

          <div className={`slide ${activeSlide === "values1" ? "active" : ""}`}>
            <div className="slide-badge">
              Core Values <span className="badge-page">1 / 2</span>
            </div>
            <div className="values-grid">
              {coreValues.slice(0, 5).map((v, i) => (
                <div key={v} className="value-chip">
                  <span className="vn">{i + 1}</span>
                  <span> {v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`slide ${activeSlide === "values2" ? "active" : ""}`}>
            <div className="slide-badge">
              Core Values <span className="badge-page">2 / 2</span>
            </div>
            <div className="values-grid">
              {coreValues.slice(5).map((v, i) => (
                <div key={v} className="value-chip">
                  <span className="vn">{i + 6}</span>
                  <span> {v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="slide-indicators">
            {slides.map((s) => (
              <button
                key={s}
                className={`ind ${activeSlide === s ? "active" : ""}`}
                onClick={() => setActiveSlide(s)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ======== APPLICATIONS ======== */}
      <div className="apps-section">
        <div className="section-header">
          <div className="section-title-row">
            <div className="section-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <div>
              <p className="section-title">Applications</p>
              <p className="section-sub">Access your organization tools and platforms</p>
            </div>
          </div>
          <span className="app-count">{allowedApps.length} Apps</span>
        </div>

        <div className="app-grid">
          {apps
            .filter((a) => allowedApps.includes(a.name))
            .sort((a, b) => (a.isAI ? 1 : 0) - (b.isAI ? 1 : 0))
            .map((app, i) => (
              <div
                className={`app-card ${app.isAI ? "app-card-ai" : ""}`}
                key={app.name}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => {
                  if (app.url) window.open(app.url, "_blank");
                }}
              >
                <div className="card-band" style={{ background: app.bg }} />
                <div className="app-icon-wrap">
                  <div className="app-icon" style={{ "--icon-bg": app.bg } as React.CSSProperties}>
                    <img src={app.icon} alt={app.name} />
                  </div>
                  <div className="app-glow" style={{ background: app.bg }} />
                </div>
                <div className="app-info">
                  <h4>{app.name}</h4>
                  <p>{app.description}</p>
                </div>
                <div className="app-arrow">→</div>
                <div className="tooltip">{app.hoverDescription}</div>
              </div>
            ))}
        </div>

      </div>


      <style jsx>{`
        .center-wrapper {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }
        .center-column {
          max-width: 100%;
          width: 100%;
        }

        /* Optional for large screens */
        @media (min-width: 1400px) {
          .center-column {
            max-width: 900px;
            margin: 0 auto;
          }
        }

        /* ======== HERO ======== */
        .hero-card {
          padding: 0;
          overflow: hidden;
          border-radius: 16px;
          border: 1px solid rgba(18, 58, 120, 0.1);
          background: #ffffff;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          transform: translate3d(0, 8px, 0);
          opacity: 0;
          animation: cardEnter 0.45s ease forwards;
          animation-delay: 0ms;
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .hero-card:hover {
          transform: translate3d(0, -4px, 0);
          box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
        }
        .hero-slider {
          position: relative;
          height: 210px;
          overflow: hidden;
          background: #ffffff;
          padding: 28px 60px;
        }

        .hero-curve {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.05;
          background:
            radial-gradient(120% 80% at 86% 18%, rgba(18, 58, 120, 0.22) 0%, transparent 58%),
            radial-gradient(90% 60% at 76% 72%, rgba(18, 58, 120, 0.12) 0%, transparent 62%);
        }

        .hero-circle {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(18, 58, 120, 0.2);
          background: rgba(18, 58, 120, 0.05);
          pointer-events: none;
          z-index: 0;
          opacity: 0.05;
          transform: translate3d(0, 0, 0);
          animation: heroFloat 20s ease-in-out infinite;
        }
        .hero-circle-1 {
          width: 34px;
          height: 34px;
          top: 30px;
          right: 138px;
        }
        .hero-circle-2 {
          width: 18px;
          height: 18px;
          top: 72px;
          right: 98px;
          animation-delay: 3s;
        }

        @keyframes heroFloat {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        .hero-mesh {
          position: absolute;
          top: 0;
          right: 0;
          width: 40%;
          height: 58%;
          opacity: 0.035;
          pointer-events: none;
          background:
            radial-gradient(circle at 22% 35%, rgba(18, 58, 120, 0.9) 1px, transparent 1.5px),
            radial-gradient(circle at 45% 22%, rgba(18, 58, 120, 0.85) 1px, transparent 1.5px),
            radial-gradient(circle at 68% 40%, rgba(18, 58, 120, 0.75) 1px, transparent 1.5px),
            linear-gradient(132deg, transparent 36%, rgba(18, 58, 120, 0.65) 37%, transparent 39%),
            linear-gradient(162deg, transparent 52%, rgba(18, 58, 120, 0.58) 53%, transparent 55%);
          mask-image: radial-gradient(circle at 80% 20%, black 40%, transparent 95%);
          -webkit-mask-image: radial-gradient(circle at 80% 20%, black 40%, transparent 95%);
          animation: meshDrift 20s ease-in-out infinite;
          transform: translate3d(0, 0, 0);
          z-index: 0;
        }

        .hero-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.016;
          z-index: 0;
          background-image: radial-gradient(circle, rgba(18, 58, 120, 0.9) 0.8px, transparent 1px);
          background-size: 28px 28px;
          animation: particlesFloat 20s linear infinite;
        }

        @keyframes meshDrift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-8px, 6px, 0);
          }
        }

        @keyframes particlesFloat {
          0% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(-10px, 8px, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes cardEnter {
          from {
            opacity: 0;
            transform: translate3d(0, 10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .hero-slider:hover .nav-arrow { opacity: 1; pointer-events: auto; }

        .slide {
          position: absolute;
          inset: 0;
          padding: 24px 60px;
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.45s ease, transform 0.45s ease;
          z-index: 1;
        }
        .slide.active { opacity: 1; transform: translateY(0); z-index: 2; }

        .slide-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card-solid);
          border: 1px solid var(--border);
          border-radius: 999px;
          padding: 4px 14px;
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          margin-bottom: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          position: relative;
        }

        .slide-badge::before {
          content: "";
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f26522;
          display: inline-block;
          margin-right: 6px;
          box-shadow: 0 0 0 0 rgba(242, 101, 34, 0.28);
          animation: badgeDotPulse 2.6s ease-in-out infinite;
        }

        @keyframes badgeDotPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(242, 101, 34, 0.3);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(242, 101, 34, 0);
          }
        }
        .badge-page {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-muted);
          background: var(--accent-light);
          padding: 1px 7px;
          border-radius: 999px;
        }
        .slide p {
          max-width: 620px;
          font-size: 15px;
          line-height: 1.75;
          color: #334155;
          margin: 0;
        }
        .hl {
          color: var(--accent);
          background: rgba(242, 101, 34, 0.14);
          padding: 1px 6px;
          border-radius: 4px;
        }
        .values-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 6px 12px;
          margin-top: 6px;
        }
        .value-chip {
          font-size: 15px;
          line-height: 1.75;
          color: #334155;
        }
        .vn {
          font-size: 13px;
          font-weight: 800;
          color: var(--accent);
          background: var(--accent-light);
          padding: 2px 6px;
          border-radius: 4px;
        }
        .nav-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: var(--bg-card-solid);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-size: 20px;
          width: 34px;
          height: 34px;
          border-radius: 12px;
          cursor: pointer;
          z-index: 5;
          box-shadow: var(--shadow-sm);
          opacity: 0;
          pointer-events: none;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-arrow:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          box-shadow: var(--shadow-glow);
        }
        .nav-arrow.left { left: 14px; }
        .nav-arrow.right { right: 14px; }

        .slide-indicators {
          position: absolute;
          bottom: 16px;
          right: 60px;
          display: flex;
          gap: 8px;
          z-index: 5;
        }
        .ind {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(31, 58, 104, 0.2);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .ind.active { width: 24px; border-radius: 6px; background: var(--accent); }

        /* ======== APPLICATIONS SECTION ======== */
        .apps-section {
          position: relative;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid rgba(18, 58, 120, 0.1);
          overflow: hidden;
          background: #ffffff;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
          transform: translate3d(0, 10px, 0);
          opacity: 0;
          animation: cardEnter 0.45s ease forwards;
          animation-delay: 100ms;
          transition: transform 220ms ease, box-shadow 220ms ease;
        }
        .apps-section:hover {
          transform: translate3d(0, -4px, 0);
          box-shadow: 0 18px 34px rgba(15, 23, 42, 0.12);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }
        .section-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--bg-soft);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .section-title {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
          color: #0f172a;
        }
        .section-sub {
          font-size: 12px;
          color: #64748b;
          margin: 3px 0 0;
        }
        .app-count {
          font-size: 12px;
          font-weight: 600;
          color: var(--accent);
          background: var(--accent-light);
          padding: 4px 12px;
          border-radius: 999px;
        }

        /* ── 3 columns fixed ── */
        .app-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .app-card {
          position: relative;
          border: 1px solid var(--glass-border);
          border-radius: 15px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          overflow: hidden;
          animation: cardUp 0.4s ease backwards;
          background: #ffffff;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 5px 14px rgba(15, 23, 42, 0.05);
          transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease, border-color 200ms ease;
        }
        @keyframes cardUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-band {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 1;
        }

        .app-card:hover {
          transform: translate3d(0, -5px, 0);
          border-color: var(--border-accent);
          box-shadow: 0 14px 30px rgba(18, 58, 120, 0.14);
          background: #f8fbff;
        }
        .app-card:hover .card-band {
          opacity: 1;
        }
        .app-card:hover .app-arrow {
          opacity: 1;
          transform: translateX(4px);
        }
        .app-card:hover .app-glow {
          opacity: 0.14;
        }
        .app-card:hover .tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .app-icon-wrap {
          position: relative;
          flex-shrink: 0;
          z-index: 1;
        }
        .app-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          background: var(--icon-bg, var(--accent));
          transition: transform 200ms ease;
        }
        .app-card:hover .app-icon {
          transform: scale(1.05);
        }
        :global([data-theme="dark"]) .app-icon {
          background: var(--accent);
        }
        .app-glow {
          position: absolute;
          inset: -4px;
          border-radius: 14px;
          filter: blur(10px);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 0;
        }
        .app-icon img {
          width: 18px;
          height: 18px;
          object-fit: contain;
          filter: brightness(0) invert(1);
        }

        .app-info {
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }
        .app-info h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: #0f172a;
        }
        .app-info p {
          margin: 2px 0 0;
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-arrow {
          font-size: 15px;
          color: var(--accent);
          opacity: 0;
          transform: translateX(-2px);
          transition: transform 200ms ease, opacity 200ms ease;
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }

        :global(html[data-theme="dark"]) .hero-card {
          background: #123a78;
          border-color: rgba(169, 198, 245, 0.22);
          box-shadow: 0 10px 24px rgba(7, 20, 49, 0.36);
        }
        :global(html[data-theme="dark"]) .hero-slider {
          background: radial-gradient(circle at 82% 12%, rgba(167, 198, 246, 0.18), #123a78 46%, #0d2f66 78%, #123a78 100%);
        }
        :global(html[data-theme="dark"]) .slide-badge {
          background: #173f7f;
          border-color: rgba(191, 213, 249, 0.3);
        }
        :global(html[data-theme="dark"]) .slide p,
        :global(html[data-theme="dark"]) .value-chip {
          color: #eaf2ff;
        }
        :global(html[data-theme="dark"]) .apps-section {
          background: #123a78;
          border-color: rgba(169, 198, 245, 0.22);
          box-shadow: 0 10px 24px rgba(7, 20, 49, 0.36);
        }
        :global(html[data-theme="dark"]) .section-title {
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .section-sub {
          color: #d6e6ff;
        }
        :global(html[data-theme="dark"]) .app-count {
          background: rgba(242, 101, 34, 0.22);
          color: #ffd5c1;
        }
        :global(html[data-theme="dark"]) .app-card {
          background: #1f4a8f;
          border-color: rgba(188, 211, 248, 0.24);
          box-shadow: 0 6px 16px rgba(7, 20, 49, 0.3);
        }
        :global(html[data-theme="dark"]) .app-card:hover {
          background: #28569f;
          border-color: rgba(211, 226, 250, 0.38);
          box-shadow: 0 16px 30px rgba(7, 20, 49, 0.42);
        }
        :global(html[data-theme="dark"]) .app-info h4 {
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .app-info p {
          color: #d6e6ff;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
          }

          .hero-card,
          .apps-section {
            opacity: 1;
            transform: none;
          }
        }

        .tooltip {
          position: absolute;
          bottom: -6px;
          left: 12px;
          right: 12px;
          padding: 7px 10px;
          background: #1F3A68;
          color: #ffffff;
          font-size: 11px;
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          transform: translateY(4px);
          transition: all 0.2s ease;
          z-index: 10;
          pointer-events: none;
          line-height: 1.4;
        }


        @media (max-width: 900px) {
          .values-grid { grid-template-columns: repeat(2, 1fr); }
          .hero-slider { height: auto; min-height: 210px; }
          .slide { padding: 22px 24px; }
          .app-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 560px) {
          .center-wrapper { gap: 12px; }
          .hero-slider { height: auto; min-height: 180px; padding: 16px 20px; }
          .slide { position: relative; padding: 16px 8px; opacity: 0; display: none; }
          .slide.active { display: block; opacity: 1; }
          .slide p { font-size: 13px; line-height: 1.6; }
          .slide-badge { font-size: 12px; padding: 3px 10px; }
          .nav-arrow { opacity: 0.7; pointer-events: auto; width: 28px; height: 28px; font-size: 16px; }
          .nav-arrow.left { left: 6px; }
          .nav-arrow.right { right: 6px; }
          .slide-indicators { right: 20px; bottom: 10px; }
          .values-grid { grid-template-columns: 1fr; gap: 4px; }
          .value-chip { font-size: 13px; }

          /* Apps section mobile */
          .apps-section {
            padding: 14px;
          }
          .app-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .app-card {
            padding: 12px 14px;
          }
          /* Show arrow always on mobile (no hover) */
          .app-arrow {
            opacity: 0.5;
            transform: translateX(0);
          }

          .section-title {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}
