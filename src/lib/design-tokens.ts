/**
 * ManeExchange — Soft Precision Design Tokens
 *
 * Use these when you need color/spacing values in JS/TS
 * (e.g., Framer Motion, Chart.js, dynamic inline styles).
 *
 * For Tailwind class usage, reference the class names directly:
 *   bg-bronze, text-ink-mid, shadow-lift, etc.
 */

export const colors = {
  // Paper & Ground
  cloud:     "#F6F4F0",
  washi:     "#EDE8DF",
  parchment: "#F0ECE4",
  linen:     "#FAF8F5",
  warmwhite: "#FEFDFB",
  stable:    "#F5F2EC",

  // Rose Bronze — Brand Signature
  bronze: {
    DEFAULT: "#B07A6E",
    deep:    "#8E5E54",
    muted:   "#C9A098",
    light:   "#E0C4BE",
  },

  // Nature
  sage: {
    DEFAULT: "#7A9B7E",
    soft:    "#A8C4AA",
    muted:   "#C5D8C7",
  },
  leather: {
    DEFAULT: "#8B6E52",
    soft:    "#B8986E",
    muted:   "#D4BFA0",
  },
  blush: {
    DEFAULT: "#C4A09A",
    soft:    "#DCC4BE",
  },
  dusk: {
    DEFAULT: "#8B7B9B",
    soft:    "#B8AEC4",
  },
  earth: {
    DEFAULT: "#9B8870",
    soft:    "#C4B49C",
  },

  // Ink
  ink: {
    DEFAULT: "#1C1B18",
    dark:    "#2E2D28",
    mid:     "#5A5750",
    soft:    "#8A8078",
    faint:   "#B8B0A0",
    ghost:   "#D8D3C8",
  },
} as const;

export const shadows = {
  rest:   "0 1px 3px rgba(28,27,24,0.04), 0 1px 2px rgba(28,27,24,0.03)",
  fold:   "0 4px 12px rgba(28,27,24,0.06), 0 2px 4px rgba(28,27,24,0.04)",
  lift:   "0 12px 32px rgba(28,27,24,0.08), 0 4px 8px rgba(28,27,24,0.04)",
  hover:  "0 20px 48px rgba(28,27,24,0.10), 0 8px 16px rgba(28,27,24,0.05)",
  bronze: "0 8px 24px rgba(176,122,110,0.12), 0 2px 6px rgba(176,122,110,0.08)",
} as const;

export const spacing = {
  xs:  "4px",
  sm:  "8px",
  md:  "16px",
  lg:  "32px",
  xl:  "48px",
  "2xl": "64px",
  "3xl": "96px",
  "4xl": "128px",
} as const;

export const fonts = {
  display: '"Cormorant Garamond", Georgia, serif',
  body:    '"DM Sans", system-ui, sans-serif',
} as const;

export const radii = {
  sm:   "4px",
  md:   "8px",
  lg:   "16px",
  xl:   "24px",
  pill: "999px",
} as const;

/** Semantic color mapping for card variants */
export const cardVariants = {
  standard:  { glass: "glass",         accent: null },
  featured:  { glass: "glass-bronze",  accent: "from-bronze to-bronze-light" },
  verified:  { glass: "glass-sage",    accent: "from-sage to-sage-soft" },
  heritage:  { glass: "glass-leather", accent: "from-leather to-leather-soft" },
  favorites: { glass: "glass-blush",   accent: "from-blush to-blush-soft" },
} as const;

/** Semantic color mapping for alerts */
export const alertVariants = {
  info:    { bar: "bg-bronze",         title: "text-bronze-deep", bg: "rgba(176,122,110,0.04)" },
  success: { bar: "bg-sage",           title: "text-sage",        bg: "rgba(122,155,126,0.04)" },
  warning: { bar: "bg-leather",        title: "text-leather",     bg: "rgba(139,110,82,0.04)" },
  error:   { bar: "bg-[#B07070]",      title: "text-[#B07070]",   bg: "rgba(176,112,112,0.04)" },
} as const;
