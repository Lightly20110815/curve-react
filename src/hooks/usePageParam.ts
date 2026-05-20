import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * Page index synced to the `?page=N` URL search param.
 *
 * - 1-based to match user-facing "第 X 页" semantics
 * - Page 1 omits the param to keep URLs clean on the first page
 * - Returns a clamped page (so a bad URL never crashes the page)
 */
export function usePageParam(totalPages: number, defaultPage = 1) {
  const [params, setParams] = useSearchParams();
  const raw = parseInt(params.get("page") ?? "", 10);
  const requested = Number.isFinite(raw) && raw > 0 ? raw : defaultPage;
  const page = Math.min(Math.max(1, requested), Math.max(1, totalPages));

  const setPage = useCallback(
    (p: number) => {
      const clamped = Math.min(Math.max(1, p), Math.max(1, totalPages));
      const next = new URLSearchParams(params);
      if (clamped <= 1) next.delete("page");
      else next.set("page", String(clamped));
      setParams(next, { replace: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [params, setParams, totalPages],
  );

  return [page, setPage] as const;
}
