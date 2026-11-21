# Chronicle of Curiosities — a spot the difference cabinet

An original spot-the-difference game for the make.fun bounty
[Make the best spot the difference game](https://make.fun/c/best-spot-the-difference-game-20261121-0451).

Five hand-drawn plates hang in the cabinet — *The Clockmaker's Midnight Workshop*, *The
Botanical Conservatory at Dusk*, *The Harbor Café & Lighthouse*, *The Grand Observatory
Library* and *The Lantern Night Market*. On each plate a restorer has quietly changed seven
details. Compare the original plate with its restored copy side by side, click a difference on
either picture to ring it in gold on both, and mind the great brass counter: it tells you how
many remain.

- **Pure static files** under `game/` — no build step, no network request; every illustration
  is layered procedural Canvas 2D art and every sound is synthesised with the Web Audio API.
- **Tactile hunting** — a magnifying loupe mirrored on the twin plate, sparkle bursts on a
  find, a shaken frame and three lost seconds on a smudge, a rechargeable hint that rings one
  hidden difference, and a clock that drains from gold to red.
- **Keyboard and mouse** — arrows/WASD move the loupe, Enter marks, H hints, N turns the
  plate, 1–5 jump between plates.

`main.ts` (Node 22, standard library only) hands the game in: it copies `game/` and
`screenshots/` to `/output` and writes `dossier.json` with the vendored `buildDossier`.

## License

MIT — see `LICENSE` (SPDX-License-Identifier: MIT).
