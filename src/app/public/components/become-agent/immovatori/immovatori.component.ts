import { Component } from '@angular/core';
import { CalendarCheckIconComponent } from '../../../../shared/atoms/icons/calendar-check-icon/calendar-check-icon.component';
import { BullhornIconComponent } from '../../../../shared/atoms/icons/bullhorn-icon/bullhorn-icon.component';
import { ItalyIconComponent } from '../../../../shared/atoms/icons/italy-icon/italy-icon.component';
import { FilterIconComponent } from '../../../../shared/atoms/icons/filter-icon/filter-icon.component';
import { ChartMixedIconComponent } from '../../../../shared/atoms/icons/chart-mixed-icon/chart-mixed-icon.component';
import { GraduationCapIconComponent } from '../../../../shared/atoms/icons/graduation-cap-icon/graduation-cap-icon.component';
import { CommonModule } from '@angular/common';

interface Step {
  title: string;
  description: string;
  icon: any;
}

@Component({
  selector: 'app-immovatori',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './immovatori.component.html',
  styleUrl: './immovatori.component.scss',
})
export class ImmovatoriComponent {
  steps: Step[] = [
    {
      title: 'Appuntamenti a portata di mano',
      description:
        'Avrai a disposizione, direttamente sulla tua agenda, appuntamenti di acquisizione e di vendita.',
      icon: CalendarCheckIconComponent,
    },
    {
      title: 'Marketing & Back Office',
      description:
        'Tutto il reparto marketing e back office, saranno i tuoi grandi alleati per la crescita della tua carriera.',
      icon: BullhornIconComponent,
    },
    {
      title: 'Niente spese, solo profitti!',
      description:
        'Riceverai provvigioni al massimo degli standard, senza nessuna fee d’ingresso, nessuna royalty e senza nessun contributo e della pubblicità, ci occuperemo noi.',
      icon: ChartMixedIconComponent,
    },
    {
      title: 'Formazione costante',
      description:
        'Avrai a disposizione, in qualsiasi momento, corsi di formazione e aggiornamento sia online che in presenza. Siamo sempre impegnati nella ricerca di temi, per rafforzare le tue skills. La tua preparazione e la tua formazione, per noi,  hanno la priorità.',
      icon: GraduationCapIconComponent,
    },
    {
      title: 'Notizie già qualificate',
      description:
        'Uno dei vantaggi più esclusivi della nostra squadra, è che non dovrai più impegnarti nella ricerca porta a porta. Basta citofoni e chiamate a freddo! Ci occuperemo noi della ricerca e del primo contatto con in cliente.',
      icon: FilterIconComponent,
    },
    {
      title: "Tutta l'Italia per te",
      description:
        'Non avrai limiti di nessun genere. Potrai operare ovunque vorrai, preoccupandoti solo di consolidare il rapporto con i tuoi clienti ed aumentare il tuo volume di vendite.',
      icon: ItalyIconComponent,
    },
  ];
}
