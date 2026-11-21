// ObservatoryLibrary — Plate IV. A domed library at night: a brass telescope aimed at the stars,
// shelves of leather-bound books, a globe, candles and an owl keeping watch. The differences hide
// in the moon's phase, a missing star, the globe's oceans, one golden spine and a snuffed candle.

import {
  crescentMoon, flameShape, glowDot, roundedRectPath, softEllipse, starPath, textureRandom,
  verticalGradient, woodPlanks,
} from '../render/ProceduralTextures.js';

const SPINE_COLOURS = ['#5d2f28', '#274d6b', '#2e5d3a', '#6b5320', '#4a2c4e', '#71563a', '#7d3131'];

/** One shelf of books: upright spines of varied heights, with an optional special book. */
function drawBookRow(ctx, x, y, w, seed, special) {
  const random = textureRandom(seed);
  let cursor = x;
  let index = 0;
  while (cursor < x + w - 12) {
    const bw = 11 + random() * 9;
    const bh = 44 + random() * 14;
    let colour = SPINE_COLOURS[Math.floor(random() * SPINE_COLOURS.length)];
    if (special && index === special.index) colour = special.colour;
    ctx.fillStyle = colour;
    if (special && special.leanIndex === index) {
      ctx.save();
      ctx.translate(cursor + bw / 2, y);
      ctx.rotate(0.21);
      ctx.fillRect(-bw / 2, -bh, bw, bh);
      ctx.restore();
    } else {
      ctx.fillRect(cursor, y - bh, bw, bh);
    }
    ctx.fillStyle = 'rgba(240,220,170,0.5)';
    ctx.fillRect(cursor + 2, y - bh + 6, bw - 4, 2);
    cursor += bw + 2.4;
    index += 1;
  }
  woodPlanks(ctx, x - 4, y, w + 8, 7, '#4a2c14', '#2c1a08', seed + 1);
}

/** A bookcase: four rows of books between two uprights. */
function drawBookcase(ctx, x, y, w, seed, specialForRow) {
  ctx.fillStyle = '#3a2410';
  ctx.fillRect(x - 6, y - 8, w + 12, 248);
  ctx.fillStyle = '#241605';
  ctx.fillRect(x, y, w, 232);
  for (let row = 0; row < 4; row += 1) {
    drawBookRow(ctx, x + 4, y + 52 + row * 56, w - 8, seed + row * 13, specialForRow ? specialForRow(row) : null);
  }
}

/** The dome window: an arch of night sky, stars, and the moon in one of two phases. */
function drawDomeWindow(ctx, alt) {
  ctx.fillStyle = '#6d5a34';
  ctx.beginPath();
  ctx.moveTo(238, 158);
  ctx.lineTo(238, 84);
  ctx.arc(304, 84, 66, Math.PI, 0);
  ctx.lineTo(370, 158);
  ctx.closePath();
  ctx.fill();
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(246, 152);
  ctx.lineTo(246, 84);
  ctx.arc(304, 84, 58, Math.PI, 0);
  ctx.lineTo(362, 152);
  ctx.closePath();
  ctx.clip();
  verticalGradient(ctx, 246, 20, 116, 140, [[0, '#060d24'], [1, '#16264a']]);
  const random = textureRandom(53);
  ctx.fillStyle = '#dfe8ff';
  for (let star = 0; star < 30; star += 1) {
    ctx.globalAlpha = 0.3 + random() * 0.7;
    const sx = 252 + random() * 104;
    const sy = 26 + random() * 118;
    ctx.fillRect(sx, sy, 1.7, 1.7);
  }
  ctx.globalAlpha = 1;
  if (!alt.has('window-star')) {
    starPath(ctx, 330, 44, 6, 2.6);
    ctx.fillStyle = '#fff6d8';
    ctx.fill();
    glowDot(ctx, 330, 44, 13, 'rgba(255,240,190,0.4)', 'rgba(255,250,220,0.9)');
  }
  if (alt.has('moon-crescent')) {
    crescentMoon(ctx, 276, 52, 13, '#f2ead0', '#0d1830');
  } else {
    ctx.fillStyle = '#f2ead0';
    ctx.beginPath();
    ctx.arc(276, 52, 13, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#6d5a34';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(304, 26);
  ctx.lineTo(304, 152);
  ctx.moveTo(246, 96);
  ctx.lineTo(362, 96);
  ctx.stroke();
}

/** The telescope: a long brass-bound tube on a tripod, aimed through the dome. */
function drawTelescope(ctx, alt, t) {
  const baseX = 268;
  const baseY = 262;
  const tipX = 336;
  const tipY = 128;
  ctx.strokeStyle = '#2c1c10';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX - 26, 316);
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + 26, 316);
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(baseX + 4, 318);
  ctx.stroke();
  const angle = Math.atan2(tipY - baseY, tipX - baseX);
  ctx.save();
  ctx.translate(baseX, baseY);
  ctx.rotate(angle);
  const length = Math.hypot(tipX - baseX, tipY - baseY);
  ctx.fillStyle = '#274d6b';
  ctx.fillRect(0, -11, length, 22);
  ctx.fillStyle = '#31597d';
  ctx.fillRect(0, -11, length, 7);
  ctx.fillStyle = '#c9a227';
  ctx.fillRect(length - 16, -12.4, 8, 24.8);
  ctx.fillRect(10, -12.4, 6, 24.8);
  if (!alt.has('telescope-band')) ctx.fillRect(length * 0.52, -12.4, 7, 24.8);
  ctx.fillStyle = '#1d130b';
  ctx.fillRect(-14, -6, 14, 12);
  ctx.restore();
  softEllipse(ctx, 300, 322, 60, 8, '#000000', 0.3);
  return { midX: baseX + (tipX - baseX) * 0.52, midY: baseY + (tipY - baseY) * 0.52 };
}

/** The globe on its stand: oceans that change colour between the plates. */
function drawGlobe(ctx, alt) {
  ctx.strokeStyle = '#4a2c14';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(452, 240);
  ctx.lineTo(452, 268);
  ctx.moveTo(434, 272);
  ctx.lineTo(470, 272);
  ctx.stroke();
  ctx.save();
  ctx.beginPath();
  ctx.arc(452, 210, 31, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = alt.has('globe-colour') ? '#3f7d4e' : '#31517d';
  ctx.fillRect(421, 179, 62, 62);
  ctx.fillStyle = alt.has('globe-colour') ? '#31517d' : '#7a9a52';
  for (const [lx, ly, lw, lh] of [[428, 192, 16, 10], [452, 204, 20, 12], [436, 220, 12, 9], [464, 188, 10, 8]]) {
    ctx.beginPath();
    ctx.ellipse(lx, ly, lw / 2, lh / 2, 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(452, 210, 31, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(452, 210, 38, 12, -0.5, 0, Math.PI * 2);
  ctx.stroke();
}

/** The star chart on the wall: constellations pinned in ink; one bright star is missing. */
function drawStarChart(ctx, alt) {
  ctx.fillStyle = '#6d4c26';
  ctx.fillRect(390, 24, 92, 88);
  ctx.fillStyle = '#e9dfc6';
  ctx.fillRect(395, 29, 82, 78);
  const stars = [[408, 44], [428, 58], [446, 50], [462, 68], [452, 88], [424, 92], [406, 74]];
  ctx.strokeStyle = 'rgba(49,81,125,0.7)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  stars.forEach(([sx, sy], index) => {
    if (index === 0) ctx.moveTo(sx, sy);
    else ctx.lineTo(sx, sy);
  });
  ctx.stroke();
  stars.forEach(([sx, sy], index) => {
    if (index === 3 && alt.has('chart-star')) return;
    starPath(ctx, sx, sy, index === 3 ? 5 : 3.2, index === 3 ? 2 : 1.4);
    ctx.fillStyle = '#31517d';
    ctx.fill();
  });
  ctx.fillStyle = '#5d4a26';
  ctx.font = 'italic 9px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Ursa Major', 436, 103);
}

/** Desk dressing: candles (two or three), a quill in its inkpot, an open atlas. */
function drawDeskDressing(ctx, alt, t) {
  woodPlanks(ctx, 196, 268, 216, 10, '#5d3d22', '#33200f', 59);
  ctx.fillStyle = '#3d2410';
  ctx.fillRect(206, 278, 10, 40);
  ctx.fillRect(392, 278, 10, 40);
  const candleXs = [228, 252, 276];
  candleXs.forEach((cx, index) => {
    if (index === 1 && alt.has('candle-count')) return;
    ctx.fillStyle = '#e8e0cc';
    ctx.fillRect(cx - 4, 244, 8, 24);
    glowDot(ctx, cx, 234, 15, 'rgba(255,170,60,0.45)', 'rgba(255,240,190,0.9)', 1 + Math.sin(t * 6 + index * 2) * 0.07);
    ctx.fillStyle = '#ffb84d';
    flameShape(ctx, cx, 236, 7.4, t, index * 2.1);
    ctx.fill();
  });
  // Open atlas.
  ctx.fillStyle = '#e9dfc6';
  ctx.beginPath();
  ctx.moveTo(316, 268);
  ctx.quadraticCurveTo(336, 258, 356, 268);
  ctx.lineTo(356, 254);
  ctx.quadraticCurveTo(336, 245, 316, 254);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,70,40,0.6)';
  ctx.beginPath();
  ctx.moveTo(336, 250);
  ctx.lineTo(336, 264);
  ctx.stroke();
  // Quill and inkpot: the quill is there on the original, gone on the copy.
  ctx.fillStyle = '#1d1d26';
  ctx.beginPath();
  ctx.ellipse(382, 264, 7, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!alt.has('quill')) {
    ctx.strokeStyle = '#e9e4da';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(382, 262);
    ctx.quadraticCurveTo(392, 240, 404, 232);
    ctx.stroke();
    ctx.fillStyle = 'rgba(233,228,218,0.85)';
    ctx.beginPath();
    ctx.moveTo(404, 232);
    ctx.quadraticCurveTo(392, 234, 386, 246);
    ctx.quadraticCurveTo(396, 246, 404, 232);
    ctx.fill();
  }
}

/** The owl on the right bookcase and the little ringed planet on the left one. */
function drawShelfToppers(ctx, alt, t) {
  if (!alt.has('owl')) {
    const blink = Math.sin(t * 0.7) > 0.96 ? 0.15 : 1;
    ctx.fillStyle = '#6b5136';
    ctx.beginPath();
    ctx.ellipse(548, 44, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(540, 34);
    ctx.lineTo(538, 26);
    ctx.lineTo(545, 31);
    ctx.closePath();
    ctx.moveTo(556, 34);
    ctx.lineTo(558, 26);
    ctx.lineTo(551, 31);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2ead0';
    ctx.beginPath();
    ctx.arc(544, 42, 3.4, 0, Math.PI * 2);
    ctx.arc(552, 42, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d130b';
    ctx.beginPath();
    ctx.ellipse(544, 42, 1.7, 1.7 * blink, 0, 0, Math.PI * 2);
    ctx.ellipse(552, 42, 1.7, 1.7 * blink, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Saturn model: a small ringed planet; the ring is missing on the copy.
  ctx.fillStyle = '#c9a86a';
  ctx.beginPath();
  ctx.arc(88, 40, 10, 0, Math.PI * 2);
  ctx.fill();
  if (!alt.has('saturn-ring')) {
    ctx.strokeStyle = '#a8842f';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.ellipse(88, 42, 17, 5, -0.25, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(84, 50, 8, 8);
}

/** The whole plate. `alt` holds the ids of the differences this copy carries. */
function drawObservatoryLibrary(ctx, alt, t) {
  verticalGradient(ctx, 0, 0, 608, 344, [[0, '#1c1a33'], [0.7, '#232040'], [1, '#191730']]);
  woodPlanks(ctx, 0, 300, 608, 44, '#3d2410', '#201204', 61);
  drawDomeWindow(ctx, alt);
  drawStarChart(ctx, alt);
  // Left bookcase with one leaning book on its bottom row.
  drawBookcase(ctx, 22, 62, 138, 71, (row) => (row === 3 ? { leanIndex: alt.has('book-leaning') ? -1 : 4 } : null));
  // Right bookcase: a golden spine on the second row turns plain brown on the copy.
  drawBookcase(ctx, 448, 62, 138, 97, (row) => (row === 1 ? { index: 3, colour: alt.has('gold-book') ? '#5d4030' : '#e8c766' } : null));
  drawShelfToppers(ctx, alt, t);
  // Hanging oil lamp left of the dome: lit on the original, dark on the copy.
  ctx.strokeStyle = '#0f0d1a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(196, 0);
  ctx.lineTo(196, 34);
  ctx.stroke();
  if (!alt.has('dome-lamp')) glowDot(ctx, 196, 48, 24, 'rgba(255,180,80,0.4)', 'rgba(255,240,190,0.9)', 1 + Math.sin(t * 5) * 0.05);
  ctx.fillStyle = '#2c2622';
  ctx.beginPath();
  ctx.moveTo(186, 40);
  ctx.lineTo(206, 40);
  ctx.lineTo(201, 32);
  ctx.lineTo(191, 32);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = alt.has('dome-lamp') ? '#3a3f4a' : '#ffd98a';
  ctx.fillRect(191, 40, 10, 12);
  const band = drawTelescope(ctx, alt, t);
  drawGlobe(ctx, alt);
  drawDeskDressing(ctx, alt, t);
  // Rug: striped on the original, plain on the copy.
  ctx.fillStyle = '#5d2f3a';
  ctx.beginPath();
  ctx.ellipse(304, 326, 128, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  if (!alt.has('rug-pattern')) {
    ctx.strokeStyle = '#c9a227';
    ctx.lineWidth = 1.6;
    for (const rx of [216, 256, 304, 352, 392]) {
      ctx.beginPath();
      ctx.ellipse(rx === 304 ? 304 : 304 + (rx - 304), 326, Math.abs(rx - 304) + 8, 5.4, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  softEllipse(ctx, 304, 180, 280, 150, '#ffe0a0', 0.04);
  return band;
}

export const ObservatoryLibrary = {
  id: 'observatory-library',
  title: 'The Grand Observatory Library',
  plate: 'Plate IV',
  differences: [
    { id: 'window-star', x: 330, y: 44, radius: 15 },
    { id: 'moon-crescent', x: 276, y: 52, radius: 17 },
    { id: 'chart-star', x: 462, y: 68, radius: 14 },
    { id: 'saturn-ring', x: 88, y: 41, radius: 17 },
    { id: 'owl', x: 548, y: 42, radius: 17 },
    { id: 'dome-lamp', x: 196, y: 46, radius: 17 },
    { id: 'telescope-band', x: 302, y: 197, radius: 16 },
    { id: 'gold-book', x: 512, y: 128, radius: 16 },
    { id: 'book-leaning', x: 88, y: 268, radius: 17 },
    { id: 'globe-colour', x: 452, y: 210, radius: 30 },
    { id: 'candle-count', x: 252, y: 240, radius: 15 },
    { id: 'quill', x: 394, y: 246, radius: 16 },
    { id: 'rug-pattern', x: 304, y: 326, radius: 26 },
  ],
  draw: drawObservatoryLibrary,
};
