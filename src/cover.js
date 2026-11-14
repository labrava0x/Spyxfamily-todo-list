import './styles/cover.css';

export function initCover(onComplete) {
  localStorage.removeItem('wise_agent_name');
  
  const existingOverlay = document.getElementById('wise-dossier-overlay');
  if (existingOverlay) existingOverlay.remove();

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

  overlay.innerHTML = `
    <div style="position: relative; width: 600px; max-width: 90vw; background: #eedcb9; border: 3px solid #8b1e1e; padding: 45px 40px; box-shadow: 0 15px 35px rgba(0,0,0,0.8); text-align: center; color: #1c2624;">
      
      <!-- Top Secret Folder Tab -->
      <div style="position: absolute; top: -16px; left: 30px; background: #8b1e1e; color: #f7f1e1; padding: 3px 14px; font-size: 0.75rem; font-weight: bold; letter-spacing: 2.5px; border: 1px solid #1c2624;">
        TOP SECRET
      </div>
      
      <div style="width: 40px; height: 3px; background: #8b1e1e; margin: 0 auto 1.5rem auto;"></div>
      
      <!-- Clean Spy x Family Title Card Box -->
      <div style="margin: 0.5rem 0 2rem 0; background: #000000; padding: 24px 15px; box-shadow: 4px 4px 0px rgba(0,0,0,0.4);">
        <p id="welcome-message" style="font-family: 'Impact', 'Anton', 'Times New Roman', sans-serif; font-size: 2.1rem; letter-spacing: 3px; color: #ffffff; text-transform: uppercase; margin: 0; line-height: 1.2;">
          WELCOME <span id="agent-display-name">X</span> AGENT!
        </p>
      </div>

      <div style="margin-bottom: 2rem; text-align: left; background: #f4ebd9; padding: 15px; border: 1px dashed #8b1e1e;">
        <label for="agent-codename" style="display: block; font-size: 0.8rem; font-weight: bold; color: #8b1e1e; margin-bottom: 6px; letter-spacing: 1px;">
          ENTER AGENT CODENAME:
        </label>
        <input 
          type="text" 
          id="agent-codename" 
          value="" 
          placeholder="[Insert Codename]" 
          autocomplete="off"
          style="width: 100%; padding: 10px; font-family: 'Courier New', Courier, monospace; font-size: 1rem; border: 1px solid #1c2624; background: #fff; color: #1c2624; box-sizing: border-box; text-transform: uppercase;"
        />
      </div>

      <div id="threshold-btn" style="display: inline-block; border: 2px solid #8b1e1e; padding: 0.8rem 1.8rem; color: #f7f1e1; background: #8b1e1e; font-family: 'Impact', 'Anton', sans-serif; font-size: 1.1rem; letter-spacing: 1.5px; cursor: pointer; box-shadow: 3px 3px 0px rgba(0,0,0,0.3); transition: background 0.2s;">
        [ Authorize Agent ]
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const inputField = overlay.querySelector('#agent-codename');
  const displayNameSpan = overlay.querySelector('#agent-display-name');
  const btn = overlay.querySelector('#threshold-btn');

  inputField.focus();

  // Live-updates the title card banner text as you type
  inputField.addEventListener('input', (e) => {
    const val = e.target.value.trim().toUpperCase();
    displayNameSpan.textContent = val !== '' ? val : 'X';
  });

  const proceed = () => {
    const codename = inputField.value.trim() || 'X';
    localStorage.setItem('wise_agent_name', codename);

    btn.textContent = '[ Access granted. Status: Agent logged in ]';
    btn.style.background = '#2e6930';

    overlay.style.transition = 'opacity 0.4s ease';
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.remove();
        if (typeof onComplete === 'function') {
          onComplete(codename);
        }
      }, 400);
    }, 300);
  };

  window.addEventListener('keydown', function handleKey(e) {
    if (e.key === 'Enter') {
      window.removeEventListener('keydown', function handleKeyRef(evt) {
        if (evt.key === 'Enter') proceed();
      });
      proceed();
    }
  });

  btn.addEventListener('click', () => {
    proceed();
  });
}