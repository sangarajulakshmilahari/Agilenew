import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";
import { ensureNotificationsTable, getCurrentUserId } from "@/app/api/notifications/helpers";

export async function GET(req: NextRequest) {
  try {
    await ensureNotificationsTable();

    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") || 10), 1), 50);

    const [rows]: any = await pool.query(
      `SELECT id, type, title, message, entity_type, entity_id, action_url, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ${limit}`,
      [userId],
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

