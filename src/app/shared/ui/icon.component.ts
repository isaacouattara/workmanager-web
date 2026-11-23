import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ICONS, IconName } from './icons';

/**
 * Affiche une icône Hugeicons : <app-icon name="search" [size]="18" />.
 * Hérite de la couleur du texte (currentColor) : elle suit donc le thème et les états hover.
 */
@Component({
  selector: 'app-icon',
  imports: [HugeiconsIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0' },
  template: `<hugeicons-icon [icon]="icon()" [size]="size()" [strokeWidth]="stroke()" color="currentColor" />`,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(18);
  readonly stroke = input(1.6);

  protected readonly icon = computed(() => ICONS[this.name()]);
}
