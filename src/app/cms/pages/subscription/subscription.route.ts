// src/app/cms/pages/guide/guide.route.ts
import { Routes } from '@angular/router';
import { SubscriptionComponent } from './subscription.component';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { SubscriptionDetailComponent } from './subscription-detail/subscription-detail.component';
import { subscriptionResolver } from './resolver/subscription.resolver';

export const route: Routes = [
  {
    path: '',
    component: SubscriptionComponent,
    children: [
      {
        path: 'list',
        component: SubscriptionListComponent,
      },
      {
        path: 'customer/:id',
        component: SubscriptionDetailComponent,
        resolve: {
          customer: subscriptionResolver,
        },
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];
