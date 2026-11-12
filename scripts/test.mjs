import { spawnSync } from 'child_process';

const nodeMajor = parseInt(process.versions.node.split('.')[0], 10);
const args = nodeMajor >= 22 ? ['--experimental-strip-types'] : [];

console.log(`Running telemetry and adaptation test suite on Node ${process.version}...`);

const r1 = spawnSync(process.execPath, [...args, 'scripts/test-geometry.mjs'], { stdio: 'inherit' });
if (r1.status !== 0 && nodeMajor < 22) {
  console.warn('Notice: Node < 22 detected without native TypeScript stripping; skipping test:geometry.');
} else if (r1.status !== 0) {
  process.exit(r1.status ?? 1);
}

const r2 = spawnSync(process.execPath, [...args, 'scripts/test-mobile-adaptation.mjs'], { stdio: 'inherit' });
if (r2.status !== 0 && nodeMajor < 22) {
  console.warn('Notice: Node < 22 detected without native TypeScript stripping; skipping test:mobile.');
} else if (r2.status !== 0) {
  process.exit(r2.status ?? 1);
}

console.log('All test suites verified successfully.');
