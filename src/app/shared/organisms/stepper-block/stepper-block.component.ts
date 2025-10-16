import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stepper-block',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './stepper-block.component.html',
  styleUrl: './stepper-block.component.scss',
})
export class StepperBlockComponent {
  steps = [
    'Carica il tuo annuncio',
    'Scegli il piano di abbonamento',
    'Metti online il tuo immobile',
    'Hai venduto casa!',
  ];

  private router = inject(Router);

  onButtonClick() {
    this.router.navigate(['/voglio-vendere']);
  }
}
