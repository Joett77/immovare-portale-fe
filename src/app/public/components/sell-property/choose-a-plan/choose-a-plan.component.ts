import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  input,
  OnInit,
  Output,
  AfterViewInit,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { ArrowRightIconComponent } from '../../../../shared/atoms/icons/arrow-right-icon/arrow-right-icon.component';
import { ChevronDownIconComponent } from '../../../../shared/atoms/icons/chevron-down-icon/chevron-down-icon.component';
import { SingleServiceRowComponent } from '../../../../shared/components/single-service-row/single-service-row.component';
import { SubscriptionPlanComponent } from '../../../../shared/organisms/subscription-plan/subscription-plan.component';
import { PlanAndServiceService } from '../../../services/plan-and-service.service';
import { faTimes, faLink } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-choose-a-plan',
  standalone: true,
  imports: [
    SubscriptionPlanComponent,
    FontAwesomeModule,
    ChevronDownIconComponent,
    ButtonComponent,
    ArrowRightIconComponent,
    CommonModule,
    SingleServiceRowComponent,
  ],
  templateUrl: './choose-a-plan.component.html',
  styleUrl: './choose-a-plan.component.scss',
})
export class ChooseAPlanComponent implements OnInit, AfterViewInit {
  private _planService = inject(PlanAndServiceService);
  propertyStatus = input<string | undefined>(undefined);
  propertyId = input<string | undefined>(undefined);
  activePlan = input<any | undefined>(undefined);
  hasHeader = input<boolean>(true);
  withEvaluation = input<boolean>(false);
  shouldScrollToServices = input<boolean>(false);
  @Input() listService = false;
  @Output() onModalClose = new EventEmitter();
  plans = this._planService.plansList$;
  service = this._planService.serviceList$;

  ngOnInit(): void {
    this._planService.getPlan({ status: 'active' });
    if (this.listService) {
      this._planService.getService();
    }
  }

  ngAfterViewInit(): void {
    // Auto-scroll to services if requested
    if (this.shouldScrollToServices() && this.listService) {
      // Use setTimeout to ensure the view is fully rendered
      setTimeout(() => {
        this.scrollToServices();
      }, 300);
    }
  }

  scrollToServices(): void {
    const servicesElement = document.getElementById('servizi-singoli-section');
    if (servicesElement) {
      servicesElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
    } else {
      // Fallback: try to find by class or other selector
      const fallbackElement = document.querySelector('.servizi-singoli-section');
      if (fallbackElement) {
        fallbackElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      } else {
        // Final fallback: try multiple times with longer delays
        setTimeout(() => {
          const retryElement =
            document.getElementById('servizi-singoli-section') ||
            document.querySelector('.servizi-singoli-section');
          if (retryElement) {
            retryElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest',
            });
          }
        }, 600);
      }
    }
  }

  faLink = faLink;
  protected readonly exitIcon = faTimes;
}
