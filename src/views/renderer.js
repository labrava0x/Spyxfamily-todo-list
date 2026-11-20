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

export function renderDancingMenDoodleSection(agencyPrefix) {
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

export function attachDoodleCanvasListeners(target) {
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
- PREPARE VOICE DICTATION HELPER                                    *
- ================================================================= */

const PrepareSpeechRecognition =
  typeof window !== 'undefined'
    ? window.SpeechRecognition || window.webkitSpeechRecognition || null
    : null;

let activePrepRecognizer = null;
let activePrepButton = null;

function stopPrepareDictation() {
  if (activePrepRecognizer) {
    try {
      activePrepRecognizer.stop();
    } catch (_) {
      // Ignore already-stopped recognition instances
    }
    activePrepRecognizer = null;
  }
  if (activePrepButton) {
    activePrepButton.textContent = '🎙️ Voice Dictate';
    activePrepButton.style.background = '#10b981';
    activePrepButton.style.color = '#12151c';
    activePrepButton.setAttribute('aria-pressed', 'false');
    activePrepButton = null;
  }
}

export function attachPrepareDictationButtons(target) {
  const dictateTargets = [
    {
      btnSelector: '#voice-dictate-general-prep-btn',
      textareaSelector: '#general-prep-script'
    },
    ...Array.from(target.querySelectorAll('.voice-dictate-mission-prep-btn')).map((btn) => ({
      btn,
      textareaSelector: `#tab-prep-script-${btn.getAttribute('data-index')}`
    }))
  ];

  dictateTargets.forEach(({ btn: explicitBtn, btnSelector, textareaSelector }) => {
    const btn = explicitBtn || target.querySelector(btnSelector);
    const textarea = target.querySelector(textareaSelector);
    if (!btn || !textarea) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();

      const alreadyRecordingThis = activePrepButton === btn && activePrepRecognizer !== null;
      stopPrepareDictation();
      if (alreadyRecordingThis) return;

      if (!PrepareSpeechRecognition) {
        alert('🎙️ Voice dictation is not supported in this browser.');
        return;
      }

      const recognizer = new PrepareSpeechRecognition();
      recognizer.lang = navigator.language || 'en-US';
      recognizer.interimResults = false;
      recognizer.maxAlternatives = 1;

      activePrepRecognizer = recognizer;
      activePrepButton = btn;

      btn.textContent = '⏹️ Listening...';
      btn.style.background = '#8b1e1e';
      btn.style.color = '#fff8f5';
      btn.setAttribute('aria-pressed', 'true');

      recognizer.onresult = (event) => {
        let spokenChunk = '';
        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          if (event.results[i].isFinal) {
            spokenChunk += event.results[i][0].transcript;
          }
        }
        const cleaned = spokenChunk.trim();
        if (cleaned) {
          const currentVal = textarea.value || '';
          const sep = currentVal.length > 0 && !/\s$/.test(currentVal) ? ' ' : '';
          textarea.value = `${currentVal}${sep}${cleaned}`;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          textarea.focus();
        }
      };

      recognizer.onerror = (event) => {
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          console.warn('Prepare dictation error:', event.error);
        }
        stopPrepareDictation();
      };

      recognizer.onend = () => {
        stopPrepareDictation();
      };

      try {
        recognizer.start();
      } catch (_) {
        stopPrepareDictation();
      }
    });
  });
}