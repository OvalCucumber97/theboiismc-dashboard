// functions/callback.js

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  // 1. Exchange Code for Token
  // UPDATED: Changed slug from 'theboiismc' to 'profile' to match your Authentik settings
  const tokenResponse = await fetch("https://accounts.theboiismc.com/application/o/profile/token/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // Verify AUTHENTIK_SECRET is set in your Cloudflare Pages variables
      "Authorization": "Basic " + btoa("yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy" + ":" + env.AUTHENTIK_SECRET)
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: "https://myaccount.theboiismc.com/callback"
    })
  });

  const tokens = await tokenResponse.json();

  if (tokens.error) {
    return new Response("Auth Error: " + tokens.error, { status: 400 });
  }

  // 2. Create Session Cookie
  const cookieValue = `boiismc_session=${tokens.access_token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=3600`;

  // 3. Redirect User to Dashboard
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "/",
      "Set-Cookie": cookieValue
    }
  });
}
