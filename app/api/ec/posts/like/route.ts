import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();

    const token = req.cookies.get("access_token")?.value;
    const decoded = JSON.parse(
      Buffer.from(token!.split(".")[1], "base64").toString()
    );

    const keycloakId = decoded.sub;

    const [userRows]: any = await pool.execute(
      "SELECT userid FROM users WHERE keycloak_id = ?",
      [keycloakId]
    );

    const userid = userRows[0].userid;

    // toggle like
    const [existing]: any = await pool.execute(
      "SELECT * FROM ec_likes WHERE post_id = ? AND userid = ?",
      [postId, userid]
    );

    if (existing.length > 0) {
      await pool.execute(
        "DELETE FROM ec_likes WHERE post_id = ? AND userid = ?",
        [postId, userid]
      );
    } else {
      await pool.execute(
        "INSERT INTO ec_likes (id, post_id, userid) VALUES (?, ?, ?)",
        [randomUUID(), postId, userid]
      );
    }

    return NextResponse.json({ message: "ok" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}