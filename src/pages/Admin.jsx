import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';

function gerarId() {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

function novaLinha() {
  return { id: gerarId(), url: '', status: 'idle', nome: '', categoria: '', link: '', erro: '' };
}

function msgWa(nome, link) {
  return `Olá, tudo bem? 😊\n\nAqui é o Ryan, da RDCreator.\n\nEstava analisando a *${nome}*, no Google Maps, mas não encontrei um site do seu negócio, vi que tinha muito potencial e montei um modelo de site baseado no que vocês fazem 👇🏽\n\n${link}\n\n🆓 É um preview demonstrativo (não é o site final), mas já mostra como vocês podem se posicionar melhor online e atrair mais clientes.\n\nDeixei disponível por 24h 🫡\n\nQuero te ouvir — o que achou?`;
}

const statusLabel = {
  idle: '',
  checando: 'Verificando...',
  gerando: 'Gerando site...',
  salvando: 'Salvando...',
  pronto: 'Pronto ✓',
  erro: 'Erro',
};

export default function Admin() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(false);
  const [linhas, setLinhas] = useState([novaLinha()]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'dani') localStorage.setItem('rdc_owner', '1');
    if (localStorage.getItem('rdc_owner') === '1') {
      setAuthed(true);
    } else {
      navigate('/');
    }
  }, []);

  const update = (id, patch) =>
    setLinhas(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  const handleGerar = async (id) => {
    const linha = linhas.find(l => l.id === id);
    if (!linha?.url.trim()) return;

    update(id, { status: 'checando', erro: '', nome: '', link: '' });

    try {
      const checkRes = await fetch('/api/preview-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linha.url.trim() }),
      });
      const checkData = await checkRes.json();
      if (!checkRes.ok) throw new Error(checkData.error);

      update(id, { status: 'gerando', nome: checkData.nome, categoria: checkData.categoria });

      const genRes = await fetch('/api/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: linha.url.trim() }),
      });
      const genData = await genRes.json();
      if (!genRes.ok) throw new Error(genData.error);

      const nome = genData.dados?.nome || checkData.nome;
      update(id, { status: 'salvando', nome });

      const saveRes = await fetch('/api/preview-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: genData.html,
          nome,
          categoria: genData.dados?.categoria || checkData.categoria,
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error);

      update(id, { status: 'pronto', link: saveData.url, nome });

      // Abre WhatsApp com mensagem pronta
      const msg = encodeURIComponent(msgWa(nome, saveData.url));
      window.open(`https://wa.me/?text=${msg}`, '_blank');
    } catch (e) {
      update(id, { status: 'erro', erro: e.message || 'Erro desconhecido' });
    }
  };

  const adicionarLinha = () => setLinhas(prev => [...prev, novaLinha()]);

  const removerLinha = (id) => setLinhas(prev => prev.filter(l => l.id !== id));

  const isProcessando = (status) => ['checando', 'gerando', 'salvando'].includes(status);

  if (!authed) return null;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <a href="/" className="admin-back">← Voltar</a>
        <div className="admin-title">Painel RDCreator</div>
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

                {linha.status === 'pronto' && linha.nome && (
                  <div className="admin-row-result">
                    <span className="admin-row-nome">{linha.nome}</span>
                    <a href={linha.link} target="_blank" rel="noreferrer" className="admin-row-link">{linha.link}</a>
                    <div className="admin-row-btns">
                      <button className="admin-mini-btn" onClick={() => navigator.clipboard.writeText(linha.link)}>Copiar link</button>
                      <button className="admin-mini-btn admin-mini-wa" onClick={() => {
                        const msg = encodeURIComponent(msgWa(linha.nome, linha.link));
                        window.open(`https://wa.me/?text=${msg}`, '_blank');
                      }}>Abrir WA</button>
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

        <button className="admin-add-btn" onClick={adicionarLinha}>+ Adicionar link</button>
      </div>
    </div>
  );
}
