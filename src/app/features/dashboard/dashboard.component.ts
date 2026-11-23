import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AvatarComponent } from '../../shared/ui/avatar.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { FilterSelectComponent } from '../../shared/ui/filter-select.component';
import { IconComponent } from '../../shared/ui/icon.component';
import type { IconName } from '../../shared/ui/icons';
import { PanelComponent } from '../../shared/ui/panel.component';
import { SearchFieldComponent } from '../../shared/ui/search-field.component';
import { StatCardComponent } from '../../shared/ui/stat-card.component';
import { COLUMN_META, PRIORITY_META } from './dashboard.meta';
import { KanbanColumn, Person, StatCard, Task } from './dashboard.models';
import { DashboardService } from './dashboard.service';
import { CreatedTask, TaskCreateModalComponent } from './task-create-modal.component';
import { TaskDrawerComponent } from './task-drawer.component';

type ViewId = 'kanban' | 'timeline' | 'spreadsheet' | 'calendar';

/**
 * Tableau de bord : chiffres clés + tableau Kanban (glisser-déposer avec Angular CDK).
 * Même schéma que les autres pages : stat cards -> panel -> barre d'outils -> contenu.
 */
@Component({
  selector: 'app-dashboard',
  imports: [
    DatePipe, CdkDropListGroup, CdkDropList, CdkDrag, StatCardComponent, PanelComponent, SearchFieldComponent,
    FilterSelectComponent, IconComponent, AvatarComponent, BadgeComponent, TaskCreateModalComponent, TaskDrawerComponent,
  ],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private readonly service = inject(DashboardService);

  // --- Données ---
  protected readonly stats = signal<StatCard[]>([]);
  protected readonly columns = signal<KanbanColumn[]>([]);
  protected readonly projects = signal<string[]>([]);
  protected readonly people = signal<Person[]>([]);

  // --- Barre d'outils ---
  protected readonly view = signal<ViewId>('kanban');
  protected readonly query = signal('');
  protected readonly priority = signal('');
  protected readonly showFilters = signal(false);
  protected readonly priorityOptions = Object.values(PRIORITY_META).map((p) => p.label);

  // --- Modal / tiroir ---
  protected readonly creating = signal(false);
  protected readonly selected = signal<Task | null>(null);

  protected readonly views: { id: ViewId; label: string; icon: IconName }[] = [
    { id: 'kanban', label: 'Kanban', icon: 'kanban' },
    { id: 'timeline', label: 'Chronologie', icon: 'list' },
    { id: 'spreadsheet', label: 'Tableau', icon: 'table' },
    { id: 'calendar', label: 'Calendrier', icon: 'calendar' },
  ];
  protected readonly columnMeta = COLUMN_META;
  protected readonly priorityMeta = PRIORITY_META;

  /** Un filtre est actif : le glisser-déposer est désactivé (les listes affichées sont des copies). */
  protected readonly filtering = computed(() => !!this.query().trim() || !!this.priority());

  /** Colonnes affichées. Sans filtre, on garde les MÊMES tableaux (indispensable au drag & drop). */
  protected readonly visibleColumns = computed(() => {
    if (!this.filtering()) return this.columns();
    const q = this.query().trim().toLowerCase();
    return this.columns().map((col) => ({
      ...col,
      tasks: col.tasks.filter(
        (t) =>
          (!q || `${t.title} ${t.key} ${t.project}`.toLowerCase().includes(q)) &&
          (!this.priority() || PRIORITY_META[t.priority].label === this.priority()),
      ),
    }));
  });

  /** Numéro de la prochaine tâche (WEB - n). */
  protected readonly nextNumber = computed(() => {
    const numbers = this.columns().flatMap((c) => c.tasks.map((t) => parseInt(t.key.replace(/\D/g, ''), 10) || 0));
    return Math.max(0, ...numbers) + 1;
  });

  constructor() {
    this.service
      .getBoard()
      .pipe(takeUntilDestroyed())
      .subscribe((board) => {
        this.stats.set(board.stats);
        this.columns.set(board.columns);
        this.projects.set(board.projects);
        this.people.set(board.people);
      });
  }

  /** Déplacement d'une carte : dans la même colonne (ordre) ou vers une autre (statut). */
  protected drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
    }
    // Tableaux modifiés "en place" : on émet une nouvelle référence pour notifier le signal.
    this.columns.update((cols) => [...cols]);
    // TODO API : PATCH /api/tasks/{id} { status, position }
  }

  protected addTask({ task, columnId }: CreatedTask): void {
    this.columns.update((cols) => cols.map((c) => (c.id === columnId ? { ...c, tasks: [task, ...c.tasks] } : c)));
  }

  protected removeTask(id: string): void {
    this.columns.update((cols) => cols.map((c) => ({ ...c, tasks: c.tasks.filter((t) => t.id !== id) })));
    this.selected.set(null);
  }

  protected columnLabelOf(task: Task): string {
    return this.columns().find((c) => c.tasks.some((t) => t.id === task.id))?.label ?? '';
  }

  protected viewLabel(): string {
    return this.views.find((v) => v.id === this.view())?.label ?? '';
  }

  protected columnMetaFor(column: KanbanColumn) {
    return COLUMN_META[column.id];
  }

  protected priorityMetaFor(task: Task) {
    return PRIORITY_META[task.priority];
  }
}
