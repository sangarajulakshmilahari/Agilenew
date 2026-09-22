import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";
import { ensureNotificationsTable, getCurrentUserId } from "@/app/api/notifications/helpers";

export async function PATCH(req: NextRequest) {
  try {
    await ensureNotificationsTable();

    const userId = await getCurrentUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const notificationId = body?.notificationId as string | undefined;
    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    const [result]: any = await pool.execute(
      `UPDATE notifications
       SET is_read = 1, read_at = NOW()
       WHERE id = ? AND user_id = ?`,
      [notificationId, userId],
    );

    if (!result?.affectedRows) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("PATCH /api/notifications/read error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

