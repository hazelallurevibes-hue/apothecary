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
    const courseId = Number(body.course_id || body.courseId);
    const email = String(body.email || "").trim().toLowerCase();

    if (!courseId || !email) {
      return jsonResponse({ ok: false, error: "course_id and email required" }, 400);
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

    const { data: course } = await supabase
      .from("vendor_courses")
      .select("id, title, price, pro_member_price, published, approved, vendor_id")
      .eq("id", courseId)
      .maybeSingle();

    if (!course || !course.published || course.approved !== 1) {
      return jsonResponse({ ok: false, error: "Course not available" }, 404);
    }

    const { data: userRow } = await supabase
      .from("users")
      .select("id, email, name, customer_plan")
      .ilike("email", verifiedEmail)
      .maybeSingle();

    if (!userRow) {
      return jsonResponse({ ok: false, error: "Account not found. Sign in first." }, 404);
    }

    const { data: existing } = await supabase
      .from("vendor_course_enrollments")
      .select("id")
      .eq("course_id", courseId)
      .ilike("user_email", verifiedEmail)
      .maybeSingle();

    if (existing) {
      return jsonResponse({ ok: false, error: "Already enrolled" }, 409);
    }

    const isPro = userRow.customer_plan === "paid";
    let amount = Number(course.price) || 0;
    if (isPro && course.pro_member_price != null) {
      amount = Number(course.pro_member_price);
    }

    if (amount <= 0) {
      await supabase.from("vendor_course_enrollments").insert({
        course_id: courseId,
        user_id: userRow.id,
        user_email: verifiedEmail,
        amount_paid: 0,
        payment_status: "free",
        pro_member_at_purchase: isPro,
      });
      await supabase.rpc("increment_course_enrollment", { p_course_id: courseId }).catch(() => {
        supabase.from("vendor_courses").update({
          enrollment_count: (course as { enrollment_count?: number }).enrollment_count
            ? Number((course as { enrollment_count?: number }).enrollment_count) + 1
            : 1,
        }).eq("id", courseId);
      });
      return jsonResponse({ ok: true, free: true, enrolled: true });
    }

    const stripe = stripeClient();
    const siteUrl = await resolveSiteUrl(supabase);
    const customerId = await getOrCreateStripeCustomer(stripe, supabase, {
      email: verifiedEmail,
      userId: userRow.id,
      name: userRow.name,
    });

    const amountCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer: customerId,
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: course.title,
            description: `Teaching Sanctum — ${course.title}`,
          },
        },
        quantity: 1,
      }],
      success_url: `${siteUrl}/courses/${courseId}?enrolled=1`,
      cancel_url: `${siteUrl}/courses/${courseId}?checkout=cancel`,
      metadata: {
        checkout_type: "course_enrollment",
        course_id: String(courseId),
        user_id: String(userRow.id),
        user_email: verifiedEmail,
        amount_paid: String(amount),
        pro_member: isPro ? "true" : "false",
      },
    });

    await supabase.from("vendor_course_enrollments").insert({
      course_id: courseId,
      user_id: userRow.id,
      user_email: verifiedEmail,
      amount_paid: amount,
      payment_status: "pending",
      stripe_checkout_session_id: session.id,
      pro_member_at_purchase: isPro,
    });

    return jsonResponse({ ok: true, url: session.url, session_id: session.id });
  } catch (e) {
    console.error("create-course-checkout:", e);
    return jsonResponse({ ok: false, error: String(e) }, 500);
  }
});