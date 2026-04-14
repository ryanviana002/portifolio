import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function gerarId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

const WA_RYAN = '5519992525515';
const HISTORICO_KEY = 'rdc_historico_previews';
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24h

function novaLinha() {
  return { id: gerarId(), url: '', status: 'idle', nome: '', categoria: '', link: '', erro: '', waNum: null, prompt: '', promptOpen: false };
}

function msgWa(nome, link) {
  return `Olá, tudo bem?\n\nAqui é o Ryan, da RDCreator.\n\nEstava analisando a *${nome}*, no Google Maps, mas não encontrei um site do seu negócio. Vi que tinha muito potencial e montei um modelo baseado no que vocês fazem:\n\n${link}\n\nÉ um preview demonstrativo (não é o site final), mas já mostra como vocês podem se posicionar melhor online e atrair mais clientes.\n\nDeixei disponível por 24h\n\nQuero te ouvir — o que achou?`;
}

const statusLabel = {
  idle: '',
  checando: 'Verificando...',
  gerando: 'Gerando site...',
  salvando: 'Salvando...',
  pronto: 'Pronto ✓',
  erro: 'Erro',
};

function lerHistorico() {
  try { return JSON.parse(localStorage.getItem(HISTORICO_KEY) || '[]'); } catch { return []; }
}

function salvarHistorico(item) {
  const hist = lerHistorico().filter(h => h.previewId !== item.previewId);
  hist.unshift(item);
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(hist.slice(0, 100)));
}

async function retryFetch(fn, tentativas = 2) {
  for (let i = 0; i <= tentativas; i++) {
    try { return await fn(); }
    catch (e) {
      if (i === tentativas) throw e;
      await new Promise(r => setTimeout(r, 1500 * (i + 1)));
    }
  }
}

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [linhas, setLinhas] = useState(() => Array.from({ length: 10 }, novaLinha));
  const [historico, setHistorico] = useState([]);
  const [views, setViews] = useState({});
  const [modelo, setModelo] = useState(() => localStorage.getItem('rdc_modelo') || 'haiku');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'dani') localStorage.setItem('rdc_owner', '1');
    if (localStorage.getItem('rdc_owner') === '1') {
      setAuthed(true);
      setHistorico(lerHistorico());
    } else {
      navigate('/');
    }
  }, []);

  // Busca views dos previews no histórico
  useEffect(() => {
    const hist = lerHistorico();
    if (!hist.length) return;
    const ids = hist.map(h => h.previewId).join(',');
    fetch(`/api/preview-stats?ids=${ids}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const map = {};
          data.forEach(d => { map[d.id] = d.views || 0; });
          setViews(map);
        }
      })
      .catch(() => {});
  }, [historico.length]);

  const update = (id, patch) =>
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  const salvarEAtualizar = (previewId, nome, categoria, link, createdAt) => {
    const item = { previewId, nome, categoria, link, createdAt };
    salvarHistorico(item);
    setHistorico(lerHistorico());
  };

  const handleGerar = async (id) => {
    const linha = linhas.find(l => l.id === id);
    if (!linha?.url.trim()) return;
    update(id, { status: 'checando', erro: '', nome: '', link: '' });
    try {
      const checkData = await retryFetch(async () => {
        const r = await fetch('/api/preview-check', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linha.url.trim() }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      update(id, { status: 'gerando', nome: checkData.nome, categoria: checkData.categoria, waNum: checkData.waNum || null });

      const genData = await retryFetch(async () => {
        const r = await fetch('/api/preview', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: linha.url.trim(), prompt: linha.prompt?.trim() || '', modelo }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      const nome = genData.dados?.nome || checkData.nome;
      update(id, { status: 'salvando', nome });

      const saveData = await retryFetch(async () => {
        const r = await fetch('/api/preview-save', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: genData.html, nome, categoria: genData.dados?.categoria || checkData.categoria }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      const waNumFinal = linhas.find(l => l.id === id)?.waNum || null;
      update(id, { status: 'pronto', link: saveData.url, nome });
      salvarEAtualizar(saveData.id || saveData.url.split('/').pop(), nome, genData.dados?.categoria || checkData.categoria, saveData.url, Date.now());

      const msg = encodeURIComponent(msgWa(nome, saveData.url));
      const waTarget = waNumFinal || WA_RYAN;
      window.open(`https://wa.me/${waTarget}?text=${msg}`, '_blank');
    } catch (e) {
      update(id, { status: 'erro', erro: e.message || 'Erro desconhecido' });
    }
  };

  const handleGerarTodos = async () => {
    const preenchidas = linhas.filter(l => l.url.trim() && !isProcessando(l.status));
    if (!preenchidas.length) return;
    const CONC = 3;
    let idx = 0;
    const workers = Array.from({ length: Math.min(CONC, preenchidas.length) }, async () => {
      while (idx < preenchidas.length) {
        const item = preenchidas[idx++];
        await gerarItemSemWa(item.id, item.url);
      }
    });
    await Promise.all(workers);
  };

  const gerarItemSemWa = async (id, urlOverride) => {
    const linha = linhas.find(l => l.id === id);
    const url = urlOverride || linha?.url || '';
    if (!url.trim()) return;
    update(id, { status: 'checando', erro: '', nome: '', link: '' });
    try {
      const checkData = await retryFetch(async () => {
        const r = await fetch('/api/preview-check', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      update(id, { status: 'gerando', nome: checkData.nome, categoria: checkData.categoria, waNum: checkData.waNum || null });

      const genData = await retryFetch(async () => {
        const r = await fetch('/api/preview', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim(), prompt: linha?.prompt?.trim() || '', modelo }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      const nome = genData.dados?.nome || checkData.nome;
      update(id, { status: 'salvando', nome });

      const saveData = await retryFetch(async () => {
        const r = await fetch('/api/preview-save', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: genData.html, nome, categoria: genData.dados?.categoria || checkData.categoria }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      update(id, { status: 'pronto', link: saveData.url, nome });
      salvarEAtualizar(saveData.id || saveData.url.split('/').pop(), nome, genData.dados?.categoria || checkData.categoria, saveData.url, Date.now());
    } catch (e) {
      update(id, { status: 'erro', erro: e.message || 'Erro desconhecido' });
    }
  };

  const removerLinha = (id) => setLinhas(prev => prev.filter(l => l.id !== id));
  const removerHistorico = (previewId) => {
    const hist = lerHistorico().filter(h => h.previewId !== previewId);
    localStorage.setItem(HISTORICO_KEY, JSON.stringify(hist));
    setHistorico(hist);
  };
  const limparHistorico = () => {
    localStorage.removeItem(HISTORICO_KEY);
    setHistorico([]);
  };

  const isProcessando = (status) => ['checando', 'gerando', 'salvando'].includes(status);
  const isExpirado = (createdAt) => Date.now() - createdAt > EXPIRY_MS;

  if (!authed) return null;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <a href="/" className="admin-back">← Voltar</a>
        <div className="admin-title">Painel RDCreator</div>
        <div className="admin-modelo-toggle">
          <button
            className={`admin-modelo-btn${modelo === 'haiku' ? ' active' : ''}`}
            onClick={() => { setModelo('haiku'); localStorage.setItem('rdc_modelo', 'haiku'); }}
            title="Mais rápido e barato (~250 gerações/$5)"
          >Haiku</button>
          <button
            className={`admin-modelo-btn${modelo === 'sonnet' ? ' active sonnet' : ''}`}
            onClick={() => { setModelo('sonnet'); localStorage.setItem('rdc_modelo', 'sonnet'); }}
            title="Melhor qualidade (~25 gerações/$5)"
          >Sonnet</button>
        </div>
        <button
          className="admin-gerar-todos-btn"
          onClick={handleGerarTodos}
          disabled={!linhas.some(l => l.url.trim() && !isProcessando(l.status))}
        >
          Gerar todos
        </button>
        <div className="admin-tag">ADMIN</div>
      </div>

      <div className="admin-body">
        <div className="admin-linhas">
          {linhas.map((linha, idx) => (
            <div key={linha.id} className={`admin-row admin-row--${linha.status}`}>
              <div className="admin-row-num">{idx + 1}</div>

              <div className="admin-row-main">
                <input
                  className="admin-url-input"
                  placeholder="Link do Google Maps ou share.google..."
                  value={linha.url}
                  onChange={e => update(linha.id, { url: e.target.value, status: 'idle', erro: '', nome: '', link: '' })}
                  disabled={isProcessando(linha.status)}
                  onKeyDown={e => e.key === 'Enter' && handleGerar(linha.id)}
                />
                <button
                  className={`admin-prompt-toggle${linha.promptOpen ? ' active' : ''}${linha.prompt?.trim() ? ' has-value' : ''}`}
                  onClick={() => update(linha.id, { promptOpen: !linha.promptOpen })}
                  disabled={isProcessando(linha.status)}
                  title="Personalizar prompt"
                >⚙ prompt{linha.prompt?.trim() ? ' •' : ''}</button>
                {linha.promptOpen && (
                  <textarea
                    className="admin-prompt-input"
                    placeholder="Ex: use cores azul e dourado, site voltado para casamentos, destaque o pacote premium..."
                    value={linha.prompt}
                    onChange={e => update(linha.id, { prompt: e.target.value })}
                    disabled={isProcessando(linha.status)}
                    rows={3}
                  />
                )}

                {linha.status === 'pronto' && linha.nome && (
                  <div className="admin-row-result">
                    <span className="admin-row-nome">{linha.nome}</span>
                    <a href={linha.link} target="_blank" rel="noreferrer" className="admin-row-link">{linha.link}</a>
                    <div className="admin-row-btns">
                      <button className="admin-mini-btn admin-mini-preview" onClick={() => window.open(linha.link, '_blank')}>Ver preview</button>
                      <button className="admin-mini-btn" onClick={() => navigator.clipboard.writeText(linha.link)}>Copiar link</button>
                      {linha.waNum && (
                        <button className="admin-mini-btn admin-mini-wa" onClick={() => {
                          const msg = encodeURIComponent(msgWa(linha.nome, linha.link));
                          window.open(`https://wa.me/${linha.waNum}?text=${msg}`, '_blank');
                        }}>WA cliente</button>
                      )}
                      <button className="admin-mini-btn admin-mini-wa-ryan" onClick={() => {
                        const msg = encodeURIComponent(msgWa(linha.nome, linha.link));
                        window.open(`https://wa.me/${WA_RYAN}?text=${msg}`, '_blank');
                      }}>WA Ryan</button>
                    </div>
                  </div>
                )}

                {linha.status === 'erro' && (
                  <p className="admin-row-erro">{linha.erro}</p>
                )}
              </div>

              <div className="admin-row-actions">
                {isProcessando(linha.status) ? (
                  <div className="admin-row-status">
                    <span className="admin-spinner" />
                    <span>{statusLabel[linha.status]}</span>
                  </div>
                ) : (
                  <button
                    className="admin-gerar-btn"
                    onClick={() => handleGerar(linha.id)}
                    disabled={!linha.url.trim()}
                    title="Gerar e abrir WhatsApp"
                  >
                    {linha.status === 'pronto' ? 'Gerar novo' : 'Gerar + WA'}
                  </button>
                )}
                {linhas.length > 1 && !isProcessando(linha.status) && (
                  <button className="admin-remove-btn" onClick={() => removerLinha(linha.id)} title="Remover">✕</button>
                )}
              </div>
            </div>
          ))}
        </div>

        {historico.length > 0 && (
          <div className="admin-historico">
            <div className="admin-historico-header">
              <h3 className="admin-historico-title">Histórico</h3>
              <button className="admin-historico-limpar" onClick={limparHistorico}>Limpar tudo</button>
            </div>
            <div className="admin-historico-lista">
              {historico.map(h => {
                const expirado = isExpirado(h.createdAt);
                const v = views[h.previewId];
                return (
                  <div key={h.previewId} className={`admin-hist-row${expirado ? ' expirado' : ''}`}>
                    <div className="admin-hist-info">
                      <span className="admin-hist-nome">{h.nome}</span>
                      <span className="admin-hist-cat">{h.categoria}</span>
                      <span className="admin-hist-data">{new Date(h.createdAt).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' })}</span>
                    </div>
                    <div className="admin-hist-right">
                      {v !== undefined && <span className="admin-hist-views">{v} view{v !== 1 ? 's' : ''}</span>}
                      {expirado
                        ? <span className="admin-hist-expirado">expirado</span>
                        : <a href={h.link} target="_blank" rel="noreferrer" className="admin-mini-btn admin-mini-preview">Ver</a>
                      }
                      <button className="admin-hist-wa" onClick={() => {
                        const msg = encodeURIComponent(msgWa(h.nome, h.link));
                        window.open(`https://wa.me/${WA_RYAN}?text=${msg}`, '_blank');
                      }} title="Reenviar WA">WA</button>
                      <button className="admin-hist-del" onClick={() => removerHistorico(h.previewId)} title="Remover">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
