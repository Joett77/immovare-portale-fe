import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-stepper-hp-block',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './stepper-hp-block.component.html',
  styleUrl: './stepper-hp-block.component.scss'
})
export class StepperHpBlockComponent {
  private router = inject(Router);
  steps = [
    "Carica il tuo annuncio",
    "Scegli il piano di abbonamento",
    "Metti online il tuo immobile",
    "Hai venduto casa!"
  ];
  imagePath = "./assets/woman_on_couch.png";
  goToPage() {
    this.router.navigate(['/voglio-vendere']);
  }
}
