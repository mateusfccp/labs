/**
 * Default workload, algorithm metadata, and color tokens for the CPU Process Scheduler.
 */

export const DEFAULT_PROCESSES = [
  { id: 'A', arrival: 0, burst: 4, priority: 1 },
  { id: 'B', arrival: 1, burst: 7, priority: 5 },
  { id: 'C', arrival: 5, burst: 4, priority: 3 },
  { id: 'D', arrival: 6, burst: 7, priority: 1 },
  { id: 'E', arrival: 8, burst: 3, priority: 5 },
];

export const ALGORITHMS = {
  PRIORITY_NP: {
    id: 'PRIORITY_NP',
    title: 'Priority (Non-Preemptive)',
    shortTitle: 'Priority (NP)',
    usesPriority: true,
    usesQuantum: false,
  },
  FCFS: {
    id: 'FCFS',
    title: 'FCFS (First-Come, First-Served)',
    shortTitle: 'FCFS',
    usesPriority: false,
    usesQuantum: false,
  },
  SNJ: {
    id: 'SNJ',
    title: 'SJF / SNJ (Shortest Job First)',
    shortTitle: 'SJF (NP)',
    usesPriority: false,
    usesQuantum: false,
  },
  SRTF: {
    id: 'SRTF',
    title: 'SRTF (Shortest Remaining Time First)',
    shortTitle: 'SRTF',
    usesPriority: false,
    usesQuantum: false,
  },
  HRRH: {
    id: 'HRRH',
    title: 'HRRN (Highest Response Ratio Next)',
    shortTitle: 'HRRN',
    usesPriority: false,
    usesQuantum: false,
  },
  RR: {
    id: 'RR',
    title: 'Round Robin (Time-Slice)',
    shortTitle: 'Round Robin',
    usesPriority: false,
    usesQuantum: true,
  },
  PRIORITY_P: {
    id: 'PRIORITY_P',
    title: 'Priority (Preemptive)',
    shortTitle: 'Priority (P)',
    usesPriority: true,
    usesQuantum: false,
  },
};

export const PROCESS_COLORS = {
  A: 'proc-bg-A',
  B: 'proc-bg-B',
  C: 'proc-bg-C',
  D: 'proc-bg-D',
  E: 'proc-bg-E',
  F: 'proc-bg-F',
  G: 'proc-bg-G',
  H: 'proc-bg-H',
  I: 'proc-bg-I',
  J: 'proc-bg-J',
};

export function getProcColorClass(id) {
  return PROCESS_COLORS[id] || 'bg-slate-200 text-slate-800 border-slate-300';
}
