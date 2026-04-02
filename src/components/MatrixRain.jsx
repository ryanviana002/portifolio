import { useEffect, useRef } from 'react';
import './MatrixRain.css';

export default function MatrixRain({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const cols = Math.floor(W / 16);
    const drops = Array(cols).fill(1);
    const chars = 'RDCABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}[]()=+-*/'.split('');

    let alpha = 0;
    let fading = false;
    let animId;

    // Fade in
    const fadeIn = setInterval(() => {
      alpha = Math.min(1, alpha + 0.05);
      if (alpha >= 1) clearInterval(fadeIn);
    }, 30);

    // Começa a fechar após 3s
    setTimeout(() => {
      fading = true;
    }, 3000);

    const draw = () => {
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(2,2,4,0.08)';
      ctx.fillRect(0, 0, W, H);

      ctx.font = '14px monospace';
      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 16;
        const y = drops[i] * 16;

        // Primeira letra mais brilhante
        ctx.fillStyle = drops[i] * 16 < 30 ? '#ffffff' : '#ff007f';
        if (Math.random() > 0.7) ctx.fillStyle = '#00f2fe';

        ctx.fillText(char, x, y);

        if (y > H && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }

      if (fading) {
        alpha = Math.max(0, alpha - 0.03);
        if (alpha <= 0) {
          cancelAnimationFrame(animId);
          onDone?.();
          return;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="matrix-canvas" />;
}
