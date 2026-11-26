import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Carte de chiffre clé, identique sur toutes les pages :
 * titre + icône info / grande valeur / badge d'évolution + texte.
 * Valeurs d'évolution (delta) fournies par l'API plus tard.
 */
@Component({
  selector: 'app-stat-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card h-full p-5">
      <div class="flex items-start justify-between gap-3">
        <h3 class="text-base font-medium">{{ title() }}</h3>
        <app-icon name="info" [size]="20" class="text-primary-strong" />
      </div>

      <p class="mt-5 text-3xl font-semibold tracking-tight">
        {{ value() }}
        @if (unit()) {
          <span class="text-sm font-normal text-muted">{{ unit() }}</span>
        }
      </p>

      <!-- @if (delta()) {
        <p class="mt-3 flex items-center gap-2 text-sm text-muted">
          <span
            class="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold"
            [class]="trend() === 'up' ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'"
          >
            <app-icon name="chevronDown" [size]="12" [stroke]="2.5" [class.rotate-180]="trend() === 'up'" />
            {{ delta() }}
          </span>
          {{ note() }}
        </p>
      } -->
    </article>
  `,
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string | number>();
  readonly unit = input('');
  readonly delta = input('');
  readonly trend = input<'up' | 'down'>('up');
  readonly note = input('');
}
