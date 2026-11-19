import { getCurrentProjectIndex } from '../storage.js';
import { 
  getActiveAgency, 
  getAgencyProjects, 
  saveAgencyProjects, 
  resolveTargetContainer, 
  renderAgencySwitcher, 
  attachAgencySwitcherListeners 
} from './agency.switcher.js';

export function renderTableView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';
  const projects = getAgencyProjects(agency);
  
  const rawIndex = getCurrentProjectIndex() || 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;
  const activeProject = projects[activeIndex];
  const missions = activeProject && Array.isArray(activeProject.missions) ? activeProject.missions : [];

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      ${renderAgencySwitcher('table', isYuri)}
  `;

  if (missions.length === 0) {
    html += `<p class="no-missions" style="text-align: center; color: #7c6d57; font-style: italic;">No missions recorded for ${isYuri ? 'SSS Bureau' : 'WISE HQ'}.</p></div>`;
    target.innerHTML = html;
    attachAgencySwitcherListeners(target, 'table', renderCallback);
    return;
  }

  html += `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background: #f7f1e1; border: 1px solid #8c7a5b;">
          <thead>
            <tr style="background: #d6c098; border-bottom: 2px solid #8c7a5b; text-align: left; font-family: 'Anton', sans-serif;">
              <th style="padding: 8px;">Status</th>
              <th style="padding: 8px;">Title</th>
              <th style="padding: 8px;">Category</th>
              <th style="padding: 8px;">Threat</th>
              <th style="padding: 8px;">Deadline</th>
            </tr>
          </thead>
          <tbody>
  `;

  missions.forEach((m, idx) => {
    html += `
      <tr style="border-bottom: 1px solid #d6c098;">
        <td style="padding: 8px;"><input type="checkbox" data-index="${idx}" class="accomplished-checkbox" ${m.accomplished ? 'checked' : ''} /></td>
        <td style="padding: 8px; font-weight: bold; text-decoration: ${m.accomplished ? 'line-through' : 'none'}; opacity: ${m.accomplished ? '0.6' : '1'};">${m.title}</td>
        <td style="padding: 8px;">${m.category || 'Mission'}</td>
        <td style="padding: 8px;">${m.threatLevel || 'Medium'}</td>
        <td style="padding: 8px;">${m.dueDate || 'None'}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div></div>`;
  target.innerHTML = html;

  attachAgencySwitcherListeners(target, 'table', renderCallback);

  target.querySelectorAll('.accomplished-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const mIdx = Number(e.target.getAttribute('data-index'));
      const freshProjects = getAgencyProjects(agency);
      if (freshProjects[activeIndex] && freshProjects[activeIndex].missions[mIdx]) {
        freshProjects[activeIndex].missions[mIdx].accomplished = e.target.checked;
        saveAgencyProjects(agency, freshProjects);
        if (typeof renderCallback === 'function') renderCallback();
      }
    });
  });
}