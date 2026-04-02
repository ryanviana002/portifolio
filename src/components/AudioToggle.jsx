import { useRef, useState } from 'react';
import './AudioToggle.css';

// Stream lo-fi público e gratuito
const LOFI_STREAM = 'https://streams.ilovemusic.de/iloveradio17.mp3';

export default function AudioToggle() {
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  const toggle = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(LOFI_STREAM);
      audioRef.current.volume = 0.3;
      audioRef.current.oncanplay = () => setLoading(false);
    }

    if (!playing) {
      setLoading(true);
      audioRef.current.play().catch(() => setLoading(false));
      setPlaying(true);
    } else {
      audioRef.current.pause();
      setPlaying(false);
      setLoading(false);
    }
  };

  return (
    <button
      className={`audio-toggle${playing ? ' active' : ''}${loading ? ' loading' : ''}`}
      onClick={toggle}
      title={playing ? 'Pausar lo-fi' : 'Tocar lo-fi'}
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
