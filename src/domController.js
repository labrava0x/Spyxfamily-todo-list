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
let currentViewMode = 'board'; // 'board', 'calendar', 'table'

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
        <div class="view-switchers" style="display: flex; gap: 0.3rem; background: #1c3532; padding: 0.2rem; border-radius: 4px; border: 1px solid #456d68;">
          <button type="button" id="view-board-btn" class="view-tab-btn active" style="background: #e8c872; color: #2b1e10; border: none; padding: 0.3rem 0.8rem; font-family: 'Anton', sans-serif; cursor: pointer;">Board</button>
          <button type="button" id="view-calendar-btn" class="view-tab-btn" style="background: transparent; color: #a3c1bd; border: none; padding: 0.3rem 0.8rem; font-family: 'Anton', sans-serif; cursor: pointer;">Calendar</button>
          <button type="button" id="view-table-btn" class="view-tab-btn" style="background: transparent; color: #a3c1bd; border: none; padding: 0.3rem 0.8rem; font-family: 'Anton', sans-serif; cursor: pointer;">Table</button>
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
            <h2>Establish mission</h2>
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

  if (currentViewMode === 'calendar') {
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

    const headerDiv = document.createElement('div');
    headerDiv.className = 'mission-compact-header';
    headerDiv.innerHTML = `
      <div class="mission-summary-info">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" />
        <span class="mission-title-text">${mission.title}</span>
        <span class="badge threat-badge">${mission.threatLevel}</span>
        <span class="badge category-badge">${mission.category || 'Mission'}</span>
        <span class="due-date-text">📅 ${formattedDate} ${bombIndicator}</span>
      </div>
      <div class="mission-actions">
        <button class="expand-btn" data-index="${index}">Expand ▾</button>
        <button class="delete-mission-btn" data-index="${index}">🗑️</button>
      </div>
    `;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'mission-details-drawer hidden';
    detailsDiv.id = `details-drawer-${index}`;

    // Render discussion comments if stored
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
      <div class="details-content">
        <p><strong>Description:</strong> ${mission.description || 'None'}</p>
        <p><strong>Handler Debrief / Field Notes:</strong> ${mission.notes || 'None'}</p>
        
        <div class="checklist-section">
          <strong>Sub-Objectives:</strong>
          ${checklistHtml || '<p>No sub-objectives assigned.</p>'}
        </div>

        <div class="discussion-section" style="margin-top: 0.8rem; border-top: 1px dashed #8c7a5b; padding-top: 0.5rem;">
          <strong>💬 Mission Discussion & Handler Notes:</strong>
          ${commentsHtml || '<p style="font-size: 0.85rem; color: #5c4d37;">No comments logged yet.</p>'}
          <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">
            <input type="text" id="comment-input-${index}" placeholder="Add comment or @mention handler..." style="flex: 1; font-size: 0.85rem; padding: 0.3rem;" />
            <button type="button" class="secondary-btn add-comment-btn" data-index="${index}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Send</button>
          </div>
        </div>

        <div style="margin-top: 0.8rem;">
          <button class="edit-mission-btn" data-index="${index}">Edit Mission</button>
        </div>
      </div>
    `;

    card.appendChild(headerDiv);
    card.appendChild(detailsDiv);
    container.appendChild(card);
  });

  attachMissionEventListeners();
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
            <th style="padding: 0.6rem; border: 1px solid #9c8a6b;">Threat Level</th>
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
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.dueDate || 'None'}</td>
        <td style="padding: 0.6rem; border: 1px solid #9c8a6b;">${m.accomplished ? '✅ Fulfilled' : '⏳ Active'}</td>
      </tr>
    `;
  });

  html += '</tbody></table></div>';
  container.innerHTML = html;
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
      
      // Save back to storage
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      renderCurrentView();
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
      const newThreat = prompt("Edit Threat Level (Low, Medium, Critical):", mission.threatLevel);
      const newNotes = prompt("Edit Field Notes / Handler Debrief:", mission.notes);

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
      const projectNameInput = document.getElementById('project-name');
      const name = projectNameInput.value.trim();
      if (name) {
        addProject(name);
        projectForm.reset();
        renderApp();
      }
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
      const targetProjectIndex = document.getElementById('mission-project').value;

      setCurrentProjectIndex(Number(targetProjectIndex));
      addMissionToCurrentProject(title, desc, date, threat, notes, category);
      
      renderApp();
      missionForm.reset();
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

  // View Switcher logic (Board, Calendar, Table)
  const boardBtn = document.getElementById('view-board-btn');
  const calendarBtn = document.getElementById('view-calendar-btn');
  const tableBtn = document.getElementById('view-table-btn');

  const viewBtns = [boardBtn, calendarBtn, tableBtn];

  if (boardBtn && calendarBtn && tableBtn) {
    boardBtn.addEventListener('click', () => {
      currentViewMode = 'board';
      updateViewButtons(boardBtn, viewBtns);
      renderCurrentView();
    });

    calendarBtn.addEventListener('click', () => {
      currentViewMode = 'calendar';
      updateViewButtons(calendarBtn, viewBtns);
      renderCurrentView();
    });

    tableBtn.addEventListener('click', () => {
      currentViewMode = 'table';
      updateViewButtons(tableBtn, viewBtns);
      renderCurrentView();
    });
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
