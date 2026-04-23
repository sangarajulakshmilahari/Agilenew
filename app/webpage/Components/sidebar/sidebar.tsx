"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faCalendar,
  faGraduationCap,
  faNewspaper,
  faChevronLeft,
  faChevronRight,
  faCalendarCheck,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

type SidebarProps = {
  activeView:
    | "home"
    | "holiday"
    | "events"
    | "learning"
    | "articles"
    | "corner";
  onChange: (
    view: "home" | "holiday" | "events" | "learning" | "articles" | "corner",
  ) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LINKEDIN_URL = "https://www.linkedin.com/company/adroitent/";

export default function Sidebar({
  activeView,
  onChange,
  open,
  setOpen,
}: SidebarProps) {
  const menuItems = [
    {
      key: "home" as const,
      icon: faHouse,
      label: "Home",
      onClick: () => onChange("home"),
    },
    {
      key: "events" as const,
      icon: faCalendar,
      label: "Events",
      onClick: () => onChange("events"),
    },
    {
      key: "holiday" as const,
      icon: faCalendarCheck,
      label: "Holiday Calendar",
      onClick: () => onChange("holiday"),
    },
    {
      key: "learning" as const,
      icon: faGraduationCap,
      label: "Learning & Dev",
      onClick: () => onChange("learning"),
    },
    {
      key: "articles" as const,
      icon: faNewspaper,
      label: "Featured Articles",
      onClick: () => onChange("articles"),
    },
    {
      key: "corner" as const,
      icon: faUsers,
      label: "Employee Corner",
      onClick: () => onChange("corner"),
    },
  ];

  return (
    <>
      <aside className={`sidebar ${open ? "expanded" : "collapsed"}`}>
        <div className="sidebar-bg">
          <div className="sb-gradient" />
          <div className="sb-orb sb-orb-1" />
          <div className="sb-orb sb-orb-2" />
          <div className="sb-shimmer" />
        </div>

        {/* Toggle — hidden on mobile */}
        <button className="toggle-btn" onClick={() => setOpen(!open)}>
          <FontAwesomeIcon
            icon={open ? faChevronLeft : faChevronRight}
            style={{ fontSize: 10 }}
          />
        </button>

        {/* Menu */}
        <nav className="nav-section">
          <ul>
            {menuItems.map((item, i) => {
              const isActive = activeView === item.key;
              return (
                <li
                  key={i}
                  className={isActive ? "active" : ""}
                  onClick={item.onClick}
                  title={!open ? item.label : undefined}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`icon-box ${isActive ? "icon-active" : ""}`}>
                    <FontAwesomeIcon icon={item.icon} />
                    {isActive && <div className="icon-ring" />}
                  </div>
                  {/* On mobile, always show labels (sidebar is always expanded in overlay) */}
                  <span
                    className={`label-text ${open ? "" : "desktop-hidden"}`}
                  >
                    {item.label}
                  </span>
                  {isActive && <div className="active-glow" />}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {open ? (
            <>
              {/* LinkedIn row */}
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-row"
                title="Adroitent on LinkedIn"
              >
                <div className="li-icon-wrap">
                  <FontAwesomeIcon icon={faLinkedin} className="li-icon" />
                </div>
                <div className="li-text">
                  <span className="li-sub">LinkedIn</span>
                </div>
                <span className="li-arrow">↗</span>
              </a>

              <div className="footer-divider" />

              <div className="status-row">
                <span className="status-dot" />
                <span>V 26.1</span>
              </div>
            </>
          ) : (
            /* Collapsed: just show LinkedIn icon */
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="li-icon-collapsed"
              title="Adroitent on LinkedIn"
            >
              <FontAwesomeIcon icon={faLinkedin} />
            </a>
          )}
        </div>
      </aside>

      <style jsx>{`
        .sidebar {
          position: relative;
          height: 100%;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          padding: 18px 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(124, 58, 237, 0.1);
          box-shadow: var(--shadow-sm);
        }
        .sidebar.expanded {
          width: var(--sidebar-w-open);
        }
        .sidebar.collapsed {
          width: var(--sidebar-w-closed);
        }

        /* ---- Animated background ---- */
        .sidebar-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          border-radius: inherit;
        }
        .sb-gradient {
          position: absolute;
          inset: 0;
          background: var(--bg-card);
        }
        .sb-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(35px);
          opacity: 0.5;
        }
        .sb-orb-1 {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, #c4b5fd, transparent 70%);
          top: -20px;
          right: -30px;
          animation: sideOrb1 14s ease-in-out infinite;
        }
        .sb-orb-2 {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, #a5b4fc, transparent 70%);
          bottom: 60px;
          left: -20px;
          animation: sideOrb2 18s ease-in-out infinite;
        }
        @keyframes sideOrb1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-10px, 20px) scale(1.15);
          }
        }
        @keyframes sideOrb2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(10px, -15px) scale(1.1);
          }
        }
        .sb-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            transparent 0%,
            rgba(124, 58, 237, 0.03) 40%,
            rgba(168, 85, 247, 0.04) 50%,
            rgba(124, 58, 237, 0.03) 60%,
            transparent 100%
          );
          background-size: 100% 300%;
          animation: shimmerVert 10s ease-in-out infinite;
        }
        @keyframes shimmerVert {
          0% {
            background-position: 0% 100%;
          }
          50% {
            background-position: 0% 0%;
          }
          100% {
            background-position: 0% 100%;
          }
        }

        /* ---- Toggle ---- */
        .toggle-btn {
          position: absolute;
          top: 16px;
          right: -12px;
          width: 24px;
          height: 24px;
          background: var(--bg-card-solid);
          border: 1px solid rgba(124, 58, 237, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
          color: var(--accent);
          transition: all 0.25s ease;
          z-index: 5;
        }
        .toggle-btn:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          transform: scale(1.15);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        }

        /* ---- Nav ---- */
        .nav-section {
          flex: 1;
          padding-top: 6px;
          position: relative;
          z-index: 1;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        li {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 9px 10px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: all 0.25s ease;
          animation: menuFadeIn 0.35s ease backwards;
          overflow: hidden;
        }
        @keyframes menuFadeIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        li:hover {
          background: rgba(124, 58, 237, 0.06);
          color: var(--text-primary);
        }
        li:hover .icon-box:not(.icon-active) {
          background: rgba(124, 58, 237, 0.1);
          color: var(--accent);
          transform: scale(1.05);
        }
        li.active {
          background: linear-gradient(
            135deg,
            rgba(124, 58, 237, 0.1) 0%,
            rgba(168, 85, 247, 0.08) 100%
          );
          color: var(--accent);
        }
        .active-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: inset 0 0 0 1px rgba(124, 58, 237, 0.12);
          pointer-events: none;
        }

        .icon-box {
          width: 36px;
          height: 36px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          background: var(--bg-soft);
          color: var(--text-secondary);
          transition: all 0.25s ease;
          position: relative;
        }
        .icon-active {
          background: var(--gradient-primary) !important;
          color: white !important;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        }
        .icon-ring {
          position: absolute;
          inset: -3px;
          border-radius: 14px;
          border: 2px solid rgba(168, 85, 247, 0.2);
          background: rgba(168, 85, 247, 0.02);
          animation: iconGlow 3.8s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes iconGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.14);
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
            box-shadow: 0 0 0 8px rgba(168, 85, 247, 0);
          }
        }

        li.active .label-text {
          color: var(--accent);
          font-weight: 700;
        }
        .label-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          animation: labelSlide 0.25s ease;
        }
        .desktop-hidden {
          display: none;
        }
        @keyframes labelSlide {
          from {
            opacity: 0;
            transform: translateX(-6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* ---- Footer ---- */
        .sidebar-footer {
          position: relative;
          z-index: 1;
          padding-top: 14px;
          border-top: 1px solid rgba(124, 58, 237, 0.08);
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        /* LinkedIn row (expanded) */
        .linkedin-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid rgba(10, 102, 194, 0.18);
          background: rgba(10, 102, 194, 0.05);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s ease;
          color: inherit;
        }
        .linkedin-row:hover {
          background: rgba(10, 102, 194, 0.12);
          border-color: rgba(10, 102, 194, 0.35);
          transform: translateX(3px);
          box-shadow: 0 4px 14px rgba(10, 102, 194, 0.15);
        }
        .li-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: linear-gradient(135deg, #0a66c2, #0073b1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(10, 102, 194, 0.3);
        }
        :global(.li-icon) {
          color: white;
          font-size: 15px;
        }
        .li-text {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .li-label {
          font-size: 12px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }
        .li-sub {
          font-size: 13px;
          color: #0a66c2;
          font-weight: 600;
        }
        .li-arrow {
          font-size: 13px;
          color: #0a66c2;
          opacity: 0.7;
          transition: transform 0.2s ease;
        }
        .linkedin-row:hover .li-arrow {
          transform: translate(2px, -2px);
          opacity: 1;
        }

        /* LinkedIn icon (collapsed) */
        .li-icon-collapsed {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 11px;
          background: linear-gradient(135deg, #0a66c2, #0073b1);
          color: white;
          font-size: 16px;
          text-decoration: none;
          margin: 0 auto;
          transition: all 0.25s ease;
          box-shadow: 0 2px 8px rgba(10, 102, 194, 0.3);
        }
        .li-icon-collapsed:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 14px rgba(10, 102, 194, 0.4);
        }

        .footer-divider {
          height: 1px;
          background: rgba(124, 58, 237, 0.08);
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
          padding: 0 8px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .sidebar {
            width: 100% !important;
            height: 100%;
            border-radius: 0;
            padding: 70px 14px 18px; /* top padding to clear header */
          }

          /* Hide the desktop toggle button on mobile */
          .toggle-btn {
            display: none;
          }

          /* Always show labels on mobile (sidebar is overlay, always expanded) */
          .desktop-hidden {
            display: inline;
          }

          /* Slightly larger tap targets */
          li {
            padding: 12px 12px;
            font-size: 14px;
          }
          .icon-box {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 1024px) {
          .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            height: 100vh;
            z-index: 100;
            transform: translateX(-100%);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
