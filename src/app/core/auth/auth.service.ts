import { Injectable, computed, signal } from '@angular/core';
import { Observable, delay, of, tap } from 'rxjs';
import { AuthUser, Credentials } from './auth.models';

const SESSION_KEY = 'wm-session';

/**
 * Service d'authentification.
 * ⚠️ MODE SIMULATION : aucune requête réseau pour l'instant.
 * Pour brancher l'API, il suffit de remplacer le corps de `checkEmail` et `login`
 * par des appels `HttpClient` (voir les TODO) : aucun composant ne change.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<AuthUser | null>(this.restoreSession());

  /** Utilisateur courant (lecture seule pour les composants). */
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  /** JWT à ajouter aux requêtes (lu par l'interceptor). */
  token(): string | null {
    return this._user()?.token ?? null;
  }

  /**
   * Étape 1 du stepper : l'email existe-t-il ?
   * TODO API : GET /api/auth/check-email?email=... -> { exists: boolean }
   */
  checkEmail(_email: string): Observable<boolean> {
    return of(true).pipe(delay(500));
  }

  /**
   * Étape 2 du stepper : authentification.
   * TODO API : POST /api/auth/login { email, password } -> { token, user }
   */
  login(credentials: Credentials): Observable<AuthUser> {
    const local = credentials.email.split('@')[0];
    const user: AuthUser = {
      id: 'demo-user',
      email: credentials.email,
      displayName: local.charAt(0).toUpperCase() + local.slice(1),
      role: 'Administrator',
    };
    return of(user).pipe(
      delay(700),
      tap((u) => {
        this._user.set(u);
        this.persistSession(u, credentials.remember);
      }),
    );
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }

  /** "Se souvenir de moi" -> localStorage (survit à la fermeture), sinon sessionStorage. */
  private persistSession(user: AuthUser, remember: boolean): void {
    const store = remember ? localStorage : sessionStorage;
    store.setItem(SESSION_KEY, JSON.stringify(user));
  }

  private restoreSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
