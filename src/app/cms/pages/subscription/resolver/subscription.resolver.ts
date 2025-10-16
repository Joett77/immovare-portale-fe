import { ResolveFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Customer, CustomersService } from '../../../services/customers.service';

export const subscriptionResolver: ResolveFn<Customer | null> = async (route, state) => {
  const customersService = inject(CustomersService);
  const router = inject(Router);

  const id = route.queryParamMap.get('keycloakId');

  if (id) {
    try {
      const response = await customersService.getSubscriptionsByCustomerId(id);
      return response;
    } catch (error) {
      router.navigate(['cms/iscrizioni-abbonamenti/list']);
      console.log('Error fetching customer subscriptions:', error);
    }
  }

  await router.navigate(['cms/iscrizioni-abbonamenti/list']);
  return null;
};
