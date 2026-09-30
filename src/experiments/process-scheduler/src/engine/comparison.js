/**
 * Multi-Algorithm Benchmark Comparison Utility.
 */

import { ALGORITHMS } from '../data/presets.js?v=3';
import { calculateSchedule } from './scheduler.js?v=3';

export function compareAllAlgorithms({ processes, quantum = 2, priorityRule = 'DESC' }) {
  return Object.values(ALGORITHMS).map((algoMeta) => {
    const result = calculateSchedule({
      processes,
      algorithm: algoMeta.id,
      quantum,
      priorityRule,
    });

    return {
      id: algoMeta.id,
      title: algoMeta.title,
      shortTitle: algoMeta.shortTitle,
      avgTurnaround: parseFloat(result.metrics.avgTurnaround),
      avgWaiting: parseFloat(result.metrics.avgWaiting),
      avgResponse: parseFloat(result.metrics.avgResponse),
      avgEfficiency: parseFloat(result.metrics.avgEfficiency),
      avgEfficiencyPct: parseFloat(result.metrics.avgEfficiencyPct),
      throughput: parseFloat(result.metrics.throughput),
      totalTicks: result.totalTicks,
    };
  });
}
