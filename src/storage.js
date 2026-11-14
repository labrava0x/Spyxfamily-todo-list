import { Project } from './project.js';
import { Mission } from './missionItem.js';

let projects = [];
let currentProjectIndex = 0;
let currentAgency = 'WISE'; // Tracks active agency: 'WISE' or 'SSS'

function getStorageKey() {
  return currentAgency === 'SSS' ? 'sss_projects' : 'wise_projects';
}

export function setActiveAgency(agency) {
  currentAgency = agency;
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
      projects = parsedData.map(pData => {
        const project = new Project(pData.name);
        project.missions = (pData.missions || []).map(m => {
          const mission = new Mission(
            m.title, 
            m.description, 
            m.dueDate, 
            m.threatLevel, 
            m.notes, 
            m.checklist || []
          );
          mission.accomplished = m.accomplished || false;
          mission.spreadsheet = m.spreadsheet || '';
          mission.attachment = m.attachment || '';
          mission.imageBase64 = m.imageBase64 || '';
          return mission;
        });
        return project;
      });
      if (currentProjectIndex >= projects.length) {
        currentProjectIndex = 0;
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
  currentProjectIndex = index;
}

export function addProject(name) {
  projects.push(new Project(name));
  currentProjectIndex = projects.length - 1;
  saveStorage();
}

export function deleteProject(index) {
  if (projects.length <= 1) {
    alert("Operation sector cannot be empty. Maintain at least one active sector.");
    return;
  }
  projects.splice(index, 1);
  if (currentProjectIndex >= projects.length) {
    currentProjectIndex = projects.length - 1;
  }
  saveStorage();
}

export function addMissionToCurrentProject(missionData) {
  const newMission = new Mission(
    missionData.title,
    missionData.description,
    missionData.dueDate,
    missionData.threatLevel,
    missionData.notes,
    missionData.checklist || []
  );
  newMission.accomplished = missionData.accomplished || false;
  if (missionData.spreadsheet) newMission.spreadsheet = missionData.spreadsheet;
  if (missionData.attachment) newMission.attachment = missionData.attachment;
  if (missionData.imageBase64) newMission.imageBase64 = missionData.imageBase64;

  projects[currentProjectIndex].addMission(newMission);
  saveStorage();
}

export function deleteMission(projectIndex, missionIndex) {
  projects[projectIndex].missions.splice(missionIndex, 1);
  saveStorage();
}

export function updateMission(projectIndex, missionIndex, title, desc, date, threat, notes) {
  const mission = projects[projectIndex].missions[missionIndex];
  if (mission) {
    mission.updateDetails(title, desc, date, threat, notes);
    saveStorage();
  }
}

export function toggleMissionStatus(projectIndex, missionIndex) {
  projects[projectIndex].missions[missionIndex].toggleStatus();
  saveStorage();
}

export function toggleChecklistItem(projectIndex, missionIndex, checkIndex) {
  projects[projectIndex].missions[missionIndex].toggleChecklistItem(checkIndex);
  saveStorage();
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