import { Routes } from '@angular/router';

import { PlanServiceDetailsComponent } from './plan-service-details/plan-service-details.component';
import { PlanServiceListComponent } from './plan-service-list/plan-service-list.component';
import { PlansAndServiceComponent } from './plans-and-service.component';
import { planResolver } from './resolvers/plan.resolver';
import { ServiceDetailComponent } from './service-detail/service-detail.component';

export const route: Routes = [
  {
    path: '',
    component: PlansAndServiceComponent,
    children: [
      {
        path: 'list',
        component: PlanServiceListComponent,
      },
      {
        path: 'create-plan',
        component: PlanServiceDetailsComponent,
      },
      {
        path: 'create-service',
        component: ServiceDetailComponent,
      },
      {
        path: 'plan/:id',
        component: PlanServiceDetailsComponent,
        resolve: {
          plan: planResolver,
        },
      },
      {
        path: 'service/:id',
        component: ServiceDetailComponent,
        resolve: {
          service: planResolver,
        },
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];
