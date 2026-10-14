import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getArticle } from "@/lib/blog";
import type { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = getArticle(locale, slug);

  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,

    alternates: {
  canonical: `/${locale}/blog/${article.slug}`,
  languages: {
    en: `/en/blog/${
      locale === "en" ? article.slug : article.translationSlug
    }`,
    es: `/es/blog/${
      locale === "es" ? article.slug : article.translationSlug
    }`,
  },
},

    openGraph: {
      title: article.title,
      description: article.description,
      type: "article",
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}) {
  const { locale, slug } = await params;
  const article = getArticle(locale, slug);

  if (!article) {
    notFound();
  }

  const isSpanish = locale === "es";

  return (
    <>
      <Header
        locale={locale}
        translationSlug={article.translationSlug}
      />

      <main className="bg-[#F9F4F0] text-[#17204A]">
        <article>
          <header className="mx-auto max-w-5xl px-6 pb-16 pt-40 lg:px-10 lg:pb-20 lg:pt-48">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C254A7]">
              {article.category}
            </p>

            <h1 className="mt-6 text-5xl font-medium leading-[1.05] tracking-[-0.03em] sm:text-6xl">
              {article.title}
            </h1>

            <p className="mt-7 max-w-3xl text-xl leading-9 text-[#565D78]">
              {article.description}
            </p>

            <div className="mt-8 flex gap-3 text-sm text-[#916F97]">
              <span>{article.author}</span>
              <span>·</span>
              <time dateTime={article.date}>
  {new Intl.DateTimeFormat(isSpanish ? "es" : "en", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(article.date + "T00:00:00Z"))}
</time>
            </div>
          </header>

          {article.image && (
            <div className="mx-auto max-w-5xl px-6 pb-16 lg:px-10 lg:pb-20">
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 960px"
                  className="object-cover"
                />
              </div>
            </div>
          )}

          <div className="border-t border-[#DAD7EE] bg-white">
            <div
              className="
                mx-auto max-w-3xl px-6 py-16
                text-[18px] leading-8 text-[#3F3E3A]
                lg:px-0 lg:py-20

                [&_h2]:mb-5
                [&_h2]:mt-14
                [&_h2]:text-3xl
                [&_h2]:font-medium
                [&_h2]:leading-tight
                [&_h2]:tracking-[-0.02em]

                [&_h3]:mb-8
                [&_h3]:mt-6
                [&_h3]:text-xs
                [&_h3]:font-semibold
                [&_h3]:uppercase
                [&_h3]:tracking-[0.2em]
                [&_h3]:text-[#334B92]

                [&_p]:my-6

                [&_strong]:font-semibold
                [&_strong]:text-[#17204A]

                [&_a]:font-semibold
                [&_a]:text-[#334B92]
                [&_a]:underline
                [&_a]:underline-offset-4
                [&_a]:transition
                hover:[&_a]:opacity-70

                [&_hr]:my-14
                [&_hr]:border-0
                [&_hr]:border-t
                [&_hr]:border-[#DAD7EE]
              "
            >
              <MDXRemote source={article.content} />
            </div>
          </div>

          <div className="bg-[#F0EDFF]">
            <div className="mx-auto max-w-3xl px-6 py-16 text-center">
              <p className="text-lg text-[#565D78]">
                {isSpanish
                  ? "Continúa explorando la psicología detrás del dating y las relaciones."
                  : "Keep exploring the psychology behind dating and relationships."}
              </p>

              <Link
  href={`/${locale}/blog`}
  className="mt-7 inline-block text-sm font-semibold text-[#334B92] underline-offset-4 hover:underline"
>
  {isSpanish ? "← Volver al blog" : "← Back to the blog"}
</Link>
            </div>
          </div>
        </article>
      </main>

      <Footer locale={locale} />
    </>
  );
}