import { useParams } from "react-router-dom";
import { getPostsByCategory } from "@/content/posts";
import { PostCollectionPage } from "@/pages/PostCollectionPage";

export default function CategoryDetailPage() {
  const { name = "" } = useParams<{ name: string }>();
  const categoryName = decodeURIComponent(name);
  const categoryPosts = getPostsByCategory(categoryName);

  return (
    <PostCollectionPage
      backLabel="All sections · 所有版块"
      backTo="/categories"
      description={`本版共 ${categoryPosts.length} 篇文章`}
      emptyMessage="本版尚未有文章。"
      posts={categoryPosts}
      kicker={`SECTION · ${categoryName}`}
      title={categoryName}
    />
  );
}
