import { format, parseISO, isPast } from 'date-fns';
import { getProjects, getCurrentProjectIndex, getCommsConfig, saveCommsConfig } from '../storage.js';

export function renderInsightsView(container) {
  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];

  if (!activeProject) {
    container.innerHTML = '<p class="no-missions">No active operation selected.</p>';
    return;
  }

  const totalMissions = activeProject.missions.length;
  const completedMissions = activeProject.missions.filter(m => m.accomplished).length;
  const overdueMissions = activeProject.missions.filter(m => !m.accomplished && m.dueDate && isPast(parseISO(m.dueDate))).length;
  
  let healthStatus = 'Excellent 🟢';
  let healthDesc = 'This operation is in excellent health, with final cut moving steadily and tasks on track. No tasks are overdue!';

  if (overdueMissions > 0) {
    healthStatus = 'Critical 🔴';
    healthDesc = `Warning! There are ${overdueMissions} overdue mission(s) requiring immediate operative intervention.`;
  } else if (totalMissions > 0 && (completedMissions / totalMissions) < 0.4) {
    healthStatus = 'Good 🟡';
    healthDesc = 'Operation is progressing steadily, but several intelligence milestones remain pending.';
  }

  container.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      <div style="background: #f7f1e1; padding: 1.5rem; border: 1px solid #9c8a6b; border-top: 4px solid #8b1e1e; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.3rem; color: #8b1e1e;">📊 Operation Health: ${healthStatus}</h3>
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
}

export function renderPrepareMissionView(container, renderCallback) {
  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];

  if (!activeProject || activeProject.missions.length === 0) {
    container.innerHTML = '<p class="no-missions">No missions available to prepare.</p>';
    return;
  }

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1.5rem;">
      <p style="background: #f7f1e1; padding: 0.8rem; border: 1px solid #9c8a6b; border-left: 4px solid #8b1e1e; margin: 0;">
        🎯 <strong>Mission Preparation Hub:</strong> Keep the objective simple. What are the three things about this mission that everyone should remember? Write the script first.
      </p>
  `;

  activeProject.missions.forEach((m, index) => {
    const prep = m.preparation || { keyTakeaways: '', briefingScript: '' };
    html += `
      <div style="background: #f7f1e1; border: 1px solid #9c8a6b; padding: 1.2rem; box-shadow: 2px 2px 0px rgba(0,0,0,0.1);">
        <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; font-size: 1.2rem; color: #8b1e1e; border-bottom: 2px solid #d6c098; padding-bottom: 0.3rem;">
          ${m.title}
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

  html += `</div>`;
  container.innerHTML = html;

  container.querySelectorAll('.save-tab-prep-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mIdx = e.target.getAttribute('data-index');
      const keyTakeaways = document.getElementById(`tab-prep-takeaways-${mIdx}`).value.trim();
      const briefingScript = document.getElementById(`tab-prep-script-${mIdx}`).value.trim();

      const projectIndex = getCurrentProjectIndex();
      const allProjects = getProjects();
      const mission = allProjects[projectIndex].missions[mIdx];

      mission.preparation = { keyTakeaways, briefingScript };
      localStorage.setItem('wise_projects', JSON.stringify(allProjects));
      alert("🎯 Mission preparation briefing successfully saved!");
      if (typeof renderCallback === 'function') renderCallback();
    });
  });
}

export function renderCalendarGridView(container, monthStart, monthEnd, daysInMonth, startDayOfWeek, isSameDay) {
  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];
  const missions = activeProject ? activeProject.missions : [];

  let html = `
    <div class="calendar-grid-wrapper" style="font-family: 'Special Elite', monospace;">
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

  html += `</div></div>`;
  container.innerHTML = html;
}

export function renderTableView(container) {
  const projects = getProjects();
  const currentIndex = getCurrentProjectIndex();
  const activeProject = projects[currentIndex];
  const missions = activeProject ? activeProject.missions : [];

  if (missions.length === 0) {
    container.innerHTML = '<p class="no-missions">No missions recorded for table view.</p>';
    return;
  }

  let html = `
    <div style="overflow-x: auto; font-family: 'Special Elite', monospace;">
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
        <td style="padding: 8px; font-weight: bold;">${m.title}</td>
        <td style="padding: 8px;">${m.category || 'Mission'}</td>
        <td style="padding: 8px;">${m.threatLevel}</td>
        <td style="padding: 8px;">${m.dueDate || 'None'}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

export function renderDeveloperView(container) {
  const config = getCommsConfig();
  container.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; background: #f7f1e1; padding: 1.2rem; border: 1px solid #8c7a5b;">
      <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; color: #8b1e1e;">💻 Model Context Protocol (MCP) & API Config</h3>
      <p style="font-size: 0.85rem; color: #5c4d37;">Connect your local AI assistants and MCP servers directly to your classified dossiers.</p>
      
      <div class="form-group">
        <label>MCP Endpoint URL</label>
        <input type="text" id="dev-mcp-endpoint" value="${config.mcpEndpoint}" style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Secure API Token</label>
        <input type="text" id="dev-api-token" value="${config.apiKey}" style="width: 100%; padding: 0.4rem;" />
      </div>
      <button type="button" id="save-dev-config-btn" class="primary-btn dossier-btn" style="align-self: flex-start; padding: 0.4rem 1rem;">Save Developer Config</button>
    </div>
  `;

  const saveBtn = container.querySelector('#save-dev-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const mcpEndpoint = container.querySelector('#dev-mcp-endpoint').value;
      const apiKey = container.querySelector('#dev-api-token').value;
      const current = getCommsConfig();
      current.mcpEndpoint = mcpEndpoint;
      current.apiKey = apiKey;
      saveCommsConfig(current);
      alert("💻 Developer configuration successfully saved!");
    });
  }
}

export function renderAutomationsView(container) {
  const config = getCommsConfig();
  container.innerHTML = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; background: #f7f1e1; padding: 1.2rem; border: 1px solid #8c7a5b;">
      <h3 style="margin-top: 0; font-family: 'Anton', sans-serif; color: #8b1e1e;">⚡ Messaging Relays (Telegram & Discord)</h3>
      <p style="font-size: 0.85rem; color: #5c4d37;">Configure your external handler notifications and webhook bots.</p>

      <div class="form-group">
        <label>Telegram Bot Token</label>
        <input type="text" id="comms-tg-token" value="${config.telegramToken}" placeholder="123456:ABC-DEF..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Telegram Chat ID</label>
        <input type="text" id="comms-tg-chat" value="${config.telegramChatId}" placeholder="-100..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <div class="form-group">
        <label>Discord Webhook URL</label>
        <input type="text" id="comms-discord" value="${config.discordWebhook}" placeholder="https://discord.com/api/webhooks/..." style="width: 100%; padding: 0.4rem;" />
      </div>
      <button type="button" id="save-comms-config-btn" class="primary-btn dossier-btn" style="align-self: flex-start; padding: 0.4rem 1rem;">Save Relays</button>
    </div>
  `;

  const saveBtn = container.querySelector('#save-comms-config-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const telegramToken = container.querySelector('#comms-tg-token').value;
      const telegramChatId = container.querySelector('#comms-tg-chat').value;
      const discordWebhook = container.querySelector('#comms-discord').value;
      const current = getCommsConfig();
      current.telegramToken = telegramToken;
      current.telegramChatId = telegramChatId;
      current.discordWebhook = discordWebhook;
      saveCommsConfig(current);
      alert("⚡ Comms relay configuration successfully saved!");
    });
  }
}