import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AvatarComponent } from '../../../shared/ui/avatar.component';
import { BadgeComponent } from '../../../shared/ui/badge.component';
import { DetailRowComponent } from '../../../shared/ui/detail-row.component';
import { DrawerComponent } from '../../../shared/ui/drawer.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { DEPARTMENT_DOT, Employee, STATUS_META, TASK_STATE_META, tenureYears } from './employee.model';

/** Tiroir de détails d'un employé (utilisé par les pages Employees et Workload). */
@Component({
  selector: 'app-employee-drawer',
  imports: [DrawerComponent, DetailRowComponent, AvatarComponent, BadgeComponent, IconComponent, DatePipe, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer [title]="employee().name" [subtitle]="employee().role" (closed)="closed.emit()">
      <div class="flex items-center gap-4">
        <app-avatar [name]="employee().name" [gender]="employee().gender" size="xl" />
        <div class="min-w-0 space-y-2">
          <app-badge [tone]="status().tone" [icon]="status().icon">{{ status().label }}</app-badge>
          <p class="flex items-center gap-2 truncate text-sm text-muted">
            <app-icon [name]="employee().verified ? 'verified' : 'alert'" [size]="16"
                      [class]="employee().verified ? 'text-success' : 'text-danger'" />
            {{ employee().email }}
          </p>
        </div>
      </div>

      <h3 class="mb-1 mt-7 text-xs font-semibold uppercase tracking-wide text-muted">Emploi</h3>
      <app-detail-row label="Département">
        <span class="inline-flex items-center gap-2"><span class="size-2 rounded-full" [class]="dot()"></span>{{ employee().department }}</span>
      </app-detail-row>
      <app-detail-row label="Fonction">{{ employee().role }}</app-detail-row>
      <app-detail-row label="Date d’arrivée">{{ employee().joiningDate | date: 'MMM d, y' }}</app-detail-row>
      <app-detail-row label="Ancienneté">{{ tenure() | number: '1.1-1' }} ans</app-detail-row>

      <h3 class="mb-1 mt-7 text-xs font-semibold uppercase tracking-wide text-muted">Charge de travail</h3>
      <app-detail-row label="Heures">{{ employee().loggedHours }} / {{ employee().capacityHours }}h</app-detail-row>
      <app-detail-row label="Tâche actuelle">
          <span class="text-muted">Aucune tâche active</span>
      </app-detail-row>
      <app-detail-row label="Compétences">
        @if (employee().skills.length) {
          <span class="flex flex-wrap justify-end gap-1.5">
            @for (skill of employee().skills; track skill) {
              <span class="pill bg-primary/25 text-primary-strong">{{ skill }}</span>
            }
          </span>
        } @else {
          <span class="text-muted">—</span>
        }
      </app-detail-row>

      <div drawerFooter class="flex justify-between gap-3">
        <button type="button" class="btn bg-danger/10 text-danger hover:bg-danger/20" (click)="removed.emit(employee().id)">
          <app-icon name="trash" [size]="16" /> Supprimer
        </button>
        <button type="button" class="btn-soft" (click)="closed.emit()">Fermer</button>
      </div>
    </app-drawer>
  `,
})
export class EmployeeDrawerComponent {
  readonly employee = input.required<Employee>();
  readonly closed = output<void>();
  readonly removed = output<string>();

  protected status = () => STATUS_META[this.employee().status];
  protected dot = () => DEPARTMENT_DOT[this.employee().department];
  protected tenure = () => tenureYears(this.employee());
  protected taskMeta = (state: keyof typeof TASK_STATE_META) => TASK_STATE_META[state];
}
