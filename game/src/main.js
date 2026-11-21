// main.js — the cabinet's front door. It builds the controller and the renderer, feeds them
// pointer and keyboard input, runs the frame loop, and stages the screenshot scenes the maker's
// shots.json names (?shot&scene&found): a staged plate is dealt, part-found and frozen, so the
// maker's screenshots show the game exactly mid-hunt.

import { GameController } from './engine/GameController.js';
import {
  DualCanvasRenderer, artPointFromStage,
} from './render/DualCanvasRenderer.js';
import { HINT_BUTTON_RECT } from './ui/HudOverlay.js';
import { SoundEffects } from './audio/SoundEffects.js';
import { ClockmakerWorkshop } from './scenes/ClockmakerWorkshop.js';
import { BotanicalConservatory } from './scenes/BotanicalConservatory.js';
import { HarborLighthouse } from './scenes/HarborLighthouse.js';
import { ObservatoryLibrary } from './scenes/ObservatoryLibrary.js';
import { LanternNightMarket } from './scenes/LanternNightMarket.js';

const SCENES = [
  ClockmakerWorkshop,
  BotanicalConservatory,
  HarborLighthouse,
  ObservatoryLibrary,
  LanternNightMarket,
];

const canvas = document.getElementById('stage');
const statusLine = document.getElementById('status');
const game = new GameController(SCENES);
const renderer = new DualCanvasRenderer(canvas);
const sound = new SoundEffects();

/** Announce the state of the hunt to assistive technology (and keep it honest). */
function announce(message) {
  statusLine.textContent = message;
}

/** Convert a pointer event to stage coordinates (the canvas is CSS-scaled to fit). */
function stagePointFromEvent(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) * (canvas.width / rect.width),
    y: (event.clientY - rect.top) * (canvas.height / rect.height),
  };
}

/** Play the sound and the announcement that match an inspection's outcome. */
function reportInspection(result) {
  if (result === 'found') {
    sound.playFoundChime(game.foundCount());
    announce(`Found ${game.foundCount()} of ${game.chosen.length}. ${game.remainingCount()} remaining.`);
  } else if (result === 'won') {
    sound.playPlateComplete();
    announce(`Plate restored! All ${game.chosen.length} differences found. Press N for the next plate.`);
  } else if (result === 'miss') {
    sound.playMissThud();
    announce(`Not a difference. ${game.remainingCount()} still hidden, and three seconds lost.`);
  }
}

canvas.addEventListener('pointermove', (event) => {
  const point = stagePointFromEvent(event);
  const art = artPointFromStage(point.x, point.y);
  if (art === null) {
    game.loupe.active = false;
    return;
  }
  game.loupe = { active: true, plate: art.plate, x: art.x, y: art.y };
});

canvas.addEventListener('pointerdown', (event) => {
  sound.ensureContext();
  const point = stagePointFromEvent(event);
  if (
    point.x >= HINT_BUTTON_RECT.x && point.x <= HINT_BUTTON_RECT.x + HINT_BUTTON_RECT.w
    && point.y >= HINT_BUTTON_RECT.y && point.y <= HINT_BUTTON_RECT.y + HINT_BUTTON_RECT.h
  ) {
    if (game.useHint() !== null) sound.playHintPing();
    return;
  }
  // The plate pips in the header jump straight to a plate.
  for (let index = 0; index < game.scenes.length; index += 1) {
    const px = 640 + (index - (game.scenes.length - 1) / 2) * 30;
    if (Math.abs(point.x - px) <= 11 && Math.abs(point.y - 45) <= 11) {
      game.startPlate(index);
      announce(`${game.currentScene().title}: find ${game.chosen.length} differences.`);
      return;
    }
  }
  const art = artPointFromStage(point.x, point.y);
  if (art !== null) reportInspection(game.inspect(art.x, art.y, art.plate));
});

window.addEventListener('keydown', (event) => {
  const key = event.key;
  const step = event.shiftKey ? 34 : 14;
  let handled = true;
  if (key === 'ArrowLeft' || key === 'a') game.moveLoupe(-step, 0);
  else if (key === 'ArrowRight' || key === 'd') game.moveLoupe(step, 0);
  else if (key === 'ArrowUp' || key === 'w') game.moveLoupe(0, -step);
  else if (key === 'ArrowDown' || key === 's') game.moveLoupe(0, step);
  else if (key === 'Enter' || key === ' ') {
    if (game.loupe.active) reportInspection(game.inspect(game.loupe.x, game.loupe.y, game.loupe.plate));
  } else if (key === 'h' || key === 'H') {
    if (game.useHint() !== null) sound.playHintPing();
  } else if (key === 'n' || key === 'N') {
    game.startPlate((game.sceneIndex + 1) % game.scenes.length);
    announce(`${game.currentScene().title}: find ${game.chosen.length} differences.`);
  } else if (key === 'r' || key === 'R') {
    game.startPlate(game.sceneIndex);
    announce(`${game.currentScene().title} again: find ${game.chosen.length} differences.`);
  } else if (key >= '1' && key <= String(game.scenes.length)) {
    game.startPlate(Number(key) - 1);
    announce(`${game.currentScene().title}: find ${game.chosen.length} differences.`);
  } else {
    handled = false;
  }
  if (handled) event.preventDefault();
});

// Screenshot staging: ?shot&scene=<index>&found=<count> deals a part-found plate and freezes
// the stage clock, so the frame the maker captures is composed, not lucky.
const params = new URLSearchParams(window.location.search);
if (params.has('shot')) {
  const sceneIndex = Math.max(0, Math.min(SCENES.length - 1, Number(params.get('scene') ?? 0)));
  const foundCount = Math.max(0, Math.min(6, Number(params.get('found') ?? 3)));
  game.stageForScreenshot(sceneIndex, foundCount);
  announce(`${game.currentScene().title}: ${game.foundCount()} found, ${game.remainingCount()} remaining.`);
  renderer.drawFrame(game, 2.35);
  requestAnimationFrame(() => renderer.drawFrame(game, 2.35));
} else {
  announce(`${game.currentScene().title}: find ${game.chosen.length} differences.`);
  let lastTimestamp = performance.now();
  const frame = (timestamp) => {
    const dt = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
    lastTimestamp = timestamp;
    game.update(dt, timestamp / 1000);
    renderer.drawFrame(game, timestamp / 1000);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
