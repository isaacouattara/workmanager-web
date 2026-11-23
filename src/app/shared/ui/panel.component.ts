import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Grand conteneur de contenu de page (carte + titre + zone d'actions optionnelle).
 *   <app-panel title="Employee List"> ...contenu... </app-panel>
 * Les actions du titre se projettent avec l'attribut [panelActions].
 */
@Component({
  selector: 'app-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card overflow-hidden">
      @if (title()) {
        <header class="flex items-center justify-between gap-3 border-b border-line px-6 py-5">
          <h2 class="text-xl font-semibold tracking-tight">{{ title() }}</h2>
          <ng-content select="[panelActions]" />
        </header>
      }
      <ng-content />
    </section>
  `,
})
export class PanelComponent {
  readonly title = input('');
}
