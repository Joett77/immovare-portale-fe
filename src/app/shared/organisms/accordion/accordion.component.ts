import { Component, input } from '@angular/core';
import { ButtonComponent } from "../../atoms/button/button.component";
import { ArrowLeftIconComponent } from "../../atoms/icons/arrow-left-icon/arrow-left-icon.component";
import { ArrowRightIconComponent } from "../../atoms/icons/arrow-right-icon/arrow-right-icon.component";
import { ArrowDownIconComponent } from "../../atoms/icons/arrow-down-icon/arrow-down-icon.component";

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [ButtonComponent, ArrowLeftIconComponent, ArrowRightIconComponent, ArrowDownIconComponent],
  templateUrl: './accordion.component.html'
})
export class AccordionComponent {
  title = input<string>();
  content = input<string> (`
    <ul class="space-y-1">
      <li>Punto 1: Dettaglio del servizio</li>
      <li>Punto 2: Cosa aspettarsi</li>
      <li>Punto 3: Come prenotare</li>
    </ul>
  `)
  isAccordionOpen: boolean = false;
  toggleAccordion() {
    this.isAccordionOpen = !this.isAccordionOpen;
  }
}
