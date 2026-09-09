"use client";
import { useEffect, useState } from "react";
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
  faPenToSquare,
  faFilePen,
} from "@fortawesome/free-solid-svg-icons";
import { faLinkedin } from "@fortawesome/free-brands-svg-icons";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

type SidebarView =
  | "home"
  | "holiday"
  | "events"
  | "learning"
  | "articles"
  | "corner"
  | "portal"
  | "articleManage";

type SidebarProps = {
  activeView: SidebarView;
  onChange: (view: SidebarView) => void;
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
  const [isHr, setIsHr] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me");
        if (!r.ok) return;
        const d = await r.json();
        setIsHr(
          Array.isArray(d?.roles) &&
            d.roles.some((role: string) => String(role).toLowerCase() === "hr"),
        );
      } catch {}
    })();
  }, []);

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
    ...(isHr
      ? [
          {
            key: "portal" as const,
            icon: faPenToSquare,
            label: "Portal Content",
            onClick: () => onChange("portal"),
          },
          {
            key: "articleManage" as const,
            icon: faFilePen,
            label: "Article Management",
            onClick: () => onChange("articleManage"),
          },
        ]
      : []),
  ];

  return (
    <>
      <aside
        className={`sidebar ${expanded ? "expanded" : "collapsed"} ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className={`sidebar-brand ${expanded ? "" : "brand-collapsed"}`}>
          <Image
            src={expanded ? "/image.png" : "/logoshort.png"}
            alt="Adroitent logo"
            width={expanded ? 172 : 40}
            height={expanded ? 26 : 40}
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
                >
                  <div className="icon-box">
                    <FontAwesomeIcon icon={item.icon} />
                  </div>
                  {/* On mobile, always show labels (sidebar is always expanded in overlay) */}
                  <span
                    className={`label-text ${expanded ? "" : "desktop-hidden"}`}
                  >
                    {item.label}
                  </span>
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
                <span className="li-sub">LinkedIn</span>
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
        /* ===== Quiet Console sidebar: white surface, hairline border, navy text ===== */
        .sidebar {
          position: relative;
          height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px 12px 16px;
          overflow: visible;
          transition: width var(--motion-base) var(--motion-ease), background var(--motion-base) var(--motion-ease);
          background: var(--bg-card-solid);
          border-right: 1px solid var(--border);
        }
        .sidebar.expanded {
          width: var(--sidebar-w-open);
        }
        .sidebar.collapsed {
          width: var(--sidebar-w-closed);
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          min-height: 40px;
          margin: 2px 8px 18px;
          padding: 0 4px;
          overflow: hidden;
        }
        .sidebar-brand.brand-collapsed {
          justify-content: center;
          margin: 2px 0 18px;
          padding: 0;
        }
        .brand-logo {
          display: block;
          height: auto;
          object-fit: contain;
        }

        /* ---- Toggle ---- */
        .toggle-btn {
          position: absolute;
          top: 20px;
          right: -13px;
          width: 26px;
          height: 26px;
          background: var(--bg-card-solid);
          border: 1px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(31, 58, 104, 0.14);
          color: var(--text-primary);
          transition: all 0.2s ease;
          z-index: 60;
        }
        .toggle-btn:hover {
          background: var(--ad-orange);
          border-color: var(--ad-orange);
          color: #ffffff;
        }

        /* ---- Nav ---- */
        .nav-section {
          flex: 1;
          padding-top: 4px;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        li {
          position: relative;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          color: var(--text-secondary);
          transition: background 150ms ease, color 150ms ease;
        }
        li:hover {
          background: var(--bg-soft);
          color: var(--text-primary);
        }
        li.active {
          background: var(--accent-light);
          color: var(--ad-orange);
          font-weight: 600;
        }

        .icon-box {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
          color: inherit;
          opacity: 0.85;
        }
        li.active .icon-box {
          opacity: 1;
        }

        .label-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .desktop-hidden {
          display: none;
        }

        /* ---- Footer ---- */
        .sidebar-footer {
          padding-top: 14px;
          border-top: 1px solid var(--border);
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
          border-radius: 8px;
          border: 1px solid var(--border);
          background: transparent;
          text-decoration: none;
          cursor: pointer;
          transition: background 150ms ease;
          color: var(--text-primary);
        }
        .linkedin-row:hover {
          background: var(--bg-soft);
        }
        .li-icon-wrap {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: #0a66c2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        :global(.li-icon) {
          color: white;
          font-size: 13px;
        }
        .li-sub {
          flex: 1;
          font-size: 13px;
          color: var(--text-primary);
          font-weight: 600;
        }
        .li-arrow {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /* LinkedIn icon (collapsed) */
        .li-icon-collapsed {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #0a66c2;
          color: white;
          font-size: 14px;
          text-decoration: none;
          margin: 0 auto;
        }

        .footer-divider {
          display: none;
        }

        .status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          color: var(--text-secondary);
          padding: 0 2px;
        }
        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #22c55e;
        }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .sidebar {
            width: 100% !important;
            height: 100%;
            padding: 70px 14px 18px;
          }
          .toggle-btn {
            display: none;
          }
          .desktop-hidden {
            display: inline;
          }
          li {
            padding: 12px 12px;
            font-size: 14px;
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