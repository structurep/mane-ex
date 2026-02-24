import confetti from 'canvas-confetti';

/** Offer accepted — gold/forest/red celebration */
export function celebrateSuccess() {
  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#C9A84C', '#3B8C5A', '#E10600'],
    disableForReducedMotion: true,
    decay: 0.92,
    ticks: 60,
  });
}

/** Listing published — subtle gold burst */
export function celebrateGold() {
  confetti({
    particleCount: 50,
    spread: 45,
    origin: { y: 0.7 },
    colors: ['#C9A84C', '#DFC068', '#B89A3F'],
    disableForReducedMotion: true,
    decay: 0.92,
    ticks: 50,
  });
}
