"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ComingSoonProps = {
  page: string;
};

import {
  faCalendar,
  faGraduationCap,
  faNewspaper,
} from "@fortawesome/free-solid-svg-icons";

const pageConfig: Record<string, any> = {
  Events: {
    icon: faCalendar,
    accent: "linear-gradient(135deg, #1F3A68, #F26522)",
    description:
      "Company events, team activities, and important dates will appear here.",
  },
  "Learning & Dev": {
    icon: faGraduationCap,
    accent: "linear-gradient(135deg, #F26522, #1F3A68)",
    description:
      "Courses, certifications, and learning resources are on their way.",
  },
  "Featured Articles": {
    icon: faNewspaper,
    accent: "linear-gradient(135deg, #1F3A68, #475569)",
    description:
      "Curated articles, company news, and insights will be published here.",
  },
};

export default function ComingSoon({ page }: ComingSoonProps) {
  const cfg = pageConfig[page] ?? {
    icon: "🚀",
    accent: "linear-gradient(135deg, #1F3A68, #F26522)",
    description:
      "This section is under development and will be available soon.",
  };

  return (
    <div className="cs-wrapper">
      {/* Background orbs */}
      <div className="cs-orb cs-orb-a" />
      <div className="cs-orb cs-orb-b" />

      {/* Icon */}
      <div className="cs-icon-ring">
        <div className="cs-icon-bg" style={{ background: cfg.accent }}>
          {typeof cfg.icon === "string" ? (
            <span className="cs-emoji">{cfg.icon}</span>
          ) : (
            <FontAwesomeIcon
              icon={cfg.icon}
              style={{ fontSize: "32px", color: "white" }}
            />
          )}
        </div>
        <div className="cs-ring cs-ring-1" />
        <div className="cs-ring cs-ring-2" />
      </div>

      {/* Text */}
      <div className="cs-badge">Coming Soon</div>
      <h2 className="cs-title">{page}</h2>
      <p className="cs-desc">{cfg.description}</p>

      <style jsx>{`
        .cs-wrapper {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 420px;
          padding: 48px 32px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
          background: var(--bg-card);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        /* Orbs */
        .cs-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
          animation: orbFloat 18s ease-in-out infinite;
        }
        .cs-orb-a {
          width: 260px;
          height: 260px;
          background: radial-gradient(
            circle,
            rgba(196, 181, 253, 0.35),
            transparent 70%
          );
          top: -80px;
          right: -60px;
        }
        .cs-orb-b {
          width: 180px;
          height: 180px;
          background: radial-gradient(
            circle,
            rgba(165, 180, 252, 0.3),
            transparent 70%
          );
          bottom: -50px;
          left: 10%;
          animation-direction: reverse;
          animation-duration: 24s;
        }
        @keyframes orbFloat {
          0%,
          100% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(16px, 12px);
          }
        }

        /* Icon ring */
        .cs-icon-ring {
          position: relative;
          width: 96px;
          height: 96px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 28px;
          z-index: 1;
        }
        .cs-icon-bg {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 28px rgba(31, 58, 104, 0.2);
          animation: iconBob 4s ease-in-out infinite;
        }
        @keyframes iconBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        .cs-emoji {
          font-size: 32px;
          line-height: 1;
        }

        .cs-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.5px solid transparent;
          animation: spin linear infinite;
          pointer-events: none;
        }
        .cs-ring-1 {
          inset: -10px;
          border-top-color: rgba(242, 101, 34, 0.42);
          border-right-color: rgba(31, 58, 104, 0.2);
          animation-duration: 6s;
        }
        .cs-ring-2 {
          inset: -20px;
          border-bottom-color: rgba(242, 101, 34, 0.24);
          border-left-color: rgba(31, 58, 104, 0.16);
          animation-duration: 10s;
          animation-direction: reverse;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Badge */
        .cs-badge {
          display: inline-block;
          background: var(--accent-light);
          border: 1px solid rgba(242, 101, 34, 0.28);
          color: var(--accent);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          padding: 5px 16px;
          border-radius: 999px;
          margin-bottom: 12px;
          z-index: 1;
          animation: badgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
          animation-delay: 0.1s;
        }
        @keyframes badgePop {
          from {
            opacity: 0;
            transform: scale(0.7);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .cs-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--text-primary);
          margin: 0 0 12px;
          z-index: 1;
          animation: fadeUp 0.5s ease backwards;
          animation-delay: 0.2s;
        }
        .cs-desc {
          max-width: 380px;
          font-size: 14px;
          line-height: 1.7;
          color: var(--text-secondary);
          margin: 0 0 32px;
          z-index: 1;
          animation: fadeUp 0.5s ease backwards;
          animation-delay: 0.3s;
        }
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Progress */
        .cs-progress-wrap {
          width: 100%;
          max-width: 320px;
          z-index: 1;
          animation: fadeUp 0.5s ease backwards;
          animation-delay: 0.4s;
        }
        .cs-progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 500;
          margin-bottom: 8px;
        }
        .cs-progress-track {
          height: 6px;
          border-radius: 999px;
          background: var(--accent-light);
          overflow: hidden;
        }
        .cs-progress-fill {
          height: 100%;
          width: 40%;
          border-radius: 999px;
          animation: progressAnim 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.6s;
          width: 0%;
        }
        @keyframes progressAnim {
          to {
            width: 40%;
          }
        }
      `}</style>
    </div>
  );
}
