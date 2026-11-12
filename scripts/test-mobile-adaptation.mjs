import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isMobileViewport,
  calculateScrollProgress,
  computeActiveSector,
  parseSectorNumber,
  getHeroTelemetryMetrics,
  formatCompactTelemetryRibbon,
  getPodiumFinishes,
  getPodiumHierarchy,
  getStartingGridTimeline,
  shouldShowBottomStrip,
  SECTOR_WAYPOINTS,
  getSectorWaypoint,
  formatSectorTelemetryKicker,
  getContactSectorId,
  resolveWaypointScrollTarget,
  handleWaypointJump,
  getDesktopWindowConfig,
  calculateWindowDimensions,
  getAppPreviewMode,
  OXIDE_SHOWCASE_PILLARS,
  TelemetryAnimationController,
  MIN_TOUCH_TARGET_SIZE,
  CONTACT_ACTION_MIN_HEIGHT,
  getTouchTargetConfig,
  getAuxiliaryMachineryProjects,
  getMachineryGridConfig,
  getContactDeckActions,
  getTelemetryKickerConfig,
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

  // Breakpoint override (e.g. 1024px stage breakpoint)
  assert.equal(isMobileViewport(1023, false, 1024), true, '1023px is mobile with 1024px breakpoint');
  assert.equal(isMobileViewport(1024, false, 1024), false, '1024px is desktop with 1024px breakpoint');
  assert.equal(isMobileViewport(1280, false, 1024), false, '1280px is desktop with 1024px breakpoint');
  assert.equal(isMobileViewport(1280, true, 1024), true, '1280px touch is mobile with 1024px breakpoint');
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

test('mobileAdaptation: getHeroTelemetryMetrics and formatCompactTelemetryRibbon produce compact HUD format', () => {
  const metrics = getHeroTelemetryMetrics();
  assert.equal(metrics.length, 3, 'Hero metrics must contain exactly 3 KPI items');

  const [m1, m2, m3] = metrics;
  assert.equal(m1.value, '3x Podiums', 'KPI 01 value formatted for mobile HUD ribbon');
  assert.equal(m2.value, '27.3/30 avg', 'KPI 02 value formatted for mobile HUD ribbon');
  assert.equal(m3.value, '2026/27 Ready', 'KPI 03 value formatted for mobile HUD ribbon');

  const ribbon = formatCompactTelemetryRibbon(metrics);
  assert.equal(
    ribbon,
    '3x Podiums | 27.3/30 avg | 2026/27 Ready',
    'Compact telemetry HUD ribbon matches ticket acceptance criteria'
  );
});

test('mobileAdaptation: getPodiumHierarchy prioritizes P1 and compacts P2/P3 finishes', () => {
  const finishes = getPodiumFinishes();
  assert.equal(finishes.length, 3, 'Total hackathon podium finishes must be 3 (100% conversion)');

  const { p1Lead, summaryFinishes } = getPodiumHierarchy(finishes);

  // P1 Lead finish
  assert.equal(p1Lead.position, 'P1', 'P1 must be the top highlight');
  assert.equal(p1Lead.project, 'Garda Chiese Alert', 'P1 project is Garda Chiese Alert');
  assert.equal(p1Lead.highlight, true, 'P1 must have full telemetry highlight');
  assert.ok(p1Lead.githubUrl.includes('alert-app-garda-chiese'), 'P1 contains GitHub repo');

  // Summary finishes (P2 & P3)
  assert.equal(summaryFinishes.length, 2, 'P2 and P3 must be grouped into summary finishes');
  assert.equal(summaryFinishes[0].project, 'Smart Beam', 'Second finish is Smart Beam (SCIoTeM 2026)');
  assert.equal(summaryFinishes[1].project, 'P7M AI Summarizer', 'Third finish is P7M AI Summarizer (SCIoTeM 2025)');
  assert.equal(summaryFinishes[0].highlight, false, 'Summary finishes do not take full primary highlight');
});

test('mobileAdaptation: getStartingGridTimeline structures continuous chronological academic trajectory', () => {
  const timeline = getStartingGridTimeline();
  assert.equal(timeline.length, 4, 'Starting grid timeline must contain 4 continuous milestones');

  const [p01, p02, p03, p04] = timeline;

  // Milestone P01: UNIMORE
  assert.equal(p01.position, 'P01');
  assert.ok(p01.institution.includes('UNIMORE'), 'P01 is UNIMORE');
  assert.equal(p01.gradeHighlight, '27.3 / 30');
  assert.equal(p01.isCurrent, true, 'UNIMORE is the current ongoing degree');

  // Milestone P02: Novellini Internship
  assert.equal(p02.position, 'P02');
  assert.ok(p02.institution.includes('Novellini'), 'P02 is Novellini internship');

  // Milestone P03: ITIS Fermi
  assert.equal(p03.position, 'P03');
  assert.ok(p03.institution.includes('Fermi'), 'P03 is ITIS Fermi');
  assert.equal(p03.gradeHighlight, '100 / 100');

  // Milestone P04: Certifications
  assert.equal(p04.position, 'P04');
  assert.ok(p04.title.includes('Cambridge'), 'P04 is Cambridge certification');

  // Ensure every node has required timeline properties
  for (const node of timeline) {
    assert.ok(node.nodeId, 'Timeline node has unique nodeId');
    assert.ok(node.position, 'Timeline node has telemetry grid position');
    assert.ok(node.period, 'Timeline node has time period');
    assert.ok(node.title, 'Timeline node has milestone title');
  }
});

test('mobileAdaptation: shouldShowBottomStrip consolidates repetitive intermediate panels on mobile', () => {
  // On desktop: all panels show their bottom strip
  const allPanels = ['panel-1', 'panel-2', 'panel-3', 'panel-4', 'panel-5', 'panel-6', 'panel-7', 'panel-8', 'panel-9'];
  for (const pid of allPanels) {
    assert.equal(shouldShowBottomStrip(pid, false), true, `Desktop shows bottom strip for ${pid}`);
  }

  // On mobile: only panel-9 (finish lap) shows bottom strip; panel-1 hero strip is hidden to avoid mid-page footer
  assert.equal(shouldShowBottomStrip('panel-1', true), false, 'Mobile consolidates hero bottom links to prevent mid-page footer');
  assert.equal(shouldShowBottomStrip('panel-9', true), true, 'Mobile shows pit wall finish strip');

  // Intermediate panels (2 to 8) are streamlined to eliminate redundant vertical visual noise
  for (const pid of ['panel-2', 'panel-3', 'panel-4', 'panel-5', 'panel-6', 'panel-7', 'panel-8']) {
    assert.equal(shouldShowBottomStrip(pid, true), false, `Mobile consolidates redundant strip on ${pid}`);
  }
});

test('mobileWaypointHud: SECTOR_WAYPOINTS contains all 9 telemetry sectors', () => {
  assert.equal(Array.isArray(SECTOR_WAYPOINTS), true);
  assert.equal(SECTOR_WAYPOINTS.length, 9, 'Must have exactly 9 sectors');

  // Verify each sector structure
  const expectedSectors = [
    { num: '01', id: 'panel-1', title: 'CHASSIS' },
    { num: '02', id: 'panel-2', title: 'PODIUM' },
    { num: '03', id: 'panel-3', title: 'OXIDE' },
    { num: '04', id: 'panel-4', title: 'SYNCFORGE' },
    { num: '05', id: 'panel-5', title: 'SCROBBL' },
    { num: '06', id: 'panel-6', title: 'EMBEDDED' },
    { num: '07', id: 'panel-7', title: 'MACHINERY' },
    { num: '08', id: 'panel-8', title: 'GRID' },
    { num: '09', id: 'panel-9', title: 'CONTACT' },
  ];

  expectedSectors.forEach((exp, idx) => {
    const sector = SECTOR_WAYPOINTS[idx];
    assert.equal(sector.index, idx + 1);
    assert.equal(sector.num, exp.num);
    assert.equal(sector.id, exp.id);
    assert.equal(sector.title, exp.title);
    assert.ok(sector.label && sector.label.length > 0, `Sector ${exp.num} has descriptive label`);
  });
});

test('mobileWaypointHud: getSectorWaypoint returns correct waypoint by index or id', () => {
  assert.equal(getSectorWaypoint(1).title, 'CHASSIS');
  assert.equal(getSectorWaypoint(3).title, 'OXIDE');
  assert.equal(getSectorWaypoint('panel-3').title, 'OXIDE');
  assert.equal(getSectorWaypoint('panel-9').title, 'CONTACT');
  assert.equal(getSectorWaypoint(9).title, 'CONTACT');

  // Edge cases / fallback to 1
  assert.equal(getSectorWaypoint(99).title, 'CHASSIS', 'Out of bounds index falls back to sector 1');
  assert.equal(getSectorWaypoint('unknown').title, 'CHASSIS', 'Invalid id falls back to sector 1');
});

test('mobileWaypointHud: formatSectorTelemetryKicker formats active sector indicator', () => {
  // Closed state (default)
  assert.equal(formatSectorTelemetryKicker(1), '[ 01 // CHASSIS ▾ ]');
  assert.equal(formatSectorTelemetryKicker(3), '[ 03 // OXIDE ▾ ]');
  assert.equal(formatSectorTelemetryKicker('panel-3'), '[ 03 // OXIDE ▾ ]');
  assert.equal(formatSectorTelemetryKicker(9), '[ 09 // CONTACT ▾ ]');

  // Open state (arrow flipped up)
  assert.equal(formatSectorTelemetryKicker(3, true), '[ 03 // OXIDE ▴ ]');
  assert.equal(formatSectorTelemetryKicker('panel-9', true), '[ 09 // CONTACT ▴ ]');

  // Invalid sector falls back safely
  assert.equal(formatSectorTelemetryKicker(-1), '[ 01 // CHASSIS ▾ ]');
});

test('mobileWaypointHud: getContactSectorId returns panel-9 for direct quick action', () => {
  assert.equal(getContactSectorId(), 'panel-9');
});

test('mobileWaypointHud: resolveWaypointScrollTarget computes correct scroll target', () => {
  // Sector 1 scrolls to top on mobile
  const target1Mobile = resolveWaypointScrollTarget('panel-1', true);
  assert.equal(target1Mobile.targetId, 'panel-1');
  assert.equal(target1Mobile.isTop, true);

  // Sector 1 on desktop
  const target1Desktop = resolveWaypointScrollTarget('panel-1', false);
  assert.equal(target1Desktop.targetId, 'panel-1');
  assert.equal(target1Desktop.isTop, true);

  // Sector 3
  const target3 = resolveWaypointScrollTarget('panel-3', true);
  assert.equal(target3.targetId, 'panel-3');
  assert.equal(target3.isTop, false);

  // Contact (Sector 9)
  const target9 = resolveWaypointScrollTarget('panel-9', true);
  assert.equal(target9.targetId, 'panel-9');
  assert.equal(target9.isTop, false);

  // Numeric index input string '3' or 3
  assert.equal(resolveWaypointScrollTarget(3, true).targetId, 'panel-3');
});

test('mobileWaypointHud: handleWaypointJump invokes scroll callback and closes menu', () => {
  let scrolledTo = null;
  let menuClosed = false;

  const mockScrollTo = (targetId) => {
    scrolledTo = targetId;
  };
  const mockCloseMenu = () => {
    menuClosed = true;
  };

  handleWaypointJump('panel-4', mockScrollTo, mockCloseMenu);
  assert.equal(scrolledTo, 'panel-4', 'Invokes scroll callback with correct panel ID');
  assert.equal(menuClosed, true, 'Closes waypoint menu upon selection');

  // Contact shortcut jump
  scrolledTo = null;
  menuClosed = false;
  handleWaypointJump(getContactSectorId(), mockScrollTo, mockCloseMenu);
  assert.equal(scrolledTo, 'panel-9', 'Direct jump to Contact target');
  assert.equal(menuClosed, true, 'Closes menu upon direct contact jump');
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

test('touchTargetAccessibility: verifies WCAG minimum touch target dimensions across mobile interactive elements', () => {
  assert.ok(MIN_TOUCH_TARGET_SIZE >= 44, 'Base mobile touch target must be at least 44x44px (WCAG 2.5.5/2.5.8)');
  assert.ok(CONTACT_ACTION_MIN_HEIGHT >= 48, 'Contact deck actions must be at least 48px height for thumb friendliness');

  const mobileBtn = getTouchTargetConfig('button', true);
  assert.equal(mobileBtn.minHeight, 44);
  assert.equal(mobileBtn.minWidth, 44);
  assert.equal(mobileBtn.touchSafe, true);

  const mobileLink = getTouchTargetConfig('link', true);
  assert.equal(mobileLink.minHeight, 44);
  assert.equal(mobileLink.minWidth, 44);
  assert.equal(mobileLink.touchSafe, true);

  const mobileContact = getTouchTargetConfig('contact-action', true);
  assert.equal(mobileContact.minHeight, 48);
  assert.equal(mobileContact.minWidth, 48);
  assert.equal(mobileContact.touchSafe, true);

  const desktopBtn = getTouchTargetConfig('button', false);
  assert.equal(desktopBtn.minHeight, 32);
  assert.equal(desktopBtn.touchSafe, true);
});

test('machineryGrid: structures 6 hardware/lab projects into a responsive high-density card grid', () => {
  const projects = getAuxiliaryMachineryProjects();
  assert.equal(projects.length, 6, 'Must contain exactly 6 auxiliary machinery / lab projects');

  // Verify project identities and content
  const fanControl = projects.find((p) => p.id === 'amd-fan-control');
  assert.ok(fanControl, 'AMD Fan Control project exists');
  assert.equal(fanControl.tech, 'RUST FFI');
  assert.equal(fanControl.githubUrl, 'https://github.com/itsmrma/amd-fan-control');

  const truenas = projects.find((p) => p.id === 'truenas-homelab');
  assert.ok(truenas, 'TrueNAS Home Lab project exists');
  assert.equal(truenas.tech, 'ZFS / LINUX');

  const viessmann = projects.find((p) => p.id === 'viessmann-dashboard');
  assert.ok(viessmann, 'Viessmann Dashboard project exists');
  assert.equal(viessmann.tech, 'HOME ASSISTANT');
  assert.equal(viessmann.githubUrl, 'https://github.com/itsmrma/viesmann-dashboard-hass');

  const musicLib = projects.find((p) => p.id === 'uni-musiclib');
  assert.ok(musicLib, 'UNIMORE Music Library project exists');
  assert.equal(musicLib.tech, 'PYTHON / UV');
  assert.equal(musicLib.githubUrl, 'https://github.com/itsmrma/uni-musiclib-project');

  const musicHistory = projects.find((p) => p.id === 'music-history-analyzer');
  assert.ok(musicHistory, 'Music History Analyzer project exists');
  assert.equal(musicHistory.tech, 'LIVE APP');
  assert.equal(musicHistory.liveUrl, 'https://spotify-history-analyzer.benassimatteo.dev');
  assert.equal(musicHistory.githubUrl, 'https://github.com/itsmrma/spotify-history-analyzer');

  const credentials = projects.find((p) => p.id === 'language-credentials');
  assert.ok(credentials, 'Language credentials project exists');
  assert.equal(credentials.tech, 'PROFICIENCY');

  // Verify responsive grid layout config
  const desktopConfig = getMachineryGridConfig(false);
  assert.equal(desktopConfig.columns, 2, 'Desktop machinery grid uses 2 columns');
  assert.equal(desktopConfig.isCompact, false);
  assert.equal(desktopConfig.hasTouchActionLinks, false);

  const mobileConfig = getMachineryGridConfig(true);
  assert.equal(mobileConfig.columns, 1, 'Mobile machinery grid uses 1 column high-density format');
  assert.equal(mobileConfig.isCompact, true, 'Mobile machinery grid uses compact high-density cards');
  assert.equal(mobileConfig.hasTouchActionLinks, true, 'Mobile machinery cards have dedicated touch-friendly action links');
  assert.equal(mobileConfig.minTouchTarget, 44, 'Touch action links satisfy >= 44px touch target');
});

test('contactActionDeck: provides dedicated >= 48px direct action buttons with instant email copy feedback', () => {
  // Test initial state
  const initialActions = getContactDeckActions(false);
  assert.equal(initialActions.length, 4, 'Mobile contact deck has 4 direct primary actions');

  for (const action of initialActions) {
    assert.ok(
      action.minHeight >= 48,
      `Action ${action.id} height (${action.minHeight}px) must be >= 48px for thumb ergonomics`
    );
  }

  const emailAction = initialActions.find((a) => a.id === 'email');
  assert.ok(emailAction, 'Email direct action exists');
  assert.equal(emailAction.instantFeedback, true, 'Email action supports instant feedback indicator');
  assert.equal(emailAction.channelLabel, 'CHANNEL 01 // DIRECT', 'Email is Channel 01 Direct');
  assert.match(emailAction.label, /EMAIL/i);

  const githubAction = initialActions.find((a) => a.id === 'github');
  assert.ok(githubAction, 'GitHub action exists');
  assert.equal(githubAction.channelLabel, 'CHANNEL 02 // CODE', 'GitHub is Channel 02 Code');
  assert.equal(githubAction.href, 'https://github.com/itsmrma');

  const linkedinAction = initialActions.find((a) => a.id === 'linkedin');
  assert.ok(linkedinAction, 'LinkedIn action exists');
  assert.equal(linkedinAction.channelLabel, 'CHANNEL 03 // NETWORK', 'LinkedIn is Channel 03 Network');
  assert.equal(linkedinAction.href, 'https://www.linkedin.com/in/matteo-benassi/');

  const cvAction = initialActions.find((a) => a.id === 'cv');
  assert.ok(cvAction, 'CV download action exists');
  assert.equal(cvAction.channelLabel, 'CHANNEL 04 // CREDENTIALS', 'CV is Channel 04 Credentials');
  assert.ok(cvAction.href.includes('cv.pdf'), 'CV action points to CV PDF');

  // Test copied state
  const copiedActions = getContactDeckActions(true);
  const copiedEmail = copiedActions.find((a) => a.id === 'email');
  assert.ok(copiedEmail, 'Copied email action exists');
  assert.match(copiedEmail.label, /COPIED/i, 'Label changes immediately to show copied feedback');
});

test('telemetryKicker: maintains single-line layout without line-wrapping on narrow phone viewports (320px–375px)', () => {
  // Narrow phone viewports
  const config320 = getTelemetryKickerConfig(320);
  assert.equal(config320.wrap, false, '320px viewport kickers must remain single line');
  assert.equal(config320.allowEllipsis, true, '320px viewport kickers allow ellipsis');
  assert.equal(config320.overflow, 'hidden', '320px viewport kickers overflow must be hidden');

  const config375 = getTelemetryKickerConfig(375);
  assert.equal(config375.wrap, false, '375px viewport kickers must remain single line');
  assert.equal(config375.allowEllipsis, true, '375px viewport kickers allow ellipsis');
  assert.equal(config375.overflow, 'hidden', '375px viewport kickers overflow must be hidden');

  // Desktop viewport
  const configDesktop = getTelemetryKickerConfig(1280);
  assert.equal(configDesktop.wrap, false, 'Desktop kickers remain single line');
  assert.equal(configDesktop.allowEllipsis, false);
});
