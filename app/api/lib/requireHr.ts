import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/config/db";
import { canManagePortal, normalizeRole } from "@/app/lib/permissions";

type AuthSuccess = { userId: number; roles: string[] };
type AuthResult = AuthSuccess | { error: NextResponse };

async function resolveUserRoles(
  req: NextRequest,
): Promise<AuthResult> {
  const token = req.cookies.get("access_token")?.value;
  if (!token) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString(),
    );
    const keycloakId = decoded?.sub;
    if (!keycloakId) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const [userRows] = await pool.execute<RowDataPacket[]>(
      "SELECT userid FROM users WHERE keycloak_id = ?",
      [keycloakId],
    );

    if (!userRows.length) {
      return {
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const userId = Number(userRows[0].userid);
    const [roleRows] = await pool.execute<RowDataPacket[]>(
      `
      SELECT r.role_name
      FROM user_roles ur
      JOIN roles r ON ur.role_id = r.role_id
      WHERE ur.userid = ?
      `,
      [userId],
    );

    const roles = [
      ...new Set(
        roleRows.map((row) => normalizeRole(row.role_name)).filter(Boolean),
      ),
    ];

    return { userId, roles };
  } catch {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}

/** HR-only actions (e.g. create events). */
export async function requireHrUser(
  req: NextRequest,
): Promise<{ userId: number } | { error: NextResponse }> {
  const auth = await resolveUserRoles(req);
  if ("error" in auth) return auth;

  const isHr = auth.roles.some((role) => role === "hr");
  if (!isHr) {
    return {
      error: NextResponse.json(
        { error: "Only HR can perform this action" },
        { status: 403 },
      ),
    };
  }

  return { userId: auth.userId };
}

/**
 * Portal Content + Article Management.
 * Allowed for HR and Marketing (role_name from roles table).
 */
export async function requirePortalManager(
  req: NextRequest,
): Promise<{ userId: number } | { error: NextResponse }> {
  const auth = await resolveUserRoles(req);
  if ("error" in auth) return auth;

  if (!canManagePortal(auth.roles)) {
    return {
      error: NextResponse.json(
        { error: "Only HR or Marketing can perform this action" },
        { status: 403 },
      ),
    };
  }

  return { userId: auth.userId };
}
