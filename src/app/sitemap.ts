import type { MetadataRoute } from "next";
import { getArticles } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const languages = ["en", "es"];

  const routes = [
    "",
    "/dating-psychology",
    "/blog",
    "/about",
    "/book",
  ];

  const staticPages = languages.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.8,
    }))
  );

  const articlePages = languages.flatMap((locale) =>
    getArticles(locale).map((article) => ({
      url: `${baseUrl}/${locale}/blog/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }))
  );

  return [...staticPages, ...articlePages];
}