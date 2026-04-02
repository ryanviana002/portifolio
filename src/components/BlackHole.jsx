import { useEffect, useRef } from 'react';

export default function BlackHole() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let animId;

    const cx = W * 0.75;
    const cy = H * 0.3;
    const coreR = 18;

    const particles = Array.from({ length: 180 }, () => ({
      angle: Math.random() * Math.PI * 2,
      radius: 60 + Math.random() * 300,
      speed: 0.002 + Math.random() * 0.004,
      size: Math.random() * 2 + 0.5,
      color: Math.random() > 0.5 ? '#ff007f' : Math.random() > 0.5 ? '#9e9eff' : '#00f2fe',
      drift: (Math.random() - 0.5) * 0.3,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Glow do buraco negro
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 6);
      glow.addColorStop(0, 'rgba(0,0,0,0.95)');
      glow.addColorStop(0.3, 'rgba(158,0,80,0.15)');
      glow.addColorStop(0.6, 'rgba(0,242,254,0.06)');
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, coreR * 6, 0, Math.PI * 2);
      ctx.fill();

      // Núcleo
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
      ctx.fill();

      // Anel de acreção
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(1, 0.28);
      const ring = ctx.createRadialGradient(0, 0, coreR * 1.1, 0, 0, coreR * 3.5);
      ring.addColorStop(0, 'rgba(255,0,127,0.9)');
      ring.addColorStop(0.4, 'rgba(255,140,0,0.6)');
      ring.addColorStop(0.7, 'rgba(0,242,254,0.3)');
      ring.addColorStop(1, 'transparent');
      ctx.strokeStyle = ring;
      ctx.lineWidth = coreR * 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, coreR * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Partículas sendo sugadas
      for (const p of particles) {
        p.angle += p.speed;
        p.radius -= 0.12 + (300 - p.radius) * 0.002;
        p.speed += 0.00005;

        if (p.radius < coreR) {
          p.radius = 80 + Math.random() * 280;
          p.speed = 0.002 + Math.random() * 0.004;
          p.angle = Math.random() * Math.PI * 2;
        }

        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius * 0.35;
        const alpha = Math.min(1, (p.radius - coreR) / 80);

        ctx.globalAlpha = alpha * 0.7;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(x, y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}
    />
  );
}
