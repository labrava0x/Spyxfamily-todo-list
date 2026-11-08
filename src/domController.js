import { format, parseISO, isPast } from 'date-fns';
import { 
  getProjects, 
  getCurrentProjectIndex, 
  setCurrentProjectIndex, 
  addProject, 
  addMissionToCurrentProject, 
  deleteMission,
  updateMission,
  toggleMissionStatus, 
  toggleChecklistItem 
} from './storage.js';

export function renderApp() {
  renderProjectsNav();
  renderProjectDropdown();
  renderMissions();
}

function renderProjectsNav() {
  const navContainer = document.getElementById('project-nav');
  if (!navContainer) return;

  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();

  navContainer.innerHTML = '';
  projects.forEach((project, index) => {
    const btn = document.createElement('button');
    btn.textContent = project.name;
    btn.className = index === currentIndex ? 'project-btn active' : 'project-btn';
    btn.addEventListener('click', () => {
      setCurrentProjectIndex(index);
      renderApp();
    });
    navContainer.appendChild(btn);
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
    container.innerHTML = '<p class="no-missions">No active missions in this sector.</p>';
    return;
  }

  activeProject.missions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = `mission-card threat-${mission.threatLevel.toLowerCase()}`;
    if (mission.accomplished) card.classList.add('accomplished');

    // Format deadline using date-fns
    let formattedDate = 'No Deadline';
    let dateAlertClass = '';
    if (mission.dueDate) {
      try {
        const parsedDate = parseISO(mission.dueDate);
        formattedDate = format(parsedDate, 'PP'); // e.g., Nov 20, 2026
        if (!mission.accomplished && isPast(parsedDate)) {
          dateAlertClass = 'date-overdue';
          formattedDate += ' ⚠️ OVERDUE';
        }
      } catch (e) {
        formattedDate = mission.dueDate;
      }
    }

    // Compact Header View
    const headerDiv = document.createElement('div');
    headerDiv.className = 'mission-compact-header';
    headerDiv.innerHTML = `
      <div class="mission-summary-info">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" />
        <span class="mission-title-text">${mission.title}</span>
        <span class="badge threat-badge">${mission.threatLevel}</span>
        <span class="due-date-text ${dateAlertClass}">📅 ${formattedDate}</span>
      </div>
      <div class="mission-actions">
        <button class="expand-btn" data-index="${index}">Expand ▾</button>
        <button class="delete-mission-btn" data-index="${index}">🗑️</button>
      </div>
    `;

    // Expandable Details Drawer
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
      const notes = document.getElementById('mission-notes').value;
      const targetProjectIndex = document.getElementById('mission-project').value;

      setCurrentProjectIndex(Number(targetProjectIndex));
      addMissionToCurrentProject(title, desc, date, threat, notes);
      
      renderApp();
      missionForm.reset();
    });
  }
}
