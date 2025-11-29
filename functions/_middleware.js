export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // --- CONFIGURATION START ---
  const CLIENT_ID = "yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy";
  const REDIRECT_URI = "https://myaccount.theboiismc.com/callback";
  // --- CONFIGURATION END ---

  // 1. Allow public assets
  const publicPaths = ["/callback", "/main.js", "/logout", "/favicon.ico"];
  if (publicPaths.some(path => url.pathname.startsWith(path)) || url.pathname.includes('.')) {
    return next();
  }

  // 2. Check for Session Cookie
  const cookie = request.headers.get("Cookie");
  const hasSession = cookie && cookie.includes("boiismc_session=");

  if (!hasSession) {
    // 3. No Session? Redirect to Authentik (Global Endpoint)
    // UPDATED: Removed the slug path. Used the URL exactly as shown in your JSON config.
    const authUrl = `https://accounts.theboiismc.com/application/o/authorize/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid+profile+email`;
    
    return Response.redirect(authUrl, 302);
  }

  // 4. Session exists? Let them through
  return next();
}
