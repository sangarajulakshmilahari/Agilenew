import { NextResponse } from "next/server";

export async function GET() {
  const keycloakLogoutUrl =
    `${process.env.KEYCLOAK_URL}/realms/${process.env.KEYCLOAK_REALM}` +
    `/protocol/openid-connect/logout` +
    `?client_id=${process.env.KEYCLOAK_CLIENT_ID}` +
    `&post_logout_redirect_uri=${encodeURIComponent(
      "https://agilesourcing.adroitent.ai/api/auth/login",
    )}`;

  const res = NextResponse.redirect(keycloakLogoutUrl);

  
  res.cookies.set("access_token", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  res.cookies.set("username", "", {
    path: "/",
    maxAge: 0,
  });

  return res;
}
