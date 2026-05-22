"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SPMap } from "./sp-map.jsx";
import { RDC_PLANS } from "./pricing-card.jsx";

gsap.registerPlugin(ScrollTrigger);

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.05; mix-blend-mode: overlay;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .ch-bg-grid {
    background-size: 60px 60px;
    background-image:
      linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .text-3d-matte {
    color: #efece6;
    text-shadow:
      0 10px 30px rgba(239,236,230,0.2),
      0 2px 4px rgba(239,236,230,0.1);
  }

  .text-silver-matte {
    background: linear-gradient(180deg, #efece6 0%, rgba(239,236,230,0.4) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 10px 20px rgba(239,236,230,0.15))
      drop-shadow(0px 2px 4px rgba(239,236,230,0.10));
  }

  .text-card-silver-matte {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter:
      drop-shadow(0px 12px 24px rgba(0,0,0,0.8))
      drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  .premium-depth-card {
    background: linear-gradient(145deg, #162C6D 0%, #0A101D 100%);
    box-shadow:
      0 40px 100px -20px rgba(0,0,0,0.9),
      0 20px 40px -20px rgba(0,0,0,0.8),
      inset 0 1px 2px rgba(255,255,255,0.2),
      inset 0 -2px 4px rgba(0,0,0,0.8);
    border: 1px solid rgba(255,255,255,0.04);
    position: relative;
  }

  .card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .iphone-bezel {
    background-color: #111;
    box-shadow:
      inset 0 0 0 2px #52525B,
      inset 0 0 0 7px #000,
      0 40px 80px -15px rgba(0,0,0,0.9),
      0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }

  .hardware-btn {
    background: linear-gradient(90deg, #404040 0%, #171717 100%);
    box-shadow:
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(255,255,255,0.15),
      inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(255,255,255,0.05);
  }

  .screen-glare {
    background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    box-shadow:
      0 10px 20px rgba(0,0,0,0.3),
      inset 0 1px 1px rgba(255,255,255,0.05),
      inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.03);
  }

  .floating-ui-badge {
    background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 100%);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.1),
      0 25px 50px -12px rgba(0,0,0,0.8),
      inset 0 1px 1px rgba(255,255,255,0.2),
      inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .btn-ch-light, .btn-ch-dark {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-ch-light {
    background: linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%);
    color: #0F172A;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-ch-light:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,1), inset 0 -3px 6px rgba(0,0,0,0.06);
  }
  .btn-ch-light:active {
    transform: translateY(1px);
    background: linear-gradient(180deg, #F1F5F9 0%, #E2E8F0 100%);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.1), inset 0 3px 6px rgba(0,0,0,0.1);
  }
  .btn-ch-dark {
    background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
    color: #FFFFFF;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-ch-dark:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-ch-dark:active {
    transform: translateY(1px);
    background: #18181B;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.05), inset 0 3px 8px rgba(0,0,0,0.9);
  }

  .progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: 402;
    stroke-dashoffset: 402;
    stroke-linecap: round;
  }
`;

export function CinematicHero({
  brandName = "RDCreator",
  tagline1 = "Seu concorrente já aparece",
  tagline2 = "antes de você no Google.",
  cardHeading = "Presença digital, redefinida.",
  cardDescription = (
    <>
      <span style={{ color: '#fff', fontWeight: 600 }}>RDCreator</span> acelera a visibilidade de negócios automotivos com SEO local, Google Meu Negócio e tráfego pago de alta precisão.
    </>
  ),
  metricValue = 332,
  metricLabel = "% Crescimento",
  ctaHeading = "Domine o Google local.",
  ctaDescription = "Diagnóstico gratuito da sua presença digital. Descubra exatamente onde você está perdendo clientes.",
  onCtaClick,
}) {
  const containerRef = useRef(null);
  const mainCardRef = useRef(null);
  const mockupRef = useRef(null);
  const requestRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(mockupRef.current, { rotationY: xVal * 12, rotationX: -yVal * 12, ease: "power3.out", duration: 1.2 });
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => { window.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(requestRef.current); };
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });
      gsap.set(".map-scene", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });
      gsap.set([".map-left", ".map-right"], { autoAlpha: 0 });
      gsap.set(".map-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set(".plans-scene", { autoAlpha: 0, scale: 0.9, filter: "blur(30px)" });
      gsap.set(".plans-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".plan-card-item", ".plans-header", ".gmn-card"], { autoAlpha: 0, y: 50 });


      gsap.timeline({ delay: 0.3 })
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=17000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".hero-text-wrapper", ".ch-bg-grid"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .to(".main-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut", duration: 1.8,
        }, "pullback")
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 })

        // ── Cena 2: Mapa de SP ──────────────────────────────
        // Card do mapa sobe do fundo
        .to(".map-card", { y: 0, ease: "power3.inOut", duration: 2 })
        .to(".map-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 }, "-=0.8")
        .to(".map-scene", { autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "expo.out", duration: 1.5 }, "-=1.0")
        .fromTo(".map-left",  { x: -60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.2")
        .fromTo(".map-right", { x:  60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "<")
        .to({}, { duration: 3 })
        .to(".map-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut", duration: 1.8,
        }, "pullback2")
        .to(".map-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 })

        // ── Cena 3: Planos ──────────────────────────────────
        .to(".plans-card", { y: 0, ease: "power3.inOut", duration: 2 })
        .to(".plans-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 }, "-=0.8")
        .to(".plans-scene", { autoAlpha: 1, scale: 1, filter: "blur(0px)", ease: "expo.out", duration: 1.2 }, "-=1.0")
        .to(".plans-header", { autoAlpha: 1, y: 0, ease: "power4.out", duration: 1.2 }, "-=0.8")
        .to(".plan-card-item", { autoAlpha: 1, y: 0, ease: "back.out(1.2)", duration: 1.2, stagger: 0.15 }, "-=0.6")
        .to(".gmn-card", { autoAlpha: 1, y: 0, ease: "power4.out", duration: 1.2 }, "-=0.4")
        .to({}, { duration: 3.5 })
        .to(".plans-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut", duration: 1.8,
        }, "pullback3")
        .to(".plans-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      style={{ perspective: "1500px", background: "#0a0a12" }}
      className="relative w-screen h-screen overflow-hidden flex items-center justify-center"
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div className="ch-bg-grid absolute inset-0 z-0 pointer-events-none" style={{ opacity: 0.5 }} aria-hidden="true" />

      {/* Hero Text */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4">
        <h1 className="text-track gsap-reveal text-3d-matte text-5xl md:text-7xl font-bold tracking-tight mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {tagline1}
        </h1>
        <h1 className="text-days gsap-reveal text-silver-matte text-5xl md:text-7xl font-extrabold tracking-tighter" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {tagline2}
        </h1>
      </div>

      {/* CTA final */}
      <div className="cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 pointer-events-auto">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-silver-matte" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          {ctaHeading}
        </h2>
        <p style={{ color: 'rgba(191,188,183,0.8)', fontFamily: 'Space Grotesk, sans-serif' }} className="text-lg md:text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed">
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a
            href={`https://wa.me/5519994175385?text=${encodeURIComponent('Olá Ryan! Quero o diagnóstico gratuito da minha presença digital.')}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ch-light flex items-center justify-center gap-3 px-8 py-4 rounded-2xl"
            onClick={onCtaClick}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Diagnóstico Gratuito
          </a>
          <a
            href="#planos"
            className="btn-ch-dark flex items-center justify-center gap-3 px-8 py-4 rounded-2xl"
          >
            Ver Planos
          </a>
        </div>
      </div>

      {/* Card principal */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto"
          style={{ width: '92vw', height: '92vh', borderRadius: '32px' }}
        >
          <div className="card-sheen" aria-hidden="true" />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* Brand name */}
            <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter text-card-silver-matte" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {brandName}
              </h2>
            </div>

            {/* Mockup do phone */}
            <div className="mockup-scroll-wrapper order-2 relative w-full flex items-center justify-center z-10" style={{ height: '380px', perspective: '1000px' }}>
              <div className="relative w-full h-full flex items-center justify-center" style={{ transform: 'scale(0.75)' }}>
                <div ref={mockupRef} className="relative iphone-bezel flex flex-col" style={{ width: '280px', height: '580px', borderRadius: '3rem' }}>
                  {/* Botões físicos */}
                  <div className="absolute hardware-btn rounded-l-md" style={{ top: '120px', left: '-3px', width: '3px', height: '25px' }} aria-hidden="true" />
                  <div className="absolute hardware-btn rounded-l-md" style={{ top: '160px', left: '-3px', width: '3px', height: '45px' }} aria-hidden="true" />
                  <div className="absolute hardware-btn rounded-l-md" style={{ top: '220px', left: '-3px', width: '3px', height: '45px' }} aria-hidden="true" />
                  <div className="absolute hardware-btn rounded-r-md" style={{ top: '170px', right: '-3px', width: '3px', height: '70px', transform: 'scaleX(-1)' }} aria-hidden="true" />

                  {/* Tela */}
                  <div className="absolute overflow-hidden" style={{ inset: '7px', background: '#050914', borderRadius: '2.5rem', boxShadow: 'inset 0 0 15px rgba(0,0,0,1)', color: 'white', zIndex: 10 }}>
                    <div className="absolute inset-0 screen-glare pointer-events-none" style={{ zIndex: 40 }} aria-hidden="true" />
                    {/* Dynamic Island */}
                    <div className="absolute flex items-center justify-end px-3" style={{ top: '5px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '28px', background: '#000', borderRadius: '9999px', zIndex: 50 }}>
                      <div className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '9999px', background: '#22c55e', boxShadow: '0 0 8px rgba(34,197,94,0.8)' }} />
                    </div>

                    <div className="relative w-full h-full flex flex-col" style={{ paddingTop: '48px', paddingLeft: '20px', paddingRight: '20px', paddingBottom: '32px' }}>
                      <div className="phone-widget flex justify-between items-center" style={{ marginBottom: '32px' }}>
                        <div className="flex flex-col">
                          <span style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '4px' }}>Hoje</span>
                          <span style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Presença</span>
                        </div>
                        <div style={{ width: '36px', height: '36px', borderRadius: '9999px', background: 'rgba(255,255,255,0.05)', color: '#e4e4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>RD</div>
                      </div>

                      {/* Círculo de progresso */}
                      <div className="phone-widget relative flex items-center justify-center" style={{ width: '176px', height: '176px', margin: '0 auto 32px' }}>
                        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                          <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                          <circle className="progress-ring" cx="88" cy="88" r="64" fill="none" stroke="#3B82F6" strokeWidth="12" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="counter-val" style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-0.04em', color: '#fff' }}>0</span>
                          <span style={{ fontSize: '8px', color: 'rgba(147,197,253,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginTop: '2px' }}>{metricLabel}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div className="phone-widget widget-depth" style={{ borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(37,99,235,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', border: '1px solid rgba(96,165,250,0.2)' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ height: '8px', width: '80px', background: '#d4d4d8', borderRadius: '9999px', marginBottom: '8px' }} />
                            <div style={{ height: '6px', width: '48px', background: '#52525b', borderRadius: '9999px' }} />
                          </div>
                        </div>
                        <div className="phone-widget widget-depth" style={{ borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', border: '1px solid rgba(52,211,153,0.2)' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#34d399' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ height: '8px', width: '64px', background: '#d4d4d8', borderRadius: '9999px', marginBottom: '8px' }} />
                            <div style={{ height: '6px', width: '96px', background: '#52525b', borderRadius: '9999px' }} />
                          </div>
                        </div>
                      </div>

                      <div style={{ position: 'absolute', bottom: '8px', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '9999px' }} />
                    </div>
                  </div>
                </div>

                {/* Badges flutuantes */}
                <div className="floating-badge absolute flex floating-ui-badge items-center gap-3" style={{ top: '24px', left: '-15px', borderRadius: '12px', padding: '12px', zIndex: 30 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: 'linear-gradient(180deg, rgba(59,130,246,0.2), rgba(30,58,138,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(96,165,250,0.3)' }}>
                    <span aria-hidden="true">📍</span>
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '-0.01em' }}>Top 3 Google Maps</p>
                    <p style={{ color: 'rgba(147,197,253,0.5)', fontSize: '10px', fontWeight: 500 }}>Posição conquistada</p>
                  </div>
                </div>

                <div className="floating-badge absolute flex floating-ui-badge items-center gap-3" style={{ bottom: '48px', right: '-15px', borderRadius: '12px', padding: '12px', zIndex: 30 }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '9999px', background: 'linear-gradient(180deg, rgba(99,102,241,0.2), rgba(67,56,202,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(129,140,248,0.3)' }}>
                    <span aria-hidden="true">📈</span>
                  </div>
                  <div>
                    <p style={{ color: '#fff', fontSize: '12px', fontWeight: 700, letterSpacing: '-0.01em' }}>+180 leads/mês</p>
                    <p style={{ color: 'rgba(147,197,253,0.5)', fontSize: '10px', fontWeight: 500 }}>Meta ultrapassada</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Texto esquerdo */}
            <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full px-4 lg:px-0">
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-bold mb-0 lg:mb-5 tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {cardHeading}
              </h3>
              <p className="hidden md:block text-base lg:text-lg font-normal leading-relaxed" style={{ color: 'rgba(147,197,253,0.7)', fontFamily: 'Space Grotesk, sans-serif' }}>
                {cardDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── CENA 4: Stats ─────────────────────────────────── */}
      <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div className="stats-card premium-depth-card relative overflow-hidden flex items-center justify-center pointer-events-auto"
          style={{ width: '92vw', height: '92vh', borderRadius: '32px' }}>
          <div className="card-sheen" aria-hidden="true" />
          <div className="stats-scene relative w-full h-full flex flex-col items-center justify-center px-6 py-10 z-10">
            <div className="stats-scene-header text-center mb-12">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', padding:'4px 14px', fontSize:'10px', letterSpacing:'0.15em', color:'rgba(100,220,255,0.8)', marginBottom:'16px', textTransform:'uppercase', fontFamily:'Space Grotesk, sans-serif' }}>
                Resultados Reais
              </div>
              <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(28px,4vw,52px)', fontWeight:800, letterSpacing:'-0.03em', color:'#efece6', lineHeight:1.1 }}>
                Números que<br/><span style={{ background:'linear-gradient(90deg,#abc7ff,#00D1FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>falam por si</span>
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'20px', width:'100%', maxWidth:'860px' }}>
              {[
                { num:'29+', label:'Clientes Ativos', color:'#abc7ff', icon:'🏆' },
                { num:'97%', label:'Taxa de Retenção', color:'#00D1FF', icon:'🔒' },
                { num:'332%', label:'Crescimento Médio', color:'#FF1F44', icon:'📈' },
                { num:'24/7', label:'Monitoramento', color:'#a6e6ff', icon:'🛡️' },
              ].map(({ num, label, color, icon }) => (
                <div key={label} className="stat-scene-item" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'36px 24px', textAlign:'center', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,rgba(255,255,255,0.04) 0%,transparent 60%)', pointerEvents:'none' }} />
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>{icon}</div>
                  <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(36px,5vw,56px)', fontWeight:800, letterSpacing:'-0.04em', color, lineHeight:1, marginBottom:'8px' }}>{num}</div>
                  <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', color:'rgba(191,188,183,0.55)', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CENA 5: Problemas ─────────────────────────────── */}
      <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div className="prob-card premium-depth-card relative overflow-hidden flex items-center justify-center pointer-events-auto"
          style={{ width: '92vw', height: '92vh', borderRadius: '32px' }}>
          <div className="card-sheen" aria-hidden="true" />
          <div className="prob-scene relative w-full h-full flex flex-col items-center justify-center px-6 py-10 z-10">
            <div className="prob-scene-header text-center mb-10">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', padding:'4px 14px', fontSize:'10px', letterSpacing:'0.15em', color:'rgba(100,220,255,0.8)', marginBottom:'16px', textTransform:'uppercase', fontFamily:'Space Grotesk, sans-serif' }}>
                Diagnóstico
              </div>
              <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(24px,3.5vw,48px)', fontWeight:800, letterSpacing:'-0.03em', color:'#efece6', lineHeight:1.1, marginBottom:'8px' }}>
                Onde sua loja está<br/><span style={{ background:'linear-gradient(90deg,#abc7ff,#00D1FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>perdendo tração?</span>
              </h2>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'15px', color:'rgba(191,188,183,0.55)', maxWidth:'480px', margin:'0 auto', lineHeight:1.6 }}>
                Identificamos os gargalos técnicos que impedem seu negócio de dominar o mercado local.
              </p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'16px', width:'100%', maxWidth:'920px' }}>
              {[
                { icon:'👁️', title:'Invisibilidade', color:'rgba(171,199,255,0.1)', accent:'#abc7ff', desc:'Sua loja não aparece para quem está buscando agora na sua região.' },
                { icon:'⚡', title:'Lentidão Digital', color:'rgba(0,209,255,0.08)', accent:'#00D1FF', desc:'Site lento que faz leads qualificados desistirem antes de carregar.' },
                { icon:'🚫', title:'Falta de Leads', color:'rgba(255,31,68,0.08)', accent:'#FF1F44', desc:'Equipe comercial parada por falta de contatos vindos do digital.' },
                { icon:'📊', title:'Métricas Cegas', color:'rgba(166,230,255,0.08)', accent:'#a6e6ff', desc:'Você investe mas não sabe qual canal traz o melhor retorno.' },
              ].map(({ icon, title, color, accent, desc }) => (
                <div key={title} className="prob-scene-item" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'28px 24px', position:'relative', overflow:'hidden' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'14px', background:color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', marginBottom:'16px' }}>{icon}</div>
                  <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'17px', fontWeight:800, color:'#efece6', marginBottom:'8px' }}>{title}</h3>
                  <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', color:'rgba(191,188,183,0.6)', lineHeight:1.65 }}>{desc}</p>
                  <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg,${accent},transparent)` }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CENA 6: Serviços ──────────────────────────────── */}
      <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div className="srv-card premium-depth-card relative overflow-hidden flex items-center justify-center pointer-events-auto"
          style={{ width: '92vw', height: '92vh', borderRadius: '32px' }}>
          <div className="card-sheen" aria-hidden="true" />
          <div className="srv-scene relative w-full h-full flex flex-col items-center justify-center px-6 py-10 z-10">
            <div className="srv-scene-header text-center mb-10">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', padding:'4px 14px', fontSize:'10px', letterSpacing:'0.15em', color:'rgba(100,220,255,0.8)', marginBottom:'16px', textTransform:'uppercase', fontFamily:'Space Grotesk, sans-serif' }}>
                Nossa Engenharia
              </div>
              <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(24px,3.5vw,48px)', fontWeight:800, letterSpacing:'-0.03em', color:'#efece6', lineHeight:1.1 }}>
                Soluções que<br/><span style={{ background:'linear-gradient(90deg,#abc7ff,#00D1FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>geram resultado real</span>
              </h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'16px', width:'100%', maxWidth:'900px' }}>
              {[
                { icon:'🌐', title:'Site Profissional Automotivo', accent:'#abc7ff', desc:'Estruturas otimizadas para mobile-first, carregamento instantâneo e focadas em converter visitantes em clientes presenciais.', tags:['Mobile First','SEO Técnico'] },
                { icon:'📍', title:'GMN & SEO Local', accent:'#00D1FF', desc:'Apareça no topo quando o cliente buscar "oficina perto de mim" ou "auto elétrica em [sua cidade]".', tags:['Google Maps','Palavras-chave local'] },
                { icon:'🎯', title:'Tráfego Pago', accent:'#FF1F44', desc:'Campanhas agressivas no Google Ads e Meta Ads para leads quentes com intenção de compra.', tags:['Google Ads','Meta Ads'] },
              ].map(({ icon, title, accent, desc, tags }) => (
                <div key={title} className="srv-scene-item" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'20px', padding:'32px 24px', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg,transparent,${accent},transparent)` }} />
                  <div style={{ fontSize:'32px', marginBottom:'16px' }}>{icon}</div>
                  <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'18px', fontWeight:800, color:'#efece6', marginBottom:'10px', lineHeight:1.2 }}>{title}</h3>
                  <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', color:'rgba(191,188,183,0.6)', lineHeight:1.65, marginBottom:'16px' }}>{desc}</p>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {tags.map(t => (
                      <span key={t} style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', fontWeight:700, padding:'4px 10px', borderRadius:'9999px', background:`rgba(${accent === '#abc7ff' ? '171,199,255' : accent === '#00D1FF' ? '0,209,255' : '255,31,68'},0.08)`, border:`1px solid rgba(${accent === '#abc7ff' ? '171,199,255' : accent === '#00D1FF' ? '0,209,255' : '255,31,68'},0.2)`, color:accent }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CENA 7: Tráfego Pago ──────────────────────────── */}
      <div className="absolute inset-0 z-[70] flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div className="traf-card premium-depth-card relative overflow-hidden flex items-center justify-center pointer-events-auto"
          style={{ width: '92vw', height: '92vh', borderRadius: '32px' }}>
          <div className="card-sheen" aria-hidden="true" />
          <div className="traf-scene relative w-full h-full flex items-center justify-center z-10">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'60px', alignItems:'center', width:'100%', maxWidth:'1000px', padding:'0 40px' }}>

              {/* Esquerda — copy */}
              <div className="traf-left">
                <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', padding:'4px 14px', fontSize:'10px', letterSpacing:'0.15em', color:'rgba(100,220,255,0.8)', marginBottom:'20px', textTransform:'uppercase', fontFamily:'Space Grotesk, sans-serif' }}>
                  Tráfego Pago
                </div>
                <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(24px,3vw,42px)', fontWeight:800, letterSpacing:'-0.03em', color:'#efece6', lineHeight:1.1, marginBottom:'16px' }}>
                  Leads chegando<br/><span style={{ background:'linear-gradient(90deg,#abc7ff,#00D1FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>enquanto você dorme</span>
                </h2>
                <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'14px', color:'rgba(191,188,183,0.6)', lineHeight:1.65, marginBottom:'28px' }}>
                  Campanhas cirúrgicas no Google Ads e Meta Ads calibradas para o mercado automotivo. Cada real investido com precisão máxima.
                </p>
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  {[
                    { icon:'🎯', title:'Google Ads & Meta Ads', sub:'Campanhas de performance e remarketing', color:'#abc7ff' },
                    { icon:'⚡', title:'Segmentação Cirúrgica', sub:'Público quente por intenção de compra', color:'#00D1FF' },
                    { icon:'📊', title:'Relatório Quinzenal', sub:'Dados reais, sem achismos', color:'#22c55e' },
                  ].map(({ icon, title, sub, color }) => (
                    <div key={title} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'14px' }}>
                      <span style={{ fontSize:'20px' }}>{icon}</span>
                      <div>
                        <div style={{ fontFamily:'Space Grotesk, sans-serif', fontWeight:700, fontSize:'13px', color:'#efece6' }}>{title}</div>
                        <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', color:'rgba(191,188,183,0.45)', marginTop:'2px' }}>{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direita — dashboard mockup */}
              <div className="traf-right">
                <div style={{ background:'rgba(15,14,15,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 40px 80px rgba(0,0,0,0.6)' }}>
                  {/* Barra do topo */}
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
                    {['#ff5f57','#febc2e','#28c840'].map(c => <div key={c} style={{ width:'10px', height:'10px', borderRadius:'9999px', background:c }} />)}
                    <span style={{ fontFamily:'monospace', fontSize:'11px', color:'rgba(191,188,183,0.4)', marginLeft:'8px' }}>RDCreator · Dashboard</span>
                  </div>
                  {/* Métricas */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    {[
                      { val:'1.240', label:'Cliques', color:'#abc7ff' },
                      { val:'183', label:'Leads', color:'#22c55e' },
                      { val:'8.4x', label:'ROAS', color:'#00D1FF' },
                    ].map(({ val, label, color }) => (
                      <div key={label} style={{ padding:'16px', borderRight:'1px solid rgba(255,255,255,0.05)', textAlign:'center' }}>
                        <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'22px', fontWeight:800, letterSpacing:'-0.03em', color }}>{val}</div>
                        <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'9px', color:'rgba(191,188,183,0.4)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'4px' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Gráfico de barras */}
                  <div style={{ padding:'16px 20px' }}>
                    <div style={{ fontSize:'10px', color:'rgba(191,188,183,0.35)', fontFamily:'Space Grotesk, sans-serif', marginBottom:'10px', textTransform:'uppercase', letterSpacing:'0.1em' }}>Leads esta semana</div>
                    <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'80px' }}>
                      {[40,55,48,70,62,85,95].map((h, i) => (
                        <div key={i} style={{ flex:1, borderRadius:'4px 4px 0 0', background: i >= 5 ? 'linear-gradient(180deg,#00D1FF,rgba(0,209,255,0.3))' : 'rgba(171,199,255,0.15)', height:`${h}%` }} />
                      ))}
                    </div>
                  </div>
                  {/* KPIs */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', padding:'0 16px 16px' }}>
                    {[
                      { k:'Custo/Lead', v:'R$4,20' },
                      { k:'Crescimento', v:'+332%' },
                      { k:'Retenção', v:'97%' },
                    ].map(({ k, v }) => (
                      <div key={k} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'10px' }}>
                        <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'14px', fontWeight:800, color:'#efece6', letterSpacing:'-0.02em' }}>{v}</div>
                        <div style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'9px', color:'rgba(191,188,183,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:'2px' }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CENA 3: Planos ────────────────────────────────── */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          className="plans-card premium-depth-card relative overflow-hidden flex items-center justify-center pointer-events-auto"
          style={{ width: '92vw', height: '92vh', borderRadius: '32px' }}
        >
          <div className="card-sheen" aria-hidden="true" />
          <div className="plans-scene relative w-full h-full overflow-y-auto z-10 flex flex-col items-center justify-center px-4 py-10 md:py-14" style={{ scrollbarWidth: 'none' }}>

            {/* Header */}
            <div className="plans-header text-center mb-10">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', padding:'4px 14px', fontSize:'10px', letterSpacing:'0.15em', color:'rgba(100,220,255,0.8)', marginBottom:'16px', textTransform:'uppercase', fontFamily:'Space Grotesk, sans-serif' }}>
                Planos e Preços
              </div>
              <h2 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(28px,4vw,52px)', fontWeight:800, letterSpacing:'-0.03em', color:'#efece6', lineHeight:1.1, marginBottom:'8px' }}>
                Nossos Planos
              </h2>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'16px', color:'rgba(191,188,183,0.6)' }}>
                Transforme visitantes em clientes todos os dias.
              </p>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'12px', color:'rgba(191,188,183,0.4)', marginTop:'4px' }}>
                * Pagamento único · Sem mensalidades.
              </p>
            </div>

            {/* Cards dos 3 planos de site */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:'16px', width:'100%', maxWidth:'900px', marginBottom:'20px' }}>
              {RDC_PLANS.filter(p => !p.isMonthly).map((plan, i) => (
                <div key={i} className="plan-card-item" style={{
                  position:'relative', display:'flex', flexDirection:'column',
                  padding:'28px 24px', borderRadius:'20px',
                  border: plan.isFeatured ? '1px solid rgba(171,199,255,0.35)' : '1px solid rgba(255,255,255,0.06)',
                  background: plan.isFeatured
                    ? 'linear-gradient(145deg, rgba(22,44,109,0.6) 0%, rgba(10,16,29,0.85) 100%)'
                    : 'rgba(255,255,255,0.03)',
                  backdropFilter:'blur(12px)',
                  transform: plan.isFeatured ? 'scale(1.04)' : 'scale(1)',
                }}>
                  {plan.isFeatured && (
                    <div style={{ position:'absolute', top:0, left:'50%', transform:'translate(-50%,-50%)', background:'linear-gradient(90deg,#abc7ff,#00D1FF)', borderRadius:'9999px', padding:'3px 14px', fontSize:'9px', fontWeight:800, letterSpacing:'0.12em', textTransform:'uppercase', color:'#0a101d', whiteSpace:'nowrap', fontFamily:'Space Grotesk, sans-serif' }}>
                      Mais Escolhido
                    </div>
                  )}
                  <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'16px', fontWeight:700, color: plan.isFeatured ? '#abc7ff' : '#efece6', marginBottom:'4px' }}>{plan.planName}</h3>
                  <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', color:'rgba(191,188,183,0.5)', marginBottom:'16px' }}>{plan.description}</p>
                  <div style={{ display:'flex', alignItems:'flex-end', gap:'3px', marginBottom:'4px' }}>
                    <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'12px', color:'rgba(191,188,183,0.5)', marginBottom:'6px' }}>R$</span>
                    <span style={{
                      fontFamily:'Space Grotesk, sans-serif', fontSize:'36px', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1,
                      background: plan.isFeatured ? 'linear-gradient(90deg,#abc7ff,#00D1FF)' : 'linear-gradient(180deg,#efece6 0%,rgba(239,236,230,0.6) 100%)',
                      WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
                    }}>{plan.price}</span>
                  </div>
                  <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', color:'rgba(191,188,183,0.35)', marginBottom:'16px' }}>{plan.priceNote}</p>
                  <div style={{ height:'1px', background: plan.isFeatured ? 'rgba(171,199,255,0.1)' : 'rgba(255,255,255,0.05)', marginBottom:'16px' }} />
                  <ul style={{ display:'flex', flexDirection:'column', gap:'8px', flex:1, marginBottom:'20px' }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display:'flex', alignItems:'flex-start', gap:'8px' }}>
                        <svg style={{ width:'13px', height:'13px', flexShrink:0, marginTop:'2px', color: plan.isFeatured ? '#abc7ff' : 'rgba(100,220,255,0.7)' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', color:'rgba(191,188,183,0.75)', lineHeight:1.4 }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/5519994175385?text=${encodeURIComponent(plan.waMessage)}`}
                    target="_blank" rel="noreferrer"
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'center', width:'100%',
                      padding:'11px 16px', borderRadius:'10px', fontFamily:'Space Grotesk, sans-serif',
                      fontSize:'12px', fontWeight:700, textDecoration:'none',
                      ...(plan.isFeatured
                        ? { background:'linear-gradient(135deg,#abc7ff,#00D1FF)', color:'#0a101d' }
                        : { background:'rgba(255,255,255,0.05)', color:'#efece6', border:'1px solid rgba(255,255,255,0.1)' }
                      ),
                    }}
                  >{plan.ctaText}</a>
                </div>
              ))}
            </div>

            {/* Card GMN */}
            <div className="gmn-card" style={{ width:'100%', maxWidth:'680px', padding:'28px 32px', borderRadius:'20px', border:'1px solid rgba(100,220,255,0.2)', background:'linear-gradient(145deg,rgba(0,60,80,0.4) 0%,rgba(10,16,29,0.85) 100%)', backdropFilter:'blur(12px)', textAlign:'center' }}>
              <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(100,220,255,0.08)', border:'1px solid rgba(100,220,255,0.15)', borderRadius:'9999px', padding:'3px 12px', fontSize:'10px', color:'#67e8f9', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'Space Grotesk, sans-serif', marginBottom:'12px' }}>
                Serviço Recorrente
              </div>
              <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(16px,2vw,22px)', fontWeight:700, color:'#efece6', marginBottom:'6px' }}>Gestão Google Meu Negócio</h3>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', color:'rgba(191,188,183,0.55)', marginBottom:'16px' }}>Seu perfil no Google gerenciado para atrair mais clientes locais todo mês.</p>
              <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:'3px', marginBottom:'4px' }}>
                <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'14px', color:'rgba(191,188,183,0.5)', marginBottom:'8px' }}>R$</span>
                <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'48px', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, background:'linear-gradient(90deg,#67e8f9,#00D1FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>349</span>
                <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'15px', color:'rgba(191,188,183,0.4)', marginBottom:'8px' }}>/mês</span>
              </div>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', color:'rgba(191,188,183,0.3)', marginBottom:'20px' }}>Recorrente · Cancele quando quiser</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'8px', marginBottom:'20px', textAlign:'left' }}>
                {['Otimização contínua do perfil','Postagens semanais no GMN','Resposta a avaliações','Relatório mensal de visibilidade','Palavras-chave local','Monitoramento de concorrentes'].map((f,i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <svg style={{ width:'13px', height:'13px', flexShrink:0, color:'#67e8f9' }} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <span style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'11px', color:'rgba(191,188,183,0.7)' }}>{f}</span>
                  </div>
                ))}
              </div>
              <a
                href={`https://wa.me/5519994175385?text=${encodeURIComponent('Olá Ryan! Tenho interesse na Gestão do Google Meu Negócio (R$349/mês). Pode me passar mais detalhes?')}`}
                target="_blank" rel="noreferrer"
                style={{ display:'inline-block', padding:'12px 32px', borderRadius:'10px', fontFamily:'Space Grotesk, sans-serif', fontSize:'13px', fontWeight:700, textDecoration:'none', background:'linear-gradient(135deg,#67e8f9,#00D1FF)', color:'#0a101d' }}
              >
                Quero mais clientes no Google
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* ── CENA 2: Mapa de SP ─────────────────────────────── */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          className="map-card premium-depth-card relative overflow-hidden flex items-center justify-center pointer-events-auto"
          style={{ width: '92vw', height: '92vh', borderRadius: '32px' }}
        >
          <div className="card-sheen" aria-hidden="true" />

          <div className="map-scene relative w-full h-full flex flex-col lg:flex-row items-center justify-center z-10 gap-0">

            {/* Esquerda — copy */}
            <div className="map-left flex flex-col justify-center px-10 lg:px-14 py-8 lg:py-0 lg:w-[40%] text-center lg:text-left">
              <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', borderRadius:'9999px', border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.04)', padding:'4px 14px', fontSize:'10px', letterSpacing:'0.15em', color:'rgba(100,220,255,0.8)', marginBottom:'20px', width:'fit-content', textTransform:'uppercase', fontFamily:'Space Grotesk, sans-serif' }}>
                <span style={{ width:'6px', height:'6px', borderRadius:'9999px', background:'#22c55e', boxShadow:'0 0 8px rgba(34,197,94,0.8)' }} />
                Cobertura em SP
              </div>
              <h3 style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'clamp(26px,3.5vw,42px)', fontWeight:800, letterSpacing:'-0.03em', color:'#fff', lineHeight:1.1, marginBottom:'16px' }}>
                Clientes te encontrando<br/>
                <span style={{ background:'linear-gradient(90deg,#abc7ff,#00D1FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>em todo estado de SP</span>
              </h3>
              <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'15px', color:'rgba(147,197,253,0.65)', lineHeight:1.65, marginBottom:'32px', maxWidth:'320px' }}>
                Seu negócio aparecendo para quem busca "oficina mecânica" ou "auto elétrica" na sua cidade — não só no bairro.
              </p>

              {/* Stats */}
              <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
                {[['15+','Cidades em SP'],['332%','Crescimento médio'],['24h','Para aparecer']].map(([val, label]) => (
                  <div key={label}>
                    <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'26px', fontWeight:800, color:'#efece6', letterSpacing:'-0.03em', lineHeight:1 }}>{val}</p>
                    <p style={{ fontFamily:'Space Grotesk, sans-serif', fontSize:'10px', color:'rgba(191,188,183,0.45)', textTransform:'uppercase', letterSpacing:'0.1em', marginTop:'4px' }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Direita — mapa canvas */}
            <div className="map-right flex items-center justify-center lg:w-[60%] w-full" style={{ minHeight:'320px' }}>
              <SPMap width={480} height={420} />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
