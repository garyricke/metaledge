// BIM & CAD Library — searchable, filterable static list with downloadable formats
(function () {
  const list = document.getElementById('libList');
  const search = document.getElementById('libSearch');
  if (!list) return;

  const ITEMS = [
    { name: 'Coping — Continuous Cleat',         tag: 'coping', size: '6"–24" face',  formats: ['RVT', 'DWG', 'PDF'] },
    { name: 'Coping — Snap-On',                  tag: 'coping', size: '6"–18" face',  formats: ['RVT', 'DWG', 'PDF'] },
    { name: 'Fascia — Gravity-Lock',             tag: 'fascia', size: '4"–14" face',  formats: ['RVT', 'DWG', 'PDF'] },
    { name: 'Fascia — Flush Fit',                tag: 'fascia', size: '4"–10" face',  formats: ['RVT', 'DWG'] },
    { name: 'Drip Edge — Two-Piece',             tag: 'fascia', size: 'Standard',     formats: ['DWG', 'PDF'] },
    { name: 'ACM Wall Panel — Route &amp; Return',  tag: 'acm',    size: '4mm core',     formats: ['RVT', 'DWG', 'PDF'] },
    { name: 'ACM Column Cover — Round',          tag: 'acm',    size: '12"–48" Ø',    formats: ['DWG', 'PDF'] },
    { name: 'IMP — Smooth Architectural',        tag: 'imp',    size: '2"–5" thick',  formats: ['RVT', 'DWG', 'PDF'] },
    { name: 'IMP — Embossed Industrial',         tag: 'imp',    size: '2"–6" thick',  formats: ['RVT', 'DWG'] },
    { name: 'Standing Seam — Snap-Lock 1.5"',    tag: 'seam',   size: '12"–18" pan',  formats: ['RVT', 'DWG', 'PDF'] },
    { name: 'Standing Seam — Mechanical 2"',     tag: 'seam',   size: '12"–24" pan',  formats: ['RVT', 'DWG', 'PDF'] },
    { name: 'Snow Retention — Pad-Style',        tag: 'seam',   size: 'For SS roofs', formats: ['DWG', 'PDF'] },
    { name: 'Perforated Wall Panel',             tag: 'acm',    size: 'Custom pattern', formats: ['DWG', 'PDF'] },
    { name: 'Coping — Stretched Corner',         tag: 'coping', size: 'Field-fab kit', formats: ['DWG', 'PDF'] },
  ];

  function render() {
    list.innerHTML = ITEMS.map((it, i) => `
      <li class="library__row" data-tag="${it.tag}" data-name="${it.name.toLowerCase()}">
        <div class="library__icon">${i + 1 < 10 ? '0' + (i + 1) : i + 1}</div>
        <div>
          <p class="library__name">${it.name}</p>
          <span class="library__meta">${it.size} · ES-1 certified</span>
        </div>
        <span class="library__meta">${it.tag.toUpperCase()}</span>
        <div class="library__formats">
          ${it.formats.map(f => `<a class="library__format" href="#" onclick="event.preventDefault();this.textContent='✓ ${f}';">${f}</a>`).join('')}
        </div>
      </li>
    `).join('');
  }

  function applyFilters() {
    const filter = document.querySelector('#library .chip.is-active')?.dataset.filter || 'all';
    const term = (search?.value || '').toLowerCase().trim();
    list.querySelectorAll('.library__row').forEach(row => {
      const matchTag = filter === 'all' || row.dataset.tag === filter;
      const matchTerm = !term || row.dataset.name.includes(term);
      row.classList.toggle('is-hidden', !(matchTag && matchTerm));
    });
  }

  document.querySelectorAll('#library .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#library .chip').forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      applyFilters();
    });
  });
  search?.addEventListener('input', applyFilters);

  render();
  applyFilters();
})();
