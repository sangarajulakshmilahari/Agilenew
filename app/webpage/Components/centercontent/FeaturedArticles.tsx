"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Article = {
  articleId: number;
  title: string;
  summary: string | null;
  content: string;
  coverImage: string | null;
  status: string;
  createdAt: string | null;
  updatedAt: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Article | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const r = await fetch("/api/articles", { cache: "no-store" });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d?.error || "Unable to load articles.");
        setArticles(Array.isArray(d?.articles) ? d.articles : []);
      } catch {
        setError("Unable to load articles.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="fa-wrap">
      <div className="fa-header">
        <p className="fa-kicker">Company news</p>
        <h2 className="fa-title">Featured Articles</h2>
        <p className="fa-sub">Curated updates, stories, and insights from Adroitent.</p>
      </div>

      {error && <p className="fa-error">{error}</p>}
      {loading && <p className="fa-sub">Loading articles...</p>}
      {!loading && !error && articles.length === 0 && (
        <div className="fa-card">
          <p className="fa-body">No published articles yet.</p>
        </div>
      )}

      <div className="fa-grid">
        {articles.map((article) => (
          <button
            key={article.articleId}
            type="button"
            className="fa-card fa-click"
            onClick={() => setActive(article)}
          >
            {article.coverImage ? (
              <img src={article.coverImage} alt="" className="fa-cover" />
            ) : (
              <div className="fa-cover empty" />
            )}
            <div className="fa-card-body">
              {!!formatDate(article.updatedAt || article.createdAt) && (
                <p className="fa-date">{formatDate(article.updatedAt || article.createdAt)}</p>
              )}
              <h3>{article.title}</h3>
              <p>{article.summary || article.content}</p>
            </div>
          </button>
        ))}
      </div>

      {active && createPortal(
        <div className="fa-overlay" onClick={() => setActive(null)}>
          <div className="fa-modal" onClick={(e) => e.stopPropagation()}>
            <button className="fa-close" type="button" onClick={() => setActive(null)}>×</button>
            {active.coverImage && <img src={active.coverImage} alt="" className="fa-modal-cover" />}
            <p className="fa-date">{formatDate(active.updatedAt || active.createdAt)}</p>
            <h3>{active.title}</h3>
            {active.summary && <p className="fa-summary">{active.summary}</p>}
            <div className="fa-content">{active.content}</div>
          </div>
        </div>,
        document.body,
      )}

      <style jsx>{`
        .fa-wrap { display: flex; flex-direction: column; gap: 16px; }
        .fa-kicker {
          margin: 0 0 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--ad-orange);
        }
        .fa-title { margin: 0; font-size: 22px; font-weight: 800; color: var(--ad-navy); }
        .fa-sub { margin: 6px 0 0; font-size: 13px; color: var(--text-secondary); }
        .fa-error { margin: 0; font-size: 13px; font-weight: 600; color: #b42318; }
        .fa-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .fa-card {
          text-align: left;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          padding: 0;
        }
        .fa-click { cursor: pointer; width: 100%; }
        .fa-cover {
          display: block;
          width: 100%;
          height: auto;
          max-width: 100%;
          object-fit: contain;
          object-position: center;
          background: #f3eee6;
        }
        .fa-cover.empty {
          height: 8px;
          background: linear-gradient(90deg, #1F3A68, #F26522);
        }
        .fa-card-body { padding: 16px 18px 18px; }
        .fa-date {
          margin: 0 0 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: var(--ad-orange);
        }
        .fa-card-body h3 {
          margin: 0 0 8px;
          font-size: 16px;
          color: var(--ad-navy);
        }
        .fa-card-body p, .fa-body {
          margin: 0;
          font-size: 13px;
          line-height: 1.55;
          color: var(--text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .fa-body { padding: 18px; display: block; -webkit-line-clamp: unset; }
        .fa-overlay {
          position: fixed; inset: 0; background: rgba(15,23,42,0.5);
          backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;
          z-index: 9999; padding: 20px;
        }
        .fa-modal {
          width: 640px; max-width: 100%; max-height: 88vh; overflow: auto;
          background: var(--bg-card-solid, #fff);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          border: 1px solid rgba(31,58,104,0.16);
        }
        .fa-close {
          position: absolute; top: 12px; right: 14px;
          width: 32px; height: 32px; border: none; border-radius: 50%;
          background: var(--bg-soft); color: var(--text-primary);
          font-size: 22px; cursor: pointer;
        }
        .fa-modal-cover {
          display: block;
          width: 100%;
          height: auto;
          max-width: 100%;
          object-fit: contain;
          object-position: center;
          border-radius: 12px;
          margin-bottom: 14px;
          background: #f3eee6;
        }
        .fa-modal h3 { margin: 0 0 10px; font-size: 22px; color: var(--ad-navy); }
        .fa-summary { margin: 0 0 14px; font-size: 14px; color: var(--text-secondary); }
        .fa-content {
          white-space: pre-wrap;
          font-size: 15px;
          line-height: 1.7;
          color: var(--ad-navy);
        }
        html[data-theme="dark"] .fa-title,
        html[data-theme="dark"] .fa-card-body h3,
        html[data-theme="dark"] .fa-modal h3,
        html[data-theme="dark"] .fa-content { color: #fff; }
        html[data-theme="dark"] .fa-card,
        html[data-theme="dark"] .fa-modal { background: #123a78; border-color: rgba(169,198,245,0.22); }
      `}</style>
    </div>
  );
}
