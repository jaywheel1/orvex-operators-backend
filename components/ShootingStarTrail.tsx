'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Point {
  x: number;
  y: number;
  t: number;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number; // 0 = purple, 1 = celadon
}

interface ShootingStarTrailProps {
  /** Max number of trail points stored */
  trailLength?: number;
  /** Trail lifetime in ms — points older than this fade completely */
  trailDuration?: number;
  /** Base width of the trail head in px */
  headWidth?: number;
  /** How many spark particles to emit per frame when moving */
  sparkRate?: number;
}

export default function ShootingStarTrail({
  trailLength = 80,
  trailDuration = 400,
  headWidth = 4,
  sparkRate = 2,
}: ShootingStarTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trail = useRef<Point[]>([]);
  const sparks = useRef<Spark[]>([]);
  const mouse = useRef({ x: -1000, y: -1000 });
  const prevMouse = useRef({ x: -1000, y: -1000 });
  const animRef = useRef<number>(0);
  const visible = useRef(false);

  // Brand colours
  const PURPLE = { r: 98, g: 101, b: 254 };
  const INDIGO = { r: 125, g: 133, b: 208 };
  const CELADON = { r: 185, g: 240, b: 215 };

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const lerpColor = useCallback(
    (t: number) => {
      // 0 → purple, 0.5 → indigo, 1 → celadon
      if (t < 0.5) {
        const lt = t * 2;
        return {
          r: lerp(PURPLE.r, INDIGO.r, lt),
          g: lerp(PURPLE.g, INDIGO.g, lt),
          b: lerp(PURPLE.b, INDIGO.b, lt),
        };
      }
      const lt = (t - 0.5) * 2;
      return {
        r: lerp(INDIGO.r, CELADON.r, lt),
        g: lerp(INDIGO.g, CELADON.g, lt),
        b: lerp(INDIGO.b, CELADON.b, lt),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }, []);

  useEffect(() => {
    resize();

    const onMove = (e: MouseEvent) => {
      prevMouse.current = { ...mouse.current };
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) visible.current = true;

      // Push a new trail point
      trail.current.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (trail.current.length > trailLength) {
        trail.current.splice(0, trail.current.length - trailLength);
      }
    };

    const onLeave = () => {
      visible.current = false;
    };

    const onResize = () => resize();

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('resize', onResize);
    };
  }, [resize, trailLength]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      const now = performance.now();
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      // --- Cull old trail points ---
      trail.current = trail.current.filter((p) => now - p.t < trailDuration);

      const pts = trail.current;

      if (pts.length > 1 && visible.current) {
        // Compute velocity for spark emission
        const dx = mouse.current.x - prevMouse.current.x;
        const dy = mouse.current.y - prevMouse.current.y;
        const speed = Math.sqrt(dx * dx + dy * dy);

        // Emit sparks proportional to speed
        if (speed > 2) {
          const count = Math.min(Math.floor(speed * 0.3), sparkRate * 3);
          for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const v = 0.5 + Math.random() * 2;
            sparks.current.push({
              x: mouse.current.x + (Math.random() - 0.5) * 6,
              y: mouse.current.y + (Math.random() - 0.5) * 6,
              vx: Math.cos(angle) * v - dx * 0.1,
              vy: Math.sin(angle) * v - dy * 0.1,
              life: 1,
              maxLife: 0.4 + Math.random() * 0.5,
              size: 1 + Math.random() * 2.5,
              hue: Math.random(),
            });
          }
        }

        // --- Draw trail ---
        for (let i = 1; i < pts.length; i++) {
          const p0 = pts[i - 1];
          const p1 = pts[i];
          const age0 = (now - p0.t) / trailDuration;
          const age1 = (now - p1.t) / trailDuration;
          const alpha0 = Math.max(0, 1 - age0);
          const alpha1 = Math.max(0, 1 - age1);

          // Width tapers toward the tail
          const progress = i / pts.length; // 0 = tail, 1 = head
          const width = headWidth * progress * progress;

          const c0 = lerpColor(age0);
          const c1 = lerpColor(age1);

          const grad = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
          grad.addColorStop(0, `rgba(${c0.r|0},${c0.g|0},${c0.b|0},${alpha0 * 0.8})`);
          grad.addColorStop(1, `rgba(${c1.r|0},${c1.g|0},${c1.b|0},${alpha1 * 0.8})`);

          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(0.5, width);
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Glow around the head
        if (pts.length > 0) {
          const head = pts[pts.length - 1];
          const glowGrad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 20);
          glowGrad.addColorStop(0, `rgba(${PURPLE.r},${PURPLE.g},${PURPLE.b},0.35)`);
          glowGrad.addColorStop(0.5, `rgba(${INDIGO.r},${INDIGO.g},${INDIGO.b},0.1)`);
          glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.beginPath();
          ctx.arc(head.x, head.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = glowGrad;
          ctx.fill();
        }
      }

      // --- Update & draw sparks ---
      const dt = 1 / 60;
      sparks.current = sparks.current.filter((s) => s.life > 0);
      for (const s of sparks.current) {
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.vy += 0.02; // tiny gravity
        s.life -= dt / s.maxLife;

        if (s.life <= 0) continue;

        const alpha = s.life * 0.7;
        const radius = s.size * s.life;
        const c = s.hue < 0.5
          ? lerpColor(s.hue)
          : lerpColor(0.5 + s.hue * 0.5);

        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${c.r|0},${c.g|0},${c.b|0},${alpha})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [trailDuration, headWidth, sparkRate, lerpColor]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[999]"
      aria-hidden="true"
    />
  );
}
