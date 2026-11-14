import { renderApp } from './dom.controller.js';
import { 
  addProject, 
  addMissionToCurrentProject 
} from '../storage.js';
import { renderCategoryDropdown, renderProjectDropdown } from './layout.js';

export function initDossierListeners() {
  // ==========================================
  // 1. PROJECT FORM SUBMIT
  // ==========================================
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

  // ==========================================
  // 2. MISSION DISPATCH FORM
  // ==========================================
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
          title,
          description,
          dueDate,
          threatLevel,
          category,
          notes,
          spreadsheet, 
          attachment,  
          imageBase64, 
          accomplished: false,
          checklist: [],
          comments: []
        });

        missionForm.reset();
        renderCategoryDropdown();
        renderProjectDropdown();
        renderApp('all');
      };

      if (imageFileinput && imageFileinput.files && imageFileinput.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
          finishMissionCreation(event.target.result);
        };
        reader.readAsDataURL(imageFileinput.files[0]);
      } else {
        finishMissionCreation();
      }
    });
  }

  // ==========================================
  // 3. SPEECH RECORDING API
  // ==========================================
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