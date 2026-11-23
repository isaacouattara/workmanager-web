import type { BadgeTone } from '../../../shared/ui/badge.component';
import type { Gender } from '../../../shared/ui/avatar.component';
import type { IconName } from '../../../shared/ui/icons';

/**
 * Modèle unique d'un employé, partagé par les pages "Employees" et "Workload".
 * Il reflètera le DTO de l'API Spring Boot.
 */
export type EmployeeStatus = 'active' | 'inactive' | 'vacation';
export type Department = 'Marketing' | 'Finance' | 'Engineer' | 'HR' | 'IT';
export type TaskState = 'done' | 'in-progress' | 'none';

export interface Employee {
  id: string;
  name: string;
  email: string;
  /** Email vérifié (compte activé par l'invitation). */
  verified: boolean;
  gender: Gender;
  department: Department;
  role: string;
  status: EmployeeStatus;
  /** Date ISO (YYYY-MM-DD). */
  joiningDate: string;
  // --- Charge de travail (page Workload) ---
  loggedHours: number;
  capacityHours: number;
  skills: string[];
  /** Tâche en cours (null = aucune). */
  task: { title: string; state: TaskState } | null;
}

export const DEPARTMENTS: Department[] = ['Marketing', 'Finance', 'Engineer', 'HR', 'IT'];

/** Pastille de couleur de chaque département (tokens du thème). */
export const DEPARTMENT_DOT: Record<Department, string> = {
  Marketing: 'bg-danger',
  Finance: 'bg-tertiary',
  Engineer: 'bg-warning',
  HR: 'bg-success',
  IT: 'bg-info',
};

export const STATUS_META: Record<EmployeeStatus, { label: string; tone: BadgeTone; icon: IconName }> = {
  active: { label: 'Actif', tone: 'success', icon: 'checkCircle' },
  inactive: { label: 'Inactif', tone: 'danger', icon: 'cancelCircle' },
  vacation: { label: 'Congé', tone: 'warning', icon: 'vacation' },
};

export const TASK_STATE_META: Record<TaskState, { label: string; icon: IconName; cls: string }> = {
  done: { label: 'Terminée', icon: 'checkCircle', cls: 'text-success' },
  'in-progress': { label: 'En cours', icon: 'clock', cls: 'text-warning' },
  none: { label: 'Aucune tâche', icon: 'cancelCircle', cls: 'text-muted' },
};

/** Ancienneté en années (décimale). */
export function tenureYears(e: Pick<Employee, 'joiningDate'>): number {
  return Math.max(0, (Date.now() - new Date(e.joiningDate).getTime()) / (365.25 * 86_400_000));
}
