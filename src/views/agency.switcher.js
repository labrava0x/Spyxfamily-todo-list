import { getProjects, saveStorage } from '../storage.js';
import { renderApp } from '../dom.controllers/dom.controller.js';

export function getActiveAgency() {
  return window.currentCommsAgency || 'wise';
}

export function setActiveAgency(agency) {
  window.currentCommsAgency = agency;
}

export function getAgencyProjects(agency) {
  return agency === 'yuri'
    ? JSON.parse(localStorage.getItem('sss_projects') || '[]')
    : getProjects();
}

export function saveAgencyProjects(agency, projects) {
  if (agency === 'yuri') {
    localStorage.setItem('sss_projects', JSON.stringify(projects));
  } else {
    saveStorage(projects);
  }
}

export function resolveTargetContainer(container) {
  if (!container) return document.getElementById('mission-container');
  if (container.id === 'app' || container.classList.contains('comms-hub-folder')) {
    return container.querySelector('#mission-container') || container;
  }
  return container;
}

export function renderAgencySwitcher(prefix, isYuri) {
  return `
    <div class="${prefix}-agency-switcher" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 0.5rem;">
      <button type="button" id="${prefix}-wise-btn" style="flex: 1; max-width: 250px; background-color: ${!isYuri ? '#00bfa5' : '#1a3a32'}; color: #ffffff; border: 1px solid #00bfa5; padding: 8px; font-family: 'Special Elite', monospace; font-weight: bold; cursor: pointer; border-radius: 4px;">WISE HQ</button>
      <button type="button" id="${prefix}-yuri-btn" style="flex: 1; max-width: 250px; background-color: ${isYuri ? '#00bfa5' : '#1a3a32'}; color: #ffffff; border: 1px solid #00bfa5; padding: 8px; font-family: 'Special Elite', monospace; font-weight: bold; cursor: pointer; border-radius: 4px;">SSS Bureau</button>
    </div>
  `;
}

export function attachAgencySwitcherListeners(target, prefix, renderCallback) {
  const wiseBtn = target.querySelector(`#${prefix}-wise-btn`);
  const yuriBtn = target.querySelector(`#${prefix}-yuri-btn`);

  const triggerRefresh = () => {
    if (typeof renderCallback === 'function') {
      renderCallback();
    } else if (typeof renderApp === 'function') {
      renderApp();
    }
  };

  if (wiseBtn) {
    wiseBtn.addEventListener('click', () => {
      setActiveAgency('wise');
      triggerRefresh();
    });
  }

  if (yuriBtn) {
    yuriBtn.addEventListener('click', () => {
      setActiveAgency('yuri');
      triggerRefresh();
    });
  }
}