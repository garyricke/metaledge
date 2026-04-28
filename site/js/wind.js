// Wind Load Calculator — simplified ASCE 7-22 component-and-cladding estimator.
// Outputs the design uplift pressure at the perimeter zone and the corresponding
// minimum ES-1 pressure rating. NOT an engineering tool — for spec-stage estimates only.
(function () {
  const speedEl    = document.getElementById('wind-speed');
  const heightEl   = document.getElementById('wind-height');
  const expEl      = document.getElementById('wind-exposure');
  const riskEl     = document.getElementById('wind-risk');
  const button     = document.getElementById('windCalc');

  const out = {
    qz:        document.getElementById('windQz'),
    gcp:       document.getElementById('windGcp'),
    gcpCorner: document.getElementById('windGcpCorner'),
    uplift:    document.getElementById('windUplift'),
    rating:    document.getElementById('windRating'),
  };

  if (!button) return;

  function calc() {
    const V = Number(speedEl.value) || 115;
    const h = Number(heightEl.value) || 30;
    const exposure = expEl.value;
    const risk = riskEl.value;

    // Importance factor (per ASCE 7-22 risk category — applied conservatively as Iw on V^2)
    const Iw = { I: 0.87, II: 1.0, III: 1.15, IV: 1.15 }[risk] || 1.0;

    // Velocity pressure exposure coefficient Kz — simplified table per exposure
    // (smooth interpolation between 15ft and 200ft using ASCE Table 26.10-1 baselines)
    const Kz = computeKz(h, exposure);

    // Topographic factor Kzt = 1.0 (flat), Directionality Kd = 0.85 for buildings
    const Kzt = 1.0;
    const Kd = 0.85;

    // Velocity pressure (psf): qz = 0.00256 * Kz * Kzt * Kd * V^2 * Iw
    const qz = 0.00256 * Kz * Kzt * Kd * (V * V) * Iw;

    // Components and cladding GCp for parapet/edge zone (Zone 2) and corner (Zone 3) — uplift
    // Tributary area assumed 10 sf for edge profile (worst case)
    const gcpEdge   = -1.7;
    const gcpCorner = -2.6;
    const gcpi      = 0.18; // enclosed building internal pressure coefficient

    const pEdge   = qz * (gcpEdge   - gcpi); // negative = uplift
    const pCorner = qz * (gcpCorner - gcpi);

    const upliftEdge = Math.abs(pEdge);
    const upliftCorner = Math.abs(pCorner);

    // ES-1 rating bands (commercially available): 60, 90, 120, 165, 195 psf
    const bands = [60, 90, 120, 165, 195];
    const required = bands.find(b => b >= upliftCorner) || `>${bands.at(-1)}`;

    out.qz.textContent          = `${qz.toFixed(1)} psf`;
    out.gcp.textContent         = gcpEdge.toFixed(2);
    out.gcpCorner.textContent   = gcpCorner.toFixed(2);
    out.uplift.textContent      = `${upliftEdge.toFixed(0)} psf`;
    out.rating.textContent      = `≥ ${required} psf · Corner zone`;
  }

  // Approximation of Kz from ASCE Table 26.10-1 simplified: power-law alpha & zg per exposure
  function computeKz(z, exposure) {
    const params = {
      B: { alpha: 7.0,   zg: 1200 },
      C: { alpha: 9.5,   zg: 900  },
      D: { alpha: 11.5,  zg: 700  },
    }[exposure] || { alpha: 9.5, zg: 900 };
    const zClamp = Math.max(z, 15);
    return 2.01 * Math.pow(zClamp / params.zg, 2 / params.alpha);
  }

  button.addEventListener('click', calc);
  // Recalc live as user edits inputs
  [speedEl, heightEl, expEl, riskEl].forEach(el => el.addEventListener('change', calc));
  calc();
})();
