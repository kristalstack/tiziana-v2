"use client";
import TizianaName from "./TizianaName";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";
export default function TizianaCheckout({ en, product }: { en: boolean; product?: "book" | "bundle" }) {
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  async function buy(product: "book"|"bundle") {
    setLoading(true);setError("");
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) { setError(en ? "Purchases will be available soon." : "Próximamente podrás comprar aquí."); setLoading(false); return; }
      const {data}=await getSupabase().auth.getSession();
      if(!data.session) throw new Error(en ? "Please sign in before purchasing." : "Inicia sesión antes de comprar.");
      const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${data.session.access_token}`},body:JSON.stringify({product})});
      const result=await response.json();
      if(!response.ok || typeof result.url!=="string") throw new Error(en ? "Checkout is not available yet." : "El pago todavía no está disponible.");
      window.location.assign(result.url);
    } catch(e){const message=e instanceof Error ? e.message : String(e);setError(message.includes("Faltan NEXT_PUBLIC") ? (en ? "Purchases will be available soon." : "Próximamente podrás comprar aquí.") : message);setLoading(false);}
  }
  return <div className={`tiziana-checkout-options ${product ? "tiziana-checkout-single" : ""}`}>
    {(!product || product === "book") && <button disabled={loading} onClick={()=>void buy("book")}>{en ? "Buy the book" : "Comprar el libro"}</button>}
    {(!product || product === "bundle") && <button disabled={loading} onClick={()=>void buy("bundle")}><>{en ? "Book + 3 months of " : "Libro + 3 meses de "}<span className="tiziana-brand"><em>Tiziana</em></span></></button>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
