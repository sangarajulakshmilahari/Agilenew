import keycloak from "../../lib/keycloak";
import pool from "../../../../config/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return new Response("No authorization code", { status: 400 });
    }

    const kc = keycloak();

    const tokenResponse = await fetch(kc.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        client_id: process.env.KEYCLOAK_CLIENT_ID!,
        client_secret: process.env.KEYCLOAK_CLIENT_SECRET!,
        redirect_uri: process.env.KEYCLOAK_REDIRECT_URI!,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token error:", tokenData);
      return new Response("Token exchange failed", { status: 401 });
    }

    const accessToken = tokenData.access_token;

    // Decode JWT
    const base64Payload = accessToken.split(".")[1];
    const decodedPayload = JSON.parse(
      Buffer.from(base64Payload, "base64").toString(),
    );

    const keycloakId = decodedPayload.sub;
    const email = decodedPayload.email;
    const firstName = decodedPayload.given_name || "";
    const lastName = decodedPayload.family_name || "";

    // 🔥 Step 1: Check if user already exists by email
    const [existingUsers]: any = await pool.execute(
      `SELECT userid, username FROM users WHERE email = ?`,
      [email],
    );

    if (existingUsers.length === 0) {
      // ✅ CASE 2: User does NOT exist → Create new user
      const newUsername = `${firstName} ${lastName}`.trim();

      await pool.execute(
        `
        INSERT INTO users (keycloak_id, username, email)
        VALUES (?, ?, ?)
        `,
        [keycloakId, newUsername, email],
      );
    } else {
      // ✅ CASE 1: User exists → DO NOT update username
      // Only ensure keycloak_id is updated
      await pool.execute(
        `
  UPDATE users
  SET keycloak_id = ?
  WHERE email = ? AND keycloak_id IS NULL
  `,
        [keycloakId, email],
      );
    }

    return new Response(null, {
      status: 302,
      headers: {
        "Set-Cookie": `access_token=${accessToken}; HttpOnly; Path=/; SameSite=Lax`,
        Location: "/webpage",
      },
    });
  } catch (error) {
    console.error("Callback error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
