import type { BadgeTone } from '../../shared/ui/badge.component';
import type { IconName } from '../../shared/ui/icons';
import type { ColumnId, TaskPriority } from './dashboard.models';

/** Apparence de chaque colonne (couleurs sémantiques = adaptées aux deux thèmes). */
export const COLUMN_META: Record<ColumnId, { icon: IconName; pill: string }> = {
  'not-started': { icon: 'clock', pill: 'bg-surface-2 text-ink' },
  pending: { icon: 'target', pill: 'bg-danger/15 text-danger' },
  completed: { icon: 'checkCircle', pill: 'bg-success/15 text-success' },
  'under-review': { icon: 'zap', pill: 'bg-info/15 text-info' },
};

export const PRIORITY_META: Record<TaskPriority, { label: string; tone: BadgeTone }> = {
  urgent: { label: 'Urgente', tone: 'danger' },
  medium: { label: 'Moyenne', tone: 'info' },
  low: { label: 'Faible', tone: 'success' },
};

export const PRIORITIES = Object.keys(PRIORITY_META) as TaskPriority[];
