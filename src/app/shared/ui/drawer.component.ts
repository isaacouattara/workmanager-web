import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Tiroir latéral (détails d'un élément). Même principe que le modal :
 *   @if (selected(); as item) { <app-drawer [title]="item.name" (closed)="selected.set(null)"> ... </app-drawer> }
 * Pied : projeter un élément avec l'attribut [drawerFooter].
 */
@Component({
  selector: 'app-drawer',
  imports: [IconComponent, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[60] bg-black/50 animate-fade" (click)="closed.emit()">
      <aside
        role="dialog"
        aria-modal="true"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        [attr.aria-label]="title()"
        class="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-2xl animate-slide"
        (click)="$event.stopPropagation()"
      >
        <header class="flex items-start justify-between gap-3 border-b border-line px-6 py-5">
          <div class="min-w-0">
            <h2 class="truncate text-lg font-semibold tracking-tight">{{ title() }}</h2>
            @if (subtitle()) {
              <p class="truncate text-sm text-muted">{{ subtitle() }}</p>
            }
          </div>
          <button type="button" class="icon-btn shrink-0" aria-label="Close" (click)="closed.emit()">
            <app-icon name="x" [size]="16" />
          </button>
        </header>
        <div class="scroll-thin min-h-0 flex-1 overflow-y-auto px-6 py-5"><ng-content /></div>
        <footer class="border-t border-line px-6 py-4 empty:hidden"><ng-content select="[drawerFooter]" /></footer>
      </aside>
    </div>
  `,
})
export class DrawerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input('');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
