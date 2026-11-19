import { getProjects, getCurrentProjectIndex, toggleMissionStatus, deleteMission } from '../storage.js';
import { format, parseISO, isPast, differenceInHours } from 'date-fns';

export function renderBoardView(container, currentStatusFilter, renderCallback) {
  container.innerHTML = '';

  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];

  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p class="no-missions">No active missions recorded in this dossier.</p>';
    return;
  }

  const filteredMissions = activeProject.missions.filter(mission => {
    if (currentStatusFilter === 'inactive') return !mission.accomplished && mission.dueDate;
    if (currentStatusFilter === 'pending') return !mission.accomplished && mission.dueDate;
    if (currentStatusFilter === 'fulfilled') return mission.accomplished;
    return true;
  });

  if (filteredMissions.length === 0) {
    container.innerHTML = `<p class="no-missions">No missions match the "${currentStatusFilter}" filter.</p>`;
    return;
  }

  filteredMissions.forEach((mission, index) => {
    const card = document.createElement('div');
    card.className = `mission-card threat-${(mission.threatLevel || '').toLowerCase()}`;
    if (mission.accomplished) card.classList.add('accomplished');

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
      extraBadges += ` <span class="badge" style="background: #4b6b54; color: #fff;">📊 ${mission.spreadsheet}</span>`;
    }
    if (mission.attachment) {
      extraBadges += ` <span class="badge" style="background: #3b5b76; color: #fff;">🔗 Link</span>`;
    }
    if (mission.imageBase64) {
      extraBadges += ` <span class="badge" style="background: #8b6e5e; color: #fff;">🖼 Image</span>`;
    }

    const headerDiv = document.createElement('div');
    headerDiv.className = 'mission-compact-header';
    headerDiv.innerHTML = `
      <div class="mission-summary-info">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" />
        <span class="mission-title-text">${mission.title}</span>
        <span class="badge threat-badge">${mission.threatLevel}</span>
        <span class="badge category-badge">${mission.category || 'Mission'}</span>
        <span class="due-date-text">${formattedDate} ${bombIndicator}</span>
        ${extraBadges}
      </div>
      <div class="mission-actions">
        <button class="expand-btn" data-index="${index}">Expand</button>
        <button class="delete-mission-btn" data-index="${index}">Delete</button>
      </div>
    `;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'mission-details-drawer hidden';
    detailsDiv.id = `details-drawer-${index}`;

    const prep = mission.preparation || { keyTakeaways: '', briefingscript: '' };
    
    let attachmentHtml = mission.attachment ? `<p><strong>Attachment Link:</strong> <a href="${mission.attachment}" target="_blank" style="color: #00bfa5;">Open Link</a></p>` : '';
    let imagePreviewHtml = mission.imageBase64 ? `<div style="margin-top: 0.5rem;"><img src="${mission.imageBase64}" style="max-width: 100%; max-height: 150px; border: 1px solid #ff9ebb; border-radius: 4px;" /></div>` : '';

    let commentsHtml = '';
    if (mission.comments && Array.isArray(mission.comments)) {
      mission.comments.forEach(c => {
        commentsHtml += `<div style="background: #fff0f3; padding: 0.3rem 0.5rem; margin-top: 0.3rem; border-left: 3px solid #ff9ebb; font-size: 0.85rem; color: #1a0f14;"><strong>${c.author}:</strong> ${c.text}</div>`;
      });
    }

    detailsDiv.innerHTML = `
      <div class="details-content" style="display: flex; flex-direction: column; gap: 0.8rem;">
        <p><strong>Description:</strong> ${mission.description || 'None'}</p>
        <p><strong>Handler Debrief / Field Notes:</strong> ${mission.notes || 'None'}</p>
        <p><strong>Linked Spreadsheet:</strong> ${mission.spreadsheet || 'None'}</p>
        ${attachmentHtml}
        ${imagePreviewHtml}
        
        <div class="comments-section" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">
          <strong>Mission Discussion & Handler Notes:</strong>
          <div comments-list style="display: flex; flex-direction: column; gap: 0.3rem;">${commentsHtml}</div>
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
          
          <button type="button" class="secondary-btn save-prep-btn" data-index="${index}" style="margin-top: 0.5rem; background: #00bfa5; color: #ffffff; border: none; padding: 4px 10px; border-radius: 3px; cursor: pointer; font-weight: bold;">Save Briefing Strategy</button>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
          <button class="secondary-btn test-telegram-btn" data-title="${mission.title}" data-due="${formattedDate}" style="background: #17a2b8; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">🚀 Telegram Ping</button>
          <button class="secondary-btn test-discord-btn" data-title="${mission.title}" data-due="${formattedDate}" style="background: #7289da; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;">💬 Discord Relay</button>
        </div>
      </div>
    `;

    card.appendChild(headerDiv);
    card.appendChild(detailsDiv);
    container.appendChild(card);
  });

  attachMissionEventListeners(renderCallback);
}

function attachMissionEventListeners(renderCallback) {
  document.querySelectorAll('.expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const drawer = document.getElementById(`details-drawer-${index}`);
      if (drawer) {
        drawer.classList.toggle('hidden');
        e.target.textContent = drawer.classList.contains('hidden') ? 'Expand' : 'Collapse';
      }
    });
  });

  document.querySelectorAll('.accomplished-checkbox').forEach(box => {
    box.addEventListener('change', (e) => {
      const index = e.target.getAttribute('data-index');
      toggleMissionStatus(index);
      if (typeof renderCallback === 'function') renderCallback();
    });
  });

  document.querySelectorAll('.delete-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      if (confirm('Delete this mission dossier?')) {
        deleteMission(index);
        if (typeof renderCallback === 'function') renderCallback();
      }
    });
  });

  document.querySelectorAll('.save-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const keyTakeaways = document.getElementById(`prep-takeaways-${index}`).value.trim();
      const briefingscript = document.getElementById(`prep-script-${index}`).value.trim();

      const projects = getProjects();
      const projectIndex = getCurrentProjectIndex();
      const mission = projects[projectIndex].missions[index];

      mission.preparation = { keyTakeaways, briefingscript };
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      alert('Mission preparation briefing successfully saved!');
      if (typeof renderCallback === 'function') renderCallback();
    });
  });

  document.querySelectorAll('.add-comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const input = document.getElementById(`comment-input-${index}`);
      const text = input.value.trim();
      if (!text) return;

      const projects = getProjects();
      const projectIndex = getCurrentProjectIndex();
      const mission = projects[projectIndex].missions[index];

      if (!mission.comments) mission.comments = [];
      mission.comments.push({ author: 'Agent', text, date: new Date().toISOString() });
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      if (typeof renderCallback === 'function') renderCallback();
    });
  });

  // Real API dispatchers restored for Telegram & Discord
  document.querySelectorAll('.test-telegram-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');
      
      // Real Telegram Webhook / API Dispatcher connection
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

  document.querySelectorAll('.test-discord-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');
      
      // Real Discord Webhook Dispatcher connection
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