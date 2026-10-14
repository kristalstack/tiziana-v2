import Link from "next/link";

export default function Topics({ locale }: { locale: string }) {
  const isSpanish = locale === "es";

  const topics = isSpanish
    ? [
        {
          number: "01",
          title: "Atracción y conexión",
          description:
            "Por qué nos sentimos atraídos por ciertas personas, cómo se desarrolla la atracción y qué ayuda realmente a construir conexión.",
        },
        {
          number: "02",
          title: "Apego y patrones",
          description:
            "Cómo las experiencias pasadas, el apego, las expectativas y los patrones repetidos influyen en la forma en que hacemos dating.",
        },
        {
          number: "03",
          title: "Comunicación",
          description:
            "Cómo entender la ambigüedad, las expectativas, las conversaciones difíciles, las señales emocionales y una comunicación saludable.",
        },
        {
          number: "04",
          title: "Límites",
          description:
            "Cómo identificar tus límites, comunicarlos con claridad y reconocer si están siendo respetados.",
        },
        {
          number: "05",
          title: "Compatibilidad",
          description:
            "Cómo mirar más allá de la química para entender valores, metas, necesidades, estilos de vida y compatibilidad a largo plazo.",
        },
        {
          number: "06",
          title: "Dating moderno",
          description:
            "Apps, ghosting, atención inconsistente, mensajes, incertidumbre y la psicología detrás del dating actual.",
        },
      ]
    : [
        {
          number: "01",
          title: "Attraction & Connection",
          description:
            "Why we feel drawn to certain people, how attraction develops, and what actually helps connection grow.",
        },
        {
          number: "02",
          title: "Attachment & Patterns",
          description:
            "How past experiences, attachment, expectations, and repeated patterns influence the way we date.",
        },
        {
          number: "03",
          title: "Communication",
          description:
            "Understanding ambiguity, expectations, difficult conversations, emotional signals, and what healthy communication looks like.",
        },
        {
          number: "04",
          title: "Boundaries",
          description:
            "How to identify your limits, communicate them clearly, and recognize whether they are being respected.",
        },
        {
          number: "05",
          title: "Compatibility",
          description:
            "Looking beyond chemistry to understand values, goals, needs, lifestyles, and long-term relationship fit.",
        },
        {
          number: "06",
          title: "Modern Dating",
          description:
            "Apps, ghosting, inconsistent attention, texting, uncertainty, and the psychology behind today's dating environment.",
        },
      ];

  return (
    <section className="bg-[#F9F4F0] text-[#17204A]">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-10 border-b border-[#DAD7EE] pb-14 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
              {isSpanish
                ? "Explora la psicología del dating"
                : "Explore Dating Psychology"}
            </p>

            <h2 className="max-w-lg text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">
              {isSpanish ? (
                <>
                  Entiende qué sucede{" "}
                  <span className="font-serif italic text-[#C254A7]">
                    debajo de la superficie.
                  </span>
                </>
              ) : (
                <>
                  Understand what is happening{" "}
                  <span className="font-serif italic text-[#C254A7]">
                    beneath the surface.
                  </span>
                </>
              )}
            </h2>
          </div>

          <div className="max-w-2xl lg:pt-10">
            <p className="text-lg leading-8 text-[#565D78]">
              {isSpanish
                ? "El dating no es un solo proceso psicológico. Es una combinación de atracción, expectativas, comunicación, apego, compatibilidad, límites, incertidumbre y toma de decisiones."
                : "Dating is not one psychological process. It is a combination of attraction, expectations, communication, attachment, compatibility, boundaries, uncertainty, and decision-making."}
            </p>

            <p className="mt-5 text-lg leading-8 text-[#565D78]">
              {isSpanish
                ? "Explora la psicología detrás de las situaciones que vivimos al conocer, elegir y construir relaciones."
                : "Explore the psychology behind the situations people experience while meeting, choosing, and building relationships."}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <article
              key={topic.number}
              className="group border-b border-[#DAD7EE] py-10 md:px-8 md:first:pl-0 lg:min-h-[290px] lg:border-r lg:last:border-r-0"
            >
              <p className="mb-12 text-xs font-semibold tracking-[0.18em] text-[#C254A7]">
                {topic.number}
              </p>

              <h3 className="text-2xl font-medium tracking-[-0.02em] transition group-hover:text-[#C254A7]">
                {topic.title}
              </h3>

              <p className="mt-5 max-w-sm leading-7 text-[#565D78]">
                {topic.description}
              </p>

              <Link
  href={`/${locale}/blog?category=${encodeURIComponent(topic.title)}`}
  className="mt-8 inline-block text-sm font-semibold text-[#334B92] underline-offset-4 hover:underline"
>
  {isSpanish ? "Explorar tema →" : "Explore topic →"}
</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}