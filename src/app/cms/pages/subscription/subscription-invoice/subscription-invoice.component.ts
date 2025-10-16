import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

import { PaymentService, Subscription } from '../../../../public/service/payment.service';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { CustomersService } from '../../../services/customers.service';

@Component({
  selector: 'app-subscription-invoice',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, ButtonComponent],
  templateUrl: './subscription-invoice.component.html',
  styleUrl: './subscription-invoice.component.scss',
})
export class SubscriptionInvoiceComponent implements OnInit {
  @Input() userId: string | undefined;
  @Input() apartmentId: string | undefined;
  @Input() onClose!: () => void;

  private _customersService = inject(CustomersService);
  private _paymentService = inject(PaymentService);
  subscriptions: Subscription[] = [];

  isLoading = true;

  faClose = faClose;

  async ngOnInit(): Promise<void> {
    try {
      if (this.userId) {
        const response = await this._customersService.getInvoiceByCustomer(this.userId!);
        this.subscriptions = response;
      } else {
        const response = await this._paymentService.subscriptionAppartment(this.apartmentId!);
        this.subscriptions = response;
      }
      this.isLoading = false;
    } catch (error) {
      console.error('Errore nel recupero degli invoice:', error);
      this.isLoading = false;
    }
  }

  closeModal() {
    if (this.onClose) this.onClose();
  }

  downloadPDF(link: string) {
    window.open(link, '_blank');
  }

  isAfterNow(date: number) {

    return new Date(date) > new Date();

  }
}
