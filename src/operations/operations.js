import '../styles/style.css';
import '../styles/cover.css';
import '../styles/commhub.css';
import { initCover } from '../cover.js';
import { renderApp, setCurrentViewMode } from '../dom.controllers/dom.controller.js';
import { initGlobalListeners } from '../dom.controllers/global.listeners.js';
import { initOperationsListeners } from './operations.listeners.js';

document.addEventListener('DOMContentLoaded', () => {
  initCover(() => {
    setCurrentViewMode('board');
    initGlobalListeners();
    initOperationsListeners();
    renderApp();
  });
});