import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment_dev } from '../../environments/env.dev';
import { AuthService } from './auth.service';

export interface UploadResponse {
  id: string;
  url: string;
  type: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment_dev.apiUrl;

  /**
   * Upload a file to the server
   * @param file The file to upload
   * @param propertyId The ID of the property
   * @param type The type of file ('file' for photos or 'map' for floorplan)
   * @returns Observable with the response
   */
  uploadFile(file: File, propertyId: string, type: string): Observable<UploadResponse> {
    const formData = new FormData();
    formData.append('files', file);
    formData.append('ref', 'api::advertisement.advertisement'); // Content type UID
    formData.append('refId', propertyId); // ID of the advertisement entry

    // Determine the correct field name based on file type
    const fieldName = type === 'map' ? 'floorplan' : 'images';
    formData.append('field', fieldName); // Field name from your schema

    console.log(`Uploading ${type} file to field: ${fieldName}`);

    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.post<UploadResponse>(`${this.apiUrl}/api/upload-secure`, formData, {
          headers,
        });
      }),
      catchError(error => {
        console.error(`Error uploading ${type} file:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get list of files for a property
   * @param propertyId The ID of the property
   * @param type The type of files to get ('file' for photos or 'map' for floorplan)
   * @returns Observable with the response
   */
  getFiles(propertyId: string, type: string): Observable<UploadResponse[]> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        // Determine the field parameter based on file type
        const field = type === 'map' ? 'floorplan' : 'images';

        return this.http.get<UploadResponse[]>(
          `${this.apiUrl}/api/advertisements/${propertyId}/files?field=${field}`,
          {
            headers,
          }
        );
      }),
      catchError(error => {
        console.error(`Error getting ${type} files:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a file
   * @param fileId The ID of the file to delete
   * @returns Observable with the response
   */
  deleteFile(fileId: string): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        //TODO: Add validation UPLOAD DELETE (now is public)

        return this.http.delete(`${this.apiUrl}/api/upload-secure/files/${fileId}`);
      }),
      catchError(error => {
        console.error('Error deleting file:', error);
        return throwError(() => error);
      })
    );
  }
}
