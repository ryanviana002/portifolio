import { useEffect, useRef } from 'react';

export default function ClickRipple() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const ripples = [];
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 6;
        r.life -= 0.025;
        if (r.life <= 0) { ripples.splice(i, 1); continue; }

        ctx.globalAlpha = r.life * 0.6;
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 12;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        // segundo anel menor
        ctx.globalAlpha = r.life * 0.3;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius * 0.6, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const onClick = e => {
      const colors = ['#ff007f', '#00f2fe', '#9e9eff'];
      ripples.push({
        x: e.clientX, y: e.clientY,
        radius: 4, life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    };

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    window.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99997 }}
    />
  );
}
