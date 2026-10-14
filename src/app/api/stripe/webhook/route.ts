import { createHmac, timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function validSignature(body: string, header: string, secret: string): boolean {
  const values = header.split(",").map(part => part.trim());
  const timestampText = values.find(part => part.startsWith("t="))?.slice(2);
  if (!timestampText || !/^\d+$/.test(timestampText)) return false;
  const timestamp = Number(timestampText);
  if (!Number.isSafeInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex"), "hex");
  return values.filter(part => part.startsWith("v1=")).some(part => {
    const candidate = part.slice(3);
    if (!/^[a-fA-F0-9]{64}$/.test(candidate)) return false;
    const actual = Buffer.from(candidate, "hex");
    return timingSafeEqual(expected, actual);
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !url || !service) return Response.json({ error: "Not configured" }, { status: 503 });
  const body = await request.text();
  if (!validSignature(body, request.headers.get("stripe-signature") || "", secret))
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  let event: { id?: string; type?: string; data?: { object?: Record<string, unknown> } };
  try { event = JSON.parse(body); } catch { return Response.json({ error: "Invalid event" }, { status: 400 }); }
  if (typeof event.id !== "string" || typeof event.type !== "string")
    return Response.json({ error: "Invalid event" }, { status: 400 });
  const db = createClient(url, service, { auth: { persistSession: false } });
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data?.object;
    const subscriptionId = subscription?.id;
    if (typeof subscriptionId !== "string") return Response.json({ received: true });
    const { error } = await db.from("tiziana_stripe_customers")
      .update({ subscription_id: null }).eq("subscription_id", subscriptionId);
    if (error) return Response.json({ error: "Subscription cleanup failed" }, { status: 500 });
    // Cancellation does not revoke prepaid time; the existing entitlement expires naturally.
    return Response.json({ received: true });
  }
  if (event.type === "invoice.paid") {
    const invoice = event.data?.object;
    // Stripe invoices can have different subscription representations across API versions.
    const parent = invoice?.parent as { subscription_details?: { subscription?: string } } | undefined;
    const subscriptionId = typeof invoice?.subscription === "string" ? invoice.subscription : parent?.subscription_details?.subscription;
    if (!subscriptionId || !process.env.STRIPE_SECRET_KEY) return Response.json({ received: true });
    const response = await fetch(`https://api.stripe.com/v1/subscriptions/${encodeURIComponent(subscriptionId)}`, {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` }, cache: "no-store",
    });
    if (!response.ok) return Response.json({ error: "Unable to verify subscription" }, { status: 502 });
    const subscription = await response.json();
    const userId = subscription.metadata?.user_id;
    const stripeCustomer = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
    if (typeof stripeCustomer !== "string") return Response.json({ error: "Missing Stripe customer" }, { status: 400 });
    const until = Number(subscription.current_period_end ?? subscription.items?.data?.[0]?.current_period_end);
    if (typeof userId !== "string" || !Number.isFinite(until) || until <= Date.now() / 1000)
      return Response.json({ error: "Subscription metadata unavailable" }, { status: 400 });
    const { error: customerError } = await db.from("tiziana_stripe_customers").upsert({
      user_id: userId, customer_id: stripeCustomer, subscription_id: subscriptionId,
    }, { onConflict: "user_id" });
    if (customerError) return Response.json({ error: "Customer association failed" }, { status: 500 });
    const { error } = await db.rpc("grant_tiziana_renewal", {
      event_id: event.id, event_type: event.type, buyer_id: userId,
      valid_until: new Date(until * 1000).toISOString(),
    });
    if (error) { console.error("Renewal grant failed", error); return Response.json({ error: "Renewal failed" }, { status: 500 }); }
    return Response.json({ received: true });
  }
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded")
    return Response.json({ received: true });
  const session = event.data?.object;
  if (session?.mode !== "payment" || session?.payment_status !== "paid") return Response.json({ received: true });
  const userId = (session.metadata as Record<string, unknown> | undefined)?.user_id;
  const product = (session.metadata as Record<string, unknown> | undefined)?.product;
  if (typeof userId !== "string" || (product !== "book" && product !== "bundle"))
    return Response.json({ error: "Invalid metadata" }, { status: 400 });
  // Both checkout completion event types share the session ID as the fulfillment key.
  const stripeCustomer = typeof session.customer === "string" ? session.customer : null;
  if (stripeCustomer) {
    const { error: customerError } = await db.from("tiziana_stripe_customers").upsert({
      user_id: userId, customer_id: stripeCustomer,
    }, { onConflict: "user_id" });
    if (customerError) return Response.json({ error: "Customer association failed" }, { status: 500 });
  }
  const sessionId = session.id;
  if (typeof sessionId !== "string") return Response.json({ error: "Missing session ID" }, { status: 400 });
  const { error } = await db.rpc("grant_tiziana_purchase", {
    event_id: `checkout:${sessionId}`, event_type: event.type, buyer_id: userId, purchased_product: product,
  });
  if (error) { console.error("Checkout grant failed", error); return Response.json({ error: "Grant failed" }, { status: 500 }); }
  return Response.json({ received: true });
}
