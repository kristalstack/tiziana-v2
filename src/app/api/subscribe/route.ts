import { authenticatedDatabase, jsonError } from "@/lib/tiziana-server";
export async function POST(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const {data:active} = await auth.db.from("product_entitlements")
    .select("expires_at").eq("user_id",auth.user.id).eq("product","tiziana")
    .order("expires_at",{ascending:false,nullsFirst:true}).limit(1);
  const { data: existingSubscription, error: subscriptionError } = await auth.db
    .from("tiziana_stripe_customers").select("subscription_id")
    .eq("user_id", auth.user.id).maybeSingle();
  if (subscriptionError) return jsonError("Unable to verify subscription status", 503);
  if (existingSubscription?.subscription_id)
    return jsonError("You already have a subscription. Manage it from your billing portal.", 409);
  const expires = active?.[0]?.expires_at;
  if (expires === null && active?.length) return jsonError("Access is already active without expiration",409);
  if (expires && new Date(expires).getTime() > Date.now()+7*24*60*60*1000)
    return jsonError("Renewal opens seven days before your access expires",409);
  const secret = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_RENEWAL_PRICE_ID;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!secret || !price || !site) return jsonError("Subscription is not configured", 503);
  const { data: customerRecord } = await auth.db.from("tiziana_stripe_customers")
    .select("customer_id").eq("user_id", auth.user.id).maybeSingle();
  const params = new URLSearchParams({
    mode: "subscription", "line_items[0][price]": price, "line_items[0][quantity]": "1",
    client_reference_id: auth.user.id,
    "subscription_data[metadata][user_id]": auth.user.id,
    "metadata[user_id]": auth.user.id,
    "metadata[product]": "renewal",
    success_url: `${site}/es/account?renewal=success`,
    cancel_url: `${site}/es/account?renewal=cancelled`,
  });
  if (customerRecord?.customer_id) params.set("customer", customerRecord.customer_id);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method:"POST",headers:{Authorization:`Bearer ${secret}`,"Content-Type":"application/x-www-form-urlencoded"},body:params,cache:"no-store"
  });
  const result = await response.json();
  if (!response.ok || typeof result.url !== "string") return jsonError("Subscription checkout unavailable",502);
  return Response.json({url:result.url});
}
