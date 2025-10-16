import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

import { environment_dev } from '../../../environments/env.dev';
import { Plan } from '../../../public/interface/plan.interface';
import { PaymentService } from '../../../public/service/payment.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CheckIconComponent } from '../../atoms/icons/check-icon/check-icon.component';
import { CloseIconComponent } from '../../atoms/icons/close-icon/close-icon.component';
import { InfoCircleIcon } from '../../atoms/icons/info-icon/info-circle.component';
import { BreakLineComponent } from '../../molecules/break-line/break-line.component';
import { ToggleButtonComponent } from '../../molecules/toggle-button/toggle-button.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const homeUrl = environment_dev.homeUrl;

@Component({
  selector: 'app-subscription-plan',
  standalone: true,
  imports: [
    BreakLineComponent,
    ButtonComponent,
    CheckIconComponent,
    CommonModule,
    CloseIconComponent,
    InfoCircleIcon,
    ToggleButtonComponent,
    FaIconComponent,
  ],
  templateUrl: './subscription-plan.component.html',
  styleUrl: './subscription-plan.component.scss',
})
export class SubscriptionPlanComponent {
  router = inject(Router);
  paymentService = inject(PaymentService);
  propertyStatus = input<string | undefined>(undefined);
  propertyId = input<string | undefined>(undefined);
  plan = input<any>({} as Plan);
  advertisementId = input<string | undefined>('');
  type = input<string>();
  withEvaluation = input<boolean>(false);
  disableButton = input<boolean>(false);

  handleClick() {
    if (this.plan().id) {
      this.paymentService.settings.set({
        planId: this.plan().id!,
      });
    }
    if (!this.propertyId()) {
      return this.router.navigate(['/property-publishing'], {
        queryParams: {
          withEvaluation: this.withEvaluation(),
        },
      });
    }

    this.paymentService.settings.set({
      planId: this.plan().id!,
      advertismentId: this.propertyId()!,
    });

    console.log('Property ID:', this.propertyId());
    console.log('Plan ID:', this.plan().id);

    if (this.propertyStatus() === 'draft') {
      return this.router.navigate(['/property-publishing/', this.propertyId()], {});
    }

    //if (!this.advertisementId()) return this.router.navigate(['/property-publishing'], {});
    return this.router.navigate(['/checkout'], {});
  }

  protected readonly faArrowRight = faArrowRight;
}
