import { initStorage } from './storage.js';
import { renderApp, initEventListeners } from './domController.js';

// Initialize application data and DOM listeners on load
document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  renderApp();
  initEventListeners();
});
