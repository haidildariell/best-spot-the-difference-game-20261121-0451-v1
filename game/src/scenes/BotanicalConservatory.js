// BotanicalConservatory — Plate II. A glasshouse at dusk: arched panes over a fountain, orchids
// and tulip beds, butterflies drifting in the warm air. The differences hide in a cracked pane, a
// missing planter, the colour of a single tulip, and other small acts of quiet vandalism.

import {
  foliageCluster, glowDot, roundedRectPath, softEllipse, textureRandom, verticalGradient,
  waterShimmer, woodPlanks,
} from '../render/ProceduralTextures.js';

/** The glasshouse shell: dusk sky seen through arched panes and iron ribs. */
function drawGlasshouseShell(ctx, alt, t) {
  verticalGradient(ctx, 0, 0, 608, 344, [[0, '#f2b880'], [0.45, '#e8906d'], [0.8, '#7a5a78'], [1, '#4c4258']]);
  ctx.fillStyle = '#ffd9a0';
  ctx.beginPath();
  ctx.arc(120, 74, 30, 0, Math.PI * 2);
  ctx.fill();
  softEllipse(ctx, 120, 74, 90, 90, '#ffca7a', 0.35);
  // Pane divisions: three arches with mullions.
  ctx.strokeStyle = 'rgba(46,42,38,0.85)';
  ctx.lineWidth = 5;
  for (const cx of [102, 304, 506]) {
    ctx.beginPath();
    ctx.moveTo(cx - 96, 344);
    ctx.lineTo(cx - 96, 120);
    ctx.arc(cx, 120, 96, Math.PI, 0);
    ctx.lineTo(cx + 96, 344);
    ctx.stroke();
  }
  ctx.lineWidth = 2;
  for (const cx of [102, 304, 506]) {
    ctx.beginPath();
    ctx.moveTo(cx, 24);
    ctx.lineTo(cx, 344);
    ctx.moveTo(cx - 96, 210);
    ctx.lineTo(cx + 96, 210);
    ctx.stroke();
  }
  // One pane near the crown is cracked on the copy: a small star of fracture lines.
  if (alt.has('cracked-pane')) {
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.3;
    const cx = 304;
    const cy = 58;
    for (let spoke = 0; spoke < 6; spoke += 1) {
      const angle = (spoke * Math.PI) / 3 + 0.4;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * (12 + (spoke % 3) * 5), cy + Math.sin(angle) * (10 + (spoke % 2) * 6));
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  // String lights along the centre arch; one bulb is dark on the copy.
  ctx.strokeStyle = 'rgba(40,32,26,0.8)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(208, 96);
  ctx.quadraticCurveTo(304, 128, 400, 96);
  ctx.stroke();
  const bulbXs = [228, 258, 288, 318, 348, 380];
  bulbXs.forEach((bx, index) => {
    const by = 104 + Math.sin((index / (bulbXs.length - 1)) * Math.PI) * 14;
    const dark = alt.has('string-light') && index === 3;
    if (!dark) glowDot(ctx, bx, by + 6, 11, 'rgba(255,190,90,0.55)', 'rgba(255,240,200,0.95)', 1 + Math.sin(t * 4 + index) * 0.07);
    ctx.fillStyle = dark ? '#4a4038' : '#ffe6ae';
    ctx.beginPath();
    ctx.arc(bx, by + 6, 3.4, 0, Math.PI * 2);
    ctx.fill();
  });
  // A bird silhouette rests on the left arch beam; the copy has scared it off.
  if (!alt.has('glass-bird')) {
    ctx.fillStyle = '#2c2622';
    ctx.beginPath();
    ctx.ellipse(238, 40, 9, 6, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(246, 34, 4.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(230, 42);
    ctx.lineTo(218, 48);
    ctx.lineTo(231, 47);
    ctx.closePath();
    ctx.fill();
  }
}

/** The fountain: basin, arcs of water, and a bird that may or may not be visiting. */
function drawFountain(ctx, alt, t) {
  softEllipse(ctx, 304, 322, 130, 18, '#1d2b33', 0.35);
  ctx.fillStyle = '#8d9299';
  ctx.beginPath();
  ctx.ellipse(304, 306, 118, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3f7d8c';
  ctx.beginPath();
  ctx.ellipse(304, 302, 108, 17, 0, 0, Math.PI * 2);
  ctx.fill();
  waterShimmer(ctx, 216, 292, 176, 18, '#bfe6ee', t, 29);
  ctx.fillStyle = '#7a7f87';
  ctx.fillRect(296, 238, 16, 62);
  ctx.beginPath();
  ctx.ellipse(304, 240, 26, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(210,240,250,0.8)';
  ctx.lineWidth = 2;
  const jet = alt.has('fountain-jet') ? 0.45 : 1;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(304, 236);
    ctx.quadraticCurveTo(304 + side * 34 * jet, 236 - 44 * jet, 304 + side * 62 * jet, 292);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(304, 236);
  ctx.lineTo(304, 236 - 40 * jet);
  ctx.stroke();
  if (!alt.has('fountain-bird')) {
    ctx.fillStyle = '#31517d';
    ctx.beginPath();
    ctx.ellipse(392, 292, 10, 6.4, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(401, 287, 4.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a33d';
    ctx.beginPath();
    ctx.moveTo(405, 287);
    ctx.lineTo(411, 289);
    ctx.lineTo(405, 291);
    ctx.closePath();
    ctx.fill();
  }
}

/** A tulip: stem, two leaves and a cup of petals in the given colour. */
function drawTulip(ctx, x, y, colour, scale = 1) {
  ctx.strokeStyle = '#2e6b34';
  ctx.lineWidth = 2.4 * scale;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 2 * scale, y - 12 * scale, x, y - 24 * scale);
  ctx.stroke();
  ctx.fillStyle = '#35793c';
  ctx.beginPath();
  ctx.ellipse(x - 5 * scale, y - 8 * scale, 6 * scale, 2.6 * scale, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x - 6 * scale, y - 24 * scale);
  ctx.quadraticCurveTo(x - 7 * scale, y - 36 * scale, x - 2.4 * scale, y - 33 * scale);
  ctx.lineTo(x, y - 38 * scale);
  ctx.lineTo(x + 2.4 * scale, y - 33 * scale);
  ctx.quadraticCurveTo(x + 7 * scale, y - 36 * scale, x + 6 * scale, y - 24 * scale);
  ctx.quadraticCurveTo(x, y - 19 * scale, x - 6 * scale, y - 24 * scale);
  ctx.fill();
}

/** Flower beds along the front: tulips in rows, with two quiet changes among them. */
function drawFlowerBeds(ctx, alt) {
  ctx.fillStyle = '#3d2c1c';
  ctx.fillRect(14, 300, 190, 34);
  ctx.fillRect(404, 300, 190, 34);
  const leftColours = ['#d94f4f', '#e8a33d', '#d94f4f', '#c65b9e', '#e8a33d'];
  leftColours.forEach((colour, index) => {
    const use = index === 1 && alt.has('tulip-colour') ? '#31517d' : colour;
    drawTulip(ctx, 36 + index * 40, 330, use, 0.95);
  });
  const rightColours = ['#c65b9e', '#d94f4f', '#e8a33d', '#d94f4f'];
  rightColours.forEach((colour, index) => {
    if (index === 2 && alt.has('tulip-missing')) return;
    drawTulip(ctx, 428 + index * 42, 330, colour, 0.95);
  });
  foliageCluster(ctx, 24, 292, 20, ['#2e6b34', '#3c8a44', '#27602c'], 61);
  foliageCluster(ctx, 584, 292, 20, ['#2e6b34', '#3c8a44', '#27602c'], 67);
}

/** Plants, planters and furniture around the fountain. */
function drawPlantsAndFurniture(ctx, alt, t) {
  // Terracotta palm at the left with an orchid spike.
  ctx.fillStyle = '#a3542f';
  ctx.beginPath();
  ctx.moveTo(52, 268);
  ctx.lineTo(108, 268);
  ctx.lineTo(100, 306);
  ctx.lineTo(60, 306);
  ctx.closePath();
  ctx.fill();
  foliageCluster(ctx, 80, 208, 52, ['#2e6b34', '#3f9150', '#27602c'], 71);
  foliageCluster(ctx, 56, 238, 30, ['#35793c', '#2e6b34', '#3f9150'], 73);
  foliageCluster(ctx, 108, 240, 28, ['#35793c', '#27602c', '#3f9150'], 79);
  ctx.strokeStyle = '#7a4a6b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, 236);
  ctx.quadraticCurveTo(118, 190, 128, 158);
  ctx.stroke();
  const orchidColour = alt.has('orchid-colour') ? '#e8e4da' : '#d77fb8';
  for (let bloom = 0; bloom < 4; bloom += 1) {
    ctx.fillStyle = orchidColour;
    ctx.beginPath();
    ctx.arc(122 + bloom * 3, 196 - bloom * 12, 5.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8a4a72';
    ctx.beginPath();
    ctx.arc(122 + bloom * 3, 196 - bloom * 12, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  // Hanging planters from the right arch; the nearer one is gone on the copy.
  for (const [hx, present] of [[452, true], [520, !alt.has('hanging-planter')]]) {
    ctx.strokeStyle = 'rgba(40,34,28,0.8)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(hx, 96);
    ctx.lineTo(hx, 128);
    ctx.stroke();
    if (!present) continue;
    ctx.fillStyle = '#7a4a2f';
    ctx.beginPath();
    ctx.ellipse(hx, 136, 17, 9, 0, 0, Math.PI);
    ctx.fill();
    foliageCluster(ctx, hx, 124, 18, ['#3f9150', '#2e6b34', '#57a862'], hx);
    ctx.strokeStyle = '#2e6b34';
    ctx.beginPath();
    ctx.moveTo(hx - 10, 132);
    ctx.quadraticCurveTo(hx - 14, 152, hx - 8, 164);
    ctx.moveTo(hx + 9, 132);
    ctx.quadraticCurveTo(hx + 13, 150, hx + 7, 160);
    ctx.stroke();
  }
  // A bench at the left with a gardener's book left on it (or not).
  woodPlanks(ctx, 30, 246, 108, 8, '#6b4423', '#3d2410', 83);
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(38, 254, 8, 22);
  ctx.fillRect(122, 254, 8, 22);
  if (!alt.has('bench-book')) {
    ctx.fillStyle = '#274d6b';
    ctx.fillRect(66, 234, 30, 12);
    ctx.fillStyle = '#e9dfc6';
    ctx.fillRect(69, 237, 24, 6);
  }
  // A watering can at the right: green on the original, rust-red on the copy.
  ctx.fillStyle = alt.has('watering-can') ? '#8a4436' : '#3f6d4e';
  roundedRectPath(ctx, 500, 262, 34, 24, 4);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(500, 270);
  ctx.lineTo(484, 258);
  ctx.lineWidth = 5;
  ctx.strokeStyle = alt.has('watering-can') ? '#8a4436' : '#3f6d4e';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(517, 258, 8, Math.PI, 0);
  ctx.lineWidth = 3;
  ctx.stroke();
  // Ferns at the right.
  foliageCluster(ctx, 540, 226, 34, ['#2e6b34', '#3f9150', '#27602c'], 89);
  foliageCluster(ctx, 566, 252, 24, ['#35793c', '#2e6b34', '#57a862'], 97);
}

/** Two butterflies drift on slow sine paths; colour and company vary by plate. */
function drawButterflies(ctx, alt, t) {
  const drawOne = (cx, cy, colour, phase) => {
    const flap = Math.abs(Math.sin(t * 6 + phase)) * 0.5 + 0.5;
    ctx.fillStyle = colour;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(cx + side * 6 * flap, cy - 2, 7 * flap + 2, 5, side * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + side * 5 * flap, cy + 4, 5 * flap + 1, 3.6, side * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#2c2622';
    ctx.fillRect(cx - 1, cy - 5, 2, 11);
  };
  const bx = 448 + Math.sin(t * 0.5) * 14;
  const by = 176 + Math.cos(t * 0.8) * 8;
  drawOne(bx, by, alt.has('butterfly-colour') ? '#4f7dd9' : '#e8873d', 0);
  if (!alt.has('butterfly-count')) {
    drawOne(176 + Math.sin(t * 0.4 + 2) * 10, 128 + Math.cos(t * 0.7 + 1) * 6, '#c65b9e', 2.4);
  }
}

/** The stone path to the fountain; one stepping stone is missing on the copy. */
function drawStonePath(ctx, alt) {
  const stones = [
    { x: 288, y: 336, w: 17 },
    { x: 322, y: 330, w: 14 },
    { x: 300, y: 341, w: 19 },
  ];
  stones.forEach((stone, index) => {
    if (index === 0 && alt.has('path-stone')) return;
    ctx.fillStyle = '#8d8578';
    ctx.beginPath();
    ctx.ellipse(stone.x, stone.y, stone.w, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.beginPath();
    ctx.ellipse(stone.x - 3, stone.y - 1.6, stone.w * 0.55, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

/** The great palm behind the fountain, and the shrubs and vines that fill the glasshouse. */
function drawGreatPalm(ctx, t) {
  ctx.strokeStyle = '#4a3421';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(304, 306);
  ctx.quadraticCurveTo(296, 220, 306, 148);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(240,220,170,0.25)';
  ctx.lineWidth = 2;
  for (let ring = 0; ring < 5; ring += 1) {
    ctx.beginPath();
    ctx.moveTo(297 - ring * 1.6, 268 - ring * 26);
    ctx.lineTo(310 - ring * 1.2, 264 - ring * 26);
    ctx.stroke();
  }
  const sway = Math.sin(t * 0.8) * 2;
  for (let frond = 0; frond < 7; frond += 1) {
    const angle = -Math.PI * 0.92 + frond * 0.3;
    const fx = 306 + Math.cos(angle) * 74 + sway;
    const fy = 148 + Math.sin(angle) * 40;
    ctx.strokeStyle = frond % 2 === 0 ? '#2e6b34' : '#3f9150';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(306, 148);
    ctx.quadraticCurveTo(306 + Math.cos(angle) * 44, 148 + Math.sin(angle) * 30 - 12, fx, fy + 14);
    ctx.stroke();
  }
  foliageCluster(ctx, 306, 138, 30, ['#2e6b34', '#3f9150', '#27602c'], 103);
  // Shrubs flanking the fountain and vines trailing from the centre arch.
  foliageCluster(ctx, 196, 282, 26, ['#2e6b34', '#3f9150', '#27602c'], 107);
  foliageCluster(ctx, 412, 282, 26, ['#35793c', '#2e6b34', '#57a862'], 109);
  ctx.strokeStyle = '#2e6b34';
  ctx.lineWidth = 2;
  for (const vx of [262, 346]) {
    ctx.beginPath();
    ctx.moveTo(vx, 30);
    ctx.quadraticCurveTo(vx + 6, 70, vx - 2, 108);
    ctx.stroke();
    foliageCluster(ctx, vx, 112, 13, ['#3f9150', '#2e6b34', '#57a862'], vx);
  }
}

/** The whole plate. `alt` holds the ids of the differences this copy carries. */
function drawBotanicalConservatory(ctx, alt, t) {
  ctx.fillStyle = '#4c4258';
  ctx.fillRect(0, 0, 608, 344);
  drawGlasshouseShell(ctx, alt, t);
  drawGreatPalm(ctx, t);
  ctx.fillStyle = '#5a4632';
  ctx.fillRect(0, 306, 608, 38);
  ctx.fillStyle = '#66523a';
  ctx.fillRect(0, 300, 608, 8);
  drawStonePath(ctx, alt);
  drawPlantsAndFurniture(ctx, alt, t);
  drawFountain(ctx, alt, t);
  drawFlowerBeds(ctx, alt);
  drawButterflies(ctx, alt, t);
  const random = textureRandom(101);
  ctx.fillStyle = '#ffe9b8';
  for (let mote = 0; mote < 10; mote += 1) {
    ctx.globalAlpha = 0.14 + 0.1 * Math.sin(t * 0.8 + mote * 1.7);
    ctx.beginPath();
    ctx.arc(60 + random() * 480, 60 + random() * 200, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export const BotanicalConservatory = {
  id: 'botanical-conservatory',
  title: 'The Botanical Conservatory at Dusk',
  plate: 'Plate II',
  differences: [
    { id: 'cracked-pane', x: 304, y: 58, radius: 20 },
    { id: 'glass-bird', x: 238, y: 40, radius: 16 },
    { id: 'string-light', x: 318, y: 118, radius: 15 },
    { id: 'butterfly-colour', x: 448, y: 176, radius: 20 },
    { id: 'butterfly-count', x: 176, y: 128, radius: 18 },
    { id: 'orchid-colour', x: 126, y: 178, radius: 20 },
    { id: 'hanging-planter', x: 520, y: 132, radius: 20 },
    { id: 'fountain-jet', x: 304, y: 214, radius: 26 },
    { id: 'fountain-bird', x: 394, y: 290, radius: 15 },
    { id: 'bench-book', x: 81, y: 240, radius: 17 },
    { id: 'watering-can', x: 510, y: 270, radius: 20 },
    { id: 'tulip-colour', x: 76, y: 306, radius: 17 },
    { id: 'tulip-missing', x: 512, y: 306, radius: 17 },
    { id: 'path-stone', x: 288, y: 336, radius: 15 },
  ],
  draw: drawBotanicalConservatory,
};
