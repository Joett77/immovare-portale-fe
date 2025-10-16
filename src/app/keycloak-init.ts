import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { environment_dev } from './environments/env.dev';
export function initializeKeycloak() {
  const platformId = inject(PLATFORM_ID);
  const keycloak = inject(KeycloakService);

  return async () => {
    // Only initialize Keycloak in browser
    if (isPlatformBrowser(platformId)) {
      try {
        console.log('Initializing Keycloak...');
        console.log(environment_dev.keycloakUrl);
        console.log(environment_dev.keycloakRealm);
        console.log(environment_dev.keycloakClientId);
        await keycloak.init({
          config: {
            url: environment_dev.keycloakUrl,
            realm: environment_dev.keycloakRealm,
            clientId: environment_dev.keycloakClientId,
          },
          initOptions: {
            onLoad: 'check-sso',
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
          },
          enableBearerInterceptor: true,
          bearerPrefix: 'Bearer',
          bearerExcludedUrls: ['/assets'],
          loadUserProfileAtStartUp: true, // This may help with your issue
        });
        console.log('Keycloak initialized successfully');
      } catch (error) {
        console.error('Error initializing Keycloak', error);
      }
    }
  };
}
