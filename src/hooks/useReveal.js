import { useEffect } from 'react';

export default function useReveal() {
  useEffect(() => {
    const up = [
      '.sobre-label', '.sobre-right',
      '.servicos-header',
      '.metodo-header',
      '.portfolio-header',
      '.impacto-header',
      '.stats-grid',
      '.contato-left', '.contato-right',
      '.portfolio-cta-row',
    ];

    const left = [
      '.sobre-left',
      '.metodo-steps .step:nth-child(odd)',
      '.proj-card:nth-child(odd)',
      '.testimonial:nth-child(odd)',
    ];

    const right = [
      '.metodo-steps .step:nth-child(even)',
      '.proj-card:nth-child(even)',
      '.testimonial:nth-child(even)',
    ];

    const staggered = [
      { sel: '.serv-item', delay: 0.08 },
      { sel: '.stat-card', delay: 0.1 },
      { sel: '.skill-item', delay: 0.07 },
      { sel: '.tech-icon', delay: 0.05 },
    ];

    up.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.classList.add('reveal'));
    });

    left.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.classList.add('reveal-left'));
    });

    right.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => el.classList.add('reveal-right'));
    });

    staggered.forEach(({ sel, delay }) => {
      document.querySelectorAll(sel).forEach((el, i) => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * delay}s`;
      });
    });

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          obs.unobserve(e.target);
        }
      }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));

    // Garante que elementos do hero (já visíveis) nunca fiquem presos
    document.querySelectorAll('.hero-title, .hero-content, .hero-layout').forEach(el => {
      el.style.opacity = '';
      el.style.transform = '';
      el.style.filter = '';
    });

    return () => obs.disconnect();
  }, []);
}
