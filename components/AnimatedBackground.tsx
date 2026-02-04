'use client';

import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface VortexParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  opacity: number;
  color: string;
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const vortexParticlesRef = useRef<VortexParticle[]>([]);
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createStars();
      createVortexParticles();
    };

    // Create twinkling stars
    const createStars = () => {
      const stars: Star[] = [];
      const starCount = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 8000));

      for (let i = 0; i < starCount; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          twinkleSpeed: Math.random() * 0.02 + 0.005,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
    };

    // Create vortex/gravity particles
    const createVortexParticles = () => {
      const particles: VortexParticle[] = [];
      const particleCount = 40;
      const colors = [
        'rgba(98, 101, 254, 0.6)',
        'rgba(125, 133, 208, 0.5)',
        'rgba(182, 187, 255, 0.4)',
        'rgba(201, 232, 255, 0.3)',
      ];

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          angle: Math.random() * Math.PI * 2,
          radius: Math.random() * Math.min(canvas.width, canvas.height) * 0.4 + 100,
          speed: Math.random() * 0.002 + 0.001,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.4 + 0.1,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      vortexParticlesRef.current = particles;
    };

    // Draw a single star with twinkle effect
    const drawStar = (star: Star, time: number) => {
      if (!ctx) return;
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7;
      const currentOpacity = star.opacity * twinkle;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${currentOpacity})`;
      ctx.fill();

      // Subtle glow for larger stars
      if (star.size > 1) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * 2, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(
          star.x, star.y, 0,
          star.x, star.y, star.size * 2
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${currentOpacity * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    };

    // Draw vortex particle with gravitational spiral
    const drawVortexParticle = (particle: VortexParticle, centerX: number, centerY: number) => {
      if (!ctx) return;

      const x = centerX + Math.cos(particle.angle) * particle.radius;
      const y = centerY + Math.sin(particle.angle) * particle.radius;

      // Draw particle
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color.replace(/[\d.]+\)$/, `${particle.opacity})`);
      ctx.fill();

      // Draw trail (gravitational streak)
      const trailLength = 30;
      const trailAngle = particle.angle - particle.speed * 15;
      const trailX = centerX + Math.cos(trailAngle) * (particle.radius + 5);
      const trailY = centerY + Math.sin(trailAngle) * (particle.radius + 5);

      const gradient = ctx.createLinearGradient(x, y, trailX, trailY);
      gradient.addColorStop(0, particle.color.replace(/[\d.]+\)$/, `${particle.opacity * 0.5})`));
      gradient.addColorStop(1, 'transparent');

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(trailX, trailY);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = particle.size * 0.8;
      ctx.stroke();
    };

    // Update vortex particle (spiral inward with gravity)
    const updateVortexParticle = (particle: VortexParticle) => {
      // Rotate around center
      particle.angle += particle.speed;

      // Slowly spiral inward (gravity pull)
      particle.radius -= 0.05;

      // Reset when too close to center
      if (particle.radius < 50) {
        particle.radius = Math.min(canvas.width, canvas.height) * 0.45;
        particle.angle = Math.random() * Math.PI * 2;
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      timeRef.current += 1;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw stars
      starsRef.current.forEach(star => {
        drawStar(star, timeRef.current);
      });

      // Draw and update vortex particles
      vortexParticlesRef.current.forEach(particle => {
        updateVortexParticle(particle);
        drawVortexParticle(particle, centerX, centerY);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Deep space gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#070713] via-[#0a0a1a] to-[#070713]" />

      {/* Subtle nebula effect - very faint */}
      <div className="absolute top-[-30%] left-[-20%] w-[800px] h-[800px] bg-[#6265fe] rounded-full opacity-[0.02] blur-[200px]" />
      <div className="absolute bottom-[-30%] right-[-20%] w-[800px] h-[800px] bg-[#7d85d0] rounded-full opacity-[0.02] blur-[200px]" />

      {/* Canvas for stars and vortex animation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Vortex center subtle indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-[#6265fe]/5 animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-8 rounded-full border border-[#7d85d0]/5 animate-[spin_45s_linear_infinite_reverse]" />
        <div className="absolute inset-16 rounded-full border border-[#6265fe]/5 animate-[spin_30s_linear_infinite]" />
      </div>

      {/* Grid pattern - space grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(98, 101, 254, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(98, 101, 254, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-24 h-24 border-l border-t border-[#6265fe]/10 rounded-tl-3xl" />
      <div className="absolute top-0 right-0 w-24 h-24 border-r border-t border-[#7d85d0]/10 rounded-tr-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 border-l border-b border-[#7d85d0]/10 rounded-bl-3xl" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-r border-b border-[#6265fe]/10 rounded-br-3xl" />
    </div>
  );
}
