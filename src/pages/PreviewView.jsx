import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function PreviewView() {
  const { id } = useParams();
  const [html, setHtml] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/preview-view?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setHtml(data.html);
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

  return (
    <div style={{ width:'100%', height:'100vh', overflow:'hidden' }}>
      <iframe
        srcDoc={html}
        style={{ width:'100%', height:'100%', border:'none' }}
        title="Prévia do site"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
