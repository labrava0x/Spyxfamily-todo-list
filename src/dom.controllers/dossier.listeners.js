import { renderApp } from './dom.controller.js';
import {
  addProject,
  addMissionToCurrentProject
} from '../storage.js';
import { renderCategoryDropdown, renderProjectDropdown } from './layout.js';
import { getActiveAgency } from '../views/agency.switcher.js';
import { normalizeAgencyKey, syncNoteToAgencyCalendar } from '../views/agency.sync.js';

export function initDossierListeners() {
  if (window._dossierListenersInitialized) return;
  window._dossierListenersInitialized = true;

  // ==========================================
  // 1. PROJECT FORM SUBMIT
  // ==========================================
  document.addEventListener('submit', (e) => {
    const projectForm = e.target.closest('#project-form');
    if (!projectForm) return;

    e.preventDefault();
    const input = document.getElementById('project-name');
    const name = input ? input.value.trim() : '';
    if (name) {
      addProject(name);
      input.value = '';
      renderApp();
    }
  });

  // ==========================================
  // 2. MISSION DISPATCH FORM
  // ==========================================
  document.addEventListener('submit', (e) => {
    const missionForm = e.target.closest('#mission-form');
    if (!missionForm) return;

    e.preventDefault();
    const title = document.getElementById('mission-title')?.value.trim() || '';
    const description = document.getElementById('mission-desc')?.value.trim() || '';
    const dueDate = document.getElementById('mission-date')?.value || '';
    const threatLevel = document.getElementById('mission-threat')?.value || 'Medium';
    const category = document.getElementById('mission-category')?.value || '';
    const notes = document.getElementById('mission-notes')?.value.trim() || '';
    const spreadsheet = document.getElementById('mission-spreadsheet')?.value.trim() || '';
    const attachment = document.getElementById('mission-attachment')?.value.trim() || '';
    const imageFileInput = document.getElementById('mission-image-file');

    if (!title) return;

    const agencyKey = normalizeAgencyKey(getActiveAgency());

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

      if (dueDate) {
        syncNoteToAgencyCalendar(
          {
            title,
            date: String(dueDate).slice(0, 10),
            notes: notes || description,
            threatLevel
          },
          agencyKey
        );
      }

      missionForm.reset();
      renderCategoryDropdown();
      renderProjectDropdown();
      renderApp('all');
    };

    if (imageFileInput && imageFileInput.files && imageFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        finishMissionCreation(event.target.result);
      };
      reader.readAsDataURL(imageFileInput.files[0]);
    } else {
      finishMissionCreation();
    }
  });

  // ==========================================
  // 3. SPEECH RECORDING API (DELEGATED)
  // ==========================================
  let activeRecognizer = null;
  let activeBtn = null;

  const resetVoiceButton = () => {
    if (activeRecognizer) {
      try {
        activeRecognizer.stop();
      } catch (_) {
        // Ignore already stopped recognizer
      }
      activeRecognizer = null;
    }
    if (activeBtn) {
      activeBtn.style.background = '';
      activeBtn.style.color = '';
      activeBtn.textContent = '🎙️ Voice Dictate';
      activeBtn.setAttribute('aria-pressed', 'false');
      activeBtn = null;
    }
  };

  document.addEventListener('click', (e) => {
    const voiceBtn = e.target.closest('#voice-dictate-btn');
    if (!voiceBtn) return;

    e.preventDefault();

    if (activeBtn === voiceBtn && activeRecognizer) {
      resetVoiceButton();
      return;
    }

    resetVoiceButton();

    const titleInput = document.getElementById('mission-title');
    const descInput = document.getElementById('mission-desc');
    const notesInput = document.getElementById('mission-notes');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('🎙️ Native Speech Recognition API is not supported in this browser environment.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = navigator.language || 'en-US';

    activeRecognizer = recognition;
    activeBtn = voiceBtn;

    recognition.onstart = () => {
      voiceBtn.style.background = '#8b1e1e';
      voiceBtn.style.color = '#fff';
      voiceBtn.textContent = '🎙️ Recording... Speak Now';
      voiceBtn.setAttribute('aria-pressed', 'true');
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (!transcript) return;

      if (titleInput && !titleInput.value.trim()) {
        titleInput.value = transcript;
        titleInput.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (descInput) {
        descInput.value = descInput.value.trim()
          ? `${descInput.value.trim()} ${transcript}`
          : transcript;
        descInput.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (notesInput) {
        notesInput.value = notesInput.value.trim()
          ? `${notesInput.value.trim()} ${transcript}`
          : transcript;
        notesInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.warn('Mission voice dictation error:', event.error);
      }
      resetVoiceButton();
    };

    recognition.onend = () => {
      resetVoiceButton();
    };

    try {
      recognition.start();
    } catch (_) {
      resetVoiceButton();
    }
  });
}