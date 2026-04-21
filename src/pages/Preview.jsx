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
  const [showObrigado, setShowObrigado] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState('');
  const cursorRef = useRef(null);
  const iframeRef = useRef(null);
  const popupTimerRef = useRef(null);
  const expiryRef = useRef(null);

  // Detecta ?admin=dani na URL e salva no localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'dani') {
      localStorage.setItem('rdc_owner', '1');
    }
  }, []);

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

  // Popup ao chegar no fim do scroll + após 30s
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

    // Popup automático após 30s
    popupTimerRef.current = setTimeout(() => setShowPopup(true), 30000);

    return () => {
      try { iframe?.contentWindow?.removeEventListener('scroll', handleScroll); } catch {}
      clearTimeout(popupTimerRef.current);
    };
  }, [html]);

  // Countdown 24h a partir da geração
  useEffect(() => {
    if (!html) return;
    const expiry = Date.now() + 24 * 60 * 60 * 1000;
    const tick = () => {
      const diff = expiry - Date.now();
      if (diff <= 0) { setCountdown('Expirado'); clearInterval(expiryRef.current); return; }
      const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}:${m}:${s}`);
    };
    tick();
    expiryRef.current = setInterval(tick, 1000);
    return () => clearInterval(expiryRef.current);
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

  // Verifica limite local (localStorage) — sem limite para o dono
  const checkLocalLimit = () => {
    if (localStorage.getItem('rdc_owner') === '1') return true;
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
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<style>
  #rdc-banner{position:fixed;top:0;left:0;right:0;z-index:999999;background:linear-gradient(135deg,#ff007f,#d12c96);color:#fff;text-align:center;padding:8px 16px;font-family:'Space Grotesk',sans-serif;font-size:12px;font-weight:700;letter-spacing:1px;}
  #rdc-banner a{color:#fff;text-decoration:underline;}
  #rdc-corner{position:fixed;bottom:80px;left:20px;z-index:999999;background:rgba(0,0,0,0.75);backdrop-filter:blur(8px);border:1px solid rgba(255,0,127,0.4);color:#fff;padding:6px 12px;border-radius:999px;font-family:'Space Grotesk',sans-serif;font-size:11px;font-weight:700;}
  #rdc-corner span{color:#ff007f;}
  html,body{scroll-behavior:smooth;max-width:100%;overflow-x:hidden;}
  img,video,iframe,table{max-width:100%!important;height:auto;}
  nav,header,[class*="navbar"],[class*="nav-"]{top:36px!important;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:#0a0a12;}
  ::-webkit-scrollbar-thumb{background:#ff007f;border-radius:2px;}
  @media(max-width:768px){
    *{box-sizing:border-box;}
    body{font-size:15px!important;}
    [class*="container"],[class*="wrapper"],[class*="section"]{padding-left:16px!important;padding-right:16px!important;width:100%!important;max-width:100%!important;}
    [class*="grid"],[class*="row"],[class*="flex"]{flex-wrap:wrap!important;}
    [class*="col-"],[class*="column"]{width:100%!important;max-width:100%!important;flex:0 0 100%!important;}
    h1{font-size:clamp(28px,7vw,48px)!important;}
    h2{font-size:clamp(22px,5vw,36px)!important;}
  }
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
        {dados?.nome && <span className="preview-topbar-nome">{dados.nome}</span>}
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

            <div className="preview-counter">+200 prévias geradas</div>

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
            <p className="preview-time-hint">Leva ~2 minutos para gerar</p>

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
              {countdown && (
                <div className="preview-expiry">
                  <span className="preview-expiry-label">Expira em</span>
                  <span className="preview-expiry-val">{countdown}</span>
                </div>
              )}
              <button className="preview-fullscreen-btn" onClick={() => setIsFullscreen(f => !f)} title="Tela cheia">
                {isFullscreen ? '⊠' : '⊡'}
              </button>
              <button className="preview-pdf-btn" onClick={() => {
                const printCss = `<style>
                  @media print {
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    body { margin: 0; }
                    nav, header { position: relative !important; }
                    #rdc-banner, #rdc-corner { display: none !important; }
                  }
                </style>`;
                let htmlComPrint = html;
                if (!htmlComPrint.includes('charset')) {
                  htmlComPrint = htmlComPrint.replace('<head>', '<head><meta charset="utf-8">');
                }
                htmlComPrint = htmlComPrint.replace('</head>', printCss + '</head>');
                const blob = new Blob([htmlComPrint], { type: 'text/html;charset=utf-8' });
                const blobUrl = URL.createObjectURL(blob);
                const win = window.open(blobUrl, '_blank');
                win.onload = () => { setTimeout(() => { win.print(); URL.revokeObjectURL(blobUrl); }, 500); };
              }}>
                Salvar PDF
              </button>
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
            className={`preview-frame${isFullscreen ? ' preview-frame--fullscreen' : ''}`}
            srcDoc={html}
            title="Prévia do site"
            sandbox="allow-same-origin allow-scripts"
            scrolling="yes"
            onLoad={() => setIframeReady(true)}
            onMouseEnter={() => { if(cursorRef.current) cursorRef.current.style.display='none'; document.body.style.cursor='auto'; }}
            onMouseLeave={() => { if(cursorRef.current) cursorRef.current.style.display=''; document.body.style.cursor='none'; }}
            style={{ opacity: iframeReady ? 1 : 0, transition: 'opacity 0.4s ease', width: '100%' }}
          />

          {/* Botão CTA fixo */}
          {iframeReady && (
            <div className="preview-cta-bar">
              <span className="preview-cta-txt">Gostou da prévia?</span>
              <button className="preview-cta-btn" onClick={() => setShowPopup(true)}>
                EU QUERO ESSE SITE →
              </button>
            </div>
          )}
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
      {showPopup && !showObrigado && (
        <div className="preview-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="preview-popup" onClick={e => e.stopPropagation()}>
            <button className="preview-popup-close" onClick={() => setShowPopup(false)}>✕</button>
            <div className="preview-popup-tag">GOSTOU DA PRÉVIA?</div>
            <h2 className="preview-popup-title">Quer esse site<br />de verdade?</h2>
            <p className="preview-popup-desc">Transformo essa prévia em um site profissional real, otimizado e pronto para vender.</p>
            <div className="preview-popup-price">
              <span className="preview-popup-from">a partir de</span>
              <span className="preview-popup-val">R$ 997</span>
              <span className="preview-popup-parcel">ou 12x de <strong>R$ 83,08</strong> sem juros</span>
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
                  setShowPopup(false);
                  setShowObrigado(true);
                  setTimeout(() => window.open(`https://wa.me/5519994175385?text=${msg}`, '_blank'), 2000);
                } catch {
                  setShowPopup(false);
                  setShowObrigado(true);
                  setTimeout(() => window.open('https://wa.me/5519994175385?text=Olá%20Ryan!%20Vi%20a%20prévia%20do%20meu%20site%20e%20quero%20contratar!', '_blank'), 2000);
                } finally {
                  setSavingLink(false);
                }
              }}
            >
              {savingLink ? 'GERANDO LINK...' : 'EU QUERO ESSE SITE! →'}
            </button>
            <a href="https://wa.me/5519994175385?text=Olá%20Ryan!%20Vi%20a%20prévia%20do%20meu%20site%20e%20quero%20contratar!" className="preview-popup-wa" target="_blank" rel="noreferrer">
              Só tirar dúvidas no WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Tela de obrigado */}
      {showObrigado && (
        <div className="preview-obrigado-overlay">
          <div className="preview-obrigado-emoji">🎉</div>
          <h2 className="preview-obrigado-title">Perfeito!</h2>
          <p className="preview-obrigado-desc">Estamos abrindo o WhatsApp pra você falar com o Ryan agora mesmo.</p>
          <div className="preview-obrigado-wa">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Abrindo WhatsApp...
          </div>
          <p className="preview-obrigado-fallback">
            Não abriu?{' '}
            <a href={`https://wa.me/5519994175385?text=${encodeURIComponent(`Olá Ryan! Vi a prévia do site${dados?.nome ? ` da *${dados.nome}*` : ''} e quero contratar!`)}`} target="_blank" rel="noreferrer">
              clique aqui
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
