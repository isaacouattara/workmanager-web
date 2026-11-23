import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/auth.service';
import { AutofocusDirective } from '../../../shared/directives/autofocus.directive';
import { IconComponent } from '../../../shared/ui/icon.component';
import { LogoComponent } from '../../../shared/ui/logo.component';
import { strictEmail } from '../../../shared/validators/email.validator';

type LoginStep = 1 | 2;

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

  /** Un seul formulaire pour les deux étapes ; chaque étape n'en valide qu'une partie. */
  protected readonly form = this.fb.group({
    email: ['', [Validators.required, strictEmail]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    remember: [false],
  });

  // --- État de l'UI (signals) ---
  protected readonly step = signal<LoginStep>(1);
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
    return this.email.hasError('required') ? 'Saisissez votre adresse e-mail.' : 'Saisissez une adresse e-mail valide.';
  }

  protected passwordError(): string {
    return this.password.hasError('required')
      ? 'Saisissez votre mot de passe.'
      : 'Votre mot de passe doit contenir au moins 8 caractères.';
  }

  /** Point d'entrée du formulaire : aiguille vers l'étape en cours. */
  protected onSubmit(): void {
    this.serverError.set(null);
    if (this.step() === 1) this.submitEmail();
    else this.submitPassword();
  }

  protected backToEmail(): void {
    this.serverError.set(null);
    this.password.reset();
    this.step.set(1);
  }

  /** Étape 1 : valide le format puis vérifie l'email (simulé). */
  private submitEmail(): void {
    this.email.markAsTouched();
    if (this.email.invalid) return;

    this.loading.set(true);
    this.auth
      .checkEmail(this.email.value)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (exists) =>
          exists ? this.step.set(2) : this.serverError.set('Aucun compte n’est associé à cette adresse e-mail.'),
        error: () => this.serverError.set('Une erreur est survenue. Veuillez réessayer.'),
      });
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
