import { format, parseISO, isPast, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { getCurrentProjectIndex } from '../storage.js';
import {
  getActiveAgency,
  getAgencyProjects,
  saveAgencyProjects,
  resolveTargetContainer,
  renderAgencySwitcher,
  attachAgencySwitcherListeners
} from './agency.switcher.js';

let currentCalendarDate = new Date();

export function renderCalendarGridView(container, monthStart, monthEnd, daysInMonth, startDayOfWeek, isSameDayFn, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isYuri = agency === 'yuri';

  const projects = getAgencyProjects(agency);
  const projectIdx = (projects && projects[getCurrentProjectIndex()]) ? getCurrentProjectIndex() : 0;
  
  if (!projects || projects.length === 0) {
    projects.push({ title: isYuri ? 'SSS Surveillance Operations' : 'Operation Strix', missions: [] });
    saveAgencyProjects(agency, projects);
  }

  const activeProject = projects[projectIdx] || projects[0];
  let missions = activeProject && Array.isArray(activeProject.missions) ? activeProject.missions : [];

  if (!isYuri) {
    missions = missions.filter(m => !m.title.toLowerCase().includes('monitor twilight'));
  }

  const mStart = startOfMonth(currentCalendarDate);
  const mEnd = endOfMonth(currentCalendarDate);
  const sWeek = startOfWeek(mStart);
  const eWeek = endOfWeek(mEnd);

  const days = eachDayOfInterval({ start: sWeek, end: eWeek });
  const sDayOfWeek = sWeek.getDay();
  const sameDay = typeof isSameDayFn === 'function' ? isSameDayFn : (d1, d2) => d1.toDateString() === d2.toDateString();

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; width: 100%;">
      <div style="margin-bottom: 0.2rem;">
        ${renderAgencySwitcher('cal', isYuri)}
      </div>

      <!-- Calendar Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: #ff9ebb; color: #1a0f14; padding: 0.6rem 1rem; border-radius: 4px; border: 1px solid #00bfa5;">
        <button type="button" id="cal-prev-btn" style="background: #00bfa5; color: #ffffff; border: none; padding: 4px 12px; cursor: pointer; font-family: 'Special Elite', monospace; font-weight: bold; border-radius: 3px;">◀ Prev</button>
        <div style="font-size: 1.1rem; font-weight: bold; letter-spacing: 1px; color: #1a0f14;">${isYuri ? 'SSS BUREAU' : 'WISE HQ'} — ${format(currentCalendarDate, 'MMMM yyyy').toUpperCase()}</div>
        <button type="button" id="cal-next-btn" style="background: #00bfa5; color: #ffffff; border: none; padding: 4px 12px; cursor: pointer; font-family: 'Special Elite', monospace; font-weight: bold; border-radius: 3px;">Next ▶</button>
      </div>

      <div class="calendar-grid-wrapper" style="width: 100%;">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-family: 'Anton', sans-serif; background: #1a0f14; color: #00bfa5; padding: 6px 0; border-radius: 4px; border: 1px solid #ff9ebb;">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 4px;">
  `;

  for (let i = 0; i < sDayOfWeek; i++) {
    html += `<div style="background: rgba(255,158,187,0.02); min-height: 80px; border: 1px dashed #ff9ebb; opacity: 0.3;"></div>`;
  }

  days.forEach(day => {
    const isToday = sameDay(day, new Date());
    const isoDate = format(day, 'yyyy-MM-dd');
    const dayMissions = missions.filter(m => m.dueDate && sameDay(parseISO(m.dueDate), day));

    let missionsHtml = '';
    dayMissions.forEach(m => {
      missionsHtml += `<div style="font-size: 0.75rem; background: #fff0f3; color: #1a0f14; padding: 2px 4px; margin-top: 2px; border-left: 2px solid #00bfa5; border-radius: 2px; font-weight: bold;">${m.title}</div>`;
    });

    html += `
      <div class="cal-day-cell" data-date="${isoDate}" style="background: ${isToday ? '#ff9ebb' : '#ffffff'}; border: 1px solid #ff9ebb; min-height: 90px; padding: 0.4rem; display: flex; flex-direction: column; border-radius: 3px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: bold; color: ${isToday ? '#1a0f14' : '#555555'}; border-bottom: 1px solid rgba(255,158,187,0.4); padding-bottom: 2px; margin-bottom: 4px;">
          <span>${format(day, 'd')}</span>
          <button type="button" class="cal-add-btn" data-date="${isoDate}" title="Add directive to ${isoDate}" style="background: #00bfa5; color: #ffffff; border: none; border-radius: 2px; width: 18px; height: 18px; line-height: 16px; text-align: center; font-weight: bold; cursor: pointer; font-size: 0.8rem;">+</button>
        </div>
        <div style="flex: 1; overflow-y: auto; max-height: 70px;">${missionsHtml}</div>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  target.innerHTML = html;

  attachAgencySwitcherListeners(target, 'cal', renderCallback);

  const prevBtn = target.querySelector('#cal-prev-btn');
  const nextBtn = target.querySelector('#cal-next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentCalendarDate = subMonths(currentCalendarDate, 1);
      if (typeof renderCallback === 'function') renderCallback();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentCalendarDate = addMonths(currentCalendarDate, 1);
      if (typeof renderCallback === 'function') renderCallback();
    });
  }

  // Save handling with direct array mutation and storage sync
  target.querySelectorAll('.cal-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedDate = btn.getAttribute('data-date');
      const agencyLabel = isYuri ? 'SSS Bureau' : 'WISE HQ';
      const note = prompt(`[${agencyLabel} // ${selectedDate}] Enter mission or directive:`);

      if (!note || !note.trim()) return;

      const currentProjects = getAgencyProjects(agency);
      if (!currentProjects || currentProjects.length === 0) {
        currentProjects.push({ title: 'Default Operations', missions: [] });
      }

      const targetProj = currentProjects[projectIdx] || currentProjects[0];
      if (!Array.isArray(targetProj.missions)) {
        targetProj.missions = [];
      }

      targetProj.missions.push({
        id: 'mission_' + Date.now(),
        title: note.trim(),
        dueDate: selectedDate,
        priority: 'medium',
        completed: false
      });

      saveAgencyProjects(agency, currentProjects);

      if (typeof renderCallback === 'function') {
        renderCallback();
      }
    });
  });
}