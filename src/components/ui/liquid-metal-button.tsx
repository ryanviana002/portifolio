import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { Sparkles } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface LiquidMetalButtonProps {
  label?: string;
  onClick?: () => void;
  viewMode?: "text" | "icon";
  borderOnly?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  borderRadius?: string | number;
}

export function LiquidMetalButton({
  label = "Get Started",
  onClick,
  viewMode = "text",
  borderOnly = false,
  children,
  className = "",
  style,
  borderRadius,
}: LiquidMetalButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const shaderRef = useRef<HTMLDivElement>(null);
  const shaderMount = useRef<any>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const rippleId = useRef(0);
  const instanceId = useRef(`lmb-${Math.random().toString(36).slice(2)}`);

  const W = borderOnly ? (style?.width ? parseInt(style.width as string) : 220) : (viewMode === "icon" ? 46 : 142);
  const H = borderOnly ? (style?.height ? parseInt(style.height as string) : 58) : 46;

  useEffect(() => {
    const styleId = "shader-canvas-style-exploded";
    if (!document.getElementById(styleId)) {
      const s = document.createElement("style");
      s.id = styleId;
      s.textContent = `
        .shader-container-exploded canvas {
          width: 100% !important; height: 100% !important;
          display: block !important; position: absolute !important;
          top: 0 !important; left: 0 !important;
          z-index: 0 !important;
          filter: none;
        }
        @keyframes ripple-animation {
          0% { transform: translate(-50%,-50%) scale(0); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(4); opacity: 0; }
        }
      `;
      document.head.appendChild(s);
    }

    const metalStyleId = "lmb-metal-text-style";
    {
      let s = document.getElementById(metalStyleId) as HTMLStyleElement | null;
      if (!s) { s = document.createElement("style"); s.id = metalStyleId; document.head.appendChild(s); }
      s.textContent = `
        @keyframes metal-shine {
          0%   { background-position: 200% center; }
          50%  { background-position: 0% center; }
          100% { background-position: -200% center; }
        }
        .lmb-metal-text {
          background: linear-gradient(105deg, #e0e0e0 0%, #fff 30%, #fff 50%, #fff 70%, #e0e0e0 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: metal-shine 20s ease-in-out infinite;
        }
      `;
    }

    if (borderRadius !== undefined) {
      const br = typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius;
      const id = instanceId.current;
      let s = document.getElementById(id) as HTMLStyleElement | null;
      if (!s) {
        s = document.createElement("style");
        s.id = id;
      }
      s.textContent = `[data-lmb-id="${id}"] canvas { border-radius: ${br} !important; }`;
      document.head.appendChild(s);
    }

    if (shaderRef.current) {
      if (shaderMount.current?.destroy) shaderMount.current.destroy();
      shaderMount.current = new ShaderMount(
        shaderRef.current,
        liquidMetalFragmentShader,
        { u_repetition: 4, u_softness: 0.5, u_shiftRed: 0.3, u_shiftBlue: 0.3, u_distortion: 0, u_contour: 0, u_angle: 45, u_scale: 8, u_shape: 1, u_offsetX: 0.1, u_offsetY: -0.1 },
        undefined,
        0.6,
      );
      {
        const br = borderRadius !== undefined
          ? (typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius)
          : "100px";
        const applyBr = () => {
          const canvas = shaderRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
          if (canvas) canvas.style.setProperty("border-radius", br, "important");
          if (shaderRef.current) {
            shaderRef.current.style.setProperty("border-radius", br, "important");
            shaderRef.current.style.setProperty("overflow", "hidden", "important");
          }
        };
        applyBr();
        requestAnimationFrame(applyBr);
        setTimeout(applyBr, 100);
        setTimeout(applyBr, 500);
        const observer = new MutationObserver(applyBr);
        if (shaderRef.current) {
          observer.observe(shaderRef.current, { childList: true, subtree: true, attributes: true, attributeFilter: ["style"] });
        }
        const origDestroy = shaderMount.current?.destroy?.bind(shaderMount.current);
        if (shaderMount.current) shaderMount.current._brObserver = observer;
      }
    }

    return () => {
      if (shaderMount.current?._brObserver) shaderMount.current._brObserver.disconnect();
      if (shaderMount.current?.destroy) { shaderMount.current.destroy(); shaderMount.current = null; }
      const instanceStyle = document.getElementById(instanceId.current);
      if (instanceStyle) instanceStyle.remove();
    };
  }, []);

  const handleMouseEnter = () => { setIsHovered(true); shaderMount.current?.setSpeed?.(1); };
  const handleMouseLeave = () => { setIsHovered(false); setIsPressed(false); shaderMount.current?.setSpeed?.(0.6); };
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shaderMount.current?.setSpeed) {
      shaderMount.current.setSpeed(2.4);
      setTimeout(() => shaderMount.current?.setSpeed?.(isHovered ? 1 : 0.6), 300);
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const ripple = { x: e.clientX - rect.left, y: e.clientY - rect.top, id: rippleId.current++ };
      setRipples(prev => [...prev, ripple]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== ripple.id)), 600);
    }
    onClick?.();
  };

  if (borderOnly) {
    const bg = (style?.background as string) || (style?.backgroundColor as string) || "#000";
    const br = borderRadius !== undefined ? (typeof borderRadius === "number" ? `${borderRadius}px` : borderRadius) : "100px";
    return (
      <div
        className={className}
        style={{ position: "relative", width: W, height: H, display: "inline-block", flexShrink: 0 }}
      >
        {/* Shader fill — the full button area, acts as animated border */}
        <div
          ref={shaderRef}
          className="shader-container-exploded"
          data-lmb-id={instanceId.current}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: W, height: H,
            borderRadius: br,
            overflow: "hidden",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        {/* Dark glass interior, inset 3px to reveal shader border */}
        <button
          ref={buttonRef}
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          style={{
            position: "absolute",
            top: 3, left: 3, right: 3, bottom: 3,
            background: bg,
            border: "none",
            cursor: "pointer",
            outline: "none",
            borderRadius: br,
            transform: isPressed ? "scale(0.97)" : "scale(1)",
            transition: "transform 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1,
            overflow: "hidden",
          }}
          aria-label={label}
        >
          {children}
          {ripples.map(ripple => (
            <span
              key={ripple.id}
              style={{
                position: "absolute",
                left: ripple.x, top: ripple.y,
                width: 20, height: 20,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                pointerEvents: "none",
                animation: "ripple-animation 0.6s ease-out",
              }}
            />
          ))}
        </button>
      </div>
    );
  }

  return (
    <div className="relative inline-block">
      <div style={{ perspective: "1000px", perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "relative", width: W, height: H, transformStyle: "preserve-3d", transition: "all 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transform: "translateZ(20px)", zIndex: 30, pointerEvents: "none" }}>
            {viewMode === "icon" && <Sparkles size={16} style={{ color: "#666", filter: "drop-shadow(0px 1px 2px rgba(0,0,0,0.5))" }} />}
            {viewMode === "text" && <span style={{ fontSize: 14, color: "#ff007f", fontWeight: 700, textShadow: "0 0 8px rgba(255,0,127,0.6), 0 1px 2px rgba(0,0,0,0.5)", whiteSpace: "nowrap", letterSpacing: 1 }}>{label}</span>}
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translateZ(10px) ${isPressed ? "translateY(1px) scale(0.98)" : "scale(1)"}`, zIndex: 20, transition: "all 0.15s" }}>
            <div style={{ width: W - 4, height: H - 4, margin: 2, borderRadius: 100, background: "linear-gradient(180deg,#202020,#000)", boxShadow: isPressed ? "inset 0 2px 4px rgba(0,0,0,0.4)" : "none" }} />
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translateZ(0) ${isPressed ? "translateY(1px) scale(0.98)" : "scale(1)"}`, zIndex: 10, transition: "all 0.15s" }}>
            <div style={{ width: W, height: H, borderRadius: 100, boxShadow: isPressed ? "0 0 0 1px rgba(0,0,0,0.5)" : isHovered ? "0 0 0 1px rgba(0,0,0,0.4), 0 8px 5px rgba(0,0,0,0.1)" : "0 0 0 1px rgba(0,0,0,0.3), 0 9px 9px rgba(0,0,0,0.12)", background: "transparent", transition: "box-shadow 0.15s" }}>
              <div ref={shaderRef} className="shader-container-exploded" style={{ borderRadius: 100, overflow: "hidden", position: "relative", width: W, height: H }} />
            </div>
          </div>
          <button ref={buttonRef} onClick={handleClick} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onMouseDown={() => setIsPressed(true)} onMouseUp={() => setIsPressed(false)}
            style={{ position: "absolute", inset: 0, background: "transparent", border: "none", cursor: "pointer", outline: "none", zIndex: 40, transform: "translateZ(25px)", overflow: "hidden", borderRadius: 100 }}
            aria-label={label}
          >
            {ripples.map(r => <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 20, height: 20, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)", pointerEvents: "none", animation: "ripple-animation 0.6s ease-out" }} />)}
          </button>
        </div>
      </div>
    </div>
  );
}
