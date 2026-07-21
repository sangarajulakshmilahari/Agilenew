import { NextRequest, NextResponse } from "next/server";
import pool from "@/config/db";

/* ✅ Build comment tree (moved outside for clean code) */
const buildTree = (comments: any[]) => {
  const map: any = {};
  const roots: any[] = [];

  comments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });

  comments.forEach((c) => {
    if (c.parent_id && map[c.parent_id]) {
      map[c.parent_id].replies.push(map[c.id]);
    } else {
      roots.push(map[c.id]); // fallback if parent missing
    }
  });

  return roots;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get("mode") || "recent").toLowerCase();

    /* 🔐 Get current user */
    const token = req.cookies.get("access_token")?.value;
    let currentUserId = null;

    if (token) {
      const decoded = JSON.parse(
        Buffer.from(token.split(".")[1], "base64").toString()
      );
      const keycloakId = decoded.sub;

      const [userRows]: any = await pool.execute(
        "SELECT userid FROM users WHERE keycloak_id = ?",
        [keycloakId]
      );

      if (userRows.length > 0) {
        currentUserId = userRows[0].userid;
      }
    }

    /* 📝 Get all posts */
    const [posts]: any = await pool.execute(`
      SELECT 
        p.id,
        p.title,
        p.content,
        p.category,
        p.created_at,
        u.username,
        p.userid,
        
        (SELECT COUNT(*) FROM ec_likes l WHERE l.post_id = p.id) AS likes,
        (SELECT COUNT(*) FROM ec_comments c WHERE c.post_id = p.id) AS comments,
        (SELECT MAX(c.created_at) FROM ec_comments c WHERE c.post_id = p.id) AS latest_comment_at,
        
        (SELECT image_path FROM ec_post_images 
         WHERE post_id = p.id 
         ORDER BY display_order ASC 
         LIMIT 1) AS image_path

      FROM ec_posts p
      JOIN users u ON p.userid = u.userid
      WHERE p.is_deleted = 0
      ORDER BY p.created_at DESC
    `);

    /* 💬 Get all comments (with parent_id for threading) */
    const [allComments]: any = await pool.execute(`
      SELECT 
        c.id,
        c.post_id,
        c.parent_id,
        c.content,
        c.created_at,
        u.username
      FROM ec_comments c
      JOIN users u ON c.userid = u.userid
      WHERE c.is_deleted = 0
      ORDER BY c.created_at ASC
    `);

    /* 💬 Get comment like counts */
    const [commentLikes]: any = await pool.execute(`
      SELECT comment_id, COUNT(*) AS likes
      FROM ec_comment_likes
      GROUP BY comment_id
    `);
    const commentLikesMap = new Map(commentLikes.map((item: any) => [item.comment_id, item.likes]));

    /* ❤️ Get current user's post likes */
    let userLikes: any[] = [];
    if (currentUserId) {
      const [likes]: any = await pool.execute(
        `SELECT post_id FROM ec_likes WHERE userid = ?`,
        [currentUserId]
      );
      userLikes = likes.map((l: any) => l.post_id);
    }

    /* 💬 Get current user's comment likes */
    let userCommentLikes: any[] = [];
    if (currentUserId) {
      const [commentLikesRows]: any = await pool.execute(
        `SELECT comment_id FROM ec_comment_likes WHERE userid = ?`,
        [currentUserId]
      );
      userCommentLikes = commentLikesRows.map((l: any) => l.comment_id);
    }

    /* 🔖 Get bookmarks */
    let userBookmarks: any[] = [];
    if (currentUserId) {
      const [bookmarks]: any = await pool.execute(
        "SELECT post_id FROM ec_bookmarks WHERE userid = ?",
        [currentUserId]
      );
      userBookmarks = bookmarks.map((b: any) => b.post_id);
    }

    /* 🔄 Map everything */
    const postsWithData = posts.map((post: any) => {
      /* Step 1: Filter comments for this post */
      const flatComments = allComments
        .filter((c: any) => c.post_id === post.id)
        .map((c: any) => ({
          id: c.id,
          parent_id: c.parent_id,
          name: c.username,
          text: c.content,
          time: new Date(c.created_at).toLocaleString(),
          likes: commentLikesMap.get(c.id) || 0,
          liked: userCommentLikes.includes(c.id) ? 1 : 0,
        }));

      /* Step 2: Convert to tree */
      const postComments = buildTree(flatComments);

      const likesCount = Number(post.likes || 0);
      const commentsCount = Number(post.comments || 0);
      const createdAt = new Date(post.created_at).getTime();
      const latestCommentAt = post.latest_comment_at
        ? new Date(post.latest_comment_at).getTime()
        : 0;
      const latestInteractionAt = Math.max(createdAt, latestCommentAt || 0);

      return {
        ...post,
        likes: likesCount,
        comments: commentsCount,
        commentsList: postComments,
        liked: userLikes.includes(post.id) ? 1 : 0,
        saved: userBookmarks.includes(post.id),
        latestInteractionAt,
      };
    });

    const getTrendingScore = (post: any) => {
      const now = Date.now();
      const createdAt = new Date(post.created_at).getTime();
      const hoursSincePost = Math.max((now - createdAt) / (1000 * 60 * 60), 1);
      const engagement = post.likes * 3 + post.comments * 4;
      const interactionRecencyBoost =
        post.latestInteractionAt > 0
          ? 96 / Math.max((now - post.latestInteractionAt) / (1000 * 60 * 60), 1)
          : 0;

      return engagement + interactionRecencyBoost + 24 / hoursSincePost;
    };

    let finalPosts = postsWithData;

    switch (mode) {
      case "saved":
        finalPosts = postsWithData
          .filter((post: any) => post.saved)
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );
        break;
      case "my-posts":
        finalPosts = postsWithData
          .filter((post: any) => currentUserId && post.userid === currentUserId)
          .sort(
            (a: any, b: any) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
          );
        break;
      case "most-liked":
        finalPosts = [...postsWithData].sort(
          (a: any, b: any) =>
            b.likes - a.likes ||
            b.latestInteractionAt - a.latestInteractionAt ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "most-discussed":
        finalPosts = [...postsWithData].sort(
          (a: any, b: any) =>
            b.comments - a.comments ||
            b.latestInteractionAt - a.latestInteractionAt ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
      case "trending":
        finalPosts = [...postsWithData].sort(
          (a: any, b: any) =>
            getTrendingScore(b) - getTrendingScore(a) ||
            b.latestInteractionAt - a.latestInteractionAt,
        );
        break;
      case "recent":
      default:
        finalPosts = [...postsWithData].sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }

    return NextResponse.json(finalPosts);

  } catch (err) {
    console.error("Feed API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
