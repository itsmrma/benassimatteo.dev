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
