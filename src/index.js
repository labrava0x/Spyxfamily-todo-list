import { Mission } from './mission.js';

// Initial missions with notes and checklists
let missions = [
  new Mission(
    "Infiltrate Eden Academy", 
    "Secure proximity to target's son.", 
    "2026-11-20", 
    "Critical", 
    "Must maintain elegant demeanor at all times.", 
    ["Secure bespoke suit", "Memorize aristocratic etiquette", "Locate target's classroom"]
  ),
  new Mission(
    "Secure Stella Star", 
    "Earn academic distinction to impress Loid.", 
    "2026-12-05", 
    "Medium", 
    "Avoid getting a Bolt if possible.", 
    ["Study classical literature", "Pass midterms"]
  )
];

// Function to render all missions to the DOM
function renderMissions() {
  const container = document.getElementById('mission-container');
  if (!container) return;
  
  container.innerHTML = ''; // Clear container before re-rendering

  missions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = 'mission-card';
    
    // Build checklist HTML if items exist
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

  // Attach event listeners to main mission accomplishment checkboxes
  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      missions[idx].toggleStatus();
    });
  });

  // Attach event listeners to checklist checkboxes
  document.querySelectorAll('.checklist-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-mission-index');
      const cIdx = e.target.getAttribute('data-check-index');
      missions[mIdx].toggleChecklistItem(cIdx);
    });
  });
}

// Handle form submission to add a new mission
const form = document.getElementById('mission-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('mission-title').value;
    const desc = document.getElementById('mission-desc').value;
    const date = document.getElementById('mission-date').value;
    const threat = document.getElementById('mission-threat').value;
    const notes = document.getElementById('mission-notes').value;

    const newMission = new Mission(title, desc, date, threat, notes, []);
    missions.push(newMission);
    
    renderMissions();
    form.reset();
  });
}

// Initial render on load
renderMissions();
