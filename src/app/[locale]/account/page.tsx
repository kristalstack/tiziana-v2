'use client';
import TizianaRenew from "@/components/TizianaRenew";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import Link from 'next/link';

const GOALS = [
  ['stable', 'Construir una relación estable', 'Build a stable relationship'],
  ['explore', 'Conocer personas sin apresurarme', 'Meet people without rushing'],
  ['understand', 'Comprender mejor mis patrones', 'Understand my patterns better'],
  ['pause', 'Tomarme una pausa del dating', 'Take a break from dating'],
] as const;
const PRIORITIES = [
  ['reciprocity', 'Reciprocidad', 'Reciprocity'],
  ['communication', 'Comunicación clara', 'Clear communication'],
  ['consistency', 'Consistencia', 'Consistency'],
  ['independence', 'Independencia', 'Independence'],
  ['availability', 'Disponibilidad emocional', 'Emotional availability'],
  ['boundaries', 'Respeto por mis límites', 'Respect for my boundaries'],
] as const;

export default function AccountPage() {
  const params = useParams();
  const locale = params.locale === 'en' ? 'en' : 'es';
  const en = locale === 'en';
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goal, setGoal] = useState('');
  const [priorities, setPriorities] = useState<string[]>([]);
  const [boundary, setBoundary] = useState('');
  const [message, setMessage] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) { router.replace(`/${locale}/login`); return; }
      setUser(auth.user);
      const { data, error } = await supabase.from('relationship_compasses')
        .select('goal,priorities,boundary_note').eq('user_id', auth.user.id).maybeSingle();
      if (!active) return;
      if (error) setMessage(en ? `Could not load compass: ${error.message}` : `No se pudo cargar la brújula: ${error.message}`);
      if (data) {
        setGoal(data.goal || '');
        setPriorities(Array.isArray(data.priorities) ? data.priorities : []);
        setBoundary(data.boundary_note || '');
        setSaved(true);
      }
      setLoading(false);
    }
    void load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.replace(`/${locale}/login`);
    });
    return () => { active = false; subscription.unsubscribe(); };
  }, [en, locale, router]);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || saving) return;
    if (!goal) { setMessage(en ? 'Choose your current goal.' : 'Selecciona qué buscas en esta etapa.'); return; }
    setSaving(true); setMessage('');
    const { error } = await getSupabase().from('relationship_compasses').upsert({
      user_id: user.id, goal, priorities, boundary_note: boundary.trim(), updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setSaving(false);
    if (error) { setSaved(false); setMessage(en ? `Could not save: ${error.message}` : `No se pudo guardar: ${error.message}`); }
    else { setSaved(true); setMessage(en ? 'Your compass has been saved.' : 'Tu brújula se guardó correctamente.'); }
  }

  async function logout() { await getSupabase().auth.signOut(); router.replace(`/${locale}/login`); }
  const inputStyle: React.CSSProperties = { accentColor: '#334B92', marginRight: 10 };
  const cardStyle: React.CSSProperties = { padding: 24, border: '1px solid #DAD7EE', borderRadius: 14, marginTop: 24, background: '#fff' };
  if (loading) return <main style={{ padding: 40 }}>{en ? 'Loading...' : 'Cargando...'}</main>;
  if (!user) return null;

  return <main style={{ maxWidth: 780, margin: '48px auto 90px', padding: '0 20px', color: '#17204A' }}>
    <h1 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 500 }}>{en ? 'My Tiziana space' : 'Mi espacio Tiziana'}</h1>
    <p style={{ marginTop: 12, color: '#666' }}>{en ? 'Signed in as' : 'Sesión iniciada como'} <strong>{user.email}</strong></p>
    <section className="tiziana-dashboard-hero">
      <span className="tiziana-eyebrow">{en ? 'YOUR PRIVATE SPACE' : 'TU ESPACIO PERSONAL'}</span>
      <h2>{en ? 'A place to return to yourself.' : 'Un espacio para volver a ti.'}</h2>
      <p>{en ? 'Explore your feelings at your own pace. Your private details stay behind each section.' : 'Explora lo que sientes, a tu ritmo. Tus detalles íntimos permanecen dentro de cada sección.'}</p>
      <Link className="tiziana-primary-link" href={`/${locale}/tiziana`}>{en ? 'Talk to Tiziana →' : 'Hablar con Tiziana →'}</Link>
    </section>
    <nav className="tiziana-dashboard-grid" aria-label={en ? 'Personal tools' : 'Herramientas personales'}>
      <Link href={`/${locale}/tiziana`}><span>✦</span><strong>{en ? 'Conversations' : 'Conversaciones'}</strong><small>{en ? 'Your private dialogue' : 'Tu diálogo privado'}</small></Link>
      <a href="#brujula"><span>✧</span><strong>{en ? 'My compass' : 'Mi brújula'}</strong><small>{en ? 'What matters to you' : 'Lo que es importante para ti'}</small></a>
      <Link href={`/${locale}/map`}><span>♡</span><strong>{en ? 'My moments' : 'Mis momentos'}</strong><small>{en ? 'Connections and experiences' : 'Conexiones y experiencias'}</small></Link>
      <Link href={`/${locale}/discoveries`}><span>◈</span><strong>{en ? 'Discoveries' : 'Mis descubrimientos'}</strong><small>{en ? 'Reflections worth keeping' : 'Reflexiones que quieres conservar'}</small></Link>
      <Link href={`/${locale}/library`}><span>▤</span><strong>{en ? 'My library' : 'Mi biblioteca'}</strong><small>{en ? 'Your book and learning' : 'Tu libro y tus lecturas'}</small></Link>
      <Link href={`/${locale}/memories`}><span>◎</span><strong>{en ? 'My memories' : 'Mis recuerdos'}</strong><small>{en ? 'You decide what stays' : 'Tú decides qué conservar'}</small></Link>
    </nav>
    <section id="brujula" style={cardStyle}>
      <h2 style={{ fontSize: 26, marginBottom: 8 }}>{en ? 'My relationship compass' : 'Mi brújula relacional'}</h2>
      <p style={{ color: '#666', lineHeight: 1.6 }}>{en ? 'Define what matters to you. You can update your answers whenever you need.' : 'Define qué es importante para ti. Puedes actualizar tus respuestas cuando lo necesites.'}</p>
      <form onSubmit={save} style={{ marginTop: 24 }}>
        <fieldset style={{ border: 0, padding: 0, marginBottom: 28 }}>
          <legend style={{ fontWeight: 600, marginBottom: 14 }}>{en ? 'What are you looking for at this stage?' : '¿Qué buscas en esta etapa de tu vida?'}</legend>
          {GOALS.map(([id, es, english]) => <label key={id} style={{ display: 'block', margin: '12px 0', cursor: 'pointer' }}>
            <input type="radio" name="goal" value={id} checked={goal === id} onChange={() => { setGoal(id); setSaved(false); }} style={inputStyle} />{en ? english : es}
          </label>)}
        </fieldset>
        <fieldset style={{ border: 0, padding: 0, marginBottom: 28 }}>
          <legend style={{ fontWeight: 600, marginBottom: 6 }}>{en ? 'What matters most to you?' : '¿Qué es importante para ti?'}</legend>
          <p style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>{en ? 'Select any that apply.' : 'Puedes seleccionar varias opciones.'}</p>
          {PRIORITIES.map(([id, es, english]) => <label key={id} style={{ display: 'block', margin: '12px 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={priorities.includes(id)} onChange={(e) => { setPriorities(old => e.target.checked ? [...old, id] : old.filter(p => p !== id)); setSaved(false); }} style={inputStyle} />{en ? english : es}
          </label>)}
        </fieldset>
        <label htmlFor="boundary" style={{ display: 'block', fontWeight: 600, marginBottom: 12 }}>{en ? 'What boundary do you want to remember when things feel uncertain?' : '¿Qué límite quieres recordar cuando tengas dudas?'}</label>
        <textarea id="boundary" value={boundary} maxLength={2000} onChange={(e) => { setBoundary(e.target.value); setSaved(false); }} rows={4} placeholder={en ? 'For example: I want mutual effort in a connection.' : 'Por ejemplo: Quiero que el interés sea recíproco.'} style={{ width: '100%', border: '1px solid #C9C9C4', borderRadius: 8, padding: 12, font: 'inherit', resize: 'vertical', boxSizing: 'border-box' }} />
        <button disabled={saving} type="submit" style={{ marginTop: 22, padding: '13px 24px', background: '#334B92', color: 'white', border: 0, borderRadius: 8, cursor: saving ? 'wait' : 'pointer', opacity: saving ? 0.7 : 1 }}>
          {saving ? (en ? 'Saving...' : 'Guardando...') : (en ? 'Save my compass' : 'Guardar mi brújula')}
        </button>
        {message && <p role="status" style={{ marginTop: 14, color: saved ? '#334B92' : '#9A3342', overflowWrap: 'anywhere' }}>{message}</p>}
      </form>
    </section>
    <section style={{ ...cardStyle, background: '#F9F4F0', display: 'none' }}>
      <h2 style={{ fontSize: 21 }}>{en ? 'Coming next' : 'Próximamente'}</h2>
      <p style={{ marginTop: 8, lineHeight: 1.6 }}>{en ? 'Your relationship map and check-ins will live here too.' : 'Aquí también estarán tu mapa relacional y tus check-ins.'}</p>
    </section>
    <TizianaRenew en={en}/>
    <button onClick={logout} style={{ marginTop: 26, background: 'transparent', color: '#334B92', border: '1px solid #334B92', padding: '10px 18px', borderRadius: 8, cursor: 'pointer' }}>{en ? 'Sign out' : 'Cerrar sesión'}</button>
  </main>;
}
