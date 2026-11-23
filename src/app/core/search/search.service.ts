import { Injectable } from '@angular/core';
import type { IconName } from '../../shared/ui/icons';
import { FOOTER_LINKS, NAV_GROUPS, NAV_TOP } from '../navigation/nav.config';

export type SearchGroupLabel = 'Pages' | 'Membres' | 'Projets';

export interface SearchItem {
  id: string;
  label: string;
  /** Petit texte à droite (ex. le groupe de menu ou le rôle). */
  hint: string;
  group: SearchGroupLabel;
  icon: IconName;
  route: string;
}

export interface SearchGroup {
  label: SearchGroupLabel | 'Suggestions';
  items: SearchItem[];
}

/** Données factices : seront remplacées par un appel `GET /api/search?q=` du backend. */
const MOCK_MEMBERS: SearchItem[] = [
  ['Olivia Bennett', 'Responsable produit'],
  ['Sophie Kim', 'Chef de projet'],
  ['Daniel Morgan', 'Designer produit senior'],
  ['Alexandra Ruiz', 'Développeuse back-end'],
].map(([name, role]) => ({
  id: `member:${name}`,
  label: name,
  hint: role,
  group: 'Membres' as const,
  icon: 'user' as const,
  route: '/teams/employees',
}));

const MOCK_PROJECTS: SearchItem[] = [
  ['WEB-21', 'Site web de Partone Consultancy'],
  ['WEB-12', 'Validation du design MTC'],
  ['WEB-88', 'V0.1 - Système de composants'],
].map(([key, name]) => ({
  id: `project:${key}`,
  label: name,
  hint: key,
  group: 'Projets' as const,
  icon: 'folder' as const,
  route: '/dashboard',
}));

/** Pages déduites automatiquement de la config de navigation. */
const PAGE_ITEMS: SearchItem[] = [
  { ...NAV_TOP, hint: 'Principal' },
  ...NAV_GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, hint: g.label, icon: g.icon }))),
  ...FOOTER_LINKS.map((l) => ({ ...l, hint: 'Compte' })),
].map((p) => ({
  id: `page:${p.path}`,
  label: p.label,
  hint: p.hint,
  group: 'Pages' as const,
  icon: p.icon,
  route: `/${p.path}`,
}));

const ALL_ITEMS: SearchItem[] = [...PAGE_ITEMS, ...MOCK_MEMBERS, ...MOCK_PROJECTS];

const SUGGESTED_IDS = ['page:dashboard', 'page:teams/employees', 'page:teams/workload', 'project:WEB-21'];

/** Normalise : minuscules + sans accents, pour une recherche tolérante. */
const normalize = (s: string): string =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Service de recherche (simulation locale pour l'instant). */
@Injectable({ providedIn: 'root' })
export class SearchService {
  /** Résultats affichés quand le champ est vide. */
  suggestions(): SearchGroup[] {
    const items = SUGGESTED_IDS.map((id) => ALL_ITEMS.find((i) => i.id === id)).filter(
      (i): i is SearchItem => !!i,
    );
    return [{ label: 'Suggestions', items }];
  }

  /** Filtre tous les éléments puis les regroupe (Pages / Members / Projects). */
  search(query: string): SearchGroup[] {
    const q = normalize(query.trim());
    if (!q) return this.suggestions();

    const matches = ALL_ITEMS.filter((i) => normalize(`${i.label} ${i.hint}`).includes(q));
    const labels: SearchGroupLabel[] = ['Pages', 'Membres', 'Projets'];
    return labels
      .map((label) => ({ label, items: matches.filter((i) => i.group === label) }))
      .filter((g) => g.items.length > 0);
  }
}
