import generated from "./generated/posts.json";

export interface Post {
  slug: string;
  title: string;
  date: string;
  author: string;
  description: string;
  categories: string[];
  tags: string[];
  cover?: string;
  html: string;
  readingMinutes: number;
  wordCount: number;
}

export const posts: Post[] = generated as Post[];

export interface CountEntry {
  name: string;
  count: number;
}

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllCategories(): CountEntry[] {
  return countTerms((post) => post.categories);
}

export function getAllTags(): CountEntry[] {
  return countTerms((post) => post.tags);
}

function countTerms(selectTerms: (post: Post) => string[]): CountEntry[] {
  const counts = new Map<string, number>();

  for (const post of posts) {
    for (const term of selectTerms(post)) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByCategory(name: string): Post[] {
  return posts.filter((p) => p.categories.includes(name));
}

export function getPostsByTag(name: string): Post[] {
  return posts.filter((p) => p.tags.includes(name));
}

export function getArchives(): { year: string; posts: Post[] }[] {
  const map = new Map<string, Post[]>();
  for (const p of posts) {
    const year = new Date(p.date).getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(p);
  }
  return Array.from(map.entries())
    .map(([year, ps]) => ({ year, posts: ps }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}
