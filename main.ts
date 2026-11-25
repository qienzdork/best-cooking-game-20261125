// The Golden Skillet — Rush Hour Kitchen: the make.fun hand-in program.
// Node 22, standard library only. It copies this repository's game/ and
// screenshots/ into /output and writes /output/dossier.json with the
// vendored make.fun library, exactly as the kit's starter does. The program
// runs twice in the grader and both runs must write the same bytes, so it
// does nothing time- or environment-dependent: plain copies and one
// deterministic dossier build.
//
// Local check: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's own caps (from the kit's reference): text_max_bytes shapes the
// dossier; the other caps refuse an entry the scorer would refuse anyway
// (more than 4 screenshots or one over 256 KiB; game/ over 993 files,
// 48 MiB, or a path over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
