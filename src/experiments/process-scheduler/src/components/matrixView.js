/**
 * Split-Pane Schedule Matrix Component.
 * Left pane (`#paramsTable`): Fixed process badges, parameter inputs, and delete buttons.
 * Right pane (`#timelineTable`): Horizontally scrollable timeline ticks (0..N).
 */

import { ALGORITHMS, getProcColorClass } from '../data/presets.js?v=4';
import { t } from '../data/i18n.js?v=4';
import { showToast } from '../utils/toast.js?v=4';

export function renderMatrixStructure(store, { onSelectTick }) {
  const paramsBody = document.getElementById('paramsTableBody');
  if (!paramsBody) return;

  paramsBody.innerHTML = '';

  store.processes.forEach((proc, pIndex) => {
    const tr = document.createElement('tr');
    tr.id = `param-row-${proc.id}`;
    tr.className = 'bg-white hover:bg-slate-50/80 transition-colors';

    // Column 0: Process Badge
    const tdProc = document.createElement('td');
    tdProc.className = 'col-proc text-center';
    tdProc.innerHTML = `
      <span class="w-7 h-7 mx-auto rounded-lg flex items-center justify-center text-xs font-mono font-bold border shadow-2xs ${getProcColorClass(
        proc.id
      )}">
        ${proc.id}
      </span>
    `;
    tr.appendChild(tdProc);

    // Column 1: Arrival Time
    const tdArrival = document.createElement('td');
    tdArrival.className = 'col-param text-center';
    tdArrival.innerHTML = `
      <input
        type="number"
        inputmode="numeric"
        min="0"
        max="60"
        value="${proc.arrival}"
        data-pindex="${pIndex}"
        data-field="arrival"
        aria-label="Process ${proc.id} Arrival"
        class="matrix-input"
      >
    `;
    tr.appendChild(tdArrival);

    // Column 2: Burst Time
    const tdBurst = document.createElement('td');
    tdBurst.className = 'col-param text-center';
    tdBurst.innerHTML = `
      <input
        type="number"
        inputmode="numeric"
        min="1"
        max="60"
        value="${proc.burst}"
        data-pindex="${pIndex}"
        data-field="burst"
        aria-label="Process ${proc.id} Burst"
        class="matrix-input"
      >
    `;
    tr.appendChild(tdBurst);

    // Column 3: Priority
    const tdPriority = document.createElement('td');
    tdPriority.className = 'col-param text-center';
    tdPriority.innerHTML = `
      <input
        type="number"
        inputmode="numeric"
        min="1"
        max="99"
        value="${proc.priority}"
        data-pindex="${pIndex}"
        data-field="priority"
        aria-label="Process ${proc.id} Priority"
        class="matrix-input"
      >
    `;
    tr.appendChild(tdPriority);

    // Column 4: Dedicated Delete Button cell (tabindex="-1" so Tab skips it)
    const tdAction = document.createElement('td');
    tdAction.className = 'col-action text-center';
    tdAction.innerHTML = `
      <button
        type="button"
        tabindex="-1"
        data-remove-index="${pIndex}"
        aria-label="Remove Process ${proc.id}"
        class="btn-remove-proc w-6 h-6 mx-auto rounded-md inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    `;
    tr.appendChild(tdAction);

    paramsBody.appendChild(tr);
  });

  // Bind input events without destroying input elements
  paramsBody.querySelectorAll('input.matrix-input').forEach((input) => {
    input.addEventListener('focus', (e) => {
      e.target.select();
    });

    input.addEventListener('input', (e) => {
      const pIndex = parseInt(e.target.dataset.pindex, 10);
      const field = e.target.dataset.field;
      if (e.target.value !== '') {
        store.updateProcessField(pIndex, field, e.target.value);
      }
    });

    input.addEventListener('blur', (e) => {
      const pIndex = parseInt(e.target.dataset.pindex, 10);
      const field = e.target.dataset.field;
      const proc = store.processes[pIndex];
      if (proc) {
        if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
          e.target.value = proc[field];
        } else {
          store.updateProcessField(pIndex, field, e.target.value);
          e.target.value = store.processes[pIndex][field];
        }
      }
    });

    input.addEventListener('keydown', (e) => {
      const fields = ['arrival', 'burst', 'priority'];
      const pIndex = parseInt(e.target.dataset.pindex, 10);
      const field = e.target.dataset.field;
      const fIndex = fields.indexOf(field);

      if (e.key === 'Tab') {
        const totalInputs = store.processes.length * fields.length;
        const currentFlatIndex = pIndex * fields.length + fIndex;
        const nextFlatIndex = e.shiftKey ? currentFlatIndex - 1 : currentFlatIndex + 1;

        if (nextFlatIndex >= 0 && nextFlatIndex < totalInputs) {
          e.preventDefault();
          if (e.target.value !== '') {
            store.updateProcessField(pIndex, field, e.target.value);
          }
          const nextPIndex = Math.floor(nextFlatIndex / fields.length);
          const nextField = fields[nextFlatIndex % fields.length];
          const targetInput = paramsBody.querySelector(
            `input[data-pindex="${nextPIndex}"][data-field="${nextField}"]`
          );
          if (targetInput) {
            targetInput.focus();
            targetInput.select();
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (e.target.value !== '') {
          store.updateProcessField(pIndex, field, e.target.value);
        }
        const nextRowIndex = e.shiftKey ? pIndex - 1 : pIndex + 1;
        const targetInput = paramsBody.querySelector(
          `input[data-pindex="${nextRowIndex}"][data-field="${field}"]`
        );
        if (targetInput) {
          targetInput.focus();
          targetInput.select();
        }
      }
    });
  });

  // Bind remove buttons
  paramsBody.querySelectorAll('.btn-remove-proc').forEach((btn) => {
    btn.addEventListener('click', () => {
      const pIndex = parseInt(btn.dataset.removeIndex, 10);
      const procId = store.processes[pIndex]?.id;
      if (!store.removeProcess(pIndex)) {
        showToast(t(store.lang, 'toast_min_process'), 'warn');
      } else {
        showToast(t(store.lang, 'toast_removed', { id: procId }));
      }
    });
  });

  syncMatrixSchedule(store, { onSelectTick });
}

export function syncMatrixSchedule(store, { onSelectTick }) {
  const paramsBody = document.getElementById('paramsTableBody');
  const timelineHeaderRow = document.getElementById('timelineHeaderRow');
  const timelineBody = document.getElementById('timelineTableBody');
  const queueFooterRow = document.getElementById('queueFooterRow');
  const timelineWrapper = document.getElementById('timelineTableWrapper');

  if (!paramsBody || !timelineHeaderRow || !timelineBody || !queueFooterRow) return;

  const { processes, timeline, totalTicks, currentTick, maskFutureTicks, algorithm, lang } =
    store;

  if (timelineWrapper) {
    timelineWrapper.style.setProperty('--active-tick', String(currentTick));
  }

  const algoMeta = ALGORITHMS[algorithm];
  const usesPriority = Boolean(algoMeta?.usesPriority);

  const thPriority = document.getElementById('thPriorityCol');
  if (thPriority) {
    thPriority.classList.toggle('opacity-45', !usesPriority);
  }

  const titleEl = document.getElementById('matrixTitle');
  if (titleEl) {
    titleEl.textContent = t(lang, `algo_${algorithm}`);
  }

  const totalTimeEl = document.getElementById('totalTimeDisplay');
  if (totalTimeEl) totalTimeEl.textContent = totalTicks;

  const totalTicksLabel = document.getElementById('totalTicksLabel');
  if (totalTicksLabel) totalTicksLabel.textContent = Math.max(0, totalTicks - 1);

  processes.forEach((proc, pIndex) => {
    ['arrival', 'burst', 'priority'].forEach((field) => {
      const input = paramsBody.querySelector(
        `input[data-pindex="${pIndex}"][data-field="${field}"]`
      );
      if (input) {
        if (document.activeElement !== input && String(input.value) !== String(proc[field])) {
          input.value = proc[field];
        }
        if (field === 'priority') {
          input.classList.toggle('opacity-50', !usesPriority);
        }
      }
    });
  });

  // 1. Rebuild Tick Headers
  timelineHeaderRow.innerHTML = '';
  for (let tIdx = 0; tIdx < totalTicks; tIdx++) {
    const th = document.createElement('th');
    th.className = `tick-header ${tIdx === currentTick ? 'active-header-cell' : ''}`;
    th.id = `th-tick-${tIdx}`;
    th.textContent = tIdx;
    th.addEventListener('click', () => onSelectTick(tIdx));
    timelineHeaderRow.appendChild(th);
  }

  // 2. Rebuild Tick Rows
  timelineBody.innerHTML = '';
  processes.forEach((proc) => {
    const tr = document.createElement('tr');
    tr.id = `timeline-row-${proc.id}`;

    for (let tIdx = 0; tIdx < totalTicks; tIdx++) {
      const step = timeline[tIdx];
      const tdTick = document.createElement('td');
      tdTick.className = 'tick-col';
      tdTick.id = `cell-${proc.id}-${tIdx}`;

      let content = '';
      const isArrivedNow = proc.arrival === tIdx;
      const isRunningNow = step && step.runningId === proc.id;

      if (isArrivedNow) {
        tdTick.classList.add('cell-arrival');
      }

      if (isRunningNow) {
        content = `${step.runningBurstIndex}`;
        if (step.isFinishedTick) {
          tdTick.classList.add('cell-finish');
        }
        tdTick.classList.add(...getProcColorClass(proc.id).split(' '));
      } else if (isArrivedNow) {
        tdTick.classList.add('text-indigo-600', 'bg-indigo-50/40');
      } else {
        tdTick.classList.add('bg-white');
      }

      if (maskFutureTicks && tIdx > currentTick) {
        tdTick.classList.add('tick-masked');
      }

      tdTick.textContent = content;
      tdTick.addEventListener('click', () => onSelectTick(tIdx));
      tr.appendChild(tdTick);
    }

    timelineBody.appendChild(tr);
  });

  // 3. Rebuild Footer CPU Row
  queueFooterRow.innerHTML = '';
  for (let tIdx = 0; tIdx < totalTicks; tIdx++) {
    const step = timeline[tIdx];
    const tdQueue = document.createElement('td');
    tdQueue.className = 'tick-col';
    tdQueue.id = `queue-cell-${tIdx}`;

    if (step && step.runningId) {
      tdQueue.textContent = step.runningId;
      tdQueue.classList.add(...getProcColorClass(step.runningId).split(' '), 'font-bold');
    } else {
      tdQueue.textContent = '—';
      tdQueue.classList.add('bg-slate-50', 'text-slate-300');
    }

    if (maskFutureTicks && tIdx > currentTick) {
      tdQueue.classList.add('tick-masked');
    }

    tdQueue.addEventListener('click', () => onSelectTick(tIdx));
    queueFooterRow.appendChild(tdQueue);
  }
}

export function updateMatrixTickHighlight(store) {
  const { processes, totalTicks, currentTick, maskFutureTicks } = store;

  const timelineWrapper = document.getElementById('timelineTableWrapper');
  if (timelineWrapper) {
    timelineWrapper.style.setProperty('--active-tick', String(currentTick));
  }

  for (let tIdx = 0; tIdx < totalTicks; tIdx++) {
    const th = document.getElementById(`th-tick-${tIdx}`);
    if (th) {
      th.classList.toggle('active-header-cell', tIdx === currentTick);
    }

    const qCell = document.getElementById(`queue-cell-${tIdx}`);
    if (qCell) {
      qCell.classList.toggle('tick-masked', maskFutureTicks && tIdx > currentTick);
    }
  }

  processes.forEach((proc) => {
    for (let tIdx = 0; tIdx < totalTicks; tIdx++) {
      const cell = document.getElementById(`cell-${proc.id}-${tIdx}`);
      if (!cell) continue;
      cell.classList.toggle('tick-masked', maskFutureTicks && tIdx > currentTick);
    }
  });

  if (document.activeElement?.classList.contains('matrix-input')) return;

  const container = document.getElementById('tableScrollContainer');
  const activeHeader = document.getElementById(`th-tick-${currentTick}`);

  if (container && activeHeader) {
    const cellLeft = activeHeader.offsetLeft;
    const cellWidth = activeHeader.offsetWidth;
    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;

    if (cellLeft < scrollLeft) {
      container.scrollTo({
        left: Math.max(0, cellLeft - 12),
        behavior: 'smooth',
      });
    } else if (cellLeft + cellWidth > scrollLeft + containerWidth) {
      container.scrollTo({
        left: cellLeft - containerWidth + cellWidth + 16,
        behavior: 'smooth',
      });
    }
  }
}
