'use client'

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface NavLink { label: string; href: string; }
interface Project { title: string; description: string; tags: string[]; imageContent?: React.ReactNode; }
interface Stat { value: string; label: string; }

export interface PortfolioPageProps {
  logo?: { initials: React.ReactNode; name: React.ReactNode; };
  navLinks?: NavLink[];
  resume?: { label: string; onClick?: () => void; };
  hero?: { titleLine1: React.ReactNode; titleLine2Gradient: React.ReactNode; subtitle: React.ReactNode; };
  ctaButtons?: { primary: { label: string; onClick?: () => void; }; secondary: { label: string; onClick?: () => void; }; };
  projects?: Project[];
  stats?: Stat[];
  showAnimatedBackground?: boolean;
}

/** Contained aurora — fills parent (position: absolute, not fixed) */
export const AuroraBackground: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!mountRef.current) return;
    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    const w = currentMount.clientWidth || window.innerWidth;
    const h = currentMount.clientHeight || window.innerHeight;
    renderer.setSize(w, h);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0';
    renderer.domElement.style.left = '0';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.zIndex = '0';
    currentMount.appendChild(renderer.domElement);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new THREE.Vector2(w, h) },
      },
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        uniform float iTime; uniform vec2 iResolution;
        #define NUM_OCTAVES 3
        float rand(vec2 n) { return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453); }
        float noise(vec2 p){ vec2 ip=floor(p);vec2 u=fract(p);u=u*u*(3.0-2.0*u);float res=mix(mix(rand(ip),rand(ip+vec2(1.0,0.0)),u.x),mix(rand(ip+vec2(0.0,1.0)),rand(ip+vec2(1.0,1.0)),u.x),u.y);return res*res; }
        float fbm(vec2 x) { float v=0.0;float a=0.3;vec2 shift=vec2(100);mat2 rot=mat2(cos(0.5),sin(0.5),-sin(0.5),cos(0.50));for(int i=0;i<NUM_OCTAVES;++i){v+=a*noise(x);x=rot*x*2.0+shift;a*=0.4;}return v;}
        void main() {
          vec2 p=((gl_FragCoord.xy)-iResolution.xy*0.5)/iResolution.y*mat2(6.,-4.,4.,6.);vec4 o=vec4(0.);float f=2.+fbm(p+vec2(iTime*5.,0.))*.5;
          for(float i=0.;i++<35.;){vec2 v=p+cos(i*i+(iTime+p.x*.08)*.025+i*vec2(13.,11.))*3.5;float tailNoise=fbm(v+vec2(iTime*.5,i))*.3*(1.-(i/35.));vec4 auroraColors=vec4(.1+.3*sin(i*.2+iTime*.4),.3+.5*cos(i*.3+iTime*.5),.7+.3*sin(i*.4+iTime*.3),1.);vec4 currentContribution=auroraColors*exp(sin(i*i+iTime*.8))/length(max(v,vec2(v.x*f*.015,v.y*1.5)));float thinnessFactor=smoothstep(0.,1.,i/35.)*.6;o+=currentContribution*(1.+tailNoise*.8)*thinnessFactor;}
          o=tanh(pow(o/100.,vec4(1.6)));gl_FragColor=o*1.5;
        }
      `,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      material.uniforms.iTime.value += 0.016;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nw = currentMount.clientWidth;
      const nh = currentMount.clientHeight;
      renderer.setSize(nw, nh);
      material.uniforms.iResolution.value.set(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      if (currentMount.contains(renderer.domElement)) currentMount.removeChild(renderer.domElement);
      renderer.dispose();
      material.dispose();
      geometry.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />;
};

const defaultData = {
  logo: { initials: 'MT', name: 'Meng To' },
  navLinks: [{ label: 'About', href: '#about' }, { label: 'Projects', href: '#projects' }, { label: 'Skills', href: '#skills' }],
  resume: { label: 'Resume' },
  hero: { titleLine1: 'Creative Developer &', titleLine2Gradient: 'Digital Designer', subtitle: 'I craft beautiful digital experiences through code and design.' },
  ctaButtons: { primary: { label: 'View My Work' }, secondary: { label: 'Get In Touch' } },
  projects: [
    { title: 'FinTech Mobile App', description: 'React Native app with AI-powered financial insights.', tags: ['React Native', 'Node.js'] },
    { title: 'Data Visualization Platform', description: 'Interactive dashboard for complex data analysis.', tags: ['D3.js', 'Python'] },
    { title: '3D Portfolio Site', description: 'Immersive WebGL experience with 3D elements.', tags: ['Three.js', 'WebGL'] },
  ],
  stats: [{ value: '50+', label: 'Projects Completed' }, { value: '5+', label: 'Years Experience' }, { value: '15+', label: 'Happy Clients' }],
};

export const PortfolioPage: React.FC<PortfolioPageProps> = ({
  logo = defaultData.logo,
  navLinks = defaultData.navLinks,
  resume = defaultData.resume,
  hero = defaultData.hero,
  ctaButtons = defaultData.ctaButtons,
  projects = defaultData.projects,
  stats = defaultData.stats,
  showAnimatedBackground = true,
}) => {
  return (
    <div className="bg-background text-foreground">
      {showAnimatedBackground && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
          <AuroraBackground />
        </div>
      )}
      <div className="relative" style={{ zIndex: 1 }}>
        <nav className="w-full px-6 py-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg border border-white/20 flex items-center justify-center backdrop-blur-md bg-white/10">
                <span className="text-sm font-bold text-white">{logo.initials}</span>
              </div>
              <span className="text-lg font-medium text-white">{logo.name}</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="text-white/60 hover:text-white transition-colors text-sm">{link.label}</a>
              ))}
            </div>
            <button onClick={resume.onClick} className="px-4 py-2 rounded-lg text-white text-sm font-medium backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-colors">{resume.label}</button>
          </div>
        </nav>
        <main id="about" className="w-full min-h-screen flex flex-col items-center justify-center px-6 py-20">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light text-white tracking-tight mb-4">
              {hero.titleLine1}
              <span className="block bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">{hero.titleLine2Gradient}</span>
            </h1>
            <p className="text-lg md:text-xl text-white/60 max-w-3xl mx-auto mb-8">{hero.subtitle}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button onClick={ctaButtons.primary.onClick} className="px-6 py-3 rounded-lg font-medium text-sm text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:opacity-90 transition-opacity min-w-[160px]">{ctaButtons.primary.label}</button>
              <button onClick={ctaButtons.secondary.onClick} className="px-6 py-3 rounded-lg text-sm font-medium text-white backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition-colors min-w-[160px]">{ctaButtons.secondary.label}</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {projects.map((project, index) => (
                <div key={index} className="rounded-2xl p-6 text-left backdrop-blur-md bg-white/5 border border-white/10">
                  <div className="rounded-xl h-32 mb-4 flex items-center justify-center bg-white/5">{project.imageContent}</div>
                  <h3 className="text-lg font-medium text-white mb-2">{project.title}</h3>
                  <p className="text-white/60 text-sm mb-4">{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 rounded text-xs text-white/50 bg-white/10">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 text-center">
              {stats.map((stat, index) => (
                <React.Fragment key={stat.label}>
                  <div>
                    <div className="text-3xl md:text-4xl font-light text-white mb-1">{stat.value}</div>
                    <div className="text-white/60 text-sm">{stat.label}</div>
                  </div>
                  {index < stats.length - 1 && <div className="hidden sm:block w-px h-12 bg-gradient-to-b from-transparent via-white/20 to-transparent" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
