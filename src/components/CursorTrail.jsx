import { useEffect, useRef } from 'react';

const COLORS = ['#ff007f', '#00f2fe', '#9e9eff', '#ffffff'];

export default function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const particles = [];
    let lastX = -1, lastY = -1;
    let animId;

    const spawn = (x, y, speed) => {
      const count = Math.floor(speed * 0.4 + 1);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const vel = Math.random() * speed * 0.25 + 0.5;
        particles.push({
          x, y,
          vx: Math.cos(angle) * vel,
          vy: Math.sin(angle) * vel - Math.random() * 2,
          life: 1,
          decay: 0.02 + Math.random() * 0.03,
          size: Math.random() * 3 + 1,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06; // gravidade
        p.vx *= 0.98; // atrito
        p.life -= p.decay;

        if (p.life <= 0) { particles.splice(i, 1); continue; }

        ctx.globalAlpha = p.life * 0.8;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const onMove = e => {
      const x = e.clientX;
      const y = e.clientY;
      if (lastX < 0) { lastX = x; lastY = y; return; }
      const dx = x - lastX;
      const dy = y - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      if (speed > 2) spawn(x, y, speed);
      lastX = x; lastY = y;
    };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0,
        pointerEvents: 'none',
        zIndex: 99998,
      }}
    />
  );
}
