export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return new Response("Missing code", { status: 400 });
  }

  // Configuration
  const CLIENT_ID = "yopePhMvPt1dj65UFbmVkxHIuX7MDeeNBoobKSQy";
  const CLIENT_SECRET = "fpr0JkTLw8ivzu0rnneXfSgbn9XC1nRwcAUbwDIgHhfudV8zOdvo3B7urI2he3iHkFLEyssRw5HzezntdT5XBEDPF5gnLMitxrIRSp1ZR56C8eSS3KSiLQruxDzNeTGU";
  const REDIRECT_URI = "https://myaccount.theboiismc.com/callback";
  const TOKEN_ENDPOINT = "https://accounts.theboiismc.com/application/o/token/";

  try {
    // 1. Exchange Code for Token
    const tokenResponse = await fetch(TOKEN_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${btoa(CLIENT_ID + ":" + CLIENT_SECRET)}`
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });

    const tokens = await tokenResponse.json();

    if (tokens.error) {
      return new Response(`Auth Error: ${tokens.error_description}`, { status: 400 });
    }

    // 2. Set Root Domain Cookie (CRITICAL FOR SSO)
    // Domain=.theboiismc.com allows maps.theboiismc.com to see that a session exists
    const cookieValue = `boiismc_session=${tokens.access_token}; Domain=.theboiismc.com; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${tokens.expires_in || 3600}`;

    // 3. Redirect to Dashboard
    return new Response(null, {
      status: 302,
      headers: {
        "Location": "/",
        "Set-Cookie": cookieValue
      }
    });

  } catch (err) {
    return new Response("Internal Error", { status: 500 });
  }
}
