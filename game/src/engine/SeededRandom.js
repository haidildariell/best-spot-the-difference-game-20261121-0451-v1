// SeededRandom — a tiny deterministic random source (mulberry32) plus the selection helpers the
// controller uses to pick which differences a round hides. A round is dealt from a seed, so the
// same seed always hides the same differences in the same order: handy for practice, for the
// screenshot stage directions, and for anyone who wants to replay a favourite plate.

/** Create a generator function returning floats in [0, 1) from a 32-bit seed. */
export function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A shuffled copy of `items` (Fisher–Yates driven by the given generator); the input is kept. */
export function shuffledCopy(items, nextRandom) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(nextRandom() * (i + 1));
    const held = copy[i];
    copy[i] = copy[j];
    copy[j] = held;
  }
  return copy;
}

/** `count` distinct items drawn from `items` in dealt order. */
export function pickDifferences(items, count, nextRandom) {
  return shuffledCopy(items, nextRandom).slice(0, count);
}
