import { InjectionToken } from '@angular/core';

/** URL de base de l'API Spring Boot pour le développement local. */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8080/api',
});
