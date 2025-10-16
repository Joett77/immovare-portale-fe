import { inject, Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

import { AuthService } from '../../public/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  authService = inject(AuthService);
  keycloakService = inject(KeycloakService);
  router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean | UrlTree> {
    // Get required roles from route data if available
    const requiredRoles = route.data['roles'] as string[] | undefined;

    // Check if the user is authenticated using the AuthService
    if (this.keycloakService.isLoggedIn()) {
      console.log('User is authenticated');

      // If roles are required for this route
      if (requiredRoles && requiredRoles.length > 0) {
        // Check if the user has at least one of the required roles
        const hasRequiredRole = requiredRoles.some(role => this.authService.hasRole(role));

        if (!hasRequiredRole) {
          // If the user doesn't have the required roles, redirect to home
          console.warn('User does not have the required roles to access this route');
          return this.router.createUrlTree(['/']);
        }
      }

      return true; // Allow access to the route
    } else {
      console.log('User is not authenticated');
      // Redirect to the home page
      this.authService.login();
      return false; // Prevent access to the route
    }
  }
}
