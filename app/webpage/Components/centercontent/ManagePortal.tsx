"use client";

import { useEffect, useState } from "react";
import { canManagePortal } from "@/app/lib/permissions";
import { FilePenLine, LayoutTemplate } from "lucide-react";

type ManagePortalView = "portal" | "articleManage";

type ManagePortalProps = {
  onNavigate: (view: ManagePortalView) => void;
};

export default function ManagePortal({ onNavigate }: ManagePortalProps) {
  const [allowed, setAllowed] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me");
        const d = await r.json().catch(() => ({}));
        setAllowed(canManagePortal(d?.roles));
      } catch {
        setAllowed(false);
      } finally {
        setRoleChecked(true);
      }
    })();
  }, []);

  if (!roleChecked) return null;

  if (!allowed) {
    return (
      <div className="mp-wrap">
        <div className="mp-card mp-denied-card">
          <p className="mp-denied">
            You do not have permission to view this section.
          </p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="mp-wrap">
      <div className="mp-header">
        <p className="mp-kicker">Administration</p>
        <h2 className="mp-title">Manage Portal</h2>
        <p className="mp-sub">
          Manage employee-facing content and communications
        </p>
      </div>

      <div className="mp-grid">
        <article className="mp-card">
          <div className="mp-icon portal">
            <LayoutTemplate size={22} strokeWidth={2} />
          </div>
          <h3 className="mp-card-title">Portal Content</h3>
          <p className="mp-card-desc">
            Manage Vision, Mission, Purpose and Core Values shown across the
            employee portal.
          </p>
          <button
            type="button"
            className="mp-action"
            onClick={() => onNavigate("portal")}
          >
            Manage Content →
          </button>
        </article>

        <article className="mp-card">
          <div className="mp-icon articles">
            <FilePenLine size={22} strokeWidth={2} />
          </div>
          <h3 className="mp-card-title">Article Management</h3>
          <p className="mp-card-desc">
            Create, edit and publish articles for employees.
          </p>
          <button
            type="button"
            className="mp-action"
            onClick={() => onNavigate("articleManage")}
          >
            Manage Articles →
          </button>
        </article>
      </div>

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .mp-wrap {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 4px 2px 24px;
  }

  .mp-header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .mp-kicker {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ad-orange);
  }

  .mp-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    color: var(--ad-navy);
    letter-spacing: -0.02em;
  }

  .mp-sub {
    margin: 0;
    font-size: 15px;
    color: var(--text-secondary);
    max-width: 520px;
  }

  .mp-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px;
  }

  .mp-card {
    background: var(--bg-card-solid);
    border: 1px solid var(--border);
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 220px;
    transition:
      box-shadow var(--motion-base) var(--motion-ease),
      transform var(--motion-base) var(--motion-ease),
      border-color var(--motion-base) var(--motion-ease);
  }

  .mp-card:hover {
    box-shadow: var(--shadow-md);
    border-color: rgba(242, 101, 34, 0.28);
    transform: translateY(-2px);
  }

  .mp-denied-card {
    min-height: auto;
  }

  .mp-icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }

  .mp-icon.portal {
    background: var(--ad-navy);
  }

  .mp-icon.articles {
    background: var(--ad-orange);
  }

  .mp-card-title {
    margin: 4px 0 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--ad-navy);
  }

  .mp-card-desc {
    margin: 0;
    flex: 1;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .mp-action {
    appearance: none;
    border: none;
    background: transparent;
    color: var(--ad-orange);
    font-size: 14px;
    font-weight: 700;
    padding: 0;
    margin-top: 8px;
    cursor: pointer;
    align-self: flex-start;
    transition: color 150ms ease, transform 150ms ease;
  }

  .mp-action:hover {
    color: var(--accent-hover);
    transform: translateX(2px);
  }

  .mp-denied {
    margin: 0;
    color: var(--text-secondary);
    font-size: 14px;
  }

  :global(html[data-theme="dark"]) .mp-title,
  :global(html[data-theme="dark"]) .mp-card-title {
    color: #f8f4ef;
  }

  @media (max-width: 900px) {
    .mp-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .mp-title {
      font-size: 24px;
    }
    .mp-card {
      padding: 20px;
      min-height: 0;
    }
  }
`;
