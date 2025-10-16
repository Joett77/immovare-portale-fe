import { inject, Pipe, PipeTransform } from '@angular/core';

import { PlanAndServiceService } from '../../public/services/plan-and-service.service';

@Pipe({
  name: 'planData',
  standalone: true,
})
//**
// get plan data from stripePlanId or planId
//  */
export class PlanDataPipe implements PipeTransform {
  private planService = inject(PlanAndServiceService);
  async transform(value: string): Promise<any> {
    return this.planService.getById(value);
  }
}
