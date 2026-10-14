"use client";

import {

  use,

  useEffect,

  useRef,

  useState,

  type ChangeEvent,

  type FormEvent,

} from "react";

import Header from "@/components/Header";
import { getSupabase } from "@/lib/supabase";

import Footer from "@/components/Footer";

import ScreenshotRedactor from "@/components/ScreenshotRedactor";

type Citation = {

  fileId: string;

  filename: string;

};

type ReadingRecommendation = {

  chapterNumber: number;

  chapterTitle: string;

  reason: string;

};

type Message = {

  id: number;

  role: "user" | "assistant";

  content: string;

  image?: string;

  citations?: Citation[];

  readingRecommendation?: ReadingRecommendation | null;

};

const MAX_IMAGE_BYTES = 4_000_000;

const copy = {

  es: {

    eyebrow: "TU ESPACIO DE REFLEXIÓN",

    heading: "Un espacio para hablar de lo que estás viviendo.",

    introduction:

      "Soy Tiziana, tu acompañante de inteligencia artificial. Podemos explorar tus experiencias de dating con curiosidad, empatía y una perspectiva psicológica basada en el libro La psicología del dating.",

    greeting:

      "¡Hola! Soy Tiziana. ¿Hay alguna situación de dating o de pareja sobre la que te gustaría reflexionar?",

    placeholder: "Escribe lo que te gustaría compartir...",
    importedNote: "Tu reflexión está lista en el cuadro de texto. Revísala y pulsa Enviar si quieres compartirla con Tiziana.",

    send: "Enviar",

    sending: "Enviando...",

    thinking: "Tiziana está escribiendo...",

    attach: "Adjuntar captura",

    remove: "Eliminar imagen",

    imageError:

      "Selecciona una imagen PNG, JPG o WebP de menos de 4 MB.",

    connectionError:

      "No fue posible conectar con Tiziana. Inténtalo de nuevo.",

    imageLabel: "Captura adjunta",

    source: "Fuente consultada",

    reading: "PARA PROFUNDIZAR EN EL LIBRO",

    chapter: "CAPÍTULO",

    disclaimer:

      "Tiziana es una herramienta educativa y de reflexión. No sustituye la psicoterapia, la atención de crisis ni proporciona diagnósticos. Evita compartir datos personales de terceros en tus capturas.",

  },

  en: {

    eyebrow: "YOUR SPACE FOR REFLECTION",

    heading: "A space to talk about what you're experiencing.",

    introduction:

      "I'm Tiziana, your AI-powered companion. We can explore your dating experiences with curiosity, empathy, and a psychological perspective grounded in the book La psicología del dating.",

    greeting:

      "Hello! I'm Tiziana. Is there a dating or relationship experience you'd like to reflect on?",

    placeholder: "Write what you'd like to share...",
    importedNote: "Your reflection is ready in the message box. Review it and press Send if you want to share it with Tiziana.",

    send: "Send",

    sending: "Sending...",

    thinking: "Tiziana is typing...",

    attach: "Attach screenshot",

    remove: "Remove image",

    imageError:

      "Choose a PNG, JPG, or WebP image smaller than 4 MB.",

    connectionError:

      "Could not connect to Tiziana. Please try again.",

    imageLabel: "Attached screenshot",

    source: "Source consulted",

    reading: "FURTHER READING FROM THE BOOK",

    chapter: "CHAPTER",

    disclaimer:

      "Tiziana is an educational tool for reflection. She does not replace psychotherapy, crisis support, or provide diagnoses. Avoid sharing third parties' personal information in screenshots.",

  },

};

export default function TizianaPage({

  params,

}: {

  params: Promise<{ locale: string }>;

}) {

  const { locale: routeLocale } = use(params);

  const locale = routeLocale === "en" ? "en" : "es";

  const t = copy[locale];

  const [messages, setMessages] = useState<Message[]>([

    {

      id: 1,

      role: "assistant",

      content: t.greeting,

    },

  ]);

  const [input, setInput] = useState("");
  const [importedReflection, setImportedReflection] = useState(false);

  // A saved reflection is transferred only when the user explicitly selects it.
  // It stays in this browser tab until the person chooses to send it.
  useEffect(() => {
    try {
      const draft = window.sessionStorage.getItem("tiziana:selected-reflection");
      if (!draft) return;
      window.sessionStorage.removeItem("tiziana:selected-reflection");
      const parsed: unknown = JSON.parse(draft);
      if (
        parsed && typeof parsed === "object" &&
        "content" in parsed && typeof parsed.content === "string"
      ) {
        const content = parsed.content.trim().slice(0, 3500);
        if (content) { setInput(content); setImportedReflection(true); }
      }
    } catch {
      // A missing or malformed draft must not block the chat.
    }
  }, []);


  const [selectedImage, setSelectedImage] = useState<string | null>(

    null

  );

  const [imageToEdit, setImageToEdit] = useState<string | null>(

    null

  );

  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [memorySuggestion, setMemorySuggestion] = useState("");
  const [remainingMessages, setRemainingMessages] = useState<number|null>(null);
  const [previousConversations, setPreviousConversations] = useState<{id:string;title:string}[]>([]);
  const [permissions, setPermissions] = useState({ compass:false, moments:false, discoveries:false, connections:false, history:false });
  const [privacyError, setPrivacyError] = useState("");
  useEffect(() => {
    let active = true;
    const init = async () => {
      const { data } = await getSupabase().auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };
      const [privacyResponse, listResponse] = await Promise.all([
        fetch("/api/tiziana/preferences", { headers }),
        fetch("/api/tiziana/conversations", { headers }),
      ]);
      if (!active) return;
      if (privacyResponse.ok) {
        const result = await privacyResponse.json();
        setPermissions({ compass:false, moments:false, discoveries:false, connections:false, history:false, ...result.preferences });
      }
      if (listResponse.ok) {
        const result = await listResponse.json();
        setPreviousConversations(result.conversations || []);
      }
    };
    void init();
    return () => { active = false; };
  }, []);
  async function changePermission(key: keyof typeof permissions, checked: boolean) {
    const next = { ...permissions, [key]: checked };
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) { setPrivacyError(locale === "es" ? "Inicia sesión para configurar tus permisos." : "Sign in to manage permissions."); return; }
    const response = await fetch("/api/tiziana/preferences", {
      method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(next),
    });
    if (response.ok) { setPermissions(next); setPrivacyError(""); }
    else setPrivacyError(locale === "es" ? "No se pudieron guardar tus permisos." : "Could not save permissions.");
  }
  async function loadConversation(id: string) {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const response = await fetch(`/api/tiziana/conversations?id=${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return;
    const result = await response.json();
    setMessages((result.messages || []).map((m: {role:"user"|"assistant";content:string}, index:number) => ({...m, id:index+1})));
    nextId.current = (result.messages || []).length + 1;
    setConversationId(id);
  }

  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const nextId = useRef(2);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({

      behavior: "smooth",

      block: "nearest",

    });

  }, [messages, isLoading]);

  function handleImageChange(

    event: ChangeEvent<HTMLInputElement>

  ) {

    const file = event.target.files?.[0];

    if (!file) return;

    setError("");

    const allowedTypes = [

      "image/png",

      "image/jpeg",

      "image/webp",

    ];

    if (

      !allowedTypes.includes(file.type) ||

      file.size > MAX_IMAGE_BYTES

    ) {

      setError(t.imageError);

      event.target.value = "";

      return;

    }

    const reader = new FileReader();

    reader.onload = () => {

      if (typeof reader.result === "string") {

        setSelectedImage(null);

        setImageToEdit(reader.result);

      }

    };

    reader.onerror = () => {

      setError(t.imageError);

    };

    reader.readAsDataURL(file);

    event.target.value = "";

  }

  function removeImage() {

    setSelectedImage(null);

    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  }

  async function handleSubmit(

    event: FormEvent<HTMLFormElement>

  ) {

    event.preventDefault();

    const content = input.trim();

    if (

      (!content && !selectedImage) ||

      isLoading ||

      imageToEdit !== null

    ) {

      return;

    }

    const messageText =

      content ||

      (locale === "es"

        ? "Por favor, analiza esta captura desde una perspectiva psicológica."

        : "Please analyze this screenshot from a psychological perspective.");

    const userMessage: Message = {

      id: nextId.current++,

      role: "user",

      content: messageText,

      ...(selectedImage

        ? { image: selectedImage }

        : {}),

    };

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);

    setInput("");
    setImportedReflection(false);

    setSelectedImage(null);

    setError("");

    setIsLoading(true);

    try {

      const { data: authData } = await getSupabase().auth.getSession();
      const token = authData.session?.access_token;
      if (!token) throw new Error(locale === "es" ? "Inicia sesión para conversar." : "Sign in to chat.");
      const response = await fetch("/api/tiziana", {

        method: "POST",

        headers: {

          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify({

          messages: updatedMessages

            .slice(-30)

            .map((message) => ({

              role: message.role,

              content: message.content,

            })),

          ...(userMessage.image

            ? { image: userMessage.image }

            : {}),

          locale,
          conversationId,

        }),

      });

      const data = await response.json();
      if (response.ok) {
        setMemorySuggestion(typeof data.memorySuggestion === "string" ? data.memorySuggestion : "");
        if (typeof data.messagesRemaining === "number") setRemainingMessages(data.messagesRemaining);
      }
      if (response.ok && typeof data.conversationId === "string") {
        setConversationId(data.conversationId);
        setPreviousConversations(old => old.some(item => item.id === data.conversationId) ? old : [{ id:data.conversationId, title: messageText.slice(0,72) }, ...old]);
      }

      if (!response.ok) {

        throw new Error(

          typeof data.error === "string"

            ? data.error

            : t.connectionError

        );

      }

      if (

        typeof data.reply !== "string" ||

        !data.reply.trim()

      ) {

        throw new Error(t.connectionError);

      }

      const citations: Citation[] = Array.isArray(

        data.citations

      )

        ? data.citations.filter(

            (citation: unknown): citation is Citation => {

              if (

                typeof citation !== "object" ||

                citation === null

              ) {

                return false;

              }

              const item = citation as Record<

                string,

                unknown

              >;

              return (

                typeof item.fileId === "string" &&

                typeof item.filename === "string"

              );

            }

          )

        : [];

      const readingRecommendation: ReadingRecommendation | null =

      data.readingRecommendation &&

      typeof data.readingRecommendation === "object" &&

      Number.isInteger(data.readingRecommendation.chapterNumber) &&

      data.readingRecommendation.chapterNumber >= 1 &&

      data.readingRecommendation.chapterNumber <= 16 &&

      typeof data.readingRecommendation.chapterTitle === "string" &&

      typeof data.readingRecommendation.reason === "string" &&

      data.readingRecommendation.reason.trim().length > 0

        ? {

            chapterNumber: data.readingRecommendation.chapterNumber,

            chapterTitle: data.readingRecommendation.chapterTitle,

            reason: data.readingRecommendation.reason,

          }

        : null;

    setMessages((current) => [

        ...current,

        {

          id: nextId.current++,

          role: "assistant",

          content: data.reply,

          citations,

          readingRecommendation,

        },

      ]);

    } catch (caughtError) {

      setError(

        caughtError instanceof Error

          ? caughtError.message

          : t.connectionError

      );

    } finally {

      setIsLoading(false);

    }

  }

  return (

    <>

      <Header locale={locale} />

      <main className="min-h-screen bg-[#F9F4F0] text-[#17204A]">

        <section className="mx-auto max-w-5xl px-5 pb-20 pt-36 sm:px-8 lg:pt-44">

          <div className="mx-auto max-w-3xl text-center">

            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">

              {t.eyebrow}

            </p>

            <h1 className="font-serif text-6xl italic text-[#C254A7] sm:text-7xl">

              Tiziana

            </h1>

            <h2 className="mt-7 text-3xl font-medium leading-tight sm:text-4xl">

              {t.heading}

            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-[#565D78] sm:text-lg">

              {t.introduction}

            </p>

          </div>

          <div className="mx-auto mt-14 max-w-3xl overflow-hidden border border-[#DAD7EE] bg-white">

            <div className="flex items-center gap-3 border-b border-[#DAD7EE] bg-[#F0EDFF] px-5 py-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#334B92] font-serif text-xl italic text-white">

                T

              </div>

              <div>

                <p className="font-serif text-xl italic text-[#C254A7]">

                  Tiziana

                </p>

                <p className="text-xs text-[#565D78]">

                  {locale === "es"

                    ? "Acompañante de inteligencia artificial"

                    : "AI-powered companion"}

                </p>

              </div>

            </div>

            <div

              aria-label={

                locale === "es"

                  ? "Conversación"

                  : "Conversation"

              }

              aria-live="polite"

              className="flex h-[420px] flex-col gap-5 overflow-y-auto px-5 py-7 sm:px-8"

            >

              {messages.map((message) => (

                <div

                  key={message.id}

                  className={`flex ${

                    message.role === "user"

                      ? "justify-end"

                      : "justify-start"

                  }`}

                >

                  <div

                    className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-5 py-4 text-sm leading-7 sm:text-base ${

                      message.role === "user"

                        ? "rounded-br-sm bg-[#334B92] text-white"

                        : "rounded-bl-sm bg-[#F0EDFF] text-[#17204A]"

                    }`}

                  >

                    {message.image && (

                      <img

                        src={message.image}

                        alt={t.imageLabel}

                        className="mb-3 max-h-72 max-w-full rounded-lg object-contain"

                      />

                    )}

                    <div>{message.content}</div>

                    {message.role === "assistant" &&

                      message.citations &&

                      message.citations.length > 0 && (

                        <div className="mt-4 border-t border-[#DAD7EE] pt-3">

                          <p className="mb-2 text-xs font-semibold text-[#334B92]">

                            {t.source}

                          </p>

                          {[

                            ...new Set(

                              message.citations.map(

                                (citation) =>

                                  citation.filename

                              )

                            ),

                          ].map((filename) => (

                            <p

                              key={filename}

                              className="text-xs text-[#565D78]"

                            >

                              📖 <span className="italic">La psicología del dating</span>

<span className="block text-xs text-[#77736B]">

  {locale === "es"

    ? "Kristal Pastor · Libro de referencia"

    : "Kristal Pastor · Reference book"}

</span>

                            </p>

                          ))}

                        </div>

                      )}

                  {message.role === "assistant" &&

                    message.readingRecommendation && (

                      <div className="mt-4 rounded-xl border border-[#DAD7EE] bg-[#F9F4F0] p-4">

                        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#334B92]">

                          📖 {t.reading}

                        </p>

                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#C254A7]">

                          {t.chapter} {message.readingRecommendation.chapterNumber}

                        </p>

                        <p className="mt-1 font-serif text-lg leading-snug text-[#17204A]">

                          {message.readingRecommendation.chapterTitle}

                        </p>

                        <p className="mt-2 text-sm leading-6 text-[#565D78]">

                          {message.readingRecommendation.reason}

                        </p>

                        <p className="mt-3 border-t border-[#DAD7EE] pt-3 text-xs text-[#77736B]">

                          La psicología del dating · Kristal Pastor

                        </p>

                      </div>

                    )}

                  </div>

                </div>

              ))}

              {isLoading && (

                <div className="flex justify-start">

                  <div className="rounded-2xl rounded-bl-sm bg-[#F0EDFF] px-5 py-4 text-sm italic text-[#C254A7]">

                    {t.thinking}

                  </div>

                </div>

              )}

              <div ref={messagesEndRef} />

            </div>

            <section className="tiziana-control-panel" aria-label={locale === "es" ? "Tu privacidad" : "Your privacy"}>
        <h2>{locale === "es" ? "Tu espacio, tus permisos" : "Your space, your permissions"}</h2>
        <p>{locale === "es" ? "Decide qué puede consultar Tiziana para personalizar sus respuestas." : "Choose what Tiziana may consult to personalize her replies."}</p>
        <div className="tiziana-permission-grid">{([
          ["compass", "Brújula", "Compass"], ["moments", "Momentos", "Moments"],
          ["discoveries", "Descubrimientos", "Discoveries"], ["connections", "Conexiones", "Connections"],
          ["history", "Historial anterior", "Previous conversations"],
        ] as const).map(([key, es, en]) => <label key={key}><input type="checkbox" checked={permissions[key]} onChange={event => void changePermission(key,event.target.checked)} /> {locale === "es" ? es : en}</label>)}</div>
        {privacyError && <p role="alert">{privacyError}</p>}
        <div className="tiziana-conversation-history">
          <button type="button" onClick={() => { setConversationId(null); setMessages([{ id: 1, role: "assistant", content: t.greeting }]); nextId.current = 2; }}>
            {locale === "es" ? "+ Nueva conversación" : "+ New conversation"}
          </button>
          {remainingMessages !== null && <p role="status" style={{fontSize:13,color:"#6e5576"}}>{locale === "es" ? `${remainingMessages} de 300 mensajes disponibles este mes` : `${remainingMessages} of 300 messages left this month`}</p>}
          {memorySuggestion && <div role="region" aria-label={locale === "es" ? "Recuerdo sugerido" : "Suggested memory"} style={{padding:14,border:"1px solid #dbc9e1",borderRadius:12,margin:"12px 0",background:"#fff"}}>
            <p>{locale === "es" ? "¿Quieres que Tiziana recuerde esto?" : "Would you like Tiziana to remember this?"}</p>
            <p style={{margin:"8px 0"}}>{memorySuggestion}</p>
            <button type="button" onClick={async()=>{
              const {data} = await getSupabase().auth.getSession();
              const token = data.session?.access_token;
              if (!token) return;
              const response = await fetch("/api/tiziana/memories",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({content:memorySuggestion,confirmed:true})});
              if(response.ok) setMemorySuggestion("");
              else setPrivacyError(locale==="es"?"No se pudo guardar el recuerdo.":"Could not save memory.");
            }}>{locale === "es" ? "Sí, recordar" : "Yes, remember"}</button>
            <button type="button" style={{marginLeft:8}} onClick={()=>setMemorySuggestion("")}>{locale === "es" ? "Ahora no" : "Not now"}</button>
          </div>}
          <select aria-label={locale === "es" ? "Conversaciones anteriores" : "Previous conversations"} value={conversationId || ""} onChange={event => { if(event.target.value) void loadConversation(event.target.value); }}>
            <option value="">{locale === "es" ? "Abrir conversación anterior" : "Open previous conversation"}</option>
            {previousConversations.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}
          </select>
        </div>
      </section>
      <form

              onSubmit={handleSubmit}

              className="border-t border-[#DAD7EE] px-5 py-5 sm:px-8"

            >

              {imageToEdit && (

                <div className="mb-5">

                  <ScreenshotRedactor

                    image={imageToEdit}

                    locale={locale}

                    onConfirm={(editedImage) => {

                      setSelectedImage(editedImage);

                      setImageToEdit(null);

                      setError("");

                    }}

                    onCancel={() => {

                      setImageToEdit(null);

                    }}

                  />

                </div>

              )}

              {selectedImage && (

                <div className="mb-4 flex items-start gap-3">

                  <img

                    src={selectedImage}

                    alt={t.imageLabel}

                    className="max-h-32 max-w-40 rounded-lg border border-[#DAD7EE] object-contain"

                  />

                  <button

                    type="button"

                    onClick={removeImage}

                    className="text-sm font-medium text-[#C254A7] underline"

                  >

                    {t.remove}

                  </button>

                </div>

              )}

              {importedReflection && (
              <p role="status" className="mb-3 rounded-lg bg-[#F0EDFF] px-4 py-3 text-sm leading-6 text-[#334B92]">
                {t.importedNote}
              </p>
            )}

            <div className="flex items-end gap-3">

                <input

                  ref={fileInputRef}

                  type="file"

                  accept="image/png,image/jpeg,image/webp"

                  onChange={handleImageChange}

                  className="hidden"

                  aria-label={t.attach}

                />

                <button

                  type="button"

                  onClick={() =>

                    fileInputRef.current?.click()

                  }

                  disabled={isLoading}

                  title={t.attach}

                  aria-label={t.attach}

                  className="flex min-h-14 min-w-12 items-center justify-center rounded-xl border border-[#DAD7EE] bg-[#F9F4F0] text-[#334B92] transition hover:bg-[#F0EDFF] disabled:opacity-40"

                >

                  <svg

                    xmlns="http://www.w3.org/2000/svg"

                    width="22"

                    height="22"

                    viewBox="0 0 24 24"

                    fill="none"

                    stroke="currentColor"

                    strokeWidth="1.8"

                    strokeLinecap="round"

                    strokeLinejoin="round"

                    aria-hidden="true"

                  >

                    <rect

                      x="3"

                      y="3"

                      width="18"

                      height="18"

                      rx="2"

                    />

                    <circle

                      cx="8.5"

                      cy="8.5"

                      r="1.5"

                    />

                    <path d="m21 15-5-5L5 21" />

                  </svg>

                </button>

                <textarea

                  value={input}

                  onChange={(event) =>

                    setInput(event.target.value)

                  }

                  placeholder={t.placeholder}

                  aria-label={t.placeholder}

                  maxLength={4000}

                  rows={2}

                  className="min-h-16 flex-1 resize-none rounded-xl border border-[#DAD7EE] bg-[#F9F4F0] px-4 py-3 text-sm text-[#17204A] outline-none placeholder:text-[#77736B] focus:border-[#334B92] sm:text-base"

                />

                <button

                  type="submit"

                  disabled={

                    (!input.trim() && !selectedImage) ||

                    isLoading ||

                    imageToEdit !== null

                  }

                  className="min-h-14 rounded-xl bg-[#334B92] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"

                >

                  {isLoading ? t.sending : t.send}

                </button>

              </div>

              {error && (

                <p

                  role="alert"

                  className="mt-3 text-sm text-[#C254A7]"

                >

                  {error}

                </p>

              )}

            </form>

          </div>

          <p className="mx-auto mt-7 max-w-2xl text-center text-xs leading-6 text-[#77736B]">

            {t.disclaimer}

          </p>

        </section>

      </main>

      <Footer locale={locale} />

    </>

  );

}
