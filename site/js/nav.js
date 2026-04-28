// Sticky-on-scroll nav + mobile drawer toggle
(function () {
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('navToggle');
  const drawer = document.getElementById('navDrawer');

  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 8) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  if (toggle && drawer) {
    toggle.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('is-open');
      drawer.hidden = !isOpen;
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
    drawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        drawer.classList.remove('is-open');
        drawer.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
