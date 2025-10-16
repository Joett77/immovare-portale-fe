import { inject, Pipe, PipeTransform } from '@angular/core';

import { CustomersService } from '../../cms/services/customers.service';

@Pipe({
  name: 'userData',
  standalone: true,
})
export class UserDataPipe implements PipeTransform {
  private customerSerice = inject(CustomersService);
  async transform(id: string): Promise<any> {
    return await this.customerSerice.getGustomerById(id);
  }
}
