import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";
import { randomUUID } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: NextRequest) {
  try {
    // 🔐 Get user from token
    const token = req.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );

    const keycloakId = decoded.sub;

    // 🔥 Get userId from DB
    const [userRows]: any = await pool.execute(
      "SELECT userid FROM users WHERE keycloak_id = ?",
      [keycloakId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userid = userRows[0].userid;

    // Parse FormData
    const formData = await req.formData();
    const content = formData.get("content") as string;
    const title = formData.get("title") as string;
    const files = formData.getAll("images") as File[];

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const postId = randomUUID();

    // ✅ Keep a backend default category for legacy DB compatibility.
    // Frontend no longer asks users to select a category.
    const systemCategory = "update";

    // ✅ Insert post
    await pool.execute(
      `INSERT INTO ec_posts (id, userid, category, title, content)
       VALUES (?, ?, ?, ?, ?)`,
      [postId, userid, systemCategory, title || null, content]
    );

    // ✅ Handle image uploads (if any)
    if (files && files.length > 0) {
      const uploadDir = join(process.cwd(), "public", "uploads", "posts");
      
      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (err) {
        // Directory might already exist
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const filename = `${postId}-${timestamp}-${i}-${file.name}`;
        const filepath = join(uploadDir, filename);
        const publicPath = `/uploads/posts/${filename}`;

        // Write file to disk
        const buffer = await file.arrayBuffer();
        await writeFile(filepath, Buffer.from(buffer));

        // Insert image record
        await pool.execute(
          `INSERT INTO ec_post_images 
          (id, post_id, image_path, display_order)
          VALUES (?, ?, ?, ?)`,
          [randomUUID(), postId, publicPath, i]
        );
      }
    }

    return NextResponse.json({ message: "Post created", postId });

  } catch (err) {
    console.error("Error creating post:", err);
    return NextResponse.json({ error: "Server error", details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    const keycloakId = decoded.sub;

    const [userRows]: any = await pool.execute(
      "SELECT userid FROM users WHERE keycloak_id = ?",
      [keycloakId],
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userid = userRows[0].userid;

    const [roleRows]: any = await pool.execute(
      `
      SELECT LOWER(r.role_name) AS role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.userid = ?
      `,
      [userid],
    );

    const roleNames = roleRows.map((row: any) => row.role_name);
    const isModerator =
      roleNames.includes("hr") || roleNames.includes("management");

    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "postId is required" }, { status: 400 });
    }

    const [postRows]: any = await pool.execute(
      "SELECT id, userid, is_deleted FROM ec_posts WHERE id = ? LIMIT 1",
      [postId],
    );

    if (postRows.length === 0 || postRows[0].is_deleted === 1) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const isOwner = postRows[0].userid === userid;

    if (!isOwner && !isModerator) {
      return NextResponse.json(
        { error: "You do not have permission to delete this post" },
        { status: 403 },
      );
    }

    await pool.execute(
      "UPDATE ec_posts SET is_deleted = 1, updated_at = NOW() WHERE id = ?",
      [postId],
    );

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    return NextResponse.json(
      { error: "Server error", details: String(err) },
      { status: 500 },
    );
  }
}

