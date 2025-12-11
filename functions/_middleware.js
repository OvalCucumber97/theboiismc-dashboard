export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);

  // --- CONFIGURATION START ---
  const CLIENT_ID = "yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy";
  const REDIRECT_URI = "https://myaccount.theboiismc.com/callback";
  // --- CONFIGURATION END ---

  // NEW STEP 1: Sitemap Exception for Crawlers
  // If the request is for the sitemap, serve the static content immediately.
  if (url.pathname === '/sitemap.xml') {
    const sitemapXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://myaccount.theboiismc.com/</loc>
    <priority>1.0</priority>
    <changefreq>monthly</changefreq>
  </url>
</urlset>`;

    return new Response(sitemapXmlContent, {
      status: 200,
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour to help crawlers
      }
    });
  }
  
  // 1. Allow public assets (Original Logic)
  const publicPaths = ["/callback", "/main.js", "/logout", "/favicon.ico"];
  if (publicPaths.some(path => url.pathname.startsWith(path)) || url.pathname.includes('.')) {
    return next();
  }

  // 2. Check for Session Cookie (Original Logic)
  const cookie = request.headers.get("Cookie");
  const hasSession = cookie && cookie.includes("boiismc_session=");

  if (!hasSession) {
    // 3. No Session? Redirect to Authentik (Original Logic)
    const authUrl = `https://accounts.theboiismc.com/application/o/authorize/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid+profile+email`;
    
    return Response.redirect(authUrl, 302);
  }

  // 4. Session exists? Let them through (Original Logic)
  return next();
}
