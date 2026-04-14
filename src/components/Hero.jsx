import { useEffect, useRef, useState } from 'react';
import './Hero.css';

const TERMINAL_STEPS = [
  { type: 'cmd', text: 'npm create rdc-project@latest' },
  { type: 'out', text: '✓ Projeto criado com sucesso!' },
  { type: 'cmd', text: 'cd meu-site && npm install' },
  { type: 'out', text: '✓ Dependências instaladas' },
  { type: 'cmd', text: 'git init && git add .' },
  { type: 'out', text: '✓ Repositório inicializado' },
  { type: 'cmd', text: 'git commit -m "🚀 launch"' },
  { type: 'out', text: '✓ 1 commit criado' },
  { type: 'cmd', text: 'deploy --prod' },
  { type: 'out', text: '✓ Pronto! Pressione Enter...' },
];

const COMMANDS = {
  help: [
    '  help       — mostra este menu',
    '  projects   — veja meus projetos',
    '  contact    — entre em contato',
    '  skills     — minhas habilidades',
    '  clear      — limpa o terminal',
  ],
  projects: [
    '  → AutoAir Shop   — e-commerce automotivo',
    '  → Genuína Burger — cardápio digital',
    '  → RDCreator      — este portfólio',
    '  use: ryancreator.dev/portfolio',
  ],
  contact: [
    '  📧 contato@ryancreator.dev',
    '  💬 wa.me/5519994175385',
    '  🌐 ryancreator.dev',
  ],
  skills: [
    '  ████████████ 4GL Informix  98%',
    '  ███████████░ Web Design    92%',
    '  ██████████░░ React / Vite  88%',
    '  █████████░░░ CSS / Anim.   85%',
    '  ████████░░░░ Canva         80%',
  ],
};

function TerminalIcon() {
  const [lines, setLines] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [typing, setTyping] = useState(true);
  const [interactive, setInteractive] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const onReset = () => {
      setLines([]);
      setCurrentStep(0);
      setCurrentText('');
      setTyping(true);
      setInteractive(false);
      setInput('');
    };
    const onInteractive = () => setInteractive(true);
    window.addEventListener('rdc:terminal-reset', onReset);
    window.addEventListener('rdc:terminal-interactive', onInteractive);
    return () => {
      window.removeEventListener('rdc:terminal-reset', onReset);
      window.removeEventListener('rdc:terminal-interactive', onInteractive);
    };
  }, []);

  // Quando termina a animação, entra no modo interativo após Enter
  useEffect(() => {
    if (!interactive) return;
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [interactive]);

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    const newLines = [{ type: 'cmd', text: cmd }];
    if (trimmed === 'clear') {
      setLines([{ type: 'out', text: 'Terminal limpo. Digite help para começar.' }]);
      setInput('');
      return;
    }
    const output = COMMANDS[trimmed];
    if (output) {
      output.forEach(t => newLines.push({ type: 'out', text: t }));
    } else if (trimmed) {
      newLines.push({ type: 'out', text: `  comando não encontrado: ${trimmed}. Tente "help"` });
    }
    setLines(l => [...l, ...newLines]);
    setInput('');
  };

  useEffect(() => {
    if (currentStep >= TERMINAL_STEPS.length) return;

    const step = TERMINAL_STEPS[currentStep];

    if (step.type !== 'cmd') {
      // output aparece de uma vez após pausa
      const t = setTimeout(() => {
        setLines(l => [...l, step]);
        setCurrentStep(s => s + 1);
        setCurrentText('');
      }, 400);
      return () => clearTimeout(t);
    }

    if (!typing) return;

    if (currentText.length < step.text.length) {
      const t = setTimeout(() => {
        setCurrentText(step.text.slice(0, currentText.length + 1));
      }, 45);
      return () => clearTimeout(t);
    } else {
      // terminou de digitar — aguarda e avança
      const t = setTimeout(() => {
        setLines(l => [...l, step]);
        setCurrentStep(s => s + 1);
        setCurrentText('');
      }, 600);
      return () => clearTimeout(t);
    }
  }, [currentStep, currentText, typing]);


  const step = TERMINAL_STEPS[currentStep];
  const isTypingCmd = step && step.type === 'cmd';

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <span className="tb-dot" style={{background:'#ff5f57'}} />
        <span className="tb-dot" style={{background:'#ffbd2e'}} />
        <span className="tb-dot" style={{background:'#28ca41'}} />
        <span className="tb-title">rdc — terminal</span>
      </div>
      <div className="terminal-body">
        {lines.map((l, i) => (
          <div key={i} className={`t-line t-${l.type}`}>
            {l.type === 'cmd' && <span className="t-prompt">❯ </span>}
            {l.type === 'url'
              ? <a href={l.text} className="t-url">{l.text}</a>
              : <span>{l.text}</span>
            }
          </div>
        ))}
        {isTypingCmd && currentStep < TERMINAL_STEPS.length && (
          <div className="t-line t-cmd">
            <span className="t-prompt">❯ </span>
            <span>{currentText}</span>
            <span className="t-cursor" />
          </div>
        )}
        {currentStep >= TERMINAL_STEPS.length && !interactive && (
          <div className="t-enter-hint" onClick={() => setInteractive(true)}>[ ENTER ]</div>
        )}
        {interactive && (
          <div className="t-line t-cmd">
            <span className="t-prompt">❯ </span>
            <input
              ref={inputRef}
              className="t-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCommand(input); }}
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

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
  const brushRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const titleRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    const STAR_COUNT = 120;
    let speed = 0.6;
    let targetSpeed = 0.6;
    let lastScrollY = window.scrollY;
    let scrollVel = 0;

    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 200,
      y: H / 2 + (Math.random() - 0.5) * 200,
      z: Math.random() * W,
      pz: 0,
    }));
    stars.forEach(s => s.pz = s.z);

    const onScroll = () => {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      scrollVel = Math.abs(dy);
      targetSpeed = 0.6 + Math.min(scrollVel * 0.5, 18);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    function update() {
      const light = isLight();

      // Suaviza velocidade
      speed += (targetSpeed - speed) * 0.08;
      targetSpeed = Math.max(0.6, targetSpeed * 0.92);

      ctx.fillStyle = light ? '#ffffff' : '#050510';
      ctx.fillRect(0, 0, W, H);

      for (const s of stars) {
        s.pz = s.z;
        s.z -= speed;
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
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const onMove = e => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Relâmpago a cada 15s
  useEffect(() => {
    const flash = () => {
      const el = document.getElementById('inicio');
      if (!el) return;
      el.style.transition = 'none';
      el.style.filter = 'brightness(3) saturate(2)';
      setTimeout(() => {
        el.style.filter = 'brightness(1.4)';
        el.style.transition = 'filter 0.15s ease';
        setTimeout(() => {
          el.style.filter = 'brightness(2)';
          setTimeout(() => {
            el.style.filter = '';
            el.style.transition = 'filter 0.3s ease';
          }, 80);
        }, 60);
      }, 40);
    };

    const id = setInterval(flash, 15000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Enter') {
        const hero = document.getElementById('inicio');
        if (!hero) return;
        const rect = hero.getBoundingClientRect();
        if (rect.top <= 0 && rect.bottom >= 0) {
          window.dispatchEvent(new Event('rdc:terminal-interactive'));
          window.dispatchEvent(new Event('rdc:matrix'));
          setTimeout(() => {
            window.dispatchEvent(new Event('rdc:terminal-reset'));
          }, 4000);
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);


  // Dissolve effect
  useEffect(() => {
    const canvas = brushRef.current;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    let last = null;
    let animId;

    const LIFETIME = 2500;
    const holes = [];

    const isLight = () => document.documentElement.getAttribute('data-theme') === 'light';

    const draw = () => {
      const now = Date.now();
      const light = isLight();

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = light ? '#ffffff' : '#0a0a12';
      ctx.fillRect(0, 0, W, H);

      ctx.globalCompositeOperation = 'destination-out';
      for (let i = holes.length - 1; i >= 0; i--) {
        const h = holes[i];
        const age = now - h.born;
        if (age > LIFETIME) { holes.splice(i, 1); continue; }
        const t = age / LIFETIME;
        const alpha = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;
        const grad = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r);
        grad.addColorStop(0, `rgba(0,0,0,${alpha})`);
        grad.addColorStop(0.5, `rgba(0,0,0,${alpha * 0.5})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(draw);
    };
    animId = requestAnimationFrame(draw);

    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const now = Date.now();

      if (last) {
        const dx = x - last.x;
        const dy = y - last.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const steps = Math.max(1, Math.floor(dist / 5));
        for (let s = 0; s <= steps; s++) {
          holes.push({
            x: last.x + dx * s / steps,
            y: last.y + dy * s / steps,
            r: 32 + Math.random() * 12,
            born: now,
          });
        }
      }
      last = { x, y };
    };

    const onLeave = () => { last = null; };

    const hero = canvas.parentElement;
    const heroRect = () => hero.getBoundingClientRect();

    const onWindowMove = e => {
      const r = heroRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        onMove(e);
      } else {
        last = null;
      }
    };

    window.addEventListener('mousemove', onWindowMove);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onWindowMove);
      window.removeEventListener('resize', onResize);
    };
  }, []);


  useEffect(() => {
    const title = titleRef.current;
    if (!title) return;
    const letters = title.querySelectorAll('.mag-letter');
    let origins = null;

    const onMove = e => {
      origins = Array.from(letters).map(l => {
        const t = l.style.transform;
        l.style.transform = '';
        const r = l.getBoundingClientRect();
        l.style.transform = t;
        return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
      });

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
      <canvas ref={brushRef} className="hero-brush" />



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
            Design que vende. Código que funciona.
          </p>
          <a href="/preview" className="hero-preview-btn">
            Visualizar meu futuro site
          </a>
        </div>

        <div className="hero-logo-wrap">
          <TerminalIcon />
        </div>
      </div>


    </section>
  );
}
