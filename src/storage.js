import { Project } from './project.js';
import { Mission } from './missionItem.js';

let projects = [];
let currentProjectIndex = 0;
let currentAgency = 'WISE'; // Tracks active agency: 'WISE' or 'SSS'

function normalizeAgency(agency = 'WISE') {
  const val = String(agency || 'WISE').trim().toUpperCase();
  if (val === 'SSS' || val === 'YURI' || val === 'SSS_BUREAU') {
    return 'SSS';
  }
  return 'WISE';
}

function getStorageKey(agency = currentAgency) {
  return normalizeAgency(agency) === 'SSS' ? 'sss_projects' : 'wise_projects';
}

function getCalendarStorageKey(agency = currentAgency) {
  return normalizeAgency(agency) === 'SSS' ? 'sss_calendar_events' : 'wise_calendar_events';
}

export function getActiveAgency() {
  return currentAgency;
}

export function setActiveAgency(agency) {
  currentAgency = normalizeAgency(agency);
  if (isStorageAvailable()) {
    localStorage.setItem('active_agency', currentAgency);
  }
  initStorage();
}

function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

export function initStorage() {
  if (!isStorageAvailable()) {
    console.warn("localStorage is unavailable. Using temporary memory state.");
    loadDefaultData();
    return;
  }

  const storageKey = getStorageKey();
  const savedData = localStorage.getItem(storageKey);

  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        projects = parsedData.map(pData => {
          const project = new Project(pData.name || 'Operation Sector');
          project.missions = (pData.missions || []).map(m => {
            const mission = new Mission(
              m.title,
              m.description,
              m.dueDate,
              m.threatLevel,
              m.notes,
              m.checklist || []
            );
            mission.accomplished = Boolean(m.accomplished);
            mission.spreadsheet = m.spreadsheet || '';
            mission.attachment = m.attachment || '';
            mission.imageBase64 = m.imageBase64 || '';
            return mission;
          });
          return project;
        });
        if (currentProjectIndex >= projects.length || currentProjectIndex < 0) {
          currentProjectIndex = 0;
        }
      } else {
        loadDefaultData();
      }
    } catch (e) {
      console.error("Failed to parse local storage data, loading defaults.", e);
      loadDefaultData();
    }
  } else {
    loadDefaultData();
  }
}

function loadDefaultData() {
  projects = [];
  const defaultName = currentAgency === 'SSS' ? 'SSS Operations (Yuri)' : 'WISE Operations';
  const defaultProj = new Project(defaultName);

  if (currentAgency === 'WISE') {
    defaultProj.addMission(new Mission(
      "Infiltrate Eden Academy",
      "Secure proximity to target's son.",
      "2026-11-20",
      "Critical",
      "Must maintain elegant demeanor.",
      [{ text: "Secure bespoke suit", completed: false }]
    ));
  } else {
    defaultProj.addMission(new Mission(
      "Monitor Twilight",
      "Keep a close eye on Loid Forger's movements.",
      "2026-11-25",
      "High",
      "Protect Yor at all costs!",
      [{ text: "Review surveillance logs", completed: false }]
    ));
  }

  projects.push(defaultProj);
  saveStorage();
}

export function saveStorage() {
  if (!Array.isArray(projects) || projects.length === 0) {
    loadDefaultData();
    return;
  }
  if (isStorageAvailable()) {
    localStorage.setItem(getStorageKey(), JSON.stringify(projects));
  }
}

export function getProjects() {
  return projects;
}

export function getCurrentProjectIndex() {
  return currentProjectIndex;
}

export function setCurrentProjectIndex(index) {
  const parsed = Number(index);
  if (!Number.isNaN(parsed) && parsed >= 0 && parsed < projects.length) {
    currentProjectIndex = parsed;
  } else {
    currentProjectIndex = 0;
  }
}

export function addProject(name) {
  const cleanName = String(name || '').trim() || `Sector ${projects.length + 1}`;
  projects.push(new Project(cleanName));
  currentProjectIndex = projects.length - 1;
  saveStorage();
}

export function deleteProject(index) {
  if (projects.length <= 1) {
    alert("Operation sector cannot be empty. Maintain at least one active sector.");
    return;
  }
  if (index < 0 || index >= projects.length) return;
  projects.splice(index, 1);
  if (currentProjectIndex >= projects.length) {
    currentProjectIndex = projects.length - 1;
  }
  saveStorage();
}

export function addMissionToCurrentProject(missionData, targetDate = '') {
  if (!Array.isArray(projects) || projects.length === 0) {
    loadDefaultData();
  }
  const safeProjIndex =
    currentProjectIndex >= 0 && currentProjectIndex < projects.length ? currentProjectIndex : 0;

  const resolvedDueDate = missionData.dueDate || missionData.deadline || targetDate || '';

  const newMission = new Mission(
    missionData.title,
    missionData.description,
    resolvedDueDate,
    missionData.threatLevel || missionData.threat || 'Medium',
    missionData.notes,
    missionData.checklist || []
  );
  newMission.accomplished = Boolean(missionData.accomplished);
  if (missionData.spreadsheet) newMission.spreadsheet = missionData.spreadsheet;
  if (missionData.attachment) newMission.attachment = missionData.attachment;
  if (missionData.imageBase64) newMission.imageBase64 = missionData.imageBase64;

  projects[safeProjIndex].addMission(newMission);
  saveStorage();
  return newMission;
}

export function deleteMission(projectIndex, missionIndex) {
  const proj = projects[projectIndex];
  if (!proj || !Array.isArray(proj.missions)) return;
  if (missionIndex < 0 || missionIndex >= proj.missions.length) return;
  proj.missions.splice(missionIndex, 1);
  saveStorage();
}

export function updateMission(projectIndex, missionIndex, title, desc, date, threat, notes) {
  const proj = projects[projectIndex];
  const mission = proj && proj.missions ? proj.missions[missionIndex] : null;
  if (mission) {
    mission.updateDetails(title, desc, date, threat, notes);
    saveStorage();
  }
}

export function toggleMissionStatus(projectIndex, missionIndex) {
  const proj = projects[projectIndex];
  const mission = proj && proj.missions ? proj.missions[missionIndex] : null;
  if (mission) {
    mission.toggleStatus();
    saveStorage();
  }
}

export function toggleChecklistItem(projectIndex, missionIndex, checkIndex) {
  const proj = projects[projectIndex];
  const mission = proj && proj.missions ? proj.missions[missionIndex] : null;
  if (mission) {
    mission.toggleChecklistItem(checkIndex);
    saveStorage();
  }
}

// --- Calendar Events & Entries Storage (Per Agency) ---

export function getCalendarEvents(agency = currentAgency) {
  if (!isStorageAvailable()) return [];
  const raw = localStorage.getItem(getCalendarStorageKey(agency));
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed to parse calendar events from localStorage:", e);
    return [];
  }
}

export function saveCalendarEvents(events, agency = currentAgency) {
  if (!isStorageAvailable()) return [];
  const list = Array.isArray(events) ? events : [];
  localStorage.setItem(getCalendarStorageKey(agency), JSON.stringify(list));
  return list;
}

export function addCalendarEvent(eventData, agency = currentAgency) {
  const events = getCalendarEvents(agency);
  const newEvent = {
    id: eventData.id || `cal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: eventData.date || '', // Expected 'YYYY-MM-DD'
    title: String(eventData.title || 'Scheduled Operation').trim(),
    notes: String(eventData.notes || '').trim(),
    threatLevel: eventData.threatLevel || eventData.threat || 'Medium',
    completed: Boolean(eventData.completed),
    createdAt: new Date().toISOString()
  };
  events.push(newEvent);
  saveCalendarEvents(events, agency);
  return newEvent;
}

export function toggleCalendarEvent(eventId, agency = currentAgency) {
  const updated = getCalendarEvents(agency).map(ev =>
    ev.id === eventId ? { ...ev, completed: !ev.completed } : ev
  );
  return saveCalendarEvents(updated, agency);
}

export function deleteCalendarEvent(eventId, agency = currentAgency) {
  const filtered = getCalendarEvents(agency).filter(ev => ev.id !== eventId);
  return saveCalendarEvents(filtered, agency);
}

// --- Comms, Automations & Category Storage ---

export function getCommsConfig() {
  const key = currentAgency === 'SSS' ? 'sss_comms_config' : 'wise_comms_config';
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : {
    mcpEndpoint: '',
    apiKey: '',
    telegramToken: '',
    telegramChatId: '',
    discordWebhook: ''
  };
}

export function saveCommsConfig(config) {
  const key = currentAgency === 'SSS' ? 'sss_comms_config' : 'wise_comms_config';
  localStorage.setItem(key, JSON.stringify(config));
}

export function getAutomations() {
  const key = currentAgency === 'SSS' ? 'sss_automations' : 'wise_automations';
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

export function saveAutomations(automations) {
  const key = currentAgency === 'SSS' ? 'sss_automations' : 'wise_automations';
  localStorage.setItem(key, JSON.stringify(automations));
}

// Automatically sync agency state from localStorage on script load
setActiveAgency(localStorage.getItem('active_agency') || 'WISE');