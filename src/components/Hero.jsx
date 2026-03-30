import { useEffect, useRef, useState } from 'react';
import './Hero.css';

function RocketIcon() {
  const [launched, setLaunched] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [respawning, setRespawning] = useState(false);
  const [burstPos, setBurstPos] = useState({ x: 0, y: 0 });
  const [isLight, setIsLight] = useState(false);
  const rocketRef = useRef(null);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.getAttribute('data-theme') === 'light');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);

  const handleClick = () => {
    if (launched) return;
    if (rocketRef.current) {
      const rect = rocketRef.current.getBoundingClientRect();
      setBurstPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    setLaunched(true);
    setTimeout(() => setBursting(true), 1400);
    setTimeout(() => {
      setBursting(false);
      setRespawning(true);
      setLaunched(false);
      setTimeout(() => setRespawning(false), 900);
    }, 5500);
  };

  return (
    <>
      {bursting && (
        <div className="burst-overlay">
          {[
            { cls: 'bb1', color: '#ff007f' },
            { cls: 'bb2', color: '#00f2fe' },
            { cls: 'bb3', color: '#9e9eff' },
            { cls: 'bb4', color: '#ffffff' },
            { cls: 'bb5', color: '#ff007f' },
          ].map((b, i) => (
            <div key={i} className={`burst-bubble ${b.cls}`} style={{ borderColor: b.color, color: b.color, left: burstPos.x + 'px', top: burstPos.y + 'px' }}>
              &lt;/&gt;
            </div>
          ))}
        </div>
      )}
      <div ref={rocketRef} className={`hero-rocket${launched ? ' launched' : ''}${respawning ? ' respawning' : ''}`} onClick={handleClick} style={{ cursor: 'pointer' }}>
      {isLight ? (
        <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="rocket-svg">
          {/* Bolhas (cores do site) */}
          <g style={{ animation: 'bubble1 5s ease-out infinite', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="10" fill="none" stroke="#ff007f" strokeWidth="1.5" opacity="0.8"/>
            <text x="60" y="139" textAnchor="middle" fontSize="7" fontFamily="monospace" fontWeight="bold" fill="#ff007f">&lt;/&gt;</text>
          </g>
          <g style={{ animation: 'bubble2 5s ease-out infinite', animationDelay: '1s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="9" fill="none" stroke="#00f2fe" strokeWidth="1.5" opacity="0.8"/>
            <text x="60" y="139" textAnchor="middle" fontSize="6" fontFamily="monospace" fontWeight="bold" fill="#00f2fe">&lt;/&gt;</text>
          </g>
          <g style={{ animation: 'bubble3 5s ease-out infinite', animationDelay: '2s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="8" fill="none" stroke="#9e9eff" strokeWidth="1.5" opacity="0.8"/>
            <text x="60" y="139" textAnchor="middle" fontSize="5.5" fontFamily="monospace" fontWeight="bold" fill="#9e9eff">&lt;/&gt;</text>
          </g>
          <g style={{ animation: 'bubble4 5s ease-out infinite', animationDelay: '3s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="7" fill="none" stroke="#ff007f" strokeWidth="1.5" opacity="0.7"/>
            <text x="60" y="139" textAnchor="middle" fontSize="5" fontFamily="monospace" fontWeight="bold" fill="#ff007f">&lt;/&gt;</text>
          </g>
          <g style={{ animation: 'bubble5 5s ease-out infinite', animationDelay: '4s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="8.5" fill="none" stroke="#00f2fe" strokeWidth="1.5" opacity="0.8"/>
            <text x="60" y="139" textAnchor="middle" fontSize="6" fontFamily="monospace" fontWeight="bold" fill="#00f2fe">&lt;/&gt;</text>
          </g>

          {/* Corpo — cinza claro com contorno pink */}
          <path d="M60 10 C40 40 30 85 30 118 L90 118 C90 85 80 40 60 10Z" fill="#f0f0f8" stroke="#ff007f" strokeWidth="2"/>

          {/* Topo — pink */}
          <path d="M60 10 C48 30 42 55 40 75 L80 75 C78 55 72 30 60 10Z" fill="#ff007f"/>

          {/* Faixa central — cyan */}
          <rect x="30" y="100" width="60" height="9" rx="2" fill="#00f2fe"/>

          {/* Janela — purple */}
          <circle cx="60" cy="86" r="13" fill="#9e9eff" stroke="#ff007f" strokeWidth="1.5"/>
          <circle cx="60" cy="86" r="8" fill="#7b7bff"/>
          <ellipse cx="56" cy="82" rx="3.5" ry="2.5" fill="white" opacity="0.5"/>

          {/* Base */}
          <rect x="30" y="118" width="60" height="7" rx="3" fill="#9e9eff" stroke="#ff007f" strokeWidth="1.5"/>

          {/* Asa esquerda — cyan */}
          <path d="M30 116 L4 153 L30 143Z" fill="#00f2fe" stroke="#ff007f" strokeWidth="1.5"/>

          {/* Asa direita — cyan */}
          <path d="M90 116 L116 153 L90 143Z" fill="#00f2fe" stroke="#ff007f" strokeWidth="1.5"/>

        </svg>
      ) : (
        <svg viewBox="0 0 120 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="rocket-svg">
          <defs>
            <filter id="ledGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="ledGlowCyan">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          <path d="M60 8 C38 38 28 85 28 118 L92 118 C92 85 82 38 60 8Z" stroke="#00f2fe" strokeWidth="1.5" fill="none" filter="url(#ledGlowCyan)" />
          <circle cx="60" cy="70" r="13" stroke="#00f2fe" strokeWidth="1.5" fill="none" filter="url(#ledGlowCyan)" />
          <circle cx="60" cy="70" r="6" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.6" />
          <line x1="60" y1="20" x2="60" y2="115" stroke="rgba(0,242,254,0.2)" strokeWidth="0.8" strokeDasharray="4 4" />
          <rect x="28" y="118" width="64" height="10" rx="3" stroke="#9e9eff" strokeWidth="1.5" fill="none" filter="url(#ledGlow)" />
          <path d="M28 118 L6 152 L28 142" stroke="#ff007f" strokeWidth="1.5" fill="none" filter="url(#ledGlow)" />
          <path d="M92 118 L114 152 L92 142" stroke="#ff007f" strokeWidth="1.5" fill="none" filter="url(#ledGlow)" />

          <g style={{ animation: launched ? 'bubbleBurst1 0.8s ease-out forwards' : 'bubble1 5s ease-out infinite', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="10" fill="none" stroke="#ff007f" strokeWidth="0.8" opacity="0.6" filter="url(#ledGlow)" />
            <text x="60" y="139" textAnchor="middle" fontSize="7" fontFamily="monospace" fontWeight="bold" fill="none" stroke="#ff007f" strokeWidth="0.5">&lt;/&gt;</text>
          </g>
          <g style={{ animation: launched ? 'bubbleBurst2 0.8s ease-out 0.1s forwards' : 'bubble2 5s ease-out infinite', animationDelay: launched ? '0.1s' : '1s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="9" fill="none" stroke="#00f2fe" strokeWidth="0.8" opacity="0.6" filter="url(#ledGlowCyan)" />
            <text x="60" y="139" textAnchor="middle" fontSize="6" fontFamily="monospace" fontWeight="bold" fill="none" stroke="#00f2fe" strokeWidth="0.5">&lt;/&gt;</text>
          </g>
          <g style={{ animation: launched ? 'bubbleBurst3 0.8s ease-out 0.2s forwards' : 'bubble3 5s ease-out infinite', animationDelay: launched ? '0.2s' : '2s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="8" fill="none" stroke="#9e9eff" strokeWidth="0.8" opacity="0.6" filter="url(#ledGlow)" />
            <text x="60" y="139" textAnchor="middle" fontSize="5.5" fontFamily="monospace" fontWeight="bold" fill="none" stroke="#9e9eff" strokeWidth="0.5">&lt;/&gt;</text>
          </g>
          <g style={{ animation: launched ? 'bubbleBurst4 0.8s ease-out 0.15s forwards' : 'bubble4 5s ease-out infinite', animationDelay: launched ? '0.15s' : '3s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="7" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.5" filter="url(#ledGlow)" />
            <text x="60" y="139" textAnchor="middle" fontSize="5" fontFamily="monospace" fontWeight="bold" fill="none" stroke="#ffffff" strokeWidth="0.5">&lt;/&gt;</text>
          </g>
          <g style={{ animation: launched ? 'bubbleBurst5 0.8s ease-out 0.25s forwards' : 'bubble5 5s ease-out infinite', animationDelay: launched ? '0.25s' : '4s', transformOrigin: '60px 136px' }}>
            <circle cx="60" cy="136" r="8.5" fill="none" stroke="#ff007f" strokeWidth="0.8" opacity="0.6" filter="url(#ledGlow)" />
            <text x="60" y="139" textAnchor="middle" fontSize="6" fontFamily="monospace" fontWeight="bold" fill="none" stroke="#ff007f" strokeWidth="0.5">&lt;/&gt;</text>
          </g>

          <circle cx="15" cy="148" r="2" fill="#ff007f" filter="url(#ledGlow)" />
          <circle cx="105" cy="148" r="2" fill="#ff007f" filter="url(#ledGlow)" />
          <circle cx="60" cy="10" r="2.5" fill="#00f2fe" filter="url(#ledGlowCyan)" />
        </svg>
      )}
    </div>
    </>
  );
}

function splitLetters(text, extraClass) {
  return text.split('').map((char, i) =>
    char === ' '
      ? <span key={i} className="mag-letter mag-space" />
      : <span key={i} className={`mag-letter${extraClass ? ' ' + extraClass : ''}`}>{char}</span>
  );
}

export default function Hero() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const titleRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    // --- stars (dark mode) ---
    const STAR_COUNT = 120;
    const SPEED = 0.6;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 200,
      y: H / 2 + (Math.random() - 0.5) * 200,
      z: Math.random() * W,
      pz: 0,
    }));
    stars.forEach(s => s.pz = s.z);

    function update() {
      const light = isLight();
      ctx.fillStyle = light ? '#ffffff' : '#020204';
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        s.pz = s.z;
        s.z -= SPEED;
        if (s.z <= 0) {
          s.x = W / 2 + (Math.random() - 0.5) * 200;
          s.y = H / 2 + (Math.random() - 0.5) * 200;
          s.z = W; s.pz = W;
        }
        const ox = W / 2, oy = H / 2;
        const sx = (s.x - ox) * (W / s.z) + ox;
        const sy = (s.y - oy) * (W / s.z) + oy;
        const px = (s.x - ox) * (W / s.pz) + ox;
        const py = (s.y - oy) * (W / s.pz) + oy;
        if (sx < 0 || sx > W || sy < 0 || sy > H) continue;
        const r = Math.max(0.5, Math.min(3, W / s.z));
        const alpha = Math.min(1, (W - s.z) / W * 2);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = light ? `rgba(10,10,30,${alpha})` : `rgba(220,235,255,${alpha})`;
        ctx.lineWidth = r;
        ctx.stroke();
      }

      animId = requestAnimationFrame(update);
    }

    update();

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

  useEffect(() => {
    const onMove = e => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);


  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const letters = title.querySelectorAll('.mag-letter');
    let origins = null;

    const onMove = e => {
      if (!origins) {
        origins = Array.from(letters).map(l => {
          const r = l.getBoundingClientRect();
          return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        });
      }
      letters.forEach((letter, i) => {
        const { cx, cy } = origins[i];
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const force = (1 - dist / 80) * 18;
          const angle = Math.atan2(dy, dx);
          letter.style.transform = `translate(${Math.cos(angle) * force}px, ${Math.sin(angle) * force}px)`;
        } else {
          letter.style.transform = '';
        }
      });
    };

    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section id="inicio" className="hero">
      <canvas ref={canvasRef} className="hero-canvas" />

      <div className="hero-glow glow-pink" />
      <div className="hero-glow glow-cyan" />

      <div className="hero-layout">
        <div className="hero-content">
          <p className="hero-tag">CRIAÇÃO DIGITAL & DESENVOLVIMENTO</p>
          <h1 className="hero-title" ref={titleRef}>
            <span className="line1">{splitLetters('EU CRIO')}</span>
            <span className="line2">
              <span className="line2-group">{splitLetters('A SUA', 'grad-pink')}</span>
              <span className="line2-group">{splitLetters('PRESENÇA', 'grad-cyan')}</span>
            </span>
            <span className="line3">{splitLetters('DIGITAL.')}</span>
          </h1>
          <p className="hero-sub">
            Sites que convertem. Sistemas que entregam. Design que impressiona.
          </p>
        </div>

        <div className="hero-logo-wrap">
          <RocketIcon />
        </div>
      </div>

      <div className="hero-ticker">
        <div className="ticker-track">
          {[
            'WEB DESIGN', 'DEV 4GL INFORMIX', 'DESIGNER CANVA',
            'WEB DESIGN', 'DEV 4GL INFORMIX', 'DESIGNER CANVA',
          ].map((t, i) => (
            <span key={i}>{t} <span className="dot">•</span> </span>
          ))}
        </div>
      </div>

      <div className="hero-scroll">
        <span className="scroll-arrow">↓</span>
      </div>
    </section>
  );
}
