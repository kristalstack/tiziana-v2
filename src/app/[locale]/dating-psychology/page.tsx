import Link from "next/link";
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
      ? "Psicología del Dating"
      : "Dating Psychology",

    description: isSpanish
      ? "Explora la psicología detrás de la atracción, el apego, la comunicación, los límites, la compatibilidad y el dating moderno."
      : "Explore the psychology behind attraction, attachment, communication, boundaries, compatibility, and modern dating.",

    alternates: {
      canonical: `/${locale}/dating-psychology`,
      languages: {
        en: "/en/dating-psychology",
        es: "/es/dating-psychology",
      },
    },

    openGraph: {
      title: isSpanish
        ? "Psicología del Dating | Kristal Pastor"
        : "Dating Psychology | Kristal Pastor",

      description: isSpanish
        ? "Psicología basada en evidencia para entender cómo elegimos, conectamos y construimos relaciones."
        : "Evidence-based psychology for understanding how we choose, connect, and build relationships.",

      type: "website",
    },
  };
}

export default async function DatingPsychologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isSpanish = locale === "es";

  const topics = isSpanish
    ? [
        {
          number: "01",
          title: "Atracción y conexión",
          description:
            "Por qué algunas personas nos atraen, cómo se desarrolla la conexión y qué diferencia la química inicial de una conexión que puede crecer.",
        },
        {
          number: "02",
          title: "Apego y patrones",
          description:
            "Cómo nuestras experiencias, expectativas y formas de relacionarnos pueden influir en las personas que elegimos y en los patrones que repetimos.",
        },
        {
          number: "03",
          title: "Comunicación",
          description:
            "Cómo manejamos la incertidumbre, expresamos interés, interpretamos señales y tenemos conversaciones importantes mientras conocemos a alguien.",
        },
        {
          number: "04",
          title: "Límites",
          description:
            "Cómo reconocer lo que necesitas, comunicar tus límites y evaluar si existe respeto y reciprocidad en una relación.",
        },
        {
          number: "05",
          title: "Compatibilidad",
          description:
            "Cómo mirar más allá de la atracción para considerar valores, metas, necesidades, estilo de vida y expectativas de una relación.",
        },
        {
          number: "06",
          title: "Dating moderno",
          description:
            "Apps, mensajes, ghosting, atención inconsistente y otras situaciones que forman parte de conocer personas en la actualidad.",
        },
      ]
    : [
        {
          number: "01",
          title: "Attraction & Connection",
          description:
            "Why certain people attract us, how connection develops, and what separates initial chemistry from a connection that can grow.",
        },
        {
          number: "02",
          title: "Attachment & Patterns",
          description:
            "How our experiences, expectations, and ways of relating can influence the people we choose and the patterns we repeat.",
        },
        {
          number: "03",
          title: "Communication",
          description:
            "How we navigate uncertainty, express interest, interpret signals, and have important conversations while getting to know someone.",
        },
        {
          number: "04",
          title: "Boundaries",
          description:
            "How to recognize what you need, communicate your limits, and evaluate respect and reciprocity in a relationship.",
        },
        {
          number: "05",
          title: "Compatibility",
          description:
            "How to look beyond attraction and consider values, goals, needs, lifestyle, and expectations for a relationship.",
        },
        {
          number: "06",
          title: "Modern Dating",
          description:
            "Apps, texting, ghosting, inconsistent attention, and other situations that are part of meeting people today.",
        },
      ];

  return (
    <>
      <Header locale={locale} />

      <main>
        {/* HERO */}
<section className="bg-[#F9F4F0] text-[#17204A]">
  <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-24 pt-40 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-10 lg:pb-32 lg:pt-48">

    <div>
      <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
        {isSpanish
          ? "Psicología del Dating"
          : "Dating Psychology"}
      </p>

      <h1 className="text-5xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
        {isSpanish ? (
          <>
            Entender el dating empieza por entender{" "}
            <span className="font-serif italic text-[#C254A7]">
              cómo pensamos, sentimos y elegimos.
            </span>
          </>
        ) : (
          <>
            Understanding dating starts with understanding{" "}
            <span className="font-serif italic text-[#C254A7]">
              how we think, feel, and choose.
            </span>
          </>
        )}
      </h1>

      <p className="mt-8 max-w-3xl text-xl leading-9 text-[#565D78]">
        {isSpanish
          ? "No existe una fórmula para encontrar pareja. Pero sí existen procesos psicológicos que pueden ayudarnos a entender mejor nuestras decisiones, nuestras relaciones y las situaciones que vivimos mientras conocemos a alguien."
          : "There is no formula for finding a partner. But there are psychological processes that can help us better understand our decisions, our relationships, and the situations we experience while getting to know someone."}
      </p>
    </div>

    <div className="relative aspect-[4/5] overflow-hidden">
      <Image
        src="/kristal pastor_2.png"
        alt="Kristal Pastor"
        fill
        sizes="(max-width: 1024px) 100vw, 40vw"
        className="object-cover"
        priority
      />
    </div>

  </div>
</section>

        {/* PHILOSOPHY */}
        <section className="bg-[#334B92] text-[#F9F4F0]">
          <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#DAD7EE]">
                {isSpanish ? "El enfoque" : "The approach"}
              </p>

              <h2 className="max-w-xl text-4xl font-medium leading-tight sm:text-5xl">
  {isSpanish ? (
    <>
      Menos{" "}
      <span className="font-serif italic text-[#C254A7]">
        etiquetas.
      </span>
      <br />
      Más{" "}
      <span className="font-serif italic text-[#C254A7]">
        comprensión.
      </span>
    </>
  ) : (
    <>
      Fewer{" "}
      <span className="font-serif italic text-[#F9F4F0]">
        labels.
      </span>
      <br />
      More{" "}
      <span className="font-serif italic text-[#F9F4F0]">
        understanding.
      </span>
    </>
  )}
</h2>
            </div>

            <div className="max-w-xl space-y-6 text-lg leading-8 text-[#FBE8F8]">
              <p>
                {isSpanish
                  ? "El comportamiento humano rara vez puede explicarse con una sola etiqueta. Que alguien tarde en responder un mensaje, pierda interés o tenga dificultades para comprometerse no nos permite diagnosticarlo desde lejos."
                  : "Human behavior can rarely be explained by a single label. Someone taking a long time to reply, losing interest, or struggling with commitment does not allow us to diagnose them from a distance."}
              </p>

              <p>
                {isSpanish
                  ? "La psicología puede ofrecernos algo mucho más útil: marcos para entender patrones, emociones, decisiones, comunicación y dinámicas interpersonales."
                  : "Psychology can offer something much more useful: frameworks for understanding patterns, emotions, decisions, communication, and interpersonal dynamics."}
              </p>

              <p className="font-medium text-white">
                {isSpanish
                  ? "El objetivo no es aprender a controlar a otra persona. Es comprender mejor lo que sucede para poder decidir qué hacer con esa información."
                  : "The goal is not to learn how to control another person. It is to better understand what is happening so you can decide what to do with that information."}
              </p>
            </div>
          </div>
        </section>

        {/* TOPICS */}
        <section className="bg-[#F9F4F0] text-[#17204A]">
          <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
            <div className="mb-16 max-w-3xl">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
                {isSpanish ? "Explora por tema" : "Explore by topic"}
              </p>

              <h2 className="text-4xl font-medium leading-tight sm:text-5xl">
  {isSpanish ? (
    <>
      La{" "}
      <span className="font-serif italic text-[#C254A7]">
        psicología
      </span>{" "}
      detrás de las relaciones.
    </>
  ) : (
    <>
      The{" "}
      <span className="font-serif italic text-[#C254A7]">
        psychology
      </span>{" "}
      behind relationships.
    </>
  )}
</h2>
            </div>

            <div className="grid border-t border-[#DAD7EE] md:grid-cols-2">
              {topics.map((topic) => (
                <article
                  key={topic.number}
                  className="border-b border-[#DAD7EE] py-10 md:px-10 md:odd:border-r md:odd:pl-0"
                >
                  <p className="mb-8 text-xs font-semibold tracking-[0.18em] text-[#C254A7]">
                    {topic.number}
                  </p>

                  <h3 className="text-3xl font-medium tracking-[-0.02em]">
                    {topic.title}
                  </h3>

                  <p className="mt-5 max-w-lg leading-7 text-[#565D78]">
                    {topic.description}
                  </p>

                  <Link
                    href={`/${locale}/blog`}
                    className="mt-7 inline-block text-sm font-semibold text-[#334B92] underline-offset-4 hover:underline"
                  >
                    {isSpanish ? "Explorar artículos →" : "Explore articles →"}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="bg-[#F0EDFF] text-[#17204A]">
          <div className="mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
              {isSpanish ? "Sigue leyendo" : "Keep exploring"}
            </p>

            <h2 className="text-4xl font-medium leading-tight sm:text-5xl">
              {isSpanish ? (
                <>
                  No necesitas una fórmula.
                  <br />
                  Necesitas{" "}
                  <span className="font-serif italic text-[#C254A7]">
                    mejores preguntas.
                  </span>
                </>
              ) : (
                <>
                  You don&apos;t need a formula.
                  <br />
                  You need{" "}
                  <span className="font-serif italic text-[#C254A7]">
                    better questions.
                  </span>
                </>
              )}
            </h2>

            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-[#565D78]">
              {isSpanish
                ? "Explora artículos sobre las situaciones, preguntas y patrones que aparecen cuando intentamos conectar con otras personas."
                : "Explore articles about the situations, questions, and patterns that appear when we try to connect with other people."}
            </p>

            <Link
              href={`/${locale}/blog`}
              className="mt-9 inline-block bg-[#334B92] px-7 py-4 text-sm font-medium text-white transition hover:opacity-90"
            >
              {isSpanish ? "Ir al Blog" : "Explore the Blog"}
            </Link>
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}