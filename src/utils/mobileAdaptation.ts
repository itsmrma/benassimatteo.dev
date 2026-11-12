/**
 * Utility functions for mobile adaptation, responsive scroll handling,
 * and dynamic sector observation across variable and tall section heights.
 */

export interface SectorBounds {
  id: string;
  top: number;
  bottom: number;
  height?: number;
}

export interface ActiveSectorOptions {
  focalRatio?: number;
  isAtStart?: boolean;
  isAtEnd?: boolean;
  scrollTop?: number;
  scrollHeight?: number;
}

/**
 * Determines whether mobile adaptation rules apply.
 * Mobile adaptation is active when viewport width is below 820px,
 * or when the user is on a touch / coarse-pointer device.
 * Desktop viewports (>= 820px) with fine pointer return false.
 */
export function isMobileViewport(width?: number, isCoarsePointer?: boolean): boolean {
  if (typeof window !== 'undefined') {
    const w = width ?? window.innerWidth;
    const coarse =
      isCoarsePointer ??
      (typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false);
    return w < 820 || coarse;
  }
  const w = width ?? 1024;
  return w < 820 || Boolean(isCoarsePointer);
}

/**
 * Calculates current scroll progress as a percentage between 0 and 100.
 * Automatically clamps over-scrolling (e.g. iOS rubber-band bounce).
 */
export function calculateScrollProgress(
  scrollTop: number,
  scrollHeight: number,
  clientHeight: number
): number {
  const maxScroll = scrollHeight - clientHeight;
  if (maxScroll <= 0) return 0;
  const progress = (scrollTop / maxScroll) * 100;
  return Math.min(100, Math.max(0, Math.round(progress * 100) / 100));
}

/**
 * Parses numeric index from a panel ID (e.g., 'panel-1' -> 1, 'panel-03' -> 3).
 * Falls back to 1 on unrecognized format.
 */
export function parseSectorNumber(panelId: string): number {
  const match = panelId.match(/panel-0*(\d+)/);
  if (match) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? 1 : num;
  }
  return 1;
}

/**
 * Formats a panel ID from a numeric index (e.g., 3 -> 'panel-3').
 */
export function getSectorId(index: number): string {
  return `panel-${index}`;
}

/**
 * Computes the currently active sector ID based on panel bounds relative to viewport.
 * Uses a reading focal line (default at 35% of viewport height from top), which reliably
 * tracks tall panels (panels exceeding viewport height) where traditional IntersectionObserver
 * thresholds (like 0.45 or 0.5) fail because tall panels cannot fill 45% or 50% of their total height
 * in a single viewport.
 */
export function computeActiveSector(
  panels: SectorBounds[],
  viewportHeight: number,
  options?: ActiveSectorOptions
): string | null {
  if (!panels || panels.length === 0) return null;

  if (options?.isAtStart) {
    return panels[0].id;
  }

  if (options?.isAtEnd) {
    return panels[panels.length - 1].id;
  }

  if (options?.scrollTop !== undefined && options?.scrollHeight !== undefined) {
    if (options.scrollTop <= 2) {
      return panels[0].id;
    }
    if (options.scrollTop + viewportHeight >= options.scrollHeight - 4) {
      return panels[panels.length - 1].id;
    }
  }

  const focalRatio = options?.focalRatio ?? 0.35;
  const focalY = viewportHeight * focalRatio;

  // 1. Primary check: Which panel spans across the reading focal line?
  for (const panel of panels) {
    if (panel.top <= focalY && panel.bottom > focalY) {
      return panel.id;
    }
  }

  // 2. Fallback check: Which panel has the greatest visible height in viewport?
  let bestPanel: SectorBounds | null = null;
  let maxVisible = -1;

  for (const panel of panels) {
    const visibleTop = Math.max(panel.top, 0);
    const visibleBottom = Math.min(panel.bottom, viewportHeight);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    if (visibleHeight > maxVisible) {
      maxVisible = visibleHeight;
      bestPanel = panel;
    }
  }

  return bestPanel ? bestPanel.id : panels[0].id;
}

/**
 * Inspects all .livrea-panel elements in the DOM and returns their bounding rects.
 */
export function getPanelBoundsFromDOM(): SectorBounds[] {
  if (typeof document === 'undefined') return [];
  const panelElements = document.querySelectorAll<HTMLElement>('.livrea-panel');
  const bounds: SectorBounds[] = [];
  panelElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    bounds.push({
      id: el.id,
      top: rect.top,
      bottom: rect.bottom,
      height: rect.height,
    });
  });
  return bounds;
}

/**
 * Computes active sector number directly from DOM state.
 */
export function getActiveSectorFromDOM(
  viewportHeight?: number,
  options?: ActiveSectorOptions
): number {
  if (typeof window === 'undefined') return 1;
  const vh = viewportHeight ?? window.innerHeight;
  const bounds = getPanelBoundsFromDOM();
  if (bounds.length === 0) return 1;
  const activeId = computeActiveSector(bounds, vh, options);
  return activeId ? parseSectorNumber(activeId) : 1;
}

/**
 * Metric representation for hero telemetry readout.
 */
export interface TelemetryMetric {
  id: string;
  label: string;
  shortLabel: string;
  value: string;
  detail?: string;
  accent?: boolean;
}

/**
 * Returns formatted telemetry metrics for Sector 01 (Hero).
 * On mobile, these fit within a compact HUD ribbon:
 * "3x Podiums | 27.3/30 avg | 2026/27 Ready"
 */
export function getHeroTelemetryMetrics(): TelemetryMetric[] {
  return [
    {
      id: 'kpi-podiums',
      label: 'KPI 01 // COMPETITION',
      shortLabel: 'COMPETITION',
      value: '3x Podiums',
      detail: '1st Hack4Water 2026 · 2x SCIoTeM 2026 & 2025',
      accent: true,
    },
    {
      id: 'kpi-academics',
      label: 'KPI 02 // ACADEMICS',
      shortLabel: 'ACADEMICS',
      value: '27.3/30 avg',
      detail: '125/180 ECTS · 100/100 High-School Diploma',
      accent: false,
    },
    {
      id: 'kpi-availability',
      label: 'KPI 03 // AVAILABILITY',
      shortLabel: 'AVAILABILITY',
      value: '2026/27 Ready',
      detail: 'Summer 2026 / Fall 2026 / 2027 Full-Time',
      accent: true,
    },
  ];
}

/**
 * Formats hero metrics into a single-line compact telemetry HUD ribbon string.
 */
export function formatCompactTelemetryRibbon(metrics?: TelemetryMetric[]): string {
  const m = metrics || getHeroTelemetryMetrics();
  return m.map((item) => item.value).join(' | ');
}

/**
 * Podium finish representation for Sector 02.
 */
export interface PodiumFinish {
  position: 'P1' | 'P2' | 'P3';
  rankNum: 1 | 2;
  title: string;
  project: string;
  year: number;
  highlight: boolean;
  summary: string;
  specs: string;
  specsDetail: string;
  githubUrl: string;
}

/**
 * Returns the competitive hackathon podium finishes.
 */
export function getPodiumFinishes(): PodiumFinish[] {
  return [
    {
      position: 'P1',
      rankNum: 1,
      title: 'Hack4Water 2026',
      project: 'Garda Chiese Alert',
      year: 2026,
      highlight: true,
      summary:
        'Citizen incident reporting platform for a 76,645-hectare water basin across 33 municipalities, built in 72 hours.',
      specs: 'Django REST · PostGIS GIST · React · Gemini AI',
      specsDetail:
        'Sub-millisecond PostGIS polygon checks & automated Gemini multimodal voice triage.',
      githubUrl: 'https://github.com/cavallinilorenzo/alert-app-garda-chiese',
    },
    {
      position: 'P2',
      rankNum: 2,
      title: 'SCIoTeM 2026',
      project: 'Smart Beam',
      year: 2026,
      highlight: false,
      summary:
        'Predictive maintenance engine for municipal streetlights, shifting repairs from reactive to scheduled proactive intervention.',
      specs: 'Python · scikit-learn · Cox Proportional Hazards · XGBoost',
      specsDetail:
        'Survival analysis computing failure hazard curves for luminaire fleets with automated technician dispatch.',
      githubUrl:
        'https://github.com/cavallinilorenzo/street-lighting-predictive-maintenance',
    },
    {
      position: 'P2', // Represented as P2 finisher (3rd podium result)
      rankNum: 2,
      title: 'SCIoTeM 2025',
      project: 'P7M AI Summarizer',
      year: 2025,
      highlight: false,
      summary:
        'Legal tech ingestion pipeline unwrapping cryptographically signed PKCS#7 envelopes and synthesizing legal digests.',
      specs: 'Python · PKCS#7 Cryptography · Google Gemini LLM',
      specsDetail:
        'Automated digital envelope verification, embedded content extraction, and structured Italian legal summary.',
      githubUrl: 'https://github.com/itsmrma/hackathon-p7m-ai-summarizer',
    },
  ];
}

/**
 * Categorizes podium finishes into a prominent P1 lead and streamlined summary finishes
 * to eliminate >800px of vertical scrolling on mobile.
 */
export function getPodiumHierarchy(finishes?: PodiumFinish[]): {
  p1Lead: PodiumFinish;
  summaryFinishes: PodiumFinish[];
} {
  const all = finishes || getPodiumFinishes();
  const p1Lead = all.find((f) => f.position === 'P1') || all[0];
  const summaryFinishes = all.filter((f) => f !== p1Lead);
  return { p1Lead, summaryFinishes };
}

/**
 * Starting Grid continuous chronological timeline milestone for Sector 08.
 */
export interface TimelineMilestone {
  nodeId: string;
  position: string;
  period: string;
  title: string;
  institution: string;
  summary: string;
  gradeHighlight?: string;
  isCurrent?: boolean;
}

/**
 * Returns chronological timeline milestones for Sector 08 (Starting Grid).
 */
export function getStartingGridTimeline(): TimelineMilestone[] {
  return [
    {
      nodeId: 'grid-unimore',
      position: 'P01',
      period: '2024 – PRESENT',
      title: 'B.Sc. Computer Engineering — UNIMORE (Mantova Campus)',
      institution: 'UNIMORE (Mantova Campus)',
      summary:
        'Weighted academic average: 27.3 / 30 · 125 / 180 ECTS completed · Expected graduation: 2027.',
      gradeHighlight: '27.3 / 30',
      isCurrent: true,
    },
    {
      nodeId: 'grid-novellini',
      position: 'P02',
      period: '2023',
      title: 'IT Systems Internship — Novellini S.p.A.',
      institution: 'Novellini S.p.A.',
      summary:
        'Corporate enterprise network infrastructure diagnostics, hardware maintenance, and workstation support.',
    },
    {
      nodeId: 'grid-fermi',
      position: 'P03',
      period: '2019 – 2024',
      title: 'Diploma in Computer Science — ITIS "E. Fermi" Mantova',
      institution: 'ITIS "E. Fermi" Mantova',
      summary:
        'Graduated with top marks: 100 / 100. Foundational C programming, network protocols, algorithms.',
      gradeHighlight: '100 / 100',
    },
    {
      nodeId: 'grid-certifications',
      position: 'P04',
      period: 'CERTIFICATIONS',
      title: 'Cambridge B2 First & Language Competencies',
      institution: 'Cambridge Assessment English',
      summary:
        'Professional working proficiency in English · Native Italian speaker.',
    },
  ];
}

/**
 * Determines whether a panel should display its bottom telemetry strip.
 * On mobile, repetitive intermediate panels (02 to 08) consolidate/streamline their strips
 * to eliminate vertical visual noise, while panel-1 (hero links) and panel-9 (finish lap) retain them.
 * On desktop, all panels display their bottom strip.
 */
export function shouldShowBottomStrip(panelId: string, isMobile: boolean): boolean {
  if (!isMobile) return true;
  return panelId === 'panel-1' || panelId === 'panel-9';
}
