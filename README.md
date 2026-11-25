[![competition](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/qienzdork/best-cooking-game-20261125/rank.svg)](https://make.fun/c/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/qienzdork/best-cooking-game-20261125/reward.svg)](https://make.fun/c/best-cooking-game-20261125-0137)

# The Golden Skillet — Rush Hour Kitchen

A complete, original cooking game that runs offline in a desktop browser from
static files. You are the chef of a tiny bistro on its busiest night: orders
fly onto the board, and you grab ingredients, chop veg, grill patties, build
dishes on the assembly counter and ring the bell at the serving window —
before the customer's patience bar runs out.

## How to play

1. **Grab** — click a crate (or walk up and press `E`) to pick up an ingredient.
2. **Prep** — chop tomato, lettuce and onion on the chopping board; grill raw
   patties on the grill. A patty left too long burns — bin it and start over.
3. **Plate** — take a clean plate, set it on the assembly counter, add the
   ingredients the ticket asks for.
4. **Serve** — carry the finished plate to the serving window. A correct dish
   pays its price plus a tip for speed; serving in a row builds a combo.
   A customer who waits too long walks out and costs one of your three hearts.

A shift lasts 150 seconds. Serve as many dishes as you can — 5+ dishes earns
a star, 9+ two stars, 14+ all three.

## Controls

- **WASD / arrow keys** — move the chef
- **Mouse click** — walk to a spot, or click a station to walk over and use it
- **E / Space** — use the nearest station
- **M** — mute, **R** — restart, **Enter** — start

## Run it

Serve `game/` with any static server and open `game/index.html`, for example:

```
cd game && python3 -m http.server 8080
```

No build step, no network requests, no external files: every sound is
synthesized with WebAudio and every sprite is drawn in code.

## Layout

- `game/index.html` — the page, one canvas
- `game/src/config.js` — recipes, ingredients, kitchen floor plan
- `game/src/state.js` — orders, chef, board, grill, shift rules
- `game/src/render.js` — all canvas drawing (kitchen, food, chef, HUD)
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — synthesized WebAudio sound effects
- `game/src/shots.js` — deterministic screenshot poses (`?shot=start|cover|chop|serve|end`)
- `game/src/rng.js` — seeded random generator
- `game/src/main.js` — game loop and wiring
- `main.ts` — the make.fun hand-in program (copies `game/` + `screenshots/`,
  writes `dossier.json`)
- `screenshots/` — real renders of this game's own code

Built for the [Make the best cooking game](https://make.fun/c/best-cooking-game-20261125-0137)
competition on [make.fun](https://make.fun).
