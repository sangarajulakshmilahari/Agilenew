import { NextRequest } from "next/server";
import pool from "@/config/db";
import { randomUUID } from "crypto";

export async function ensureNotificationsTable() {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id INT NOT NULL,
      type VARCHAR(50) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      entity_type VARCHAR(50) NULL,
      entity_id VARCHAR(64) NULL,
      action_url VARCHAR(255) NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_by INT NULL,
      read_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notifications_user_created (user_id, created_at DESC),
      INDEX idx_notifications_user_unread (user_id, is_read)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  const requiredColumns: Array<{ name: string; definition: string }> = [
    { name: "id", definition: "VARCHAR(36) PRIMARY KEY" },
    { name: "user_id", definition: "INT NOT NULL" },
    { name: "type", definition: "VARCHAR(50) NOT NULL" },
    { name: "title", definition: "VARCHAR(255) NOT NULL" },
    { name: "message", definition: "TEXT NOT NULL" },
    { name: "entity_type", definition: "VARCHAR(50) NULL" },
    { name: "entity_id", definition: "VARCHAR(64) NULL" },
    { name: "action_url", definition: "VARCHAR(255) NULL" },
    { name: "is_read", definition: "TINYINT(1) NOT NULL DEFAULT 0" },
    { name: "created_by", definition: "INT NULL" },
    { name: "read_at", definition: "DATETIME NULL" },
    {
      name: "created_at",
      definition: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP",
    },
  ];

  for (const col of requiredColumns) {
    const [rows]: any = await pool.execute(
      `SELECT COUNT(*) AS cnt
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = 'notifications'
         AND column_name = ?`,
      [col.name],
    );

    const exists = Number(rows?.[0]?.cnt || 0) > 0;
    if (!exists) {
      await pool.execute(
        `ALTER TABLE notifications ADD COLUMN \`${col.name}\` ${col.definition}`,
      );
    }
  }
}

export async function getCurrentUserId(req: NextRequest): Promise<number | null> {
  const token = req.cookies.get("access_token")?.value;
  if (!token) return null;

  const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
  const keycloakId = decoded?.sub;
  if (!keycloakId) return null;

  const [rows]: any = await pool.execute(
    "SELECT userid FROM users WHERE keycloak_id = ? LIMIT 1",
    [keycloakId],
  );

  if (!rows?.length) return null;
  return Number(rows[0].userid);
}

export async function notifyArticlePublished(params: {
  authorUserId: number;
  title: string;
  articleId: number;
}) {
  const { authorUserId, title, articleId } = params;

  await ensureNotificationsTable();

  const [eligibleUsers]: any = await pool.execute(
    `SELECT DISTINCT u.userid
     FROM users u
     JOIN user_roles ur ON ur.userid = u.userid
     WHERE u.userid <> ?`,
    [authorUserId],
  );

  const safeTitle = title.trim();
  const titleSnippet =
    safeTitle.length > 90 ? `${safeTitle.slice(0, 90).trimEnd()}...` : safeTitle;

  for (const user of eligibleUsers) {
    await pool.execute(
      `INSERT INTO notifications
       (id, user_id, type, title, message, entity_type, entity_id, action_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        Number(user.userid),
        "article_published",
        "New article published",
        `\"${titleSnippet}\"`,
        "article",
        String(articleId),
        `/webpage?view=articles&articleId=${articleId}`,
        authorUserId,
      ],
    );
  }
}

