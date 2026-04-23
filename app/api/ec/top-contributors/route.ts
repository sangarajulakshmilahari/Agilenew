import { NextResponse } from "next/server";
import pool from "@/config/db";

export async function GET() {
  try {
    const [rows]: any = await pool.execute(`
      SELECT 
        u.userid,
        u.username,

        COUNT(DISTINCT p.id) AS posts_count,
        COUNT(DISTINCT c.id) AS comments_count,
        COUNT(DISTINCT l.id) AS likes_count,

        (
          COUNT(DISTINCT p.id) * 5 +
          COUNT(DISTINCT c.id) * 3 +
          COUNT(DISTINCT l.id) * 1
        ) AS score

      FROM users u

      LEFT JOIN ec_posts p 
        ON p.userid = u.userid 
        AND YEARWEEK(p.created_at, 1) = YEARWEEK(CURDATE(), 1)

      LEFT JOIN ec_comments c 
        ON c.userid = u.userid 
        AND YEARWEEK(c.created_at, 1) = YEARWEEK(CURDATE(), 1)

      LEFT JOIN ec_likes l 
        ON l.userid = u.userid 
        AND YEARWEEK(l.created_at, 1) = YEARWEEK(CURDATE(), 1)

      GROUP BY u.userid, u.username
      HAVING score > 0
      ORDER BY score DESC
      LIMIT 5
    `);

    return NextResponse.json(rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}