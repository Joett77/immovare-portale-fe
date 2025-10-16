import { inject, Pipe, PipeTransform } from '@angular/core';

import { PaymentService } from '../../public/service/payment.service';

@Pipe({
  name: 'subscriptionDataFromKdId',
  standalone: true,
})
export class SubscriptionDataPipe implements PipeTransform {
  private _paymentService = inject(PaymentService);
  async transform(id: string) {
    return await this._paymentService.findSubscription({ kcUserId: id });
  }
}
