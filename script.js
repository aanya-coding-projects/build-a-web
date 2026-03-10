/* ============================================================
   BUILD-A-WEB — Global JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

/* ============================================================
   NAVIGATION
   ============================================================ */

(function initNav() {
  const nav = $('.nav');
  if (!nav) return;

  // Scroll shadow
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Highlight active page
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link, .drawer-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Hamburger / Drawer
  const hamburger = $('.nav-hamburger');
  const drawer    = $('.nav-drawer');
  const overlay   = $('.nav-overlay');

  function openDrawer() {
    hamburger?.classList.add('open');
    drawer?.classList.add('open');
    overlay?.classList.add('visible');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    hamburger?.classList.remove('open');
    drawer?.classList.remove('open');
    overlay?.classList.remove('visible');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', () => {
    drawer?.classList.contains('open') ? closeDrawer() : openDrawer();
  });

  overlay?.addEventListener('click', closeDrawer);

  // Escape key closes drawer and modals
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeDrawer();
      closeAllModals();
    }
  });
})();


/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */

(function initBackToTop() {
  const btn = $('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 300);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ============================================================
   INTERSECTION OBSERVER — Reveal animations
   ============================================================ */

(function initReveal() {
  const elements = $$('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
})();


/* ============================================================
   PARTICLE CANVAS
   ============================================================ */

function initParticles(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles = [];

  const COLORS = [
    'rgba(138,171,138,0.35)',
    'rgba(201,128,138,0.25)',
    'rgba(155,142,196,0.28)',
    'rgba(232,168,124,0.25)',
    'rgba(180,200,180,0.2)',
  ];

  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 3 + 1,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2,
    };
  }

  function init() {
    resize();
    particles = Array.from({ length: 55 }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize, { passive: true });
  init();
  draw();
}

// Initialize particles on all hero canvases
document.querySelectorAll('.particle-canvas').forEach(canvas => {
  if (canvas.id) initParticles(canvas.id);
});


/* ============================================================
   STAT COUNTERS (Home page)
   ============================================================ */

(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  function animateCounter(el) {
    const target  = parseInt(el.dataset.count, 10);
    const suffix  = el.dataset.suffix || '';
    const dur     = 1800;
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();


/* ============================================================
   PROGRESS RINGS (Dashboard)
   ============================================================ */

(function initProgressRings() {
  const rings = $$('.ring-progress');
  if (!rings.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ring      = entry.target;
        const target    = parseInt(ring.dataset.progress || '0', 10);
        const circumference = 201; // 2π × 32
        const offset    = circumference - (circumference * target / 100);
        ring.style.strokeDashoffset = offset;
        observer.unobserve(ring);
      }
    });
  }, { threshold: 0.3 });

  rings.forEach(r => observer.observe(r));
})();


/* ============================================================
   MODAL SYSTEM
   ============================================================ */

let activeModal = null;

function openModal(id) {
  const overlay = document.getElementById(id);
  if (!overlay) return;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  activeModal = overlay;
  document.body.style.overflow = 'hidden';
}

function closeModal(overlay) {
  if (!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  activeModal = null;
  document.body.style.overflow = '';
}

function closeAllModals() {
  $$('.modal-overlay.open').forEach(closeModal);
}

// Click outside / close button
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    closeModal(e.target);
  }
  if (e.target.classList.contains('modal-close') || e.target.closest('.modal-close')) {
    closeModal(e.target.closest('.modal-overlay'));
  }
});

// Expose globally
window.openModal = openModal;
window.closeModal = closeModal;


/* ============================================================
   SMOOTH SCROLL for anchor links
   ============================================================ */

document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="#"]');
  if (!link) return;
  const target = document.querySelector(link.getAttribute('href'));
  if (!target) return;
  e.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
});


/* ============================================================
   TABS (Resources page)
   ============================================================ */

(function initTabs() {
  const tabBtns = $$('.tab-btn');
  if (!tabBtns.length) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;
      // Deactivate all in same group
      const group = btn.closest('.tabs-container') || document;
      $$(`.tab-btn`, group !== document ? group.parentElement : group).forEach(b => b.classList.remove('active'));
      $$(`.tab-panel`, group !== document ? group.parentElement : group).forEach(p => p.classList.remove('active'));
      // Activate
      btn.classList.add('active');
      document.getElementById(targetId)?.classList.add('active');
    });
  });
})();


/* ============================================================
   ACCORDION (Resources lessons)
   ============================================================ */

(function initAccordion() {
  const headers = $$('.accordion-header');
  if (!headers.length) return;

  headers.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      // Close siblings (optional: comment out for multi-open)
      item.closest('.accordion-list')?.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });
})();


/* ============================================================
   FILTER PILLS (Schedule page)
   ============================================================ */

(function initFilters() {
  const pills = $$('.filter-pill');
  if (!pills.length) return;

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const group = pill.closest('.filter-group');
      group?.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const filter = pill.dataset.filter;
      $$('.session-card').forEach(card => {
        if (filter === 'all' || card.dataset.type === filter) {
          card.style.display = '';
          card.closest('.session-card-wrapper')?.style.setProperty('display', '');
        } else {
          card.style.display = 'none';
          card.closest('.session-card-wrapper')?.style.setProperty('display', 'none');
        }
      });
    });
  });
})();


/* ============================================================
   QUIZ ENGINE (Resources page)
   ============================================================ */

function initQuiz(quizId) {
  const container = document.getElementById(quizId);
  if (!container) return;

  const questions = $$('.quiz-question', container);
  const progressFill = $('.quiz-progress-fill', container);
  const scoreCard = $('.quiz-score-card', container);
  let current = 0;
  let score = 0;
  let answered = false;

  function showQuestion(index) {
    questions.forEach((q, i) => {
      q.classList.toggle('active', i === index);
    });
    if (progressFill) {
      progressFill.style.width = `${(index / questions.length) * 100}%`;
    }
    answered = false;
  }

  function finishQuiz() {
    questions.forEach(q => q.classList.remove('active'));
    if (progressFill) progressFill.style.width = '100%';
    if (scoreCard) {
      scoreCard.classList.add('visible');
      const numEl = scoreCard.querySelector('.quiz-score-number');
      if (numEl) numEl.textContent = `${score}/${questions.length}`;
    }

    // Confetti on completion
    launchConfetti();

    // Persist to localStorage
    const key = `quiz_${quizId}`;
    const prev = JSON.parse(localStorage.getItem(key) || '{}');
    prev.score = score;
    prev.total = questions.length;
    prev.date  = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(prev));
  }

  $$('.quiz-option', container).forEach(option => {
    option.addEventListener('click', () => {
      if (answered) return;
      answered = true;

      const correct = option.dataset.correct === 'true';
      option.classList.add(correct ? 'correct' : 'incorrect');

      // Mark correct answer if wrong
      if (!correct) {
        $$('.quiz-option', questions[current]).forEach(o => {
          if (o.dataset.correct === 'true') o.classList.add('correct');
        });
      } else {
        score++;
      }

      // Disable all options
      $$('.quiz-option', questions[current]).forEach(o => o.disabled = true);
    });
  });

  $$('.quiz-next-btn', container).forEach(btn => {
    btn.addEventListener('click', () => {
      if (!answered) return;
      current++;
      if (current < questions.length) {
        showQuestion(current);
      } else {
        finishQuiz();
      }
    });
  });

  $$('.quiz-restart-btn', container).forEach(btn => {
    btn.addEventListener('click', () => {
      current = 0;
      score = 0;
      answered = false;
      questions.forEach(q => {
        $$('.quiz-option', q).forEach(o => {
          o.classList.remove('correct', 'incorrect');
          o.disabled = false;
        });
      });
      scoreCard?.classList.remove('visible');
      showQuestion(0);
    });
  });

  showQuestion(0);
}

// Auto-init all quizzes
document.querySelectorAll('[data-quiz]').forEach(el => initQuiz(el.id));


/* ============================================================
   PASTEL CONFETTI (Canvas)
   ============================================================ */

function launchConfetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      zIndex: '9999',
    });
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#d4e4d4','#fceef5','#ede8f5','#fdf0e8','#c9d8c9','#e8d4dc','#d4cce8'];

  const flakes = Array.from({ length: 80 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * -canvas.height * 0.5,
    w: Math.random() * 10 + 4,
    h: Math.random() * 6 + 3,
    r: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 2,
    vy: Math.random() * 3 + 1.5,
    vr: (Math.random() - 0.5) * 0.1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    opacity: 1,
  }));

  let frame;
  let elapsed = 0;

  function drawFlake(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.r);
    ctx.globalAlpha = f.opacity;
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, f.w / 2, f.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsed++;

    let alive = false;
    flakes.forEach(f => {
      f.x  += f.vx;
      f.y  += f.vy;
      f.r  += f.vr;
      if (elapsed > 80) f.opacity = Math.max(0, f.opacity - 0.008);
      if (f.opacity > 0) { drawFlake(f); alive = true; }
    });

    if (alive) {
      frame = requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  cancelAnimationFrame(frame);
  animate();
}

window.launchConfetti = launchConfetti;


/* ============================================================
   CALENDAR WIDGET (Schedule page)
   ============================================================ */

function initCalendar(containerId, sessionData) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const monthLabel  = container.querySelector('.calendar-month-label');
  const grid        = container.querySelector('.calendar-grid');
  const prevBtn     = container.querySelector('.cal-prev');
  const nextBtn     = container.querySelector('.cal-next');
  const panel       = container.querySelector('.calendar-sessions-panel');

  let current = new Date();
  current.setDate(1);

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const today  = new Date();

  function render() {
    if (!grid) return;
    const year  = current.getFullYear();
    const month = current.getMonth();
    if (monthLabel) monthLabel.textContent = `${MONTHS[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const prevLast = new Date(year, month, 0).getDate();

    let html = '';

    // Prev month days
    for (let i = firstDay - 1; i >= 0; i--) {
      html += `<div class="cal-day other-month">${prevLast - i}</div>`;
    }

    // Current month days
    for (let d = 1; d <= lastDate; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const hasSess = sessionData && sessionData[dateStr];
      const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
      let cls = 'cal-day';
      if (isToday) cls += ' today';
      if (hasSess) cls += ' has-session';
      html += `<div class="${cls}" data-date="${dateStr}">${d}</div>`;
    }

    // Next month days
    const total    = firstDay + lastDate;
    const remaining = total % 7 === 0 ? 0 : 7 - (total % 7);
    for (let i = 1; i <= remaining; i++) {
      html += `<div class="cal-day other-month">${i}</div>`;
    }

    grid.innerHTML = html;

    // Day click handlers
    grid.querySelectorAll('.cal-day:not(.other-month)').forEach(day => {
      day.addEventListener('click', () => {
        grid.querySelectorAll('.cal-day').forEach(d => d.classList.remove('selected'));
        day.classList.add('selected');
        const dateStr = day.dataset.date;
        showSessions(dateStr);
      });
    });
  }

  function showSessions(dateStr) {
    if (!panel) return;
    const sessions = sessionData?.[dateStr];
    if (!sessions || !sessions.length) {
      panel.innerHTML = '<p style="font-size:0.85rem;color:var(--gray-mid);padding:8px 0">No sessions on this day.</p>';
    } else {
      panel.innerHTML = sessions.map(s => `
        <div class="cal-session-item">
          <div class="cal-session-dot" style="background:${s.color}"></div>
          <div class="cal-session-info">
            <div class="title">${s.title}</div>
            <div class="time">${s.time}</div>
          </div>
        </div>
      `).join('');
    }
    panel.classList.add('open');
  }

  prevBtn?.addEventListener('click', () => {
    current.setMonth(current.getMonth() - 1);
    render();
  });

  nextBtn?.addEventListener('click', () => {
    current.setMonth(current.getMonth() + 1);
    render();
  });

  render();
}

window.initCalendar = initCalendar;


/* ============================================================
   SEARCH (Resources page)
   ============================================================ */

(function initSearch() {
  const input = $('.search-input');
  if (!input) return;

  input.addEventListener('input', () => {
    const query = input.value.toLowerCase().trim();
    $$('.accordion-item, .video-card, .download-card').forEach(item => {
      const text = item.textContent.toLowerCase();
      const wrapper = item.closest('[class*="-card"]') || item;
      item.style.display = text.includes(query) ? '' : 'none';
    });
  });
})();


/* ============================================================
   DASHBOARD — LocalStorage persistence
   ============================================================ */

(function initDashboardStorage() {
  if (!document.querySelector('[data-dashboard]')) return;

  const STORAGE_KEY = 'baw_dashboard';

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch { return {}; }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // Mark lesson complete buttons
  $$('[data-complete-lesson]').forEach(btn => {
    const lessonId = btn.dataset.completeLesson;
    const state    = getState();
    if (state.lessons?.[lessonId]) {
      btn.textContent = 'Completed';
      btn.classList.add('btn-secondary');
      btn.disabled = true;
    }
    btn.addEventListener('click', () => {
      const s = getState();
      if (!s.lessons) s.lessons = {};
      s.lessons[lessonId] = true;
      saveState(s);
      btn.textContent = 'Completed';
      btn.classList.add('btn-secondary');
      btn.disabled = true;
    });
  });
})();


/* ============================================================
   GANTT CHART animation
   ============================================================ */

(function initGantt() {
  const bars = $$('.gantt-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        bar.style.width = bar.dataset.width || '100%';
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach(bar => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
})();


/* ============================================================
   VIDEO MODAL
   ============================================================ */

(function initVideoCards() {
  $$('.video-card[data-youtube]').forEach(card => {
    card.addEventListener('click', () => {
      const ytId = card.dataset.youtube;
      const overlay = document.getElementById('video-modal');
      if (!overlay) return;
      const iframe = overlay.querySelector('iframe');
      if (iframe) {
        iframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1`;
      }
      openModal('video-modal');
    });
  });

  // Clear iframe src when modal closed
  const videoModal = document.getElementById('video-modal');
  if (videoModal) {
    const origClose = closeModal;
    videoModal.addEventListener('click', e => {
      if (e.target === videoModal || e.target.closest('.modal-close')) {
        const iframe = videoModal.querySelector('iframe');
        if (iframe) iframe.src = '';
      }
    });
  }
})();


/* ============================================================
   DOWNLOAD TRIGGER (Blob downloads)
   ============================================================ */

function triggerDownload(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType || 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

window.triggerDownload = triggerDownload;


/* ============================================================
   REGISTER FORM (Schedule modals)
   ============================================================ */

(function initRegisterForms() {
  $$('.register-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const modal   = form.closest('.modal-overlay');
      const msgEl   = form.querySelector('.form-success');
      if (msgEl) {
        msgEl.style.display = 'block';
        form.querySelectorAll('input, select, textarea, button[type="submit"]').forEach(el => el.disabled = true);
      } else {
        closeModal(modal);
      }
    });
  });
})();


/* ============================================================
   HERO PAGE SUBTITLE — staggered word reveal on load
   ============================================================ */

(function initHeroReveal() {
  const heroText = document.querySelector('.hero-text');
  if (!heroText) return;
  heroText.style.opacity = '0';
  heroText.style.transform = 'translateY(24px)';
  heroText.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  setTimeout(() => {
    heroText.style.opacity = '1';
    heroText.style.transform = 'translateY(0)';
  }, 150);
})();
