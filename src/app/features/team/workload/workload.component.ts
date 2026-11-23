import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AvatarComponent } from '../../../shared/ui/avatar.component';
import { FilterSelectComponent } from '../../../shared/ui/filter-select.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { PanelComponent } from '../../../shared/ui/panel.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';
import { StatCardComponent } from '../../../shared/ui/stat-card.component';
import { DataTableComponent } from '../../../shared/ui/table/data-table.component';
import { TableCellDirective } from '../../../shared/ui/table/table-cell.directive';
import type { TableColumn } from '../../../shared/ui/table/table.models';
import { EmployeeCreateModalComponent } from '../shared/employee-create-modal.component';
import { EmployeeDrawerComponent } from '../shared/employee-drawer.component';
import { DEPARTMENTS, Employee, TASK_STATE_META } from '../shared/employee.model';
import { EmployeesService } from '../shared/employees.service';
import { TONE_BAR, WORKLOAD_FILTERS, workloadPercent, workloadTone } from './workload';

/**
 * Page "Workload" : même schéma que Employees (stats -> panel -> barre d'outils -> tableau),
 * avec le MÊME tableau générique. Seules les colonnes et leurs cellules changent.
 */
@Component({
  selector: 'app-workload',
  imports: [
    StatCardComponent, PanelComponent, SearchFieldComponent, FilterSelectComponent, DataTableComponent, TableCellDirective,
    AvatarComponent, IconComponent, EmployeeCreateModalComponent, EmployeeDrawerComponent,
  ],
  templateUrl: './workload.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkloadComponent {
  private readonly service = inject(EmployeesService);
  private readonly all = this.service.employees;

  protected readonly query = signal('');
  protected readonly department = signal('');
  protected readonly load = signal('');
  protected readonly showFilters = signal(false);
  protected readonly creating = signal(false);
  protected readonly selected = signal<Employee | null>(null);

  protected readonly departments: string[] = DEPARTMENTS;
  protected readonly loads = Object.keys(WORKLOAD_FILTERS);
  protected readonly taskMeta = TASK_STATE_META;

  private readonly toneOf = (e: Employee) => workloadTone(workloadPercent(e));

  protected readonly stats = computed(() => {
    const list = this.all();
    const count = (key: string) => list.filter((e) => WORKLOAD_FILTERS[key].includes(this.toneOf(e))).length;
    return { total: list.length, over: count('Over capacity'), target: count('On target'), under: count('Under-used') };
  });

  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    const tones = WORKLOAD_FILTERS[this.load()];
    return this.all().filter(
      (e) =>
        (!q || `${e.name} ${e.role}`.toLowerCase().includes(q)) &&
        (!this.department() || e.department === this.department()) &&
        (!tones || tones.includes(this.toneOf(e))),
    );
  });

  protected readonly activeFilters = computed(() => [this.department(), this.load()].filter(Boolean).length);

  protected readonly columns: TableColumn<Employee>[] = [
    { key: 'name', header: 'Nom', sortable: true },
    { key: 'department', header: 'Département', sortable: true },
    { key: 'workload', header: 'Charge', sortable: true, sortValue: (e) => workloadPercent(e), class: 'w-64' },
    { key: 'task', header: 'Tâche actuelle', sortable: true, sortValue: (e) => e.task?.title ?? '' },
    { key: 'actions', header: '', class: 'w-12' },
  ];
  protected readonly rowId = (e: Employee): string => e.id;

  // --- Helpers de présentation (utilisés par le template) ---
  protected percent = workloadPercent;
  protected barClass = (e: Employee): string => TONE_BAR[this.toneOf(e)];
  protected isOver = (e: Employee): boolean => workloadPercent(e) > 100;
  protected barWidth = (e: Employee): number => Math.min(workloadPercent(e), 100);

  protected taskMetaFor(task: Employee['task']): (typeof TASK_STATE_META)[keyof typeof TASK_STATE_META] | null {
    return task ? TASK_STATE_META[task.state] : null;
  }

  protected clearFilters(): void {
    this.department.set('');
    this.load.set('');
  }

  protected remove(id: string): void {
    this.service.remove(id);
    this.selected.set(null);
  }
}
