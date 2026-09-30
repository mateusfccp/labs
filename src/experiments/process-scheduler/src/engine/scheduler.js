/**
 * Core CPU Process Scheduling Engine with i18n explanation support.
 */

import { t as translate } from '../data/i18n.js?v=3';

export function calculateSchedule({
  processes,
  algorithm = 'PRIORITY_NP',
  quantum = 2,
  priorityRule = 'DESC',
  lang = 'en',
}) {
  if (!processes || processes.length === 0) {
    return {
      timeline: [],
      totalTicks: 0,
      metrics: {
        byProcess: {},
        avgTurnaround: '0.00',
        avgWaiting: '0.00',
        avgResponse: '0.00',
        avgEfficiency: '0.00',
        avgEfficiencyPct: '0.0',
        throughput: '0.000',
        cpuUtilization: '0.0',
      },
    };
  }

  const procList = processes.map((p, index) => {
    const burst = Math.max(1, parseInt(p.burst, 10) || 1);
    return {
      id: p.id,
      order: index,
      arrival: Math.max(0, parseInt(p.arrival, 10) || 0),
      burst,
      priority: parseInt(p.priority, 10) || 1,
      remaining: burst,
      executed: 0,
      startTime: null,
      finishTime: null,
    };
  });

  const timeline = [];
  let t = 0;
  let readyQueue = [];
  let currentRunning = null;
  let currentQuantumCount = 0;
  let pendingQuantumRequeue = null;

  const tieBreak = (a, b) => a.arrival - b.arrival || a.order - b.order;

  const comparePriorityOnly = (a, b) => {
    if (priorityRule === 'DESC') {
      return b.priority - a.priority;
    }
    return a.priority - b.priority;
  };

  const comparePriorityWithTieBreak = (a, b) => {
    const pDiff = comparePriorityOnly(a, b);
    return pDiff !== 0 ? pDiff : tieBreak(a, b);
  };

  while (procList.some((p) => p.remaining > 0)) {
    const newlyArrived = procList
      .filter((p) => p.arrival === t)
      .sort((a, b) => a.order - b.order);

    newlyArrived.forEach((np) => {
      const inQueue = readyQueue.some((item) => item.id === np.id);
      const isRunning = currentRunning && currentRunning.id === np.id;
      const isPendingRequeue = pendingQuantumRequeue && pendingQuantumRequeue.id === np.id;
      if (!inQueue && !isRunning && !isPendingRequeue) {
        readyQueue.push(np);
      }
    });

    let preemptedByQuantumId = null;
    if (pendingQuantumRequeue) {
      preemptedByQuantumId = pendingQuantumRequeue.id;
      readyQueue.push(pendingQuantumRequeue);
      pendingQuantumRequeue = null;
    }

    let explanation = '';

    if (algorithm === 'FCFS') {
      if (!currentRunning) {
        if (readyQueue.length > 0) {
          readyQueue.sort(tieBreak);
          currentRunning = readyQueue.shift();
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_fcfs', {
            id: currentRunning.id,
            arrival: currentRunning.arrival,
          });
        } else {
          explanation = translate(lang, 'exp_idle', { t });
        }
      }
    } else if (algorithm === 'SNJ') {
      if (!currentRunning) {
        if (readyQueue.length > 0) {
          readyQueue.sort((a, b) => a.burst - b.burst || tieBreak(a, b));
          currentRunning = readyQueue.shift();
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_snj', {
            id: currentRunning.id,
            burst: currentRunning.burst,
          });
        } else {
          explanation = translate(lang, 'exp_idle', { t });
        }
      }
    } else if (algorithm === 'SRTF') {
      if (readyQueue.length > 0) {
        readyQueue.sort((a, b) => a.remaining - b.remaining || tieBreak(a, b));
        const bestCandidate = readyQueue[0];

        if (!currentRunning) {
          currentRunning = readyQueue.shift();
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_srtf_start', {
            id: currentRunning.id,
            rem: currentRunning.remaining,
          });
        } else if (bestCandidate.remaining < currentRunning.remaining) {
          const prev = currentRunning;
          currentRunning = readyQueue.shift();
          readyQueue.push(prev);
          readyQueue.sort((a, b) => a.remaining - b.remaining || tieBreak(a, b));
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_srtf_preempt', {
            id: currentRunning.id,
            rem: currentRunning.remaining,
            prevId: prev.id,
            prevRem: prev.remaining,
          });
        }
      } else if (!currentRunning) {
        explanation = translate(lang, 'exp_idle', { t });
      }
    } else if (algorithm === 'HRRH') {
      readyQueue.forEach((p) => {
        const waitTime = t - p.arrival - p.executed;
        p.responseRatio = (waitTime + p.burst) / p.burst;
      });

      if (!currentRunning) {
        if (readyQueue.length > 0) {
          readyQueue.sort((a, b) => b.responseRatio - a.responseRatio || tieBreak(a, b));
          currentRunning = readyQueue.shift();
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_hrrh', {
            id: currentRunning.id,
            ratio: currentRunning.responseRatio.toFixed(2),
          });
        } else {
          explanation = translate(lang, 'exp_idle', { t });
        }
      }
    } else if (algorithm === 'PRIORITY_NP') {
      if (!currentRunning) {
        if (readyQueue.length > 0) {
          readyQueue.sort(comparePriorityWithTieBreak);
          currentRunning = readyQueue.shift();
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_prio_np', {
            id: currentRunning.id,
            prio: currentRunning.priority,
          });
        } else {
          explanation = translate(lang, 'exp_idle', { t });
        }
      }
    } else if (algorithm === 'PRIORITY_P') {
      if (readyQueue.length > 0) {
        readyQueue.sort(comparePriorityWithTieBreak);
        const bestCandidate = readyQueue[0];

        if (!currentRunning) {
          currentRunning = readyQueue.shift();
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_prio_p_start', {
            id: currentRunning.id,
            prio: currentRunning.priority,
          });
        } else if (comparePriorityOnly(bestCandidate, currentRunning) < 0) {
          const prev = currentRunning;
          currentRunning = readyQueue.shift();
          readyQueue.push(prev);
          readyQueue.sort(comparePriorityWithTieBreak);
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          explanation = translate(lang, 'exp_prio_p_preempt', {
            id: currentRunning.id,
            prio: currentRunning.priority,
            prevId: prev.id,
            prevPrio: prev.priority,
          });
        }
      } else if (!currentRunning) {
        explanation = translate(lang, 'exp_idle', { t });
      }
    } else if (algorithm === 'RR') {
      if (!currentRunning) {
        if (readyQueue.length > 0) {
          currentRunning = readyQueue.shift();
          currentQuantumCount = 0;
          if (currentRunning.startTime === null) currentRunning.startTime = t;
          if (preemptedByQuantumId && preemptedByQuantumId !== currentRunning.id) {
            explanation = translate(lang, 'exp_rr_switch', {
              prevId: preemptedByQuantumId,
              id: currentRunning.id,
              q: quantum,
            });
          } else if (preemptedByQuantumId === currentRunning.id) {
            explanation = translate(lang, 'exp_rr_renew', { id: currentRunning.id });
          } else {
            explanation = translate(lang, 'exp_rr_start', {
              id: currentRunning.id,
              q: quantum,
            });
          }
        } else {
          explanation = translate(lang, 'exp_idle', { t });
        }
      }
    }

    let executedTickProc = null;
    let executionIndex = null;
    let justFinished = false;

    if (currentRunning) {
      currentRunning.executed += 1;
      currentRunning.remaining -= 1;
      currentQuantumCount += 1;
      executedTickProc = currentRunning.id;
      executionIndex = currentRunning.executed;

      if (!explanation) {
        explanation = translate(lang, 'exp_running', {
          id: currentRunning.id,
          exec: executionIndex,
          burst: currentRunning.burst,
        });
      }

      if (newlyArrived.length > 0) {
        const otherArrivals = newlyArrived
          .filter((p) => !(p.id === currentRunning.id && executionIndex === 1))
          .map((p) => p.id);
        if (otherArrivals.length > 0) {
          explanation += translate(lang, 'exp_arrived_suffix', {
            ids: otherArrivals.join(', '),
          });
        }
      }

      if (currentRunning.remaining === 0) {
        currentRunning.finishTime = t + 1;
        justFinished = true;
        explanation += translate(lang, 'exp_completed_suffix', {
          id: currentRunning.id,
          finish: t + 1,
        });
      }
    }

    const orderedSnapshotQueue = [...readyQueue];
    if (algorithm === 'SNJ') {
      orderedSnapshotQueue.sort((a, b) => a.burst - b.burst || tieBreak(a, b));
    } else if (algorithm === 'SRTF') {
      orderedSnapshotQueue.sort((a, b) => a.remaining - b.remaining || tieBreak(a, b));
    } else if (algorithm === 'PRIORITY_NP' || algorithm === 'PRIORITY_P') {
      orderedSnapshotQueue.sort(comparePriorityWithTieBreak);
    } else if (algorithm === 'HRRH') {
      orderedSnapshotQueue.sort(
        (a, b) => (b.responseRatio || 0) - (a.responseRatio || 0) || tieBreak(a, b)
      );
    }

    const queueSnapshot = orderedSnapshotQueue.map((p) => {
      const wait = t - p.arrival - p.executed + 1;
      return {
        id: p.id,
        priority: p.priority,
        burst: p.burst,
        remaining: p.remaining,
        wait: Math.max(0, t - p.arrival - p.executed),
        ratio: ((Math.max(0, wait) + p.burst) / p.burst).toFixed(2),
      };
    });

    timeline.push({
      tick: t,
      runningId: executedTickProc,
      runningBurstIndex: executionIndex,
      isFinishedTick: justFinished,
      arrivals: newlyArrived.map((p) => p.id),
      readyQueue: queueSnapshot,
      explanation,
    });

    if (currentRunning && currentRunning.remaining === 0) {
      currentRunning = null;
      currentQuantumCount = 0;
    } else if (algorithm === 'RR' && currentRunning) {
      if (currentQuantumCount >= quantum) {
        pendingQuantumRequeue = currentRunning;
        currentRunning = null;
        currentQuantumCount = 0;
      }
    }

    t++;
    if (t > 250) break;
  }

  const totalTicks = t;

  const byProcess = {};
  let totalTurnaround = 0;
  let totalWaiting = 0;
  let totalResponse = 0;
  let totalEfficiency = 0;
  const busyTicks = timeline.filter((step) => step.runningId !== null).length;

  procList.forEach((p) => {
    const finish = p.finishTime !== null ? p.finishTime : totalTicks;
    const turnaround = finish - p.arrival;
    const waiting = turnaround - p.burst;
    const response = (p.startTime !== null ? p.startTime : p.arrival) - p.arrival;
    const efficiency = turnaround > 0 ? p.burst / turnaround : 1;

    byProcess[p.id] = {
      id: p.id,
      arrival: p.arrival,
      burst: p.burst,
      priority: p.priority,
      start: p.startTime !== null ? p.startTime : 0,
      finish,
      turnaround,
      waiting,
      response,
      efficiency: efficiency.toFixed(2),
      efficiencyPct: (efficiency * 100).toFixed(1),
    };

    totalTurnaround += turnaround;
    totalWaiting += waiting;
    totalResponse += response;
    totalEfficiency += efficiency;
  });

  const count = procList.length || 1;
  const avgEff = totalEfficiency / count;
  const metrics = {
    byProcess,
    avgTurnaround: (totalTurnaround / count).toFixed(2),
    avgWaiting: (totalWaiting / count).toFixed(2),
    avgResponse: (totalResponse / count).toFixed(2),
    avgEfficiency: avgEff.toFixed(2),
    avgEfficiencyPct: (avgEff * 100).toFixed(1),
    throughput: totalTicks > 0 ? (count / totalTicks).toFixed(3) : '0.000',
    cpuUtilization: totalTicks > 0 ? ((busyTicks / totalTicks) * 100).toFixed(1) : '0.0',
  };

  return {
    timeline,
    totalTicks,
    metrics,
  };
}
