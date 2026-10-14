import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/lib/blog";

export default function LatestArticles({
  locale,
  articles,
}: {
  locale: string;
  articles: Article[];
}) {
  const isSpanish = locale === "es";

  const latestArticles = articles.slice(0, 3);

  return (
    <section className="bg-white text-[#17204A]">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="mb-14 flex flex-col justify-between gap-6 border-b border-[#DAD7EE] pb-10 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#334B92]">
              {isSpanish ? "Lo más reciente del blog" : "Latest from the blog"}
            </p>

            <h2 className="max-w-2xl text-4xl font-medium tracking-[-0.02em] sm:text-5xl">
              {isSpanish
                ? "Psicología para las situaciones que realmente estás viviendo."
                : "Psychology for the situations you're actually living."}
            </h2>
          </div>

          <Link
            href={`/${locale}/blog`}
            className="text-sm font-semibold text-[#334B92] underline-offset-4 hover:underline"
          >
            {isSpanish ? "Ver todos los artículos →" : "View all articles →"}
          </Link>
        </div>

        {latestArticles.length === 0 ? (
          <p className="text-lg text-[#565D78]">
            {isSpanish
              ? "Los primeros artículos estarán disponibles próximamente."
              : "The first articles are coming soon."}
          </p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-3">
            {latestArticles.map((article) => (
              <article key={article.slug}>
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

                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#C254A7]">
                  {article.category}
                </p>

                <h3 className="text-2xl font-medium leading-snug tracking-[-0.02em]">
                  <Link
                    href={`/${locale}/blog/${article.slug}`}
                    className="hover:opacity-70"
                  >
                    {article.title}
                  </Link>
                </h3>

                <p className="mt-5 leading-7 text-[#565D78]">
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
  );
}