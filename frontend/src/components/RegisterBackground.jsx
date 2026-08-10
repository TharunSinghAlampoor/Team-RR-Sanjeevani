import React, { useRef, useEffect } from 'react';

/**
 * RegisterBackground — Vibrant Violet, Purple, Rose & Teal Background
 */
const RegisterBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawSoftOrbs = (ctx, t, width, height) => {
      const orbs = [
        { xr: 0.85, yr: 0.18, r: 500, c: '139, 92, 246', a: 0.18 }, // Violet
        { xr: 0.15, yr: 0.80, r: 460, c: '236, 72, 153', a: 0.16 }, // Pink / Rose
        { xr: 0.50, yr: 0.85, r: 400, c: '20, 184, 166',  a: 0.15 }, // Teal
        { xr: 0.20, yr: 0.20, r: 360, c: '168, 85, 247', a: 0.15 }, // Purple
        { xr: 0.80, yr: 0.75, r: 420, c: '16, 185, 129',  a: 0.14 }, // Emerald
      ];
      orbs.forEach((o, i) => {
        const ox = width * o.xr + Math.sin(t * 0.2 + i * 1.6) * 45;
        const oy = height * o.yr + Math.cos(t * 0.22 + i * 1.3) * 40;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        grad.addColorStop(0, `rgba(${o.c}, ${o.a})`);
        grad.addColorStop(0.5, `rgba(${o.c}, ${o.a * 0.4})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(ox - o.r, oy - o.r, o.r * 2, o.r * 2);
      });
    };

    // Micro floating colored dual-tone pills
    const pills = Array.from({ length: 15 }, () => ({
      x: Math.random(),
      y: Math.random(),
      w: Math.random() * 14 + 16,
      h: Math.random() * 6 + 7,
      angle: Math.random() * Math.PI * 2,
      vy: -(Math.random() * 0.2 + 0.06),
      alpha: Math.random() * 0.25 + 0.12,
      color1: ['#8b5cf6', '#ec4899', '#10b981', '#06b6d4'][Math.floor(Math.random() * 4)],
      color2: ['#a855f7', '#f43f5e', '#14b8a6', '#0284c7'][Math.floor(Math.random() * 4)],
    }));

    const drawPills = (ctx, width, height) => {
      pills.forEach(p => {
        p.y += p.vy / height;
        if (p.y < -0.05) p.y = 1.05;

        const cx = p.x * width;
        const cy = p.y * height;
        const r = p.h / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(p.angle);
        ctx.globalAlpha = p.alpha;

        // Dual tone capsule fill
        ctx.beginPath();
        ctx.roundRect(-p.w / 2, -p.h / 2, p.w / 2, p.h, [r, 0, 0, r]);
        ctx.fillStyle = p.color1;
        ctx.fill();

        ctx.beginPath();
        ctx.roundRect(0, -p.h / 2, p.w / 2, p.h, [0, r, r, 0]);
        ctx.fillStyle = p.color2;
        ctx.fill();

        ctx.restore();
      });
    };

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#faf5ff');
      bgGrad.addColorStop(0.35, '#fdf2f8');
      bgGrad.addColorStop(0.7, '#f0fdfa');
      bgGrad.addColorStop(1, '#f5f3ff');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawSoftOrbs(ctx, time, canvas.width, canvas.height);
      drawPills(ctx, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

export default RegisterBackground;
