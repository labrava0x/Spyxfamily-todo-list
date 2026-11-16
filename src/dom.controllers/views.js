import { format, parseISO, isPast } from 'date-fns';
import { getProjects, getCurrentProjectIndex, getCommsConfig, saveCommsConfig, saveStorage } from '../storage.js';
import { renderApp } from './dom.controller.js';

/* ================================================================= *
 * SHARED AGENCY HELPER                                              *
 * ================================================================= */

function getActiveAgency() {
  return window.currentCommsAgency || 'wise';
}

function setActiveAgency(agency) {
  window.currentCommsAgency = agency;
}

function getAgencyProjects(agency) {
  return agency === 'yuri'
    ? JSON.parse(localStorage.getItem('sss_projects') || '[]')
    : getProjects();
}

function saveAgencyProjects(agency, projects) {
  if (agency === 'yuri') {
    localStorage.setItem('sss_projects', JSON.stringify(projects));
  } else {
    saveStorage(projects);
  }
}

function resolveTargetContainer(container) {
  if (!container) return document.getElementById('mission-container');
  // Guard against accidentally passing #app or .comms-hub-folder
  if (container.id === 'app' || container.classList.contains('comms-hub-folder')) {
    return container.querySelector('#mission-container') || container;
  }
  return container;
}

function renderAgencySwitcher(prefix, isYuri) {
  return `
    <div class="${prefix}-agency-switcher" style="display: flex; gap: 10px; justify-content: center; margin-bottom: 0.5rem;">
      <button type="button" id="${prefix}-wise-btn" class="secondary-btn" style="flex: 1; max-width: 250px; background-color: ${!isYuri ? '#16a085' : '#181f2c'}; color: #fff; border-color: #1abc9c; font-family: 'Anton', sans-serif;">
        📁 WISE HQ
      </button>
      <button type="button" id="${prefix}-yuri-btn" class="secondary-btn" style="flex: 1; max-width: 250px; background-color: ${isYuri ? '#16a085' : '#181f2c'}; color: #fff; border-color: #1abc9c; font-family: 'Anton', sans-serif;">
        🕵️ SSS Bureau
      </button>
    </div>
  `;
}

function attachAgencySwitcherListeners(target, prefix, renderCallback) {
  const wiseBtn = target.querySelector(`#${prefix}-wise-btn`);
  const yuriBtn = target.querySelector(`#${prefix}-yuri-btn`);

  const triggerRefresh = () => {
    if (typeof renderCallback === 'function') {
      renderCallback();
    } else if (typeof renderApp === 'function') {
      renderApp();
    }
  };

  if (wiseBtn) {
    wiseBtn.addEventListener('click', () => {
      setActiveAgency('wise');
      triggerRefresh();
    });
  }

  if (yuriBtn) {
    yuriBtn.addEventListener('click', () => {
      setActiveAgency('yuri');
      triggerRefresh();
    });
  }
}


/* ================================================================= *
 * 1. INSIGHTS VIEW MODULE                                           *
 * ================================================================= */

export function renderInsightsView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';
  const projects = getAgencyProjects(agency);
  const currentIndex = getCurrentProjectIndex() || 0;
  const activeProject = projects[currentIndex] || projects[0];

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      ${renderAgencySwitcher('insights', isYuri)}
  `;

  if (!activeProject) {
    html += `<p class="no-missions" style="text-align: center; color: #7c6d57; font-style: italic;">No active operation selected for ${isYuri ? 'SSS Bureau' : 'WISE HQ'}.</p></div>`;
    target.innerHTML = html;
    attachAgencySwitcherListeners(target, 'insights', renderCallback);
    return;
  }

  const missions = Array.isArray(activeProject.missions) ? activeProject.missions : [];
  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.accomplished).length;
  const overdueMissions = missions.filter(m => !m.accomplished && m.dueDate && isPast(parseISO(m.dueDate))).length;

  let healthStatus = 'Excellent 🟢';
  let healthDesc = 'This operation is in excellent health, with final cut moving steadily and tasks on track. No tasks are overdue!';

  if (overdueMissions > 0) {
    healthStatus = 'Critical 🔴';
    healthDesc = `Warning! There are ${overdueMissions} overdue mission(s) requiring immediate operative intervention.`;
  } else if (totalMissions > 0 && (completedMissions / totalMissions) < 0.4) {
    healthStatus = 'Good 🟡';
    healthDesc = 'Operation is progressing steadily, but several intelligence milestones remain pending.';
  }

  html += `
      <div style="background: #f7f1e1; padding: 1.5rem; border: 1px solid #9c8a6b; border-top: 4px solid #8b1e1e; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.3rem; color: #8b1e1e;">📊 Operation Health (${isYuri ? 'SSS Bureau' : 'WISE HQ'}): ${healthStatus}</h3>
        <p style="font-size: 0.95rem; line-height: 1.5; color: #2b1e10; margin-top: 0.5rem;">${healthDesc}</p>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-top: 1.2rem;">
          <div style="background: #fff; padding: 0.8rem; border: 1px solid #d6c098; text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold; font-family: 'Anton', sans-serif; color: #2b4c48;">${totalMissions}</div>
            <div style="font-size: 0.8rem; color: #5c4d37;">Total Missions</div>
          </div>
          <div style="background: #fff; padding: 0.8rem; border: 1px solid #d6c098; text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold; font-family: 'Anton', sans-serif; color: #4b6b54;">${completedMissions}</div>
            <div style="font-size: 0.8rem; color: #5c4d37;">Fulfilled</div>
          </div>
          <div style="background: #fff; padding: 0.8rem; border: 1px solid #d6c098; text-align: center;">
            <div style="font-size: 1.5rem; font-weight: bold; font-family: 'Anton', sans-serif; color: #8b1e1e;">${overdueMissions}</div>
            <div style="font-size: 0.8rem; color: #5c4d37;">Overdue / Critical</div>
          </div>
        </div>
      </div>
    </div>
  `;

  target.innerHTML = html;
  attachAgencySwitcherListeners(target, 'insights', renderCallback);
}


/* ================================================================= *
 * 2. CIPHER & DOODLE CANVAS HELPERS                                 *
 * ================================================================= */

function drawDancingMenTemplate(ctx) {
  ctx.strokeStyle = '#8b1e1e';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const drawDancingMan = (startX) => {
    ctx.beginPath();
    ctx.arc(startX, 45, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX, 55);
    ctx.lineTo(startX, 110);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX - 20, 75);
    ctx.lineTo(startX, 70);
    ctx.lineTo(startX + 25, 60);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(startX - 15, 140);
    ctx.lineTo(startX, 110);
    ctx.lineTo(startX + 20, 135);
    ctx.stroke();
  };

  drawDancingMan(80);
  drawDancingMan(150);
  drawDancingMan(220);
}

function renderDancingMenDoodleSection(agencyPrefix) {
  const canvasId = `doodle-canvas-${agencyPrefix}`;
  return `
    <div style="background: #f7f1e1; border: 1px solid #9c8a6b; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); margin-top: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #d6c098; padding-bottom: 0.3rem; margin-bottom: 0.8rem;">
        <h3 style="margin: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #8b1e1e;">
          🕵️ Cipher & Doodle
        </h3>
        <button type="button" class="secondary-btn clear-doodle-btn" data-canvas-id="${canvasId}" style="font-size: 0.8rem; padding: 0.25rem 0.6rem;">Wipe Cipher</button>
      </div>
      <canvas id="${canvasId}" width="800" height="200" style="background: #fdfbf7; border: 1px solid #d6c098; width: 100%; cursor: crosshair; touch-action: none; display: block;"></canvas>
      <div style="font-size: 0.75rem; color: #7c6d57; margin-top: 0.4rem; font-style: italic;">
        Iconic "Dancing Men" cipher template loaded. Draw or modify stick figures to pass secret messages.
      </div>
    </div>
  `;
}

function attachDoodleCanvasListeners(target) {
  target.querySelectorAll('canvas[id^="doodle-canvas-"]').forEach(canvas => {
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    const savedData = localStorage.getItem(canvas.id);
    if (savedData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = savedData;
    } else {
      drawDancingMenTemplate(ctx);
      localStorage.setItem(canvas.id, canvas.toDataURL());
    }

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    };

    const startDraw = (e) => {
      isDrawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    };

    const draw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);

      ctx.strokeStyle = '#2b1e10';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();

      lastX = pos.x;
      lastY = pos.y;
    };

    const stopDraw = () => {
      if (!isDrawing) return;
      isDrawing = false;
      localStorage.setItem(canvas.id, canvas.toDataURL());
    };

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseout', stopDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDraw);
  });

  target.querySelectorAll('.clear-doodle-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const canvasId = e.target.getAttribute('data-canvas-id');
      const canvas = document.getElementById(canvasId);
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawDancingMenTemplate(ctx);
        localStorage.setItem(canvasId, canvas.toDataURL());
      }
    });
  });
}


/* ================================================================= *
 * 3. MISSION PREPARATION VIEW MODULE                                *
 * ================================================================= */

export function renderPrepareMissionView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';
  const agencyPrefix = isYuri ? 'yuri' : 'wise';

  let projects = getAgencyProjects(agency);
  const rawIndex = getCurrentProjectIndex() || 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;

  if (!projects[activeIndex]) {
    projects[activeIndex] = {
      name: isYuri ? 'SSS Surveillance Operation' : 'WISE Operations',
      missions: [],
      generalPreparation: { keyTakeaways: '', briefingScript: '' }
    };
  }

  const activeProject = projects[activeIndex];
  const missions = Array.isArray(activeProject.missions) ? activeProject.missions : [];
  const generalPrep = activeProject.generalPreparation || { keyTakeaways: '', briefingScript: '' };

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      ${renderAgencySwitcher('prep', isYuri)}

      <p style="background: #f7f1e1; padding: 0.8rem; border: 1px solid #9c8a6b; border-left: 4px solid #8b1e1e; margin: 0;">
        🎯 <strong>Mission Preparation Hub (${isYuri ? 'SSS Bureau' : 'WISE HQ'}):</strong> Keep the objective simple. What are the three things about this mission that everyone should remember? Write the script first.
      </p>

      <div style="background: #f7f1e1; border: 1px solid #9c8a6b; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #8b1e1e; border-bottom: 2px solid #d6c098; padding-bottom: 0.3rem;">
          🌐 General Operation Briefing & Strategy (${isYuri ? 'SSS Bureau' : 'WISE HQ'})
        </h3>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
          <div>
            <label style="font-size: 0.85rem; font-weight: bold;">3 Core Takeaways:</label>
            <input type="text" id="general-prep-takeaways" value="${generalPrep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem;" />
          </div>
          <div>
            <label style="font-size: 0.85rem; font-weight: bold;">Briefing Script / Strategy:</label>
            <textarea id="general-prep-script" rows="3" placeholder="Write the script first..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem;">${generalPrep.briefingScript || ''}</textarea>
          </div>
          <button type="button" id="save-general-prep-btn" class="secondary-btn" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem;">Save General Briefing</button>
        </div>
      </div>
  `;

  if (missions.length === 0) {
    html += `
      <div style="background: #f7f1e1; border: 1px solid #9c8a6b; padding: 1.2rem; text-align: center; color: #7c6d57; font-style: italic;">
        No active missions recorded for this operation dossier yet. Add missions in the main dossier to prep them individually.
      </div>
    `;
  } else {
    missions.forEach((m, index) => {
      const prep = m.preparation || { keyTakeaways: '', briefingScript: '' };
      html += `
        <div style="background: #f7f1e1; border: 1px solid #9c8a6b; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #8b1e1e; border-bottom: 2px solid #d6c098; padding-bottom: 0.3rem;">
            🎯 Mission: ${m.title}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
            <div>
              <label style="font-size: 0.85rem; font-weight: bold;">3 Core Takeaways:</label>
              <input type="text" id="tab-prep-takeaways-${index}" value="${prep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem;" />
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: bold;">Briefing Script / Strategy:</label>
              <textarea id="tab-prep-script-${index}" rows="3" placeholder="Write the script first..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem;">${prep.briefingScript || ''}</textarea>
            </div>
            <button type="button" class="secondary-btn save-tab-prep-btn" data-index="${index}" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem;">Save Mission Briefing</button>
          </div>
        </div>
      `;
    });
  }

  html += renderDancingMenDoodleSection(agencyPrefix);
  html += `</div>`;
  target.innerHTML = html;

  attachDoodleCanvasListeners(target);
  attachAgencySwitcherListeners(target, 'prep', renderCallback);

  const saveGeneralBtn = target.querySelector('#save-general-prep-btn');
  if (saveGeneralBtn) {
    saveGeneralBtn.addEventListener('click', () => {
      const keyTakeaways = document.getElementById('general-prep-takeaways').value.trim();
      const briefingScript = document.getElementById('general-prep-script').value.trim();

      const freshProjects = getAgencyProjects(agency);
      if (!freshProjects[activeIndex]) {
        freshProjects[activeIndex] = {
          name: isYuri ? 'SSS Surveillance Operation' : 'WISE Operations',
          missions: []
        };
      }

      freshProjects[activeIndex].generalPreparation = { keyTakeaways, briefingScript };
      saveAgencyProjects(agency, freshProjects);

      alert('🎯 General operational briefing successfully saved!');
      if (typeof renderCallback === 'function') renderCallback();
      else renderApp();
    });
  }

  target.querySelectorAll('.save-tab-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = Number(e.target.getAttribute('data-index'));
      const keyTakeaways = document.getElementById(`tab-prep-takeaways-${mIdx}`).value.trim();
      const briefingScript = document.getElementById(`tab-prep-script-${mIdx}`).value.trim();

      const freshProjects = getAgencyProjects(agency);
      if (freshProjects[activeIndex] && freshProjects[activeIndex].missions[mIdx]) {
        freshProjects[activeIndex].missions[mIdx].preparation = { keyTakeaways, briefingScript };
        saveAgencyProjects(agency, freshProjects);
      }

      alert('🎯 Mission preparation briefing successfully saved!');
      if (typeof renderCallback === 'function') renderCallback();
      else renderApp();
    });
  });
}


/* ================================================================= *
 * 4. CALENDAR VIEW MODULE                                           *
 * ================================================================= */

export function renderCalendarGridView(container, monthStart, monthEnd, daysInMonth, startDayOfWeek, isSameDay, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';
  const projects = getAgencyProjects(agency);

  const activeProject = projects[getCurrentProjectIndex()] || projects[0];
  const missions = activeProject && Array.isArray(activeProject.missions) ? activeProject.missions : [];

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      ${renderAgencySwitcher('cal', isYuri)}

      <div class="calendar-grid-wrapper">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-family: 'Anton', sans-serif; margin-bottom: 0.5rem; background: #d6c098; padding: 0.4rem; border: 1px solid #8c7a5b;">
          <div style="color: #8b1e1e;">Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
  `;

  for (let i = 0; i < startDayOfWeek; i++) {
    html += `<div style="background: rgba(0,0,0,0.03); min-height: 80px; border: 1px dashed #9c8a6b; opacity: 0.3;"></div>`;
  }

  daysInMonth.forEach(day => {
    const isToday = isSameDay(day, new Date());
    const dayMissions = missions.filter(m => m.dueDate && isSameDay(parseISO(m.dueDate), day));

    let missionsHtml = '';
    dayMissions.forEach(m => {
      missionsHtml += `<div style="font-size: 0.75rem; background: #eedcb9; padding: 1px 3px; margin-top: 2px; border-left: 2px solid #8b1e1e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.title}">${m.title}</div>`;
    });

    html += `
      <div style="background: ${isToday ? '#fae6e6' : '#f7f1e1'}; border: 1px solid #9c8a6b; min-height: 90px; padding: 0.3rem; display: flex; flex-direction: column; justify-content: flex-start;">
        <div style="font-weight: bold; font-size: 0.85rem; border-bottom: 1px solid #d6c098; margin-bottom: 0.2rem; color: ${isToday ? '#8b1e1e' : '#2b1e10'};">${format(day, 'd')}</div>
        ${missionsHtml}
      </div>
    `;
  });

  html += `</div></div></div>`;
  target.innerHTML = html;

  attachAgencySwitcherListeners(target, 'cal', renderCallback);
}


/* ================================================================= *
 * 5. TABLE VIEW MODULE                                              *
 * ================================================================= */

export function renderTableView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';
  const projects = getAgencyProjects(agency);

  const rawIndex = getCurrentProjectIndex() || 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;
  const activeProject = projects[activeIndex];
  const missions = activeProject && Array.isArray(activeProject.missions) ? activeProject.missions : [];

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      ${renderAgencySwitcher('table', isYuri)}
  `;

  if (missions.length === 0) {
    html += `<p class="no-missions" style="text-align: center; color: #7c6d57; font-style: italic;">No missions recorded for ${isYuri ? 'SSS Bureau' : 'WISE HQ'} table view.</p></div>`;
    target.innerHTML = html;
  } else {
    html += `
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; background: #f7f1e1; border: 1px solid #8c7a5b;">
          <thead>
            <tr style="background: #d6c098; border-bottom: 2px solid #8c7a5b; text-align: left; font-family: 'Anton', sans-serif;">
              <th style="padding: 8px;">Status</th>
              <th style="padding: 8px;">Title</th>
              <th style="padding: 8px;">Category</th>
              <th style="padding: 8px;">Threat</th>
              <th style="padding: 8px;">Deadline</th>
            </tr>
          </thead>
          <tbody>
    `;

    missions.forEach((m, idx) => {
      html += `
        <tr style="border-bottom: 1px solid #d6c098;">
          <td style="padding: 8px;"><input type="checkbox" data-index="${idx}" class="accomplished-checkbox" ${m.accomplished ? 'checked' : ''} /></td>
          <td style="padding: 8px; font-weight: bold; ${m.accomplished ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${m.title}</td>
          <td style="padding: 8px;">${m.category || 'Mission'}</td>
          <td style="padding: 8px;">${m.threatLevel}</td>
          <td style="padding: 8px;">${m.dueDate || 'None'}</td>
        </tr>
      `;
    });

    html += `</tbody></table></div></div>`;
    target.innerHTML = html;

    target.querySelectorAll('.accomplished-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const mIdx = Number(e.target.getAttribute('data-index'));
        const freshProjects = getAgencyProjects(agency);
        if (freshProjects[activeIndex] && freshProjects[activeIndex].missions[mIdx]) {
          freshProjects[activeIndex].missions[mIdx].accomplished = e.target.checked;
          saveAgencyProjects(agency, freshProjects);
          if (typeof renderCallback === 'function') renderCallback();
          else renderApp();
        }
      });
    });
  }

  attachAgencySwitcherListeners(target, 'table', renderCallback);
}


/* ================================================================= *
 * 6. DEVELOPER & AUTOMATIONS VIEW MODULES                           *
 * ================================================================= */

export function renderDeveloperView(container) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const config = getCommsConfig();
  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; background: #f7f1e1; padding: 1.2rem; border: 1px solid #8c7a5b;">
      <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; color: #8b1e1e;">💻 Model Context Protocol (MCP) & API Config</h3>
      <p style="font-size: 0.85rem; color: #5c4d37;">Connect your local AI assistants and MCP servers directly to your classified dossiers.</p>
      
      <div class="form-group">
        <label>MCP Endpoint URL</label>
        <input type="text" id="dev-mcp-endpoint" value="${config.mcpEndpoint || ''}" style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Secure API Token</label>
        <input type="text" id="dev-api-token" value="${config.apiKey || ''}" style="width: 100%; padding: 0.4rem;" />
      </div>
      <button type="button" id="save-dev-config-btn" class="primary-btn dossier-btn" style="align-self: flex-start; padding: 0.4rem 1rem;">Save Developer Config</button>
    </div>
  `;

  const saveBtn = target.querySelector('#save-dev-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const mcpEndpoint = target.querySelector('#dev-mcp-endpoint').value;
      const apiKey = target.querySelector('#dev-api-token').value;
      const current = getCommsConfig();
      current.mcpEndpoint = mcpEndpoint;
      current.apiKey = apiKey;
      saveCommsConfig(current);
      alert('💻 Developer configuration successfully saved!');
    });
  }
}

export function renderAutomationsView(container) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const config = getCommsConfig();
  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; background: #f7f1e1; padding: 1.2rem; border: 1px solid #8c7a5b;">
      <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; color: #8b1e1e;">⚡ Messaging Relays (Telegram & Discord)</h3>
      <p style="font-size: 0.85rem; color: #5c4d37;">Configure your external handler notifications and webhook bots.</p>

      <div class="form-group">
        <label>Telegram Bot Token</label>
        <input type="text" id="comms-tg-token" value="${config.telegramToken || ''}" placeholder="123456:ABC-DEF..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Telegram Chat ID</label>
        <input type="text" id="comms-tg-chat" value="${config.telegramChatId || ''}" placeholder="-100..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Discord Webhook URL</label>
        <input type="text" id="comms-discord" value="${config.discordWebhook || ''}" placeholder="https://discord.com/api/webhooks/..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <button type="button" id="save-comms-config-btn" class="primary-btn dossier-btn" style="align-self: flex-start; padding: 0.4rem 1rem;">Save Relays</button>
    </div>
  `;

  const saveBtn = target.querySelector('#save-comms-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const telegramToken = target.querySelector('#comms-tg-token').value;
      const telegramChatId = target.querySelector('#comms-tg-chat').value;
      const discordWebhook = target.querySelector('#comms-discord').value;
      const current = getCommsConfig();
      current.telegramToken = telegramToken;
      current.telegramChatId = telegramChatId;
      current.discordWebhook = discordWebhook;
      saveCommsConfig(current);
      alert('⚡ Comms relay configuration successfully saved!');
    });
  }
}