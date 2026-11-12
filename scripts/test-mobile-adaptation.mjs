import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isMobileViewport,
  calculateScrollProgress,
  computeActiveSector,
  parseSectorNumber,
  getDesktopWindowConfig,
  calculateWindowDimensions,
  getAppPreviewMode,
  OXIDE_SHOWCASE_PILLARS,
  TelemetryAnimationController,
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

test('mobileWindow: suppresses traffic lights and 8 resize handles on mobile / touch mode', () => {
  // Mobile configuration
  const mobileConfig = getDesktopWindowConfig(true);
  assert.equal(mobileConfig.hideTrafficLights, true, 'Traffic lights must be suppressed on mobile');
  assert.equal(mobileConfig.hideResizeHandles, true, '8 resize handles must be suppressed on mobile');
  assert.equal(mobileConfig.aspectRatio, '16 / 10', 'Intrinsic 16:10 aspect ratio enforced on mobile');
  assert.equal(mobileConfig.position, 'relative', 'Mobile window uses relative positioning');
  assert.equal(mobileConfig.transform, 'none', 'Mobile window suppresses absolute translate3d');

  // Desktop configuration
  const desktopConfig = getDesktopWindowConfig(false);
  assert.equal(desktopConfig.hideTrafficLights, false, 'Traffic lights visible on desktop');
  assert.equal(desktopConfig.hideResizeHandles, false, '8 resize handles present on desktop');
  assert.equal(desktopConfig.aspectRatio, null, 'No forced aspect-ratio on desktop');
  assert.equal(desktopConfig.position, 'absolute', 'Desktop window is positioned absolutely in stage');
});

test('mobileWindow: enforces non-zero intrinsic aspect ratio and eliminates layout shift', () => {
  const widths = [320, 360, 375, 414, 768];

  for (const w of widths) {
    const dim = calculateWindowDimensions(w, true);
    assert.ok(dim.height > 0, `Height for width ${w} must be strictly positive`);
    // 16:10 aspect ratio: height should match w / 1.6 or clamped to minH
    const expectedHeight = Math.max(240, Math.round(w / 1.6));
    assert.equal(dim.height, expectedHeight, `Height for ${w}px matches 16:10 or minH 240px`);
    assert.equal(dim.aspectRatio, '16 / 10', 'Enforces 16:10 aspect ratio');
  }

  // Desktop check
  const desktopDim = calculateWindowDimensions(1200, false);
  assert.equal(desktopDim.aspectRatio, null, 'Desktop dimensions are unconstrained by mobile aspect ratio');
});

test('touchSafePreview: replaces microscopic inline iframe with crisp showcase contract on mobile', () => {
  const mobileMode = getAppPreviewMode({ isMobile: true });

  assert.equal(mobileMode.allowInlineIframe, false, 'Inline interactive iframe is forbidden on mobile');
  assert.equal(mobileMode.hasScrollTrappingRisk, false, 'Touch-safe showcase has zero scroll trapping risk');
  assert.equal(mobileMode.showcaseActive, true, 'Visual feature showcase is active');
  assert.equal(mobileMode.supportsFullscreenModal, true, 'Fullscreen demo modal launcher is available');

  // Verify the 3 key architectural pillars are present
  assert.ok(Array.isArray(mobileMode.pillars), 'Pillars list should be provided');
  assert.equal(mobileMode.pillars.length, 3, 'Must highlight 3 architectural pillars');

  const pillarKeys = mobileMode.pillars.map((p) => p.key);
  assert.ok(pillarKeys.includes('worktrees'), 'Includes Worktree Concurrency pillar');
  assert.ok(pillarKeys.includes('premerge'), 'Includes Pre-Merge Verification Gate pillar');
  assert.ok(pillarKeys.includes('tauri2'), 'Includes Tauri 2 IPC Bridge pillar');

  // Desktop check: desktop mounts iframe directly
  const desktopMode = getAppPreviewMode({ isMobile: false });
  assert.equal(desktopMode.allowInlineIframe, true, 'Desktop mounts inline iframe');
  assert.equal(desktopMode.showcaseActive, false, 'Desktop does not use mobile fallback showcase');
});

test('touchSafePreview: fullscreen web demo modal contract', () => {
  // Modal closed
  const closedState = getAppPreviewMode({ isMobile: true, isModalOpen: false });
  assert.equal(closedState.isModalActive, false);

  // Modal opened
  const openedState = getAppPreviewMode({ isMobile: true, isModalOpen: true });
  assert.equal(openedState.isModalActive, true, 'Modal is active');
  assert.equal(openedState.hasExitControl, true, 'Modal must have an explicit exit control');
  assert.equal(openedState.trapsPageScroll, false, 'Modal is isolated and does not hijack page scroll');
});

test('telemetryAnimationController: coarse-pointer / touch devices disable cursor tracking & repulsion', () => {
  // Desktop fine pointer: tracking & repulsion enabled
  const desktopController = new TelemetryAnimationController({
    isMobile: false,
    isCoarsePointer: false,
  });
  assert.equal(desktopController.shouldTrackCursor(), true, 'Desktop fine pointer tracks cursor');
  assert.equal(desktopController.shouldApplyRepulsion(), true, 'Desktop fine pointer applies repulsion');

  // Touch / coarse pointer: tracking & repulsion strictly disabled
  const touchController = new TelemetryAnimationController({
    isMobile: true,
    isCoarsePointer: true,
  });
  assert.equal(touchController.shouldTrackCursor(), false, 'Touch device disables cursor tracking');
  assert.equal(touchController.shouldApplyRepulsion(), false, 'Touch device disables cursor repulsion physics');

  // Dynamically updating device profile (e.g. on orientation/window change)
  desktopController.setDeviceProfile({ isCoarsePointer: true });
  assert.equal(desktopController.shouldTrackCursor(), false, 'Dynamically switched to coarse pointer');
  assert.equal(desktopController.shouldApplyRepulsion(), false, 'Repulsion disabled after switch');
});

test('telemetryAnimationController: mobile scroll pauses animation loop and resumes when settled', async () => {
  let startedCount = 0;
  let stoppedCount = 0;

  const mobileController = new TelemetryAnimationController({
    isMobile: true,
    isCoarsePointer: true,
    scrollSettleTimeoutMs: 20,
    onStart: () => { startedCount++; },
    onStop: () => { stoppedCount++; },
  });

  mobileController.start();
  assert.equal(mobileController.getIsRunning(), true, 'Controller starts running');
  assert.equal(startedCount, 1, 'onStart callback fired');

  // Active scroll gesture begins
  mobileController.handleScroll();
  assert.equal(mobileController.getIsScrolling(), true, 'isScrolling is true during active scroll');
  assert.equal(mobileController.shouldAnimate(), false, 'shouldAnimate is false during active scroll');
  assert.equal(mobileController.getIsRunning(), false, 'Animation loop is paused during active scroll');
  assert.equal(stoppedCount, 1, 'onStop callback fired when scroll begins');

  // Repeated scroll events during active gesture keep it paused
  mobileController.handleScroll();
  mobileController.handleScroll();
  assert.equal(mobileController.getIsRunning(), false, 'Remains paused during repeated scroll events');

  // Wait for scroll settle timeout
  await new Promise((resolve) => setTimeout(resolve, 50));

  assert.equal(mobileController.getIsScrolling(), false, 'isScrolling resets to false after settling');
  assert.equal(mobileController.shouldAnimate(), true, 'shouldAnimate returns to true after settling');
  assert.equal(mobileController.getIsRunning(), true, 'Animation loop resumed smoothly');
  assert.equal(startedCount, 2, 'onStart callback fired to resume loop');

  mobileController.destroy();
});

test('telemetryAnimationController: desktop scroll does NOT throttle or pause animation loop', () => {
  let stoppedCount = 0;

  const desktopController = new TelemetryAnimationController({
    isMobile: false,
    isCoarsePointer: false,
    onStop: () => { stoppedCount++; },
  });

  desktopController.start();
  assert.equal(desktopController.getIsRunning(), true);

  // Desktop scroll event occurs
  desktopController.handleScroll();
  assert.equal(desktopController.getIsScrolling(), false, 'Desktop scroll does not engage mobile scroll pause');
  assert.equal(desktopController.shouldAnimate(), true, 'Desktop shouldAnimate remains true');
  assert.equal(desktopController.getIsRunning(), true, 'Desktop animation loop stays running');
  assert.equal(stoppedCount, 0, 'onStop callback never fired on desktop scroll');

  desktopController.destroy();
});

test('telemetryAnimationController: completely halts animation loop when document visibility is hidden', () => {
  let startedCount = 0;
  let stoppedCount = 0;

  const controller = new TelemetryAnimationController({
    isMobile: false,
    onStart: () => { startedCount++; },
    onStop: () => { stoppedCount++; },
  });

  controller.start();
  assert.equal(controller.getIsRunning(), true);
  assert.equal(startedCount, 1);

  // Tab hidden / backgrounded
  controller.handleVisibilityChange(true);
  assert.equal(controller.shouldAnimate(), false, 'shouldAnimate false when document hidden');
  assert.equal(controller.getIsRunning(), false, 'Loop stopped when document hidden');
  assert.equal(stoppedCount, 1, 'onStop fired on document hidden');

  // Tab returned to visible
  controller.handleVisibilityChange(false);
  assert.equal(controller.shouldAnimate(), true, 'shouldAnimate true when document visible');
  assert.equal(controller.getIsRunning(), true, 'Loop resumed when document visible');
  assert.equal(startedCount, 2, 'onStart fired on return to visible');

  controller.destroy();
});

test('telemetryAnimationController: strictly respects prefers-reduced-motion by rendering static frame and halting loop', () => {
  let startedCount = 0;
  let stoppedCount = 0;
  let staticFrameCount = 0;

  const reducedMotionController = new TelemetryAnimationController({
    prefersReducedMotion: true,
    onStart: () => { startedCount++; },
    onStop: () => { stoppedCount++; },
    onRenderStaticFrame: () => { staticFrameCount++; },
  });

  assert.equal(reducedMotionController.shouldAnimate(), false, 'shouldAnimate false under reduced motion');
  assert.equal(reducedMotionController.shouldApplyRepulsion(), false, 'Repulsion disabled under reduced motion');

  reducedMotionController.start();
  assert.equal(reducedMotionController.getIsRunning(), false, 'Animation loop never starts under reduced motion');
  assert.equal(startedCount, 0, 'onStart never called');
  assert.equal(staticFrameCount, 1, 'Single static CAD grid frame rendered');

  // Visibility change while under reduced motion should NOT start animation loop
  reducedMotionController.handleVisibilityChange(false);
  assert.equal(reducedMotionController.getIsRunning(), false, 'Visibility change to visible does not start loop');
  assert.equal(startedCount, 0);

  // Dynamic switch to reduced motion while running halts loop and triggers static frame
  const normalController = new TelemetryAnimationController({
    prefersReducedMotion: false,
    onStart: () => { startedCount++; },
    onStop: () => { stoppedCount++; },
    onRenderStaticFrame: () => { staticFrameCount++; },
  });

  normalController.start();
  assert.equal(normalController.getIsRunning(), true);

  normalController.setReducedMotion(true);
  assert.equal(normalController.getIsRunning(), false, 'Loop halted when reduced motion enabled');
  assert.equal(stoppedCount, 1, 'onStop called when reduced motion enabled');
  assert.equal(staticFrameCount, 2, 'Static frame rendered on transition to reduced motion');
});
