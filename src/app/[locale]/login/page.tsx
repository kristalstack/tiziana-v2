'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { getSupabase } from '@/lib/supabase';
import TizianaName from '@/components/TizianaName';
import Link from 'next/link';

export default function LoginPage() {
  const params = useParams();
  const locale = params.locale === 'en' ? 'en' : 'es';
  const en = locale === 'en';
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(''); setMessage('');
    try {
      const supabase = getSupabase();
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/${locale}/auth/callback` } });
        if (error) throw error;
        if (data.session) router.replace(`/${locale}/dashboard`);
        else setMessage(en ? 'Check your email to confirm your account.' : 'Revisa tu correo para confirmar tu cuenta.');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/${locale}/auth/callback?recovery=1` });
        if (error) throw error;
        setMessage(en ? 'If the address is registered, you will receive a recovery link.' : 'Si el correo está registrado, recibirás un enlace de recuperación.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace(`/${locale}/dashboard`);
      }
    } catch (e) { setError(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  }

  return <main className="tiziana-login-page" style={{maxWidth:530,margin:'120px auto 90px',padding:35,color:'#17204A',background:'#fff',borderRadius:28,boxShadow:'0 18px 70px #17204a12'}}>
    <h1 style={{fontSize:32,marginBottom:12}}>{mode==='signup'?(en?'Create your account':'Crea tu cuenta'):mode==='reset'?(en?'Recover access':'Recupera tu acceso'):(en?'Welcome back':'Te damos la bienvenida')}</h1>
    <p style={{marginBottom:12}}><TizianaName locale={locale}/></p><p style={{marginBottom:28}}>{en?'Your private space for reflection.':'Tu espacio privado para reflexionar.'}</p>
    <form onSubmit={submit} style={{display:'grid',gap:16}}>
      <label>{en?'Email':'Correo electrónico'}<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} style={field}/></label>
      {mode!=='reset'&&<label>{en?'Password':'Contraseña'}<input type="password" autoComplete={mode==='signup'?'new-password':'current-password'} minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} style={field}/></label>}
      <button type="submit" disabled={busy} style={button}>{busy?'...':mode==='signup'?(en?'Sign up':'Crear cuenta'):mode==='reset'?(en?'Send recovery email':'Enviar enlace'):(en?'Sign in':'Iniciar sesión')}</button>
    </form>
    {message&&<p role="status" style={{marginTop:16}}>{message}</p>}
    {error&&<p role="alert" style={{marginTop:16,color:'#9B1C1C'}}>{error}</p>}
    <div style={{display:'flex',flexWrap:'wrap',gap:16,marginTop:24}}>
      <button style={link} onClick={()=>{setMode(mode==='signup'?'login':'signup');setError('');setMessage('')}}>{mode==='signup'?(en?'Already registered? Sign in':'¿Ya tienes cuenta? Inicia sesión'):(en?'Create an account':'Crear cuenta')}</button>
      {mode!=='login'&&<button style={link} onClick={()=>{setMode('login');setError('');setMessage('')}}>{en?'Back to sign in':'Volver a iniciar sesión'}</button>}
      {mode==='login'&&<button style={link} onClick={()=>{setMode('reset');setError('');setMessage('')}}>{en?'Forgot password?':'Olvidé mi contraseña'}</button>}
    </div><p style={{marginTop:22}}><Link href={`/${locale}/experience`} style={{color:"#8a2eb3"}}>{en?"Explore the space":"Conoce el espacio"} ↗</Link></p>
  </main>;
}
const field:React.CSSProperties={display:'block',width:'100%',marginTop:6,padding:12,border:'1px solid #bdbdb7',borderRadius:8,background:'white',color:'#17204A'};
const button:React.CSSProperties={padding:14,background:'#334B92',color:'white',border:0,borderRadius:8,cursor:'pointer'};
const link:React.CSSProperties={background:'none',border:0,textDecoration:'underline',cursor:'pointer',color:'#334B92'};
