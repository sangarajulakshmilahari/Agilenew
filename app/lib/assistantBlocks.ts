export type BirthdayItem = {
  name: string;
  date: string;
  isToday: boolean;
};

export type ArticleItem = {
  id: number | null;
  title: string;
  summary: string;
  publishedAt: string;
};

export type EventItem = {
  id: number | null;
  name: string;
  date: string;
  location: string;
};

export type HolidayItem = {
  name: string;
  date: string;
};

export type PortalValueItem = {
  text: string;
};

export type CornerPostItem = {
  id: string | null;
  author: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
};

export type AssistantBlock =
  | { type: "birthdays"; title: string; items: BirthdayItem[] }
  | { type: "articles"; title: string; items: ArticleItem[] }
  | { type: "events"; title: string; items: EventItem[] }
  | { type: "holidays"; title: string; items: HolidayItem[] }
  | {
      type: "portal";
      title: string;
      mission?: { title: string; content: string };
      vision?: { title: string; content: string };
      values: PortalValueItem[];
    }
  | { type: "posts"; title: string; items: CornerPostItem[] };
