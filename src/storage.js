import { Project } from './project.js';
import { Mission } from './missionItem.js';

let projects = [];
let currentProjectIndex = 0;

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

  const savedData = localStorage.getItem('wise_projects');
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
          return mission;
        });
        return project;
      });
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
  const defaultProj = new Project("WISE Operations");
  defaultProj.addMission(new Mission(
    "Infiltrate Eden Academy", 
    "Secure proximity to target's son.", 
    "2026-11-20", 
    "Critical", 
    "Must maintain elegant demeanor.", 
    [{ text: "Secure bespoke suit", completed: false }]
  ));
  projects.push(defaultProj);
  saveStorage();
}

export function saveStorage() {
  if (isStorageAvailable()) {
    localStorage.setItem('wise_projects', JSON.stringify(projects));
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

export function addMissionToCurrentProject(title, desc, date, threat, notes) {
  const newMission = new Mission(title, desc, date, threat, notes, []);
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
