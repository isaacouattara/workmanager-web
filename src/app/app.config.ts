import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/http/auth.interceptor';

/**
 * Configuration globale (équivalent des "providers" racine).
 * - withComponentInputBinding : les paramètres/données de route arrivent directement dans les input() des composants.
 * - withInterceptors : chaîne d'interceptors HTTP (JWT, gestion des 401).
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
  ],
};
