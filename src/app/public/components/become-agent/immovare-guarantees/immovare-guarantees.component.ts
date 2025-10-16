import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Step {
  title: string;
  description: string;
}

@Component({
  selector: 'app-immovare-guarantees',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './immovare-guarantees.component.html',
  styleUrl: './immovare-guarantees.component.scss',
})
export class ImmovareGuaranteesComponent {
  steps: Step[] = [
    {
      title: 'Niente contributi, solo provvigioni',
      description:
        'Non dovrai versare alcun contributo, solo provvigioni attive. Non pagherai nessuna fee d’ingresso ne royalty. <br/>Non dovrai versare nessun contributo per la pubblicità o per la tua postazione.<br/> Penseremo a tutto noi.',
    },
    {
      title: 'Marketing & Back Office',
      description:
        'Sarà tutto a portata di click: niente accumuli di carta ma piuttosto, un’organizzazione efficiente sul tuo pc e smartphone. Appuntamenti, notizie, modulistica, contratti, documenti, etc. saranno sempre  a portata di mouse. <br/> Avrai un team sempre a tua disposizione che ti supporterà in tutto, dalla gestione degli appuntamenti alla due diligence documentale fino al coordinamento di preliminari ed atti di compravendita.',
    },
    {
      title: 'Niente spese, solo profitti!',
      description:
        'Non avrai nessun limite circa le zone in cui vorrai operare. Che sia una villa in Sicilia, un loft a Milano o un appartamento a Bari. Ovunque tu sia potrai scegliere se lavorare da solo/a o collaborare con altri colleghi “immovatori”, potrai rimanere battitore libero o costruire il tuo team. Unico obiettivo sviluppare il tuo business senza limiti e/o costrizioni, con il solo scopo di crescere insieme.',
    },
  ];
}
