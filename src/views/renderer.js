import { getCurrentProjectIndex } from '../storage.js';
import {
  renderAgencySwitcher,
  resolveTargetContainer,
  getActiveAgency,
  getAgencyProjects,
  saveAgencyProjects,
  attachAgencySwitcherListeners
} from './agency.switcher.js';

/* ================================================================= *
- CIPHER & DOODLE CANVAS HELPERS                                    *
- ================================================================= */

function drawDancingMenTemplate(ctx) {
  ctx.strokeStyle = '#10b981';
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
    <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); margin-top: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem; margin-bottom: 0.8rem;">
        <h3 style="margin: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #10b981;">
          🕵️ Cipher & Doodle
        </h3>
        <button type="button" class="secondary-btn clear-doodle-btn" data-canvas-id="${canvasId}" style="font-size: 0.8rem; padding: 0.25rem 0.6rem; background: #10b981; color: #fff; border: 1px solid #059669; cursor: pointer;">Wipe Cipher</button>
      </div>
      <canvas id="${canvasId}" width="800" height="200" style="background: #ffffff; border: 1px solid #db7093; width: 100%; cursor: crosshair; touch-action: none; display: block;"></canvas>
      <div style="font-size: 0.75rem; color: #581c87; margin-top: 0.4rem; font-style: italic;">
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
- INSIGHTS VIEW MODULE                                              *
- ================================================================= */

export function renderInsightsView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; background: #ffb6c1; border: 1px solid #db7093; padding: 1.5rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
      <h3 style="color: #10b981; font-family: 'Anton', sans-serif; margin-top: 0; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">📊 Insights & Telemetry</h3>
      <p style="color: #10b981; font-weight: bold;">Mission telemetry analysis module is currently calibrating data packets...</p>
    </div>
  `;
}

/* ================================================================= *
- MISSION PREPARATION VIEW MODULE                                   *
- ================================================================= */

export function renderPrepareMissionView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';
  const agencyPrefix = isYuri ? 'yuri' : 'wise';

  let projects = getAgencyProjects(agency);
  if (!Array.isArray(projects)) projects = [];

  let rawIndex = getCurrentProjectIndex() || 0;
  if (rawIndex >= projects.length) rawIndex = 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;

  if (!projects[activeIndex]) {
    projects[activeIndex] = {
      name: isYuri ? 'SSS Surveillance Operation' : 'WISE Operations',
      missions: [],
      generalPreparation: { keyTakeaways: '', briefingScript: '' }
    };
  }

  const activeProject = projects[activeIndex];
  let missions = Array.isArray(activeProject.missions) ? activeProject.missions : [];

  if (agency === 'wise') {
    missions = missions.filter(m => !m.title || !m.title.toLowerCase().includes('monitor twilight'));
  }

  const generalPrep = activeProject.generalPreparation || { keyTakeaways: '', briefingScript: '' };

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      ${renderAgencySwitcher('prep', isYuri)}

      <p style="background: #ffb6c1; padding: 0.8rem; border: 1px solid #db7093; border-left: 4px solid #10b981; color: #10b981; font-weight: bold; margin: 0;">
        🎯 Mission Preparation Hub (${isYuri ? 'SSS Bureau' : 'WISE HQ'}): Keep the objective simple. What are the three things about this mission that everyone should remember? Write the script first.
      </p>

      <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">
          🌐 General Operation Briefing & Strategy (${isYuri ? 'SSS Bureau' : 'WISE HQ'})
        </h3>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
          <div>
            <label style="font-size: 0.85rem; font-weight: bold; color: #10b981;">3 Core Takeaways:</label>
            <input type="text" id="general-prep-takeaways" value="${generalPrep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;" />
          </div>
          <div>
            <label style="font-size: 0.85rem; font-weight: bold; color: #10b981;">Briefing Script / Strategy:</label>
            <textarea id="general-prep-script" rows="3" placeholder="Write the script first..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;">${generalPrep.briefingScript || ''}</textarea>
          </div>
          <button type="button" id="save-general-prep-btn" class="secondary-btn" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem; background: #10b981; color: #fff; border: 1px solid #059669; cursor: pointer;">Save General Briefing</button>
        </div>
      </div>
  `;

  if (missions.length === 0) {
    html += `
      <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 1.2rem; text-align: center; color: #581c87; font-style: italic;">
        No active missions recorded for this operation dossier yet. Add missions in the main dossier to prep them individually.
      </div>
    `;
  } else {
    missions.forEach((m, index) => {
      const prep = m.preparation || { keyTakeaways: '', briefingScript: '' };
      html += `
        <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
          <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">
            🎯 Mission: ${m.title}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
            <div>
              <label style="font-size: 0.85rem; font-weight: bold; color: #10b981;">3 Core Takeaways:</label>
              <input type="text" id="tab-prep-takeaways-${index}" value="${prep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;" />
            </div>
            <div>
              <label style="font-size: 0.85rem; font-weight: bold; color: #10b981;">Briefing Script / Strategy:</label>
              <textarea id="tab-prep-script-${index}" rows="3" placeholder="Write the script first..." style="width: 100%; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;">${prep.briefingScript || ''}</textarea>
            </div>
            <button type="button" class="secondary-btn save-tab-prep-btn" data-index="${index}" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem; background: #10b981; color: #fff; border: 1px solid #059669; cursor: pointer;">Save Mission Briefing</button>
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
    });
  });
}

/* ================================================================= *
- TABLE LOG VIEW MODULE                                             *
- ================================================================= */

function getThreatStyle(threat = 'Medium') {
  const level = String(threat).toLowerCase();
  if (level === 'high' || level === 'critical') {
    return 'background: #fee2e2; color: #991b1b; border: 1px solid #ef4444;';
  }
  if (level === 'low') {
    return 'background: #d1fae5; color: #065f46; border: 1px solid #10b981;';
  }
  return 'background: #fef3c7; color: #92400e; border: 1px solid #f59e0b;';
}

export function renderTableView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';

  let projects = getAgencyProjects(agency);
  if (!Array.isArray(projects)) projects = [];

  let rawIndex = getCurrentProjectIndex() || 0;
  if (rawIndex >= projects.length) rawIndex = 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;

  const activeProject = projects[activeIndex] || {
    name: isYuri ? 'SSS Surveillance Operation' : 'WISE Operations',
    missions: []
  };

  const missions = Array.isArray(activeProject.missions) ? activeProject.missions : [];

  const rowsHtml = missions.length === 0
    ? `
      <tr>
        <td colspan="5" style="padding: 1.25rem; text-align: center; background: #fff5f6; color: #581c87; font-style: italic;">
          No table entries recorded yet.
        </td>
      </tr>
    `
    : missions.map((mission, idx) => {
        const done = Boolean(mission.accomplished);
        const title = mission.title || 'Untitled Mission';
        const category = mission.category || 'Mission';
        const threat = mission.threat || mission.priority || 'Medium';
        const deadline = mission.deadline || mission.dueDate || '—';

        return `
          <tr style="background: ${idx % 2 === 0 ? '#fff5f6' : '#ffe4e9'}; border-bottom: 1px solid #db7093;">
            <td style="padding: 0.7rem 0.85rem; text-align: center;">
              <input
                type="checkbox"
                class="accomplished-checkbox"
                data-index="${idx}"
                ${done ? 'checked' : ''}
                style="accent-color: #10b981; width: 16px; height: 16px; cursor: pointer;"
              />
            </td>
            <td style="padding: 0.7rem 0.85rem; font-weight: bold; color: #111827; ${done ? 'text-decoration: line-through; opacity: 0.65;' : ''}">
              ${title}
            </td>
            <td style="padding: 0.7rem 0.85rem;">
              <span style="background: #ffb6c1; color: #065f46; border: 1px solid #10b981; padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: bold;">
                ${category}
              </span>
            </td>
            <td style="padding: 0.7rem 0.85rem;">
              <span style="${getThreatStyle(threat)} padding: 0.2rem 0.55rem; border-radius: 4px; font-size: 0.75rem; font-weight: bold;">
                ${threat}
              </span>
            </td>
            <td style="padding: 0.7rem 0.85rem; font-family: monospace; font-size: 0.85rem; color: #374151;">
              ${deadline}
            </td>
          </tr>
        `;
      }).join('');

  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.25rem;">
      ${renderAgencySwitcher('table', isYuri)}

      <div style="background: #ffb6c1; border: 1px solid #db7093; border-left: 5px solid #10b981; padding: 0.9rem 1.2rem;">
        <h3 style="margin: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #10b981;">
          📊 ${isYuri ? 'SSS BUREAU' : 'WISE HQ'} — TABLE LOG
        </h3>
        <p style="margin: 0.35rem 0 0; font-size: 0.85rem; color: #111827;">
          Tabular dossier log for <strong>${activeProject.name}</strong>.
        </p>
      </div>

      <div style="overflow-x: auto; background: #ffb6c1; border: 1px solid #db7093;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="background: #10b981; color: #ffffff; font-family: 'Anton', sans-serif; font-size: 0.85rem;">
              <th style="padding: 0.7rem 0.85rem; width: 64px; text-align: center;">Done</th>
              <th style="padding: 0.7rem 0.85rem;">Title</th>
              <th style="padding: 0.7rem 0.85rem;">Category</th>
              <th style="padding: 0.7rem 0.85rem;">Threat</th>
              <th style="padding: 0.7rem 0.85rem;">Deadline</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
    </div>
  `;

  attachAgencySwitcherListeners(target, 'table', renderCallback);

  target.querySelectorAll('.accomplished-checkbox').forEach((chk) => {
    chk.addEventListener('change', (e) => {
      const idx = Number(e.target.getAttribute('data-index'));
      const freshProjects = getAgencyProjects(agency);
      if (freshProjects[activeIndex] && freshProjects[activeIndex].missions[idx]) {
        freshProjects[activeIndex].missions[idx].accomplished = e.target.checked;
        saveAgencyProjects(agency, freshProjects);
        if (typeof renderCallback === 'function') {
          renderCallback();
        } else {
          renderTableView(container, renderCallback);
        }
      }
    });
  });
}