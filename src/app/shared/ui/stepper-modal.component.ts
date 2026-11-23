import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { IconComponent } from './icon.component';
import { ModalComponent } from './modal.component';

/**
 * Modal de création en plusieurs étapes (stepper), réutilisable pour tout formulaire.
 * Le PARENT garde les champs et choisit le contenu de chaque étape :
 *
 *   <app-stepper-modal title="New employee" [steps]="['Profile','Job','Review']"
 *       [(step)]="step" [canContinue]="stepIsValid()" submitLabel="Create"
 *       (submitted)="save()" (closed)="close()">
 *     @switch (step()) { @case (0) {...} @case (1) {...} @case (2) {...} }
 *   </app-stepper-modal>
 *
 * `canContinue` = l'étape courante est valide (active le bouton Continue / Submit).
 */
@Component({
  selector: 'app-stepper-modal',
  imports: [ModalComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="title()" (closed)="closed.emit()">
      <ol class="mb-6 flex items-center" aria-label="Steps">
        @for (label of steps(); track label; let i = $index; let last = $last) {
          <li class="flex items-center gap-2" [attr.aria-current]="i === step() ? 'step' : null">
            <span
              class="grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold"
              [class]="i < step() ? 'bg-primary text-on-primary' : i === step() ? 'bg-primary-strong text-surface' : 'bg-surface-2 text-muted'"
            >
              @if (i < step()) {
                <app-icon name="check" [size]="13" [stroke]="2.5" />
              } @else {
                {{ i + 1 }}
              }
            </span>
            <span class="text-sm" [class]="i === step() ? 'font-medium' : 'text-muted'">{{ label }}</span>
          </li>
          @if (!last) {
            <span class="mx-3 h-px min-w-4 flex-1 bg-line" aria-hidden="true"></span>
          }
        }
      </ol>

      <ng-content />

      <div modalFooter class="flex items-center justify-between gap-3">
        <button type="button" class="btn-soft" [disabled]="step() === 0" (click)="step.set(step() - 1)">Back</button>
        @if (isLast()) {
          <button type="button" class="btn-primary" [disabled]="!canContinue() || loading()" (click)="submitted.emit()">
            {{ loading() ? 'Saving…' : submitLabel() }}
          </button>
        } @else {
          <button type="button" class="btn-primary" [disabled]="!canContinue()" (click)="step.set(step() + 1)">Continue</button>
        }
      </div>
    </app-modal>
  `,
})
export class StepperModalComponent {
  readonly title = input.required<string>();
  readonly steps = input.required<readonly string[]>();
  readonly step = model(0);
  readonly canContinue = input(true);
  readonly submitLabel = input('Create');
  readonly loading = input(false);
  readonly closed = output<void>();
  readonly submitted = output<void>();

  protected readonly isLast = computed(() => this.step() === this.steps().length - 1);
}
