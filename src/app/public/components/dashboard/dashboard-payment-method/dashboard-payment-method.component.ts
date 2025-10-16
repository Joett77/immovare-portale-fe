// payment-method-manager.component.ts
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  output,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCreditCard, faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { environment_dev } from '../../../../environments/env.dev';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';
import { PaymentService } from '../../../service/payment.service';

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
  billing_details?: {
    name?: string;
    email?: string;
  };
  isDefault?: boolean;
}

@Component({
  selector: 'app-dashboard-payment-method',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ButtonComponent, SpinnerComponent, FormsModule],
  template: `
    <div class="payment-method-manager">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-lg font-bold">Metodo di pagamento</h2>
        <app-button
          type="secondary"
          size="sm"
          (click)="showAddPaymentMethod()"
          [isDisabled]="isLoading()"
        >
          <fa-icon
            [icon]="faPlus"
            class="mr-2"
          ></fa-icon>
          Aggiungi metodo
        </app-button>
      </div>

      <!-- Payment Methods List -->
      @if (isLoadingMethods()) {
        <div class="flex justify-center p-4">
          <app-spinner></app-spinner>
        </div>
      } @else if (paymentMethods().length === 0) {
        <div class="bg-gray-50 p-6 rounded-sm bg-[#F6F6F6] text-center">
          <fa-icon
            [icon]="faCreditCard"
            class="text-4xl text-gray-400 mb-4"
          ></fa-icon>
          <p class="text-gray-600 mb-4">Nessun metodo di pagamento configurato</p>
          <app-button
            type="primary"
            size="sm"
            (click)="showAddPaymentMethod()"
          >
            <fa-icon
              [icon]="faPlus"
              class="mr-2"
            ></fa-icon>
            Aggiungi il primo metodo
          </app-button>
        </div>
      } @else {
        <div class="space-y-4">
          @for (method of paymentMethods(); track method.id) {
            <div class="bg-gray-50 p-4 rounded-sm bg-[#F6F6F6] flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <fa-icon
                  [icon]="faCreditCard"
                  class="text-xl text-gray-600"
                ></fa-icon>
                <div>
                  @if (method.card) {
                    <div class="flex items-center space-x-2">
                      <span class="font-semibold capitalize">{{ method.card.brand }}</span>
                      <span>**** **** **** {{ method.card.last4 }}</span>
                      @if (method.isDefault) {
                        <span
                          class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold"
                        >
                          Predefinito
                        </span>
                      }
                    </div>
                    <p class="text-sm text-gray-600">
                      Scade {{ method.card.exp_month.toString().padStart(2, '0') }}/{{
                        method.card.exp_year
                      }}
                      @if (method.billing_details?.name) {
                        • {{ method.billing_details?.name }}
                      }
                    </p>
                  } @else {
                    <span>{{ method.type }}</span>
                  }
                </div>
              </div>
              <div class="flex items-center space-x-2">
                @if (!method.isDefault) {
                  <button
                    class="px-3 py-1 border border-black rounded-sm text-xs hover:bg-black hover:text-white transition"
                    (click)="setDefaultPaymentMethod(method.id)"
                    [disabled]="isLoading()"
                  >
                    Imposta come predefinito
                  </button>
                }
                <button
                  class="px-3 py-1 border border-red-500 text-red-500 rounded-sm text-xs hover:bg-red-500 hover:text-white transition"
                  (click)="deletePaymentMethod(method.id)"
                  [disabled]="isLoading()"
                >
                  <fa-icon
                    [icon]="faTrash"
                    class="mr-1"
                  ></fa-icon>
                  Elimina
                </button>
              </div>
            </div>
          }
        </div>
      }

      <!-- Add Payment Method Modal -->
      @if (showSetupModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold">Aggiungi metodo di pagamento</h3>
              <button
                (click)="hideAddPaymentMethod()"
                class="text-gray-400 hover:text-gray-600"
              >
                <fa-icon
                  [icon]="faTimes"
                  class="text-xl"
                ></fa-icon>
              </button>
            </div>

            <form
              id="setup-form"
              (submit)="handleSetupSubmit($event)"
            >
              <div
                id="payment-element-setup"
                class="mb-4"
              >
                <!-- Stripe Payment Element will be mounted here -->
              </div>

              <div class="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="set-default"
                  [(ngModel)]="setAsDefault"
                  class="mr-2"
                />
                <label
                  for="set-default"
                  class="text-sm"
                >
                  Imposta come metodo di pagamento predefinito
                </label>
              </div>

              @if (setupError()) {
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {{ setupError() }}
                </div>
              }

              <div class="flex space-x-3">
                <app-button
                  type="secondary"
                  size="sm"
                  (click)="hideAddPaymentMethod()"
                  [isDisabled]="isProcessingSetup()"
                  class="flex-1"
                >
                  Annulla
                </app-button>
                <app-button
                  type="primary"
                  size="sm"
                  [isDisabled]="isProcessingSetup()"
                  class="flex-1"
                  [text]="isProcessingSetup() ? 'Aggiungendo...' : 'Aggiungi metodo'"
                  nativeType="submit"
                >
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Loading Overlay -->
      @if (isLoading()) {
        <div class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <app-spinner></app-spinner>
        </div>
      }
    </div>
  `,
  styleUrl: './dashboard-payment-method.component.scss',
})
export class DashboardPaymentMethodComponent implements OnInit, OnDestroy {
  // Icons
  faCreditCard = faCreditCard;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;
  faTimes = faTimes;

  // Injected services
  platformId = inject(PLATFORM_ID);
  paymentService = inject(PaymentService);

  // Outputs
  paymentMethodAdded = output<PaymentMethod>();
  paymentMethodDeleted = output<string>();
  defaultPaymentMethodChanged = output<PaymentMethod>();

  // State signals
  paymentMethods = signal<PaymentMethod[]>([]);
  isLoadingMethods = signal(false);
  isLoading = signal(false);
  isProcessingSetup = signal(false);
  showSetupModal = signal(false);
  setupError = signal<string | null>(null);
  setAsDefault = false;

  // Stripe elements
  stripe = signal<any>(undefined);
  elements: any;
  paymentElement: any;
  setupClientSecret = signal<string | undefined>(undefined);

  stripeInitEffect = effect(async () => {
    if (this.stripe() && this.showSetupModal() && this.setupClientSecret()) {
      await this.initializeStripeElements();
    }
  });

  async ngOnInit() {
    await this.initializeStripe();
    await this.loadPaymentMethods();
  }

  ngOnDestroy() {
    if (this.elements) {
      this.elements.destroy();
    }
  }

  private async initializeStripe() {
    if (isPlatformBrowser(this.platformId)) {
      if (!window.document.getElementById('stripe-script')) {
        const script = window.document.createElement('script');
        script.id = 'stripe-script';
        script.type = 'text/javascript';
        script.src = 'https://js.stripe.com/basil/stripe.js';
        script.onload = () => {
          this.stripe.set((window as any).Stripe(environment_dev.stripeapipk));
        };
        window.document.body.appendChild(script);
      } else {
        this.stripe.set((window as any).Stripe(environment_dev.stripeapipk));
      }
    }
  }

  private async initializeStripeElements() {
    if (!this.stripe() || !this.setupClientSecret()) return;

    const appearance = {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#000000',
      },
    };

    this.elements = this.stripe().elements({
      clientSecret: this.setupClientSecret(),
      appearance,
    });

    this.paymentElement = this.elements.create('payment', {
      layout: 'tabs',
    });

    this.paymentElement.mount('#payment-element-setup');
  }

  async loadPaymentMethods() {
    this.isLoadingMethods.set(true);
    try {
      // You'll need to implement this method in your PaymentService
      const methods = await this.paymentService.getCustomerPaymentMethods();
      this.paymentMethods.set(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      this.isLoadingMethods.set(false);
    }
  }

  async showAddPaymentMethod() {
    this.setupError.set(null);
    this.setAsDefault = this.paymentMethods().length === 0; // Set as default if first method

    try {
      this.isLoading.set(true);
      // You'll need to implement this method in your PaymentService
      const clientSecret = await this.paymentService.createSetupIntent();
      this.setupClientSecret.set(clientSecret);
      this.showSetupModal.set(true);
    } catch (error) {
      console.error('Error creating setup intent:', error);
      this.setupError.set('Errore durante la creazione del setup di pagamento');
    } finally {
      this.isLoading.set(false);
    }
  }

  hideAddPaymentMethod() {
    this.showSetupModal.set(false);
    this.setupError.set(null);
    this.setAsDefault = false;

    if (this.elements) {
      this.elements.destroy();
      this.elements = null;
      this.paymentElement = null;
    }
  }

  async handleSetupSubmit(event: Event) {
    event.preventDefault();

    if (!this.stripe() || !this.elements) {
      return;
    }

    this.isProcessingSetup.set(true);
    this.setupError.set(null);

    try {
      const { error, setupIntent } = await this.stripe().confirmSetup({
        elements: this.elements,
        confirmParams: {
          return_url: window.location.origin + '/dashboard', // Adjust as needed
        },
        redirect: 'if_required',
      });

      if (error) {
        this.setupError.set(error.message || "Errore durante l'aggiunta del metodo di pagamento");
      } else if (setupIntent.status === 'succeeded') {
        // Setup successful
        const paymentMethodId = setupIntent.payment_method?.id;

        if (paymentMethodId) {
          // Set as default if requested
          if (this.setAsDefault) {
            await this.paymentService.setDefaultPaymentMethod(paymentMethodId);
          }

          // Reload payment methods
          await this.loadPaymentMethods();

          // Emit event
          const newMethod = this.paymentMethods().find(m => m.id === paymentMethodId);
          if (newMethod) {
            this.paymentMethodAdded.emit(newMethod);
          }

          this.hideAddPaymentMethod();
        }
      }
    } catch (err) {
      console.error('Payment setup error:', err);
      this.setupError.set("Errore imprevisto durante l'aggiunta del metodo di pagamento");
    } finally {
      this.isProcessingSetup.set(false);
    }
  }

  async setDefaultPaymentMethod(paymentMethodId: string) {
    this.isLoading.set(true);
    try {
      await this.paymentService.setDefaultPaymentMethod(paymentMethodId);
      await this.loadPaymentMethods();

      const updatedMethod = this.paymentMethods().find(m => m.id === paymentMethodId);
      if (updatedMethod) {
        this.defaultPaymentMethodChanged.emit(updatedMethod);
      }
    } catch (error) {
      console.error('Error setting default payment method:', error);
      // You might want to show a toast notification here
    } finally {
      this.isLoading.set(false);
    }
  }

  async deletePaymentMethod(paymentMethodId: string) {
    if (!confirm('Sei sicuro di voler eliminare questo metodo di pagamento?')) {
      return;
    }

    this.isLoading.set(true);
    try {
      await this.paymentService.deletePaymentMethod(paymentMethodId);
      await this.loadPaymentMethods();
      this.paymentMethodDeleted.emit(paymentMethodId);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      // You might want to show a toast notification here
    } finally {
      this.isLoading.set(false);
    }
  }
}
