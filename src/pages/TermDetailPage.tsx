/**
 * 标签 / 栏目详情 — 这块地里种了什么。
 */
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import { PageHeader } from "@/components/PageHeader";
import { PostRow } from "@/components/PostRow";
import { posts, getPostsByCategory, getPostsByTag } from "@/content/posts";
import { useAsOf } from "@/hooks/useAsOf";
import { filterByAsOf } from "@/lib/as-of";

export default function TermDetailPage({ kind }: { kind: "tag" | "category" }) {
  const { name = "" } = useParams<{ name: string }>();
  const decoded = decodeURIComponent(name);
  const { asOf } = useAsOf();
  const visiblePosts = filterByAsOf(posts, asOf);

  const matched =
    kind === "tag"
      ? getPostsByTag(decoded, visiblePosts)
      : getPostsByCategory(decoded, visiblePosts);

  const kindLabel = kind === "tag" ? "标签" : "栏目";

  return (
    <div>
      <PageHeader
        title={decoded}
        note={`${kindLabel}下共 ${matched.length} 篇文字。`}
      />
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="divide-y divide-line border-t border-line">
          {matched.map((p) => (
            <PostRow key={p.slug} post={p} />
          ))}
        </div>
        {matched.length === 0 && (
          <p className="text-[15px] text-mist">这块地暂时是空的。</p>
        )}
        <Link
          to="/tags"
          className="group mt-10 inline-flex items-center gap-1.5 text-[14.5px] text-firefly transition-colors hover:text-firefly-deep"
        >
          <ArrowLeft
            size={15}
            weight="bold"
            className="transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          回到花圃
        </Link>
      </div>
    </div>
  );
}
