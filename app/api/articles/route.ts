import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/config/db";
import { requireHrUser } from "@/app/api/lib/requireHr";
import {
  mapArticle,
  normalizeStatus,
  saveCoverImage,
  type ArticleRow,
} from "./helpers";

const SELECT_FIELDS = `
  ArticleId, Title, Summary, Content, CoverImage, Status,
  CreatedBy, UpdatedBy, CreatedAt, UpdatedAt
`;

export async function GET(req: NextRequest) {
  try {
    const wantAll = req.nextUrl.searchParams.get("all") === "1";

    if (wantAll) {
      const auth = await requireHrUser(req);
      if ("error" in auth) return auth.error;
    }

    const sql = wantAll
      ? `SELECT ${SELECT_FIELDS} FROM articles ORDER BY UpdatedAt DESC, ArticleId DESC`
      : `SELECT ${SELECT_FIELDS} FROM articles WHERE Status = 'Published' ORDER BY UpdatedAt DESC, ArticleId DESC`;

    const [rows] = await pool.execute<ArticleRow[]>(sql);

    return NextResponse.json({
      articles: rows.map(mapArticle),
    });
  } catch (err) {
    console.error("Failed to list articles:", err);
    return NextResponse.json(
      { error: "Unable to load articles" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireHrUser(req);
  if ("error" in auth) return auth.error;

  try {
    const formData = await req.formData();
    const title = String(formData.get("title") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim() || null;
    const content = String(formData.get("content") ?? "").trim();
    const status = normalizeStatus(formData.get("status")) || "Draft";
    const cover = formData.get("coverImage");

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

    let coverImage: string | null = null;
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

    const [result] = await pool.execute<ResultSetHeader>(
      `
      INSERT INTO articles
      (Title, Summary, Content, CoverImage, Status, CreatedBy, UpdatedBy)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [title, summary, content, coverImage, status, auth.userId, auth.userId],
    );

    const [createdRows] = await pool.execute<ArticleRow[]>(
      `SELECT ${SELECT_FIELDS} FROM articles WHERE ArticleId = ? LIMIT 1`,
      [result.insertId],
    );

    return NextResponse.json({ article: mapArticle(createdRows[0]) }, { status: 201 });
  } catch (err) {
    console.error("Failed to create article:", err);
    return NextResponse.json(
      { error: "Unable to create article" },
      { status: 500 },
    );
  }
}
