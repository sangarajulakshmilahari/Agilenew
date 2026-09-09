import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/config/db";
import { requireHrUser } from "@/app/api/lib/requireHr";

type ContentRow = RowDataPacket & {
  ContentId: number;
  ContentKey: string;
  Title: string;
  Content: string;
};

type ValueRow = RowDataPacket & {
  ValueId: number;
  ValueText: string;
  DisplayOrder: number;
};

function mapContent(row: ContentRow) {
  return {
    contentId: row.ContentId,
    contentKey: row.ContentKey,
    title: row.Title,
    content: row.Content,
  };
}

export async function GET() {
  try {
    const [contentRows] = await pool.execute<ContentRow[]>(
      `
      SELECT ContentId, ContentKey, Title, Content
      FROM portal_content
      WHERE IsPublished = 1
        AND ContentKey IN (?, ?)
      `,
      ["mission", "vision"],
    );

    const [valueRows] = await pool.execute<ValueRow[]>(
      `
      SELECT ValueId, ValueText, DisplayOrder
      FROM portal_values
      WHERE IsPublished = 1
      ORDER BY DisplayOrder ASC
      `,
    );

    const mission = contentRows.find(
      (row) => String(row.ContentKey).toLowerCase() === "mission",
    );
    const vision = contentRows.find(
      (row) => String(row.ContentKey).toLowerCase() === "vision",
    );

    return NextResponse.json({
      mission: mission ? mapContent(mission) : null,
      vision: vision ? mapContent(vision) : null,
      values: valueRows.map((row) => ({
        valueId: row.ValueId,
        valueText: row.ValueText,
        displayOrder: row.DisplayOrder,
      })),
    });
  } catch (err) {
    console.error("Failed to load portal content:", err);
    return NextResponse.json(
      { error: "Unable to load portal content" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireHrUser(req);
  if ("error" in auth) return auth.error;

  try {
    let body: {
      contentKey?: unknown;
      title?: unknown;
      content?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const contentKey = String(body.contentKey ?? "").trim().toLowerCase();
    if (contentKey !== "mission" && contentKey !== "vision") {
      return NextResponse.json(
        { error: "contentKey must be mission or vision" },
        { status: 400 },
      );
    }

    const title = String(body.title ?? "").trim();
    const content = String(body.content ?? "").trim();

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

    const [existingRows] = await pool.execute<ContentRow[]>(
      `
      SELECT ContentId, ContentKey, Title, Content
      FROM portal_content
      WHERE ContentKey = ?
      LIMIT 1
      `,
      [contentKey],
    );

    if (!existingRows.length) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    await pool.execute<ResultSetHeader>(
      `
      UPDATE portal_content
      SET Title = ?, Content = ?, UpdatedBy = ?
      WHERE ContentKey = ?
      `,
      [title, content, auth.userId, contentKey],
    );

    const [updatedRows] = await pool.execute<ContentRow[]>(
      `
      SELECT ContentId, ContentKey, Title, Content
      FROM portal_content
      WHERE ContentKey = ?
      LIMIT 1
      `,
      [contentKey],
    );

    return NextResponse.json({ content: mapContent(updatedRows[0]) });
  } catch (err) {
    console.error("Failed to update portal content:", err);
    return NextResponse.json(
      { error: "Unable to update portal content" },
      { status: 500 },
    );
  }
}
