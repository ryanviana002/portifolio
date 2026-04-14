import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const WA_RYAN = '5519992525515';

export default function PreviewView() {
  const { id } = useParams();
  const [html, setHtml] = useState('');
  const [nome, setNome] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/preview-view?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setHtml(data.html);
        setNome(data.nome || '');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a12', color:'#fff', fontFamily:'Space Grotesk,sans-serif', flexDirection:'column', gap:16 }}>
      <div style={{ width:40, height:40, border:'3px solid rgba(255,0,127,0.2)', borderTop:'3px solid #ff007f', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14 }}>Carregando prévia...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (error) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0a0a12', color:'#fff', fontFamily:'Space Grotesk,sans-serif', flexDirection:'column', gap:16, textAlign:'center', padding:32 }}>
      <div style={{ fontSize:48 }}>⏰</div>
      <h2 style={{ color:'#ff007f', fontSize:24, fontWeight:900 }}>Prévia expirada</h2>
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, maxWidth:360 }}>Esta prévia ficou disponível por 24h e expirou. Gere uma nova gratuitamente.</p>
      <a href="/preview" style={{ background:'linear-gradient(135deg,#ff007f,#d12c96)', color:'#fff', padding:'14px 32px', borderRadius:8, fontWeight:700, fontSize:13, letterSpacing:1, textDecoration:'none', marginTop:8 }}>
        GERAR NOVA PRÉVIA →
      </a>
      <a href="https://wa.me/5519992525515" target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginTop:4 }}>
        ou fale conosco no WhatsApp
      </a>
    </div>
  );

  const msgWa = encodeURIComponent(
    `Olá Ryan! Vi a prévia do site${nome ? ` da *${nome}*` : ''} e quero saber mais sobre como ter o meu site profissional.`
  );

  return (
    <div style={{ width:'100%', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>
      {/* Barra CTA fixa */}
      <div style={{
        background: 'linear-gradient(90deg, #0a0a12, #0d0020)',
        borderBottom: '1px solid rgba(255,0,127,0.2)',
        padding: '10px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        flexShrink: 0,
        zIndex: 100,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>Prévia criada por</span>
          <a href="https://ryancreator.dev" target="_blank" rel="noreferrer" style={{ color:'#ff007f', fontWeight:700, fontSize:13, textDecoration:'none', fontFamily:'Space Grotesk,sans-serif' }}>RDCreator</a>
          {nome && <span style={{ color:'rgba(255,255,255,0.2)', fontSize:12 }}>· {nome}</span>}
        </div>
        <a
          href={`https://wa.me/${WA_RYAN}?text=${msgWa}`}
          target="_blank"
          rel="noreferrer"
          style={{
            background: 'linear-gradient(135deg, #ff007f, #d12c96)',
            color: '#fff',
            textDecoration: 'none',
            padding: '8px 18px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            fontFamily: 'Space Grotesk,sans-serif',
            letterSpacing: 0.5,
            whiteSpace: 'nowrap',
            boxShadow: '0 0 16px rgba(255,0,127,0.3)',
          }}
        >
          Quero meu site →
        </a>
      </div>

      {/* iframe do preview */}
      <iframe
        srcDoc={html}
        style={{ width:'100%', flex:1, border:'none' }}
        title="Prévia do site"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
