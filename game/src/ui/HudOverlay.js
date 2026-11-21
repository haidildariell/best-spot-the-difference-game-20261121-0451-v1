// HudOverlay — everything the player reads around the plates: the cabinet's name, the current
// plate's title, the plate selector pips, the great brass counter of differences remaining, the
// clock, the hint pill and the footer of controls. The counter is deliberately the largest text
// on the stage after the title: it is the number the whole game turns on.

import { roundedRectPath } from '../render/ProceduralTextures.js';

/** The clickable hint pill in the header; main.js hit-tests pointer taps against it. */
export const HINT_BUTTON_RECT = { x: 858, y: 13, w: 108, h: 24 };

/** Format a number of seconds as m:ss for the clock. */
export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

export class HudOverlay {
  /** The header band: title left, plate name and pips centre, the counter right. */
  drawHeader(ctx, game, t) {
    const scene = game.currentScene();
    ctx.save();
    // Title block.
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f2c94c';
    ctx.font = 'bold 21px Georgia, serif';
    ctx.fillText('CHRONICLE OF CURIOSITIES', 20, 31);
    ctx.fillStyle = '#b8a888';
    ctx.font = 'italic 11px Georgia, serif';
    ctx.fillText('a spot-the-difference cabinet — five plates, seven changes apiece', 20, 49);
    // Plate name and selector pips.
    ctx.textAlign = 'center';
    ctx.fillStyle = '#e9dfc6';
    ctx.font = 'bold 16px Georgia, serif';
    ctx.fillText(`${scene.plate} — ${scene.title}`, 640, 28);
    for (let index = 0; index < game.scenes.length; index += 1) {
      const px = 640 + (index - (game.scenes.length - 1) / 2) * 30;
      const py = 45;
      ctx.beginPath();
      ctx.arc(px, py, 9, 0, Math.PI * 2);
      if (index === game.sceneIndex) {
        ctx.fillStyle = '#f2c94c';
        ctx.fill();
        ctx.fillStyle = '#33240f';
      } else if (game.completedPlates.has(index)) {
        ctx.fillStyle = '#37d99a';
        ctx.fill();
        ctx.fillStyle = '#0e2a1e';
      } else {
        ctx.strokeStyle = '#8a7a54';
        ctx.lineWidth = 1.6;
        ctx.stroke();
        ctx.fillStyle = '#b8a888';
      }
      ctx.font = 'bold 10px Georgia, serif';
      ctx.fillText(String(index + 1), px, py + 3.4);
    }
    // The counter: how many differences remain, in the biggest brass on the stage.
    const remaining = game.remainingCount();
    ctx.textAlign = 'right';
    ctx.fillStyle = remaining <= 2 ? '#ff9a5c' : '#f2c94c';
    ctx.font = 'bold 27px Georgia, serif';
    ctx.fillText(`${remaining} REMAINING`, 1264, 33);
    ctx.fillStyle = '#e9dfc6';
    ctx.font = '13.5px Georgia, serif';
    const clock = formatClock(game.timeLeft);
    const clockText = game.status === 'lost' ? '0:00' : clock;
    ctx.fillText(`Found ${game.foundCount()} of ${game.chosen.length} · Time ${clockText} · Smudges ${game.mistakes}`, 1264, 52);
    // Hint pill.
    const pill = HINT_BUTTON_RECT;
    ctx.fillStyle = game.hintsLeft > 0 ? '#274d6b' : '#3a3f4a';
    roundedRectPath(ctx, pill.x, pill.y, pill.w, pill.h, 12);
    ctx.fill();
    ctx.strokeStyle = '#7fb8d9';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = '#d9ecf7';
    ctx.font = 'bold 12px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(`✦ HINT · ${game.hintsLeft}`, pill.x + pill.w / 2, pill.y + 16);
    // The time bar under the header: gold draining to red as the light fades.
    const ratio = Math.max(0, game.timeLeft / game.plateDuration);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fillRect(440, 54, 400, 3.4);
    ctx.fillStyle = ratio < 0.25 ? (Math.sin(t * 6) > 0 ? '#e5534b' : '#ff8a5c') : '#c9a227';
    ctx.fillRect(440, 54, 400 * ratio, 3.4);
    ctx.restore();
  }

  /** The footer: how to play, and the running score. */
  drawFooter(ctx, game) {
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9a8a6a';
    ctx.font = '12px Georgia, serif';
    ctx.fillText('Click a difference on either plate · H hint · N next plate · R retry · 1–5 choose a plate · Arrows/WASD move the loupe · Enter marks', 20, 462);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#e9dfc6';
    ctx.font = 'bold 13.5px Georgia, serif';
    ctx.fillText(`Score ${game.score}`, 1264, 462);
    ctx.restore();
  }
}
