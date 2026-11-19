import '../styles/style.css';
import '../styles/commhub.css';
import '../styles/cover.css';
import { initCover } from '../cover.js';
import { initOperationsListeners } from './operations.listeners.js';
import { initGlobalListeners } from '../dom.controllers/global.listeners.js';
import { setCurrentViewMode, renderApp } from '../dom.controllers/dom.controller.js';

document.addEventListener('DOMContentLoaded', () => {
  initCover();
  setCurrentViewMode('board');
  initGlobalListeners();
  initOperationsListeners();
  renderApp();
});