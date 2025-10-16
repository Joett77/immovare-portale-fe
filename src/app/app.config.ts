import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom } from '@angular/core';
import {
  InMemoryScrollingFeature,
  InMemoryScrollingOptions,
  provideRouter,
  Router,
  withComponentInputBinding,
  withInMemoryScrolling,
} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { TokenInterceptor } from './core/interceptors/token-interceptors';
import { initializeKeycloak } from './keycloak-init';

const scrollConfig: InMemoryScrollingOptions = {
  scrollPositionRestoration: 'top',
  anchorScrolling: 'enabled',
};
const inMemoryScrollingFeature: InMemoryScrollingFeature = withInMemoryScrolling(scrollConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, inMemoryScrollingFeature, withComponentInputBinding()),
    importProvidersFrom(CommonModule),
    provideHttpClient(withInterceptors([TokenInterceptor])),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService, Router],
    },
    importProvidersFrom(FontAwesomeModule),
  ],
};
