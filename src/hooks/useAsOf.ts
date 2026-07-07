import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseAsOfParam } from "@/lib/as-of";

export interface AsOfState {
  /** 激活时为规范 YYYY-MM-DD，否则 null。 */
  asOf: string | null;
  isActive: boolean;
  /** 移除 as-of 参数，保留其他 query。 */
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
