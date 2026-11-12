import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isMobileViewport,
  calculateScrollProgress,
  computeActiveSector,
  parseSectorNumber,
} from '../src/utils/mobileAdaptation.ts';

test('mobileAdaptation: isMobileViewport correctly detects mobile vs desktop', () => {
  // Mobile widths (< 820px) should return true regardless of pointer type
  assert.equal(isMobileViewport(320, false), true, '320px screen is mobile');
  assert.equal(isMobileViewport(375, false), true, '375px iPhone screen is mobile');
  assert.equal(isMobileViewport(768, false), true, '768px portrait tablet is mobile');
  assert.equal(isMobileViewport(819, false), true, '819px viewport is mobile');

  // Coarse pointer devices should return true even at larger viewports (e.g. touch tablets)
  assert.equal(isMobileViewport(820, true), true, '820px coarse pointer is mobile adaptation');
  assert.equal(isMobileViewport(1024, true), true, '1024px iPad touch is mobile adaptation');

  // Desktop widths (>= 820px) with fine pointer should return false (preserve desktop snapping)
  assert.equal(isMobileViewport(820, false), false, '820px fine pointer is desktop');
  assert.equal(isMobileViewport(1024, false), false, '1024px fine pointer is desktop');
  assert.equal(isMobileViewport(1440, false), false, '1440px desktop is desktop');
  assert.equal(isMobileViewport(1920, false), false, '1920px desktop is desktop');
});

test('mobileAdaptation: calculateScrollProgress handles bounds and progress accurately', () => {
  // At top
  assert.equal(calculateScrollProgress(0, 5000, 1000), 0, 'Top of page is 0%');

  // Halfway
  assert.equal(calculateScrollProgress(2000, 5000, 1000), 50, 'Midpoint is 50%');

  // At bottom
  assert.equal(calculateScrollProgress(4000, 5000, 1000), 100, 'Bottom of page is 100%');

  // Clamping over-scroll / bounce (iOS negative scroll or rubber-band bottom)
  assert.equal(calculateScrollProgress(-50, 5000, 1000), 0, 'Negative over-scroll clamped to 0%');
  assert.equal(calculateScrollProgress(4500, 5000, 1000), 100, 'Past-bottom over-scroll clamped to 100%');

  // Non-scrollable or equal height
  assert.equal(calculateScrollProgress(0, 1000, 1000), 0, 'Non-scrollable container returns 0%');
  assert.equal(calculateScrollProgress(100, 800, 1000), 0, 'Content smaller than container returns 0%');
});

test('mobileAdaptation: parseSectorNumber parses panel ID correctly', () => {
  assert.equal(parseSectorNumber('panel-1'), 1);
  assert.equal(parseSectorNumber('panel-04'), 4);
  assert.equal(parseSectorNumber('panel-9'), 9);
  assert.equal(parseSectorNumber('invalid'), 1, 'Fallback to 1 on invalid ID');
});

test('mobileAdaptation: computeActiveSector tracks single-height panels', () => {
  const viewportHeight = 800;
  // Three standard 800px panels in viewport coords
  // Panel 1 currently fills viewport
  const panelsState1 = [
    { id: 'panel-1', top: 0, bottom: 800 },
    { id: 'panel-2', top: 800, bottom: 1600 },
    { id: 'panel-3', top: 1600, bottom: 2400 },
  ];
  assert.equal(computeActiveSector(panelsState1, viewportHeight), 'panel-1');

  // Scrolled down: Panel 2 now occupies the reading focal area (top: -300, bottom: 500)
  const panelsState2 = [
    { id: 'panel-1', top: -700, bottom: 100 },
    { id: 'panel-2', top: 100, bottom: 900 },
    { id: 'panel-3', top: 900, bottom: 1700 },
  ];
  assert.equal(computeActiveSector(panelsState2, viewportHeight), 'panel-2');
});

test('mobileAdaptation: computeActiveSector reliably tracks tall panels exceeding viewport height', () => {
  const viewportHeight = 700;
  // Panel 1: standard (700px)
  // Panel 2: TALL panel (2100px - 3x viewport height!)
  // Panel 3: standard (700px)

  // 1. User scrolls into the top of tall Panel 2
  const tallPanelTop = [
    { id: 'panel-1', top: -600, bottom: 100 },
    { id: 'panel-2', top: 100, bottom: 2200 },
    { id: 'panel-3', top: 2200, bottom: 2900 },
  ];
  assert.equal(computeActiveSector(tallPanelTop, viewportHeight), 'panel-2', 'Enters tall Panel 2');

  // 2. User scrolls into the deep middle of tall Panel 2:
  // Top is way off-screen (-1000px), bottom is far below (+1100px).
  // Standard IntersectionObserver with 0.45 threshold fails here because visible area / total area is only 700/2100 = 0.33!
  const tallPanelMiddle = [
    { id: 'panel-1', top: -1700, bottom: -1000 },
    { id: 'panel-2', top: -1000, bottom: 1100 },
    { id: 'panel-3', top: 1100, bottom: 1800 },
  ];
  assert.equal(
    computeActiveSector(tallPanelMiddle, viewportHeight),
    'panel-2',
    'Middle of tall panel must remain active even though top and bottom are off-screen'
  );

  // 3. User is near the bottom of tall Panel 2
  const tallPanelNearBottom = [
    { id: 'panel-1', top: -2500, bottom: -1800 },
    { id: 'panel-2', top: -1800, bottom: 300 },
    { id: 'panel-3', top: 300, bottom: 1000 },
  ];
  assert.equal(
    computeActiveSector(tallPanelNearBottom, viewportHeight),
    'panel-2',
    'Near bottom of tall panel still active before transition'
  );

  // 4. Panel 3 enters reading focal line (e.g. top <= 0.35 * 700 = 245)
  const panel3Active = [
    { id: 'panel-1', top: -2700, bottom: -2000 },
    { id: 'panel-2', top: -2000, bottom: 100 },
    { id: 'panel-3', top: 100, bottom: 800 },
  ];
  assert.equal(
    computeActiveSector(panel3Active, viewportHeight),
    'panel-3',
    'Transitions smoothly to Panel 3 once it crosses the focal threshold'
  );
});

test('mobileAdaptation: computeActiveSector handles edge positions (start and end)', () => {
  const viewportHeight = 800;
  const panels = [
    { id: 'panel-1', top: 0, bottom: 800 },
    { id: 'panel-2', top: 800, bottom: 1600 },
    { id: 'panel-9', top: 5000, bottom: 5800 },
  ];

  // At start of page
  assert.equal(
    computeActiveSector(panels, viewportHeight, { isAtStart: true }),
    'panel-1',
    'isAtStart guarantees panel-1 is active'
  );

  // At end of page
  assert.equal(
    computeActiveSector(panels, viewportHeight, { isAtEnd: true }),
    'panel-9',
    'isAtEnd guarantees last panel is active'
  );
});
