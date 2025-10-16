import { CurrencyPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

import { Plan } from '../../../public/interface/plan.interface';
import { PaymentService } from '../../../public/service/payment.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ChevronDownIconComponent } from '../../atoms/icons/chevron-down-icon/chevron-down-icon.component';

@Component({
  selector: 'app-single-service-row',
  standalone: true,
  imports: [ChevronDownIconComponent, ButtonComponent, CurrencyPipe, FontAwesomeModule],
  templateUrl: './single-service-row.component.html',
  styleUrl: './single-service-row.component.scss',
})
export class SingleServiceRowComponent {
  paymentService = inject(PaymentService);
  router = inject(Router);
  service = input<Plan>({} as Plan);
  propertyId = input<string>('');
  chevron = signal<boolean>(false);
  chevronUp = faChevronUp;
  chevronDown = faChevronDown;
  submit() {
    this.paymentService.settings.set({
      planId: this.service().id!,
      advertismentId: this.propertyId()!,
    });

    //if (!this.advertisementId()) return this.router.navigate(['/property-publishing'], {});
    return this.router.navigate(['/checkout'], {});
  }
}
