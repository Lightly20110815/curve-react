/**
 * 访客留言 — Twikoo 评论，融进花园的皮。
 */
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

export function TwikooComments({
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
          ? "mt-16 rounded-2xl border border-line bg-surface/60 p-6 md:p-8"
          : "mt-6 border-t border-line pt-6",
      )}
    >
      {articleVariant && (
        <div className="mb-6 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-[18px] font-bold text-ink-strong">访客留言</h2>
            <p className="mt-1 text-[13.5px] text-mist">
              路过说句话也好，安静看看也好。
            </p>
          </div>
          <a
            href={siteContactMailHref}
            className="shrink-0 text-[13px] text-firefly transition-colors hover:text-firefly-deep"
          >
            写邮件
          </a>
        </div>
      )}

      <div className={articleVariant ? "min-h-[360px]" : "min-h-[280px]"}>
        <div ref={containerRef} className="twikoo-thread" />
        {status === "error" && (
          <p className="text-[14.5px] leading-relaxed text-mist">
            留言板暂时没搭好，可以先写邮件给我。
          </p>
        )}
      </div>
    </section>
  );
}
