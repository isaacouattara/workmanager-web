import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';
export type Gender = 'male' | 'female';

const SIZES: Record<AvatarSize, string> = {
  sm: 'size-7',
  md: 'size-9',
  lg: 'size-14',
  xl: 'size-20',
};

/**
 * Avatar : image selon le genre (fichiers dans /public/assets/img).
 * Sans genre connu, on affiche les initiales (fond primary).
 * Quand l'API fournira des photos, ajouter un input `src` prioritaire.
 */
@Component({
  selector: 'app-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary/40 text-xs font-semibold text-primary-strong select-none',
    '[class]': 'sizeClass()',
    role: 'img',
    '[attr.aria-label]': 'name()',
  },
  template: `
    @if (src(); as url) {
      <img [src]="url" [alt]="name()" class="size-full object-cover" />
    } @else {
      {{ initials() }}
    }
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly gender = input<Gender | null>(null);
  readonly size = input<AvatarSize>('md');

  protected readonly sizeClass = computed(() => SIZES[this.size()]);
  protected readonly src = computed(() => {
    const g = this.gender();
    return g ? `assets/img/${g}-avatar.webp` : null;
  });
  protected readonly initials = computed(() =>
    this.name().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join(''),
  );
}
