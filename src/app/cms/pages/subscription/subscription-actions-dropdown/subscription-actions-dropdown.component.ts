import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { SettingsIconComponent } from '../../../../shared/atoms/icons/settings-icon/settings-icon.component';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaymentService } from '../../../../public/service/payment.service';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';

@Component({
  selector: 'app-subscription-actions-dropdown',
  standalone: true,
  imports: [CommonModule, SettingsIconComponent, ModalSmallComponent],
  templateUrl: './subscription-actions-dropdown.component.html',
  styleUrl: './subscription-actions-dropdown.component.scss',
})
export class SubscriptionActionsDropdownComponent {
  @Input() customerId: number | undefined = 0;
  @Input() id!: any;
  @Input() keycloakId: string | undefined = '';
  @Input() subscriptionId!: string;
  @Input() propertyId: string = '';
  @Input() planName: string = '';
  @Input() cancel_at_period_end: boolean | null = null;
  @Input() index!: number;

  @Output() subscriptionChanged = new EventEmitter<void>();

  private _paymentService = inject(PaymentService);
  private toast = inject(ToastService);
  private _router = inject(Router);

  protected modalType: null | "restore-subscription" | "delete-subscription" = null;

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  onEditViewUserSubscription() {
    this.isOpen = false;

    return this._router.navigate(['cms/iscrizioni-abbonamenti/customer', this.customerId], {
      queryParams: { keycloakId: this.keycloakId },
    });
  }

  onDeactivateUserSubscription() {
    this.isOpen = false;
    this.toast.success('Abbonamento disattivato con successo!');
    return;
  }

  onDeactivateSubscription() {
    this.isOpen = false;
    this.toast.success('Rinnovo Abbonamento disattivato con successo!');
  }

  onDeactivateSubscriptionRenewal(i: number) {
    if (this.cancel_at_period_end === null || this.cancel_at_period_end === false) {
      this.modalType = "delete-subscription";
    }
    if (this.cancel_at_period_end === true) {
      this.modalType = "restore-subscription";
    }

    this.isOpen = false;
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction() {
    if (this.modalType === "restore-subscription") {
      this._paymentService
        .restoreeSubscription(this.subscriptionId)
        .then(() => {
          this.toast.success('Abbonamento riattivato con successo!');
          this.subscriptionChanged.emit(this.id);
        })
        .catch((err: any) => {
          this.toast.error("Errore durante la riattivazione dell'abbonamento!");
          console.log('Error:', err);
        })
        .finally(() => this.modalClosed());
    } else if (this.modalType === "delete-subscription") {
      this._paymentService
        .deleteSubscriptionAtEndBilling(this.subscriptionId)
        .then(() => {
          this.toast.success('Abbonamento disattivato con successo!');
          this.subscriptionChanged.emit(this.id);
        })
        .catch((err: any) => {
          this.toast.error("Errore durante la disattivazione dell'abbonamento!");
          console.log('Error:', err);
        })
        .finally(() => this.modalClosed());
    }
  }
}
