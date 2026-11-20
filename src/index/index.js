import '../styles/style.css';
import '../styles/sss.css';
import '../styles/cover.css';
import { initCover } from '../cover.js';
import { 
  renderApp
} from '../dom.controllers/dom.controller.js';
import { 
  initLayout,
  setActiveCodename,
  renderAgentCodenameBadge,
  getCategories,
  saveCategories,
  applySavedTheme
} from '../dom.controllers/layout.js';
import { 
  initGlobalListeners 
} from '../dom.controllers/global.listeners.js';
import { 
  initDossierListeners 
} from '../dom.controllers/dossier.listeners.js';
import { 
  getProjects,
  saveAutomations,
  getAutomations,
  getCommsConfig,
  saveCommsConfig 
} from '../storage.js';
// Import from '../views/prep.render.js' in the view/listener module that renders Insights or Prepare:
// import { renderInsightsView, renderPrepareMissionView } from '../views/prep.render.js';

// Helper to ensure the main title always reads CLASSIFIED X DOSSIERS
const enforceClassifiedTitle = () => {
  const mainTitle = document.querySelector('h1');
  if (mainTitle && mainTitle.textContent !== 'CLASSIFIED X DOSSIERS') {
    mainTitle.textContent = 'CLASSIFIED X DOSSIERS';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  // Restore saved room light state immediately on load
  applySavedTheme();

  // 1. BOOT UP THE COVER SCREEN OVERLAY FIRST ON EVERY LOAD & IDLE RETURN
  initCover((codename, meta = {}) => {
    // 2. Once authorized, initialize layout, codename badge, modular listeners, and render views
    initLayout();
    setActiveCodename(codename, meta);
    applySavedTheme();
    initGlobalListeners();
    initDossierListeners();
    renderApp();
    renderAgentCodenameBadge(codename, meta.isReturn);
    enforceClassifiedTitle();
  });

  // Watch for DOM updates to keep the title and codename badge intact
  const observer = new MutationObserver(() => {
    enforceClassifiedTitle();
    if (document.getElementById('active-agent-badge') && !document.getElementById('active-agent-badge').innerHTML) {
      renderAgentCodenameBadge();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Global Keyboard Shortcuts (Ctrl+N to New)
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      const projectNameInput = document.getElementById('project-name');
      if (projectNameInput) {
        projectNameInput.focus();
      } else {
        const missionTitleInput = document.getElementById('mission-title');
        if (missionTitleInput) missionTitleInput.focus();
      }
    }
  });

  // Backups and File Imports (Event Delegation for non-view buttons)
  if (!window._globalBackupsInitialized) {
    window._globalBackupsInitialized = true;
    
    document.addEventListener('click', (e) => {
      // 1. Export JSON Backup Button
      const exportBtn = e.target.closest('#export-json-btn');
      if (exportBtn) {
        const backupData = {
          projects: getProjects(),
          categories: getCategories(),
          automations: getAutomations(),
          commsConfig: getCommsConfig(),
          exportDate: new Date().toISOString()
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `classified_dossiers_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        return;
      }
    });

    // 2. Import JSON File Change Delegation
    document.addEventListener('change', (e) => {
      const fileInput = e.target.closest('#import-json-file');
      if (!fileInput) return;

      const file = fileInput.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed.projects) {
            localStorage.setItem('wise_projects', JSON.stringify(parsed.projects));
          }
          if (parsed.categories) {
            saveCategories(parsed.categories);
          }
          if (parsed.automations) {
            saveAutomations(parsed.automations);
          }
          if (parsed.commsConfig) {
            saveCommsConfig(parsed.commsConfig);
          }
          alert("📁 Dossier backup successfully restored!");
          window.location.reload();
        } catch (err) {
          alert("❌ Failed to parse backup JSON file: " + err.message);
        }
      };
      reader.readAsText(file);
    });
  }
});