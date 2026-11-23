import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IconComponent } from './icon.component';
import type { IconName } from './icons';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

const TONES: Record<BadgeTone, string> = {
  success: 'bg-success/15 text-success',
  danger: 'bg-danger/15 text-danger',
  warning: 'bg-warning/15 text-warning',
  info: 'bg-info/15 text-info',
  neutral: 'bg-surface-2 text-muted',
};

/** Pastille de statut : <app-badge tone="success" icon="checkCircle">Active</app-badge>. */
@Component({
  selector: 'app-badge',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pill', '[class]': 'toneClass()' },
  template: `
    @if (icon()) {
      <app-icon [name]="icon()!" [size]="13" />
    }
    <ng-content />
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');
  readonly icon = input<IconName | null>(null);
  protected readonly toneClass = computed(() => TONES[this.tone()]);
}
