import { useEffect, useRef, useState } from 'react';
import './Portal.css';

export default function Portal({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;
    let animId;
    let t = 0;

    const draw = () => {
      t += 0.04;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const maxR = Math.max(W, H);

      // Fundo escurecendo
      ctx.fillStyle = `rgba(2,2,4,${Math.min(0.85, t * 0.5)})`;
      ctx.fillRect(0, 0, W, H);

      // Anéis do vórtex
      for (let r = 0; r < 12; r++) {
        const radius = (maxR * 0.6) * (1 - (r / 12)) * Math.max(0, 1 - t * 0.4);
        const angle = t * (3 + r * 0.5);
        const colors = ['#ff007f', '#9e9eff', '#00f2fe'];
        const col = colors[r % 3];

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(angle);
        ctx.scale(1, 0.4 + r * 0.04);

        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = (1 - r / 12) * 0.7;
        ctx.shadowBlur = 12;
        ctx.shadowColor = col;
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Centro brilhante
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * Math.max(0.1, 1 - t * 0.3));
      glow.addColorStop(0, 'rgba(255,255,255,0.9)');
      glow.addColorStop(0.3, 'rgba(0,242,254,0.4)');
      glow.addColorStop(1, 'transparent');
      ctx.globalAlpha = Math.min(1, t * 2);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (t < 1.8) {
        animId = requestAnimationFrame(draw);
      } else {
        onDone?.();
      }
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="portal-canvas" />;
}
