import { mkdir, writeFile } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import type { RowDataPacket } from "mysql2";

export const ARTICLE_IMAGES_DIR = join(process.cwd(), "public", "uploads", "articles");
export const ALLOWED_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp"]);
export const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export type ArticleRow = RowDataPacket & {
  ArticleId: number;
  Title: string;
  Summary: string | null;
  Content: string;
  CoverImage: string | null;
  Status: "Draft" | "Published";
  CreatedBy: number | null;
  UpdatedBy: number | null;
  CreatedAt: Date | string | null;
  UpdatedAt: Date | string | null;
};

export function formatTimestamp(value: Date | string | null) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function mapArticle(row: ArticleRow) {
  return {
    articleId: row.ArticleId,
    title: row.Title,
    summary: row.Summary,
    content: row.Content,
    coverImage: row.CoverImage,
    status: row.Status,
    createdBy: row.CreatedBy,
    updatedBy: row.UpdatedBy,
    createdAt: formatTimestamp(row.CreatedAt),
    updatedAt: formatTimestamp(row.UpdatedAt),
  };
}

export function parseArticleId(raw: string) {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export function normalizeStatus(value: unknown): "Draft" | "Published" | null {
  const status = String(value ?? "").trim();
  if (status === "Draft" || status === "Published") return status;
  return null;
}

export async function saveCoverImage(file: File) {
  if (file.size <= 0) {
    throw new Error("Cover image is required");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Cover image is too large. Maximum size is 10MB");
  }

  const mime = (file.type || "").toLowerCase();
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("Only PNG, JPG, JPEG, and WEBP are allowed");
  }

  await mkdir(ARTICLE_IMAGES_DIR, { recursive: true });
  const extension = extname(file.name)?.toLowerCase() || ".jpg";
  const safeExt = ALLOWED_EXTS.has(extension) ? extension : ".jpg";
  const filename = `${randomUUID()}${safeExt}`;
  const filepath = join(ARTICLE_IMAGES_DIR, filename);
  await writeFile(filepath, Buffer.from(await file.arrayBuffer()));
  return `/uploads/articles/${filename}`;
}
