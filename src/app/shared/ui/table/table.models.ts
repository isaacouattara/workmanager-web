/** Définition d'une colonne du tableau générique. */
export interface TableColumn<T> {
  /** Clé de la colonne : nom de la propriété de la ligne ET nom du template de cellule (appCell). */
  key: string;
  /** Titre affiché dans l'en-tête (vide pour la colonne d'actions). */
  header: string;
  /** Active le tri au clic sur l'en-tête. */
  sortable?: boolean;
  /** Valeur utilisée pour trier si elle diffère de row[key] (ex. date ISO, nom en minuscules…). */
  sortValue?: (row: T) => string | number;
  /** Classes Tailwind additionnelles de la colonne (largeur, alignement…). */
  class?: string;
}
