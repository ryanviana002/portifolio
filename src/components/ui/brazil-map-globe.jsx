"use client";

import { useRef, useEffect, useCallback } from "react";

// Coordenadas lat/lng das principais cidades brasileiras
const DEFAULT_MARKERS = [
  { lat: -23.55, lng: -46.63, label: "São Paulo" },
  { lat: -22.91, lng: -43.17, label: "Rio de Janeiro" },
  { lat: -19.92, lng: -43.94, label: "Belo Horizonte" },
  { lat: -12.97, lng: -38.50, label: "Salvador" },
  { lat: -3.73,  lng: -38.52, label: "Fortaleza" },
  { lat: -8.05,  lng: -34.88, label: "Recife" },
  { lat: -15.78, lng: -47.93, label: "Brasília" },
  { lat: -30.03, lng: -51.23, label: "Porto Alegre" },
  { lat: -25.43, lng: -49.27, label: "Curitiba" },
  { lat: -1.46,  lng: -48.50, label: "Belém" },
  { lat: -3.10,  lng: -60.02, label: "Manaus" },
  { lat: -20.32, lng: -40.34, label: "Vitória" },
  { lat: -16.68, lng: -49.25, label: "Goiânia" },
  { lat: -2.53,  lng: -44.30, label: "São Luís" },
  { lat: -10.91, lng: -37.05, label: "Aracaju" },
];

// Conexões simulando clientes encontrando o negócio pela região
const DEFAULT_CONNECTIONS = [
  { from: [-23.55, -46.63], to: [-22.91, -43.17] },
  { from: [-23.55, -46.63], to: [-25.43, -49.27] },
  { from: [-23.55, -46.63], to: [-20.32, -40.34] },
  { from: [-22.91, -43.17], to: [-19.92, -43.94] },
  { from: [-15.78, -47.93], to: [-16.68, -49.25] },
  { from: [-15.78, -47.93], to: [-12.97, -38.50] },
  { from: [-12.97, -38.50], to: [-8.05,  -34.88] },
  { from: [-8.05,  -34.88], to: [-3.73,  -38.52] },
  { from: [-3.73,  -38.52], to: [-2.53,  -44.30] },
  { from: [-30.03, -51.23], to: [-25.43, -49.27] },
];

// Projeção Mercator simplificada → pixel
// Bounding box do Brasil: lat [-33.8, 5.3], lng [-73.9, -28.8]
const BR_LAT_MIN = -33.8;
const BR_LAT_MAX =   5.3;
const BR_LNG_MIN = -73.9;
const BR_LNG_MAX = -28.8;

function latLngToCanvas(lat, lng, w, h, padding = 40) {
  const px = padding + ((lng - BR_LNG_MIN) / (BR_LNG_MAX - BR_LNG_MIN)) * (w - padding * 2);
  // lat invertida (topo = norte)
  const py = padding + ((BR_LAT_MAX - lat) / (BR_LAT_MAX - BR_LAT_MIN)) * (h - padding * 2);
  return [px, py];
}

// Pontos do contorno do Brasil (simplificado, sentido horário)
const BRAZIL_OUTLINE = [
  [-5.0,-35.0],[-2.5,-44.3],[-1.5,-48.5],[0.0,-51.0],[2.3,-50.7],
  [3.8,-51.5],[4.5,-52.5],[3.8,-54.0],[2.0,-55.5],[1.2,-57.0],
  [2.5,-58.5],[3.0,-59.5],[4.0,-60.0],[3.5,-61.5],[2.0,-63.5],
  [1.0,-66.5],[-0.5,-69.0],[-2.0,-70.5],[-4.3,-70.8],[-7.0,-73.0],
  [-9.0,-72.5],[-11.0,-70.3],[-13.0,-69.5],[-14.5,-68.5],[-16.5,-69.0],
  [-18.0,-68.0],[-19.0,-65.5],[-21.5,-65.0],[-22.0,-63.0],[-21.8,-60.0],
  [-20.0,-58.0],[-19.5,-57.0],[-18.0,-57.5],[-17.0,-57.5],[-16.5,-58.0],
  [-14.5,-60.0],[-13.0,-62.0],[-11.0,-64.0],[-9.5,-65.5],[-7.5,-64.5],
  [-6.0,-60.0],[-4.5,-56.0],[-3.0,-54.5],[-1.5,-52.0],[-0.5,-50.5],
  [-1.0,-48.5],[-2.5,-44.5],[-3.5,-39.0],[-4.3,-36.5],[-6.5,-35.0],
  [-8.5,-35.0],[-10.0,-37.0],[-11.0,-37.5],[-13.5,-39.0],[-15.0,-39.0],
  [-16.5,-39.2],[-18.5,-39.5],[-19.5,-39.7],[-20.5,-40.3],[-21.0,-41.0],
  [-22.9,-43.2],[-23.5,-46.6],[-24.0,-46.5],[-25.5,-48.5],[-28.0,-48.7],
  [-30.0,-51.2],[-31.5,-51.0],[-33.0,-52.5],[-33.8,-53.5],[-33.5,-57.0],
  [-32.0,-58.0],[-30.5,-57.5],[-29.0,-56.0],[-28.0,-55.0],[-27.0,-54.0],
  [-25.0,-53.5],[-24.0,-54.5],[-23.5,-55.5],[-22.0,-57.5],[-20.5,-58.0],
  [-19.5,-57.0],[-18.0,-57.5],[-16.5,-58.0],[-15.5,-60.5],[-13.5,-61.0],
  [-12.0,-60.5],[-10.5,-61.5],[-9.0,-65.0],[-8.0,-67.0],[-7.0,-70.0],
  [-5.0,-35.0],
];

export function BrazilMapGlobe({
  width = 500,
  height = 560,
  dotColor = "rgba(100,180,255,ALPHA)",
  arcColor = "rgba(100,200,255,0.4)",
  markerColor = "rgba(100,220,255,1)",
  pulseColor = "rgba(237,81,69,1)",
  autoAnimateSpeed = 0.012,
  connections = DEFAULT_CONNECTIONS,
  markers = DEFAULT_MARKERS,
  className = "",
}) {
  const canvasRef = useRef(null);
  const animRef   = useRef(0);
  const timeRef   = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth  || width;
    const h = canvas.clientHeight || height;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    timeRef.current += autoAnimateSpeed;
    const time = timeRef.current;

    // Glow de fundo
    const glow = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w * 0.6);
    glow.addColorStop(0, "rgba(60,140,255,0.04)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // --- Contorno do Brasil ---
    ctx.beginPath();
    BRAZIL_OUTLINE.forEach(([lat, lng], i) => {
      const [px, py] = latLngToCanvas(lat, lng, w, h);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.strokeStyle = "rgba(100,180,255,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // fill suave
    ctx.fillStyle = "rgba(60,120,220,0.04)";
    ctx.fill();

    // --- Grid de pontos dentro do bbox ---
    const step = 18;
    for (let lat = BR_LAT_MIN; lat <= BR_LAT_MAX; lat += step * 0.09) {
      for (let lng = BR_LNG_MIN; lng <= BR_LNG_MAX; lng += step * 0.12) {
        const [px, py] = latLngToCanvas(lat, lng, w, h);
        // Só desenha se o ponto está dentro do canvas
        if (px < 0 || py < 0 || px > w || py > h) continue;
        const alpha = 0.12 + Math.random() * 0.08;
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = dotColor.replace("ALPHA", alpha.toFixed(2));
        ctx.fill();
      }
    }

    // --- Arcos de conexão ---
    connections.forEach((conn, i) => {
      const [sx, sy] = latLngToCanvas(conn.from[0], conn.from[1], w, h);
      const [ex, ey] = latLngToCanvas(conn.to[0],   conn.to[1],   w, h);
      // Ponto de controle elevado (arco parabólico)
      const cpx = (sx + ex) / 2;
      const cpy = Math.min(sy, ey) - 40 - Math.abs(ex - sx) * 0.2;

      // Linha do arco
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);
      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ponto viajante ao longo do arco
      const t = (Math.sin(time * 1.1 + i * 0.7) + 1) / 2;
      const tx = (1-t)*(1-t)*sx + 2*(1-t)*t*cpx + t*t*ex;
      const ty = (1-t)*(1-t)*sy + 2*(1-t)*t*cpy + t*t*ey;
      ctx.beginPath();
      ctx.arc(tx, ty, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = markerColor;
      ctx.fill();
    });

    // --- Marcadores de cidades ---
    markers.forEach((m, i) => {
      const [px, py] = latLngToCanvas(m.lat, m.lng, w, h);
      const pulse = (Math.sin(time * 1.8 + i * 0.9) + 1) / 2;

      // Anel pulsante (ember-glow para cidades principais)
      const isMain = i < 5;
      const ringColor = isMain ? pulseColor : markerColor;

      ctx.beginPath();
      ctx.arc(px, py, 5 + pulse * 6, 0, Math.PI * 2);
      ctx.strokeStyle = ringColor.replace("1)", `${0.15 + pulse * 0.2})`);
      ctx.lineWidth = 1;
      ctx.stroke();

      // Ponto central
      ctx.beginPath();
      ctx.arc(px, py, isMain ? 3.5 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isMain ? pulseColor : markerColor;
      ctx.fill();

      // Label da cidade
      if (m.label) {
        ctx.font = `bold ${isMain ? 10 : 9}px 'Space Grotesk', system-ui, sans-serif`;
        ctx.fillStyle = isMain
          ? "rgba(237,81,69,0.85)"
          : "rgba(100,220,255,0.65)";
        ctx.fillText(m.label, px + 8, py + 3);
      }
    });

    // --- Label de conversões animado ---
    const convCount = Math.floor(180 + Math.sin(time * 0.3) * 20);
    ctx.font = "bold 11px 'Space Grotesk', system-ui, sans-serif";
    ctx.fillStyle = "rgba(100,220,255,0.4)";
    ctx.fillText(`${convCount} buscas ativas`, w - 120, h - 12);

    animRef.current = requestAnimationFrame(draw);
  }, [dotColor, arcColor, markerColor, pulseColor, autoAnimateSpeed, connections, markers, width, height]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`cursor-default select-none ${className}`}
      style={{ width, height, display: "block" }}
    />
  );
}
