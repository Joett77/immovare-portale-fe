import { Routes } from '@angular/router';

import { PropertyDetailsComponent } from './property-details/property-details.component';
import { PropertyListComponent } from './property-list/property-list.component';
import { PropertyComponent } from './property.component';

export const route: Routes = [
  {
    path: '',
    component: PropertyComponent,
    children: [
      {
        path: 'list',
        component: PropertyListComponent,
      },
      {
        path: ':id',
        component: PropertyDetailsComponent,
      },
      {
        path: 'create',
        component: PropertyDetailsComponent,
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];
