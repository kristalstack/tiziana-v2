import { authenticatedDatabase, jsonError } from "@/lib/tiziana-server";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const secret = process.env.STRIPE_SECRET_KEY;
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!secret || !site) return jsonError("Billing portal is not configured", 503);
  const { data, error } = await auth.db.from("tiziana_stripe_customers")
    .select("customer_id").eq("user_id", auth.user.id).maybeSingle();
  if (error) return jsonError("Unable to verify billing account", 503);
  if (!data?.customer_id) return jsonError("No billing account found", 404);
  const params = new URLSearchParams({ customer: data.customer_id, return_url: `${site}/es/account` });
  const response = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST", headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params, cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || typeof result?.url !== "string") return jsonError("Billing portal unavailable", 502);
  return Response.json({ url: result.url });
}
