import { 
  renderInsightsView, 
  renderPrepareMissionView, 
  renderCalendarGridView, 
  renderTableView, 
  renderDeveloperView, 
  renderAutomationsView 
} from './views.js';
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
  if (currentViewMode === 'board' || currentViewMode === 'table') {
    renderTableView(container);
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
    renderCalendarGridView(container, start, end, daysArray, startDayOfWeek, isSameDay);
  } else if (currentViewMode === 'developer' || currentViewMode === 'dev') {
    renderDeveloperView(container);
  } else if (currentViewMode === 'automations' || currentViewMode === 'comms') {
    renderAutomationsView(container);
  } else {
    renderTableView(container);
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