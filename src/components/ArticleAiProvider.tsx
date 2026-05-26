import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { Languages, RefreshCw, Sparkles, X } from "lucide-react";
import { Kicker } from "@/components/Editorial";
import { Button } from "@/components/ui/button";
import {
  buildSelectionMessages,
  getSelectionActionLabel,
  toArticleAiErrorMessage,
  type ArticleAiAction,
  type ArticleAiDocument,
} from "@/lib/article-ai";
import { streamDeepSeekText } from "@/lib/deepseek";
import { cn } from "@/lib/utils";

interface SelectionAnchorRect {
  top: number;
  right: number;
  bottom: number;
  left: number;
  width: number;
  height: number;
}

interface SelectionPopoverState {
  action: ArticleAiAction;
  selectedText: string;
  surroundingText?: string;
  anchorRect: SelectionAnchorRect;
  status: "loading" | "ready" | "error";
  response: string;
  errorMessage: string;
}

interface RunSelectionActionOptions {
  action: ArticleAiAction;
  selectedText: string;
  surroundingText?: string;
  anchorRect: DOMRect | DOMRectReadOnly | SelectionAnchorRect;
}

interface ArticleAiContextValue {
  activeArticle: ArticleAiDocument | null;
  setActiveArticle: (article: ArticleAiDocument | null) => void;
  runSelectionAction: (options: RunSelectionActionOptions) => Promise<void>;
  closeSelectionPopover: () => void;
}

const ArticleAiContext = createContext<ArticleAiContextValue | null>(null);

export function ArticleAiProvider({ children }: { children: ReactNode }) {
  const [activeArticle, setActiveArticle] = useState<ArticleAiDocument | null>(null);
  const [selectionPopover, setSelectionPopover] = useState<SelectionPopoverState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const closeSelectionPopover = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSelectionPopover(null);
  }, []);

  const runSelectionAction = useCallback(
    async ({ action, selectedText, surroundingText, anchorRect }: RunSelectionActionOptions) => {
      if (!activeArticle) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const nextState: SelectionPopoverState = {
        action,
        selectedText,
        surroundingText,
        anchorRect: toAnchorRect(anchorRect),
        status: "loading",
        response: "",
        errorMessage: "",
      };

      setSelectionPopover(nextState);

      try {
        await streamDeepSeekText(
          {
            model: "deepseek-chat",
            temperature: action === "translate" ? 0.2 : 0.45,
            max_tokens: action === "translate" ? 220 : 320,
            signal: controller.signal,
            messages: buildSelectionMessages({
              article: activeArticle,
              action,
              selectedText,
              surroundingText,
            }),
          },
          (delta) => {
            setSelectionPopover((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                response: prev.response + delta,
              };
            });
          },
        );

        if (controller.signal.aborted) return;

        setSelectionPopover((prev) => {
          if (!prev) return prev;

          const response = prev.response.trim();
          if (!response) {
            return {
              ...prev,
              status: "error",
              errorMessage: "DeepSeek 没有返回可展示的内容。",
            };
          }

          return {
            ...prev,
            status: "ready",
            response,
          };
        });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;

        setSelectionPopover((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: "error",
            errorMessage: toArticleAiErrorMessage(error),
          };
        });
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [activeArticle],
  );

  useEffect(() => {
    if (!selectionPopover) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeSelectionPopover();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (panelRef.current?.contains(event.target as Node)) return;
      closeSelectionPopover();
    };

    const onViewportChange = () => closeSelectionPopover();

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("scroll", onViewportChange, true);
    window.addEventListener("resize", onViewportChange);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("scroll", onViewportChange, true);
      window.removeEventListener("resize", onViewportChange);
    };
  }, [closeSelectionPopover, selectionPopover]);

  useEffect(() => {
    if (activeArticle) return;
    closeSelectionPopover();
  }, [activeArticle, closeSelectionPopover]);

  const value = useMemo<ArticleAiContextValue>(
    () => ({
      activeArticle,
      setActiveArticle,
      runSelectionAction,
      closeSelectionPopover,
    }),
    [activeArticle, closeSelectionPopover, runSelectionAction],
  );

  return (
    <ArticleAiContext.Provider value={value}>
      {children}
      <SelectionAiPopover
        panelRef={panelRef}
        popover={selectionPopover}
        onClose={closeSelectionPopover}
        onRetry={() => {
          if (!selectionPopover) return Promise.resolve();
          return runSelectionAction(selectionPopover);
        }}
      />
    </ArticleAiContext.Provider>
  );
}

export function useArticleAi() {
  const context = useContext(ArticleAiContext);
  if (!context) {
    throw new Error("useArticleAi must be used inside ArticleAiProvider");
  }
  return context;
}

function SelectionAiPopover({
  panelRef,
  popover,
  onClose,
  onRetry,
}: {
  panelRef: RefObject<HTMLDivElement>;
  popover: SelectionPopoverState | null;
  onClose: () => void;
  onRetry: () => Promise<void>;
}) {
  if (!popover) return null;

  const style = getPopoverStyle(popover.anchorRect);
  const Icon = popover.action === "explain" ? Sparkles : Languages;

  return (
    <div className="pointer-events-none fixed inset-0 z-[140]">
      <div
        ref={panelRef}
        className={cn(
          "pointer-events-auto fixed w-[min(92vw,380px)] border border-rule bg-paper/95 shadow-[0_18px_60px_hsl(var(--ink)/0.16)] backdrop-blur-sm",
          "selection-popover-enter",
        )}
        style={style}
      >
        <div className="border-b border-rule bg-paper-soft/75 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Kicker variant="stamp">Selected Text</Kicker>
              <h3 className="mt-1 flex items-center gap-2 font-display text-[22px] font-semibold leading-[1.2] text-ink-strong">
                <Icon className="h-4 w-4 text-stamp" />
                {getSelectionActionLabel(popover.action)}
              </h3>
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center border border-rule-soft/40 text-ink-muted transition-colors hover:border-rule hover:text-ink-strong"
              onClick={onClose}
              aria-label="关闭划词浮层"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 border-l-2 border-stamp/45 pl-3 font-serif text-[14px] leading-[1.8] text-ink-body">
            “{popover.selectedText}”
          </p>
        </div>

        <div className="px-4 py-4">
          {popover.status !== "error" ? (
            <p
              className="whitespace-pre-wrap font-serif text-[15px] leading-[1.9] text-ink-body"
              aria-live="polite"
            >
              {popover.response}
              {popover.status === "loading" ? (
                <span className="ml-1 inline-block h-4 w-px animate-pulse bg-stamp align-[-1px]" />
              ) : null}
            </p>
          ) : null}

          {popover.status === "error" ? (
            <div aria-live="polite">
              <p className="font-serif text-[15px] leading-[1.9] text-ink-body">
                {popover.errorMessage}
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="mt-4"
                onClick={() => void onRetry()}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                重试
              </Button>
            </div>
          ) : null}
        </div>

        <div className="border-t border-rule-soft/35 bg-paper-warm/35 px-4 py-2.5">
          <p className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
            DeepSeek answers with this article as context
          </p>
        </div>
      </div>
    </div>
  );
}

function getPopoverStyle(anchorRect: SelectionAnchorRect): CSSProperties {
  const width = Math.min(window.innerWidth - 32, 380);
  const estimatedHeight = 260;
  const gap = 14;
  const left = clamp(
    anchorRect.left + anchorRect.width / 2 - width / 2,
    16,
    Math.max(16, window.innerWidth - width - 16),
  );
  const canFitBelow = anchorRect.bottom + gap + estimatedHeight <= window.innerHeight - 16;
  const top = canFitBelow
    ? anchorRect.bottom + gap
    : Math.max(16, anchorRect.top - estimatedHeight - gap);

  return {
    left,
    top,
  };
}

function toAnchorRect(rect: DOMRect | DOMRectReadOnly | SelectionAnchorRect): SelectionAnchorRect {
  return {
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
