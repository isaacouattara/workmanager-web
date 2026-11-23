import { AfterViewInit, Directive, ElementRef, inject } from '@angular/core';

/** Donne le focus à l'élément dès son affichage : <input appAutofocus />. */
@Directive({ selector: '[appAutofocus]' })
export class AutofocusDirective implements AfterViewInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  ngAfterViewInit(): void {
    this.el.nativeElement.focus();
  }
}
