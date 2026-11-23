import { Injectable, computed, effect, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

/** Clé de stockage partagée avec le script inline de index.html. */
const STORAGE_KEY = 'wm-theme';

/**
 * Gère le thème clair/sombre.
 * - État = un signal (réactif, lisible partout via `theme.mode()`).
 * - Effet = ajoute/retire la classe `.dark` sur <html> et persiste le choix.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly mode = signal<ThemeMode>(this.readInitialMode());
  readonly isDark = computed(() => this.mode() === 'dark');

  constructor() {
    effect(() => {
      const mode = this.mode();
      document.documentElement.classList.toggle('dark', mode === 'dark');
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        /* stockage indisponible (navigation privée) : on ignore */
      }
    });
  }

  toggle(): void {
    this.mode.update((m) => (m === 'dark' ? 'light' : 'dark'));
  }

  /** Choix sauvegardé > préférence du système > clair. */
  private readInitialMode(): ThemeMode {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      /* ignore */
    }
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
