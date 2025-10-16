import { CommonModule, isPlatformBrowser } from '@angular/common';
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
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCreditCard, faEdit, faTrash, faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { environment_dev } from '../../../../environments/env.dev';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';
import { PaymentService } from '../../../service/payment.service';
import { ToastService } from '../../../../shared/services/toast.service';

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
  selector: 'app-payment-method-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, ButtonComponent, SpinnerComponent],
  template: `
    <div class="payment-method-manager">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h2 class="text-lg font-bold">Metodo di pagamento</h2>
        <!-- Mostra "Aggiungi metodo" solo se non ci sono metodi -->
        @if (paymentMethods().length === 0) {
          <app-button
            type="secondary"
            size="sm"
            (click)="showAddPaymentMethod()"
            [isDisabled]="isLoading()"
            class="w-full sm:w-auto"
          >
            <fa-icon
              [icon]="faPlus"
              class="mr-2"
            ></fa-icon>
            <span class="whitespace-nowrap">Aggiungi metodo</span>
          </app-button>
        }
      </div>

      <!-- Payment Methods List -->
      @if (isLoadingMethods()) {
        <div class="flex justify-center p-4">
          <app-spinner></app-spinner>
        </div>
      } @else if (paymentMethods().length === 0) {
        <div class="bg-gray-50 p-4 md:p-6 rounded-sm bg-[#F6F6F6] text-center">
          <fa-icon
            [icon]="faCreditCard"
            class="text-3xl md:text-4xl text-gray-400 mb-4"
          ></fa-icon>
          <p class="text-sm md:text-base text-gray-600 mb-4"
            >Nessun metodo di pagamento configurato</p
          >
          <app-button
            type="primary"
            size="sm"
            (click)="showAddPaymentMethod()"
            class="w-full sm:w-auto"
          >
            <fa-icon
              [icon]="faPlus"
              class="mr-2"
            ></fa-icon>
            <span class="whitespace-nowrap">Aggiungi il primo metodo</span>
          </app-button>
        </div>
      } @else {
        <!-- Mostra solo il primo metodo di pagamento -->
        @if (paymentMethods().length > 0) {
          @let method = paymentMethods()[0];
          <!-- Mobile Layout -->
          <div class="bg-gray-50 p-4 rounded-sm bg-[#F6F6F6] md:hidden">
            <div class="flex items-start space-x-3 mb-4">
              <fa-icon
                [icon]="faCreditCard"
                class="text-lg text-gray-600 mt-1 flex-shrink-0"
              ></fa-icon>
              <div class="flex-1 min-w-0">
                @if (method.card) {
                  <div class="space-y-1">
                    <div class="flex items-center space-x-2 flex-wrap">
                      <span class="font-semibold capitalize text-sm">{{ method.card.brand }}</span>
                      <span class="text-sm">**** {{ method.card.last4 }}</span>
                      @if (method.isDefault) {
                        <span
                          class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold whitespace-nowrap"
                        >
                          Predefinito
                        </span>
                      }
                    </div>
                    <p class="text-xs text-gray-600">
                      Scade {{ method.card.exp_month.toString().padStart(2, '0') }}/{{
                        method.card.exp_year
                      }}
                      @if (method.billing_details?.name) {
                        <br class="sm:hidden" />
                        <span class="sm:ml-2">• {{ method.billing_details?.name }}</span>
                      }
                    </p>
                  </div>
                } @else {
                  <span class="text-sm">{{ method.type }}</span>
                }
              </div>
            </div>
            <div class="flex flex-col space-y-2">
              <button
                class="w-full px-3 py-2 border border-black rounded-sm text-xs hover:bg-black hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                (click)="setDefaultPaymentMethod(method.id)"
                [disabled]="isLoading() || method.isDefault"
                [class.opacity-50]="method.isDefault"
              >
                <span class="whitespace-nowrap">{{
                  method.isDefault ? 'Già predefinito' : 'Imposta come predefinito'
                }}</span>
              </button>
              <button
                class="w-full px-3 py-2 border border-black rounded-sm text-xs hover:bg-black hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                (click)="updatePaymentMethod(method.id)"
                [disabled]="isLoading()"
              >
                <fa-icon
                  [icon]="faEdit"
                  class="mr-1"
                ></fa-icon>
                <span class="whitespace-nowrap">Aggiorna metodo</span>
              </button>
              <button
                class="w-full px-3 py-2 border border-red-500 text-red-500 rounded-sm text-xs hover:bg-red-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                (click)="deletePaymentMethod(method.id)"
                [disabled]="isLoading()"
              >
                <fa-icon
                  [icon]="faTrash"
                  class="mr-1"
                ></fa-icon>
                <span class="whitespace-nowrap">Elimina</span>
              </button>
            </div>
          </div>

          <!-- Desktop Layout -->
          <div
            class="bg-gray-50 p-4 md:p-6 rounded-sm bg-[#F6F6F6] hidden md:flex items-center justify-between"
          >
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
              <button
                class="px-3 py-1 border border-black rounded-sm text-xs hover:bg-black hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                (click)="setDefaultPaymentMethod(method.id)"
                [disabled]="isLoading() || method.isDefault"
                [class.opacity-50]="method.isDefault"
              >
                {{ method.isDefault ? 'Già predefinito' : 'Imposta come predefinito' }}
              </button>
              <button
                class="px-3 py-1 border border-black rounded-sm text-xs hover:bg-black hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 whitespace-nowrap"
                (click)="updatePaymentMethod(method.id)"
                [disabled]="isLoading()"
              >
                <fa-icon
                  [icon]="faEdit"
                  class="mr-1"
                ></fa-icon>
                Aggiorna metodo
              </button>
              <button
                class="px-3 py-1 border border-red-500 text-red-500 rounded-sm text-xs hover:bg-red-500 hover:text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
                (click)="deletePaymentMethod(method.id)"
                [disabled]="isLoading()"
              >
                <fa-icon
                  [icon]="faTrash"
                  class="mr-1"
                ></fa-icon>
                <span class="whitespace-nowrap">Elimina</span>
              </button>
            </div>
          </div>
        }
      }

      <!-- Add/Update Payment Method Modal -->
      @if (showSetupModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div
            class="bg-white p-4 md:p-6 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold pr-4">
                {{ isUpdating() ? 'Aggiorna metodo di pagamento' : 'Aggiungi metodo di pagamento' }}
              </h3>
              <button
                (click)="hideAddPaymentMethod()"
                class="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-1"
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
              class="space-y-4"
            >
              <div
                id="payment-element-setup"
                class="min-h-[200px]"
              >
                <!-- Stripe Payment Element will be mounted here -->
              </div>

              <!-- Mostra checkbox solo quando si aggiunge il primo metodo o quando si aggiorna -->
              <div class="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="set-default"
                  name="setDefault"
                  [(ngModel)]="setAsDefault"
                  class="mt-1 rounded border-gray-300 text-black focus:ring-black focus:ring-2"
                />
                <label
                  for="set-default"
                  class="text-sm leading-relaxed cursor-pointer"
                >
                  Imposta come metodo di pagamento predefinito per futuri annunci
                </label>
              </div>

              @if (setupError()) {
                <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {{ setupError() }}
                </div>
              }

              <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <app-button
                  type="secondary"
                  size="sm"
                  (click)="hideAddPaymentMethod()"
                  [isDisabled]="isProcessingSetup()"
                  class="flex-1 order-2 sm:order-1"
                >
                  <span class="whitespace-nowrap">Annulla</span>
                </app-button>
                <app-button
                  type="primary"
                  size="sm"
                  [isDisabled]="isProcessingSetup()"
                  class="flex-1 order-1 sm:order-2"
                  [text]="
                    isProcessingSetup()
                      ? isUpdating()
                        ? 'Aggiornando...'
                        : 'Aggiungendo...'
                      : isUpdating()
                        ? 'Aggiorna metodo'
                        : 'Aggiungi metodo'
                  "
                  nativeType="submit"
                >
                  @if (isProcessingSetup()) {
                    <div
                      class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"
                    ></div>
                  }
                </app-button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- Loading Overlay -->
      @if (isLoading()) {
        <div class="fixed inset-0 z-40 flex items-center justify-center bg-gray-900/50">
          <div class="bg-white/90 backdrop-blur-sm rounded-lg p-8 shadow-2xl">
            <app-spinner></app-spinner>
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './payment-method-manager.component.scss',
})
export class PaymentMethodManagerComponent implements OnInit, OnDestroy {
  // Icons
  faCreditCard = faCreditCard;
  faEdit = faEdit;
  faTrash = faTrash;
  faPlus = faPlus;
  faTimes = faTimes;

  // Injected services
  platformId = inject(PLATFORM_ID);
  paymentService = inject(PaymentService);
  private toast = inject(ToastService);

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
  isUpdating = signal(false);
  updatingMethodId = signal<string | null>(null);

  // Stripe elements
  stripe = signal<any>(undefined);
  elements: any;
  paymentElement: any;
  setupClientSecret = signal<string | undefined>(undefined);

  stripeInitEffect = effect(async () => {
    if (this.stripe() && this.showSetupModal() && this.setupClientSecret()) {
      // Add a small delay to ensure DOM is ready
      setTimeout(async () => {
        await this.initializeStripeElements();
      }, 100);
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

    // Check if the DOM element exists
    const mountElement = document.getElementById('payment-element-setup');
    if (!mountElement) {
      console.warn('Payment element mount point not found');
      return;
    }

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

    try {
      this.paymentElement.mount('#payment-element-setup');
    } catch (error) {
      console.error('Error mounting payment element:', error);
      this.setupError.set("Errore durante l'inizializzazione del modulo di pagamento");
    }
  }

  async loadPaymentMethods() {
    this.isLoadingMethods.set(true);
    try {
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
    this.isUpdating.set(false);
    this.updatingMethodId.set(null);
    this.setAsDefault = this.paymentMethods().length === 0; // Set as default if first method

    try {
      this.isLoading.set(true);
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

  async updatePaymentMethod(paymentMethodId: string) {
    this.setupError.set(null);
    this.isUpdating.set(true);
    this.updatingMethodId.set(paymentMethodId);

    const currentMethod = this.paymentMethods().find(m => m.id === paymentMethodId);
    this.setAsDefault = currentMethod?.isDefault || false;

    try {
      this.isLoading.set(true);
      const clientSecret = await this.paymentService.createSetupIntent();
      this.setupClientSecret.set(clientSecret);
      this.showSetupModal.set(true);
    } catch (error) {
      console.error('Error creating setup intent for update:', error);
      this.setupError.set("Errore durante la preparazione dell'aggiornamento");
    } finally {
      this.isLoading.set(false);
    }
  }

  hideAddPaymentMethod() {
    this.showSetupModal.set(false);
    this.setupError.set(null);
    this.setAsDefault = false;
    this.isUpdating.set(false);
    this.updatingMethodId.set(null);

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
          return_url: window.location.origin + '/dashboard',
        },
        redirect: 'if_required',
      });

      if (error) {
        this.setupError.set(
          error.message || "Errore durante l'elaborazione del metodo di pagamento"
        );
        return;
      }

      if (setupIntent.status === 'succeeded') {
        const paymentMethodId = setupIntent.payment_method?.id;

        if (paymentMethodId) {
          if (this.isUpdating() && this.updatingMethodId()) {
            try {
              await this.paymentService.deletePaymentMethod(this.updatingMethodId()!);
            } catch (deleteError) {
              console.warn('Error deleting old payment method:', deleteError);
            }
          }

          if (this.setAsDefault) {
            try {
              await this.paymentService.setDefaultPaymentMethod(paymentMethodId);
            } catch (defaultError) {
              console.warn('Error setting default payment method:', defaultError);
            }
          }

          this.hideAddPaymentMethod();

          setTimeout(async () => {
            await this.loadPaymentMethods();

            const newMethod = this.paymentMethods().find(m => m.id === paymentMethodId);
            if (newMethod) {
              this.paymentMethodAdded.emit(newMethod);
            }

            if (this.isUpdating()) {
              this.toast.success('Metodo di pagamento aggiornato con successo');
            } else {
              this.toast.success('Metodo di pagamento aggiunto con successo');
            }
          }, 500);
        }
      }
    } catch (err) {
      console.error('Payment setup error:', err);
      this.setupError.set("Errore imprevisto durante l'elaborazione del metodo di pagamento");
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
      this.toast.success('Metodo di pagamento predefinito impostato con successo');
    } catch (error) {
      console.error('Error setting default payment method:', error);
      this.toast.error("Errore durante l'impostazione del metodo di pagamento predefinito");
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
      this.toast.success('Metodo di pagamento eliminato con successo');
    } catch (error) {
      console.error('Error deleting payment method:', error);
      this.toast.error("Errore durante l'eliminazione del metodo di pagamento");
    } finally {
      this.isLoading.set(false);
    }
  }
}
