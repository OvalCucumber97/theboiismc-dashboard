export async function onRequest() {
  // 1. The URL to your Authentik Logout Flow
  // This ensures the user is signed out of Photos/Drive/Maps too.
  const authentikLogoutUrl = "https://accounts.theboiismc.com/if/flow/default-invalidation-flow/";

  // 2. Kill the Local Cookie and Redirect
  return new Response(null, {
    status: 302,
    headers: {
      "Location": authentikLogoutUrl,
      "Set-Cookie": "boiismc_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    }
  });
}
