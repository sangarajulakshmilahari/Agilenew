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
    bg: "linear-gradient(135deg, #60a5fa, #a855f7)",
    url: "http://202.153.39.93:8092/",
  },
  {
    name: "AHDAR",
    description: "Help Desk",
    hoverDescription: "Adroitent Helpdesk Application Request",
    icon: "/icons/help_desk_icon.svg",
    bg: "linear-gradient(135deg, #c084fc, #ec4899)",
    url: "http://202.153.39.93:8085/ticket/",
  },
  {
    name: "AARNA",
    description: "Invoicing System",
    hoverDescription: "Adroitent Advanced Revenue Navigation System",
    icon: "/icons/droit_icon.svg",
    bg: "linear-gradient(135deg, #fb923c, #ef4444)",
    url: "http://aarna.adroitent.ai/Home/Index",
  },
  {
    name: "DEVAILEY",
    description: "AI Software Engineering",
    hoverDescription: "Agentic AI Software Engineering Platform",
    icon: "/icons/devalley_icon.svg",
    bg: "linear-gradient(135deg, #7fdddd, #0c7486)",
    url: "http://202.153.39.93:7067/",
  },
  {
    name: "AARAM",
    description: "Leave & Attendance",
    hoverDescription: "Adroitent Absence Request and Attendance Management",
    icon: "/icons/aaram_icon.svg",
    bg: "linear-gradient(135deg, #00c9ff, #92fe9d)",
    url: "http://aaram.adroitent.ai",
  },
  {
    name: "ACARSH",
    description: "Sales CRM",
    hoverDescription:
      "Adroitent Customer Acquisition and Relationship Management",
    icon: "/icons/knowledge_portal_icon.svg",
    bg: "linear-gradient(135deg, #0ea5e9, #9cd9f3)",
    url: "http://acarsh.adroitent.ai/webpage",
  },
  {
    name: "DROIT",
    description: "AI Engineering Platform",
    hoverDescription: "Deploying Robust AI for Optimization and Transformation",
    icon: "/icons/code_gen_icon.svg",
    bg: "linear-gradient(135deg, #9697f5, #2737c9)",
    url: "http://droit.adroitent.ai:7081/login",
  },
  {
    name: "AAPTA",
    description: "Talent Referral Portal",
    hoverDescription: "Adroitent Associate Portal for Talent Referral",
    icon: "/icons/code_gen_icon.svg",
    bg: "linear-gradient(135deg, #f5969b, #c92727)",
    url: "http://referrals.adroitent.ai:8092/referral/index",
  },
  {
    name: "TALENTALIGN",
    description: "AI Talent Sourcing",
    hoverDescription: "Agentic AI Talent Sourcing Platform",
    icon: "/icons/code_gen_icon.svg",
    bg: "linear-gradient(135deg, #f5e796, #c99e27)",
    url: "http://talentalign.ai/",
  },
  {
    name: "DELIVERY METRICS",
    description: "AI Delivery Metrics",
    hoverDescription: "Agentic AI Delivery Metrics Platform",
    icon: "/icons/code_gen_icon.svg",
    bg: "linear-gradient(135deg, #9697f5, #2737c9)",
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
          <div className="hero-deco deco-circle" />
          <div className="hero-deco deco-ring" />
          <div className="hero-deco deco-dots" />

          <button className="nav-arrow left" onClick={goPrev}>
            ‹
          </button>
          <button className="nav-arrow right" onClick={goNext}>
            ›
          </button>

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

          {/* Core Values — Slide 1 (values 1–5) */}
          <div className={`slide ${activeSlide === "values1" ? "active" : ""}`}>
            <div className="slide-badge">
              Core Values <span className="badge-page">1 / 2</span>
            </div>
            <div className="values-grid">
              {coreValues.slice(0, 5).map((v, i) => (
                <div key={v} className="value-chip">
                  <span className="vn">{String(i + 1).padStart(2, "")}</span>
                  <span> {v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Core Values — Slide 2 (values 6–9) */}
          <div className={`slide ${activeSlide === "values2" ? "active" : ""}`}>
            <div className="slide-badge">
              Core Values <span className="badge-page">2 / 2</span>
            </div>
            <div className="values-grid">
              {coreValues.slice(5).map((v, i) => (
                <div key={v} className="value-chip">
                  <span className="vn">{String(i + 6).padStart(2, "")}</span>
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
        <div className="apps-bg">
          <div className="apps-orb orb-a" />
          <div className="apps-orb orb-b" />
        </div>

        <div className="section-header">
          <div>
            <p className="section-title">Applications</p>
            <p className="section-sub">
              Access your organization tools and platforms
            </p>
          </div>
          <span className="app-count">{allowedApps.length} Apps</span>
        </div>

        <div className="app-grid">
          {apps
            .filter((a) => allowedApps.includes(a.name))
            .map((app, i) => (
              <div
                className="app-card"
                key={app.name}
                style={{ animationDelay: `${i * 0.04}s` }}
                onClick={() => {
                  if (app.url) window.open(app.url, "_blank");
                }}
              >
                <div className="card-band" style={{ background: app.bg }} />
                <div className="app-icon-wrap">
                  <div className="app-icon" style={{ background: app.bg }}>
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
        }
        .hero-slider {
          position: relative;
          height: 210px;
          overflow: hidden;
          background: var(--bg-soft);
          padding: 28px 60px;
        }
        .hero-deco {
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }
        .deco-circle {
          width: 200px;
          height: 200px;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(124, 58, 237, 0.08),
            rgba(99, 102, 241, 0.04)
          );
          top: -60px;
          right: -40px;
        }
        .deco-ring {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          border: 2px solid rgba(124, 58, 237, 0.07);
          bottom: -40px;
          left: 30%;
        }
        .deco-dots {
          width: 60px;
          height: 60px;
          background-image: radial-gradient(
            circle,
            rgba(124, 58, 237, 0.1) 1.5px,
            transparent 1.5px
          );
          background-size: 12px 12px;
          top: 20px;
          right: 180px;
        }
        .hero-slider:hover .nav-arrow {
          opacity: 1;
          pointer-events: auto;
        }
        .hero-slider:hover .slide-timer::before {
          animation-play-state: paused;
        }

        .slide {
          position: absolute;
          inset: 0;
          padding: 24px 60px;
          opacity: 0;
          transform: translateY(12px);
          transition:
            opacity 0.45s ease,
            transform 0.45s ease;
          z-index: 1;
        }
        .slide.active {
          opacity: 1;
          transform: translateY(0);
          z-index: 2;
        }

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
          color: var(--text-secondary);
          margin: 0;
        }

        .hl {
          color: var(--accent);
          background: linear-gradient(
            120deg,
            var(--accent-light),
            rgba(124, 58, 237, 0.1)
          );
          padding: 1px 6px;
          border-radius: 4px;
        }

        /* 3-col grid for values so they fit the reduced height */
        .values-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px 12px;
          margin-top: 6px;
        }
        .value-chip {
          max-width: 620px;
          font-size: 15px;
          line-height: 1.75;
          color: var(--text-secondary);
          margin: 0;
        }
        .vn {
          font-size: 13px;
          font-weight: 800;
          color: var(--accent);
          background: var(--accent-light);
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
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
        .nav-arrow.left {
          left: 14px;
        }
        .nav-arrow.right {
          right: 14px;
        }

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
          background: rgba(124, 58, 237, 0.18);
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 0;
        }
        .ind.active {
          width: 24px;
          border-radius: 6px;
          background: var(--accent);
        }

        .slide-timer {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 3px;
          background: rgba(124, 58, 237, 0.08);
          overflow: hidden;
          z-index: 3;
        }
        .slide-timer::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 0%;
          background: var(--gradient-primary);
          animation: prog 5s linear forwards;
        }
        @keyframes prog {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        /* ======== APPLICATIONS SECTION ======== */
        .apps-section {
          position: relative;
          padding: 22px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
          overflow: hidden;
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow-sm);
        }
        .apps-bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          border-radius: inherit;
        }
        .apps-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.35;
        }
        .orb-a {
          width: 220px;
          height: 220px;
          background: radial-gradient(circle, #c4b5fd, transparent 70%);
          top: -60px;
          right: -40px;
          animation: orbDrift 20s ease-in-out infinite;
        }
        .orb-b {
          width: 160px;
          height: 160px;
          background: radial-gradient(circle, #a5b4fc, transparent 70%);
          bottom: -40px;
          left: 20%;
          animation: orbDrift 26s ease-in-out infinite reverse;
        }
        @keyframes orbDrift {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(14px, 10px);
          }
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }
        .section-title {
          font-size: 17px;
          font-weight: 700;
          margin: 0;
          color: var(--text-primary);
        }
        .section-sub {
          font-size: 12px;
          color: var(--text-muted);
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
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .app-card {
          position: relative;
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          overflow: hidden;
          animation: cardUp 0.4s ease backwards;
          background: var(--bg-card);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          box-shadow: 0 2px 6px rgba(15, 23, 42, 0.04);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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
        }

        .app-card:hover {
          transform: translateY(-4px);
          border-color: var(--border-accent);
          box-shadow: var(--shadow-glow);
          background: var(--bg-soft-hover);
        }
        .app-card:hover .card-band {
          opacity: 1;
        }
        .app-card:hover .app-arrow {
          opacity: 1;
          transform: translateX(0);
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
        }
        .app-info h4 {
          margin: 0;
          font-size: 13px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .app-info p {
          margin: 2px 0 0;
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .app-arrow {
          font-size: 15px;
          color: var(--accent);
          opacity: 0;
          transform: translateX(-6px);
          transition: all 0.25s ease;
          flex-shrink: 0;
        }

        .tooltip {
          position: absolute;
          bottom: -6px;
          left: 12px;
          right: 12px;
          padding: 7px 10px;
          background: #1e1b4b;
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
          .values-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .hero-slider {
            height: auto;
            min-height: 210px;
          }
          .slide {
            padding: 22px 24px;
          }
          .app-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 560px) {
          .center-wrapper {
            gap: 12px;
          }

          /* Hero slider mobile */
          .hero-slider {
            height: auto;
            min-height: 180px;
            padding: 16px 20px;
          }
          .slide {
            position: relative;
            padding: 16px 8px;
            opacity: 0;
            display: none;
          }
          .slide.active {
            display: block;
            opacity: 1;
          }
          .slide p {
            font-size: 13px;
            line-height: 1.6;
          }
          .slide-badge {
            font-size: 12px;
            padding: 3px 10px;
          }

          /* Nav arrows always visible on mobile (no hover) */
          .nav-arrow {
            opacity: 0.7;
            pointer-events: auto;
            width: 28px;
            height: 28px;
            font-size: 16px;
          }
          .nav-arrow.left {
            left: 6px;
          }
          .nav-arrow.right {
            right: 6px;
          }

          .slide-indicators {
            right: 20px;
            bottom: 10px;
          }

          /* Values grid: single column on phone */
          .values-grid {
            grid-template-columns: 1fr;
            gap: 4px;
          }
          .value-chip {
            font-size: 13px;
          }

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
