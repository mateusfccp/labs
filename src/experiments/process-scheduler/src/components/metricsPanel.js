/**
 * Performance Metrics & Chart.js Visualization Component with i18n support.
 */

import { getProcColorClass } from '../data/presets.js?v=3';
import { t } from '../data/i18n.js?v=3';
import { compareAllAlgorithms } from '../engine/comparison.js?v=3';

let chartInstance = null;

export function renderMetricsPanel(store) {
  const { processes, metrics, metricsTab, lang } = store;
  const byProcess = metrics.byProcess || {};

  // 1. Render Metrics Table rows
  const metricsBody = document.getElementById('metricsTableBody');
  const metricsFoot = document.getElementById('metricsTableFoot');
  if (metricsBody) {
    metricsBody.innerHTML = '';

    processes.forEach((proc) => {
      const m = byProcess[proc.id] || {
        arrival: proc.arrival,
        burst: proc.burst,
        start: '-',
        finish: '-',
        turnaround: '-',
        waiting: '-',
        response: '-',
        efficiency: '-',
        efficiencyPct: '-',
      };
      const effDisplay =
        m.efficiency !== '-'
          ? `${Number(m.efficiency).toFixed(2)} <span class="text-[10px] text-sky-600/80 font-normal">(${m.efficiencyPct}%)</span>`
          : '-';
      const tr = document.createElement('tr');
      tr.className = 'hover:bg-slate-50/80 transition-colors';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-bold text-slate-800 flex items-center gap-2 whitespace-nowrap">
          <span class="w-5 h-5 rounded-md text-[11px] flex items-center justify-center font-mono font-bold border ${getProcColorClass(
            proc.id
          )}">
            ${proc.id}
          </span>
          <span>${t(lang, 'process_label', { id: proc.id })}</span>
        </td>
        <td class="py-2.5 px-2.5 text-center text-slate-500">${m.arrival}</td>
        <td class="py-2.5 px-2.5 text-center text-slate-500">${m.burst}</td>
        <td class="py-2.5 px-2.5 text-center text-slate-600">${m.start}</td>
        <td class="py-2.5 px-2.5 text-center text-slate-600">${m.finish}</td>
        <td class="py-2.5 px-2.5 text-center font-bold text-slate-900 bg-slate-50/60">${m.turnaround}</td>
        <td class="py-2.5 px-2.5 text-center font-bold text-indigo-700 bg-indigo-50/40">${m.waiting}</td>
        <td class="py-2.5 px-2.5 text-center font-semibold text-emerald-700">${m.response}</td>
        <td class="py-2.5 px-2.5 text-center font-bold text-sky-700 bg-sky-50/40 whitespace-nowrap">${effDisplay}</td>
      `;
      metricsBody.appendChild(tr);
    });
  }

  if (metricsFoot) {
    const avgEffFoot = metrics.avgEfficiency
      ? `${metrics.avgEfficiency} <span class="text-[10px] text-sky-600/80 font-normal">(${metrics.avgEfficiencyPct}%)</span>`
      : '0.00';
    metricsFoot.innerHTML = `
      <tr class="bg-slate-100/90 font-mono text-xs border-t-2 border-slate-200">
        <td colspan="5" class="py-2 px-3 text-right font-sans font-bold text-slate-600 uppercase text-[11px] tracking-wider">
          ${t(lang, 'row_averages')}
        </td>
        <td class="py-2 px-2.5 text-center font-extrabold text-slate-900">${
          metrics.avgTurnaround || '0.00'
        }</td>
        <td class="py-2 px-2.5 text-center font-extrabold text-indigo-700">${
          metrics.avgWaiting || '0.00'
        }</td>
        <td class="py-2 px-2.5 text-center font-bold text-emerald-700">${
          metrics.avgResponse || '0.00'
        }</td>
        <td class="py-2 px-2.5 text-center font-extrabold text-sky-700 whitespace-nowrap">${avgEffFoot}</td>
      </tr>
    `;
  }

  // 2. Update KPI Summary Cards
  const avgTurnaroundEl = document.getElementById('avgTurnaround');
  const avgWaitingEl = document.getElementById('avgWaiting');
  const avgResponseEl = document.getElementById('avgResponse');
  const avgEfficiencyEl = document.getElementById('avgEfficiency');
  const avgEfficiencyPctEl = document.getElementById('avgEfficiencyPct');
  const throughputEl = document.getElementById('throughputVal');
  const cpuUtilEl = document.getElementById('cpuUtilVal');

  if (avgTurnaroundEl) avgTurnaroundEl.textContent = metrics.avgTurnaround || '0.00';
  if (avgWaitingEl) avgWaitingEl.textContent = metrics.avgWaiting || '0.00';
  if (avgResponseEl) avgResponseEl.textContent = metrics.avgResponse || '0.00';
  if (avgEfficiencyEl) avgEfficiencyEl.textContent = metrics.avgEfficiency || '0.00';
  if (avgEfficiencyPctEl) avgEfficiencyPctEl.textContent = `${metrics.avgEfficiencyPct || '0.0'}%`;
  if (throughputEl) throughputEl.textContent = metrics.throughput || '0.000';
  if (cpuUtilEl) cpuUtilEl.textContent = `${metrics.cpuUtilization || '0.0'}%`;

  // 3. Handle Tabs
  updateMetricsTabVisibility(store);
  if (metricsTab === 'processChart') {
    renderProcessMetricsChart(store);
  } else if (metricsTab === 'algoCompare') {
    renderAlgorithmComparisonChart(store);
  }
}

export function updateMetricsTabVisibility(store) {
  const { metricsTab } = store;
  const tableContainer = document.getElementById('metricsTableView');
  const chartContainer = document.getElementById('metricsChartView');
  const algoTableContainer = document.getElementById('algoCompareTableContainer');

  const btnTabTable = document.getElementById('btnMetricsTabTable');
  const btnTabChart = document.getElementById('btnMetricsTabChart');
  const btnTabCompare = document.getElementById('btnMetricsTabCompare');

  const activeBtnClass =
    'px-3 py-1 rounded-md bg-white text-indigo-600 shadow-2xs font-semibold transition text-xs';
  const inactiveBtnClass =
    'px-3 py-1 rounded-md text-slate-600 hover:text-slate-900 font-medium transition text-xs';

  if (btnTabTable)
    btnTabTable.className = metricsTab === 'table' ? activeBtnClass : inactiveBtnClass;
  if (btnTabChart)
    btnTabChart.className = metricsTab === 'processChart' ? activeBtnClass : inactiveBtnClass;
  if (btnTabCompare)
    btnTabCompare.className = metricsTab === 'algoCompare' ? activeBtnClass : inactiveBtnClass;

  if (tableContainer && chartContainer) {
    if (metricsTab === 'table') {
      tableContainer.classList.remove('hidden');
      chartContainer.classList.add('hidden');
    } else {
      tableContainer.classList.add('hidden');
      chartContainer.classList.remove('hidden');
      if (algoTableContainer) {
        algoTableContainer.classList.toggle('hidden', metricsTab !== 'algoCompare');
      }
    }
  }
}

function renderProcessMetricsChart(store) {
  const canvas = document.getElementById('metricsCanvas');
  if (!canvas || typeof window.Chart === 'undefined') return;

  const { processes, metrics, lang } = store;
  const byProcess = metrics.byProcess || {};

  const labels = processes.map((p) => t(lang, 'process_label', { id: p.id }));
  const turnaroundData = processes.map((p) => byProcess[p.id]?.turnaround ?? 0);
  const waitingData = processes.map((p) => byProcess[p.id]?.waiting ?? 0);
  const responseData = processes.map((p) => byProcess[p.id]?.response ?? 0);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: t(lang, 'th_turnaround'),
          data: turnaroundData,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderRadius: 6,
        },
        {
          label: t(lang, 'th_waiting'),
          data: waitingData,
          backgroundColor: 'rgba(79, 70, 229, 0.85)',
          borderRadius: 6,
        },
        {
          label: t(lang, 'th_response'),
          data: responseData,
          backgroundColor: 'rgba(16, 185, 129, 0.85)',
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Inter, sans-serif', size: 11, weight: '600' },
            boxWidth: 12,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            font: { family: 'JetBrains Mono, monospace', size: 10 },
          },
          title: {
            display: true,
            text: t(lang, 'chart_axis_ticks'),
            font: { family: 'Inter, sans-serif', size: 10, weight: '600' },
          },
        },
        x: {
          ticks: {
            font: { family: 'Inter, sans-serif', size: 11, weight: '600' },
          },
        },
      },
    },
  });
}

function renderAlgorithmComparisonChart(store) {
  const canvas = document.getElementById('metricsCanvas');
  if (!canvas || typeof window.Chart === 'undefined') return;

  const { lang } = store;
  const comparison = compareAllAlgorithms({
    processes: store.processes,
    quantum: store.quantum,
    priorityRule: store.priorityRule,
  });

  const minWaiting = Math.min(...comparison.map((c) => c.avgWaiting));
  const maxEfficiency = Math.max(...comparison.map((c) => c.avgEfficiency));
  const labels = comparison.map((c) => c.shortTitle);
  const avgTr = comparison.map((c) => c.avgTurnaround);
  const avgTw = comparison.map((c) => c.avgWaiting);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new window.Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: t(lang, 'kpi_avg_tr'),
          data: avgTr,
          backgroundColor: comparison.map((c) =>
            c.id === store.algorithm ? 'rgba(15, 23, 42, 0.95)' : 'rgba(100, 116, 139, 0.55)'
          ),
          borderRadius: 5,
        },
        {
          label: t(lang, 'kpi_avg_tw'),
          data: avgTw,
          backgroundColor: comparison.map((c) =>
            c.id === store.algorithm ? 'rgba(79, 70, 229, 0.95)' : 'rgba(99, 102, 241, 0.5)'
          ),
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: { family: 'Inter, sans-serif', size: 11, weight: '600' },
            boxWidth: 12,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { family: 'JetBrains Mono, monospace', size: 10 },
          },
          title: {
            display: true,
            text: t(lang, 'chart_axis_avg_ticks'),
            font: { family: 'Inter, sans-serif', size: 10, weight: '600' },
          },
        },
        x: {
          ticks: {
            font: { family: 'Inter, sans-serif', size: 10, weight: '600' },
          },
        },
      },
    },
  });

  const compareBody = document.getElementById('algoCompareTableBody');
  if (compareBody) {
    compareBody.innerHTML = '';
    comparison.forEach((item) => {
      const isCurrent = item.id === store.algorithm;
      const isBestWait = Math.abs(item.avgWaiting - minWaiting) < 0.001;
      const isBestEff = Math.abs(item.avgEfficiency - maxEfficiency) < 0.001;
      const tr = document.createElement('tr');
      tr.className = `cursor-pointer transition-colors ${
        isCurrent ? 'bg-indigo-50/90 font-bold text-indigo-950' : 'hover:bg-slate-50 text-slate-600'
      }`;
      tr.innerHTML = `
        <td class="py-2 px-3 flex items-center gap-2 flex-wrap">
          <span class="w-2 h-2 rounded-full ${
            isCurrent ? 'bg-indigo-600' : 'bg-slate-300'
          }"></span>
          <span>${t(lang, `algo_${item.id}`)}</span>
          <span class="ml-auto flex items-center gap-1">
            ${
              isBestWait
                ? `<span class="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">${t(
                    lang,
                    'badge_optimal_tw'
                  )}</span>`
                : ''
            }
            ${
              isBestEff
                ? `<span class="text-[10px] font-sans font-semibold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">${t(
                    lang,
                    'badge_optimal_eff'
                  )}</span>`
                : ''
            }
          </span>
        </td>
        <td class="py-2 px-2.5 text-center font-mono">${item.avgTurnaround.toFixed(2)}</td>
        <td class="py-2 px-2.5 text-center font-mono font-bold text-indigo-700">${item.avgWaiting.toFixed(
          2
        )}</td>
        <td class="py-2 px-2.5 text-center font-mono text-emerald-700">${item.avgResponse.toFixed(
          2
        )}</td>
        <td class="py-2 px-2.5 text-center font-mono font-bold text-sky-700 whitespace-nowrap">${item.avgEfficiency.toFixed(
          2
        )} <span class="text-[10px] text-sky-600/80 font-normal">(${item.avgEfficiencyPct.toFixed(
          1
        )}%)</span></td>
      `;
      tr.addEventListener('click', () => {
        const algoSelect = document.getElementById('algorithmSelect');
        if (algoSelect) algoSelect.value = item.id;
        store.setAlgorithm(item.id);
      });
      compareBody.appendChild(tr);
    });
  }
}
