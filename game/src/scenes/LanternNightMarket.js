// LanternNightMarket — Plate V. A night market street: strings of paper lanterns over stalls of
// fruit, fabric and pots, under a haloed moon. The differences hide in the lanterns themselves,
// one stall's awning, a missing fruit, a banner's emblem and a cat that may not be there.

import {
  crescentMoon, glowDot, roundedRectPath, softEllipse, starPath, textureRandom,
  verticalGradient,
} from '../render/ProceduralTextures.js';

/** One paper lantern: a ribbed sphere with caps, glowing from inside. */
function drawPaperLantern(ctx, cx, cy, radius, colour, lit, t, phase) {
  if (lit) glowDot(ctx, cx, cy, radius * 2.1, 'rgba(255,170,70,0.35)', 'rgba(255,230,170,0.85)', 1 + Math.sin(t * 3.4 + phase) * 0.05);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(cx, cy, radius, radius * 0.82, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,40,20,0.35)';
  ctx.lineWidth = 1;
  for (const off of [-0.55, 0, 0.55]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, radius * (1 - Math.abs(off) * 0.45), radius * 0.82, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#7a2e2e';
  ctx.fillRect(cx - radius * 0.4, cy - radius * 0.82 - 3, radius * 0.8, 4);
  ctx.fillRect(cx - radius * 0.4, cy + radius * 0.82 - 1, radius * 0.8, 4);
  ctx.strokeStyle = '#c9a227';
  ctx.beginPath();
  ctx.moveTo(cx, cy + radius * 0.82 + 3);
  ctx.lineTo(cx, cy + radius * 0.82 + 10);
  ctx.stroke();
}

/** A catenary string of lanterns between two points; one may be a different colour or missing. */
function drawLanternString(ctx, x0, y0, x1, y1, sag, lanterns, alt, t, colourDiffId, missingDiffId) {
  ctx.strokeStyle = 'rgba(16,12,20,0.9)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo((x0 + x1) / 2, Math.max(y0, y1) + sag, x1, y1);
  ctx.stroke();
  lanterns.forEach((lantern, index) => {
    if (missingDiffId && index === 2 && alt.has(missingDiffId)) return;
    const u = (index + 1) / (lanterns.length + 1);
    const lx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * ((x0 + x1) / 2) + u * u * x1;
    const ly = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * (Math.max(y0, y1) + sag) + u * u * y1;
    let colour = lantern;
    if (colourDiffId && index === 1 && alt.has(colourDiffId)) colour = '#3f9150';
    drawPaperLantern(ctx, lx, ly + 13, 11, colour, true, t, index * 1.3);
  });
}

/** A pyramid of round fruit on a stall counter. */
function drawFruitPyramid(ctx, x, y, alt) {
  const rows = [4, 3, 2, 1];
  rows.forEach((count, row) => {
    for (let i = 0; i < count; i += 1) {
      if (row === 3 && alt.has('fruit-pyramid')) return;
      const fx = x + (i - (count - 1) / 2) * 17;
      const fy = y - row * 14;
      ctx.fillStyle = row % 2 === 0 ? '#e8873d' : '#e8a33d';
      ctx.beginPath();
      ctx.arc(fx, fy, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#2e6b34';
      ctx.fillRect(fx - 1, fy - 10, 2, 4);
    }
  });
}

/** A market stall: posts, awning, counter and goods. Side: -1 left, 1 right. */
function drawMarketStall(ctx, x, w, alt, t, side) {
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(x + 4, 196, 7, 108);
  ctx.fillRect(x + w - 11, 196, 7, 108);
  // Awning: striped on the original; the left stall's is plain on the copy.
  ctx.fillStyle = side < 0 ? '#7d3131' : '#274d6b';
  ctx.beginPath();
  ctx.moveTo(x - 6, 200);
  ctx.lineTo(x + w + 6, 200);
  ctx.lineTo(x + w - 4, 172);
  ctx.lineTo(x + 4, 172);
  ctx.closePath();
  ctx.fill();
  const plain = side < 0 && alt.has('awning-stripe');
  if (!plain) {
    ctx.fillStyle = 'rgba(233,226,210,0.85)';
    for (let stripe = 0; stripe < 4; stripe += 1) {
      ctx.beginPath();
      ctx.moveTo(x + 12 + stripe * (w / 4), 199);
      ctx.lineTo(x + 26 + stripe * (w / 4), 199);
      ctx.lineTo(x + 30 + stripe * (w / 4), 173);
      ctx.lineTo(x + 18 + stripe * (w / 4), 173);
      ctx.closePath();
      ctx.fill();
    }
  }
  // Counter and its shadow.
  ctx.fillStyle = '#5d3d22';
  ctx.fillRect(x - 2, 262, w + 4, 12);
  ctx.fillStyle = '#3d2410';
  ctx.fillRect(x + 2, 274, w - 4, 30);
  if (side < 0) {
    drawFruitPyramid(ctx, x + w / 2, 258, alt);
  } else {
    // Hanging fabrics on the right stall: dots on the original, stripes on the copy.
    const fabrics = ['#7d3131', '#31517d', '#2e5d3a'];
    fabrics.forEach((colour, index) => {
      const fx = x + 14 + index * 34;
      ctx.fillStyle = colour;
      ctx.fillRect(fx, 204, 26, 56);
      ctx.fillStyle = 'rgba(240,230,200,0.8)';
      if (index === 1 && alt.has('fabric-pattern')) {
        for (let band = 0; band < 4; band += 1) ctx.fillRect(fx, 212 + band * 13, 26, 4);
      } else {
        for (let dot = 0; dot < 3; dot += 1) {
          ctx.beginPath();
          ctx.arc(fx + 7 + (dot % 2) * 11, 214 + dot * 15, 2.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });
    // A small oil lamp on the counter: lit on the original, out on the copy.
    if (!alt.has('stall-lamp')) glowDot(ctx, x + w - 18, 248, 16, 'rgba(255,180,80,0.5)', 'rgba(255,240,190,0.95)', 1 + Math.sin(t * 5.4) * 0.06);
    ctx.fillStyle = '#2c2622';
    ctx.fillRect(x + w - 22, 250, 9, 12);
    ctx.fillStyle = alt.has('stall-lamp') ? '#3a3f4a' : '#ffd98a';
    ctx.fillRect(x + w - 20.4, 252, 5.6, 8);
  }
}

/** Rooftop silhouettes and lit windows at the street's edges. */
function drawStreetBuildings(ctx, alt) {
  ctx.fillStyle = '#12101f';
  ctx.fillRect(0, 60, 96, 284);
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.lineTo(48, 30);
  ctx.lineTo(96, 60);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(512, 74, 96, 270);
  ctx.beginPath();
  ctx.moveTo(512, 74);
  ctx.lineTo(560, 44);
  ctx.lineTo(608, 74);
  ctx.closePath();
  ctx.fill();
  const windows = [[26, 96], [58, 96], [26, 140], [58, 140], [534, 108], [568, 108], [534, 152]];
  windows.forEach(([wx, wy], index) => {
    const dark = index === 0 && alt.has('window-lit');
    ctx.fillStyle = dark ? '#1d1d2c' : '#ffca7a';
    ctx.fillRect(wx, wy, 13, 17);
    ctx.strokeStyle = '#12101f';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(wx + 6.5, wy);
    ctx.lineTo(wx + 6.5, wy + 17);
    ctx.stroke();
  });
  // A tall banner on the right building: a star emblem, or a crescent on the copy.
  ctx.fillStyle = '#7d3131';
  ctx.fillRect(548, 176, 26, 74);
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 1.6;
  ctx.strokeRect(548, 176, 26, 74);
  if (alt.has('banner-emblem')) {
    crescentMoon(ctx, 561, 206, 9, '#f2c94c', '#7d3131');
  } else {
    starPath(ctx, 561, 206, 9, 4);
    ctx.fillStyle = '#f2c94c';
    ctx.fill();
  }
  ctx.fillStyle = '#f2c94c';
  ctx.beginPath();
  ctx.moveTo(556, 232);
  ctx.lineTo(566, 232);
  ctx.lineTo(561, 240);
  ctx.closePath();
  ctx.fill();
}

/** A sitting cat silhouette on a crate, watching the market. */
function drawSittingCat(ctx, alt) {
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(312, 306, 40, 26);
  ctx.strokeStyle = '#5d3d22';
  ctx.strokeRect(312, 306, 40, 26);
  if (alt.has('cat-market')) return;
  ctx.fillStyle = '#191724';
  ctx.beginPath();
  ctx.ellipse(332, 296, 10, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(332, 281, 7.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(326, 276);
  ctx.lineTo(324, 268);
  ctx.lineTo(330, 273);
  ctx.closePath();
  ctx.moveTo(338, 276);
  ctx.lineTo(340, 268);
  ctx.lineTo(334, 273);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#191724';
  ctx.lineWidth = 3.4;
  ctx.beginPath();
  ctx.arc(346, 302, 8, Math.PI * 0.9, Math.PI * 1.9);
  ctx.stroke();
  ctx.fillStyle = '#ffd98a';
  ctx.beginPath();
  ctx.arc(329.6, 281, 1.3, 0, Math.PI * 2);
  ctx.arc(334.6, 281, 1.3, 0, Math.PI * 2);
  ctx.fill();
}

/** Clay pots stacked by the left stall: three on the original, two on the copy. */
function drawClayPots(ctx, alt) {
  const pot = (cx, cy, s) => {
    ctx.fillStyle = '#a3542f';
    ctx.beginPath();
    ctx.moveTo(cx - 10 * s, cy - 12 * s);
    ctx.lineTo(cx + 10 * s, cy - 12 * s);
    ctx.quadraticCurveTo(cx + 12 * s, cy + 2 * s, cx + 6 * s, cy + 10 * s);
    ctx.lineTo(cx - 6 * s, cy + 10 * s);
    ctx.quadraticCurveTo(cx - 12 * s, cy + 2 * s, cx - 10 * s, cy - 12 * s);
    ctx.fill();
  };
  pot(238, 322, 1);
  pot(264, 322, 1);
  if (!alt.has('pot-count')) pot(251, 300, 0.92);
}

/** A fish-shaped kite drifting over the rooftops; the copy's sky is empty. */
function drawFishKite(ctx, alt, t) {
  if (alt.has('fish-kite')) return;
  const kx = 252 + Math.sin(t * 0.5) * 8;
  const ky = 58 + Math.cos(t * 0.7) * 5;
  ctx.strokeStyle = 'rgba(220,220,230,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(kx, ky + 8);
  ctx.quadraticCurveTo(kx - 14, ky + 60, kx - 30, ky + 118);
  ctx.stroke();
  ctx.fillStyle = '#c65b4a';
  ctx.beginPath();
  ctx.ellipse(kx, ky, 17, 8, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(kx + 15, ky - 3);
  ctx.lineTo(kx + 26, ky - 10);
  ctx.lineTo(kx + 25, ky + 5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2ead0';
  ctx.beginPath();
  ctx.arc(kx - 10, ky - 2, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

/** The whole plate. `alt` holds the ids of the differences this copy carries. */
function drawLanternNightMarket(ctx, alt, t) {
  verticalGradient(ctx, 0, 0, 608, 344, [[0, '#0b1026'], [0.55, '#1a2340'], [0.8, '#2c2a4a'], [1, '#241f38']]);
  const random = textureRandom(131);
  ctx.fillStyle = '#dfe8ff';
  for (let star = 0; star < 40; star += 1) {
    ctx.globalAlpha = 0.25 + random() * 0.65;
    ctx.fillRect(20 + random() * 568, 12 + random() * 130, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  if (!alt.has('bright-star')) {
    starPath(ctx, 148, 38, 6.4, 2.8);
    ctx.fillStyle = '#fff6d8';
    ctx.fill();
    glowDot(ctx, 148, 38, 14, 'rgba(255,240,190,0.4)', 'rgba(255,250,220,0.9)');
  }
  // The moon, with a halo ring on the original that the copy lacks.
  if (alt.has('moon-halo')) {
    ctx.strokeStyle = 'rgba(240,235,210,0.0)';
  } else {
    ctx.strokeStyle = 'rgba(240,235,210,0.4)';
  }
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(516, 52, 30, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#f2ead0';
  ctx.beginPath();
  ctx.arc(516, 52, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(190,180,150,0.45)';
  ctx.beginPath();
  ctx.arc(509, 45, 3.6, 0, Math.PI * 2);
  ctx.arc(524, 58, 2.8, 0, Math.PI * 2);
  ctx.fill();
  drawFishKite(ctx, alt, t);
  drawStreetBuildings(ctx, alt);
  // Street floor with cobbles.
  ctx.fillStyle = '#241f30';
  ctx.fillRect(0, 300, 608, 44);
  ctx.strokeStyle = 'rgba(200,190,220,0.10)';
  for (let row = 0; row < 3; row += 1) {
    ctx.beginPath();
    ctx.moveTo(0, 310 + row * 12);
    ctx.lineTo(608, 310 + row * 12);
    ctx.stroke();
  }
  softEllipse(ctx, 304, 318, 260, 26, '#ffb84d', 0.05);
  drawLanternString(ctx, 60, 66, 300, 44, 34, ['#c23b2e', '#e8a33d', '#c65b9e', '#e8873d'], alt, t, 'lantern-colour', null);
  drawLanternString(ctx, 308, 44, 560, 70, 36, ['#e8a33d', '#c23b2e', '#31517d', '#e8873d'], alt, t, null, 'lantern-count');
  drawLanternString(ctx, 120, 150, 480, 150, 26, ['#c65b9e', '#e8a33d', '#c23b2e'], alt, t, null, null);
  drawMarketStall(ctx, 36, 168, alt, t, -1);
  drawMarketStall(ctx, 404, 168, alt, t, 1);
  drawClayPots(ctx, alt);
  drawSittingCat(ctx, alt);
}

export const LanternNightMarket = {
  id: 'lantern-night-market',
  title: 'The Lantern Night Market',
  plate: 'Plate V',
  differences: [
    { id: 'bright-star', x: 148, y: 38, radius: 15 },
    { id: 'moon-halo', x: 516, y: 52, radius: 30 },
    { id: 'fish-kite', x: 252, y: 58, radius: 22 },
    { id: 'window-lit', x: 32, y: 104, radius: 13 },
    { id: 'lantern-colour', x: 146, y: 84, radius: 17 },
    { id: 'lantern-count', x: 459, y: 96, radius: 17 },
    { id: 'banner-emblem', x: 561, y: 206, radius: 17 },
    { id: 'awning-stripe', x: 120, y: 186, radius: 26 },
    { id: 'fruit-pyramid', x: 120, y: 216, radius: 18 },
    { id: 'fabric-pattern', x: 452, y: 232, radius: 18 },
    { id: 'stall-lamp', x: 556, y: 250, radius: 15 },
    { id: 'pot-count', x: 251, y: 300, radius: 17 },
    { id: 'cat-market', x: 332, y: 292, radius: 19 },
  ],
  draw: drawLanternNightMarket,
};
