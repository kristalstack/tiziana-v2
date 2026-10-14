'use client';



import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';

import Link from 'next/link';

import { useParams, useRouter } from 'next/navigation';

import { getSupabase } from '@/lib/supabase';



type Connection = { id: string; nickname: string };

type Checkin = { id: string; connection_id: string; occurred_at: string; interaction_type: string; energy: number; clarity: number; emotional_safety: number; observed_facts: string; interpretation: string };

type Reflection = { id: string; connection_id: string; content: string; created_at: string };

type Metric = 'energy' | 'clarity' | 'emotional_safety';

const green = '#334B92';

const panel: CSSProperties = { background: '#fff', border: '1px solid #E2E0DA', borderRadius: 16, padding: '22px', marginTop: 20 };

const metricColors: Record<Metric,string> = { energy: '#B08A63', clarity: '#547A70', emotional_safety: '#8B6074' };

const metrics: Metric[] = ['energy', 'clarity', 'emotional_safety'];

const formatScore = (value: number) => Number.isFinite(value) ? value.toFixed(1) : '—';



export default function DiscoveriesPage() {

  const params = useParams();

  const locale = params.locale === 'en' ? 'en' : 'es';

  const en = locale === 'en';

  const router = useRouter();

  function discussReflection(content: string) {
    // No other moments or reflections are transferred to the AI.
    // The user reviews the draft and chooses whether to send it in chat.
    try {
      window.sessionStorage.setItem('tiziana:selected-reflection', JSON.stringify({content}));
      router.push(`/${locale}/tiziana`);
    } catch {
      setError(tr('No se pudo preparar la reflexión. Inténtalo de nuevo.','Could not prepare the reflection. Please try again.'));
    }
  }


  const tr = useCallback((es: string, english: string) => en ? english : es, [en]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [connections, setConnections] = useState<Connection[]>([]);

  const [checkins, setCheckins] = useState<Checkin[]>([]);

  const [selected, setSelected] = useState('');

  const [userId, setUserId] = useState('');

  const [reflections, setReflections] = useState<Reflection[]>([]);

  const [reflectionDraft, setReflectionDraft] = useState('');

  const [saving, setSaving] = useState(false);

  const [feedback, setFeedback] = useState('');



  useEffect(() => {

    let active = true;

    const db = getSupabase();

    async function load() {

      const { data: auth, error: authError } = await db.auth.getUser();

      if (!active) return;

      if (authError || !auth.user) { router.replace(`/${locale}/login`); return; }

      const userId = auth.user.id;

      setUserId(userId);

      const [a,b,c] = await Promise.all([

        db.from('relationship_connections').select('id,nickname').eq('user_id',userId).order('created_at',{ascending:false}),

        db.from('relationship_checkins').select('id,connection_id,occurred_at,interaction_type,energy,clarity,emotional_safety,observed_facts,interpretation').eq('user_id',userId).order('occurred_at',{ascending:true}),

        db.from('relationship_reflections').select('id,connection_id,content,created_at').eq('user_id',userId).order('created_at',{ascending:false}),

      ]);

      if (!active) return;

      if (a.error || b.error || c.error) setError(a.error?.message || b.error?.message || c.error?.message || 'Error');

      else {

        const people = (a.data || []) as Connection[];

        setConnections(people);

        setCheckins((b.data || []) as Checkin[]);

        setReflections((c.data || []) as Reflection[]);

        setSelected(people[0]?.id || '');

      }

      setLoading(false);

    }

    void load();

    const {data:{subscription}} = db.auth.onAuthStateChange(event => { if(event==='SIGNED_OUT') router.replace(`/${locale}/login`); });

    return () => { active=false; subscription.unsubscribe(); };

  },[locale,router]);



  const currentReflections = useMemo(() => reflections.filter(r => r.connection_id === selected), [reflections, selected]);

  async function saveReflection() {

    const content = reflectionDraft.trim();

    if (!userId || !selected || !content || saving) return;

    setSaving(true); setFeedback('');

    const {data, error: saveError} = await getSupabase().from('relationship_reflections').insert({user_id:userId,connection_id:selected,content}).select('id,connection_id,content,created_at').single();

    if (saveError) setFeedback(tr('No se pudo guardar. Inténtalo de nuevo.','Could not save. Please try again.'));

    else { setReflections(old => [data as Reflection,...old]); setReflectionDraft(''); setFeedback(tr('Tu reflexión quedó guardada en esta historia.','Your reflection was saved to this story.')); }

    setSaving(false);

  }

  const history = useMemo(() => checkins.filter(x=>x.connection_id===selected),[checkins,selected]);

  const latest = useMemo(()=>[...history].reverse(),[history]);

  const averages = useMemo(()=>Object.fromEntries(metrics.map(m=>[m,history.length ? history.reduce((sum,c)=>sum+c[m],0)/history.length : NaN])) as Record<Metric,number>,[history]);

  const names: Record<Metric,string> = {energy:tr('Energía','Energy'),clarity:tr('Claridad','Clarity'),emotional_safety:tr('Seguridad emocional','Emotional safety')};

  const date = (value:string) => new Date(value).toLocaleDateString(en?'en-US':'es-MX',{day:'numeric',month:'short',year:'numeric'});



  if (loading) return <main style={{padding:40}}>{tr('Cargando tus reflexiones…','Loading your reflections…')}</main>;

  return <main style={{maxWidth:920,margin:'45px auto 100px',padding:'0 20px',color:'#17204A'}}>

    <Link href={`/${locale}/map`} style={{color:green}}>← {tr('Volver a mis historias','Back to my stories')}</Link>

    <h1 style={{fontSize:'clamp(29px,5vw,42px)',marginTop:24}}>{tr('Lo que voy descubriendo','What I am discovering')}</h1>

    <p style={{color:'#62625F',lineHeight:1.7,maxWidth:760}}>{tr('Cada momento que registras puede ayudarte a mirar tu experiencia con un poco más de perspectiva. Aquí puedes volver a lo que sentiste y a lo que realmente ocurrió, sin prisa por llegar a una conclusión.','Every moment you record can help you see your experience with more perspective. Here you can revisit what you felt and what actually happened, without rushing to a conclusion.')}</p>

    {error && <p role="alert" style={{background:'#FFF1F2',color:'#9A3342',padding:14,borderRadius:10}}>{error}</p>}

    {!error && connections.length===0 && <section style={panel}><h2>{tr('Toda historia comienza en algún lugar','Every story starts somewhere')}</h2><p>{tr('Cuando quieras, crea tu primera conexión y guarda un momento para empezar a descubrir tu recorrido.','When you are ready, create your first connection and save a moment to begin exploring your journey.')}</p><Link href={`/${locale}/map`} style={{color:green}}>{tr('Ir a mis historias →','Go to my stories →')}</Link></section>}

    {!error && connections.length>0 && <>

      <section style={panel}>

        <label htmlFor="connection" style={{display:'block',fontWeight:600,marginBottom:8}}>{tr('¿Qué historia quieres mirar hoy?','Which story would you like to revisit today?')}</label>

        <select id="connection" value={selected} onChange={e=>{setSelected(e.target.value);setReflectionDraft('');setFeedback('');}} style={{width:'100%',maxWidth:520,border:'1px solid #C9C9C3',borderRadius:9,padding:12,font:'inherit',background:'white'}}>{connections.map(c=><option key={c.id} value={c.id}>{c.nickname}</option>)}</select>

        <p style={{color:'#6C6C67',fontSize:14,marginTop:12}}>{tr('Solo tú decides qué registrar. Esta página no interpreta las intenciones de la otra persona.','You decide what to record. This page does not interpret the other person’s intentions.')}</p>

      </section>

      {history.length===0 ? <section style={panel}><h2>{tr('Todavía no hay momentos guardados','No moments saved yet')}</h2><p>{tr('Cuando registres cómo te sentiste después de una conversación o cita, podrás verlo aquí.','Once you record how you felt after a conversation or date, you will be able to see it here.')}</p><Link href={`/${locale}/map`} style={{color:green}}>{tr('Guardar un momento →','Save a moment →')}</Link></section> : <>

        <section style={panel}>

          <h2 style={{fontSize:23,marginTop:0}}>{tr('Cómo me he sentido','How I have been feeling')}</h2>

          <p style={{color:'#666',lineHeight:1.6}}>{tr('Estas son tus propias valoraciones después de cada interacción. No son una puntuación de la relación ni de la otra persona.','These are your own ratings after each interaction. They are not scores for the relationship or the other person.')}</p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:12,margin:'20px 0'}}>

            {metrics.map(m=><div key={m} style={{background:'#F9F4F0',padding:16,borderRadius:12}}><div style={{fontSize:14,color:'#595953'}}>{names[m]}</div><div style={{fontSize:28,fontWeight:600,color:green,marginTop:7}}>{formatScore(averages[m])}<span style={{fontSize:14,fontWeight:400}}> / 5</span></div><div style={{fontSize:12,color:'#777'}}>{tr('Promedio de mis registros','Average of my entries')}</div></div>)}

          </div>

          <div style={{overflowX:'auto'}}><div style={{minWidth:Math.max(360,history.length*68),display:'flex',gap:10,alignItems:'end',height:205,borderBottom:'1px solid #DAD8D2',padding:'8px 4px 0'}}>

            {history.map((item,index)=><div key={item.id} title={date(item.occurred_at)} style={{flex:'1 0 52px',maxWidth:84,textAlign:'center'}}><div style={{height:155,display:'flex',gap:3,alignItems:'end',justifyContent:'center'}}>{metrics.map(m=><div key={m} title={`${names[m]}: ${item[m]}/5`} aria-label={`${names[m]}: ${item[m]}/5`} style={{width:'28%',height:`${item[m]*20}%`,background:metricColors[m],borderRadius:'5px 5px 0 0'}} />)}</div><div style={{fontSize:11,color:'#6B6B67',marginTop:8}}>{date(item.occurred_at)}</div><div style={{fontSize:11,color:'#777'}}>{index+1}</div></div>)}

          </div></div>

          <div style={{display:'flex',flexWrap:'wrap',gap:16,marginTop:18}}>{metrics.map(m=><span key={m} style={{display:'inline-flex',gap:7,alignItems:'center',fontSize:13}}><span style={{width:12,height:12,borderRadius:3,background:metricColors[m]}} />{names[m]}</span>)}</div>

          <p style={{color:'#777',fontSize:13,marginTop:16}}>{tr('Cada grupo de barras corresponde a un momento, ordenado del más antiguo al más reciente. Los promedios son descriptivos; no indican por sí solos una tendencia.','Each group of bars represents one moment, ordered from oldest to newest. Averages are descriptive and do not establish a trend on their own.')}</p>

        </section>

        <section style={panel}>

          <h2 style={{fontSize:23,marginTop:0}}>{tr('Lo que ocurrió y lo que pensé','What happened and what I thought')}</h2>

          <p style={{color:'#666',lineHeight:1.6}}>{tr('A veces separar lo que observamos de lo que imaginamos nos ayuda a comprender mejor una experiencia. No tienes que corregir lo que sentiste: ambas partes merecen ser escuchadas.','Sometimes separating what we observed from what we imagined helps us understand an experience. You do not have to correct what you felt: both parts deserve attention.')}</p>

          {latest.map(item=><article key={item.id} style={{borderTop:'1px solid #E8E5DF',paddingTop:17,marginTop:17}}><div style={{color:'#777',fontSize:13}}>{date(item.occurred_at)}</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginTop:10}}><div style={{background:'#F9F4F0',borderRadius:10,padding:14}}><strong>{tr('Lo que observé','What I observed')}</strong><p style={{whiteSpace:'pre-wrap',marginBottom:0}}>{item.observed_facts.trim()||tr('No registré hechos en este momento.','No facts recorded for this moment.')}</p></div><div style={{background:'#F9F4F0',borderRadius:10,padding:14}}><strong>{tr('Lo que interpreté','What I interpreted')}</strong><p style={{whiteSpace:'pre-wrap',marginBottom:0}}>{item.interpretation.trim()||tr('No registré una interpretación.','No interpretation recorded.')}</p></div></div></article>)}

        </section>



      </>}

      <section style={panel}>

        <h2 style={{fontSize:23,marginTop:0}}>{tr('Mi reflexión','My reflection')}</h2>

        <p style={{color:'#666',lineHeight:1.6}}>{tr('Este espacio es para ti. Puedes escribir lo que piensas o sientes y guardarlo en esta historia. No tienes que responder si hoy no te apetece.','This space is yours. Write what you think or feel and save it to this story. You do not have to answer if you do not feel like it today.')}</p>

        <label htmlFor="reflection-text" style={{display:'block',fontWeight:600,marginTop:15,marginBottom:9}}>{tr('¿Qué te gustaría comprender mejor sobre esta conexión?','What would you like to understand better about this connection?')}</label>

        <textarea id="reflection-text" rows={4} maxLength={3000} value={reflectionDraft} onChange={e=>setReflectionDraft(e.target.value)} placeholder={tr('Escribe aquí lo que piensas o sientes…','Write what you think or feel here…')} style={{width:'100%',boxSizing:'border-box',font:'inherit',padding:13,border:'1px solid #C9C9C3',borderRadius:10,resize:'vertical'}} />

        <button type="button" onClick={()=>void saveReflection()} disabled={saving || !reflectionDraft.trim()} style={{display:'inline-block',marginTop:12,padding:'12px 18px',border:0,borderRadius:9,background:green,color:'white',font:'inherit',cursor:saving?'wait':'pointer',opacity:saving || !reflectionDraft.trim()?0.55:1}}>{saving?tr('Guardando…','Saving…'):tr('Guardar mi reflexión','Save my reflection')}</button>

        {feedback && <p role="status" style={{color:green,marginTop:12}}>{feedback}</p>}

        {currentReflections.length>0 && <div style={{marginTop:26,borderTop:'1px solid #E8E5DF',paddingTop:16}}>

          <h3 style={{fontSize:18}}>{tr('Mis reflexiones guardadas','My saved reflections')}</h3>
          <p style={{fontSize:13,color:'#686862',lineHeight:1.6}}>{tr('Al elegir una reflexión, se abrirá el chat con el texto preparado. Solo se compartirá con Tiziana cuando pulses Enviar.','Choosing a reflection opens the chat with a prepared draft. It will only be shared with Tiziana when you press Send.')}</p>

          {currentReflections.map(item=><article key={item.id} style={{padding:'12px 0',borderBottom:'1px solid #EEECE7'}}><div style={{fontSize:12,color:'#777'}}>{date(item.created_at)}</div><p style={{whiteSpace:'pre-wrap',lineHeight:1.6,marginBottom:12}}>{item.content}</p><button type="button" onClick={()=>discussReflection(item.content)} style={{border:0,borderRadius:9,background:green,color:'#fff',padding:'11px 16px',font:'inherit',fontSize:14,cursor:'pointer'}}>{tr('Conversar sobre esto con Tiziana →','Discuss this with Tiziana →')}</button></article>)}

        </div>}

        <p style={{marginTop:18}}><a href={`/${locale}/map`} style={{color:green,fontWeight:600,display:'inline-block',padding:'10px 0'}}>{tr('← Volver a mi historia','← Back to my story')}</a></p>

      </section>

    </>}

    <p style={{fontSize:13,color:'#777',lineHeight:1.6,marginTop:25}}>{tr('Tus registros permanecen en tu cuenta. Solo la reflexión que decidas enviar desde el chat se compartirá con Tiziana; no se generan diagnósticos.','Your entries stay in your account. Only the reflection you choose to send from chat is shared with Tiziana; no diagnoses are generated.')}</p>

  </main>;

}
