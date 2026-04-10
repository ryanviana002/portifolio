import { useState, useEffect, useRef } from 'react';
import './Preview.css';

export default function Preview() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [html, setHtml] = useState('');
  const [dados, setDados] = useState(null);
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const cursorRef = useRef(null);
  const iframeRef = useRef(null);

  // Cursor customizado
  useEffect(() => {
    const cursor = cursorRef.current;
    const onMove = e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };
    const onEnter = () => cursor.classList.add('big');
    const onLeave = () => cursor.classList.remove('big');
    window.addEventListener('mousemove', onMove);
    const interactives = document.querySelectorAll('a, button, input');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  // Proteção: desabilita botão direito e F12
  useEffect(() => {
    const onContext = e => e.preventDefault();
    const onKey = e => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'U')) {
        e.preventDefault();
      }
    };
    document.addEventListener('contextmenu', onContext);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('contextmenu', onContext);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  // Popup ao terminar de rolar o iframe
  useEffect(() => {
    if (!html) return;

    // Popup por tempo (8s após gerar)
    const timer = setTimeout(() => setShowPopup(true), 8000);

    // Popup ao rolar até o fim do iframe
    const iframe = iframeRef.current;
    const handleScroll = () => {
      if (!iframe?.contentWindow) return;
      const win = iframe.contentWindow;
      const doc = win.document.documentElement;
      const scrolled = win.scrollY + win.innerHeight;
      const total = doc.scrollHeight;
      if (scrolled >= total - 100) {
        setShowPopup(true);
      }
    };

    const attachScroll = () => {
      try {
        iframe?.contentWindow?.addEventListener('scroll', handleScroll);
      } catch {}
    };

    iframe?.addEventListener('load', attachScroll);

    return () => {
      clearTimeout(timer);
      try { iframe?.contentWindow?.removeEventListener('scroll', handleScroll); } catch {}
    };
  }, [html]);

  const gerar = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setHtml('');
    setDados(null);
    setError('');
    setShowPopup(false);

    try {
      const res = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setHtml(data.html);
      setDados(data.dados);
    } catch (e) {
      setError('Não foi possível gerar o preview. Verifique o link e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const gerarPDF = () => {
    if (!html) return;
    // Abre o HTML em nova aba e aciona o print
    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    const win = window.open(blobUrl, '_blank');
    win.onload = () => {
      win.print();
      URL.revokeObjectURL(blobUrl);
    };
  };

  return (
    <div className="preview-page">
      <div className="cursor" ref={cursorRef} />

      {/* Header */}
      <div className="preview-header">
        <a href="/" className="preview-logo">
          <span className="preview-logo-rdc">RD</span>
          <span className="preview-logo-creator">CREATOR</span>
        </a>
        <span className="preview-badge">Visualizador de Site</span>
      </div>

      {/* Hero da página */}
      {!html && !loading && (
        <div className="preview-hero">
          <div className="preview-hero-tag">✨ POWERED BY IA</div>
          <h1 className="preview-hero-title">
            Veja como ficaria<br />
            <span className="preview-grad">o site do seu negócio</span>
          </h1>
          <p className="preview-hero-sub">
            Cole o link do seu Google Maps abaixo. Nossa IA analisa seu negócio e gera uma prévia profissional do seu futuro site em segundos.
          </p>

          <div className="preview-input-wrap">
            <input
              className="preview-input"
              type="text"
              placeholder="Cole aqui o link do seu Google Maps..."
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && gerar()}
            />
            <button
              className="preview-btn"
              onClick={gerar}
              disabled={loading || !url.trim()}
            >
              GERAR PRÉVIA →
            </button>
          </div>

          {error && <p className="preview-error">{error}</p>}

          <div className="preview-steps">
            <div className="preview-step">
              <span className="preview-step-num">01</span>
              <span>Cole o link do Google Maps</span>
            </div>
            <div className="preview-step-arrow">→</div>
            <div className="preview-step">
              <span className="preview-step-num">02</span>
              <span>IA analisa seu negócio</span>
            </div>
            <div className="preview-step-arrow">→</div>
            <div className="preview-step">
              <span className="preview-step-num">03</span>
              <span>Prévia gerada em segundos</span>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="preview-loading">
          <div className="preview-loading-ring" />
          <p className="preview-loading-msg">Nossa IA está analisando seu negócio e criando a prévia...</p>
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
                <button className="preview-pdf-btn" onClick={gerarPDF}>📄 Salvar como PDF</button>
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
          />
        </div>
      )}

      {/* Popup "Quero esse site" */}
      {showPopup && (
        <div className="preview-popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="preview-popup" onClick={e => e.stopPropagation()}>
            <button className="preview-popup-close" onClick={() => setShowPopup(false)}>✕</button>
            <div className="preview-popup-tag">🎉 GOSTOU DA PRÉVIA?</div>
            <h2 className="preview-popup-title">Quer esse site<br />de verdade?</h2>
            <p className="preview-popup-desc">
              Transformo essa prévia em um site profissional real, otimizado e pronto para vender.
            </p>
            <div className="preview-popup-price">
              <span className="preview-popup-from">a partir de</span>
              <span className="preview-popup-val">R$ 997</span>
            </div>
            <a
              href="https://ryancreator.dev/#contato"
              className="preview-popup-btn"
              target="_blank"
              rel="noreferrer"
            >
              EU QUERO ESSE SITE! →
            </a>
            <a
              href="https://wa.me/5519992525515?text=Olá%20Ryan!%20Vi%20a%20prévia%20do%20meu%20site%20e%20quero%20contratar!"
              className="preview-popup-wa"
              target="_blank"
              rel="noreferrer"
            >
              💬 Falar no WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
