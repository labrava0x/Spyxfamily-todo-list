import { getProjects, getCurrentProjectIndex, setCurrentProjectIndex } from '../storage.js';

const DEFAULT_CATEGORIES = ['Mission', 'Personal', 'Job'];
const CODENAME_KEY = 'wise_agent_name';

let activeCommsTab = 'board';
let activeSessionCodename = '';

function normalizeCodename(raw) {
  if (!raw) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object') {
    const val = raw.codename ?? raw.name ?? raw.value ?? '';
    return String(val).trim();
  }
  return String(raw).trim();
}

export function setActiveCodename(rawCodename) {
  const cleanName = normalizeCodename(rawCodename);
  if (cleanName) {
    activeSessionCodename = cleanName;
    localStorage.setItem(CODENAME_KEY, cleanName);
  }
  renderAgentCodenameBadge(cleanName || activeSessionCodename);
  return cleanName;
}

export function getActiveCodename() {
  if (activeSessionCodename) return activeSessionCodename;
  const saved = localStorage.getItem(CODENAME_KEY);
  if (saved && saved.trim()) {
    activeSessionCodename = saved.trim();
    return activeSessionCodename;
  }
  return '';
}

export function renderAgentCodenameBadge(rawCodename = '') {
  const explicit = normalizeCodename(rawCodename);
  const codename = explicit || getActiveCodename();

  if (explicit) {
    activeSessionCodename = explicit;
    localStorage.setItem(CODENAME_KEY, explicit);
  }

  const badge = document.getElementById('active-agent-badge');
  if (!badge) return;

  if (codename) {
    badge.innerHTML = `<span class="inside-codename-tab">TOP SECRET</span><span class="inside-codename-bar">Agent X ${codename} is in</span>`;
    badge.classList.add('authorized');
  } else {
    badge.innerHTML = `<span class="inside-codename-tab">TOP SECRET</span><span class="inside-codename-bar">Agent X is awaiting entry</span>`;
    badge.classList.remove('authorized');
  }
}

if (typeof window !== 'undefined' && !window._wiseAgentNameSyncBound) {
  window._wiseAgentNameSyncBound = true;

  window.addEventListener('storage', (e) => {
    if (e.key === CODENAME_KEY) {
      activeSessionCodename = (e.newValue || '').trim();
      renderAgentCodenameBadge(activeSessionCodename);
    }
  });
}

function toggleRoomLightState(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const hasClickedBefore = localStorage.getItem('wise_light_clicked') === 'true';
  const currentlyOff = localStorage.getItem('wise_light_off') === 'true';

  let nextOff;
  if (!hasClickedBefore) {
    // 1st click -> Light ON (BRIGHTER)
    localStorage.setItem('wise_light_clicked', 'true');
    nextOff = false;
  } else {
    // 2nd click -> Light OFF (DARKER), 3rd click -> Light ON (BRIGHTER), 4th click -> Light OFF (DARKER)...
    nextOff = !currentlyOff;
  }

  localStorage.setItem('wise_light_off', String(nextOff));
  applySavedTheme();
}

export function setActiveCommsTab(tabName = 'board') {
  activeCommsTab = String(tabName || 'board').trim().toLowerCase();
  syncCommsSubTabs();
}

export function syncCommsSubTabs(tabName = activeCommsTab) {
  const normalized = String(tabName || 'board').trim().toLowerCase();
  activeCommsTab = normalized;

  const subTabButtons = document.querySelectorAll('.comms-sub-tabs .view-tab-btn');
  subTabButtons.forEach((btn) => {
    const target = (btn.getAttribute('data-target') || '').trim().toLowerCase();
    const isCurrent = target === normalized;
    btn.classList.toggle('active', isCurrent);
    btn.setAttribute('aria-pressed', String(isCurrent));
  });
}

export function getCategories() {
  const saved = localStorage.getItem('wise_categories');
  return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
}

export function saveCategories(categories) {
  localStorage.setItem('wise_categories', JSON.stringify(categories));
}

export function renderCategoryDropdown() {
  const select = document.getElementById('mission-category');
  if (!select) return;

  const categories = getCategories();
  select.innerHTML = '';
  categories.forEach((cat) => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

export function renderProjectsNav() {
  const container = document.getElementById('project-nav');
  if (!container) return;

  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();

  container.innerHTML = '';
  projects.forEach((project, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `project-tab-btn ${index === currentIndex ? 'active' : ''}`;
    btn.textContent = project.name;
    btn.addEventListener('click', () => {
      setCurrentProjectIndex(index);
      if (typeof window.renderApp === 'function') window.renderApp();
    });
    container.appendChild(btn);
  });
}

export function renderProjectDropdown() {
  const select = document.getElementById('mission-project');
  if (!select) return;

  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();

  select.innerHTML = '';
  projects.forEach((project, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = project.name;
    if (index === currentIndex) opt.selected = true;
    select.appendChild(opt);
  });
}

export function applySavedTheme() {
  const hasClickedBefore = localStorage.getItem('wise_light_clicked') === 'true';
  const isLightOff = localStorage.getItem('wise_light_off') === 'true';
  const isLightOnBright = hasClickedBefore && !isLightOff;

  document.documentElement.classList.toggle('lights-dimmed', isLightOff);
  document.body.classList.toggle('lights-dimmed', isLightOff);

  document.documentElement.classList.toggle('light-on-bright', isLightOnBright);
  document.body.classList.toggle('light-on-bright', isLightOnBright);

  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  if (themeToggleBtn) {
    themeToggleBtn.setAttribute('aria-pressed', String(!isLightOff));
    themeToggleBtn.textContent = isLightOff ? '🔌 Light: OFF' : '💡 Light: ON';
    themeToggleBtn.onclick = toggleRoomLightState;
  }
}

export function initLayout() {
  const app = document.getElementById('app');
  if (!app) return;

  const path = window.location.pathname;
  const isYuriPage = path.includes('yuri');
  const isOperationsPage = path.includes('operations');

  if (isYuriPage) {
    document.body.classList.add('sss-agency-theme');
  } else {
    document.body.classList.remove('sss-agency-theme');
  }

  if (isOperationsPage) {
    if (!document.getElementById('comms-hub-shell')) {
      app.innerHTML = `
        <div id="comms-hub-shell">
          <header class="title-card-header" style="margin-bottom: 1rem;">
            <div class="header-top-bar">
              <div id="active-agent-badge" class="inside-codename-container" aria-live="polite"></div>
              <div class="header-actions">
                <button type="button" id="theme-toggle-btn" class="secondary-btn">💡 Light: ON</button>
                <button type="button" id="export-json-btn" class="secondary-btn">💾 Export Backup</button>
                <label class="secondary-btn file-input-label">
                  📂 Import Backup <input type="file" id="import-json-file" accept=".json" style="display: none;" />
                </label>
              </div>
            </div>
            <div>
              <h1>CLASSIFIED X DOSSIERS</h1>
            </div>

            <div class="agency-selector" style="margin-top: 1.5rem;">
              <div class="agency-links">
                <a href="index.html" class="agency-tab-btn">📁 WISE HQ</a>
                <a href="yuri.html" class="agency-tab-btn">🕵️ SSS Bureau</a>
                <a href="operations.html" class="agency-tab-btn active">⚡ Comms Hub</a>
              </div>
            </div>
          </header>

          <div style="display: flex; justify-content: center; align-items: center; width: 100%; margin: 15px 0; position: relative; z-index: 10; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3));">
            <svg width="140" height="70" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
              <path d="M 5,10 Q 30,25 5,40 Q 35,45 48,25 Q 35,5 5,10 Z" fill="#111111" />
              <path d="M 95,10 Q 70,25 95,40 Q 65,45 52,25 Q 65,5 95,10 Z" fill="#111111" />
              <rect x="42" y="15" width="16" height="20" rx="3" fill="#000000" />
            </svg>
          </div>

          <div class="dossier-folder comms-hub-folder" style="max-width: 1400px; margin: 0 auto;">
            <div class="archive-subtitle comms-hub-sticker-tab">COMMS HUB // TOP SECRET</div>
            <h2>CENTRAL OPERATIONS: ANYA KNOWS WHAT YOU ARE THINKING!</h2>

            <div class="bond-comms-banner">
              <span style="font-family: 'Anton', sans-serif; font-size: 1.1rem; color: #1f2421; letter-spacing: 1px;">🐕‍🦺 UPLINK STATUS: SECURE (BOND ON GUARD)</span>
              <p style="margin: 0.4rem 0 0 0; font-size: 0.85rem; opacity: 0.85;">
                "Bork!" — *Bond is monitoring future data packets for incoming threats and snack deliveries.*
              </p>
            </div>

            <nav class="project-tab-wrapper comms-sub-tabs" style="margin-bottom: 2rem; display: flex; gap: 8px; flex-wrap: wrap;">
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
        </div>
      `;
    }

    syncCommsSubTabs(activeCommsTab);
    renderAgentCodenameBadge();
    setupThemeToggle();
    return;
  }

  const archiveSubtitle = isYuriPage ? 'SSS ARCHIVES // TOP SECRET' : 'WISE ARCHIVES // TOP SECRET';
  const operationLabel = isYuriPage ? 'State Security Operation' : 'Target Operation';
  const establishOpHeading = isYuriPage ? 'Establish Surveillance' : 'Establish Operation';
  const establishMissionHeading = isYuriPage ? 'Establish State Directive' : 'Establish mission';

  app.innerHTML = `
    <header class="title-card-header">
      <div class="header-top-bar">
        <div id="active-agent-badge" class="inside-codename-container" aria-live="polite"></div>
        <div class="header-actions">
          <button type="button" id="theme-toggle-btn" class="secondary-btn">💡 Light: ON</button>
          <button type="button" id="export-json-btn" class="secondary-btn">💾 Export Backup</button>
          <label class="secondary-btn file-input-label">
            📂 Import Backup <input type="file" id="import-json-file" accept=".json" style="display: none;" />
          </label>
        </div>
      </div>
      <div>
        <h1>CLASSIFIED X DOSSIERS</h1>
      </div>

      <div class="agency-selector">
        <div class="agency-links">
          <a href="index.html" class="agency-tab-btn ${!isYuriPage && !isOperationsPage ? 'active' : ''}">📁 WISE HQ</a>
          <a href="yuri.html" class="agency-tab-btn ${isYuriPage ? 'active' : ''}">🕵️ SSS Bureau</a>
          <a href="operations.html" class="agency-tab-btn ${isOperationsPage ? 'active' : ''}">⚡ Comms Hub</a>
        </div>
      </div>
    </header>

    <div class="dashboard-grid" id="main-dashboard-grid">
      <aside class="panel dossier-folder">
        <div class="archive-subtitle">${archiveSubtitle}</div>
        <h2>Active Operations</h2>
        <div id="project-nav"></div>

        <form id="project-form" class="form-group">
          <label for="project-name">${establishOpHeading}</label>
          <input type="text" id="project-name" placeholder="${isYuriPage ? 'e.g. Surveillance Target Briar' : 'e.g. Operation Strix'}" required />
          <button type="submit" class="primary-btn dossier-btn">Establish Operation</button>
        </form>
      </aside>

      <main class="panel dossier-folder">
        <div class="archive-subtitle">${archiveSubtitle}</div>
        <div id="dynamic-view-container">
          <div id="board-creation-section">
            <div class="board-creation-header">
              <h2 style="margin: 0;">${establishMissionHeading}</h2>
              <button type="button" id="voice-dictate-btn" class="secondary-btn">🎙️ Voice Dictate</button>
            </div>

            <form id="mission-form" class="form-group">
              <div class="form-group">
                <label for="mission-project">${operationLabel}</label>
                <select id="mission-project"></select>
              </div>

              <div class="form-group">
                <label for="mission-category">Category</label>
                <div class="category-select-wrapper">
                  <select id="mission-category" style="flex: 1;"></select>
                  <button type="button" id="delete-category-btn" class="secondary-btn" title="Delete category">Delete</button>
                </div>
              </div>

              <div class="form-group category-add-group">
                <input type="text" id="new-category-input" placeholder="New category name..." />
                <button type="button" id="add-category-btn" class="secondary-btn">Save Category</button>
              </div>

              <div class="form-group">
                <label for="mission-title">Mission Title</label>
                <input type="text" id="mission-title" placeholder="e.g. Secure intelligence package" required />
              </div>
              <div class="form-group">
                <label for="mission-desc">Description</label>
                <textarea id="mission-desc" rows="2" placeholder="Mission details..."></textarea>
              </div>
              <div class="form-group">
                <label for="mission-date">Mission deadline</label>
                <input type="date" id="mission-date" />
              </div>
              <div class="form-group">
                <label for="mission-threat">Threat Level (Priority)</label>
                <select id="mission-threat">
                  <option value="Low">Low</option>
                  <option value="Medium" selected>Medium</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div class="form-group">
                <label for="mission-notes">Field Notes / Handler Debrief</label>
                <textarea id="mission-notes" rows="2" placeholder="Initial handler instructions or @mentions..."></textarea>
              </div>

              <div class="form-row-group">
                <div class="form-group">
                  <label for="mission-spreadsheet">📊 Spreadsheet</label>
                  <input type="text" id="mission-spreadsheet" placeholder="e.g. Budget.xlsx" />
                </div>
                <div class="form-group">
                  <label for="mission-attachment">📎 Attachment URL</label>
                  <input type="text" id="mission-attachment" placeholder="e.g. https://..." />
                </div>
                <div class="form-group">
                  <label for="mission-image-file">🖼️ Evidence Image</label>
                  <input type="file" id="mission-image-file" accept="image/*" />
                </div>
              </div>

              <button type="submit" class="primary-btn dossier-btn" style="width: 100%;">Dispatch Mission</button>
            </form>
          </div>

          <section class="missions-section">
            <div class="missions-filter-header">
              <h2 id="view-title-heading" style="margin: 0;">Mission Log</h2>
              <div class="status-tabs" id="status-filter-container">
                <button type="button" class="status-tab-btn active" data-filter="all">All</button>
                <button type="button" class="status-tab-btn" data-filter="inactive">Inactive</button>
                <button type="button" class="status-tab-btn" data-filter="pending">Pending</button>
                <button type="button" class="status-tab-btn" data-filter="fulfilled">Fulfilled</button>
              </div>
            </div>
            <div id="mission-container"></div>
          </section>
        </div>
      </main>
    </div>
  `;

  renderAgentCodenameBadge();
  setupThemeToggle();
}

function setupThemeToggle() {
  applySavedTheme();
}