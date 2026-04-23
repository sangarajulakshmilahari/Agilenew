import keycloak from "../../lib/keycloak";

console.log("LOGIN ROUTE HIT");

export async function GET() {
  // ✅ CALL the function
  const kc = keycloak();

  const loginUrl =
    `${kc.authorizeUrl}` +
    `?client_id=${process.env.KEYCLOAK_CLIENT_ID}` +
    `&response_type=code` +
    `&scope=openid` +
    `&redirect_uri=${encodeURIComponent(
      process.env.KEYCLOAK_REDIRECT_URI!
    )}` +
    `&prompt=login`;

  return Response.redirect(loginUrl);
}
