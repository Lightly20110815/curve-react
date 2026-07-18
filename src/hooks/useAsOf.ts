import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseAsOfParam } from "@/lib/as-of";

export interface AsOfState {
  /** Canonical YYYY-MM-DD when active, else null. */
  asOf: string | null;
  isActive: boolean;
  /** Remove the as-of param without disturbing other query params. */
  exit: () => void;
}

export function useAsOf(): AsOfState {
  const [params, setParams] = useSearchParams();
  const raw = params.get("as-of");
  const asOf = useMemo(() => parseAsOfParam(raw), [raw]);

  const exit = useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("as-of");
        return next;
      },
      { replace: true },
    );
  }, [setParams]);

  return { asOf, isActive: asOf !== null, exit };
}
