import { Directive, TemplateRef, inject, input } from '@angular/core';

/**
 * Marque un <ng-template> comme rendu personnalisé d'une colonne :
 *   <ng-template appCell="status" let-row> <app-badge>{{ row.status }}</app-badge> </ng-template>
 * `appCell` = clé de la colonne. `let-row` = la ligne courante.
 */
@Directive({ selector: 'ng-template[appCell]' })
export class TableCellDirective {
  readonly name = input.required<string>({ alias: 'appCell' });
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
