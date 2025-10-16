// src/app/cms/services/guide.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment_dev } from '../../environments/env.dev';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../public/services/auth.service';

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Injectable({
  providedIn: 'root',
})
export class GuideService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private headers = new HttpHeaders({
    Authorization: `Bearer ${apiToken}`,
  });

  /**
   * Get guides with pagination, search, and filtering options
   * @param page Page number (starting from 1)
   * @param limit Number of items per page
   * @param searchQuery Optional search query
   * @param selectedCategory Optional category filter
   * @param publicationState Publication state ('live' or 'preview')
   * @returns Observable with guides and pagination metadata
   */
  getGuides(
    page: number,
    limit: number,
    searchQuery: string,
    selectedCategory: string,
    publicationState: string
  ): Observable<any> {
    const params = {
      page: page.toString(),
      pageSize: limit.toString(),
      searchQuery: searchQuery || '',
      selectedCategory: selectedCategory || '',
      publicationState: publicationState || '',
    };

    return this.http.get(`${apiUrl}/api/guides`, {
      params,
      headers: this.headers,
    });
  }

  /**
   * Get a single guide by ID
   * @param id Guide ID
   * @returns Observable with guide details
   */
  getGuideById(id: string): Observable<any> {
    return this.http.get(`${apiUrl}/api/guides/${id}`, {
      params: new HttpParams().set('populate', '*'),
      headers: this.headers,
    });
  }

  /**
   * Create a new guide
   * @param guideData Guide data
   * @returns Observable with the created guide
   */
  createGuide(guideData: any): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const data = {
          data: guideData,
        };

        return this.http.post(`${apiUrl}/api/guides`, data, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error creating guide:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing guide
   * @param id Guide ID
   * @param guideData Guide data
   * @returns Observable with the updated guide
   */
  updateGuide(id: string, guideData: any): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const data = {
          data: guideData,
        };

        return this.http.put(`${apiUrl}/api/guides/${id}`, data, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error updating guide:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a guide
   * @param id Guide ID
   * @returns Observable with the deletion result
   */
  deleteGuide(id: string): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.delete(`${apiUrl}/api/guides/${id}`, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error deleting guide:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload a file for a guide
   * @param file The file to upload
   * @param guideId Optional guide ID to associate with the file
   * @param field The field name ('file' or 'image')
   * @returns Observable with the upload response
   */
  uploadFile(file: File, guideId?: string | null, field: string = 'file'): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const formData = new FormData();
        formData.append('files', file);

        // If we have a guide ID, associate the file with it
        if (guideId) {
          formData.append('ref', 'api::guide.guide');
          formData.append('refId', guideId);
          formData.append('field', field);
        }

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.post(`${apiUrl}/api/upload-secure`, formData, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error uploading file:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a file
   * @param fileId The ID of the file to delete
   * @returns Observable with the deletion response
   */
  deleteFile(fileId: string): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.delete(`${apiUrl}/api/upload-secure/files/${fileId}`, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error deleting file:', error);
        return throwError(() => error);
      })
    );
  }
}
