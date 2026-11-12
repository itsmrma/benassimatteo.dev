/**
 * Utility functions for mobile adaptation, responsive scroll handling,
 * and dynamic sector observation across variable and tall section heights.
 */

export interface TelemetryAnimationControllerOptions {
  isMobile?: boolean;
  isCoarsePointer?: boolean;
  prefersReducedMotion?: boolean;
  documentHidden?: boolean;
  scrollSettleTimeoutMs?: number;
  onStart?: () => void;
  onStop?: () => void;
  onRenderStaticFrame?: () => void;
}

export class TelemetryAnimationController {
  private isMobile: boolean;
  private isCoarsePointer: boolean;
  private prefersReducedMotion: boolean;
  private documentHidden: boolean;
  private isScrolling: boolean = false;
  private isRunning: boolean = false;
  private scrollTimer: ReturnType<typeof setTimeout> | null = null;
  private scrollSettleTimeoutMs: number;
  private onStart?: () => void;
  private onStop?: () => void;
  private onRenderStaticFrame?: () => void;

  constructor(options: TelemetryAnimationControllerOptions = {}) {
    this.isMobile = options.isMobile ?? false;
    this.isCoarsePointer = options.isCoarsePointer ?? false;
    this.prefersReducedMotion = options.prefersReducedMotion ?? false;
    this.documentHidden = options.documentHidden ?? false;
    this.scrollSettleTimeoutMs = options.scrollSettleTimeoutMs ?? 150;
    this.onStart = options.onStart;
    this.onStop = options.onStop;
    this.onRenderStaticFrame = options.onRenderStaticFrame;
  }

  /**
   * Evaluates whether the animation loop should actively execute.
   * Returns false if reduced motion is requested, document is hidden,
   * or during active mobile scrolling.
   */
  public shouldAnimate(): boolean {
    if (this.prefersReducedMotion) return false;
    if (this.documentHidden) return false;
    if (this.isMobile && this.isScrolling) return false;
    return true;
  }

  /**
   * Indicates whether mousemove events and cursor tracking should be active.
   * Disabled on coarse-pointer / touch devices to conserve power.
   */
  public shouldTrackCursor(): boolean {
    return !this.isCoarsePointer;
  }

  /**
   * Indicates whether cursor repulsion physics should be applied to nodes.
   * Disabled on coarse-pointer / touch devices and when reduced motion is preferred.
   */
  public shouldApplyRepulsion(): boolean {
    return !this.isCoarsePointer && !this.prefersReducedMotion;
  }

  public getIsScrolling(): boolean {
    return this.isScrolling;
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public start(): void {
    if (this.prefersReducedMotion) {
      this.isRunning = false;
      this.onRenderStaticFrame?.();
      return;
    }
    if (this.shouldAnimate() && !this.isRunning) {
      this.isRunning = true;
      this.onStart?.();
    }
  }

  public stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.onStop?.();
    }
  }

  /**
   * Called during scroll or touchmove gestures.
   * On mobile devices, throttles/pauses animation during movement to free CPU/GPU
   * for 60fps scrolling, then automatically resumes once scrolling settles.
   * On desktop, leaves loop running smoothly.
   */
  public handleScroll(): void {
    if (!this.isMobile) return;

    this.isScrolling = true;
    if (this.isRunning) {
      this.stop();
    }

    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }

    this.scrollTimer = setTimeout(() => {
      this.settleScroll();
    }, this.scrollSettleTimeoutMs);
  }

  /**
   * Resets scrolling state and resumes animation if conditions are satisfied.
   */
  public settleScroll(): void {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
    this.isScrolling = false;
    if (this.shouldAnimate()) {
      this.start();
    }
  }

  /**
   * Handles document visibility changes (tab backgrounded/foregrounded).
   */
  public handleVisibilityChange(hidden: boolean): void {
    this.documentHidden = hidden;
    if (hidden) {
      this.stop();
    } else {
      if (this.shouldAnimate()) {
        this.start();
      }
    }
  }

  /**
   * Updates reduced-motion accessibility preference.
   */
  public setReducedMotion(reduced: boolean): void {
    this.prefersReducedMotion = reduced;
    if (reduced) {
      this.stop();
      this.onRenderStaticFrame?.();
    } else if (this.shouldAnimate()) {
      this.start();
    }
  }

  /**
   * Updates mobile / coarse-pointer device profile.
   */
  public setDeviceProfile(profile: { isMobile?: boolean; isCoarsePointer?: boolean }): void {
    if (profile.isMobile !== undefined) this.isMobile = profile.isMobile;
    if (profile.isCoarsePointer !== undefined) this.isCoarsePointer = profile.isCoarsePointer;
    if (!this.shouldAnimate() && this.isRunning) {
      this.stop();
    } else if (this.shouldAnimate() && !this.isRunning) {
      this.start();
    }
  }

  /**
   * Cleans up timers and halts animation.
   */
  public destroy(): void {
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
      this.scrollTimer = null;
    }
    this.stop();
  }
}

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
 * Mobile adaptation is active when viewport width is below the breakpoint (defaults to 820px),
 * or when the user is on a touch / coarse-pointer device.
 * Desktop viewports (>= breakpoint) with fine pointer return false.
 */
export function isMobileViewport(
  width?: number,
  isCoarsePointer?: boolean,
  breakpoint: number = 820,
): boolean {
  if (typeof window !== 'undefined') {
    const w = width ?? window.innerWidth;
    const coarse =
      isCoarsePointer ??
      (typeof window.matchMedia === 'function'
        ? window.matchMedia('(pointer: coarse)').matches
        : false);
    return w < breakpoint || coarse;
  }
  const w = width ?? 1024;
  return w < breakpoint || Boolean(isCoarsePointer);
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
  desktopValue?: string;
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
      shortLabel: 'PODIUMS',
      value: '3x Podiums',
      desktopValue: '3x Podiums',
      detail: '1st Hack4Water 2026 · 2x SCIoTeM 2026 & 2025',
      accent: true,
    },
    {
      id: 'kpi-academics',
      label: 'KPI 02 // ACADEMICS',
      shortLabel: 'ACADEMIC',
      value: '27.3/30 avg',
      desktopValue: '27.3 / 30 avg',
      detail: '125/180 ECTS · 100/100 High-School Diploma',
      accent: false,
    },
    {
      id: 'kpi-availability',
      label: 'KPI 03 // AVAILABILITY',
      shortLabel: 'STATUS',
      value: '2026/27 Ready',
      desktopValue: '2026 / 27',
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

export interface SectorWaypoint {
  id: string;
  num: string;
  index: number;
  title: string;
  label: string;
  tagline?: string;
}

export const SECTOR_WAYPOINTS: readonly SectorWaypoint[] = [
  {
    id: 'panel-1',
    num: '01',
    index: 1,
    title: 'CHASSIS',
    label: 'Identification & Chassis Spec',
    tagline: 'Bio, philosophy & telemetry metrics',
  },
  {
    id: 'panel-2',
    num: '02',
    index: 2,
    title: 'PODIUM',
    label: 'Hackathon Podium',
    tagline: 'Hack4Water, Hack the Code & AI Trophy',
  },
  {
    id: 'panel-3',
    num: '03',
    index: 3,
    title: 'OXIDE',
    label: 'Oxide Desktop GUI',
    tagline: 'Flagship worktree concurrent workspace',
  },
  {
    id: 'panel-4',
    num: '04',
    index: 4,
    title: 'SYNCFORGE',
    label: 'SyncForge Subtitle Sync',
    tagline: 'Cross-language subtitle sync CLI engine',
  },
  {
    id: 'panel-5',
    num: '05',
    index: 5,
    title: 'SCROBBL',
    label: 'Scrobbl.rs Audio Daemon',
    tagline: 'Lightweight Rust daemon for Last.fm/ListenBrainz',
  },
  {
    id: 'panel-6',
    num: '06',
    index: 6,
    title: 'EMBEDDED',
    label: 'RTOS & Embedded Systems',
    tagline: 'FreeRTOS & STM32 telemetry logger',
  },
  {
    id: 'panel-7',
    num: '07',
    index: 7,
    title: 'MACHINERY',
    label: 'Auxiliary Machinery & Lab',
    tagline: 'Open-source tools, CAD & hardware hacks',
  },
  {
    id: 'panel-8',
    num: '08',
    index: 8,
    title: 'GRID',
    label: 'Starting Grid & Timeline',
    tagline: 'UNIMORE Computer Engineering & honors',
  },
  {
    id: 'panel-9',
    num: '09',
    index: 9,
    title: 'CONTACT',
    label: 'Telemetry Downlink & Contact',
    tagline: 'Email, GitHub, LinkedIn & CV transmission',
  },
] as const;

export function getSectorWaypoint(sectorOrId: number | string): SectorWaypoint {
  if (typeof sectorOrId === 'number') {
    const found = SECTOR_WAYPOINTS.find((s) => s.index === sectorOrId);
    return found ?? SECTOR_WAYPOINTS[0];
  }
  const parsedNum = parseSectorNumber(sectorOrId);
  const found = SECTOR_WAYPOINTS.find((s) => s.id === sectorOrId || s.index === parsedNum);
  return found ?? SECTOR_WAYPOINTS[0];
}

export function formatSectorTelemetryKicker(
  sectorOrId: number | string,
  isOpen: boolean = false
): string {
  const waypoint = getSectorWaypoint(sectorOrId);
  const chevron = isOpen ? '▴' : '▾';
  return `[ ${waypoint.num} // ${waypoint.title} ${chevron} ]`;
}

export function getContactSectorId(): string {
  return 'panel-9';
}

export function resolveWaypointScrollTarget(
  sectorOrId: number | string,
  _isMobile: boolean = true
): { targetId: string; isTop: boolean; elementId: string } {
  let targetId = 'panel-1';
  if (typeof sectorOrId === 'number') {
    targetId = getSectorId(sectorOrId);
  } else if (typeof sectorOrId === 'string') {
    if (sectorOrId.startsWith('panel-')) {
      targetId = sectorOrId;
    } else {
      const num = parseInt(sectorOrId, 10);
      targetId = !isNaN(num) ? getSectorId(num) : 'panel-1';
    }
  }
  const isTop = targetId === 'panel-1';
  return {
    targetId,
    isTop,
    elementId: targetId,
  };
}

/**
 * Handles jumping to a specific waypoint sector:
 * closes the mobile waypoint menu and triggers smooth scrolling to the target.
 */
export function handleWaypointJump(
  target: number | string,
  scrollToPanel: (targetId: string) => void,
  onCloseMenu?: () => void
): void {
  const { targetId } = resolveWaypointScrollTarget(target, true);
  if (onCloseMenu) {
    onCloseMenu();
  }
  scrollToPanel(targetId);
}

export interface DesktopWindowConfig {
  hideTrafficLights: boolean;
  hideResizeHandles: boolean;
  aspectRatio: string | null;
  position: 'relative' | 'absolute';
  transform: string;
  minHeight: number;
}

/**
 * Returns desktop window configuration based on viewport and touch mode.
 * On mobile/touch, traffic lights and 8 resize handles are suppressed,
 * and an explicit 16:10 intrinsic aspect ratio is enforced.
 */
export function getDesktopWindowConfig(
  isMobile: boolean,
  customAspectRatio?: string
): DesktopWindowConfig {
  if (isMobile) {
    return {
      hideTrafficLights: true,
      hideResizeHandles: true,
      aspectRatio: customAspectRatio ?? '16 / 10',
      position: 'relative',
      transform: 'none',
      minHeight: 240,
    };
  }

  return {
    hideTrafficLights: false,
    hideResizeHandles: false,
    aspectRatio: null,
    position: 'absolute',
    transform: 'translate3d',
    minHeight: 240,
  };
}

export interface WindowDimensionsResult {
  width: number;
  height: number;
  aspectRatio: string | null;
}

/**
 * Calculates window dimensions for mobile vs desktop, enforcing non-zero
 * aspect-ratio height on mobile to prevent layout shifts.
 */
export function calculateWindowDimensions(
  width: number,
  isMobile: boolean,
  aspectRatio = '16 / 10',
  minH = 240
): WindowDimensionsResult {
  if (!isMobile) {
    return {
      width,
      height: minH,
      aspectRatio: null,
    };
  }

  // Parse ratio (e.g. '16 / 10' or '16:10')
  const parts = aspectRatio.split(/[/:]/).map((s) => parseFloat(s.trim()));
  const ratio = parts.length === 2 && parts[1] !== 0 ? parts[0] / parts[1] : 1.6;
  const computedHeight = Math.round(width / ratio);
  const height = Math.max(minH, computedHeight);

  return {
    width,
    height,
    aspectRatio,
  };
}

export interface ArchitecturePillar {
  key: string;
  num: string;
  title: string;
  subtitle: string;
  description: string;
  spec: string;
}

export const OXIDE_SHOWCASE_PILLARS: ArchitecturePillar[] = [
  {
    key: 'worktrees',
    num: '01',
    title: 'Worktree Concurrency',
    subtitle: 'Isolated Git Worktrees',
    description:
      'Spawns Claude Code, Codex, and Antigravity into independent worktrees so parallel turns never overwrite files or corrupt git index.',
    spec: 'git worktree add · zero lock contention · parallel turns',
  },
  {
    key: 'premerge',
    num: '02',
    title: 'Pre-Merge Gate',
    subtitle: 'Automated Verification Gate',
    description:
      'Runs full typechecking and test suites on every agent turn before reconciling changes into the primary branch.',
    spec: 'cargo check + tsc · gatekeeper validation · red/green receipts',
  },
  {
    key: 'tauri2',
    num: '03',
    title: 'Tauri 2 IPC Bridge',
    subtitle: 'Native OS Rust Core',
    description:
      'Low-memory native backend executing async subagent channels with high-throughput OS IPC performance.',
    spec: 'Tauri 2 · Rust async channels · < 45MB RAM footprint',
  },
];

export interface AppPreviewModeOptions {
  isMobile: boolean;
  isModalOpen?: boolean;
}

export interface AppPreviewModeResult {
  allowInlineIframe: boolean;
  hasScrollTrappingRisk: boolean;
  showcaseActive: boolean;
  supportsFullscreenModal: boolean;
  pillars: ArchitecturePillar[];
  isModalActive: boolean;
  hasExitControl: boolean;
  trapsPageScroll: boolean;
}

/**
 * Contracts for touch-safe preview mode. Suppresses microscopic inline iframe on mobile,
 * replaces it with a crisp architecture showcase, and manages fullscreen modal isolation.
 */
export function getAppPreviewMode(options: AppPreviewModeOptions): AppPreviewModeResult {
  const isMobile = Boolean(options.isMobile);
  const isModalOpen = Boolean(options.isModalOpen);

  return {
    allowInlineIframe: !isMobile,
    hasScrollTrappingRisk: false,
    showcaseActive: isMobile,
    supportsFullscreenModal: isMobile,
    pillars: OXIDE_SHOWCASE_PILLARS,
    isModalActive: isMobile && isModalOpen,
    hasExitControl: true,
    trapsPageScroll: false,
  };
}

/**
 * WCAG 2.5.5 / 2.5.8 minimum target sizing constants.
 * Standard interactive elements on mobile require at least 44x44px.
 * Thumb-friendly direct mobile actions (contact deck) require at least 48px height.
 */
export const MIN_TOUCH_TARGET_SIZE = 44;
export const CONTACT_ACTION_MIN_HEIGHT = 48;

export type TouchTargetRole = 'button' | 'link' | 'shortcut' | 'contact-action';

export interface TouchTargetConfig {
  minHeight: number;
  minWidth: number;
  touchSafe: boolean;
}

/**
 * Returns touch target sizing contracts for mobile vs desktop interactive elements.
 */
export function getTouchTargetConfig(
  role: TouchTargetRole,
  isMobile: boolean
): TouchTargetConfig {
  if (isMobile) {
    const minSize = role === 'contact-action' ? CONTACT_ACTION_MIN_HEIGHT : MIN_TOUCH_TARGET_SIZE;
    return {
      minHeight: minSize,
      minWidth: minSize,
      touchSafe: true,
    };
  }
  return {
    minHeight: 32,
    minWidth: 32,
    touchSafe: true,
  };
}

export interface MachineryProject {
  id: string;
  title: string;
  tech: string;
  category: string;
  description: string;
  githubUrl?: string;
  liveUrl?: string;
  statusNote?: string;
}

/**
 * Curated list of the 6 auxiliary machinery and lab projects for Sector 07.
 */
export function getAuxiliaryMachineryProjects(): MachineryProject[] {
  return [
    {
      id: 'amd-fan-control',
      title: 'AMD Fan Control',
      tech: 'RUST FFI',
      category: 'SYSTEMS UTILITY',
      description:
        'Low-level GPU fan curve utility built with Rust FFI binding to Linux sysfs hardware sensor monitors.',
      githubUrl: 'https://github.com/itsmrma/amd-fan-control',
    },
    {
      id: 'truenas-homelab',
      title: 'TrueNAS Home Lab',
      tech: 'ZFS / LINUX',
      category: 'INFRASTRUCTURE',
      description:
        'Dedicated home lab with ZFS RAIDZ storage pools, automated snapshot replication, Docker microservices, and network monitoring.',
      statusNote: 'PRIVATE ON-PREM INFRASTRUCTURE',
    },
    {
      id: 'viessmann-dashboard',
      title: 'Viessmann Dashboard',
      tech: 'HOME ASSISTANT',
      category: 'ENERGY TELEMETRY',
      description:
        'Custom Home Assistant telemetry integration for monitoring heat pump COP modulation and energy efficiency curves.',
      githubUrl: 'https://github.com/itsmrma/viesmann-dashboard-hass',
    },
    {
      id: 'uni-musiclib',
      title: 'UNIMORE Music Library',
      tech: 'PYTHON / UV',
      category: 'CATALOG SERVICE',
      description:
        'Academic music archive catalog service built with Python, Django, uv dependency management, and MusicBrainz API integration.',
      githubUrl: 'https://github.com/itsmrma/uni-musiclib-project',
    },
    {
      id: 'music-history-analyzer',
      title: 'Music History Analyzer',
      tech: 'LIVE APP',
      category: 'ANALYTICS ENGINE',
      description:
        'Interactive streaming history explorer importing multiple years of Spotify account JSON archives.',
      liveUrl: 'https://spotify-history-analyzer.benassimatteo.dev',
      githubUrl: 'https://github.com/itsmrma/spotify-history-analyzer',
    },
    {
      id: 'language-credentials',
      title: 'Cambridge B2 First',
      tech: 'PROFICIENCY',
      category: 'COMMUNICATION',
      description:
        'Professional working English proficiency · Native Italian speaker. Technical documentation & international team communication.',
      statusNote: 'TECHNICAL SPECIFICATIONS & TEAMS',
    },
  ];
}

export interface MachineryGridConfig {
  columns: number;
  isCompact: boolean;
  hasTouchActionLinks: boolean;
  minTouchTarget?: number;
}

/**
 * Returns machinery card grid layout settings.
 * On mobile, uses compact high-density layout with touch-friendly actions to avoid vertical bloat.
 * On desktop, maintains 2-column precision layout.
 */
export function getMachineryGridConfig(isMobile: boolean): MachineryGridConfig {
  if (isMobile) {
    return {
      columns: 1,
      isCompact: true,
      hasTouchActionLinks: true,
      minTouchTarget: MIN_TOUCH_TARGET_SIZE,
    };
  }
  return {
    columns: 2,
    isCompact: false,
    hasTouchActionLinks: false,
  };
}

export interface ContactDeckAction {
  id: 'email' | 'github' | 'linkedin' | 'cv';
  action: 'email' | 'github' | 'linkedin' | 'cv';
  channelLabel: string;
  label: string;
  subtitle: string;
  iconType: string;
  minHeight: number;
  href?: string;
  instantFeedback?: boolean;
  variant: 'primary' | 'secondary';
}

/**
 * Returns direct mobile contact action deck buttons (>= 48px height) for thumb ergonomics.
 * Provides instant feedback when email is copied.
 */
export function getContactDeckActions(isCopied: boolean = false): ContactDeckAction[] {
  return [
    {
      id: 'email',
      action: 'email',
      channelLabel: 'CHANNEL 01 // DIRECT',
      label: isCopied ? 'EMAIL COPIED ✓' : 'EMAIL MATTEO',
      subtitle: isCopied ? 'Copied to clipboard' : 'm.benassi30@gmail.com',
      iconType: 'email',
      minHeight: CONTACT_ACTION_MIN_HEIGHT,
      instantFeedback: true,
      variant: 'primary',
    },
    {
      id: 'github',
      action: 'github',
      channelLabel: 'CHANNEL 02 // CODE',
      label: 'GITHUB PROFILE ↗',
      subtitle: '@itsmrma · Repositories & Oxide',
      iconType: 'github',
      minHeight: CONTACT_ACTION_MIN_HEIGHT,
      href: 'https://github.com/itsmrma',
      variant: 'secondary',
    },
    {
      id: 'linkedin',
      action: 'linkedin',
      channelLabel: 'CHANNEL 03 // NETWORK',
      label: 'LINKEDIN NETWORK ↗',
      subtitle: 'Matteo Benassi · Systems Engineer',
      iconType: 'linkedin',
      minHeight: CONTACT_ACTION_MIN_HEIGHT,
      href: 'https://www.linkedin.com/in/matteo-benassi/',
      variant: 'secondary',
    },
    {
      id: 'cv',
      action: 'cv',
      channelLabel: 'CHANNEL 04 // CREDENTIALS',
      label: 'DOWNLOAD CV (PDF) ↗',
      subtitle: 'Academic & technical resume',
      iconType: 'cv',
      minHeight: CONTACT_ACTION_MIN_HEIGHT,
      href: 'https://benassimatteo.dev/cv.pdf',
      variant: 'secondary',
    },
  ];
}

export interface TelemetryKickerConfig {
  wrap: boolean;
  allowEllipsis: boolean;
  maxLines: number;
  overflow: 'visible' | 'hidden';
}

/**
 * Returns typography wrapping configuration for telemetry kickers.
 * On narrow mobile screens (320px–375px), kickers wrap gracefully without ellipses or clipping.
 */
export function getTelemetryKickerConfig(viewportWidth: number): TelemetryKickerConfig {
  if (viewportWidth < 640) {
    return {
      wrap: true,
      allowEllipsis: false,
      maxLines: 2,
      overflow: 'visible',
    };
  }
  return {
    wrap: false,
    allowEllipsis: false,
    maxLines: 1,
    overflow: 'visible',
  };
}
