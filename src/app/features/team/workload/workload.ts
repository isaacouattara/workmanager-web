import type { Employee } from '../shared/employee.model';

/**
 * Règles métier de la charge de travail (fonctions pures, faciles à tester).
 *  > 100 % : surcharge (danger)   90–100 % : optimal (success)   70–89 % : bon (info)
 *  60–69 % : modéré (warning)     < 60 % : sous-utilisé (danger)
 */
export type WorkloadTone = 'over' | 'optimal' | 'good' | 'moderate' | 'low';

export const workloadPercent = (e: Pick<Employee, 'loggedHours' | 'capacityHours'>): number =>
  Math.round((e.loggedHours / e.capacityHours) * 100);

export function workloadTone(percent: number): WorkloadTone {
  if (percent > 100) return 'over';
  if (percent >= 90) return 'optimal';
  if (percent >= 70) return 'good';
  if (percent >= 60) return 'moderate';
  return 'low';
}

export const TONE_BAR: Record<WorkloadTone, string> = {
  over: 'bg-danger',
  optimal: 'bg-success',
  good: 'bg-info',
  moderate: 'bg-warning',
  low: 'bg-danger',
};

/** Libellés du filtre "Workload" et tons qu'ils regroupent. */
export const WORKLOAD_FILTERS: Record<string, WorkloadTone[]> = {
  'Surcharge': ['over'],
  'Dans les objectifs': ['optimal', 'good'],
  'Sous-utilisé': ['moderate', 'low'],
};
