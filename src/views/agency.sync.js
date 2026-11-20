import {
  getCurrentProjectIndex,
  getCalendarEvents,
  addCalendarEvent
} from '../storage.js';
import {
  getActiveAgency,
  setActiveAgency,
  getAgencyProjects,
  saveAgencyProjects
} from './agency.switcher.js';

export function normalizeAgencyKey(agency) {
  const val = String(agency || '').trim().toUpperCase();
  if (val === 'SSS' || val === 'YURI' || val === 'SSS_BUREAU') {
    return 'SSS';
  }
  return 'WISE';
}

/**
 * Adds a dated note/entry to the given agency's calendar if it doesn't
 * already exist for that same date and title.
 */
export function syncNoteToAgencyCalendar(entry, agency = getActiveAgency()) {
  const key = normalizeAgencyKey(agency);
  const title = String(entry?.title || '').trim();
  const date = String(entry?.date || '').trim();
  if (!title || !date) return getCalendarEvents(key) || [];

  const existingEvents = getCalendarEvents(key) || [];
  const alreadyExists = existingEvents.some(
    (ev) =>
      ev.date === date &&
      String(ev.title || '').trim().toLowerCase() === title.toLowerCase()
  );

  if (!alreadyExists) {
    addCalendarEvent(
      {
        date,
        title,
        threatLevel: entry.threatLevel || 'Medium'
      },
      key
    );
  }

  return getCalendarEvents(key) || [];
}

/**
 * Syncs dated missions and prep notes from the active agency's project
 * into that same agency's calendar events without creating duplicates.
 */
export function syncAgencyMissionsAndPrepToCalendar(agency = getActiveAgency()) {
  const key = normalizeAgencyKey(agency);
  const projects = getAgencyProjects(key) || [];
  const rawIndex = getCurrentProjectIndex() || 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;
  const project = projects[activeIndex];

  const existingEvents = getCalendarEvents(key) || [];

  if (project && Array.isArray(project.missions)) {
    project.missions.forEach((mission) => {
      if (!mission || !mission.title) return;
      if (key === 'WISE' && String(mission.title).toLowerCase().includes('monitor twilight')) {
        return;
      }

      const rawDate = mission.dueDate || mission.date || '';
      if (!rawDate) return;

      const isoDate = String(rawDate).slice(0, 10);
      const alreadyOnCalendar = existingEvents.some(
        (ev) =>
          ev.date === isoDate &&
          String(ev.title || '').trim().toLowerCase() === String(mission.title).trim().toLowerCase()
      );

      if (!alreadyOnCalendar) {
        addCalendarEvent(
          {
            date: isoDate,
            title: mission.title.trim(),
            threatLevel: mission.threatLevel || mission.priority || 'Medium'
          },
          key
        );
      }
    });
  }

  return getCalendarEvents(key) || [];
}

/**
 * Saves prep/notes for the active agency and optionally syncs a dated entry
 * directly to that agency's calendar.
 */
export function saveAndSyncAgencyPrep({
  keyTakeaways = '',
  briefingScript = '',
  calendarDate = '',
  mode = 'general',
  missionIndex = null,
  agency = getActiveAgency()
}) {
  const key = normalizeAgencyKey(agency);
  const projects = getAgencyProjects(key) || [];
  const rawIndex = getCurrentProjectIndex() || 0;
  const activeIndex = projects[rawIndex] ? rawIndex : 0;

  if (!projects[activeIndex]) {
    projects[activeIndex] = {
      name: key === 'SSS' ? 'SSS Surveillance Operation' : 'WISE Operations',
      missions: [],
      generalPreparation: { keyTakeaways: '', briefingScript: '' },
      adHocPreparation: { keyTakeaways: '', briefingScript: '' }
    };
  }

  const targetProject = projects[activeIndex];

  if (mode === 'mission' && missionIndex !== null && targetProject.missions?.[missionIndex]) {
    targetProject.missions[missionIndex].preparation = { keyTakeaways, briefingScript };
    if (calendarDate) {
      syncNoteToAgencyCalendar(
        {
          title: targetProject.missions[missionIndex].title,
          date: calendarDate,
          threatLevel: 'Medium'
        },
        key
      );
    }
  } else if (mode === 'adhoc') {
    targetProject.adHocPreparation = { keyTakeaways, briefingScript };
    if (calendarDate && (keyTakeaways || briefingScript)) {
      syncNoteToAgencyCalendar(
        {
          title: keyTakeaways || 'Field Prep Note',
          date: calendarDate,
          threatLevel: 'Medium'
        },
        key
      );
    }
  } else {
    targetProject.generalPreparation = { keyTakeaways, briefingScript };
    if (calendarDate && (keyTakeaways || briefingScript)) {
      syncNoteToAgencyCalendar(
        {
          title: keyTakeaways || `${key} Briefing Note`,
          date: calendarDate,
          threatLevel: 'Medium'
        },
        key
      );
    }
  }

  saveAgencyProjects(key, projects);
}

export function switchAgencyAndSync(nextAgency, rerenderFn) {
  const normalized = normalizeAgencyKey(nextAgency);
  setActiveAgency(normalized);
  syncAgencyMissionsAndPrepToCalendar(normalized);
  if (typeof rerenderFn === 'function') {
    rerenderFn();
  }
}