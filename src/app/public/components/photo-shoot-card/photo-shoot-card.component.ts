import { Component, input, signal } from '@angular/core';
import { AccordionComponent } from '../../../shared/organisms/accordion/accordion.component';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { ModalFullScreenComponent } from '../modal-full-screen/modal-full-screen.component';
import { ChooseAPlanComponent } from '../sell-property/choose-a-plan/choose-a-plan.component';

@Component({
  selector: 'app-photo-shoot-card',
  standalone: true,
  imports: [AccordionComponent, ButtonComponent, ModalFullScreenComponent, ChooseAPlanComponent],
  templateUrl: './photo-shoot-card.component.html',
})
export class PhotoShootCardComponent {
  modalOpen = signal(false);
  propertyId = input<string | undefined>(undefined);
  activePlan = signal<any>(undefined);

  shouldScrollToServices = signal(false);

  cardTitle = input<string>(`Desideri acquistare un servizio fotografico professionale?`);
  cardDescription = input<string>(
    `Cattura ogni dettaglio del tuo immobile dando un look professionale alle tue foto acquistando il <b>servizio fotografico.</b>`
  );
  accordionTitle = 'Scopri come funziona';
  accordionContent = `
    <ol>
      <li>1 - Individueremo un fotografo professionista nella tua zona</li>
      <li>2 - Ti metteremo in contatto per fissare una data in cui poter effettuare le fotografie</li>
      <li>3 - Appena pronte procederemo a caricarle nel tuo annuncio</li>
    </ol>
  `;

  handleClick() {
    console.log('Acquista servizio fotografico');
    // Set flag to scroll to services when modal opens
    this.shouldScrollToServices.set(true);
    // Open the modal when button is clicked
    this.modalOpen.set(true);
  }

  onModalClose() {
    this.modalOpen.set(false);
    this.shouldScrollToServices.set(false);
  }
}
