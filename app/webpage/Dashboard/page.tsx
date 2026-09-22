"use client";

import { useState, useEffect, useCallback } from "react";

import Centercontent from "../Components/centercontent/centercontent";
import RightPanel from "../Components/Rightpanel/rightpanel";
import Header from "../Components/Header/Header";
import { canManagePortal } from "@/app/lib/permissions";

function DashboardLoader() {
  return (
    <div className="loader">
      <div className="loader-ring">
        <div className="spinner" />
      </div>
      <p>Loading dashboard…</p>

      <style jsx>{`
        .loader {
          height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #f8f4ef;
          color: var(--ad-navy);
          gap: 18px;
        }
        .loader-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #1f3a68;
          padding: 4px;
          animation: spin 1.2s linear infinite;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .spinner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #f8f4ef;
        }
        p {
          font-size: 14px;
          letter-spacing: 0.5px;
          opacity: 0.85;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

type DashboardView =
  | "home"
  | "holiday"
  | "events"
  | "learning"
  | "articles"
  | "corner"
  | "managePortal"
  | "portal"
  | "articleManage";

const ADMIN_VIEWS = new Set<DashboardView>([
  "managePortal",
  "portal",
  "articleManage",
]);

function parseViewParam(value: string | null): DashboardView | null {
  if (!value) return null;
  const map: Record<string, DashboardView> = {
    home: "home",
    holiday: "holiday",
    holidays: "holiday",
    events: "events",
    learning: "learning",
    articles: "articles",
    corner: "corner",
    "employee-corner": "corner",
    "manage-portal": "managePortal",
    manageportal: "managePortal",
    portal: "portal",
    "portal-content": "portal",
    "article-manage": "articleManage",
    "article-management": "articleManage",
  };
  return map[value.toLowerCase()] ?? null;
}

function viewToParam(view: DashboardView): string {
  const map: Record<DashboardView, string> = {
    home: "home",
    holiday: "holiday",
    events: "events",
    learning: "learning",
    articles: "articles",
    corner: "corner",
    managePortal: "manage-portal",
    portal: "portal-content",
    articleManage: "article-management",
  };
  return map[view];
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [rolesReady, setRolesReady] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(window.location.search);
    const fromUrl = parseViewParam(params.get("view"));
    const fromPostId = params.get("postId");
    if (fromUrl) setActiveView(fromUrl);
    setHighlightedPostId(fromPostId);
  }, [mounted]);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ postId?: string | null }>;
      const postId = customEvent?.detail?.postId ?? null;
      setHighlightedPostId(postId);
      setActiveView("corner");
    };

    window.addEventListener("adroitent:open-corner-post", handler as EventListener);
    return () => {
      window.removeEventListener(
        "adroitent:open-corner-post",
        handler as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    (async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json().catch(() => ({}));
        setCanManage(canManagePortal(data?.roles));
      } catch {
        setCanManage(false);
      } finally {
        setRolesReady(true);
      }
    })();
  }, [mounted]);

  useEffect(() => {
    if (!rolesReady) return;
    if (ADMIN_VIEWS.has(activeView) && !canManage) {
      setActiveView("home");
    }
  }, [rolesReady, canManage, activeView]);

  const handleViewChange = useCallback(
    (view: DashboardView) => {
      if (ADMIN_VIEWS.has(view) && rolesReady && !canManage) {
        setActiveView("home");
        return;
      }
      setActiveView(view);
    },
    [rolesReady, canManage],
  );

  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (activeView === "home") {
      url.searchParams.delete("view");
      url.searchParams.delete("postId");
    } else {
      url.searchParams.set("view", viewToParam(activeView));
      if (activeView !== "corner") {
        url.searchParams.delete("postId");
      }
    }
    window.history.replaceState({}, "", url.toString());
  }, [activeView, mounted]);

  if (!mounted) return <DashboardLoader />;

  return (
    <>
      <div className="dashboard-page">
        <div className="dashboard-header">
          <Header activeView={activeView} onChange={handleViewChange} />
        </div>

        <div
          className={`dashboard-layout ${activeView === "corner" ? "no-right" : ""}`}
        >
          <div className="center-scroll-wrapper">
            <div className="center-column">
              <Centercontent
                activeView={activeView}
                highlightedPostId={highlightedPostId}
                onChangeView={handleViewChange}
              />
            </div>
          </div>

          {activeView !== "corner" && (
            <div className="right-col">
              <RightPanel />
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            sans-serif;
          -webkit-font-smoothing: antialiased;
          margin: 0;
        }

        .dashboard-page {
          min-height: 100vh;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--bg-page);
          color: var(--text-primary);
          position: relative;
        }

        .dashboard-header {
          height: var(--header-h);
          flex-shrink: 0;
          position: relative;
          z-index: 10;
          width: 100%;
        }

        .dashboard-layout {
          display: grid;
          flex: 1;
          grid-template-columns: minmax(0, 1fr) var(--right-w);
          grid-template-rows: 1fr;
          height: 100%;
          min-height: 0;
          width: 100%;
          gap: 16px;
          padding: 16px;
          position: relative;
          overflow: hidden;
          align-items: stretch;
          justify-items: stretch;
        }

        .dashboard-layout.no-right {
          grid-template-columns: minmax(0, 1fr);
        }

        .center-scroll-wrapper {
          display: flex;
          flex: 1;
          height: 100%;
          min-height: 0;
          overflow: hidden;
          position: relative;
          padding-right: 6px;
          align-self: stretch;
        }

        .center-column {
          flex: 1;
          min-width: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 6px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .center-column::-webkit-scrollbar {
          width: 5px;
        }
        .center-column::-webkit-scrollbar-track {
          background: transparent;
        }
        .center-column::-webkit-scrollbar-thumb {
          background: rgba(31, 58, 104, 0.22);
          border-radius: 10px;
        }
        .center-column::-webkit-scrollbar-thumb:hover {
          background: rgba(242, 101, 34, 0.42);
        }

        .right-col {
          height: 100%;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          align-self: stretch;
        }
        .right-col::-webkit-scrollbar {
          width: 0;
        }

        .glass-card {
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid var(--glass-border);
          border-radius: 12px;
          box-shadow: var(--shadow-sm);
          transition:
            box-shadow var(--motion-base) var(--motion-ease),
            transform var(--motion-base) var(--motion-ease);
        }
        .glass-card:hover {
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 768px) {
          .dashboard-page {
            min-height: 100dvh;
            height: 100dvh;
          }

          .dashboard-header {
            height: 58px;
            flex: 0 0 58px;
          }

          .dashboard-layout,
          .dashboard-layout.no-right {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            gap: 0;
            padding: 8px;
            width: 100%;
            max-width: 100%;
            height: calc(100dvh - 58px);
            min-height: calc(100dvh - 58px);
            flex: 0 0 calc(100dvh - 58px);
            overflow: hidden;
          }

          .center-scroll-wrapper {
            width: 100%;
            min-width: 0;
            height: 100%;
            max-height: 100%;
            overflow: hidden;
            padding-right: 0;
          }
          .center-column {
            width: 100%;
            min-width: 0;
            height: 100%;
            max-height: 100%;
            padding-right: 0;
            padding-bottom: calc(16px + env(safe-area-inset-bottom));
            gap: 14px;
            overflow-y: auto;
            overflow-x: hidden;
          }

          .right-col {
            height: auto;
            overflow: visible;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
