import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { firstValueFrom } from 'rxjs';

import { SubscriptionInvoiceComponent } from '../../../../cms/pages/subscription/subscription-invoice/subscription-invoice.component';
import { PlanDataPipe } from '../../../../core/pipes/plan-data.pipe';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';
import { ModalFullScreenComponent } from '../../../components/modal-full-screen/modal-full-screen.component';
import { ChooseAPlanComponent } from '../../../components/sell-property/choose-a-plan/choose-a-plan.component';
import { PaymentService, Subscription, PaymentMethod } from '../../../service/payment.service';
import { UserHeadsetIconComponent } from '../../../../shared/atoms/icons/user-headset-icon/user-headset-icon.component';
import { PaymentMethodManagerComponent } from '../../../components/dashboard/payment-method-manager/payment-method-manager.component';

@Component({
  selector: 'app-dashboard-single-property',
  standalone: true,
  imports: [
    ButtonComponent,
    PlusIconComponent,
    RouterLink,
    CommonModule,
    FontAwesomeModule,
    PlanDataPipe,
    SpinnerComponent,
    ChooseAPlanComponent,
    ModalFullScreenComponent,
    SubscriptionInvoiceComponent,
    UserHeadsetIconComponent,
    PaymentMethodManagerComponent,
  ],
  templateUrl: './dashboard-single-property.component.html',
  styleUrl: './dashboard-single-property.component.scss',
})
export class DashboardSinglePropertyComponent implements OnInit {
  faDownload = faDownload;
  faArrowRight = faArrowRight;

  activatedRoute = inject(ActivatedRoute);
  paymentService = inject(PaymentService);
  private router = inject(Router);

  idProperty = input<string>('');
  property = signal<any>(undefined);
  isLoading = signal<boolean>(false);
  modaPlanOpen = signal(false);
  modaInvoiceOpen = signal(false);
  activePlan = signal<any>(undefined);

  transaction = signal<Subscription[]>([]);

  subscription = computed(
    () => this.transaction()?.filter(trans => trans.type === 'subscription') ?? []
  );

  payment = computed(
    () => this.transaction()?.filter(trans => trans.type === 'payment_intent') ?? []
  );

  propertyEffect = effect(() => {
    if (this.property()) {
      this.getSubscriptionData();
    }
  });

  async ngOnInit() {
    const property = await firstValueFrom(this.activatedRoute.data);
    this.property.set(property['property'].data);
  }

  async getSubscriptionData() {
    this.transaction.set(
      await this.paymentService.findSubscription({
        advertisementsId: this.property().id,
        status: ['active', 'succeeded'],
      })
    );
  }

  async cancelSubscription(id: string) {
    this.isLoading.set(true);
    try {
      await this.paymentService.deleteSubscriptionAtEndBilling(id);
      setTimeout(() => {
        this.getSubscriptionData();
        this.isLoading.set(false);
      }, 2000);
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      this.isLoading.set(false);
    }
  }

  async activeSubscription(id: string) {
    this.isLoading.set(true);
    try {
      await this.paymentService.restoreeSubscription(id);
      setTimeout(() => {
        this.getSubscriptionData();
        this.isLoading.set(false);
      }, 2000);
    } catch (error) {
      console.error('Error activating subscription:', error);
      this.isLoading.set(false);
    }
  }

  openPlanDialog() {
    // Implementation if needed
  }

  closeModalInvoice = () => {
    this.modaInvoiceOpen.set(false);
  };

  openUpgradePlan(subId: any) {
    this.activePlan.set(subId);
    this.modaPlanOpen.set(true);
  }

  // Payment method event handlers
  onPaymentMethodAdded(paymentMethod: PaymentMethod) {
    console.log('Payment method added:', paymentMethod);
    // You can add additional logic here if needed
    // For example, show a success toast notification
  }

  onPaymentMethodDeleted(paymentMethodId: string) {
    console.log('Payment method deleted:', paymentMethodId);
    // You can add additional logic here if needed
    // For example, show a success toast notification
  }

  onDefaultPaymentMethodChanged(paymentMethod: PaymentMethod) {
    console.log('Default payment method changed:', paymentMethod);
    // You can add additional logic here if needed
    // For example, show a success toast notification
  }

  goToTicket() {
    this.router.navigate(['/dashboard/messaggi/nuovo']);
  }
}
