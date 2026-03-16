import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-200 outline-none hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-bronze/20 focus-visible:ring-offset-2 focus-visible:ring-offset-cloud disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-bronze text-warmwhite shadow-rest hover:bg-bronze-deep hover:shadow-bronze-glow",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "bg-transparent text-bronze-deep border-[1.5px] border-bronze-muted hover:bg-bronze/5 hover:border-bronze",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-rest",
        ghost:
          "bg-transparent text-ink-mid hover:text-bronze-deep hover:bg-transparent",
        link: "text-bronze underline-offset-4 hover:underline hover:translate-y-0",
        dark:
          "bg-ink text-stable hover:bg-ink-dark shadow-rest hover:shadow-folded",
        sage:
          "bg-sage text-warmwhite hover:bg-sage/80 shadow-rest hover:shadow-folded",
        leather:
          "bg-leather text-stable hover:bg-leather/80 shadow-rest hover:shadow-folded",
      },
      size: {
        default: "h-9 px-7 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 px-3 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 px-5 py-2 text-xs has-[>svg]:px-2.5",
        lg: "h-10 px-9 py-4 text-base has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
