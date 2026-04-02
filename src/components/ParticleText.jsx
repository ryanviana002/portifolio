import { useEffect, useRef } from 'react';
import './ParticleText.css';

export default function ParticleText({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width = window.innerWidth;
    const H = canvas.height = window.innerHeight;

    // Desenha "RDC" num canvas offscreen para capturar pixels
    const off = document.createElement('canvas');
    const fontSize = Math.min(W * 0.35, 260);
    off.width = W; off.height = H;
    const octx = off.getContext('2d');
    octx.fillStyle = '#fff';
    octx.font = `900 ${fontSize}px "Space Grotesk", sans-serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText('RDC', W / 2, H / 2);

    const data = octx.getImageData(0, 0, W, H).data;
    const particles = [];
    const gap = 6;

    for (let x = 0; x < W; x += gap) {
      for (let y = 0; y < H; y += gap) {
        const idx = (y * W + x) * 4;
        if (data[idx + 3] > 128) {
          const colors = ['#ff007f', '#00f2fe', '#9e9eff', '#ffffff'];
          particles.push({
            tx: x, ty: y,
            x: Math.random() * W,
            y: Math.random() * H,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 2 + 1,
            speed: 0.04 + Math.random() * 0.04,
          });
        }
      }
    }

    let phase = 'gather'; // gather → hold → explode
    let holdTimer = 0;
    let animId;

    const animate = () => {
      ctx.fillStyle = 'rgba(2,2,4,0.18)';
      ctx.fillRect(0, 0, W, H);

      let allGathered = true;

      for (const p of particles) {
        if (phase === 'gather') {
          p.x += (p.tx - p.x) * p.speed;
          p.y += (p.ty - p.y) * p.speed;
          const dist = Math.hypot(p.tx - p.x, p.ty - p.y);
          if (dist > 2) allGathered = false;
        } else if (phase === 'explode') {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15;
          p.alpha = (p.alpha ?? 1) * 0.97;
        }

        ctx.globalAlpha = phase === 'explode' ? (p.alpha ?? 1) : 1;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      if (phase === 'gather' && allGathered) {
        phase = 'hold';
      }

      if (phase === 'hold') {
        holdTimer++;
        if (holdTimer > 60) {
          phase = 'explode';
          for (const p of particles) {
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 8 + 2;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed - 3;
            p.alpha = 1;
          }
          setTimeout(() => onDone?.(), 1000);
        }
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <canvas ref={canvasRef} className="particle-canvas" />;
}
