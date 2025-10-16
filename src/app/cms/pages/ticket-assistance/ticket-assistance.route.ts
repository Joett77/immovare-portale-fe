// src/app/cms/pages/ticket-assistance/ticket-assistance.route.ts
import { Routes } from '@angular/router';

import { TicketAssistanceDetailComponent } from './ticket-assistance-detail/ticket-assistance-detail.component';
import { TicketAssistanceListComponent } from './ticket-assistance-list/ticket-assistance-list.component';
import { TicketAssistanceComponent } from './ticket-assistance.component';

export const route: Routes = [
  {
    path: '',
    component: TicketAssistanceComponent,
    children: [
      {
        path: '',
        component: TicketAssistanceListComponent,
      },
      {
        path: ':id',
        component: TicketAssistanceDetailComponent,
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
