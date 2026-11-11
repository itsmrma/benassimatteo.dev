import test from 'node:test';
import assert from 'node:assert/strict';
import { applyDrag, clampToStage, computePreset } from '../src/components/desktop/geometry.ts';

test('geometry: applyDrag handles 8 directions and move correctly', () => {
  const limits = { stageW: 1000, stageH: 800, minW: 300, minH: 200 };
  const start = { left: 100, top: 100, right: 600, bottom: 500 }; // w=500, h=400

  // 1. East (resize right edge)
  const east1 = applyDrag(start, 'e', 50, 0, limits);
  assert.equal(east1.left, 100, 'Left edge must stay pinned');
  assert.equal(east1.right, 650, 'Right edge moves by dx');
  assert.equal(east1.top, 100);
  assert.equal(east1.bottom, 500);

  // East clamped by minW
  const eastMin = applyDrag(start, 'e', -300, 0, limits);
  assert.equal(eastMin.right, 400, 'Right edge cannot shrink below left + minW');

  // East clamped by stageW
  const eastMax = applyDrag(start, 'e', 600, 0, limits);
  assert.equal(eastMax.right, 1000, 'Right edge clamped to stageW');

  // 2. West (resize left edge)
  const west1 = applyDrag(start, 'w', -50, 0, limits);
  assert.equal(west1.left, 50);
  assert.equal(west1.right, 600, 'Right edge must stay pinned');

  // West clamped by 0
  const west0 = applyDrag(start, 'w', -200, 0, limits);
  assert.equal(west0.left, 0, 'Left edge cannot go below 0');

  // West clamped by minW
  const westMin = applyDrag(start, 'w', 400, 0, limits);
  assert.equal(westMin.left, 300, 'Left edge cannot pass right - minW');

  // 3. North (resize top edge)
  const north1 = applyDrag(start, 'n', 0, 50, limits);
  assert.equal(north1.top, 150);
  assert.equal(north1.bottom, 500, 'Bottom edge must stay pinned');

  // 4. South (resize bottom edge)
  const south1 = applyDrag(start, 's', 0, 100, limits);
  assert.equal(south1.top, 100, 'Top edge must stay pinned');
  assert.equal(south1.bottom, 600);

  // 5. Corner SE
  const se1 = applyDrag(start, 'se', 50, 50, limits);
  assert.equal(se1.left, 100);
  assert.equal(se1.top, 100);
  assert.equal(se1.right, 650);
  assert.equal(se1.bottom, 550);

  // 6. Corner NW
  const nw1 = applyDrag(start, 'nw', -40, -40, limits);
  assert.equal(nw1.left, 60);
  assert.equal(nw1.top, 60);
  assert.equal(nw1.right, 600);
  assert.equal(nw1.bottom, 500);

  // 7. Move
  const move1 = applyDrag(start, 'move', 100, 100, limits);
  assert.equal(move1.left, 200);
  assert.equal(move1.top, 200);
  assert.equal(move1.right, 700);
  assert.equal(move1.bottom, 600);

  // Move clamped to stage boundaries
  const moveMax = applyDrag(start, 'move', 600, 600, limits);
  assert.equal(moveMax.left, 500, 'Window cannot move past stageW - w');
  assert.equal(moveMax.top, 400, 'Window cannot move past stageH - h');
  assert.equal(moveMax.right, 1000);
  assert.equal(moveMax.bottom, 800);

  const moveMin = applyDrag(start, 'move', -300, -300, limits);
  assert.equal(moveMin.left, 0);
  assert.equal(moveMin.top, 0);
  assert.equal(moveMin.right, 500);
  assert.equal(moveMin.bottom, 400);
});

test('geometry: clampToStage and computePreset', () => {
  const rect = { left: 500, top: 400, right: 1100, bottom: 900 };
  const clamped = clampToStage(rect, 800, 600, 300, 200);
  assert.ok(clamped.right <= 800, 'Clamped within stageW');
  assert.ok(clamped.bottom <= 600, 'Clamped within stageH');
  assert.ok(clamped.left >= 0, 'Left >= 0');
  assert.ok(clamped.top >= 0, 'Top >= 0');

  const fill = computePreset('fill', 800, 600);
  assert.deepEqual(fill, { left: 0, top: 0, right: 800, bottom: 600 });

  const compact = computePreset('compact', 800, 600);
  assert.ok(compact.right - compact.left < 800);
  assert.ok(compact.bottom - compact.top < 600);
});
