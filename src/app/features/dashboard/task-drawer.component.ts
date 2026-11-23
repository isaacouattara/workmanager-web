import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { DetailRowComponent } from '../../shared/ui/detail-row.component';
import { DrawerComponent } from '../../shared/ui/drawer.component';
import { IconComponent } from '../../shared/ui/icon.component';
import { PRIORITY_META } from './dashboard.meta';
import { Task } from './dashboard.models';

/** Tiroir de détails d'une tâche. */
@Component({
  selector: 'app-task-drawer',
  imports: [DrawerComponent, DetailRowComponent, BadgeComponent, AvatarComponent, IconComponent, DatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer [title]="task().title" [subtitle]="task().key" (closed)="closed.emit()">
      <app-badge [tone]="priority().tone" icon="flag">{{ priority().label }}</app-badge>

      <div class="mt-5">
        <app-detail-row label="Projet">{{ task().project }}</app-detail-row>
        <app-detail-row label="Statut">{{ columnLabel() }}</app-detail-row>
        <app-detail-row label="Échéance">{{ task().dueDate | date: 'MMM d, y' }}</app-detail-row>
        <app-detail-row label="Créée le">{{ task().createdAt | date: 'MMM d, y' }}</app-detail-row>
        <app-detail-row label="Commentaires">{{ task().comments }}</app-detail-row>
      </div>

      <h3 class="mb-3 mt-7 text-xs font-semibold uppercase tracking-wide text-muted">Personnes assignées</h3>
      @for (person of task().assignees; track person.name) {
        <div class="flex items-center gap-3 py-2 text-sm">
          <app-avatar [name]="person.name" [gender]="person.gender" /> {{ person.name }}
        </div>
      } @empty {
        <p class="text-sm text-muted">Aucune personne assignée.</p>
      }

      <div drawerFooter class="flex justify-between gap-3">
        <button type="button" class="btn bg-danger/10 text-danger hover:bg-danger/20" (click)="removed.emit(task().id)">
          <app-icon name="trash" [size]="16" /> Supprimer
        </button>
        <button type="button" class="btn-soft" (click)="closed.emit()">Fermer</button>
      </div>
    </app-drawer>
  `,
})
export class TaskDrawerComponent {
  readonly task = input.required<Task>();
  readonly columnLabel = input('');
  readonly closed = output<void>();
  readonly removed = output<string>();

  protected priority = () => PRIORITY_META[this.task().priority];
}
