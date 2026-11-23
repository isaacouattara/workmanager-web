import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { IconComponent } from './icon.component';

/** Champ de recherche en pastille (barre d'outils). Double liaison : [(value)]="query". */
@Component({
  selector: 'app-search-field',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-[200px] max-w-sm flex-1' },
  template: `
    <label class="flex h-11 items-center gap-3 rounded-full border border-line bg-surface-2 px-4 transition focus-within:border-primary-strong focus-within:ring-4 focus-within:ring-primary/30">
      <app-icon name="search" class="text-primary-strong" />
      <span class="sr-only">{{ placeholder() }}</span>
      <input
        type="search"
        class="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        [placeholder]="placeholder()"
        [value]="value()"
        (input)="value.set($any($event.target).value)"
      />
    </label>
  `,
})
export class SearchFieldComponent {
  readonly placeholder = input('Search');
  readonly value = model('');
}
