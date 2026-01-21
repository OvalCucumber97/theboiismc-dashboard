export async function onRequest() {
  // Clear the cookie on the ROOT domain
  const cookieClear = "boiismc_session=; Domain=.theboiismc.com; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";
  
  return new Response(null, {
    status: 302,
    headers: {
      "Location": "https://www.theboiismc.com",
      "Set-Cookie": cookieClear
    }
  });
}
