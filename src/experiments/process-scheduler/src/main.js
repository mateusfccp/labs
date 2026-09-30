/**
 * Main Application Entry Point for the CPU Process Scheduler.
 */

import { store } from './state/store.js?v=4';
import { t } from './data/i18n.js?v=4';
import {
  renderMatrixStructure,
  syncMatrixSchedule,
  updateMatrixTickHighlight,
} from './components/matrixView.js?v=4';
import { updateLiveStatusUI } from './components/statusPanel.js?v=4';
import { renderMetricsPanel } from './components/metricsPanel.js?v=4';
import { showToast } from './utils/toast.js?v=4';

let animationInterval = null;

function selectTick(tIdx) {
  pauseAnimation();
  store.setTick(tIdx);
}

function stepForward() {
  pauseAnimation();
  if (store.currentTick < store.totalTicks - 1) {
    store.setTick(store.currentTick + 1);
  }
}

function stepBackward() {
  pauseAnimation();
  if (store.currentTick > 0) {
    store.setTick(store.currentTick - 1);
  }
}

function resetSimulation() {
  pauseAnimation();
  store.setTick(0);
}

function jumpToEnd() {
  pauseAnimation();
  store.setTick(Math.max(0, store.totalTicks - 1), false);
}

function startAnimation() {
  if (store.currentTick >= store.totalTicks - 1) {
    store.currentTick = 0;
  }
  store.maskFutureTicks = true;
  store.isPlaying = true;
  updateLiveStatusUI(store);
  updateMatrixTickHighlight(store);

  if (animationInterval) clearInterval(animationInterval);
  animationInterval = setInterval(() => {
    if (store.currentTick < store.totalTicks - 1) {
      store.setTick(store.currentTick + 1);
    } else {
      pauseAnimation();
    }
  }, store.animationSpeed);
}

function pauseAnimation() {
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  if (store.isPlaying) {
    store.isPlaying = false;
    updateLiveStatusUI(store);
  }
}

function togglePlay() {
  if (store.isPlaying) {
    pauseAnimation();
  } else {
    startAnimation();
  }
}

function applyTranslations() {
  const { lang } = store;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(lang, key);
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html');
    el.innerHTML = t(lang, key);
  });

  document.querySelectorAll('[data-i18n-label]').forEach((el) => {
    const key = el.getAttribute('data-i18n-label');
    el.setAttribute('label', t(lang, key));
  });
}

function syncControlsUI() {
  const langSelect = document.getElementById('langSelect');
  if (langSelect && langSelect.value !== store.lang) {
    langSelect.value = store.lang;
  }

  const algoSelect = document.getElementById('algorithmSelect');
  if (algoSelect && algoSelect.value !== store.algorithm) {
    algoSelect.value = store.algorithm;
  }

  const quantumInput = document.getElementById('quantumInput');
  if (quantumInput && document.activeElement !== quantumInput) {
    quantumInput.value = store.quantum;
  }

  const prioritySelect = document.getElementById('priorityRuleSelect');
  if (prioritySelect && prioritySelect.value !== store.priorityRule) {
    prioritySelect.value = store.priorityRule;
  }

  const speedSelect = document.getElementById('speedSelect');
  if (speedSelect && String(speedSelect.value) !== String(store.animationSpeed)) {
    speedSelect.value = String(store.animationSpeed);
  }
}

function bindEvents() {
  // Language Selector
  document.getElementById('langSelect')?.addEventListener('change', (e) => {
    store.setLanguage(e.target.value);
  });

  // Policy Selector (preserves processes)
  document.getElementById('algorithmSelect')?.addEventListener('change', (e) => {
    pauseAnimation();
    store.setAlgorithm(e.target.value);
  });

  // Quantum Input & Steppers
  document.getElementById('quantumInput')?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    if (val >= 1) {
      store.setQuantum(val);
    }
  });
  document.getElementById('btnQuantumDec')?.addEventListener('click', () => {
    store.setQuantum(store.quantum - 1);
  });
  document.getElementById('btnQuantumInc')?.addEventListener('click', () => {
    store.setQuantum(store.quantum + 1);
  });

  // Priority Rule Selector
  document.getElementById('priorityRuleSelect')?.addEventListener('change', (e) => {
    store.setPriorityRule(e.target.value);
  });

  // Speed Selector
  document.getElementById('speedSelect')?.addEventListener('change', (e) => {
    store.setAnimationSpeed(e.target.value);
    if (store.isPlaying) {
      startAnimation();
    }
  });

  // Mask Future Ticks Toggle
  document.getElementById('btnToggleMaskFuture')?.addEventListener('click', () => {
    store.setMaskFutureTicks(!store.maskFutureTicks);
  });

  // Playback Transport Buttons
  document.getElementById('btnReset')?.addEventListener('click', resetSimulation);
  document.getElementById('btnStepBack')?.addEventListener('click', stepBackward);
  document.getElementById('btnPlayPause')?.addEventListener('click', togglePlay);
  document.getElementById('btnStepForward')?.addEventListener('click', stepForward);
  document.getElementById('btnComplete')?.addEventListener('click', jumpToEnd);

  // Timeline Scrubber
  document.getElementById('timelineScrubber')?.addEventListener('input', (e) => {
    pauseAnimation();
    store.setTick(parseInt(e.target.value, 10));
  });

  // Add Process Button
  document.getElementById('btnAddNewProcess')?.addEventListener('click', () => {
    const newId = store.addProcess();
    showToast(t(store.lang, 'toast_added', { id: newId }));
  });

  // Single Restore Default Button
  document.getElementById('btnRestoreDefault')?.addEventListener('click', () => {
    pauseAnimation();
    store.restoreDefault();
    showToast(t(store.lang, 'toast_restored'));
  });

  // Metrics Tabs
  document.getElementById('btnMetricsTabTable')?.addEventListener('click', () => {
    store.setMetricsTab('table');
  });
  document.getElementById('btnMetricsTabChart')?.addEventListener('click', () => {
    store.setMetricsTab('processChart');
  });
  document.getElementById('btnMetricsTabCompare')?.addEventListener('click', () => {
    store.setMetricsTab('algoCompare');
  });

  // Help Modal
  const helpModal = document.getElementById('helpModal');
  const openHelp = () => helpModal?.classList.remove('hidden');
  const closeHelp = () => helpModal?.classList.add('hidden');

  document.getElementById('btnOpenHelp')?.addEventListener('click', openHelp);
  document.getElementById('btnCloseHelp')?.addEventListener('click', closeHelp);
  document.getElementById('btnDismissHelp')?.addEventListener('click', closeHelp);
  helpModal?.addEventListener('click', (e) => {
    if (e.target === helpModal) closeHelp();
  });

  // Global Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if (e.key === 'Escape') {
      closeHelp();
      return;
    }
    if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stepForward();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stepBackward();
    } else if (e.key === 'Home') {
      e.preventDefault();
      resetSimulation();
    } else if (e.key === 'End') {
      e.preventDefault();
      jumpToEnd();
    }
  });
}

store.subscribe((state, changeType) => {
  syncControlsUI();

  if (changeType === 'lang') {
    applyTranslations();
    syncMatrixSchedule(state, { onSelectTick: selectTick });
    updateLiveStatusUI(state);
    renderMetricsPanel(state);
  } else if (changeType === 'tick') {
    updateMatrixTickHighlight(state);
    updateLiveStatusUI(state);
  } else if (changeType === 'metricsTab') {
    renderMetricsPanel(state);
  } else if (changeType === 'params') {
    syncMatrixSchedule(state, { onSelectTick: selectTick });
    updateLiveStatusUI(state);
    renderMetricsPanel(state);
  } else {
    renderMatrixStructure(state, { onSelectTick: selectTick });
    updateLiveStatusUI(state);
    renderMetricsPanel(state);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  bindEvents();
  applyTranslations();
  syncControlsUI();
  renderMatrixStructure(store, { onSelectTick: selectTick });
  updateLiveStatusUI(store);
  renderMetricsPanel(store);
});
