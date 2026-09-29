import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import {getPool} from "../../../config/db";

type AppRow = RowDataPacket & {
  username: string;
  app_id: number;
  app_name: string;
  description: string | null;
  hover_description: string | null;
  app_url: string | null;
  is_ai: number | boolean | null;
  display_order: number | null;
  is_active: number | boolean | null;
};

type RoleRow = RowDataPacket & {
  role_name: string;
};

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }

    const base64Payload = token.split(".")[1];
    const decodedPayload = JSON.parse(
      Buffer.from(base64Payload, "base64").toString(),
    );

    const keycloakId = decodedPayload.sub;

    if (!keycloakId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 },
      );
    }

    const pool = await getPool();
    const [roleRows] = await pool.execute<RoleRow[]>(
      `
      SELECT r.role_name
      FROM users u
      JOIN user_roles ur ON u.userid = ur.userid
      JOIN roles r ON ur.role_id = r.role_id
      WHERE u.keycloak_id = ?
      `,
      [keycloakId],
    );

    if (roleRows.length === 0) {
      return NextResponse.json(
        { error: "User has no assigned roles" },
        { status: 404 },
      );
    }

    const [rows] = await pool.execute<AppRow[]>(
      `
      SELECT
        u.username,
        a.app_id,
        a.app_name,
        a.description,
        a.hover_description,
        a.app_url,
        a.is_ai,
        a.display_order,
        a.is_active
      FROM users u
      JOIN user_roles ur ON u.userid = ur.userid
      JOIN role_applications ra ON ur.role_id = ra.role_id
      JOIN applications a ON ra.app_id = a.app_id
      WHERE u.keycloak_id = ?
        AND a.is_active = 1
      GROUP BY
        a.app_id,
        a.app_name,
        a.description,
        a.hover_description,
        a.app_url,
        a.is_ai,
        a.display_order,
        a.is_active,
        u.username
      ORDER BY a.display_order ASC, a.app_name ASC
      `,
      [keycloakId],
    );

    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT username FROM users WHERE keycloak_id = ? LIMIT 1",
      [keycloakId],
    );

    const username = String(userRows[0]?.username || rows[0]?.username || "");
    const applications = rows.map((row) => ({
      id: Number(row.app_id),
      name: String(row.app_name || "").trim(),
      description: String(row.description || "").trim(),
      hoverDescription: String(row.hover_description || "").trim(),
      url: String(row.app_url || "").trim(),
      isAI: Boolean(Number(row.is_ai)),
      displayOrder: Number(row.display_order || 0),
    }));
    const apps = applications.map((app) => app.name);
    const roles = [...new Set(roleRows.map((row) => String(row.role_name)))];

    return NextResponse.json({
      username,
      apps,
      applications,
      roles,
    });
  } catch (error) {
    console.error("/api/me error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 },
    );
  }
}
