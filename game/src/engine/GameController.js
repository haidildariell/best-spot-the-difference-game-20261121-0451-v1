// GameController — the rules of the cabinet. It deals each plate (seven of the scene's authored
// differences, chosen by seed), keeps the found set, the smudges, the clock and the score, runs
// the hint, and owns the particles and the loupe. It knows nothing about pixels on the stage:
// the renderer reads its state, and main.js feeds it clicks, keys and time.

import { createSeededRandom, pickDifferences } from './SeededRandom.js';
import { differenceAtPoint, nearestDifference } from './DifferenceDetector.js';

export const DIFFERENCES_PER_PLATE = 7;
export const PLATE_DURATION_SECONDS = 240;
export const HINTS_PER_PLATE = 3;
export const MISS_TIME_PENALTY_SECONDS = 3;
export const POINTS_PER_FIND = 100;
export const SMUDGE_PENALTY_POINTS = 15;

const SPARK_COLOURS = ['#f2c94c', '#fff3c4', '#37d99a', '#e8a33d'];
const CONFETTI_COLOURS = ['#f2c94c', '#37d99a', '#e8873d', '#c65b9e', '#7fb8d9'];

export class GameController {
  constructor(scenes, seedBase = 20261121) {
    this.scenes = scenes;
    this.seedBase = seedBase;
    this.dealCounter = 0;
    this.score = 0;
    this.completedPlates = new Set();
    this.loupe = { active: false, plate: 0, x: 304, y: 172 };
    this.particles = [];
    this.now = 0;
    this.startPlate(0);
  }

  /** The scene currently on the easel. */
  currentScene() {
    return this.scenes[this.sceneIndex];
  }

  /** Deal a plate: pick its seven differences by seed and reset the round state. */
  startPlate(sceneIndex) {
    this.sceneIndex = sceneIndex;
    this.dealCounter += 1;
    const seed = this.seedBase + sceneIndex * 131 + this.dealCounter * 7919;
    const random = createSeededRandom(seed);
    const scene = this.currentScene();
    this.chosen = pickDifferences(scene.differences, DIFFERENCES_PER_PLATE, random);
    this.alteredIds = new Set(this.chosen.map((difference) => difference.id));
    this.foundIds = new Set();
    this.foundOrder = [];
    this.mistakes = 0;
    this.hintsLeft = HINTS_PER_PLATE;
    this.plateDuration = PLATE_DURATION_SECONDS;
    this.timeLeft = PLATE_DURATION_SECONDS;
    this.status = 'playing';
    this.hintTarget = null;
    this.hintExpiresAt = 0;
    this.shakeTime = 0;
    this.shakePlate = 0;
    this.particles = [];
  }

  /** The differences still hiding on this plate. */
  unfoundDifferences() {
    return this.chosen.filter((difference) => !this.foundIds.has(difference.id));
  }

  foundCount() {
    return this.foundIds.size;
  }

  remainingCount() {
    return this.chosen.length - this.foundIds.size;
  }

  /** A burst of sparks (and, on a win, confetti) at a plate-art point. */
  burstParticles(x, y, kind, count) {
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 + (i % 3) * 0.35;
      const speed = kind === 'confetti' ? 40 + (i % 5) * 22 : 55 + (i % 4) * 26;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (kind === 'confetti' ? 46 : 8),
        life: kind === 'confetti' ? 1.5 : 0.55,
        maxLife: kind === 'confetti' ? 1.5 : 0.55,
        kind: kind === 'confetti' ? 'confetti' : 'spark',
        colour: kind === 'confetti' ? CONFETTI_COLOURS[i % CONFETTI_COLOURS.length] : SPARK_COLOURS[i % SPARK_COLOURS.length],
        spin: i * 1.7,
      });
    }
  }

  /** A soft expanding ring where a click found nothing. */
  rippleParticle(x, y) {
    this.particles.push({ x, y, vx: 0, vy: 0, life: 0.45, maxLife: 0.45, kind: 'ripple', colour: '#e8e4da', spin: 0 });
  }

  /**
   * Inspect a point (plate-art coordinates) on either plate. Returns 'found', 'won', 'miss' or
   * 'ignored'; main.js plays the matching sound.
   */
  inspect(x, y, plate) {
    if (this.status !== 'playing') return 'ignored';
    const hit = differenceAtPoint(this.unfoundDifferences(), x, y);
    if (hit === null) {
      this.mistakes += 1;
      this.score = Math.max(0, this.score - SMUDGE_PENALTY_POINTS);
      this.timeLeft = Math.max(0, this.timeLeft - MISS_TIME_PENALTY_SECONDS);
      this.shakeTime = 0.35;
      this.shakePlate = plate;
      this.rippleParticle(x, y);
      return 'miss';
    }
    this.foundIds.add(hit.id);
    this.foundOrder.push(hit.id);
    this.score += POINTS_PER_FIND;
    this.burstParticles(hit.x, hit.y, 'spark', 12);
    if (this.remainingCount() === 0) {
      this.status = 'won';
      this.completedPlates.add(this.sceneIndex);
      this.score += Math.ceil(this.timeLeft);
      this.burstParticles(200, 150, 'confetti', 22);
      this.burstParticles(408, 150, 'confetti', 22);
      return 'won';
    }
    return 'found';
  }

  /** Spend a hint: ring the hidden difference nearest the loupe for a few seconds. */
  useHint() {
    if (this.status !== 'playing' || this.hintsLeft <= 0) return null;
    const unfound = this.unfoundDifferences();
    if (unfound.length === 0) return null;
    const target = this.loupe.active
      ? nearestDifference(unfound, this.loupe.x, this.loupe.y)
      : unfound[0];
    this.hintTarget = target;
    this.hintExpiresAt = this.now + 2.6;
    this.hintsLeft -= 1;
    return target;
  }

  /** Move the loupe by a plate-art delta, hopping plates at the side edges. */
  moveLoupe(dx, dy) {
    const loupe = this.loupe;
    loupe.active = true;
    loupe.x += dx;
    loupe.y += dy;
    if (loupe.x < 0) {
      if (loupe.plate === 1) { loupe.plate = 0; loupe.x = 607; }
      else loupe.x = 0;
    }
    if (loupe.x > 607) {
      if (loupe.plate === 0) { loupe.plate = 1; loupe.x = 0; }
      else loupe.x = 607;
    }
    loupe.y = Math.max(0, Math.min(343, loupe.y));
  }

  /** Advance the clock, the shake and the particles by dt seconds; `t` is the stage clock. */
  update(dt, t) {
    this.now = t;
    if (this.status === 'playing') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.status = 'lost';
      }
    }
    if (this.shakeTime > 0) this.shakeTime = Math.max(0, this.shakeTime - dt);
    for (const particle of this.particles) {
      particle.life -= dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      if (particle.kind === 'confetti') {
        particle.vy += 130 * dt;
        particle.vx *= 0.99;
        particle.spin += dt * 7;
      }
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }

  /**
   * Stage a plate for a screenshot: deal it, mark the first `foundCount` dealt differences as
   * found, park the clock at a photogenic 2:37 and rest the loupe beside a hidden difference.
   */
  stageForScreenshot(sceneIndex, foundCount) {
    this.startPlate(sceneIndex);
    const toFind = this.chosen.slice(0, foundCount);
    for (const difference of toFind) {
      this.foundIds.add(difference.id);
      this.foundOrder.push(difference.id);
      this.score += POINTS_PER_FIND;
    }
    this.mistakes = 1;
    this.timeLeft = 157;
    const hidden = this.unfoundDifferences();
    if (hidden.length > 0) {
      // The loupe rests squarely on a still-hidden difference, magnifying it: the portrait of a
      // player in the very act of spotting one.
      const target = hidden[0];
      this.loupe = { active: true, plate: 1, x: target.x, y: target.y };
    }
  }
}
