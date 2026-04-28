// Submittal Wizard — 4-step flow with output summary on the final pane
(function () {
  const wizard = document.getElementById('wizard');
  if (!wizard) return;

  const stepIndicators = wizard.querySelectorAll('.step');
  const panes = wizard.querySelectorAll('.wizard-step');
  const back = document.getElementById('wizardBack');
  const next = document.getElementById('wizardNext');
  const summaryEl = document.getElementById('wizardSummary');
  const totalSteps = panes.length;
  let step = 1;

  const setStep = (n) => {
    step = Math.min(Math.max(n, 1), totalSteps);
    panes.forEach(p => {
      const idx = Number(p.dataset.pane);
      const active = idx === step;
      p.classList.toggle('is-active', active);
      p.hidden = !active;
    });
    stepIndicators.forEach(s => {
      const idx = Number(s.dataset.step);
      s.classList.toggle('is-active', idx === step);
      s.classList.toggle('is-complete', idx < step);
    });
    back.disabled = step === 1;
    if (step === totalSteps) {
      next.textContent = 'Restart →';
      renderSummary();
    } else if (step === totalSteps - 1) {
      next.textContent = 'Generate Package →';
    } else {
      next.textContent = 'Next Step →';
    }
  };

  const collect = () => {
    const membrane = wizard.querySelector('input[name="membrane"]:checked')?.value || '—';
    const profiles = Array.from(wizard.querySelectorAll('input[name="profile"]:checked')).map(p => p.value);
    const name = document.getElementById('wiz-name')?.value || '';
    const firm = document.getElementById('wiz-firm')?.value || '';
    const email = document.getElementById('wiz-email')?.value || '';
    const zip = document.getElementById('wiz-zip')?.value || '';
    return { membrane, profiles, name, firm, email, zip };
  };

  const renderSummary = () => {
    const d = collect();
    const profileList = d.profiles.length ? d.profiles.join(' · ') : '—';
    const docs = [];
    if (d.profiles.includes('Coping')) docs.push('Coping CAD detail (RE-3 cert.)');
    if (d.profiles.includes('Fascia')) docs.push('Fascia CAD detail (RE-2 cert.)');
    if (d.profiles.includes('Drip Edge')) docs.push('Drip edge detail (RE-1 cert.)');
    if (d.profiles.includes('Gravel Stop')) docs.push('Gravel stop assembly');
    docs.push(`${d.membrane} compatibility sheet`);
    docs.push('SDS (paint + adhesive)');
    docs.push('Master spec language');

    summaryEl.innerHTML = `
      <div class="output__row"><span class="output__label">Membrane</span><span class="output__value">${escapeHtml(d.membrane)}</span></div>
      <div class="output__row"><span class="output__label">Edge profiles</span><span class="output__value">${escapeHtml(profileList)}</span></div>
      <div class="output__row"><span class="output__label">Routed to</span><span class="output__value">${escapeHtml(d.name || 'Anonymous')}${d.firm ? ', ' + escapeHtml(d.firm) : ''}</span></div>
      <div class="output__row"><span class="output__label">Project ZIP</span><span class="output__value">${escapeHtml(d.zip || '—')}</span></div>
      <div style="border-top: 1px solid rgba(255,255,255,0.18); padding-top: var(--space-3); margin-top: var(--space-3);">
        <span class="output__label" style="display: block; margin-bottom: var(--space-2);">Bundled package · ${docs.length} documents</span>
        <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 4px;">
          ${docs.map(doc => `<li style="display:flex;gap:8px;align-items:center;color:var(--blue-100);font-size:var(--fs-sm);"><span style="color:var(--copper-400);">▸</span>${escapeHtml(doc)}</li>`).join('')}
        </ul>
      </div>
      <div style="margin-top: var(--space-4);">
        <a href="#" class="btn btn--primary btn--block" onclick="event.preventDefault(); this.textContent='Sent to ${escapeHtml(d.email || 'your inbox')} ✓'; this.classList.add('btn--navy');">Email me the package</a>
      </div>
    `;
  };

  next.addEventListener('click', () => {
    if (step === totalSteps) setStep(1);
    else setStep(step + 1);
  });
  back.addEventListener('click', () => setStep(step - 1));

  // Allow click on step indicators to jump backwards
  stepIndicators.forEach(s => {
    s.addEventListener('click', () => {
      const idx = Number(s.dataset.step);
      if (idx <= step) setStep(idx);
    });
    s.style.cursor = 'pointer';
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }

  setStep(1);
})();
