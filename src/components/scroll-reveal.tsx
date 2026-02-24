"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: React.ReactNode;
  className?: string;
};

export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const { ref, isInView } = useInView({ threshold: 0.05 });

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={cn(
        className,
        "stagger-children",
        !isInView && "animate-paused"
      )}
    >
      {children}
    </div>
  );
}
