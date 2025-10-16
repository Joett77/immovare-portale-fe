import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';

interface FAQItem {
  question: string;
  answer: string;
  isOpen: boolean;
}

@Component({
  selector: 'app-dashboard-support',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  templateUrl: './dashboard-support.component.html',
  styleUrl: './dashboard-support.component.scss',
})
export class DashboardSupportComponent {

  private router = inject(Router);


  faqItems: FAQItem[] = [
    {
      question: "Che cos'è Immovare.it?",
      answer:
        'Immovare.it non è solo un Agenzia Immobiliare On Line, ma anche un Portale Web ed una Software House che progetta e sviluppa soluzioni verticali rivolte ai clienti finali, con lo scopo di rendere più facile, sicuro ed economico il processo di compravendita immobiliare.',
      isOpen: true,
    },
    {
      question: 'Perché vendere casa con Immovare.it?',
      answer:
        'La risposta dipende dalle tue esigenze specifiche. Offriamo diversi vantaggi come commissioni competitive, supporto professionale e una piattaforma digitale avanzata.',
      isOpen: false,
    },
    {
      question: 'È possibile vendere casa velocemente?',
      answer:
        'Sì, è possibile ottimizzare i tempi di vendita attraverso i nostri servizi specializzati e la nostra rete di acquirenti qualificati.',
      isOpen: false,
    },
    {
      question: 'Come scegliere il Piano più adatto alle mie esigenze?',
      answer:
        'Offriamo diversi piani personalizzati in base alle tue necessità specifiche. Puoi confrontare le caratteristiche di ciascun piano e scegliere quello più adatto.',
      isOpen: false,
    },
    {
      question:
        "Siete un'agenzia immobiliare online, cosa c'è di diverso da un'agenzia tradizionale?",
      answer:
        "Come agenzia online, offriamo servizi digitali innovativi mantenendo la professionalità di un'agenzia tradizionale, ma con maggiore flessibilità e costi ridotti.",
      isOpen: false,
    },
    {
      question: 'Come riuscite ad offrire un servizio di questa qualità con un prezzo così basso?',
      answer:
        "Grazie alla nostra struttura digitale e all'automazione di molti processi, riusciamo a mantenere i costi operativi bassi e trasferire questi risparmi ai nostri clienti.",
      isOpen: false,
    },
    {
      question:
        "Con un canone mensile fisso perché vi impegnate a vendere velocemente l'immobile? Non conviene prendere tempo e incassare l'abbonamento?",
      answer:
        'Il nostro obiettivo è la soddisfazione del cliente e la costruzione di relazioni a lungo termine. Vendere velocemente significa clienti soddisfatti che ci raccomanderanno ad altri.',
      isOpen: false,
    },
  ];

  toggleItem(item: FAQItem): void {
    // Close all other items
    this.faqItems.forEach(faqItem => {
      if (faqItem !== item) {
        faqItem.isOpen = false;
      }
    });
    // Toggle the clicked item
    item.isOpen = !item.isOpen;
  }

  goToTicket() {
    this.router.navigate(['/dashboard/messaggi/nuovo']);
  }
}
