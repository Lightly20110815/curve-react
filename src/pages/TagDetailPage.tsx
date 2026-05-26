import { useParams } from "react-router-dom";
import { getPostsByTag, posts } from "@/content/posts";
import { PostCollectionPage } from "@/pages/PostCollectionPage";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";

export default function TagDetailPage() {
  const { name = "" } = useParams<{ name: string }>();
  const tagName = decodeURIComponent(name);
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);
  const taggedPosts = getPostsByTag(tagName, visiblePosts);

  return (
    <PostCollectionPage
      backLabel="All tags · 全部标签"
      backTo="/tags"
      description={`带此标签的共 ${taggedPosts.length} 篇文章`}
      emptyMessage="还没有带此标签的文章。"
      posts={taggedPosts}
      kicker={`TAG · #${tagName}`}
      title={`#${tagName}`}
    />
  );
}
