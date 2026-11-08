/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/domController.js"
/*!******************************!*\
  !*** ./src/domController.js ***!
  \******************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   initEventListeners: () => (/* binding */ initEventListeners),
/* harmony export */   renderApp: () => (/* binding */ renderApp)
/* harmony export */ });
/* harmony import */ var _storage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./storage.js */ "./src/storage.js");


function renderApp() {
  renderProjectsNav();
  renderProjectDropdown();
  renderMissions();
}

function renderProjectsNav() {
  const navContainer = document.getElementById('project-nav');
  if (!navContainer) return;

  const projects = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getProjects)();
  const currentIndex = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentProjectIndex)();

  navContainer.innerHTML = '';
  projects.forEach((project, index) => {
    const btn = document.createElement('button');
    btn.textContent = project.name;
    btn.className = index === currentIndex ? 'project-btn active' : 'project-btn';
    btn.addEventListener('click', () => {
      (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.setCurrentProjectIndex)(index);
      renderApp();
    });
    navContainer.appendChild(btn);
  });
}

function renderProjectDropdown() {
  const select = document.getElementById('mission-project');
  if (!select) return;

  const projects = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getProjects)();
  const currentIndex = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentProjectIndex)();

  select.innerHTML = '';
  projects.forEach((project, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = project.name;
    select.appendChild(option);
  });
  select.value = currentIndex;
}

function renderMissions() {
  const container = document.getElementById('mission-container');
  if (!container) return;
  
  container.innerHTML = ''; 

  const projects = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getProjects)();
  const currentIndex = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentProjectIndex)();
  const activeProject = projects[currentIndex];

  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p class="no-missions">No active missions in this sector.</p>';
    return;
  }

  activeProject.missions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = `mission-card threat-${mission.threatLevel.toLowerCase()}`;
    if (mission.accomplished) card.classList.add('accomplished');

    // Compact Header View (Title, Due Date, Threat Level badge, Expand & Delete controls)
    const headerDiv = document.createElement('div');
    headerDiv.className = 'mission-compact-header';
    headerDiv.innerHTML = `
      <div class="mission-summary-info">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" />
        <span class="mission-title-text">${mission.title}</span>
        <span class="badge threat-badge">${mission.threatLevel}</span>
        <span class="due-date-text">📅 ${mission.dueDate || 'No Deadline'}</span>
      </div>
      <div class="mission-actions">
        <button class="expand-btn" data-index="${index}">Expand ▾</button>
        <button class="delete-mission-btn" data-index="${index}">🗑️</button>
      </div>
    `;

    // Expandable Details Drawer (Hidden by default)
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'mission-details-drawer hidden';
    detailsDiv.id = `details-drawer-${index}`;

    let checklistHtml = '';
    if (mission.checklist && mission.checklist.length > 0) {
      checklistHtml = '<ul class="checklist-ul">';
      mission.checklist.forEach((checkItem, cIndex) => {
        checklistHtml += `
          <li>
            <label>
              <input type="checkbox" data-mission-index="${index}" data-check-index="${cIndex}" class="checklist-checkbox" ${checkItem.completed ? 'checked' : ''} />
              ${checkItem.text}
            </label>
          </li>
        `;
      });
      checklistHtml += '</ul>';
    }

    detailsDiv.innerHTML = `
      <div class="details-content">
        <p><strong>Description:</strong> ${mission.description || 'None'}</p>
        <p><strong>Field Notes:</strong> ${mission.notes || 'None'}</p>
        <div class="checklist-section">
          <strong>Sub-Objectives:</strong>
          ${checklistHtml || '<p>No sub-objectives assigned.</p>'}
        </div>
        <button class="edit-mission-btn" data-index="${index}">Edit Mission</button>
      </div>
    `;

    card.appendChild(headerDiv);
    card.appendChild(detailsDiv);
    container.appendChild(card);
  });

  attachMissionEventListeners();
}

function attachMissionEventListeners() {
  // Toggle Accomplished Status
  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.toggleMissionStatus)((0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentProjectIndex)(), mIdx);
      renderMissions();
    });
  });

  // Toggle Checklist Item
  document.querySelectorAll('.checklist-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-mission-index');
      const cIdx = e.target.getAttribute('data-check-index');
      (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.toggleChecklistItem)((0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentProjectIndex)(), mIdx, cIdx);
    });
  });

  // Expand / Collapse Details Drawer
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const drawer = document.getElementById(`details-drawer-${mIdx}`);
      drawer.classList.toggle('hidden');
      btn.textContent = drawer.classList.contains('hidden') ? 'Expand ▾' : 'Collapse ▴';
    });
  });

  // Delete Mission
  document.querySelectorAll('.delete-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.deleteMission)((0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentProjectIndex)(), mIdx);
      renderApp();
    });
  });

  // Edit Mission (Inline Prompt/Form trigger)
  document.querySelectorAll('.edit-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const projectIndex = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getCurrentProjectIndex)();
      const mission = (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.getProjects)()[projectIndex].missions[mIdx];

      const newTitle = prompt("Edit Mission Title:", mission.title);
      if (newTitle === null) return;
      const newDesc = prompt("Edit Description:", mission.description);
      const newDate = prompt("Edit Due Date (YYYY-MM-DD):", mission.dueDate);
      const newThreat = prompt("Edit Threat Level (Low, Medium, Critical):", mission.threatLevel);
      const newNotes = prompt("Edit Field Notes:", mission.notes);

      (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.updateMission)(projectIndex, mIdx, newTitle, newDesc, newDate, newThreat, newNotes);
      renderApp();
    });
  });
}

// Setup Form Event Listeners
function initEventListeners() {
  const projectForm = document.getElementById('project-form');
  if (projectForm) {
    projectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const projectNameInput = document.getElementById('project-name');
      const name = projectNameInput.value.trim();
      if (name) {
        (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.addProject)(name);
        projectForm.reset();
        renderApp();
      }
    });
  }

  const missionForm = document.getElementById('mission-form');
  if (missionForm) {
    missionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const title = document.getElementById('mission-title').value;
      const desc = document.getElementById('mission-desc').value;
      const date = document.getElementById('mission-date').value;
      const threat = document.getElementById('mission-threat').value;
      const notes = document.getElementById('mission-notes').value;
      const targetProjectIndex = document.getElementById('mission-project').value;

      (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.setCurrentProjectIndex)(Number(targetProjectIndex));
      (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.addMissionToCurrentProject)(title, desc, date, threat, notes);
      
      renderApp();
      missionForm.reset();
    });
  }
}


/***/ },

/***/ "./src/missionItem.js"
/*!****************************!*\
  !*** ./src/missionItem.js ***!
  \****************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Mission: () => (/* binding */ Mission)
/* harmony export */ });
class Mission {
  constructor(title, description, dueDate, threatLevel, notes = "", checklist = []) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.threatLevel = threatLevel; // Low, Medium, Critical
    this.notes = notes;
    this.checklist = checklist;
    this.accomplished = false;
  }

  toggleStatus() {
    this.accomplished = !this.accomplished;
  }

  updateDetails(title, description, dueDate, threatLevel, notes) {
    this.title = title;
    this.description = description;
    this.dueDate = dueDate;
    this.threatLevel = threatLevel;
    this.notes = notes;
  }

  addChecklistItem(itemText) {
    this.checklist.push({ text: itemText, completed: false });
  }

  toggleChecklistItem(index) {
    if (this.checklist[index]) {
      this.checklist[index].completed = !this.checklist[index].completed;
    }
  }
}


/***/ },

/***/ "./src/project.js"
/*!************************!*\
  !*** ./src/project.js ***!
  \************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Project: () => (/* binding */ Project)
/* harmony export */ });
class Project {
  constructor(name) {
    this.name = name;
    this.missions = [];
  }

  addMission(mission) {
    this.missions.push(mission);
  }

  removeMission(index) {
    this.missions.splice(index, 1);
  }
}


/***/ },

/***/ "./src/storage.js"
/*!************************!*\
  !*** ./src/storage.js ***!
  \************************/
(__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addMissionToCurrentProject: () => (/* binding */ addMissionToCurrentProject),
/* harmony export */   addProject: () => (/* binding */ addProject),
/* harmony export */   deleteMission: () => (/* binding */ deleteMission),
/* harmony export */   getCurrentProjectIndex: () => (/* binding */ getCurrentProjectIndex),
/* harmony export */   getProjects: () => (/* binding */ getProjects),
/* harmony export */   initStorage: () => (/* binding */ initStorage),
/* harmony export */   setCurrentProjectIndex: () => (/* binding */ setCurrentProjectIndex),
/* harmony export */   toggleChecklistItem: () => (/* binding */ toggleChecklistItem),
/* harmony export */   toggleMissionStatus: () => (/* binding */ toggleMissionStatus),
/* harmony export */   updateMission: () => (/* binding */ updateMission)
/* harmony export */ });
/* harmony import */ var _project_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./project.js */ "./src/project.js");
/* harmony import */ var _missionItem_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./missionItem.js */ "./src/missionItem.js");



let projects = [];
let currentProjectIndex = 0;

function initStorage() {
  const savedData = localStorage.getItem('wise_projects');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      projects = parsedData.map(pData => {
        const project = new _project_js__WEBPACK_IMPORTED_MODULE_0__.Project(pData.name);
        project.missions = pData.missions.map(m => {
          const mission = new _missionItem_js__WEBPACK_IMPORTED_MODULE_1__.Mission(
            m.title, 
            m.description, 
            m.dueDate, 
            m.threatLevel, 
            m.notes, 
            m.checklist || []
          );
          mission.accomplished = m.accomplished;
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
  const defaultProj = new _project_js__WEBPACK_IMPORTED_MODULE_0__.Project("WISE Operations");
  defaultProj.addMission(new _missionItem_js__WEBPACK_IMPORTED_MODULE_1__.Mission(
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

function saveStorage() {
  localStorage.setItem('wise_projects', JSON.stringify(projects));
}

function getProjects() {
  return projects;
}

function getCurrentProjectIndex() {
  return currentProjectIndex;
}

function setCurrentProjectIndex(index) {
  currentProjectIndex = index;
}

function addProject(name) {
  projects.push(new _project_js__WEBPACK_IMPORTED_MODULE_0__.Project(name));
  currentProjectIndex = projects.length - 1;
  saveStorage();
}

function addMissionToCurrentProject(title, desc, date, threat, notes) {
  const newMission = new _missionItem_js__WEBPACK_IMPORTED_MODULE_1__.Mission(title, desc, date, threat, notes, []);
  projects[currentProjectIndex].addMission(newMission);
  saveStorage();
}

function deleteMission(projectIndex, missionIndex) {
  projects[projectIndex].missions.splice(missionIndex, 1);
  saveStorage();
}

function updateMission(projectIndex, missionIndex, title, desc, date, threat, notes) {
  const mission = projects[projectIndex].missions[missionIndex];
  if (mission) {
    mission.updateDetails(title, desc, date, threat, notes);
    saveStorage();
  }
}

function toggleMissionStatus(projectIndex, missionIndex) {
  projects[projectIndex].missions[missionIndex].toggleStatus();
  saveStorage();
}

function toggleChecklistItem(projectIndex, missionIndex, checkIndex) {
  projects[projectIndex].missions[missionIndex].toggleChecklistItem(checkIndex);
  saveStorage();
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	// define getter/value functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop));
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _storage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./storage.js */ "./src/storage.js");
/* harmony import */ var _domController_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./domController.js */ "./src/domController.js");



// Initialize application data and DOM listeners on load
document.addEventListener('DOMContentLoaded', () => {
  (0,_storage_js__WEBPACK_IMPORTED_MODULE_0__.initStorage)();
  (0,_domController_js__WEBPACK_IMPORTED_MODULE_1__.renderApp)();
  (0,_domController_js__WEBPACK_IMPORTED_MODULE_1__.initEventListeners)();
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QjtVQUN2RSxnREFBZ0QsYUFBYTtVQUM3RCxFOzs7Ozs7Ozs7Ozs7QUNKMkM7QUFDd0I7O0FBRW5FO0FBQ0E7QUFDQSxFQUFFLHdEQUFXO0FBQ2IsRUFBRSw0REFBUztBQUNYLEVBQUUscUVBQWtCO0FBQ3BCLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvZG9tQ29udHJvbGxlci5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvbWlzc2lvbkl0ZW0uanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vc3JjL3Byb2plY3QuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vc3JjL3N0b3JhZ2UuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFxuICBnZXRQcm9qZWN0cywgXG4gIGdldEN1cnJlbnRQcm9qZWN0SW5kZXgsIFxuICBzZXRDdXJyZW50UHJvamVjdEluZGV4LCBcbiAgYWRkUHJvamVjdCwgXG4gIGFkZE1pc3Npb25Ub0N1cnJlbnRQcm9qZWN0LCBcbiAgZGVsZXRlTWlzc2lvbixcbiAgdXBkYXRlTWlzc2lvbixcbiAgdG9nZ2xlTWlzc2lvblN0YXR1cywgXG4gIHRvZ2dsZUNoZWNrbGlzdEl0ZW0gXG59IGZyb20gJy4vc3RvcmFnZS5qcyc7XG5cbmV4cG9ydCBmdW5jdGlvbiByZW5kZXJBcHAoKSB7XG4gIHJlbmRlclByb2plY3RzTmF2KCk7XG4gIHJlbmRlclByb2plY3REcm9wZG93bigpO1xuICByZW5kZXJNaXNzaW9ucygpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJQcm9qZWN0c05hdigpIHtcbiAgY29uc3QgbmF2Q29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2plY3QtbmF2Jyk7XG4gIGlmICghbmF2Q29udGFpbmVyKSByZXR1cm47XG5cbiAgY29uc3QgcHJvamVjdHMgPSBnZXRQcm9qZWN0cygpO1xuICBjb25zdCBjdXJyZW50SW5kZXggPSBnZXRDdXJyZW50UHJvamVjdEluZGV4KCk7XG5cbiAgbmF2Q29udGFpbmVyLmlubmVySFRNTCA9ICcnO1xuICBwcm9qZWN0cy5mb3JFYWNoKChwcm9qZWN0LCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIGJ0bi50ZXh0Q29udGVudCA9IHByb2plY3QubmFtZTtcbiAgICBidG4uY2xhc3NOYW1lID0gaW5kZXggPT09IGN1cnJlbnRJbmRleCA/ICdwcm9qZWN0LWJ0biBhY3RpdmUnIDogJ3Byb2plY3QtYnRuJztcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG4gICAgICBzZXRDdXJyZW50UHJvamVjdEluZGV4KGluZGV4KTtcbiAgICAgIHJlbmRlckFwcCgpO1xuICAgIH0pO1xuICAgIG5hdkNvbnRhaW5lci5hcHBlbmRDaGlsZChidG4pO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvamVjdERyb3Bkb3duKCkge1xuICBjb25zdCBzZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1wcm9qZWN0Jyk7XG4gIGlmICghc2VsZWN0KSByZXR1cm47XG5cbiAgY29uc3QgcHJvamVjdHMgPSBnZXRQcm9qZWN0cygpO1xuICBjb25zdCBjdXJyZW50SW5kZXggPSBnZXRDdXJyZW50UHJvamVjdEluZGV4KCk7XG5cbiAgc2VsZWN0LmlubmVySFRNTCA9ICcnO1xuICBwcm9qZWN0cy5mb3JFYWNoKChwcm9qZWN0LCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29wdGlvbicpO1xuICAgIG9wdGlvbi52YWx1ZSA9IGluZGV4O1xuICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IHByb2plY3QubmFtZTtcbiAgICBzZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgfSk7XG4gIHNlbGVjdC52YWx1ZSA9IGN1cnJlbnRJbmRleDtcbn1cblxuZnVuY3Rpb24gcmVuZGVyTWlzc2lvbnMoKSB7XG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLWNvbnRhaW5lcicpO1xuICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuICBcbiAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnOyBcblxuICBjb25zdCBwcm9qZWN0cyA9IGdldFByb2plY3RzKCk7XG4gIGNvbnN0IGN1cnJlbnRJbmRleCA9IGdldEN1cnJlbnRQcm9qZWN0SW5kZXgoKTtcbiAgY29uc3QgYWN0aXZlUHJvamVjdCA9IHByb2plY3RzW2N1cnJlbnRJbmRleF07XG5cbiAgaWYgKCFhY3RpdmVQcm9qZWN0IHx8IGFjdGl2ZVByb2plY3QubWlzc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICc8cCBjbGFzcz1cIm5vLW1pc3Npb25zXCI+Tm8gYWN0aXZlIG1pc3Npb25zIGluIHRoaXMgc2VjdG9yLjwvcD4nO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGFjdGl2ZVByb2plY3QubWlzc2lvbnMuZm9yRWFjaCgobWlzc2lvbiwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBjYXJkID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgY2FyZC5jbGFzc05hbWUgPSBgbWlzc2lvbi1jYXJkIHRocmVhdC0ke21pc3Npb24udGhyZWF0TGV2ZWwudG9Mb3dlckNhc2UoKX1gO1xuICAgIGlmIChtaXNzaW9uLmFjY29tcGxpc2hlZCkgY2FyZC5jbGFzc0xpc3QuYWRkKCdhY2NvbXBsaXNoZWQnKTtcblxuICAgIC8vIENvbXBhY3QgSGVhZGVyIFZpZXcgKFRpdGxlLCBEdWUgRGF0ZSwgVGhyZWF0IExldmVsIGJhZGdlLCBFeHBhbmQgJiBEZWxldGUgY29udHJvbHMpXG4gICAgY29uc3QgaGVhZGVyRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgaGVhZGVyRGl2LmNsYXNzTmFtZSA9ICdtaXNzaW9uLWNvbXBhY3QtaGVhZGVyJztcbiAgICBoZWFkZXJEaXYuaW5uZXJIVE1MID0gYFxuICAgICAgPGRpdiBjbGFzcz1cIm1pc3Npb24tc3VtbWFyeS1pbmZvXCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBkYXRhLWluZGV4PVwiJHtpbmRleH1cIiAke21pc3Npb24uYWNjb21wbGlzaGVkID8gJ2NoZWNrZWQnIDogJyd9IGNsYXNzPVwiYWNjb21wbGlzaGVkLWNoZWNrYm94XCIgLz5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJtaXNzaW9uLXRpdGxlLXRleHRcIj4ke21pc3Npb24udGl0bGV9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImJhZGdlIHRocmVhdC1iYWRnZVwiPiR7bWlzc2lvbi50aHJlYXRMZXZlbH08L3NwYW4+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwiZHVlLWRhdGUtdGV4dFwiPvCfk4UgJHttaXNzaW9uLmR1ZURhdGUgfHwgJ05vIERlYWRsaW5lJ308L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJtaXNzaW9uLWFjdGlvbnNcIj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImV4cGFuZC1idG5cIiBkYXRhLWluZGV4PVwiJHtpbmRleH1cIj5FeHBhbmQg4pa+PC9idXR0b24+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGUtbWlzc2lvbi1idG5cIiBkYXRhLWluZGV4PVwiJHtpbmRleH1cIj7wn5eR77iPPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICBgO1xuXG4gICAgLy8gRXhwYW5kYWJsZSBEZXRhaWxzIERyYXdlciAoSGlkZGVuIGJ5IGRlZmF1bHQpXG4gICAgY29uc3QgZGV0YWlsc0RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRldGFpbHNEaXYuY2xhc3NOYW1lID0gJ21pc3Npb24tZGV0YWlscy1kcmF3ZXIgaGlkZGVuJztcbiAgICBkZXRhaWxzRGl2LmlkID0gYGRldGFpbHMtZHJhd2VyLSR7aW5kZXh9YDtcblxuICAgIGxldCBjaGVja2xpc3RIdG1sID0gJyc7XG4gICAgaWYgKG1pc3Npb24uY2hlY2tsaXN0ICYmIG1pc3Npb24uY2hlY2tsaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGNoZWNrbGlzdEh0bWwgPSAnPHVsIGNsYXNzPVwiY2hlY2tsaXN0LXVsXCI+JztcbiAgICAgIG1pc3Npb24uY2hlY2tsaXN0LmZvckVhY2goKGNoZWNrSXRlbSwgY0luZGV4KSA9PiB7XG4gICAgICAgIGNoZWNrbGlzdEh0bWwgKz0gYFxuICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgIDxsYWJlbD5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIGRhdGEtbWlzc2lvbi1pbmRleD1cIiR7aW5kZXh9XCIgZGF0YS1jaGVjay1pbmRleD1cIiR7Y0luZGV4fVwiIGNsYXNzPVwiY2hlY2tsaXN0LWNoZWNrYm94XCIgJHtjaGVja0l0ZW0uY29tcGxldGVkID8gJ2NoZWNrZWQnIDogJyd9IC8+XG4gICAgICAgICAgICAgICR7Y2hlY2tJdGVtLnRleHR9XG4gICAgICAgICAgICA8L2xhYmVsPlxuICAgICAgICAgIDwvbGk+XG4gICAgICAgIGA7XG4gICAgICB9KTtcbiAgICAgIGNoZWNrbGlzdEh0bWwgKz0gJzwvdWw+JztcbiAgICB9XG5cbiAgICBkZXRhaWxzRGl2LmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJkZXRhaWxzLWNvbnRlbnRcIj5cbiAgICAgICAgPHA+PHN0cm9uZz5EZXNjcmlwdGlvbjo8L3N0cm9uZz4gJHttaXNzaW9uLmRlc2NyaXB0aW9uIHx8ICdOb25lJ308L3A+XG4gICAgICAgIDxwPjxzdHJvbmc+RmllbGQgTm90ZXM6PC9zdHJvbmc+ICR7bWlzc2lvbi5ub3RlcyB8fCAnTm9uZSd9PC9wPlxuICAgICAgICA8ZGl2IGNsYXNzPVwiY2hlY2tsaXN0LXNlY3Rpb25cIj5cbiAgICAgICAgICA8c3Ryb25nPlN1Yi1PYmplY3RpdmVzOjwvc3Ryb25nPlxuICAgICAgICAgICR7Y2hlY2tsaXN0SHRtbCB8fCAnPHA+Tm8gc3ViLW9iamVjdGl2ZXMgYXNzaWduZWQuPC9wPid9XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZWRpdC1taXNzaW9uLWJ0blwiIGRhdGEtaW5kZXg9XCIke2luZGV4fVwiPkVkaXQgTWlzc2lvbjwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICAgIGNhcmQuYXBwZW5kQ2hpbGQoaGVhZGVyRGl2KTtcbiAgICBjYXJkLmFwcGVuZENoaWxkKGRldGFpbHNEaXYpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChjYXJkKTtcbiAgfSk7XG5cbiAgYXR0YWNoTWlzc2lvbkV2ZW50TGlzdGVuZXJzKCk7XG59XG5cbmZ1bmN0aW9uIGF0dGFjaE1pc3Npb25FdmVudExpc3RlbmVycygpIHtcbiAgLy8gVG9nZ2xlIEFjY29tcGxpc2hlZCBTdGF0dXNcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFjY29tcGxpc2hlZC1jaGVja2JveCcpLmZvckVhY2goYm94ID0+IHtcbiAgICBib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IG1JZHggPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKTtcbiAgICAgIHRvZ2dsZU1pc3Npb25TdGF0dXMoZ2V0Q3VycmVudFByb2plY3RJbmRleCgpLCBtSWR4KTtcbiAgICAgIHJlbmRlck1pc3Npb25zKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIFRvZ2dsZSBDaGVja2xpc3QgSXRlbVxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hlY2tsaXN0LWNoZWNrYm94JykuZm9yRWFjaChib3ggPT4ge1xuICAgIGJveC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgbUlkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1taXNzaW9uLWluZGV4Jyk7XG4gICAgICBjb25zdCBjSWR4ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWNoZWNrLWluZGV4Jyk7XG4gICAgICB0b2dnbGVDaGVja2xpc3RJdGVtKGdldEN1cnJlbnRQcm9qZWN0SW5kZXgoKSwgbUlkeCwgY0lkeCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEV4cGFuZCAvIENvbGxhcHNlIERldGFpbHMgRHJhd2VyXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5leHBhbmQtYnRuJykuZm9yRWFjaChidG4gPT4ge1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBtSWR4ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4Jyk7XG4gICAgICBjb25zdCBkcmF3ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChgZGV0YWlscy1kcmF3ZXItJHttSWR4fWApO1xuICAgICAgZHJhd2VyLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICAgICAgYnRuLnRleHRDb250ZW50ID0gZHJhd2VyLmNsYXNzTGlzdC5jb250YWlucygnaGlkZGVuJykgPyAnRXhwYW5kIOKWvicgOiAnQ29sbGFwc2Ug4pa0JztcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8gRGVsZXRlIE1pc3Npb25cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRlbGV0ZS1taXNzaW9uLWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgY29uc3QgbUlkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuICAgICAgZGVsZXRlTWlzc2lvbihnZXRDdXJyZW50UHJvamVjdEluZGV4KCksIG1JZHgpO1xuICAgICAgcmVuZGVyQXBwKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEVkaXQgTWlzc2lvbiAoSW5saW5lIFByb21wdC9Gb3JtIHRyaWdnZXIpXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5lZGl0LW1pc3Npb24tYnRuJykuZm9yRWFjaChidG4gPT4ge1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgICBjb25zdCBtSWR4ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4Jyk7XG4gICAgICBjb25zdCBwcm9qZWN0SW5kZXggPSBnZXRDdXJyZW50UHJvamVjdEluZGV4KCk7XG4gICAgICBjb25zdCBtaXNzaW9uID0gZ2V0UHJvamVjdHMoKVtwcm9qZWN0SW5kZXhdLm1pc3Npb25zW21JZHhdO1xuXG4gICAgICBjb25zdCBuZXdUaXRsZSA9IHByb21wdChcIkVkaXQgTWlzc2lvbiBUaXRsZTpcIiwgbWlzc2lvbi50aXRsZSk7XG4gICAgICBpZiAobmV3VGl0bGUgPT09IG51bGwpIHJldHVybjtcbiAgICAgIGNvbnN0IG5ld0Rlc2MgPSBwcm9tcHQoXCJFZGl0IERlc2NyaXB0aW9uOlwiLCBtaXNzaW9uLmRlc2NyaXB0aW9uKTtcbiAgICAgIGNvbnN0IG5ld0RhdGUgPSBwcm9tcHQoXCJFZGl0IER1ZSBEYXRlIChZWVlZLU1NLUREKTpcIiwgbWlzc2lvbi5kdWVEYXRlKTtcbiAgICAgIGNvbnN0IG5ld1RocmVhdCA9IHByb21wdChcIkVkaXQgVGhyZWF0IExldmVsIChMb3csIE1lZGl1bSwgQ3JpdGljYWwpOlwiLCBtaXNzaW9uLnRocmVhdExldmVsKTtcbiAgICAgIGNvbnN0IG5ld05vdGVzID0gcHJvbXB0KFwiRWRpdCBGaWVsZCBOb3RlczpcIiwgbWlzc2lvbi5ub3Rlcyk7XG5cbiAgICAgIHVwZGF0ZU1pc3Npb24ocHJvamVjdEluZGV4LCBtSWR4LCBuZXdUaXRsZSwgbmV3RGVzYywgbmV3RGF0ZSwgbmV3VGhyZWF0LCBuZXdOb3Rlcyk7XG4gICAgICByZW5kZXJBcHAoKTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIFNldHVwIEZvcm0gRXZlbnQgTGlzdGVuZXJzXG5leHBvcnQgZnVuY3Rpb24gaW5pdEV2ZW50TGlzdGVuZXJzKCkge1xuICBjb25zdCBwcm9qZWN0Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9qZWN0LWZvcm0nKTtcbiAgaWYgKHByb2plY3RGb3JtKSB7XG4gICAgcHJvamVjdEZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGNvbnN0IHByb2plY3ROYW1lSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvamVjdC1uYW1lJyk7XG4gICAgICBjb25zdCBuYW1lID0gcHJvamVjdE5hbWVJbnB1dC52YWx1ZS50cmltKCk7XG4gICAgICBpZiAobmFtZSkge1xuICAgICAgICBhZGRQcm9qZWN0KG5hbWUpO1xuICAgICAgICBwcm9qZWN0Rm9ybS5yZXNldCgpO1xuICAgICAgICByZW5kZXJBcHAoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IG1pc3Npb25Gb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tZm9ybScpO1xuICBpZiAobWlzc2lvbkZvcm0pIHtcbiAgICBtaXNzaW9uRm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgXG4gICAgICBjb25zdCB0aXRsZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLXRpdGxlJykudmFsdWU7XG4gICAgICBjb25zdCBkZXNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tZGVzYycpLnZhbHVlO1xuICAgICAgY29uc3QgZGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLWRhdGUnKS52YWx1ZTtcbiAgICAgIGNvbnN0IHRocmVhdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLXRocmVhdCcpLnZhbHVlO1xuICAgICAgY29uc3Qgbm90ZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1ub3RlcycpLnZhbHVlO1xuICAgICAgY29uc3QgdGFyZ2V0UHJvamVjdEluZGV4ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tcHJvamVjdCcpLnZhbHVlO1xuXG4gICAgICBzZXRDdXJyZW50UHJvamVjdEluZGV4KE51bWJlcih0YXJnZXRQcm9qZWN0SW5kZXgpKTtcbiAgICAgIGFkZE1pc3Npb25Ub0N1cnJlbnRQcm9qZWN0KHRpdGxlLCBkZXNjLCBkYXRlLCB0aHJlYXQsIG5vdGVzKTtcbiAgICAgIFxuICAgICAgcmVuZGVyQXBwKCk7XG4gICAgICBtaXNzaW9uRm9ybS5yZXNldCgpO1xuICAgIH0pO1xuICB9XG59XG4iLCJleHBvcnQgY2xhc3MgTWlzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKHRpdGxlLCBkZXNjcmlwdGlvbiwgZHVlRGF0ZSwgdGhyZWF0TGV2ZWwsIG5vdGVzID0gXCJcIiwgY2hlY2tsaXN0ID0gW10pIHtcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgIHRoaXMuZHVlRGF0ZSA9IGR1ZURhdGU7XG4gICAgdGhpcy50aHJlYXRMZXZlbCA9IHRocmVhdExldmVsOyAvLyBMb3csIE1lZGl1bSwgQ3JpdGljYWxcbiAgICB0aGlzLm5vdGVzID0gbm90ZXM7XG4gICAgdGhpcy5jaGVja2xpc3QgPSBjaGVja2xpc3Q7XG4gICAgdGhpcy5hY2NvbXBsaXNoZWQgPSBmYWxzZTtcbiAgfVxuXG4gIHRvZ2dsZVN0YXR1cygpIHtcbiAgICB0aGlzLmFjY29tcGxpc2hlZCA9ICF0aGlzLmFjY29tcGxpc2hlZDtcbiAgfVxuXG4gIHVwZGF0ZURldGFpbHModGl0bGUsIGRlc2NyaXB0aW9uLCBkdWVEYXRlLCB0aHJlYXRMZXZlbCwgbm90ZXMpIHtcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgIHRoaXMuZHVlRGF0ZSA9IGR1ZURhdGU7XG4gICAgdGhpcy50aHJlYXRMZXZlbCA9IHRocmVhdExldmVsO1xuICAgIHRoaXMubm90ZXMgPSBub3RlcztcbiAgfVxuXG4gIGFkZENoZWNrbGlzdEl0ZW0oaXRlbVRleHQpIHtcbiAgICB0aGlzLmNoZWNrbGlzdC5wdXNoKHsgdGV4dDogaXRlbVRleHQsIGNvbXBsZXRlZDogZmFsc2UgfSk7XG4gIH1cblxuICB0b2dnbGVDaGVja2xpc3RJdGVtKGluZGV4KSB7XG4gICAgaWYgKHRoaXMuY2hlY2tsaXN0W2luZGV4XSkge1xuICAgICAgdGhpcy5jaGVja2xpc3RbaW5kZXhdLmNvbXBsZXRlZCA9ICF0aGlzLmNoZWNrbGlzdFtpbmRleF0uY29tcGxldGVkO1xuICAgIH1cbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIFByb2plY3Qge1xuICBjb25zdHJ1Y3RvcihuYW1lKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLm1pc3Npb25zID0gW107XG4gIH1cblxuICBhZGRNaXNzaW9uKG1pc3Npb24pIHtcbiAgICB0aGlzLm1pc3Npb25zLnB1c2gobWlzc2lvbik7XG4gIH1cblxuICByZW1vdmVNaXNzaW9uKGluZGV4KSB7XG4gICAgdGhpcy5taXNzaW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBQcm9qZWN0IH0gZnJvbSAnLi9wcm9qZWN0LmpzJztcbmltcG9ydCB7IE1pc3Npb24gfSBmcm9tICcuL21pc3Npb25JdGVtLmpzJztcblxubGV0IHByb2plY3RzID0gW107XG5sZXQgY3VycmVudFByb2plY3RJbmRleCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBpbml0U3RvcmFnZSgpIHtcbiAgY29uc3Qgc2F2ZWREYXRhID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3dpc2VfcHJvamVjdHMnKTtcbiAgaWYgKHNhdmVkRGF0YSkge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXJzZWREYXRhID0gSlNPTi5wYXJzZShzYXZlZERhdGEpO1xuICAgICAgcHJvamVjdHMgPSBwYXJzZWREYXRhLm1hcChwRGF0YSA9PiB7XG4gICAgICAgIGNvbnN0IHByb2plY3QgPSBuZXcgUHJvamVjdChwRGF0YS5uYW1lKTtcbiAgICAgICAgcHJvamVjdC5taXNzaW9ucyA9IHBEYXRhLm1pc3Npb25zLm1hcChtID0+IHtcbiAgICAgICAgICBjb25zdCBtaXNzaW9uID0gbmV3IE1pc3Npb24oXG4gICAgICAgICAgICBtLnRpdGxlLCBcbiAgICAgICAgICAgIG0uZGVzY3JpcHRpb24sIFxuICAgICAgICAgICAgbS5kdWVEYXRlLCBcbiAgICAgICAgICAgIG0udGhyZWF0TGV2ZWwsIFxuICAgICAgICAgICAgbS5ub3RlcywgXG4gICAgICAgICAgICBtLmNoZWNrbGlzdCB8fCBbXVxuICAgICAgICAgICk7XG4gICAgICAgICAgbWlzc2lvbi5hY2NvbXBsaXNoZWQgPSBtLmFjY29tcGxpc2hlZDtcbiAgICAgICAgICByZXR1cm4gbWlzc2lvbjtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBwcm9qZWN0O1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBwYXJzZSBsb2NhbCBzdG9yYWdlIGRhdGEsIGxvYWRpbmcgZGVmYXVsdHMuXCIsIGUpO1xuICAgICAgbG9hZERlZmF1bHREYXRhKCk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxvYWREZWZhdWx0RGF0YSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGxvYWREZWZhdWx0RGF0YSgpIHtcbiAgcHJvamVjdHMgPSBbXTtcbiAgY29uc3QgZGVmYXVsdFByb2ogPSBuZXcgUHJvamVjdChcIldJU0UgT3BlcmF0aW9uc1wiKTtcbiAgZGVmYXVsdFByb2ouYWRkTWlzc2lvbihuZXcgTWlzc2lvbihcbiAgICBcIkluZmlsdHJhdGUgRWRlbiBBY2FkZW15XCIsIFxuICAgIFwiU2VjdXJlIHByb3hpbWl0eSB0byB0YXJnZXQncyBzb24uXCIsIFxuICAgIFwiMjAyNi0xMS0yMFwiLCBcbiAgICBcIkNyaXRpY2FsXCIsIFxuICAgIFwiTXVzdCBtYWludGFpbiBlbGVnYW50IGRlbWVhbm9yLlwiLCBcbiAgICBbeyB0ZXh0OiBcIlNlY3VyZSBiZXNwb2tlIHN1aXRcIiwgY29tcGxldGVkOiBmYWxzZSB9XVxuICApKTtcbiAgcHJvamVjdHMucHVzaChkZWZhdWx0UHJvaik7XG4gIHNhdmVTdG9yYWdlKCk7XG59XG5cbmZ1bmN0aW9uIHNhdmVTdG9yYWdlKCkge1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnd2lzZV9wcm9qZWN0cycsIEpTT04uc3RyaW5naWZ5KHByb2plY3RzKSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcm9qZWN0cygpIHtcbiAgcmV0dXJuIHByb2plY3RzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFByb2plY3RJbmRleCgpIHtcbiAgcmV0dXJuIGN1cnJlbnRQcm9qZWN0SW5kZXg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRDdXJyZW50UHJvamVjdEluZGV4KGluZGV4KSB7XG4gIGN1cnJlbnRQcm9qZWN0SW5kZXggPSBpbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZFByb2plY3QobmFtZSkge1xuICBwcm9qZWN0cy5wdXNoKG5ldyBQcm9qZWN0KG5hbWUpKTtcbiAgY3VycmVudFByb2plY3RJbmRleCA9IHByb2plY3RzLmxlbmd0aCAtIDE7XG4gIHNhdmVTdG9yYWdlKCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhZGRNaXNzaW9uVG9DdXJyZW50UHJvamVjdCh0aXRsZSwgZGVzYywgZGF0ZSwgdGhyZWF0LCBub3Rlcykge1xuICBjb25zdCBuZXdNaXNzaW9uID0gbmV3IE1pc3Npb24odGl0bGUsIGRlc2MsIGRhdGUsIHRocmVhdCwgbm90ZXMsIFtdKTtcbiAgcHJvamVjdHNbY3VycmVudFByb2plY3RJbmRleF0uYWRkTWlzc2lvbihuZXdNaXNzaW9uKTtcbiAgc2F2ZVN0b3JhZ2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1pc3Npb24ocHJvamVjdEluZGV4LCBtaXNzaW9uSW5kZXgpIHtcbiAgcHJvamVjdHNbcHJvamVjdEluZGV4XS5taXNzaW9ucy5zcGxpY2UobWlzc2lvbkluZGV4LCAxKTtcbiAgc2F2ZVN0b3JhZ2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVwZGF0ZU1pc3Npb24ocHJvamVjdEluZGV4LCBtaXNzaW9uSW5kZXgsIHRpdGxlLCBkZXNjLCBkYXRlLCB0aHJlYXQsIG5vdGVzKSB7XG4gIGNvbnN0IG1pc3Npb24gPSBwcm9qZWN0c1twcm9qZWN0SW5kZXhdLm1pc3Npb25zW21pc3Npb25JbmRleF07XG4gIGlmIChtaXNzaW9uKSB7XG4gICAgbWlzc2lvbi51cGRhdGVEZXRhaWxzKHRpdGxlLCBkZXNjLCBkYXRlLCB0aHJlYXQsIG5vdGVzKTtcbiAgICBzYXZlU3RvcmFnZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVNaXNzaW9uU3RhdHVzKHByb2plY3RJbmRleCwgbWlzc2lvbkluZGV4KSB7XG4gIHByb2plY3RzW3Byb2plY3RJbmRleF0ubWlzc2lvbnNbbWlzc2lvbkluZGV4XS50b2dnbGVTdGF0dXMoKTtcbiAgc2F2ZVN0b3JhZ2UoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUNoZWNrbGlzdEl0ZW0ocHJvamVjdEluZGV4LCBtaXNzaW9uSW5kZXgsIGNoZWNrSW5kZXgpIHtcbiAgcHJvamVjdHNbcHJvamVjdEluZGV4XS5taXNzaW9uc1ttaXNzaW9uSW5kZXhdLnRvZ2dsZUNoZWNrbGlzdEl0ZW0oY2hlY2tJbmRleCk7XG4gIHNhdmVTdG9yYWdlKCk7XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSk7IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGluaXRTdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlLmpzJztcbmltcG9ydCB7IHJlbmRlckFwcCwgaW5pdEV2ZW50TGlzdGVuZXJzIH0gZnJvbSAnLi9kb21Db250cm9sbGVyLmpzJztcblxuLy8gSW5pdGlhbGl6ZSBhcHBsaWNhdGlvbiBkYXRhIGFuZCBET00gbGlzdGVuZXJzIG9uIGxvYWRcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIGluaXRTdG9yYWdlKCk7XG4gIHJlbmRlckFwcCgpO1xuICBpbml0RXZlbnRMaXN0ZW5lcnMoKTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9