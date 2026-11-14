import { renderApp, setCurrentViewMode } from './dom.controller.js';
import { 
  getProjects, 
  getCurrentProjectIndex, 
  setCurrentProjectIndex, 
  setActiveAgency, 
  addProject, 
  addMissionToCurrentProject 
} from '../storage.js';
import { renderCategoryDropdown, renderProjectDropdown } from './layout.js';

// ==========================================
// 1. GLOBAL UI LISTENERS (Active on ALL pages)
// ==========================================
export function initGlobalListeners() {
  document.addEventListener('click', (e) => {
    const target = e.target.closest('button, a, .view-tab-btn, .agency-tab-btn');
    if (!target) return;

    const text = target.textContent.trim().toLowerCase();
    const id = (target.id || '').toLowerCase();
    const className = (typeof target.className === 'string' ? target.className : '').toLowerCase();

    // A. Agency Switching
    if (text.includes('yuri') || text.includes('sss') || id.includes('sss') || id.includes('yuri')) {
      document.body.classList.remove('wise-theme');
      document.body.classList.add('sss-theme');
      setActiveAgency('SSS');
      const projects = getProjects();
      const sssIndex = projects.findIndex(p => p.name && (p.name.toLowerCase().includes('sss') || p.name.toLowerCase().includes('yuri')));
      setCurrentProjectIndex(sssIndex !== -1 ? sssIndex : Math.min(1, projects.length - 1));
      renderApp();
      return;
    }
    
    if ((text.includes('wise') || text.includes('twilight') || id.includes('wise')) && !text.includes('archives')) {
      document.body.classList.remove('sss-theme');
      document.body.classList.add('wise-theme');
      setActiveAgency('WISE');
      setCurrentProjectIndex(0);
      renderApp();
      return;
    }

    // B. Global Theme Toggle Button
    if (id.includes('theme') || text.includes('theme') || className.includes('theme')) {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('wise_dark_theme', isDark);
      return;
    }

    // C. View Switching Tabs (Board, Calendar, Prepare, Insights, Dev, Comms)
    let mode = null;
    if (text.includes('calendar') || id.includes('calendar')) mode = 'calendar';
    else if (text.includes('prepare') || id.includes('prepare')) mode = 'prepare';
    else if (text.includes('insights') || id.includes('insights')) mode = 'insights';
    else if (text.includes('board') || id.includes('board')) mode = 'board';
    else if (text.includes('table') || id.includes('table')) mode = 'table';
    else if (text.includes('dev') || id.includes('dev')) mode = 'developer';
    else if (text.includes('comms') || text.includes('automations')) mode = 'automations';

    if (mode) {
      setCurrentViewMode(mode);
      renderApp();
      return;
    }

    // D. Mission Status Filters
    if (['all', 'inactive', 'pending', 'fulfilled', 'accomplished'].includes(text)) {
      renderApp(text);
      return;
    }
  });
}

// ==========================================
// 2. WISE HQ / SSS BUREAU FORM LISTENERS
// ==========================================
export function initDossierListeners() {
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('project-name');
      const name = input ? input.value.trim() : '';
      if (name) {
        addProject(name);
        input.value = '';
        renderApp();
      }
    });
  }

  const missionForm = document.getElementById('mission-form');
  if (missionForm) {
    missionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('mission-title').value.trim();
      const description = document.getElementById('mission-desc').value.trim();
      const dueDate = document.getElementById('mission-date').value;
      const threatLevel = document.getElementById('mission-threat').value;
      const category = document.getElementById('mission-category').value;
      const notes = document.getElementById('mission-notes').value.trim();
      const spreadsheet = document.getElementById('mission-spreadsheet').value.trim();
      const attachment = document.getElementById('mission-attachment').value.trim();
      const imageFileinput = document.getElementById('mission-image-file');

      if (!title) return;

      const finishMissionCreation = (imageBase64 = '') => {
        addMissionToCurrentProject({
          title, description, dueDate, threatLevel, category, notes, spreadsheet, attachment, imageBase64,
          accomplished: false, checklist: [], comments: []
        });
        missionForm.reset();
        renderCategoryDropdown();
        renderProjectDropdown();
        renderApp('all');
      };

      if (imageFileinput && imageFileinput.files && imageFileinput.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => finishMissionCreation(event.target.result);
        reader.readAsDataURL(imageFileinput.files[0]);
      } else {
        finishMissionCreation();
      }
    });
  }

  // Voice Dictate
  const voiceBtn = document.getElementById('voice-dictate-btn');
  if (voiceBtn) {
    voiceBtn.addEventListener('click', () => {
      const titleInput = document.getElementById('mission-title');
      const descInput = document.getElementById('mission-desc');
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('🎙️ Native Speech Recognition API is not supported in this browser environment.');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        voiceBtn.style.background = '#8b1e1e';
        voiceBtn.style.color = '#fff';
        voiceBtn.textContent = '🎙️ Recording... Speak Now';
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (titleInput && !titleInput.value) {
          titleInput.value = transcript;
        } else if (descInput) {
          descInput.value = transcript + (descInput.value ? ' ' + descInput.value : '');
        }
      };

      recognition.onend = () => {
        voiceBtn.style.background = '';
        voiceBtn.style.color = '';
        voiceBtn.textContent = '🎙️ Voice Dictate';
      };

      try {
        recognition.start();
      } catch (err) {
        voiceBtn.textContent = '🎙️ Voice Dictate';
      }
    });
  }
}