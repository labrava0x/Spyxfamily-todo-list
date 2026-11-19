import { renderPrepareMissionView, renderInsightsView } from '../views/renderer.js';
import { renderAutomationsView } from '../views/automations.renderer.js';
import { renderCalendarGridView } from '../views/calendar.renderer.js';
import { renderDeveloperView, renderDeveloperOverview } from '../views/dev.renderer.js';
import { renderTableView } from '../views/table.renderer.js';
import {
  getActiveAgency,
  setActiveAgency,
  getAgencyProjects,
  saveAgencyProjects
} from '../views/agency.switcher.js';
import {
  getProjects,
  getCurrentProjectIndex,
  saveStorage,
  getCommsConfig,
  saveCommsConfig,
  getAutomations,
  saveAutomations
} from '../storage.js';
import {
  renderCategoryDropdown,
  renderProjectDropdown,
  renderProjectsNav,
  initLayout
} from './layout.js';
import { eachDayOfInterval, startOfMonth, endOfMonth, getDay, isSameDay } from 'date-fns';

let currentViewMode = 'board';

export function setCurrentViewMode(mode) {
  currentViewMode = mode;
}

export function getCurrentViewMode() {
  return currentViewMode;
}

function renderBoardColumnsView(target, renderCallback) {
  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';

  let projects = getAgencyProjects(agency);
  if (!Array.isArray(projects)) projects = [];

  let rawIndex = getCurrentProjectIndex() || 0;
  if (rawIndex >= projects.length) rawIndex = 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;

  const activeProject = projects[activeIndex] || {
    name: isYuri ? 'SSS Surveillance Operation' : 'WISE Operations',
    missions: []
  };

  const missions = Array.isArray(activeProject.missions) ? activeProject.missions : [];

  const todoMissions = missions
    .map((m, idx) => ({ mission: m, idx }))
    .filter(({ mission }) => !mission.accomplished);

  const doneMissions = missions
    .map((m, idx) => ({ mission: m, idx }))
    .filter(({ mission }) => Boolean(mission.accomplished));

  const renderCard = ({ mission, idx }) => `
    <div style="background: #fff5f6; border: 1px solid #db7093; border-left: 4px solid #10b981; padding: 0.75rem 0.85rem; margin-bottom: 0.75rem; box-shadow: 1px 1px 0px rgba(0,0,0,0.08); display: flex; align-items: flex-start; gap: 0.65rem; min-width: 0;">
      <input
        type="checkbox"
        class="board-accomplished-checkbox"
        data-index="${idx}"
        ${mission.accomplished ? 'checked' : ''}
        style="flex: 0 0 auto; width: 16px; height: 16px; margin-top: 0.2rem; accent-color: #10b981; cursor: pointer;"
      />
      <div style="flex: 1 1 auto; min-width: 0; word-wrap: break-word; overflow-wrap: anywhere;">
        <div style="font-weight: bold; font-size: 0.95rem; color: #111827; line-height: 1.3; ${mission.accomplished ? 'text-decoration: line-through; opacity: 0.65;' : ''}">
          ${mission.title || 'Untitled Mission'}
        </div>
        <div style="font-size: 0.78rem; color: #065f46; margin-top: 0.35rem; font-weight: bold;">
          ${mission.category || 'Mission'} • Threat: ${mission.threat || mission.priority || 'Medium'}
        </div>
        ${(mission.deadline || mission.dueDate) ? `
          <div style="font-size: 0.75rem; color: #374151; margin-top: 0.25rem; font-family: monospace;">
            📅 ${mission.deadline || mission.dueDate}
          </div>
        ` : ''}
      </div>
    </div>
  `;

  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center;">
        <button
          type="button"
          class="board-agency-tab"
          data-agency="wise"
          style="padding: 0.5rem 1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.03em; cursor: pointer; border: 1px solid #059669; background: #10b981; color: #ffffff; ${!isYuri ? 'outline: 2px solid #064e3b;' : ''} box-shadow: 2px 2px 0px rgba(0,0,0,0.12);"
        >
          🕵️ WISE HQ
        </button>
        <button
          type="button"
          class="board-agency-tab"
          data-agency="yuri"
          style="padding: 0.5rem 1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.03em; cursor: pointer; border: 1px solid #059669; background: #10b981; color: #ffffff; ${isYuri ? 'outline: 2px solid #064e3b;' : ''} box-shadow: 2px 2px 0px rgba(0,0,0,0.12);"
        >
          🛡️ SSS BUREAU
        </button>
      </div>

      <div style="background: #ffb6c1; border: 1px solid #db7093; border-left: 5px solid #10b981; padding: 0.85rem 1.1rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="margin: 0; font-family: 'Anton', sans-serif; font-size: 1.15rem; color: #10b981;">
          🗂️ MISSION BOARD — ${isYuri ? 'SSS BUREAU' : 'WISE HQ'} (${activeProject.name})
        </h3>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; align-items: start;">
        <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 0.9rem; min-width: 0; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.75rem; font-family: 'Anton', sans-serif; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">
            ACTIVE OPERATIONS (${todoMissions.length})
          </h4>
          ${todoMissions.length ? todoMissions.map(renderCard).join('') : `<p style="font-size: 0.85rem; color: #581c87; font-style: italic; margin: 0;">No active missions.</p>`}
        </div>

        <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 0.9rem; min-width: 0; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
          <h4 style="margin: 0 0 0.75rem; font-family: 'Anton', sans-serif; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">
            ACCOMPLISHED (${doneMissions.length})
          </h4>
          ${doneMissions.length ? doneMissions.map(renderCard).join('') : `<p style="font-size: 0.85rem; color: #581c87; font-style: italic; margin: 0;">No completed missions yet.</p>`}
        </div>
      </div>
    </div>
  `;

  target.querySelectorAll('.board-agency-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedAgency = btn.getAttribute('data-agency');
      if (selectedAgency && selectedAgency !== getActiveAgency()) {
        setActiveAgency(selectedAgency);
        if (typeof renderCallback === 'function') {
          renderCallback();
        } else {
          renderApp();
        }
      }
    });
  });

  target.querySelectorAll('.board-accomplished-checkbox').forEach((chk) => {
    chk.addEventListener('change', (e) => {
      const idx = parseInt(e.target.getAttribute('data-index'), 10);
      const freshProjects = getAgencyProjects(agency);
      if (freshProjects[activeIndex] && freshProjects[activeIndex].missions[idx]) {
        freshProjects[activeIndex].missions[idx].accomplished = e.target.checked;
        saveAgencyProjects(agency, freshProjects);
        if (typeof renderCallback === 'function') {
          renderCallback();
        } else {
          renderApp();
        }
      }
    });
  });
}

export function renderApp(filter = 'all') {
  // 1. Initialize layout, themes, navigation, and dropdowns
  initLayout();
  renderProjectsNav();
  renderProjectDropdown();
  renderCategoryDropdown();

  // 2. Locate main display container in DOM
  const container = document.getElementById('main-content-container') || document.getElementById('mission-container');
  if (!container) return;

  // 3. Route rendering based on active view mode to match views.js exports
  if (currentViewMode === 'board') {
    renderBoardColumnsView(container, () => renderApp(filter));
  } else if (currentViewMode === 'table') {
    renderTableView(container, () => renderApp(filter));
  } else if (currentViewMode === 'prepare') {
    renderPrepareMissionView(container, () => renderApp(filter));
  } else if (currentViewMode === 'insights') {
    renderInsightsView(container);
  } else if (currentViewMode === 'calendar') {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const daysArray = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start);
    renderCalendarGridView(container, start, daysArray, startDayOfWeek, isSameDay);
  } else if (currentViewMode === 'developer' || currentViewMode === 'dev') {
    renderDeveloperView(container);
  } else if (currentViewMode === 'automations' || currentViewMode === 'comms') {
    renderAutomationsView(container);
  } else {
    renderBoardColumnsView(container, () => renderApp(filter));
  }

  // 4. Attach event listeners for mission completion checkboxes across views
  container.querySelectorAll('.accomplished-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      const projects = getProjects();
      const projIndex = getCurrentProjectIndex();
      if (projects[projIndex] && projects[projIndex].missions[index]) {
        projects[projIndex].missions[index].accomplished = e.target.checked;
        saveStorage(projects);
        renderApp(filter);
      }
    });
  });
}