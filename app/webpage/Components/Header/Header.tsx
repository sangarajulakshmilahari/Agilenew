"use client";

import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTheme } from "../../../../app/context/ThemeContext";
import { Sun, Moon, Menu, X, Bell } from "lucide-react";
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useRef, useState } from "react";
import { canManagePortal } from "@/app/lib/permissions";

type NavView =
  | "home"
  | "holiday"
  | "events"
  | "learning"
  | "articles"
  | "corner"
  | "managePortal"
  | "portal"
  | "articleManage";

type HeaderProps = {
  activeView: NavView;
  onChange: (view: NavView) => void;
};

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  action_url: string | null;
  is_read: number;
  created_at: string;
};

const NAV_ITEMS: { key: NavView; label: string }[] = [
  { key: "home", label: "Home" },
  { key: "events", label: "Events" },
  { key: "holiday", label: "Holidays" },
  { key: "learning", label: "Learning" },
  { key: "articles", label: "Articles" },
  { key: "corner", label: "Employee Corner" },
];

export default function Header({ activeView, onChange }: HeaderProps) {
  const [username, setUsername] = useState<string | null>(null);
  const [introVisible, setIntroVisible] = useState(false);
  const [showManagePortal, setShowManagePortal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
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
        setShowManagePortal(canManagePortal(data?.roles));
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

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [listRes, countRes] = await Promise.all([
          fetch("/api/notifications?limit=10", { cache: "no-store" }),
          fetch("/api/notifications/unread-count", { cache: "no-store" }),
        ]);

        if (listRes.ok) {
          const list = await listRes.json();
          setNotifications(Array.isArray(list) ? list : []);
        }

        if (countRes.ok) {
          const countData = await countRes.json();
          setUnreadCount(Number(countData?.unreadCount || 0));
        }
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    loadNotifications();
    const intervalId = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;

    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!notificationsRef.current?.contains(target)) {
        setNotificationsOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [notificationsOpen]);

  async function refreshNotifications() {
    try {
      const [listRes, countRes] = await Promise.all([
        fetch("/api/notifications?limit=10", { cache: "no-store" }),
        fetch("/api/notifications/unread-count", { cache: "no-store" }),
      ]);
      if (listRes.ok) {
        const list = await listRes.json();
        setNotifications(Array.isArray(list) ? list : []);
      }
      if (countRes.ok) {
        const countData = await countRes.json();
        setUnreadCount(Number(countData?.unreadCount || 0));
      }
    } catch (error) {
      console.error("Failed to refresh notifications", error);
    }
  }

  async function markAllAsRead() {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (!res.ok) return;
      setNotifications((prev) => prev.map((item) => ({ ...item, is_read: 1 })));
      setUnreadCount(0);
      refreshNotifications();
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  }

  async function openNotification(notification: NotificationItem) {
    try {
      if (!notification.is_read) {
        await fetch("/api/notifications/read", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notification.id }),
        });
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: 1 } : item,
        ),
      );
      setUnreadCount((prev) => Math.max(prev - (notification.is_read ? 0 : 1), 0));
      setNotificationsOpen(false);

      const url = new URL(window.location.href);
      const isEcPost = notification.entity_type === "ec_post";
      const isArticle = notification.entity_type === "article";

      if (isEcPost) {
        url.searchParams.set("view", "corner");
        if (notification.entity_id) {
          url.searchParams.set("postId", notification.entity_id);
        }
      } else if (isArticle) {
        url.searchParams.set("view", "articles");
        url.searchParams.delete("postId");
      } else {
        url.searchParams.set("view", "home");
        url.searchParams.delete("postId");
      }

      window.history.replaceState({}, "", url.toString());

      if (isEcPost) {
        window.dispatchEvent(
          new CustomEvent("adroitent:open-corner-post", {
            detail: { postId: notification.entity_id ?? null },
          }),
        );
        onChange("corner");
      } else if (isArticle) {
        onChange("articles");
      } else {
        onChange("home");
      }
    } catch (error) {
      console.error("Failed to open notification", error);
    }
  }

  function handleLogout() {
    window.location.href = "/api/auth/logout";
  }

  function handleNav(view: NavView) {
    onChange(view);
    setMobileOpen(false);
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

  const menuItems = [
    ...NAV_ITEMS,
    ...(showManagePortal
      ? ([{ key: "managePortal" as const, label: "Manage Portal" }] as const)
      : []),
  ];

  const isNavActive = (key: NavView) => {
    if (key === "managePortal") {
      return (
        activeView === "managePortal" ||
        activeView === "portal" ||
        activeView === "articleManage"
      );
    }
    return activeView === key;
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          <button
            className="hamburger-btn"
            onClick={() => setMobileOpen((open) => !open)}
            title="Toggle menu"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="brand">
            <Image
              src="/image.png"
              alt="Adroitent logo"
              width={150}
              height={52}
              priority
              className="brand-logo"
              style={{ width: "auto", height: 52, maxHeight: 52 }}
            />
          </div>
        </div>

        <nav className="top-nav" aria-label="Main">
          {menuItems.map((item) => {
            const isActive = isNavActive(item.key);
            return (
              <button
                key={item.key}
                type="button"
                className={`nav-link ${isActive ? "active" : ""}`}
                onClick={() => handleNav(item.key)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="header-right">
          <div className="notifications-wrap" ref={notificationsRef}>
            <button
              className="notification-btn"
              title="Notifications"
              aria-label="Notifications"
              onClick={() => setNotificationsOpen((prev) => !prev)}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span className="notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="notification-dropdown" role="dialog" aria-label="Notifications">
                <div className="notification-head">🔔 Notifications</div>
                <div className="notification-subhead">
                  {unreadCount} pending {unreadCount === 1 ? "action" : "actions"}
                </div>

                {notifications.length === 0 ? (
                  <div className="notification-empty">You're all caught up.</div>
                ) : (
                  <div className="notification-list">
                    {notifications.map((item) => (
                      <button
                        key={item.id}
                        className={`notification-item ${item.is_read ? "read" : "unread"}`}
                        onClick={() => openNotification(item)}
                      >
                        <span className="dot" aria-hidden="true" />
                        <div className="notification-text">
                          <div className="notification-title">{item.title}</div>
                          <div className="notification-message">{item.message}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <button className="mark-all-btn" onClick={markAllAsRead}>
                  Mark all as read
                </button>
              </div>
            )}
          </div>

          <div className={`user-pill ${introVisible ? "intro-in" : ""}`}>
            <div className="avatar">
              <span>{initials}</span>
              <div className="avatar-ring" />
            </div>
            <span className="uname">
              <span className="greeting-text">{greeting},</span>
              <span className="username-text">{username ?? "User"}</span>
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

      {mobileOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav className={`mobile-nav ${mobileOpen ? "open" : ""}`} aria-label="Mobile">
        {menuItems.map((item) => {
          const isActive = isNavActive(item.key);
          return (
            <button
              key={item.key}
              type="button"
              className={`mobile-nav-link ${isActive ? "active" : ""}`}
              onClick={() => handleNav(item.key)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <style jsx>{`
        .header {
          height: var(--header-h, 72px);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          padding: 0 28px;
          position: sticky;
          top: 0;
          z-index: 100;
          background: var(--bg-card-solid);
          border-bottom: 1px solid var(--border);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
          min-width: 0;
        }

        .brand {
          display: flex;
          align-items: center;
          height: 52px;
          max-height: 52px;
        }

        :global(.brand-logo) {
          display: block;
          height: 52px !important;
          width: auto !important;
          max-height: 52px !important;
          object-fit: contain;
        }

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
          flex-shrink: 0;
        }
        .hamburger-btn:hover {
          background: var(--ad-orange);
          color: white;
          border-color: var(--ad-orange);
          box-shadow: 0 4px 14px rgba(242, 101, 34, 0.3);
        }

        .top-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          flex: 1;
          min-width: 0;
        }

        .nav-link {
          appearance: none;
          border: none;
          background: transparent;
          color: var(--text-primary);
          font-size: 14px;
          font-weight: 500;
          line-height: 1;
          padding: 10px 16px;
          border-radius: 999px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 150ms ease, color 150ms ease;
        }
        .nav-link:hover {
          background: var(--bg-soft);
          color: var(--ad-navy);
        }
        .nav-link.active {
          background: #fff1e8;
          color: var(--ad-navy);
          font-weight: 600;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }

        .notifications-wrap {
          position: relative;
        }

        .notification-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-card-solid);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s ease;
          position: relative;
        }

        .notification-btn:hover {
          background: var(--ad-orange);
          color: white;
          border-color: var(--ad-orange);
          box-shadow: 0 4px 14px rgba(242, 101, 34, 0.35);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #f26522;
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 5px;
          border: 2px solid var(--bg-card-solid);
        }

        .notification-dropdown {
          position: absolute;
          right: 0;
          top: 44px;
          width: 360px;
          max-width: calc(100vw - 24px);
          background: var(--bg-card-solid);
          border: 1px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 18px 35px rgba(15, 31, 61, 0.16);
          padding: 12px;
          z-index: 150;
        }

        .notification-head {
          font-size: 14px;
          font-weight: 700;
          color: #0f1f3d;
          margin-bottom: 2px;
        }

        .notification-subhead {
          font-size: 12px;
          color: var(--text-secondary);
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
          margin-bottom: 8px;
        }

        .notification-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 320px;
          overflow-y: auto;
        }

        .notification-item {
          width: 100%;
          text-align: left;
          border: 1px solid transparent;
          border-radius: 12px;
          padding: 10px;
          background: transparent;
          color: var(--text-primary);
          display: flex;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
        }

        .notification-item.unread {
          background: rgba(242, 101, 34, 0.08);
          border-color: rgba(242, 101, 34, 0.3);
        }

        .notification-item.read {
          background: var(--bg-soft);
          opacity: 0.86;
        }

        .notification-item .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-top: 6px;
          background: #f26522;
          flex-shrink: 0;
        }

        .notification-item.read .dot {
          background: #94a3b8;
        }

        .notification-text {
          min-width: 0;
        }

        .notification-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f3a68;
        }

        .notification-message {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .notification-empty {
          font-size: 12px;
          color: var(--text-secondary);
          padding: 18px 8px;
          text-align: center;
        }

        .mark-all-btn {
          width: 100%;
          margin-top: 10px;
          border: none;
          background: #fff1e8;
          color: #1f3a68;
          font-weight: 600;
          font-size: 12px;
          border-radius: 10px;
          padding: 10px 12px;
          cursor: pointer;
        }

        .mark-all-btn:hover {
          background: #ffe7d7;
        }

        .user-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 14px 4px 4px;
          border-radius: 999px;
          background: transparent;
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

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #2b2f36;
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
          display: flex;
          flex-direction: column;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          line-height: 1.2;
        }

        .greeting-text {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
        }

        .username-text {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f26522;
          border: none;
          padding: 10px 18px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          color: white;
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
          box-shadow: 0 4px 14px rgba(242, 101, 34, 0.28);
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
          border-radius: 50%;
          border: 1px solid var(--border);
          background: var(--bg-card-solid);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .theme-toggle:hover {
          background: var(--ad-orange);
          color: white;
          border-color: var(--ad-orange);
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(242, 101, 34, 0.35);
        }

        .mobile-nav-overlay {
          display: none;
        }

        .mobile-nav {
          display: none;
        }

        :global(html[data-theme="dark"]) .nav-link.active {
          background: rgba(242, 101, 34, 0.18);
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .uname,
        :global(html[data-theme="dark"]) .username-text {
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .greeting-text {
          color: #d9d6d2;
        }
        :global(html[data-theme="dark"]) .theme-toggle {
          background: #1a4689;
          border-color: rgba(188, 211, 248, 0.3);
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .notification-btn {
          background: #1a4689;
          border-color: rgba(188, 211, 248, 0.3);
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .notification-dropdown {
          background: #0f1f3d;
          border-color: rgba(188, 211, 248, 0.25);
        }
        :global(html[data-theme="dark"]) .notification-head,
        :global(html[data-theme="dark"]) .notification-title {
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .notification-item.read {
          background: rgba(22, 35, 66, 0.7);
        }
        :global(html[data-theme="dark"]) .hamburger-btn {
          background: #1a4689;
          border-color: rgba(188, 211, 248, 0.3);
          color: #f8fbff;
        }
        :global(html[data-theme="dark"]) .mobile-nav {
          background: var(--bg-card-solid);
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

        @media (max-width: 1180px) {
          .nav-link {
            padding: 9px 12px;
            font-size: 13px;
          }
        }

        @media (max-width: 1024px) {
          .header {
            padding: 0 16px;
            gap: 12px;
          }

          .top-nav {
            display: none;
          }

          .hamburger-btn {
            display: flex;
          }

          .mobile-nav-overlay {
            display: block;
            position: fixed;
            inset: var(--header-h, 72px) 0 0 0;
            background: rgba(15, 23, 42, 0.35);
            z-index: 90;
          }

          .mobile-nav {
            display: flex;
            flex-direction: column;
            gap: 4px;
            position: fixed;
            top: var(--header-h, 72px);
            left: 0;
            right: 0;
            z-index: 95;
            background: var(--bg-card-solid);
            border-bottom: 1px solid var(--border);
            padding: 10px 12px 14px;
            transform: translateY(-12px);
            opacity: 0;
            pointer-events: none;
            box-shadow: var(--shadow-md);
          }

          .mobile-nav.open {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
          }

          .mobile-nav-link {
            appearance: none;
            border: none;
            background: transparent;
            text-align: left;
            color: var(--text-primary);
            font-size: 14px;
            font-weight: 500;
            padding: 12px 14px;
            border-radius: 10px;
            cursor: pointer;
          }
          .mobile-nav-link.active {
            background: #fff1e8;
            color: var(--ad-navy);
            font-weight: 600;
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 0 12px;
            height: 58px;
          }

          :global(.brand-logo) {
            height: 40px !important;
            max-height: 40px !important;
          }

          .brand {
            height: 40px;
            max-height: 40px;
          }

          .header-right {
            gap: 8px;
          }

          .user-pill {
            padding: 2px 8px 2px 2px;
            gap: 8px;
          }
          .greeting-text {
            display: none;
          }
          .uname {
            font-size: 12px;
          }
          .username-text {
            max-width: 120px;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .avatar {
            width: 30px;
            height: 30px;
            font-size: 11px;
          }

          .logout-btn {
            padding: 8px 12px;
            border-radius: 10px;
          }
          .logout-text {
            display: none;
          }

          .theme-toggle {
            width: 32px;
            height: 32px;
          }

          .mobile-nav-overlay,
          .mobile-nav {
            top: 58px;
          }
          .mobile-nav-overlay {
            inset: 58px 0 0 0;
          }
        }

        @media (max-width: 400px) {
          .username-text {
            max-width: 80px;
          }
        }
      `}</style>
    </>
  );
}
