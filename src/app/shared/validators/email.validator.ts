import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validateur d'email strict : exige un domaine avec extension (a@b.co).
 * `Validators.email` d'Angular accepte "a@b", trop permissif pour nous.
 * Erreur retournée : { emailFormat: true }.
 */
export const strictEmail: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null; // le cas "vide" est géré par Validators.required
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) ? null : { emailFormat: true };
};
