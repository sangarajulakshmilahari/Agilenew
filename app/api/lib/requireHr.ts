import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/config/db";

const HR_ROLE_ID = 6;

export async function requireHrUser(
  req: NextRequest,
): Promise<{ userId: number } | { error: NextResponse }> {
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
      "SELECT role_id FROM user_roles WHERE userid = ?",
      [userId],
    );

    const isHr = roleRows.some((row) => Number(row.role_id) === HR_ROLE_ID);
    if (!isHr) {
      return {
        error: NextResponse.json(
          { error: "Only HR can perform this action" },
          { status: 403 },
        ),
      };
    }

    return { userId };
  } catch {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
}
