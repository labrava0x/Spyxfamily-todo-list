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
  if (projects.length === 0) {
    projects.push(new _project_js__WEBPACK_IMPORTED_MODULE_0__.Project("WISE Operations"));
    projects[0].addMission(new _missionItem_js__WEBPACK_IMPORTED_MODULE_1__.Mission(
      "Infiltrate Eden Academy", 
      "Secure proximity to target's son.", 
      "2026-11-20", 
      "Critical", 
      "Must maintain elegant demeanor.", 
      [{ text: "Secure bespoke suit", completed: false }]
    ));
  }
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
}

function addMissionToCurrentProject(title, desc, date, threat, notes) {
  const newMission = new _missionItem_js__WEBPACK_IMPORTED_MODULE_1__.Mission(title, desc, date, threat, notes, []);
  projects[currentProjectIndex].addMission(newMission);
}

function deleteMission(projectIndex, missionIndex) {
  projects[projectIndex].missions.splice(missionIndex, 1);
}

function updateMission(projectIndex, missionIndex, title, desc, date, threat, notes) {
  const mission = projects[projectIndex].missions[missionIndex];
  if (mission) {
    mission.updateDetails(title, desc, date, threat, notes);
  }
}

function toggleMissionStatus(projectIndex, missionIndex) {
  projects[projectIndex].missions[missionIndex].toggleStatus();
}

function toggleChecklistItem(projectIndex, missionIndex, checkIndex) {
  projects[projectIndex].missions[missionIndex].toggleChecklistItem(checkIndex);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNoQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDYnVDO0FBQ0k7O0FBRTNDO0FBQ0E7O0FBRU87QUFDUDtBQUNBLHNCQUFzQixnREFBTztBQUM3QiwrQkFBK0Isb0RBQU87QUFDdEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsK0NBQStDO0FBQ3hEO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTs7QUFFTztBQUNQLG9CQUFvQixnREFBTztBQUMzQjtBQUNBOztBQUVPO0FBQ1AseUJBQXlCLG9EQUFPO0FBQ2hDO0FBQ0E7O0FBRU87QUFDUDtBQUNBOztBQUVPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTztBQUNQO0FBQ0E7O0FBRU87QUFDUDtBQUNBOzs7Ozs7O1VDM0RBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7VUM1QkE7VUFDQTtVQUNBO1VBQ0E7VUFDQSx5Q0FBeUMsd0NBQXdDO1VBQ2pGO1VBQ0E7VUFDQSxFOzs7VUNQQSx5Rjs7O1VDQUE7VUFDQTtVQUNBLHNEQUFzRCxpQkFBaUI7VUFDdkUsZ0RBQWdELGFBQWE7VUFDN0QsRTs7Ozs7Ozs7Ozs7O0FDSjJDO0FBQ3dCOztBQUVuRTtBQUNBO0FBQ0EsRUFBRSx3REFBVztBQUNiLEVBQUUsNERBQVM7QUFDWCxFQUFFLHFFQUFrQjtBQUNwQixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vc3JjL2RvbUNvbnRyb2xsZXIuanMiLCJ3ZWJwYWNrOi8vdG9kby1saXN0Ly4vc3JjL21pc3Npb25JdGVtLmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL3NyYy9wcm9qZWN0LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL3NyYy9zdG9yYWdlLmpzIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3RvZG8tbGlzdC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBcbiAgZ2V0UHJvamVjdHMsIFxuICBnZXRDdXJyZW50UHJvamVjdEluZGV4LCBcbiAgc2V0Q3VycmVudFByb2plY3RJbmRleCwgXG4gIGFkZFByb2plY3QsIFxuICBhZGRNaXNzaW9uVG9DdXJyZW50UHJvamVjdCwgXG4gIGRlbGV0ZU1pc3Npb24sXG4gIHVwZGF0ZU1pc3Npb24sXG4gIHRvZ2dsZU1pc3Npb25TdGF0dXMsIFxuICB0b2dnbGVDaGVja2xpc3RJdGVtIFxufSBmcm9tICcuL3N0b3JhZ2UuanMnO1xuXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQXBwKCkge1xuICByZW5kZXJQcm9qZWN0c05hdigpO1xuICByZW5kZXJQcm9qZWN0RHJvcGRvd24oKTtcbiAgcmVuZGVyTWlzc2lvbnMoKTtcbn1cblxuZnVuY3Rpb24gcmVuZGVyUHJvamVjdHNOYXYoKSB7XG4gIGNvbnN0IG5hdkNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9qZWN0LW5hdicpO1xuICBpZiAoIW5hdkNvbnRhaW5lcikgcmV0dXJuO1xuXG4gIGNvbnN0IHByb2plY3RzID0gZ2V0UHJvamVjdHMoKTtcbiAgY29uc3QgY3VycmVudEluZGV4ID0gZ2V0Q3VycmVudFByb2plY3RJbmRleCgpO1xuXG4gIG5hdkNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgcHJvamVjdHMuZm9yRWFjaCgocHJvamVjdCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBidG4udGV4dENvbnRlbnQgPSBwcm9qZWN0Lm5hbWU7XG4gICAgYnRuLmNsYXNzTmFtZSA9IGluZGV4ID09PSBjdXJyZW50SW5kZXggPyAncHJvamVjdC1idG4gYWN0aXZlJyA6ICdwcm9qZWN0LWJ0bic7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgc2V0Q3VycmVudFByb2plY3RJbmRleChpbmRleCk7XG4gICAgICByZW5kZXJBcHAoKTtcbiAgICB9KTtcbiAgICBuYXZDb250YWluZXIuYXBwZW5kQ2hpbGQoYnRuKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlbmRlclByb2plY3REcm9wZG93bigpIHtcbiAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tcHJvamVjdCcpO1xuICBpZiAoIXNlbGVjdCkgcmV0dXJuO1xuXG4gIGNvbnN0IHByb2plY3RzID0gZ2V0UHJvamVjdHMoKTtcbiAgY29uc3QgY3VycmVudEluZGV4ID0gZ2V0Q3VycmVudFByb2plY3RJbmRleCgpO1xuXG4gIHNlbGVjdC5pbm5lckhUTUwgPSAnJztcbiAgcHJvamVjdHMuZm9yRWFjaCgocHJvamVjdCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24udmFsdWUgPSBpbmRleDtcbiAgICBvcHRpb24udGV4dENvbnRlbnQgPSBwcm9qZWN0Lm5hbWU7XG4gICAgc2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XG4gIH0pO1xuICBzZWxlY3QudmFsdWUgPSBjdXJyZW50SW5kZXg7XG59XG5cbmZ1bmN0aW9uIHJlbmRlck1pc3Npb25zKCkge1xuICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1jb250YWluZXInKTtcbiAgaWYgKCFjb250YWluZXIpIHJldHVybjtcbiAgXG4gIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnJzsgXG5cbiAgY29uc3QgcHJvamVjdHMgPSBnZXRQcm9qZWN0cygpO1xuICBjb25zdCBjdXJyZW50SW5kZXggPSBnZXRDdXJyZW50UHJvamVjdEluZGV4KCk7XG4gIGNvbnN0IGFjdGl2ZVByb2plY3QgPSBwcm9qZWN0c1tjdXJyZW50SW5kZXhdO1xuXG4gIGlmICghYWN0aXZlUHJvamVjdCB8fCBhY3RpdmVQcm9qZWN0Lm1pc3Npb25zLmxlbmd0aCA9PT0gMCkge1xuICAgIGNvbnRhaW5lci5pbm5lckhUTUwgPSAnPHAgY2xhc3M9XCJuby1taXNzaW9uc1wiPk5vIGFjdGl2ZSBtaXNzaW9ucyBpbiB0aGlzIHNlY3Rvci48L3A+JztcbiAgICByZXR1cm47XG4gIH1cblxuICBhY3RpdmVQcm9qZWN0Lm1pc3Npb25zLmZvckVhY2goKG1pc3Npb24sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNhcmQuY2xhc3NOYW1lID0gYG1pc3Npb24tY2FyZCB0aHJlYXQtJHttaXNzaW9uLnRocmVhdExldmVsLnRvTG93ZXJDYXNlKCl9YDtcbiAgICBpZiAobWlzc2lvbi5hY2NvbXBsaXNoZWQpIGNhcmQuY2xhc3NMaXN0LmFkZCgnYWNjb21wbGlzaGVkJyk7XG5cbiAgICAvLyBDb21wYWN0IEhlYWRlciBWaWV3IChUaXRsZSwgRHVlIERhdGUsIFRocmVhdCBMZXZlbCBiYWRnZSwgRXhwYW5kICYgRGVsZXRlIGNvbnRyb2xzKVxuICAgIGNvbnN0IGhlYWRlckRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGhlYWRlckRpdi5jbGFzc05hbWUgPSAnbWlzc2lvbi1jb21wYWN0LWhlYWRlcic7XG4gICAgaGVhZGVyRGl2LmlubmVySFRNTCA9IGBcbiAgICAgIDxkaXYgY2xhc3M9XCJtaXNzaW9uLXN1bW1hcnktaW5mb1wiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCIgJHttaXNzaW9uLmFjY29tcGxpc2hlZCA/ICdjaGVja2VkJyA6ICcnfSBjbGFzcz1cImFjY29tcGxpc2hlZC1jaGVja2JveFwiIC8+XG4gICAgICAgIDxzcGFuIGNsYXNzPVwibWlzc2lvbi10aXRsZS10ZXh0XCI+JHttaXNzaW9uLnRpdGxlfTwvc3Bhbj5cbiAgICAgICAgPHNwYW4gY2xhc3M9XCJiYWRnZSB0aHJlYXQtYmFkZ2VcIj4ke21pc3Npb24udGhyZWF0TGV2ZWx9PC9zcGFuPlxuICAgICAgICA8c3BhbiBjbGFzcz1cImR1ZS1kYXRlLXRleHRcIj7wn5OFICR7bWlzc2lvbi5kdWVEYXRlIHx8ICdObyBEZWFkbGluZSd9PC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwibWlzc2lvbi1hY3Rpb25zXCI+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJleHBhbmQtYnRuXCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCI+RXhwYW5kIOKWvjwvYnV0dG9uPlxuICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZGVsZXRlLW1pc3Npb24tYnRuXCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCI+8J+Xke+4jzwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgYDtcblxuICAgIC8vIEV4cGFuZGFibGUgRGV0YWlscyBEcmF3ZXIgKEhpZGRlbiBieSBkZWZhdWx0KVxuICAgIGNvbnN0IGRldGFpbHNEaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBkZXRhaWxzRGl2LmNsYXNzTmFtZSA9ICdtaXNzaW9uLWRldGFpbHMtZHJhd2VyIGhpZGRlbic7XG4gICAgZGV0YWlsc0Rpdi5pZCA9IGBkZXRhaWxzLWRyYXdlci0ke2luZGV4fWA7XG5cbiAgICBsZXQgY2hlY2tsaXN0SHRtbCA9ICcnO1xuICAgIGlmIChtaXNzaW9uLmNoZWNrbGlzdCAmJiBtaXNzaW9uLmNoZWNrbGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICBjaGVja2xpc3RIdG1sID0gJzx1bCBjbGFzcz1cImNoZWNrbGlzdC11bFwiPic7XG4gICAgICBtaXNzaW9uLmNoZWNrbGlzdC5mb3JFYWNoKChjaGVja0l0ZW0sIGNJbmRleCkgPT4ge1xuICAgICAgICBjaGVja2xpc3RIdG1sICs9IGBcbiAgICAgICAgICA8bGk+XG4gICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBkYXRhLW1pc3Npb24taW5kZXg9XCIke2luZGV4fVwiIGRhdGEtY2hlY2staW5kZXg9XCIke2NJbmRleH1cIiBjbGFzcz1cImNoZWNrbGlzdC1jaGVja2JveFwiICR7Y2hlY2tJdGVtLmNvbXBsZXRlZCA/ICdjaGVja2VkJyA6ICcnfSAvPlxuICAgICAgICAgICAgICAke2NoZWNrSXRlbS50ZXh0fVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICBgO1xuICAgICAgfSk7XG4gICAgICBjaGVja2xpc3RIdG1sICs9ICc8L3VsPic7XG4gICAgfVxuXG4gICAgZGV0YWlsc0Rpdi5pbm5lckhUTUwgPSBgXG4gICAgICA8ZGl2IGNsYXNzPVwiZGV0YWlscy1jb250ZW50XCI+XG4gICAgICAgIDxwPjxzdHJvbmc+RGVzY3JpcHRpb246PC9zdHJvbmc+ICR7bWlzc2lvbi5kZXNjcmlwdGlvbiB8fCAnTm9uZSd9PC9wPlxuICAgICAgICA8cD48c3Ryb25nPkZpZWxkIE5vdGVzOjwvc3Ryb25nPiAke21pc3Npb24ubm90ZXMgfHwgJ05vbmUnfTwvcD5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNoZWNrbGlzdC1zZWN0aW9uXCI+XG4gICAgICAgICAgPHN0cm9uZz5TdWItT2JqZWN0aXZlczo8L3N0cm9uZz5cbiAgICAgICAgICAke2NoZWNrbGlzdEh0bWwgfHwgJzxwPk5vIHN1Yi1vYmplY3RpdmVzIGFzc2lnbmVkLjwvcD4nfVxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImVkaXQtbWlzc2lvbi1idG5cIiBkYXRhLWluZGV4PVwiJHtpbmRleH1cIj5FZGl0IE1pc3Npb248L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgIGA7XG5cbiAgICBjYXJkLmFwcGVuZENoaWxkKGhlYWRlckRpdik7XG4gICAgY2FyZC5hcHBlbmRDaGlsZChkZXRhaWxzRGl2KTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2FyZCk7XG4gIH0pO1xuXG4gIGF0dGFjaE1pc3Npb25FdmVudExpc3RlbmVycygpO1xufVxuXG5mdW5jdGlvbiBhdHRhY2hNaXNzaW9uRXZlbnRMaXN0ZW5lcnMoKSB7XG4gIC8vIFRvZ2dsZSBBY2NvbXBsaXNoZWQgU3RhdHVzXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hY2NvbXBsaXNoZWQtY2hlY2tib3gnKS5mb3JFYWNoKGJveCA9PiB7XG4gICAgYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICBjb25zdCBtSWR4ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWluZGV4Jyk7XG4gICAgICB0b2dnbGVNaXNzaW9uU3RhdHVzKGdldEN1cnJlbnRQcm9qZWN0SW5kZXgoKSwgbUlkeCk7XG4gICAgICByZW5kZXJNaXNzaW9ucygpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBUb2dnbGUgQ2hlY2tsaXN0IEl0ZW1cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoZWNrbGlzdC1jaGVja2JveCcpLmZvckVhY2goYm94ID0+IHtcbiAgICBib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IG1JZHggPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWlzc2lvbi1pbmRleCcpO1xuICAgICAgY29uc3QgY0lkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1jaGVjay1pbmRleCcpO1xuICAgICAgdG9nZ2xlQ2hlY2tsaXN0SXRlbShnZXRDdXJyZW50UHJvamVjdEluZGV4KCksIG1JZHgsIGNJZHgpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBFeHBhbmQgLyBDb2xsYXBzZSBEZXRhaWxzIERyYXdlclxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZXhwYW5kLWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgY29uc3QgbUlkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuICAgICAgY29uc3QgZHJhd2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYGRldGFpbHMtZHJhd2VyLSR7bUlkeH1gKTtcbiAgICAgIGRyYXdlci5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nKTtcbiAgICAgIGJ0bi50ZXh0Q29udGVudCA9IGRyYXdlci5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpID8gJ0V4cGFuZCDilr4nIDogJ0NvbGxhcHNlIOKWtCc7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIERlbGV0ZSBNaXNzaW9uXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kZWxldGUtbWlzc2lvbi1idG4nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IG1JZHggPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKTtcbiAgICAgIGRlbGV0ZU1pc3Npb24oZ2V0Q3VycmVudFByb2plY3RJbmRleCgpLCBtSWR4KTtcbiAgICAgIHJlbmRlckFwcCgpO1xuICAgIH0pO1xuICB9KTtcblxuICAvLyBFZGl0IE1pc3Npb24gKElubGluZSBQcm9tcHQvRm9ybSB0cmlnZ2VyKVxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZWRpdC1taXNzaW9uLWJ0bicpLmZvckVhY2goYnRuID0+IHtcbiAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgY29uc3QgbUlkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuICAgICAgY29uc3QgcHJvamVjdEluZGV4ID0gZ2V0Q3VycmVudFByb2plY3RJbmRleCgpO1xuICAgICAgY29uc3QgbWlzc2lvbiA9IGdldFByb2plY3RzKClbcHJvamVjdEluZGV4XS5taXNzaW9uc1ttSWR4XTtcblxuICAgICAgY29uc3QgbmV3VGl0bGUgPSBwcm9tcHQoXCJFZGl0IE1pc3Npb24gVGl0bGU6XCIsIG1pc3Npb24udGl0bGUpO1xuICAgICAgaWYgKG5ld1RpdGxlID09PSBudWxsKSByZXR1cm47XG4gICAgICBjb25zdCBuZXdEZXNjID0gcHJvbXB0KFwiRWRpdCBEZXNjcmlwdGlvbjpcIiwgbWlzc2lvbi5kZXNjcmlwdGlvbik7XG4gICAgICBjb25zdCBuZXdEYXRlID0gcHJvbXB0KFwiRWRpdCBEdWUgRGF0ZSAoWVlZWS1NTS1ERCk6XCIsIG1pc3Npb24uZHVlRGF0ZSk7XG4gICAgICBjb25zdCBuZXdUaHJlYXQgPSBwcm9tcHQoXCJFZGl0IFRocmVhdCBMZXZlbCAoTG93LCBNZWRpdW0sIENyaXRpY2FsKTpcIiwgbWlzc2lvbi50aHJlYXRMZXZlbCk7XG4gICAgICBjb25zdCBuZXdOb3RlcyA9IHByb21wdChcIkVkaXQgRmllbGQgTm90ZXM6XCIsIG1pc3Npb24ubm90ZXMpO1xuXG4gICAgICB1cGRhdGVNaXNzaW9uKHByb2plY3RJbmRleCwgbUlkeCwgbmV3VGl0bGUsIG5ld0Rlc2MsIG5ld0RhdGUsIG5ld1RocmVhdCwgbmV3Tm90ZXMpO1xuICAgICAgcmVuZGVyQXBwKCk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyBTZXR1cCBGb3JtIEV2ZW50IExpc3RlbmVyc1xuZXhwb3J0IGZ1bmN0aW9uIGluaXRFdmVudExpc3RlbmVycygpIHtcbiAgY29uc3QgcHJvamVjdEZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgncHJvamVjdC1mb3JtJyk7XG4gIGlmIChwcm9qZWN0Rm9ybSkge1xuICAgIHByb2plY3RGb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBjb25zdCBwcm9qZWN0TmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2plY3QtbmFtZScpO1xuICAgICAgY29uc3QgbmFtZSA9IHByb2plY3ROYW1lSW5wdXQudmFsdWUudHJpbSgpO1xuICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgYWRkUHJvamVjdChuYW1lKTtcbiAgICAgICAgcHJvamVjdEZvcm0ucmVzZXQoKTtcbiAgICAgICAgcmVuZGVyQXBwKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25zdCBtaXNzaW9uRm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLWZvcm0nKTtcbiAgaWYgKG1pc3Npb25Gb3JtKSB7XG4gICAgbWlzc2lvbkZvcm0uYWRkRXZlbnRMaXN0ZW5lcignc3VibWl0JywgKGUpID0+IHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIFxuICAgICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi10aXRsZScpLnZhbHVlO1xuICAgICAgY29uc3QgZGVzYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLWRlc2MnKS52YWx1ZTtcbiAgICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1kYXRlJykudmFsdWU7XG4gICAgICBjb25zdCB0aHJlYXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi10aHJlYXQnKS52YWx1ZTtcbiAgICAgIGNvbnN0IG5vdGVzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tbm90ZXMnKS52YWx1ZTtcbiAgICAgIGNvbnN0IHRhcmdldFByb2plY3RJbmRleCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLXByb2plY3QnKS52YWx1ZTtcblxuICAgICAgc2V0Q3VycmVudFByb2plY3RJbmRleChOdW1iZXIodGFyZ2V0UHJvamVjdEluZGV4KSk7XG4gICAgICBhZGRNaXNzaW9uVG9DdXJyZW50UHJvamVjdCh0aXRsZSwgZGVzYywgZGF0ZSwgdGhyZWF0LCBub3Rlcyk7XG4gICAgICBcbiAgICAgIHJlbmRlckFwcCgpO1xuICAgICAgbWlzc2lvbkZvcm0ucmVzZXQoKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIE1pc3Npb24ge1xuICBjb25zdHJ1Y3Rvcih0aXRsZSwgZGVzY3JpcHRpb24sIGR1ZURhdGUsIHRocmVhdExldmVsLCBub3RlcyA9IFwiXCIsIGNoZWNrbGlzdCA9IFtdKSB7XG4gICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB0aGlzLmR1ZURhdGUgPSBkdWVEYXRlO1xuICAgIHRoaXMudGhyZWF0TGV2ZWwgPSB0aHJlYXRMZXZlbDsgLy8gTG93LCBNZWRpdW0sIENyaXRpY2FsXG4gICAgdGhpcy5ub3RlcyA9IG5vdGVzO1xuICAgIHRoaXMuY2hlY2tsaXN0ID0gY2hlY2tsaXN0O1xuICAgIHRoaXMuYWNjb21wbGlzaGVkID0gZmFsc2U7XG4gIH1cblxuICB0b2dnbGVTdGF0dXMoKSB7XG4gICAgdGhpcy5hY2NvbXBsaXNoZWQgPSAhdGhpcy5hY2NvbXBsaXNoZWQ7XG4gIH1cblxuICB1cGRhdGVEZXRhaWxzKHRpdGxlLCBkZXNjcmlwdGlvbiwgZHVlRGF0ZSwgdGhyZWF0TGV2ZWwsIG5vdGVzKSB7XG4gICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB0aGlzLmR1ZURhdGUgPSBkdWVEYXRlO1xuICAgIHRoaXMudGhyZWF0TGV2ZWwgPSB0aHJlYXRMZXZlbDtcbiAgICB0aGlzLm5vdGVzID0gbm90ZXM7XG4gIH1cblxuICBhZGRDaGVja2xpc3RJdGVtKGl0ZW1UZXh0KSB7XG4gICAgdGhpcy5jaGVja2xpc3QucHVzaCh7IHRleHQ6IGl0ZW1UZXh0LCBjb21wbGV0ZWQ6IGZhbHNlIH0pO1xuICB9XG5cbiAgdG9nZ2xlQ2hlY2tsaXN0SXRlbShpbmRleCkge1xuICAgIGlmICh0aGlzLmNoZWNrbGlzdFtpbmRleF0pIHtcbiAgICAgIHRoaXMuY2hlY2tsaXN0W2luZGV4XS5jb21wbGV0ZWQgPSAhdGhpcy5jaGVja2xpc3RbaW5kZXhdLmNvbXBsZXRlZDtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBQcm9qZWN0IHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5taXNzaW9ucyA9IFtdO1xuICB9XG5cbiAgYWRkTWlzc2lvbihtaXNzaW9uKSB7XG4gICAgdGhpcy5taXNzaW9ucy5wdXNoKG1pc3Npb24pO1xuICB9XG5cbiAgcmVtb3ZlTWlzc2lvbihpbmRleCkge1xuICAgIHRoaXMubWlzc2lvbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufVxuIiwiaW1wb3J0IHsgUHJvamVjdCB9IGZyb20gJy4vcHJvamVjdC5qcyc7XG5pbXBvcnQgeyBNaXNzaW9uIH0gZnJvbSAnLi9taXNzaW9uSXRlbS5qcyc7XG5cbmxldCBwcm9qZWN0cyA9IFtdO1xubGV0IGN1cnJlbnRQcm9qZWN0SW5kZXggPSAwO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdFN0b3JhZ2UoKSB7XG4gIGlmIChwcm9qZWN0cy5sZW5ndGggPT09IDApIHtcbiAgICBwcm9qZWN0cy5wdXNoKG5ldyBQcm9qZWN0KFwiV0lTRSBPcGVyYXRpb25zXCIpKTtcbiAgICBwcm9qZWN0c1swXS5hZGRNaXNzaW9uKG5ldyBNaXNzaW9uKFxuICAgICAgXCJJbmZpbHRyYXRlIEVkZW4gQWNhZGVteVwiLCBcbiAgICAgIFwiU2VjdXJlIHByb3hpbWl0eSB0byB0YXJnZXQncyBzb24uXCIsIFxuICAgICAgXCIyMDI2LTExLTIwXCIsIFxuICAgICAgXCJDcml0aWNhbFwiLCBcbiAgICAgIFwiTXVzdCBtYWludGFpbiBlbGVnYW50IGRlbWVhbm9yLlwiLCBcbiAgICAgIFt7IHRleHQ6IFwiU2VjdXJlIGJlc3Bva2Ugc3VpdFwiLCBjb21wbGV0ZWQ6IGZhbHNlIH1dXG4gICAgKSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFByb2plY3RzKCkge1xuICByZXR1cm4gcHJvamVjdHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50UHJvamVjdEluZGV4KCkge1xuICByZXR1cm4gY3VycmVudFByb2plY3RJbmRleDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldEN1cnJlbnRQcm9qZWN0SW5kZXgoaW5kZXgpIHtcbiAgY3VycmVudFByb2plY3RJbmRleCA9IGluZGV4O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYWRkUHJvamVjdChuYW1lKSB7XG4gIHByb2plY3RzLnB1c2gobmV3IFByb2plY3QobmFtZSkpO1xuICBjdXJyZW50UHJvamVjdEluZGV4ID0gcHJvamVjdHMubGVuZ3RoIC0gMTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZE1pc3Npb25Ub0N1cnJlbnRQcm9qZWN0KHRpdGxlLCBkZXNjLCBkYXRlLCB0aHJlYXQsIG5vdGVzKSB7XG4gIGNvbnN0IG5ld01pc3Npb24gPSBuZXcgTWlzc2lvbih0aXRsZSwgZGVzYywgZGF0ZSwgdGhyZWF0LCBub3RlcywgW10pO1xuICBwcm9qZWN0c1tjdXJyZW50UHJvamVjdEluZGV4XS5hZGRNaXNzaW9uKG5ld01pc3Npb24pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGVsZXRlTWlzc2lvbihwcm9qZWN0SW5kZXgsIG1pc3Npb25JbmRleCkge1xuICBwcm9qZWN0c1twcm9qZWN0SW5kZXhdLm1pc3Npb25zLnNwbGljZShtaXNzaW9uSW5kZXgsIDEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTWlzc2lvbihwcm9qZWN0SW5kZXgsIG1pc3Npb25JbmRleCwgdGl0bGUsIGRlc2MsIGRhdGUsIHRocmVhdCwgbm90ZXMpIHtcbiAgY29uc3QgbWlzc2lvbiA9IHByb2plY3RzW3Byb2plY3RJbmRleF0ubWlzc2lvbnNbbWlzc2lvbkluZGV4XTtcbiAgaWYgKG1pc3Npb24pIHtcbiAgICBtaXNzaW9uLnVwZGF0ZURldGFpbHModGl0bGUsIGRlc2MsIGRhdGUsIHRocmVhdCwgbm90ZXMpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b2dnbGVNaXNzaW9uU3RhdHVzKHByb2plY3RJbmRleCwgbWlzc2lvbkluZGV4KSB7XG4gIHByb2plY3RzW3Byb2plY3RJbmRleF0ubWlzc2lvbnNbbWlzc2lvbkluZGV4XS50b2dnbGVTdGF0dXMoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvZ2dsZUNoZWNrbGlzdEl0ZW0ocHJvamVjdEluZGV4LCBtaXNzaW9uSW5kZXgsIGNoZWNrSW5kZXgpIHtcbiAgcHJvamVjdHNbcHJvamVjdEluZGV4XS5taXNzaW9uc1ttaXNzaW9uSW5kZXhdLnRvZ2dsZUNoZWNrbGlzdEl0ZW0oY2hlY2tJbmRleCk7XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSk7IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IGluaXRTdG9yYWdlIH0gZnJvbSAnLi9zdG9yYWdlLmpzJztcbmltcG9ydCB7IHJlbmRlckFwcCwgaW5pdEV2ZW50TGlzdGVuZXJzIH0gZnJvbSAnLi9kb21Db250cm9sbGVyLmpzJztcblxuLy8gSW5pdGlhbGl6ZSBhcHBsaWNhdGlvbiBkYXRhIGFuZCBET00gbGlzdGVuZXJzIG9uIGxvYWRcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ0RPTUNvbnRlbnRMb2FkZWQnLCAoKSA9PiB7XG4gIGluaXRTdG9yYWdlKCk7XG4gIHJlbmRlckFwcCgpO1xuICBpbml0RXZlbnRMaXN0ZW5lcnMoKTtcbn0pO1xuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9