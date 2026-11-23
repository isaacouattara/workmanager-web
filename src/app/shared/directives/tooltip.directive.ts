import { Directive, ElementRef, OnDestroy, inject, input } from '@angular/core';

/**
 * Infobulle légère : <a appTooltip="Dashboard" [tooltipEnabled]="collapsed()">.
 * Elle est ajoutée au <body> en position fixe : ainsi elle n'est JAMAIS coupée par un
 * conteneur scrollable (cas de la sidebar réduite). Affichée à droite de l'élément.
 */
@Directive({
  selector: '[appTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(focus)': 'show()',
    '(mouseleave)': 'hide()',
    '(blur)': 'hide()',
    '(click)': 'hide()',
  },
})
export class TooltipDirective implements OnDestroy {
  readonly text = input.required<string>({ alias: 'appTooltip' });
  /** Permet de ne l'activer que dans certains modes (ex. sidebar réduite). */
  readonly tooltipEnabled = input(true);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private tip: HTMLElement | null = null;

  protected show(): void {
    if (!this.tooltipEnabled() || this.tip) return;
    const rect = this.host.nativeElement.getBoundingClientRect();
    const tip = document.createElement('div');
    tip.setAttribute('role', 'tooltip');
    tip.textContent = this.text();
    tip.className = 'pointer-events-none fixed z-[80] -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium text-surface shadow-lg animate-fade';
    tip.style.left = `${rect.right + 10}px`;
    tip.style.top = `${rect.top + rect.height / 2}px`;
    document.body.appendChild(tip);
    this.tip = tip;
  }

  protected hide(): void {
    this.tip?.remove();
    this.tip = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
