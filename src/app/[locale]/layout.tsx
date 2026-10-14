import PrivateTizianaGate from "@/components/PrivateTizianaGate";
import { notFound } from "next/navigation";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (locale !== "en" && locale !== "es") {
    notFound();
  }

  return <div data-locale={locale}><PrivateTizianaGate locale={locale}>{children}</PrivateTizianaGate></div>;
}