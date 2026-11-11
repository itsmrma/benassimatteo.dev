// scripts/sync-demos.mjs
// Copies built demos from their respective project builds into portfolio public/demos/

import { cp, mkdir, rm, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function syncOxideDemo() {
  const websiteDist = path.resolve(
    root,
    '../../projects/getoxide/website/dist-demo',
  );
  const targetDir = path.resolve(root, 'public/demos/oxide');
  const versionFile = path.resolve(
    root,
    '../../projects/getoxide/website/VERSION',
  );

  if (!existsSync(websiteDist)) {
    console.error(`[sync-demos] Error: ${websiteDist} not found. Run "pnpm run build:demo" in website first.`);
    process.exit(1);
  }

  console.log(`[sync-demos] Syncing Oxide demo from ${websiteDist} to ${targetDir}...`);
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(websiteDist, targetDir, { recursive: true });

  if (existsSync(versionFile)) {
    const version = await readFile(versionFile, 'utf8');
    await writeFile(path.join(targetDir, 'VERSION'), version.trim() + '\n');
    console.log(`[sync-demos] Pinned Oxide commit: ${version.trim()}`);
  }

  console.log('[sync-demos] Successfully synced Oxide demo to public/demos/oxide');
}

async function main() {
  await syncOxideDemo();
}

main().catch((err) => {
  console.error('[sync-demos] Failed:', err);
  process.exit(1);
});
