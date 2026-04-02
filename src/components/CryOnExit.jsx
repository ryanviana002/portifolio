import { useEffect, useRef, useState } from 'react';
import './CryOnExit.css';

export default function CryOnExit() {
  const [visible, setVisible] = useState(false);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const onLeave = e => {
      if (e.clientY <= 0) setVisible(true);
    };
    document.addEventListener('mouseleave', onLeave);
    return () => document.removeEventListener('mouseleave', onLeave);
  }, []);

  useEffect(() => {
    if (!visible || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    const drops = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * -H,
      speed: 4 + Math.random() * 6,
      size: 2 + Math.random() * 4,
      length: 10 + Math.random() * 20,
      color: Math.random() > 0.5 ? '#00f2fe' : '#9e9eff',
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const d of drops) {
        d.y += d.speed;
        if (d.y > H) { d.y = -d.length; d.x = Math.random() * W; }

        const grad = ctx.createLinearGradient(d.x, d.y, d.x, d.y + d.length);
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(1, d.color);
        ctx.strokeStyle = grad;
        ctx.lineWidth = d.size * 0.4;
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.length);
        ctx.stroke();

        // gota na ponta
        ctx.fillStyle = d.color;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(d.x - 1, d.y + d.length, d.size * 0.5, d.size * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="cry-overlay">
      <canvas ref={canvasRef} className="cry-canvas" />
      <div className="cry-content">
        <div className="cry-emoji">😢</div>
        <h2 className="cry-title">Não vai embora ainda...</h2>
        <p className="cry-sub">Tem muito mais pra ver aqui dentro.</p>
        <button className="cry-btn" onClick={() => setVisible(false)}>
          FICAR UM POUCO MAIS
        </button>
      </div>
    </div>
  );
}
