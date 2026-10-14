import { authenticatedDatabase, jsonError } from "@/lib/tiziana-server";
export async function POST(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const payload = await request.json().catch(() => null);
  const product = payload?.product;
  if (product !== "book" && product !== "bundle") return jsonError("Invalid product", 400);
  const price = product === "book" ? process.env.STRIPE_BOOK_PRICE_ID : process.env.STRIPE_BUNDLE_PRICE_ID;
  const secret = process.env.STRIPE_SECRET_KEY;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!price || !secret || !site) return jsonError("Checkout is not configured", 503);
  const { data: customerRecord } = await auth.db.from("tiziana_stripe_customers")
    .select("customer_id").eq("user_id", auth.user.id).maybeSingle();
  const params = new URLSearchParams({
    mode: "payment", "line_items[0][price]": price, "line_items[0][quantity]": "1",
    client_reference_id: auth.user.id,
    "metadata[user_id]": auth.user.id, "metadata[product]": product,
    success_url: `${site}/es/account?checkout=success`, cancel_url: `${site}/es/book?checkout=cancelled`,
  });
  if (customerRecord?.customer_id) params.set("customer", customerRecord.customer_id);
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(), cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok || typeof result.url !== "string") return jsonError("Checkout unavailable", 502);
  return Response.json({ url: result.url });
}
