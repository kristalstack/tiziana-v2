"use client";
import TizianaName from "./TizianaName";


import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Header({
  locale,
  translationSlug,
}: {
  locale: string;
  translationSlug?: string;
}) {
  const isSpanish = locale === "es";
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  function getLanguagePath(newLocale: string) {
    const segments = pathname.split("/");

    const isArticle =
      segments[2] === "blog" &&
      segments.length >= 4 &&
      translationSlug;

    if (isArticle) {
      return `/${newLocale}/blog/${translationSlug}`;
    }

    if (segments[1] === "en" || segments[1] === "es") {
      segments[1] = newLocale;
    }

    return segments.join("/") || `/${newLocale}`;
  }

  return (
    <header className="tiziana-site-header absolute left-0 top-0 z-30 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <Link
          href={`/${locale}`}
          className="text-lg font-semibold tracking-[0.12em] text-[#17204A]"
          onClick={() => setIsOpen(false)}
        >
          KRISTAL PASTOR
        </Link>

        {/* DESKTOP MENU */}
        <nav className="hidden items-center gap-8 text-sm text-[#17204A] md:flex">
          <Link href={`/${locale}/dating-psychology`}>
            {isSpanish ? "Psicología del Dating" : "Dating Psychology"}
          </Link>

          <Link href={`/${locale}/blog`}>
            Blog
          </Link>

          <span className="tiziana-nav-cta"><TizianaName locale={locale}/> ✦</span>

          <Link href={`/${locale}/book`}>
            {isSpanish ? "Libro" : "Book"}
          </Link>

          <Link href={`/${locale}/about`}>
            {isSpanish ? "Sobre mí" : "About"}
          </Link>

          <span className="ml-2 border-l border-[#DAD7EE] pl-6">
            <Link
              href={getLanguagePath("en")}
              className={locale === "en" ? "font-semibold" : ""}
            >
              EN
            </Link>

            <span className="mx-2 text-[#916F97]">/</span>

            <Link
              href={getLanguagePath("es")}
              className={locale === "es" ? "font-semibold" : ""}
            >
              ES
            </Link>
          </span>
        </nav>

        {/* MOBILE BUTTON */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center md:hidden"
          onClick={() => setIsOpen((value) => !value)}
          aria-label={isSpanish ? "Abrir menú" : "Open menu"}
          aria-expanded={isOpen}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 top-0 h-[1.5px] w-6 bg-[#17204A] transition ${
                isOpen ? "translate-y-[7px] rotate-45" : ""
              }`}
            />

            <span
              className={`absolute left-0 top-[7px] h-[1.5px] w-6 bg-[#17204A] transition ${
                isOpen ? "opacity-0" : ""
              }`}
            />

            <span
              className={`absolute left-0 top-[14px] h-[1.5px] w-6 bg-[#17204A] transition ${
                isOpen ? "-translate-y-[7px] -rotate-45" : ""
              }`}
            />
          </span>
        </button>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="border-t border-[#DAD7EE] bg-[#F9F4F0] px-6 py-8 md:hidden">
          <nav className="flex flex-col gap-6 text-lg text-[#17204A]">
            <Link
              href={`/${locale}/dating-psychology`}
              onClick={() => setIsOpen(false)}
            >
              {isSpanish ? "Psicología del Dating" : "Dating Psychology"}
            </Link>

            <Link
              href={`/${locale}/blog`}
              onClick={() => setIsOpen(false)}
            >
              Blog
            </Link>

            <span onClick={() => setIsOpen(false)}><TizianaName locale={locale}/> ✦</span>

            <Link
              href={`/${locale}/book`}
              onClick={() => setIsOpen(false)}
            >
              {isSpanish ? "Libro" : "Book"}
            </Link>

            <Link
              href={`/${locale}/about`}
              onClick={() => setIsOpen(false)}
            >
              {isSpanish ? "Sobre mí" : "About"}
            </Link>

            <div className="mt-2 border-t border-[#DAD7EE] pt-6 text-sm">
              <Link
                href={getLanguagePath("en")}
                className={locale === "en" ? "font-semibold" : ""}
                onClick={() => setIsOpen(false)}
              >
                EN
              </Link>

              <span className="mx-3 text-[#916F97]">/</span>

              <Link
                href={getLanguagePath("es")}
                className={locale === "es" ? "font-semibold" : ""}
                onClick={() => setIsOpen(false)}
              >
                ES
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}