"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Article = {
  articleId: number;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  status: "Draft" | "Published" | string;
  createdAt: string | null;
  updatedAt: string | null;
};

type ArticleForm = {
  articleId?: number;
  title: string;
  summary: string;
  content: string;
  coverImage: string | null;
  file: File | null;
};

const emptyForm = (): ArticleForm => ({
  title: "",
  summary: "",
  content: "",
  coverImage: null,
  file: null,
});

export default function ArticleManagement() {
  const [isHr, setIsHr] = useState(false);
  const [roleChecked, setRoleChecked] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ArticleForm | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<Article | null>(null);
  const [modalError, setModalError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me");
        const d = await r.json().catch(() => ({}));
        setIsHr(
          Array.isArray(d?.roles) &&
            d.roles.some((role: string) => String(role).toLowerCase() === "hr"),
        );
      } catch {
        setIsHr(false);
      } finally {
        setRoleChecked(true);
      }
    })();
  }, []);

  async function loadArticles() {
    try {
      setLoading(true);
      setError("");
      const r = await fetch("/api/articles?all=1", { cache: "no-store" });
      const d = await r.json().catch(() => ({}));
      if (r.status === 403) throw new Error("Only HR can manage articles.");
      if (!r.ok) throw new Error(d?.error || "Unable to load articles.");
      setArticles(Array.isArray(d?.articles) ? d.articles : []);
    } catch (err: any) {
      setError(err?.message || "Unable to load articles.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isHr) loadArticles();
  }, [isHr]);

  function openCreate() {
    setModalError("");
    setForm(emptyForm());
  }

  function openEdit(article: Article) {
    setModalError("");
    setForm({
      articleId: article.articleId,
      title: article.title,
      summary: article.summary || "",
      content: article.content,
      coverImage: article.coverImage,
      file: null,
    });
  }

  async function submit(status: "Draft" | "Published") {
    if (!form) return;
    const title = form.title.trim();
    const content = form.content.trim();
    if (!title) {
      setModalError("Title is required.");
      return;
    }
    if (!content) {
      setModalError("Content is required.");
      return;
    }
    if (form.file) {
      const mime = (form.file.type || "").toLowerCase();
      if (!["image/png", "image/jpeg", "image/jpg", "image/webp"].includes(mime)) {
        setModalError("Only PNG, JPG, JPEG, and WEBP are allowed.");
        return;
      }
      if (form.file.size > 10 * 1024 * 1024) {
        setModalError("Cover image is too large. Maximum size is 10MB.");
        return;
      }
    }

    const body = new FormData();
    body.append("title", title);
    body.append("summary", form.summary.trim());
    body.append("content", content);
    body.append("status", status);
    if (form.file) body.append("coverImage", form.file);

    try {
      setSaving(true);
      setModalError("");
      const url = form.articleId ? `/api/articles/${form.articleId}` : "/api/articles";
      const r = await fetch(url, {
        method: form.articleId ? "PUT" : "POST",
        body,
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 403) throw new Error("Only HR can manage articles.");
      if (!r.ok) throw new Error(d?.error || "Unable to save article.");
      await loadArticles();
      setForm(null);
    } catch (err: any) {
      setModalError(err?.message || "Unable to save article.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(article: Article, status: "Draft" | "Published") {
    try {
      setSaving(true);
      setError("");
      const body = new FormData();
      body.append("status", status);
      const r = await fetch(`/api/articles/${article.articleId}`, {
        method: "PUT",
        body,
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 403) throw new Error("Only HR can manage articles.");
      if (!r.ok) throw new Error(d?.error || "Unable to update article.");
      await loadArticles();
    } catch (err: any) {
      setError(err?.message || "Unable to update article.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteArticle) return;
    try {
      setSaving(true);
      setModalError("");
      const r = await fetch(`/api/articles/${deleteArticle.articleId}`, {
        method: "DELETE",
      });
      const d = await r.json().catch(() => ({}));
      if (r.status === 403) throw new Error("Only HR can manage articles.");
      if (!r.ok) throw new Error(d?.error || "Unable to delete article.");
      await loadArticles();
      setDeleteArticle(null);
    } catch (err: any) {
      setModalError(err?.message || "Unable to delete article.");
    } finally {
      setSaving(false);
    }
  }

  if (!roleChecked) return null;

  if (!isHr) {
    return (
      <div className="am-wrap">
        <div className="am-card">
          <p className="am-denied">You do not have permission to view this section.</p>
        </div>
        <style jsx>{styles}</style>
      </div>
    );
  }

  return (
    <div className="am-wrap">
      <div className="am-header">
        <div>
          <p className="am-kicker">HR only</p>
          <h2 className="am-title">Article Management</h2>
          <p className="am-sub">Create, publish, and manage featured articles.</p>
        </div>
        <button className="am-btn" type="button" onClick={openCreate}>Add article</button>
      </div>

      {error && <p className="am-error">{error}</p>}
      {loading && <p className="am-sub">Loading articles...</p>}

      <div className="am-card">
        <div className="am-list">
          {articles.map((article) => (
            <div key={article.articleId} className="am-row">
              {article.coverImage ? (
                <img src={article.coverImage} alt="" className="am-thumb" />
              ) : (
                <div className="am-thumb empty" />
              )}
              <div className="am-row-main">
                <p className="am-row-title">{article.title}</p>
                <p className="am-row-summary">{article.summary || article.content}</p>
              </div>
              <span className={`am-badge ${article.status === "Published" ? "live" : ""}`}>
                {article.status}
              </span>
              <div className="am-row-actions">
                <button className="am-link" type="button" onClick={() => openEdit(article)}>Edit</button>
                {article.status === "Published" ? (
                  <button className="am-link" type="button" disabled={saving} onClick={() => setStatus(article, "Draft")}>
                    Unpublish
                  </button>
                ) : (
                  <button className="am-link" type="button" disabled={saving} onClick={() => setStatus(article, "Published")}>
                    Publish
                  </button>
                )}
                <button
                  className="am-link danger"
                  type="button"
                  onClick={() => {
                    setModalError("");
                    setDeleteArticle(article);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {!loading && articles.length === 0 && (
            <p className="am-sub">No articles yet.</p>
          )}
        </div>
      </div>

      {form && createPortal(
        <div className="am-overlay" onClick={() => !saving && setForm(null)}>
          <div className="am-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{form.articleId ? "Edit Article" : "Add Article"}</h3>
            <label className="am-field">
              Title
              <input
                value={form.title}
                maxLength={255}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="am-field">
              Summary
              <textarea
                rows={3}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
              />
            </label>
            <label className="am-field">
              Content
              <textarea
                rows={7}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
            </label>
            <label className="am-field">
              Cover Image
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setForm({
                    ...form,
                    file,
                    coverImage: file ? URL.createObjectURL(file) : form.coverImage,
                  });
                }}
              />
            </label>
            {form.coverImage && (
              <img src={form.coverImage} alt="" className="am-preview" />
            )}
            <p className="am-sub">Status: choose Save Draft or Publish.</p>
            {!!modalError && <p className="am-error">{modalError}</p>}
            <div className="am-actions">
              <button className="am-btn ghost" type="button" disabled={saving} onClick={() => setForm(null)}>Cancel</button>
              <button className="am-btn ghost" type="button" disabled={saving} onClick={() => submit("Draft")}>
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button className="am-btn" type="button" disabled={saving} onClick={() => submit("Published")}>
                {saving ? "Saving..." : "Publish"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {deleteArticle && createPortal(
        <div className="am-overlay" onClick={() => !saving && setDeleteArticle(null)}>
          <div className="am-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Article?</h3>
            <p className="am-body">Are you sure you want to delete “{deleteArticle.title}”? This cannot be undone.</p>
            {!!modalError && <p className="am-error">{modalError}</p>}
            <div className="am-actions">
              <button className="am-btn ghost" type="button" disabled={saving} onClick={() => setDeleteArticle(null)}>Cancel</button>
              <button className="am-btn danger" type="button" disabled={saving} onClick={confirmDelete}>
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
  .am-wrap { display: flex; flex-direction: column; gap: 16px; }
  .am-header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-start; }
  .am-kicker {
    margin: 0 0 4px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ad-orange);
  }
  .am-title { margin: 0; font-size: 22px; font-weight: 800; color: var(--ad-navy); }
  .am-sub { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); }
  .am-card {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 18px;
  }
  .am-btn {
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
  .am-btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .am-btn.ghost {
    background: var(--bg-soft);
    color: var(--text-secondary);
    border: 1px solid var(--border);
  }
  .am-btn.danger { background: #b42318; }
  .am-list { display: flex; flex-direction: column; gap: 10px; }
  .am-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    border-radius: 10px;
    background: var(--bg-page);
    border: 1px solid var(--border);
  }
  .am-thumb {
    width: 64px;
    height: 48px;
    object-fit: cover;
    border-radius: 8px;
    flex-shrink: 0;
    background: #eee;
  }
  .am-thumb.empty { background: linear-gradient(135deg, #1F3A68, #F26522); }
  .am-row-main { flex: 1; min-width: 0; }
  .am-row-title { margin: 0 0 4px; font-size: 14px; font-weight: 700; color: var(--ad-navy); }
  .am-row-summary {
    margin: 0;
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .am-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 999px;
    background: var(--bg-soft);
    color: var(--text-secondary);
    flex-shrink: 0;
  }
  .am-badge.live { background: rgba(242,101,34,0.14); color: #F26522; }
  .am-row-actions { display: flex; gap: 10px; flex-shrink: 0; }
  .am-link {
    border: none;
    background: transparent;
    color: var(--ad-orange);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    padding: 0;
  }
  .am-link.danger { color: #b42318; }
  .am-error { margin: 8px 0 0; font-size: 13px; font-weight: 600; color: #b42318; }
  .am-denied { margin: 0; font-size: 14px; color: var(--text-secondary); }
  .am-body { margin: 0; font-size: 14px; line-height: 1.55; color: var(--ad-navy); }
  .am-overlay {
    position: fixed; inset: 0; background: rgba(15,23,42,0.5);
    backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;
    z-index: 9999; padding: 16px;
  }
  .am-modal {
    width: 520px; max-width: 100%; max-height: 90vh; overflow: auto;
    background: var(--bg-card-solid, #fff);
    border: 1px solid rgba(31,58,104,0.16);
    border-radius: 20px;
    padding: 24px;
  }
  .am-modal h3 { margin: 0 0 16px; font-size: 18px; color: var(--text-primary); }
  .am-field { display: flex; flex-direction: column; gap: 6px; font-size: 12px; font-weight: 700; color: var(--text-primary); margin-bottom: 12px; }
  .am-field input, .am-field textarea {
    width: 100%; box-sizing: border-box; border: 1px solid var(--border, #ece4d8);
    border-radius: 10px; padding: 10px 12px; font-size: 13px; font-weight: 500;
    font-family: inherit; color: var(--text-primary); background: #fff;
  }
  .am-preview { width: 100%; height: 140px; object-fit: cover; border-radius: 10px; margin-bottom: 12px; }
  .am-actions { display: flex; gap: 10px; margin-top: 8px; flex-wrap: wrap; }
  .am-actions .am-btn { flex: 1; padding: 11px; }
  html[data-theme="dark"] .am-title,
  html[data-theme="dark"] .am-row-title,
  html[data-theme="dark"] .am-body { color: #fff; }
  html[data-theme="dark"] .am-card,
  html[data-theme="dark"] .am-modal { background: #123a78; border-color: rgba(169,198,245,0.22); }
  html[data-theme="dark"] .am-row { background: #1f4a8f; border-color: rgba(188,211,248,0.2); }
  html[data-theme="dark"] .am-field input,
  html[data-theme="dark"] .am-field textarea { background: #173f7f; border-color: rgba(188,211,248,0.24); color: #fff; }
`;
