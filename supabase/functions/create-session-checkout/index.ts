import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import {
  corsHeaders,
  getOrCreateStripeCustomer,
  jsonResponse,
  resolveSiteUrl,
  stripeClient,
} from "../_shared/stripePro.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const body = await req.json();
    const slotId = Number(body.slot_id || body.slotId);
    const email = String(body.email || "").trim().toLowerCase();
    const seekerName = String(body.seeker_name || body.name || "").trim();
    const seekerNotes = String(body.notes || "").trim();

    if (!slotId || !email) {
      return jsonResponse({ ok: false, error: "slot_id and email required" }, 400);
    }

    const authHeader = req.headers.get("Authorization");
    let verifiedEmail = email;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token !== ANON_KEY) {
        const authClient = createClient(SUPABASE_URL, ANON_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user: authUser } } = await authClient.auth.getUser();
        if (authUser?.email) verifiedEmail = authUser.email.toLowerCase();
      }
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data: slot } = await supabase
      .from("practitioner_session_slots")
      .select("*, vendors(name)")
      .eq("id", slotId)
      .eq("status", "open")
      .gt("starts_at", new Date().toISOString())
      .maybeSingle();

    if (!slot) {
      return jsonResponse({ ok: false, error: "Session slot not available" }, 404);
    }

    if (!slot.price_cents || slot.price_cents <= 0) {
      const { data: booked, error } = await supabase.rpc("book_practitioner_slot", {
        p_slot_id: slotId,
        p_seeker_email: verifiedEmail,
        p_seeker_name: seekerName || null,
        p_seeker_notes: seekerNotes || null,
      });
      if (error) return jsonResponse({ ok: false, error: error.message }, 400);
      const result = booked as { ok?: boolean; error?: string };
      if (!result?.ok) return jsonResponse({ ok: false, error: result?.error || "Booking failed" }, 400);
      return jsonResponse({ ok: true, free: true, booking_id: (booked as { booking_id?: number }).booking_id });
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("id, email, name")
      .ilike("email", verifiedEmail)
      .maybeSingle();

    if (!userRow) {
      return jsonResponse({ ok: false, error: "Account not found. Sign in first." }, 404);
    }

    const stripe = stripeClient();
    const siteUrl = await resolveSiteUrl(supabase);
    const customerId = await getOrCreateStripeCustomer(stripe, supabase, {
      email: verifiedEmail,
      userId: userRow.id,
      name: userRow.name,
    });

    const vendorName = (slot.vendors as { name?: string })?.name || "Practitioner";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: slot.price_cents,
          product_data: {
            name: `1:1 Session — ${vendorName}`,
            description: `${slot.session_type} · ${slot.duration_minutes} min`,
          },
        },
        quantity: 1,
      }],
      success_url: `${siteUrl}/vendor/${slot.vendor_id}?booked=1`,
      cancel_url: `${siteUrl}/vendor/${slot.vendor_id}?checkout=cancel`,
      metadata: {
        checkout_type: "session_booking",
        slot_id: String(slotId),
        vendor_id: String(slot.vendor_id),
        user_id: String(userRow.id),
        user_email: verifiedEmail,
        seeker_name: seekerName,
        seeker_notes: seekerNotes,
      },
    });

    return jsonResponse({ ok: true, url: session.url, session_id: session.id });
  } catch (e) {
    console.error("create-session-checkout:", e);
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});