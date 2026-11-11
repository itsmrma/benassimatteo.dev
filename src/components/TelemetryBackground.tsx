import { useEffect, useRef } from 'react';

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

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let mouseX = -9999;
    let mouseY = -9999;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Distinct, visible density
      const particleCount = width < 768 ? 38 : 78;
      particles = [];

      for (let i = 0; i < particleCount; i++) {
        const isAccent = Math.random() < 0.28; // ~28% racing red accents
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.55,
          vy: (Math.random() - 0.5) * 0.55,
          radius: isAccent ? Math.random() * 1.5 + 2.0 : Math.random() * 1.2 + 1.4,
          baseAlpha: isAccent ? Math.random() * 0.35 + 0.6 : Math.random() * 0.25 + 0.35,
          isAccent,
          pulseSpeed: Math.random() * 0.03 + 0.015,
          pulsePhase: Math.random() * Math.PI * 2,
          pingRadius: isAccent && Math.random() < 0.4 ? Math.random() * 30 : 0,
          pingAlpha: 0,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    resize();

    const maxLineDist = width < 768 ? 105 : 140;
    const maxLineDistSq = maxLineDist * maxLineDist;

    // Draw precision telemetry crosshairs and grid dots
    const drawGrid = () => {
      const gridSize = width < 768 ? 64 : 80;
      ctx.save();

      // Faint subtle technical grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = gridSize; x < width; x += gridSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = gridSize; y < height; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Precision '+' crosshairs at every 2nd intersection
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      const crossSize = 4;
      for (let x = gridSize; x < width; x += gridSize * 2) {
        for (let y = gridSize; y < height; y += gridSize * 2) {
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
        }
      }
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Grid matrix
      drawGrid();

      // 2. Ambient telemetry cursor glow (desktop)
      if (mouseX > 0 && mouseY > 0 && width >= 768) {
        const glow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 320);
        glow.addColorStop(0, 'rgba(225, 6, 0, 0.12)');
        glow.addColorStop(0.4, 'rgba(225, 6, 0, 0.04)');
        glow.addColorStop(1, 'rgba(225, 6, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, width, height);
      }

      // 3. Update and draw particles + connections
      const n = particles.length;

      // Draw connection lines first (behind dots)
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        for (let j = i + 1; j < n; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxLineDistSq) {
            const dist = Math.sqrt(distSq);
            const lineFactor = 1 - dist / maxLineDist;
            const hasAccent = p.isAccent || p2.isAccent;
            const lineAlpha = lineFactor * (hasAccent ? 0.32 : 0.16);

            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineWidth = hasAccent ? 0.9 : 0.7;
            ctx.strokeStyle = hasAccent
              ? `rgba(225, 6, 0, ${lineAlpha})`
              : `rgba(255, 255, 255, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw particle dots and telemetry pulses
      for (let i = 0; i < n; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap edges smoothly
          if (p.x < -15) p.x = width + 15;
          else if (p.x > width + 15) p.x = -15;
          if (p.y < -15) p.y = height + 15;
          else if (p.y > height + 15) p.y = -15;

          // Interactive cursor repulsion
          if (mouseX > 0 && mouseY > 0) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distSq = dx * dx + dy * dy;
            if (distSq < 22500 && distSq > 0) { // within 150px
              const dist = Math.sqrt(distSq);
              const force = ((150 - dist) / 150) * 0.6;
              p.x += (dx / dist) * force;
              p.y += (dy / dist) * force;
            }
          }

          p.pulsePhase += p.pulseSpeed;
        }

        const currentAlpha =
          p.baseAlpha * (0.8 + 0.2 * Math.sin(p.pulsePhase));

        // Radar ping ring on accent nodes
        if (p.isAccent) {
          if (!prefersReducedMotion) {
            p.pingRadius = ((p.pingRadius || 0) + 0.4) % 36;
            p.pingAlpha = Math.max(0, (1 - p.pingRadius / 36) * 0.35);
          }
          if (p.pingAlpha && p.pingAlpha > 0.01) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.pingRadius || 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(225, 6, 0, ${p.pingAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        if (p.isAccent) {
          ctx.fillStyle = `rgba(225, 6, 0, ${currentAlpha})`;
          ctx.shadowColor = '#E10600';
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
          ctx.shadowBlur = 3;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animationFrameId);
      } else if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
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
