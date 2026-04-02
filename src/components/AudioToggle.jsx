import { useRef, useState, useEffect } from 'react';
import './AudioToggle.css';

const STREAMS = [
  'https://streams.ilovemusic.de/iloveradio17.mp3',
  'https://radio.plaza.one/mp3',
];

export default function AudioToggle() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);
  const actxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);

  const stopAnalyser = () => {
    cancelAnimationFrame(rafRef.current);
    window.dispatchEvent(new CustomEvent('rdc:audio-level', { detail: 0 }));
  };

  const startAnalyser = (audio) => {
    try {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      actxRef.current = actx;
      const source = actx.createMediaElementSource(audio);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      source.connect(analyser);
      analyser.connect(actx.destination);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        window.dispatchEvent(new CustomEvent('rdc:audio-level', { detail: avg }));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {}
  };

  const tryPlay = (idx) => {
    if (idx >= STREAMS.length) { setLoading(false); setPlaying(false); return; }
    const audio = new Audio(STREAMS[idx]);
    audio.volume = 0.07;
    audioRef.current = audio;
    audio.oncanplay = () => { setLoading(false); startAnalyser(audio); };
    audio.onerror = () => tryPlay(idx + 1);
    audio.play().catch(() => tryPlay(idx + 1));
  };

  const toggle = () => {
    if (!playing) {
      setLoading(true);
      setPlaying(true);
      tryPlay(0);
    } else {
      stopAnalyser();
      audioRef.current?.pause();
      audioRef.current = null;
      try { actxRef.current?.close(); } catch {}
      setPlaying(false);
      setLoading(false);
    }
  };

  return (
    <button
      className={`audio-toggle${playing ? ' active' : ''}${loading ? ' loading' : ''}`}
      onClick={toggle}
      title={playing ? 'Pausar música' : 'Tocar lo-fi'}
    >
      {loading ? (
        <span className="audio-loading" />
      ) : playing ? (
        <span className="audio-bars">
          <span /><span /><span /><span />
        </span>
      ) : (
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
      )}
    </button>
  );
}
