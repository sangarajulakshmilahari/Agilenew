"use client";

import { useState, useEffect } from "react";

import Sidebar from "../Components/sidebar/sidebar";
import Centercontent from "../Components/centercontent/centercontent";
import RightPanel from "../Components/Rightpanel/rightpanel";
import Header from "../Components/Header/Header";

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
  | "portal"
  | "articleManage";

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleViewChange = (view: DashboardView) => {
    setActiveView(view);
    setMobileSidebarOpen(false);
  };

  if (!mounted) return <DashboardLoader />;

  return (
    <>
      <div className={`dashboard-page ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
        <div className="dashboard-header">
          <Header
            onHamburgerClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            mobileSidebarOpen={mobileSidebarOpen}
          />
        </div>

        {/* Mobile sidebar overlay */}
        {mobileSidebarOpen && (
          <div
            className="mobile-sidebar-overlay"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        <div
          className={`dashboard-layout ${sidebarOpen ? "sidebar-open" : "sidebar-closed"} ${activeView === "corner" ? "no-right" : ""}`}
        >
          <div
            className={`sidebar-col ${mobileSidebarOpen ? "mobile-open" : ""}`}
          >
            <Sidebar
              activeView={activeView}
              onChange={handleViewChange}
              open={sidebarOpen}
              mobileOpen={mobileSidebarOpen}
              setOpen={setSidebarOpen}
            />
          </div>

          <div className="center-scroll-wrapper">
            <div className="center-column">
              <Centercontent activeView={activeView} />
            </div>
            {/* Invisible spacer so scrollbar sits at far right */}
            <div className="scroll-spacer" />
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

        /* ===== PAGE SHELL ===== */
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

        .dashboard-page.sidebar-open .dashboard-header {
          margin-left: var(--sidebar-w-open);
          width: calc(100% - var(--sidebar-w-open));
        }
        .dashboard-page.sidebar-closed .dashboard-header {
          margin-left: var(--sidebar-w-closed);
          width: calc(100% - var(--sidebar-w-closed));
        }

        /* ===== HEADER ===== */
        .dashboard-header {
          height: var(--header-h);
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }

        /* ===== MOBILE SIDEBAR OVERLAY ===== */
        .mobile-sidebar-overlay {
          display: none;
        }

        /* ===== LAYOUT GRID ===== */
        .dashboard-layout {
          display: grid;
          flex: 1;
          grid-template-rows: 1fr;
          grid-auto-rows: 1fr;
          height: 100%;
          min-height: 0; /* key for nested scroll */
          width: 100%;
          gap: 16px;
          padding: 16px;
          position: relative;
          z-index: auto;
          overflow: hidden; /* no scroll on grid itself */
          transition:
            grid-template-columns var(--motion-base) var(--motion-ease),
            margin-left var(--motion-base) var(--motion-ease);
          align-items: stretch;
          justify-items: stretch;
        }

        .dashboard-layout.sidebar-open {
          grid-template-columns: minmax(0, 1fr) var(--right-w);
          margin-left: var(--sidebar-w-open);
          width: calc(100% - var(--sidebar-w-open));
        }
        .dashboard-layout.sidebar-closed {
          grid-template-columns: minmax(0, 1fr) var(--right-w);
          margin-left: var(--sidebar-w-closed);
          width: calc(100% - var(--sidebar-w-closed));
        }
        .dashboard-layout.sidebar-open.no-right {
          grid-template-columns: minmax(0, 1fr);
          margin-left: var(--sidebar-w-open);
          width: calc(100% - var(--sidebar-w-open));
        }
        .dashboard-layout.sidebar-closed.no-right {
          grid-template-columns: minmax(0, 1fr);
          margin-left: var(--sidebar-w-closed);
          width: calc(100% - var(--sidebar-w-closed));
        }

        /* --- Sidebar column --- */
        .sidebar-col {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          min-height: 100vh;
          overflow: visible;
          z-index: 120;
          display: flex;
          flex-direction: column;
        }
        .dashboard-layout.sidebar-open .sidebar-col {
          width: var(--sidebar-w-open);
        }
        .dashboard-layout.sidebar-closed .sidebar-col {
          width: var(--sidebar-w-closed);
        }

        /* --- Center scroll wrapper --- */
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
          padding-right: 6px; /* room for scrollbar */
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* hide default scrollbar, use a thin custom one */
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

        .scroll-spacer {
          display: none;
        } /* reserved if needed later */

        /* --- Right column --- */
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

        /* ===== GLASS CARD ===== */
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

        /* ===== MOBILE RESPONSIVE ===== */
        @media (max-width: 768px) {
          .dashboard-page {
            min-height: 100dvh;
            height: 100dvh;
          }

          .dashboard-header {
            height: 58px;
            flex: 0 0 58px;
          }

          /* Overlay backdrop */
          .mobile-sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(15, 23, 42, 0.4);
            backdrop-filter: blur(4px);
            z-index: 99;
            animation: fadeIn 0.2s ease;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          /* Switch to single column — no sidebar, no right panel in grid */
          .dashboard-layout.sidebar-open,
          .dashboard-layout.sidebar-closed {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
            gap: 0;
            padding: 8px;
            margin-left: 0;
            width: 100%;
            max-width: 100%;
            height: calc(100dvh - 58px);
            min-height: calc(100dvh - 58px);
            flex: 0 0 calc(100dvh - 58px);
            overflow: hidden;
          }

          .dashboard-page.sidebar-open .dashboard-header,
          .dashboard-page.sidebar-closed .dashboard-header {
            margin-left: 0;
            width: 100%;
          }

          /* Hide sidebar from flow, show as overlay when mobile-open */
          .sidebar-col {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 260px;
            height: 100vh;
            z-index: 100;
            padding: 14px;
            background: var(--bg-page);
          }
          .sidebar-col.mobile-open {
            display: block;
            animation: slideInLeft 0.25s ease;
          }
          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }

          /* Center content takes full width */
          .center-scroll-wrapper {
            width: 100%;
            min-width: 0;
            height: 100%;
            max-height: 100%;
            overflow: hidden;
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

          /* Right panel stacks below center content */
          .right-col {
            height: auto;
            overflow: visible;
          }
        }

        /* Tablet breakpoint */
        @media (min-width: 769px) and (max-width: 1024px) {
          .dashboard-layout.sidebar-open.no-right {
            grid-template-columns: var(--sidebar-w-open) minmax(0, 1fr);
          }
          .dashboard-layout.sidebar-closed.no-right {
            grid-template-columns: var(--sidebar-w-closed) minmax(0, 1fr);
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
