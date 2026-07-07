/**
 * 404 — 一只迷路的萤火虫。
 */
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-center justify-center px-5 text-center md:px-8">
      <p className="font-mono text-[64px] font-bold leading-none text-firefly">404</p>
      <p className="mt-6 text-[20px] text-ink-strong">这条小径没有通向任何地方。</p>
      <p className="mt-2 text-[14.5px] text-mist">
        也许链接写错了，也许那株植物已经移走了。
      </p>
      <Link
        to="/"
        className="pressable mt-8 rounded-full border border-firefly/50 px-6 py-2.5 text-[14.5px] text-firefly transition-colors duration-200 hover:bg-firefly hover:text-page"
      >
        回到花园
      </Link>
    </div>
  );
}
