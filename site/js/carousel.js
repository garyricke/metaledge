// Capabilities showcase carousel
// Autoplays at AUTOPLAY_MS interval; stops on any user interaction.
(function () {
  const AUTOPLAY_MS = 5000;

  const track      = document.getElementById('capTrack');
  const viewport   = document.getElementById('capViewport');
  const prevBtn    = document.getElementById('capPrev');
  const nextBtn    = document.getElementById('capNext');
  const progressBar = document.getElementById('capProgressBar');
  const navBtns    = document.querySelectorAll('.cap-showcase__nav-btn');
  const slides     = document.querySelectorAll('.cap-showcase__slide');

  if (!track || !slides.length) return;

  const total = slides.length;
  let current = 0;
  let autoplayTimer = null;
  let progressTimer = null;
  let userInteracted = false;

  function goTo(index, fromUser = false) {
    if (fromUser) stopAutoplay();
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    navBtns.forEach((btn, i) => btn.classList.toggle('is-active', i === current));

    // Scroll the active button into view within the nav bar only (horizontal, no page scroll)
    const activeBtn = navBtns[current];
    const nav = activeBtn?.closest('.cap-showcase__nav');
    if (activeBtn && nav) {
      const btnLeft   = activeBtn.offsetLeft;
      const btnWidth  = activeBtn.offsetWidth;
      const navWidth  = nav.offsetWidth;
      const scrollTarget = btnLeft - (navWidth / 2) + (btnWidth / 2);
      nav.scrollTo({ left: scrollTarget, behavior: 'smooth' });
    }

    if (!fromUser) startProgress();
  }

  function next(fromUser = false) { goTo(current + 1, fromUser); }
  function prev(fromUser = false) { goTo(current - 1, fromUser); }

  // Progress bar animation (resets on each slide change)
  function startProgress() {
    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      // Force reflow so the reset takes effect before animating
      void progressBar.offsetWidth;
      progressBar.style.transition = `width ${AUTOPLAY_MS}ms linear`;
      progressBar.style.width = '100%';
    }
  }

  function startAutoplay() {
    if (userInteracted) return;
    stopAutoplay();
    startProgress();
    autoplayTimer = setInterval(() => next(false), AUTOPLAY_MS);
  }

  function stopAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
    // Freeze progress bar at current position
    if (progressBar) {
      const computed = getComputedStyle(progressBar).width;
      const parentWidth = progressBar.parentElement.offsetWidth;
      const pct = (parseFloat(computed) / parentWidth) * 100;
      progressBar.style.transition = 'none';
      progressBar.style.width = pct + '%';
    }
  }

  // Arrow buttons
  prevBtn?.addEventListener('click', () => { userInteracted = true; prev(true); });
  nextBtn?.addEventListener('click', () => { userInteracted = true; next(true); });

  // Nav buttons
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      userInteracted = true;
      goTo(parseInt(btn.dataset.slide, 10), true);
    });
  });

  // Touch / swipe support
  let touchStartX = 0;
  viewport?.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  viewport?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      userInteracted = true;
      dx < 0 ? next(true) : prev(true);
    }
  }, { passive: true });

  // Pause on hover
  viewport?.addEventListener('mouseenter', () => {
    if (!userInteracted) stopAutoplay();
  });
  viewport?.addEventListener('mouseleave', () => {
    if (!userInteracted) startAutoplay();
  });

  // Keyboard arrows when carousel is focused
  document.addEventListener('keydown', e => {
    const inCarousel = document.getElementById('capabilities')?.contains(document.activeElement);
    if (!inCarousel) return;
    if (e.key === 'ArrowRight') { userInteracted = true; next(true); }
    if (e.key === 'ArrowLeft')  { userInteracted = true; prev(true); }
  });

  // Init
  goTo(0);
  startAutoplay();
})();
