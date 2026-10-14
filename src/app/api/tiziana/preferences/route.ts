import { authenticatedDatabase, jsonError } from "@/lib/tiziana-server";
const keys = ["compass", "moments", "discoveries", "connections", "history"] as const;
export async function GET(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const { data, error } = await auth.db.from("tiziana_privacy_preferences").select("*").eq("user_id", auth.user.id).maybeSingle();
  if (error) return jsonError("Unable to load privacy preferences", 500);
  return Response.json({ preferences: data || Object.fromEntries(keys.map(k => [k, false])) });
}
export async function PUT(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const payload: unknown = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") return jsonError("Invalid preferences", 400);
  const record = payload as Record<string, unknown>;
  if (keys.some(k => typeof record[k] !== "boolean")) return jsonError("All permissions must be explicit", 400);
  const permissions = Object.fromEntries(keys.map(k => [k, record[k]]));
  const { error } = await auth.db.from("tiziana_privacy_preferences").upsert({ user_id: auth.user.id, ...permissions, updated_at: new Date().toISOString() });
  if (error) return jsonError("Unable to save preferences", 500);
  return Response.json({ ok: true });
}
