/** Offer accepted — gold/forest/green celebration */
export async function celebrateSuccess() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#BF9530', '#8B5E3C', '#5C3D27'],
    disableForReducedMotion: true,
    decay: 0.92,
    ticks: 60,
  });
}

/** Listing published — subtle gold burst */
export async function celebrateGold() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 50,
    spread: 45,
    origin: { y: 0.7 },
    colors: ['#BF9530', '#C4A07A', '#8B5E3C'],
    disableForReducedMotion: true,
    decay: 0.92,
    ticks: 50,
  });
}
