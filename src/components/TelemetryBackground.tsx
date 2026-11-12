import { useEffect, useRef } from 'react';
import { TelemetryAnimationController } from '../utils/mobileAdaptation';

// =============================================================================
// TelemetryBackground - Calibrated Motorsport Blueprint & Live Telemetry Mesh
// - Technical CAD grid with visible precision crosshairs
// - Balanced particle constellation: 36 nodes, crisp alphas, delicate linkages
// - Reactive cursor glow with soft telemetry halo (fine pointer only)
// - Touch & scroll throttled: halts animation during active mobile scroll gestures
// - Strict prefers-reduced-motion: reduce compliance (single static CAD grid)
// - Single offscreen grid blit + batched line and node passes
// =============================================================================

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  isAccent: boolean;
  pulseSpeed: number;
  pulsePhase: number;
  pingRadius?: number;
  pingAlpha?: number;
}

export function TelemetryBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const mediaQueryReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    const mediaQueryCoarsePointer = window.matchMedia('(pointer: coarse)');

    const getIsCoarse = () =>
      mediaQueryCoarsePointer.matches ||
      ('ontouchstart' in window && window.innerWidth < 820);
    const getIsMobile = () =>
      window.innerWidth < 820 || getIsCoarse();

    let animationFrameId: number | null = null;
    let width = 0;
    let height = 0;
    let maxLineDistSq = 95 * 95;
    let particles: Particle[] = [];
    let mouseX = -9999;
    let mouseY = -9999;

    // Offscreen cached canvases
    let offscreenGrid: HTMLCanvasElement | null = null;
    let glowSprite: HTMLCanvasElement | null = null;

    // Render single static CAD blueprint grid frame (used for reduced motion & resize)
    const renderStaticFrame = () => {
      ctx.clearRect(0, 0, width, height);
      if (offscreenGrid) {
        ctx.drawImage(offscreenGrid, 0, 0, width, height);
      }
    };

    const startAnimationLoop = () => {
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(render);
      }
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

    // 240x240 pre-baked interactive cursor glow sprite
    const createGlowSprite = () => {
      const sprite = document.createElement('canvas');
      sprite.width = 240;
      sprite.height = 240;
      const sCtx = sprite.getContext('2d');
      if (sCtx) {
        const rad = sCtx.createRadialGradient(120, 120, 0, 120, 120, 120);
        rad.addColorStop(0, 'rgba(224, 62, 62, 0.04)');
        rad.addColorStop(0.45, 'rgba(224, 62, 62, 0.01)');
        rad.addColorStop(1, 'rgba(224, 62, 62, 0)');
        sCtx.fillStyle = rad;
        sCtx.fillRect(0, 0, 240, 240);
      }
      return sprite;
    };
    glowSprite = createGlowSprite();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Pre-render static technical grid onto offscreen canvas
      offscreenGrid = document.createElement('canvas');
      offscreenGrid.width = Math.floor(width * dpr);
      offscreenGrid.height = Math.floor(height * dpr);
      const gridCtx = offscreenGrid.getContext('2d');
      if (gridCtx) {
        gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const gridSize = width < 768 ? 72 : 88;

        // Clearly visible CAD blueprint grid lines
        gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.026)';
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

        // Technical crosshairs '+' at every 2nd intersection
        gridCtx.strokeStyle = 'rgba(255, 255, 255, 0.065)';
        gridCtx.lineWidth = 0.75;
        gridCtx.beginPath();
        const crossSize = 3;
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

      controller.setDeviceProfile({
        isMobile: getIsMobile(),
        isCoarsePointer: getIsCoarse(),
      });

      if (!controller.shouldAnimate()) {
        renderStaticFrame();
        return;
      }

      // Balanced telemetry particle count (clearly visible, not crowded)
      maxLineDistSq = (width < 768 ? 75 : 95) ** 2;
      const particleCount = width < 768 ? 20 : 38;
      particles = [];

      for (let i = 0; i < particleCount; i++) {
        const isAccent = Math.random() < 0.20; // ~20% calibrated vermilion telemetry markers
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          radius: isAccent ? Math.random() * 0.4 + 1.8 : Math.random() * 0.4 + 1.2,
          baseAlpha: isAccent ? Math.random() * 0.2 + 0.65 : Math.random() * 0.15 + 0.35,
          isAccent,
          pulseSpeed: Math.random() * 0.02 + 0.01,
          pulsePhase: Math.random() * Math.PI * 2,
          pingRadius: isAccent && Math.random() < 0.35 ? Math.random() * 24 : 0,
          pingAlpha: 0,
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

    const handleScrollOrTouch = () => {
      controller.handleScroll();
    };

    const handleVisibilityChange = () => {
      controller.handleVisibilityChange(
        document.visibilityState === 'hidden' || document.hidden
      );
    };

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      controller.setReducedMotion(e.matches);
    };

    const handlePointerChange = () => {
      controller.setDeviceProfile({
        isMobile: getIsMobile(),
        isCoarsePointer: getIsCoarse(),
      });
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('scroll', handleScrollOrTouch, { passive: true });
    window.addEventListener('touchmove', handleScrollOrTouch, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    mediaQueryReducedMotion.addEventListener?.('change', handleReducedMotionChange);
    mediaQueryCoarsePointer.addEventListener?.('change', handlePointerChange);

    resize();

    function render() {
      if (!ctx || !controller.shouldAnimate()) {
        animationFrameId = null;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Blit static technical grid
      if (offscreenGrid) {
        ctx.drawImage(offscreenGrid, 0, 0, width, height);
      }

      // 2. Cursor glow halo (only when cursor tracking is active and on desktop)
      if (
        glowSprite &&
        controller.shouldTrackCursor() &&
        mouseX > 0 &&
        mouseY > 0 &&
        width >= 768
      ) {
        ctx.drawImage(glowSprite, mouseX - 120, mouseY - 120, 240, 240);
      }

      const n = particles.length;

      // 3. Delicate connecting linkages (sparse, only when nodes pass nearby)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        for (let j = i + 1; j < n; j++) {
          const p2 = particles[j];
          if (p.isAccent || p2.isAccent) continue;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxLineDistSq) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();

      // Accent vermilion linkages
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(224, 62, 62, 0.08)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        for (let j = i + 1; j < n; j++) {
          const p2 = particles[j];
          if (!p.isAccent && !p2.isAccent) continue;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxLineDistSq) {
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
      }
      ctx.stroke();

      // 4. Update and draw nodes
      for (let i = 0; i < n; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        else if (p.y > height + 10) p.y = -10;

        // Smooth cursor repulsion - disabled on touch/coarse devices
        if (controller.shouldApplyRepulsion() && mouseX > 0 && mouseY > 0) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const distSq = dx * dx + dy * dy;
          if (distSq < 10000 && distSq > 0) {
            const dist = Math.sqrt(distSq);
            const force = ((100 - dist) / 100) * 0.35;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        p.pulsePhase += p.pulseSpeed;

        const alpha = p.baseAlpha * (0.85 + 0.15 * Math.sin(p.pulsePhase));

        // Radar ping ring on select accent nodes
        if (p.isAccent && p.pingRadius !== undefined) {
          p.pingRadius = (p.pingRadius + 0.3) % 26;
          p.pingAlpha = Math.max(0, (1 - p.pingRadius / 26) * 0.18);
          if (p.pingAlpha && p.pingAlpha > 0.02) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.pingRadius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(224, 62, 62, ${p.pingAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // Fast node rendering
        if (p.isAccent) {
          // Soft outer halo
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 62, 62, ${alpha * 0.12})`;
          ctx.fill();

          // Core dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 62, 62, ${alpha * 0.85})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.fill();
        }
      }

      if (controller.shouldAnimate()) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        animationFrameId = null;
      }
    };

    controller.start();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScrollOrTouch);
      window.removeEventListener('touchmove', handleScrollOrTouch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      mediaQueryReducedMotion.removeEventListener?.('change', handleReducedMotionChange);
      mediaQueryCoarsePointer.removeEventListener?.('change', handlePointerChange);
      controller.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="livrea-telemetry-canvas"
      aria-hidden="true"
    />
  );
}
