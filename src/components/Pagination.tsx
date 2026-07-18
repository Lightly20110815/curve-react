import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { hanNumber } from "@/lib/han-date";

interface Props {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
  /** Custom label for the unit shown after "第 X 卷". Defaults to "卷". */
  unitLabel?: string;
}

/**
 * Newspaper-style pagination.
 *
 * - Prev / Next slabs with thick ink borders on the outside
 * - Center shows page number cluster: 1 · 2 · [3] · 4 · 5 with ellipsis for big runs
 * - Hides itself when totalPages <= 1 (nothing to paginate)
 */
export function Pagination({ page, totalPages, onChange, className, unitLabel = "页" }: Props) {
  if (totalPages <= 1) return null;

  const pages = computePageList(page, totalPages);
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <nav
      aria-label="pagination"
      className={cn(
        "mt-section flex flex-col items-center gap-4 border-y-[3px] border-double border-rule py-6",
        className,
      )}
    >
      <p className="font-ui text-[12px] font-semibold uppercase text-ink-muted">
        Pagination · 翻 {unitLabel}
      </p>

      <div className="flex w-full max-w-3xl items-stretch justify-between gap-2">
        <PageButton disabled={!canPrev} onClick={() => onChange(page - 1)} variant="edge">
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Prev</span>
        </PageButton>

        <ul className="flex flex-1 items-center justify-center gap-1">
          {pages.map((p, i) => (
            <li key={`${p}-${i}`}>
              {p === "…" ? (
                <span className="px-2 font-mono text-[12px] text-ink-faded">…</span>
              ) : (
                <button
                  type="button"
                  onClick={() => onChange(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 min-w-9 items-center justify-center px-2 font-display text-[16px] transition-colors",
                    p === page
                      ? "border-b-2 border-stamp font-bold text-stamp"
                      : "text-ink-body hover:text-stamp",
                  )}
                >
                  {p}
                </button>
              )}
            </li>
          ))}
        </ul>

        <PageButton disabled={!canNext} onClick={() => onChange(page + 1)} variant="edge">
          <span>Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </PageButton>
      </div>

      <p className="font-ui text-[12px] font-medium uppercase text-ink-faded">
        第 {hanNumber(page)} {unitLabel} · 共 {hanNumber(totalPages)} {unitLabel}
      </p>
    </nav>
  );
}

function PageButton({
  children,
  onClick,
  disabled,
  variant = "edge",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "edge";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 border-2 px-4 py-2 font-ui text-[12px] font-semibold uppercase transition-colors",
        variant === "edge" && "border-ink text-ink hover:bg-ink hover:text-paper",
        "disabled:cursor-not-allowed disabled:border-rule-soft/40 disabled:text-ink-faded disabled:hover:bg-transparent disabled:hover:text-ink-faded",
      )}
    >
      {children}
    </button>
  );
}

/**
 * Build a compact page list like [1, '…', 4, 5, 6, '…', 12].
 */
function computePageList(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push("…");
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < total - 1) pages.push("…");
  pages.push(total);
  return pages;
}
