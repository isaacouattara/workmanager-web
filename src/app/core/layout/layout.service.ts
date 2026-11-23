import { Injectable, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

const COLLAPSED_KEY = 'wm-sidebar-collapsed';
/** Même breakpoint que `lg:` de Tailwind : en dessous, la sidebar devient un drawer. */
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * État de l'interface partagé entre la sidebar, le shell et la palette de recherche.
 * Un service + des signals remplace ici ce qu'on ferait avec un Context React.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** Sidebar réduite (icônes seules) – desktop uniquement, mémorisé. */
  readonly collapsed = signal(this.readCollapsed());
  /** Drawer ouvert – mobile/tablette uniquement. */
  readonly mobileOpen = signal(false);
  /** Palette de recherche (⌘K) ouverte. */
  readonly searchOpen = signal(false);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(COLLAPSED_KEY, String(this.collapsed()));
      } catch {
        /* ignore */
      }
    });

    // Ferme le drawer à chaque navigation (sinon il reste ouvert sur mobile).
    inject(Router)
      .events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.mobileOpen.set(false));
  }

  isDesktop(): boolean {
    return matchMedia(DESKTOP_QUERY).matches;
  }

  /** Bouton du header de la sidebar : réduit/déplie sur desktop, ferme le drawer sur mobile. */
  toggleSidebar(): void {
    if (this.isDesktop()) this.collapsed.update((v) => !v);
    else this.mobileOpen.set(false);
  }

  expandSidebar(): void {
    this.collapsed.set(false);
  }

  /** Vrai uniquement quand la sidebar est réellement affichée en mode icônes. */
  isCollapsedDesktop(): boolean {
    return this.collapsed() && this.isDesktop();
  }

  openMobile(): void {
    this.mobileOpen.set(true);
  }
  closeMobile(): void {
    this.mobileOpen.set(false);
  }

  openSearch(): void {
    this.mobileOpen.set(false);
    this.searchOpen.set(true);
  }
  closeSearch(): void {
    this.searchOpen.set(false);
  }
  toggleSearch(): void {
    this.searchOpen.update((v) => !v);
  }

  private readCollapsed(): boolean {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  }
}
