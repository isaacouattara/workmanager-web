import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IconComponent } from '../../shared/ui/icon.component';

/**
 * Page "bientôt disponible" pour les modules pas encore développés.
 * `pageTitle` vient de `data: { pageTitle }` dans la route grâce à withComponentInputBinding().
 */
@Component({
  selector: 'app-placeholder',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto flex max-w-md flex-col items-center gap-3 pt-24 text-center">
      <span class="grid size-12 place-items-center rounded-2xl bg-surface-2 text-muted">
        <app-icon name="layers" [size]="22" />
      </span>
      <h1 class="text-xl font-semibold tracking-tight">{{ pageTitle() }}</h1>
      <p class="text-sm text-muted">This module isn't available yet. It will appear here once it's built.</p>
    </div>
  `,
})
export class PlaceholderComponent {
  readonly pageTitle = input('Coming soon');
}
