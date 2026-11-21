// ClockmakerWorkshop — Plate I. A midnight workshop: a tall regulator clock, a bench strewn with
// gears and tools, a sleeping cat, and moonlight through the window. The differences hide in the
// clock's hands and pendulum, the bottles on the shelf, the cat's ribbon and a dozen small brass
// things a restorer might quietly swap.

import {
  agedPaper, crescentMoon, dustMotes, flameShape, glowDot, roundedRectPath, softEllipse,
  starPath, textureRandom, verticalGradient, woodPlanks,
} from '../render/ProceduralTextures.js';

/** The regulator clock: case, face, hands (the altered plate turns them), pendulum below. */
function drawRegulatorClock(ctx, alt, t) {
  ctx.fillStyle = '#4a2f1c';
  roundedRectPath(ctx, 282, 28, 96, 218, 8);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#f3e9d2';
  ctx.beginPath();
  ctx.arc(330, 92, 40, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c1c10';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  for (let tick = 0; tick < 12; tick += 1) {
    const angle = (tick * Math.PI) / 6;
    const inner = tick % 3 === 0 ? 30 : 34;
    ctx.beginPath();
    ctx.moveTo(330 + Math.cos(angle) * inner, 92 + Math.sin(angle) * inner);
    ctx.lineTo(330 + Math.cos(angle) * 38, 92 + Math.sin(angle) * 38);
    ctx.stroke();
  }
  // Hands: eleven minutes to midnight on the original; twenty past three on the copy.
  const hourAngle = alt.has('clock-hands') ? Math.PI * 0.72 : -Math.PI / 2 + 0.42;
  const minuteAngle = alt.has('clock-hands') ? Math.PI * 0.1 : -Math.PI / 2 + 5.6;
  ctx.strokeStyle = '#1d130b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(330, 92);
  ctx.lineTo(330 + Math.cos(hourAngle) * 21, 92 + Math.sin(hourAngle) * 21);
  ctx.stroke();
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(330, 92);
  ctx.lineTo(330 + Math.cos(minuteAngle) * 31, 92 + Math.sin(minuteAngle) * 31);
  ctx.stroke();
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(330, 92, 4, 0, Math.PI * 2);
  ctx.fill();
  // Pendulum behind glass, swinging gently; the copy has lost its bob.
  ctx.fillStyle = 'rgba(20,12,6,0.55)';
  roundedRectPath(ctx, 302, 146, 56, 88, 6);
  ctx.fill();
  const swing = Math.sin(t * 1.6) * 9;
  ctx.strokeStyle = '#a8842f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 150);
  ctx.lineTo(330 + swing, 214);
  ctx.stroke();
  if (!alt.has('pendulum-bob')) {
    ctx.fillStyle = '#e8c766';
    ctx.beginPath();
    ctx.arc(330 + swing, 220, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#7a5c14';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

/** One toothed gear, drawn as a ring of trapezoid teeth around a hub. */
function drawGear(ctx, cx, cy, radius, teeth, colour, rotation) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  for (let tooth = 0; tooth < teeth; tooth += 1) {
    const a0 = rotation + (tooth * Math.PI * 2) / teeth;
    const a1 = a0 + (Math.PI * 2) / teeth / 2.4;
    const a2 = a0 + (Math.PI * 2) / teeth / 1.6;
    const a3 = a0 + (Math.PI * 2) / teeth;
    ctx.lineTo(cx + Math.cos(a0) * radius * 0.78, cy + Math.sin(a0) * radius * 0.78);
    ctx.lineTo(cx + Math.cos(a1) * radius, cy + Math.sin(a1) * radius);
    ctx.lineTo(cx + Math.cos(a2) * radius, cy + Math.sin(a2) * radius);
    ctx.lineTo(cx + Math.cos(a3) * radius * 0.78, cy + Math.sin(a3) * radius * 0.78);
  }
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(30,18,8,0.85)';
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/** The bottle shelf: jars and flasks; one flask changes colour, one small gear vanishes. */
function drawBottleShelf(ctx, alt) {
  woodPlanks(ctx, 438, 138, 148, 10, '#5d3d22', '#33200f', 21);
  const bottles = [
    { x: 452, h: 44, colour: '#3f6d4e' },
    { x: 478, h: 58, colour: '#71563a' },
    { x: 505, h: 40, colour: alt.has('bottle-colour') ? '#31517d' : '#7d3131' },
    { x: 532, h: 52, colour: '#5b4a7a' },
    { x: 558, h: 36, colour: '#38666b' },
  ];
  for (const bottle of bottles) {
    ctx.fillStyle = bottle.colour;
    roundedRectPath(ctx, bottle.x, 138 - bottle.h, 18, bottle.h, 5);
    ctx.fill();
    ctx.fillRect(bottle.x + 6, 138 - bottle.h - 8, 6, 9);
    ctx.fillStyle = 'rgba(255,255,255,0.20)';
    ctx.fillRect(bottle.x + 3, 138 - bottle.h + 6, 4, bottle.h - 14);
  }
  if (!alt.has('shelf-gear')) drawGear(ctx, 470, 122, 11, 8, '#c9a227', 0.4);
  drawGear(ctx, 552, 118, 14, 9, '#8f9299', 0.9);
}

/** The workbench: tools, an open pocket watch, a mug, a candle and scattered gears. */
function drawWorkbench(ctx, alt, t) {
  woodPlanks(ctx, 18, 252, 572, 14, '#6b4423', '#3d2410', 31);
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(30, 266, 14, 78);
  ctx.fillRect(564, 266, 14, 78);
  // Stack of ledgers at the left; the middle spine changes colour on the copy.
  const spines = ['#5d2f28', alt.has('book-spine') ? '#274d6b' : '#2e5d3a', '#6b5320'];
  spines.forEach((colour, index) => {
    ctx.fillStyle = colour;
    ctx.fillRect(40 + index * 24, 224, 20, 28);
    ctx.fillStyle = 'rgba(240,220,170,0.75)';
    ctx.fillRect(40 + index * 24, 230, 20, 3);
  });
  // The cat's mug: cream on the original, teal on the copy.
  ctx.fillStyle = alt.has('mug-colour') ? '#2e6f6a' : '#e6dcc4';
  roundedRectPath(ctx, 128, 232, 26, 20, 4);
  ctx.fill();
  ctx.strokeStyle = alt.has('mug-colour') ? '#2e6f6a' : '#e6dcc4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(158, 242, 6, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  // Candle: lit and breathing on the original, snuffed to a wisp on the copy.
  ctx.fillStyle = '#e8e0cc';
  ctx.fillRect(376, 224, 12, 28);
  ctx.fillStyle = '#b8ab8d';
  ctx.fillRect(368, 250, 28, 4);
  if (!alt.has('candle-flame')) {
    glowDot(ctx, 382, 210, 26, 'rgba(255,166,48,0.5)', 'rgba(255,230,160,0.95)', 1 + Math.sin(t * 7) * 0.06);
    ctx.fillStyle = '#ffb84d';
    flameShape(ctx, 382, 214, 11, t, 1.2);
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    flameShape(ctx, 382, 216, 5.5, t, 1.2);
    ctx.fill();
  } else {
    ctx.strokeStyle = 'rgba(200,200,200,0.6)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(382, 222);
    ctx.bezierCurveTo(378, 210, 388, 204, 384, 192);
    ctx.stroke();
  }
  // Pocket watch: open with a visible face on the original, snapped shut on the copy.
  ctx.fillStyle = '#c9a227';
  ctx.beginPath();
  ctx.arc(452, 240, 13, 0, Math.PI * 2);
  ctx.fill();
  if (!alt.has('pocket-watch')) {
    ctx.fillStyle = '#f5efdd';
    ctx.beginPath();
    ctx.arc(452, 240, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(452, 240);
    ctx.lineTo(452, 233);
    ctx.moveTo(452, 240);
    ctx.lineTo(457, 243);
    ctx.stroke();
  }
  // Scattered gears on the bench; the copy gains one small gear by the watch.
  drawGear(ctx, 226, 240, 13, 8, '#b08d2e', 0.2);
  drawGear(ctx, 262, 244, 9, 7, '#7d8187', 1.1);
  drawGear(ctx, 520, 242, 11, 8, '#b08d2e', 0.7);
  if (alt.has('gear-count')) drawGear(ctx, 486, 246, 7, 7, '#c9a227', 0.5);
  // A brass key on a wall hook beside the window; the copy's hook is bare.
  ctx.strokeStyle = '#2c1c10';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(172, 128, 3, 0, Math.PI * 2);
  ctx.stroke();
  if (!alt.has('brass-key')) {
    ctx.strokeStyle = '#d9b64a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(172, 140, 6, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(172, 146);
    ctx.lineTo(172, 160);
    ctx.lineTo(178, 160);
    ctx.moveTo(172, 155);
    ctx.lineTo(177, 155);
    ctx.stroke();
  }
}

/** Drawers in the bench front, with brass knobs and a shadow gap under the top. */
function drawBenchDrawers(ctx) {
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(18, 266, 572, 6);
  for (const dx of [206, 336]) {
    ctx.fillStyle = '#5d3a1e';
    ctx.fillRect(dx, 284, 104, 42);
    ctx.strokeStyle = '#2c1a08';
    ctx.lineWidth = 2;
    ctx.strokeRect(dx, 284, 104, 42);
    ctx.fillStyle = '#c9a227';
    ctx.beginPath();
    ctx.arc(dx + 52, 305, 4.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Hand tools hanging on hooks in the gap between the clock and the shelf. */
function drawHangingTools(ctx) {
  ctx.strokeStyle = '#241608';
  ctx.lineWidth = 2.4;
  // A wrench.
  ctx.beginPath();
  ctx.moveTo(398, 66);
  ctx.lineTo(398, 108);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(398, 60, 7, Math.PI * 0.7, Math.PI * 1.9);
  ctx.stroke();
  // A screwdriver.
  ctx.fillStyle = '#7d3131';
  ctx.fillRect(416, 58, 7, 18);
  ctx.fillStyle = '#b9bec6';
  ctx.fillRect(418, 76, 3, 26);
  // A small hammer.
  ctx.fillStyle = '#8a5a36';
  ctx.fillRect(434, 62, 4, 34);
  ctx.fillStyle = '#6d7076';
  ctx.fillRect(426, 56, 20, 9);
}

/** An hourglass on the bench, sand mostly run through. */
function drawHourglass(ctx) {
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(540, 224);
  ctx.lineTo(556, 224);
  ctx.lineTo(549, 238);
  ctx.lineTo(556, 252);
  ctx.lineTo(540, 252);
  ctx.lineTo(547, 238);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = '#e8dcc0';
  ctx.beginPath();
  ctx.moveTo(543, 243);
  ctx.lineTo(553, 243);
  ctx.lineTo(548, 250);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(542, 222, 12, 3);
  ctx.fillRect(542, 251, 12, 3);
}

/** The sleeping cat on the rug; on the copy its red ribbon is gone. */
function drawSleepingCat(ctx, alt, t) {
  ctx.fillStyle = '#7a2e2e';
  ctx.beginPath();
  ctx.ellipse(120, 322, 74, 16, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9a227';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(120, 322, 62, 11, 0, 0, Math.PI * 2);
  ctx.stroke();
  const breathe = Math.sin(t * 1.8) * 1.2;
  ctx.fillStyle = '#3a3f4a';
  ctx.beginPath();
  ctx.ellipse(112, 308 - breathe * 0.3, 44, 15 + breathe * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(152, 302 - breathe * 0.3, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(144, 292);
  ctx.lineTo(140, 282);
  ctx.lineTo(150, 289);
  ctx.closePath();
  ctx.moveTo(158, 290);
  ctx.lineTo(160, 280);
  ctx.lineTo(165, 290);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#3a3f4a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(66, 312, 12, Math.PI * 0.4, Math.PI * 1.25);
  ctx.stroke();
  if (!alt.has('cat-ribbon')) {
    ctx.fillStyle = '#b83a3a';
    ctx.beginPath();
    ctx.moveTo(146, 296);
    ctx.lineTo(138, 288);
    ctx.lineTo(140, 300);
    ctx.closePath();
    ctx.moveTo(146, 296);
    ctx.lineTo(156, 290);
    ctx.lineTo(154, 301);
    ctx.closePath();
    ctx.fill();
  }
}

/** The window: night sky where the moon changes phase between the plates. */
function drawNightWindow(ctx, alt) {
  ctx.fillStyle = '#5d3d22';
  ctx.fillRect(30, 34, 128, 150);
  verticalGradient(ctx, 38, 42, 112, 134, [[0, '#0e1a33'], [0.7, '#1b2c52'], [1, '#24355e']]);
  const random = textureRandom(41);
  ctx.fillStyle = '#dfe8ff';
  for (let star = 0; star < 26; star += 1) {
    ctx.globalAlpha = 0.35 + random() * 0.6;
    ctx.fillRect(42 + random() * 104, 46 + random() * 120, 1.6, 1.6);
  }
  ctx.globalAlpha = 1;
  if (alt.has('moon-phase')) {
    ctx.fillStyle = '#f2ead0';
    ctx.beginPath();
    ctx.arc(96, 84, 17, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(190,180,150,0.5)';
    ctx.beginPath();
    ctx.arc(90, 78, 3.4, 0, Math.PI * 2);
    ctx.arc(102, 90, 2.6, 0, Math.PI * 2);
    ctx.fill();
  } else {
    crescentMoon(ctx, 96, 84, 17, '#f2ead0', '#16264a');
  }
  ctx.strokeStyle = '#5d3d22';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(94, 42);
  ctx.lineTo(94, 176);
  ctx.moveTo(38, 108);
  ctx.lineTo(150, 108);
  ctx.stroke();
  // Distant rooftops under the window sky.
  ctx.fillStyle = '#0a1224';
  ctx.beginPath();
  ctx.moveTo(38, 176);
  ctx.lineTo(38, 150);
  ctx.lineTo(66, 138);
  ctx.lineTo(94, 150);
  ctx.lineTo(94, 176);
  ctx.lineTo(112, 176);
  ctx.lineTo(112, 156);
  ctx.lineTo(132, 146);
  ctx.lineTo(150, 156);
  ctx.lineTo(150, 176);
  ctx.closePath();
  ctx.fill();
}

/** The framed miniature over the bench: a ship on the original, a house on the copy. */
function drawFramedMiniature(ctx, alt) {
  ctx.fillStyle = '#6d4c26';
  ctx.fillRect(196, 52, 74, 62);
  agedPaper(ctx, 201, 57, 64, 52, '#e9dfc6', 9);
  if (alt.has('picture-scene')) {
    ctx.fillStyle = '#8a4b32';
    ctx.beginPath();
    ctx.moveTo(214, 96);
    ctx.lineTo(214, 78);
    ctx.lineTo(233, 66);
    ctx.lineTo(252, 78);
    ctx.lineTo(252, 96);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#5d3d22';
    ctx.fillRect(228, 86, 10, 10);
  } else {
    ctx.strokeStyle = '#31517d';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(214, 92);
    ctx.lineTo(252, 92);
    ctx.moveTo(233, 92);
    ctx.lineTo(233, 70);
    ctx.moveTo(233, 70);
    ctx.lineTo(246, 82);
    ctx.lineTo(233, 82);
    ctx.stroke();
    ctx.fillStyle = '#31517d';
    ctx.beginPath();
    ctx.moveTo(218, 98);
    ctx.quadraticCurveTo(233, 92, 248, 98);
    ctx.quadraticCurveTo(233, 103, 218, 98);
    ctx.fill();
  }
}

/** The whole plate. `alt` holds the ids of the differences this copy carries. */
function drawClockmakerWorkshop(ctx, alt, t) {
  ctx.fillStyle = '#332412';
  ctx.fillRect(0, 0, 608, 344);
  verticalGradient(ctx, 0, 0, 608, 250, [[0, '#43301d'], [1, '#382716']]);
  woodPlanks(ctx, 0, 250, 608, 94, '#4c3016', '#2c1a08', 51);
  drawNightWindow(ctx, alt);
  drawFramedMiniature(ctx, alt);
  // Wall gears to the left of the clock; on the copy one is iron instead of brass.
  drawGear(ctx, 240, 168, 15, 9, '#b08d2e', 0.3);
  drawGear(ctx, 262, 190, 10, 8, alt.has('wall-gear') ? '#83878e' : '#c9a227', 0.8);
  drawRegulatorClock(ctx, alt, t);
  drawBottleShelf(ctx, alt);
  // Hanging oil lamp, top right: warm and lit on the original, dark on the copy.
  ctx.strokeStyle = '#1d130b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(520, 0);
  ctx.lineTo(520, 30);
  ctx.stroke();
  ctx.fillStyle = '#2c1c10';
  ctx.beginPath();
  ctx.moveTo(504, 46);
  ctx.lineTo(536, 46);
  ctx.lineTo(528, 30);
  ctx.lineTo(512, 30);
  ctx.closePath();
  ctx.fill();
  if (!alt.has('lamp-unlit')) {
    glowDot(ctx, 520, 52, 34, 'rgba(255,170,60,0.45)', 'rgba(255,236,170,0.95)', 1 + Math.sin(t * 5.2) * 0.05);
    softEllipse(ctx, 330, 300, 250, 60, '#ffbe6e', 0.05);
  }
  drawWorkbench(ctx, alt, t);
  drawBenchDrawers(ctx);
  drawHangingTools(ctx);
  drawHourglass(ctx);
  drawSleepingCat(ctx, alt, t);
  starPath(ctx, 586, 30, 5, 2.2);
  ctx.fillStyle = 'rgba(240,225,180,0.5)';
  ctx.fill();
  dustMotes(ctx, 60, 60, 300, 160, t, 13, 23);
}

export const ClockmakerWorkshop = {
  id: 'clockmaker-workshop',
  title: "The Clockmaker's Midnight Workshop",
  plate: 'Plate I',
  differences: [
    { id: 'clock-hands', x: 330, y: 92, radius: 34 },
    { id: 'moon-phase', x: 96, y: 84, radius: 24 },
    { id: 'pendulum-bob', x: 330, y: 218, radius: 20 },
    { id: 'bottle-colour', x: 514, y: 116, radius: 20 },
    { id: 'shelf-gear', x: 470, y: 122, radius: 16 },
    { id: 'picture-scene', x: 233, y: 83, radius: 26 },
    { id: 'candle-flame', x: 382, y: 212, radius: 18 },
    { id: 'pocket-watch', x: 452, y: 240, radius: 18 },
    { id: 'gear-count', x: 486, y: 246, radius: 14 },
    { id: 'brass-key', x: 172, y: 146, radius: 15 },
    { id: 'cat-ribbon', x: 148, y: 295, radius: 16 },
    { id: 'mug-colour', x: 141, y: 242, radius: 17 },
    { id: 'book-spine', x: 76, y: 238, radius: 16 },
    { id: 'wall-gear', x: 262, y: 190, radius: 15 },
    { id: 'lamp-unlit', x: 520, y: 48, radius: 24 },
  ],
  draw: drawClockmakerWorkshop,
};
