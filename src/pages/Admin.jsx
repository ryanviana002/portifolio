import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function gerarId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

const WA_RYAN = '5519994175385';
const HISTORICO_KEY = 'rdc_historico_previews';
const EXPIRY_MS = 3 * 24 * 60 * 60 * 1000; // 72h

const CORES = [
  { label: 'Azul', value: 'azul', hex: '#1e40af' },
  { label: 'Verde', value: 'verde', hex: '#16a34a' },
  { label: 'Vermelho', value: 'vermelho', hex: '#dc2626' },
  { label: 'Laranja', value: 'laranja', hex: '#ea580c' },
  { label: 'Amarelo', value: 'amarelo', hex: '#ca8a04' },
  { label: 'Rosa', value: 'rosa', hex: '#db2777' },
  { label: 'Roxo', value: 'roxo', hex: '#7c3aed' },
  { label: 'Dourado', value: 'dourado', hex: '#b45309' },
  { label: 'Marrom', value: 'marrom', hex: '#78350f' },
  { label: 'Cinza', value: 'cinza', hex: '#4b5563' },
  { label: 'Preto', value: 'preto', hex: '#111827' },
  { label: 'Branco', value: 'branco', hex: '#e5e7eb' },
];

function SeletorCores({ corSelecionada, onChange, disabled }) {
  return (
    <div className="admin-cores-wrap">
      {corSelecionada && <span className="admin-cor-label">● {corSelecionada}</span>}
      {CORES.map(cor => (
        <button
          key={cor.value}
          className={`admin-cor-btn${corSelecionada === cor.value ? ' selected' : ''}`}
          style={{ '--cor': cor.hex }}
          onClick={() => onChange(corSelecionada === cor.value ? '' : cor.value, corSelecionada === cor.value ? '' : `use ${cor.label.toLowerCase()} como cor predominante do site`)}
          title={cor.label}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

function novaLinha() {
  return { id: gerarId(), url: '', status: 'idle', nome: '', categoria: '', link: '', erro: '', waNum: null, prompt: '', promptOpen: false, cor: '' };
}

function msgWa(nome, link) {
  return `Olá! Aqui é o Ryan, desenvolvedor web da RDCreator. Vi a *${nome}* no Google Maps e já deixei algo pronto pra vocês. Pode ser que goste — posso mandar?`;
}

function msgWa2(nome, link) {
  return `Aqui está 👇\n\n${link}\n\nÉ um preview do site que montei pra *${nome}*. Fica disponível por 3 dias.\n\nO que achou?`;
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
  const [aba, setAba] = useState('buscar');
  const [busca, setBusca] = useState('');
  const [bairro, setBairro] = useState('');
  const [prospects, setProspects] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [prospectStatus, setProspectStatus] = useState({}); // { [id]: { status, link, nome, erro } }

  useEffect(() => {
    if (localStorage.getItem('rdc_owner') === '1') {
      setAuthed(true);
      setHistorico(lerHistorico());
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    const senha = e.target.senha.value;
    if (senha === 'familia1@') {
      localStorage.setItem('rdc_owner', '1');
      setAuthed(true);
      setHistorico(lerHistorico());
    } else {
      e.target.senha.value = '';
      e.target.senha.placeholder = 'Senha incorreta';
    }
  };

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

  const salvarEAtualizar = (previewId, nome, categoria, link, createdAt, prospectId, waNum) => {
    const item = { previewId, nome, categoria, link, createdAt, prospectId: prospectId || null, waNum: waNum || null };
    salvarHistorico(item);
    setHistorico(lerHistorico());
  };

  const [dispensados, setDispensados] = useState(new Set());
  const dispensar = (id) => setDispensados(prev => new Set([...prev, id]));

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
          body: JSON.stringify({ url: linha.url.trim(), prompt: linha.prompt?.trim() || '', modelo, origem: 'admin' }),
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
          body: JSON.stringify({ html: genData.html, nome, categoria: genData.dados?.categoria || checkData.categoria, origem: 'admin' }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      const waNumFinal = linhas.find(l => l.id === id)?.waNum || null;
      update(id, { status: 'pronto', link: saveData.url, nome });
      salvarEAtualizar(saveData.id || saveData.url.split('/').pop(), nome, genData.dados?.categoria || checkData.categoria, saveData.url, Date.now(), null, waNumFinal);

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
          body: JSON.stringify({ url: url.trim(), prompt: linha?.prompt?.trim() || '', modelo, origem: 'admin' }),
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
          body: JSON.stringify({ html: genData.html, nome, categoria: genData.dados?.categoria || checkData.categoria, origem: 'admin' }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });

      update(id, { status: 'pronto', link: saveData.url, nome });
      salvarEAtualizar(saveData.id || saveData.url.split('/').pop(), nome, genData.dados?.categoria || checkData.categoria, saveData.url, Date.now(), null, checkData.waNum || null);
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

  const handleBuscar = async (e) => {
    e.preventDefault();
    if (!busca.trim()) return;
    setBuscando(true);
    setProspects([]);
    try {
      const r = await fetch('/api/buscar-prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: busca.trim(), bairro: bairro.trim() }),
      });
      const data = await r.json();
      setProspects(Array.isArray(data) ? data : []);
    } catch { setProspects([]); }
    finally { setBuscando(false); }
  };

  const updateProspect = (id, patch) =>
    setProspectStatus(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const gerarProspect = async (prospect) => {
    const pid = prospect.id;
    if (['checando','gerando','salvando'].includes(prospectStatus[pid]?.status)) return;
    updateProspect(pid, { status: 'checando', erro: '', link: '', nome: '' });
    try {
      const checkData = await retryFetch(async () => {
        const r = await fetch('/api/preview-check', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: prospect.mapsUrl, placeId: prospect.id }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });
      updateProspect(pid, { status: 'gerando', nome: checkData.nome, waNum: checkData.waNum || null });
      const genData = await retryFetch(async () => {
        const r = await fetch('/api/preview', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: prospect.mapsUrl, placeId: prospect.id, prompt: prospectStatus[prospect.id]?.prompt?.trim() || '', modelo, origem: 'admin' }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });
      const nome = genData.dados?.nome || checkData.nome;
      updateProspect(pid, { status: 'salvando', nome });
      const saveData = await retryFetch(async () => {
        const r = await fetch('/api/preview-save', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: genData.html, nome, categoria: genData.dados?.categoria || checkData.categoria, origem: 'admin' }),
        });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        return d;
      });
      updateProspect(pid, { status: 'pronto', link: saveData.url, nome });
      const waNumFinalP = prospectStatus[pid]?.waNum || checkData.waNum || null;
      salvarEAtualizar(saveData.id || saveData.url.split('/').pop(), nome, genData.dados?.categoria || checkData.categoria, saveData.url, Date.now(), pid, waNumFinalP);
      // WA aberto manualmente pelos botões
    } catch(e) {
      updateProspect(pid, { status: 'erro', erro: e.message || 'Erro desconhecido' });
    }
  };

  const usarProspect = (prospect) => {
    const vazia = linhas.find(l => !l.url.trim() && l.status === 'idle');
    if (vazia) {
      update(vazia.id, { url: prospect.mapsUrl });
    } else {
      setLinhas(prev => [...prev, { ...novaLinha(), url: prospect.mapsUrl }]);
    }
  };
  const isExpirado = (createdAt) => Date.now() - createdAt > EXPIRY_MS;

  if (!authed) return (
    <div style={{ minHeight:'100vh', background:'#0a0a12', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Space Grotesk,sans-serif', cursor:'auto' }}>
      <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:16, width:300 }}>
        <div style={{ textAlign:'center', marginBottom:8 }}>
          <div style={{ color:'#ff007f', fontWeight:900, fontSize:22, letterSpacing:2 }}>RDCreator</div>
          <div style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginTop:4 }}>Painel Admin</div>
        </div>
        <input
          name="senha"
          type="password"
          placeholder="Senha"
          autoFocus
          style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#fff', fontSize:15, padding:'12px 16px', outline:'none', fontFamily:'Space Grotesk,sans-serif' }}
        />
        <button type="submit" style={{ background:'linear-gradient(135deg,#ff007f,#d12c96)', color:'#fff', border:'none', borderRadius:10, padding:'12px', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'Space Grotesk,sans-serif', letterSpacing:1 }}>
          ENTRAR
        </button>
      </form>
    </div>
  );

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
        <button className="admin-sair-btn" onClick={() => { localStorage.removeItem('rdc_owner'); setAuthed(false); }}>Sair</button>
      </div>

      <div className="admin-body">

        {/* Abas */}
        <div className="admin-abas">
          <button className={`admin-aba${aba === 'buscar' ? ' active' : ''}`} onClick={() => setAba('buscar')}>Buscar prospects</button>
          <button className={`admin-aba${aba === 'manual' ? ' active' : ''}`} onClick={() => setAba('manual')}>Manual</button>
          <button className={`admin-aba${aba === 'historico' ? ' active' : ''}`} onClick={() => setAba('historico')}>
            Histórico {historico.length > 0 && <span className="admin-aba-badge">{historico.length}</span>}
          </button>
        </div>

        {/* Aba Buscar */}
        {aba === 'buscar' && (
          <div className="admin-busca-wrap">
            <form className="admin-busca-form" onSubmit={handleBuscar}>
              <input
                className="admin-busca-input"
                placeholder="Categoria: barbearia, restaurante..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              <input
                className="admin-busca-input admin-busca-bairro"
                placeholder="Bairro (opcional)"
                value={bairro}
                onChange={e => setBairro(e.target.value)}
              />
              <button className="admin-busca-btn" type="submit" disabled={buscando || !busca.trim()}>
                {buscando ? 'Buscando...' : 'Buscar sem site'}
              </button>
            </form>

            {buscando && (
              <div className="admin-busca-loading">
                <span className="admin-spinner" /> Buscando negócios sem site...
              </div>
            )}

            {!buscando && prospects.length > 0 && (
              <div className="admin-prospects">
                <div className="admin-prospects-header">
                  <span className="admin-prospects-count">{prospects.length} negócios sem site encontrados</span>
                  <button className="admin-prospects-fechar" onClick={() => setProspects([])}>✕</button>
                </div>
                <div className="admin-prospects-lista">
                  {prospects.filter(p => !dispensados.has(p.id)).map(p => {
                    const ps = prospectStatus[p.id] || {};
                    const processando = ['checando','gerando','salvando'].includes(ps.status);
                    return (
                      <div key={p.id} className={`admin-prospect-row${ps.status === 'pronto' ? ' pronto' : ''}`}>
                        <div className="admin-prospect-row-top">
                        {p.foto && <img src={p.foto} alt={p.nome} className="admin-prospect-foto" />}
                        <div className="admin-prospect-info">
                          <span className="admin-prospect-nome">{p.nome}</span>
                          <span className="admin-prospect-cat">{p.categoria}</span>
                          {p.avaliacao && <span className="admin-prospect-rating">⭐ {p.avaliacao} ({p.numAvaliacoes})</span>}
                          <span className="admin-prospect-end">{p.endereco}</span>
                          {p.telefone && <span className="admin-prospect-tel">{p.telefone}</span>}
                        </div>
                        {!processando && ps.status !== 'pronto' && (
                          <SeletorCores
                            corSelecionada={ps.cor || ''}
                            onChange={(cor, prompt) => updateProspect(p.id, { cor, prompt })}
                          />
                        )}
                        <div className="admin-prospect-btns">
                          {ps.status === 'pronto' ? (
                            <>
                              <button className="admin-mini-btn admin-mini-preview" onClick={() => window.open(ps.link + '?skip=1', '_blank')}>Ver</button>
                              <button className="admin-mini-btn" onClick={() => navigator.clipboard.writeText(ps.link)}>Copiar</button>
                              {ps.waNum && (
                                <>
                                  <button className="admin-mini-btn admin-mini-wa" onClick={() => {
                                    const msg = encodeURIComponent(msgWa(ps.nome, ps.link));
                                    window.open(`https://wa.me/${ps.waNum}?text=${msg}`, '_blank');
                                    dispensar(p.id);
                                  }}>1º WA</button>
                                  <button className="admin-mini-btn admin-mini-wa" onClick={() => {
                                    const msg = encodeURIComponent(msgWa2(ps.nome, ps.link));
                                    window.open(`https://wa.me/${ps.waNum}?text=${msg}`, '_blank');
                                    dispensar(p.id);
                                  }}>2º WA</button>
                                </>
                              )}
                              <button className="admin-mini-btn admin-mini-wa-ryan" onClick={() => {
                                const msg = encodeURIComponent(msgWa(ps.nome, ps.link));
                                window.open(`https://wa.me/${WA_RYAN}?text=${msg}`, '_blank');
                                dispensar(p.id);
                              }}>WA Ryan</button>
                              <button className="admin-mini-btn" onClick={() => dispensar(p.id)}>Dispensar</button>
                            </>
                          ) : processando ? (
                            <div className="admin-row-status">
                              <span className="admin-spinner" />
                              <span>{statusLabel[ps.status]}</span>
                            </div>
                          ) : (
                            <>
                              <a href={p.mapsUrl} target="_blank" rel="noreferrer" className="admin-mini-btn">Maps</a>
                              <button className="admin-gerar-btn" onClick={() => gerarProspect(p)}>
                                {ps.status === 'erro' ? 'Tentar novo' : 'Gerar + WA'}
                              </button>
                            </>
                          )}
                        </div>
                        </div>{/* fecha row-top */}
                        {ps.status === 'erro' && <p className="admin-row-erro">{ps.erro}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!buscando && busca && prospects.length === 0 && (
              <p className="admin-prospects-vazio">Nenhum negócio sem site encontrado. Tente outra busca.</p>
            )}
          </div>
        )}

        {/* Aba Manual */}
        {aba === 'manual' && (
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
                  <SeletorCores
                    corSelecionada={linha.cor || ''}
                    onChange={(cor, prompt) => update(linha.id, { cor, prompt })}
                    disabled={isProcessando(linha.status)}
                  />
                  {linha.status === 'pronto' && linha.nome && (
                    <div className="admin-row-result">
                      <span className="admin-row-nome">{linha.nome}</span>
                      <a href={linha.link} target="_blank" rel="noreferrer" className="admin-row-link">{linha.link}</a>
                      <div className="admin-row-btns">
                        <button className="admin-mini-btn admin-mini-preview" onClick={() => window.open(linha.link + '?skip=1', '_blank')}>Ver preview</button>
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
                  {linha.status === 'erro' && <p className="admin-row-erro">{linha.erro}</p>}
                </div>
                <div className="admin-row-actions">
                  {isProcessando(linha.status) ? (
                    <div className="admin-row-status">
                      <span className="admin-spinner" />
                      <span>{statusLabel[linha.status]}</span>
                    </div>
                  ) : (
                    <button className="admin-gerar-btn" onClick={() => handleGerar(linha.id)} disabled={!linha.url.trim()}>
                      {linha.status === 'pronto' ? 'Gerar novo' : 'Gerar + WA'}
                    </button>
                  )}
                  {linhas.length > 1 && !isProcessando(linha.status) && (
                    <button className="admin-remove-btn" onClick={() => removerLinha(linha.id)}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Aba Histórico */}
        {aba === 'historico' && (
          <div className="admin-historico">
            {historico.length === 0 ? (
              <p className="admin-prospects-vazio">Nenhum preview gerado ainda.</p>
            ) : (
              <>
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
                            : <a href={h.link + '?skip=1'} target="_blank" rel="noreferrer" className="admin-mini-btn admin-mini-preview">Ver</a>
                          }
                          {h.waNum && (
                            <>
                              <button className="admin-hist-wa" onClick={() => {
                                const msg = encodeURIComponent(msgWa(h.nome, h.link));
                                window.open(`https://wa.me/${h.waNum}?text=${msg}`, '_blank');
                              }}>1º WA</button>
                              <button className="admin-hist-wa admin-hist-interesse" onClick={() => {
                                const msg = encodeURIComponent(msgWa2(h.nome, h.link));
                                window.open(`https://wa.me/${h.waNum}?text=${msg}`, '_blank');
                              }}>Interesse</button>
                            </>
                          )}
                          <button className="admin-hist-wa" onClick={() => {
                            const msg = encodeURIComponent(msgWa(h.nome, h.link));
                            window.open(`https://wa.me/${WA_RYAN}?text=${msg}`, '_blank');
                          }}>Ryan</button>
                          <button className="admin-hist-del" onClick={() => removerHistorico(h.previewId)}>✕</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
