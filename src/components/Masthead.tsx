import { useState, useEffect } from "react";
import { getDeepSeekText, trimGeneratedText } from "@/lib/deepseek";
import { MastheadWeather } from "@/components/MastheadWeather";
import { cn } from "@/lib/utils";
import { formatMastheadDate, formatIssueSeason } from "@/lib/han-date";

interface Props {
  issueNo: number;
  className?: string;
}

function DeepSeekTagline() {
  const [fullText, setFullText] = useState("");
  const [displayText, setDisplayText] = useState("");

  // Typewriter effect
  useEffect(() => {
    if (!fullText) return;
    let i = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      setDisplayText(fullText.substring(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(timer);
      }
    }, 150); // 150ms delay per character
    return () => clearInterval(timer);
  }, [fullText]);

  // Fetch AI text
  useEffect(() => {
    let cancelled = false;

    async function fetchTagline() {
      try {
        const content = await getDeepSeekText({
          messages: [
            {
              role: "system",
              content: "你是一个文艺网站的副标题生成器。请写一句简短、优美、有文艺气息的句子，适合作为博客的副标题。字数控制在15字以内。不需要标点符号结尾。不要包含任何解释。",
            },
          ],
          temperature: 0.8,
          max_tokens: 30,
        });

        if (content && !cancelled) {
          setFullText(trimGeneratedText(content));
        } else if (!cancelled) {
          setFullText("用代码与文字搭起来的家");
        }
      } catch (e) {
        console.warn("Failed to fetch DeepSeek tagline, using fallback.", e);
        if (!cancelled) {
          setFullText("用代码与文字搭起来的家");
        }
      }
    }

    fetchTagline();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-[2px]">
      {displayText}
      <span className="inline-block h-[1em] w-[1.5px] animate-[pulse_1s_ease-in-out_infinite] bg-stamp/80 align-middle opacity-80" />
    </span>
  );
}

function DynamicMastheadTitle() {
  const INITIAL_TITLE = "The Curve Times";
  const [targetText, setTargetText] = useState("");
  const [displayText, setDisplayText] = useState(INITIAL_TITLE);
  const [phase, setPhase] = useState<"waiting" | "deleting" | "typing" | "done">("waiting");

  // Fetch AI title
  useEffect(() => {
    let cancelled = false;

    async function fetchTitle() {
      try {
        const content = await getDeepSeekText({
          messages: [
            {
              role: "system",
              content: "You are generating a masthead title for a literary/coding blog. Generate a short, poetic English phrase (exactly 3 to 5 words). Do not use Chinese. Do not use punctuation at the end. Do not explain.",
            },
          ],
          temperature: 0.9,
          max_tokens: 15,
        });

        if (content && !cancelled) {
          setTargetText(trimGeneratedText(content));
        } else if (!cancelled) {
          setTargetText(INITIAL_TITLE);
        }
      } catch (e) {
        console.warn("Failed to fetch DeepSeek title, using fallback.", e);
        if (!cancelled) {
          setTargetText(INITIAL_TITLE);
        }
      }
    }

    fetchTitle();

    return () => {
      cancelled = true;
    };
  }, []);

  // Animation sequence
  useEffect(() => {
    if (!targetText) return; // Wait until fetch completes

    if (targetText === INITIAL_TITLE && phase === "waiting") {
      setPhase("done"); // Skip animation if fallback is identical
      return;
    }

    let timer: number;

    if (phase === "waiting") {
      // Pause 1.5 seconds before starting to delete
      timer = window.setTimeout(() => setPhase("deleting"), 1500);
    } else if (phase === "deleting") {
      if (displayText.length > 0) {
        timer = window.setTimeout(() => setDisplayText((prev) => prev.slice(0, -1)), 60); // fast delete
      } else {
        timer = window.setTimeout(() => setPhase("typing"), 300); // pause slightly when empty
      }
    } else if (phase === "typing") {
      if (displayText.length < targetText.length) {
        timer = window.setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, 120); // typing speed
      } else {
        setPhase("done");
      }
    }

    return () => clearTimeout(timer);
  }, [targetText, phase, displayText]);

  return (
    <span className="inline-flex items-center">
      {displayText}
      {phase !== "done" && (
        <span className="ml-[2px] inline-block h-[0.7em] w-[clamp(4px,0.6vw,8px)] animate-[pulse_1s_ease-in-out_infinite] bg-ink-strong align-middle" />
      )}
    </span>
  );
}

/**
 * The Curve Times masthead.
 *
 * Layout uses a 3-column grid (side · title · side) so the side ornaments
 * never overlap the centered nameplate at any breakpoint. The title is a
 * non-interactive heading — navigation to home is handled by the Nav bar
 * below the masthead instead, per editor's request.
 */
export function Masthead({ issueNo, className }: Props) {
  const today = new Date();
  return (
    <header className={cn("border-b border-rule/85", className)}>
      {/* Edition strip */}
      <div className="border-b border-rule-soft/55">
        <div className="container flex flex-wrap items-center justify-between gap-x-4 py-1 font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted md:text-[12px]">
          <span>VOL. I · No. {String(issueNo).padStart(3, "0")}</span>
          <span className="hidden font-serif text-[13px] font-medium normal-case text-ink-body md:block">
            {formatMastheadDate(today)}
          </span>
          <span>Free Edition · 免费发行</span>
        </div>
      </div>

      {/* Nameplate — 3-column grid keeps ornaments out of the title's path */}
      <div className="container py-3 md:py-4">
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-[minmax(112px,1fr)_auto_minmax(112px,1fr)] md:gap-5">
          {/* Left ornament */}
          <div className="hidden flex-col items-start justify-center gap-1 md:flex">
            <span className="font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
              {formatIssueSeason(today)}
            </span>
            <span className="block h-px w-10 bg-rule-soft/70" />
            <span className="font-ui text-[11px] font-medium text-stamp">创刊于 2025</span>
          </div>

          {/* Title — non-interactive */}
          <div className="text-center">
            <h1 className="font-masthead text-[clamp(30px,6.8vw,68px)] font-black leading-none text-ink-strong text-glow-masthead sm:whitespace-nowrap">
              <DynamicMastheadTitle />
            </h1>
            <p className="mt-1 font-serif text-[clamp(14px,1.4vw,17px)] font-medium text-stamp text-glow-sub">
              曲線時報
            </p>
          </div>

          {/* Right ornament — live weather, mirrors the left "创刊于 2025" block */}
          <MastheadWeather className="hidden flex-col items-end justify-center gap-1 md:flex" />
        </div>
      </div>

      {/* Tagline strap */}
      <div className="border-t border-rule-soft/55">
        <div className="container py-1 text-center font-serif text-[12px] text-ink-muted transition-opacity duration-1000 md:text-[13px]">
          <DeepSeekTagline />
        </div>
      </div>
    </header>
  );
}
