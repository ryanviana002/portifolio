import { useEffect, useRef } from 'react';

export default function ClickEcho() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const echoes = [];
    let animId;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const now = Date.now();

      for (let i = echoes.length - 1; i >= 0; i--) {
        const e = echoes[i];
        const age = (now - e.born) / e.lifetime;
        if (age >= 1) { echoes.splice(i, 1); continue; }

        const r = age * e.maxR;
        const alpha = (1 - age) * 0.5;

        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.stroke();

        // ponto central que persiste
        ctx.globalAlpha = (1 - age) * 0.8;
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(e.x, e.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    const colors = ['#ff007f', '#00f2fe', '#9e9eff'];
    let colorIdx = 0;

    const onClick = e => {
      echoes.push({
        x: e.clientX, y: e.clientY,
        born: Date.now(),
        lifetime: 10000, // 10s
        maxR: 60,
        color: colors[colorIdx % colors.length],
      });
      colorIdx++;
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
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99996 }}
    />
  );
}
