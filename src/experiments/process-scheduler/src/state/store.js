/**
 * Reactive State Store for the CPU Process Scheduler.
 * Persists configuration, processes, and language in localStorage across reloads.
 */

import { ALGORITHMS, DEFAULT_PROCESSES } from '../data/presets.js?v=3';
import { SUPPORTED_LANGUAGES, detectSystemLanguage } from '../data/i18n.js?v=3';
import { calculateSchedule } from '../engine/scheduler.js?v=3';

const STORAGE_KEY = 'labs_process_scheduler_config_v1';

class SimulatorStore {
  constructor() {
    this.processes = JSON.parse(JSON.stringify(DEFAULT_PROCESSES));
    this.algorithm = 'PRIORITY_NP';
    this.quantum = 2;
    this.priorityRule = 'DESC';
    this.animationSpeed = 420;
    this.lang = detectSystemLanguage();
    this.currentTick = 0;
    this.isPlaying = false;
    this.maskFutureTicks = false;
    this.metricsTab = 'table'; // 'table' | 'processChart' | 'algoCompare'

    this.loadFromStorage();

    this.timeline = [];
    this.totalTicks = 0;
    this.metrics = {};

    this.listeners = new Set();
    this.recalculate(false);
    this.currentTick = 0;
  }

  loadFromStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);

      if (Array.isArray(parsed.processes) && parsed.processes.length > 0) {
        this.processes = parsed.processes.map((p, idx) => ({
          id: String(p.id || String.fromCharCode(65 + idx)),
          arrival: Math.max(0, Math.min(60, parseInt(p.arrival, 10) || 0)),
          burst: Math.max(1, Math.min(60, parseInt(p.burst, 10) || 1)),
          priority: Math.max(1, Math.min(99, parseInt(p.priority, 10) || 1)),
        }));
      }
      if (parsed.algorithm && ALGORITHMS[parsed.algorithm]) {
        this.algorithm = parsed.algorithm;
      }
      if (parsed.quantum) {
        this.quantum = Math.max(1, Math.min(25, parseInt(parsed.quantum, 10) || 2));
      }
      if (parsed.priorityRule === 'ASC' || parsed.priorityRule === 'DESC') {
        this.priorityRule = parsed.priorityRule;
      }
      if (parsed.animationSpeed) {
        this.animationSpeed = parseInt(parsed.animationSpeed, 10) || 420;
      }
      if (parsed.lang && SUPPORTED_LANGUAGES.includes(parsed.lang)) {
        this.lang = parsed.lang;
      }
    } catch (_) {
      // Ignore malformed storage data
    }
  }

  saveToStorage() {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      const payload = {
        processes: this.processes,
        algorithm: this.algorithm,
        quantum: this.quantum,
        priorityRule: this.priorityRule,
        animationSpeed: this.animationSpeed,
        lang: this.lang,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (_) {
      // Ignore storage quota errors
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(changeType = 'structure') {
    this.listeners.forEach((fn) => fn(this, changeType));
  }

  recalculate(resetTick = false) {
    const result = calculateSchedule({
      processes: this.processes,
      algorithm: this.algorithm,
      quantum: this.quantum,
      priorityRule: this.priorityRule,
      lang: this.lang,
    });

    this.timeline = result.timeline;
    this.totalTicks = result.totalTicks;
    this.metrics = result.metrics;

    if (resetTick) {
      this.currentTick = 0;
    } else if (this.currentTick >= this.totalTicks) {
      this.currentTick = Math.max(0, this.totalTicks - 1);
    }
  }

  setLanguage(lang) {
    if (!SUPPORTED_LANGUAGES.includes(lang) || this.lang === lang) return;
    this.lang = lang;
    this.saveToStorage();
    this.recalculate(false);
    this.notify('lang');
  }

  setAlgorithm(algorithm) {
    if (!ALGORITHMS[algorithm] || this.algorithm === algorithm) return;
    this.algorithm = algorithm;
    this.saveToStorage();
    this.recalculate(false);
    this.notify('params');
  }

  setQuantum(quantum) {
    const val = Math.max(1, Math.min(25, parseInt(quantum, 10) || 2));
    if (this.quantum === val) return;
    this.quantum = val;
    this.saveToStorage();
    this.recalculate(false);
    this.notify('params');
  }

  setPriorityRule(rule) {
    if (this.priorityRule === rule) return;
    this.priorityRule = rule;
    this.saveToStorage();
    this.recalculate(false);
    this.notify('params');
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = parseInt(speed, 10) || 420;
    this.saveToStorage();
  }

  updateProcessField(index, field, rawValue) {
    if (!this.processes[index]) return;
    let val = parseInt(rawValue, 10);
    if (isNaN(val)) return;

    if (field === 'arrival') {
      val = Math.max(0, Math.min(60, val));
    } else if (field === 'burst') {
      val = Math.max(1, Math.min(60, val));
    } else if (field === 'priority') {
      val = Math.max(1, Math.min(99, val));
    }

    if (this.processes[index][field] === val) return;

    this.processes[index][field] = val;
    this.saveToStorage();
    this.recalculate(false);
    this.notify('params');
  }

  addProcess() {
    const usedIds = this.processes.map((p) => p.id);
    let nextId = 'A';
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      if (!usedIds.includes(letter)) {
        nextId = letter;
        break;
      }
    }

    const lastArrival =
      this.processes.length > 0 ? Math.max(...this.processes.map((p) => p.arrival)) : 0;

    this.processes.push({
      id: nextId,
      arrival: Math.min(60, lastArrival + 2),
      burst: 4,
      priority: 1,
    });

    this.saveToStorage();
    this.recalculate(false);
    this.notify('structure');
    return nextId;
  }

  removeProcess(index) {
    if (this.processes.length <= 1) {
      return false;
    }
    this.processes.splice(index, 1);
    this.saveToStorage();
    this.recalculate(false);
    this.notify('structure');
    return true;
  }

  restoreDefault() {
    this.processes = JSON.parse(JSON.stringify(DEFAULT_PROCESSES));
    this.algorithm = 'PRIORITY_NP';
    this.priorityRule = 'DESC';
    this.quantum = 2;
    this.maskFutureTicks = false;
    this.saveToStorage();
    this.recalculate(true);
    this.notify('structure');
  }

  setTick(tick, enableMask = null) {
    const clamped = Math.max(0, Math.min(Math.max(0, this.totalTicks - 1), tick));
    const maskChanged = enableMask !== null && enableMask !== this.maskFutureTicks;
    if (enableMask !== null) {
      this.maskFutureTicks = Boolean(enableMask);
    }
    if (clamped !== this.currentTick || maskChanged) {
      this.currentTick = clamped;
      this.notify('tick');
    }
  }

  setMaskFutureTicks(mask) {
    this.maskFutureTicks = Boolean(mask);
    this.notify('tick');
  }

  setMetricsTab(tab) {
    this.metricsTab = tab;
    this.notify('metricsTab');
  }
}

export const store = new SimulatorStore();
