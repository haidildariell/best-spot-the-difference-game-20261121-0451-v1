// DualCanvasRenderer — paints the whole cabinet stage each frame: the desk backdrop, the header
// (via HudOverlay), the two plates side by side, the found markers, the hint ring, the particles
// and the synchronised loupe. Each plate is first painted onto its own offscreen canvas by the
// scene's draw function — the original with no differences applied, the copy with all of them —
// so the loupe can magnify a plate and the markers can be stamped identically on both.

import { HudOverlay } from '../ui/HudOverlay.js';
import { glowDot, roundedRectPath, verticalGradient } from './ProceduralTextures.js';

export const STAGE_WIDTH = 1280;
export const STAGE_HEIGHT = 480;
export const ART_WIDTH = 608;
export const ART_HEIGHT = 344;

/** The two plate frames on the stage: captions on top, artwork inside an 8px mat. */
export const PLATES = [
  { x: 16, y: 58, w: 616, h: 384, artX: 20, artY: 90, caption: 'THE ORIGINAL PLATE' },
  { x: 648, y: 58, w: 616, h: 384, artX: 652, artY: 90, caption: 'THE RESTORED COPY' },
];

const NO_DIFFERENCES = new Set();

/** Convert a stage point to { plate, x, y } in plate-art coordinates, or null outside the art. */
export function artPointFromStage(stageX, stageY) {
  for (let plate = 0; plate < PLATES.length; plate += 1) {
    const frame = PLATES[plate];
    const x = stageX - frame.artX;
    const y = stageY - frame.artY;
    if (x >= 0 && x < ART_WIDTH && y >= 0 && y < ART_HEIGHT) return { plate, x, y };
  }
  return null;
}

/** The stage rectangle of a plate-art point (for drawing markers and rings). */
export function stagePointFromArt(plate, x, y) {
  const frame = PLATES[plate];
  return { x: frame.artX + x, y: frame.artY + y };
}

export class DualCanvasRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hud = new HudOverlay();
    this.plateCanvases = [0, 1].map(() => {
      const plate = document.createElement('canvas');
      plate.width = ART_WIDTH;
      plate.height = ART_HEIGHT;
      return plate;
    });
    this.plateContexts = this.plateCanvases.map((plate) => plate.getContext('2d'));
  }

  /** Paint one plate's artwork into its offscreen canvas. */
  paintPlate(index, scene, alteredIds, t) {
    const ctx = this.plateContexts[index];
    ctx.clearRect(0, 0, ART_WIDTH, ART_HEIGHT);
    ctx.save();
    scene.draw(ctx, alteredIds, t);
    ctx.restore();
  }

  /** A found marker: a hand-drawn gold ring with an emerald echo and a sparkle at its crown. */
  drawFoundMarker(ctx, cx, cy, radius, t, order) {
    const pulse = 1 + Math.sin(t * 3 + order * 1.1) * 0.045;
    const r = radius * pulse;
    ctx.save();
    ctx.strokeStyle = 'rgba(20,12,4,0.45)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(cx + 1.5, cy + 2, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#f2c94c';
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#37d99a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, r - 4.4, 0, Math.PI * 2);
    ctx.stroke();
    const sparkle = 4 + Math.sin(t * 4 + order) * 1.4;
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r - sparkle - 3);
    ctx.lineTo(cx + 2.4, cy - r - 2);
    ctx.lineTo(cx, cy - r + sparkle - 1);
    ctx.lineTo(cx - 2.4, cy - r - 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /** The loupe: a magnifying ring on the hovered plate, a plain twin ring on the other. */
  drawLoupe(ctx, game, plateIndex, artX, artY, t) {
    const frame = PLATES[plateIndex];
    const cx = frame.artX + artX;
    const cy = frame.artY + artY;
    const radius = 30;
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    const zoom = 1.7;
    const sourceSize = (radius * 2) / zoom;
    ctx.drawImage(
      this.plateCanvases[plateIndex],
      artX - sourceSize / 2, artY - sourceSize / 2, sourceSize, sourceSize,
      cx - radius, cy - radius, radius * 2, radius * 2,
    );
    ctx.restore();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240,225,180,0.9)';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(cx, cy, radius - 3.4, 0, Math.PI * 2);
    ctx.stroke();
    // The twin ring on the other plate, at the mirrored spot.
    const twin = PLATES[1 - plateIndex];
    const tx = twin.artX + artX;
    const ty = twin.artY + artY;
    ctx.strokeStyle = 'rgba(242,201,76,0.75)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.arc(tx, ty, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.strokeStyle = 'rgba(242,201,76,0.9)';
    ctx.beginPath();
    ctx.moveTo(tx - 8, ty);
    ctx.lineTo(tx + 8, ty);
    ctx.moveTo(tx, ty - 8);
    ctx.lineTo(tx, ty + 8);
    ctx.stroke();
    void t;
  }

  /** Sparkles, confetti and miss-ripples, drawn on both plates at once. */
  drawParticles(ctx, game) {
    for (const particle of game.particles) {
      const lifeRatio = particle.life / particle.maxLife;
      for (let plate = 0; plate < 2; plate += 1) {
        const { x, y } = stagePointFromArt(plate, particle.x, particle.y);
        ctx.save();
        ctx.globalAlpha = Math.max(0, lifeRatio);
        if (particle.kind === 'ripple') {
          ctx.strokeStyle = '#e8e4da';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(x, y, (1 - lifeRatio) * 26 + 4, 0, Math.PI * 2);
          ctx.stroke();
        } else if (particle.kind === 'confetti') {
          ctx.fillStyle = particle.colour;
          ctx.translate(x, y);
          ctx.rotate(particle.spin);
          ctx.fillRect(-3, -2, 6, 4);
        } else {
          ctx.fillStyle = particle.colour;
          ctx.beginPath();
          ctx.arc(x, y, 2.2 * lifeRatio + 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  /** The end-of-plate ribbon: celebration when restored, a quiet note when time runs out. */
  drawPlateBanner(ctx, game, t) {
    if (game.status === 'playing') return;
    ctx.save();
    ctx.fillStyle = 'rgba(16,11,6,0.45)';
    ctx.fillRect(PLATES[0].artX, PLATES[0].artY, ART_WIDTH * 2 + 24, ART_HEIGHT);
    const cx = STAGE_WIDTH / 2;
    const cy = 250;
    ctx.fillStyle = '#f3e9d2';
    roundedRectPath(ctx, cx - 250, cy - 44, 500, 88, 12);
    ctx.fill();
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#33240f';
    ctx.font = 'bold 27px Georgia, serif';
    if (game.status === 'won') {
      const bounce = Math.sin(t * 3) * 1.5;
      ctx.fillText('✦ Plate Restored! ✦', cx, cy - 2 + bounce);
      ctx.font = '15px Georgia, serif';
      ctx.fillStyle = '#6b5320';
      ctx.fillText(`All ${game.chosen.length} differences found — press N for the next plate`, cx, cy + 24);
    } else {
      ctx.fillText('The Light Fades…', cx, cy - 2);
      ctx.font = '15px Georgia, serif';
      ctx.fillStyle = '#6b5320';
      ctx.fillText('Time ran out on this plate — press R to try it again', cx, cy + 24);
    }
    ctx.restore();
  }

  /** Paint the whole stage for the current game state at time `t` (seconds). */
  drawFrame(game, t) {
    const ctx = this.ctx;
    const scene = game.currentScene();
    this.paintPlate(0, scene, NO_DIFFERENCES, t);
    this.paintPlate(1, scene, game.alteredIds, t);
    // Desk backdrop and outer frame.
    verticalGradient(ctx, 0, 0, STAGE_WIDTH, STAGE_HEIGHT, [[0, '#241a10'], [0.6, '#1a120a'], [1, '#120c06']]);
    ctx.strokeStyle = 'rgba(201,162,39,0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, STAGE_WIDTH - 8, STAGE_HEIGHT - 8);
    this.hud.drawHeader(ctx, game, t);
    // Plates.
    for (let plate = 0; plate < 2; plate += 1) {
      const frame = PLATES[plate];
      ctx.save();
      if (game.shakeTime > 0 && plate === game.shakePlate) {
        ctx.translate(Math.sin(t * 70) * 2.4 * game.shakeTime, 0);
      }
      ctx.fillStyle = '#0e0b08';
      roundedRectPath(ctx, frame.x - 3, frame.y - 3, frame.w + 6, frame.h + 6, 10);
      ctx.fill();
      ctx.fillStyle = plate === 0 ? '#2c2115' : '#15222c';
      roundedRectPath(ctx, frame.x, frame.y, frame.w, frame.h, 8);
      ctx.fill();
      ctx.fillStyle = '#e9dfc6';
      ctx.font = 'bold 13px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(frame.caption, frame.x + frame.w / 2, frame.y + 17);
      ctx.fillStyle = plate === 0 ? '#8fb8a8' : '#e8a33d';
      ctx.font = '10px Georgia, serif';
      ctx.fillText(plate === 0 ? '· untouched ·' : '· spot what the restorer changed ·', frame.x + frame.w / 2, frame.y + 30);
      ctx.drawImage(this.plateCanvases[plate], frame.artX, frame.artY);
      ctx.strokeStyle = 'rgba(201,162,39,0.5)';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(frame.artX - 1, frame.artY - 1, ART_WIDTH + 2, ART_HEIGHT + 2);
      ctx.restore();
    }
    // Found markers on both plates.
    game.foundOrder.forEach((id, order) => {
      const difference = scene.differences.find((entry) => entry.id === id);
      if (!difference) return;
      for (let plate = 0; plate < 2; plate += 1) {
        const { x, y } = stagePointFromArt(plate, difference.x, difference.y);
        this.drawFoundMarker(ctx, x, y, Math.max(15, difference.radius * 0.82), t, order);
      }
    });
    // Hint ring: a breathing radar circle around one hidden difference, on both plates.
    if (game.hintTarget && t < game.hintExpiresAt) {
      const difference = game.hintTarget;
      for (let plate = 0; plate < 2; plate += 1) {
        const { x, y } = stagePointFromArt(plate, difference.x, difference.y);
        const ring = 20 + Math.sin(t * 5) * 5;
        ctx.strokeStyle = 'rgba(120,220,255,0.9)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.arc(x, y, ring, 0, Math.PI * 2);
        ctx.stroke();
        glowDot(ctx, x, y, 12, 'rgba(120,220,255,0.35)', 'rgba(200,240,255,0.8)');
      }
    }
    this.drawParticles(ctx, game);
    if (game.loupe.active && game.status === 'playing') {
      this.drawLoupe(ctx, game, game.loupe.plate, game.loupe.x, game.loupe.y, t);
    }
    this.hud.drawFooter(ctx, game, t);
    this.drawPlateBanner(ctx, game, t);
  }
}
