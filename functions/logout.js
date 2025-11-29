export async function onRequest() {
  // Clear the cookie and redirect to homepage
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "https://www.theboiismc.com",
      "Set-Cookie": "boiismc_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0"
    }
  });
}
