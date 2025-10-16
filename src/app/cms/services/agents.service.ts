// src/app/cms/services/agents.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../public/services/auth.service';
import { environment_dev } from '../../environments/env.dev';

export interface Agent {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({
  providedIn: 'root',
})
export class AgentsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment_dev.apiUrl;

  /**
   * Get all available agents
   * @returns Observable with agents list
   */
  getAgents(): Observable<Agent[]> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
        });

        return this.http.get<Agent[]>(`${this.apiUrl}/api/keycloak/agents`, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error fetching agents:', error);
        return throwError(() => error);
      })
    );
  }
}
