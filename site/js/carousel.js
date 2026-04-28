// Capabilities showcase carousel
// Autoplays until user clicks an arrow or a nav button. Hover pauses temporarily.
(function () {
  const AUTOPLAY_MS = 5000;

  const track       = document.getElementById('capTrack');
  const viewport    = document.getElementById('capViewport');
  const prevBtn     = document.getElementById('capPrev');
  const nextBtn     = document.getElementById('capNext');
  const progressBar = document.getElementById('capProgressBar');
  const navBtns     = document.querySelectorAll('.cap-showcase__nav-btn');
  const slides      = document.querySelectorAll('.cap-showcase__slide');

  if (!track || !slides.length) return;

  const total = slides.length;
  let current  = 0;
  let timer    = null;
  let stopped  = false; // permanently stopped by user click
  let hovered  = false;

  // ── Core slide change ──────────────────────────────────────────────
  function goTo(index) {
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    navBtns.forEach((btn, i) => btn.classList.toggle('is-active', i === current));

    // Keep active nav button scrolled into view (horizontal only)
    const activeBtn = navBtns[current];
    const nav = activeBtn?.closest('.cap-showcase__nav');
    if (activeBtn && nav) {
      const scrollTarget = activeBtn.offsetLeft - nav.offsetWidth / 2 + activeBtn.offsetWidth / 2;
      nav.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }
  }

  // ── Progress bar ───────────────────────────────────────────────────
  function startProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    void progressBar.offsetWidth; // force reflow
    progressBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
    progressBar.style.width = '100%';
  }

  function freezeProgress() {
    if (!progressBar) return;
    const pct = (parseFloat(getComputedStyle(progressBar).width) /
                 progressBar.parentElement.offsetWidth) * 100;
    progressBar.style.transition = 'none';
    progressBar.style.width = pct + '%';
  }

  function clearProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
  }

  // ── Autoplay ───────────────────────────────────────────────────────
  function scheduleNext() {
    clearInterval(timer);
    if (stopped) return;
    timer = setInterval(() => {
      if (!hovered) {
        goTo(current + 1);
        startProgress();
      }
    }, AUTOPLAY_MS);
  }

  function stopPermanently() {
    stopped = true;
    clearInterval(timer);
    clearProgress();
  }

  // ── User controls — permanently stop autoplay ──────────────────────
  prevBtn?.addEventListener('click', () => { stopPermanently(); goTo(current - 1); });
  nextBtn?.addEventListener('click', () => { stopPermanently(); goTo(current + 1); });

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stopPermanently();
      goTo(parseInt(btn.dataset.slide, 10));
    });
  });

  // ── Touch / swipe — permanently stop autoplay ──────────────────────
  let touchStartX = 0;
  viewport?.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  viewport?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      stopPermanently();
      dx < 0 ? goTo(current + 1) : goTo(current - 1);
    }
  }, { passive: true });

  // ── Hover — pause/resume without stopping permanently ─────────────
  viewport?.addEventListener('mouseenter', () => {
    if (stopped) return;
    hovered = true;
    freezeProgress();
  });
  viewport?.addEventListener('mouseleave', () => {
    if (stopped) return;
    hovered = false;
    // Restart from current slide so timing resets cleanly
    goTo(current);
    startProgress();
    scheduleNext();
  });

  // ── Init ───────────────────────────────────────────────────────────
  goTo(0);
  startProgress();
  scheduleNext();
})();
