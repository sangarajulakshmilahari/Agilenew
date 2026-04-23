import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { postId, commentId } = await req.json();

    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    const keycloakId = decoded.sub;

    const [userRows]: any = await pool.execute(
      "SELECT userid FROM users WHERE keycloak_id = ?",
      [keycloakId]
    );

    if (!userRows || userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userid = userRows[0].userid;

    const [existing]: any = await pool.execute(
      "SELECT * FROM ec_comment_likes WHERE comment_id = ? AND userid = ?",
      [commentId, userid]
    );

    if (existing.length > 0) {
      await pool.execute(
        "DELETE FROM ec_comment_likes WHERE comment_id = ? AND userid = ?",
        [commentId, userid]
      );
      return NextResponse.json({ message: "Comment like removed" });
    }

    await pool.execute(
      "INSERT INTO ec_comment_likes (id, comment_id, userid) VALUES (?, ?, ?)",
      [randomUUID(), commentId, userid]
    );

    return NextResponse.json({ message: "Comment liked" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}