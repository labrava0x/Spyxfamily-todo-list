import '../styles/style.css';
import '../styles/cover.css';
import '../styles/commhub.css';
import { initCover } from '../cover.js';
import { renderApp, setCurrentViewMode } from '../dom.controllers/dom.controller.js';
import { initGlobalListeners } from '../dom.controllers/global.listeners.js';
import { initOperationsListeners } from './operations.listeners.js';

function renderCommsHubPage() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <!-- Central Operations Terminal Container -->
    <div class="dossier-folder comms-hub-folder">
      <h2>📡 CENTRAL OPERATIONS: ANYA KNOWS WHAT YOU ARE THINKING!</h2>

      <div class="bond-comms-banner">
        <span>🐕‍🦺 UPLINK STATUS: SECURE (BOND ON GUARD)</span>
        <p>"Bork!" — *Bond is monitoring future data packets for incoming threats, dangerous missions, and snack deliveries.*</p>
      </div>

      <nav class="project-tab-wrapper comms-sub-tabs">
        <button type="button" id="view-board-btn" class="project-btn active view-tab-btn" data-target="board">Board</button>
        <button type="button" id="view-calendar-btn" class="project-btn view-tab-btn" data-target="calendar">📅 Calendar</button>
        <button type="button" id="view-prepare-btn" class="project-btn view-tab-btn" data-target="prepare">🎯 Prepare</button>
        <button type="button" id="view-insights-btn" class="project-btn view-tab-btn" data-target="insights">📊 Insights</button>
        <button type="button" id="view-table-btn" class="project-btn view-tab-btn" data-target="table">Table Log</button>
        <button type="button" id="view-developer-btn" class="project-btn view-tab-btn" data-target="developer">💻 Dev</button>
        <button type="button" id="view-automations-btn" class="project-btn view-tab-btn" data-target="automations">⚡ Comms Relays</button>
      </nav>

      <main id="main-content-container">
        <div id="mission-container"></div>
      </main>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  initCover((codename) => {
    renderCommsHubPage();
    setCurrentViewMode('board');
    initGlobalListeners();
    initOperationsListeners();
    renderApp();

    // Find Central Operations folder container
    const commsFolder = document.querySelector('.comms-hub-folder'); 

    // Create the wrapper div 
    const bowWrapper = document.createElement('div'); 

    // Apply the "sandwich" and overlap styles 
    bowWrapper.style.display = 'flex'; 
    bowWrapper.style.justifyContent = 'center'; 
    bowWrapper.style.alignItems = 'center'; 
    bowWrapper.style.width = '100%'; 
    bowWrapper.style.marginTop = '15px'; 
    bowWrapper.style.marginBottom = '15px'; 
    bowWrapper.style.position = 'relative'; 
    bowWrapper.style.zIndex = '10'; 

    // Draw the bow tie using SVG (scaled up for perfect visibility)
    bowWrapper.innerHTML = ` 
      <svg width="140" height="70" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg"> 
        <!-- Left Wing --> 
        <path d="M 5,10 Q 30,25 5,40 Q 35,45 48,25 Q 35,5 5,10 Z" fill="#111111" /> 
        <!-- Right Wing --> 
        <path d="M 95,10 Q 70,25 95,40 Q 65,45 52,25 Q 65,5 95,10 Z" fill="#111111" /> 
        <!-- Center Knot --> 
        <rect x="42" y="15" width="16" height="20" rx="3" fill="#000000" /> 
      </svg> 
    `; 

    bowWrapper.style.filter = 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))';  

    // Insert it right before Central Operations (directly under the top tabs)
    if (commsFolder) {
        commsFolder.insertAdjacentElement('beforebegin', bowWrapper);
    } else {
        console.warn("Could not find comms folder!");
    }
  });

  document.addEventListener('click', (e) => {
    const viewBtn = e.target.closest('.view-tab-btn');
    if (!viewBtn) return;

    document.querySelectorAll('.view-tab-btn').forEach(b => b.classList.remove('active'));
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