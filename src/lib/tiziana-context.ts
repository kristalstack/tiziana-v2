import type { SupabaseClient } from "@supabase/supabase-js";

type Preferences = { compass: boolean; moments: boolean; discoveries: boolean; connections: boolean; history: boolean };
const defaults: Preferences = { compass: false, moments: false, discoveries: false, connections: false, history: false };

export async function contextForUser(db: SupabaseClient, userId: string) {
  const { data: preference, error: preferenceError } = await db.from("tiziana_privacy_preferences")
    .select("compass,moments,discoveries,connections,history").eq("user_id", userId).maybeSingle();
  if (preferenceError) throw new Error("Privacy settings unavailable");
  const allowed: Preferences = preference || defaults;
  const context: Record<string, unknown> = {};
  const queries = [
    { key: "compass", enabled: allowed.compass, table: "relationship_compasses", columns: "goal,priorities,boundary_note", count: 1, sort: "" },
    { key: "connections", enabled: allowed.connections, table: "relationship_connections", columns: "id,nickname,context_note,status,custom_status_note", count: 20, sort: "" },
    { key: "moments", enabled: allowed.moments, table: "relationship_checkins", columns: "connection_id,occurred_at,interaction_type,energy,clarity,emotional_safety,observed_facts,interpretation", count: 15, sort: "occurred_at" },
    { key: "discoveries", enabled: allowed.discoveries, table: "relationship_reflections", columns: "connection_id,content,created_at", count: 15, sort: "created_at" },
  ] as const;
  await Promise.all(queries.filter(q => q.enabled).map(async q => {
    let request = db.from(q.table).select(q.columns).eq("user_id", userId).limit(q.count);
    if (q.sort) request = request.order(q.sort, { ascending: false });
    const { data, error } = await request;
    if (error) throw new Error(`Unable to load ${q.key}`);
    context[q.key] = data;
  }));
  const { data: memories, error: memoryError } = await db.from("tiziana_memories")
    .select("content,updated_at").eq("user_id", userId).order("updated_at", { ascending: false }).limit(20);
  if (memoryError) throw new Error("Memory unavailable");
  context.approvedMemories = memories || [];
  return { allowed, context: JSON.stringify(context).slice(0, 19000) };
}
