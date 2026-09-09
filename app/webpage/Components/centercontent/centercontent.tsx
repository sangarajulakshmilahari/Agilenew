"use client";
import { useEffect, useRef, useState } from "react";
import Holidaycalender from "../centercontent/Holidaycalender";
import ComingSoon from "./comingsoon";
import EmployeeCorner from "./EmployeeCorner";
import PortalContent from "./PortalContent";
import FeaturedArticles from "./FeaturedArticles";
import ArticleManagement from "./ArticleManagement";

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
    | "corner"
    | "portal"
    | "articleManage";
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
    url: "https://aapta.adroitent.ai/",
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

type PortalContentItem = {
  contentId: number;
  contentKey: string;
  title: string;
  content: string;
};

type PortalValue = {
  valueId: number;
  valueText: string;
  displayOrder: number;
};

export default function CenterContent({ activeView }: CenterContentProps) {
  const [allowedApps, setAllowedApps] = useState<string[]>([]);
  const [mission, setMission] = useState<PortalContentItem | null>(null);
  const [vision, setVision] = useState<PortalContentItem | null>(null);
  const [portalValues, setPortalValues] = useState<PortalValue[]>([]);
  const [portalContentLoading, setPortalContentLoading] = useState(true);
  const [portalContentError, setPortalContentError] = useState("");
  const slides = ["mission", "vision"] as const;
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

  useEffect(() => {
    (async () => {
      try {
        setPortalContentLoading(true);
        setPortalContentError("");
        const r = await fetch("/api/portal-content", { cache: "no-store" });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
          throw new Error(d?.error || "Unable to load portal content.");
        }
        setMission(d?.mission ?? null);
        setVision(d?.vision ?? null);
        setPortalValues(Array.isArray(d?.values) ? d.values : []);
      } catch {
        setPortalContentError("Unable to load mission, vision, and values.");
      } finally {
        setPortalContentLoading(false);
      }
    })();
  }, []);

  if (activeView === "holiday") return <Holidaycalender />;
  if (activeView === "events") return <ComingSoon page="Events" />;
  if (activeView === "learning") return <ComingSoon page="Learning & Dev" />;
  if (activeView === "articles") return <FeaturedArticles />;
  if (activeView === "corner") return <EmployeeCorner />;
  if (activeView === "portal") return <PortalContent />;
  if (activeView === "articleManage") return <ArticleManagement />;

  const openAppByName = (name: string) => {
    const target = apps.find((a) => a.name === name);
    if (target?.url) window.open(target.url, "_blank");
  };

  return (
    <div className="center-wrapper">
      {/* ======== QUICK CONSOLE (AI band — the one place cyan appears) ======== */}
      <div className="ai-band">
        <div className="ai-top">
          {/* <span className="ai-tag">
            <span className="dot" />
            Quick console
          </span> */}
        </div>
        <p className="ai-brief">
          Jump straight into what you need — apply for leave, raise a
          ticket, or open any of your <strong>{allowedApps.length}</strong>{" "}
          applications below.
        </p>
        <div className="omni">
          <svg
            className="ic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          <span>Search applications, policies, or people</span>
        </div>
        <div className="chips">
          <button
            className="chip"
            onClick={() =>
              window.open("https://aaram.adroitent.ai/apply_leave", "_blank")
            }
          >
            Apply for leave
          </button>
          <button className="chip" onClick={() => openAppByName("AHDAR")}>
            Raise a ticket
          </button>
          <button className="chip" onClick={() => openAppByName("AAPTA")}>
            Refer a candidate
          </button>
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

      {/* ======== PURPOSE / MISSION / VISION ROTATOR ======== */}
      <div
        className="purpose-card"
        onMouseEnter={stopAuto}
        onMouseLeave={startAuto}
      >
        <div className={`p-slide ${activeSlide === "mission" ? "active" : ""}`}>
          <span className="p-lab">{mission?.title || ""}</span>
          <p>
            {portalContentLoading ? "" : mission?.content || portalContentError}
          </p>
        </div>
        <div className={`p-slide ${activeSlide === "vision" ? "active" : ""}`}>
          <span className="p-lab">{vision?.title || ""}</span>
          <p>
            {portalContentLoading ? "" : vision?.content || portalContentError}
          </p>
        </div>
        <div className="p-foot">
          <div className="p-dots">
            {slides.map((s) => (
              <button
                key={s}
                className={`p-dot ${activeSlide === s ? "active" : ""}`}
                onClick={() => setActiveSlide(s)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ======== OUR VALUES ======== */}
      <div className="values-section">
        <div className="section-header">
          <div className="section-title-row">
            <div className="section-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/>
              </svg>
            </div>
            <div>
              <p className="section-title">Our values &amp; beliefs</p>
              <p className="section-sub">What we hold ourselves to, every day</p>
            </div>
          </div>
        </div>
        <div className="values-grid-static">
          {portalValues.map((value) => (
            <div key={value.valueId} className="value-card">
              <span className="value-num">{String(value.displayOrder).padStart(2, "0")}</span>
              <span className="value-text">{value.valueText}</span>
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

        /* ======== QUICK CONSOLE (AI band) ======== */
        .ai-band {
          border-radius: 16px;
          padding: 24px 28px;
          background: linear-gradient(155deg, var(--ad-navy) 0%, var(--ad-ai-navy) 100%);
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .ai-band::after {
          content: "";
          position: absolute;
          top: -70px;
          right: -70px;
          width: 240px;
          height: 240px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.18), transparent 70%);
          pointer-events: none;
        }
        .ai-top {
          position: relative;
          z-index: 1;
          margin-bottom: 10px;
        }
        .ai-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ad-ai-cyan);
        }
        .ai-tag .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--ad-ai-cyan);
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.25);
        }
        .ai-brief {
          position: relative;
          z-index: 1;
          font-size: 16px;
          line-height: 1.6;
          max-width: 640px;
          margin: 0;
        }
        .ai-brief strong {
          color: var(--ad-ai-cyan);
          font-weight: 700;
        }
        .omni {
          position: relative;
          z-index: 1;
          margin-top: 18px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 10px;
          padding: 12px 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13.5px;
          color: rgba(255, 255, 255, 0.55);
          cursor: text;
        }
        .omni .ic {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          color: var(--ad-ai-cyan);
        }
        .chips {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }
        .chip {
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 500;
          padding: 7px 13px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          color: rgba(255, 255, 255, 0.9);
          cursor: pointer;
          transition: background 150ms ease;
        }
        .chip:hover {
          background: rgba(255, 255, 255, 0.16);
        }

        /* ======== PURPOSE / MISSION / VISION ROTATOR ======== */
        .purpose-card {
          position: relative;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 22px 26px;
          min-height: 96px;
        }
        .p-slide {
          display: none;
        }
        .p-slide.active {
          display: block;
          animation: pFade 0.4s ease;
        }
        @keyframes pFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .p-lab {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ad-orange);
          margin-bottom: 8px;
        }
        .p-slide p {
          margin: 0;
          max-width: 720px;
          font-size: 15px;
          line-height: 1.65;
          color: var(--ad-navy);
        }
        .p-foot {
          display: flex;
          justify-content: flex-end;
          margin-top: 14px;
        }
        .p-dots {
          display: flex;
          gap: 6px;
        }
        .p-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border);
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.25s ease;
        }
        .p-dot.active {
          width: 18px;
          border-radius: 4px;
          background: var(--ad-orange);
        }

        /* ======== VALUES ======== */
        .values-section {
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 22px 24px;
        }
        .values-grid-static {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-top: 14px;
        }
        .value-card {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          background: var(--bg-page);
          border: 1px solid var(--border);
        }
        .value-num {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          font-weight: 700;
          color: var(--ad-orange);
          flex-shrink: 0;
          margin-top: 1px;
        }
        .value-text {
          font-size: 13px;
          line-height: 1.45;
          color: var(--ad-navy);
          font-weight: 500;
        }


        /* ======== APPLICATIONS SECTION ======== */
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
          font-family: "JetBrains Mono", monospace;
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

        /* AI-native apps get the deep-navy + cyan surface — the brand's
           reserved signal for "AI is present here". */
        .app-card-ai {
          background: linear-gradient(160deg, var(--ad-navy), var(--ad-ai-navy));
          border-color: rgba(6, 182, 212, 0.25);
        }
        .app-card-ai .app-info h4 {
          color: #ffffff;
        }
        .app-card-ai .app-info p {
          color: rgba(255, 255, 255, 0.6);
        }
        .app-card-ai .app-icon {
          background: rgba(6, 182, 212, 0.16) !important;
        }
        .app-card-ai .app-icon img {
          filter: brightness(0) saturate(100%) invert(72%) sepia(53%) saturate(1000%) hue-rotate(140deg) brightness(97%) contrast(96%);
        }
        .app-card-ai .app-arrow {
          color: var(--ad-ai-cyan);
        }
        .app-card-ai:hover {
          background: linear-gradient(160deg, #24447a, var(--ad-navy));
          border-color: rgba(6, 182, 212, 0.45);
        }
        .app-card-ai .tooltip {
          background: var(--ad-ai-navy);
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

        :global(html[data-theme="dark"]) .purpose-card {
          background: var(--bg-card);
          border-color: var(--border);
        }
        :global(html[data-theme="dark"]) .p-slide p {
          color: var(--text-primary);
        }
        :global(html[data-theme="dark"]) .values-section {
          background: var(--bg-card);
          border-color: var(--border);
        }
        :global(html[data-theme="dark"]) .value-card {
          background: var(--bg-soft);
          border-color: var(--border);
        }
        :global(html[data-theme="dark"]) .value-text {
          color: var(--text-primary);
        }
        :global(html[data-theme="dark"]) .apps-section {
          background: var(--bg-card);
          border-color: var(--border);
          box-shadow: 0 10px 24px rgba(7, 20, 49, 0.36);
        }
        :global(html[data-theme="dark"]) .section-title {
          color: var(--text-primary);
        }
        :global(html[data-theme="dark"]) .section-sub {
          color: var(--text-secondary);
        }
        :global(html[data-theme="dark"]) .app-count {
          background: rgba(242, 101, 34, 0.22);
          color: #ffd5c1;
        }
        :global(html[data-theme="dark"]) .app-card {
          background: var(--bg-soft);
          border-color: var(--border);
          box-shadow: 0 6px 16px rgba(7, 20, 49, 0.3);
        }
        :global(html[data-theme="dark"]) .app-card:hover {
          background: var(--bg-soft-hover);
          border-color: var(--border-accent);
          box-shadow: 0 16px 30px rgba(7, 20, 49, 0.42);
        }
        :global(html[data-theme="dark"]) .app-info h4 {
          color: var(--text-primary);
        }
        :global(html[data-theme="dark"]) .app-info p {
          color: var(--text-secondary);
        }
        /* AI cards must stay visually distinct from regular cards even in
           dark mode — without this, the rule above (same specificity, later
           in source) overwrites the deep-navy + cyan surface. */
        :global(html[data-theme="dark"]) .app-card-ai {
          background: linear-gradient(160deg, var(--ad-navy), var(--ad-ai-navy));
          border-color: rgba(6, 182, 212, 0.4);
        }
        :global(html[data-theme="dark"]) .app-card-ai:hover {
          background: linear-gradient(160deg, #24447a, var(--ad-navy));
          border-color: rgba(6, 182, 212, 0.55);
        }
        :global(html[data-theme="dark"]) .app-card-ai .app-info h4 {
          color: #ffffff;
        }
        :global(html[data-theme="dark"]) .app-card-ai .app-info p {
          color: rgba(255, 255, 255, 0.6);
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
          }

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
          .values-grid-static { grid-template-columns: repeat(2, 1fr); }
          .app-grid { grid-template-columns: repeat(2, 1fr); }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 560px) {
          .center-wrapper { gap: 12px; }
          .ai-band { padding: 18px 18px; }
          .ai-brief { font-size: 14px; }
          .values-grid-static { grid-template-columns: 1fr; gap: 8px; }

          /* Apps section mobile */
          .apps-section {
            padding: 14px;
          }
          .section-header {
            align-items: flex-start;
            gap: 10px;
          }
          .section-title-row {
            min-width: 0;
            flex: 1;
          }
          .section-sub {
            max-width: 190px;
            line-height: 1.35;
          }
          .app-count {
            flex-shrink: 0;
            padding: 4px 8px;
            white-space: nowrap;
          }
          .app-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }
          .app-card {
            padding: 12px 14px;
            min-width: 0;
          }
          /* Show arrow always on mobile (no hover) */
          .app-arrow {
            opacity: 0.5;
            transform: translateX(0);
          }

          .section-title {
            font-size: 15px;
          }
          .app-info h4,
          .app-info p {
            white-space: normal;
            overflow-wrap: anywhere;
          }
          .app-info p {
            line-height: 1.35;
          }
        }
      `}</style>
    </div>
  );
}