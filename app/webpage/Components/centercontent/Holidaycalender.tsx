"use client";
import { useState } from "react";
import { Calendar, CheckCircle2, Clock } from "lucide-react";

type Holiday = { date: string; day: string; name: string; month: string };

const holidays: Holiday[] = [
  { date: "01 January",   day: "Thursday",  name: "New Year",                month: "Jan" },
  { date: "14 January",   day: "Wednesday", name: "Bhogi",                   month: "Jan" },
  { date: "15 January",   day: "Thursday",  name: "Sankranthi",              month: "Jan" },
  { date: "26 January",   day: "Monday",    name: "Republic Day",            month: "Jan" },
  { date: "19 March",     day: "Thursday",  name: "Ugadi (Telugu New Year)", month: "Mar" },
  { date: "27 March",     day: "Friday",    name: "Sri Rama Navami",         month: "Mar" },
  { date: "14 September", day: "Monday",    name: "Ganesh Chaturthi",        month: "Sep" },
  { date: "02 October",   day: "Friday",    name: "Gandhi Jayanthi",         month: "Oct" },
  { date: "20 October",   day: "Tuesday",   name: "Vijaya Dashami",          month: "Oct" },
  { date: "25 December",  day: "Friday",    name: "Christmas",               month: "Dec" },
];

function parseHolidayDate(dateStr: string): Date {
  return new Date(`${dateStr} 2026`);
}

type HolidayStatus = "past" | "next" | "upcoming";

function getStatus(dateStr: string, nextIdx: number, idx: number): HolidayStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (parseHolidayDate(dateStr) < today) return "past";
  if (idx === nextIdx) return "next";
  return "upcoming";
}

function HolCard({ h, status }: { h: Holiday; status: HolidayStatus }) {
  const [hov, setHov] = useState(false);
  const dayNum = h.date.split(" ")[0];

  return (
    <div
      className={`hol-card status-${status} ${hov ? "hov" : ""}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      {/* Left date stripe */}
      <div className={`date-stripe stripe-${status} ${hov && status !== "past" ? "hov" : ""}`}>
        <span className={`day-num daynum-${status}`}>{dayNum}</span>
        <span className={`month-label mlabel-${status}`}>{h.month}</span>
      </div>

      {/* Main content */}
      <div className="hol-content">
        <div className="name-row">
          <span className={`hol-name hname-${status}`}>{h.name}</span>
        </div>
        <div className="hol-day-row">
          <span className={`dot-badge dot-${status}`} />
          <span className="hol-day">{h.day}</span>
        </div>
      </div>

      {/* Right badge — only for "next" */}
      {status === "next" && (
        <div className="next-badge">
          <Clock size={11} />
          Next ↑
        </div>
      )}

      {/* Subtle "done" checkmark for past — no text, no month repeat */}
      {status === "past" && (
        <CheckCircle2 size={15} className="done-icon" />
      )}

      <style jsx>{`
        /* ── Base card ── */
        .hol-card {
          display: flex;
          align-items: center;
          border-radius: 14px;
          overflow: hidden;
          cursor: default;
          transition: all 0.22s ease;
          position: relative;
        }

        /* ── PAST: light grey tint, same structure ── */
        .status-past {
          background: var(--bg-soft);
          border: 1px solid rgba(156, 163, 175, 0.18);
          box-shadow: none;
        }
        .status-past.hov {
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(0,0,0,0.04);
        }

        /* ── NEXT: glowing purple ── */
        .status-next {
          background: linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(168,85,247,0.04) 100%);
          border: 1px solid rgba(124,58,237,0.3);
          box-shadow: 0 0 0 2px rgba(124,58,237,0.08), 0 4px 16px rgba(124,58,237,0.12);
          animation: nextGlow 2.5s ease-in-out infinite;
        }
        @keyframes nextGlow {
          0%,100% { box-shadow: 0 0 0 2px rgba(124,58,237,0.08), 0 4px 16px rgba(124,58,237,0.12); }
          50%      { box-shadow: 0 0 0 3px rgba(124,58,237,0.18), 0 6px 24px rgba(124,58,237,0.2); }
        }
        .status-next.hov {
          transform: translateY(-3px);
          box-shadow: 0 8px 28px rgba(124,58,237,0.2);
        }

        /* ── UPCOMING: standard clean card ── */
        .status-upcoming {
          background: var(--bg-card-solid);
          border: 1px solid rgba(139,92,246,0.12);
          box-shadow: 0 1px 4px rgba(139,92,246,0.07);
        }
        .status-upcoming.hov {
          border-color: rgba(124,58,237,0.25);
          background: var(--bg-soft);
          box-shadow: 0 6px 24px rgba(124,58,237,0.1);
          transform: translateY(-2px);
        }

        /* ── Date stripe ── */
        .date-stripe {
          width: 60px; align-self: stretch; flex-shrink: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 14px 0; gap: 2px;
          transition: background 0.22s ease;
        }
        /* past stripe: muted grey */
        .stripe-past {
          background: linear-gradient(160deg, rgba(156,163,175,0.12), rgba(156,163,175,0.06));
        }
        /* next & upcoming stripe: purple */
        .stripe-next,
        .stripe-upcoming {
          background: linear-gradient(160deg, var(--accent-light), rgba(139,92,246,0.15));
        }
        .date-stripe.hov {
          background: linear-gradient(160deg, #7c3aed, #a78bfa) !important;
        }
        .date-stripe.hov .day-num,
        .date-stripe.hov .month-label { color: #fff !important; opacity: 1 !important; }

        /* Day number */
        .day-num { font-size: 24px; font-weight: 900; line-height: 1; letter-spacing: -1px; transition: color 0.22s; }
        .daynum-past     { color: #9ca3af; }
        .daynum-next,
        .daynum-upcoming { color: var(--accent); }

        /* Month label */
        .month-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; opacity: 0.8; transition: color 0.22s; }
        .mlabel-past     { color: #9ca3af; }
        .mlabel-next,
        .mlabel-upcoming { color: var(--accent); }

        /* ── Content ── */
        .hol-content { flex: 1; padding: 14px 16px; min-width: 0; }
        .name-row { display: flex; align-items: center; gap: 6px; margin-bottom: 3px; }

        .hol-name { font-size: 14px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .hname-past     { color: var(--text-muted); }
        .hname-next,
        .hname-upcoming { color: var(--text-primary); }

        .hol-day-row { display: flex; align-items: center; gap: 5px; }
        .dot-badge { display: inline-block; width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .dot-past     { background: #d1d5db; }
        .dot-next,
        .dot-upcoming { background: linear-gradient(135deg, #7c3aed, #a855f7); }

        .hol-day { font-size: 12px; color: var(--text-muted); }

        /* ── Next badge ── */
        .next-badge {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 11px; font-weight: 700;
          color: white;
          background: var(--gradient-primary);
          padding: 4px 11px; border-radius: 8px;
          margin-right: 16px; flex-shrink: 0;
          box-shadow: 0 2px 8px rgba(124,58,237,0.3);
          animation: badgePop 2.5s ease-in-out infinite;
        }
        @keyframes badgePop {
          0%,100% { transform: scale(1); }
          50%      { transform: scale(1.05); }
        }

        /* ── Done icon ── */
        :global(.done-icon) {
          color: #d1d5db;
          margin-right: 16px;
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}

export default function HolidayCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextIdx       = holidays.findIndex(h => parseHolidayDate(h.date) >= today);
  const pastCount     = holidays.filter(h => parseHolidayDate(h.date) < today).length;
  const upcomingCount = holidays.length - pastCount;

  return (
    <div className="hol-wrapper">
      {/* Header */}
      <div className="hol-header">
        <div className="hol-header-orb" />
        <div className="hol-header-inner">
          <div>
            <h2 className="hol-title">Holiday Calendar — 2026</h2>
            <div className="hol-stats">
              <span className="stat stat-past">
                <CheckCircle2 size={12} />
                {pastCount} passed
              </span>
              <span className="stat-sep">·</span>
              <span className="stat stat-upcoming">
                <Clock size={12} />
                {upcomingCount} upcoming
              </span>
            </div>
          </div>
          <div className="hol-icon">
            <Calendar size={24} color="#fff" strokeWidth={2} />
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="hol-grid">
        {holidays.map((h, i) => (
          <HolCard key={i} h={h} status={getStatus(h.date, nextIdx, i)} />
        ))}
      </div>

      <style jsx>{`
        .hol-wrapper {
          display: flex; flex-direction: column; gap: 18px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .hol-header {
          position: relative; padding: 24px 28px; border-radius: 16px;
          border: 1px solid var(--border-accent); overflow: hidden;
          background: var(--bg-card); backdrop-filter: blur(16px);
          box-shadow: var(--shadow-sm);
        }
        .hol-header-orb {
          position: absolute; width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, var(--accent-glow), transparent 70%);
          top: -70px; right: -40px; pointer-events: none;
        }
        .hol-header-inner {
          display: flex; justify-content: space-between; align-items: center;
          position: relative; z-index: 1;
        }
        .hol-title { margin: 0 0 8px; font-size: 22px; font-weight: 800; color: var(--text-primary); }

        .hol-stats { display: flex; align-items: center; gap: 8px; }
        .stat {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 12px; font-weight: 600;
          padding: 3px 10px; border-radius: 999px;
        }
        .stat-past     { color: #9ca3af; background: rgba(156,163,175,0.12); border: 1px solid rgba(156,163,175,0.2); }
        .stat-upcoming { color: var(--accent); background: var(--accent-light); border: 1px solid rgba(124,58,237,0.15); }
        .stat-sep      { color: var(--text-muted); font-size: 14px; }

        .hol-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: var(--gradient-primary);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 14px rgba(124,58,237,0.3);
        }
        .hol-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
          gap: 10px;
        }
      `}</style>
    </div>
  );
}