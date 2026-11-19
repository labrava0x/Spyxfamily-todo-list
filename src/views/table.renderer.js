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
    html += `<p class="no-missions" style="text-align: center; color: #065f46; font-weight: bold; font-style: italic; background: #f4a4b8; border: 1px solid #db7093; padding: 1rem;">No missions recorded for ${isYuri ? 'SSS Bureau' : 'WISE HQ'}.</p></div>`;
    target.innerHTML = html;
    attachAgencySwitcherListeners(target, 'table', renderCallback);
    return;
  }

  html += `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background: #f4a4b8 !important; border: 1px solid #db7093;">
          <thead>
            <tr style="background: #10b981 !important; color: #12151c !important; border-bottom: 2px solid #059669; text-align: left; font-family: 'Anton', sans-serif;">
              <th style="padding: 8px; background: #10b981 !important; color: #12151c !important;">Status</th>
              <th style="padding: 8px; background: #10b981 !important; color: #12151c !important;">Title</th>
              <th style="padding: 8px; background: #10b981 !important; color: #12151c !important;">Category</th>
              <th style="padding: 8px; background: #10b981 !important; color: #12151c !important;">Threat</th>
              <th style="padding: 8px; background: #10b981 !important; color: #12151c !important;">Deadline</th>
            </tr>
          </thead>
          <tbody style="background: #f4a4b8 !important;">
  `;

  missions.forEach((m, idx) => {
    const rowBg = idx % 2 === 0 ? '#f4a4b8' : '#ffb6c1';
    const doneStyle = m.accomplished ? 'text-decoration: line-through; opacity: 0.65;' : '';

    html += `
      <tr style="border-bottom: 1px solid #db7093; background: ${rowBg} !important; color: #065f46 !important;">
        <td style="padding: 8px; background: ${rowBg} !important; color: #065f46 !important;"><input type="checkbox" data-index="${idx}" class="accomplished-checkbox" ${m.accomplished ? 'checked' : ''} style="accent-color: #10b981;" /></td>
        <td style="padding: 8px; background: ${rowBg} !important; color: #065f46 !important; font-weight: bold; ${doneStyle}">${m.title}</td>
        <td style="padding: 8px; background: ${rowBg} !important; color: #065f46 !important; font-weight: bold;">${m.category || 'Mission'}</td>
        <td style="padding: 8px; background: ${rowBg} !important; color: #065f46 !important; font-weight: bold;">${m.threatLevel || 'Medium'}</td>
        <td style="padding: 8px; background: ${rowBg} !important; color: #065f46 !important; font-family: monospace;">${m.dueDate || 'None'}</td>
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