import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AvatarComponent } from '../../shared/ui/avatar.component';
import { BadgeComponent } from '../../shared/ui/badge.component';
import { DetailRowComponent } from '../../shared/ui/detail-row.component';
import { StepperModalComponent } from '../../shared/ui/stepper-modal.component';
import { PRIORITIES, PRIORITY_META } from './dashboard.meta';
import { ColumnId, KanbanColumn, Person, Task, TaskPriority } from './dashboard.models';

/** Résultat émis : la tâche créée et la colonne où la placer. */
export interface CreatedTask {
  task: Task;
  columnId: ColumnId;
}

/**
 * Création d'une tâche en 3 étapes : Details -> Planning -> Review.
 * Le parent fournit les listes (projets, personnes, colonnes) et le numéro de la prochaine clé.
 * TODO API : POST /api/projects/{id}/tasks
 */
@Component({
  selector: 'app-task-create-modal',
  imports: [ReactiveFormsModule, StepperModalComponent, AvatarComponent, BadgeComponent, DetailRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-stepper-modal title="Nouvelle tâche" [steps]="steps" [(step)]="step" [canContinue]="stepValid()"
                       submitLabel="Créer la tâche" (submitted)="submit()" (closed)="closed.emit()">
      <form [formGroup]="form" class="space-y-4" (submit)="$event.preventDefault()" novalidate>
        @switch (step()) {
          @case (0) {
            <div>
              <label for="title" class="mb-1.5 block text-sm font-medium">Titre</label>
              <input id="title" class="input-base" formControlName="title" placeholder="ex. Concevoir la page tarifaire"
                     [class.field-error]="invalid(c.title)" />
              @if (invalid(c.title)) {
                <p role="alert" class="mt-1.5 text-xs text-danger">Saisissez un titre de 3 caractères minimum.</p>
              }
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="project" class="mb-1.5 block text-sm font-medium">Projet</label>
                <select id="project" class="input-base" formControlName="project">
                  @for (p of projects(); track p) { <option [value]="p">{{ p }}</option> }
                </select>
              </div>
              <div>
                <label for="priority" class="mb-1.5 block text-sm font-medium">Priorité</label>
                <select id="priority" class="input-base" formControlName="priority">
                  @for (p of priorities; track p) { <option [value]="p">{{ meta[p].label }}</option> }
                </select>
              </div>
            </div>
          }
          @case (1) {
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="column" class="mb-1.5 block text-sm font-medium">Statut</label>
                <select id="column" class="input-base" formControlName="columnId">
                  @for (col of columns(); track col.id) { <option [value]="col.id">{{ col.label }}</option> }
                </select>
              </div>
              <div>
                <label for="dueDate" class="mb-1.5 block text-sm font-medium">Échéance</label>
                <input id="dueDate" type="date" class="input-base" formControlName="dueDate" />
              </div>
            </div>
            <fieldset>
              <legend class="mb-1.5 text-sm font-medium">Personnes assignées</legend>
              <div class="flex flex-wrap gap-2">
                @for (person of people(); track person.name) {
                  <button type="button" (click)="toggle(person)" [attr.aria-pressed]="isAssigned(person)"
                          class="flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors"
                          [class]="isAssigned(person) ? 'border-primary-strong bg-primary/20' : 'border-line hover:bg-primary/10'">
                    <app-avatar [name]="person.name" [gender]="person.gender" size="sm" /> {{ person.name }}
                  </button>
                }
              </div>
            </fieldset>
          }
          @case (2) {
            <p class="text-lg font-semibold">{{ c.title.value }}</p>
            <app-detail-row label="Projet">{{ c.project.value }}</app-detail-row>
            <app-detail-row label="Priorité">
              <app-badge [tone]="meta[c.priority.value].tone">{{ meta[c.priority.value].label }}</app-badge>
            </app-detail-row>
            <app-detail-row label="Statut">{{ columnLabel() }}</app-detail-row>
            <app-detail-row label="Échéance">{{ c.dueDate.value }}</app-detail-row>
            <app-detail-row label="Personnes assignées">{{ assigneeNames() }}</app-detail-row>
          }
        }
      </form>
    </app-stepper-modal>
  `,
})
export class TaskCreateModalComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly projects = input.required<string[]>();
  readonly people = input.required<Person[]>();
  readonly columns = input.required<KanbanColumn[]>();
  /** Numéro de la prochaine tâche (WEB - n). */
  readonly nextNumber = input.required<number>();

  readonly closed = output<void>();
  readonly created = output<CreatedTask>();

  protected readonly steps = ['Détails', 'Planification', 'Vérification'];
  protected readonly step = signal(0);
  protected readonly priorities = PRIORITIES;
  protected readonly meta = PRIORITY_META;
  protected readonly assigned = signal<Person[]>([]);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    project: ['Nouvelle page d’accueil'],
    priority: this.fb.control<TaskPriority>('medium'),
    columnId: this.fb.control<ColumnId>('not-started'),
    dueDate: [new Date().toISOString().slice(0, 10), Validators.required],
  });
  protected readonly c = this.form.controls;

  protected readonly assigneeNames = computed(() => this.assigned().map((p) => p.name).join(', ') || 'Personne pour le moment');

  protected stepValid(): boolean {
    const perStep: AbstractControl[][] = [[this.c.title, this.c.project, this.c.priority], [this.c.columnId, this.c.dueDate], []];
    return perStep[this.step()].every((ctrl) => ctrl.valid);
  }

  protected invalid(ctrl: AbstractControl): boolean {
    return ctrl.touched && ctrl.invalid;
  }

  protected isAssigned(p: Person): boolean {
    return this.assigned().some((a) => a.name === p.name);
  }

  protected toggle(p: Person): void {
    this.assigned.update((list) => (this.isAssigned(p) ? list.filter((a) => a.name !== p.name) : [...list, p]));
  }

  protected columnLabel(): string {
    return this.columns().find((col) => col.id === this.c.columnId.value)?.label ?? '';
  }

  protected submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const today = new Date().toISOString().slice(0, 10);
    this.created.emit({
      columnId: v.columnId,
      task: {
        id: `t${Date.now()}`,
        key: `WEB - ${this.nextNumber()}`,
        title: v.title.trim(),
        project: v.project,
        priority: v.priority,
        dueDate: v.dueDate,
        createdAt: today,
        comments: 0,
        assignees: this.assigned(),
      },
    });
    this.closed.emit();
  }
}
