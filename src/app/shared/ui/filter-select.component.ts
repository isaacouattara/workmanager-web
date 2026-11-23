import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Filtre "pastille" (Role, Status…) basé sur un <select> natif (accessible, clavier OK).
 * `value` est un model() : double liaison -> <app-filter-select [(value)]="role" />
 * Valeur vide = "pas de filtre".
 */
@Component({
  selector: 'app-filter-select',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="relative inline-flex">
      <span class="sr-only">{{ label() }}</span>
      <select
        class="h-11 cursor-pointer appearance-none rounded-full border border-line bg-surface-2 pl-5 pr-10 text-sm font-medium text-ink transition-colors hover:border-primary hover:bg-primary/15"
        [value]="value()"
        (change)="value.set($any($event.target).value)"
      >
        <option value="">{{ label() }}</option>
        @for (option of options(); track option) {
          <option [value]="option">{{ option }}</option>
        }
      </select>
      <app-icon name="chevronDown" [size]="16" class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted" />
    </label>
  `,
})
export class FilterSelectComponent {
  readonly label = input.required<string>();
  readonly options = input.required<readonly string[]>();
  readonly value = model('');
}
