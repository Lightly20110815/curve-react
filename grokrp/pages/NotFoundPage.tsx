import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFoundPage() {
  return (
    <div className="container py-section text-center">
      <h1 className="font-masthead text-[clamp(72px,15vw,200px)] font-black leading-[0.9] text-ink-strong">
        404
      </h1>
      <p className="mt-6 font-serif text-[18px] text-ink-body">
        没有这个页面。
      </p>
      <Link to="/" className={cn(buttonVariants({ size: "lg" }), "mt-10")}>
        <Home className="h-4 w-4" />
        回到头版
      </Link>
    </div>
  );
}
