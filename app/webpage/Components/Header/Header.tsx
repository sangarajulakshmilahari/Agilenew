"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../../../app/context/ThemeContext";
import { Sun, Moon, Menu, X } from "lucide-react";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

type HeaderProps = {
  onHamburgerClick?: () => void;
  mobileSidebarOpen?: boolean;
};

export default function Header({
  onHamburgerClick,
  mobileSidebarOpen,
}: HeaderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [introVisible, setIntroVisible] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) {
          setUsername("User");
          return;
        }
        const data = await res.json();
        setUsername(data.username);
      } catch {
        setUsername("User");
      }
    }
    fetchUser();
  }, []);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setIntroVisible(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  function handleLogout() {
    window.location.href = "/api/auth/logout";
  }

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const initials = (username ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="header">
        {/* LEFT */}
        <div className="header-left">
          {/* Hamburger button — visible only on mobile */}
          <button
            className="hamburger-btn"
            onClick={onHamburgerClick}
            title="Toggle menu"
          >
            {mobileSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

        {/* RIGHT */}
        <div className="header-right">
          <div className={`user-pill ${introVisible ? "intro-in" : ""}`}>
            <div className="avatar">
              <span>{initials}</span>
              <div className="avatar-ring" />
            </div>
            <span className="uname">
              <span className="greeting-text">{greeting}, </span>
              {username ?? "User"}
            </span>
          </div>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            <FontAwesomeIcon icon={faArrowRightFromBracket} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </header>

      <style jsx>{`
        .header {
          height: var(--header-h, 70px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-card-solid);
          border-bottom: 1px solid var(--border);
        }

        /* ---- LEFT ---- */
        .header-left {
          display: flex;
          align-items: center;
          gap: 4px;
          position: relative;
          z-index: 1;
          min-width: 38px;
        }

        /* ---- HAMBURGER (hidden on desktop) ---- */
        .hamburger-btn {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-soft);
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
          flex-shrink: 0;
        }
        .hamburger-btn:hover {
          background: var(--ad-orange);
          color: white;
          border-color: var(--ad-orange);
          box-shadow: 0 4px 14px rgba(242, 101, 34, 0.3);
        }

        /* ---- RIGHT ---- */
        .header-right {
          display: flex;
          align-items: center;
          gap: 14px;
          position: relative;
          z-index: 1;
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 6px 18px 6px 6px;
          border-radius: 999px;
          background: var(--bg-soft);
          border: 1px solid var(--border);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .user-pill .uname {
          opacity: 0;
          transform: translateY(8px);
        }

        .user-pill.intro-in .uname {
          animation: greetIn 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) 0.12s forwards;
        }

        @keyframes greetIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .user-pill:hover {
          background: var(--bg-soft-hover);
          border-color: var(--border);
          box-shadow: 0 4px 16px rgba(31, 58, 104, 0.12);
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
          position: relative;
        }

        .avatar span {
          position: relative;
          z-index: 1;
        }

        .avatar-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 2px solid rgba(242, 101, 34, 0.18);
          box-shadow: 0 0 0 0 rgba(242, 101, 34, 0.22);
          animation: avatarPulse 2.8s ease-in-out infinite;
        }

        @keyframes avatarPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(242, 101, 34, 0.2);
          }
          50% {
            transform: scale(1.05);
            opacity: 0.85;
            box-shadow: 0 0 0 6px rgba(242, 101, 34, 0);
          }
        }

        .uname {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
        }

        .greeting-text {
          /* shown by default, hidden on small mobile */
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f26522;
          border: none;
          padding: 9px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: white;
          transition: transform 220ms ease, box-shadow 220ms ease, filter 220ms ease;
          box-shadow: 0 4px 14px rgba(31, 58, 104, 0.24);
          position: relative;
          overflow: hidden;
        }

        /* Shine sweep on logout button */
        .logout-btn::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 60%;
          height: 100%;
          background: transparent;
          animation: none;
        }

        @keyframes btnShine {
          0%,
          70% {
            left: -100%;
          }
          100% {
            left: 150%;
          }
        }

        .logout-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(242, 101, 34, 0.35);
        }

        .logout-btn:active {
          transform: translateY(0);
        }

        .theme-toggle {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid var(--border);
          background: var(--bg-soft);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .theme-toggle:hover {
          background: var(--ad-orange);
          color: white;
          border-color: var(--ad-orange);
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(242, 101, 34, 0.35);
        }

        :global(html[data-theme="dark"]) .user-pill {
          background: #1a4689;
          border-color: rgba(188, 211, 248, 0.3);
          box-shadow: 0 4px 16px rgba(7, 20, 49, 0.28);
        }
        :global(html[data-theme="dark"]) .uname {
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .theme-toggle {
          background: #1a4689;
          border-color: rgba(188, 211, 248, 0.3);
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .hamburger-btn {
          background: #1a4689;
          border-color: rgba(188, 211, 248, 0.3);
          color: #f8fbff;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation: none !important;
            transition: none !important;
          }

          .user-pill .uname {
            opacity: 1;
            transform: none;
          }
        }

        /* ===== MOBILE RESPONSIVE ===== */
        @media (max-width: 768px) {
          .header {
            padding: 0 12px;
            height: 58px;
          }

          /* Show hamburger */
          .hamburger-btn {
            display: flex;
          }

          /* Header right: tighter gap */
          .header-right {
            gap: 8px;
          }

          /* User pill: show name only (no greeting) */
          .user-pill {
            padding: 4px 12px 4px 4px;
            gap: 8px;
          }
          .greeting-text {
            display: none;
          }
          .uname {
            font-size: 12px;
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* Smaller avatar */
          .avatar {
            width: 30px;
            height: 30px;
            font-size: 11px;
          }

          /* Logout: icon only */
          .logout-btn {
            padding: 8px 12px;
            border-radius: 10px;
          }
          .logout-text {
            display: none;
          }

          /* Smaller theme toggle */
          .theme-toggle {
            width: 32px;
            height: 32px;
            border-radius: 10px;
          }
        }

        /* Very small screens */
        @media (max-width: 400px) {
          .uname {
            max-width: 80px;
          }
        }
      `}</style>
    </>
  );
}