"use client";
import {useState} from "react";
import {getSupabase} from "@/lib/supabase";
export default function TizianaRenew({en}:{en:boolean}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function renew() {
    setBusy(true);setError("");
    try {
      const {data}=await getSupabase().auth.getSession();
      const token=data.session?.access_token;
      if(!token) throw new Error(en?"Sign in first":"Inicia sesión primero");
      const response=await fetch("/api/subscribe",{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      const result=await response.json();
      if(!response.ok||typeof result.url!=="string") throw new Error(result.error||"Unable to renew");
      window.location.assign(result.url);
    } catch(e) {setError(e instanceof Error?e.message:String(e));setBusy(false);}
  }
  async function manageBilling() {
    setBusy(true); setError("");
    try {
      const {data}=await getSupabase().auth.getSession();
      const token=data.session?.access_token;
      if(!token) throw new Error(en?"Sign in first":"Inicia sesión primero");
      const response=await fetch("/api/billing-portal",{method:"POST",headers:{Authorization:`Bearer ${token}`}});
      const result=await response.json();
      if(!response.ok||typeof result.url!=="string") throw new Error(result.error||"Billing portal unavailable");
      window.location.assign(result.url);
    } catch(e) {setError(e instanceof Error?e.message:String(e));setBusy(false);}
  }
  return <section style={{marginTop:22,padding:20,background:"white",borderRadius:16,border:"1px solid #eadce8"}}>
    <h2 style={{fontWeight:700}}>{en?"Tiziana subscription":"Suscripción de Tiziana"}</h2>
    <p style={{margin:"10px 0"}}>{en?"Optional renewal: MXN $199 per month. Available when your access is about to expire.":"Renovación opcional: $199 MXN al mes. Disponible cuando tu acceso esté por vencer."}</p>
    <button disabled={busy} onClick={()=>void renew()} style={{background:"#7131a3",color:"white",padding:"12px 18px",borderRadius:100}}>{en?"Renew access":"Renovar acceso"}</button>
    <button disabled={busy} onClick={()=>void manageBilling()} style={{marginLeft:10,background:"transparent",border:"1px solid #7131a3",color:"#7131a3",padding:"12px 18px",borderRadius:100}}>{en?"Manage or cancel subscription":"Administrar o cancelar suscripción"}</button>
    {error&&<p role="alert" style={{marginTop:8}}>{error}</p>}
  </section>;
}
