import type { PortalMcpToolCallResult } from "@/app/api/lib/portalMcp";
import type {
  ArticleItem,
  AssistantBlock,
  BirthdayItem,
} from "@/app/lib/assistantBlocks";

export type { AssistantBlock } from "@/app/lib/assistantBlocks";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function asList(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => asRecord(item))
    .filter((item): item is Record<string, unknown> => Boolean(item));
}

function text(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  const next = String(value).trim();
  return next || fallback;
}

function numericId(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function formatDisplayDate(value: unknown): string {
  const raw = text(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime()) && /\d{4}/.test(raw)) {
    return parsed.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  return raw.replace(/-/g, " ");
}

function todayMonthDay(): string {
  return new Date()
    .toLocaleDateString("en-US", { month: "short", day: "2-digit" })
    .replace(" ", "-")
    .toLowerCase();
}

function isTodayLabel(date: string, forceToday: boolean): boolean {
  if (forceToday) return true;
  const normalized = date.replace(/\s+/g, "-").toLowerCase();
  return normalized === todayMonthDay();
}

function mapBirthdays(rows: Record<string, unknown>[], forceToday: boolean): BirthdayItem[] {
  return rows.map((row) => {
    const date = formatDisplayDate(row.date_of_birth ?? row.date ?? row.display_date);
    return {
      name: text(row.employee ?? row.name, "Employee"),
      date,
      isToday: isTodayLabel(date, forceToday),
    };
  });
}

function mapArticles(rows: Record<string, unknown>[]): ArticleItem[] {
  return rows.map((row) => ({
    id: numericId(row.articleId ?? row.id),
    title: text(row.title, "Untitled article"),
    summary: text(row.summary),
    publishedAt: formatDisplayDate(row.updatedAt ?? row.createdAt ?? row.publishedAt),
  }));
}

function blockFromTool(tool: PortalMcpToolCallResult): AssistantBlock | null {
  const payload = asRecord(tool.result);
  if (!payload || payload.error) return null;

  switch (tool.name) {
    case "get_todays_birthdays": {
      const items = mapBirthdays(asList(payload.birthdays), true);
      return { type: "birthdays", title: "Today's birthdays", items };
    }
    case "get_upcoming_birthdays": {
      const items = mapBirthdays(asList(payload.birthdays), false);
      return { type: "birthdays", title: "Upcoming birthdays", items };
    }
    case "get_articles": {
      const items = mapArticles(asList(payload.articles));
      return { type: "articles", title: "Latest articles", items };
    }
    case "get_article_details": {
      const article = asRecord(payload.article);
      const items = article ? mapArticles([article]) : [];
      return { type: "articles", title: "Article", items };
    }
    case "get_upcoming_events": {
      const items = asList(payload.events).map((row) => ({
        id: numericId(row.eventId ?? row.id),
        name: text(row.eventName ?? row.name, "Event"),
        date: formatDisplayDate(row.eventDate ?? row.date),
        location: text(row.location),
      }));
      return { type: "events", title: "Upcoming events", items };
    }
    case "get_holidays": {
      const items = asList(payload.holidays).map((row) => ({
        name: text(row.name, "Holiday"),
        date: text(row.date),
      }));
      return { type: "holidays", title: "Holidays", items };
    }
    case "get_portal_content": {
      const mission = asRecord(payload.mission);
      const vision = asRecord(payload.vision);
      return {
        type: "portal",
        title: "Portal content",
        mission: mission
          ? { title: text(mission.title, "Our mission"), content: text(mission.content) }
          : undefined,
        vision: vision
          ? { title: text(vision.title, "Our vision"), content: text(vision.content) }
          : undefined,
        values: asList(payload.values).map((row) => ({
          text: text(row.valueText ?? row.text),
        })),
      };
    }
    case "get_employee_corner_posts": {
      const items = asList(payload.posts).map((row) => ({
        id: row.id == null ? null : String(row.id),
        author: text(row.username ?? row.author, "Employee"),
        content: text(row.content ?? row.title),
        date: formatDisplayDate(row.created_at ?? row.createdAt ?? row.date),
        likes: Number(row.likes || 0),
        comments: Number(row.comments || 0),
      }));
      return { type: "posts", title: "Employee Corner", items };
    }
    default:
      return null;
  }
}

export function blocksFromToolCalls(toolCalls: PortalMcpToolCallResult[]): AssistantBlock[] {
  const blocks: AssistantBlock[] = [];
  for (const tool of toolCalls) {
    const block = blockFromTool(tool);
    if (block) blocks.push(block);
  }
  return blocks;
}
