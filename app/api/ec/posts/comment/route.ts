import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
   const { postId, content, parentId } = await req.json();

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

   await pool.execute(
  `INSERT INTO ec_comments (id, post_id, userid, content, parent_id)
   VALUES (?, ?, ?, ?, ?)`,
  [randomUUID(), postId, userid, content, parentId || null]
);

    return NextResponse.json({ message: "Comment added" });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}