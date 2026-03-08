/** Offer accepted — gold/forest/green celebration */
export async function celebrateSuccess() {
  const confetti = (await import('canvas-confetti')).default;
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#C4A265', '#2D6A4F', '#1B4332'],
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
    colors: ['#C4A265', '#D4B37A', '#B39355'],
    disableForReducedMotion: true,
    decay: 0.92,
    ticks: 50,
  });
}
