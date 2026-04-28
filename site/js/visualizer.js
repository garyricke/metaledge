// Color Visualizer — 12 Kynar finishes applied to swappable elements
// inside the visualizer-facade SVG. Targets: building (wall panel),
// coping (perimeter cap), column (column covers).
(function () {
  const VIZ = document.getElementById('visualizer');
  if (!VIZ) return;

  const FINISHES = [
    { name: 'Slate Gray',     code: 'PAC #SG', hex: '#41525C' },
    { name: 'Slate Blue',     code: 'PAC #SL', hex: '#3B7FB8' },
    { name: 'Regal Blue',     code: 'PAC #RB', hex: '#1F3A66' },
    { name: 'Olsson Navy',    code: 'BR #ON',  hex: '#152239' },
    { name: 'Copper Penny',   code: 'PAC #CP', hex: '#C8732D' },
    { name: 'Patina Green',   code: 'PAC #PG', hex: '#5A8C6F' },
    { name: 'Forest Green',   code: 'PAC #FG', hex: '#1F5A3A' },
    { name: 'Sandstone',      code: 'PAC #SS', hex: '#C7B79E' },
    { name: 'Bone White',     code: 'PAC #BW', hex: '#EDE7DA' },
    { name: 'Charcoal',       code: 'PAC #CH', hex: '#2A2D33' },
    { name: 'Matte Black',    code: 'PAC #MB', hex: '#161616' },
    { name: 'Terra Red',      code: 'PAC #TR', hex: '#8C2A2A' },
  ];

  const grid     = document.getElementById('swatchGrid');
  const label    = document.getElementById('vizLabel');
  const selected = document.getElementById('vizSelected');
  const targetChips = VIZ.querySelectorAll('[data-target]');

  let currentTarget = 'building';
  let currentIndex  = 1;

  // Build swatches
  FINISHES.forEach((f, i) => {
    const btn = document.createElement('button');
    btn.className = 'swatch';
    btn.style.background = f.hex;
    btn.dataset.idx = i;
    btn.setAttribute('aria-label', `${f.name} (${f.code})`);
    btn.innerHTML = `<span class="swatch__name">${f.name}</span>`;
    if (i === currentIndex) btn.classList.add('is-active');
    btn.addEventListener('click', () => applyFinish(i));
    grid.appendChild(btn);
  });

  targetChips.forEach(chip => {
    chip.addEventListener('click', () => {
      targetChips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      currentTarget = chip.dataset.target;
    });
  });

  function applyFinish(i) {
    currentIndex = i;
    const f = FINISHES[i];
    grid.querySelectorAll('.swatch').forEach((el, idx) => {
      el.classList.toggle('is-active', idx === i);
    });
    label.textContent = `${f.name} · ${f.code}`;
    selected.textContent = `${f.name} (${f.code})`;
    paintSvg(f.hex);
  }

  function paintSvg(hex) {
    if (currentTarget === 'building') {
      const el = document.getElementById('metalEdgeBuilding');
      if (el) el.setAttribute('fill', hex);
    } else if (currentTarget === 'coping') {
      const el = document.getElementById('metalEdgeCoping');
      if (el) el.setAttribute('fill', hex);
    } else if (currentTarget === 'column') {
      const a = document.getElementById('metalEdgeColumn1');
      const b = document.getElementById('metalEdgeColumn2');
      if (a) a.setAttribute('fill', hex);
      if (b) b.setAttribute('fill', hex);
    }
  }
})();
