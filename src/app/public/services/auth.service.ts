import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { KeycloakEventType, KeycloakService } from 'keycloak-angular';
import { KeycloakLoginOptions, KeycloakProfile } from 'keycloak-js';
import {
  BehaviorSubject,
  catchError,
  firstValueFrom,
  from,
  Observable,
  switchMap,
  throwError,
} from 'rxjs';

import { environment_dev } from '../../environments/env.dev';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private isBrowser: boolean;
  keycloakService: KeycloakService;
  httpClient: HttpClient;
  private router: Router;

  // Key for localStorage flags
  private readonly ADMIN_LOGIN_FLAG = 'admin_login_redirect';
  private readonly EVALUATION_RESULTS_FLAG = 'redirectToEvaluationResults';

  private apiUrl = environment_dev.apiUrl;

  private userData = signal<any>(null);
  private authenticated = signal<boolean>(false);
  private userRoles = signal<string[]>([]);
  readonly userData$ = this.userData.asReadonly();
  readonly authenticated$ = this.authenticated.asReadonly();
  readonly userRoles$ = this.userRoles.asReadonly();

  constructor(
    @Inject(PLATFORM_ID) platformId: Object,
    keycloakService: KeycloakService,
    httpClient: HttpClient,
    router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.keycloakService = keycloakService;
    this.httpClient = httpClient;
    this.router = router;

    if (this.isBrowser) {
      // Handle Keycloak events
      keycloakService.keycloakEvents$.subscribe({
        next: event => {
          if (event.type == KeycloakEventType.OnTokenExpired) {
            keycloakService.updateToken(20);
          } else if (event.type == KeycloakEventType.OnAuthSuccess) {
            console.log('Authentication success event fired');
            this.handleSuccessfulLogin();
          } else if (event.type == KeycloakEventType.OnAuthLogout) {
            // Clear user data on logout
            this.userData.set(null);
            this.authenticated.set(false);
            this.userRoles.set([]);
          }
        },
      });

      // Check if user is already authenticated
      if (keycloakService.isLoggedIn()) {
        this.handleSuccessfulLogin();
      }
    }
  }

  /**
   * Handle successful login by loading user profile and checking roles
   * Also handles admin redirections and evaluation results redirection
   */
  private handleSuccessfulLogin(): void {

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        console.log('Handling successful login');
        this.keycloakService.loadUserProfile().then(user => {
          console.log('User profile loaded:', user);
          this.userData.set(user);
          this.authenticated.set(true);
          this.isAuthenticatedSubject.next(true);

          // Get user roles
          const roles = this.keycloakService.getUserRoles(true);
          console.log('User roles:', roles);
          this.userRoles.set(roles);
          console.log('URL ', this.router);

      if (this.isBrowser &&!this.router.url.startsWith('/cms')) {
        // Check for evaluation results redirect first
        const shouldRedirectToResults = localStorage.getItem(this.EVALUATION_RESULTS_FLAG);
        if (shouldRedirectToResults === 'true') {
          console.log('Evaluation results redirect flag found');
          localStorage.removeItem(this.EVALUATION_RESULTS_FLAG);

          setTimeout(() => {
            this.router.navigate(['/property-evaluation'], {
              queryParams: { step: 'results' },
            });
          }, 100);
          return;
        }

          // Clear the flag
          localStorage.removeItem(this.ADMIN_LOGIN_FLAG);

          // Check if user has admin role and redirect if they do
          if (roles.includes('ADMIN') || roles.includes('AGENT') || roles.includes('OPERATOR')) {
            console.log('Admin role found, redirecting to CMS');
            this.router.navigate(['/cms']);
          }
        }
      });


    });
  }

  /**
   * Handle login and set flag for admin redirection
   * @param options KeycloakLoginOptions
   */
  login(options?: KeycloakLoginOptions): void {
    if (this.keycloakService) {
      if (this.isBrowser) {
        // Set flag to indicate this is a fresh login (will be checked after redirect)
        localStorage.setItem(this.ADMIN_LOGIN_FLAG, 'true');
        console.log('Set admin login flag before redirect');
      }

      // Perform the login - this will redirect the browser
      this.keycloakService.login(options).catch(error => {
        console.error('Login failed', error);
        // Clear flag if login fails
        if (this.isBrowser) {
          localStorage.removeItem(this.ADMIN_LOGIN_FLAG);
        }
      });
    } else {
      console.error('KeycloakService is not initialized');
    }
  }

  /**
   * Check if the current user has a specific role
   * @param role The role to check for
   * @returns boolean indicating whether the user has the role
   */
  hasRole(role: string): boolean {
    return this.keycloakService.isUserInRole(role);
  }

  async getToken(): Promise<string | null> {
    try {
      // Only attempt to get token in browser environment
      if (!this.isBrowser) {
        console.log('Not in browser environment, returning null token');
        return null;
      }

      // Check if keycloakService is initialized and user is logged in
      if (!this.keycloakService || !this.keycloakService.isLoggedIn()) {
        console.log('Keycloak service not initialized or user not logged in');
        return null;
      }

      return await this.keycloakService.getToken();
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Simulate an asynchronous authentication check
  async isAuthenticated(): Promise<boolean> {
    // In server environment, always return false
    if (!this.isBrowser) {
      return false;
    }

    // For the browser, return the current authentication state
    return this.authenticated();
  }

  getUserData(): any {
    return this.userData();
  }

  getUserId(): string {
    return this.userData()?.id;
  }

  updateChangePassword(data: any): Observable<any> {
    // Check if we're in a browser environment first
    if (!this.isBrowser) {
      return throwError(() => new Error('Cannot change password in server environment'));
    }

    return from(this.getToken()).pipe(
      switchMap(token => {
        if (!token) {
          return throwError(() => new Error('No authentication token available'));
        }

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        return this.httpClient.put<any>(`${this.apiUrl}/api/keycloak/change-password`, data, {
          headers,
        });
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  async updateUserProfile(data: any): Promise<any> {
    try {
      // Check if we're in a browser environment
      if (!this.isBrowser) {
        throw new Error('Cannot update profile in server environment');
      }

      const token = await this.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      const result = await firstValueFrom(
        this.httpClient.put<any>(`${this.apiUrl}/api/keycloak/update`, data, { headers })
      );

      return result;
    } catch (error) {
      console.error("Errore durante l'update del profilo:", error);
      throw error;
    }
  }

  deleteProfileRequest(): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/customers/delete-request`, {});
  }

  deleteProfile(id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrl}/api/customers/delete/${id}`, {});
  }

  enableProfile(data: { kcId: string; enable: boolean }): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrl}/api/keycloak/users/enable`, data);
  }

  updateProfile(data: KeycloakProfile): Observable<KeycloakProfile> {
    return this.httpClient.put<KeycloakProfile>(`${this.apiUrl}/api/keycloak/update/user`, data);
  }

  restoreProfile(): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/api/customers/restore`, {});
  }

  resetPassword(kcId: string): Observable<any> {
    return this.httpClient.put<any>(`${this.apiUrl}/api/keycloak/user/reset-password/${kcId}`, {});
  }

  logout(): void {
    if (this.isBrowser) {
      // Clear any flags
      localStorage.removeItem(this.ADMIN_LOGIN_FLAG);
      localStorage.removeItem(this.EVALUATION_RESULTS_FLAG);
      this.keycloakService.logout();
    }
  }
}
