import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

const CONCORRENCIA = 3; // gerações simultâneas

function gerarId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [links, setLinks] = useState('');
  const [items, setItems] = useState([]); // { id, url, status, nome, categoria, link, erro }
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'dani') {
      localStorage.setItem('rdc_owner', '1');
    }
    if (localStorage.getItem('rdc_owner') === '1') {
      setAuthed(true);
    } else {
      navigate('/');
    }
  }, []);

  const gerarItem = async (url, itemId) => {
    const update = (patch) =>
      setItems(prev => prev.map(i => i.id === itemId ? { ...i, ...patch } : i));

    update({ status: 'checando' });

    try {
      // 1. Checar negócio
      const checkRes = await fetch('/api/preview-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error);

      update({ status: 'gerando', nome: checkData.nome, categoria: checkData.categoria });

      // 2. Gerar HTML
      const genRes = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error);

      update({ status: 'salvando', nome: genData.dados?.nome || checkData.nome });

      // 3. Salvar e pegar link
      const saveRes = await fetch('/api/preview-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: genData.html,
          nome: genData.dados?.nome || checkData.nome,
          categoria: genData.dados?.categoria || checkData.categoria,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error);

      update({ status: 'pronto', link: saveData.url, nome: genData.dados?.nome || checkData.nome });
    } catch (e) {
      update({ status: 'erro', erro: e.message || 'Erro desconhecido' });
    }
  };

  const handleGerar = async () => {
    const urls = links
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    if (!urls.length) return;

    const novos = urls.map(url => ({ id: gerarId(), url, status: 'aguardando', nome: '', categoria: '', link: '', erro: '' }));
    setItems(novos);
    setGerando(true);

    // Processar com concorrência limitada
    let idx = 0;
    const workers = Array.from({ length: Math.min(CONCORRENCIA, urls.length) }, async () => {
      while (idx < novos.length) {
        const current = novos[idx++];
        await gerarItem(current.url, current.id);
      }
    });

    await Promise.all(workers);
    setGerando(false);
  };

  const copiar = (texto) => {
    navigator.clipboard.writeText(texto).catch(() => {
      const el = document.createElement('textarea');
      el.value = texto;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    });
  };

  const statusLabel = {
    aguardando: 'Aguardando...',
    checando: 'Verificando negócio...',
    gerando: 'Gerando site...',
    salvando: 'Salvando...',
    pronto: 'Pronto',
    erro: 'Erro',
  };

  const msgWa = (item) => {
    const link = item.link || '';
    return `Oi! Gerei uma prévia do site para *${item.nome || 'seu negócio'}* 🎨\n\n${link}\n\nGostou? Posso transformar em site real a partir de R$ 997. Quer saber mais?`;
  };

  if (!authed) return null;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <a href="/" className="admin-back">← Voltar</a>
        <div className="admin-title">Painel RDCreator</div>
        <div className="admin-tag">ADMIN</div>
      </div>

      <div className="admin-body">
        <div className="admin-input-section">
          <label className="admin-label">Links do Google Maps (um por linha)</label>
          <textarea
            className="admin-textarea"
            placeholder={"https://maps.app.goo.gl/...\nhttps://maps.app.goo.gl/...\nhttps://g.co/kgs/..."}
            value={links}
            onChange={e => setLinks(e.target.value)}
            disabled={gerando}
          />
          <button
            className="admin-btn"
            onClick={handleGerar}
            disabled={gerando || !links.trim()}
          >
            {gerando ? 'Gerando...' : 'Gerar Prévias'}
          </button>
        </div>

        {items.length > 0 && (
          <div className="admin-results">
            <div className="admin-results-header">
              <span>{items.length} prévia{items.length > 1 ? 's' : ''}</span>
              <span className="admin-results-ok">{items.filter(i => i.status === 'pronto').length} prontas</span>
            </div>
            {items.map(item => (
              <div key={item.id} className={`admin-card admin-card--${item.status}`}>
                <div className="admin-card-top">
                  <div className="admin-card-info">
                    <span className="admin-card-nome">{item.nome || item.url}</span>
                    {item.categoria && <span className="admin-card-cat">{item.categoria}</span>}
                  </div>
                  <span className={`admin-status admin-status--${item.status}`}>
                    {item.status !== 'pronto' && item.status !== 'erro' && (
                      <span className="admin-spinner" />
                    )}
                    {statusLabel[item.status]}
                  </span>
                </div>

                {item.status === 'erro' && (
                  <p className="admin-card-erro">{item.erro}</p>
                )}

                {item.status === 'pronto' && item.link && (
                  <div className="admin-card-actions">
                    <input className="admin-link-input" value={item.link} readOnly />
                    <button
                      className="admin-copy-btn"
                      onClick={() => copiar(item.link)}
                    >
                      Copiar link
                    </button>
                    <button
                      className="admin-wa-btn"
                      onClick={() => copiar(msgWa(item))}
                    >
                      Copiar msg WA
                    </button>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="admin-view-btn"
                    >
                      Ver
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
