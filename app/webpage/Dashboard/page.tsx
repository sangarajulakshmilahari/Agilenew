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
          background: linear-gradient(135deg, #0f0c29, #1a1a40, #24243e);
          color: #e5e7eb;
          gap: 18px;
        }
        .loader-ring {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: conic-gradient(
            from 0deg,
            transparent 0%,
            #7c3aed 30%,
            #a78bfa 60%,
            transparent 100%
          );
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
          background: #1a1a40;
        }
        p {
          font-size: 14px;
          letter-spacing: 0.5px;
          opacity: 0.7;
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

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeView, setActiveView] = useState<
    "home" | "holiday" | "events" | "learning" | "articles" | "corner"
  >("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile sidebar when view changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [activeView]);

  if (!mounted) return <DashboardLoader />;

  return (
    <>
      <div className="dashboard-page">
        {/* Animated background */}
        <div className="bg-layer">
          <div className="bg-blob blob-1" />
          <div className="bg-blob blob-2" />
          <div className="bg-blob blob-3" />
          <div className="bg-grid" />
          <div className="bg-shimmer" />
        </div>

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
              onChange={setActiveView}
              open={sidebarOpen}
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

        /* ===== ANIMATED BACKGROUND ===== */
        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(124, 58, 237, 0.03) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(124, 58, 237, 0.03) 1px,
              transparent 1px
            );
          background-size: 48px 48px;
          mask-image: radial-gradient(
            ellipse at 50% 30%,
            black 30%,
            transparent 70%
          );
          -webkit-mask-image: radial-gradient(
            ellipse at 50% 30%,
            black 30%,
            transparent 70%
          );
        }

        .bg-shimmer {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(124, 58, 237, 0.03) 60deg,
            transparent 120deg,
            rgba(99, 102, 241, 0.02) 240deg,
            transparent 360deg
          );
          animation: shimmerRotate 40s linear infinite;
        }

        @keyframes shimmerRotate {
          to {
            transform: rotate(360deg);
          }
        }

        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          opacity: 0.3;
        }

        .blob-1 {
          width: 520px;
          height: 520px;
          background: radial-gradient(circle, #c084fc, transparent 70%);
          top: -140px;
          right: -100px;
          animation: blobA 22s ease-in-out infinite;
        }
        .blob-2 {
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, #60a5fa, transparent 70%);
          bottom: -100px;
          left: -80px;
          animation: blobA 28s ease-in-out infinite reverse;
        }
        .blob-3 {
          width: 320px;
          height: 320px;
          background: radial-gradient(circle, #a78bfa, transparent 70%);
          top: 45%;
          left: 38%;
          animation: blobA 34s ease-in-out infinite 4s;
        }

        @keyframes blobA {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(40px, -30px) scale(1.06);
          }
          50% {
            transform: translate(-20px, 30px) scale(0.94);
          }
          75% {
            transform: translate(30px, 10px) scale(1.03);
          }
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
          padding: 14px;
          position: relative;
          z-index: 1;
          overflow: hidden; /* no scroll on grid itself */
          transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          align-items: stretch;
          justify-items: stretch;
        }

        .dashboard-layout.sidebar-open {
          grid-template-columns: var(--sidebar-w-open) minmax(0, 1fr) var(
              --right-w
            );
        }
        .dashboard-layout.sidebar-closed {
          grid-template-columns: var(--sidebar-w-closed) minmax(0, 1fr) var(
              --right-w
            );
        }
        .dashboard-layout.sidebar-open.no-right {
          grid-template-columns: var(--sidebar-w-open) minmax(0, 1fr);
        }
        .dashboard-layout.sidebar-closed.no-right {
          grid-template-columns: var(--sidebar-w-closed) minmax(0, 1fr);
        }

        /* --- Sidebar column --- */
        .sidebar-col {
          height: 100%;
          min-height: 0;
          overflow: visible;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-self: stretch;
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
          background: rgba(124, 58, 237, 0.18);
          border-radius: 10px;
        }
        .center-column::-webkit-scrollbar-thumb:hover {
          background: rgba(124, 58, 237, 0.32);
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
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          transition:
            box-shadow 0.3s ease,
            transform 0.3s ease;
        }
        .glass-card:hover {
          box-shadow: var(--shadow-md);
        }

        /* ===== MOBILE RESPONSIVE ===== */
        @media (max-width: 768px) {
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
            overflow-y: auto;
            overflow-x: hidden;
          }
          .center-column {
            padding-right: 0;
            gap: 14px;
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

      `}</style>
    </>
  );
}
