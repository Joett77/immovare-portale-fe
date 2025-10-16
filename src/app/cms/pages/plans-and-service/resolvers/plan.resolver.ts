import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';

import { Plan } from '../../../../public/interface/plan.interface';
import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';

export const planResolver: ResolveFn<Plan | boolean> = (route, state) => {
  const planservice = inject(PlanAndServiceService);
  const router = inject(Router);
  const id = route.paramMap.get('id');
  if (id) return planservice.getById(id);
  return router.navigate(['cms/plans-and-service/list']);
};
