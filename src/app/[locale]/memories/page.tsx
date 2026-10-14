"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
type Memory = { id: string; content: string };
export default function MemoriesPage() {
  const params = useParams();
  const locale = params.locale === "en" ? "en" : "es";
  const en = locale === "en";
  const [memories, setMemories] = useState<Memory[]>([]);
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState("");
  async function call(method: string, payload?: unknown) {
    const { data } = await getSupabase().auth.getSession();
    if (!data.session) throw new Error(en ? "Please sign in" : "Inicia sesión");
    const response = await fetch("/api/tiziana/memories", {
      method, headers: { Authorization: `Bearer ${data.session.access_token}`, "Content-Type": "application/json" },
      ...(payload ? { body: JSON.stringify(payload) } : {}),
    });
    if (!response.ok) throw new Error(en ? "Unable to update memories" : "No se pudieron actualizar los recuerdos");
    return response.json();
  }
  async function reload() { try { const result = await call("GET"); setMemories(result.memories || []); } catch(e) { setMessage(String(e)); } }
  useEffect(() => { void reload(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  async function save() {
    if (!draft.trim() || !window.confirm(en ? "Allow Tiziana to remember this across conversations?" : "¿Autorizas que Tiziana recuerde esto entre conversaciones?")) return;
    try { await call("POST", { content: draft, confirmed: true }); setDraft(""); await reload(); } catch(e) { setMessage(String(e)); }
  }
  async function edit(memory: Memory) {
    const content = window.prompt(en ? "Edit memory" : "Editar recuerdo", memory.content);
    if (content === null || !content.trim() || content.length > 1500) return;
    try { await call("PATCH", { id: memory.id, content }); await reload(); } catch(e) { setMessage(String(e)); }
  }
  async function remove(id: string) {
    if (!window.confirm(en ? "Delete this memory?" : "¿Eliminar este recuerdo?")) return;
    try { await call("DELETE", { id }); await reload(); } catch(e) { setMessage(String(e)); }
  }
  return <main className="tiziana-private-page">
    <Link href={`/${locale}/account`}>← {en ? "My space" : "Mi espacio"}</Link>
    <h1>{en ? "My memories" : "Mis recuerdos"}</h1>
    <p>{en ? "Tiziana only keeps memories you explicitly approve. You can delete them at any time." : "Tiziana solo conserva recuerdos que apruebas expresamente. Puedes eliminarlos cuando quieras."}</p>
    <textarea value={draft} onChange={e=>setDraft(e.target.value)} maxLength={1500} rows={3} placeholder={en ? "Something I want Tiziana to remember..." : "Algo que quiero que Tiziana recuerde..."}/>
    <button onClick={()=>void save()}>{en ? "Review and save" : "Revisar y guardar"}</button>
    {message && <p role="alert">{message}</p>}
    <div className="tiziana-memory-list">{memories.map(memory=><article key={memory.id}><p>{memory.content}</p><button onClick={()=>void edit(memory)}>{en ? "Edit" : "Editar"}</button><button onClick={()=>void remove(memory.id)}>{en ? "Delete" : "Eliminar"}</button></article>)}</div>
  </main>;
}
