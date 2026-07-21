import { NextRequest, NextResponse } from "next/server";
import pool from "../../../config/db";   // adjust path if needed

export async function GET(req: NextRequest) {
  try {
    // 🔹 Get token from cookie
    const token = req.cookies.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }


    const base64Payload = token.split(".")[1];
    const decodedPayload = JSON.parse(
      Buffer.from(base64Payload, "base64").toString()
    );

    const keycloakId = decodedPayload.sub;

    if (!keycloakId) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // 🔥 Fetch username + allowed apps using pool
    const [rows]: any = await pool.execute(
      `
      SELECT u.username, a.app_name
      FROM users u
      JOIN user_roles ur ON u.userid = ur.userid
      JOIN role_applications ra ON ur.role_id = ra.role_id
      JOIN applications a ON ra.app_id = a.app_id
      WHERE u.keycloak_id = ?
      `,
      [keycloakId]
    );

    const [roleRows]: any = await pool.execute(
      `
      SELECT r.role_name
      FROM users u
      JOIN user_roles ur ON u.userid = ur.userid
      JOIN roles r ON ur.role_id = r.role_id
      WHERE u.keycloak_id = ?
      `,
      [keycloakId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: "User has no assigned roles" },
        { status: 404 }
      );
    }

    const username = rows[0].username;

    // Remove duplicates (if multiple roles)
    const apps = [...new Set(rows.map((row: any) => row.app_name))];
    const roles = [...new Set(roleRows.map((row: any) => row.role_name))];

    return NextResponse.json({
      username,
      apps,
      roles,
    });

  } catch (error) {
    console.error("/api/me error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
