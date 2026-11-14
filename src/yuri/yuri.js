import '../styles/style.css';
import '../styles/sss.css';
import '../styles/cover.css';
import { initCover } from '../cover.js';
import { renderApp, setCurrentViewMode } from '../dom.controllers/dom.controller.js';
import { initLayout } from '../dom.controllers/layout.js';
import { initGlobalListeners } from '../dom.controllers/global.listeners.js';
import { initDossierListeners } from '../dom.controllers/dossier.listeners.js';
import { setCurrentProjectIndex, getProjects } from '../storage.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. BOOT UP THE COVER SCREEN OVERLAY FIRST ON EVERY LOAD
  initCover((codename) => {
    // 2. Initialize the official shared layout
    initLayout();

    // 3. Lock context specifically to Yuri's project index in localStorage
    const projects = getProjects();
    const yuriIndex = projects.findIndex(p => p.name && (p.name.toLowerCase().includes('sss') || p.name.toLowerCase().includes('yuri')));
    if (yuriIndex !== -1) {
      setCurrentProjectIndex(yuriIndex);
    }

    // 4. Bind modular event listeners and render the app
    initGlobalListeners();
    initDossierListeners();
    renderApp();
  });

  // 5. Handle internal view tab switching cleanly using classes only (no inline color injection)
  document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.view-tab-btn');
    if (!viewBtn) return;

    document.querySelectorAll('.view-tab-btn').forEach(b => {
      b.classList.remove('active');
    });
    viewBtn.classList.add('active');

    const id = viewBtn.id || '';
    const text = viewBtn.textContent.trim().toLowerCase();

    let mode = 'board';
    if (text.includes('calendar') || id.includes('calendar')) mode = 'calendar';
    else if (text.includes('prepare') || id.includes('prepare')) mode = 'prepare';
    else if (text.includes('insights') || id.includes('insights')) mode = 'insights';
    else if (text.includes('table') || id.includes('table')) mode = 'table';
    else if (text.includes('dev') || id.includes('dev')) mode = 'developer';
    else if (text.includes('comms') || text.includes('automations') || id.includes('automations')) mode = 'automations';

    setCurrentViewMode(mode);
    renderApp();
  });
});