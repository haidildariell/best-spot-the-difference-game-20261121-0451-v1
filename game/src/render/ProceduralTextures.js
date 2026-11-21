// ProceduralTextures — the painter's box of tricks. Every surface in the cabinet is drawn, not
// loaded: wood grain, brick, paper, foliage, water, glass. Each helper paints into a rectangle
// with plain Canvas 2D calls, and any speckle or grain uses a small fixed-seed generator, so the
// original plate and its restored copy come out identical except where a difference is applied.

/** A deterministic 32-bit LCG for grain and speckle; same seed, same texture, every frame. */
export function textureRandom(seed) {
  let state = (seed * 2654435761) >>> 0;
  return function next() {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

/** Fill a rect with a top-to-bottom gradient through [offset, colour] stops. */
export function verticalGradient(ctx, x, y, w, h, stops) {
  const gradient = ctx.createLinearGradient(x, y, x, y + h);
  for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

/** Fill a rect with a left-to-right gradient (window light, sea sheen, dusk bands). */
export function horizontalGradient(ctx, x, y, w, h, stops) {
  const gradient = ctx.createLinearGradient(x, y, x + w, y);
  for (const [offset, colour] of stops) gradient.addColorStop(offset, colour);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, w, h);
}

/** A soft elliptical shadow or pool of light, drawn with a radial gradient. */
export function softEllipse(ctx, cx, cy, rx, ry, colour, alpha) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
  gradient.addColorStop(0, colour);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.scale(1, ry / rx);
  ctx.translate(-cx, -cy);
  ctx.fillStyle = gradient;
  ctx.fillRect(cx - rx, cy - rx, rx * 2, rx * 2);
  ctx.restore();
}

/** A glowing point of light: halo plus a bright core (lamps, lanterns, candle flames). */
export function glowDot(ctx, cx, cy, radius, colour, coreColour, flicker = 1) {
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * flicker);
  gradient.addColorStop(0, coreColour);
  gradient.addColorStop(0.35, colour);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius * flicker, 0, Math.PI * 2);
  ctx.fill();
}

/** Path helper: a rounded rectangle, ready to fill or stroke. */
export function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** Horizontal wooden planks with grain streaks and nail heads. */
export function woodPlanks(ctx, x, y, w, h, base, dark, seed = 7) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  const random = textureRandom(seed);
  const plankHeight = 22;
  for (let row = y; row < y + h; row += plankHeight) {
    ctx.strokeStyle = dark;
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.moveTo(x, row);
    ctx.lineTo(x + w, row);
    ctx.stroke();
    ctx.globalAlpha = 0.16;
    for (let streak = 0; streak < 7; streak += 1) {
      const sy = row + 3 + random() * (plankHeight - 6);
      const sx = x + random() * w * 0.7;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.bezierCurveTo(sx + w * 0.1, sy + 2, sx + w * 0.2, sy - 2, sx + w * 0.3, sy + 1);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = dark;
    ctx.beginPath();
    ctx.arc(x + 8, row + plankHeight / 2, 1.6, 0, Math.PI * 2);
    ctx.arc(x + w - 8, row + plankHeight / 2, 1.6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A brick wall: offset courses with mortar lines and per-brick tone shifts. */
export function brickWall(ctx, x, y, w, h, brick, mortar, seed = 11) {
  ctx.fillStyle = mortar;
  ctx.fillRect(x, y, w, h);
  const random = textureRandom(seed);
  const bh = 13;
  const bw = 42;
  let rowIndex = 0;
  for (let row = y; row < y + h; row += bh, rowIndex += 1) {
    const offset = rowIndex % 2 === 0 ? 0 : -bw / 2;
    for (let col = x + offset; col < x + w; col += bw) {
      const shade = 0.9 + random() * 0.2;
      ctx.fillStyle = shadeColour(brick, shade);
      ctx.fillRect(col + 1.5, row + 1.5, bw - 3, bh - 3);
    }
  }
}

/** Multiply a #rrggbb colour by a brightness factor, for cheap per-piece tone variation. */
export function shadeColour(hex, factor) {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift) => Math.max(0, Math.min(255, Math.round(((value >> shift) & 255) * factor)));
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}

/** Aged paper: warm fill, faint fibres and a few foxing spots near the edges. */
export function agedPaper(ctx, x, y, w, h, base, seed = 3) {
  ctx.fillStyle = base;
  ctx.fillRect(x, y, w, h);
  const random = textureRandom(seed);
  ctx.strokeStyle = 'rgba(120,90,40,0.10)';
  for (let fibre = 0; fibre < 60; fibre += 1) {
    const fx = x + random() * w;
    const fy = y + random() * h;
    ctx.beginPath();
    ctx.moveTo(fx, fy);
    ctx.lineTo(fx + 4 + random() * 9, fy + (random() - 0.5) * 2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(150,105,45,0.10)';
  for (let spot = 0; spot < 7; spot += 1) {
    ctx.beginPath();
    ctx.arc(x + random() * w, y + random() * h, 2 + random() * 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A cluster of leaves: layered ellipses in three greens around a centre. */
export function foliageCluster(ctx, cx, cy, radius, greens, seed = 5) {
  const random = textureRandom(seed + Math.round(cx));
  for (let leaf = 0; leaf < 26; leaf += 1) {
    const angle = random() * Math.PI * 2;
    const dist = random() * radius * 0.8;
    const lx = cx + Math.cos(angle) * dist;
    const ly = cy + Math.sin(angle) * dist * 0.8;
    ctx.fillStyle = greens[leaf % greens.length];
    ctx.beginPath();
    ctx.ellipse(lx, ly, 5 + random() * 8, 3 + random() * 5, angle, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Water: horizontal shimmer strokes that drift slowly with time `t`. */
export function waterShimmer(ctx, x, y, w, h, colour, t, seed = 13) {
  const random = textureRandom(seed);
  ctx.strokeStyle = colour;
  for (let line = 0; line < 34; line += 1) {
    const ly = y + random() * h;
    const lx = x + random() * w;
    const drift = Math.sin(t * 0.7 + line * 1.7) * 4;
    ctx.globalAlpha = 0.12 + random() * 0.2;
    ctx.beginPath();
    ctx.moveTo(lx + drift, ly);
    ctx.lineTo(lx + drift + 14 + random() * 30, ly);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Drifting dust motes in a beam of light; positions are a pure function of time. */
export function dustMotes(ctx, x, y, w, h, t, count = 16, seed = 17) {
  const random = textureRandom(seed);
  ctx.fillStyle = '#ffe9b8';
  for (let mote = 0; mote < count; mote += 1) {
    const baseX = x + random() * w;
    const baseY = y + random() * h;
    const mx = baseX + Math.sin(t * 0.3 + mote * 2.1) * 7;
    const my = baseY + Math.cos(t * 0.22 + mote * 1.3) * 5 - ((t * 3 + mote * 13) % 22);
    ctx.globalAlpha = 0.16 + 0.13 * Math.sin(t * 0.9 + mote);
    ctx.beginPath();
    ctx.arc(mx, my, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** A five-pointed star path centred at (cx, cy). */
export function starPath(ctx, cx, cy, outer, inner, rotation = -Math.PI / 2) {
  ctx.beginPath();
  for (let point = 0; point < 10; point += 1) {
    const radius = point % 2 === 0 ? outer : inner;
    const angle = rotation + (point * Math.PI) / 5;
    const px = cx + Math.cos(angle) * radius;
    const py = cy + Math.sin(angle) * radius;
    if (point === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** A crescent moon: a disc with an offset disc of sky punched back over it. */
export function crescentMoon(ctx, cx, cy, radius, moonColour, skyColour) {
  ctx.fillStyle = moonColour;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skyColour;
  ctx.beginPath();
  ctx.arc(cx + radius * 0.45, cy - radius * 0.28, radius * 0.82, 0, Math.PI * 2);
  ctx.fill();
}

/** A candle or lamp flame that breathes with time: teardrop with a bright heart. */
export function flameShape(ctx, cx, cy, size, t, phase = 0) {
  const sway = Math.sin(t * 6 + phase) * size * 0.12;
  const stretch = 1 + Math.sin(t * 8.3 + phase) * 0.08;
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * stretch);
  ctx.bezierCurveTo(cx + size * 0.55 + sway, cy - size * 0.3, cx + size * 0.4, cy + size * 0.35, cx, cy + size * 0.5);
  ctx.bezierCurveTo(cx - size * 0.4, cy + size * 0.35, cx - size * 0.55 + sway, cy - size * 0.3, cx, cy - size * stretch);
  ctx.closePath();
}
