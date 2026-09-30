/**
 * Live Status & Inspector Panel Component with i18n support.
 */

import { ALGORITHMS, getProcColorClass } from '../data/presets.js?v=3';
import { t } from '../data/i18n.js?v=3';

export function updateLiveStatusUI(store) {
  const { timeline, currentTick, totalTicks, isPlaying, algorithm, maskFutureTicks, lang } =
    store;
  const algoMeta = ALGORITHMS[algorithm];

  // Contextual visibility for Priority Order vs Quantum
  const priorityRuleContainer = document.getElementById('priorityRuleContainer');
  if (priorityRuleContainer) {
    priorityRuleContainer.classList.toggle('hidden', !algoMeta?.usesPriority);
  }

  const quantumContainer = document.getElementById('quantumContainer');
  if (quantumContainer) {
    quantumContainer.classList.toggle('hidden', !algoMeta?.usesQuantum);
  }

  // Update Tick Counter & Timeline Scrubber
  const currentTickLabel = document.getElementById('currentTickLabel');
  if (currentTickLabel) currentTickLabel.textContent = currentTick;

  const scrubber = document.getElementById('timelineScrubber');
  if (scrubber) {
    scrubber.max = Math.max(0, totalTicks - 1);
    scrubber.value = currentTick;
  }

  // Update Mask Future Ticks Toggle Button
  const btnMaskFuture = document.getElementById('btnToggleMaskFuture');
  if (btnMaskFuture) {
    btnMaskFuture.setAttribute('aria-pressed', String(maskFutureTicks));
    btnMaskFuture.className = maskFutureTicks
      ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 shadow-2xs transition'
      : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition';
  }

  // Update CPU Badge, Explanation, and Live Ready Queue
  const currentStep = timeline[currentTick];
  const cpuBadge = document.getElementById('activeCpuProcess');
  const explanationEl = document.getElementById('stepExplanationText');
  const readyQueueBox = document.getElementById('readyQueueBox');
  const queueCountBadge = document.getElementById('queueCountBadge');

  if (currentStep) {
    if (cpuBadge) {
      cpuBadge.textContent = currentStep.runningId || t(lang, 'label_idle');
      if (currentStep.runningId) {
        cpuBadge.className = `font-bold font-mono px-2 py-0.5 rounded border text-xs ${getProcColorClass(
          currentStep.runningId
        )}`;
      } else {
        cpuBadge.className =
          'font-bold text-slate-400 font-mono px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-xs';
      }
    }

    if (explanationEl) {
      explanationEl.innerHTML = `<span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 mr-1.5">t=${currentTick}</span>${
        currentStep.explanation || ''
      }`;
    }

    if (readyQueueBox && queueCountBadge) {
      readyQueueBox.innerHTML = '';
      const qLen = currentStep.readyQueue.length;
      queueCountBadge.textContent = `${qLen}`;

      if (qLen === 0) {
        readyQueueBox.innerHTML = `<span class="text-slate-400 text-xs">${t(
          lang,
          'label_empty'
        )}</span>`;
      } else {
        currentStep.readyQueue.forEach((item, idx) => {
          const pill = document.createElement('div');
          pill.className = `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border font-mono font-bold text-xs ${getProcColorClass(
            item.id
          )}`;

          let detailText = `rem:${item.remaining}`;
          if (algorithm === 'PRIORITY_NP' || algorithm === 'PRIORITY_P') {
            detailText = `p:${item.priority} rem:${item.remaining}`;
          } else if (algorithm === 'HRRH') {
            detailText = `R:${item.ratio}`;
          }

          pill.innerHTML = `
            <span class="text-[10px] opacity-60 font-sans">#${idx + 1}</span>
            <span>${item.id}</span>
            <span class="text-[10px] opacity-75 font-normal border-l border-current/20 pl-1">${detailText}</span>
          `;
          readyQueueBox.appendChild(pill);
        });
      }
    }
  } else {
    if (cpuBadge) cpuBadge.textContent = '—';
    if (explanationEl) explanationEl.textContent = '—';
    if (readyQueueBox) {
      readyQueueBox.innerHTML = `<span class="text-slate-400 text-xs">${t(
        lang,
        'label_empty'
      )}</span>`;
    }
  }

  // Update Play/Pause Button Appearance
  const playText = document.getElementById('playText');
  const playIcon = document.getElementById('playIcon');
  if (playText && playIcon) {
    if (isPlaying) {
      playText.textContent = t(lang, 'btn_pause');
      playIcon.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `;
    } else {
      playText.textContent = t(lang, 'btn_play');
      playIcon.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      `;
    }
  }
}
