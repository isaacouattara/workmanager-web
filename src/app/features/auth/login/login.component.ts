import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, map, startWith } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { IconComponent } from '../../../shared/ui/icon.component';
import { LogoComponent } from '../../../shared/ui/logo.component';
import { strictEmail } from '../../../shared/validators/email.validator';

/**
 * Page de connexion en 2 étapes (stepper) :
 *   1. Email    -> format valide, puis (plus tard) existence en base via l'API
 *   2. Mot de passe + "Se souvenir de moi" -> connexion
 * Pas de création de compte ici : les comptes arrivent par invitation.
 */
@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, IconComponent, LogoComponent, AutofocusDirective],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // ---- Carousel ----
  protected readonly slideDuration = 6000;
  protected readonly paused = signal(false);
  protected readonly current = signal(0);

  protected readonly slides = [
    {
      title: 'dashboard',
      before: 'Simplifiez la gestion avec notre ',
      highlight: 'tableau de bord',
      after: '.',
      text: 'Simplifiez le pilotage de vos équipes et de vos projets avec une interface claire et facile à prendre en main.',
      image: 'assets/img/auth/slide-1.png',
    },
    {
      title: 'equipe',
      before: 'Collaborez sans friction avec votre ',
      highlight: 'équipe',
      after: '.',
      text: 'Invitez vos collaborateurs, répartissez les rôles et travaillez ensemble au même endroit.',
      image: 'assets/img/auth/slide-2.png',
    },
    {
      title: 'projets',
      before: 'Suivez l’avancement de vos ',
      highlight: 'projets',
      after: ' en temps réel.',
      text: 'Gardez une vue d’ensemble sur les tâches, les échéances et la progression de chaque projet.',
      image: 'assets/img/auth/slide-3.png',
    },
  ];

  /** Un seul formulaire pour les deux étapes ; chaque étape n'en valide qu'une partie. */
  protected readonly form = this.fb.group({
    email: ['', [Validators.required, strictEmail]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
  });

  // --- État de l'UI (signals) ---
  protected readonly emailValid = toSignal(
    this.email.statusChanges.pipe(
      startWith(null),
      map(() => this.email.valid),
    ),
    { initialValue: false },
  );
  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);
  /** Erreur renvoyée par le serveur (email inconnu, mauvais mot de passe…). */
  protected readonly serverError = signal<string | null>(null);

  protected get email() {
    return this.form.controls.email;
  }
  protected get password() {
    return this.form.controls.password;
  }

  /** Message d'erreur lisible pour le champ email. */
  protected emailError(): string {
    return this.email.hasError('required')
      ? 'Saisissez votre adresse e-mail.'
      : 'Saisissez une adresse e-mail valide.';
  }

  protected passwordError(): string {
    return this.password.hasError('required')
      ? 'Saisissez votre mot de passe.'
      : 'Votre mot de passe doit contenir au moins 8 caractères.';
  }

  protected next(): void {
    this.current.update((i) => (i + 1) % this.slides.length);
  }
  protected go(i: number): void {
    this.current.set(i);
  }

  /** Point d'entrée du formulaire. */
  protected onSubmit(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }
    if (this.password.invalid) {
      this.password.markAsTouched();
      return;
    }
    this.serverError.set(null);
    this.submitPassword();
  }

  /** Étape 2 : connexion puis redirection vers la page demandée (ou le dashboard). */
  private submitPassword(): void {
    this.password.markAsTouched();
    if (this.password.invalid) return;

    this.loading.set(true);
    const { email, password, remember } = this.form.getRawValue();
    this.auth
      .login({ email, password, remember })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigateByUrl(this.safeReturnUrl()),
        error: () => this.serverError.set('E-mail ou mot de passe incorrect.'),
      });
  }

  /** N'accepte que des chemins internes ("/x") pour éviter une redirection vers un site externe. */
  private safeReturnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/';
  }
}
