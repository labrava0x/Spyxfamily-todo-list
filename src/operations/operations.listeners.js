import { renderBoardView } from '../dom.controllers/board.renderer.js';
import { renderCalendarGridView } from '../views/calendar.renderer.js';
import { renderTableView } from '../views/table.renderer.js';
import { renderDeveloperView } from '../views/dev.renderer.js';
import { renderAutomationsView } from '../views/automations.renderer.js';
import { renderApp } from '../dom.controllers/dom.controller.js';

export function initOperationsListeners() {
  const commsContainer = document.querySelector('.comms-hub-folder');
  if (!commsContainer) return; // Only run if we are actually on operations.html

  // Target container where the views will be injected
  const contentContainer = document.getElementById('mission-container') || commsContainer;

  commsContainer.addEventListener('click', (e) => {
    const target = e.target.closest('button');
    if (!target) return;

    const id = target.id || '';

    // Handle internal sub-view switches inside the Comms Hub
    if (id.startsWith('view-') && id.endsWith('-btn')) {
      const allTabs = commsContainer.querySelectorAll('.view-tab-btn');
      allTabs.forEach(btn => btn.classList.remove('active'));
      target.classList.add('active');
    }

    // Route the click to the correct imported renderer module!
    if (id === 'view-board-btn') {
      renderBoardView(contentContainer, renderApp);
    } 
    else if (id === 'view-prep-btn') {
      renderApp(contentContainer);
    } 
    else if (id === 'view-calendar-btn') {
      renderCalendarGridView(contentContainer, renderApp);
    } 
    else if (id === 'view-table-btn') {
      renderTableView(contentContainer, renderApp);
    } 
    else if (id === 'view-dev-btn') {
      renderDeveloperOverview(contentContainer, renderApp);
    } 
    else if (id === 'view-automations-btn') {
      renderAutomationsView(contentContainer, renderApp);
    }
  });
}