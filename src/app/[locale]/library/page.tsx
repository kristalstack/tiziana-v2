"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function LibraryPage({ params }: { params: Promise<{locale:string}> }) {
  const { locale } = use(params);
  const en = locale === "en";
  const [url,setUrl] = useState<string|null>(null);
  const [status,setStatus] = useState(en ? "Checking access…" : "Comprobando acceso…");
  useEffect(() => {
    let active = true;
    let objectUrl: string|null = null;
    async function load() {
      try {
        const {data} = await getSupabase().auth.getSession();
        const token = data.session?.access_token;
        if (!token) {setStatus(en ? "Please sign in." : "Inicia sesión para acceder."); return;}
        const response = await fetch("/api/book/read",{headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
        if (!response.ok) {setStatus(response.status===403 ? (en?"Purchase the book to read it here.":"Compra el libro para leerlo aquí.") : (en?"Unable to open the book.":"No se pudo abrir el libro.")); return;}
        const blob = await response.blob();
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      } catch { if(active) setStatus(en?"Unable to open the book.":"No se pudo abrir el libro."); }
    }
    void load();
    return () => {active=false; if(objectUrl) URL.revokeObjectURL(objectUrl);};
  },[en]);
  return <main style={{maxWidth:1100,margin:"40px auto",padding:"0 20px"}}>
    <Link href={`/${locale}/account`}>← {en?"My space":"Mi espacio"}</Link>
    <h1 style={{fontSize:"clamp(30px,5vw,52px)",margin:"28px 0 12px"}}>{en?"My library":"Mi biblioteca"}</h1>
    <p style={{marginBottom:24}}>{en?"The Psychology of Dating — Kristal Pastor":"La psicología del dating — Kristal Pastor"}</p>
    {url ? <iframe title={en?"Book reader":"Lector del libro"} src={url} style={{width:"100%",height:"78vh",border:"1px solid #e8d9e9",borderRadius:16}}/> : <p role="status">{status} <Link href={`/${locale}/book`}>{en?"See book":"Ver libro"}</Link></p>}
    <p style={{fontSize:12,opacity:.7,marginTop:12}}>{en?"Personal access only. Do not redistribute.":"Acceso personal. No redistribuir."}</p>
  </main>;
}
