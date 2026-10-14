import { authenticatedDatabase, jsonError } from "@/lib/tiziana-server";
export async function GET(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const { data, error } = await auth.db.from("tiziana_memories").select("id,content,created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false });
  if (error) return jsonError("Unable to load memories", 500);
  return Response.json({ memories: data });
}
export async function POST(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const payload = await request.json().catch(() => null);
  if (typeof payload?.content !== "string" || !payload.content.trim() || payload.content.length > 1500 || payload.confirmed !== true) return jsonError("Explicit confirmation required", 400);
  const { data, error } = await auth.db.from("tiziana_memories").insert({ user_id: auth.user.id, content: payload.content.trim() }).select("id,content").single();
  if (error) return jsonError("Unable to save memory", 500);
  return Response.json({ memory: data });
}
export async function DELETE(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const payload = await request.json().catch(() => null);
  if (typeof payload?.id !== "string") return jsonError("Invalid memory", 400);
  const { error } = await auth.db.from("tiziana_memories").delete().eq("user_id", auth.user.id).eq("id", payload.id);
  if (error) return jsonError("Unable to delete memory", 500);
  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const payload = await request.json().catch(() => null);
  if (typeof payload?.id !== "string" || typeof payload?.content !== "string" ||
      !payload.content.trim() || payload.content.length > 1500) return jsonError("Invalid memory", 400);
  const { data, error } = await auth.db.from("tiziana_memories")
    .update({ content: payload.content.trim(), updated_at: new Date().toISOString() })
    .eq("user_id", auth.user.id).eq("id", payload.id).select("id,content").single();
  if (error) return jsonError("Unable to edit memory", 500);
  return Response.json({ memory: data });
}
