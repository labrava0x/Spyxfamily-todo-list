import './styles/cover.css';

const CODENAME_KEY = 'wise_agent_name';
const PASSKEY_KEY = 'wise_agent_passkey';
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes of inactivity

let idleTimerId = null;
let activityListenersBound = false;
let latestOnComplete = null;
let overlayOpen = false;

export function initCover(onComplete) {
  latestOnComplete = onComplete;
  bindIdleMonitor();
  openCoverModal({ isReturningFromIdle: false });
}

function bindIdleMonitor() {
  if (typeof window === 'undefined' || activityListenersBound) return;
  activityListenersBound = true;

  const resetTimer = () => {
    if (idleTimerId) {
      clearTimeout(idleTimerId);
    }

    const savedCodename = (localStorage.getItem(CODENAME_KEY) || '').trim();
    const savedPasskey = localStorage.getItem(PASSKEY_KEY) || '';
    if (!savedCodename || !savedPasskey) return;

    idleTimerId = setTimeout(() => {
      if (!overlayOpen && typeof latestOnComplete === 'function') {
        openCoverModal({ isReturningFromIdle: true });
      }
    }, IDLE_TIMEOUT_MS);
  };

  ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((evtName) => {
    window.addEventListener(evtName, resetTimer, { passive: true });
  });

  resetTimer();
}

function openCoverModal({ isReturningFromIdle = false } = {}) {
  const onComplete = latestOnComplete;
  const existingOverlay = document.getElementById('wise-dossier-overlay');
  if (existingOverlay) existingOverlay.remove();

  overlayOpen = true;

  const savedCodename = (localStorage.getItem(CODENAME_KEY) || '').trim();
  const savedPasskey = localStorage.getItem(PASSKEY_KEY) || '';
  const hasRegisteredAgent = Boolean(savedCodename && savedPasskey);

  const overlay = document.createElement('div');
  overlay.id = 'wise-dossier-overlay';
  overlay.style.cssText = `
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    background: rgba(10, 8, 5, 0.95) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    z-index: 2147483647 !important;
    font-family: 'Courier New', Courier, monospace !important;
    margin: 0 !important;
    padding: 0 !important;
    box-sizing: border-box !important;
  `;

  const bannerText = hasRegisteredAgent
    ? (isReturningFromIdle
      ? `STATION LOCKED — ARE YOU AGENT <span id="agent-display-name">${savedCodename.toUpperCase()}</span> ?`
      : `ARE YOU AGENT <span id="agent-display-name">${savedCodename.toUpperCase()}</span> ?`)
    : `WELCOME <span id="agent-display-name">${savedCodename ? savedCodename.toUpperCase() : 'X'}</span> AGENT!`;

  const passkeyLabel = hasRegisteredAgent
    ? 'ENTER CUSTOM PASSWORD TO VERIFY:'
    : 'SET CUSTOM PASSWORD (FIRST LOAD):';

  const passkeyPlaceholder = hasRegisteredAgent
    ? '[Enter Your Custom Password]'
    : '[Create Custom Password]';

  overlay.innerHTML = `
    <div style="position: relative; width: 600px; max-width: 90vw; background: #eedcb9; border: 3px solid #8b1e1e; padding: 45px 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.8); text-align: center; color: #1c2624;">
      <div style="position: absolute; top: -16px; left: 30px; background: #8b1e1e; color: #f7f1e1; padding: 3px 14px; font-size: 0.75rem; font-weight: bold; letter-spacing: 2.5px; border: 1px solid #1c2624;">
        TOP SECRET
      </div>

      <div style="width: 40px; height: 3px; background: #8b1e1e; margin: 0 auto 1.5rem auto;"></div>

      <div style="margin: 0.5rem 0 2rem 0; background: #000000; padding: 24px 15px; box-shadow: 4px 4px 0px rgba(0,0,0,0.4);">
        <p id="welcome-message" style="font-family: 'Impact', 'Anton', 'Times New Roman', sans-serif; font-size: 1.85rem; letter-spacing: 2px; color: #ffffff; text-transform: uppercase; margin: 0; line-height: 1.25;">
          ${bannerText}
        </p>
      </div>

      <div style="margin-bottom: 1.2rem; text-align: left; background: #f4ebd9; padding: 15px; border: 1px dashed #8b1e1e;">
        <label for="agent-codename" style="display: block; font-size: 0.8rem; font-weight: bold; color: #8b1e1e; margin-bottom: 6px; letter-spacing: 1px;">
          ${hasRegisteredAgent ? 'CONFIRM AGENT CODENAME:' : 'ENTER AGENT CODENAME:'}
        </label>
        <input
          type="text"
          id="agent-codename"
          value=""
          placeholder="${hasRegisteredAgent ? `[Confirm ${savedCodename}]` : '[Insert Codename]'}"
          autocomplete="off"
          style="width: 100%; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 1rem; border: 1px solid #1c2624; background: #fff; color: #1c2624; box-sizing: border-box; text-transform: uppercase;"
        />
      </div>

      <div style="margin-bottom: 1.8rem; text-align: left; background: #f4ebd9; padding: 15px; border: 1px dashed #8b1e1e;">
        <label for="agent-passkey" style="display: block; font-size: 0.8rem; font-weight: bold; color: #8b1e1e; margin-bottom: 6px; letter-spacing: 1px;">
          ${passkeyLabel}
        </label>
        <input
          type="password"
          id="agent-passkey"
          value=""
          placeholder="${passkeyPlaceholder}"
          autocomplete="${hasRegisteredAgent ? 'current-password' : 'new-password'}"
          style="width: 100%; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 1rem; border: 1px solid #1c2624; background: #fff; color: #1c2624; box-sizing: border-box;"
        />
        <p id="cover-error-msg" style="display: none; margin: 8px 0 0 0; font-size: 0.82rem; font-weight: bold; color: #8b1e1e;"></p>
      </div>

      <div id="threshold-btn" style="display: inline-block; border: 2px solid #8b1e1e; padding: 0.8rem 1.8rem; color: #f7f1e1; background: #8b1e1e; font-family: 'Impact', 'Anton', sans-serif; font-size: 1.1rem; letter-spacing: 1.5px; cursor: pointer; box-shadow: 3px 3px 0px rgba(0,0,0,0.3); transition: background 0.2s;">
        [ Authorize Agent ]
      </div>

      ${hasRegisteredAgent ? `
        <div style="margin-top: 1.2rem;">
          <button type="button" id="reset-agent-btn" style="background: transparent; border: none; color: #4a3d28; text-decoration: underline; font-family: 'Courier New', Courier, monospace; font-size: 0.78rem; cursor: pointer;">
            Reset Saved Codename & Password
          </button>
        </div>
      ` : ''}
    </div>
  `;

  document.body.appendChild(overlay);

  const inputField = overlay.querySelector('#agent-codename');
  const passkeyField = overlay.querySelector('#agent-passkey');
  const displayNameSpan = overlay.querySelector('#agent-display-name');
  const errorMsg = overlay.querySelector('#cover-error-msg');
  const btn = overlay.querySelector('#threshold-btn');
  const resetBtn = overlay.querySelector('#reset-agent-btn');

  if (inputField) {
    inputField.focus();
    inputField.addEventListener('input', (e) => {
      const val = e.target.value.trim().toUpperCase();
      if (hasRegisteredAgent) {
        displayNameSpan.textContent = val !== '' ? val : savedCodename.toUpperCase();
      } else {
        displayNameSpan.textContent = val !== '' ? val : 'X';
      }
    });
  }

  const showError = (message) => {
    if (!errorMsg) return;
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
  };

  let isGranting = false;

  const finishUnlock = (finalCodename, wasReturning) => {
    isGranting = true;
    if (errorMsg) errorMsg.style.display = 'none';
    btn.textContent = '[ Access granted. Status: Agent logged in ]';
    btn.style.background = '#2e6930';

    overlay.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        window.removeEventListener('keydown', handleKeyDown);
        overlay.remove();
        overlayOpen = false;
        bindIdleMonitor();
        if (typeof onComplete === 'function') {
          onComplete(finalCodename, { isReturn: wasReturning });
        }
      }, 400);
    }, 300);
  };

  const proceed = () => {
    if (isGranting) return;

    const typedCodename = inputField ? inputField.value.trim() : '';
    const enteredPasskey = passkeyField ? passkeyField.value : '';

    if (hasRegisteredAgent) {
      if (!typedCodename) {
        showError(`ENTER YOUR CODENAME (${savedCodename}) TO VERIFY.`);
        return;
      }
      if (typedCodename.toLowerCase() !== savedCodename.toLowerCase()) {
        showError('CODENAME DOES NOT MATCH REGISTERED AGENT.');
        return;
      }
      if (!enteredPasskey) {
        showError('ENTER YOUR CUSTOM PASSWORD TO VERIFY IDENTITY.');
        return;
      }
      if (enteredPasskey !== savedPasskey) {
        showError('PASSWORD MISMATCH. ACCESS DENIED.');
        return;
      }

      finishUnlock(savedCodename, true);
      return;
    }

    const codename = typedCodename || 'X';
    if (!enteredPasskey.trim()) {
      showError('PLEASE SET A CUSTOM PASSWORD FIRST.');
      return;
    }

    localStorage.setItem(CODENAME_KEY, codename);
    localStorage.setItem(PASSKEY_KEY, enteredPasskey);
    finishUnlock(codename, false);
  };

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      localStorage.removeItem(CODENAME_KEY);
      localStorage.removeItem(PASSKEY_KEY);
      window.removeEventListener('keydown', handleKeyDown);
      overlayOpen = false;
      openCoverModal({ isReturningFromIdle: false });
    });
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && document.body.contains(overlay)) {
      e.preventDefault();
      proceed();
    }
  };

  window.addEventListener('keydown', handleKeyDown);

  btn.addEventListener('click', () => {
    proceed();
  });
}