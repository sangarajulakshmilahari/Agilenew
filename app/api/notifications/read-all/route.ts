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

    await pool.execute(
      `UPDATE notifications
       SET is_read = 1, read_at = NOW()
       WHERE user_id = ? AND is_read = 0`,
      [userId],
    );

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("PATCH /api/notifications/read-all error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

