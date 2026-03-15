import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import type { QualificationBadge } from "@/lib/buyer/qualification-score";

const CONFIG: Record<QualificationBadge, {
  Icon: typeof Shield;
  bg: string;
  text: string;
  label: string;
}> = {
  "Qualified Buyer": { Icon: ShieldCheck, bg: "bg-gold/10", text: "text-gold", label: "Qualified Buyer" },
  "Verified Buyer": { Icon: Shield, bg: "bg-blue/10", text: "text-blue", label: "Verified Buyer" },
  "Unverified": { Icon: ShieldAlert, bg: "bg-ink-black/5", text: "text-ink-faint", label: "Unverified" },
};

type BuyerBadgeProps = {
  badge: QualificationBadge;
  className?: string;
  /** Show full label or just icon */
  compact?: boolean;
};

export function BuyerBadge({ badge, className, compact = false }: BuyerBadgeProps) {
  const c = CONFIG[badge];
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold",
      c.bg, c.text,
      className
    )}>
      <c.Icon className="h-3 w-3" />
      {!compact && c.label}
    </span>
  );
}
