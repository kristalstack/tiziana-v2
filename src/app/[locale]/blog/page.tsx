import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArticles, getArticlesByCategory } from "@/lib/blog";
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
      ? "Blog de psicología del dating | Kristal Pastor"
      : "Dating Psychology Journal | Kristal Pastor",
    description: isSpanish
      ? "Artículos sobre atracción, comunicación, apego, compatibilidad y psicología aplicada al dating moderno."
      : "Articles about attraction, communication, attachment, compatibility, and psychology applied to modern dating.",
    alternates: {
      canonical: `/${locale}/blog`,
      languages: {
        en: "/en/blog",
        es: "/es/blog",
      },
    },
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const isSpanish = locale === "es";

  const articles = category
    ? getArticlesByCategory(locale, category)
    : getArticles(locale);

  return (
    <>
      <Header locale={locale} />

      <main>
        <section className="bg-[#F9F4F0] text-[#17204A]">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 pb-20 pt-40 lg:grid-cols-[1.1fr_0.9fr] lg:px-10 lg:pb-24 lg:pt-48">
            <div>
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
                {isSpanish ? "Blog" : "Dating Psychology Journal"}
              </p>

              <h1 className="max-w-4xl text-[2.8rem] font-medium leading-[1.04] tracking-[-0.03em] sm:text-6xl lg:text-7xl">
                {isSpanish ? (
                  <>
                    Psicología para entender mejor{" "}
                    <span className="font-serif italic text-[#C254A7]">
                      cómo conectamos.
                    </span>
                  </>
                ) : (
                  <>
                    Psychology for understanding{" "}
                    <span className="font-serif italic text-[#C254A7]">
                      how we connect.
                    </span>
                  </>
                )}
              </h1>

              <p className="mt-8 max-w-2xl text-lg leading-8 text-[#565D78]">
                {isSpanish
                  ? "Artículos sobre atracción, comunicación, apego, compatibilidad y las situaciones que aparecen en el dating moderno."
                  : "Articles about attraction, communication, attachment, compatibility, and the situations that appear in modern dating."}
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[400px] sm:max-w-[480px]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
  src="/kristal pastor_1.png"
  alt="Kristal Pastor"
  fill
  priority
  sizes="(max-width: 768px) 100vw, 430px"
  className="object-cover object-[center]"
/>
              </div>

              <p className="mt-4 text-xs uppercase tracking-[0.16em] text-[#916F97]">
                {isSpanish
                  ? "Kristal Pastor · Psicóloga y escritora"
                  : "Kristal Pastor · Psychologist & Writer"}
              </p>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-24">
            {articles.length === 0 ? (
              <p className="text-lg text-[#565D78]">
                {isSpanish
                  ? "Todavía no hay artículos disponibles en esta categoría."
                  : "There are no articles available in this category yet."}
              </p>
            ) : (
              <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => (
                  <article
                    key={article.slug}
                    className="border-t border-[#DAD7EE] pt-7"
                  >
                    {article.image && (
                      <Link href={`/${locale}/blog/${article.slug}`}>
                        <div className="relative mb-7 aspect-[16/10] overflow-hidden">
                          <Image
                            src={article.image}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition duration-300 hover:scale-[1.02]"
                          />
                        </div>
                      </Link>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs">
  <span className="font-semibold uppercase tracking-[0.18em] text-[#C254A7]">
    {article.category}
  </span>

  <span className="text-[#916F97]">·</span>

  <time dateTime={article.date} className="text-[#916F97]">
    {new Intl.DateTimeFormat(isSpanish ? "es" : "en", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(article.date + "T00:00:00Z"))}
  </time>
</div>

                    <h2 className="mt-5 text-2xl font-medium leading-snug tracking-[-0.02em] text-[#17204A]">
                      <Link
                        href={`/${locale}/blog/${article.slug}`}
                        className="hover:opacity-70"
                      >
                        {article.title}
                      </Link>
                    </h2>

                    <p className="mt-4 leading-7 text-[#565D78]">
                      {article.description}
                    </p>

                    <Link
                      href={`/${locale}/blog/${article.slug}`}
                      className="mt-7 inline-block text-sm font-semibold text-[#334B92] underline-offset-4 hover:underline"
                    >
                      {isSpanish ? "Leer artículo →" : "Read article →"}
                    </Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer locale={locale} />
    </>
  );
}