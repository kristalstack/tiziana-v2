import Link from "next/link";
export default function BookPreview({ locale }: { locale: string }) {
  const isSpanish = locale === "es";

  return (
    <section className="bg-[#F0EDFF] text-[#17204A]">
      <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
            {isSpanish ? "El libro" : "The book"}
          </p>

          <h2 className="max-w-xl text-4xl font-medium leading-tight tracking-[-0.02em] sm:text-5xl">
            {isSpanish ? (
              <>
                El libro que transforma preguntas en claridad{" "}
                <span className="font-serif italic text-[#C254A7]">
                  sobre el dating.
                </span>
              </>
            ) : (
              <>
                Turn questions into clarity{" "}
                <span className="font-serif italic text-[#C254A7]">
                  about dating.
                </span>
              </>
            )}
          </h2>
        </div>

        <div className="max-w-xl">
          <p className="text-lg leading-8 text-[#565D78]">
            {isSpanish
              ? "Aprendemos sobre relaciones a partir de nuestra familia, nuestras experiencias, películas, libros y redes sociales. Pero muy pocas veces aprendemos qué puede decirnos realmente la psicología sobre cómo elegimos, conectamos, nos comunicamos y construimos relaciones saludables."
              : "We learn about relationships from our families, our experiences, movies, books, and social media. But very few of us are ever taught what psychology can actually tell us about choosing, connecting, communicating, and building healthy relationships."}
          </p>

          <p className="mt-6 text-lg leading-8 text-[#565D78]">
            {isSpanish
              ? "Mi libro explora el dating desde la psicología basada en evidencia, sin fórmulas, manipulación ni etiquetas simplistas."
              : "My book explores dating through evidence-based psychology — without formulas, manipulation, or simplistic labels."}
          </p>

          <Link
  href={`/${locale}/book`}
  className="mt-9 inline-block bg-[#334B92] px-6 py-3.5 text-sm font-medium text-white transition hover:opacity-90"
>
  {isSpanish ? "Conoce el libro" : "Learn about the book"}
</Link>
        </div>
      </div>
    </section>
  );
}