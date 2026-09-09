"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type PortalContentItem = {
  contentId: number;
  contentKey: string;
  title: string;
  content: string;
};

type PortalValue = {
  valueId: number;
  valueText: string;
  displayOrder: number;
};

type ContentModal = {
  kind: "mission" | "vision";
  title: string;
  content: string;
};

type ValueModal = {
  mode: "add" | "edit";
  valueId?: number;
  valueText: string;
  displayOrder: string;
};

export default function PortalContent() {
  const [isHr, setIsHr] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [mission, setMission] = useState<PortalContentItem | null>(null);
  const [vision, setVision] = useState<PortalContentItem | null>(null);
  const [values, setValues] = useState<PortalValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [contentModal, setContentModal] = useState<ContentModal | null>(null);
  const [valueModal, setValueModal] = useState<ValueModal | null>(null);
  const [deleteValue, setDeleteValue] = useState<PortalValue | null>(null);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me");
        const d = await r.json().catch(() => ({}));
        const hr = Array.isArray(d?.roles)
          ? d.roles.some((role: string) => String(role).toLowerCase() === "hr")
          : false;
        setIsHr(hr);
      } catch {
        setIsHr(false);
      } finally {
        setRoleChecked(true);
      }
    })();
  }, []);

  async function loadContent() {
    try {
      setLoading(true);
      setError("");
      const r = await fetch("/api/portal-content", { cache: "no-store" });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d?.error || "Unable to load portal content.");
      setMission(d?.mission ?? null);
      setVision(d?.vision ?? null);
      setValues(Array.isArray(d?.values) ? d.values : []);
    } catch {
      setError("Unable to load portal content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isHr) loadContent();
  }, [isHr]);

  async function saveContent() {
    if (!contentModal) return;
    const title = contentModal.title.trim();
    const content = contentModal.content.trim();
    if (!title) {
      setModalError("Title is required.");
      return;
    }
    if (!content) {
      setModalError("Content is required.");
      return;
    }

    try {
      setSaving(true);
      setModalError("");
      const r = await fetch("/api/portal-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentKey: contentModal.kind,
          title,
          content,
        }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 403) throw new Error("Only HR can edit portal content.");
      if (!r.ok) throw new Error(d?.error || "Unable to save content.");
      await loadContent();
      setContentModal(null);
    } catch (err: any) {
      setModalError(err?.message || "Unable to save content.");
    } finally {
      setSaving(false);
    }
  }

  async function saveValue() {
    if (!valueModal) return;
    const valueText = valueModal.valueText.trim();
    if (!valueText) {
      setModalError("Value text is required.");
      return;
    }

    const payload: { valueText: string; displayOrder?: number; valueId?: number } = {
      valueText,
    };
    if (valueModal.displayOrder.trim()) {
      const order = Number(valueModal.displayOrder);
      if (!Number.isInteger(order) || order < 1) {
        setModalError("Display order must be a positive integer.");
        return;
      }
      payload.displayOrder = order;
    }
    if (valueModal.mode === "edit" && valueModal.valueId) {
      payload.valueId = valueModal.valueId;
    }

    try {
      setSaving(true);
      setModalError("");
      const r = await fetch("/api/portal-content/values", {
        method: valueModal.mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 403) throw new Error("Only HR can edit portal content.");
      if (!r.ok) throw new Error(d?.error || "Unable to save value.");
      await loadContent();
      setValueModal(null);
    } catch (err: any) {
      setModalError(err?.message || "Unable to save value.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDeleteValue() {
    if (!deleteValue) return;
    try {
      setSaving(true);
      setModalError("");
      const r = await fetch("/api/portal-content/values", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ valueId: deleteValue.valueId }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 403) throw new Error("Only HR can edit portal content.");
      if (!r.ok) throw new Error(d?.error || "Unable to delete value.");
      await loadContent();
      setDeleteValue(null);
    } catch (err: any) {
      setModalError(err?.message || "Unable to delete value.");
    } finally {
      setSaving(false);
    }
  }

  if (!roleChecked) return null;

  if (!isHr) {
    return (
      <div className="pc-wrap">
        <div className="pc-card">
          <p className="pc-denied">You do not have permission to view this section.</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="pc-wrap">
      <div className="pc-header">
        <div>
          <p className="pc-kicker">HR only</p>
          <h2 className="pc-title">Portal Content</h2>
          <p className="pc-sub">Edit Mission, Vision, and Values shown on the homepage.</p>
        </div>
      </div>

      {error && <p className="pc-error">{error}</p>}

      <div className="pc-card">
        <div className="pc-card-head">
          <div>
            <p className="pc-label">{mission?.title || "Our Mission"}</p>
            <p className="pc-body">{loading ? "Loading..." : mission?.content || "No mission content."}</p>
          </div>
          <button
            className="pc-btn"
            type="button"
            onClick={() => {
              setModalError("");
              setContentModal({
                kind: "mission",
                title: mission?.title || "",
                content: mission?.content || "",
              });
            }}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="pc-card">
        <div className="pc-card-head">
          <div>
            <p className="pc-label">{vision?.title || "Our Vision"}</p>
            <p className="pc-body">{loading ? "Loading..." : vision?.content || "No vision content."}</p>
          </div>
          <button
            className="pc-btn"
            type="button"
            onClick={() => {
              setModalError("");
              setContentModal({
                kind: "vision",
                title: vision?.title || "",
                content: vision?.content || "",
              });
            }}
          >
            Edit
          </button>
        </div>
      </div>

      <div className="pc-card">
        <div className="pc-card-head">
          <div>
            <p className="pc-label">Values & Beliefs</p>
            <p className="pc-sub" style={{ margin: "4px 0 0" }}>Add, edit, or delete homepage values.</p>
          </div>
          <button
            className="pc-btn"
            type="button"
            onClick={() => {
              setModalError("");
              setValueModal({ mode: "add", valueText: "", displayOrder: "" });
            }}
          >
            Add Value
          </button>
        </div>
        <div className="pc-value-list">
          {values.map((value) => (
            <div key={value.valueId} className="pc-value-row">
              <span className="pc-num">{String(value.displayOrder).padStart(2, "0")}</span>
              <span className="pc-value-text">{value.valueText}</span>
              <div className="pc-row-actions">
                <button
                  className="pc-link"
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setValueModal({
                      mode: "edit",
                      valueId: value.valueId,
                      valueText: value.valueText,
                      displayOrder: String(value.displayOrder),
                    });
                  }}
                >
                  Edit
                </button>
                <button
                  className="pc-link danger"
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setDeleteValue(value);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!loading && values.length === 0 && (
            <p className="pc-sub">No values yet.</p>
          )}
        </div>
      </div>

      {contentModal && createPortal(
        <div className="pc-overlay" onClick={() => !saving && setContentModal(null)}>
          <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit {contentModal.kind === "mission" ? "Mission" : "Vision"}</h3>
            <label className="pc-field">
              Title
              <input
                value={contentModal.title}
                maxLength={255}
                onChange={(e) => setContentModal({ ...contentModal, title: e.target.value })}
              />
            </label>
            <label className="pc-field">
              Content
              <textarea
                value={contentModal.content}
                rows={5}
                onChange={(e) => setContentModal({ ...contentModal, content: e.target.value })}
              />
            </label>
            {!!modalError && <p className="pc-error">{modalError}</p>}
            <div className="pc-actions">
              <button className="pc-btn ghost" type="button" disabled={saving} onClick={() => setContentModal(null)}>Cancel</button>
              <button className="pc-btn" type="button" disabled={saving} onClick={saveContent}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {valueModal && createPortal(
        <div className="pc-overlay" onClick={() => !saving && setValueModal(null)}>
          <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{valueModal.mode === "add" ? "Add Value" : "Edit Value"}</h3>
            <label className="pc-field">
              Value Text
              <textarea
                value={valueModal.valueText}
                maxLength={500}
                rows={4}
                onChange={(e) => setValueModal({ ...valueModal, valueText: e.target.value })}
              />
            </label>
            <label className="pc-field">
              Display Order
              <input
                type="number"
                min={1}
                value={valueModal.displayOrder}
                onChange={(e) => setValueModal({ ...valueModal, displayOrder: e.target.value })}
                placeholder="Optional"
              />
            </label>
            {!!modalError && <p className="pc-error">{modalError}</p>}
            <div className="pc-actions">
              <button className="pc-btn ghost" type="button" disabled={saving} onClick={() => setValueModal(null)}>Cancel</button>
              <button className="pc-btn" type="button" disabled={saving} onClick={saveValue}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {deleteValue && createPortal(
        <div className="pc-overlay" onClick={() => !saving && setDeleteValue(null)}>
          <div className="pc-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Value?</h3>
            <p className="pc-body">Are you sure you want to delete “{deleteValue.valueText}”? This cannot be undone.</p>
            {!!modalError && <p className="pc-error">{modalError}</p>}
            <div className="pc-actions">
              <button className="pc-btn ghost" type="button" disabled={saving} onClick={() => setDeleteValue(null)}>Cancel</button>
              <button className="pc-btn danger" type="button" disabled={saving} onClick={confirmDeleteValue}>
                {saving ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <style jsx>{styles}</style>
    </div>
  );
}

const styles = `
  .pc-wrap { display: flex; flex-direction: column; gap: 16px; }
  .pc-kicker {
    margin: 0 0 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ad-orange);
  }
  .pc-title { margin: 0; font-size: 22px; font-weight: 800; color: var(--ad-navy); }
  .pc-sub { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); }
  .pc-card {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px 22px;
  }
  .pc-card-head { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  .pc-label {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ad-orange);
  }
  .pc-body { margin: 0; font-size: 15px; line-height: 1.65; color: var(--ad-navy); }
  .pc-btn {
    border: none;
    background: #F26522;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border-radius: 10px;
    padding: 8px 14px;
    cursor: pointer;
    white-space: nowrap;
  }
  .pc-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .pc-btn.ghost {
    background: var(--bg-soft);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .pc-btn.danger { background: #b42318; }
  .pc-value-list { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
  .pc-value-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border-radius: 10px;
    background: var(--bg-page);
    border: 1px solid var(--border);
  }
  .pc-num {
    font-family: "JetBrains Mono", monospace;
    font-size: 11px;
    font-weight: 700;
    color: var(--ad-orange);
    margin-top: 1px;
  }
  .pc-value-text { flex: 1; font-size: 13px; line-height: 1.45; color: var(--ad-navy); font-weight: 500; }
  .pc-row-actions { display: flex; gap: 10px; }
  .pc-link {
    border: none;
    background: transparent;
    color: var(--ad-orange);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
  }
  .pc-link.danger { color: #b42318; }
  .pc-error { margin: 0; font-size: 13px; font-weight: 600; color: #b42318; }
  .pc-denied { margin: 0; font-size: 14px; color: var(--text-secondary); }
  .pc-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,0.5);
    backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;
    z-index: 9999;
  }
  .pc-modal {
    width: 420px; max-width: calc(100vw - 32px);
    background: var(--bg-card-solid, #fff);
    border: 1px solid rgba(31,58,104,0.16);
    border-radius: 20px;
    padding: 24px;
    box-shadow: 0 20px 60px rgba(31,58,104,0.2);
  }
  .pc-modal h3 { margin: 0 0 16px; font-size: 18px; color: var(--text-primary); }
  .pc-field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
  .pc-field input, .pc-field textarea {
    width: 100%; box-sizing: border-box; border: 1px solid var(--border, #ece4d8);
    border-radius: 10px; padding: 10px 12px; font-size: 13px; font-weight: 500;
    font-family: inherit; color: var(--text-primary); background: #fff;
  }
  .pc-actions { display: flex; gap: 10px; margin-top: 8px; }
  .pc-actions .pc-btn { flex: 1; padding: 11px; }
  html[data-theme="dark"] .pc-title,
  html[data-theme="dark"] .pc-body,
  html[data-theme="dark"] .pc-value-text { color: #ffffff; }
  html[data-theme="dark"] .pc-card,
  html[data-theme="dark"] .pc-modal { background: #123a78; border-color: rgba(169,198,245,0.22); }
  html[data-theme="dark"] .pc-value-row { background: #1f4a8f; border-color: rgba(188,211,248,0.2); }
  html[data-theme="dark"] .pc-field input,
  html[data-theme="dark"] .pc-field textarea { background: #173f7f; border-color: rgba(188,211,248,0.24); color: #fff; }
`;
