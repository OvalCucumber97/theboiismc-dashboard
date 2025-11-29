export async function onRequest(context) {
  const { request } = context;
  
  const cookie = request.headers.get("Cookie");
  const accessToken = cookie?.split("boiismc_session=")[1]?.split(";")[0];

  if (!accessToken) {
    return new Response(JSON.stringify({ error: "No active session" }), { 
      status: 401, 
      headers: { "Content-Type": "application/json" } 
    });
  }

  try {
    const userInfoUrl = "https://accounts.theboiismc.com/application/o/userinfo/";
    
    const userResponse = await fetch(userInfoUrl, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      }
    });

    if (!userResponse.ok) {
        throw new Error("Failed to fetch user info");
    }

    const userData = await userResponse.json();

    return new Response(JSON.stringify(userData), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Failed to retrieve profile" }), { status: 500 });
  }
}
