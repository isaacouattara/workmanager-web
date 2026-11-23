import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

/**
 * Fenêtre modale générique. Le parent la crée avec @if et écoute (closed) :
 *   @if (open()) { <app-modal title="..." (closed)="open.set(false)"> ... </app-modal> }
 * - Focus piégé dans la modale (CDK) + fermeture par Échap ou clic sur le fond.
 * - Pied de modale : projeter un élément avec l'attribut [modalFooter].
 */
@Component({
  selector: 'app-modal',
  imports: [IconComponent, CdkTrapFocus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4 animate-fade" (click)="closed.emit()">
      <div
        role="dialog"
        aria-modal="true"
        cdkTrapFocus
        [cdkTrapFocusAutoCapture]="true"
        [attr.aria-label]="title()"
        class="card flex max-h-[90dvh] w-full max-w-xl flex-col shadow-2xl animate-pop"
        (click)="$event.stopPropagation()"
      >
        <header class="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
          <h2 class="text-lg font-semibold tracking-tight">{{ title() }}</h2>
          <button type="button" class="icon-btn" aria-label="Close" (click)="closed.emit()">
            <app-icon name="x" [size]="16" />
          </button>
        </header>
        <div class="scroll-thin min-h-0 flex-1 overflow-y-auto px-6 py-5"><ng-content /></div>
        <footer class="border-t border-line px-6 py-4"><ng-content select="[modalFooter]" /></footer>
      </div>
    </div>
  `,
})
export class ModalComponent {
  readonly title = input.required<string>();
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
