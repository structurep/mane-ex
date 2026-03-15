/**
 * Origami card primitives — barrel export.
 *
 * OrigamiCard: stacked-paper card with optional fold corner + hover lift
 * PaperSurface: foundational container (flat / raised / folded)
 * PaperFlat / PaperRaised: convenience aliases
 */

export { OrigamiCard } from "./origami-card";
export { PaperSurface } from "./paper-surface";

// Re-export badge primitives for convenience
export { BadgeFlag, BadgeSeal } from "./badge-flag";
