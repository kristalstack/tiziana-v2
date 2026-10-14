export default function Intro({ locale }: { locale: string }) {
  const isSpanish = locale === "es";

  return (
    <section className="bg-[#334B92] text-[#F9F4F0]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
        <div>
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.22em] text-[#DAD7EE]">
            {isSpanish
              ? "Una forma diferente de pensar el dating"
              : "A different way to think about dating"}
          </p>

          <h2 className="max-w-xl text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">
            {isSpanish
              ? "Nadie nos enseñó cómo hacer dating."
              : "Nobody taught us how to date."}
          </h2>
        </div>

        <div className="max-w-xl space-y-6 text-lg leading-8 text-[#FBE8F8]">
          <p>
            {isSpanish
              ? "La mayoría aprendimos sobre amor y relaciones observando a nuestra familia, viviendo nuestras propias experiencias, viendo películas, leyendo libros y, ahora, consumiendo contenido en redes sociales."
              : "Most of us learned about love and relationships from our families, our own experiences, movies, books, and now social media."}
          </p>

          <p>
            {isSpanish
              ? "Pero el dating involucra procesos psicológicos reales: atracción, apego, expectativas, comunicación, límites, compatibilidad y la forma en que interpretamos el comportamiento de otras personas."
              : "But dating involves real psychological processes: attraction, attachment, expectations, communication, boundaries, compatibility, and the way we interpret other people's behavior."}
          </p>

          <p className="font-medium text-white">
            {isSpanish
              ? "Entender esos procesos no te dará una fórmula para el amor. Sí puede ayudarte a tomar decisiones más informadas, intencionales y saludables."
              : "Understanding those processes won't give you a formula for love. It can help you make more informed, intentional, and healthy choices."}
          </p>
        </div>
      </div>
    </section>
  );
}