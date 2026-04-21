import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

const WA_RYAN = '5519994175385';

export default function PreviewView() {
  const { id } = useParams();
  const [html, setHtml] = useState('');
  const [nome, setNome] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showObrigado, setShowObrigado] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const skip = new URLSearchParams(window.location.search).get('skip');
    fetch(`/api/preview-view?id=${id}${skip ? '&skip=1' : ''}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setHtml(data.html);
        setNome(data.nome || '');
        setExpiresAt(data.expires_at ? new Date(data.expires_at) : null);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Countdown até expirar
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => {
      const diff = expiresAt - Date.now();
      if (diff <= 0) { setCountdown('Expirado'); clearInterval(timerRef.current); return; }
      const h = Math.floor(diff / 3600000);
      const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
      const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
      setCountdown(`${h}h ${m}m ${s}s`);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [expiresAt]);

  // Popup automático após 40s
  useEffect(() => {
    if (!html) return;
    const t = setTimeout(() => setShowPopup(true), 40000);
    return () => clearTimeout(t);
  }, [html]);

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
      <p style={{ color:'rgba(255,255,255,0.5)', fontSize:15, maxWidth:360 }}>Esta prévia ficou disponível por 3 dias e expirou. Gere uma nova gratuitamente.</p>
      <a href="/preview" style={{ background:'linear-gradient(135deg,#ff007f,#d12c96)', color:'#fff', padding:'14px 32px', borderRadius:8, fontWeight:700, fontSize:13, letterSpacing:1, textDecoration:'none', marginTop:8 }}>
        GERAR NOVA PRÉVIA →
      </a>
      <a href={`https://wa.me/${WA_RYAN}`} target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,0.3)', fontSize:13, marginTop:4 }}>
        ou fale conosco no WhatsApp
      </a>
    </div>
  );

  const msgWa = encodeURIComponent(
    `Olá Ryan! Vi a prévia do site${nome ? ` da *${nome}*` : ''} e quero saber mais sobre como ter o meu site profissional.`
  );

  const handleQueroSite = () => {
    setShowPopup(false);
    setShowObrigado(true);
    setTimeout(() => {
      window.open(`https://wa.me/${WA_RYAN}?text=${msgWa}`, '_blank');
    }, 2000);
  };

  const urgente = countdown && countdown !== 'Expirado' && expiresAt && (expiresAt - Date.now()) < 24 * 3600000;

  return (
    <div style={{ width:'100%', height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', fontFamily:'Space Grotesk,sans-serif' }}>

      {/* Barra de urgência com countdown */}
      <div style={{
        background: urgente ? 'linear-gradient(90deg,#7c0000,#b00020)' : 'linear-gradient(90deg,#0a0a12,#0d0020)',
        borderBottom: `1px solid ${urgente ? 'rgba(255,50,50,0.4)' : 'rgba(255,0,127,0.2)'}`,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>Prévia criada por</span>
          <a href="https://ryancreator.dev" target="_blank" rel="noreferrer" style={{ color:'#ff007f', fontWeight:700, fontSize:13, textDecoration:'none' }}>RDCreator</a>
          {nome && <span style={{ color:'rgba(255,255,255,0.2)', fontSize:12 }}>· {nome}</span>}
          {countdown && (
            <span style={{
              background: urgente ? 'rgba(255,50,50,0.2)' : 'rgba(255,165,0,0.12)',
              border: `1px solid ${urgente ? 'rgba(255,50,50,0.4)' : 'rgba(255,165,0,0.3)'}`,
              color: urgente ? '#ff6060' : '#ffaa00',
              fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 999,
              letterSpacing: 0.5,
            }}>
              {urgente ? '⚠️ ' : '⏱ '}Expira em {countdown}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowPopup(true)}
          style={{
            background: 'linear-gradient(135deg,#ff007f,#d12c96)',
            color: '#fff', border: 'none', cursor: 'pointer',
            padding: '7px 16px', borderRadius: 999,
            fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
            whiteSpace: 'nowrap', boxShadow: '0 0 16px rgba(255,0,127,0.3)',
            fontFamily: 'Space Grotesk,sans-serif',
          }}
        >
          Quero meu site →
        </button>
      </div>

      {/* iframe */}
      <iframe
        srcDoc={html}
        style={{ width:'100%', flex:1, border:'none' }}
        title="Prévia do site"
        sandbox="allow-same-origin allow-scripts"
      />

      {/* Popup quero meu site */}
      {showPopup && !showObrigado && (
        <div onClick={() => setShowPopup(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
          backdropFilter:'blur(6px)', display:'flex', alignItems:'center',
          justifyContent:'center', zIndex:9999, padding:24,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background:'#0f0f1a', border:'1px solid rgba(255,0,127,0.25)',
            borderRadius:20, padding:'36px 28px', maxWidth:400, width:'100%',
            textAlign:'center', position:'relative',
            animation:'slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)',
          }}>
            <style>{`@keyframes slideUp{from{transform:translateY(40px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
            <button onClick={() => setShowPopup(false)} style={{
              position:'absolute', top:14, right:14, background:'rgba(255,255,255,0.08)',
              border:'none', color:'rgba(255,255,255,0.5)', width:30, height:30,
              borderRadius:'50%', cursor:'pointer', fontSize:14, display:'flex',
              alignItems:'center', justifyContent:'center',
            }}>✕</button>

            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, color:'#ff007f', marginBottom:14, textTransform:'uppercase' }}>
              GOSTOU DA PRÉVIA?
            </div>
            <h2 style={{ fontSize:28, fontWeight:900, color:'#fff', margin:'0 0 12px', lineHeight:1.1 }}>
              Quer esse site<br />de verdade?
            </h2>
            <p style={{ fontSize:14, color:'rgba(255,255,255,0.5)', lineHeight:1.6, margin:'0 0 20px' }}>
              Transformo essa prévia em um site profissional real, otimizado e pronto para vender.
            </p>

            {/* Preço com parcelamento */}
            <div style={{ background:'rgba(255,0,127,0.06)', border:'1px solid rgba(255,0,127,0.15)', borderRadius:12, padding:'14px 20px', marginBottom:20 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:1, marginBottom:4 }}>a partir de</div>
              <div style={{ fontSize:38, fontWeight:900, color:'#ff007f', lineHeight:1 }}>R$ 997</div>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginTop:4 }}>ou 12x de <strong style={{color:'rgba(255,255,255,0.6)'}}>R$ 83,08</strong> sem juros</div>
            </div>

            <button onClick={handleQueroSite} style={{
              display:'block', width:'100%', background:'linear-gradient(135deg,#ff007f,#d12c96)',
              color:'#fff', border:'none', borderRadius:12, padding:'15px 28px',
              fontSize:14, fontWeight:700, letterSpacing:1, cursor:'pointer',
              marginBottom:10, fontFamily:'Space Grotesk,sans-serif',
            }}>
              EU QUERO ESSE SITE! →
            </button>
            <a href={`https://wa.me/${WA_RYAN}?text=${msgWa}`} target="_blank" rel="noreferrer"
              style={{ color:'rgba(255,255,255,0.4)', fontSize:13, textDecoration:'none', display:'block' }}>
              Só tirar dúvidas no WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Tela de obrigado */}
      {showObrigado && (
        <div style={{
          position:'fixed', inset:0, background:'#0a0a12',
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', zIndex:99999, gap:20, padding:32, textAlign:'center',
          animation:'fadeIn 0.5s ease',
        }}>
          <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
          <div style={{ fontSize:64 }}>🎉</div>
          <h2 style={{ fontSize:32, fontWeight:900, color:'#fff', margin:0 }}>Perfeito!</h2>
          <p style={{ fontSize:16, color:'rgba(255,255,255,0.55)', maxWidth:320, lineHeight:1.6, margin:0 }}>
            Estamos abrindo o WhatsApp pra você falar com o Ryan agora mesmo.
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:10, color:'#25d366', fontWeight:700, fontSize:15 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Abrindo WhatsApp...
          </div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.2)', margin:0 }}>
            Não abriu?{' '}
            <a href={`https://wa.me/${WA_RYAN}?text=${msgWa}`} target="_blank" rel="noreferrer" style={{ color:'#ff007f' }}>
              clique aqui
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
