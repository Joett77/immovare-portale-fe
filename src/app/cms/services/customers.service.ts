// src/app/cms/services/customers.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom, from, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { environment_dev } from '../../environments/env.dev';
import { AuthService } from '../../public/services/auth.service';
import { Subscription } from '../../public/service/payment.service';

export interface Customer {
  id: number;
  keycloakId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  country?: string;
  city?: string;
  province?: string;
  address?: string | null;
  postalCode?: string | null;
  stripeCustomerId?: string | null;
  // apartment: Apartment[];
  subscriptions: Subscription[];
  phone?: string;
  createdAt?: string;
  deletionDate: Date | null;
  enabled: boolean;
}

// export interface Apartment {
//   adStatus: string;
//   address: string;
//   agentKeycloakUser: null;
//   buyer: null;
//   category: string;
//   city: string;
//   country: string;
//   createdAt: string;
//   createdByKeycloakUser: string;
//   creation: string;
//   deedState: null;
//   description: string;
//   district: null;
//   document: null;
//   draftPlanSelected: null;
//   draftStep: string;
//   energyClass: null;
//   evaluationAgent: null;
//   features: string;
//   floor: string;
//   heating: null;
//   houseNumber: string;
//   id: number;
//   lastUpdate: string;
//   latitude: number;
//   longitude: number;
//   numberBaths: number;
//   numberRooms: number;
//   price: number;
//   propertyCondition: string;
//   propertyFeatures: null;
//   publication: null;
//   region: null;
//   services: string;
//   squareMetres: number;
//   subscription: Subscription[];
//   title: string;
//   type: string;
//   updatedAt: string;
//   utils: null;
//   virtualTourFrameUrl: null;
//   zipCode: string;
// }

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment_dev.apiUrl;

  customerList$ = signal<Customer[] | null>(null);
  customer$ = signal<Customer | null>(null);

  /**
   * Get customer by ID
   * @param id Customer ID
   * @returns Observable with customer details
   */
  getCustomer(id: string): Observable<Customer> {
    /* TODO: rimuovere l inject del token perche s ene occupa il token intercetor */
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.get<{ data: Customer }>(`${this.apiUrl}/api/customers/${id}`, {
          headers,
        });
      }),
      switchMap(response => {
        if (!response || !response.data) {
          return throwError(() => new Error('Customer not found'));
        }
        return of(response.data);
      }),
      catchError(error => {
        console.error('Error fetching customer details:', error);
        return throwError(() => error);
      })
    );
  }

  async getAllCustomers(filter?: any) {
    return await firstValueFrom(
      this.http.get<{ data: Customer[] }>(`${this.apiUrl}/api/customers`, { params: filter })
    );
  }

  async getGustomerById(id: string) {
    return await firstValueFrom(
      this.http.get<{ data: Customer }>(`${this.apiUrl}/api/customers/${id}`)
    );
  }

  async getSelf() {
    const response = await firstValueFrom(this.http.get< { data: Customer } >(`${this.apiUrl}/api/customers/get/my`))

    this.customer$.set(response.data);

  }

  async getSubscriptionsToCustomers(filters: any) {

    const params = {
      page: filters.page.toString(),
      pageSize: filters.limit.toString(),
      user: filters.searchQuery || '',
      userStatus: filters.status || '',
    };

    const response: any = await firstValueFrom(
      this.http.get(`${this.apiUrl}/api/customers/subscriptions`, { params: params })
    );

    this.customerList$.set(response.results);

    return response ?? [];
  }

  async getSubscriptionsByCustomerId(id: string) {
    const endpoint = `${this.apiUrl}/api/customers/${id}/subscriptions`;
    return await firstValueFrom(this.http.get<Customer>(endpoint));
  }

  async getInvoiceByCustomer(kcUserId: string) {
    const endpoint = `${this.apiUrl}/api/subscriptions/customer/${kcUserId}/invoices`;
    return await firstValueFrom(this.http.get<any>(endpoint));
  }
}
