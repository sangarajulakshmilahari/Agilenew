import React from "react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Bell, Cake, PartyPopper, Gift, Send, X, Mail } from "lucide-react";

export default function RightPanel() {
  type Birthday = {
    slno: number;
    employee: string;
    email: string;
    date_of_birth: string;
  };

  const [birthdays, setBirthdays] = useState<Birthday[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Birthday | null>(null);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [confetti, setConfetti] = useState<{ id: number; x: number; color: string; delay: number; dur: number; shape: string }[]>([]);

  const eventImages = [
    "/Eventimages/1.png","/Eventimages/2.png","/Eventimages/3.png",
    "/Eventimages/4.png","/Eventimages/5.jpg","/Eventimages/6.jpeg",
    "/Eventimages/7.jpeg","/Eventimages/8.jpeg","/Eventimages/9.jpeg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const confettiColors = ["#7c3aed","#a855f7","#60a5fa","#f472b6","#fbbf24","#34d399","#f87171","#c084fc"];
  const shapes = ["circle","square","ribbon"];

  function spawnConfetti() {
    const pieces = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      delay: Math.random() * 0.6,
      dur: 1.2 + Math.random() * 0.8,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    }));
    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 2800);
  }

  useEffect(() => {
    const iv = setInterval(
      () => setCurrentIndex(p => p === eventImages.length - 1 ? 0 : p + 1),
      5000,
    );
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    (async () => { try { const r = await fetch("/api/birthdays"); setBirthdays(await r.json()); } catch {} })();
  }, []);

  useEffect(() => {
    (async () => { try { const r = await fetch("/api/me"); setUser(await r.json()); } catch {} })();
  }, []);

  // Spawn confetti when modal opens
  useEffect(() => {
    if (selectedPerson) spawnConfetti();
  }, [selectedPerson]);

  const avatarColors = [
    "linear-gradient(135deg, #7c3aed, #a855f7)",
    "linear-gradient(135deg, #6366f1, #818cf8)",
    "linear-gradient(135deg, #8b5cf6, #c084fc)",
    "linear-gradient(135deg, #a855f7, #ec4899)",
    "linear-gradient(135deg, #6d28d9, #7c3aed)",
  ];

  // Check if a birthday is today
  const todayStr = new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  function isTodayBirthday(dob: string) {
    try {
      const d = new Date(dob);
      return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" }) === todayStr;
    } catch { return false; }
  }

  return (
    <aside className="right-panel">
      {/* ======= EVENTS CAROUSEL ======= */}
      <div className="panel-card events-card">
        <div className="card-decor"><div className="cd-orb cd-orb-1" /></div>
        <div className="card-header">
          <h3>Past Events</h3>
          <span className="badge">{eventImages.length} Photos</span>
        </div>
        <div className="carousel">
          <Image src={eventImages[currentIndex]} alt="event" fill priority style={{ objectFit: "cover" }} />
          <div className="carousel-fade" />
          <button className="cbtn cl" onClick={() => setCurrentIndex(p => p === 0 ? eventImages.length - 1 : p - 1)}>‹</button>
          <button className="cbtn cr" onClick={() => setCurrentIndex(p => p === eventImages.length - 1 ? 0 : p + 1)}>›</button>
          <div className="dots">
            {eventImages.map((_, i) => (
              <span key={i} className={`dot ${i === currentIndex ? "on" : ""}`} onClick={() => setCurrentIndex(i)} />
            ))}
          </div>
          <div className="counter">{currentIndex + 1}/{eventImages.length}</div>
        </div>
      </div>

      {/* ======= BIRTHDAYS ======= */}
      <div className="panel-card birthday-card">
        <div className="card-decor"><div className="cd-orb cd-orb-2" /></div>
        <div className="card-header">
          <h3>
            <Cake size={18} className="header-icon cake-icon" />
            Upcoming Birthdays
          </h3>
        </div>
        <div className="bday-list">
          {birthdays.map((person, idx) => {
            const isToday = isTodayBirthday(person.date_of_birth);
            return (
              <div
                key={person.slno}
                className={`bday-row ${isToday ? "today" : ""}`}
                onClick={() => setSelectedPerson(person)}
              >
                <div className="avatar" style={{ background: avatarColors[idx % avatarColors.length] }}>
                  {person.employee.split(" ").map(n => n[0]).join("").substring(0, 2)}
                </div>
                <div className="bday-info">
                  <span className="bday-name">{person.employee}</span>
                  <span className="bday-date">{person.date_of_birth}</span>
                </div>
                {isToday
                  ? <span className="today-badge"><PartyPopper size={13} className="today-icon" /> Today!</span>
                  : <button className="wish-btn"><Gift size={16} color="#7c3aed" /></button>
                }
              </div>
            );
          })}
        </div>
      </div>

      {/* ======= MODAL WITH CONFETTI ======= */}
      {selectedPerson && createPortal(
        <div className="modal-overlay" onClick={() => setSelectedPerson(null)}>
          {/* Confetti layer */}
          <div className="confetti-stage">
            {confetti.map(p => (
              <div
                key={p.id}
                className={`conf-piece ${p.shape}`}
                style={{
                  left: `${p.x}%`,
                  background: p.color,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.dur}s`,
                } as React.CSSProperties}
              />
            ))}
          </div>

          <div className="modal" onClick={e => e.stopPropagation()}>
            {/* Ribbon decorations */}
            <div className="ribbon ribbon-left" />
            <div className="ribbon ribbon-right" />

            <div className="modal-icon-wrap">
              <div className="modal-icon-ring" />
              <span className="modal-icon">
                <Cake size={40} color="#7c3aed" strokeWidth={1.8} />
              </span>
            </div>
            <h4>Send Birthday Wishes?</h4>
            <p>Send a birthday email to <strong>{selectedPerson.employee}</strong></p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setSelectedPerson(null)}>
                <X size={14} className="btn-icon" /> Cancel
              </button>
              <button
                className="btn-send"
                onClick={() => {
                  if (!user) return;
                  const subject = "Happy Birthday!";
                  const body = `Dear ${selectedPerson.employee},\n\nWishing you a very Happy Birthday!\n\nMay this year bring you happiness, success, and good health.\n\nHave a fantastic celebration!\n\nWarm regards,\n${user.username}`;
                  window.location.href = `mailto:${selectedPerson.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                  setSelectedPerson(null);
                }}
              >
                <Mail size={15} className="btn-icon" /> Send Email
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <style jsx>{`
        .right-panel {
          width: var(--right-w, 340px);
          max-width:  340px;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
          overflow-y: auto;
          overflow-x: hidden;
        }

        @media (max-width: 1024px) {
  .right-panel {
    display: none;
  }
}
        .right-panel::-webkit-scrollbar { width: 0; }

        .panel-card {
          position: relative;
          padding: 18px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--glass-border);
          overflow: hidden;
          background: var(--bg-card);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.3s ease;
        }
        .panel-card:hover { box-shadow: var(--shadow-md); }

        .card-decor { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: inherit; }
        .cd-orb { position: absolute; border-radius: 50%; filter: blur(50px); opacity: 0.4; }
        .cd-orb-1 { width: 120px; height: 120px; background: radial-gradient(circle, #c4b5fd, transparent 70%); top: -30px; right: -20px; animation: orbFloat 16s ease-in-out infinite; }
        .cd-orb-2 { width: 100px; height: 100px; background: radial-gradient(circle, #a5b4fc, transparent 70%); bottom: -20px; left: -10px; animation: orbFloat 22s ease-in-out infinite reverse; }
        @keyframes orbFloat { 0%,100% { transform: translate(0,0); } 50% { transform: translate(8px,6px); } }

        .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; position: relative; z-index: 1; }
        .card-header h3 { font-size: 15px; font-weight: 700; color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 7px; }
        .badge { font-size: 11px; font-weight: 600; color: var(--accent); background: var(--accent-light); padding: 4px 10px; border-radius: 999px; }

        /* header icons */
        .card-header h3 :global(.cake-icon) {
          color: #7c3aed;
          flex-shrink: 0;
        }

        /* carousel */
        .carousel { position: relative; height: 190px; border-radius: var(--radius-md); overflow: hidden; background: #f1f5f9; z-index: 1; }
        .carousel-fade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.4) 100%); z-index: 1; pointer-events: none; }
        .cbtn { position: absolute; top: 50%; transform: translateY(-50%); width: 30px; height: 30px; border-radius: 10px; background: var(--bg-card-solid); backdrop-filter: blur(8px); border: none; font-size: 16px; cursor: pointer; z-index: 2; color: var(--text-primary); display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.2s ease; box-shadow: var(--shadow-sm); }
        .carousel:hover .cbtn { opacity: 1; }
        .cbtn:hover { background: white; transform: translateY(-50%) scale(1.05); }
        .cl { left: 8px; } .cr { right: 8px; }
        .dots { position: absolute; bottom: 10px; width: 100%; display: flex; justify-content: center; gap: 6px; z-index: 2; }
        .dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.5); cursor: pointer; transition: all 0.3s ease; }
        .dot.on { width: 18px; border-radius: 4px; background: white; }
        .counter { position: absolute; top: 10px; right: 10px; font-size: 11px; font-weight: 600; color: white; background: rgba(0,0,0,0.35); backdrop-filter: blur(8px); padding: 3px 10px; border-radius: 999px; z-index: 2; }

        /* birthdays */
        .bday-list { display: flex; flex-direction: column; gap: 10px; position: relative; z-index: 1; }
        .bday-row { display: flex; align-items: center; gap: 12px; padding: 6px 12px; border-radius: var(--radius-sm); background: var(--bg-soft); border: 1px solid transparent; cursor: pointer; transition: all 0.25s ease; }
        .bday-row:hover { background: var(--accent-light); border-color: var(--border-accent); transform: translateX(4px); }
        .bday-row.today { background: linear-gradient(135deg, rgba(124,58,237,0.08), rgba(168,85,247,0.06)); border-color: rgba(124,58,237,0.2); animation: todayPulse 2s ease-in-out infinite; }
        @keyframes todayPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(124,58,237,0.15); } 50% { box-shadow: 0 0 0 6px rgba(124,58,237,0); } }
        .bday-row:hover .wish-btn { opacity: 1; transform: scale(1); }

        .avatar { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; color: white; flex-shrink: 0; }
        .bday-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
        .bday-name { font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .bday-date { font-size: 12px; color: var(--text-muted); }
        .wish-btn { width: 34px; height: 32px; border-radius: 10px; border: none; background: var(--bg-card-solid); font-size: 16px; cursor: pointer; opacity: 0; transform: scale(0.8); transition: all 0.2s ease; box-shadow: var(--shadow-sm); display: flex; align-items: center; justify-content: center; }
        .wish-btn:hover { background: rgba(124,58,237,0.08); }
        .today-badge { font-size: 11px; font-weight: 700; color: var(--accent); background: var(--accent-light); padding: 3px 8px; border-radius: 999px; white-space: nowrap; flex-shrink: 0; display: inline-flex; align-items: center; gap: 3px; }
        .today-badge :global(.today-icon) { color: #7c3aed; }

        /* ======= CONFETTI ======= */
        .confetti-stage { position: fixed; inset: 0; pointer-events: none; z-index: 10000; overflow: hidden; }
        .conf-piece {
          position: absolute;
          top: -20px;
          width: 10px;
          height: 10px;
          opacity: 0;
          animation: confettiFall linear forwards;
        }
        .conf-piece.circle { border-radius: 50%; }
        .conf-piece.square { border-radius: 2px; }
        .conf-piece.ribbon { width: 4px; height: 14px; border-radius: 2px; }

        @keyframes confettiFall {
          0%   { opacity: 1; transform: translateY(0) rotate(0deg) scale(1); }
          80%  { opacity: 1; }
          100% { opacity: 0; transform: translateY(100vh) rotate(720deg) scale(0.5); }
        }

        /* ======= MODAL ======= */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; z-index: 9999; animation: fadeIn 0.2s ease; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .modal {
          background: var(--bg-card-solid);
          padding: 32px 28px 28px;
          border-radius: 20px;
          width: 360px;
          max-width: calc(100vw - 32px);
          text-align: center;
          box-shadow: 0 20px 60px rgba(124,58,237,0.25), var(--shadow-lg);
          animation: modalUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(124,58,237,0.15);
        }
        @keyframes modalUp { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }

        /* Ribbon decorations on modal corners */
        .ribbon {
          position: absolute;
          top: 0;
          width: 80px;
          height: 80px;
          overflow: hidden;
          pointer-events: none;
        }
        .ribbon-left { left: 0; }
        .ribbon-right { right: 0; transform: scaleX(-1); }
        .ribbon::before, .ribbon::after {
          content: "";
          position: absolute;
          border-style: solid;
        }
        .ribbon::before {
          top: 0; left: 0;
          border-width: 40px;
          border-color: rgba(124,58,237,0.12) transparent transparent rgba(124,58,237,0.12);
        }
        .ribbon::after {
          top: 2px; left: 2px;
          border-width: 38px;
          border-color: rgba(168,85,247,0.08) transparent transparent rgba(168,85,247,0.08);
        }

        .modal-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          width: 64px;
          height: 64px;
        }
        .modal-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          animation: iconBounce 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.1s both;
        }
        @keyframes iconBounce { from { transform: scale(0) rotate(-20deg); } to { transform: scale(1) rotate(0deg); } }

        .modal-icon-ring {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 2px solid transparent;
          border-top-color: rgba(168,85,247,0.5);
          border-right-color: rgba(124,58,237,0.3);
          animation: iconSpin 3s linear infinite;
        }
        @keyframes iconSpin { to { transform: rotate(360deg); } }

        .modal h4 { margin: 0 0 8px; font-size: 19px; font-weight: 800; color: var(--text-primary); }
        .modal p { font-size: 14px; margin-bottom: 22px; color: var(--text-secondary); line-height: 1.5; }
        .modal-actions { display: flex; gap: 10px; }

        .btn-cancel {
          flex: 1; background: var(--bg-soft); border: 1px solid var(--border); padding: 11px; border-radius: var(--radius-sm);
          cursor: pointer; font-weight: 600; font-size: 13px; color: var(--text-secondary); transition: all 0.2s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
        }
        .btn-cancel:hover { background: var(--bg-soft-hover); }
        .btn-cancel :global(.btn-icon) { color: var(--text-secondary); }

        .btn-send {
          flex: 1; background: var(--gradient-primary); color: white; border: none;
          padding: 11px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 700;
          font-size: 13px; box-shadow: 0 4px 14px rgba(124,58,237,0.35); transition: all 0.25s ease;
          position: relative; overflow: hidden;
          display: inline-flex; align-items: center; justify-content: center; gap: 5px;
        }
        .btn-send :global(.btn-icon) { color: white; }
        .btn-send::after {
          content: ""; position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%);
          animation: btnShine 2s ease-in-out infinite;
        }
        @keyframes btnShine { 0%,60% { left: -100%; } 100% { left: 150%; } }
        .btn-send:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(124,58,237,0.45); }

        /* ===== MOBILE ===== */
        @media (max-width: 768px) {
          .right-panel {
            width: 100%;
            max-width: 100%;
            height: auto;
            overflow: visible;
          }

          .carousel {
            height: 200px;
          }

          /* Show carousel buttons on mobile (no hover) */
          .cbtn {
            opacity: 0.7;
          }

          /* Show wish button always on mobile */
          .wish-btn {
            opacity: 0.6;
            transform: scale(1);
          }
        }
      `}</style>
    </aside>
  );
}