import fs from "fs";
import path from "path";
import matter from "gray-matter";

export type Article = {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  author: string;
  image: string;
  translationSlug: string;
};

const contentDirectory = path.join(process.cwd(), "content");

export function getArticles(locale: string): Article[] {
  const articlesDirectory = path.join(
    contentDirectory,
    locale,
    "articles"
  );

  if (!fs.existsSync(articlesDirectory)) {
    return [];
  }

  const files = fs
    .readdirSync(articlesDirectory)
    .filter((file) => file.endsWith(".mdx"));

  const articles = files.map((file) => {
    const filePath = path.join(articlesDirectory, file);
    const source = fs.readFileSync(filePath, "utf8");
    const { data } = matter(source);

    return {
      slug: data.slug || file.replace(/\.mdx$/, ""),
      title: data.title,
      description: data.description,
      category: data.category,
      date: data.date,
      author: data.author,
      image: data.image,
      translationSlug: data.translationSlug,
    };
  });

  return articles.sort(
    (a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getArticle(locale: string, slug: string) {
  const articlesDirectory = path.join(
    contentDirectory,
    locale,
    "articles"
  );

  if (!fs.existsSync(articlesDirectory)) {
    return null;
  }

  const files = fs
    .readdirSync(articlesDirectory)
    .filter((file) => file.endsWith(".mdx"));

  for (const file of files) {
    const filePath = path.join(articlesDirectory, file);
    const source = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(source);

    const articleSlug =
      data.slug || file.replace(/\.mdx$/, "");

    if (articleSlug === slug) {
      return {
        slug: articleSlug,
        title: data.title,
        description: data.description,
        category: data.category,
        date: data.date,
        author: data.author,
        image: data.image,
        translationSlug: data.translationSlug,
        content,
      };
    }
  }

  return null;
}

export function getArticlesByCategory(
  locale: string,
  category: string
): Article[] {
  return getArticles(locale).filter(
    (article) =>
      article.category.toLowerCase() === category.toLowerCase()
  );
}