import React, { useRef, useEffect } from 'react';

/**
 * ForgotPasswordBackground — Vibrant Sky Blue, Amber, Cyan & Emerald Background
 */
const ForgotPasswordBackground = () => {
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
        { xr: 0.20, yr: 0.70, r: 500, c: '2, 132, 199',  a: 0.18 }, // Sky Blue
        { xr: 0.75, yr: 0.20, r: 460, c: '245, 158, 11', a: 0.16 }, // Amber Glow
        { xr: 0.50, yr: 0.15, r: 400, c: '6, 182, 212',  a: 0.15 }, // Bright Cyan
        { xr: 0.15, yr: 0.20, r: 350, c: '16, 185, 129', a: 0.14 }, // Emerald
        { xr: 0.85, yr: 0.75, r: 380, c: '14, 165, 233', a: 0.15 }, // Light Blue
      ];
      orbs.forEach((o, i) => {
        const ox = width * o.xr + Math.sin(t * 0.22 + i * 1.4) * 45;
        const oy = height * o.yr + Math.cos(t * 0.19 + i * 1.3) * 40;
        const grad = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        grad.addColorStop(0, `rgba(${o.c}, ${o.a})`);
        grad.addColorStop(0.5, `rgba(${o.c}, ${o.a * 0.4})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(ox - o.r, oy - o.r, o.r * 2, o.r * 2);
      });
    };

    // Micro floating colored key ring circles
    const rings = Array.from({ length: 15 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 9 + 7,
      vy: -(Math.random() * 0.18 + 0.05),
      alpha: Math.random() * 0.25 + 0.10,
      color: ['#0284c7', '#f59e0b', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)],
    }));

    const drawRings = (ctx, width, height) => {
      rings.forEach(r => {
        r.y += r.vy / height;
        if (r.y < -0.05) r.y = 1.05;

        const cx = r.x * width;
        const cy = r.y * height;

        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r.radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();
        ctx.restore();
      });
    };

    const animate = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#f0f9ff');
      bgGrad.addColorStop(0.35, '#fffbeb');
      bgGrad.addColorStop(0.7, '#e0f2fe');
      bgGrad.addColorStop(1, '#ecfdf5');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawSoftOrbs(ctx, time, canvas.width, canvas.height);
      drawRings(ctx, canvas.width, canvas.height);

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

export default ForgotPasswordBackground;
