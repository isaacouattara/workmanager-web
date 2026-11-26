import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, switchMap, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthUser, Credentials, RegistrationData } from './auth.models';

const SESSION_KEY = 'wm-session';

/**
 * Service d'authentification connecté à l'API Spring Boot.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly _user = signal<AuthUser | null>(this.restoreSession());

  /** Utilisateur courant (lecture seule pour les composants). */
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  /** JWT à ajouter aux requêtes (lu par l'interceptor). */
  token(): string | null {
    return this._user()?.token ?? null;
  }

  /** POST /auth/register -> 201 */
  register(data: RegistrationData): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/auth/register`, data);
  }

  /** POST /auth/login -> { accessToken }, puis GET /auth/me avec ce jeton. */
  login(credentials: Credentials): Observable<AuthUser> {
    return this.http
      .post<{ accessToken: string }>(`${this.apiBaseUrl}/auth/login`, {
        email: credentials.email,
        password: credentials.password,
      })
      .pipe(
        switchMap(({ accessToken }) =>
          this.http
            .get<AuthUser>(`${this.apiBaseUrl}/auth/me`, {
              headers: new HttpHeaders({ Authorization: `Bearer ${accessToken}` }),
            })
            .pipe(map((user) => ({ ...user, token: accessToken }))),
        ),
        tap((user) => {
          this._user.set(user);
          this.persistSession(user, credentials.remember);
        }),
      );
  }

  /** GET /auth/me -> utilisateur courant (le bearer est ajouté par l'interceptor). */
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.apiBaseUrl}/auth/me`).pipe(
      map((user) => ({ ...user, token: this.token() ?? undefined })),
      tap((user) => this._user.set(user)),
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
