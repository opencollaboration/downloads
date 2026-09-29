import { cpSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Complete the standalone build.
 *
 * `output: 'standalone'` emits a self-contained server but deliberately leaves
 * out `public/` and `.next/static`, on the assumption they are served from a
 * CDN. They are not here, so they are copied in to make `.next/standalone` a
 * complete, runnable artifact.
 *
 * Running this as part of `npm run build` means the container image and a local
 * `npm start` serve exactly the same thing.
 */

const root = process.cwd();
const standaloneDir = join(root, '.next', 'standalone');

if (!existsSync(standaloneDir)) {
  console.error(
    'postbuild: .next/standalone is missing. Run `next build` with `output: "standalone"` first.',
  );
  process.exit(1);
}

const copies: { from: string; to: string; required: boolean }[] = [
  { from: join(root, 'public'), to: join(standaloneDir, 'public'), required: false },
  {
    from: join(root, '.next', 'static'),
    to: join(standaloneDir, '.next', 'static'),
    required: true,
  },
];

for (const { from, to, required } of copies) {
  if (!existsSync(from)) {
    if (required) {
      console.error(`postbuild: expected ${from} to exist.`);
      process.exit(1);
    }

    continue;
  }

  cpSync(from, to, { recursive: true });
}

console.log('postbuild: standalone output is complete.');
