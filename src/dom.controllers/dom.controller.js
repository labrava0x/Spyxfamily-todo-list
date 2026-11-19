import { renderPrepareMissionView, renderInsightsView } from '../views/renderer.js';
import { renderAutomationsView } from '../views/automations.renderer.js';
import { renderCalendarGridView } from '../views/calendar.renderer.js';
import { renderDeveloperView } from '../views/dev.renderer.js';
import { renderTableView } from '../views/table.renderer.js';
import { renderBoardView } from './board.renderer.js';
import {
  getProjects,
  getCurrentProjectIndex,
  saveStorage
} from '../storage.js';
import {
  renderCategoryDropdown,
  renderProjectDropdown,
  renderProjectsNav,
  initLayout,
  setActiveCommsTab
} from './layout.js';
import { eachDayOfInterval, startOfMonth, endOfMonth, getDay, isSameDay } from 'date-fns';

let currentViewMode = 'board';

export function setCurrentViewMode(mode) {
  currentViewMode = mode;
  setActiveCommsTab(currentViewMode);
}

export function getCurrentViewMode() {
  return currentViewMode;
}

export function renderApp(filter = 'all') {
  initLayout();
  setActiveCommsTab(currentViewMode);
  renderProjectsNav();
  renderProjectDropdown();
  renderCategoryDropdown();

  const container = document.getElementById('main-content-container') || document.getElementById('mission-container');
  if (!container) return;

  const rerender = () => renderApp(filter);

  if (currentViewMode === 'board') {
    renderBoardView(container, filter, rerender);
  } else if (currentViewMode === 'table') {
    renderTableView(container, rerender);
  } else if (currentViewMode === 'prepare') {
    renderPrepareMissionView(container, rerender);
  } else if (currentViewMode === 'insights') {
    renderInsightsView(container, rerender);
  } else if (currentViewMode === 'calendar') {
    const today = new Date();
    const start = startOfMonth(today);
    const end = endOfMonth(today);
    const daysArray = eachDayOfInterval({ start, end });
    const startDayOfWeek = getDay(start);
    renderCalendarGridView(container, start, end, daysArray, startDayOfWeek, isSameDay, rerender);
  } else if (currentViewMode === 'developer' || currentViewMode === 'dev') {
    renderDeveloperView(container);
  } else if (currentViewMode === 'automations' || currentViewMode === 'comms') {
    renderAutomationsView(container);
  } else {
    renderBoardView(container, filter, rerender);
  }

  container.querySelectorAll('.accomplished-checkbox').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      const projects = getProjects();
      const projIndex = getCurrentProjectIndex();
      if (projects[projIndex] && projects[projIndex].missions[index]) {
        projects[projIndex].missions[index].accomplished = e.target.checked;
        saveStorage(projects);
        rerender();
      }
    });
  });
}