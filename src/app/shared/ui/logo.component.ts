import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Logo (fichiers dans /public/assets/img).
 * Deux variantes : version sombre sur fond clair, version sauge sur fond sombre.
 * Le basculement est fait en CSS (classes `dark:`), sans logique TypeScript.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block shrink-0' },
  template: `
    <img src="assets/img/logo-noir.png" alt="WorkManager" class="block dark:hidden" [style.width.px]="size()" [style.height.px]="size()" />
    <img src="assets/img/logo.png" alt="WorkManager" class="hidden dark:block" [style.width.px]="size()" [style.height.px]="size()" />
  `,
})
export class LogoComponent {
  readonly size = input(32);
}
