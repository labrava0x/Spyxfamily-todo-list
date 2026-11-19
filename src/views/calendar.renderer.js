import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import {
  getCurrentProjectIndex,
  getCalendarEvents,
  addCalendarEvent,
  deleteCalendarEvent
} from '../storage.js';
import {
  getActiveAgency,
  getAgencyProjects,
  saveAgencyProjects,
  resolveTargetContainer,
  renderAgencySwitcher,
  attachAgencySwitcherListeners
} from './agency.switcher.js';

let currentCalendarDate = new Date();

function isSSSAgeny(agency) {
  const normalized = String(agency || '').trim().toUpperCase();
  return normalized === 'SSS' || normalized === 'YURI' || normalized === 'SSS_BUREAU';
}

export function renderCalendarGridView(container, monthStart, monthEnd, daysInMonth, startDayOfWeek, isSameDayFn, renderCallback) {
  const target = resolveTargetContainer(container);
  if (!target) return;

  const agency = getActiveAgency();
  const isSSS = isSSSAgeny(agency);
  const agencyLabel = isSSS ? 'SSS BUREAU' : 'WISE HQ';

  const projects = getAgencyProjects(agency);
  const projectIdx = (projects && projects[getCurrentProjectIndex()]) ? getCurrentProjectIndex() : 0;

  if (!projects || projects.length === 0) {
    projects.push({ name: isSSS ? 'SSS Operations' : 'WISE Operations', missions: [] });
    saveAgencyProjects(agency, projects);
  }

  const activeProject = projects[projectIdx] || projects[0];
  let missions = activeProject && Array.isArray(activeProject.missions) ? activeProject.missions : [];
  if (!isSSS) {
    missions = missions.filter(m => !String(m.title || '').toLowerCase().includes('monitor twilight'));
  }

  const savedCalendarEvents = getCalendarEvents(agency) || [];

  const mStart = startOfMonth(currentCalendarDate);
  const mEnd = endOfMonth(currentCalendarDate);
  const sWeek = startOfWeek(mStart);
  const eWeek = endOfWeek(mEnd);

  const days = eachDayOfInterval({ start: sWeek, end: eWeek });
  const sDayOfWeek = sWeek.getDay();
  const sameDay = typeof isSameDayFn === 'function' ? isSameDayFn : (d1, d2) => d1.toDateString() === d2.toDateString();

  const rerenderCalendar = () => {
    if (typeof renderCallback === 'function') {
      renderCallback();
    } else {
      renderCalendarGridView(target, monthStart, monthEnd, daysInMonth, startDayOfWeek, isSameDayFn, null);
    }
  };

  let html = `
    <div style="font-family: 'Special Elite', monospace; display: flex; flex-direction: column; gap: 1rem; width: 100%; color: #12151c;">
      <div style="margin-bottom: 0.2rem;">
        ${renderAgencySwitcher('cal', isSSS)}
      </div>

      <!-- Calendar Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; background: #f4a4b8; color: #12151c; padding: 0.65rem 1rem; border-radius: 4px; border: 1px solid #db7093; border-left: 5px solid #10b981;">
        <button type="button" id="cal-prev-btn" style="background: #10b981; color: #12151c; border: 1px solid #059669; padding: 4px 12px; cursor: pointer; font-family: 'Special Elite', monospace; font-weight: bold; border-radius: 3px;">◀ Prev</button>
        <div style="font-family: 'Anton', sans-serif; font-size: 1.1rem; letter-spacing: 0.05em; color: #12151c;">${agencyLabel} — ${format(currentCalendarDate, 'MMMM yyyy').toUpperCase()}</div>
        <button type="button" id="cal-next-btn" style="background: #10b981; color: #12151c; border: 1px solid #059669; padding: 4px 12px; cursor: pointer; font-family: 'Special Elite', monospace; font-weight: bold; border-radius: 3px;">Next ▶</button>
      </div>

      <div class="calendar-grid-wrapper" style="width: 100%;">
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; text-align: center; font-family: 'Anton', sans-serif; background: #12151c; color: #10b981; padding: 6px 0; border-radius: 4px; border: 1px solid #f4a4b8;">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 4px;">
  `;

  for (let i = 0; i < sDayOfWeek; i++) {
    html += `<div style="background: rgba(244,164,184,0.12); min-height: 85px; border: 1px dashed #f4a4b8; opacity: 0.45; border-radius: 3px;"></div>`;
  }

  days.forEach(day => {
    const isToday = sameDay(day, new Date());
    const isoDate = format(day, 'yyyy-MM-dd');

    const dayEvents = savedCalendarEvents.filter(ev => ev.date === isoDate);
    const dayMissions = missions.filter(m => {
      if (!m.dueDate) return false;
      try {
        const parsed = typeof m.dueDate === 'string' ? parseISO(m.dueDate) : new Date(m.dueDate);
        return !Number.isNaN(parsed.getTime()) && sameDay(parsed, day);
      } catch (err) {
        return false;
      }
    });

    let entriesHtml = '';

    dayEvents.forEach(ev => {
      entriesHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; font-size: 0.75rem; background: #fff5f7; color: #12151c; padding: 2px 5px; margin-top: 2px; border-left: 3px solid #10b981; border-radius: 2px; font-weight: bold;">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ev.title}">${ev.title}</span>
          <button type="button" class="cal-delete-event-btn" data-event-id="${ev.id}" title="Delete entry" style="background: #f4a4b8; color: #12151c; border: 1px solid #db7093; border-radius: 2px; padding: 0 4px; line-height: 1.1; cursor: pointer; font-weight: bold; flex-shrink: 0;">×</button>
        </div>
      `;
    });

    dayMissions.forEach((m, mIdx) => {
      entriesHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 4px; font-size: 0.75rem; background: #f4a4b8; color: #12151c; padding: 2px 5px; margin-top: 2px; border-left: 3px solid #10b981; border-radius: 2px; font-weight: bold;">
          <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.title}">${m.title}</span>
          <button type="button" class="cal-delete-mission-btn" data-mission-index="${mIdx}" title="Remove mission from calendar" style="background: #fff5f7; color: #12151c; border: 1px solid #db7093; border-radius: 2px; padding: 0 4px; line-height: 1.1; cursor: pointer; font-weight: bold; flex-shrink: 0;">×</button>
        </div>
      `;
    });

    html += `
      <div class="cal-day-cell" data-date="${isoDate}" style="background: ${isToday ? '#f4a4b8' : '#fff5f7'}; border: 1px solid #db7093; min-height: 92px; padding: 0.4rem; display: flex; flex-direction: column; border-radius: 3px; color: #12151c;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; font-weight: bold; color: #12151c; border-bottom: 1px solid #db7093; padding-bottom: 2px; margin-bottom: 4px;">
          <span>${format(day, 'd')}</span>
          <button type="button" class="cal-add-btn" data-date="${isoDate}" title="Add entry to ${isoDate}" style="background: #10b981; color: #12151c; border: 1px solid #059669; border-radius: 2px; width: 18px; height: 18px; line-height: 16px; text-align: center; font-weight: bold; cursor: pointer; font-size: 0.85rem;">+</button>
        </div>
        <div style="flex: 1; overflow-y: auto; max-height: 72px;">${entriesHtml}</div>
      </div>
    `;
  });

  html += `
        </div>
      </div>
    </div>
  `;

  target.innerHTML = html;

  attachAgencySwitcherListeners(target, 'cal', rerenderCalendar);

  const prevBtn = target.querySelector('#cal-prev-btn');
  const nextBtn = target.querySelector('#cal-next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      currentCalendarDate = subMonths(currentCalendarDate, 1);
      rerenderCalendar();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentCalendarDate = addMonths(currentCalendarDate, 1);
      rerenderCalendar();
    });
  }

  target.querySelectorAll('.cal-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const selectedDate = btn.getAttribute('data-date');
      const note = prompt(`[${agencyLabel} // ${selectedDate}] Enter calendar entry or directive:`);

      if (!note || !note.trim()) return;

      addCalendarEvent(
        {
          date: selectedDate,
          title: note.trim(),
          threatLevel: 'Medium'
        },
        agency
      );

      rerenderCalendar();
    });
  });

  target.querySelectorAll('.cal-delete-event-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const eventId = btn.getAttribute('data-event-id');
      if (!eventId) return;
      deleteCalendarEvent(eventId, agency);
      rerenderCalendar();
    });
  });

  target.querySelectorAll('.cal-delete-mission-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mIdx = Number(btn.getAttribute('data-mission-index'));
      const currentProjects = getAgencyProjects(agency);
      const targetProj = currentProjects && (currentProjects[projectIdx] || currentProjects[0]);
      if (targetProj && Array.isArray(targetProj.missions) && targetProj.missions[mIdx]) {
        targetProj.missions.splice(mIdx, 1);
        saveAgencyProjects(agency, currentProjects);
        rerenderCalendar();
      }
    });
  });
}