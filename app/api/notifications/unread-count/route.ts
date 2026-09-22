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

    const [rows]: any = await pool.execute(
      `SELECT COUNT(*) AS unreadCount
       FROM notifications
       WHERE user_id = ? AND is_read = 0`,
      [userId],
    );

    return NextResponse.json({ unreadCount: Number(rows?.[0]?.unreadCount || 0) });
  } catch (error) {
    console.error("GET /api/notifications/unread-count error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

