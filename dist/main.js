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


// Initial missions with notes and checklists
let missions = [
  new _mission_js__WEBPACK_IMPORTED_MODULE_0__.Mission(
    "Infiltrate Eden Academy", 
    "Secure proximity to target's son.", 
    "2026-11-20", 
    "Critical", 
    "Must maintain elegant demeanor at all times.", 
    ["Secure bespoke suit", "Memorize aristocratic etiquette", "Locate target's classroom"]
  ),
  new _mission_js__WEBPACK_IMPORTED_MODULE_0__.Mission(
    "Secure Stella Star", 
    "Earn academic distinction to impress Loid.", 
    "2026-12-05", 
    "Medium", 
    "Avoid getting a Bolt if possible.", 
    ["Study classical literature", "Pass midterms"]
  )
];

// Function to render all missions to the DOM
function renderMissions() {
  const container = document.getElementById('mission-container');
  if (!container) return;
  
  container.innerHTML = ''; // Clear container before re-rendering

  missions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = 'mission-card';
    
    // Build checklist HTML if items exist
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

  // Attach event listeners to main mission accomplishment checkboxes
  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const idx = e.target.getAttribute('data-index');
      missions[idx].toggleStatus();
    });
  });

  // Attach event listeners to checklist checkboxes
  document.querySelectorAll('.checklist-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const mIdx = e.target.getAttribute('data-mission-index');
      const cIdx = e.target.getAttribute('data-check-index');
      missions[mIdx].toggleChecklistItem(cIdx);
    });
  });
}

// Handle form submission to add a new mission
const form = document.getElementById('mission-form');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const title = document.getElementById('mission-title').value;
    const desc = document.getElementById('mission-desc').value;
    const date = document.getElementById('mission-date').value;
    const threat = document.getElementById('mission-threat').value;
    const notes = document.getElementById('mission-notes').value;

    const newMission = new _mission_js__WEBPACK_IMPORTED_MODULE_0__.Mission(title, desc, date, threat, notes, []);
    missions.push(newMission);
    
    renderMissions();
    form.reset();
  });
}

// Initial render on load
renderMissions();

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQ0FBb0M7QUFDcEM7QUFDQSxnQ0FBZ0M7QUFDaEM7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwwQkFBMEIsa0NBQWtDO0FBQzVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7OztVQ3hCQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7O1VDNUJBO1VBQ0E7VUFDQTtVQUNBO1VBQ0EseUNBQXlDLHdDQUF3QztVQUNqRjtVQUNBO1VBQ0EsRTs7O1VDUEEseUY7OztVQ0FBO1VBQ0E7VUFDQSxzREFBc0QsaUJBQWlCO1VBQ3ZFLGdEQUFnRCxhQUFhO1VBQzdELEU7Ozs7Ozs7Ozs7O0FDSnVDOztBQUV2QztBQUNBO0FBQ0EsTUFBTSxnREFBTztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSxnREFBTztBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0Qjs7QUFFNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkRBQTJELE1BQU0sc0JBQXNCLE9BQU8sK0JBQStCLHNDQUFzQztBQUNuSyxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQSxZQUFZLGNBQWM7QUFDMUIscUNBQXFDLG9CQUFvQjtBQUN6RCxzQ0FBc0MsZ0JBQWdCO0FBQ3RELDBDQUEwQyxvQkFBb0I7QUFDOUQseUNBQXlDLHdCQUF3QjtBQUNqRTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSw2Q0FBNkMsTUFBTSxJQUFJLHVDQUF1QztBQUM5RjtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsR0FBRztBQUNIOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsMkJBQTJCLGdEQUFPO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIOztBQUVBO0FBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvbWlzc2lvbi5qcyIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vdG9kby1saXN0L3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly90b2RvLWxpc3Qvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly90b2RvLWxpc3QvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNsYXNzIE1pc3Npb24ge1xuICBjb25zdHJ1Y3Rvcih0aXRsZSwgZGVzY3JpcHRpb24sIGR1ZURhdGUsIHRocmVhdExldmVsLCBub3RlcyA9IFwiXCIsIGNoZWNrbGlzdCA9IFtdKSB7XG4gICAgdGhpcy50aXRsZSA9IHRpdGxlO1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB0aGlzLmR1ZURhdGUgPSBkdWVEYXRlO1xuICAgIHRoaXMudGhyZWF0TGV2ZWwgPSB0aHJlYXRMZXZlbDsgLy8gTG93LCBNZWRpdW0sIENyaXRpY2FsXG4gICAgdGhpcy5ub3RlcyA9IG5vdGVzO1xuICAgIHRoaXMuY2hlY2tsaXN0ID0gY2hlY2tsaXN0OyAvLyBBcnJheSBvZiBzdHJpbmdzIG9yIG9iamVjdHNcbiAgICB0aGlzLmFjY29tcGxpc2hlZCA9IGZhbHNlO1xuICB9XG5cbiAgdG9nZ2xlU3RhdHVzKCkge1xuICAgIHRoaXMuYWNjb21wbGlzaGVkID0gIXRoaXMuYWNjb21wbGlzaGVkO1xuICB9XG5cbiAgYWRkQ2hlY2tsaXN0SXRlbShpdGVtVGV4dCkge1xuICAgIHRoaXMuY2hlY2tsaXN0LnB1c2goeyB0ZXh0OiBpdGVtVGV4dCwgY29tcGxldGVkOiBmYWxzZSB9KTtcbiAgfVxuXG4gIHRvZ2dsZUNoZWNrbGlzdEl0ZW0oaW5kZXgpIHtcbiAgICBpZiAodGhpcy5jaGVja2xpc3RbaW5kZXhdKSB7XG4gICAgICB0aGlzLmNoZWNrbGlzdFtpbmRleF0uY29tcGxldGVkID0gIXRoaXMuY2hlY2tsaXN0W2luZGV4XS5jb21wbGV0ZWQ7XG4gICAgfVxuICB9XG59XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG5jb25zdCBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdGNvbnN0IGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHRjb25zdCBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdGlmICghKG1vZHVsZUlkIGluIF9fd2VicGFja19tb2R1bGVzX18pKSB7XG5cdFx0ZGVsZXRlIF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdFx0Y29uc3QgZSA9IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBtb2R1bGVJZCArIFwiJ1wiKTtcblx0XHRlLmNvZGUgPSAnTU9EVUxFX05PVF9GT1VORCc7XG5cdFx0dGhyb3cgZTtcblx0fVxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIvdmFsdWUgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSk7IiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IE1pc3Npb24gfSBmcm9tICcuL21pc3Npb24uanMnO1xuXG4vLyBJbml0aWFsIG1pc3Npb25zIHdpdGggbm90ZXMgYW5kIGNoZWNrbGlzdHNcbmxldCBtaXNzaW9ucyA9IFtcbiAgbmV3IE1pc3Npb24oXG4gICAgXCJJbmZpbHRyYXRlIEVkZW4gQWNhZGVteVwiLCBcbiAgICBcIlNlY3VyZSBwcm94aW1pdHkgdG8gdGFyZ2V0J3Mgc29uLlwiLCBcbiAgICBcIjIwMjYtMTEtMjBcIiwgXG4gICAgXCJDcml0aWNhbFwiLCBcbiAgICBcIk11c3QgbWFpbnRhaW4gZWxlZ2FudCBkZW1lYW5vciBhdCBhbGwgdGltZXMuXCIsIFxuICAgIFtcIlNlY3VyZSBiZXNwb2tlIHN1aXRcIiwgXCJNZW1vcml6ZSBhcmlzdG9jcmF0aWMgZXRpcXVldHRlXCIsIFwiTG9jYXRlIHRhcmdldCdzIGNsYXNzcm9vbVwiXVxuICApLFxuICBuZXcgTWlzc2lvbihcbiAgICBcIlNlY3VyZSBTdGVsbGEgU3RhclwiLCBcbiAgICBcIkVhcm4gYWNhZGVtaWMgZGlzdGluY3Rpb24gdG8gaW1wcmVzcyBMb2lkLlwiLCBcbiAgICBcIjIwMjYtMTItMDVcIiwgXG4gICAgXCJNZWRpdW1cIiwgXG4gICAgXCJBdm9pZCBnZXR0aW5nIGEgQm9sdCBpZiBwb3NzaWJsZS5cIiwgXG4gICAgW1wiU3R1ZHkgY2xhc3NpY2FsIGxpdGVyYXR1cmVcIiwgXCJQYXNzIG1pZHRlcm1zXCJdXG4gIClcbl07XG5cbi8vIEZ1bmN0aW9uIHRvIHJlbmRlciBhbGwgbWlzc2lvbnMgdG8gdGhlIERPTVxuZnVuY3Rpb24gcmVuZGVyTWlzc2lvbnMoKSB7XG4gIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtaXNzaW9uLWNvbnRhaW5lcicpO1xuICBpZiAoIWNvbnRhaW5lcikgcmV0dXJuO1xuICBcbiAgY29udGFpbmVyLmlubmVySFRNTCA9ICcnOyAvLyBDbGVhciBjb250YWluZXIgYmVmb3JlIHJlLXJlbmRlcmluZ1xuXG4gIG1pc3Npb25zLmZvckVhY2goKG1pc3Npb24sIGluZGV4KSA9PiB7XG4gICAgY29uc3QgY2FyZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGNhcmQuY2xhc3NOYW1lID0gJ21pc3Npb24tY2FyZCc7XG4gICAgXG4gICAgLy8gQnVpbGQgY2hlY2tsaXN0IEhUTUwgaWYgaXRlbXMgZXhpc3RcbiAgICBsZXQgY2hlY2tsaXN0SHRtbCA9ICcnO1xuICAgIGlmIChtaXNzaW9uLmNoZWNrbGlzdCAmJiBtaXNzaW9uLmNoZWNrbGlzdC5sZW5ndGggPiAwKSB7XG4gICAgICBjaGVja2xpc3RIdG1sID0gJzx1bD4nO1xuICAgICAgbWlzc2lvbi5jaGVja2xpc3QuZm9yRWFjaCgoY2hlY2tJdGVtLCBjSW5kZXgpID0+IHtcbiAgICAgICAgY2hlY2tsaXN0SHRtbCArPSBgXG4gICAgICAgICAgPGxpPlxuICAgICAgICAgICAgPGxhYmVsPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgZGF0YS1taXNzaW9uLWluZGV4PVwiJHtpbmRleH1cIiBkYXRhLWNoZWNrLWluZGV4PVwiJHtjSW5kZXh9XCIgY2xhc3M9XCJjaGVja2xpc3QtY2hlY2tib3hcIiAke2NoZWNrSXRlbS5jb21wbGV0ZWQgPyAnY2hlY2tlZCcgOiAnJ30gLz5cbiAgICAgICAgICAgICAgJHtjaGVja0l0ZW0udGV4dH1cbiAgICAgICAgICAgIDwvbGFiZWw+XG4gICAgICAgICAgPC9saT5cbiAgICAgICAgYDtcbiAgICAgIH0pO1xuICAgICAgY2hlY2tsaXN0SHRtbCArPSAnPC91bD4nO1xuICAgIH1cblxuICAgIGNhcmQuaW5uZXJIVE1MID0gYFxuICAgICAgPGgzPiR7bWlzc2lvbi50aXRsZX08L2gzPlxuICAgICAgPHA+PHN0cm9uZz5EZXRhaWxzOjwvc3Ryb25nPiAke21pc3Npb24uZGVzY3JpcHRpb259PC9wPlxuICAgICAgPHA+PHN0cm9uZz5EZWFkbGluZTo8L3N0cm9uZz4gJHttaXNzaW9uLmR1ZURhdGV9PC9wPlxuICAgICAgPHA+PHN0cm9uZz5UaHJlYXQgTGV2ZWw6PC9zdHJvbmc+ICR7bWlzc2lvbi50aHJlYXRMZXZlbH08L3A+XG4gICAgICA8cD48c3Ryb25nPkZpZWxkIE5vdGVzOjwvc3Ryb25nPiAke21pc3Npb24ubm90ZXMgfHwgJ05vbmUnfTwvcD5cbiAgICAgIDxkaXYgY2xhc3M9XCJjaGVja2xpc3Qtc2VjdGlvblwiPlxuICAgICAgICA8c3Ryb25nPlN1Yi1PYmplY3RpdmVzOjwvc3Ryb25nPlxuICAgICAgICAke2NoZWNrbGlzdEh0bWwgfHwgJzxwPk5vIHN1Yi1vYmplY3RpdmVzIGFzc2lnbmVkLjwvcD4nfVxuICAgICAgPC9kaXY+XG4gICAgICA8bGFiZWwgY2xhc3M9XCJtaXNzaW9uLXN0YXR1cy1sYWJlbFwiPlxuICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCIgJHttaXNzaW9uLmFjY29tcGxpc2hlZCA/ICdjaGVja2VkJyA6ICcnfSBjbGFzcz1cImFjY29tcGxpc2hlZC1jaGVja2JveFwiIC8+IE1pc3Npb24gQWNjb21wbGlzaGVkXG4gICAgICA8L2xhYmVsPlxuICAgIGA7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGNhcmQpO1xuICB9KTtcblxuICAvLyBBdHRhY2ggZXZlbnQgbGlzdGVuZXJzIHRvIG1haW4gbWlzc2lvbiBhY2NvbXBsaXNobWVudCBjaGVja2JveGVzXG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hY2NvbXBsaXNoZWQtY2hlY2tib3gnKS5mb3JFYWNoKGJveCA9PiB7XG4gICAgYm94LmFkZEV2ZW50TGlzdGVuZXIoJ2NoYW5nZScsIChlKSA9PiB7XG4gICAgICBjb25zdCBpZHggPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtaW5kZXgnKTtcbiAgICAgIG1pc3Npb25zW2lkeF0udG9nZ2xlU3RhdHVzKCk7XG4gICAgfSk7XG4gIH0pO1xuXG4gIC8vIEF0dGFjaCBldmVudCBsaXN0ZW5lcnMgdG8gY2hlY2tsaXN0IGNoZWNrYm94ZXNcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNoZWNrbGlzdC1jaGVja2JveCcpLmZvckVhY2goYm94ID0+IHtcbiAgICBib3guYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKGUpID0+IHtcbiAgICAgIGNvbnN0IG1JZHggPSBlLnRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWlzc2lvbi1pbmRleCcpO1xuICAgICAgY29uc3QgY0lkeCA9IGUudGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1jaGVjay1pbmRleCcpO1xuICAgICAgbWlzc2lvbnNbbUlkeF0udG9nZ2xlQ2hlY2tsaXN0SXRlbShjSWR4KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8vIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb24gdG8gYWRkIGEgbmV3IG1pc3Npb25cbmNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1mb3JtJyk7XG5pZiAoZm9ybSkge1xuICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIChlKSA9PiB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIFxuICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tdGl0bGUnKS52YWx1ZTtcbiAgICBjb25zdCBkZXNjID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tZGVzYycpLnZhbHVlO1xuICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1kYXRlJykudmFsdWU7XG4gICAgY29uc3QgdGhyZWF0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21pc3Npb24tdGhyZWF0JykudmFsdWU7XG4gICAgY29uc3Qgbm90ZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbWlzc2lvbi1ub3RlcycpLnZhbHVlO1xuXG4gICAgY29uc3QgbmV3TWlzc2lvbiA9IG5ldyBNaXNzaW9uKHRpdGxlLCBkZXNjLCBkYXRlLCB0aHJlYXQsIG5vdGVzLCBbXSk7XG4gICAgbWlzc2lvbnMucHVzaChuZXdNaXNzaW9uKTtcbiAgICBcbiAgICByZW5kZXJNaXNzaW9ucygpO1xuICAgIGZvcm0ucmVzZXQoKTtcbiAgfSk7XG59XG5cbi8vIEluaXRpYWwgcmVuZGVyIG9uIGxvYWRcbnJlbmRlck1pc3Npb25zKCk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=