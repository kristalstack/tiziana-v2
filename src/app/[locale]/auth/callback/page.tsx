'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';

export default function AuthCallbackPage(){
  const params=useParams(); const locale=params.locale==='en'?'en':'es'; const en=locale==='en';
  const router=useRouter(); const search=useSearchParams(); const [error,setError]=useState('');
  const [password,setPassword]=useState(''); const [recovery,setRecovery]=useState(false); const [ready,setReady]=useState(false); const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let active=true; const supabase=getSupabase();
    async function handle(){
      try{
        const code=search.get('code');
        if(code){const {error}=await supabase.auth.exchangeCodeForSession(code);if(error)throw error;}
        // supabase-js processes hash-based confirmation/recovery links automatically.
        const {data:{session}}=await supabase.auth.getSession();
        if(!active)return;
        const isRecovery=search.get('recovery')==='1'||new URLSearchParams(window.location.hash.slice(1)).get('type')==='recovery';
        if(isRecovery){setRecovery(true);setReady(true);return;}
        if(session){router.replace(`/${locale}/account`);return;}
        setError(en?'Could not verify this link. Try signing in.':'No se pudo verificar el enlace. Intenta iniciar sesión.');
      }catch(e){if(active)setError(e instanceof Error?e.message:String(e));}
    }
    void handle();return()=>{active=false;};
  },[locale,en,router,search]);
  async function changePassword(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');const {error}=await getSupabase().auth.updateUser({password});setBusy(false);if(error)setError(error.message);else router.replace(`/${locale}/account`);}
  return <main style={{maxWidth:440,margin:'72px auto',padding:24}}>
    <h1 style={{fontSize:28}}>{recovery?(en?'Choose a new password':'Elige una nueva contraseña'):(en?'Verifying your account':'Verificando tu cuenta')}</h1>
    {recovery&&ready&&<form onSubmit={changePassword} style={{display:'grid',gap:12,marginTop:20}}><input aria-label={en?'New password':'Nueva contraseña'} type="password" required minLength={6} value={password} onChange={e=>setPassword(e.target.value)} placeholder={en?'New password':'Nueva contraseña'} style={{padding:12,border:'1px solid gray'}}/><button disabled={busy} type="submit" style={{padding:12,background:'#334B92',color:'white'}}>{en?'Save password':'Guardar contraseña'}</button></form>}
    {error&&<p role="alert" style={{color:'#9B1C1C',marginTop:20}}>{error} <a href={`/${locale}/login`}>{en?'Sign in':'Iniciar sesión'}</a></p>}
  </main>;
}
