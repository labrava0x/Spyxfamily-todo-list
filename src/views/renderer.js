import { getCurrentProjectIndex, getProjects } from '../storage.js';
import {
  renderAgencySwitcher,
  resolveTargetContainer,
  getActiveAgency,
  setActiveAgency,
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
        <button type="button" class="secondary-btn clear-doodle-btn" data-canvas-id="${canvasId}" style="font-size: 0.8rem; padding: 0.25rem 0.6rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer;">Wipe Cipher</button>
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

  const agency = getActiveAgency();
  const isYuri = agency === 'SSS' || agency === 'yuri';

  const projects = getAgencyProjects(agency) || [];
  const rawIndex = getCurrentProjectIndex() || 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;
  const activeProject = projects[activeIndex] || {
    name: isYuri ? 'SSS Operations (Yuri)' : 'WISE Operations',
    missions: []
  };

  const missions = Array.isArray(activeProject.missions) ? activeProject.missions : [];
  const totalCount = missions.length;
  const completedCount = missions.filter(m => Boolean(m.accomplished)).length;
  const activeCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const highThreatCount = missions.filter(m => {
    const lvl = String(m.threatLevel || m.threat || m.priority || '').toLowerCase();
    return lvl === 'high' || lvl === 'critical';
  }).length;

  target.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem;">
      <div style="display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center;">
        <button
          type="button"
          class="insights-agency-tab"
          data-agency="WISE"
          style="padding: 0.5rem 1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.03em; cursor: pointer; border: 1px solid #059669 !important; background: #10b981 !important; color: #12151c !important; ${!isYuri ? 'outline: 2px solid #064e3b;' : ''} box-shadow: 2px 2px 0px rgba(0,0,0,0.12);"
        >
          🕵️ WISE HQ
        </button>
        <button
          type="button"
          class="insights-agency-tab"
          data-agency="SSS"
          style="padding: 0.5rem 1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.03em; cursor: pointer; border: 1px solid #059669 !important; background: #10b981 !important; color: #12151c !important; ${isYuri ? 'outline: 2px solid #064e3b;' : ''} box-shadow: 2px 2px 0px rgba(0,0,0,0.12);"
        >
          🛡️ SSS BUREAU
        </button>
      </div>

      <div style="background: #ffb6c1; border: 1px solid #db7093; border-left: 5px solid #10b981; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="color: #10b981; font-family: 'Anton', sans-serif; margin-top: 0; border-bottom: 2px solid #10b981; padding-bottom: 0.35rem;">
          📊 Insights & Telemetry — ${isYuri ? 'SSS BUREAU' : 'WISE HQ'} (${activeProject.name})
        </h3>
        <p style="color: #111827; font-size: 0.85rem; margin: 0.4rem 0 1rem;">
          Live operational metrics computed from your active dossier missions.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.85rem;">
          <div style="background: #fff5f6; border: 1px solid #db7093; border-left: 4px solid #10b981; padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: #065f46; font-weight: bold;">TOTAL MISSIONS</div>
            <div style="font-size: 1.4rem; font-weight: bold; color: #111827; margin-top: 0.2rem;">${totalCount}</div>
          </div>

          <div style="background: #fff5f6; border: 1px solid #db7093; border-left: 4px solid #10b981; padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: #065f46; font-weight: bold;">ACTIVE</div>
            <div style="font-size: 1.4rem; font-weight: bold; color: #111827; margin-top: 0.2rem;">${activeCount}</div>
          </div>

          <div style="background: #fff5f6; border: 1px solid #db7093; border-left: 4px solid #10b981; padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: #065f46; font-weight: bold;">ACCOMPLISHED</div>
            <div style="font-size: 1.4rem; font-weight: bold; color: #111827; margin-top: 0.2rem;">${completedCount} (${completionRate}%)</div>
          </div>

          <div style="background: #fff5f6; border: 1px solid #db7093; border-left: 4px solid #10b981; padding: 0.75rem;">
            <div style="font-size: 0.75rem; color: #065f46; font-weight: bold;">HIGH / CRITICAL</div>
            <div style="font-size: 1.4rem; font-weight: bold; color: #991b1b; margin-top: 0.2rem;">${highThreatCount}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  target.querySelectorAll('.insights-agency-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-agency');
      if (selected && selected !== getActiveAgency()) {
        setActiveAgency(selected);
        if (typeof renderCallback === 'function') {
          renderCallback();
        } else {
          renderInsightsView(container, renderCallback);
        }
      }
    });
  });
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
          <button type="button" id="save-general-prep-btn" class="secondary-btn" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer;">Save General Briefing</button>
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
            <button type="button" class="secondary-btn save-tab-prep-btn" data-index="${index}" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer;">Save Mission Briefing</button>
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