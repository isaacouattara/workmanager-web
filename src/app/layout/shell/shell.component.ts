import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../../core/layout/layout.service';
import { IconComponent } from '../../shared/ui/icon.component';
import { LogoComponent } from '../../shared/ui/logo.component';
import { CommandPaletteComponent } from '../command-palette/command-palette.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

/**
 * "Shell" = structure commune de toutes les pages privées : sidebar + zone de contenu.
 * - Le conteneur occupe exactement la hauteur de l'écran (h-dvh) et ne défile JAMAIS :
 *   seules la zone <main> et le menu de la sidebar ont leur propre scroll.
 * - Pas de header sur desktop. Sur mobile/tablette, une fine barre ouvre le drawer.
 */
@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, CommandPaletteComponent, IconComponent, LogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex h-dvh overflow-hidden bg-app text-ink">
      <app-sidebar />

      <div class="flex min-h-0 min-w-0 flex-1 flex-col">
        <!-- Barre mobile : visible uniquement sous le breakpoint lg -->
        <div class="flex h-14 shrink-0 items-center gap-3 border-b border-line bg-surface px-4 lg:hidden">
          <button type="button" class="icon-btn" aria-label="Open navigation" (click)="layout.openMobile()">
            <app-icon name="menu" />
          </button>
          <app-logo [size]="28" />
          <span class="font-semibold tracking-tight">WorkManager</span>
          <button type="button" class="icon-btn ml-auto" aria-label="Search" (click)="layout.openSearch()">
            <app-icon name="search" />
          </button>
        </div>

        <!-- Contenu de la page courante (injecté par le router) -->
        <main class="scroll-thin min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          <div class="mx-auto flex max-w-[1500px] flex-col gap-4">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>

    @if (layout.searchOpen()) {
      <app-command-palette />
    }
  `,
})
export class ShellComponent {
  protected readonly layout = inject(LayoutService);

  /** Raccourci global : ⌘K (Mac) ou Ctrl+K (Windows/Linux) ouvre la recherche. */
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.layout.toggleSearch();
    }
  }
}
