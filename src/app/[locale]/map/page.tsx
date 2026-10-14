'use client';



import { useCallback, useEffect, useState, type CSSProperties, type FormEvent } from 'react';

import Link from 'next/link';

import { useParams, useRouter } from 'next/navigation';

import { getSupabase } from '@/lib/supabase';



type Connection = { id: string; user_id: string; nickname: string; context_note: string; status: string; custom_status_note: string; created_at: string };

type Checkin = { id: string; connection_id: string; occurred_at: string; interaction_type: string; energy: number; clarity: number; emotional_safety: number; observed_facts: string; interpretation: string };

const green = '#334B92';

const card: CSSProperties = { background: '#fff', border: '1px solid #E1DFD9', borderRadius: 14, padding: 22, marginTop: 20 };

const field: CSSProperties = { display: 'block', width: '100%', padding: 11, marginTop: 7, border: '1px solid #C8C8C2', borderRadius: 8, font: 'inherit', boxSizing: 'border-box' };

const primary: CSSProperties = { background: green, color: '#fff', border: 0, borderRadius: 8, padding: '12px 19px', cursor: 'pointer', marginTop: 16 };

const secondary: CSSProperties = { background: 'transparent', color: green, border: `1px solid ${green}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer' };

const statusOptions = [

  ['new', 'Estamos empezando a conocernos', 'We are getting to know each other', 'Hay curiosidad, conversaciones o primeros acercamientos.', 'There is curiosity, conversation, or a first connection.'],

  ['dating', 'Estamos saliendo', 'We are dating', 'Ya compartimos citas o encuentros y seguimos descubriendo nuestra conexión.', 'We have shared dates or time together and are still discovering our connection.'],

  ['building', 'Siento que estamos construyendo algo', 'I feel we are building something', 'La conexión está avanzando, aunque quizá todavía haya cosas por definir.', 'The connection is growing, even if some things remain undefined.'],

  ['established', 'Tenemos una relación', 'We are in a relationship', 'Hemos hablado de lo que somos y de los acuerdos que queremos compartir.', 'We have talked about our relationship and the agreements we want to share.'],

  ['uncertain', 'No tengo claro dónde estamos', 'I am not sure where we stand', 'Hay sentimientos, comportamientos o situaciones que me generan incertidumbre.', 'Some feelings, behaviors, or situations leave me uncertain.'],

  ['distance', 'Estamos distanciados', 'We have grown distant', 'La comunicación ha disminuido o se ha detenido. Tal vez decidimos darnos un espacio, o simplemente dejamos de hablar sin tener una conversación al respecto.', 'Communication has slowed or stopped. Perhaps we agreed to take some space, or we simply stopped talking without discussing it.'],

  ['ended', 'Esta historia terminó', 'This chapter has ended', 'La conexión llegó a su fin, aunque lo vivido siga teniendo significado.', 'The connection has ended, even if what we shared still matters.'],

  ['custom', 'Mi situación es diferente', 'My situation is different', 'Prefiero describir lo que estamos viviendo con mis propias palabras.', 'I would rather describe what we are experiencing in my own words.'],

] as const;

// Keep legacy values readable without changing existing records in Supabase.

const displayStatus = (status: string) => status === 'getting_to_know' ? 'new' : status === 'paused' || status === 'lost_contact' ? 'distance' : status;

const initial = { interaction_type: 'conversation', energy: 3, clarity: 3, emotional_safety: 3, observed_facts: '', interpretation: '' };



export default function RelationshipMapPage() {

  const params = useParams();

  const locale = params.locale === 'en' ? 'en' : 'es';

  const en = locale === 'en';

  const router = useRouter();

  const [userId, setUserId] = useState('');

  const [loading, setLoading] = useState(true);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  const [connections, setConnections] = useState<Connection[]>([]);

  const [checkins, setCheckins] = useState<Checkin[]>([]);

  const [selected, setSelected] = useState('');

  const [nickname, setNickname] = useState('');

  const [context, setContext] = useState('');

  const [form, setForm] = useState(initial);

  const [customDraft, setCustomDraft] = useState('');



  const reload = useCallback(async (id: string) => {

    const db = getSupabase();

    const [a, b] = await Promise.all([

      db.from('relationship_connections').select('id,user_id,nickname,context_note,status,custom_status_note,created_at').eq('user_id', id).order('created_at', { ascending: false }),

      db.from('relationship_checkins').select('id,connection_id,occurred_at,interaction_type,energy,clarity,emotional_safety,observed_facts,interpretation').eq('user_id', id).order('occurred_at', { ascending: false }),

    ]);

    if (a.error || b.error) { setError(a.error?.message || b.error?.message || 'Error'); return; }

    setConnections((a.data || []) as Connection[]);

    setCheckins((b.data || []) as Checkin[]);

    setSelected(old => (a.data || []).some(x => x.id === old) ? old : (a.data?.[0]?.id || ''));

    setError('');

  }, []);



  useEffect(() => {

    let active = true;

    const db = getSupabase();

    async function init() {

      const { data, error: authError } = await db.auth.getUser();

      if (!active) return;

      if (authError || !data.user) { router.replace(`/${locale}/login`); return; }

      setUserId(data.user.id);

      await reload(data.user.id);

      if (active) setLoading(false);

    }

    void init();

    const { data: { subscription } } = db.auth.onAuthStateChange(event => { if (event === 'SIGNED_OUT') router.replace(`/${locale}/login`); });

    return () => { active = false; subscription.unsubscribe(); };

  }, [locale, router, reload]);



  async function addConnection(e: FormEvent<HTMLFormElement>) {

    e.preventDefault(); if (!userId || busy || !nickname.trim()) return;

    setBusy(true); setError('');

    const { data, error: err } = await getSupabase().from('relationship_connections').insert({ user_id: userId, nickname: nickname.trim(), context_note: context.trim() }).select('id').single();

    if (err) setError(err.message);

    else { setNickname(''); setContext(''); await reload(userId); if (data) setSelected(data.id); }

    setBusy(false);

  }

  async function addCheckin(e: FormEvent<HTMLFormElement>) {

    e.preventDefault(); if (!userId || !selected || busy) return;

    setBusy(true); setError('');

    const { error: err } = await getSupabase().from('relationship_checkins').insert({ user_id: userId, connection_id: selected, ...form });

    if (err) setError(err.message);

    else { setForm(initial); await reload(userId); }

    setBusy(false);

  }

  async function changeStatus(id: string, status: string, customNote?: string) {

    if (!userId || busy) return;

    setBusy(true);

    const { error: err } = await getSupabase().from('relationship_connections').update({ status, ...(customNote !== undefined ? { custom_status_note: customNote } : {}), updated_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId);

    if (err) setError(err.message); else await reload(userId);

    setBusy(false);

  }

  async function deleteConnection(id: string) {

    if (!userId || busy || !window.confirm(en ? 'Delete this connection and all its check-ins? This cannot be undone.' : '¿Eliminar esta conexión y todos sus check-ins? No se puede deshacer.')) return;

    setBusy(true);

    const { error: err } = await getSupabase().from('relationship_connections').delete().eq('id', id).eq('user_id', userId);

    if (err) setError(err.message); else await reload(userId);

    setBusy(false);

  }

  async function deleteCheckin(id: string) {

    if (!userId || busy || !window.confirm(en ? 'Delete this check-in?' : '¿Eliminar este check-in?')) return;

    setBusy(true);

    const { error: err } = await getSupabase().from('relationship_checkins').delete().eq('id', id).eq('user_id', userId);

    if (err) setError(err.message); else await reload(userId);

    setBusy(false);

  }

  const current = connections.find(x => x.id === selected);

  const currentCustomNote = current?.custom_status_note || ''; 

  const history = checkins.filter(x => x.connection_id === selected);

  const tr = (es: string, english: string) => en ? english : es;

  if (loading) return <main style={{ padding: 40 }}>{tr('Cargando...', 'Loading...')}</main>;

  return <main style={{ maxWidth: 920, margin: '45px auto 100px', padding: '0 20px', color: '#17204A' }}>

    <Link href={`/${locale}/account`} style={{ color: green }}>← {tr('Volver a mi espacio', 'Back to my space')}</Link>

    <h1 style={{ fontSize: 'clamp(29px,5vw,42px)', marginTop: 22 }}>{tr('Mis historias y conexiones', 'My stories and connections')}</h1>
    <p style={{ color: '#62625F', lineHeight: 1.6 }}>{tr('Cada conexión tiene su historia. Este es un espacio para mirarla con cariño, entender lo que has vivido y descubrir qué necesitas, a tu propio ritmo.', 'Every connection has its own story. This is a space to look at yours with care, understand what you have experienced, and discover what you need at your own pace.')}</p>

    <Link href={`/${locale}/discoveries`} style={{ display: 'block', textDecoration: 'none', color: '#17204A', background: '#F1F5F0', border: '1px solid #CFDDD3', borderRadius: 18, padding: '22px 24px', marginTop: 26, marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <span aria-hidden="true" style={{ display: 'grid', placeItems: 'center', width: 50, height: 50, flexShrink: 0, borderRadius: 14, background: '#DCE9DE', fontSize: 25 }}>✦</span>
        <div style={{ flex: '1 1 230px' }}>
          <h2 style={{ margin: 0, fontSize: 22, color: green }}>{tr('Lo que voy descubriendo', 'What I am discovering')}</h2>
          <p style={{ margin: '9px 0 17px', lineHeight: 1.6, color: '#535D56', fontSize: 15 }}>{tr('Explora cómo te has sentido en tus encuentros, revisa tus momentos guardados y observa cómo evoluciona cada historia.', 'Explore how your interactions have felt, revisit saved moments, and see how each story evolves.')}</p>
          <span style={{ display: 'inline-block', background: green, color: '#fff', borderRadius: 9, padding: '11px 17px', fontWeight: 600, fontSize: 14 }}>{tr('Explorar mis descubrimientos', 'Explore my discoveries')} →</span>
        </div>
      </div>
    </Link>

    {error && <p role="alert" style={{ color: '#9A3342', background: '#FFF1F2', padding: 12, borderRadius: 8 }}>{error}</p>}

    <section style={card}>

      <h2 style={{ fontSize: 23 }}>{tr('¿Hay alguien sobre quien quieras reflexionar?', 'Is there someone you would like to reflect on?')}</h2>

      <p style={{ color: '#666', fontSize: 14 }}>{tr('No necesitas contarlo todo ahora. Puedes empezar con un nombre o apodo y volver a esta historia cuando quieras.', 'You do not have to tell the whole story now. Start with a name or nickname and come back whenever you like.')}</p>

      <form onSubmit={addConnection}>

        <label style={{ display: 'block', marginTop: 15 }}>{tr('Nombre o apodo', 'Name or nickname')}<input style={field} value={nickname} maxLength={80} required onChange={e => setNickname(e.target.value)} /></label>

        <label style={{ display: 'block', marginTop: 15 }}>{tr('¿Cómo comenzó esta historia? (opcional)', 'How did this story begin? (optional)')}<textarea style={field} rows={2} maxLength={2000} value={context} onChange={e => setContext(e.target.value)} /></label>

        <button type="submit" disabled={busy} style={primary}>{tr('Guardar esta conexión', 'Save this connection')}</button>

      </form>

    </section>

    {connections.length > 0 && <section style={card}>

      <h2 style={{ fontSize: 23 }}>{tr('Las personas de mi historia', 'The people in my story')}</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>{connections.map(c => <button key={c.id} type="button" onClick={() => setSelected(c.id)} style={{ ...secondary, background: selected === c.id ? green : 'transparent', color: selected === c.id ? 'white' : green }}>{c.nickname}</button>)}</div>

      {current && <div style={{ marginTop: 20 }}>

        <h3 style={{ fontSize: 20 }}>{current.nickname}</h3>

        {current.context_note && <p style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>{current.context_note}</p>}

        <div style={{ marginTop: 24 }}>

          <h4 style={{ fontSize: 21, fontWeight: 600 }}>{tr('¿En qué momento está esta conexión?', 'Where is this connection today?')}</h4>

          <p style={{ color: '#666', lineHeight: 1.65, marginTop: 8 }}>{tr('Las relaciones no siempre avanzan en línea recta. Elige lo que más se acerque a tu experiencia de hoy. No tiene que ser perfecto y puedes cambiarlo cuando quieras.', 'Relationships do not always follow a straight line. Choose what feels closest to your experience today. It does not have to be perfect, and you can change it anytime.')}</p>

          <div role="group" aria-label={tr('Momento de la conexión', 'Connection stage')} style={{ display: 'grid', gap: 9, marginTop: 18 }}>

            {statusOptions.map(([value, es, english, detailEs, detailEn]) => <button key={value} type="button" disabled={busy} aria-pressed={displayStatus(current.status) === value} onClick={() => { setCustomDraft(currentCustomNote); void changeStatus(current.id, value); }} style={{ textAlign: 'left', cursor: busy ? 'wait' : 'pointer', background: displayStatus(current.status) === value ? '#F0F4F0' : '#fff', border: `1px solid ${displayStatus(current.status) === value ? green : '#DFDFDA'}`, borderRadius: 12, padding: '14px 16px', color: '#17204A' }}>

              <span style={{ display: 'block', fontWeight: 600, fontSize: 16 }}>{displayStatus(current.status) === value ? '◉' : '○'} {tr(es, english)}</span>

              <span style={{ display: 'block', color: '#666', fontSize: 13, lineHeight: 1.5, paddingLeft: 22, marginTop: 4 }}>{tr(detailEs, detailEn)}</span>

            </button>)}

          </div>

          <p style={{ fontSize: 13, color: '#777', marginTop: 12 }}>{tr('Las relaciones cambian, y la forma en que las vivimos también. Puedes actualizar esta información cuando quieras.', 'Relationships change, and so does how we experience them. You can update this information whenever you like.')}</p>

        </div>

        {current.status === 'custom' && <label style={{ display: 'block', marginTop: 12 }}>{tr('Cuéntalo a tu manera', 'Tell it in your own words')}

          <textarea key={current.id + currentCustomNote} style={{ ...field, maxWidth: 520 }} maxLength={300} rows={2} defaultValue={currentCustomNote} onChange={e => setCustomDraft(e.target.value)} placeholder={tr('Por ejemplo: Estamos retomando el contacto.', 'For example: We are reconnecting.')} />

          <button type="button" disabled={busy} style={{ ...secondary, display: 'block', marginTop: 10 }} onClick={() => void changeStatus(current.id, 'custom', customDraft)}>{tr('Guardar descripción', 'Save description')}</button>

        </label>}

        <button type="button" disabled={busy} style={{ ...secondary, marginTop: 16, color: '#923C48', borderColor: '#923C48' }} onClick={() => void deleteConnection(current.id)}>{tr('Eliminar ficha y registros', 'Delete profile and records')}</button>

      </div>}

    </section>}

    {current && <section style={card}>

      <h2 style={{ fontSize: 23 }}>{tr('¿Cómo te dejó este encuentro?', 'How did this interaction leave you feeling?')}</h2>

      <p style={{ color: '#666', fontSize: 14 }}>{tr('A veces necesitamos un momento para escucharnos. No hay respuestas correctas: esto es solo una fotografía de cómo te sentiste, no una evaluación de la otra persona.', 'Sometimes we need a moment to check in with ourselves. There are no right answers: this is a snapshot of how you felt, not a rating of the other person.')}</p>

      <form onSubmit={addCheckin}>

        <label style={{ display: 'block', marginTop: 18 }}>{tr('¿Qué compartieron esta vez?', 'What kind of moment did you share?')}

          <select style={field} value={form.interaction_type} onChange={e => setForm(old => ({ ...old, interaction_type: e.target.value }))}>

            <option value="conversation">{tr('Conversación', 'Conversation')}</option><option value="message">{tr('Mensajes', 'Messages')}</option><option value="date">{tr('Cita', 'Date')}</option><option value="other">{tr('Otra', 'Other')}</option>

          </select>

        </label>

        {([['energy',tr('¿Con cuánta energía terminaste?', 'How energized did you feel afterward?')],['clarity',tr('¿Cuánta claridad sientes?', 'How much clarity do you feel?')],['emotional_safety',tr('¿Cuánta seguridad emocional sentiste?', 'How emotionally safe did you feel?')]] as const).map(([key,label]) => <label key={key} style={{ display: 'block', marginTop: 19 }}>

          {label} <strong>({form[key]}/5)</strong>

          <input type="range" min={1} max={5} step={1} value={form[key]} onChange={e => setForm(old => ({ ...old, [key]: Number(e.target.value) }))} style={{ display: 'block', width: '100%', accentColor: green, marginTop: 8 }} />

          <span style={{ fontSize: 12, color: '#666' }}>1 = {tr('muy poco', 'very low')} · 5 = {tr('mucho', 'very high')}</span>

        </label>)}

        <label style={{ display: 'block', marginTop: 19 }}>{tr('Si dejamos de lado las suposiciones, ¿qué pasó realmente?', 'Setting assumptions aside, what actually happened?')}<textarea style={field} rows={3} maxLength={2000} value={form.observed_facts} onChange={e => setForm(old => ({ ...old, observed_facts: e.target.value }))} placeholder={tr('Ejemplo: Hablamos 20 minutos y acordamos volver a vernos.', 'Example: We talked for 20 minutes and agreed to meet again.')} /></label>

        <label style={{ display: 'block', marginTop: 19 }}>{tr('¿Qué significado le estás dando a lo que pasó?', 'What meaning are you giving to what happened?')}<textarea style={field} rows={3} maxLength={2000} value={form.interpretation} onChange={e => setForm(old => ({ ...old, interpretation: e.target.value }))} placeholder={tr('Ejemplo: Creo que existe interés, pero todavía no lo sé.', 'Example: I think there may be interest, but I do not know yet.')} /></label>

        <button type="submit" disabled={busy} style={primary}>{tr('Guardar este momento', 'Save this moment')}</button>

      </form>

    </section>}

    {current && <section style={card}>

      <h2 style={{ fontSize: 23 }}>{tr('Los momentos de esta historia', 'Moments in this story')} ({history.length})</h2>

      {history.length === 0 ? <p style={{ marginTop: 14, color: '#666' }}>{tr('Aún no has guardado ningún momento. Cuando quieras, puedes empezar por el que más tengas presente.', 'You have not saved any moments yet. Whenever you are ready, start with the one on your mind.')}</p> : history.map(item => <article key={item.id} style={{ borderTop: '1px solid #E5E3DD', paddingTop: 16, marginTop: 16 }}>

        <p style={{ fontSize: 13, color: '#666' }}>{new Date(item.occurred_at).toLocaleString(en ? 'en-US' : 'es-MX')} · {item.interaction_type}</p>

        <p style={{ marginTop: 9 }}>{tr('Energía', 'Energy')}: {item.energy}/5 · {tr('Claridad', 'Clarity')}: {item.clarity}/5 · {tr('Seguridad emocional', 'Emotional safety')}: {item.emotional_safety}/5</p>

        {item.observed_facts && <p style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}><strong>{tr('Hechos:', 'Facts:')}</strong> {item.observed_facts}</p>}

        {item.interpretation && <p style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}><strong>{tr('Interpretación:', 'Interpretation:')}</strong> {item.interpretation}</p>}

        <button type="button" disabled={busy} onClick={() => void deleteCheckin(item.id)} style={{ ...secondary, marginTop: 12, fontSize: 13 }}>{tr('Eliminar registro', 'Delete check-in')}</button>

      </article>)}

    </section>}

    <p style={{ color: '#666', fontSize: 13, lineHeight: 1.6, marginTop: 24 }}>{tr('Tus registros son privados dentro de tu cuenta. Evita guardar datos identificables de terceras personas. Por ahora, Tiziana no utiliza automáticamente estos registros en el chat.', 'Your records are private to your account. Avoid storing identifying information about other people. Tiziana does not automatically use these records in chat yet.')}</p>

  </main>;

}
