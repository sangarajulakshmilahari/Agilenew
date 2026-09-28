"use client";

import type { ReactNode } from "react";
import type { AssistantBlock } from "@/app/lib/assistantBlocks";

type CenterView =
  | "home"
  | "holiday"
  | "events"
  | "learning"
  | "articles"
  | "corner"
  | "managePortal"
  | "portal"
  | "articleManage";

type AssistantRichContentProps = {
  text: string;
  blocks?: AssistantBlock[];
  onNavigate?: (view: CenterView) => void;
};

function isTableLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed.startsWith("|")) return false;
  return trimmed.includes("|");
}

function isTableDivider(line: string): boolean {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function stripMarkdownTables(text: string): string {
  return text
    .split("\n")
    .filter((line) => !isTableLine(line) && !isTableDivider(line))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+?\*\*|\*[^*]+?\*|`[^`]+?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(<strong key={`b-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={`i-${key++}`}>{token.slice(1, -1)}</em>);
    } else {
      nodes.push(<code key={`c-${key++}`}>{token.slice(1, -1)}</code>);
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderMarkdown(text: string): ReactNode {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    if (isTableLine(trimmed)) {
      const rows: string[][] = [];
      while (index < lines.length && isTableLine(lines[index].trim())) {
        const current = lines[index].trim();
        if (!isTableDivider(current)) {
          rows.push(
            current
              .replace(/^\|/, "")
              .replace(/\|$/, "")
              .split("|")
              .map((cell) => cell.trim()),
          );
        }
        index += 1;
      }
      if (rows.length > 0) {
        const [header, ...body] = rows;
        blocks.push(
          <div className="ar-table-wrap" key={`table-${blocks.length}`}>
            <table className="ar-table">
              <thead>
                <tr>
                  {header.map((cell) => (
                    <th key={cell}>{renderInline(cell)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rowIndex) => (
                  <tr key={`r-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>{renderInline(cell)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
      }
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? "h3" : "h4";
      blocks.push(
        <Tag className="ar-heading" key={`h-${blocks.length}`}>
          {renderInline(heading[2])}
        </Tag>,
      );
      index += 1;
      continue;
    }

    if (/^[-*•]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^[-*•]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*•]\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ul className="ar-list" key={`ul-${blocks.length}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ""));
        index += 1;
      }
      blocks.push(
        <ol className="ar-list" key={`ol-${blocks.length}`}>
          {items.map((item, itemIndex) => (
            <li key={`${item}-${itemIndex}`}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    const para: string[] = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^[-*•]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim()) &&
      !/^#{1,3}\s+/.test(lines[index].trim()) &&
      !isTableLine(lines[index].trim())
    ) {
      para.push(lines[index].trim());
      index += 1;
    }
    blocks.push(
      <p className="ar-p" key={`p-${blocks.length}`}>
        {renderInline(para.join(" "))}
      </p>,
    );
  }

  return blocks;
}

function BlockList({
  blocks,
  onNavigate,
}: {
  blocks: AssistantBlock[];
  onNavigate?: (view: CenterView) => void;
}) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "birthdays") {
          return (
            <div className="ar-stack" key={`birthdays-${index}`}>
              <p className="ar-kicker">{block.title}</p>
              <div className="ar-card-list">
                {block.items.length === 0 ? (
                  <div className="ar-row">No birthdays found.</div>
                ) : (
                  block.items.map((item) => (
                    <div className="ar-row" key={`${item.name}-${item.date}`}>
                      <span className="ar-emoji">🎂</span>
                      <div className="ar-row-main">
                        <strong>{item.name}</strong>
                        {item.isToday && <span className="ar-badge">Today!</span>}
                      </div>
                      <span className="ar-meta">{item.date}</span>
                    </div>
                  ))
                )}
              </div>
              <button
                type="button"
                className="ar-action"
                onClick={() => onNavigate?.("holiday")}
              >
                View calendar
              </button>
            </div>
          );
        }

        if (block.type === "articles") {
          return (
            <div className="ar-stack" key={`articles-${index}`}>
              <p className="ar-kicker">{block.title}</p>
              {block.items.length === 0 ? (
                <div className="ar-card">No published articles found.</div>
              ) : (
                block.items.map((item) => (
                  <div className="ar-card" key={`${item.id ?? item.title}`}>
                    <p className="ar-card-title">📰 {item.title}</p>
                    {item.summary && <p className="ar-card-body">{item.summary}</p>}
                    {item.publishedAt && <p className="ar-meta">{item.publishedAt}</p>}
                    <button
                      type="button"
                      className="ar-action"
                      onClick={() => onNavigate?.("articles")}
                    >
                      Read article →
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        }

        if (block.type === "events") {
          return (
            <div className="ar-stack" key={`events-${index}`}>
              <p className="ar-kicker">{block.title}</p>
              {block.items.length === 0 ? (
                <div className="ar-card">No upcoming events found.</div>
              ) : (
                block.items.map((item) => (
                  <div className="ar-card" key={`${item.id ?? item.name}`}>
                    <p className="ar-card-title">📅 {item.name}</p>
                    {item.date && <p className="ar-meta">{item.date}</p>}
                    {item.location && <p className="ar-card-body">{item.location}</p>}
                    <button
                      type="button"
                      className="ar-action"
                      onClick={() => onNavigate?.("events")}
                    >
                      View event
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        }

        if (block.type === "holidays") {
          return (
            <div className="ar-stack" key={`holidays-${index}`}>
              <p className="ar-kicker">{block.title}</p>
              <div className="ar-card-list">
                {block.items.map((item) => (
                  <div className="ar-row" key={`${item.name}-${item.date}`}>
                    <span className="ar-emoji">🎉</span>
                    <div className="ar-row-main">
                      <strong>{item.name}</strong>
                    </div>
                    <span className="ar-meta">{item.date}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="ar-action"
                onClick={() => onNavigate?.("holiday")}
              >
                View calendar
              </button>
            </div>
          );
        }

        if (block.type === "portal") {
          return (
            <div className="ar-stack" key={`portal-${index}`}>
              {block.vision && (
                <div className="ar-card">
                  <p className="ar-kicker">{block.vision.title}</p>
                  <p className="ar-quote">“{block.vision.content}”</p>
                </div>
              )}
              {block.mission && (
                <div className="ar-card">
                  <p className="ar-kicker">{block.mission.title}</p>
                  <p className="ar-quote">“{block.mission.content}”</p>
                </div>
              )}
              {block.values.length > 0 && (
                <div className="ar-card-list">
                  {block.values.map((value) => (
                    <div className="ar-row" key={value.text}>
                      <span className="ar-emoji">❤️</span>
                      <div className="ar-row-main">
                        <strong>{value.text}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        }

        return (
          <div className="ar-stack" key={`posts-${index}`}>
            <p className="ar-kicker">{block.title}</p>
            {block.items.map((item) => (
              <div className="ar-card" key={item.id ?? `${item.author}-${item.date}`}>
                <p className="ar-card-title">{item.author}</p>
                <p className="ar-card-body">{item.content}</p>
                <p className="ar-meta">
                  {item.date}
                  {item.likes || item.comments
                    ? ` · ${item.likes} likes · ${item.comments} comments`
                    : ""}
                </p>
                <button
                  type="button"
                  className="ar-action"
                  onClick={() => onNavigate?.("corner")}
                >
                  Open Employee Corner
                </button>
              </div>
            ))}
          </div>
        );
      })}
    </>
  );
}

export default function AssistantRichContent({
  text,
  blocks = [],
  onNavigate,
}: AssistantRichContentProps) {
  const hasBlocks = blocks.length > 0;
  const displayText = hasBlocks ? stripMarkdownTables(text) : text;

  return (
    <div className="ar-wrap">
      {displayText ? <div className="ar-copy">{renderMarkdown(displayText)}</div> : null}
      {hasBlocks ? <BlockList blocks={blocks} onNavigate={onNavigate} /> : null}
      <style jsx global>{`
        .ar-wrap {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ar-copy {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ar-p,
        .ar-heading,
        .ar-quote,
        .ar-card-title,
        .ar-card-body,
        .ar-kicker,
        .ar-meta {
          margin: 0;
        }
        .ar-p,
        .ar-card-body,
        .ar-quote {
          font-size: 13px;
          line-height: 1.5;
          color: inherit;
        }
        .ar-heading {
          font-size: 14px;
          color: #1F3A68;
        }
        .ar-quote {
          font-style: italic;
        }
        .ar-list {
          margin: 0;
          padding-left: 18px;
          display: grid;
          gap: 4px;
          font-size: 13px;
        }
        .ar-stack {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .ar-kicker {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #F26522;
        }
        .ar-card-list,
        .ar-card {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          background: #ffffff;
          overflow: hidden;
        }
        .ar-card {
          padding: 10px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .ar-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 12px;
          border-bottom: 1px solid #E2E8F0;
        }
        .ar-row:last-child {
          border-bottom: none;
        }
        .ar-emoji {
          width: 20px;
          text-align: center;
        }
        .ar-row-main {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: #0f172a;
        }
        .ar-card-title {
          font-size: 13px;
          font-weight: 700;
          color: #1F3A68;
        }
        .ar-meta {
          font-size: 11px;
          color: #64748b;
          white-space: nowrap;
        }
        .ar-badge {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          background: #F26522;
          color: #ffffff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
        }
        .ar-action {
          align-self: flex-start;
          border: none;
          background: transparent;
          color: #F26522;
          font-size: 12px;
          font-weight: 700;
          padding: 0;
          cursor: pointer;
        }
        .ar-table-wrap {
          overflow-x: auto;
        }
        .ar-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .ar-table th,
        .ar-table td {
          border: 1px solid #E2E8F0;
          padding: 6px 8px;
          text-align: left;
        }
        html[data-theme="dark"] .ar-card,
        html[data-theme="dark"] .ar-card-list {
          background: #111827;
          border-color: #334155;
        }
        html[data-theme="dark"] .ar-row {
          border-bottom-color: #334155;
        }
        html[data-theme="dark"] .ar-card-title,
        html[data-theme="dark"] .ar-row-main,
        html[data-theme="dark"] .ar-heading {
          color: #e2e8f0;
        }
      `}</style>
    </div>
  );
}
