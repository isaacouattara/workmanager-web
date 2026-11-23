import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/theme/theme.service';

/**
 * Composant racine : il ne contient QUE le <router-outlet>.
 * Les mises en page (sidebar, etc.) sont gérées par les routes (voir app.routes.ts).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<router-outlet />`,
})
export class AppComponent {
  constructor() {
    // Instancie le service de thème dès le démarrage pour appliquer la classe .dark.
    inject(ThemeService);
  }
}
