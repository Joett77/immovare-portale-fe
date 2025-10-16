import { Routes } from '@angular/router';

import { CmsLayoutComponent } from './cms/layout/cms-layout.component';
import { AuthGuard } from './core/guard/auth.guard';
import { DataResolver } from './core/resolver/data.resolver';
import { DashboardLayoutComponent } from './layout/layouts/dashboard-layout.component';
import { HeaderLayoutComponent } from './layout/layouts/header-layout.component';
import { HomeLayoutComponent } from './layout/layouts/home-layout.component';
import { MainLayoutComponent } from './layout/layouts/main-layout.component';
import { PropertyResolver } from './public/pages/property/property.resolver';

// Layout Components
export const routes: Routes = [
  // Home route with HomeLayout
  {
    path: '',
    component: HomeLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./public/pages/home/home.component').then(m => m.HomeComponent),
        data: {
          title: 'Immovare.it - Ti Abboni per Vendere Casa-Niente Provvigioni',
        },
      },
    ],
  },

  // Main public pages with MainLayout
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'voglio-vendere',
        loadComponent: () =>
          import('./public/pages/sell-property/sell-property.component').then(
            m => m.SellPropertyComponent
          ),
        resolve: { data: DataResolver },
      },
      {
        path: 'voglio-acquistare',
        loadComponent: () =>
          import('./public/pages/property-buy/property-buy.component').then(
            m => m.PropertyBuyComponent
          ),
        resolve: { data: DataResolver },
      },
      {
        path: 'blog',
        loadComponent: () =>
          import('./public/pages/blog/blog-list/blog-page.component').then(
            m => m.BlogPageComponent
          ),
      },
      {
        path: 'chi-siamo',
        loadComponent: () =>
          import('./public/pages/about-us/about-us.component').then(m => m.AboutUsComponent),
      },
      {
        path: 'blog/:idPost',
        loadComponent: () =>
          import('./public/pages/blog/blog-post/blog-post.component').then(
            m => m.BlogPostComponent
          ),
      },
      {
        path: 'property/:id',
        loadComponent: () =>
          import('./public/pages/property/property.component').then(m => m.PropertyComponent),
        resolve: { data: PropertyResolver },
      },
      {
        path: 'property-preview/:id',
        loadComponent: () =>
          import(
            './public/components/property-publishing/property-preview/property-preview.component'
          ).then(m => m.PropertyPreviewComponent),
      },
      {
        path: 'guide',
        loadComponent: () =>
          import('./public/pages/guide/guide.component').then(m => m.GuideComponent),
      },
      {
        path: 'diventa-agente',
        loadComponent: () =>
          import('./public/pages/become-agent/become-agent.component').then(
            m => m.BecomeAgentComponent
          ),
      },
      {
        path: 'contatti',
        loadComponent: () =>
          import('./public/pages/contact/contact.component').then(m => m.ContactComponent),
      },
      {
        path: 'annunci-immobili',
        loadComponent: () =>
          import('./public/pages/advertisements-page/advertisements-page.component').then(
            m => m.AdvertisementsPageComponent
          ),
      },
      {
        path: 'privacy',
        loadComponent: () =>
          import('./public/pages/privacy/privacy.component').then(m => m.PrivacyComponent),
      },
      {
        path: 'termini-e-condizioni',
        loadComponent: () =>
          import('./public/pages/terms-and-condition/terms-and-condition.component').then(
            m => m.TermsAndConditionComponent
          ),
      },
      {
        path: 'dati-societari',
        loadComponent: () =>
          import('./public/pages/company-data/company-data.component').then(
            m => m.CompanyDataComponent
          ),
      },
    ],
  },

  // Pages with dashboard layout (authentication required)
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'annunci',
        loadComponent: () =>
          import(
            './public/pages/dashboard/dashboard-properties-ads/dashboard-properties-ads.component'
          ).then(m => m.DashboardPropertiesAdsComponent),
      },
      {
        path: 'dashboard/annuncio/:id',
        loadComponent: () =>
          import(
            './public/pages/dashboard/dashboard-single-property/dashboard-single-property.component'
          ).then(m => m.DashboardSinglePropertyComponent),
        resolve: { property: PropertyResolver },
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./public/pages/dashboard/dashboard-main/dashboard-main.component').then(
            m => m.DashboardMainComponent
          ),
      },
      {
        path: 'dashboard/messaggi/visualizza/:id',
        loadComponent: () =>
          import(
            './public/pages/dashboard/dashboard-view-message/dashboard-view-message.component'
          ).then(m => m.DashboardViewMessageComponent),
      },
      {
        path: 'dashboard/messaggi/nuovo',
        loadComponent: () =>
          import(
            './public/pages/dashboard/dashboard-add-message/dashboard-add-message.component'
          ).then(m => m.DashboardAddMessageComponent),
      },
      {
        path: 'dashboard/messaggi',
        loadComponent: () =>
          import('./public/pages/dashboard/dashboard-messages/dashboard-messages.component').then(
            m => m.DashboardMessagesComponent
          ),
      },
      {
        path: 'dashboard/assistenza',
        loadComponent: () =>
          import('./public/pages/dashboard/dashboard-support/dashboard-support.component').then(
            m => m.DashboardSupportComponent
          ),
      },
      {
        path: 'dashboard/profilo',
        loadComponent: () =>
          import('./public/pages/dashboard/dashboard-profile/dashboard-profile.component').then(
            m => m.DashboardProfileComponent
          ),
      },
      {
        path: 'ricerche-salvate',
        loadComponent: () =>
          import(
            './public/pages/dashboard/dashboard-saved-searches/dashboard-saved-searches.component'
          ).then(m => m.DashboardSavedSearchesComponent),
      },
      {
        path: 'immobili-preferiti',
        loadComponent: () =>
          import('./public/pages/dashboard/dashboard-favorites/dashboard-favorites.component').then(
            m => m.DashboardFavoritesComponent
          ),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./public/pages/checkout/checkout.component').then(m => m.CheckoutComponent),
      },
      {
        path: 'checkout-success',
        loadComponent: () =>
          import('./public/pages/checkout-success/checkout-success.component').then(
            m => m.CheckoutSuccessComponent
          ),
      },
    ],
  },

  // Pages with empty layout (no header/footer)
  {
    path: '',
    component: HeaderLayoutComponent,
    children: [
      {
        path: 'property-evaluation',
        loadComponent: () =>
          import('./public/pages/property-evaluation/property-evaluation.component').then(
            m => m.PropertyEvaluationComponent
          ),
        resolve: { data: DataResolver },
      },
      {
        path: 'property-publishing',
        loadComponent: () =>
          import('./public/pages/property-publishing/property-publishing.component').then(
            m => m.PropertyPublishingComponent
          ),
        canActivate: [AuthGuard],
        resolve: { data: DataResolver },
      },
      {
        path: 'property-publishing/:idAdvertisement',
        loadComponent: () =>
          import('./public/pages/property-publishing/property-publishing.component').then(
            m => m.PropertyPublishingComponent
          ),
        canActivate: [AuthGuard],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./public/pages/register/register.component').then(m => m.RegisterComponent),
      },
    ],
  },

  // CMS routes with CMS layout
  {
    path: 'cms',
    component: CmsLayoutComponent,
    canActivate: [AuthGuard],
    data: {
      roles: ['ADMIN', 'AGENT', 'OPERATOR'],
    },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./cms/pages/cms-dashboard/cms-dashboard.component').then(
            m => m.CmsDashboardComponent
          ),
      },
      {
        path: 'blog',
        loadChildren: () => import('./cms/pages/blog/blog.route').then(m => m.route),
        canActivate: [AuthGuard],
        data: {
          roles: ['ADMIN', 'OPERATOR'],
        },
      },
      {
        path: 'guide',
        loadChildren: () => import('./cms/pages/guide/guide.route').then(m => m.route),
        canActivate: [AuthGuard],
        data: {
          roles: ['ADMIN', 'OPERATOR'],
        },
      },
      {
        path: 'annunci',
        loadChildren: () => import('./cms/pages/property/property.route').then(m => m.route),
      },
      {
        path: 'plans-and-service',
        loadChildren: () =>
          import('./cms/pages/plans-and-service/plan-and-service.route').then(m => m.route),
        canActivate: [AuthGuard],
        data: {
          roles: ['ADMIN', 'OPERATOR'],
        },
      },
      {
        path: 'iscrizioni-abbonamenti',
        loadChildren: () =>
          import('./cms/pages/subscription/subscription.route').then(m => m.route),
        canActivate: [AuthGuard],
        data: {
          roles: ['ADMIN', 'OPERATOR'],
        },
      },
      {
        path: 'ticket-assistance',
        loadChildren: () =>
          import('./cms/pages/ticket-assistance/ticket-assistance.route').then(m => m.route),
      },
      {
        path: 'import-ads',
        loadComponent: () =>
          import('./cms/pages/import-ads/import-ads.component').then(m => m.ImportAdsComponent),
        canActivate: [AuthGuard],
        data: {
          roles: ['ADMIN', 'OPERATOR'],
        },
      },
    ],
  },

  // Fallback route - should be last
  { path: '**', redirectTo: '/' },
];
