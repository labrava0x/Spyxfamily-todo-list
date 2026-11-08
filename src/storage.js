import { Project } from './project.js';
import { Mission } from './missionItem.js';

let projects = [];
let currentProjectIndex = 0;

export function initStorage() {
  if (projects.length === 0) {
    projects.push(new Project("WISE Operations"));
    projects[0].addMission(new Mission(
      "Infiltrate Eden Academy", 
      "Secure proximity to target's son.", 
      "2026-11-20", 
      "Critical", 
      "Must maintain elegant demeanor.", 
      [{ text: "Secure bespoke suit", completed: false }]
    ));
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
}

export function addMissionToCurrentProject(title, desc, date, threat, notes) {
  const newMission = new Mission(title, desc, date, threat, notes, []);
  projects[currentProjectIndex].addMission(newMission);
}

export function deleteMission(projectIndex, missionIndex) {
  projects[projectIndex].missions.splice(missionIndex, 1);
}

export function updateMission(projectIndex, missionIndex, title, desc, date, threat, notes) {
  const mission = projects[projectIndex].missions[missionIndex];
  if (mission) {
    mission.updateDetails(title, desc, date, threat, notes);
  }
}

export function toggleMissionStatus(projectIndex, missionIndex) {
  projects[projectIndex].missions[missionIndex].toggleStatus();
}

export function toggleChecklistItem(projectIndex, missionIndex, checkIndex) {
  projects[projectIndex].missions[missionIndex].toggleChecklistItem(checkIndex);
}
