import { useEffect, useRef } from 'react';
import { TelemetryAnimationController } from '../utils/mobileAdaptation';

// =============================================================================
// TelemetryBackground - engineering-drawing backdrop
// - Static CAD grid with precision crosshairs (the part that carries the style)
// - Neutral nodes drifting slowly with faint linkages
// - Fine pointer only: nodes near the cursor warm up to the livery red, grow a
//   little, slow down and send out one soft ring; they cool down when it leaves
// - Touch & scroll throttled; prefers-reduced-motion renders the grid only
// =============================================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  /** 0 = neutral, 1 = fully warmed by the cursor */
  heat: number;
  /** Ring progress 0..1 while it expands, -1 when idle */
  ring: number;
  /** Re-armed once the node has cooled down, so each approach rings once */
  canRing: boolean;
}

const NEUTRAL: [number, number, number] = [236, 237, 239];
const FALLBACK_RED: [number, number, number] = [200, 70, 62];

/** Cursor influence radius in CSS px */
const HOVER_RADIUS = 150;
/** Heat easing: quick to warm, slower to cool */
const HEAT_IN = 0.14;
const HEAT_OUT = 0.035;
/** Ring lifetime ≈ 1 / RING_SPEED frames (~0.7s at 60fps) */
const RING_SPEED = 0.024;
const RING_TRIGGER = 0.45;
const RING_REARM = 0.08;

const parseHex = (value: string): [number, number, number] | null => {
  const m = /^#?([0-9a-f]{6})$/i.exec(value.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const mix = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

export function TelemetryBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Livery red comes from the theme token so it stays in sync with the CSS
    const red =
      parseHex(getComputedStyle(canvas).getPropertyValue('--color-text-red')) ?? FALLBACK_RED;

    const mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mediaQueryCoarsePointer = window.matchMedia('(pointer: coarse)');

    const getIsCoarse = () =>
      mediaQueryCoarsePointer.matches || ('ontouchstart' in window && window.innerWidth < 820);
    const getIsMobile = () => window.innerWidth < 820 || getIsCoarse();

    let animationFrameId: number | null = null;
    let width = 0;
    let height = 0;
    let maxLineDistSq = 95 * 95;
    let particles: Particle[] = [];
    let mouseX = -9999;
    let mouseY = -9999;
    let offscreenGrid: HTMLCanvasElement | null = null;

    const renderStaticFrame = () => {
      ctx.clearRect(0, 0, width, height);
      if (offscreenGrid) ctx.drawImage(offscreenGrid, 0, 0, width, height);
    };

    const startAnimationLoop = () => {
      if (animationFrameId === null) animationFrameId = requestAnimationFrame(render);
    };

    const stopAnimationLoop = () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    const controller = new TelemetryAnimationController({
      isMobile: getIsMobile(),
      isCoarsePointer: getIsCoarse(),
      prefersReducedMotion: mediaQueryReducedMotion.matches,
      documentHidden: document.visibilityState === 'hidden' || document.hidden,
      onStart: startAnimationLoop,
      onStop: stopAnimationLoop,
      onRenderStaticFrame: renderStaticFrame,
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Static CAD grid, pre-rendered once per size
      offscreenGrid = document.createElement('canvas');
      offscreenGrid.width = Math.floor(width * dpr);
      offscreenGrid.height = Math.floor(height * dpr);
      const gridCtx = offscreenGrid.getContext('2d');
      if (gridCtx) {
        gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const gridSize = width < 768 ? 72 : 88;

        gridCtx.strokeStyle = 'rgba(236, 237, 239, 0.05)';
        gridCtx.lineWidth = 0.5;
        gridCtx.beginPath();
        for (let x = gridSize; x < width; x += gridSize) {
          gridCtx.moveTo(x, 0);
          gridCtx.lineTo(x, height);
        }
        for (let y = gridSize; y < height; y += gridSize) {
          gridCtx.moveTo(0, y);
          gridCtx.lineTo(width, y);
        }
        gridCtx.stroke();

        gridCtx.strokeStyle = 'rgba(236, 237, 239, 0.14)';
        gridCtx.lineWidth = 1;
        gridCtx.beginPath();
        const crossSize = 4;
        for (let x = gridSize; x < width; x += gridSize * 2) {
          for (let y = gridSize; y < height; y += gridSize * 2) {
            gridCtx.moveTo(x - crossSize, y);
            gridCtx.lineTo(x + crossSize, y);
            gridCtx.moveTo(x, y - crossSize);
            gridCtx.lineTo(x, y + crossSize);
          }
        }
        gridCtx.stroke();
      }

      controller.setDeviceProfile({ isMobile: getIsMobile(), isCoarsePointer: getIsCoarse() });

      if (!controller.shouldAnimate()) {
        renderStaticFrame();
        return;
      }

      maxLineDistSq = (width < 768 ? 75 : 95) ** 2;
      // Dense enough on desktop that the cursor usually has a node or two nearby
      const particleCount = width < 768 ? 18 : 44;
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.16,
          vy: (Math.random() - 0.5) * 0.16,
          radius: Math.random() * 0.4 + 1.2,
          baseAlpha: Math.random() * 0.15 + 0.32,
          heat: 0,
          ring: -1,
          canRing: true,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!controller.shouldTrackCursor()) return;
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    const handleScrollOrTouch = () => controller.handleScroll();

    const handleVisibilityChange = () => {
      controller.handleVisibilityChange(document.visibilityState === 'hidden' || document.hidden);
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      controller.setReducedMotion(e.matches);
    };

    const handlePointerChange = () => {
      controller.setDeviceProfile({ isMobile: getIsMobile(), isCoarsePointer: getIsCoarse() });
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('blur', handleMouseLeave);
    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    mediaQueryReducedMotion.addEventListener?.('change', handleReducedMotionChange);
    mediaQueryCoarsePointer.addEventListener?.('change', handlePointerChange);

    resize();

    const rgba = (t: number, alpha: number) =>
      `rgba(${mix(NEUTRAL[0], red[0], t)}, ${mix(NEUTRAL[1], red[1], t)}, ${mix(NEUTRAL[2], red[2], t)}, ${alpha})`;

    function render() {
      if (!ctx || !controller.shouldAnimate()) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);
      if (offscreenGrid) ctx.drawImage(offscreenGrid, 0, 0, width, height);

      const tracking = controller.shouldTrackCursor() && mouseX > 0 && mouseY > 0;
      const n = particles.length;

      // 1. Move nodes and update their heat
      for (let i = 0; i < n; i++) {
        const p = particles[i];

        // Warm nodes slow down, so they settle near the cursor instead of drifting off
        const drag = 1 - p.heat * 0.75;
        p.x += p.vx * drag;
        p.y += p.vy * drag;

        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        let target = 0;
        if (tracking) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < HOVER_RADIUS) target = 1 - dist / HOVER_RADIUS;
        }
        p.heat += (target - p.heat) * (target > p.heat ? HEAT_IN : HEAT_OUT);
        if (p.heat < 0.001) p.heat = 0;

        if (p.canRing && p.heat > RING_TRIGGER) {
          p.ring = 0;
          p.canRing = false;
        } else if (!p.canRing && p.heat < RING_REARM) {
          p.canRing = true;
        }
        if (p.ring >= 0) {
          p.ring += RING_SPEED;
          if (p.ring >= 1) p.ring = -1;
        }
      }

      // 2. Linkages: neutral, turning red where both ends are warm
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(236, 237, 239, 0.08)';
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        for (let j = i + 1; j < n; j++) {
          const q = particles[j];
          if (p.heat > 0.05 && q.heat > 0.05) continue;
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          if (dx * dx + dy * dy < maxLineDistSq) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
          }
        }
      }
      ctx.stroke();

      const warmLinkDistSq = maxLineDistSq * 1.6;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        if (p.heat <= 0.05) continue;
        for (let j = i + 1; j < n; j++) {
          const q = particles[j];
          if (q.heat <= 0.05) continue;
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          if (dx * dx + dy * dy < warmLinkDistSq) {
            const t = Math.min(p.heat, q.heat);
            ctx.beginPath();
            ctx.strokeStyle = rgba(easeOut(t), 0.08 + t * 0.22);
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      // 3. Nodes
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        const t = easeOut(p.heat);

        if (p.ring >= 0) {
          const k = easeOut(p.ring);
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius + 2 + k * 14, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(1, (1 - p.ring) * 0.4);
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        if (t > 0.02) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 3 + t * 3, 0, Math.PI * 2);
          ctx.fillStyle = rgba(1, t * 0.1);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + t * 1.3, 0, Math.PI * 2);
        ctx.fillStyle = rgba(t, p.baseAlpha + (0.95 - p.baseAlpha) * t);
        ctx.fill();
      }

      animationFrameId = controller.shouldAnimate() ? requestAnimationFrame(render) : null;
    }

    controller.start();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('blur', handleMouseLeave);
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQueryReducedMotion.removeEventListener?.('change', handleReducedMotionChange);
      mediaQueryCoarsePointer.removeEventListener?.('change', handlePointerChange);
      controller.destroy();
    };
  }, []);

  return <canvas ref={canvasRef} className="livrea-telemetry-canvas" aria-hidden="true" />;
}
