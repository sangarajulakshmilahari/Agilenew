"use client";

import Image from "next/image";
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
        {/* Animated background layers */}
        <div className="header-bg">
          <div className="bg-gradient" />
          <div className="bg-orb orb-1" />
          <div className="bg-orb orb-2" />
          <div className="bg-orb orb-3" />
          <div className="bg-shimmer" />
        </div>

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

          <div className="logo-glow">
            <Image
              src="/logo.png"
              alt="Adroitent logo"
              height={46}
              width={74}
              priority
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="header-right">
          <div className="user-pill">
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
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 100;
          overflow: hidden;
        }

        /* ---- Animated background ---- */
        .header-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }

        .bg-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            color-mix(in srgb, var(--bg-card-solid) 92%, transparent) 0%,
            color-mix(in srgb, var(--accent-light) 50%, transparent) 35%,
            color-mix(in srgb, var(--accent-light) 40%, transparent) 55%,
            color-mix(in srgb, var(--bg-card-solid) 90%, transparent) 100%
          );
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.5;
        }

        .orb-1 {
          width: 180px;
          height: 180px;
          background: radial-gradient(circle, #c4b5fd, transparent 70%);
          top: -80px;
          left: 15%;
          animation: headerOrb1 12s ease-in-out infinite;
        }

        .orb-2 {
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, #a78bfa, transparent 70%);
          top: -50px;
          right: 25%;
          animation: headerOrb2 16s ease-in-out infinite;
        }

        .orb-3 {
          width: 120px;
          height: 120px;
          background: radial-gradient(circle, #818cf8, transparent 70%);
          bottom: -60px;
          right: 10%;
          animation: headerOrb3 20s ease-in-out infinite;
        }

        @keyframes headerOrb1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(60px, 10px) scale(1.1);
          }
          66% {
            transform: translate(-30px, -5px) scale(0.95);
          }
        }

        @keyframes headerOrb2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-40px, 8px) scale(1.08);
          }
        }

        @keyframes headerOrb3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(20px, -10px) scale(1.05);
          }
          66% {
            transform: translate(-20px, 5px) scale(0.97);
          }
        }

        /* Slow moving shimmer sweep */
        .bg-shimmer {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(124, 58, 237, 0.04) 45%,
            rgba(168, 85, 247, 0.06) 50%,
            rgba(124, 58, 237, 0.04) 55%,
            transparent 70%
          );
          background-size: 300% 100%;
          animation: shimmerSweep 8s ease-in-out infinite;
        }

        @keyframes shimmerSweep {
          0% {
            background-position: 150% 0%;
          }
          100% {
            background-position: -150% 0%;
          }
        }

        /* ---- LEFT ---- */
        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 1;
        }

        .logo-glow {
          display: flex;
          align-items: center;
          position: relative;
        }

        /* ---- HAMBURGER (hidden on desktop) ---- */
        .hamburger-btn {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: 12px;
          border: 1px solid rgba(124, 58, 237, 0.15);
          background: var(--glass, rgba(255, 255, 255, 0.7));
          color: var(--accent, #7c3aed);
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          backdrop-filter: blur(8px);
          flex-shrink: 0;
        }
        .hamburger-btn:hover {
          background: var(--accent, #7c3aed);
          color: white;
          border-color: var(--accent, #7c3aed);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        }

        /* ---- RIGHT ---- */
        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 1;
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 16px 5px 5px;
          border-radius: 999px;
          background: var(--glass);
          border: 1px solid rgba(124, 58, 237, 0.12);
          backdrop-filter: blur(8px);
          transition: all 0.3s ease;
        }

        .user-pill:hover {
          background: rgba(255, 255, 255, 0.9);
          border-color: rgba(124, 58, 237, 0.25);
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.1);
        }

        .avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--gradient-primary);
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
          border: 2px solid rgba(168, 85, 247, 0.18);
          box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.2);
          animation: avatarPulse 2.8s ease-in-out infinite;
        }

        @keyframes avatarPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.2);
          }
          50% {
            transform: scale(1.05);
            opacity: 0.85;
            box-shadow: 0 0 0 6px rgba(168, 85, 247, 0);
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
          background: var(--gradient-primary);
          border: none;
          padding: 9px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: white;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
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
          background: linear-gradient(
            105deg,
            transparent 30%,
            rgba(255, 255, 255, 0.2) 50%,
            transparent 70%
          );
          animation: btnShine 4s ease-in-out infinite;
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
          box-shadow: 0 6px 20px rgba(124, 58, 237, 0.4);
        }

        .logout-btn:active {
          transform: translateY(0);
        }

        .theme-toggle {
          width: 36px;
          height: 36px;
          border-radius: 12px;
          border: 1px solid rgba(124, 58, 237, 0.15);
          background: rgba(255, 255, 255, 0.7);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(8px);
        }
        .theme-toggle:hover {
          background: var(--accent);
          color: white;
          border-color: var(--accent);
          transform: rotate(20deg) scale(1.1);
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
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

          /* Shrink logo */
          .logo-glow :global(img) {
            height: 34px !important;
            width: 56px !important;
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
