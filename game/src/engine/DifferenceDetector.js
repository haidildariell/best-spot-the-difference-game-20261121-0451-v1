// DifferenceDetector — the geometry of the hunt. A difference is a circle on the plate (centre
// plus a generous radius, so a click that lands on the changed object counts even when it is a
// few pixels off its heart). The detector answers the two questions the controller asks every
// click: is there a still-hidden difference here, and which hidden one is nearest a hint?

/** Euclidean distance between two points on the plate. */
export function distanceBetween(ax, ay, bx, by) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * The difference (from `candidates`) whose circle holds the point (x, y), preferring the closest
 * centre when circles overlap; null when the point lands on untouched artwork.
 */
export function differenceAtPoint(candidates, x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const difference of candidates) {
    const distance = distanceBetween(x, y, difference.x, difference.y);
    if (distance <= difference.radius && distance < bestDistance) {
      best = difference;
      bestDistance = distance;
    }
  }
  return best;
}

/** The candidate nearest to (x, y), whatever its distance; null for an empty list. */
export function nearestDifference(candidates, x, y) {
  let best = null;
  let bestDistance = Infinity;
  for (const difference of candidates) {
    const distance = distanceBetween(x, y, difference.x, difference.y);
    if (distance < bestDistance) {
      best = difference;
      bestDistance = distance;
    }
  }
  return best;
}
