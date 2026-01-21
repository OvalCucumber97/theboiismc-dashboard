export async function onRequest(context) {
  const { request } = context;

  // 1. Security Check: Ensure POST request
  if (request.method !== "PATCH") {
    return new Response("Method not allowed", { status: 405 });
  }

  // 2. Get Session Token
  const cookie = request.headers.get("Cookie");
  const accessToken = cookie?.split("boiismc_session=")[1]?.split(";")[0];

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No active session" }), { status: 401 });
  }

  try {
    // 3. Get Data to Update (Name, Email, etc.)
    const body = await request.json();

    // 4. Send to Authentik API (User Self-Update Endpoint)
    // We map your simple fields to Authentik's API structure
    const authentikPayload = {};
    if (body.name) authentikPayload.name = body.name;
    if (body.email) authentikPayload.email = body.email;
    // Add username if you want that editable too
    if (body.username) authentikPayload.username = body.username;

    const apiResponse = await fetch("https://accounts.theboiismc.com/api/v3/core/users/me/", {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(authentikPayload)
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return new Response(errorText, { status: apiResponse.status });
    }

    const result = await apiResponse.json();
    return new Response(JSON.stringify(result), { 
      headers: { "Content-Type": "application/json" } 
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Update failed" }), { status: 500 });
  }
}
