import {
  ChangeDetectionStrategy, Component, ElementRef, afterNextRender, computed, inject, signal, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';

import { LayoutService } from '../../core/layout/layout.service';
import { SearchGroup, SearchItem, SearchService } from '../../core/search/search.service';
import { IconComponent } from '../../shared/ui/icon.component';

/**
 * Palette de recherche (⌘K) : suggestions à vide, résultats groupés pendant la saisie.
 * La recherche est SIMULÉE (SearchService) avec un délai de 250 ms (debounce) pour
 * reproduire le comportement d'un appel API. Navigation clavier : ↑ ↓ Entrée Échap.
 */
@Component({
  selector: 'app-command-palette',
  imports: [IconComponent],
  templateUrl: './command-palette.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommandPaletteComponent {
  private readonly layout = inject(LayoutService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  protected readonly query = signal('');
  /** true pendant le délai de "recherche" (affiche un squelette). */
  protected readonly loading = signal(false);
  protected readonly groups = signal<SearchGroup[]>(this.searchService.suggestions());
  protected readonly activeIndex = signal(0);

  /** Liste à plat des résultats : sert à la navigation clavier (index unique). */
  protected readonly flat = computed(() => this.groups().flatMap((g) => g.items));

  /** Flux de saisie : RxJS `debounceTime` attend que l'utilisateur arrête de taper. */
  private readonly typed$ = new Subject<string>();

  constructor() {
    afterNextRender(() => this.field().nativeElement.focus());

    this.typed$.pipe(debounceTime(250), takeUntilDestroyed()).subscribe((q) => {
      this.groups.set(this.searchService.search(q));
      this.activeIndex.set(0);
      this.loading.set(false);
    });
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.loading.set(value.trim().length > 0);
    this.typed$.next(value);
  }

  protected close(): void {
    this.layout.closeSearch();
  }

  protected select(item: SearchItem | undefined): void {
    if (!item) return;
    this.layout.closeSearch();
    this.router.navigateByUrl(item.route);
  }

  protected indexOf(item: SearchItem): number {
    return this.flat().indexOf(item);
  }

  /** Clavier : flèches pour se déplacer, Entrée pour ouvrir, Échap pour fermer. */
  protected onKeydown(event: KeyboardEvent): void {
    const count = this.flat().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.move(count ? (this.activeIndex() + 1) % count : 0);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.move(count ? (this.activeIndex() - 1 + count) % count : 0);
        break;
      case 'Enter':
        event.preventDefault();
        this.select(this.flat()[this.activeIndex()]);
        break;
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  private move(index: number): void {
    this.activeIndex.set(index);
    // Garde l'élément actif visible dans la liste scrollable.
    queueMicrotask(() => document.getElementById(`palette-opt-${index}`)?.scrollIntoView({ block: 'nearest' }));
  }
}
