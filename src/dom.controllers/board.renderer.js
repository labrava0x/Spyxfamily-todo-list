import { getCurrentProjectIndex, toggleMissionStatus, deleteMission } from '../storage.js';
import { getActiveAgency, setActiveAgency, getAgencyProjects, saveAgencyProjects } from '../views/agency.switcher.js';
import { format, parseISO, isPast, differenceInHours } from 'date-fns';

function cleanProjectName(name, fallback = 'Active Dossier') {
  const cleaned = (name || '')
    .replace(/\s*\(\s*yuri\s*\)/gi, '')
    .replace(/\s*-\s*yuri\b/gi, '')
    .replace(/\byuri\b/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned || fallback;
}

export function renderBoardView(container, currentStatusFilter, renderCallback) {
  if (!container) return;
  container.innerHTML = '';

  const agency = getActiveAgency();
  const isYuri = agency === 'SSS' || agency === 'yuri';
  const projects = getAgencyProjects(agency) || [];
  const rawIndex = getCurrentProjectIndex() || 0;
  const currentIndex = projects[rawIndex] ? rawIndex : 0;
  const activeProject = projects[currentIndex];
  const displayProjectName = cleanProjectName(
    activeProject?.name,
    isYuri ? 'SSS Operations' : 'Active Dossier'
  );

  const reRender = () => {
    if (typeof renderCallback === 'function') {
      renderCallback();
    } else {
      renderBoardView(container, currentStatusFilter, renderCallback);
    }
  };

  // Agency Switcher Tabs inside Board View
  const switcherBar = document.createElement('div');
  switcherBar.style.cssText = 'display: flex; flex-wrap: wrap; gap: 0.6rem; align-items: center; margin-bottom: 1rem;';
  switcherBar.innerHTML = `
    <button
      type="button"
      class="board-agency-tab"
      data-agency="WISE"
      style="padding: 0.5rem 1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.03em; cursor: pointer; border: 1px solid #059669 !important; background: #10b981 !important; color: #12151c !important; ${!isYuri ? 'outline: 2px solid #12151c;' : ''} box-shadow: 2px 2px 0px rgba(0,0,0,0.2);"
    >
      🕵️ WISE HQ
    </button>
    <button
      type="button"
      class="board-agency-tab"
      data-agency="SSS"
      style="padding: 0.5rem 1rem; font-family: 'Anton', sans-serif; font-size: 0.9rem; letter-spacing: 0.03em; cursor: pointer; border: 1px solid #059669 !important; background: #10b981 !important; color: #12151c !important; ${isYuri ? 'outline: 2px solid #12151c;' : ''} box-shadow: 2px 2px 0px rgba(0,0,0,0.2);"
    >
      🛡️ SSS BUREAU
    </button>
  `;
  container.appendChild(switcherBar);

  const headerBanner = document.createElement('div');
  headerBanner.style.cssText = 'background: #f4a4b8; color: #12151c; border: 1px solid #db7093; border-left: 5px solid #10b981; padding: 0.75rem 1rem; margin-bottom: 1rem; font-weight: bold;';
  headerBanner.textContent = `📋 MISSION BOARD — ${isYuri ? 'SSS BUREAU' : 'WISE HQ'} (${displayProjectName})`;
  container.appendChild(headerBanner);

  const allMissions = activeProject && Array.isArray(activeProject.missions) ? activeProject.missions : [];

  const filteredMissions = allMissions.filter(mission => {
    if (currentStatusFilter === 'inactive') return !mission.accomplished && mission.dueDate;
    if (currentStatusFilter === 'pending') return !mission.accomplished && mission.dueDate;
    if (currentStatusFilter === 'fulfilled') return mission.accomplished;
    return true;
  });

  if (filteredMissions.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.className = 'no-missions';
    emptyMsg.style.cssText = 'background: #f4a4b8; color: #12151c; border: 1px solid #db7093; padding: 1rem; text-align: center; font-weight: bold;';
    emptyMsg.textContent = allMissions.length === 0
      ? `No missions recorded for ${isYuri ? 'SSS Bureau' : 'WISE HQ'}.`
      : `No missions match the "${currentStatusFilter}" filter.`;
    container.appendChild(emptyMsg);
    attachAgencyTabs(switcherBar, reRender);
    return;
  }

  // Two-column board layout (no tall empty white box)
  const columnsGrid = document.createElement('div');
  columnsGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; align-items: start;';

  const activeCol = document.createElement('div');
  activeCol.style.cssText = 'background: #f4a4b8; border: 1px solid #db7093; border-radius: 4px; padding: 0.75rem; color: #12151c;';

  const doneCol = document.createElement('div');
  doneCol.style.cssText = 'background: #ffb6c1; border: 1px solid #db7093; border-radius: 4px; padding: 0.75rem; color: #12151c;';

  const activeList = document.createElement('div');
  activeList.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.75rem;';

  const doneList = document.createElement('div');
  doneList.style.cssText = 'display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.75rem;';

  let activeCount = 0;
  let doneCount = 0;

  filteredMissions.forEach((mission) => {
    const actualIndex = allMissions.indexOf(mission);
    const card = buildMissionCard(mission, actualIndex);

    if (mission.accomplished) {
      doneCount++;
      doneList.appendChild(card);
    } else {
      activeCount++;
      activeList.appendChild(card);
    }
  });

  activeCol.innerHTML = `<div style="background: #10b981; color: #12151c; padding: 0.5rem 0.75rem; font-weight: bold; border-radius: 3px;">ACTIVE OPERATIONS (${activeCount})</div>`;
  if (activeCount === 0) {
    activeList.innerHTML = `<p style="color: #12151c; font-style: italic; margin: 0.5rem 0;">No active missions in this view.</p>`;
  }
  activeCol.appendChild(activeList);

  doneCol.innerHTML = `<div style="background: #10b981; color: #12151c; padding: 0.5rem 0.75rem; font-weight: bold; border-radius: 3px;">ACCOMPLISHED (${doneCount})</div>`;
  if (doneCount === 0) {
    doneList.innerHTML = `<p style="color: #12151c; font-style: italic; margin: 0.5rem 0;">No accomplished missions yet.</p>`;
  }
  doneCol.appendChild(doneList);

  columnsGrid.appendChild(activeCol);
  columnsGrid.appendChild(doneCol);
  container.appendChild(columnsGrid);

  attachAgencyTabs(switcherBar, reRender);
  attachMissionEventListeners(container, agency, currentIndex, reRender);
}

function buildMissionCard(mission, index) {
  const card = document.createElement('div');
  card.className = `mission-card threat-${(mission.threatLevel || '').toLowerCase()}`;
  if (mission.accomplished) card.classList.add('accomplished');
  card.style.cssText = 'background: #1a0f14; color: #ff9ebb; border: 1px solid #ff9ebb; border-radius: 4px; padding: 0.65rem;';

  let formattedDate = 'No Deadline';
  let bombIndicator = '';

  if (mission.dueDate) {
    try {
      const parsedDate = parseISO(mission.dueDate);
      formattedDate = format(parsedDate, 'PP');

      if (!mission.accomplished) {
        const hoursLeft = differenceInHours(parsedDate, new Date());
        if (hoursLeft < 0 || isPast(parsedDate)) {
          bombIndicator = ` <span class="ticking-bomb bomb-exploding" title="DEADLINE EXCEEDED!">💥 OVERDUE</span>`;
          card.classList.add('mission-danger');
        } else if (hoursLeft <= 72) {
          bombIndicator = ` <span class="ticking-bomb bomb-ticking" title="Deadline creeping in!">⏱ T- ${hoursLeft}h</span>`;
          card.classList.add('mission-warning');
        }
      }
    } catch (e) {
      formattedDate = mission.dueDate;
    }
  } else if (!mission.accomplished) {
    bombIndicator = ` <span class="ticking-bomb" title="No timeline established">⏳ Inactive</span>`;
  }

  let extraBadges = '';
  if (mission.spreadsheet) {
    extraBadges += ` <span class="badge" style="background: #4b6b54; color: #12151c;">📊 ${mission.spreadsheet}</span>`;
  }
  if (mission.attachment) {
    extraBadges += ` <span class="badge" style="background: #3b5b76; color: #12151c;">🔗 Link</span>`;
  }
  if (mission.imageBase64) {
    extraBadges += ` <span class="badge" style="background: #8b6e5e; color: #12151c;">🖼 Image</span>`;
  }

  const headerDiv = document.createElement('div');
  headerDiv.className = 'mission-compact-header';
  headerDiv.innerHTML = `
    <div class="mission-summary-info">
      <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" />
      <span class="mission-title-text" style="${mission.accomplished ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${mission.title}</span>
      <span class="badge threat-badge">${mission.threatLevel || 'Medium'}</span>
      <span class="badge category-badge">${mission.category || 'Mission'}</span>
      <span class="due-date-text">${formattedDate} ${bombIndicator}</span>
      ${extraBadges}
    </div>
    <div class="mission-actions">
      <button type="button" class="expand-btn" data-index="${index}">Expand</button>
      <button type="button" class="delete-mission-btn" data-index="${index}">Delete</button>
    </div>
  `;

  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'mission-details-drawer hidden';
  detailsDiv.id = `details-drawer-${index}`;

  const prep = mission.preparation || { keyTakeaways: '', briefingscript: '' };

  const attachmentHtml = mission.attachment
    ? `<p><strong>Attachment Link:</strong> <a href="${mission.attachment}" target="_blank" style="color: #00bfa5;">Open Link</a></p>`
    : '';
  const imagePreviewHtml = mission.imageBase64
    ? `<div style="margin-top: 0.5rem;"><img src="${mission.imageBase64}" style="max-width: 100%; max-height: 150px; border: 1px solid #ff9ebb; border-radius: 4px;" /></div>`
    : '';

  let commentsHtml = '';
  if (mission.comments && Array.isArray(mission.comments)) {
    mission.comments.forEach(c => {
      commentsHtml += `<div style="background: #fff0f3; padding: 0.3rem 0.5rem; margin-top: 0.3rem; border-left: 3px solid #ff9ebb; font-size: 0.85rem; color: #1a0f14;"><strong>${c.author}:</strong> ${c.text}</div>`;
    });
  }

  detailsDiv.innerHTML = `
    <div class="details-content" style="display: flex; flex-direction: column; gap: 0.8rem; margin-top: 0.6rem;">
      <p><strong>Description:</strong> ${mission.description || 'None'}</p>
      <p><strong>Handler Debrief / Field Notes:</strong> ${mission.notes || 'None'}</p>
      <p><strong>Linked Spreadsheet:</strong> ${mission.spreadsheet || 'None'}</p>
      ${attachmentHtml}
      ${imagePreviewHtml}

      <div class="comments-section" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">
        <strong>Mission Discussion & Handler Notes:</strong>
        <div class="comments-list" style="display: flex; flex-direction: column; gap: 0.3rem;">${commentsHtml}</div>
        <div style="display: flex; gap: 0.4rem; margin-top: 0.3rem;">
          <input type="text" id="comment-input-${index}" placeholder="Add comment or mention handler..." style="flex: 1; font-size: 0.85rem; padding: 0.3rem; border: 1px solid #ff9ebb; background: #ffffff; color: #1a0f14; border-radius: 3px;" />
          <button type="button" class="secondary-btn add-comment-btn" data-index="${index}">Send</button>
        </div>
      </div>

      <div class="prepare-mission-box" style="background: #fff9fb; border: 2px dashed #ff9ebb; padding: 0.8rem; border-radius: 4px; margin-top: 0.5rem;">
        <label style="font-size: 0.8rem; font-weight: bold; color: #1a0f14;">🎯 Core Takeaways:</label>
        <input type="text" id="prep-takeaways-${index}" value="${prep.keyTakeaways || ''}" placeholder="1. ... 2. ..." style="width: 100%; font-size: 0.85rem; padding: 0.3rem; margin-top: 0.2rem; border: 1px solid #ff9ebb; background: #ffffff; color: #1a0f14; border-radius: 3px;" />

        <label style="font-size: 0.8rem; font-weight: bold; color: #1a0f14; display: block; margin-top: 0.5rem;">📜 Briefing Script / Strategy:</label>
        <textarea id="prep-script-${index}" rows="2" placeholder="Draft your script first..." style="width: 100%; font-size: 0.85rem; padding: 0.3rem; margin-top: 0.2rem; border: 1px solid #ff9ebb; background: #ffffff; color: #1a0f14; border-radius: 3px;">${prep.briefingscript || ''}</textarea>

        <button type="button" class="secondary-btn save-prep-btn" data-index="${index}" style="margin-top: 0.5rem; background: #00bfa5; color: #12151c; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-weight: bold;">Save Briefing Strategy</button>
      </div>

      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
        <button type="button" class="secondary-btn test-telegram-btn" data-title="${mission.title}" data-due="${formattedDate}" style="background: #17a2b8; color: #12151c; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">🚀 Telegram Ping</button>
        <button type="button" class="secondary-btn test-discord-btn" data-title="${mission.title}" data-due="${formattedDate}" style="background: #7289da; color: #12151c; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">💬 Discord Relay</button>
      </div>
    </div>
  `;

  card.appendChild(headerDiv);
  card.appendChild(detailsDiv);
  return card;
}

function attachAgencyTabs(switcherBar, reRender) {
  switcherBar.querySelectorAll('.board-agency-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.getAttribute('data-agency');
      if (selected && selected !== getActiveAgency()) {
        setActiveAgency(selected);
        reRender();
      }
    });
  });
}

function attachMissionEventListeners(container, agency, projectIndex, reRender) {
  container.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const drawer = container.querySelector(`#details-drawer-${index}`);
      if (drawer) {
        drawer.classList.toggle('hidden');
        e.target.textContent = drawer.classList.contains('hidden') ? 'Expand' : 'Collapse';
      }
    });
  });

  container.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const index = Number(e.target.getAttribute('data-index'));
      const freshProjects = getAgencyProjects(agency);
      if (freshProjects[projectIndex] && freshProjects[projectIndex].missions[index]) {
        freshProjects[projectIndex].missions[index].accomplished = e.target.checked;
        saveAgencyProjects(agency, freshProjects);
      } else {
        toggleMissionStatus(index);
      }
      reRender();
    });
  });

  container.querySelectorAll('.delete-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.target.getAttribute('data-index'));
      if (confirm('Delete this mission dossier?')) {
        const freshProjects = getAgencyProjects(agency);
        if (freshProjects[projectIndex] && Array.isArray(freshProjects[projectIndex].missions)) {
          freshProjects[projectIndex].missions.splice(index, 1);
          saveAgencyProjects(agency, freshProjects);
        } else {
          deleteMission(index);
        }
        reRender();
      }
    });
  });

  container.querySelectorAll('.save-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.target.getAttribute('data-index'));
      const keyTakeaways = container.querySelector(`#prep-takeaways-${index}`)?.value.trim() || '';
      const briefingscript = container.querySelector(`#prep-script-${index}`)?.value.trim() || '';

      const freshProjects = getAgencyProjects(agency);
      const mission = freshProjects[projectIndex] && freshProjects[projectIndex].missions[index];
      if (mission) {
        mission.preparation = { keyTakeaways, briefingscript };
        saveAgencyProjects(agency, freshProjects);
        alert('Mission preparation briefing successfully saved!');
        reRender();
      }
    });
  });

  container.querySelectorAll('.add-comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = Number(e.target.getAttribute('data-index'));
      const input = container.querySelector(`#comment-input-${index}`);
      const text = input?.value.trim() || '';
      if (!text) return;

      const freshProjects = getAgencyProjects(agency);
      const mission = freshProjects[projectIndex] && freshProjects[projectIndex].missions[index];
      if (mission) {
        if (!mission.comments) mission.comments = [];
        mission.comments.push({ author: 'Agent', text, date: new Date().toISOString() });
        saveAgencyProjects(agency, freshProjects);
        reRender();
      }
    });
  });

  container.querySelectorAll('.test-telegram-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');

      const token = localStorage.getItem('telegram_bot_token');
      const chatId = localStorage.getItem('telegram_chat_id');

      if (!token || !chatId) {
        alert('WISE Comms Warning: Telegram Bot Token or Chat ID not configured in settings.');
        return;
      }

      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: `[WISE HQ DIRECTIVE]\nMission: ${title}\nDeadline: ${due}`
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) alert('Telegram Ping Dispatched Successfully!');
        else alert('Telegram Dispatch Failed: ' + (data.description || 'Unknown error'));
      })
      .catch(err => alert('Telegram Connection Error: ' + err.message));
    });
  });

  container.querySelectorAll('.test-discord-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');

      const webhookUrl = localStorage.getItem('discord_webhook_url');

      if (!webhookUrl) {
        alert('WISE Comms Warning: Discord Webhook URL not configured in settings.');
        return;
      }

      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🥷 **WISE HQ SECURE RELAY**\n**Mission:** ${title}\n**Deadline:** ${due}`
        })
      })
      .then(res => {
        if (res.ok) alert('Discord Relay Dispatched Successfully!');
        else alert('Discord Relay Failed.');
      })
      .catch(err => alert('Discord Connection Error: ' + err.message));
    });
  });
}