import Link from "next/link";

export default function Footer({ locale }: { locale: string }) {
  const isSpanish = locale === "es";

  return (
    <footer className="bg-[#17204A] text-[#F9F4F0]">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          <div>
            <p className="text-lg font-semibold tracking-[0.12em]">
              KRISTAL PASTOR
            </p>

            <p className="mt-3 max-w-sm text-sm leading-6 text-[#E2C4E8]">
              {isSpanish
                ? "Psicología basada en evidencia para entender el dating, las relaciones y la forma en que conectamos."
                : "Evidence-based psychology for understanding dating, relationships, and the way we connect."}
            </p>
          </div>

          <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm">
            <Link href={`/${locale}/dating-psychology`}>
              {isSpanish ? "Psicología del Dating" : "Dating Psychology"}
            </Link>

            <Link href={`/${locale}/blog`}>Blog</Link>

            <Link href={`/${locale}/book`}>
              {isSpanish ? "Libro" : "Book"}
            </Link>

            <Link href={`/${locale}/about`}>
              {isSpanish ? "Sobre mí" : "About"}
            </Link>

            <a
              href="https://www.tiktok.com/@xtalpastor"
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white"
            >
              TikTok ↗
            </a>
          </nav>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-4 border-t border-white/15 pt-6 text-xs text-[#D1AEDB] sm:flex-row">
          <p>© 2026 Kristal Pastor. All rights reserved.</p>

          <div className="flex gap-5">
            <span>{isSpanish ? "Privacidad: información disponible al solicitarla" : "Privacy information available upon request"}</span>
            
          </div>
        </div>
      </div>
    </footer>
  );
}