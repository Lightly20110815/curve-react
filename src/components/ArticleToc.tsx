/**
 * 文章目录 — xl 以上屏幕挂在正文右侧的安静一列。
 *
 * - 从渲染后的 DOM 提取带 id 的 h2/h3（rehype-slug 构建期生成）
 * - IntersectionObserver 追踪当前所在小节
 * - 点击平滑滚动
 */
import { useEffect, useState, type RefObject } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

const HEADING_SELECTOR = "h2[id], h3[id]";

export function ArticleToc({
  containerRef,
  contentKey,
}: {
  containerRef: RefObject<HTMLElement>;
  contentKey: string;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      setHeadings([]);
      return;
    }
    const nodes = Array.from(
      container.querySelectorAll<HTMLHeadingElement>(HEADING_SELECTOR),
    );
    setHeadings(
      nodes.map((node) => ({
        id: node.id,
        text: (node.textContent ?? "").trim(),
        level: Number(node.tagName.slice(1)) || 2,
      })),
    );
  }, [containerRef, contentKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || headings.length === 0) return;

    const nodes = headings
      .map((h) => container.querySelector<HTMLHeadingElement>(`#${CSS.escape(h.id)}`))
      .filter((n): n is HTMLHeadingElement => n !== null);

    // 记录每个标题是否已越过视口上三分之一，取最后一个越过者
    const passed = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          passed.set(
            (entry.target as HTMLElement).id,
            entry.boundingClientRect.top < window.innerHeight * 0.34,
          );
        }
        let current: string | null = nodes[0]?.id ?? null;
        for (const node of nodes) {
          if (passed.get(node.id)) current = node.id;
        }
        setActiveId(current);
      },
      { rootMargin: "-34% 0px -60% 0px", threshold: [0, 1] },
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, [containerRef, headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="文章目录" className="space-y-0.5">
      <p className="mb-3 font-mono text-[11px] tracking-wider text-mist">目录</p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          className={cn(
            "block border-l py-1.5 text-[13px] leading-snug transition-colors duration-200",
            h.level === 3 ? "pl-6" : "pl-3.5",
            activeId === h.id
              ? "border-firefly text-firefly"
              : "border-line text-mist hover:text-ink",
          )}
        >
          {h.text}
        </a>
      ))}
    </nav>
  );
}
