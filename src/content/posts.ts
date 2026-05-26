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
  articleGPT: boolean;
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

export function getAllCategories(postList: Post[] = posts): CountEntry[] {
  return countTerms(postList, (post) => post.categories);
}

export function getAllTags(postList: Post[] = posts): CountEntry[] {
  return countTerms(postList, (post) => post.tags);
}

function countTerms(
  postList: Post[],
  selectTerms: (post: Post) => string[],
): CountEntry[] {
  const counts = new Map<string, number>();

  for (const post of postList) {
    for (const term of selectTerms(post)) {
      counts.set(term, (counts.get(term) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getPostsByCategory(name: string, postList: Post[] = posts): Post[] {
  return postList.filter((p) => p.categories.includes(name));
}

export function getPostsByTag(name: string, postList: Post[] = posts): Post[] {
  return postList.filter((p) => p.tags.includes(name));
}

export function getArchives(postList: Post[] = posts): { year: string; posts: Post[] }[] {
  const map = new Map<string, Post[]>();
  for (const p of postList) {
    const year = new Date(p.date).getFullYear().toString();
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(p);
  }
  return Array.from(map.entries())
    .map(([year, ps]) => ({ year, posts: ps }))
    .sort((a, b) => Number(b.year) - Number(a.year));
}
