import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PostCard } from "@/components/PostCard";
import { Pagination } from "@/components/Pagination";
import { buttonVariants } from "@/components/ui/button";
import type { Post } from "@/content/posts";
import { usePageParam } from "@/hooks/usePageParam";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 10;

interface PostCollectionPageProps {
  backLabel: string;
  backTo: string;
  description: string;
  emptyMessage: string;
  posts: Post[];
  kicker: string;
  title: string;
}

export function PostCollectionPage({
  backLabel,
  backTo,
  description,
  emptyMessage,
  posts,
  kicker,
  title,
}: PostCollectionPageProps) {
  const totalPages = Math.max(1, Math.ceil(posts.length / POSTS_PER_PAGE));
  const [page, setPage] = usePageParam(totalPages);
  const currentPagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="container py-10 md:py-14">
      <Link
        to={backTo}
        className="inline-flex items-center gap-1.5 font-ui text-[12px] font-medium uppercase text-ink-muted transition-colors hover:text-stamp"
      >
        <ArrowLeft className="h-3 w-3" />
        {backLabel}
      </Link>

      <div className="mt-6">
        <PageHeader kicker={kicker} title={title} description={description} />
      </div>

      <div className="mt-12 grid gap-x-8 gap-y-10 divide-y divide-rule-soft/40 md:grid-cols-2 md:divide-y-0 md:[&>article:nth-child(2n)]:border-l md:[&>article:nth-child(2n)]:border-rule-soft/40 md:[&>article:nth-child(2n)]:pl-8">
        {currentPagePosts.map((post) => (
          <PostCard key={post.slug} post={post} className="pt-8 md:pt-0" />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="mt-12 text-center">
          <p className="font-serif italic text-ink-muted">{emptyMessage}</p>
          <Link to="/" className={cn(buttonVariants({ variant: "secondary" }), "mt-4")}>
            回头版
          </Link>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}
