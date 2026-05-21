import { useEffect, useRef, useState } from "react";
import { comments, siteContactMailHref } from "@/lib/site";
import { cn } from "@/lib/utils";

interface TwikooInitOptions {
  el: HTMLElement;
  envId: string;
  path: string;
  lang?: string;
  region?: string;
  onCommentLoaded?: () => void;
}

interface TwikooGlobal {
  init(options: TwikooInitOptions): void | Promise<void>;
}

declare global {
  interface Window {
    twikoo?: TwikooGlobal;
  }
}

let twikooLoader: Promise<TwikooGlobal> | null = null;

function loadTwikooScript(): Promise<TwikooGlobal> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Twikoo can only be loaded in the browser."));
  }

  if (window.twikoo) return Promise.resolve(window.twikoo);
  if (twikooLoader) return twikooLoader;

  twikooLoader = new Promise<TwikooGlobal>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${comments.twikoo.js}"]`,
    );

    if (existing && window.twikoo) {
      resolve(window.twikoo);
      return;
    }

    const script = existing ?? document.createElement("script");

    const onLoad = () => {
      if (window.twikoo) {
        resolve(window.twikoo);
      } else {
        reject(new Error("Twikoo loaded but the global object is missing."));
      }
    };

    const onError = () => reject(new Error("Failed to load Twikoo script."));

    script.addEventListener("load", onLoad, { once: true });
    script.addEventListener("error", onError, { once: true });

    if (!existing) {
      script.src = comments.twikoo.js;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }).catch((error) => {
    twikooLoader = null;
    throw error;
  });

  return twikooLoader;
}

export function TwikooComments({ pageKey }: { pageKey: string }) {
  return <TwikooCommentsPanel pageKey={pageKey} variant="article" />;
}

export function TwikooCommentsPanel({
  pageKey,
  variant = "article",
}: {
  pageKey: string;
  variant?: "article" | "note";
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let cancelled = false;

    async function mountComments() {
      if (!comments.enabled || !comments.twikoo.envId || !containerRef.current) {
        setStatus("error");
        return;
      }

      setStatus("loading");
      containerRef.current.replaceChildren();

      try {
        const twikoo = await loadTwikooScript();
        if (cancelled || !containerRef.current) return;

        await twikoo.init({
          el: containerRef.current,
          envId: comments.twikoo.envId,
          path: pageKey,
          lang: comments.twikoo.lang,
          region: comments.twikoo.region || undefined,
          onCommentLoaded: () => {
            if (!cancelled) setStatus("ready");
          },
        });
        if (!cancelled) setStatus("ready");
      } catch (error) {
        console.error("Twikoo 初始化失败：", error);
        if (!cancelled) setStatus("error");
      }
    }

    void mountComments();

    return () => {
      cancelled = true;
      containerRef.current?.replaceChildren();
    };
  }, [pageKey]);

  const articleVariant = variant === "article";

  return (
    <section
      className={cn(
        articleVariant
          ? "mt-12 border-y-[3px] border-double border-rule bg-paper/92 px-5 py-6 md:px-10 md:py-8 lg:px-14"
          : "mt-5 border-t border-dashed border-rule-soft/60 pt-5",
      )}
    >
      {articleVariant ? (
        <div className="flex items-end justify-between gap-3 border-b border-rule pb-3">
          <div>
            <p className="font-ui text-[12px] font-semibold uppercase text-stamp">
              Comments · 留言
            </p>
            <p className="mt-1 font-serif text-[14px] leading-[1.7] text-ink-muted">
              可以直接在这里留言，也可以通过邮件联系。
            </p>
          </div>
          <a
            href={siteContactMailHref}
            className="font-ui text-[12px] font-medium uppercase text-ink-muted transition-colors hover:text-stamp"
          >
            Email
          </a>
        </div>
      ) : null}

      <div className={cn(articleVariant ? "mt-6 min-h-[420px]" : "min-h-[320px]")}>
        <div ref={containerRef} className="twikoo-thread" />
        {status === "error" ? (
          <p className="font-serif text-[15px] leading-[1.8] text-ink-muted">
            评论系统暂时不可用。
          </p>
        ) : null}
      </div>
    </section>
  );
}
