// src/app/public/components/blog/blog.service.ts
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment_dev } from '../../../environments/env.dev';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../../../public/services/auth.service';

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private headers = new HttpHeaders({
    Authorization: `Bearer ${apiToken}`,
  });

  /**
   * Get blog posts with pagination, search, and filtering options
   * @param page Page number (starting from 1)
   * @param limit Number of items per page
   * @param searchQuery Optional search query
   * @param selectedTag Optional tag filter
   * @param publicationState Publication state ('live' or 'preview')
   * @returns Observable with blog posts and pagination metadata
   */
  getPosts(
    page: number,
    limit: number,
    searchQuery: string,
    selectedTag: string,
    publicationState: string
  ): Observable<any> {
    const params = {
      page: page.toString(),
      pageSize: limit.toString(),
      title: searchQuery || '',
      tags: selectedTag || '',
      publicationState: publicationState || '',
    };

    return this.http.get(`${apiUrl}/api/posts`, {
      params,
      headers: this.headers,
    });
  }

  /**
   * Get a single blog post by ID
   * @param id Post ID
   * @returns Observable with blog post details
   */
  getPostById(id: string): Observable<any> {
    return this.http.get(`${apiUrl}/api/posts/${id}`, {
      params: new HttpParams().set('populate', '*'),
      headers: this.headers,
    });
  }

  /**
   * Get all available categories
   * @returns Observable with blog categories
   */
  getCategories(): Observable<any> {
    return this.http.get(`${apiUrl}/api/categories`, {
      headers: this.headers,
    });
  }

  /**
   * Create a new blog post
   * @param postData Blog post data
   * @returns Observable with the created blog post
   */
  createPost(postData: any): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const data = {
          data: postData,
        };

        return this.http.post(`${apiUrl}/api/posts`, data, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error creating post:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update an existing blog post
   * @param id Post ID
   * @param postData Blog post data
   * @returns Observable with the updated blog post
   */
  updatePost(id: string, postData: any): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        });

        const data = {
          data: postData,
        };

        return this.http.put(`${apiUrl}/api/posts/${id}`, data, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error updating post:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete a blog post
   * @param id Post ID
   * @returns Observable with the deletion result
   */
  deletePost(id: string): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.delete(`${apiUrl}/api/posts/${id}`, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error deleting post:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Upload an image for a blog post
   * @param file The image file to upload
   * @param postId Optional post ID to associate with the image
   * @returns Observable with the upload response
   */
  uploadImage(file: File, postId?: string | null): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const formData = new FormData();
        formData.append('files', file);

        // If we have a post ID, associate the image with it
        if (postId) {
          formData.append('ref', 'api::post.post');
          formData.append('refId', postId);
          formData.append('field', 'image');
        }

        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.post(`${apiUrl}/api/upload-secure`, formData, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error uploading image:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete an image
   * @param imageId The ID of the image to delete
   * @returns Observable with the deletion response
   */
  deleteImage(imageId: string): Observable<any> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.delete(`${apiUrl}/api/upload-secure/files/${imageId}`, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error deleting image:', error);
        return throwError(() => error);
      })
    );
  }
}
