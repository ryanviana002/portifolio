import { useEffect } from 'react';

export default function useReveal() {
  useEffect(() => {
    // Auto-adiciona reveal em elementos chave de cada seção
    const selectors = [
      '.sobre-label', '.sobre-grid',
      '.servicos-header', '.servicos-grid',
      '.metodo-header', '.metodo-steps',
      '.portfolio-header', '.portfolio-grid',
      '.impacto-header', '.stats-grid', '.testimonials',
      '.contato-left', '.contato-right',
    ];

    selectors.forEach((sel, i) => {
      document.querySelectorAll(sel).forEach(el => {
        el.classList.add('reveal');
        el.style.transitionDelay = `${(i % 3) * 0.1}s`;
      });
    });

    const obs = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}
