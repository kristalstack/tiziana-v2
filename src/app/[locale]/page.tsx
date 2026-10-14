import TizianaExperience from "@/components/TizianaExperience";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import Topics from "@/components/Topics";
import LatestArticles from "@/components/LatestArticles";
import BookPreview from "@/components/BookPreview";
import AboutPreview from "@/components/AboutPreview";
import Newsletter from "@/components/Newsletter";
import Footer from "@/components/Footer";
import { getArticles } from "@/lib/blog";
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
  ? "Psicología del dating | Kristal Pastor"
  : "Dating Psychology | Kristal Pastor",

    description: isSpanish
      ? "Psicología basada en evidencia para entender el dating, las relaciones y los patrones detrás de cómo conectamos."
      : "Evidence-based psychology for understanding dating, relationships, and the patterns behind how we connect.",

    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        es: "/es",
      },
    },

    openGraph: {
      title: isSpanish
        ? "Kristal Pastor | Psicología del Dating"
        : "Kristal Pastor | Dating Psychology",

      description: isSpanish
        ? "Psicología basada en evidencia para entender el dating, las relaciones y cómo conectamos."
        : "Evidence-based psychology for understanding dating, relationships, and how we connect.",

      type: "website",
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const articles = getArticles(locale);

  return (
    <>
      <Header locale={locale} />

      <main>
        <AboutPreview locale={locale} />
        <Hero locale={locale} />
        <Intro locale={locale} />
        <Topics locale={locale} />
        <TizianaExperience locale={locale} />
        <BookPreview locale={locale} />
        <Newsletter locale={locale} />
        <LatestArticles locale={locale} articles={articles} />
      </main>

      <Footer locale={locale} />
    </>
  );
}