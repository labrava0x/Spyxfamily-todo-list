import { format, parseISO, isPast, differenceInHours, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { 
  getProjects, 
  getCurrentProjectIndex, 
  setCurrentProjectIndex, 
  addProject, 
  deleteProject,
  addMissionToCurrentProject, 
  deleteMission,
  updateMission,
  toggleMissionStatus, 
  toggleChecklistItem 
} from './storage.js';

const DEFAULT_CATEGORIES = ['Mission', 'Personal', 'Job'];
let currentStatusFilter = 'all';
let currentViewMode = 'board'; // 'board', 'prepare', 'calendar', 'table', 'automations', 'developer'

export function getCategories() {
  const saved = localStorage.getItem('wise_categories');
  return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
}

export function saveCategories(categories) {
  localStorage.setItem('wise_categories', JSON.stringify(categories));
}

export function getAutomations() {
  const saved = localStorage.getItem('wise_automations');
  return saved ? JSON.parse(saved) : [
    { id: 1, trigger: 'Critical Threat', action: 'Auto-add urgent handler alert comment', active: true },
    { id: 2, trigger: 'Job Category', action: 'Auto-assign priority badge', active: true }
  ];
}

export function saveAutomations(automations) {
  localStorage.setItem('wise_automations', JSON.stringify(automations));
}

export function getCommsConfig() {
  const saved = localStorage.getItem('wise_comms_config');
  return saved ? JSON.parse(saved) : { telegramToken: '', telegramChatId: '', discordWebhook: '', apiKey: 'wise-secret-token-9988', mcpEndpoint: 'http://localhost:3000/mcp' };
}

export function saveCommsConfig(config) {
  localStorage.setItem('wise_comms_config', JSON.stringify(config));
}

export function renderCategoryDropdown() {
  const select = document.getElementById('mission-category');
  if (!select) return;

  const categories = getCategories();
  select.innerHTML = '';
  categories.forEach(cat => {
    const option = document.createElement('option');
    option.value = cat;
    option.textContent = cat;
    select.appendChild(option);
  });
}

export function initLayout() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <!-- Cinematic Header with Top Secret Stamp & View Switchers -->
    <header class="title-card-header" style="text-align: center; margin-bottom: 2rem;">
      <div class="classified-stamp" style="display: inline-block; border: 3px double #8b1e1e; color: #8b1e1e; padding: 0.3rem 1.2rem; font-family: 'Anton', sans-serif; font-size: 1.1rem; letter-spacing: 3px; transform: rotate(-3deg); background: #eedcb9; margin-bottom: 0.8rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.2);">TOP SECRET</div>
      <div>
        <h1>CLASSIFIED DOSSIERS</h1>
      </div>
      
      <div class="agency-selector" style="margin-top: 1rem; display: flex; justify-content: center; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <div style="display: flex; gap: 0.5rem;">
          <button type="button" id="dossier-wise-btn" class="agency-tab-btn active">📁 WISE (Twilight)</button>
          <button type="button" id="dossier-sss-btn" class="agency-tab-btn">📁 SSS (Yuri)</button>
        </div>
        <div class="view-switchers" style="display: flex; gap: 0.3rem; background: #1c3532; padding: 0.2rem; border-radius: 4px; border: 1px solid #456d68; flex-wrap: wrap;">
          <button type="button" id="view-board-btn" class="view-tab-btn active" style="background: #e8c872; color: #2b1e10; border: none; padding: 0.3rem 0.5rem; font-family: 'Anton', sans-serif; cursor: pointer;">Board</button>
          <button type="button" id="view-prepare-btn" class="view-tab-btn" style="background: transparent; color: #a3c1bd; border: none; padding: 0.3rem 0.5rem; font-family: 'Anton', sans-serif; cursor: pointer;">🎯 Prepare</button>
          <button type="button" id="view-calendar-btn" class="view-tab-btn" style="background: transparent; color: #a3c1bd; border: none; padding: 0.3rem 0.5rem; font-family: 'Anton', sans-serif; cursor: pointer;">Calendar</button>
          <button type="button" id="view-table-btn" class="view-tab-btn" style="background: transparent; color: #a3c1bd; border: none; padding: 0.3rem 0.5rem; font-family: 'Anton', sans-serif; cursor: pointer;">Table</button>
          <button type="button" id="view-developer-btn" class="view-tab-btn" style="background: transparent; color: #a3c1bd; border: none; padding: 0.3rem 0.5rem; font-family: 'Anton', sans-serif; cursor: pointer;">💻 Developer Tools</button>
          <button type="button" id="view-automations-btn" class="view-tab-btn" style="background: transparent; color: #a3c1bd; border: none; padding: 0.3rem 0.5rem; font-family: 'Anton', sans-serif; cursor: pointer;">⚡ Comms</button>
        </div>
      </div>
    </header>

    <div class="dashboard-grid" id="main-dashboard-grid">
      <aside class="panel dossier-folder">
        <div class="folder-tab" id="active-folder-title">OPERATIONS ARCHIVE</div>
        <h2>Active Operations</h2>
        <div id="project-nav"></div>

        <form id="project-form" class="form-group" style="margin-top: 1rem;">
          <label for="project-name">Name your operation</label>
          <input type="text" id="project-name" placeholder="e.g. Operation Strix" required />
          <button type="submit" class="primary-btn dossier-btn" style="margin-top: 0.5rem;">Establish Operation</button>
        </form>
      </aside>

      <main class="panel dossier-folder">
        <div class="folder-tab" id="board-folder-tab">MISSION BOARD</div>
        
        <!-- Dynamic View Container -->
        <div id="dynamic-view-container">
          <!-- Form is shown in Board view -->
          <div id="board-creation-section">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h2 style="margin: 0;">Establish mission</h2>
              <button type="button" id="voice-dictate-btn" class="secondary-btn" style="background: #2b4c48; color: #fff; font-size: 0.8rem; padding: 0.3rem 0.6rem;">🎙️ Voice Dictate</button>
            </div>

            <form id="mission-form" class="form-group">
              <div class="form-group">
                <label for="mission-project">Target Operation</label>
                <select id="mission-project"></select>
              </div>

              <div class="form-group">
                <label for="mission-category">Category</label>
                <div class="category-select-wrapper" style="display: flex; gap: 0.5rem;">
                  <select id="mission-category" style="flex: 1;"></select>
                  <button type="button" id="delete-category-btn" class="secondary-btn" title="Delete category">Delete</button>
                </div>
              </div>

              <div class="form-group category-add-group" style="display: flex; gap: 0.5rem;">
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
                <input type="date" id="mission-date" style="cursor: pointer;" />
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
              
              <!-- Spreadsheets, Links, and Image Attachments -->
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <div class="form-group" style="flex: 1; min-width: 150px;">
                  <label for="mission-spreadsheet">📊 Spreadsheet</label>
                  <input type="text" id="mission-spreadsheet" placeholder="e.g. Budget.xlsx" />
                </div>
                <div class="form-group" style="flex: 1; min-width: 150px;">
                  <label for="mission-attachment">📎 Attachment URL</label>
                  <input type="text" id="mission-attachment" placeholder="e.g. https://..." />
                </div>
                <div class="form-group" style="flex: 1; min-width: 150px;">
                  <label for="mission-image-file">🖼️ Evidence Image</label>
                  <input type="file" id="mission-image-file" accept="image/*" style="font-size: 0.8rem; padding: 0.2rem;" />
                </div>
              </div>

              <button type="submit" class="primary-btn dossier-btn">Dispatch Mission</button>
            </form>
          </div>

          <section class="missions-section" style="margin-top: 1.5rem;">
            <div class="missions-filter-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8c7a5b; padding-bottom: 0.4rem; margin-bottom: 1rem;">
              <h2 id="view-title-heading">Mission Log</h2>
              <div class="status-tabs" id="status-filter-container" style="display: flex; gap: 0.3rem;">
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
}

export function renderApp() {
  renderProjectsNav();
  renderProjectDropdown();
  renderCategoryDropdown();
  renderCurrentView();
}

function renderCurrentView() {
  const container = document.getElementById('mission-container');
  const creationSection = document.getElementById('board-creation-section');
  const folderTab = document.getElementById('board-folder-tab');
  const viewHeading = document.getElementById('view-title-heading');
  const filterContainer = document.getElementById('status-filter-container');
  if (!container) return;

  if (currentViewMode === 'prepare') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'PREPARE MISSION';
    if (viewHeading) viewHeading.textContent = 'Mission Preparation & Scripts';
    if (filterContainer) filterContainer.style.display = 'none';
    renderPrepareMissionView(container);
  } else if (currentViewMode === 'calendar') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'CALENDAR VIEW';
    if (viewHeading) viewHeading.textContent = format(new Date(), 'MMMM yyyy') + ' Calendar';
    if (filterContainer) filterContainer.style.display = 'none';
    renderCalendarGridView(container);
  } else if (currentViewMode === 'table') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'TABLE VIEW';
    if (viewHeading) viewHeading.textContent = 'Mission Data Table';
    if (filterContainer) filterContainer.style.display = 'flex';
    renderTableView(container);
  } else if (currentViewMode === 'developer') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'DEVELOPER TOOLS & MCP';
    if (viewHeading) viewHeading.textContent = 'API, CLI & MCP Server Integration';
    if (filterContainer) filterContainer.style.display = 'none';
    renderDeveloperView(container);
  } else if (currentViewMode === 'automations') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'COMMS RELAYS';
    if (viewHeading) viewHeading.textContent = 'Messaging Relays (Telegram & Discord)';
    if (filterContainer) filterContainer.style.display = 'none';
    renderAutomationsView(container);
  } else {
    if (creationSection) creationSection.style.display = 'block';
    if (folderTab) folderTab.textContent = 'MISSION BOARD';
    if (viewHeading) viewHeading.textContent = 'Mission Log';
    if (filterContainer) filterContainer.style.display = 'flex';
    renderBoardView(container);
  }
}

function renderBoardView(container) {
  container.innerHTML = ''; 

  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];

  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p class="no-missions">No active missions recorded in this dossier.</p>';
    return;
  }

  const filteredMissions = activeProject.missions.filter(mission => {
    if (currentStatusFilter === 'inactive') return !mission.accomplished && !mission.dueDate;
    if (currentStatusFilter === 'pending') return !mission.accomplished && mission.dueDate;
    if (currentStatusFilter === 'fulfilled') return mission.accomplished;
    return true;
  });

  if (filteredMissions.length === 0) {
    container.innerHTML = `<p class="no-missions">No missions match the "${currentStatusFilter}" filter.</p>`;
    return;
  }

  filteredMissions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = `mission-card threat-${mission.threatLevel.toLowerCase()}`;
    if (mission.accomplished) card.classList.add('accomplished');

    let formattedDate = 'No Deadline';
    let bombIndicator = '';
    
    if (mission.dueDate) {
      try {
        const parsedDate = parseISO(mission.dueDate);
        formattedDate = format(parsedDate, 'PP');
        
        if (!mission.accomplished) {
          const hoursLeft = differenceInHours(parsedDate, new Date());
          if (hoursLeft < 0 || isPast(parsedDate)) {
            bombIndicator = ' <span class="ticking-bomb bomb-exploding" title="DEADLINE EXCEEDED!">💣💥 OVERDUE</span>';
            card.classList.add('mission-danger');
          } else if (hoursLeft <= 72) {
            bombIndicator = ` <span class="ticking-bomb bomb-ticking" title="Deadline creeping in!">💣⏳ T- ${hoursLeft}h</span>`;
            card.classList.add('mission-warning');
          }
        }
      } catch (e) {
        formattedDate = mission.dueDate;
      }
    } else if (!mission.accomplished) {
      bombIndicator = ' <span class="ticking-bomb" title="No timeline established">⏳ Inactive</span>';
    }

    let extraBadges = '';
    if (mission.spreadsheet) {
      extraBadges += ` <span class="badge" style="background: #4b6b54; color: #fff;">📊 ${mission.spreadsheet}</span>`;
    }
    if (mission.attachment) {
      extraBadges += ` <span class="badge" style="background: #3b5b76; color: #fff;">📎 Link</span>`;
    }
    if (mission.imageBase64) {
      extraBadges += ` <span class="badge" style="background: #8b1e1e; color: #fff;">🖼️ Image</span>`;
    }

    const headerDiv = document.createElement('div');
    headerDiv.className = 'mission-compact-header';
    headerDiv.innerHTML = `
      <div class="mission-summary-info">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" />
        <span class="mission-title-text">${mission.title}</span>
        <span class="badge threat-badge">${mission.threatLevel}</span>
        <span class="badge category-badge">${mission.category || 'Mission'}</span>
        <span class="due-date-text">📅 ${formattedDate} ${bombIndicator}</span>
        ${extraBadges}
      </div>
      <div class="mission-actions">
        <button class="expand-btn" data-index="${index}">Expand ▾</button>
        <button class="delete-mission-btn" data-index="${index}">🗑️</button>
      </div>
    `;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'mission-details-drawer hidden';
    detailsDiv.id = `details-drawer-${index}`;

    const prep = mission.preparation || { keyTakeaways: '', briefingScript: '' };

    let attachmentHtml = mission.attachment ? `<p><strong>📎 Attachment Link:</strong> <a href="${mission.attachment}" target="_blank" style="color: #8b1e1e; font-weight: bold;">${mission.attachment}</a></p>` : '';
    let imagePreviewHtml = mission.imageBase64 ? `<div style="margin-top: 0.5rem;"><strong>🖼️ Attached Evidence:</strong><br><img src="${mission.imageBase64}" alt="Evidence" style="max-width: 100%; max-height: 200px; border: 2px solid #8c7a5b; margin-top: 0.3rem;" /></div>` : '';

    let commentsHtml = '';
    const comments = mission.comments || [];
    if (comments.length > 0) {
      commentsHtml = '<div class="comments-list" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">';
      comments.forEach(c => {
        commentsHtml += `<div style="background: #eedcb9; padding: 0.3rem 0.5rem; border-left: 3px solid #8b1e1e; font-size: 0.85rem;">💬 <strong>${c.author}:</strong> ${c.text}</div>`;
      });
      commentsHtml += '</div>';
    }

    let checklistHtml = '';
    if (mission.checklist && mission.checklist.length > 0) {
      checklistHtml = '<ul class="checklist-ul">';
      mission.checklist.forEach((checkItem, cIndex) => {
        checklistHtml += `
          <li>
            <label>
              <input type="checkbox" data-mission-index="${index}" data-check-index="${cIndex}" class="checklist-checkbox" ${checkItem.completed ? 'checked' : ''} />
              ${checkItem.text}
            </label>
          </li>
        `;
      });
      checklistHtml += '</ul>';
    }

    detailsDiv.innerHTML = `
      <div class="details-content" style="display: flex; flex-direction: column; gap: 0.8rem;">
        <p><strong>Description:</strong> ${mission.description || 'None'}</p>
        <p><strong>Handler Debrief / Field Notes:</strong> ${mission.notes || 'None'}</p>
        <p><strong>📊 Linked Spreadsheet:</strong> ${mission.spreadsheet || 'None'}</p>
        ${attachmentHtml}
        ${imagePreviewHtml}
        
        <!-- Prepare Mission Canvas -->
        <div class="prepare-mission-box" style="background: #f7f1e1; border: 2px dashed #8c7a5b; padding: 0.8rem; margin-top: 0.5rem;">
          <h4 style="margin: 0 0 0.4rem 0; font-family: 'Anton', sans-serif; font-size: 1.05rem; color: #8b1e1e;">🎯 Prepare Mission Briefing</h4>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">3 Core Takeaways:</label>
              <input type="text" id="prep-takeaways-${index}" value="${prep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; font-size: 0.85rem; padding: 0.3rem;" />
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">Briefing Script / Strategy:</label>
              <textarea id="prep-script-${index}" rows="2" placeholder="Draft your script first..." style="width: 100%; font-size: 0.85rem; padding: 0.3rem;">${prep.briefingScript || ''}</textarea>
            </div>
            <button type="button" class="secondary-btn save-prep-btn" data-index="${index}" style="align-self: flex-start; padding: 0.3rem 0.8rem; font-size: 0.8rem;">Save Preparation</button>
          </div>
        </div>

        <div class="checklist-section">
          <strong>Sub-Objectives:</strong>
          ${checklistHtml || '<p>No sub-objectives assigned.</p>'}
        </div>

        <div class="discussion-section" style="border-top: 1px dashed #8c7a5b; padding-top: 0.5rem;">
          <strong>💬 Mission Discussion & Handler Notes:</strong>
          ${commentsHtml || '<p style="font-size: 0.85rem; color: #5c4d37;">No comments logged yet.</p>'}
          <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">
            <input type="text" id="comment-input-${index}" placeholder="Add comment or @mention handler..." style="flex: 1; font-size: 0.85rem; padding: 0.3rem;" />
            <button type="button" class="secondary-btn add-comment-btn" data-index="${index}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Send</button>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
          <button class="edit-mission-btn" data-index="${index}">Edit Mission</button>
          <button class="secondary-btn test-telegram-btn" data-title="${mission.title}" data-due="${mission.dueDate || 'None'}" style="font-size: 0.8rem; background: #2b4c48; color: #fff;">📤 Ping Telegram</button>
          <button class="secondary-btn test-discord-btn" data-title="${mission.title}" data-due="${mission.dueDate || 'None'}" style="font-size: 0.8rem; background: #5865F2; color: #fff;">💬 Ping Discord</button>
        </div>
      </div>
    `;

    card.appendChild(headerDiv);
    card.appendChild(detailsDiv);
    container.appendChild(card);
  });

  attachMissionEventListeners();
}

function renderPrepareMissionView(container) {
  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];

  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p class="no-missions">No missions available to prepare.</p>';
    return;
  }

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      <p style="background: #f7f1e1; padding: 0.8rem; border: 1px solid #9c8a6b; border-left: 4px solid #8b1e1e; margin: 0;">
        🎯 <strong>Mission Preparation Hub:</strong> Keep the objective simple. What are the three things about this mission that everyone should remember? Write the script first.
      </p>
  `;

  activeProject.missions.forEach((m, index) => {
    const prep = m.preparation || { keyTakeaways: '', briefingScript: '' };
    html += `
      <div style="background: #f7f1e1; border: 1px solid #9c8a6b; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #8b1e1e; border-bottom: 2px solid #d6c098; padding-bottom: 0.3rem;">
          ${m.title}
        </h3>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
          <div>
            <label style="font-size: 0.85rem; font-weight: bold;">3 Core Takeaways:</label>
            <input type="text" id="tab-prep-takeaways-${index}" value="${prep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem;" />
          </div>
          <div>
            <label style="font-size: 0.85rem; font-weight: bold;">Briefing Script / Strategy:</label>
            <textarea id="tab-prep-script-${index}" rows="3" placeholder="Write the script first..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem;">${prep.briefingScript || ''}</textarea>
          </div>
          <button type="button" class="secondary-btn save-tab-prep-btn" data-index="${index}" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem;">Save Mission Briefing</button>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  container.innerHTML = html;

  document.querySelectorAll('.save-tab-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const keyTakeaways = document.getElementById(`tab-prep-takeaways-${mIdx}`).value.trim();
      const briefingScript = document.getElementById(`tab-prep-script-${mIdx}`).value.trim();

      const projectIndex = getCurrentProjectIndex();
      const projects = getProjects();
      const mission = projects[projectIndex].missions[mIdx];

      mission.preparation = { keyTakeaways, briefingScript };
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      alert("🎯 Mission preparation briefing successfully saved!");
      renderCurrentView();
    });
  });
}

function renderCalendarGridView(container) {
  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];
  const missions = activeProject ? activeProject.missions : [];

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  let html = `
    <div class="calendar-grid-wrapper" style="font-family: 'Special Elite', monospace;">
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-family: 'Anton', sans-serif; margin-bottom: 0.5rem; background: #d6c098; padding: 0.4rem; border: 1px solid #8c7a5b;">
        <div style="color: #8b1e1e;">Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
  `;

  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div style="background: rgba(0,0,0,0.03); min-height: 80px; border: 1px dashed #9c8a6b; opacity: 0.3;"></div>`;
  }

  daysInMonth.forEach(day => {
    const isToday = isSameDay(day, new Date());
    const dayMissions = missions.filter(m => m.dueDate && isSameDay(parseISO(m.dueDate), day));

    html += `
      <div style="background: ${isToday ? '#fae6e6' : '#f7f1e1'}; border: 1px solid #9c8a6b; min-height: 90px; padding: 0.3rem; display: flex; flex-direction: column; justify-content: flex-start;">
        <div style="font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #d6c098; margin-bottom: 0.2rem; color: ${isToday ? '#8b1e1e' : '#2b1e10'};">${format(day, 'd')}</div>
        <div style="display: flex; flex-direction: column; gap: 2px; overflow-y: auto; max-height: 65px;">
    `;

    dayMissions.forEach(m => {
      const threatColor = m.threatLevel === 'Critical' ? '#8b1e1e' : m.threatLevel === 'Medium' ? '#b8973e' : '#2b4c48';
      html += `
        <div title="${m.title}" style="background: ${threatColor}; color: #fff; font-size: 0.7rem; padding: 0.1rem 0.3rem; border-radius: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${m.accomplished ? '✓ ' : ''}${m.title}
        </div>
      `;
    });

    html += `</div></div>`;
  });

  html += `</div></div>`;
  container.innerHTML = html;
}

function renderTableView(container) {
  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];

  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p class="no-missions">No missions in data table.</p>';
    return;
  }

  const filteredMissions = activeProject.missions.filter(mission => {
    if (currentStatusFilter === 'inactive') return !mission.accomplished && !mission.dueDate;
    if (currentStatusFilter === 'pending') return !mission.accomplished && mission.dueDate;
    if (currentStatusFilter === 'fulfilled') return mission.accomplished;
    return true;
  });

  if (filteredMissions.length === 0) {
    container.innerHTML = `<p class="no-missions">No missions match the "${currentStatusFilter}" filter.</p>`;
    return;
  }

  let html = `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; background: #f7f1e1; font-family: 'Special Elite', monospace; font-size: 0.9rem;">
        <thead>
          <tr style="background: #d6c098; border-bottom: 2px solid #8c7a5b; text-align: left;">
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Mission Title</th>
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Category</th>
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Threat</th>
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Spreadsheet</th>
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Attachment</th>
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Deadline</th>
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Status</th>
          </tr>
        </thead>
        <tbody>
  `;

  filteredMissions.forEach(m => {
    html += `
      <tr style="border-bottom: 1px solid #9c8a6b;">
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b; font-weight: bold;">${m.title}</td>
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.category || 'Mission'}</td>
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.threatLevel}</td>
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.spreadsheet || 'None'}</td>
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.attachment || (m.imageBase64 ? '🖼️ Image' : 'None')}</td>
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.dueDate || 'None'}</td>
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.accomplished ? '✅ Fulfilled' : '⏳ Active'}</td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
}

function renderDeveloperView(container) {
  const comms = getCommsConfig();
  container.innerHTML = `
    <div class="developer-dashboard" style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      <!-- API Card -->
      <div style="background: #f7f1e1; padding: 1.2rem; border: 1px solid #9c8a6b; border-top: 4px solid #8b1e1e;">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #8b1e1e;">🔌 API Integration</h3>
        <p style="font-size: 0.85rem; margin-bottom: 0.8rem;">Automate routines and query dossier missions programmatically.</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label style="font-size: 0.85rem; font-weight: bold;">Your Classified API Token:</label>
          <input type="text" id="dev-api-key" value="${comms.apiKey || 'wise-secret-token-9988'}" style="width: 100%; padding: 0.4rem; font-size: 0.85rem;" />
        </div>
      </div>

      <!-- CLI Card -->
      <div style="background: #f7f1e1; padding: 1.2rem; border: 1px solid #9c8a6b; border-top: 4px solid #2b4c48;">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #2b4c48;">💻 Command Line Interface (CLI)</h3>
        <p style="font-size: 0.85rem; margin-bottom: 0.5rem;">Run daily operations directly from your Linux terminal:</p>
        <pre style="background: #1c3532; color: #e8c872; padding: 0.6rem; font-size: 0.85rem; border-radius: 4px; overflow-x: auto;">npm install -g wise-dossiers-cli
wise mission list --active</pre>
      </div>

      <!-- MCP Server Card -->
      <div style="background: #f7f1e1; padding: 1.2rem; border: 1px solid #9c8a6b; border-top: 4px solid #b8973e;">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #8b1e1e;">🤖 MCP Server (Model Context Protocol)</h3>
        <p style="font-size: 0.85rem; margin-bottom: 0.8rem;">Allow AI agents to read, write, and manage your intelligence dossiers securely.</p>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <label style="font-size: 0.85rem; font-weight: bold;">MCP Server Endpoint:</label>
          <input type="text" id="dev-mcp-endpoint" value="${comms.mcpEndpoint || 'http://localhost:3000/mcp'}" style="width: 100%; padding: 0.4rem; font-size: 0.85rem;" />
          <button type="button" id="save-dev-tools-btn" class="secondary-btn" style="align-self: flex-start; margin-top: 0.4rem; padding: 0.4rem 1rem;">Save Developer Config</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('save-dev-tools-btn').addEventListener('click', () => {
    const apiKey = document.getElementById('dev-api-key').value.trim();
    const mcpEndpoint = document.getElementById('dev-mcp-endpoint').value.trim();
    const currentComms = getCommsConfig();
    currentComms.apiKey = apiKey;
    currentComms.mcpEndpoint = mcpEndpoint;
    saveCommsConfig(currentComms);
    alert("✅ Developer tools & MCP server configuration updated successfully!");
  });
}

function renderAutomationsView(container) {
  const comms = getCommsConfig();
  container.innerHTML = `
    <div class="automations-dashboard" style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="background: #f7f1e1; padding: 1rem; border: 1px solid #9c8a6b; border-top: 4px solid #2b4c48;">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #2b4c48;">📡 Messaging Relays (Telegram & Discord)</h3>
        <div style="display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.5rem;">
          <div>
            <label style="font-size: 0.85rem; display: block; font-weight: bold;">Telegram Bot Token:</label>
            <input type="text" id="telegram-token-input" value="${comms.telegramToken}" placeholder="e.g. 123456789:ABC..." style="width: 100%; padding: 0.4rem;" />
          </div>
          <div>
            <label style="font-size: 0.85rem; display: block; font-weight: bold;">Telegram Chat ID:</label>
            <input type="text" id="telegram-chatid-input" value="${comms.telegramChatId}" placeholder="e.g. 987654321" style="width: 100%; padding: 0.4rem;" />
          </div>
          <div>
            <label style="font-size: 0.85rem; display: block; font-weight: bold;">Discord Webhook URL:</label>
            <input type="text" id="discord-webhook-input" value="${comms.discordWebhook}" placeholder="e.g. https://discord.com/api/webhooks/..." style="width: 100%; padding: 0.4rem;" />
          </div>
          <button type="button" id="save-comms-config-btn" class="secondary-btn" style="align-self: flex-start; margin-top: 0.4rem; padding: 0.4rem 1rem;">Save Comm Relays</button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('save-comms-config-btn').addEventListener('click', () => {
    const telegramToken = document.getElementById('telegram-token-input').value.trim();
    const telegramChatId = document.getElementById('telegram-chatid-input').value.trim();
    const discordWebhook = document.getElementById('discord-webhook-input').value.trim();
    const currentComms = getCommsConfig();
    currentComms.telegramToken = telegramToken;
    currentComms.telegramChatId = telegramChatId;
    currentComms.discordWebhook = discordWebhook;
    saveCommsConfig(currentComms);
    alert("✅ Communication relay endpoints securely updated!");
  });
}

function attachMissionEventListeners() {
  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      toggleMissionStatus(getCurrentProjectIndex(), mIdx);
      renderCurrentView();
    });
  });

  document.querySelectorAll('.checklist-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-mission-index');
      const cIdx = e.target.getAttribute('data-check-index');
      toggleChecklistItem(getCurrentProjectIndex(), mIdx, cIdx);
    });
  });

  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const drawer = document.getElementById(`details-drawer-${mIdx}`);
      drawer.classList.toggle('hidden');
      btn.textContent = drawer.classList.contains('hidden') ? 'Expand ▾' : 'Collapse ▴';
    });
  });

  document.querySelectorAll('.save-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const keyTakeaways = document.getElementById(`prep-takeaways-${mIdx}`).value.trim();
      const briefingScript = document.getElementById(`prep-script-${mIdx}`).value.trim();

      const projectIndex = getCurrentProjectIndex();
      const projects = getProjects();
      const mission = projects[projectIndex].missions[mIdx];

      mission.preparation = { keyTakeaways, briefingScript };
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      alert("🎯 Mission preparation briefing successfully saved!");
      renderCurrentView();
    });
  });

  document.querySelectorAll('.add-comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const input = document.getElementById(`comment-input-${mIdx}`);
      const text = input.value.trim();
      if (!text) return;

      const projectIndex = getCurrentProjectIndex();
      const projects = getProjects();
      const mission = projects[projectIndex].missions[mIdx];

      if (!mission.comments) mission.comments = [];
      mission.comments.push({ author: 'Handler / Agent', text: text, date: new Date().toISOString() });
      
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      renderCurrentView();
    });
  });

  document.querySelectorAll('.test-telegram-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');
      const comms = getCommsConfig();

      if (!comms.telegramToken || !comms.telegramChatId) {
        alert("⚠️ Please configure Telegram in the '⚡ Comms' tab first.");
        return;
      }

      const msg = `🚨 *WISE MISSION ALERT*\n\n*Operation:* ${title}\n*Deadline:* ${due}`;
      try {
        const res = await fetch(`https://api.telegram.org/bot${comms.telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: comms.telegramChatId, text: msg, parse_mode: 'Markdown' })
        });
        if (res.ok) alert("📤 Telegram reminder successfully dispatched!");
      } catch (err) {
        alert("❌ Telegram connection error.");
      }
    });
  });

  document.querySelectorAll('.test-discord-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');
      const comms = getCommsConfig();

      if (!comms.discordWebhook) {
        alert("⚠️ Please configure Discord in the '⚡ Comms' tab first.");
        return;
      }

      try {
        await fetch(comms.discordWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: `🚨 **WISE INTELLIGENCE ALERT**\n> **Mission:** ${title}\n> **Deadline:** ${due}` })
        });
        alert("💬 Discord reminder successfully posted!");
      } catch (err) {
        alert("❌ Discord connection error.");
      }
    });
  });

  document.querySelectorAll('.delete-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      deleteMission(getCurrentProjectIndex(), mIdx);
      renderApp();
    });
  });

  document.querySelectorAll('.edit-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const projectIndex = getCurrentProjectIndex();
      const mission = getProjects()[projectIndex].missions[mIdx];

      const newTitle = prompt("Edit Mission Title:", mission.title);
      if (newTitle === null) return;
      const newDesc = prompt("Edit Description:", mission.description);
      const newDate = prompt("Edit Due Date (YYYY-MM-DD):", mission.dueDate);
      const newThreat = prompt("Edit Threat Level:", mission.threatLevel);
      const newNotes = prompt("Edit Field Notes:", mission.notes);

      updateMission(projectIndex, mIdx, newTitle, newDesc, newDate, newThreat, newNotes);
      renderApp();
    });
  });

  document.querySelectorAll('.status-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.status-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentStatusFilter = e.target.getAttribute('data-filter');
      renderCurrentView();
    });
  });
}

export function initEventListeners() {
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('project-name').value.trim();
      if (name) {
        addProject(name);
        projectForm.reset();
        renderApp();
      }
    });
  }

  // Voice Dictation
  const voiceBtn = document.getElementById('voice-dictate-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("⚠️ Speech recognition not supported in this browser.");
        return;
      }
      const recognition = new SpeechRecognition();
      voiceBtn.textContent = '🎙️ Listening...';
      voiceBtn.style.background = '#8b1e1e';

      recognition.onresult = (event) => {
        document.getElementById('mission-title').value = event.results[0][0].transcript;
        voiceBtn.textContent = '🎙️ Voice Dictate';
        voiceBtn.style.background = '#2b4c48';
      };
      recognition.onerror = recognition.onend = () => {
        voiceBtn.textContent = '🎙️ Voice Dictate';
        voiceBtn.style.background = '#2b4c48';
      };
      recognition.start();
    });
  }

  const missionForm = document.getElementById('mission-form');
  if (missionForm) {
    missionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('mission-title').value;
      const desc = document.getElementById('mission-desc').value;
      const date = document.getElementById('mission-date').value;
      const threat = document.getElementById('mission-threat').value;
      const category = document.getElementById('mission-category').value;
      const notes = document.getElementById('mission-notes').value;
      const spreadsheet = document.getElementById('mission-spreadsheet').value.trim();
      const attachment = document.getElementById('mission-attachment').value.trim();
      const imageFileInput = document.getElementById('mission-image-file');
      const targetProjectIndex = document.getElementById('mission-project').value;

      setCurrentProjectIndex(Number(targetProjectIndex));

      const processMissionCreation = (imageBase64 = '') => {
        const projects = getProjects();
        const project = projects[targetProjectIndex];
        project.missions.push({
          title,
          description: desc,
          dueDate: date,
          threatLevel: threat,
          category,
          notes,
          spreadsheet,
          attachment,
          imageBase64,
          accomplished: false,
          checklist: [],
          comments: [],
          preparation: { keyTakeaways: '', briefingScript: '' }
        });
        localStorage.setItem('wise_projects', JSON.stringify(projects));
        renderApp();
        missionForm.reset();
      };

      if (imageFileInput.files && imageFileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function(uploadEvent) {
          processMissionCreation(uploadEvent.target.result);
        };
        reader.readAsDataURL(imageFileInput.files[0]);
      } else {
        processMissionCreation('');
      }
    });
  }

  const addCatBtn = document.getElementById('add-category-btn');
  if (addCatBtn) {
    addCatBtn.addEventListener('click', () => {
      const input = document.getElementById('new-category-input');
      const catName = input.value.trim();
      if (!catName) return;

      const categories = getCategories();
      if (!categories.includes(catName)) {
        categories.push(catName);
        saveCategories(categories);
        renderCategoryDropdown();
        document.getElementById('mission-category').value = catName;
      }
      input.value = '';
    });
  }

  const delCatBtn = document.getElementById('delete-category-btn');
  if (delCatBtn) {
    delCatBtn.addEventListener('click', () => {
      const select = document.getElementById('mission-category');
      const selectedCat = select.value;
      let categories = getCategories();

      if (categories.length <= 1) {
        alert("Must maintain at least one active category.");
        return;
      }
      categories = categories.filter(cat => cat !== selectedCat);
      saveCategories(categories);
      renderCategoryDropdown();
    });
  }

  const wiseBtn = document.getElementById('dossier-wise-btn');
  const sssBtn = document.getElementById('dossier-sss-btn');
  const folderTitle = document.getElementById('active-folder-title');

  if (wiseBtn && sssBtn) {
    wiseBtn.addEventListener('click', () => {
      wiseBtn.classList.add('active');
      sssBtn.classList.remove('active');
      if (folderTitle) folderTitle.textContent = 'WISE DOSSIER ARCHIVE';
    });

    sssBtn.addEventListener('click', () => {
      sssBtn.classList.add('active');
      wiseBtn.classList.remove('active');
      if (folderTitle) folderTitle.textContent = 'SSS SURVEILLANCE ARCHIVE';
    });
  }

  // View Switchers
  const boardBtn = document.getElementById('view-board-btn');
  const prepareBtn = document.getElementById('view-prepare-btn');
  const calendarBtn = document.getElementById('view-calendar-btn');
  const tableBtn = document.getElementById('view-table-btn');
  const developerBtn = document.getElementById('view-developer-btn');
  const automationsBtn = document.getElementById('view-automations-btn');

  const viewBtns = [boardBtn, prepareBtn, calendarBtn, tableBtn, developerBtn, automationsBtn];

  if (boardBtn && prepareBtn && calendarBtn && tableBtn && developerBtn && automationsBtn) {
    boardBtn.addEventListener('click', () => { currentViewMode = 'board'; updateViewButtons(boardBtn, viewBtns); renderCurrentView(); });
    prepareBtn.addEventListener('click', () => { currentViewMode = 'prepare'; updateViewButtons(prepareBtn, viewBtns); renderCurrentView(); });
    calendarBtn.addEventListener('click', () => { currentViewMode = 'calendar'; updateViewButtons(calendarBtn, viewBtns); renderCurrentView(); });
    tableBtn.addEventListener('click', () => { currentViewMode = 'table'; updateViewButtons(tableBtn, viewBtns); renderCurrentView(); });
    developerBtn.addEventListener('click', () => { currentViewMode = 'developer'; updateViewButtons(developerBtn, viewBtns); renderCurrentView(); });
    automationsBtn.addEventListener('click', () => { currentViewMode = 'automations'; updateViewButtons(automationsBtn, viewBtns); renderCurrentView(); });
  }
}

function updateViewButtons(activeBtn, allBtns) {
  allBtns.forEach(btn => {
    btn.style.background = 'transparent';
    btn.style.color = '#a3c1bd';
  });
  activeBtn.style.background = '#e8c872';
  activeBtn.style.color = '#2b1e10';
}
