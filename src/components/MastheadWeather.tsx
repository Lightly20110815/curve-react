import { useEffect, useState } from "react";
import { fetchLiveWeather, type WeatherLive } from "@/lib/weather";

type WeatherState =
  | { kind: "loading" }
  | { kind: "ready"; data: WeatherLive }
  | { kind: "error" };

const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let weatherCache: { at: number; data: WeatherLive | null } | null = null;

function stateFromCache(): WeatherState | null {
  if (!weatherCache || Date.now() - weatherCache.at >= CACHE_TTL) return null;
  return weatherCache.data ? { kind: "ready", data: weatherCache.data } : { kind: "error" };
}

/**
 * Masthead weather ornament.
 *
 * Renders the right-side nameplate ornament — a three-part block
 * (location · condition / rule / temperature · humidity) that mirrors the
 * left "创刊于 2025" ornament. Lives in the global masthead, which remounts on
 * every route change, so the live result is cached in-memory to avoid
 * re-hitting the Amap API on each navigation. While loading or on failure it
 * falls back to the original "编于某处" ornament text so the masthead never
 * looks broken.
 */
export function MastheadWeather({ className }: { className?: string }) {
  const [state, setState] = useState<WeatherState>(() => stateFromCache() ?? { kind: "loading" });

  useEffect(() => {
    if (stateFromCache()) return; // fresh cache already rendered on mount

    const controller = new AbortController();

    (async () => {
      try {
        const data = await fetchLiveWeather(controller.signal);
        if (controller.signal.aborted) return;
        weatherCache = { at: Date.now(), data };
        setState(data ? { kind: "ready", data } : { kind: "error" });
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        console.warn("MastheadWeather 加载实时天气失败：", error);
        weatherCache = { at: Date.now(), data: null };
        setState({ kind: "error" });
      }
    })();

    return () => controller.abort();
  }, []);

  const topLine =
    state.kind === "ready" ? `${state.data.city} · ${state.data.weather}` : "Somewhere · 编于某处";

  const bottomLine =
    state.kind === "ready"
      ? `${state.data.temperature}° · 湿${state.data.humidity}%`
      : state.kind === "loading"
        ? "观云测天"
        : "天气离线";

  return (
    <div className={className}>
      <span className="whitespace-nowrap font-ui text-[11px] font-medium uppercase tracking-[0.12em] text-ink-muted">
        {topLine}
      </span>
      <span className="block h-px w-10 bg-rule-soft/70" />
      <span className="whitespace-nowrap font-ui text-[11px] font-medium text-stamp">
        {bottomLine}
      </span>
    </div>
  );
}
