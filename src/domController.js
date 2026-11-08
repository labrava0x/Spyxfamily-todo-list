import { format, parseISO, isPast, differenceInHours } from 'date-fns';
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
    <!-- Cinematic Title Card with Top Secret Stamp -->
    <header class="title-card-header" style="text-align: center; margin-bottom: 2.5rem;">
      <div class="classified-stamp" style="display: inline-block; border: 3px double #8b1e1e; color: #8b1e1e; padding: 0.3rem 1.2rem; font-family: 'Anton', sans-serif; font-size: 1.2rem; letter-spacing: 3px; transform: rotate(-3deg); background: #eedcb9; margin-bottom: 0.8rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.2);">TOP SECRET</div>
      <div>
        <h1>CLASSIFIED DOSSIERS</h1>
      </div>
      
      <div class="agency-selector" style="margin-top: 1rem;">
        <button type="button" id="dossier-wise-btn" class="agency-tab-btn active">📁 WISE Dossier (Twilight)</button>
        <button type="button" id="dossier-sss-btn" class="agency-tab-btn">📁 SSS Dossier (Yuri)</button>
      </div>
    </header>

    <div class="dashboard-grid">
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
        <div class="folder-tab">MISSION BOARD</div>
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
            <label for="mission-notes">Field Notes</label>
            <textarea id="mission-notes" rows="2" placeholder="Additional observations..."></textarea>
          </div>
          <button type="submit" class="primary-btn dossier-btn">Dispatch Mission</button>
        </form>

        <section class="missions-section" style="margin-top: 1.5rem;">
          <div class="missions-filter-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #8c7a5b; padding-bottom: 0.4rem; margin-bottom: 1rem;">
            <h2>Mission Log</h2>
            <div class="status-tabs" style="display: flex; gap: 0.3rem;">
              <button type="button" class="status-tab-btn active" data-filter="all">All</button>
              <button type="button" class="status-tab-btn" data-filter="inactive">Inactive</button>
              <button type="button" class="status-tab-btn" data-filter="pending">Pending</button>
              <button type="button" class="status-tab-btn" data-filter="fulfilled">Fulfilled</button>
            </div>
          </div>
          <div id="mission-container"></div>
        </section>
      </main>
    </div>
  `;
}

export function renderApp() {
  renderProjectsNav();
  renderProjectDropdown();
  renderCategoryDropdown();
  renderMissions();
}

function renderProjectsNav() {
  const navContainer = document.getElementById('project-nav');
  if (!navContainer) return;

  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();

  navContainer.innerHTML = '';
  projects.forEach((project, index) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'project-tab-wrapper';

    const btn = document.createElement('button');
    btn.textContent = project.name;
    btn.className = index === currentIndex ? 'project-btn active' : 'project-btn';
    btn.addEventListener('click', () => {
      setCurrentProjectIndex(index);
      renderApp();
    });

    const delBtn = document.createElement('button');
    delBtn.className = 'delete-project-btn';
    delBtn.textContent = '✕';
    delBtn.title = 'Close Operation';
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteProject(index);
      renderApp();
    });

    wrapper.appendChild(btn);
    wrapper.appendChild(delBtn);
    navContainer.appendChild(wrapper);
  });
}

function renderProjectDropdown() {
  const select = document.getElementById('mission-project');
  if (!select) return;

  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();

  select.innerHTML = '';
  projects.forEach((project, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = project.name;
    select.appendChild(option);
  });
  select.value = currentIndex;
}

function renderMissions() {
  const container = document.getElementById('mission-container');
  if (!container) return;
  
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
        <p><strong>Field Notes:</strong> ${mission.notes || 'None'}</p>
        <div class="checklist-section">
          <strong>Sub-Objectives:</strong>
          ${checklistHtml || '<p>No sub-objectives assigned.</p>'}
        </div>
        <button class="edit-mission-btn" data-index="${index}">Edit Mission</button>
      </div>
    `;

    card.appendChild(headerDiv);
    card.appendChild(detailsDiv);
    container.appendChild(card);
  });

  attachMissionEventListeners();
}

function attachMissionEventListeners() {
  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      toggleMissionStatus(getCurrentProjectIndex(), mIdx);
      renderMissions();
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
      renderMissions();
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
}
