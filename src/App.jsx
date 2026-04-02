import { useEffect, useRef, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Sobre from './components/Sobre';
import Servicos from './components/Servicos';
import Metodo from './components/Metodo';
import Portfolio from './components/Portfolio';
import Impacto from './components/Impacto';
import Contato from './components/Contato';
import Footer from './components/Footer';
import Ticker from './components/Ticker';
import LoadingScreen from './components/LoadingScreen';
import AudioToggle from './components/AudioToggle';
import SectionNav from './components/SectionNav';
import ParticleText from './components/ParticleText';
import MatrixRain from './components/MatrixRain';
import SleepMode from './components/SleepMode';
import BackToTop from './components/BackToTop';
import ShakeEaster from './components/ShakeEaster';
import useReveal from './hooks/useReveal';

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function WaPopup({ onClose }) {
  return (
    <div className="wa-overlay" onClick={onClose}>
      <div className="wa-popup" onClick={e => e.stopPropagation()}>
        <button className="wa-close" onClick={onClose}>✕</button>
        <div className="wa-popup-icon"><WaIcon /></div>
        <h3 className="wa-popup-title">Fale comigo no WhatsApp</h3>
        <p className="wa-popup-desc">Tire suas dúvidas, solicite um orçamento ou inicie seu projeto agora mesmo.</p>
        <a href="https://wa.me/5519992525515" target="_blank" rel="noreferrer" className="wa-popup-btn" onClick={onClose}>
          ABRIR WHATSAPP
        </a>
      </div>
    </div>
  );
}

function playWind(duration, vol) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);
    filter.Q.value = 0.8;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(vol, ctx.currentTime + duration * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
    source.onended = () => ctx.close();
  } catch {}
}

function App() {
  const cursorRef = useRef(null);
  const [waOpen, setWaOpen] = useState(false);
  const [particleDone, setParticleDone] = useState(false);
  const [matrix, setMatrix] = useState(false);

  useEffect(() => {
    const onMatrix = () => setMatrix(true);
    window.addEventListener('rdc:matrix', onMatrix);
    return () => window.removeEventListener('rdc:matrix', onMatrix);
  }, []);
  useReveal();

  // Console easter egg
  useEffect(() => {
    const style1 = 'color:#ff007f;font-size:20px;font-weight:900;';
    const style2 = 'color:#00f2fe;font-size:12px;font-weight:600;';
    const style3 = 'color:#9e9eff;font-size:11px;';
    const style4 = 'color:rgba(255,255,255,0.4);font-size:10px;';
    console.log('%c██████╗ ██████╗  ██████╗', style1);
    console.log('%c██╔══██╗██╔══██╗██╔════╝', style1);
    console.log('%c██████╔╝██║  ██║██║     ', style1);
    console.log('%c██╔══██╗██║  ██║██║     ', style1);
    console.log('%c██║  ██║██████╔╝╚██████╗', style1);
    console.log('%c╚═╝  ╚═╝╚═════╝  ╚═════╝', style1);
    console.log('%c\n👀 Oi, dev curioso!', style2);
    console.log('%cVocê inspecionou o site certo — bom olho.', style3);
    console.log('%cEste portfólio foi construído com React + Vite, CSS puro e muito café.', style3);
    console.log('%c\n📩 Quer trabalhar junto? ryanviana002@gmail.com', style2);
    console.log('%chttps://ryancreator.dev', style4);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;

    const sectionColors = {
      inicio: '#00f2fe',
      sobre: '#9e9eff',
      servicos: '#ff007f',
      metodo: '#00f2fe',
      portfolio: '#0ea5e9',
      impacto: '#ff007f',
      contato: '#00f2fe',
    };

    const updateCursorColor = () => {
      const sections = Object.keys(sectionColors);
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
          cursor.style.background = sectionColors[id];
          break;
        }
      }
    };

    const onMove = e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
      updateCursorColor();
    };

    const onEnter = () => { cursor.classList.add('big'); playWind(0.3, 0.06); };
    const onLeave = () => cursor.classList.remove('big');
    const onPlayEnter = () => { cursor.classList.add('play'); playWind(0.3, 0.06); };
    const onPlayLeave = () => cursor.classList.remove('play');
    const onClick = () => playWind(0.6, 0.12);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('click', onClick);

    const interactives = document.querySelectorAll('a, button, [data-hover]');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
    });

    setTimeout(() => {
      const rocket = document.querySelector('.hero-rocket');
      if (rocket) {
        rocket.addEventListener('mouseenter', onPlayEnter);
        rocket.addEventListener('mouseleave', onPlayLeave);
      }
    }, 500);

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <>
      {!particleDone && <ParticleText onDone={() => setParticleDone(true)} />}
      {matrix && <MatrixRain onDone={() => setMatrix(false)} />}
      <SleepMode />
      <BackToTop />
      <ShakeEaster />

      <div className="cursor" ref={cursorRef} />
      <SectionNav />

      <Navbar />
      <Hero />
      <Sobre />
      <Ticker items={['ANOS DE EXPERIÊNCIA', 'PROJETOS ENTREGUES', 'FOCO EM RESULTADO']} reverse />
      <Servicos />
      <Ticker items={['WEB DESIGN', 'SISTEMAS WEB', '4GL INFORMIX', 'IDENTIDADE VISUAL']} />
      <Metodo />
      <Ticker items={['DIAGNÓSTICO', 'CONCEITO', 'PRODUÇÃO', 'ENTREGA']} reverse />
      <Portfolio />
      <Ticker items={['REACT', 'VITE', 'CSS3', 'CANVA', '4GL', 'INFORMIX', 'UI/UX']} />
      <Impacto />
      <Ticker items={['QUALIDADE', 'PRAZO', 'RESULTADO', 'COMPROMETIMENTO']} reverse />
      <Contato />
      <Footer />
      <AudioToggle />
      <Analytics />
    </>
  );
}

export default App;
