"use client";

import { useEffect, useMemo, useState } from "react";
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

function excerpt(article: Article) {
  const raw = (article.summary || article.content || "").replace(/\s+/g, " ").trim();
  if (raw.length <= 140) return raw;
  return `${raw.slice(0, 137).trim()}...`;
}

export default function FeaturedArticles() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Article | null>(null);
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const published = articles.filter((article) => article.status !== "Draft");
    if (!needle) return published;
    return published.filter((article) => {
      const haystack = `${article.title} ${article.summary || ""} ${article.content || ""}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [articles, query]);

  return (
    <div className="fa-wrap">
      <div className="fa-header">
        <h2 className="fa-title">Articles</h2>
        <p className="fa-sub">Published stories, updates, and insights from Adroitent.</p>
      </div>

      <div className="fa-search">
        <svg className="fa-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-4-4" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Articles"
          aria-label="Search articles"
          className="fa-search-input"
        />
      </div>

      {error && <p className="fa-error">{error}</p>}
      {loading && <p className="fa-sub">Loading articles...</p>}
      {!loading && !error && filtered.length === 0 && (
        <div className="fa-empty">
          <p className="fa-body">
            {query.trim() ? "No articles match your search." : "No published articles yet."}
          </p>
        </div>
      )}

      <div className="fa-list">
        {filtered.map((article) => (
          <button
            key={article.articleId}
            type="button"
            className="fa-row"
            onClick={() => setActive(article)}
          >
            {article.coverImage ? (
              <img src={article.coverImage} alt="" className="fa-thumb" />
            ) : (
              <div className="fa-thumb empty" aria-hidden="true" />
            )}
            <div className="fa-row-body">
              <h3>{article.title}</h3>
              <p>{excerpt(article)}</p>
            </div>
            <span className="fa-date">{formatDate(article.updatedAt || article.createdAt)}</span>
            <span className="fa-arrow" aria-hidden="true">→</span>
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
        .fa-wrap {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .fa-header {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .fa-title {
          margin: 0;
          font-size: 22px;
          font-weight: 800;
          color: #1F3A68;
        }
        .fa-sub {
          margin: 0;
          font-size: 13px;
          color: #64748b;
        }
        .fa-error {
          margin: 0;
          font-size: 13px;
          font-weight: 600;
          color: #b42318;
        }
        .fa-search {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          padding: 10px 12px;
        }
        .fa-search-icon {
          width: 16px;
          height: 16px;
          color: #64748b;
          flex-shrink: 0;
        }
        .fa-search-input {
          flex: 1;
          min-width: 0;
          border: none;
          outline: none;
          background: transparent;
          font-size: 14px;
          color: #1F3A68;
          font-family: inherit;
        }
        .fa-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .fa-row {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 14px;
          text-align: left;
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 10px 12px;
          cursor: pointer;
          transition: box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .fa-row:hover {
          border-color: rgba(31, 58, 104, 0.28);
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
        }
        .fa-thumb {
          width: 64px;
          height: 64px;
          border-radius: 10px;
          object-fit: cover;
          background: #f3eee6;
          flex-shrink: 0;
        }
        .fa-thumb.empty {
          background: linear-gradient(135deg, #1F3A68, #F26522);
        }
        .fa-row-body {
          flex: 1;
          min-width: 0;
        }
        .fa-row-body h3 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: #1F3A68;
        }
        .fa-row-body p,
        .fa-body {
          margin: 0;
          font-size: 13px;
          line-height: 1.45;
          color: #64748b;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .fa-empty {
          background: #ffffff;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 16px;
        }
        .fa-date {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
          color: #F26522;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .fa-arrow {
          color: #1F3A68;
          font-size: 16px;
          flex-shrink: 0;
        }
        .fa-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,0.5);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }
        .fa-modal {
          width: 640px;
          max-width: 100%;
          max-height: 88vh;
          overflow: auto;
          background: var(--bg-card-solid, #fff);
          border-radius: 20px;
          padding: 24px;
          position: relative;
          border: 1px solid rgba(31,58,104,0.16);
        }
        .fa-close {
          position: absolute;
          top: 12px;
          right: 14px;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 50%;
          background: var(--bg-soft);
          color: var(--text-primary);
          font-size: 22px;
          cursor: pointer;
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
        .fa-modal h3 {
          margin: 0 0 10px;
          font-size: 22px;
          color: #1F3A68;
        }
        .fa-summary {
          margin: 0 0 14px;
          font-size: 14px;
          color: #64748b;
        }
        .fa-content {
          white-space: pre-wrap;
          font-size: 15px;
          line-height: 1.7;
          color: #1F3A68;
        }
        :global(html[data-theme="dark"]) .fa-title,
        :global(html[data-theme="dark"]) .fa-row-body h3,
        :global(html[data-theme="dark"]) .fa-modal h3,
        :global(html[data-theme="dark"]) .fa-content,
        :global(html[data-theme="dark"]) .fa-search-input {
          color: #fff;
        }
        :global(html[data-theme="dark"]) .fa-row,
        :global(html[data-theme="dark"]) .fa-search,
        :global(html[data-theme="dark"]) .fa-empty,
        :global(html[data-theme="dark"]) .fa-modal {
          background: #123a78;
          border-color: rgba(169,198,245,0.22);
        }

        @media (max-width: 700px) {
          .fa-row {
            flex-wrap: wrap;
            align-items: flex-start;
          }
          .fa-row-body {
            flex: 1 1 calc(100% - 90px);
          }
          .fa-date {
            order: 4;
            margin-left: 78px;
          }
          .fa-arrow {
            margin-left: auto;
          }
        }
      `}</style>
    </div>
  );
}
