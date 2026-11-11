export type Dir = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'move';

export interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface Limits {
  stageW: number;
  stageH: number;
  minW: number;
  minH: number;
}

export function clamp(val: number, min: number, max: number): number {
  if (min > max) {
    return min;
  }
  return Math.min(Math.max(val, min), max);
}

export function rectWidth(r: Rect): number {
  return Math.max(0, r.right - r.left);
}

export function rectHeight(r: Rect): number {
  return Math.max(0, r.bottom - r.top);
}

/**
 * Pure function to calculate new window bounds based on drag direction and delta.
 * Calculates from original start position (non-accumulating).
 */
export function applyDrag(start: Rect, dir: Dir, dx: number, dy: number, limits: Limits): Rect {
  const { stageW, stageH, minW, minH } = limits;
  let { left, top, right, bottom } = start;

  if (dir === 'move') {
    const w = right - left;
    const h = bottom - top;
    // Keep window inside stage boundaries
    const maxLeft = Math.max(0, stageW - w);
    const maxTop = Math.max(0, stageH - h);
    left = clamp(start.left + dx, 0, maxLeft);
    top = clamp(start.top + dy, 0, maxTop);
    return { left, top, right: left + w, bottom: top + h };
  }

  // West (left edge moves) - anchor right edge
  if (dir.includes('w')) {
    left = clamp(start.left + dx, 0, start.right - minW);
  }
  // East (right edge moves) - anchor left edge
  if (dir.includes('e')) {
    right = clamp(start.right + dx, start.left + minW, stageW);
  }
  // North (top edge moves) - anchor bottom edge
  if (dir.includes('n')) {
    top = clamp(start.top + dy, 0, start.bottom - minH);
  }
  // South (bottom edge moves) - anchor top edge
  if (dir.includes('s')) {
    bottom = clamp(start.bottom + dy, start.top + minH, stageH);
  }

  return { left, top, right, bottom };
}

/**
 * Re-clamps a window rect when stage size changes or on initial layout.
 */
export function clampToStage(rect: Rect, stageW: number, stageH: number, minW = 360, minH = 240): Rect {
  const effectiveMinW = Math.min(minW, stageW);
  const effectiveMinH = Math.min(minH, stageH);

  let w = clamp(rectWidth(rect), effectiveMinW, stageW);
  let h = clamp(rectHeight(rect), effectiveMinH, stageH);

  let left = clamp(rect.left, 0, Math.max(0, stageW - w));
  let top = clamp(rect.top, 0, Math.max(0, stageH - h));

  return {
    left,
    top,
    right: left + w,
    bottom: top + h,
  };
}

export type PresetPlacement = 'right' | 'center' | 'fill';

/**
 * Computes standard presets:
 * - 'initial': full stage with subtle padding or right-aligned in wide split stages
 * - 'compact': ~50% size
 * - 'fill': 100% of stage
 */
export function computePreset(
  preset: 'initial' | 'compact' | 'fill',
  stageW: number,
  stageH: number,
  minW = 360,
  minH = 240,
  placement: PresetPlacement = 'right',
): Rect {
  if (preset === 'fill') {
    return { left: 0, top: 0, right: stageW, bottom: stageH };
  }

  const marginX = stageW > 700 ? 12 : 0;
  const marginY = stageH > 500 ? 12 : 0;

  if (preset === 'compact') {
    const w = clamp(Math.round(stageW * 0.48), minW, Math.min(680, stageW));
    const h = clamp(Math.round(stageH * 0.72), minH, stageH);
    const left =
      placement === 'right' && stageW > 960
        ? stageW - w - marginX
        : Math.round((stageW - w) / 2);
    const top = Math.round((stageH - h) / 2);
    return { left, top, right: left + w, bottom: top + h };
  }

  // initial:
  if (placement === 'right' && stageW > 960) {
    // Wide split layout: position on the right half initially,
    // leaving the left text column uncovered while allowing full drag/resize across the stage!
    const targetW = clamp(Math.round(stageW * 0.54), 620, Math.min(840, stageW - 360));
    const left = stageW - targetW - marginX;
    const right = stageW - marginX;
    const top = marginY;
    // Leave room at the bottom for the caption ("Live demo of the real Oxide UI · sample data")
    const captionMargin = 42;
    const bottom = Math.max(top + minH, stageH - marginY - captionMargin);
    return clampToStage({ left, top, right, bottom }, stageW, stageH, minW, minH);
  }

  // default initial:
  const left = marginX;
  const top = marginY;
  const right = Math.max(left + minW, stageW - marginX);
  const captionMargin = 42;
  const bottom = Math.max(top + minH, stageH - marginY - captionMargin);

  return clampToStage({ left, top, right, bottom }, stageW, stageH, minW, minH);
}
