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

  // On mobile: only panel-1 (hero links) and panel-9 (finish lap) show bottom strip
  assert.equal(shouldShowBottomStrip('panel-1', true), true, 'Mobile shows hero bottom links');
  assert.equal(shouldShowBottomStrip('panel-9', true), true, 'Mobile shows pit wall finish strip');

  // Intermediate panels (2 to 8) are streamlined to eliminate redundant vertical visual noise
  for (const pid of ['panel-2', 'panel-3', 'panel-4', 'panel-5', 'panel-6', 'panel-7', 'panel-8']) {
    assert.equal(shouldShowBottomStrip(pid, true), false, `Mobile consolidates redundant strip on ${pid}`);
  }
});
