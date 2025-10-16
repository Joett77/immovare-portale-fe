import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, effect, inject, OnDestroy, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckSquare, faSquare, faTimes } from '@fortawesome/free-solid-svg-icons';

import { PlanDataPipe } from '../../../core/pipes/plan-data.pipe';
import { environment_dev } from '../../../environments/env.dev';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { SquareLightIconComponent } from '../../../shared/atoms/icons/square-light-icon/square-light-icon.component';
import { ModalFullScreenComponent } from '../../components/modal-full-screen/modal-full-screen.component';
import { PaymentService } from '../../service/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    PlanDataPipe,
    ModalFullScreenComponent,
    FontAwesomeModule,
    SquareLightIconComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss',
})
export class CheckoutComponent implements OnInit, OnDestroy {
  submitDisabled: boolean = true;
  modalOpen: boolean = false;
  isProcessingPayment: boolean = false; // NEW: Add loading state

  prepareCheckoutSession() {
    throw new Error('Method not implemented.');
  }
  exitIcon = faTimes;
  platformId = inject(PLATFORM_ID);
  paymentService = inject(PaymentService);
  router = inject(Router);
  clientSicret = signal<string | undefined>(undefined);
  plan = signal<any | undefined>(undefined);
  checkOutSession = signal<any | undefined>(undefined);
  stripe = signal<any>(undefined);
  activeSubscriptionFound = signal<boolean>(true);
  appartemntId = signal<string | undefined>(undefined);
  elements: any;
  checkoutElement: any;
  paymentElement: any;

  today: Date = new Date();
  nextMonth: Date = new Date();
  faSquare = faSquare;
  faSqauareCheck = faCheckSquare;

  checkOutSessionEffect = effect(async () => {
    if (this.stripe()) {
      this.checkoutElement = await this.stripe().initCheckout({
        fetchClientSecret: async () =>
          await this.paymentService.getCheckoutSession(
            this.paymentService.settings()?.planId!,
            this.paymentService.settings()?.advertismentId!
          ),
        elementsOptions: { appearance: {} },
      });

      const paymentElement = this.checkoutElement.createPaymentElement();
      paymentElement.mount('#payment-element');
      const billingAddressElement = this.checkoutElement.createBillingAddressElement();
      billingAddressElement.mount('#billing-address-element');
    }
  });

  ngOnInit(): void {
    this.invokeStripe();
    this.nextMonth.setMonth(this.today.getMonth() + 1);
  }

  ngOnDestroy(): void {
    this.paymentService.settings.set(null);
    this.stripe.set(undefined);
  }

  async invokeStripe() {
    if (
      !this.paymentService.settings()?.planId! ||
      !this.paymentService.settings()?.advertismentId!
    ) {
      return this.router.navigate(['/']);
    }
    if (isPlatformBrowser(this.platformId)) {
      if (!window.document.getElementById('stripe-script')) {
        const script = window.document.createElement('script');
        script.id = 'stripe-script';
        script.type = 'text/javascript';
        script.src = 'https://js.stripe.com/basil/stripe.js';
        script.onload = () => {
          this.stripe.set((<any>window).Stripe(environment_dev.stripeapipk));
        };
        window.document.body.appendChild(script);
      } else {
        this.stripe.set((<any>window).Stripe(environment_dev.stripeapipk));
      }
    }
    return;
  }

  async handleSubmit(event: Event) {
    event.preventDefault();

    // Set loading state to true
    this.isProcessingPayment = true;

    try {
      const { error } = await this.checkoutElement.confirm();

      if (error) {
        console.log('Error:', error);
        // Handle error here - maybe show a toast notification
      } else {
        console.log('Success!');
        // Handle success - maybe redirect to success page
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      // Handle unexpected errors
    } finally {
      // Always reset loading state
      this.isProcessingPayment = false;
    }
  }
}
