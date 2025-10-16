import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment_dev } from '../../environments/env.dev';

export interface Customer {
  id: number;
  createdAt: string;
  updatedAt: string;
  keycloakId: string;
  country: string;
  city: string;
  province: string;
  address: string | null;
  postalCode: string | null;
  ricerche_salvate: any[];
  stripeCustomerId: string | null;
  stripePaymentMethodId: string | null;
  favorites: any[];
}

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

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private _http = inject(HttpClient);
  apiUrl = environment_dev.apiUrl;
  subscriptionsList$ = signal<Subscription[] | null>(null);

  settings = signal<{
    planId: string;
    advertismentId?: string;
  } | null>(null);

  constructor() {}

  /**
   * Get checkout session for payments
   * @param planId
   * @param advertismentId
   * @returns client_secret Promise<string>
   */
  async getCheckoutSession(planId: string, advertismentId: string): Promise<string> {
    const checkout = await firstValueFrom(
      this._http.post<any>(this.apiUrl + '/api/stripe/checkout-session', {
        params: { advertismentId, planId },
      })
    );
    return checkout.client_secret as string;
  }

  /**
   * Create a setup intent for adding payment methods
   * @returns client_secret Promise<string>
   */
  async createSetupIntent(): Promise<string> {
    const setupIntent = await firstValueFrom(
      this._http.post<any>(this.apiUrl + '/api/stripe/setup-intent', {})
    );
    return setupIntent.client_secret as string;
  }

  /**
   * Get customer's payment methods
   * @returns Promise<PaymentMethod[]>
   */
  async getCustomerPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await firstValueFrom(
      this._http.get<any>(this.apiUrl + '/api/stripe/payment-methods')
    );
    return response.payment_methods || [];
  }

  /**
   * Set default payment method for customer
   * @param paymentMethodId string
   * @returns Promise<any>
   */
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<any> {
    return await firstValueFrom(
      this._http.post<any>(this.apiUrl + '/api/stripe/payment-methods/set-default', {
        paymentMethodId,
      })
    );
  }

  /**
   * Delete a payment method
   * @param paymentMethodId string
   * @returns Promise<any>
   */
  async deletePaymentMethod(paymentMethodId: string): Promise<any> {
    return await firstValueFrom(
      this._http.delete<any>(this.apiUrl + `/api/stripe/payment-methods/${paymentMethodId}`)
    );
  }

  /**
   *
   * @param sessionId @string
   * @returns
   */
  getSessionById(sessionId: string | null) {
    return firstValueFrom(
      this._http.get<any>(this.apiUrl + '/api/stripe/checkout-session/' + sessionId)
    );
  }

  /**
   * recupera la subscription specifica
   * @param id string
   * @returns
   */
  async findSubscriptionById(id: string) {
    return await firstValueFrom(this._http.get<any>(`${this.apiUrl}/api/subscription/${id}`));
  }

  /**
   * Find subscriptions with filters
   * @param filterObject SubscriptionFilter
   * @param extended boolean
   * @returns Promise<Subscription[]>
   */
  async findSubscription(filterObject: SubscriptionFilter = {}, extended = false) {
    if (extended) {
      filterObject = { ...filterObject, extended };
    }
    const response = await firstValueFrom(
      this._http.get<Subscription[]>(`${this.apiUrl}/api/subscription`, {
        params: filterObject as {
          [param: string]: string | number | boolean | readonly (string | number | boolean)[];
        },
      })
    );
    this.subscriptionsList$.set(response);
    return response ?? [];
  }

  /**
   * Delete subscription
   * @param id string
   */
  async deleteSubscription(id: string) {
    return await firstValueFrom(this._http.delete<any>(`${this.apiUrl}/api/subscription/${id}`));
  }

  /**
   * Cancel subscription at end of billing period
   * @param id string
   */
  async deleteSubscriptionAtEndBilling(id: string) {
    return await firstValueFrom(this._http.delete<any>(`${this.apiUrl}/api/subscription/${id}`));
  }

  /**
   * Restore cancelled subscription
   * @param id string
   */
  async restoreeSubscription(id: string) {
    return await firstValueFrom(
      this._http.get<any>(`${this.apiUrl}/api/subscription/restore/${id}`)
    );
  }

  /**
   * Get payment customer details
   * @param id string
   */
  async getPaymentCustomer(id: string) {
    return await firstValueFrom(this._http.get<any>(`${this.apiUrl}/api/payment/customer/${id}`));
  }

  /**
   * Get subscription for apartment
   * @param id string
   */
  async subscriptionAppartment(id: string) {
    return await firstValueFrom(
      this._http.get<any>(`${this.apiUrl}/api/subscription/apartment/${id}`)
    );
  }
}

export interface Subscription {
  id: string;
  planTitele: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  stripeSubscriptionId: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  kcUserId: string;
  advertisementsId: string;
  type: string;
  stripePaymentId: string | null;
  stripePriceId: string;
  stripeInvoiceId: string;
  stripeHostedInvoice: string;
  stripePdfInvoice: string;
  amount: number | null;
  currency: string | null;
  stripeCustomerId: string;
  stripeProductId: string;
  cancel_at: string | null;
  canceled_at: string | null;
  cancel_at_period_end: boolean | null;
  invoice?: any[];
}

export interface SubscriptionFilter {
  id?: string;
  status?: string | string[];
  kcUserId?: string;
  advertisementsId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  type?: 'subscription' | 'payment_intnet';
  extended?: boolean;
}
