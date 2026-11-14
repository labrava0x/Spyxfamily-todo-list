import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { 
  initLayout, 
  renderCategoryDropdown, 
  renderProjectsNav, 
  renderProjectDropdown, 
  getCategories, 
  saveCategories 
} from './layout.js';
import { renderBoardView } from './board.renderer.js';
import { 
  renderInsightsView, 
  renderPrepareMissionView, 
  renderCalendarGridView, 
  renderTableView, 
  renderDeveloperView, 
  renderAutomationsView 
} from './views.js';

let currentStatusFilter = 'all';
let currentViewMode = 'board';

export function setCurrentViewMode(mode) {
  currentViewMode = mode;
}

export function getCurrentViewMode() {
  return currentViewMode;
}

export function getCurrentStatusFilter() {
  return currentStatusFilter;
}

export function setCurrentStatusFilter(filter) {
  currentStatusFilter = filter;
}

export function renderApp(filterOverride = null) {
  if (filterOverride) currentStatusFilter = filterOverride;
  
  renderProjectsNav();
  renderProjectDropdown();
  renderCategoryDropdown();
  renderCurrentView();
}

// Expose globally for instant invocation
window.renderApp = renderApp;
window.setCurrentViewMode = setCurrentViewMode;

export function renderCurrentView() {
  const container = document.getElementById('mission-container');
  const creationSection = document.getElementById('board-creation-section');
  const folderTab = document.getElementById('board-folder-tab');
  const viewHeading = document.getElementById('view-title-heading');
  const filterContainer = document.getElementById('status-filter-container');
  if (!container) return;

  if (currentViewMode === 'prepare') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'PREPARE MISSION';
    if (viewHeading) viewHeading.textContent = 'Mission Preparation & Scripts';
    if (filterContainer) filterContainer.style.display = 'none';
    renderPrepareMissionView(container, renderApp);
  } else if (currentViewMode === 'insights') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'OPERATION INSIGHTS';
    if (viewHeading) viewHeading.textContent = 'Project Health & Analytics';
    if (filterContainer) filterContainer.style.display = 'none';
    renderInsightsView(container);
  } else if (currentViewMode === 'calendar') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'CALENDAR VIEW';
    if (viewHeading) viewHeading.textContent = format(new Date(), 'MMMM yyyy') + ' Calendar';
    if (filterContainer) filterContainer.style.display = 'none';
    const today = new Date();
    renderCalendarGridView(container, startOfMonth(today), endOfMonth(today), eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) }), getDay(startOfMonth(today)), isSameDay);
  } else if (currentViewMode === 'table') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'TABLE VIEW';
    if (viewHeading) viewHeading.textContent = 'Mission Data Table';
    if (filterContainer) filterContainer.style.display = 'flex';
    renderTableView(container);
  } else if (currentViewMode === 'developer') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'DEVELOPER TOOLS & MCP';
    if (viewHeading) viewHeading.textContent = 'API, CLI & MCP Server Integration';
    if (filterContainer) filterContainer.style.display = 'none';
    renderDeveloperView(container);
  } else if (currentViewMode === 'automations') {
    if (creationSection) creationSection.style.display = 'none';
    if (folderTab) folderTab.textContent = 'COMMS RELAYS';
    if (viewHeading) viewHeading.textContent = 'Messaging Relays (Telegram & Discord)';
    if (filterContainer) filterContainer.style.display = 'none';
    renderAutomationsView(container);
  } else {
    if (creationSection) creationSection.style.display = 'block';
    if (folderTab) folderTab.textContent = 'MISSION BOARD';
    if (viewHeading) viewHeading.textContent = 'Mission Log';
    if (filterContainer) filterContainer.style.display = 'flex';
    renderBoardView(container, currentStatusFilter, renderApp);
  }
}