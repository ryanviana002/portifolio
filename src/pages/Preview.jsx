import { useState, useEffect, useRef, useMemo } from 'react';
import './Preview.css';

function playClick(vol = 0.15) {
  try {
    if (!window._rdcActx || window._rdcActx.state === 'closed') {
      window._rdcActx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = window._rdcActx;
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime;
    const bufSize = Math.floor(ctx.sampleRate * 0.012);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 3000;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
    noise.connect(hpf);
    hpf.connect(gain);
    gain.connect(ctx.destination);
    noise.start(t);
    noise.stop(t + 0.02);
  } catch {}
}

export default function Preview() {
  const [url, setUrl] = useState('');
  const [checking, setChecking] = useState(false);
  const [confirmData, setConfirmData] = useState(null); // dados para popup de confirmação
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState('');
  const [dados, setDados] = useState(null);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const cursorRef = useRef(null);
  const iframeRef = useRef(null);

  const stars = useMemo(() => Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 10,
  })), []);

  // Esconde scrollbar global enquanto estiver na página preview
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'preview-scrollbar-hide';
    style.textContent = '::-webkit-scrollbar { display: none !important; } body { scrollbar-width: none !important; overflow-x: hidden; }';
    document.head.appendChild(style);
    return () => document.getElementById('preview-scrollbar-hide')?.remove();
  }, []);

  // Cursor customizado + som nos cliques/hover
  useEffect(() => {
    const cursor = cursorRef.current;
    const onMove = e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };
    const onEnter = () => { cursor.classList.add('big'); playClick(0.08); };
    const onLeave = () => cursor.classList.remove('big');
    const onClick = () => playClick(0.18);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);
    const interactives = document.querySelectorAll('a, button, input');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  // Relâmpago a cada 15s
  useEffect(() => {
    const flash = () => {
      const el = document.querySelector('.preview-page');
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

  // Proteção: desabilita botão direito e F12 (desativado temporariamente para debug)
  // useEffect(() => { ... }, []);

  // Popup ao terminar de rolar o iframe ou após 8s
  useEffect(() => {
    if (!html) return;
    const timer = setTimeout(() => setShowPopup(true), 8000);
    const iframe = iframeRef.current;
    const handleScroll = () => {
      if (!iframe?.contentWindow) return;
      const win = iframe.contentWindow;
      const doc = win.document.documentElement;
      if (win.scrollY + win.innerHeight >= doc.scrollHeight - 100) {
        setShowPopup(true);
      }
    };
    const attachScroll = () => {
      try { iframe?.contentWindow?.addEventListener('scroll', handleScroll); } catch {}
    };
    iframe?.addEventListener('load', attachScroll);
    return () => {
      clearTimeout(timer);
      try { iframe?.contentWindow?.removeEventListener('scroll', handleScroll); } catch {}
    };
  }, [html]);

  // Passo 1: valida o link e busca dados para confirmação
  const verificar = async () => {
    if (!url.trim()) return;
    setChecking(true);
    setError('');
    try {
      const res = await fetch('/api/preview-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setConfirmData(data);
    } catch (e) {
      setError(e.message || 'Link inválido. Cole o link do Google Maps do seu negócio.');
    } finally {
      setChecking(false);
    }
  };

  // Passo 2: gera o mockup após confirmação
  const gerar = async () => {
    if (!confirmData) return;
    setConfirmData(null);
    setLoading(true);
    setHtml('');
    setDados(null);
    setShowPopup(false);
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const scrollHide = `<style>::-webkit-scrollbar{display:none}body{scrollbar-width:none;-ms-overflow-style:none}</style>`;
      setHtml(scrollHide + data.html);
      setDados(data.dados);
    } catch (e) {
      setError('Não foi possível gerar a prévia. Verifique o link e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = () => {
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    win.onload = () => { win.print(); URL.revokeObjectURL(blobUrl); };
  };

  return (
    <div className="preview-page">
      <div className="cursor" ref={cursorRef} />

      {/* Header fixo */}
      <div className="preview-topbar">
        <a href="/" className="preview-topbar-logo">
          <img src="/logo-rdc.png" alt="RDC" />
        </a>
        <a href="/" className="preview-back-btn" title="Voltar ao site">← Voltar</a>
      </div>

      {/* Hero */}
      {!html && !loading && (
        <div className="preview-hero">
          <div className="preview-stars" aria-hidden="true">
            {stars.map(s => (
              <span key={s.id} className="preview-star" style={{
                left: `${s.left}%`,
                top: `${s.top}%`,
                width: `${s.size}px`,
                height: `${s.size}px`,
                animationDuration: `${s.duration}s`,
                animationDelay: `${s.delay}s`,
              }} />
            ))}
          </div>

          <div className="preview-hero-content">
            <div className="preview-hero-tag">POWERED BY AGENTES RD</div>
            <h1 className="preview-hero-title">
              Veja como ficaria<br />
              <span className="preview-grad">o site do seu negócio</span>
            </h1>
            <p className="preview-hero-sub">
              Cole o link do seu Google Maps abaixo. Nossos agentes analisam seu negócio e geram uma prévia profissional do seu futuro site em segundos.
            </p>

            <div className="preview-input-wrap">
              <input
                className="preview-input"
                type="text"
                placeholder="Cole aqui o link do seu Google Maps..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && verificar()}
              />
              <button className="preview-btn" onClick={verificar} disabled={!url.trim() || checking}>
                {checking ? 'VERIFICANDO...' : 'GERAR PRÉVIA →'}
              </button>
            </div>

            {error && <p className="preview-error">{error}</p>}

            <div className="preview-steps">
              <div className="preview-step"><span className="preview-step-num">01</span><span>Cole o link do Google Maps</span></div>
              <div className="preview-step-arrow">→</div>
              <div className="preview-step"><span className="preview-step-num">02</span><span>Agentes analisam seu negócio</span></div>
              <div className="preview-step-arrow">→</div>
              <div className="preview-step"><span className="preview-step-num">03</span><span>Prévia gerada em segundos</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="preview-loading">
          <div className="preview-loading-ring" />
          <p className="preview-loading-msg">Nossos agentes estão analisando seu negócio e criando a prévia...</p>
          <p className="preview-loading-sub">Isso pode levar alguns segundos</p>
        </div>
      )}

      {/* Resultado */}
      {html && !loading && (
        <div className="preview-result">
          {dados && (
            <div className="preview-info-bar">
              <div className="preview-info-item">
                <span className="preview-info-label">Negócio</span>
                <span className="preview-info-val">{dados.nome}</span>
              </div>
              <div className="preview-info-item">
                <span className="preview-info-label">Segmento</span>
                <span className="preview-info-val">{dados.categoria}</span>
              </div>
              <div className="preview-info-item">
                <span className="preview-info-label">Avaliação Google</span>
                <span className="preview-info-val">⭐ {dados.avaliacao} ({dados.numAvaliacoes} avaliações)</span>
              </div>
              <div className="preview-info-actions">
                <button className="preview-pdf-btn" onClick={gerarPDF}>Salvar como PDF</button>
                <button className="preview-new-btn" onClick={() => { setHtml(''); setUrl(''); setDados(null); setShowPopup(false); }}>← Nova prévia</button>
              </div>
            </div>
          )}
          <iframe
            id="preview-frame"
            ref={iframeRef}
            className="preview-frame"
            srcDoc={html}
            title="Prévia do site"
            sandbox="allow-same-origin allow-scripts"
            scrolling="yes"
          />
        </div>
      )}

      {/* Popup de confirmação do negócio */}
      {confirmData && (
        <div className="preview-popup-overlay" onClick={() => setConfirmData(null)}>
          <div className="preview-popup preview-confirm-popup" onClick={e => e.stopPropagation()}>
            <button className="preview-popup-close" onClick={() => setConfirmData(null)}>✕</button>
            <div className="preview-popup-tag">ENCONTRAMOS SEU NEGÓCIO</div>
            {confirmData.foto && (
              <img src={confirmData.foto} alt={confirmData.nome} className="preview-confirm-foto" />
            )}
            <h2 className="preview-confirm-nome">{confirmData.nome}</h2>
            <p className="preview-confirm-cat">{confirmData.categoria}</p>
            {confirmData.avaliacao && (
              <p className="preview-confirm-av">⭐ {confirmData.avaliacao} ({confirmData.numAvaliacoes} avaliações)</p>
            )}
            {confirmData.endereco && (
              <p className="preview-confirm-end">📍 {confirmData.endereco}</p>
            )}
            <p className="preview-confirm-ask">Essa é sua empresa?</p>
            <button className="preview-popup-btn preview-confirm-sim" onClick={gerar}>
              SIM, GERAR PRÉVIA →
            </button>
            <button className="preview-confirm-nao" onClick={() => setConfirmData(null)}>
              Não, quero corrigir o link
            </button>
          </div>
        </div>
      )}

      {/* Popup */}
      {showPopup && (
        <div className="preview-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="preview-popup" onClick={e => e.stopPropagation()}>
            <button className="preview-popup-close" onClick={() => setShowPopup(false)}>✕</button>
            <div className="preview-popup-tag">GOSTOU DA PRÉVIA?</div>
            <h2 className="preview-popup-title">Quer esse site<br />de verdade?</h2>
            <p className="preview-popup-desc">Transformo essa prévia em um site profissional real, otimizado e pronto para vender.</p>
            <div className="preview-popup-price">
              <span className="preview-popup-from">a partir de</span>
              <span className="preview-popup-val">R$ 997</span>
            </div>
            <a href="/#contato" className="preview-popup-btn">EU QUERO ESSE SITE! →</a>
            <a href="https://wa.me/5519992525515?text=Olá%20Ryan!%20Vi%20a%20prévia%20do%20meu%20site%20e%20quero%20contratar!" className="preview-popup-wa" target="_blank" rel="noreferrer">
              Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
