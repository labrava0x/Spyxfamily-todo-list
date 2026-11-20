import { getCurrentProjectIndex } from '../storage.js';
import {
  renderAgencySwitcher,
  resolveTargetContainer,
  getActiveAgency,
  setActiveAgency,
  getAgencyProjects,
  saveAgencyProjects,
  attachAgencySwitcherListeners
} from './agency.switcher.js';
import {
  renderDancingMenDoodleSection,
  attachDoodleCanvasListeners,
  attachPrepareDictationButtons
} from './renderer.js';
import {
  normalizeAgencyKey,
  saveAndSyncAgencyPrep
} from './agency.sync.js';

/* ================================================================= *
- INSIGHTS VIEW MODULE                                              *
- ================================================================= */
export function renderInsightsView(container, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = normalizeAgencyKey(getActiveAgency());
  const isYuri = agency === 'SSS';

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
      const selected = normalizeAgencyKey(btn.getAttribute('data-agency'));
      if (selected && selected !== normalizeAgencyKey(getActiveAgency())) {
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

  const agency = normalizeAgencyKey(getActiveAgency());
  const isYuri = agency === 'SSS';
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
      generalPreparation: { keyTakeaways: '', briefingScript: '' },
      adHocPreparation: { keyTakeaways: '', briefingScript: '' }
    };
    saveAgencyProjects(agency, projects);
  }

  const activeProject = projects[activeIndex];
  let missions = Array.isArray(activeProject.missions) ? activeProject.missions : [];

  if (agency === 'WISE') {
    missions = missions.filter(m => !m.title || !m.title.toLowerCase().includes('monitor twilight'));
  }

  const generalPrep = activeProject.generalPreparation || { keyTakeaways: '', briefingScript: '' };
  const adHocPrep = activeProject.adHocPreparation || { keyTakeaways: '', briefingScript: '' };

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem; width: 100%; box-sizing: border-box;">
      ${renderAgencySwitcher('prep', isYuri)}

      <p style="background: #ffb6c1; padding: 0.8rem; border: 1px solid #db7093; border-left: 4px solid #10b981; color: #10b981; font-weight: bold; margin: 0; box-sizing: border-box;">
        🎯 Mission Preparation Hub (${isYuri ? 'SSS Bureau' : 'WISE HQ'}): Keep the objective simple. What are the three things about this mission that everyone should remember? Write the script first.
      </p>

      <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); box-sizing: border-box; overflow: hidden;">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">
          🌐 General Operation Briefing & Strategy (${isYuri ? 'SSS Bureau' : 'WISE HQ'})
        </h3>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
          <div>
            <label for="general-prep-takeaways" style="font-size: 0.85rem; font-weight: bold; color: #10b981;">3 Core Takeaways:</label>
            <input type="text" id="general-prep-takeaways" value="${generalPrep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;" />
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.25rem;">
              <label for="general-prep-script" style="font-size: 0.85rem; font-weight: bold; color: #10b981;">Briefing Script / Strategy:</label>
              <button type="button" id="voice-dictate-general-prep-btn" class="secondary-btn" aria-pressed="false" style="padding: 0.25rem 0.65rem; font-size: 0.8rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer; flex-shrink: 0;">🎙️ Voice Dictate</button>
            </div>
            <textarea id="general-prep-script" rows="3" placeholder="Write the script first..." style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;">${generalPrep.briefingScript || ''}</textarea>
          </div>
          <button type="button" id="save-general-prep-btn" class="secondary-btn" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer;">Save General Briefing</button>
        </div>
      </div>
  `;

  if (missions.length === 0) {
    html += `
      <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); box-sizing: border-box; overflow: hidden;">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">
          🎯 Proactive / Unassigned Field Prep (No Active Mission Required)
        </h3>
        <div style="font-size: 0.8rem; color: #581c87; font-style: italic; margin-bottom: 0.6rem;">
          No assigned missions in this dossier right now—draft cover stories, contingency drills, or recon notes ahead of time.
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
          <div>
            <label for="adhoc-prep-takeaways" style="font-size: 0.85rem; font-weight: bold; color: #10b981;">3 Core Takeaways:</label>
            <input type="text" id="adhoc-prep-takeaways" value="${adHocPrep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;" />
          </div>
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.25rem;">
              <label for="adhoc-prep-script" style="font-size: 0.85rem; font-weight: bold; color: #10b981;">Field Prep / Contingency Script:</label>
              <button type="button" id="voice-dictate-adhoc-prep-btn" class="secondary-btn" aria-pressed="false" style="padding: 0.25rem 0.65rem; font-size: 0.8rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer; flex-shrink: 0;">🎙️ Voice Dictate</button>
            </div>
            <textarea id="adhoc-prep-script" rows="3" placeholder="Draft contingency steps, cover details, or recon notes..." style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;">${adHocPrep.briefingScript || ''}</textarea>
          </div>
          <button type="button" id="save-adhoc-prep-btn" class="secondary-btn" style="align-self: flex-start; padding: 0.4rem 1rem; font-size: 0.85rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer;">Save Field Prep</button>
        </div>
      </div>
    `;
  } else {
    missions.forEach((m, index) => {
      const prep = m.preparation || { keyTakeaways: '', briefingScript: '' };
      html += `
        <div style="background: #ffb6c1; border: 1px solid #db7093; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1); box-sizing: border-box; overflow: hidden;">
          <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 0.3rem;">
            🎯 Mission: ${m.title}
          </h3>
          <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.8rem;">
            <div>
              <label for="tab-prep-takeaways-${index}" style="font-size: 0.85rem; font-weight: bold; color: #10b981;">3 Core Takeaways:</label>
              <input type="text" id="tab-prep-takeaways-${index}" value="${prep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;" />
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.25rem;">
                <label for="tab-prep-script-${index}" style="font-size: 0.85rem; font-weight: bold; color: #10b981;">Briefing Script / Strategy:</label>
                <button type="button" class="secondary-btn voice-dictate-mission-prep-btn" data-index="${index}" aria-pressed="false" style="padding: 0.25rem 0.65rem; font-size: 0.8rem; background: #10b981; color: #12151c; border: 1px solid #059669; cursor: pointer; flex-shrink: 0;">🎙️ Voice Dictate</button>
              </div>
              <textarea id="tab-prep-script-${index}" rows="3" placeholder="Write the script first..." style="width: 100%; box-sizing: border-box; font-size: 0.9rem; padding: 0.4rem; background: #fff5f6; border: 1px solid #db7093;">${prep.briefingScript || ''}</textarea>
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
  attachPrepareDictationButtons(target);

  // Also ensure #voice-dictate-adhoc-prep-btn works even if renderer.js only lists general/mission buttons
  const adHocDictateBtn = target.querySelector('#voice-dictate-adhoc-prep-btn');
  const adHocScriptEl = target.querySelector('#adhoc-prep-script');
  if (adHocDictateBtn && adHocScriptEl) {
    const SpeechRec =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition || null
        : null;

    let adHocRecognizer = null;
    const stopAdHocRec = () => {
      if (adHocRecognizer) {
        try {
          adHocRecognizer.stop();
        } catch (_) {
          // Ignore already stopped recognizer
        }
        adHocRecognizer = null;
      }
      adHocDictateBtn.textContent = '🎙️ Voice Dictate';
      adHocDictateBtn.style.background = '#10b981';
      adHocDictateBtn.style.color = '#12151c';
      adHocDictateBtn.setAttribute('aria-pressed', 'false');
    };

    adHocDictateBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (adHocRecognizer) {
        stopAdHocRec();
        return;
      }

      if (!SpeechRec) {
        alert('🎙️ Voice dictation is not supported in this browser.');
        return;
      }

      const rec = new SpeechRec();
      rec.lang = navigator.language || 'en-US';
      rec.interimResults = false;
      rec.maxAlternatives = 1;
      adHocRecognizer = rec;

      adHocDictateBtn.textContent = '⏹️ Listening...';
      adHocDictateBtn.style.background = '#8b1e1e';
      adHocDictateBtn.style.color = '#fff8f5';
      adHocDictateBtn.setAttribute('aria-pressed', 'true');

      rec.onresult = (event) => {
        let spoken = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal) {
            spoken += event.results[i][0].transcript;
          }
        }
        const cleaned = spoken.trim();
        if (cleaned) {
          const currentVal = adHocScriptEl.value || '';
          const sep = currentVal.length > 0 && !/\s$/.test(currentVal) ? ' ' : '';
          adHocScriptEl.value = `${currentVal}${sep}${cleaned}`;
          adHocScriptEl.dispatchEvent(new Event('input', { bubbles: true }));
          adHocScriptEl.focus();
        }
      };

      rec.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Field prep dictation error:', event.error);
        }
        stopAdHocRec();
      };

      rec.onend = () => {
        stopAdHocRec();
      };

      try {
        rec.start();
      } catch (_) {
        stopAdHocRec();
      }
    });
  }

  const saveGeneralBtn = target.querySelector('#save-general-prep-btn');
  if (saveGeneralBtn) {
    saveGeneralBtn.addEventListener('click', () => {
      const keyTakeaways = document.getElementById('general-prep-takeaways').value.trim();
      const briefingScript = document.getElementById('general-prep-script').value.trim();

      saveAndSyncAgencyPrep({
        keyTakeaways,
        briefingScript,
        mode: 'general',
        agency
      });

      alert('🎯 General operational briefing successfully saved!');
      if (typeof renderCallback === 'function') renderCallback();
    });
  }

  const saveAdHocBtn = target.querySelector('#save-adhoc-prep-btn');
  if (saveAdHocBtn) {
    saveAdHocBtn.addEventListener('click', () => {
      const keyTakeaways = document.getElementById('adhoc-prep-takeaways').value.trim();
      const briefingScript = document.getElementById('adhoc-prep-script').value.trim();

      saveAndSyncAgencyPrep({
        keyTakeaways,
        briefingScript,
        mode: 'adhoc',
        agency
      });

      alert('🎯 Proactive field preparation saved!');
      if (typeof renderCallback === 'function') renderCallback();
    });
  }

  target.querySelectorAll('.save-tab-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = Number(e.target.getAttribute('data-index'));
      const keyTakeaways = document.getElementById(`tab-prep-takeaways-${mIdx}`).value.trim();
      const briefingScript = document.getElementById(`tab-prep-script-${mIdx}`).value.trim();

      saveAndSyncAgencyPrep({
        keyTakeaways,
        briefingScript,
        mode: 'mission',
        missionIndex: mIdx,
        agency
      });

      alert('🎯 Mission preparation briefing successfully saved!');
      if (typeof renderCallback === 'function') renderCallback();
    });
  });
}