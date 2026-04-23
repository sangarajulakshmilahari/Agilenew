import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    const [rows]: any = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.created_at,
        u.username,
        (SELECT image_path FROM ec_post_images 
         WHERE post_id = p.id 
         ORDER BY display_order ASC 
         LIMIT 1) AS image_path
      FROM ec_posts p
      JOIN users u ON p.userid = u.userid
      WHERE p.id = ? AND p.is_deleted = 0
    `, [id]);

    if (rows.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(rows[0]);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}