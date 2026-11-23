import type { Gender } from '../../shared/ui/avatar.component';

/** Modèles du tableau de bord. Ils refléteront les DTO de l'API Spring Boot (projets/tâches). */

export type TaskPriority = 'urgent' | 'medium' | 'low';
export type ColumnId = 'not-started' | 'pending' | 'completed' | 'under-review';

/** Personne assignée (le genre sert à choisir l'avatar). */
export interface Person {
  name: string;
  gender: Gender;
}

export interface Task {
  id: string;
  /** Clé lisible (ex. WEB - 21). */
  key: string;
  title: string;
  /** Nom du projet / de la page parent. */
  project: string;
  priority: TaskPriority;
  /** Dates ISO (YYYY-MM-DD), formatées dans les templates avec le pipe `date`. */
  dueDate: string;
  createdAt: string;
  comments: number;
  assignees: Person[];
}

export interface KanbanColumn {
  id: ColumnId;
  label: string;
  tasks: Task[];
}

/** Carte de chiffre clé (mêmes champs que <app-stat-card>). */
export interface StatCard {
  title: string;
  value: string | number;
  unit?: string;
  delta: string;
  trend: 'up' | 'down';
  note: string;
}

export interface Board {
  stats: StatCard[];
  columns: KanbanColumn[];
  projects: string[];
  people: Person[];
}
