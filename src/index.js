import { Mission } from './mission.js';
import { Project } from './project.js';

// Initialize projects array with a default project
let projects = [
  new Project("Default Operations")
];

// Add a sample mission to the default project
projects[0].addMission(new Mission(
  "Infiltrate Eden Academy", 
  "Secure proximity to target's son.", 
  "2026-11-20", 
  "Critical", 
  "Must maintain elegant demeanor.", 
  [{ text: "Secure bespoke suit", completed: false }]
));

let currentProjectIndex = 0;

// Render project navigation tabs/selector
function renderProjects() {
  const navContainer = document.getElementById('project-nav');
  if (!navContainer) return;

  navContainer.innerHTML = '';
  projects.forEach((project, index) => {
    const btn = document.createElement('button');
    btn.textContent = project.name;
    btn.className = index === currentProjectIndex ? 'project-btn active' : 'project-btn';
    btn.addEventListener('click', () => {
      currentProjectIndex = index;
      renderProjects();
      renderMissions();
      updateProjectDropdown();
    });
    navContainer.appendChild(btn);
  });
}

// Update the select dropdown inside the form so users can choose the target project
function updateProjectDropdown() {
  const select = document.getElementById('mission-project');
  if (!select) return;

  select.innerHTML = '';
  projects.forEach((project, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = project.name;
    select.appendChild(option);
  });
  select.value = currentProjectIndex;
}

// Function to render all missions for the currently active project
function renderMissions() {
  const container = document.getElementById('mission-container');
  if (!container) return;
  
  container.innerHTML = ''; 

  const activeProject = projects[currentProjectIndex];
  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p>No active missions in this sector.</p>';
    return;
  }

  activeProject.missions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = 'mission-card';
    
    let checklistHtml = '';
    if (mission.checklist && mission.checklist.length > 0) {
      checklistHtml = '<ul>';
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

    card.innerHTML = `
      <h3>${mission.title}</h3>
      <p><strong>Details:</strong> ${mission.description}</p>
      <p><strong>Deadline:</strong> ${mission.dueDate}</p>
      <p><strong>Threat Level:</strong> ${mission.threatLevel}</p>
      <p><strong>Field Notes:</strong> ${mission.notes || 'None'}</p>
      <div class="checklist-section">
        <strong>Sub-Objectives:</strong>
        ${checklistHtml || '<p>No sub-objectives assigned.</p>'}
      </div>
      <label class="mission-status-label">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" /> Mission Accomplished
      </label>
    `;
    container.appendChild(card);
  });

  // Attach event listeners
  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      activeProject.missions[idx].toggleStatus();
    });
  });

  document.querySelectorAll('.checklist-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-mission-index');
      const cIdx = e.target.getAttribute('data-check-index');
      activeProject.missions[mIdx].toggleChecklistItem(cIdx);
    });
  });
}

// Handle project creation form
const projectForm = document.getElementById('project-form');
if (projectForm) {
  projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectNameInput = document.getElementById('project-name');
    const name = projectNameInput.value.trim();
    if (name) {
      projects.push(new Project(name));
      currentProjectIndex = projects.length - 1;
      projectForm.reset();
      renderProjects();
      renderMissions();
      updateProjectDropdown();
    }
  });
}

// Handle mission creation form
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

    const newMission = new Mission(title, desc, date, threat, notes, []);
    projects[targetProjectIndex].addMission(newMission);
    
    currentProjectIndex = Number(targetProjectIndex);
    renderProjects();
    renderMissions();
    missionForm.reset();
    updateProjectDropdown();
  });
}

// Initial load
renderProjects();
renderMissions();
updateProjectDropdown();
