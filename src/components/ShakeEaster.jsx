import { useEffect } from 'react';

export default function ShakeEaster() {

  useEffect(() => {
    let lastX = null, lastY = null, lastZ = null;
    let shakeCount = 0;
    let lastShake = 0;

    const onMotion = e => {
      const acc = e.accelerationIncludingGravity;
      if (!acc) return;
      const { x, y, z } = acc;
      if (lastX === null) { lastX = x; lastY = y; lastZ = z; return; }

      const delta = Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ);
      const now = Date.now();

      if (delta > 25) {
        if (now - lastShake < 800) shakeCount++;
        else shakeCount = 1;
        lastShake = now;

        if (shakeCount >= 3) {
          shakeCount = 0;
          window.dispatchEvent(new Event('rdc:matrix'));
        }
      }

      lastX = x; lastY = y; lastZ = z;
    };

    if (typeof DeviceMotionEvent !== 'undefined') {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        // iOS 13+ precisa de permissão — só registra após interação
        const onClick = () => {
          DeviceMotionEvent.requestPermission().then(r => {
            if (r === 'granted') window.addEventListener('devicemotion', onMotion);
          });
          document.removeEventListener('click', onClick);
        };
        document.addEventListener('click', onClick);
      } else {
        window.addEventListener('devicemotion', onMotion);
      }
    }

    return () => window.removeEventListener('devicemotion', onMotion);
  }, []);

  return null;
}
