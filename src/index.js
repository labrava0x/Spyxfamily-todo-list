import './style.css';
import { initLayout, initEventListeners, renderApp } from './domController.js';

document.addEventListener('DOMContentLoaded', () => {
  initLayout();
  initEventListeners();
  renderApp();
});
