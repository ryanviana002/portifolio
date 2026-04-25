/* ============================================================
   HERO — sticky scroll-jacking
   progress 0→1 cobre os 300vh do wrapper
   ============================================================ */
const heroWrapper = document.getElementById('hero-wrapper');
const heroSection = document.getElementById('hero');
const heroOverlay = document.getElementById('hero-overlay');
const phone1      = document.getElementById('phone-1');
const phone2      = document.getElementById('phone-2');
const phone3      = document.getElementById('phone-3');
const heroText    = document.getElementById('hero-text');
const heroH1      = document.getElementById('hero-h1');
const heroP       = document.getElementById('hero-p');
const heroBtns    = document.getElementById('hero-btns');
const scrollHint  = document.getElementById('scroll-hint');
const circle1     = document.querySelector('.circle-1');
const circle2     = document.querySelector('.circle-2');
const circle3     = document.querySelector('.circle-3');

function getHeroProgress() {
  if (!heroWrapper) return 0;
  const wrapH  = heroWrapper.offsetHeight;      // 300vh
  const viewH  = window.innerHeight;            // 100vh
  const travel = wrapH - viewH;                 // 200vh of scroll travel
  return Math.min(Math.max(window.scrollY / travel, 0), 1);
}

function ease(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function lerp(a, b, t) { return a + (b - a) * t; }

function clamp01(v) { return Math.min(Math.max(v, 0), 1); }
function progress(p, start, end) { return clamp01((p - start) / (end - start)); }

function updateHero() {
  const p = getHeroProgress();       // 0 = top, 1 = fully scrolled through

  /* ── phone-1 (center): exit upward (float handled in waveLoop) ── */
  if (phone1) {
    const exitP  = progress(p, 0.4, 0.95);
    const exitTy = lerp(0, -120, ease(exitP));
    const exitSc = lerp(1, 0.7, ease(exitP));
    phone1.dataset.exitTy = exitTy.toFixed(1);
    phone1.dataset.exitSc = exitSc.toFixed(3);
    phone1.style.opacity  = clamp01(lerp(1, 0, progress(p, 0.7, 0.95))).toFixed(3);
  }

  /* ── phone-2 (left): exits xPercent:-100 yPercent:50 ── */
  if (phone2) {
    const exitP  = progress(p, 0.5, 0.95);
    const ep     = ease(exitP);
    const sc     = lerp(0.85, 0.85 * 0.5, ep);
    const tx     = lerp(0, -110, ep);
    const ty     = lerp(0, 50, ep);
    phone2.style.transform = `translateY(-58%) rotate(-8deg) scale(${sc.toFixed(3)}) translateX(${tx.toFixed(1)}%) translateY(${ty.toFixed(1)}%)`;
    phone2.style.opacity   = clamp01(lerp(1, 0, progress(p, 0.7, 0.95))).toFixed(3);
  }

  /* ── phone-3 (right): exit (float handled in waveLoop) ── */
  if (phone3) {
    const exitP = progress(p, 0.35, 0.85);
    const ep    = ease(exitP);
    const sc    = lerp(0.78, 0.78 * 0.5, ep);
    const tx    = lerp(0, 120, ep);
    const ty    = lerp(0, 80, ep);
    const rot   = lerp(8, 26, ep);
    phone3.dataset.exitSc  = sc.toFixed(3);
    phone3.dataset.exitTx  = tx.toFixed(1);
    phone3.dataset.exitTy  = ty.toFixed(1);
    phone3.dataset.exitRot = rot.toFixed(1);
    phone3.style.opacity   = clamp01(lerp(1, 0, progress(p, 0.55, 0.85))).toFixed(3);
  }

  /* ── hero text: fade + slide left ── */
  if (heroText) {
    const tp = progress(p, 0.35, 0.75);
    heroText.style.opacity   = clamp01(lerp(1, 0, ease(tp))).toFixed(3);
    heroText.style.transform = `translateX(${lerp(0, -80, ease(tp)).toFixed(1)}px)`;
  }

  /* scroll hint */
  if (scrollHint) {
    scrollHint.style.opacity = clamp01(1 - p * 6).toFixed(3);
  }


  /* overlay desativado — sem tela preta */
  if (heroOverlay) heroOverlay.style.opacity = '0';
}

/* ============================================================
   HEADER
   ============================================================ */
const header = document.getElementById('site-header');

function updateHeader() {
  // considera scrolled quando passou do hero wrapper
  const threshold = heroWrapper ? heroWrapper.offsetHeight - window.innerHeight * 0.9 : 60;
  header.classList.toggle('scrolled', window.scrollY > threshold);
}

/* ============================================================
   SCROLL LOOP
   ============================================================ */
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateHero();
      updateHeader();
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* ── hero blob — lava light effect ── */
const heroBlob = document.getElementById('hero-blob');
let blobMouseX = -1, blobMouseY = -1;
let blobCurX = -1, blobCurY = -1;
let blobHasMouse = false;

document.addEventListener('mousemove', (e) => {
  blobMouseX = e.clientX;
  blobMouseY = e.clientY;
  blobHasMouse = true;
});

function updateBlob() {
  if (!heroBlob) { requestAnimationFrame(updateBlob); return; }

  const t = performance.now() / 1000;
  const rect = heroBlob.parentElement.getBoundingClientRect();

  /* posição alvo: cursor ou drift automático lento */
  const autoX = rect.left + rect.width  * (0.5 + Math.sin(t * 0.22) * 0.3 + Math.sin(t * 0.13) * 0.1);
  const autoY = rect.top  + rect.height * (0.5 + Math.cos(t * 0.18) * 0.25 + Math.cos(t * 0.11) * 0.08);
  const tx = blobHasMouse ? blobMouseX : autoX;
  const ty = blobHasMouse ? blobMouseY : autoY;

  if (blobCurX === -1) { blobCurX = tx; blobCurY = ty; }
  blobCurX += (tx - blobCurX) * 0.04;
  blobCurY += (ty - blobCurY) * 0.04;

  /* converte para coordenadas relativas ao hero */
  const lx = blobCurX - rect.left;
  const ly = blobCurY - rect.top;

  /* pulsa suavemente */
  const scale = 1 + Math.sin(t * 0.6) * 0.12 + Math.sin(t * 0.37) * 0.06;

  heroBlob.style.transform = `translate(calc(${lx.toFixed(1)}px - 50%), calc(${ly.toFixed(1)}px - 50%)) scale(${scale.toFixed(3)})`;

  requestAnimationFrame(updateBlob);
}
requestAnimationFrame(updateBlob);

/* ── wave loop independente dos círculos ── */
function waveLoop() {
  const p = getHeroProgress();
  const t = performance.now() / 1000;
  if (circle1) circle1.style.transform = `translate(${lerp(0,-60,p) + Math.sin(t*0.6)*22}px, ${lerp(0,40,p) + Math.cos(t*0.5)*16}px) scale(${lerp(1,1.2,p)})`;
  if (circle2) circle2.style.transform = `translate(${lerp(0,40,p) + Math.cos(t*0.7)*18}px, ${lerp(0,-50,p) + Math.sin(t*0.4)*14}px) scale(${lerp(1,0.9,p)})`;
  if (circle3) circle3.style.transform = `translate(${Math.sin(t*0.9)*32}px, ${Math.cos(t*0.6)*22}px)`;

  /* ── iPhones float contínuo ── */
  const floatY1 = Math.sin(t * 1.4) * 10;
  const floatY3 = Math.sin(t * 1.1 + 1.2) * 8;
  const floatR3 = Math.sin(t * 0.9) * 2;

  if (phone1) {
    const exitTy = parseFloat(phone1.dataset.exitTy || '0');
    const exitSc = parseFloat(phone1.dataset.exitSc || '1');
    phone1.style.transform = `translateY(calc(-50% + ${floatY1.toFixed(1)}px + ${exitTy}%)) scale(${exitSc})`;
  }
  if (phone3) {
    const sc  = parseFloat(phone3.dataset.exitSc  || '0.78');
    const tx  = parseFloat(phone3.dataset.exitTx  || '0');
    const ty  = parseFloat(phone3.dataset.exitTy  || '0');
    const rot = parseFloat(phone3.dataset.exitRot || '8') + floatR3;
    phone3.style.transform = `translateY(calc(-42% + ${floatY3.toFixed(1)}px)) rotate(${rot.toFixed(1)}deg) scale(${sc}) translateX(${tx}%) translateY(${ty}%)`;
  }

  requestAnimationFrame(waveLoop);
}
requestAnimationFrame(waveLoop);

/* ============================================================
   HERO ENTRANCE ANIMATION (on load)
   ============================================================ */
function heroEntrance() {
  const items = [
    { el: header,     delay: 0,   from: 'translateY(-20px)' },
    { el: heroH1,     delay: 180, from: 'translateY(40px)'  },
    { el: heroP,      delay: 340, from: 'translateY(30px)'  },
    { el: heroBtns,   delay: 480, from: 'translateY(24px)'  },
    { el: scrollHint, delay: 600, from: 'translateY(16px)'  },
    { el: phone1,     delay: 200, from: 'translateY(-30%) scale(1.2)' },
    { el: phone3,     delay: 380, from: 'translateY(-15%) rotate(14deg) scale(0.85)' },
  ];
  items.forEach(({ el, delay, from }) => {
    if (!el) return;
    el.style.opacity = '0';
    el.style.transform = from;
    el.style.transition = 'none';
    setTimeout(() => {
      el.style.transition = 'opacity 0.8s cubic-bezier(0.22,1,0.36,1), transform 0.8s cubic-bezier(0.22,1,0.36,1)';
      el.style.opacity = '';
      el.style.transform = '';
    }, delay + 100);
  });
}
window.addEventListener('load', heroEntrance);

/* ============================================================
   COOKIE BANNER
   ============================================================ */
const cookieAccept = document.getElementById('cookie-accept');
const cookieBanner = document.getElementById('cookie-banner');
if (cookieBanner) {
  if (localStorage.getItem('cookie-ok')) {
    cookieBanner.remove();
  } else if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('cookie-ok', '1');
      cookieBanner.style.opacity = '0';
      cookieBanner.style.transform = 'translateY(10px)';
      setTimeout(() => cookieBanner.remove(), 300);
    });
  }
}

/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   ============================================================ */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

  /* observe every element that already has reveal in HTML */
  document.querySelectorAll('.reveal').forEach((el, i) => {
    io.observe(el);
  });

  /* also add reveal to these extra selectors with stagger delay */
  const extra = ['.footer-brand', '.footer-col', '.stat-item'];
  extra.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      if (!el.classList.contains('reveal')) {
        el.classList.add('reveal');
        el.style.transitionDelay = `${i * 80}ms`;
        io.observe(el);
      }
    });
  });

  /* scatter cards staggered */
  const cardIO = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.scatter-card').forEach((c, i) => {
        setTimeout(() => c.classList.add('visible'), i * 160);
      });
      cardIO.disconnect();
    }
  }, { threshold: 0.1 });
  const scatter = document.querySelector('.cards-scatter');
  if (scatter) cardIO.observe(scatter);
}
document.addEventListener('DOMContentLoaded', initReveal);

/* ============================================================
   STAT COUNTER ANIMATION
   ============================================================ */
function animateCounter(el, target, suffix) {
  const duration = 1800;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.round(eased * target);
    el.textContent = val >= 1000 ? (val / 1000).toFixed(val >= 10000 ? 0 : 1) + 'k' : val;
    if (t < 1) requestAnimationFrame(step);
    else el.textContent = target >= 1000 ? (target / 1000).toFixed(target >= 10000 ? 0 : 1) + 'k' : target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const numEl   = e.target.querySelector('.stat-number');
        const plusEl  = e.target.querySelector('.stat-plus');
        const target  = parseInt(numEl?.dataset.target || '0', 10);
        const suffix  = plusEl?.textContent || '';
        if (numEl) animateCounter(numEl, target, suffix);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.stat-item').forEach(el => io.observe(el));
}
document.addEventListener('DOMContentLoaded', initCounters);

/* ============================================================
   TICKER
   ============================================================ */
const ticker = document.getElementById('ticker-track');
if (ticker) ticker.innerHTML += ticker.innerHTML;

/* ============================================================
   FAQ ACCORDION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
});

/* ============================================================
   ROLL EFFECT — btn-store hover
   ============================================================ */
function rollText(el, text) {
  const h = el.getBoundingClientRect().height;
  el.style.display = 'inline-block';
  el.style.overflow = 'hidden';
  el.style.height = h + 'px';
  el.style.verticalAlign = 'bottom';
  el.innerHTML = `<span style="display:block;transition:transform 0.32s cubic-bezier(0.4,0,0.2,1);">
    <span style="display:block;">${text}</span>
    <span style="display:block;">${text}</span>
  </span>`;
  requestAnimationFrame(() => requestAnimationFrame(() => {
    el.firstElementChild.style.transform = `translateY(-${h}px)`;
  }));
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.btn-store').forEach(btn => {
    const strong = btn.querySelector('.btn-store-text strong');
    const small  = btn.querySelector('.btn-store-text small');
    if (!strong) return;
    const origStrong = strong.textContent;
    const origSmall  = small ? small.textContent : null;
    btn.addEventListener('mouseenter', () => {
      rollText(strong, origStrong);
      if (small && origSmall) rollText(small, origSmall);
    });
    btn.addEventListener('mouseleave', () => {
      strong.textContent = origStrong;
      if (small && origSmall) small.textContent = origSmall;
    });
  });
});

/* ============================================================
   MOBILE MENU
   ============================================================ */
const menuToggle = document.getElementById('menu-toggle');
const mainNav    = document.getElementById('main-nav');
if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const open = mainNav.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
}
