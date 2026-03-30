import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    const cursor = cursorRef.current;

    const onMove = e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
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
      <div className="cursor" ref={cursorRef} />

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
    </>
  );
}

export default App;
