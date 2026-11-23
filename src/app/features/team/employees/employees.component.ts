import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { AvatarComponent } from '../../../shared/ui/avatar.component';
import { BadgeComponent } from '../../../shared/ui/badge.component';
import { FilterSelectComponent } from '../../../shared/ui/filter-select.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { PanelComponent } from '../../../shared/ui/panel.component';
import { SearchFieldComponent } from '../../../shared/ui/search-field.component';
import { StatCardComponent } from '../../../shared/ui/stat-card.component';
import { TableCellDirective } from '../../../shared/ui/table/table-cell.directive';
import { DataTableComponent } from '../../../shared/ui/table/data-table.component';
import type { TableColumn } from '../../../shared/ui/table/table.models';
import { EmployeeCreateModalComponent } from '../shared/employee-create-modal.component';
import { EmployeeDrawerComponent } from '../shared/employee-drawer.component';
import { DEPARTMENTS, DEPARTMENT_DOT, Employee, STATUS_META, tenureYears } from '../shared/employee.model';
import { EmployeesService } from '../shared/employees.service';

/**
 * Page "Employees" : chiffres clés + liste (recherche, filtres, tri, pagination, export CSV).
 * C'est la page de RÉFÉRENCE du design : les autres pages suivent ce même schéma
 * (stat cards -> panel -> barre d'outils -> tableau).
 */
@Component({
  selector: 'app-employees',
  imports: [
    DatePipe, StatCardComponent, PanelComponent, SearchFieldComponent, FilterSelectComponent, DataTableComponent,
    TableCellDirective, AvatarComponent, BadgeComponent, IconComponent, EmployeeCreateModalComponent, EmployeeDrawerComponent,
  ],
  templateUrl: './employees.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesComponent {
  private readonly service = inject(EmployeesService);
  private readonly all = this.service.employees;

  // --- État de la barre d'outils ---
  protected readonly query = signal('');
  protected readonly unverifiedOnly = signal(false);
  protected readonly showFilters = signal(false);
  protected readonly department = signal('');
  protected readonly status = signal('');

  // --- Modal de création / tiroir de détails ---
  protected readonly creating = signal(false);
  protected readonly selected = signal<Employee | null>(null);

  protected readonly departments: string[] = DEPARTMENTS;
  protected readonly statuses = Object.values(STATUS_META).map((s) => s.label);
  protected readonly statusMeta = STATUS_META;
  protected readonly dot = DEPARTMENT_DOT;

  // --- Chiffres clés calculés depuis les données ---
  protected readonly stats = computed(() => {
    const list = this.all();
    const years = list.length ? list.reduce((sum, e) => sum + tenureYears(e), 0) / list.length : 0;
    return {
      total: list.length,
      active: list.filter((e) => e.status === 'active').length,
      departments: new Set(list.map((e) => e.department)).size,
      tenure: years.toFixed(1),
    };
  });

  /** Lignes affichées : tous les filtres appliqués. */
  protected readonly rows = computed(() => {
    const q = this.query().trim().toLowerCase();
    return this.all().filter(
      (e) =>
        (!q || `${e.name} ${e.email} ${e.role}`.toLowerCase().includes(q)) &&
        (!this.unverifiedOnly() || !e.verified) &&
        (!this.department() || e.department === this.department()) &&
        (!this.status() || STATUS_META[e.status].label === this.status()),
    );
  });

  protected readonly activeFilters = computed(() => [this.department(), this.status()].filter(Boolean).length);

  protected readonly columns: TableColumn<Employee>[] = [
    { key: 'name', header: 'Nom', sortable: true },
    { key: 'email', header: 'E-mail', sortable: true },
    { key: 'department', header: 'Département', sortable: true },
    { key: 'role', header: 'Fonction', sortable: true },
    { key: 'status', header: 'Statut', sortable: true, sortValue: (e) => STATUS_META[e.status].label },
    { key: 'joiningDate', header: 'Date d’arrivée', sortable: true },
    { key: 'actions', header: '', class: 'w-12' },
  ];
  protected readonly rowId = (e: Employee): string => e.id;

  protected clearFilters(): void {
    this.department.set('');
    this.status.set('');
  }

  protected remove(id: string): void {
    this.service.remove(id);
    this.selected.set(null);
  }

  /** Export CSV des lignes actuellement filtrées (BOM UTF-8 pour qu'Excel lise les accents). */
  protected exportCsv(): void {
    const cell = (v: string) => `"${v.replaceAll('"', '""')}"`;
    const lines = this.rows().map((e) =>
      [e.name, e.email, e.department, e.role, STATUS_META[e.status].label, e.joiningDate].map(cell).join(','),
    );
    const csv = ['Name,Email,Department,Role,Status,Joining date', ...lines].join('\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'employees.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  protected statusMetaFor(employee: Employee) {
    return STATUS_META[employee.status];
  }

  protected departmentDotFor(employee: Employee) {
    return DEPARTMENT_DOT[employee.department];
  }
}
