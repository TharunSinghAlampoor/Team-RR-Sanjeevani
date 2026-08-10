import React, { useRef, useEffect } from 'react';

/**
 * LoginBackground — Vibrant Emerald & Cyan Healthcare Background
 */
const LoginBackground = () => {
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
        { xr: 0.15, yr: 0.20, r: 480, c: '16, 185, 129', a: 0.18 }, // Emerald
        { xr: 0.85, yr: 0.80, r: 520, c: '6, 182, 212',  a: 0.16 }, // Cyan
        { xr: 0.50, yr: 0.15, r: 380, c: '2, 132, 199',  a: 0.14 }, // Sky Blue
        { xr: 0.80, yr: 0.15, r: 350, c: '20, 184, 166', a: 0.15 }, // Teal
        { xr: 0.20, yr: 0.75, r: 400, c: '5, 150, 105',  a: 0.14 }, // Dark Emerald
      ];
      orbs.forEach((o, i) => {
        const ox = width * o.xr + Math.sin(t * 0.25 + i * 1.5) * 45;
        const oy = height * o.yr + Math.cos(t * 0.22 + i * 1.2) * 40;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        grad.addColorStop(0, `rgba(${o.c}, ${o.a})`);
        grad.addColorStop(0.5, `rgba(${o.c}, ${o.a * 0.4})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(ox - o.r, oy - o.r, o.r * 2, o.r * 2);
      });
    };

    // Micro floating colored crosses
    const crosses = Array.from({ length: 16 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 10 + 8,
      vy: -(Math.random() * 0.18 + 0.06),
      alpha: Math.random() * 0.22 + 0.10,
      color: ['#10b981', '#06b6d4', '#0284c7', '#14b8a6'][Math.floor(Math.random() * 4)],
    }));

    const drawCrosses = (ctx, width, height) => {
      crosses.forEach(c => {
        c.y += c.vy / height;
        if (c.y < -0.05) c.y = 1.05;

        const cx = c.x * width;
        const cy = c.y * height;
        const s = c.size;
        const t = s * 0.32;

        ctx.save();
        ctx.globalAlpha = c.alpha;
        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.roundRect(cx - s, cy - t / 2, s * 2, t, 3);
        ctx.fill();
        ctx.beginPath();
        ctx.roundRect(cx - t / 2, cy - s, t, s * 2, 3);
        ctx.fill();
        ctx.restore();
      });
    };

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Vibrant, rich gradient background base
      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#e6fffa');
      bgGrad.addColorStop(0.35, '#f0fdf4');
      bgGrad.addColorStop(0.7, '#e0f2fe');
      bgGrad.addColorStop(1, '#dcfce7');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawSoftOrbs(ctx, time, canvas.width, canvas.height);
      drawCrosses(ctx, canvas.width, canvas.height);

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

export default LoginBackground;
