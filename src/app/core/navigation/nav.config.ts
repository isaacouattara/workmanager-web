import type { IconName } from '../../shared/ui/icons';

/**
 * Configuration de la navigation : SOURCE UNIQUE utilisée par
 *  - la sidebar (affichage),
 *  - le router (routes placeholder),
 *  - la recherche (pages indexées).
 * Pour ajouter une page : l'ajouter ici, rien d'autre à dupliquer.
 */

/** Lien simple. `path` est relatif à la racine (sans "/" initial). */
export interface NavLeaf {
  label: string;
  path: string;
  /** true = la page est réellement développée (sinon : page "bientôt disponible"). */
  ready?: boolean;
}

export interface NavLink extends NavLeaf {
  icon: IconName;
}

/** Groupe repliable (ex. "Teams") contenant plusieurs liens. */
export interface NavGroup {
  id: string;
  label: string;
  icon: IconName;
  items: NavLeaf[];
}

export const NAV_TOP: NavLink = { label: 'Tableau de bord', path: 'dashboard', icon: 'dashboard', ready: true };

/**
 * Menu principal : UNIQUEMENT des pages qui existent (menu + sous-menus).
 * Quand un nouveau module est prêt, on ajoute simplement son entrée ici.
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'teams',
    label: 'Équipe',
    icon: 'users',
    items: [
      { label: 'Employés', path: 'teams/employees', ready: true },
      { label: 'Charge de travail', path: 'teams/workload', ready: true },
    ],
  },
];

/**
 * Liens du pied de sidebar (il n'y a pas de header sur desktop).
 * Pages encore non développées -> page "bientôt disponible" générée automatiquement.
 */
export const FOOTER_LINKS: NavLink[] = [
  { label: 'Notifications', path: 'notifications', icon: 'bell' },
  { label: 'Paramètres', path: 'settings', icon: 'settings' },
];
