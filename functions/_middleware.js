// functions/_middleware.js

export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // 1. Allow public assets (CSS, JS, Images, Callback)
  const publicPaths = ["/callback", "/main.js", "/logout", "/favicon.ico"];
  if (publicPaths.some(path => url.pathname.startsWith(path)) || url.pathname.includes('.')) {
    return next();
  }

  // 2. Check for Session Cookie
  const cookie = request.headers.get("Cookie");
  const hasSession = cookie && cookie.includes("boiismc_session=");

  if (!hasSession) {
    // 3. No Session? Redirect to Authentik
    const clientId = "yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy";
    const redirectUri = "https://myaccount.theboiismc.com/callback";
    const authUrl = `https://accounts.theboiismc.com/application/o/theboiismc/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid+profile+email`;
    
    return Response.redirect(authUrl, 302);
  }

  // 4. Session exists? Let them through to index.html
  return next();
}
