// src/app/cms/pages/blog/blog.route.ts
import { Routes } from '@angular/router';

import { BlogDetailsComponent } from './blog-details/blog-details.component';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogComponent } from './blog.component';

export const route: Routes = [
  {
    path: '',
    component: BlogComponent,
    children: [
      {
        path: 'list',
        component: BlogListComponent,
      },
      {
        path: ':id',
        component: BlogDetailsComponent,
      },
      {
        path: 'create',
        component: BlogDetailsComponent,
      },
      {
        path: '**',
        redirectTo: 'list',
      },
    ],
  },
];
