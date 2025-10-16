// src/app/cms/pages/guide/guide.route.ts
import { Routes } from '@angular/router';

import { GuideDetailsComponent } from './guide-details/guide-details.component';
import { GuideListComponent } from './guide-list/guide-list.component';
import { GuideComponent } from './guide.component';

export const route: Routes = [
  {
    path: '',
    component: GuideComponent,
    children: [
      {
        path: 'list',
        component: GuideListComponent,
      },
      {
        path: ':id',
        component: GuideDetailsComponent,
      },
      {
        path: 'create',
        component: GuideDetailsComponent,
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];
