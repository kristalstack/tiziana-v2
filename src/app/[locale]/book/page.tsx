import TizianaExperience from "@/components/TizianaExperience";
import BrandName from "@/components/TizianaName";

import Link from "next/link";
import TizianaCheckout from "@/components/TizianaCheckout";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";



export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isSpanish = locale === "es";

  return {
    title: isSpanish
      ? "La psicología del dating | Kristal Pastor"
      : "The Psychology of Dating | Kristal Pastor",
    description: isSpanish
      ? "Descubre La psicología del dating y conoce a Tiziana, tu acompañante de inteligencia artificial para explorar tus experiencias desde una perspectiva psicológica."
      : "Discover The Psychology of Dating and meet Tiziana, your AI-powered companion for exploring dating experiences through a psychological lens.",
    alternates: {
      canonical: `/${locale}/book`,
      languages: {
        es: "/es/book",
        en: "/en/book",
      },
    },
    openGraph: {
      title: isSpanish
        ? "La psicología del dating | Kristal Pastor"
        : "The Psychology of Dating | Kristal Pastor",
      description: isSpanish
        ? "Un libro sobre psicología del dating y Tiziana, tu acompañante de inteligencia artificial."
        : "A book about dating psychology and Tiziana, your AI-powered companion.",
      type: "website",
    },
  };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isSpanish = locale === "es";

  return (
    <>
      <Header locale={locale} />

      <main>
        {/* HERO */}
        <section className="bg-[#F9F4F0] text-[#17204A]">
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-40 lg:px-10 lg:pb-32 lg:pt-48">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div>
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
                  {isSpanish
                    ? "LIBRO DIGITAL"
                    : "DIGITAL BOOK"}
                </p>

                <h1 className="text-5xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                  {isSpanish ? (
                    <>
                      La psicología
                      <br />
                      <span className="font-serif italic text-[#C254A7]">
                        del dating.
                      </span>
                    </>
                  ) : (
                    <>
                      The Psychology
                      <br />
                      <span className="font-serif italic text-[#C254A7]">
                        of Dating.
                      </span>
                    </>
                  )}
                </h1>

                <p className="mt-9 max-w-2xl text-xl leading-9 text-[#565D78]">
                  {isSpanish
                    ? "Una mirada psicológica a cómo buscamos pareja, construimos vínculos, interpretamos nuestras experiencias y tomamos decisiones en el dating moderno."
                    : "A psychological perspective on how we search for partners, build connections, interpret our experiences, and make decisions in modern dating."}
                </p>

                <TizianaCheckout en={!isSpanish} />
                <a
                  href="#opciones"
                  className="mt-9 inline-flex bg-[#334B92] px-7 py-4 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  {isSpanish
                    ? "Conoce las opciones →"
                    : "Explore the options →"}
                </a>
              </div>

              <div className="relative mx-auto aspect-[4/5] w-full max-w-[480px] overflow-hidden">
                <Image
                  src="/kristal%20pastor_2.png"
                  alt={
                    isSpanish
                      ? "Kristal Pastor, psicóloga y escritora"
                      : "Kristal Pastor, psychologist and writer"
                  }
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* ENFOQUE DEL LIBRO */}
        <section className="bg-[#334B92] text-[#F9F4F0]">
          <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#DAD7EE]">
                {isSpanish ? "EL ENFOQUE" : "THE APPROACH"}
              </p>

              <h2 className="max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
                {isSpanish
                  ? "No necesitas otra fórmula para encontrar pareja."
                  : "You don't need another formula for finding a partner."}
              </h2>
            </div>

            <div className="max-w-xl space-y-6 text-lg leading-8 text-[#E4E0D8]">
              <p>
                {isSpanish
                  ? "Aprendimos sobre el amor a través de nuestras familias, nuestras experiencias y las historias que consumimos. Pero pocas personas recibieron herramientas para comprender lo que sucede psicológicamente cuando buscamos pareja."
                  : "We learned about love through our families, our experiences, and the stories we consumed. But few people were given tools to understand what happens psychologically when searching for a partner."}
              </p>

              <p>
                {isSpanish
                  ? "Este libro explora los patrones, el apego, la comunicación, los límites, la compatibilidad y la toma de decisiones desde una perspectiva psicológica."
                  : "This book explores patterns, attachment, communication, boundaries, compatibility, and decision-making from a psychological perspective."}
              </p>

              <p>
                {isSpanish
                  ? "No para decirte a quién elegir, sino para ayudarte a comprender mejor cómo eliges."
                  : "Not to tell you whom to choose, but to help you better understand how you choose."}
              </p>
            </div>
          </div>
        </section>

        {/* EL ESPACIO TIZIANA */}
        <section className="bg-[#F9F4F0] text-[#17204A]">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
            <p className="mb-6 text-xs font-bold tracking-[.2em] text-[#334B92]">{isSpanish ? "UN ESPACIO PARA ENTENDER TU HISTORIA" : "A SPACE TO UNDERSTAND YOUR STORY"}</p>
            <h2 className="text-4xl font-semibold leading-tight sm:text-6xl">{isSpanish ? "Tu historia merece algo más que quedarse en tu cabeza." : "Your story deserves more than staying in your head."}</h2>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#565D78]">{isSpanish ? <>Con <BrandName locale={locale}/> puedes organizar lo que vives, visualizar tus relaciones, reconocer patrones y conversar sobre todo ello. Es un espacio con seis herramientas conectadas, no solo un diario ni un chatbot.</> : <><BrandName locale={locale}/> is a space with six connected tools to organize your experiences, visualize relationships, recognize patterns and talk them through.</>}</p>
            <Link href={`/${locale}/experience`} className="mt-8 inline-flex rounded-full bg-[#17204A] px-8 py-4 font-semibold text-white">{isSpanish ? "Conoce las seis herramientas →" : "Explore the six tools →"}</Link>
          </div>
        </section>

        {/* OPCIONES DE COMPRA */}
        <section
          id="opciones"
          className="scroll-mt-24 bg-[#F0EDFF] text-[#17204A]"
        >
          <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="mb-14 text-center">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
                {isSpanish ? "OPCIONES" : "OPTIONS"}
              </p>

              <h2 className="text-4xl font-medium leading-tight sm:text-5xl">
                {isSpanish
                  ? "Elige cómo quieres empezar."
                  : "Choose how you'd like to begin."}
              </h2>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Book-only plan */}
              <div className="book-plan-card flex flex-col border border-[#DAD7EE] bg-[#F9F4F0] p-9 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#334B92]">
                  {isSpanish ? "LIBRO DIGITAL" : "DIGITAL BOOK"}
                </p>

                <h3 className="mt-5 text-3xl font-medium">
                  {isSpanish
                    ? "La psicología del dating"
                    : "The Psychology of Dating"}
                </h3>

                <p className="mt-6 text-4xl font-medium">
                  $249{" "}
                  <span className="text-base font-normal">MXN</span>
                </p>

                <p className="mt-6 leading-8 text-[#565D78]">
                  {isSpanish
                    ? "El libro digital completo, para leer y consultar a tu propio ritmo."
                    : "The complete digital book, to read and revisit at your own pace."}
                </p>

                <p className="mt-5 text-sm text-[#334B92]">
                  {isSpanish
                    ? "Pago único · Acceso permanente"
                    : "One-time payment · Permanent access"}
                </p>

                <div className="mt-auto pt-10">
                  <TizianaCheckout en={!isSpanish} product="book" />
                </div>
              </div>

              {/* Book and Tiziana plan */}
              <div className="flex flex-col border border-[#334B92] bg-white p-9 lg:p-12">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#334B92]">
                  {isSpanish
                    ? "EXPERIENCIA COMPLETA"
                    : "COMPLETE EXPERIENCE"}
                </p>

                <h3 className="mt-5 text-3xl font-medium">
                  {isSpanish ? "Libro + " : "Book + "}
                  <BrandName locale={locale} />
                </h3>

                <p className="mt-6 text-4xl font-medium">
                  $699{" "}
                  <span className="text-base font-normal">MXN</span>
                </p>

                <p className="mt-6 leading-8 text-[#565D78]">
                  {isSpanish ? (
                    <>
                      Tu libro digital para siempre y tres meses de acceso a <BrandName locale={locale} />, un espacio para comprender tus relaciones. Organiza tus experiencias, visualiza tus vínculos y conversa sobre lo que vives con una acompañante digital que puede conocer tu historia, con tu permiso.
                    </>
                  ) : (
                    <>
                      The complete digital book plus three months
                      of access to <BrandName locale={locale} />, your AI-powered
                      companion, designed to help you understand
                      your dating experiences through the concepts
                      explored in the book.
                    </>
                  )}
                </p>

                <div className="mt-6 rounded-2xl bg-[#F9F4F0] p-6 text-[#17204A]">
                  <p className="mb-3 font-semibold">{isSpanish ? "Tu experiencia incluye:" : "Your experience includes:"}</p>
                  <ul className="space-y-5 text-sm leading-6">
                    {(isSpanish ? [
                      ["Mi brújula", "Aquí defines qué buscas en una relación, cuáles son tus valores, tus objetivos y los límites que quieres respetar."],
                      ["Mi mapa relacional", "Registra a las personas que has conocido, visualiza cómo cambian tus relaciones y reconoce patrones."],
                      ["Mis momentos", "Guarda conversaciones y situaciones importantes, qué pasó y cómo te sentiste, para volver a ellas con más claridad."],
                      ["Mis descubrimientos", "Conserva las reflexiones que te ayudan a entenderte mejor y vuelve a ellas cuando lo necesites."],
                      ["Mis conversaciones", "Habla con tu acompañante digital. Con tu permiso, puede recordar tu historia, tus objetivos y tus relaciones para ayudarte a reflexionar sin empezar de cero."],
                      ["Mi biblioteca", "Consulta La psicología del dating cuando quieras y conecta sus conceptos con lo que estás viviendo."]
                    ] : [
                      ["My compass", "Define what you want in a relationship, your values, goals and boundaries."],
                      ["My relationship map", "Record people you've met and see how your relationships evolve."],
                      ["My moments", "Save meaningful experiences, what happened and how you felt."],
                      ["My discoveries", "Keep your insights and revisit them whenever you need."],
                      ["My conversations", "Talk with a companion that can use your history and goals, with your permission."],
                      ["My library", "Revisit The Psychology of Dating and connect it to your experiences."]
                    ]).map(([title,description]) => <li key={title} className="flex gap-3"><span aria-hidden="true" className="text-[#C254A7] font-bold">✓</span><span><strong className="block text-base">{title}</strong>{description}</span></li>)}
                  </ul>
                  <p className="mt-6 text-sm font-semibold">{isSpanish ? "✓ El libro digital es tuyo para siempre. Acceso al espacio durante tres meses." : "✓ Your digital book is yours forever. Three months of access to the space."}</p>
                  <p className="mt-4 text-xs leading-5 text-[#565D78]">{isSpanish ? "Límite previsto: 300 mensajes enviados por mes, sujeto a validación. Renovación opcional: $199 MXN/mes; no se activa automáticamente." : "Planned limit: 300 sent messages per month, subject to validation. Optional renewal: MXN $199/month; not activated automatically."}</p>
                </div>

                <div className="mt-auto pt-10">
                  <TizianaCheckout en={!isSpanish} product="bundle" />
                </div>
              </div>
            </div>

            {/* Renewal terms */}
            <p className="mx-auto mt-10 max-w-3xl text-center text-sm leading-7 text-[#565D78]">
              {isSpanish ? (
                <>
                  Al finalizar los tres meses, podrás renovar tu
                  acceso a <BrandName locale={locale} /> por $199 MXN mensuales.
                  La renovación no será automática, a menos que
                  elijas expresamente una suscripción recurrente.
                </>
              ) : (
                <>
                  After three months, you can renew your access to{" "}
                  <BrandName locale={locale} /> for MXN $199 per month. Renewal
                  will not be automatic unless you explicitly
                  choose a recurring subscription.
                </>
              )}
            </p>
          </div>
        </section>

        {/* Blog section */}
        <section className="bg-[#F9F4F0] text-center">
          <div className="mx-auto max-w-4xl px-6 py-24 lg:py-32">
            <h2 className="text-4xl font-medium leading-tight sm:text-5xl">
              {isSpanish
                ? "Mientras tanto, explora la psicología del dating."
                : "In the meantime, explore the psychology of dating."}
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#565D78]">
              {isSpanish
                ? "Explora artículos basados en psicología y evidencia científica."
                : "Explore articles grounded in psychology and scientific evidence."}
            </p>

            <Link
              href={`/${locale}/blog`}
              className="mt-9 inline-flex bg-[#334B92] px-7 py-4 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {isSpanish
                ? "Explorar el blog →"
                : "Explore the blog →"}
            </Link>
          </div>
        </section>
      </main>

      <TizianaExperience locale={locale} />
      <Footer locale={locale} />
    </>
  );
}
