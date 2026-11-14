import { format, parseISO, isPast, differenceInHours } from 'date-fns';
import { getProjects, getCurrentProjectIndex, toggleMissionStatus, deleteMission } from '../storage.js';

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
    if (currentStatusFilter === 'inactive') return !mission.accomplished && !mission.dueDate;
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
    card.className = `mission-card threat-${mission.threatLevel.toLowerCase()}`;
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
            bombIndicator = ' <span class="ticking-bomb bomb-exploding" title="DEADLINE EXCEEDED!">💣💥 OVERDUE</span>';
            card.classList.add('mission-danger');
          } else if (hoursLeft <= 72) {
            bombIndicator = ` <span class="ticking-bomb bomb-ticking" title="Deadline creeping in!">💣⏳ T- ${hoursLeft}h</span>`;
            card.classList.add('mission-warning');
          }
        }
      } catch (e) {
        formattedDate = mission.dueDate;
      }
    } else if (!mission.accomplished) {
      bombIndicator = ' <span class="ticking-bomb" title="No timeline established">⏳ Inactive</span>';
    }

    let extraBadges = '';
    if (mission.spreadsheet) {
      extraBadges += ` <span class="badge" style="background: #4b6b54; color: #fff;">📊 ${mission.spreadsheet}</span>`;
    }
    if (mission.attachment) {
      extraBadges += ` <span class="badge" style="background: #3b5b76; color: #fff;">📎 Link</span>`;
    }
    if (mission.imageBase64) {
      extraBadges += ` <span class="badge" style="background: #8b1e1e; color: #fff;">🖼️ Image</span>`;
    }

    const headerDiv = document.createElement('div');
    headerDiv.className = 'mission-compact-header';
    headerDiv.innerHTML = `
      <div class="mission-summary-info">
        <input type="checkbox" data-index="${index}" ${mission.accomplished ? 'checked' : ''} class="accomplished-checkbox" />
        <span class="mission-title-text">${mission.title}</span>
        <span class="badge threat-badge">${mission.threatLevel}</span>
        <span class="badge category-badge">${mission.category || 'Mission'}</span>
        <span class="due-date-text">📅 ${formattedDate} ${bombIndicator}</span>
        ${extraBadges}
      </div>
      <div class="mission-actions">
        <button class="expand-btn" data-index="${index}">Expand ▾</button>
        <button class="delete-mission-btn" data-index="${index}">🗑️</button>
      </div>
    `;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'mission-details-drawer hidden';
    detailsDiv.id = `details-drawer-${index}`;

    const prep = mission.preparation || { keyTakeaways: '', briefingScript: '' };

    let attachmentHtml = mission.attachment ? `<p><strong>📎 Attachment Link:</strong> <a href="${mission.attachment}" target="_blank" style="color: #8b1e1e; font-weight: bold;">${mission.attachment}</a></p>` : '';
    let imagePreviewHtml = mission.imageBase64 ? `<div style="margin-top: 0.5rem;"><strong>🖼️ Attached Evidence:</strong><br><img src="${mission.imageBase64}" alt="Evidence" style="max-width: 100%; max-height: 200px; border: 2px solid #8c7a5b; margin-top: 0.3rem;" /></div>` : '';

    let commentsHtml = '';
    const comments = mission.comments || [];
    if (comments.length > 0) {
      commentsHtml = '<div class="comments-list" style="margin-top: 0.5rem; display: flex; flex-direction: column; gap: 0.3rem;">';
      comments.forEach(c => {
        commentsHtml += `<div style="background: #eedcb9; padding: 0.3rem 0.5rem; border-left: 3px solid #8b1e1e; font-size: 0.85rem;">💬 <strong>${c.author}:</strong> ${c.text}</div>`;
      });
      commentsHtml += '</div>';
    }

    detailsDiv.innerHTML = `
      <div class="details-content" style="display: flex; flex-direction: column; gap: 0.8rem;">
        <p><strong>Description:</strong> ${mission.description || 'None'}</p>
        <p><strong>Handler Debrief / Field Notes:</strong> ${mission.notes || 'None'}</p>
        <p><strong>📊 Linked Spreadsheet:</strong> ${mission.spreadsheet || 'None'}</p>
        ${attachmentHtml}
        ${imagePreviewHtml}
        
        <div class="prepare-mission-box" style="background: #f7f1e1; border: 2px dashed #8c7a5b; padding: 0.8rem; margin-top: 0.5rem;">
          <h4 style="margin: 0 0 0.4rem 0; font-family: 'Anton', sans-serif; font-size: 1.05rem; color: #8b1e1e;">🎯 Prepare Mission Briefing</h4>
          <div style="display: flex; flex-direction: column; gap: 0.4rem;">
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">3 Core Takeaways:</label>
              <input type="text" id="prep-takeaways-${index}" value="${prep.keyTakeaways || ''}" placeholder="1. ... 2. ... 3. ..." style="width: 100%; font-size: 0.85rem; padding: 0.3rem;" />
            </div>
            <div>
              <label style="font-size: 0.8rem; font-weight: bold;">Briefing Script / Strategy:</label>
              <textarea id="prep-script-${index}" rows="2" placeholder="Draft your script first..." style="width: 100%; font-size: 0.85rem; padding: 0.3rem;">${prep.briefingScript || ''}</textarea>
            </div>
            <button type="button" class="secondary-btn save-prep-btn" data-index="${index}" style="align-self: flex-start; padding: 0.3rem 0.8rem; font-size: 0.8rem;">Save Preparation</button>
          </div>
        </div>

        <div class="discussion-section" style="border-top: 1px dashed #8c7a5b; padding-top: 0.5rem;">
          <strong>💬 Mission Discussion & Handler Notes:</strong>
          ${commentsHtml || '<p style="font-size: 0.85rem; color: #5c4d37;">No comments logged yet.</p>'}
          <div style="display: flex; gap: 0.4rem; margin-top: 0.5rem;">
            <input type="text" id="comment-input-${index}" placeholder="Add comment or @mention handler..." style="flex: 1; font-size: 0.85rem; padding: 0.3rem;" />
            <button type="button" class="secondary-btn add-comment-btn" data-index="${index}" style="padding: 0.3rem 0.6rem; font-size: 0.8rem;">Send</button>
          </div>
        </div>

        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
          <button class="secondary-btn test-telegram-btn" data-title="${mission.title}" data-due="${mission.dueDate || 'None'}" style="font-size: 0.8rem; background: #2b4c48; color: #fff;">📤 Ping Telegram</button>
          <button class="secondary-btn test-discord-btn" data-title="${mission.title}" data-due="${mission.dueDate || 'None'}" style="font-size: 0.8rem; background: #5865F2; color: #fff;">💬 Ping Discord</button>
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
        e.target.textContent = drawer.classList.contains('hidden') ? 'Expand ▾' : 'Collapse ▴';
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
      if (confirm("Delete this mission dossier?")) {
        deleteMission(index);
        if (typeof renderCallback === 'function') renderCallback();
      }
    });
  });

  document.querySelectorAll('.save-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const keyTakeaways = document.getElementById(`prep-takeaways-${index}`).value.trim();
      const briefingScript = document.getElementById(`prep-script-${index}`).value.trim();

      const projectIndex = getCurrentProjectIndex();
      const projects = getProjects();
      const mission = projects[projectIndex].missions[index];

      mission.preparation = { keyTakeaways, briefingScript };
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      alert("🎯 Mission preparation briefing successfully saved!");
      if (typeof renderCallback === 'function') renderCallback();
    });
  });

  document.querySelectorAll('.add-comment-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      const input = document.getElementById(`comment-input-${index}`);
      const text = input ? input.value.trim() : '';
      if (!text) return;

      const projectIndex = getCurrentProjectIndex();
      const projects = getProjects();
      const mission = projects[projectIndex].missions[index];
      if (!mission.comments) mission.comments = [];
      mission.comments.push({ author: 'Agent', text, date: new Date().toISOString() });
      localStorage.setItem('wise_projects', JSON.stringify(projects));
      if (typeof renderCallback === 'function') renderCallback();
    });
  });

  document.querySelectorAll('.test-telegram-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');
      alert(`📤 [Simulated Telegram Ping Sent]\nMission: ${title}\nDeadline: ${due}`);
    });
  });

  document.querySelectorAll('.test-discord-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const title = e.target.getAttribute('data-title');
      const due = e.target.getAttribute('data-due');
      alert(`💬 [Simulated Discord Ping Sent]\nMission: ${title}\nDeadline: ${due}`);
    });
  });
}