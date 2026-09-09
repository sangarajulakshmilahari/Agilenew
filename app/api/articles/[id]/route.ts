import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/config/db";
import { requireHrUser } from "@/app/api/lib/requireHr";
import {
  mapArticle,
  normalizeStatus,
  parseArticleId,
  saveCoverImage,
  type ArticleRow,
} from "../helpers";

const SELECT_FIELDS = `
  ArticleId, Title, Summary, Content, CoverImage, Status,
  CreatedBy, UpdatedBy, CreatedAt, UpdatedAt
`;

type RouteContext = { params: { id: string } };

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const auth = await requireHrUser(req);
  if ("error" in auth) return auth.error;

  const articleId = parseArticleId(params.id);
  if (!articleId) {
    return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
  }

  try {
    const [existingRows] = await pool.execute<ArticleRow[]>(
      `SELECT ${SELECT_FIELDS} FROM articles WHERE ArticleId = ? LIMIT 1`,
      [articleId],
    );
    if (!existingRows.length) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const existing = existingRows[0];
    const formData = await req.formData();
    const titleRaw = formData.get("title");
    const summaryRaw = formData.get("summary");
    const contentRaw = formData.get("content");
    const statusRaw = formData.get("status");
    const cover = formData.get("coverImage");

    const title =
      titleRaw == null ? existing.Title : String(titleRaw).trim();
    const summary =
      summaryRaw == null ? existing.Summary : String(summaryRaw).trim() || null;
    const content =
      contentRaw == null ? existing.Content : String(contentRaw).trim();
    const status = statusRaw == null
      ? existing.Status
      : normalizeStatus(statusRaw);

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (title.length > 255) {
      return NextResponse.json(
        { error: "Title must be 255 characters or fewer" },
        { status: 400 },
      );
    }
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    if (!status) {
      return NextResponse.json(
        { error: "Status must be Draft or Published" },
        { status: 400 },
      );
    }

    let coverImage = existing.CoverImage;
    if (cover instanceof File && cover.size > 0) {
      try {
        coverImage = await saveCoverImage(cover);
      } catch (err: any) {
        return NextResponse.json(
          { error: err?.message || "Invalid cover image" },
          { status: 400 },
        );
      }
    }

    await pool.execute<ResultSetHeader>(
      `
      UPDATE articles
      SET Title = ?, Summary = ?, Content = ?, CoverImage = ?, Status = ?, UpdatedBy = ?
      WHERE ArticleId = ?
      `,
      [title, summary, content, coverImage, status, auth.userId, articleId],
    );

    const [updatedRows] = await pool.execute<ArticleRow[]>(
      `SELECT ${SELECT_FIELDS} FROM articles WHERE ArticleId = ? LIMIT 1`,
      [articleId],
    );

    return NextResponse.json({ article: mapArticle(updatedRows[0]) });
  } catch (err) {
    console.error("Failed to update article:", err);
    return NextResponse.json(
      { error: "Unable to update article" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const auth = await requireHrUser(req);
  if ("error" in auth) return auth.error;

  const articleId = parseArticleId(params.id);
  if (!articleId) {
    return NextResponse.json({ error: "Invalid article id" }, { status: 400 });
  }

  try {
    const [existingRows] = await pool.execute<ArticleRow[]>(
      "SELECT ArticleId FROM articles WHERE ArticleId = ? LIMIT 1",
      [articleId],
    );
    if (!existingRows.length) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await pool.execute<ResultSetHeader>(
      "DELETE FROM articles WHERE ArticleId = ?",
      [articleId],
    );

    return NextResponse.json({ message: "Article deleted" });
  } catch (err) {
    console.error("Failed to delete article:", err);
    return NextResponse.json(
      { error: "Unable to delete article" },
      { status: 500 },
    );
  }
}
