// property-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, throwError, from, switchMap } from 'rxjs';
import { environment_dev } from '../../environments/env.dev';
import { AuthService } from './auth.service';
import { AdvertisementDraft, ApiError, ApiErrorType } from '../models';
export interface PropertyListResponse {
  results: AdvertisementDraft[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PropertyApiService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment_dev.apiUrl;

  /**
   * Get the last draft advertisement for the current user
   * @returns Observable with the draft data or error
   */
  getLastDraft(): Promise<Observable<AdvertisementDraft | ApiError>> {
    return this.createAuthenticatedRequest<AdvertisementDraft>(() =>
      this.http
        .get<AdvertisementDraft>(`${this.apiUrl}/api/advertisements/last-draft`, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  /**
   * Get a specific draft advertisement by ID
   * @param id The ID of the draft to fetch
   * @returns Observable with the draft data or error
   */
  getDraftById(id: string): Promise<Observable<AdvertisementDraft | ApiError>> {
    const params = new HttpParams().set('id', id);

    return this.createAuthenticatedRequest<AdvertisementDraft>(() =>
      this.http
        .get<AdvertisementDraft>(`${this.apiUrl}/api/advertisements/last-draft`, {
          headers: this.headers,
          params,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  /**
   * Create or update an advertisement Free publishing
   * @param data The advertisement data
   * @returns Observable with the response or error
   */
  saveAdvertisement(
    data: Partial<AdvertisementDraft>
  ): Promise<Observable<AdvertisementDraft | ApiError>> {
    return this.createAuthenticatedRequest<AdvertisementDraft>(() =>
      this.http
        .post<AdvertisementDraft>(`${this.apiUrl}/api/advertisements/draft`, data, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  /**
   * Create a new advertisement
   * @param advertisementData Advertisement data
   * @returns Observable with the created advertisement
   */
  createAdvertisement(advertisementData: any): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const data = {
          data: advertisementData,
        };

        return this.http.post(`${this.apiUrl}/api/advertisements`, data, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error creating advertisement:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an advertisement
   * @param id Advertisement ID
   * @returns Observable with the deletion result
   */
  deleteAdvertisement(id: string): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.delete(`${this.apiUrl}/api/advertisements/${id}`, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error deleting advertisement:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an advertisement
   * @param data The advertisement data
   * @returns Observable with the response or error
   */
  updateAdvertisement(
    data: Partial<AdvertisementDraft>
  ): Promise<Observable<AdvertisementDraft | ApiError>> {
    return this.createAuthenticatedRequest<AdvertisementDraft>(() =>
      this.http
        .put<AdvertisementDraft>(`${this.apiUrl}/api/advertisements/${data.id}`, data, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  createDraftBspTransaction(id: string): Promise<Observable<AdvertisementDraft | ApiError>> {
    return this.createAuthenticatedRequest<AdvertisementDraft>(() =>
      this.http
        .post<AdvertisementDraft>(`${this.apiUrl}/api/advertisements/bpm-draft/${id}`, {}, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  getSavedSearches(page: number, pageSize: number) {
    let params: any = {
      page: page,
      pageSize: pageSize,
    };
    return this.createAuthenticatedRequest<any>(() =>
    this.http.get<any>(`${this.apiUrl}/api/customers/saved-searches/get-all`, {params}).pipe(catchError(error => this.handleApiError(error))));

  }

  getUserProperties<T>(endpoint: string, page?: number, pageSize?: number): Promise<Observable<T | ApiError>> {
    let params: any = null;

    if (page && pageSize) {
      params = {
        page: page,
        pageSize: pageSize,
      }
    }

    return this.createAuthenticatedRequest<T>(() =>
      this.http
        .get<T>(`${this.apiUrl}/${endpoint}`, {
          headers: this.headers,
          params
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  postUserProperties<T>(endpoint: string, body: any): Promise<Observable<T | ApiError>> {
    return this.createAuthenticatedRequest<T>(() =>
      this.http
        .post<T>(`${this.apiUrl}/${endpoint}`, body, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  deleteAllUserProperties<T>(): Promise<Observable<T | ApiError>> {
    return this.createAuthenticatedRequest<T>(() =>
      this.http
        .delete<T>(`${this.apiUrl}/api/customers/favorites/delete-all`, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  deleteAllUserSavedSearch<T>(): Promise<Observable<T | ApiError>> {
    return this.createAuthenticatedRequest<T>(() =>
      this.http
        .delete<T>(`${this.apiUrl}/api/customers/saved-searches/delete-all`, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  deleteUserProperties<T>(endpoint: string, id: number): Promise<Observable<T | ApiError>> {
    return this.createAuthenticatedRequest<T>(() =>
      this.http
        .delete<T>(`${this.apiUrl}/${endpoint}/${id}`, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  getAllProperties(
    page: number,
    limit: number,
    filters: any
  ): Promise<Observable<PropertyListResponse | ApiError>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('filters', filters != null ? JSON.stringify(filters) : JSON.stringify({}));

    console.log("FILTERS ", filters);


    return this.createAuthenticatedRequest<PropertyListResponse>(() =>
      this.http
        .get<PropertyListResponse>(`${this.apiUrl}/api/advertisements/all`, {
          headers: this.headers,
          params,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  getProperty(id: string): Promise<Observable<AdvertisementDraft | ApiError>> {
    return this.createAuthenticatedRequest<AdvertisementDraft>(() =>
      this.http
        .get<AdvertisementDraft>(`${this.apiUrl}/api/advertisements/${id}`, {
          headers: this.headers,
        })
        .pipe(catchError(error => this.handleApiError(error)))
    );
  }

  /**
   * Handle API errors and convert them to a standardized format
   * @param error The HTTP error
   * @returns Observable with standardized error
   */
  private handleApiError(error: HttpErrorResponse): Observable<ApiError> {
    let apiError: ApiError;

    if (error.status === 0) {
      // Network error
      apiError = {
        type: ApiErrorType.NETWORK,
        message: 'Network error. Please check your connection.',
      };
    } else if (error.status === 401 || error.status === 403) {
      // Authentication error
      apiError = {
        type: ApiErrorType.AUTHENTICATION,
        message: 'Authentication failed. Please log in again.',
        status: error.status,
      };
    } else if (error.status === 400) {
      // Validation error
      apiError = {
        type: ApiErrorType.VALIDATION,
        message: 'Validation failed. Please check your inputs.',
        status: error.status,
        details: error.error,
      };
    } else if (error.status >= 500) {
      // Server error
      apiError = {
        type: ApiErrorType.SERVER,
        message: 'Server error. Please try again later.',
        status: error.status,
      };
    } else {
      // Unknown error
      apiError = {
        type: ApiErrorType.UNKNOWN,
        message: 'An unexpected error occurred.',
        status: error.status,
        details: error.error,
      };
    }

    // Log error for debugging
    console.error('API Error:', apiError);

    return throwError(() => apiError);
  }

  /**
   * Private helper to set up authenticated requests
   * @param requestFn Function that makes the HTTP request
   * @returns Observable of the response or error
   */
  private async createAuthenticatedRequest<T>(
    requestFn: () => Observable<T | ApiError>
  ): Promise<Observable<T | ApiError>> {
    try {
      const token = await this.authService.getToken();

      if (!token) {
        console.error('No authentication token available');
        return throwError(
          () =>
            ({
              type: ApiErrorType.AUTHENTICATION,
              message: 'Authentication token not available. Please log in again.',
            }) as ApiError
        );
      }

      this.headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      });

      // Return the observable from the request function
      return requestFn();
    } catch (error) {
      console.error('Authentication failed:', error);
      return throwError(
        () =>
          ({
            type: ApiErrorType.AUTHENTICATION,
            message: 'Authentication process failed. Please try again.',
            details: error,
          }) as ApiError
      );
    }
  }

  // Headers property with lazy initialization
  private _headers: HttpHeaders | null = null;

  private get headers(): HttpHeaders {
    if (!this._headers) {
      this._headers = new HttpHeaders({
        'Content-Type': 'application/json',
      });
    }
    return this._headers;
  }

  private set headers(headers: HttpHeaders) {
    this._headers = headers;
  }
}
