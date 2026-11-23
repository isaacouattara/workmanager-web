import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { strictEmail } from '../../../shared/validators/email.validator';
import { AvatarComponent, Gender } from '../../../shared/ui/avatar.component';
import { DetailRowComponent } from '../../../shared/ui/detail-row.component';
import { StepperModalComponent } from '../../../shared/ui/stepper-modal.component';
import { DEPARTMENTS, Department, Employee, EmployeeStatus, STATUS_META } from './employee.model';
import { EmployeesService } from './employees.service';

/**
 * Création d'un employé en 3 étapes : Profile -> Job -> Review.
 * Un seul FormGroup ; chaque étape n'en valide qu'une partie (voir stepValid).
 * À la fin, EmployeesService.add() (simulé) puis `created` est émis.
 */
@Component({
  selector: 'app-employee-create-modal',
  imports: [ReactiveFormsModule, StepperModalComponent, AvatarComponent, DetailRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stepper-modal title="Nouvel employé" [steps]="steps" [(step)]="step" [canContinue]="stepValid()"
                       submitLabel="Créer l’employé" [loading]="loading()" (submitted)="submit()" (closed)="closed.emit()">
      <form [formGroup]="form" class="space-y-4" (submit)="$event.preventDefault()" novalidate>
        @switch (step()) {
          @case (0) {
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="firstName" class="mb-1.5 block text-sm font-medium">Prénom</label>
                <input id="firstName" class="input-base" formControlName="firstName" autocomplete="given-name"
                       [class.field-error]="invalid(c.firstName)" />
              </div>
              <div>
                <label for="lastName" class="mb-1.5 block text-sm font-medium">Nom</label>
                <input id="lastName" class="input-base" formControlName="lastName" autocomplete="family-name"
                       [class.field-error]="invalid(c.lastName)" />
              </div>
            </div>
            <div>
              <label for="email" class="mb-1.5 block text-sm font-medium">Adresse e-mail</label>
              <input id="email" type="email" class="input-base" formControlName="email" placeholder="nom&#64;entreprise.com"
                     [class.field-error]="invalid(c.email)" />
              @if (invalid(c.email)) {
                <p role="alert" class="mt-1.5 text-xs text-danger">Saisissez une adresse e-mail valide.</p>
              }
            </div>
            <fieldset>
              <legend class="mb-1.5 text-sm font-medium">Avatar</legend>
              <div class="flex gap-3">
                @for (g of genders; track g) {
                  <button type="button" (click)="c.gender.setValue(g)" [attr.aria-pressed]="c.gender.value === g"
                          class="flex items-center gap-3 rounded-xl border px-3 py-2 text-sm capitalize transition-colors"
                          [class]="c.gender.value === g ? 'border-primary-strong bg-primary/20' : 'border-line hover:bg-primary/10'">
                    <app-avatar [name]="g" [gender]="g" size="md" /> {{ g }}
                  </button>
                }
              </div>
            </fieldset>
          }
          @case (1) {
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="department" class="mb-1.5 block text-sm font-medium">Département</label>
                <select id="department" class="input-base" formControlName="department">
                  @for (d of departments; track d) { <option [value]="d">{{ d }}</option> }
                </select>
              </div>
              <div>
                <label for="role" class="mb-1.5 block text-sm font-medium">Fonction</label>
                <input id="role" class="input-base" formControlName="role" placeholder="ex. Designer produit"
                       [class.field-error]="invalid(c.role)" />
              </div>
              <div>
                <label for="joiningDate" class="mb-1.5 block text-sm font-medium">Date d’arrivée</label>
                <input id="joiningDate" type="date" class="input-base" formControlName="joiningDate" />
              </div>
              <div>
                <label for="status" class="mb-1.5 block text-sm font-medium">Statut</label>
                <select id="status" class="input-base" formControlName="status">
                  @for (s of statuses; track s.value) { <option [value]="s.value">{{ s.label }}</option> }
                </select>
              </div>
              <div>
                <label for="capacity" class="mb-1.5 block text-sm font-medium">Capacité hebdomadaire (heures)</label>
                <input id="capacity" type="number" min="1" max="60" class="input-base" formControlName="capacityHours"
                       [class.field-error]="invalid(c.capacityHours)" />
              </div>
            </div>
          }
          @case (2) {
            <div class="flex items-center gap-4 pb-2">
              <app-avatar [name]="fullName()" [gender]="c.gender.value" size="lg" />
              <div>
                <p class="font-semibold">{{ fullName() }}</p>
                <p class="text-sm text-muted">{{ c.role.value }}</p>
              </div>
            </div>
            <app-detail-row label="E-mail">{{ c.email.value }}</app-detail-row>
            <app-detail-row label="Département">{{ c.department.value }}</app-detail-row>
            <app-detail-row label="Date d’arrivée">{{ c.joiningDate.value }}</app-detail-row>
            <app-detail-row label="Statut">{{ statusLabel() }}</app-detail-row>
            <app-detail-row label="Capacité hebdomadaire">{{ c.capacityHours.value }}h</app-detail-row>
          }
        }
      </form>
    </app-stepper-modal>
  `,
})
export class EmployeeCreateModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly service = inject(EmployeesService);

  readonly closed = output<void>();
  readonly created = output<Employee>();

  protected readonly steps = ['Profil', 'Emploi', 'Vérification'];
  protected readonly step = signal(0);
  protected readonly loading = signal(false);
  protected readonly genders: Gender[] = ['female', 'male'];
  protected readonly departments = DEPARTMENTS;
  protected readonly statuses = (Object.keys(STATUS_META) as EmployeeStatus[]).map((value) => ({ value, label: STATUS_META[value].label }));

  protected readonly form = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(2)]],
    lastName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, strictEmail]],
    gender: this.fb.control<Gender>('female'),
    department: this.fb.control<Department>('Marketing'),
    role: ['', Validators.required],
    joiningDate: [new Date().toISOString().slice(0, 10), Validators.required],
    status: this.fb.control<EmployeeStatus>('active'),
    capacityHours: [40, [Validators.required, Validators.min(1), Validators.max(60)]],
  });
  /** Raccourci : `c.email` au lieu de `form.controls.email`. */
  protected readonly c = this.form.controls;

  /** L'étape courante est-elle valide ? (active le bouton Continue / Create) */
  protected stepValid(): boolean {
    const c = this.c;
    const perStep: AbstractControl[][] = [
      [c.firstName, c.lastName, c.email, c.gender],
      [c.department, c.role, c.joiningDate, c.status, c.capacityHours],
      [],
    ];
    return perStep[this.step()].every((ctrl) => ctrl.valid);
  }

  protected invalid(ctrl: AbstractControl): boolean {
    return ctrl.touched && ctrl.invalid;
  }

  protected fullName(): string {
    return `${this.c.firstName.value} ${this.c.lastName.value}`.trim();
  }

  protected statusLabel(): string {
    return STATUS_META[this.c.status.value].label;
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.loading.set(true);
    this.service
      .add({
        name: this.fullName(),
        email: v.email.trim(),
        gender: v.gender,
        department: v.department,
        role: v.role.trim(),
        status: v.status,
        joiningDate: v.joiningDate,
        capacityHours: v.capacityHours,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((employee) => {
        this.created.emit(employee);
        this.closed.emit();
      });
  }
}
