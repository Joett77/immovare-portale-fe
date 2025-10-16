import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PaymentService, Subscription } from '../../../../public/service/payment.service';
import { Customer, CustomersService } from '../../../services/customers.service';
import { SubscriptionActionsDropdownComponent } from '../subscription-actions-dropdown/subscription-actions-dropdown.component';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchIconComponent, SubscriptionActionsDropdownComponent],
  templateUrl: './subscription-list.component.html',
  styleUrl: './subscription-list.component.scss',
})
export class SubscriptionListComponent implements OnInit {
  private _paymentService = inject(PaymentService);
  private _customerService = inject(CustomersService);
  customers = signal<Customer[] | null>(null);

  subscriptions = this._paymentService.subscriptionsList$;
  error: string | null = null;
  isLoading = true;

  // FILTRO
  searchQuery: string = '';
  selectedStatus: string = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  statusOptions = [
    {
      label: 'ATTIVO',
      value: 'true',
    },
    {
      label: 'DISATTIVO',
      value: 'false',
    },
  ];

  subscriptionEffect = effect(() => {
    if (this._paymentService.subscriptionsList$()) {
      this.isLoading = false;
    }
  });

  async ngOnInit() {
    await this.loadSubscriptions();
  }

  async loadSubscriptions() {
    this.isLoading = true;
    const filters = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      searchQuery: this.searchQuery,
      status: this.selectedStatus,
    };

    const resp = await this._customerService.getSubscriptionsToCustomers(filters);
    this.totalItems = resp?.pagination?.total || 0;
    this.customers.set(this._customerService.customerList$());
    this.isLoading = false;
  }

  async applyFilters() {
    this.currentPage = 1;
    await this.loadSubscriptions();
  }

  getPlanCounts(subs: Subscription[]): { title: string; count: number }[] {
    const counts: Record<string, number> = {};

    subs.forEach(sub => {
      if (sub.planTitele) {
        counts[sub.planTitele] = (counts[sub.planTitele] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([title, count]) => ({ title, count }));
  }
  getFormattedPlanCounts(subs: Subscription[]): string {
    const counts: Record<string, number> = {};

    subs.forEach(sub => {
      if (sub.planTitele) {
        // Note: keeping the original property name from your code
        counts[sub.planTitele] = (counts[sub.planTitele] || 0) + 1;
      }
    });

    if (Object.keys(counts).length === 0) {
      return 'Free';
    }

    return Object.entries(counts)
      .map(([title, count]) => `${count} ${title}`)
      .join(', ');
  }
  /**
   * Get the overall customer status based on their subscriptions
   * Priority: active > past_due > incomplete > inactive > canceled
   */
  getCustomerStatus(subscriptions: Subscription[]): string {
    if (!subscriptions || subscriptions.length === 0) {
      return 'free';
    }

    // Define status priority (higher index = higher priority)
    const statusPriority = [
      'canceled',
      'incomplete_expired',
      'inactive',
      'incomplete',
      'past_due',
      'active',
    ];

    let highestPriorityStatus = 'canceled';
    let highestPriority = -1;

    subscriptions.forEach(sub => {
      const priority = statusPriority.indexOf(sub.status.toLowerCase());
      if (priority > highestPriority) {
        highestPriority = priority;
        highestPriorityStatus = sub.status.toLowerCase();
      }
    });

    return highestPriorityStatus;
  }

  /**
   * Get detailed subscription status information for tooltip or detailed view
   */
  getDetailedSubscriptionStatus(subscriptions: Subscription[]): string {
    const statusCounts: Record<string, number> = {};

    subscriptions.forEach(sub => {
      const status = sub.status.toLowerCase();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    return Object.entries(statusCounts)
      .map(([status, count]) => {
        const statusLabel = this.getStatusLabel(status);
        return `${count} ${statusLabel}`;
      })
      .join(', ');
  }

  /**
   * Get Italian label for subscription status
   */
  private getStatusLabel(status: string): string {
    const statusLabels: Record<string, string> = {
      active: 'Attivo',
      inactive: 'Inattivo',
      canceled: 'Disattivo',
      incomplete: 'Incompleto',
      incomplete_expired: 'Incompleto Scaduto',
      past_due: 'Scaduto',
      unpaid: 'Non Pagato',
      trialing: 'In Prova',
    };

    return statusLabels[status.toLowerCase()] || status;
  }

  getUserStatus(enabled: boolean) {
    return this.statusOptions?.find(op => op.value === enabled.toString())?.label.toLowerCase();
  }

  protected readonly Math = Math;
}
