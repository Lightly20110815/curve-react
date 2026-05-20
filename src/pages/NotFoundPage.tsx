import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Kicker, Ornament } from "@/components/editorial";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <div className="container py-section text-center">
      <Kicker variant="stamp">404 · 失踪刊号</Kicker>
      <h1 className="mt-4 font-masthead text-[clamp(72px,15vw,200px)] font-black leading-[0.9] text-ink-strong">
        404
      </h1>
      <Ornament className="mx-auto my-6 max-w-md" />
      <p className="font-display text-[28px] italic text-ink-body">
        这条路走不通。
      </p>
      <p className="mt-3 font-serif text-[16px] text-ink-muted">
        要找的页面或许从未存在，或许只是迷路了。
      </p>
      <Link to="/" className={cn(buttonVariants({ size: "lg" }), "mt-10")}>
        <Home className="h-4 w-4" />
        回到头版
      </Link>
    </div>
  );
}
