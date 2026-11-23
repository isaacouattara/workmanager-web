import {
  ChangeDetectionStrategy, Component, ElementRef, HostListener, computed, effect, inject, signal, viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { LayoutService } from '../../core/layout/layout.service';
import { FOOTER_LINKS, NAV_GROUPS, NAV_TOP } from '../../core/navigation/nav.config';
import { ThemeService } from '../../core/theme/theme.service';
import { TooltipDirective } from '../../shared/directives/tooltip.directive';
import { AvatarComponent } from '../../shared/ui/avatar.component';
import { IconComponent } from '../../shared/ui/icon.component';
import { LogoComponent } from '../../shared/ui/logo.component';

/**
 * Sidebar en 3 parties : header (logo + bouton) / menu principal (scrollable) / footer.
 *
 * Trois modes pilotés par LayoutService :
 *  - desktop déplié  : 232px, icônes + libellés
 *  - desktop réduit  : 60px, icônes seules + infobulle au survol
 *  - mobile/tablette : drawer par-dessus le contenu
 *
 * Astuce Tailwind : l'<aside> porte `group/sb` + l'attribut data-collapsed ; les enfants
 * réagissent avec `group-data-[collapsed=true]/sb:lg:…` sans @if supplémentaire.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, IconComponent, LogoComponent, AvatarComponent, TooltipDirective],
  templateUrl: './sidebar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  protected readonly layout = inject(LayoutService);
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // --- Données de navigation (config statique) ---
  protected readonly top = NAV_TOP;
  protected readonly groups = NAV_GROUPS;
  protected readonly footerLinks = FOOTER_LINKS;

  // --- Classes Tailwind partagées (évitent de répéter des chaînes très longues) ---
  /** Libellé : masqué quand la sidebar est réduite sur desktop. */
  protected readonly labelCls = 'truncate group-data-[collapsed=true]/sb:lg:hidden';
  /** Ligne de menu de premier niveau. Survol = teinte primary + texte accentué (pas de gris). */
  protected readonly rowCls =
    'flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-ink/80 transition-colors hover:bg-primary/20 hover:text-primary-strong ' +
    'group-data-[collapsed=true]/sb:lg:justify-center group-data-[collapsed=true]/sb:lg:px-0 ' +
    '[&.is-active]:bg-primary/35 [&.is-active]:font-semibold [&.is-active]:text-primary-strong';
  /** Sous-lien : trait vertical à gauche, accentué quand la page est active. */
  protected readonly subCls =
    'relative flex h-8 items-center rounded-md pl-3.5 text-[13px] text-ink/70 transition-colors hover:bg-primary/15 hover:text-primary-strong ' +
    'before:absolute before:-left-px before:top-1 before:bottom-1 before:w-0.5 before:rounded-full ' +
    '[&.is-active]:font-semibold [&.is-active]:text-primary-strong [&.is-active]:before:bg-primary-strong';

  // --- Groupes repliables ---
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );
  protected readonly activeGroupId = computed(
    () => NAV_GROUPS.find((g) => g.items.some((i) => this.url().startsWith(`/${i.path}`)))?.id ?? null,
  );
  protected readonly openGroups = signal<ReadonlySet<string>>(new Set(['teams']));

  // --- Menu utilisateur (popover en position fixe) ---
  protected readonly menuPos = signal<{ left: number; bottom: number } | null>(null);
  private readonly footerRoot = viewChild<ElementRef<HTMLElement>>('footerRoot');

  constructor() {
    // Ouvre automatiquement le groupe qui contient la page active.
    effect(() => {
      const id = this.activeGroupId();
      if (id) this.setGroupOpen(id, true);
    });
  }

  protected isGroupOpen(id: string): boolean {
    return this.openGroups().has(id);
  }

  /** En mode réduit, un clic sur un groupe déplie d'abord la sidebar (pas de place pour les sous-liens). */
  protected onGroupClick(id: string): void {
    if (this.layout.isCollapsedDesktop()) {
      this.layout.expandSidebar();
      this.setGroupOpen(id, true);
      return;
    }
    this.setGroupOpen(id, !this.isGroupOpen(id));
  }

  private setGroupOpen(id: string, open: boolean): void {
    this.openGroups.update((set) => {
      const next = new Set(set);
      if (open) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  /**
   * Ouvre/ferme le menu utilisateur. Il est positionné en `fixed` à côté de la carte :
   *  - desktop : à DROITE de la sidebar, avec une marge de 8px ;
   *  - mobile  : AU-DESSUS de la carte.
   * Ainsi il ne colle jamais au bord du footer et n'est jamais coupé.
   */
  protected toggleMenu(trigger: HTMLElement): void {
    if (this.menuPos()) {
      this.menuPos.set(null);
      return;
    }
    const r = trigger.getBoundingClientRect();
    this.menuPos.set(
      this.layout.isDesktop()
        ? { left: r.right + 8, bottom: window.innerHeight - r.bottom }
        : { left: r.left, bottom: window.innerHeight - r.top + 8 },
    );
  }

  protected signOut(): void {
    this.menuPos.set(null);
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  // --- Fermetures : clic extérieur et touche Échap ---
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const root = this.footerRoot()?.nativeElement;
    if (this.menuPos() && root && !root.contains(event.target as Node)) this.menuPos.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.menuPos.set(null);
    this.layout.closeMobile();
  }
}
