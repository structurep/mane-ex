import Image from "next/image";
import { cn } from "@/lib/utils";

interface AvatarCircleProps {
  /** Image URL */
  src?: string | null;
  /** Fallback initials (1-2 characters) */
  initials?: string;
  /** Alt text for image */
  alt?: string;
  /** Pixel size. Defaults to 40 */
  size?: 24 | 32 | 36 | 40 | 48 | 56 | 64;
  className?: string;
}

const sizeClasses: Record<number, string> = {
  24: "h-6 w-6 text-[10px]",
  32: "h-8 w-8 text-xs",
  36: "h-9 w-9 text-xs",
  40: "h-10 w-10 text-sm",
  48: "h-12 w-12 text-sm",
  56: "h-14 w-14 text-base",
  64: "h-16 w-16 text-lg",
};

/**
 * Avatar with image or initials fallback.
 * Uses next/image for optimized loading when src is provided.
 */
export function AvatarCircle({
  src,
  initials,
  alt = "",
  size = 40,
  className,
}: AvatarCircleProps) {
  const sizeClass = sizeClasses[size] ?? sizeClasses[40];

  if (src) {
    return (
      <div
        className={cn(
          "relative shrink-0 overflow-hidden rounded-full",
          sizeClass,
          className
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground",
        sizeClass,
        className
      )}
    >
      {initials || "?"}
    </span>
  );
}
