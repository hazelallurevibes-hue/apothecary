import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const DOMAIN = Deno.env.get("AUTH0_DOMAIN");
const MGMT_CLIENT_ID = Deno.env.get("AUTH0_MGMT_CLIENT_ID");
const MGMT_CLIENT_SECRET = Deno.env.get("AUTH0_MGMT_CLIENT_SECRET");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*" } });
  }
  try {
    const { email, allergen_avoid } = await req.json();
    if (!email) return json({ synced: false, reason: "email required" }, 400);
    if (!DOMAIN || !MGMT_CLIENT_ID || !MGMT_CLIENT_SECRET) {
      return json({ synced: false, reason: "auth0_mgmt_not_configured" });
    }

    const tokenRes = await fetch(`https://${DOMAIN}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: MGMT_CLIENT_ID,
        client_secret: MGMT_CLIENT_SECRET,
        audience: `https://${DOMAIN}/api/v2/`,
        grant_type: "client_credentials",
      }),
    });
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok) return json({ synced: false, reason: tokenJson.error_description || "token_failed" });

    const usersRes = await fetch(
      `https://${DOMAIN}/api/v2/users-by-email?email=${encodeURIComponent(email)}`,
      { headers: { Authorization: `Bearer ${tokenJson.access_token}` } },
    );
    const users = await usersRes.json();
    if (!users?.length) return json({ synced: false, reason: "user_not_found" });

    const userId = users[0].user_id;
    const patchRes = await fetch(`https://${DOMAIN}/api/v2/users/${encodeURIComponent(userId)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${tokenJson.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_metadata: { allergen_avoid },
        "https://bpicius.com/allergen_avoid": allergen_avoid,
      }),
    });
    if (!patchRes.ok) return json({ synced: false, reason: await patchRes.text() });
    return json({ synced: true });
  } catch (e) {
    return json({ synced: false, reason: String(e) }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}