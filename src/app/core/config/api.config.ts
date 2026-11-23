import { InjectionToken } from '@angular/core';

/**
 * URL de base de l'API Spring Boot.
 * '/api' passe par le proxy de dev (proxy.conf.json -> http://localhost:8080).
 * En production, on la surchargera via `providers`.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
