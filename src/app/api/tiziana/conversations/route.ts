import { authenticatedDatabase, jsonError } from "@/lib/tiziana-server";
export async function GET(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const { data: conversation, error: ownershipError } = await auth.db.from("tiziana_conversations").select("id,title,locale").eq("user_id", auth.user.id).eq("id", id).maybeSingle();
    if (ownershipError || !conversation) return jsonError("Conversation not found", 404);
    const { data, error } = await auth.db.from("tiziana_messages").select("id,role,content,created_at").eq("user_id", auth.user.id).eq("conversation_id", id).order("created_at", { ascending: true }).limit(100);
    if (error) return jsonError("Unable to load messages", 500);
    return Response.json({ conversation, messages: data });
  }
  const { data, error } = await auth.db.from("tiziana_conversations").select("id,title,created_at,updated_at").eq("user_id", auth.user.id).order("updated_at", { ascending: false }).limit(30);
  if (error) return jsonError("Unable to load conversations", 500);
  return Response.json({ conversations: data });
}
export async function DELETE(request: Request) {
  const auth = await authenticatedDatabase(request);
  if (!auth) return jsonError("Authentication required", 401);
  const payload = await request.json().catch(() => null);
  if (typeof payload?.id !== "string") return jsonError("Invalid conversation", 400);
  const { error } = await auth.db.from("tiziana_conversations").delete().eq("user_id", auth.user.id).eq("id", payload.id);
  if (error) return jsonError("Unable to delete conversation", 500);
  return Response.json({ ok: true });
}
