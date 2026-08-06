"use client";
import Image from "next/image";
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
  mobileOpen?: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const LINKEDIN_URL = "https://www.linkedin.com/company/adroitent/";

export default function Sidebar({
  activeView,
  onChange,
  open,
  mobileOpen = false,
  setOpen,
}: SidebarProps) {
  const expanded = open || mobileOpen;
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
      <aside className={`sidebar ${expanded ? "expanded" : "collapsed"} ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-bg">
          <div className="sb-gradient" />
          <div className="sb-orb sb-orb-1" />
          <div className="sb-orb sb-orb-2" />
          <div className="sb-mesh sb-mesh-bottom" />
          <div className="sb-dots sb-dots-bottom" />
          <div className="sb-bottom-glow" />
          <div className="sb-shimmer" />
        </div>

        <div className={`sidebar-brand ${expanded ? "" : "brand-collapsed"}`}>
          <Image
            src={expanded ? "/image.png" : "/logoshort.png"}
            alt="Adroitent logo"
            width={expanded ? 316 : 64}
            height={expanded ? 30 : 64}
            priority
            className="brand-logo"
          />
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
                  title={!expanded ? item.label : undefined}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`icon-box ${isActive ? "icon-active" : ""}`}>
                    <FontAwesomeIcon icon={item.icon} />
                    {isActive && <div className="icon-ring" />}
                  </div>
                  {/* On mobile, always show labels (sidebar is always expanded in overlay) */}
                  <span
                    className={`label-text ${expanded ? "" : "desktop-hidden"}`}
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
          {expanded ? (
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
          height: 100vh;
          border-radius: 0;
          display: flex;
          flex-direction: column;
          padding: 22px 12px 16px;
          overflow: visible;
          transition: all var(--motion-base) var(--motion-ease);
          border: 1px solid rgba(132, 161, 219, 0.24);
          box-shadow: 0 18px 34px rgba(7, 20, 49, 0.35);
          background: linear-gradient(180deg, #123a78 0%, #0d2f66 100%);
        }
        .sidebar.expanded {
          width: var(--sidebar-w-open);
        }
        .sidebar.collapsed {
          width: var(--sidebar-w-closed);
        }

        .sidebar-brand {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 62px;
          margin: 2px 8px 14px;
          padding: 4px 4px 6px;
          border-bottom: none;
          overflow: hidden;
        }
        .sidebar-brand.brand-collapsed {
          justify-content: center;
          margin: 4px 0 12px;
          padding: 2px 0 10px;
        }
        .brand-logo {
          display: block;
          height: auto;
          width: 360px;
          max-width: none;
          object-fit: contain;
          transform: scale(1.18);
          transform-origin: center;
        }
        .sidebar-brand.brand-collapsed .brand-logo {
          width: calc(var(--sidebar-w-closed) - 12px);
          max-width: 64px;
          transform: none;
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
          background: linear-gradient(180deg, #123a78 0%, #0d2f66 100%);
        }
        .sb-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(35px);
          opacity: 0.16;
        }
        .sb-orb-1 {
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(148, 187, 255, 0.09), transparent 70%);
          top: -20px;
          right: -30px;
          animation: none;
        }
        .sb-orb-2 {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(86, 142, 255, 0.07), transparent 70%);
          bottom: 60px;
          left: -20px;
          animation: none;
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
          background: linear-gradient(120deg, transparent 0%, rgba(255, 255, 255, 0.015) 35%, transparent 70%);
          background-size: 220% 220%;
          animation: none;
        }

        .sb-mesh {
          position: absolute;
          left: -18%;
          width: 78%;
          height: 42%;
          opacity: 0.06;
          background:
            repeating-radial-gradient(
              ellipse at 50% 115%,
              rgba(176, 198, 255, 0.5) 0px,
              rgba(176, 198, 255, 0.5) 1px,
              transparent 2px,
              transparent 10px
            );
          filter: drop-shadow(0 0 8px rgba(146, 191, 255, 0.12));
        }
        .sb-mesh-bottom {
          bottom: -10%;
          transform: rotate(-5deg) scaleX(-1);
          mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.95) 24%, transparent 86%);
          -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.95) 24%, transparent 86%);
          animation: meshFloat 24s ease-in-out infinite;
        }

        .sb-dots {
          position: absolute;
          opacity: 0.08;
          background-image: radial-gradient(circle, rgba(184, 221, 255, 0.92) 1.1px, transparent 1.2px);
          background-size: 11px 11px;
          filter: drop-shadow(0 0 6px rgba(170, 211, 255, 0.22));
        }
        .sb-dots-bottom {
          left: -4%;
          bottom: 1%;
          width: 72%;
          height: 30%;
          opacity: 0.06;
          mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.92) 30%, transparent 88%);
          -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.92) 30%, transparent 88%);
          animation: dotsDrift 26s linear infinite;
        }

        .sb-bottom-glow {
          position: absolute;
          left: -10%;
          right: -10%;
          bottom: -14%;
          height: 52%;
          background: radial-gradient(
            ellipse at 50% 100%,
            rgba(102, 165, 255, 0.14) 0%,
            rgba(82, 138, 243, 0.1) 38%,
            rgba(48, 95, 190, 0.04) 62%,
            transparent 84%
          );
          filter: blur(10px);
          animation: glowPulse 24s ease-in-out infinite;
        }

        @keyframes meshFloat {
          0% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          50% {
            transform: translateY(-9px) translateX(-4px) scale(1.05);
          }
          100% {
            transform: translateY(6px) translateX(3px) scale(0.98);
          }
        }

        @keyframes dotsDrift {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 30px -22px;
          }
        }

        @keyframes glowPulse {
          0%,
          100% {
            opacity: 0.68;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-4px) scale(1.05);
          }
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
          right: -15px;
          width: 30px;
          height: 30px;
          background: #ffffff;
          border: 2px solid #0b2b67;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow:
            0 8px 18px rgba(31, 58, 104, 0.3),
            0 2px 8px rgba(7, 20, 49, 0.24);
          color: #1f3a68;
          transition: all 0.25s ease;
          z-index: 60;
        }
        .toggle-btn:hover {
          background: #f26522;
          border: 2px solid #f26522;
          color: #ffffff;
          transform: scale(1.08);
          box-shadow:
            0 10px 20px rgba(242, 101, 34, 0.46),
            0 3px 10px rgba(7, 20, 49, 0.26);
        }
        .toggle-btn:active {
          transform: scale(0.96);
        }
        .sidebar.collapsed .toggle-btn {
          right: -15px;
        }

        /* ---- Nav ---- */
        .nav-section {
          flex: 1;
          padding-top: 2px;
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
          color: rgba(233, 241, 255, 0.9);
          transition: all 250ms ease;
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
          background: rgba(214, 230, 255, 0.12);
          color: #ffffff;
          box-shadow: 0 0 0 1px rgba(201, 221, 255, 0.12), 0 8px 18px rgba(8, 26, 61, 0.22);
        }
        li:hover .icon-box:not(.icon-active) {
          background: rgba(214, 230, 255, 0.2);
          color: #ffffff;
          transform: translateX(4px) scale(1.03);
        }
        li:hover .label-text {
          transform: translateX(2px);
        }
        li.active {
          background: linear-gradient(
            120deg,
            rgba(178, 206, 255, 0.24) 0%,
            rgba(169, 201, 255, 0.12) 100%
          );
          color: #ffffff;
          box-shadow: 0 8px 20px rgba(10, 28, 66, 0.38);
          border: 1px solid rgba(201, 221, 255, 0.32);
        }
        li.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 9px;
          bottom: 9px;
          width: 3px;
          border-radius: 0 6px 6px 0;
          background: #f26522;
          box-shadow: 0 0 10px rgba(242, 101, 34, 0.52);
        }
        .active-glow {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          box-shadow: inset 3px 0 0 0 #1f3a68;
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
          background: rgba(255, 255, 255, 0.12);
          color: rgba(233, 241, 255, 0.9);
          transition: all var(--motion-fast) var(--motion-ease);
          position: relative;
        }
        .icon-active {
          background: #f26522 !important;
          color: white !important;
          box-shadow: 0 6px 14px rgba(242, 101, 34, 0.34);
        }
        .icon-ring {
          position: absolute;
          inset: -3px;
          border-radius: 14px;
          border: 2px solid rgba(31, 58, 104, 0.35);
          background: rgba(31, 58, 104, 0.12);
          animation: iconGlow 2s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes iconGlow {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.9;
            box-shadow: 0 0 0 0 rgba(31, 58, 104, 0.22);
          }
          50% {
            transform: scale(1.04);
            opacity: 1;
            box-shadow: 0 0 0 8px rgba(31, 58, 104, 0);
          }
        }

        li.active .label-text {
          color: #ffffff;
          font-weight: 700;
        }
        .label-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          animation: labelSlide 0.25s ease;
          transition: transform 250ms ease;
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
          border-top: 1px solid rgba(218, 232, 255, 0.22);
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow: hidden;
        }

        .sidebar-footer::before {
          content: "";
          position: absolute;
          left: -22%;
          bottom: -42%;
          width: 84%;
          height: 145%;
          pointer-events: none;
          opacity: 0.02;
          background:
            radial-gradient(circle at 18% 82%, rgba(210, 228, 255, 0.9) 0.8px, transparent 1.2px),
            radial-gradient(circle at 36% 69%, rgba(210, 228, 255, 0.8) 0.8px, transparent 1.2px),
            radial-gradient(circle at 58% 80%, rgba(210, 228, 255, 0.8) 0.8px, transparent 1.2px),
            linear-gradient(130deg, transparent 28%, rgba(210, 228, 255, 0.7) 29%, transparent 31%),
            linear-gradient(160deg, transparent 42%, rgba(210, 228, 255, 0.65) 43%, transparent 45%);
          mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.95) 18%, transparent 90%);
          -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.95) 18%, transparent 90%);
          transform: translate3d(0, 0, 0);
          animation: meshFloat 28s ease-in-out infinite;
        }

        /* LinkedIn row (expanded) */
        .linkedin-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 12px;
          border: 1px solid rgba(218, 232, 255, 0.22);
          background: rgba(255, 255, 255, 0.1);
          text-decoration: none;
          cursor: pointer;
          transition: all 0.25s ease;
          color: #ffffff;
        }
        .linkedin-row:hover {
          background: rgba(255, 255, 255, 0.14);
          border-color: rgba(218, 232, 255, 0.35);
          transform: translateX(2px);
          box-shadow: 0 4px 14px rgba(8, 26, 61, 0.4);
        }
        .li-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: #0A66C2;
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
          color: #ffffff;
          font-weight: 600;
        }
        .li-arrow {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.84);
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
          background: #0A66C2;
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
          background: rgba(218, 232, 255, 0.22);
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: rgba(233, 241, 255, 0.86);
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

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
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
