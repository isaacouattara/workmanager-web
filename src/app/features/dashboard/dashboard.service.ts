import { Injectable } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Board, KanbanColumn, Person, StatCard } from './dashboard.models';

/** Données de démonstration. TODO API : GET /api/dashboard et GET /api/projects/{id}/tasks. */
const STATS: StatCard[] = [
  { title: 'Employés actifs', value: 216, delta: '+4', trend: 'up', note: 'Hausse par rapport au mois dernier' },
  { title: 'Projets actifs', value: 312, delta: '+12', trend: 'up', note: 'Hausse par rapport au mois dernier' },
  { title: 'Nombre de tâches', value: 184, delta: '-6', trend: 'down', note: 'Baisse par rapport à hier' },
  { title: 'Objectifs réalisés', value: '84.12%', delta: '+2.4%', trend: 'up', note: 'Hausse par rapport à l’année dernière' },
];

const PEOPLE: Person[] = [
  { name: 'Olivia Brown', gender: 'female' },
  { name: 'Daniel Smith', gender: 'male' },
  { name: 'Sarah Collins', gender: 'female' },
  { name: 'Michael Tan', gender: 'male' },
  { name: 'Jasmine Dizzy', gender: 'female' },
  { name: 'Kevin Lee', gender: 'male' },
];
const [olivia, daniel, sarah, michael, jasmine, kevin] = PEOPLE;

const COLUMNS: KanbanColumn[] = [
  {
    id: 'not-started', label: 'À démarrer',
    tasks: [
      { id: 't21', key: 'WEB - 21', title: 'Site web de Partone Consultancy', project: 'Nouvelle page d’accueil', priority: 'urgent', dueDate: '2026-12-21', createdAt: '2026-11-16', comments: 13, assignees: [olivia, daniel, jasmine] },
      { id: 't68', key: 'WEB - 68', title: 'Maquettes - Page d’accueil', project: 'Nouvelle page d’accueil', priority: 'medium', dueDate: '2026-12-12', createdAt: '2026-11-02', comments: 8, assignees: [sarah] },
    ],
  },
  {
    id: 'pending', label: 'En attente',
    tasks: [
      { id: 't28', key: 'WEB - 28', title: 'Modifier le contenu de la page d’accueil', project: 'Nouvelle page d’accueil', priority: 'urgent', dueDate: '2026-12-23', createdAt: '2026-11-18', comments: 16, assignees: [michael, kevin] },
    ],
  },
  {
    id: 'completed', label: 'Terminées',
    tasks: [
      { id: 't12', key: 'WEB - 12', title: 'Validation du design MTC', project: 'Nouvelle page d’accueil', priority: 'low', dueDate: '2026-11-10', createdAt: '2026-11-04', comments: 10, assignees: [olivia, kevin, sarah] },
      { id: 't97', key: 'WEB - 97', title: 'Révision des composants Nexa', project: 'UI - Système de design', priority: 'medium', dueDate: '2026-11-29', createdAt: '2026-11-12', comments: 28, assignees: [daniel, michael] },
    ],
  },
  {
    id: 'under-review', label: 'À valider',
    tasks: [
      { id: 't88', key: 'WEB - 88', title: 'V0.1 - Système de composants', project: 'Composants et éléments', priority: 'urgent', dueDate: '2026-12-20', createdAt: '2026-11-06', comments: 14, assignees: [jasmine] },
    ],
  },
];

/** Fournit les données du tableau de bord (simulation avec latence réseau). */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  getBoard(): Observable<Board> {
    // structuredClone : le composant modifie les colonnes (drag & drop), on ne touche pas au "mock".
    return of<Board>({
      stats: structuredClone(STATS),
      columns: structuredClone(COLUMNS),
      projects: ['Nouvelle page d’accueil', 'UI - Système de design', 'Composants et éléments', 'Application mobile'],
      people: PEOPLE,
    }).pipe(delay(250));
  }
}
