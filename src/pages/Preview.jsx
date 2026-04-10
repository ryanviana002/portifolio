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
  const [confirmData, setConfirmData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState('');
  const [html, setHtml] = useState('');
  const [iframeReady, setIframeReady] = useState(false);
  const [dados, setDados] = useState(null);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [savingLink, setSavingLink] = useState(false);
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
    style.textContent = '::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0a0a12; } ::-webkit-scrollbar-thumb { background: #ff007f; border-radius: 2px; } body { overflow-x: hidden; }';
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

  // Popup apenas ao chegar no fim do scroll do iframe
  useEffect(() => {
    if (!html) return;
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

  // Verifica limite local (localStorage)
  const checkLocalLimit = () => {
    const today = new Date().toISOString().slice(0, 10);
    const key = `rdc_preview_${today}`;
    const count = parseInt(localStorage.getItem(key) || '0');
    if (count >= 3) return false;
    localStorage.setItem(key, count + 1);
    return true;
  };

  // Passo 2: gera o mockup após confirmação
  const gerar = async () => {
    if (!confirmData) return;
    if (!checkLocalLimit()) {
      setConfirmData(null);
      setError('Limite de 3 prévias por dia atingido. Volte amanhã ou fale conosco pelo WhatsApp!');
      return;
    }
    setConfirmData(null);
    setLoading(true);
    setProgress(0);
    setHtml('');
    setIframeReady(false);
    setDados(null);
    setShowPopup(false);

    // Progresso simulado com etapas realistas
    const etapas = [
      { pct: 10, msg: 'Buscando dados do negócio...' },
      { pct: 25, msg: 'Analisando segmento e concorrência...' },
      { pct: 45, msg: 'Definindo paleta de cores e layout...' },
      { pct: 65, msg: 'Gerando estrutura do site...' },
      { pct: 80, msg: 'Criando seções e conteúdo...' },
      { pct: 92, msg: 'Finalizando detalhes visuais...' },
    ];
    let etapaIdx = 0;
    const progressInterval = setInterval(() => {
      if (etapaIdx < etapas.length) {
        setProgress(etapas[etapaIdx].pct);
        setProgressMsg(etapas[etapaIdx].msg);
        etapaIdx++;
      }
    }, 1800);
    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      clearInterval(progressInterval);
      setProgress(100);
      setProgressMsg('Prévia pronta!');
      if (!res.ok) throw new Error(data.error);
      const watermark = `
<style>
  #rdc-banner{position:fixed;top:0;left:0;right:0;z-index:999999;background:linear-gradient(135deg,#ff007f,#d12c96);color:#fff;text-align:center;padding:8px 16px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;}
  #rdc-banner a{color:#fff;text-decoration:underline;}
  #rdc-corner{position:fixed;bottom:80px;left:20px;z-index:999999;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);border:1px solid rgba(255,0,127,0.4);color:#fff;padding:6px 12px;border-radius:999px;font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;}
  #rdc-corner span{color:#ff007f;}
  html,body{scroll-behavior:smooth;}
  nav,header,[class*="navbar"],[class*="nav-"]{top:36px!important;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:#0a0a12;}
  ::-webkit-scrollbar-thumb{background:#ff007f;border-radius:2px;}
</style>
<div id="rdc-banner">🎨 PRÉVIA — <a href="https://ryancreator.dev" target="_blank">ryancreator.dev</a> | Este site ainda não existe. Quer criar o seu?</div>
<div id="rdc-corner">por <span>RDCreator</span></div>
`;
      setHtml(watermark + data.html);
      setDados(data.dados);
    } catch (e) {
      clearInterval(progressInterval);
      setError(e.message || 'Não foi possível gerar a prévia. Verifique o link e tente novamente.');
    } finally {
      setLoading(false);
      setProgress(0);
      setProgressMsg('');
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
          <p className="preview-loading-msg">{progressMsg || 'Iniciando...'}</p>
          <div className="preview-progress-wrap">
            <div className="preview-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="preview-loading-sub">{progress}% concluído</p>
          <p className="preview-loading-hint">Isso pode levar alguns minutos...</p>
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
            </div>
          )}
          {!iframeReady && (
            <div className="preview-iframe-loading">
              <div className="preview-loading-ring" />
              <p className="preview-loading-msg">Renderizando prévia...</p>
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
            onLoad={() => setIframeReady(true)}
            onMouseEnter={() => { if(cursorRef.current) cursorRef.current.style.display='none'; document.body.style.cursor='auto'; }}
            onMouseLeave={() => { if(cursorRef.current) cursorRef.current.style.display=''; document.body.style.cursor='none'; }}
            style={{ opacity: iframeReady ? 1 : 0, transition: 'opacity 0.4s ease' }}
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
            <button
              className="preview-popup-btn"
              disabled={savingLink}
              onClick={async () => {
                setSavingLink(true);
                try {
                  const res = await fetch('/api/preview-save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ html, nome: dados?.nome, categoria: dados?.categoria }),
                  });
                  const data = await res.json();
                  const link = data.url || 'https://ryancreator.dev/preview';
                  const nome = dados?.nome || 'meu negócio';
                  const msg = encodeURIComponent(`Olá Ryan! Vi a prévia do site de *${nome}* e quero contratar!\n\nVeja a prévia: ${link}`);
                  window.open(`https://wa.me/5519992525515?text=${msg}`, '_blank');
                } catch {
                  window.open('https://wa.me/5519992525515?text=Olá%20Ryan!%20Vi%20a%20prévia%20do%20meu%20site%20e%20quero%20contratar!', '_blank');
                } finally {
                  setSavingLink(false);
                }
              }}
            >
              {savingLink ? 'GERANDO LINK...' : 'EU QUERO ESSE SITE! →'}
            </button>
            <a href="https://wa.me/5519992525515?text=Olá%20Ryan!%20Vi%20a%20prévia%20do%20meu%20site%20e%20quero%20contratar!" className="preview-popup-wa" target="_blank" rel="noreferrer">
              Só tirar dúvidas no WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
