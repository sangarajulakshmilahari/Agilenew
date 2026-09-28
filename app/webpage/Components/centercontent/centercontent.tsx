"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Holidaycalender from "../centercontent/Holidaycalender";
import ComingSoon from "./comingsoon";
import EmployeeCorner from "./EmployeeCorner";
import PortalContent from "./PortalContent";
import FeaturedArticles from "./FeaturedArticles";
import ArticleManagement from "./ArticleManagement";
import ManagePortal from "./ManagePortal";
import AssistantRichContent from "./AssistantRichContent";
import type { AssistantBlock } from "@/app/lib/assistantBlocks";

type AppItem = {
  name: string;
  description: string;
  icon: string;
  bg: string;
  hoverDescription: string;
  url?: string;
  isAI?: boolean;
  displayOrder?: number;
};

type BackendApp = {
  id?: number;
  name?: string;
  description?: string;
  hoverDescription?: string;
  url?: string;
  isAI?: boolean;
  displayOrder?: number;
};

type CenterView =
  | "home"
  | "holiday"
  | "events"
  | "learning"
  | "articles"
  | "corner"
  | "managePortal"
  | "portal"
  | "articleManage";

type CenterContentProps = {
  activeView: CenterView;
  highlightedPostId?: string | null;
  onChangeView?: (view: CenterView) => void;
  onAssistantOpenChange?: (open: boolean) => void;
};
const APP_STYLE: Record<string, { icon: string; bg: string }> = {
  AATMA: { icon: "/icons/aatma_icon.svg", bg: "#1F3A68" },
  AHDAR: { icon: "/icons/help_desk_icon.svg", bg: "#1F3A68" },
  AARNA: { icon: "/icons/droit_icon.svg", bg: "#1F3A68" },
  DEVAILEY: { icon: "/icons/devalley_icon.svg", bg: "#1F3A68" },
  AARAM: { icon: "/icons/aaram_icon.svg", bg: "#1F3A68" },
  ACARSH: { icon: "/icons/knowledge_portal_icon.svg", bg: "#1F3A68" },
  DROIT: { icon: "/icons/code_gen_icon.svg", bg: "#1F3A68" },
  AAPTA: { icon: "/icons/code_gen_icon.svg", bg: "#1F3A68" },
  TALENTALIGN: { icon: "/icons/code_gen_icon.svg", bg: "#1F3A68" },
  "DELIVERY METRICS": { icon: "/icons/code_gen_icon.svg", bg: "#1F3A68" },
};

const DEFAULT_APP_STYLE = { icon: "/icons/code_gen_icon.svg", bg: "#1F3A68" };

function styleForApp(name: string) {
  return APP_STYLE[name.toUpperCase()] || DEFAULT_APP_STYLE;
}

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

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  blocks?: AssistantBlock[];
};

function AssistantMark() {
  return (
    <span className="assistant-mark" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3l1.2 4.8L18 9l-4.8 1.2L12 15l-1.2-4.8L6 9l4.8-1.2L12 3z"
          fill="#06B6D4"
        />
        <path d="M18.5 14.5l.7 2.3 2.3.7-2.3.7-.7 2.3-.7-2.3-2.3-.7 2.3-.7.7-2.3z" fill="#F26522" />
      </svg>
    </span>
  );
}

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function CenterContent({
  activeView,
  highlightedPostId,
  onChangeView,
  onAssistantOpenChange,
}: CenterContentProps) {
  const [allowedApps, setAllowedApps] = useState<AppItem[]>([]);
  const [mission, setMission] = useState<PortalContentItem | null>(null);
  const [vision, setVision] = useState<PortalContentItem | null>(null);
  const [portalValues, setPortalValues] = useState<PortalValue[]>([]);
  const [portalContentLoading, setPortalContentLoading] = useState(true);
  const [portalContentError, setPortalContentError] = useState("");
  const [heroInput, setHeroInput] = useState("");
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([]);
  const [assistantMinimized, setAssistantMinimized] = useState(false);
  const [employeeName, setEmployeeName] = useState("Employee");
  const [panelSlot, setPanelSlot] = useState<HTMLElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
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
        const catalog = Array.isArray(d.applications) ? (d.applications as BackendApp[]) : [];
        setAllowedApps(
          catalog
            .map((app) => {
              const name = String(app.name || "").trim();
              if (!name) return null;
              const style = styleForApp(name);
              return {
                name,
                description: String(app.description || "").trim(),
                hoverDescription: String(app.hoverDescription || "").trim(),
                url: String(app.url || "").trim() || undefined,
                isAI: Boolean(app.isAI),
                displayOrder: Number(app.displayOrder || 0),
                icon: style.icon,
                bg: style.bg,
              } as AppItem;
            })
            .filter((app): app is AppItem => Boolean(app)),
        );
        const fullName =
          String(d?.name || d?.fullName || d?.displayName || d?.username || "").trim();
        const firstName = fullName.split(" ")[0]?.trim();
        if (firstName) setEmployeeName(firstName);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    onAssistantOpenChange?.(activeView === "home" && assistantOpen && !assistantMinimized);
  }, [activeView, assistantOpen, assistantMinimized, onAssistantOpenChange]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    setPanelSlot(document.getElementById("assistant-panel-slot"));
  }, [assistantOpen, assistantMinimized, activeView]);

  useEffect(() => {
    if (!assistantOpen || assistantMinimized) return;
    const id = window.setTimeout(() => {
      conversationEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, 10);
    return () => window.clearTimeout(id);
  }, [assistantMessages, assistantLoading, assistantOpen, assistantMinimized]);

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
  if (activeView === "corner") {
    return <EmployeeCorner highlightedPostId={highlightedPostId ?? null} />;
  }
  if (activeView === "managePortal") {
    return (
      <ManagePortal
        onNavigate={(view) => onChangeView?.(view)}
      />
    );
  }
  if (activeView === "portal") {
    return (
      <PortalContent onBack={() => onChangeView?.("managePortal")} />
    );
  }
  if (activeView === "articleManage") {
    return (
      <ArticleManagement onBack={() => onChangeView?.("managePortal")} />
    );
  }

  const submitAssistantPrompt = async (rawPrompt: string) => {
    const text = rawPrompt.trim();
    if (!text || assistantLoading) return;

    setAssistantOpen(true);
    setAssistantMinimized(false);
    onAssistantOpenChange?.(true);
    setAssistantLoading(true);

    setAssistantMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-user`,
        role: "user",
        text,
      },
    ]);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        intent?: string;
        error?: string;
        blocks?: AssistantBlock[];
      };

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Unable to process your request right now.");
      }

      const assistantText = String(data.message || "I received your request.");
      const blocks = Array.isArray(data.blocks) ? data.blocks : [];

      setAssistantMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: assistantText,
          blocks,
        },
      ]);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Unable to process your request right now.";

      setAssistantMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          text: `Sorry, ${message}`,
        },
      ]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const closeAssistantPanel = () => {
    setAssistantOpen(false);
    setAssistantMinimized(false);
    setAssistantLoading(false);
    onAssistantOpenChange?.(false);
  };

  const assistantPanel = (
        <div
          className="assistant-dock"
          role="region"
          aria-label="Employee Assistant conversation"
        >
          <div className="assistant-head">
            <div className="assistant-head-identity">
              <AssistantMark />
              <div>
                <h4 className="assistant-head-title">Employee Assistant</h4>
                <p className="assistant-head-label">AI-powered help for your workplace</p>
              </div>
            </div>
            <div className="assistant-actions">
              <button
                className="assistant-head-btn"
                type="button"
                onClick={() => {
                  setAssistantMinimized(true);
                  onAssistantOpenChange?.(false);
                }}
              >
                Minimize
              </button>
              <button
                className="assistant-head-btn danger"
                type="button"
                aria-label="Close assistant"
                onClick={closeAssistantPanel}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="ai-conversation">
            {assistantMessages.map((message) => (
              <div
                key={message.id}
                className={`ai-row ${message.role === "user" ? "user" : "assistant"}`}
              >
                {message.role === "assistant" && <AssistantMark />}
                <div className={`ai-msg ${message.role === "user" ? "user" : "assistant"}`}>
                  {message.role === "user" ? (
                    <p>{message.text}</p>
                  ) : (
                    <AssistantRichContent
                      text={message.text}
                      blocks={message.blocks}
                      onNavigate={onChangeView}
                    />
                  )}
                </div>
              </div>
            ))}

            {assistantLoading && (
              <div className="ai-row assistant" aria-live="polite">
                <AssistantMark />
                <div className="ai-msg assistant loading">
                  <p>
                    <span className="loading-dots">Thinking</span>
                  </p>
                </div>
              </div>
            )}

            <div ref={conversationEndRef} />
          </div>

          <form
            className="assistant-inputbar"
            onSubmit={(event) => {
              event.preventDefault();
              const value = assistantInput;
              setAssistantInput("");
              submitAssistantPrompt(value);
            }}
          >
            <input
              type="text"
              value={assistantInput}
              onChange={(event) => setAssistantInput(event.target.value)}
              placeholder="Ask a follow-up question..."
              className="assistant-input"
              aria-label="Follow-up prompt"
              disabled={assistantLoading}
            />
            <button
              type="submit"
              className="assistant-send"
              aria-label="Send follow-up"
              disabled={assistantLoading || !assistantInput.trim()}
            >
              →
            </button>
          </form>
        </div>
  );

  return (
    <div className="center-wrapper">
      {/* ======== QUICK CONSOLE (AI band — the one place cyan appears) ======== */}
      <div className="ai-band">
        <div className="ai-top">
          <p className="ai-kicker">EMPLOYEE AI ASSISTANT</p>
          <h3 className="ai-heading">{greetingForNow()}, {employeeName}. What can I help you with today?</h3>
        </div>
        <form
          className="omni"
          onSubmit={(event) => {
            event.preventDefault();
            const value = heroInput;
            setHeroInput("");
            submitAssistantPrompt(value);
          }}
        >
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
          <input
            type="text"
            value={heroInput}
            onChange={(event) => setHeroInput(event.target.value)}
            placeholder="Ask anything or get something done..."
            className="omni-input"
            aria-label="Employee AI Assistant input"
            disabled={assistantLoading}
          />
          <button
            type="submit"
            className="omni-submit"
            disabled={assistantLoading || !heroInput.trim()}
          >
            {assistantLoading ? "Thinking..." : "Ask"}
          </button>
        </form>

        {assistantMinimized && assistantMessages.length > 0 && (
          <button
            className="assistant-resume"
            type="button"
            onClick={() => {
              setAssistantOpen(true);
              setAssistantMinimized(false);
              onAssistantOpenChange?.(true);
            }}
          >
            Resume conversation
          </button>
        )}
      </div>

      {assistantOpen && !assistantMinimized && (
        panelSlot ? createPortal(assistantPanel, panelSlot) : assistantPanel
      )}

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
          {allowedApps.map((app, i) => (
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
          background-color: #0E2248;
          color: #ffffff;
          position: relative;
          overflow: hidden;
        }
        .ai-band::before {
          content: "";
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 52%;
          background-image:
            linear-gradient(rgba(148, 187, 232, 0.11) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 187, 232, 0.11) 1px, transparent 1px);
          background-size: 36px 36px;
          background-position: -1px -1px;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 28%);
          mask-image: linear-gradient(to right, transparent 0%, #000 28%);
          pointer-events: none;
        }
        .ai-top {
          position: relative;
          z-index: 1;
          margin-bottom: 10px;
        }
        .ai-kicker {
          margin: 0 0 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ad-ai-cyan);
        }
        .ai-heading {
          margin: 0;
          font-size: 23px;
          line-height: 1.2;
          font-weight: 700;
          letter-spacing: 0.01em;
          color: #ffffff;
          max-width: 58%;
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
          max-width: 58%;
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
        .omni-input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          color: #ffffff;
          font-size: 13.5px;
          font-family: inherit;
        }
        .omni-input::placeholder {
          color: rgba(255, 255, 255, 0.62);
        }
        .omni .ic {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
          color: var(--ad-ai-cyan);
        }
        .omni-submit {
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          border-radius: 8px;
          font-size: 12px;
          padding: 6px 10px;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .omni-submit:hover:enabled {
          background: rgba(255, 255, 255, 0.2);
        }
        .omni-submit:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
        .chips {
          position: relative;
          z-index: 1;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
          max-width: 58%;
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
        .legacy-chips {
          margin-top: 8px;
        }
        .assistant-resume {
          margin-top: 12px;
          border: 1px solid rgba(255, 255, 255, 0.28);
          background: rgba(255, 255, 255, 0.14);
          color: #ffffff;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          padding: 9px 12px;
          cursor: pointer;
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
          .ai-band::before { width: 100%; }
          .ai-heading,
          .omni,
          .chips { max-width: 100%; }
          .ai-heading { font-size: 19px; }
          .ai-brief { font-size: 14px; }
          .omni {
            padding: 10px 11px;
            gap: 8px;
          }
          .omni-submit {
            padding: 6px 8px;
            font-size: 11px;
          }
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
      <style jsx global>{`
        .assistant-dock {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 0;
          z-index: 20;
          border-radius: 18px;
          border: 1px solid #E2E8F0;
          background: #ffffff;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .assistant-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
          padding: 16px 16px 14px;
          border-bottom: 1px solid #E2E8F0;
          background: #ffffff;
          flex-shrink: 0;
        }
        .assistant-head-identity {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          min-width: 0;
        }
        .assistant-mark {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          background: rgba(6, 182, 212, 0.12);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .assistant-head-title {
          margin: 0;
          font-size: 16px;
          line-height: 1.2;
          color: #1F3A68;
          font-weight: 700;
        }
        .assistant-head-label {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
          font-weight: 500;
          text-transform: none;
          letter-spacing: 0;
        }
        .assistant-actions {
          display: inline-flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .assistant-head-btn {
          border: 1px solid #E2E8F0;
          background: #f8fafc;
          color: #1F3A68;
          border-radius: 8px;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }
        .assistant-head-btn.danger {
          border-color: rgba(242, 101, 34, 0.42);
          color: #F26522;
          background: #fff7ed;
          min-width: 32px;
        }
        .assistant-dock .ai-conversation {
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 16px;
          background: #F8FAFC;
        }
        .assistant-dock .ai-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
        }
        .assistant-dock .ai-row.user {
          justify-content: flex-end;
        }
        .assistant-dock .ai-msg {
          max-width: 84%;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid transparent;
          line-height: 1.45;
        }
        .assistant-dock .ai-msg.user {
          background: rgba(6, 182, 212, 0.16);
          color: #1F3A68;
          border-color: rgba(6, 182, 212, 0.22);
          border-top-right-radius: 4px;
        }
        .assistant-dock .ai-msg.assistant {
          background: #ffffff;
          color: #0f172a;
          border-color: #E2E8F0;
          border-top-left-radius: 4px;
        }
        .assistant-dock .ai-msg p {
          margin: 0 0 6px;
          font-size: 13px;
        }
        .assistant-dock .ai-msg p:last-child {
          margin-bottom: 0;
        }
        .assistant-dock .ai-msg ul {
          margin: 0;
          padding-left: 16px;
          display: grid;
          gap: 6px;
          font-size: 13px;
        }
        .assistant-dock .ai-msg.loading p {
          color: #334155;
        }
        .assistant-dock .loading-dots::after {
          content: "";
          display: inline-block;
          width: 0;
          overflow: hidden;
          vertical-align: bottom;
          animation: assistantDots 1.1s steps(3, end) infinite;
        }
        @keyframes assistantDots {
          0% { width: 0; }
          100% { width: 1.2em; }
        }
        .assistant-inputbar {
          border-top: 1px solid #E2E8F0;
          padding: 12px;
          background: #ffffff;
          display: flex;
          gap: 8px;
          position: sticky;
          bottom: 0;
          flex-shrink: 0;
        }
        .assistant-input {
          flex: 1;
          min-width: 0;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 11px 14px;
          font-size: 13px;
          outline: none;
          color: #0f172a;
          background: #ffffff;
        }
        .assistant-input:focus {
          border-color: #06B6D4;
          box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.16);
        }
        .assistant-send {
          border: none;
          background: #F26522;
          color: #ffffff;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          min-width: 44px;
          cursor: pointer;
        }
        .assistant-send:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
        html[data-theme="dark"] .assistant-dock {
          background: #0f172a;
          border-color: #334155;
        }
        html[data-theme="dark"] .assistant-head,
        html[data-theme="dark"] .assistant-inputbar {
          background: #0f172a;
          border-color: #334155;
        }
        html[data-theme="dark"] .assistant-head-title {
          color: #e2e8f0;
        }
        html[data-theme="dark"] .assistant-head-label {
          color: #94a3b8;
        }
        html[data-theme="dark"] .assistant-head-btn {
          background: #1e293b;
          border-color: #334155;
          color: #e2e8f0;
        }
        html[data-theme="dark"] .assistant-dock .ai-conversation {
          background: #0b1220;
        }
        html[data-theme="dark"] .assistant-dock .ai-msg.assistant {
          background: #111827;
          border-color: #334155;
          color: #e2e8f0;
        }
        html[data-theme="dark"] .assistant-dock .ai-msg.user {
          background: rgba(6, 182, 212, 0.18);
          color: #e2e8f0;
        }
        html[data-theme="dark"] .assistant-input {
          background: #111827;
          border-color: #334155;
          color: #e2e8f0;
        }
        @media (max-width: 768px) {
          .assistant-dock {
            position: fixed;
            top: 58px;
            left: 0;
            right: 0;
            width: 100vw;
            min-width: 0;
            height: calc(100dvh - 58px);
            z-index: 40;
            border-radius: 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
          }
        }
      `}</style>
    </div>
  );
}
