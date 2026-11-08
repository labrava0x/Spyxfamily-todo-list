/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/mission.js"
/*!************************!*\
  !*** ./src/mission.js ***!
  \************************/
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
    this.checklist = checklist; // Array of strings or objects
    this.accomplished = false;
  }

  toggleStatus() {
    this.accomplished = !this.accomplished;
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
/* harmony import */ var _mission_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mission.js */ "./src/mission.js");
/* harmony import */ var _project_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./project.js */ "./src/project.js");



// Initialize projects array with a default project
let projects = [
  new _project_js__WEBPACK_IMPORTED_MODULE_1__.Project("Default Operations")
];

// Add a sample mission to the default project
projects[0].addMission(new _mission_js__WEBPACK_IMPORTED_MODULE_0__.Mission(
  "Infiltrate Eden Academy", 
  "Secure proximity to target's son.", 
  "2026-11-20", 
  "Critical", 
  "Must maintain elegant demeanor.", 
  [{ text: "Secure bespoke suit", completed: false }]
));

let currentProjectIndex = 0;

// Render project navigation tabs/selector
function renderProjects() {
  const navContainer = document.getElementById('project-nav');
  if (!navContainer) return;

  navContainer.innerHTML = '';
  projects.forEach((project, index) => {
    const btn = document.createElement('button');
    btn.textContent = project.name;
    btn.className = index === currentProjectIndex ? 'project-btn active' : 'project-btn';
    btn.addEventListener('click', () => {
      currentProjectIndex = index;
      renderProjects();
      renderMissions();
      updateProjectDropdown();
    });
    navContainer.appendChild(btn);
  });
}

// Update the select dropdown inside the form so users can choose the target project
function updateProjectDropdown() {
  const select = document.getElementById('mission-project');
  if (!select) return;

  select.innerHTML = '';
  projects.forEach((project, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = project.name;
    select.appendChild(option);
  });
  select.value = currentProjectIndex;
}

// Function to render all missions for the currently active project
function renderMissions() {
  const container = document.getElementById('mission-container');
  if (!container) return;
  
  container.innerHTML = ''; 

  const activeProject = projects[currentProjectIndex];
  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p>No active missions in this sector.</p>';
    return;
  }

  activeProject.missions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = 'mission-card';
    
    let checklistHtml = '';
    if (mission.checklist && mission.checklist.length > 0) {
      checklistHtml = '<ul>';
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

    card.innerHTML = `
      <h3>${mission.title}</h3>
      <p><strong>Details:</strong> ${mission.description}</p>
      <p><strong>Deadline:</strong> ${mission.dueDate}</p>
      <p><strong>Threat Level:</strong> ${mission.threatLevel}</p>
      <p><strong>Field Notes:</strong> ${mission.notes || 'None'}</p>
      <div class="checklist-section">
        <strong>Sub-Objectives:</strong>
        ${checklistHtml || '<p>No sub-objectives assigned.</p>'}
      </div>
      <label class="mission-status-label">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" /> Mission Accomplished
      </label>
    `;
    container.appendChild(card);
  });

  // Attach event listeners
  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      activeProject.missions[idx].toggleStatus();
    });
  });

  document.querySelectorAll('.checklist-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-mission-index');
      const cIdx = e.target.getAttribute('data-check-index');
      activeProject.missions[mIdx].toggleChecklistItem(cIdx);
    });
  });
}

// Handle project creation form
const projectForm = document.getElementById('project-form');
if (projectForm) {
  projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const projectNameInput = document.getElementById('project-name');
    const name = projectNameInput.value.trim();
    if (name) {
      projects.push(new _project_js__WEBPACK_IMPORTED_MODULE_1__.Project(name));
      currentProjectIndex = projects.length - 1;
      projectForm.reset();
      renderProjects();
      renderMissions();
      updateProjectDropdown();
    }
  });
}

// Handle mission creation form
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

    const newMission = new _mission_js__WEBPACK_IMPORTED_MODULE_0__.Mission(title, desc, date, threat, notes, []);
    projects[targetProjectIndex].addMission(newMission);
    
    currentProjectIndex = Number(targetProjectIndex);
    renderProjects();
    renderMissions();
    missionForm.reset();
    updateProjectDropdown();
  });
}

// Initial load
renderProjects();
renderMissions();
updateProjectDropdown();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwwQkFBMEIsa0NBQWtDO0FBQzVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7O0FDeEJPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O1VDYkE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7OztVQzVCQTtVQUNBO1VBQ0E7VUFDQTtVQUNBLHlDQUF5Qyx3Q0FBd0M7VUFDakY7VUFDQTtVQUNBLEU7OztVQ1BBLHlGOzs7VUNBQTtVQUNBO1VBQ0Esc0RBQXNELGlCQUFpQjtVQUN2RSxnREFBZ0QsYUFBYTtVQUM3RCxFOzs7Ozs7Ozs7Ozs7QUNKdUM7QUFDQTs7QUFFdkM7QUFDQTtBQUNBLE1BQU0sZ0RBQU87QUFDYjs7QUFFQTtBQUNBLDJCQUEyQixnREFBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSywrQ0FBK0M7QUFDcEQ7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJEQUEyRCxNQUFNLHNCQUFzQixPQUFPLCtCQUErQixzQ0FBc0M7QUFDbkssZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0EsWUFBWSxjQUFjO0FBQzFCLHFDQUFxQyxvQkFBb0I7QUFDekQsc0NBQXNDLGdCQUFnQjtBQUN0RCwwQ0FBMEMsb0JBQW9CO0FBQzlELHlDQUF5Qyx3QkFBd0I7QUFDakU7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsNkNBQTZDLE1BQU0sSUFBSSx1Q0FBdUM7QUFDOUY7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QixnREFBTztBQUMvQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLDJCQUEyQixnREFBTztBQUNsQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXMiOlsid2VicGFjazovL3RvZG8tbGlzdC8uL3NyYy9taXNzaW9uLmpzIiwid2VicGFjazovL3RvZG8tbGlzdC8uL3NyYy9wcm9qZWN0LmpzIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3RvZG8tbGlzdC93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3RvZG8tbGlzdC8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY2xhc3MgTWlzc2lvbiB7XG4gIGNvbnN0cnVjdG9yKHRpdGxlLCBkZXNjcmlwdGlvbiwgZHVlRGF0ZSwgdGhyZWF0TGV2ZWwsIG5vdGVzID0gXCJcIiwgY2hlY2tsaXN0ID0gW10pIHtcbiAgICB0aGlzLnRpdGxlID0gdGl0bGU7XG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uO1xuICAgIHRoaXMuZHVlRGF0ZSA9IGR1ZURhdGU7XG4gICAgdGhpcy50aHJlYXRMZXZlbCA9IHRocmVhdExldmVsOyAvLyBMb3csIE1lZGl1bSwgQ3JpdGljYWxcbiAgICB0aGlzLm5vdGVzID0gbm90ZXM7XG4gICAgdGhpcy5jaGVja2xpc3QgPSBjaGVja2xpc3Q7IC8vIEFycmF5IG9mIHN0cmluZ3Mgb3Igb2JqZWN0c1xuICAgIHRoaXMuYWNjb21wbGlzaGVkID0gZmFsc2U7XG4gIH1cblxuICB0b2dnbGVTdGF0dXMoKSB7XG4gICAgdGhpcy5hY2NvbXBsaXNoZWQgPSAhdGhpcy5hY2NvbXBsaXNoZWQ7XG4gIH1cblxuICBhZGRDaGVja2xpc3RJdGVtKGl0ZW1UZXh0KSB7XG4gICAgdGhpcy5jaGVja2xpc3QucHVzaCh7IHRleHQ6IGl0ZW1UZXh0LCBjb21wbGV0ZWQ6IGZhbHNlIH0pO1xuICB9XG5cbiAgdG9nZ2xlQ2hlY2tsaXN0SXRlbShpbmRleCkge1xuICAgIGlmICh0aGlzLmNoZWNrbGlzdFtpbmRleF0pIHtcbiAgICAgIHRoaXMuY2hlY2tsaXN0W2luZGV4XS5jb21wbGV0ZWQgPSAhdGhpcy5jaGVja2xpc3RbaW5kZXhdLmNvbXBsZXRlZDtcbiAgICB9XG4gIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBQcm9qZWN0IHtcbiAgY29uc3RydWN0b3IobmFtZSkge1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5taXNzaW9ucyA9IFtdO1xuICB9XG5cbiAgYWRkTWlzc2lvbihtaXNzaW9uKSB7XG4gICAgdGhpcy5taXNzaW9ucy5wdXNoKG1pc3Npb24pO1xuICB9XG5cbiAgcmVtb3ZlTWlzc2lvbihpbmRleCkge1xuICAgIHRoaXMubWlzc2lvbnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgfVxufVxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxuY29uc3QgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHRjb25zdCBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0Y29uc3QgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRpZiAoIShtb2R1bGVJZCBpbiBfX3dlYnBhY2tfbW9kdWxlc19fKSkge1xuXHRcdGRlbGV0ZSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRcdGNvbnN0IGUgPSBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiICsgbW9kdWxlSWQgKyBcIidcIik7XG5cdFx0ZS5jb2RlID0gJ01PRFVMRV9OT1RfRk9VTkQnO1xuXHRcdHRocm93IGU7XG5cdH1cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyL3ZhbHVlIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpOyIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBNaXNzaW9uIH0gZnJvbSAnLi9taXNzaW9uLmpzJztcbmltcG9ydCB7IFByb2plY3QgfSBmcm9tICcuL3Byb2plY3QuanMnO1xuXG4vLyBJbml0aWFsaXplIHByb2plY3RzIGFycmF5IHdpdGggYSBkZWZhdWx0IHByb2plY3RcbmxldCBwcm9qZWN0cyA9IFtcbiAgbmV3IFByb2plY3QoXCJEZWZhdWx0IE9wZXJhdGlvbnNcIilcbl07XG5cbi8vIEFkZCBhIHNhbXBsZSBtaXNzaW9uIHRvIHRoZSBkZWZhdWx0IHByb2plY3RcbnByb2plY3RzWzBdLmFkZE1pc3Npb24obmV3IE1pc3Npb24oXG4gIFwiSW5maWx0cmF0ZSBFZGVuIEFjYWRlbXlcIiwgXG4gIFwiU2VjdXJlIHByb3hpbWl0eSB0byB0YXJnZXQncyBzb24uXCIsIFxuICBcIjIwMjYtMTEtMjBcIiwgXG4gIFwiQ3JpdGljYWxcIiwgXG4gIFwiTXVzdCBtYWludGFpbiBlbGVnYW50IGRlbWVhbm9yLlwiLCBcbiAgW3sgdGV4dDogXCJTZWN1cmUgYmVzcG9rZSBzdWl0XCIsIGNvbXBsZXRlZDogZmFsc2UgfV1cbikpO1xuXG5sZXQgY3VycmVudFByb2plY3RJbmRleCA9IDA7XG5cbi8vIFJlbmRlciBwcm9qZWN0IG5hdmlnYXRpb24gdGFicy9zZWxlY3RvclxuZnVuY3Rpb24gcmVuZGVyUHJvamVjdHMoKSB7XG4gIGNvbnN0IG5hdkNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9qZWN0LW5hdicpO1xuICBpZiAoIW5hdkNvbnRhaW5lcikgcmV0dXJuO1xuXG4gIG5hdkNvbnRhaW5lci5pbm5lckhUTUwgPSAnJztcbiAgcHJvamVjdHMuZm9yRWFjaCgocHJvamVjdCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBidG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgICBidG4udGV4dENvbnRlbnQgPSBwcm9qZWN0Lm5hbWU7XG4gICAgYnRuLmNsYXNzTmFtZSA9IGluZGV4ID09PSBjdXJyZW50UHJvamVjdEluZGV4ID8gJ3Byb2plY3QtYnRuIGFjdGl2ZScgOiAncHJvamVjdC1idG4nO1xuICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IHtcbiAgICAgIGN1cnJlbnRQcm9qZWN0SW5kZXggPSBpbmRleDtcbiAgICAgIHJlbmRlclByb2plY3RzKCk7XG4gICAgICByZW5kZXJNaXNzaW9ucygpO1xuICAgICAgdXBkYXRlUHJvamVjdERyb3Bkb3duKCk7XG4gICAgfSk7XG4gICAgbmF2Q29udGFpbmVyLmFwcGVuZENoaWxkKGJ0bik7XG4gIH0pO1xufVxuXG4vLyBVcGRhdGUgdGhlIHNlbGVjdCBkcm9wZG93biBpbnNpZGUgdGhlIGZvcm0gc28gdXNlcnMgY2FuIGNob29zZSB0aGUgdGFyZ2V0IHByb2plY3RcbmZ1bmN0aW9uIHVwZGF0ZVByb2plY3REcm9wZG93bigpIHtcbiAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tcHJvamVjdCcpO1xuICBpZiAoIXNlbGVjdCkgcmV0dXJuO1xuXG4gIHNlbGVjdC5pbm5lckhUTUwgPSAnJztcbiAgcHJvamVjdHMuZm9yRWFjaCgocHJvamVjdCwgaW5kZXgpID0+IHtcbiAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKTtcbiAgICBvcHRpb24udmFsdWUgPSBpbmRleDtcbiAgICBvcHRpb24udGV4dENvbnRlbnQgPSBwcm9qZWN0Lm5hbWU7XG4gICAgc2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XG4gIH0pO1xuICBzZWxlY3QudmFsdWUgPSBjdXJyZW50UHJvamVjdEluZGV4O1xufVxuXG4vLyBGdW5jdGlvbiB0byByZW5kZXIgYWxsIG1pc3Npb25zIGZvciB0aGUgY3VycmVudGx5IGFjdGl2ZSBwcm9qZWN0XG5mdW5jdGlvbiByZW5kZXJNaXNzaW9ucygpIHtcbiAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tY29udGFpbmVyJyk7XG4gIGlmICghY29udGFpbmVyKSByZXR1cm47XG4gIFxuICBjb250YWluZXIuaW5uZXJIVE1MID0gJyc7IFxuXG4gIGNvbnN0IGFjdGl2ZVByb2plY3QgPSBwcm9qZWN0c1tjdXJyZW50UHJvamVjdEluZGV4XTtcbiAgaWYgKCFhY3RpdmVQcm9qZWN0IHx8IGFjdGl2ZVByb2plY3QubWlzc2lvbnMubGVuZ3RoID09PSAwKSB7XG4gICAgY29udGFpbmVyLmlubmVySFRNTCA9ICc8cD5ObyBhY3RpdmUgbWlzc2lvbnMgaW4gdGhpcyBzZWN0b3IuPC9wPic7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgYWN0aXZlUHJvamVjdC5taXNzaW9ucy5mb3JFYWNoKChtaXNzaW9uLCBpbmRleCkgPT4ge1xuICAgIGNvbnN0IGNhcmQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBjYXJkLmNsYXNzTmFtZSA9ICdtaXNzaW9uLWNhcmQnO1xuICAgIFxuICAgIGxldCBjaGVja2xpc3RIdG1sID0gJyc7XG4gICAgaWYgKG1pc3Npb24uY2hlY2tsaXN0ICYmIG1pc3Npb24uY2hlY2tsaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgIGNoZWNrbGlzdEh0bWwgPSAnPHVsPic7XG4gICAgICBtaXNzaW9uLmNoZWNrbGlzdC5mb3JFYWNoKChjaGVja0l0ZW0sIGNJbmRleCkgPT4ge1xuICAgICAgICBjaGVja2xpc3RIdG1sICs9IGBcbiAgICAgICAgICA8bGk+XG4gICAgICAgICAgICA8bGFiZWw+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBkYXRhLW1pc3Npb24taW5kZXg9XCIke2luZGV4fVwiIGRhdGEtY2hlY2staW5kZXg9XCIke2NJbmRleH1cIiBjbGFzcz1cImNoZWNrbGlzdC1jaGVja2JveFwiICR7Y2hlY2tJdGVtLmNvbXBsZXRlZCA/ICdjaGVja2VkJyA6ICcnfSAvPlxuICAgICAgICAgICAgICAke2NoZWNrSXRlbS50ZXh0fVxuICAgICAgICAgICAgPC9sYWJlbD5cbiAgICAgICAgICA8L2xpPlxuICAgICAgICBgO1xuICAgICAgfSk7XG4gICAgICBjaGVja2xpc3RIdG1sICs9ICc8L3VsPic7XG4gICAgfVxuXG4gICAgY2FyZC5pbm5lckhUTUwgPSBgXG4gICAgICA8aDM+JHttaXNzaW9uLnRpdGxlfTwvaDM+XG4gICAgICA8cD48c3Ryb25nPkRldGFpbHM6PC9zdHJvbmc+ICR7bWlzc2lvbi5kZXNjcmlwdGlvbn08L3A+XG4gICAgICA8cD48c3Ryb25nPkRlYWRsaW5lOjwvc3Ryb25nPiAke21pc3Npb24uZHVlRGF0ZX08L3A+XG4gICAgICA8cD48c3Ryb25nPlRocmVhdCBMZXZlbDo8L3N0cm9uZz4gJHttaXNzaW9uLnRocmVhdExldmVsfTwvcD5cbiAgICAgIDxwPjxzdHJvbmc+RmllbGQgTm90ZXM6PC9zdHJvbmc+ICR7bWlzc2lvbi5ub3RlcyB8fCAnTm9uZSd9PC9wPlxuICAgICAgPGRpdiBjbGFzcz1cImNoZWNrbGlzdC1zZWN0aW9uXCI+XG4gICAgICAgIDxzdHJvbmc+U3ViLU9iamVjdGl2ZXM6PC9zdHJvbmc+XG4gICAgICAgICR7Y2hlY2tsaXN0SHRtbCB8fCAnPHA+Tm8gc3ViLW9iamVjdGl2ZXMgYXNzaWduZWQuPC9wPid9XG4gICAgICA8L2Rpdj5cbiAgICAgIDxsYWJlbCBjbGFzcz1cIm1pc3Npb24tc3RhdHVzLWxhYmVsXCI+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiBkYXRhLWluZGV4PVwiJHtpbmRleH1cIiAke21pc3Npb24uYWNjb21wbGlzaGVkID8gJ2NoZWNrZWQnIDogJyd9IGNsYXNzPVwiYWNjb21wbGlzaGVkLWNoZWNrYm94XCIgLz4gTWlzc2lvbiBBY2NvbXBsaXNoZWRcbiAgICAgIDwvbGFiZWw+XG4gICAgYDtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoY2FyZCk7XG4gIH0pO1xuXG4gIC8vIEF0dGFjaCBldmVudCBsaXN0ZW5lcnNcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFjY29tcGxpc2hlZC1jaGVja2JveCcpLmZvckVhY2goYm94ID0+IHtcbiAgICBib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IGlkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1pbmRleCcpO1xuICAgICAgYWN0aXZlUHJvamVjdC5taXNzaW9uc1tpZHhdLnRvZ2dsZVN0YXR1cygpO1xuICAgIH0pO1xuICB9KTtcblxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2hlY2tsaXN0LWNoZWNrYm94JykuZm9yRWFjaChib3ggPT4ge1xuICAgIGJveC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAoZSkgPT4ge1xuICAgICAgY29uc3QgbUlkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1taXNzaW9uLWluZGV4Jyk7XG4gICAgICBjb25zdCBjSWR4ID0gZS50YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLWNoZWNrLWluZGV4Jyk7XG4gICAgICBhY3RpdmVQcm9qZWN0Lm1pc3Npb25zW21JZHhdLnRvZ2dsZUNoZWNrbGlzdEl0ZW0oY0lkeCk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vLyBIYW5kbGUgcHJvamVjdCBjcmVhdGlvbiBmb3JtXG5jb25zdCBwcm9qZWN0Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdwcm9qZWN0LWZvcm0nKTtcbmlmIChwcm9qZWN0Rm9ybSkge1xuICBwcm9qZWN0Rm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCAoZSkgPT4ge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zdCBwcm9qZWN0TmFtZUlucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Byb2plY3QtbmFtZScpO1xuICAgIGNvbnN0IG5hbWUgPSBwcm9qZWN0TmFtZUlucHV0LnZhbHVlLnRyaW0oKTtcbiAgICBpZiAobmFtZSkge1xuICAgICAgcHJvamVjdHMucHVzaChuZXcgUHJvamVjdChuYW1lKSk7XG4gICAgICBjdXJyZW50UHJvamVjdEluZGV4ID0gcHJvamVjdHMubGVuZ3RoIC0gMTtcbiAgICAgIHByb2plY3RGb3JtLnJlc2V0KCk7XG4gICAgICByZW5kZXJQcm9qZWN0cygpO1xuICAgICAgcmVuZGVyTWlzc2lvbnMoKTtcbiAgICAgIHVwZGF0ZVByb2plY3REcm9wZG93bigpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIEhhbmRsZSBtaXNzaW9uIGNyZWF0aW9uIGZvcm1cbmNvbnN0IG1pc3Npb25Gb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tZm9ybScpO1xuaWYgKG1pc3Npb25Gb3JtKSB7XG4gIG1pc3Npb25Gb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tdGl0bGUnKS52YWx1ZTtcbiAgICBjb25zdCBkZXNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tZGVzYycpLnZhbHVlO1xuICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1kYXRlJykudmFsdWU7XG4gICAgY29uc3QgdGhyZWF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tdGhyZWF0JykudmFsdWU7XG4gICAgY29uc3Qgbm90ZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1ub3RlcycpLnZhbHVlO1xuICAgIGNvbnN0IHRhcmdldFByb2plY3RJbmRleCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLXByb2plY3QnKS52YWx1ZTtcblxuICAgIGNvbnN0IG5ld01pc3Npb24gPSBuZXcgTWlzc2lvbih0aXRsZSwgZGVzYywgZGF0ZSwgdGhyZWF0LCBub3RlcywgW10pO1xuICAgIHByb2plY3RzW3RhcmdldFByb2plY3RJbmRleF0uYWRkTWlzc2lvbihuZXdNaXNzaW9uKTtcbiAgICBcbiAgICBjdXJyZW50UHJvamVjdEluZGV4ID0gTnVtYmVyKHRhcmdldFByb2plY3RJbmRleCk7XG4gICAgcmVuZGVyUHJvamVjdHMoKTtcbiAgICByZW5kZXJNaXNzaW9ucygpO1xuICAgIG1pc3Npb25Gb3JtLnJlc2V0KCk7XG4gICAgdXBkYXRlUHJvamVjdERyb3Bkb3duKCk7XG4gIH0pO1xufVxuXG4vLyBJbml0aWFsIGxvYWRcbnJlbmRlclByb2plY3RzKCk7XG5yZW5kZXJNaXNzaW9ucygpO1xudXBkYXRlUHJvamVjdERyb3Bkb3duKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=