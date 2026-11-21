// HarborLighthouse — Plate III. A harbour at sunset: the lighthouse on its rocks, a sailboat
// coming home, and the café on the quay with its striped awning. The differences hide in the
// lighthouse's stripes and lamp, the boat's sail and flag, one dark café window, and the gulls.

import {
  glowDot, horizontalGradient, roundedRectPath, softEllipse, textureRandom, verticalGradient,
  waterShimmer,
} from '../render/ProceduralTextures.js';

/** The lighthouse: striped tower on rocks, lamp room, and a beam that may be dark. */
function drawLighthouse(ctx, alt, t) {
  // Rocky point.
  ctx.fillStyle = '#3c3a44';
  ctx.beginPath();
  ctx.moveTo(8, 344);
  ctx.lineTo(30, 268);
  ctx.lineTo(66, 244);
  ctx.lineTo(120, 252);
  ctx.lineTo(150, 282);
  ctx.lineTo(158, 344);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.beginPath();
  ctx.moveTo(30, 268);
  ctx.lineTo(66, 244);
  ctx.lineTo(120, 252);
  ctx.lineTo(96, 262);
  ctx.lineTo(52, 274);
  ctx.closePath();
  ctx.fill();
  // Tower: three bands, crimson on the original, harbour-teal on the copy.
  const band = alt.has('lighthouse-stripe') ? '#2e6f6a' : '#b83a3a';
  const tower = [
    { y: 236, h: 34, w: 46 },
    { y: 202, h: 34, w: 40 },
    { y: 168, h: 34, w: 34 },
  ];
  tower.forEach((slice, index) => {
    ctx.fillStyle = index === 1 ? '#e9e2d2' : band;
    ctx.fillRect(88 - slice.w / 2, slice.y, slice.w, slice.h);
  });
  ctx.fillStyle = '#2c2622';
  ctx.fillRect(82, 262, 12, 20);
  // Lamp room and gallery.
  ctx.fillStyle = '#2c2622';
  ctx.fillRect(64, 160, 48, 6);
  ctx.fillRect(70, 138, 36, 22);
  if (!alt.has('lamp-beam')) {
    const sweep = Math.sin(t * 0.6) * 0.24;
    ctx.save();
    ctx.translate(88, 149);
    ctx.rotate(sweep);
    const beam = ctx.createLinearGradient(0, 0, 300, 0);
    beam.addColorStop(0, 'rgba(255,230,150,0.5)');
    beam.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(6, -4);
    ctx.lineTo(300, -34);
    ctx.lineTo(300, 26);
    ctx.lineTo(6, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    glowDot(ctx, 88, 149, 26, 'rgba(255,210,110,0.55)', 'rgba(255,246,200,0.98)');
  }
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(82, 143, 12, 12);
  ctx.fillStyle = '#2c2622';
  ctx.beginPath();
  ctx.moveTo(66, 138);
  ctx.lineTo(110, 138);
  ctx.lineTo(88, 124);
  ctx.closePath();
  ctx.fill();
}

/** A gull: two shallow arcs for wings over a small body. */
function drawGull(ctx, cx, cy, scale, flap) {
  ctx.strokeStyle = 'rgba(30,28,34,0.85)';
  ctx.lineWidth = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(cx - 11 * scale, cy + flap * 3);
  ctx.quadraticCurveTo(cx - 5 * scale, cy - 5 * scale, cx, cy);
  ctx.quadraticCurveTo(cx + 5 * scale, cy - 5 * scale, cx + 11 * scale, cy + flap * 3);
  ctx.stroke();
}

/** The sailboat: hull, mast, and a sail that changes colour; a flag that may be gone. */
function drawSailboat(ctx, alt, t) {
  const bob = Math.sin(t * 1.1) * 2;
  const cx = 300;
  const waterY = 252 + bob;
  // Reflection.
  ctx.fillStyle = 'rgba(20,40,55,0.35)';
  ctx.beginPath();
  ctx.ellipse(cx, waterY + 22, 52, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  // Sail: cream on the original, brick red on the copy.
  ctx.fillStyle = alt.has('sail-colour') ? '#c65b4a' : '#f0e7d3';
  ctx.beginPath();
  ctx.moveTo(cx, 168 + bob);
  ctx.lineTo(cx, 236 + bob);
  ctx.lineTo(cx + 44, 236 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = alt.has('sail-colour') ? '#e8dcc2' : '#d9c9a8';
  ctx.beginPath();
  ctx.moveTo(cx - 4, 182 + bob);
  ctx.lineTo(cx - 4, 236 + bob);
  ctx.lineTo(cx - 30, 236 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#4a3421';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, 162 + bob);
  ctx.lineTo(cx, 240 + bob);
  ctx.stroke();
  if (!alt.has('boat-flag')) {
    ctx.fillStyle = '#b83a3a';
    ctx.beginPath();
    ctx.moveTo(cx, 162 + bob);
    ctx.lineTo(cx + 14, 166 + bob);
    ctx.lineTo(cx, 171 + bob);
    ctx.closePath();
    ctx.fill();
  }
  // Hull.
  ctx.fillStyle = '#6d3b26';
  ctx.beginPath();
  ctx.moveTo(cx - 52, 238 + bob);
  ctx.lineTo(cx + 52, 238 + bob);
  ctx.lineTo(cx + 38, 254 + bob);
  ctx.lineTo(cx - 38, 254 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(cx - 52, 234 + bob, 104, 5);
}

/** The café on the quay: awning, warm windows, a hanging sign. */
function drawHarborCafe(ctx, alt, t) {
  ctx.fillStyle = '#e5d7bd';
  ctx.fillRect(392, 208, 198, 96);
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(392, 196, 198, 14);
  ctx.fillStyle = '#5d3d22';
  ctx.fillRect(384, 188, 214, 10);
  // Awning: stripes on the original, polka dots on the copy.
  ctx.fillStyle = '#b83a3a';
  ctx.beginPath();
  ctx.moveTo(392, 210);
  ctx.lineTo(590, 210);
  ctx.lineTo(582, 232);
  ctx.lineTo(400, 232);
  ctx.closePath();
  ctx.fill();
  if (alt.has('awning-pattern')) {
    ctx.fillStyle = '#e9e2d2';
    for (let dot = 0; dot < 8; dot += 1) {
      ctx.beginPath();
      ctx.arc(416 + dot * 22, 221, 3.6, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    ctx.fillStyle = '#e9e2d2';
    for (let stripe = 0; stripe < 5; stripe += 1) ctx.fillRect(414 + stripe * 40, 210, 18, 21);
  }
  // Windows: two glow warm; the left one is dark on the copy.
  for (const [wx, dark] of [[414, alt.has('cafe-window')], [470, false], [526, false]]) {
    ctx.fillStyle = '#4a3421';
    ctx.fillRect(wx, 246, 40, 42);
    ctx.fillStyle = dark ? '#2c3038' : '#ffca7a';
    ctx.fillRect(wx + 4, 250, 32, 34);
    if (!dark) softEllipse(ctx, wx + 20, 267, 26, 20, '#ffb84d', 0.25);
    ctx.strokeStyle = '#4a3421';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wx + 20, 250);
    ctx.lineTo(wx + 20, 284);
    ctx.stroke();
  }
  // Door and hanging sign: the sign hangs on the original, its bracket bare on the copy.
  ctx.fillStyle = '#31517d';
  ctx.fillRect(560, 246, 26, 58);
  ctx.strokeStyle = '#2c2622';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(392, 226);
  ctx.lineTo(368, 226);
  ctx.moveTo(368, 226);
  ctx.lineTo(368, 238);
  ctx.stroke();
  if (!alt.has('cafe-sign')) {
    ctx.fillStyle = '#2c2622';
    roundedRectPath(ctx, 348, 238, 42, 26, 5);
    ctx.fill();
    ctx.fillStyle = '#f2c94c';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAFÉ', 369, 255);
  }
  // Flower boxes under the windows.
  ctx.fillStyle = '#7a2e2e';
  ctx.fillRect(410, 290, 48, 10);
  ctx.fillRect(466, 290, 48, 10);
  ctx.fillStyle = '#d94f4f';
  for (let bloom = 0; bloom < 6; bloom += 1) {
    ctx.beginPath();
    ctx.arc(418 + bloom * 7, 289, 3, 0, Math.PI * 2);
    ctx.arc(474 + bloom * 7, 289, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Quay furniture: crates, barrels, a rope coil and the post lantern. */
function drawQuayFurniture(ctx, alt, t) {
  // Crates at the left of the quay; the copy has one more stacked on top.
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(168, 306, 34, 30);
  ctx.fillRect(206, 306, 34, 30);
  ctx.strokeStyle = '#5d3d22';
  ctx.lineWidth = 2;
  ctx.strokeRect(168, 306, 34, 30);
  ctx.strokeRect(206, 306, 34, 30);
  if (alt.has('crate-count')) {
    ctx.fillStyle = '#96683e';
    ctx.fillRect(185, 276, 34, 30);
    ctx.strokeRect(185, 276, 34, 30);
  }
  // Barrels at the right.
  for (const bx of [330, 366]) {
    ctx.fillStyle = '#6d4423';
    ctx.beginPath();
    ctx.ellipse(bx, 320, 15, 17, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2c1c10';
    ctx.beginPath();
    ctx.moveTo(bx - 15, 312);
    ctx.lineTo(bx + 15, 312);
    ctx.moveTo(bx - 15, 328);
    ctx.lineTo(bx + 15, 328);
    ctx.stroke();
  }
  // Rope coil.
  ctx.strokeStyle = '#c9b088';
  ctx.lineWidth = 3;
  for (let loop = 0; loop < 3; loop += 1) {
    ctx.beginPath();
    ctx.ellipse(272, 330 - loop * 3, 13 - loop * 2, 4.4, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  // Post lantern at the quay's end: lit on the original, out on the copy.
  ctx.fillStyle = '#2c2622';
  ctx.fillRect(594, 262, 5, 74);
  ctx.fillRect(588, 254, 17, 6);
  if (!alt.has('quay-lantern')) glowDot(ctx, 596, 246, 22, 'rgba(255,180,80,0.5)', 'rgba(255,240,190,0.95)', 1 + Math.sin(t * 4.6) * 0.06);
  ctx.strokeStyle = '#2c2622';
  ctx.lineWidth = 2;
  ctx.strokeRect(589, 236, 15, 18);
  ctx.fillStyle = alt.has('quay-lantern') ? '#3a3f4a' : '#ffd98a';
  ctx.fillRect(591, 238, 11, 14);
}

/** A lone fisher on the rocks, rod out over the water — or rodless, on the copy. */
function drawFisher(ctx, alt) {
  ctx.fillStyle = '#23202a';
  ctx.beginPath();
  ctx.arc(196, 282, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(191, 287, 10, 18);
  ctx.fillRect(191, 303, 22, 5);
  if (!alt.has('fishing-rod')) {
    ctx.strokeStyle = '#23202a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 292);
    ctx.lineTo(252, 262);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(240,240,240,0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(252, 262);
    ctx.lineTo(252, 282);
    ctx.stroke();
  }
}

/** The whole plate. `alt` holds the ids of the differences this copy carries. */
function drawHarborLighthouse(ctx, alt, t) {
  verticalGradient(ctx, 0, 0, 608, 200, [[0, '#2e2a55'], [0.5, '#8a4a6b'], [0.85, '#e8873d'], [1, '#f2a65a']]);
  // Sun low over the sea, with a cloud crossing the sky (one cloud fewer on the copy).
  glowDot(ctx, 452, 168, 60, 'rgba(255,170,80,0.5)', 'rgba(255,220,150,0.9)');
  ctx.fillStyle = '#ffdf9e';
  ctx.beginPath();
  ctx.arc(452, 168, 21, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(70,50,80,0.75)';
  for (const [cx, cy, s] of [[110, 52, 1], [250, 34, 0.7]]) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, 34 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 22 * s, cy + 3 * s, 24 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  if (!alt.has('cloud-missing')) {
    ctx.fillStyle = 'rgba(70,50,80,0.65)';
    ctx.beginPath();
    ctx.ellipse(520, 58, 28, 8, 0, 0, Math.PI * 2);
    ctx.ellipse(540, 62, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  const flap = Math.sin(t * 2.2);
  drawGull(ctx, 168, 84, 1, flap);
  drawGull(ctx, 214, 62, 0.75, -flap);
  if (!alt.has('gull-count')) drawGull(ctx, 356, 96, 0.85, flap * 0.7);
  // Sea.
  verticalGradient(ctx, 0, 188, 608, 100, [[0, '#e8905a'], [0.25, '#7a5a78'], [0.6, '#31517d'], [1, '#274058']]);
  horizontalGradient(ctx, 420, 190, 70, 96, [[0, 'rgba(255,190,100,0)'], [0.5, 'rgba(255,190,100,0.4)'], [1, 'rgba(255,190,100,0)']]);
  ctx.fillRect(420, 190, 70, 96);
  waterShimmer(ctx, 150, 200, 440, 80, '#ffd9a0', t, 37);
  // A distant cousin of the sailboat, hull-down on the horizon.
  ctx.fillStyle = 'rgba(30,26,44,0.8)';
  ctx.beginPath();
  ctx.moveTo(196, 218);
  ctx.lineTo(196, 190);
  ctx.lineTo(214, 218);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(182, 218, 34, 5);
  drawLighthouse(ctx, alt, t);
  drawSailboat(ctx, alt, t);
  // Buoy: red on the original, green on the copy.
  ctx.fillStyle = alt.has('buoy-colour') ? '#2e7d4f' : '#c23b2e';
  ctx.beginPath();
  ctx.moveTo(462, 268);
  ctx.lineTo(478, 268);
  ctx.lineTo(474, 254);
  ctx.lineTo(466, 254);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#2c2622';
  ctx.fillRect(468, 246, 4, 8);
  // Quay.
  ctx.fillStyle = '#57504e';
  ctx.fillRect(150, 300, 458, 44);
  ctx.fillStyle = '#6b625e';
  ctx.fillRect(150, 300, 458, 7);
  const random = textureRandom(43);
  ctx.strokeStyle = 'rgba(30,26,24,0.4)';
  for (let crack = 0; crack < 9; crack += 1) {
    const cx = 160 + random() * 430;
    ctx.beginPath();
    ctx.moveTo(cx, 308 + random() * 30);
    ctx.lineTo(cx + 8 - random() * 16, 308 + random() * 30);
    ctx.stroke();
  }
  drawHarborCafe(ctx, alt, t);
  drawQuayFurniture(ctx, alt, t);
  drawFisher(ctx, alt);
}

export const HarborLighthouse = {
  id: 'harbor-lighthouse',
  title: 'The Harbor Café & Lighthouse',
  plate: 'Plate III',
  differences: [
    { id: 'lighthouse-stripe', x: 88, y: 219, radius: 24 },
    { id: 'lamp-beam', x: 88, y: 149, radius: 22 },
    { id: 'cloud-missing', x: 528, y: 58, radius: 24 },
    { id: 'gull-count', x: 356, y: 96, radius: 18 },
    { id: 'sail-colour', x: 322, y: 205, radius: 28 },
    { id: 'boat-flag', x: 306, y: 166, radius: 13 },
    { id: 'awning-pattern', x: 491, y: 220, radius: 30 },
    { id: 'cafe-sign', x: 369, y: 251, radius: 20 },
    { id: 'cafe-window', x: 434, y: 267, radius: 20 },
    { id: 'buoy-colour', x: 470, y: 260, radius: 14 },
    { id: 'crate-count', x: 202, y: 291, radius: 19 },
    { id: 'quay-lantern', x: 596, y: 245, radius: 17 },
    { id: 'fishing-rod', x: 228, y: 276, radius: 20 },
  ],
  draw: drawHarborLighthouse,
};
