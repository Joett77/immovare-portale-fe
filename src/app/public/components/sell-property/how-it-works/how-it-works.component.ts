import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckCircleIconComponent } from '../../../../shared/atoms/icons/check-circle-icon/check-circle-icon.component';
import { KeyIconComponent } from '../../../../shared/atoms/icons/key-icon/key-icon.component';
import { MemoIconComponent } from '../../../../shared/atoms/icons/memo-icon/memo-icon.component';
import { PenFieldIconComponent } from '../../../../shared/atoms/icons/pen-field-icon/pen-field-icon.component';

interface Step {
  title: string;
  description: string;
  icon: any;
}

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './how-it-works.component.html',
})
export class HowItWorksComponent {
  steps: Step[] = [
    {
      title: 'Scegli il piano di abbonamento',
      description:
        'Tre piani, tanti strumenti utili alla vendita, tutto ad un prezzo mensile fisso in abbonamento. Nessuna commissione per chi vende, nessun costo in più.',
      icon: MemoIconComponent,
    },
    {
      title: 'Carica il tuo annuncio',
      description:
        "Segui gli step inserendo tutti i dati del tuo immobile. Se scegli uno dei piani in abbonamento ti aiutiamo anche nella redazione dell'annuncio.",
      icon: PenFieldIconComponent,
    },
    {
      title: 'Metti online il tuo immobile',
      description:
        "Una volta pubblicata sarai contattato da uno dei nostri agenti per terminare l'onboarding. Potrai aggiornare documenti e fare l'upgrade del piano in qualsiasi momento.",
      icon: CheckCircleIconComponent,
    },
    {
      title: 'Hai venduto casa!',
      description:
        'Sarai guidato passo dopo passo in tutto il processo, dalla documentazione da produrre al rogito.',
      icon: KeyIconComponent,
    },
  ];
}
