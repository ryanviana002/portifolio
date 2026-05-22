"use client";

import { useRef, useEffect, useCallback } from "react";

// Contorno real do estado de SP — IBGE API resolucao=5, 251 pontos [lat, lng]
const SP_OUTLINE = [[-21.8376,-46.6907],[-21.7662,-46.626],[-21.6755,-46.6216],[-21.6482,-46.5482],[-21.5845,-46.522],[-21.5009,-46.5193],[-21.4427,-46.5579],[-21.4135,-46.6247],[-21.3764,-46.684],[-21.375,-46.7621],[-21.3707,-46.8361],[-21.4196,-46.9491],[-21.3852,-47.0058],[-21.296,-47.0356],[-21.2258,-47.0723],[-21.1443,-47.1268],[-21.0355,-47.1479],[-20.9421,-47.1926],[-20.8089,-47.2228],[-20.7314,-47.1862],[-20.6977,-47.1133],[-20.5947,-47.1228],[-20.5189,-47.1635],[-20.4505,-47.291],[-20.3643,-47.2934],[-20.2586,-47.2474],[-20.1514,-47.289],[-20.0859,-47.3716],[-20.0153,-47.4244],[-19.9842,-47.5207],[-20.0259,-47.5947],[-19.9902,-47.688],[-19.9898,-47.8509],[-20.0984,-47.8751],[-20.0476,-47.9567],[-20.1199,-48.0388],[-20.1038,-48.1677],[-20.0339,-48.247],[-20.1359,-48.2374],[-20.1199,-48.3459],[-20.1388,-48.5092],[-20.1662,-48.6658],[-20.1615,-48.8221],[-20.2854,-48.8859],[-20.4297,-48.8786],[-20.358,-48.9657],[-20.1708,-48.986],[-20.2259,-49.096],[-20.3047,-49.203],[-20.1671,-49.2992],[-20.0069,-49.2625],[-19.9801,-49.3328],[-19.9199,-49.5035],[-19.9319,-49.6344],[-19.9311,-49.8225],[-19.9254,-50.0188],[-19.8672,-50.196],[-19.8646,-50.3528],[-19.7862,-50.4541],[-19.8447,-50.5992],[-19.9302,-50.7354],[-19.9902,-50.8972],[-20.0773,-50.9965],[-20.2352,-51.0589],[-20.3556,-51.3435],[-20.4828,-51.4492],[-20.6357,-51.5883],[-20.8216,-51.633],[-20.9555,-51.6443],[-21.0222,-51.7596],[-21.1305,-51.8655],[-21.2599,-51.8546],[-21.3927,-51.9111],[-21.5166,-52.0004],[-21.5698,-52.1022],[-21.7305,-52.0939],[-21.8621,-52.2067],[-21.9721,-52.319],[-22.1416,-52.4082],[-22.2484,-52.571],[-22.3351,-52.7243],[-22.4932,-52.9986],[-22.6102,-53.1101],[-22.5988,-53.0117],[-22.6086,-52.7643],[-22.5661,-52.5893],[-22.6342,-52.4988],[-22.6354,-52.3004],[-22.672,-52.2136],[-22.5493,-52.1488],[-22.5417,-52.0127],[-22.6312,-51.8656],[-22.6236,-51.7473],[-22.6579,-51.6305],[-22.692,-51.5122],[-22.6649,-51.3849],[-22.6896,-51.2429],[-22.76,-51.1279],[-22.7826,-50.9787],[-22.8314,-50.8424],[-22.9403,-50.8061],[-22.9062,-50.6821],[-22.904,-50.5772],[-22.9369,-50.4827],[-22.9054,-50.3791],[-22.9316,-50.2756],[-22.9464,-50.1649],[-22.9026,-50.0438],[-22.8975,-49.9862],[-22.9826,-49.9401],[-23.054,-49.8992],[-23.0786,-49.8139],[-23.1261,-49.73],[-23.1942,-49.6632],[-23.2818,-49.6271],[-23.3564,-49.6334],[-23.4085,-49.6025],[-23.4582,-49.5981],[-23.5356,-49.6002],[-23.6231,-49.6136],[-23.6879,-49.5635],[-23.7719,-49.5665],[-23.8394,-49.608],[-23.8995,-49.5695],[-23.9364,-49.5094],[-23.9934,-49.4923],[-24.0588,-49.4378],[-24.1144,-49.3708],[-24.2091,-49.3558],[-24.3026,-49.2869],[-24.3539,-49.2139],[-24.4454,-49.2505],[-24.5064,-49.2947],[-24.5903,-49.3145],[-24.6635,-49.312],[-24.6872,-49.206],[-24.6884,-49.1116],[-24.6759,-49.0477],[-24.6647,-48.9889],[-24.674,-48.9123],[-24.675,-48.8108],[-24.6845,-48.7345],[-24.6793,-48.6715],[-24.6805,-48.6282],[-24.746,-48.5019],[-24.8343,-48.5645],[-24.9247,-48.5716],[-25.0033,-48.5981],[-25.1008,-48.5302],[-24.9913,-48.4345],[-25.0367,-48.3241],[-25.0392,-48.2846],[-25.0127,-48.2273],[-25.1065,-48.1948],[-25.2105,-48.1715],[-25.2255,-48.0498],[-25.2972,-48.0968],[-25.1594,-47.9141],[-25.0252,-47.8804],[-24.7579,-47.561],[-24.5722,-47.2297],[-24.468,-47.1095],[-24.3881,-47.0109],[-24.2674,-46.9205],[-24.1125,-46.6507],[-24.0237,-46.3902],[-23.9769,-46.3204],[-24.0324,-46.2847],[-23.9948,-46.1978],[-23.9075,-46.156],[-23.8143,-46.0575],[-23.7654,-45.8983],[-23.7677,-45.7401],[-23.7958,-45.624],[-23.8234,-45.5334],[-23.8232,-45.4167],[-23.7248,-45.397],[-23.6232,-45.4004],[-23.5722,-45.2976],[-23.5487,-45.2306],[-23.5168,-45.1653],[-23.4935,-45.0876],[-23.4487,-45.0361],[-23.4138,-45.0239],[-23.3641,-44.9485],[-23.3629,-44.8765],[-23.3703,-44.7848],[-23.3412,-44.7599],[-23.2811,-44.8237],[-23.2027,-44.8826],[-23.1403,-44.8161],[-23.0488,-44.8022],[-22.9781,-44.7767],[-22.9325,-44.6872],[-22.8903,-44.5989],[-22.8604,-44.5117],[-22.8768,-44.4512],[-22.8584,-44.3812],[-22.829,-44.2676],[-22.7547,-44.2431],[-22.712,-44.1852],[-22.6299,-44.1912],[-22.6033,-44.2651],[-22.6011,-44.3517],[-22.5735,-44.3824],[-22.6114,-44.4802],[-22.6019,-44.5742],[-22.5815,-44.6465],[-22.5215,-44.6882],[-22.4414,-44.7315],[-22.4141,-44.808],[-22.4491,-44.8977],[-22.469,-45.0003],[-22.4831,-45.0911],[-22.5636,-45.2151],[-22.6143,-45.3173],[-22.6517,-45.4105],[-22.5905,-45.4804],[-22.6529,-45.5804],[-22.6191,-45.59],[-22.599,-45.6599],[-22.6102,-45.7367],[-22.6592,-45.7428],[-22.7373,-45.8051],[-22.78,-45.7168],[-22.7929,-45.7549],[-22.8299,-45.8234],[-22.8753,-45.8795],[-22.8467,-45.9393],[-22.8851,-46.0278],[-22.9228,-46.1391],[-22.8652,-46.1922],[-22.8978,-46.295],[-22.8439,-46.3743],[-22.7571,-46.3549],[-22.7071,-46.4573],[-22.6614,-46.4277],[-22.6381,-46.4206],[-22.5579,-46.4146],[-22.5185,-46.4669],[-22.4695,-46.5499],[-22.426,-46.6396],[-22.3376,-46.6975],[-22.2579,-46.7069],[-22.1776,-46.6526],[-22.1079,-46.6326],[-22.0763,-46.7228],[-22.03,-46.6836],[-22.0049,-46.6125],[-21.9111,-46.6738],[-21.8376,-46.6907]];

// Bounding box real do estado de SP
const LAT_MIN = -25.32;
const LAT_MAX = -19.77;
const LNG_MIN = -53.11;
const LNG_MAX = -44.16;

// Cidades com coordenadas reais
const SP_MARKERS = [
  { lat: -23.5505, lng: -46.6333, label: "São Paulo",          main: true  },
  { lat: -22.9056, lng: -47.0608, label: "Campinas",           main: true  },
  { lat: -23.9608, lng: -46.3336, label: "Santos",             main: true  },
  { lat: -23.1794, lng: -45.8869, label: "S.J. Campos",        main: false },
  { lat: -22.3147, lng: -49.0600, label: "Bauru",              main: false },
  { lat: -21.1775, lng: -47.8103, label: "Ribeirão Preto",     main: true  },
  { lat: -22.1256, lng: -51.3889, label: "Pres. Prudente",     main: false },
  { lat: -20.8113, lng: -49.3758, label: "S.J. Rio Preto",     main: false },
  { lat: -22.3369, lng: -49.9444, label: "Marília",            main: false },
  { lat: -22.9053, lng: -48.4442, label: "Botucatu",           main: false },
  { lat: -23.5019, lng: -47.4583, label: "Sorocaba",           main: false },
  { lat: -23.6208, lng: -45.4158, label: "Caraguatatuba",      main: false },
  { lat: -21.7942, lng: -48.1756, label: "Araraquara",         main: false },
  { lat: -22.5642, lng: -47.4014, label: "Limeira",            main: false },
  { lat: -20.5386, lng: -47.4008, label: "Franca",             main: false },
  { lat: -22.7253, lng: -47.6492, label: "Piracicaba",         main: false },
  { lat: -23.0986, lng: -47.2156, label: "Indaiatuba",         main: false },
  { lat: -22.0678, lng: -47.8908, label: "São Carlos",         main: false },
];

const SP_CONNECTIONS = [
  { from: [-23.5505,-46.6333], to: [-22.9056,-47.0608] },
  { from: [-23.5505,-46.6333], to: [-23.9608,-46.3336] },
  { from: [-23.5505,-46.6333], to: [-23.1794,-45.8869] },
  { from: [-23.5505,-46.6333], to: [-23.5019,-47.4583] },
  { from: [-22.9056,-47.0608], to: [-22.5642,-47.4014] },
  { from: [-22.9056,-47.0608], to: [-22.7253,-47.6492] },
  { from: [-22.9056,-47.0608], to: [-23.0986,-47.2156] },
  { from: [-22.9056,-47.0608], to: [-22.3147,-49.0600] },
  { from: [-21.1775,-47.8103], to: [-21.7942,-48.1756] },
  { from: [-21.1775,-47.8103], to: [-20.5386,-47.4008] },
  { from: [-21.1775,-47.8103], to: [-22.0678,-47.8908] },
  { from: [-20.8113,-49.3758], to: [-22.1256,-51.3889] },
  { from: [-22.9053,-48.4442], to: [-22.3147,-49.0600] },
  { from: [-22.3369,-49.9444], to: [-22.1256,-51.3889] },
];

function toCanvas(lat, lng, w, h, pad = 28) {
  const px = pad + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * (w - pad * 2);
  const py = pad + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (h - pad * 2);
  return [px, py];
}

export function SPMap({
  width       = 520,
  height      = 460,
  arcColor    = "rgba(100,200,255,0.3)",
  markerColor = "rgba(100,220,255,1)",
  pulseColor  = "rgba(237,81,69,1)",
  speed       = 0.013,
  markers     = SP_MARKERS,
  connections = SP_CONNECTIONS,
  className   = "",
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
    const w   = canvas.clientWidth  || width;
    const h   = canvas.clientHeight || height;
    canvas.width  = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    timeRef.current += speed;
    const t = timeRef.current;

    // Glow sutil de fundo
    const glow = ctx.createRadialGradient(w * 0.45, h * 0.5, 10, w * 0.45, h * 0.5, w * 0.65);
    glow.addColorStop(0, "rgba(60,140,255,0.06)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // Contorno real do estado de SP — clip para não vazar dots para fora
    ctx.save();
    ctx.beginPath();
    SP_OUTLINE.forEach(([lat, lng], i) => {
      const [px, py] = toCanvas(lat, lng, w, h);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();

    // Fill suave interno
    ctx.fillStyle = "rgba(40,100,200,0.07)";
    ctx.fill();

    // Clip: dots só dentro do estado
    ctx.clip();

    // Grid de pontos internos
    for (let lat = LAT_MIN; lat <= LAT_MAX; lat += 0.28) {
      for (let lng = LNG_MIN; lng <= LNG_MAX; lng += 0.36) {
        const [px, py] = toCanvas(lat, lng, w, h);
        ctx.beginPath();
        ctx.arc(px, py, 0.85, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(100,180,255,0.13)";
        ctx.fill();
      }
    }
    ctx.restore();

    // Contorno por cima dos dots
    ctx.beginPath();
    SP_OUTLINE.forEach(([lat, lng], i) => {
      const [px, py] = toCanvas(lat, lng, w, h);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    });
    ctx.closePath();
    ctx.strokeStyle = "rgba(100,180,255,0.4)";
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    // Arcos de conexão com ponto viajante
    connections.forEach((conn, i) => {
      const [sx, sy] = toCanvas(conn.from[0], conn.from[1], w, h);
      const [ex, ey] = toCanvas(conn.to[0],   conn.to[1],   w, h);
      const cpx = (sx + ex) / 2;
      const cpy = Math.min(sy, ey) - 18 - Math.abs(ex - sx) * 0.12;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.quadraticCurveTo(cpx, cpy, ex, ey);
      ctx.strokeStyle = arcColor;
      ctx.lineWidth   = 0.9;
      ctx.stroke();

      // Ponto viajante
      const tp = (Math.sin(t * 1.1 + i * 0.75) + 1) / 2;
      const tx = (1-tp)*(1-tp)*sx + 2*(1-tp)*tp*cpx + tp*tp*ex;
      const ty = (1-tp)*(1-tp)*sy + 2*(1-tp)*tp*cpy + tp*tp*ey;
      ctx.beginPath();
      ctx.arc(tx, ty, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = markerColor;
      ctx.fill();
    });

    // Marcadores de cidades
    markers.forEach((m, i) => {
      const [px, py] = toCanvas(m.lat, m.lng, w, h);
      const pulse    = (Math.sin(t * 1.8 + i * 0.85) + 1) / 2;
      const color    = m.main ? pulseColor : markerColor;

      // Anel pulsante externo
      ctx.beginPath();
      ctx.arc(px, py, (m.main ? 7 : 4) + pulse * 5, 0, Math.PI * 2);
      ctx.strokeStyle = color.replace("1)", `${0.1 + pulse * 0.15})`);
      ctx.lineWidth   = 1;
      ctx.stroke();

      // Ponto central
      ctx.beginPath();
      ctx.arc(px, py, m.main ? 3.5 : 2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      // Label
      if (m.label) {
        ctx.font      = `${m.main ? "bold 10px" : "9px"} 'Space Grotesk', system-ui, sans-serif`;
        ctx.fillStyle = m.main
          ? "rgba(237,81,69,0.9)"
          : "rgba(100,220,255,0.65)";
        ctx.fillText(m.label, px + 7, py + 3);
      }
    });

    animRef.current = requestAnimationFrame(draw);
  }, [arcColor, markerColor, pulseColor, speed, markers, connections, width, height]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      className={`select-none ${className}`}
      style={{ width, height, display: "block" }}
    />
  );
}
