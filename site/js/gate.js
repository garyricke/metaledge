(function () {
  const PASS = 'metaledgerules';
  const KEY  = 'me_auth';

  if (sessionStorage.getItem(KEY) === '1') return;

  const overlay = document.createElement('div');
  overlay.id = 'gate';
  overlay.innerHTML = `
    <div id="gate-box">
      <img src="assets/images/logos/Metal-Edge-Logo-on-dark.svg" alt="Metal Edge" id="gate-logo">
      <p id="gate-label">Enter preview password</p>
      <input id="gate-input" type="password" placeholder="Password" autocomplete="current-password">
      <button id="gate-btn">Enter</button>
      <p id="gate-error" hidden>Incorrect password</p>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #gate {
      position: fixed; inset: 0; z-index: 99999;
      background: #0E1829;
      display: flex; align-items: center; justify-content: center;
    }
    #gate-box {
      display: flex; flex-direction: column; align-items: center;
      gap: 16px; padding: 48px 40px;
      background: #152239;
      border-radius: 8px;
      box-shadow: 0 24px 64px rgba(0,0,0,0.6);
      max-width: 360px; width: 90%;
    }
    #gate-logo { height: 48px; width: auto; }
    #gate-label {
      margin: 0; font-family: sans-serif; font-size: 14px;
      color: rgba(255,255,255,0.6); letter-spacing: 0.04em;
    }
    #gate-input {
      width: 100%; box-sizing: border-box;
      padding: 12px 16px; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 4px; background: rgba(255,255,255,0.06);
      color: #fff; font-size: 15px; outline: none;
    }
    #gate-input:focus { border-color: #C8732D; }
    #gate-btn {
      width: 100%; padding: 13px;
      background: #C8732D; color: #fff; border: none;
      border-radius: 4px; font-size: 14px; font-weight: 600;
      letter-spacing: 0.08em; text-transform: uppercase;
      cursor: pointer; transition: background 0.15s;
    }
    #gate-btn:hover { background: #a85e22; }
    #gate-error { margin: 0; color: #e05c5c; font-family: sans-serif; font-size: 13px; }
  `;

  document.head.appendChild(style);
  document.body.appendChild(overlay);

  function attempt() {
    const val = document.getElementById('gate-input').value;
    const err = document.getElementById('gate-error');
    if (val === PASS) {
      sessionStorage.setItem(KEY, '1');
      overlay.remove();
      style.remove();
    } else {
      err.hidden = false;
      document.getElementById('gate-input').value = '';
      document.getElementById('gate-input').focus();
    }
  }

  document.getElementById('gate-btn').addEventListener('click', attempt);
  document.getElementById('gate-input').addEventListener('keydown', function (e) {
    if (e.key === 'Enter') attempt();
  });
})();
