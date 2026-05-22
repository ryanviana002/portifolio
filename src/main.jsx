import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Preview from './pages/Preview.jsx'
import PreviewView from './pages/PreviewView.jsx'
import Admin from './pages/Admin.jsx'
import V2 from './pages/V2.jsx'
import RDCreator from './pages/RDCreator.jsx'
import NotFound from './components/NotFound.jsx'
import Automotivo from './pages/Automotivo.jsx'
import { CinematicHero } from './components/ui/cinematic-landing-hero.jsx'
import { BrazilMapGlobe } from './components/ui/brazil-map-globe.jsx'
import PricingSection from './components/ui/pricing-card.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RDCreator />} />
        <Route path="/portifolio" element={<V2 />} />
        <Route path="/start" element={<App />} />
        <Route path="/automotivo" element={<Automotivo />} />
        <Route path="/cinematic" element={<div style={{overflowX:'hidden',width:'100%',minHeight:'100vh'}}><CinematicHero /></div>} />
        <Route path="/pricing" element={<PricingSection />} />
        <Route path="/brasil-map" element={
          <div style={{minHeight:'100vh',background:'#0a0a12',display:'flex',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
            <div style={{maxWidth:'1100px',width:'100%',borderRadius:'24px',border:'1px solid rgba(255,255,255,0.06)',background:'rgba(20,19,20,0.6)',backdropFilter:'blur(12px)',overflow:'hidden',display:'flex',flexWrap:'wrap'}}>
              <div style={{flex:'1',minWidth:'280px',padding:'48px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                <div style={{display:'inline-flex',alignItems:'center',gap:'8px',borderRadius:'9999px',border:'1px solid rgba(255,255,255,0.1)',background:'rgba(255,255,255,0.04)',padding:'4px 12px',fontSize:'11px',color:'rgba(100,220,255,0.8)',marginBottom:'24px',width:'fit-content'}}>
                  <span style={{width:'6px',height:'6px',borderRadius:'9999px',background:'#22c55e',boxShadow:'0 0 8px rgba(34,197,94,0.8)',animation:'pulse 2s infinite'}} />
                  Monitorando em tempo real
                </div>
                <h2 style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'clamp(28px,4vw,44px)',fontWeight:800,letterSpacing:'-0.03em',color:'#efece6',lineHeight:1.1,marginBottom:'16px'}}>
                  Clientes te encontrando<br/>
                  <span style={{background:'linear-gradient(90deg,#abc7ff,#00D1FF)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>em todo o Brasil</span>
                </h2>
                <p style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'16px',color:'rgba(191,188,183,0.7)',lineHeight:1.6,marginBottom:'32px',maxWidth:'340px'}}>
                  Seu negócio aparecendo para quem busca na sua região — do bairro ao estado inteiro.
                </p>
                <div style={{display:'flex',gap:'32px'}}>
                  {[['29+','Cidades atendidas'],['332%','Crescimento médio'],['97%','Taxa de retenção']].map(([val,label])=>(
                    <div key={label}>
                      <p style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'28px',fontWeight:800,color:'#efece6',letterSpacing:'-0.03em'}}>{val}</p>
                      <p style={{fontFamily:'Space Grotesk,sans-serif',fontSize:'11px',color:'rgba(191,188,183,0.5)',textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{flex:'1',minWidth:'300px',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
                <BrazilMapGlobe width={460} height={520} />
              </div>
            </div>
          </div>
        } />
        <Route path="/preview" element={<Preview />} />
        <Route path="/r/:id" element={<PreviewView />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
