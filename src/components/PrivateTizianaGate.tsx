"use client";
import TizianaName from "./TizianaName";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

type Access = "checking" | "allowed" | "login" | "purchase" | "configuration";
export default function PrivateTizianaGate({children,locale}:{children:React.ReactNode;locale:string}) {
  const path=usePathname();
  const protectedPath = ["/dashboard", "/account", "/tiziana", "/map", "/discoveries", "/memories"].some(x => path === `/${locale}${x}` || path.startsWith(`/${locale}${x}/`));
  const [access,setAccess]=useState<Access>("checking");
  useEffect(()=>{
    if(!protectedPath) return;
    let live=true;
    setAccess("checking");
    (async()=>{
      try {
        const db=getSupabase();
        const {data:{user},error}=await db.auth.getUser();
        if(!live)return;
        if(error||!user){setAccess("login");return;}
        const {data,error:dbError}=await db.from("product_entitlements").select("id,expires_at").eq("user_id",user.id).eq("product","tiziana").or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).limit(1);
        if(!live)return;
        setAccess(dbError?"configuration":data?.length?"allowed":"purchase");
      } catch {if(live)setAccess("configuration");}
    })();
    return()=>{live=false};
  },[path,protectedPath]);
  if(!protectedPath) return <>{children}</>;
  if(access==="allowed")return <>{children}</>;
  const en=locale==="en";
  return <main className="tiziana-gate"><div className="tiziana-gate-card">
    <span className="tiziana-eyebrow">TU ESPACIO PERSONAL</span>
    <h1>{access==="checking"?(en?"Checking your access…":"Verificando tu acceso…"):access==="login"?(en?"Your story starts here.":"Tu historia empieza aquí."):access==="purchase"?(en?"Your private space awaits.":"Tu espacio personal te espera."):(en?"We couldn't verify access.":"No pudimos verificar tu acceso.")}</h1>
    <p>{access==="login"?(en?"Sign in to access your private tools and conversations.":"Inicia sesión para acceder a tus herramientas y conversaciones privadas."):access==="purchase"?(en?"The full Tiziana experience requires an active plan. Your purchased book remains accessible in your library.":"La experiencia completa requiere acceso vigente a Tiziana. Si compraste el libro, sigue disponible en tu biblioteca."):access==="configuration"?(en?"Your space is not available yet. You can sign in or explore the experience while access is being configured.":"Todavía no podemos abrir tu espacio. Puedes iniciar sesión o explorar cómo funciona mientras terminamos de configurar el acceso."):""}</p>
    <div className="tiziana-gate-actions">{(access==="login"||access==="configuration")&&<Link className="tiziana-primary-link" href={`/${locale}/login`}>{en?"Sign in":"Iniciar sesión"}</Link>}{access==="purchase"&&<Link className="tiziana-primary-link" href={`/${locale}/book#opciones`}>{en?"Explore plans":"Ver opciones"}</Link>}<Link className="tiziana-secondary-link" href={`/${locale}/experience`}>{en?"Conoce el espacio":"Conocer el espacio"}</Link>{access==="purchase"&&<Link className="tiziana-secondary-link" href={`/${locale}/library`}>{en?"My library":"Mi biblioteca"}</Link>}</div>
  </div></main>;
}
