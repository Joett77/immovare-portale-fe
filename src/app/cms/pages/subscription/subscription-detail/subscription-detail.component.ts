import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faHistory, faLock } from '@fortawesome/free-solid-svg-icons';

import { ModalFullScreenComponent } from '../../../../public/components/modal-full-screen/modal-full-screen.component';
import { PaymentService } from '../../../../public/service/payment.service';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { TooltipComponent } from '../../../../shared/components/tooltip/tooltip.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { SpinnerComponent } from '../../../../shared/spinner/spinner.component';
import { CustomersService } from '../../../services/customers.service';
import { SubscriptionActionsDropdownComponent } from '../subscription-actions-dropdown/subscription-actions-dropdown.component';
import { SubscriptionInvoiceComponent } from '../subscription-invoice/subscription-invoice.component';
import { AuthService } from '../../../../public/services/auth.service';
import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';
import { KeycloakProfile } from 'keycloak-js';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';
import { Plan } from '../../../../public/interface/plan.interface';

@Component({
  selector: 'app-subscription-detail',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ButtonComponent,
    InputComponent,
    SubscriptionActionsDropdownComponent,
    ModalFullScreenComponent,
    SubscriptionInvoiceComponent,
    TooltipComponent,
    SpinnerComponent,
    ModalSmallComponent,
  ],
  templateUrl: './subscription-detail.component.html',
  styleUrl: './subscription-detail.component.scss',
})
export class SubscriptionDetailComponent implements OnInit {
  private _customersService = inject(CustomersService);
  private _paymentService = inject(PaymentService);
  private _authService = inject(AuthService);
  private _planService = inject(PlanAndServiceService);

  private toast = inject(ToastService);
  private _router = inject(Router);

  customer = input<any>();

  customerData = signal<any>(null);
  payment = signal<any>(null);
  plans = signal<Plan[]>([]);

  isLoading = signal<boolean>(false);

  disabledForm = signal(false);

  activeTab = signal('info');

  faHistory = faHistory;
  faLock = faLock;
  faExclamationTriangle = faExclamationTriangle;

  protected modalType: 'reset-password' | 'enable' | 'disable' | 'delete' | null = null;

  customerEffect = effect(
    () => {
      if (this.customer()) {
        this.customerData.set(this.customer());

        this.disabledForm.set(true);
      }
    },
    { allowSignalWrites: true }
  );

  dataEffect = effect(() => {
    if (this.customerData()) {
      this.userForm.patchValue(this.customerData());
      console.log('customerInput', this.customerData());
    }
  });

  userForm = new FormGroup<any>({
    id: new FormControl(undefined, { nonNullable: true }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6,15}$/)],
    }),
  });

  // MODAL
  modalOpen = signal(false);

  ngOnInit() {
    this.loadPayment();
    this.loadPlans();
  }

  async loadPlans() {
    try {
      await this._planService.getPlan();
      this.plans.set(this._planService.plansList$());
    } catch (error) {
      console.error('Error loading plans:', error);
      this.toast.error('Errore nel caricamento dei piani');
    }
  }

  setActiveTab(tadId: string) {
    this.activeTab.set(tadId);
  }

  getControl(formName: string): FormControl | undefined {
    return (this.userForm.get(formName) as FormControl) ?? undefined;
  }

  loadPayment() {
    this._paymentService
      .getPaymentCustomer(this.customer().keycloakId)
      .then(res => {
        this.payment.set(res);
      })
      .catch(err => {
        console.error('Errore nel recupero dei pagamenti:', err);
        this.toast.error('Errore nel recupero dei pagamenti');
      });
  }

  deleteUser() {
    this.modalType = 'delete';
  }

  enableUser() {
    this.modalType = 'enable';
  }

  disableUser() {
    this.modalType = 'disable';
  }

  saveUser() {
    this.isLoading.set(true);

    const data = {
      firstName: this.userForm.get('firstName')?.value,
      lastName: this.userForm.get('lastName')?.value,
      phone: this.userForm.get('phone')?.value,
      email: this.userForm.get('email')?.value,
      id: this.customerData().keycloakId,
    };

    this._authService
      .updateProfile(data as KeycloakProfile)
      .subscribe({
        next: async () => {
          this.toast.success('Utente salvato con successo!');
        },
        error: () => {
          this.toast.error("Si è verificato un errore durante l'operazione");
        },
      })
      .add(async () => {
        this.userForm.markAsUntouched();
        this.isLoading.set(false);
        await this.getCustomer(data.id);
      });
  }

  sendResetPassword() {
    this.modalType = 'reset-password';
  }

  openModalInvoice() {
    this.modalOpen.set(true);
  }

  closeModalInvoice = () => {
    this.modalOpen.set(false);
  };

  downloadInvoice(link: string) {
    window.open(link, '_blank');
  }

  async onSubscriptionChanged(event: any) {
    this.isLoading.set(true);

    setTimeout(async () => {
      this.isLoading.set(false);
      await this.getCustomer(event);
    }, 2000);
  }

  getPlanInfo(stripeProductId: string): Plan | null {
    return this.plans().find(plan => plan.stripeProductId === stripeProductId) || null;
  }

  isPlanFree(stripeProductId: string): boolean {
    const plan = this.getPlanInfo(stripeProductId);
    return plan?.free === true;
  }

  async getCustomer(id: string) {
    let res = await this._customersService.getSubscriptionsByCustomerId(id);
    this.customerData.set(res);
  }

  getApartmentsWithSubscriptions(apartments: any[]) {
    return (
      apartments?.filter(a => Array.isArray(a.subscription) && a.subscription.length > 0) || []
    );
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction() {
    this.isLoading.set(true);

    if (this.modalType === 'enable') {
      let data = {
        kcId: this.customerData().keycloakId,
        enable: true,
      };
      this._authService
        .enableProfile(data)
        .subscribe({
          next: () => {
            this.toast.success('Utente abilitato con successo!');
          },
          error: () => {
            this.toast.error("Si è verificato un errore durante l'operazione");
          },
        })
        .add(async () => {
          this.isLoading.set(false);
          this.modalClosed();
          await this.getCustomer(data.kcId);
        });
    } else if (this.modalType === 'disable') {
      let data = {
        kcId: this.customerData().keycloakId,
        enable: false,
      };
      this._authService
        .enableProfile(data)
        .subscribe({
          next: () => {
            this.toast.success('Utente disabilitato con successo!');
          },
          error: () => {
            this.toast.error("Si è verificato un errore durante l'operazione");
          },
        })
        .add(async () => {
          this.isLoading.set(false);
          this.modalClosed();
          await this.getCustomer(data.kcId);
        });
    } else if (this.modalType === 'delete') {
      this._authService
        .deleteProfile(this.customerData().keycloakId)
        .subscribe({
          next: () => {
            this.toast.success('Utente eliminato con successo!');
          },
          error: () => {
            this.toast.error("Si è verificato un errore durante l'operazione");
          },
        })
        .add(() => {
          this.isLoading.set(false);
          this.modalClosed();
          this._router.navigate(['/cms/iscrizioni-abbonamenti']);
        });
    } else if (this.modalType === 'reset-password') {
      this._authService
        .resetPassword(this.customerData().keycloakId)
        .subscribe({
          next: () => {
            this.toast.success('Email inviata con successo!');
          },
          error: () => {
            this.toast.error("Si è verificato un errore durante l'operazione");
          },
        })
        .add(() => {
          this.isLoading.set(false);
          this.modalClosed();
        });
    }
  }
}
