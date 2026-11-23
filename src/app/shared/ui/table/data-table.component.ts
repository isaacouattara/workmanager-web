import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, computed, contentChildren, input, linkedSignal, output, signal,
} from '@angular/core';
import { IconComponent } from '../icon.component';
import { TableCellDirective } from './table-cell.directive';
import { TableColumn } from './table.models';

/**
 * TABLEAU GÉNÉRIQUE réutilisable sur toutes les pages (tri, pagination, sélection).
 * Il ne connaît pas vos données : on lui donne des colonnes + des lignes.
 *
 *   <app-data-table [columns]="columns" [rows]="rows()" [rowId]="rowId" itemLabel="Member"
 *                   (rowClick)="open($event)">
 *     <ng-template appCell="name" let-row> ... </ng-template>   <- rendu personnalisé (optionnel)
 *   </app-data-table>
 *
 * La recherche/les filtres restent dans la page : le tableau reçoit des lignes déjà filtrées.
 */
@Component({
  selector: 'app-data-table',
  imports: [NgTemplateOutlet, IconComponent],
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends object> {
  readonly columns = input.required<readonly TableColumn<T>[]>();
  readonly rows = input.required<readonly T[]>();
  /** Fournit l'identifiant unique d'une ligne (sélection + suivi). Ex. (e) => e.id */
  readonly rowId = input.required<(row: T) => string>();
  /** Nom de l'élément affiché dans le pied : "1 to 8 of 100 Member". */
  readonly itemLabel = input('Item');
  readonly selectable = input(true);
  readonly pageSizes = input<readonly number[]>([8, 16, 32]);

  readonly rowClick = output<T>();
  readonly selectionChange = output<T[]>();

  // --- Rendus de cellules fournis par la page ---
  private readonly cells = contentChildren(TableCellDirective);
  private readonly cellMap = computed(() => new Map(this.cells().map((c) => [c.name(), c.template])));

  // --- Tri ---
  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDir = signal<'asc' | 'desc'>('asc');

  protected readonly sorted = computed(() => {
    const key = this.sortKey();
    const rows = this.rows();
    if (!key) return rows;
    const col = this.columns().find((c) => c.key === key);
    const value = (r: T): string | number =>
      col?.sortValue ? col.sortValue(r) : ((r as Record<string, unknown>)[key] as string | number);
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const x = value(a);
      const y = value(b);
      const cmp =
        typeof x === 'number' && typeof y === 'number'
          ? x - y
          : String(x).localeCompare(String(y), undefined, { numeric: true, sensitivity: 'base' });
      return cmp * dir;
    });
  });

  // --- Pagination ---
  protected readonly pageSize = linkedSignal(() => this.pageSizes()[0] ?? 8);
  private readonly pageIndex = signal(0);
  protected readonly lastPage = computed(() => Math.max(0, Math.ceil(this.sorted().length / this.pageSize()) - 1));
  /** Page courante, bornée (si un filtre réduit la liste, on ne reste pas sur une page vide). */
  protected readonly page = computed(() => Math.min(this.pageIndex(), this.lastPage()));
  protected readonly pageRows = computed(() => {
    const start = this.page() * this.pageSize();
    return this.sorted().slice(start, start + this.pageSize());
  });
  protected readonly fromIndex = computed(() => (this.sorted().length ? this.page() * this.pageSize() + 1 : 0));
  protected readonly toIndex = computed(() => Math.min((this.page() + 1) * this.pageSize(), this.sorted().length));

  // --- Sélection ---
  protected readonly selected = signal<ReadonlySet<string>>(new Set());
  protected readonly allSelected = computed(
    () => this.pageRows().length > 0 && this.pageRows().every((r) => this.selected().has(this.rowId()(r))),
  );

  protected cellTemplate(key: string) {
    return this.cellMap().get(key) ?? null;
  }

  protected valueOf(row: T, key: string): unknown {
    return (row as Record<string, unknown>)[key];
  }

  protected toggleSort(col: TableColumn<T>): void {
    if (!col.sortable) return;
    if (this.sortKey() === col.key) this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      this.sortKey.set(col.key);
      this.sortDir.set('asc');
    }
  }

  protected ariaSort(col: TableColumn<T>): 'ascending' | 'descending' | 'none' {
    if (this.sortKey() !== col.key) return 'none';
    return this.sortDir() === 'asc' ? 'ascending' : 'descending';
  }

  protected goTo(delta: number): void {
    this.pageIndex.set(Math.max(0, Math.min(this.page() + delta, this.lastPage())));
  }

  protected setPageSize(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(0);
  }

  protected toggleRow(row: T): void {
    const id = this.rowId()(row);
    this.updateSelection((set) => (set.has(id) ? set.delete(id) : set.add(id)));
  }

  protected toggleAll(): void {
    const ids = this.pageRows().map(this.rowId());
    const all = this.allSelected();
    this.updateSelection((set) => ids.forEach((id) => (all ? set.delete(id) : set.add(id))));
  }

  private updateSelection(mutate: (set: Set<string>) => void): void {
    const next = new Set(this.selected());
    mutate(next);
    this.selected.set(next);
    this.selectionChange.emit(this.rows().filter((r) => next.has(this.rowId()(r))));
  }
}
