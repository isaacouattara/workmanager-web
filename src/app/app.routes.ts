import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth/auth.guard';
import { FOOTER_LINKS, NAV_GROUPS } from './core/navigation/nav.config';

/**
 * Pages de la navigation pas encore développées : une route "placeholder" est générée
 * automatiquement à partir de la config de navigation (source unique de vérité).
 * Quand un module est prêt, on met `ready: true` dans nav.config.ts et on ajoute sa vraie route.
 */
const placeholderRoutes: Routes = [
  ...NAV_GROUPS.flatMap((g) => g.items),
  ...FOOTER_LINKS,
]
  .filter((item) => !item.ready)
  .map((item) => ({
    path: item.path,
    title: `${item.label} | WorkManager`,
    data: { pageTitle: item.label }, // reçu par PlaceholderComponent via input()
    loadComponent: () =>
      import('./features/placeholder/placeholder.component').then((m) => m.PlaceholderComponent),
  }));

export const routes: Routes = [
  // Zone publique : page de connexion (inaccessible si déjà connecté).
  {
    path: 'login',
    canActivate: [guestGuard],
    title: 'Sign in | WorkManager',
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },

  // Zone privée : tout passe par le "shell" (sidebar + contenu) et est protégé par authGuard.
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        title: 'Dashboard | WorkManager',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'teams/employees',
        title: 'Employees | WorkManager',
        loadComponent: () =>
          import('./features/team/employees/employees.component').then((m) => m.EmployeesComponent),
      },
      {
        path: 'teams/workload',
        title: 'Workload | WorkManager',
        loadComponent: () =>
          import('./features/team/workload/workload.component').then((m) => m.WorkloadComponent),
      },
      ...placeholderRoutes,
    ],
  },

  { path: '**', redirectTo: '' },
];
