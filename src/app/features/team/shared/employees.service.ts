import { Injectable, signal } from '@angular/core';
import { Observable, delay, of, tap } from 'rxjs';
import type { Employee } from './employee.model';
import { EMPLOYEES } from './employees.mock';

/** Données saisies dans le modal de création (sans l'id, généré par le serveur). */
export type NewEmployee = Omit<Employee, 'id' | 'verified' | 'loggedHours' | 'skills' | 'task'>;

/**
 * Magasin des employés (partagé par Employees et Workload).
 * `employees` est un signal en lecture seule : toute page qui le lit se met à jour
 * automatiquement quand on ajoute/supprime.
 *
 * TODO API : remplacer les corps par HttpClient :
 *   - chargement : GET    /api/employees
 *   - add        : POST   /api/employees
 *   - remove     : DELETE /api/employees/{id}
 */
@Injectable({ providedIn: 'root' })
export class EmployeesService {
  private readonly store = signal<Employee[]>(EMPLOYEES);
  readonly employees = this.store.asReadonly();

  add(input: NewEmployee): Observable<Employee> {
    const employee: Employee = {
      ...input,
      id: `e${Date.now()}`,
      verified: false, // devient vrai quand la personne accepte l'invitation
      loggedHours: 0,
      skills: [],
      task: null,
    };
    return of(employee).pipe(
      delay(500),
      tap((e) => this.store.update((list) => [e, ...list])),
    );
  }

  remove(id: string): void {
    this.store.update((list) => list.filter((e) => e.id !== id));
  }
}
