import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Ligne "libellé : valeur" des tiroirs de détails. */
@Component({
  selector: 'app-detail-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'flex items-center justify-between gap-4 border-b border-line py-3 text-sm last:border-0' },
  template: `<span class="text-muted">{{ label() }}</span><span class="min-w-0 text-right font-medium"><ng-content /></span>`,
})
export class DetailRowComponent {
  readonly label = input.required<string>();
}
