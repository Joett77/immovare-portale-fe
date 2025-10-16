// /src/app/cms/services/cms.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment_dev } from '../../environments/env.dev';
import { AuthService } from '../../public/services/auth.service';

export interface BlogArticle {
  id: string;
  status: string;
  title: string;
  content: string;
  category: string;
  creationDate: string;
  publicationDate: string;
  author: string;
}

@Injectable({
  providedIn: 'root', // This makes the service available throughout the app without needing to add it to module providers
})
export class CmsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment_dev.apiUrl;

  // Blog article methods
  getArticles(): Observable<BlogArticle[]> {
    // In a real app, this would be an API call
    // return this.http.get<BlogArticle[]>(`${this.apiUrl}/api/cms/articles`);

    // For now, just return mock data
    return of([
      {
        id: 'P-12345',
        status: 'Pubblicato',
        title: 'Trasforma il tuo terrazzo in un elegante spazio estivo',
        content: 'Lorem ipsum dolor sit amet...',
        category: 'Casa, estate, lifetime',
        creationDate: '24/12/2024',
        publicationDate: '24/12/2024 - 15:30',
        author: 'Redazione',
      },
      {
        id: 'P-12346',
        status: 'Bozza',
        title: 'Come scegliere la casa giusta per le tue esigenze',
        content: 'Lorem ipsum dolor sit amet...',
        category: 'Consigli immobiliari',
        creationDate: '20/12/2024',
        publicationDate: '',
        author: 'Mario Rossi',
      },
    ]);
  }

  // Dashboard methods
  getDashboardStats(): Observable<any> {
    // In a real app, this would be an API call
    // return this.http.get<any>(`${this.apiUrl}/api/cms/dashboard/stats`);

    // For now, just return mock data
    return of({
      articles: 12,
      properties: 34,
      users: 156,
      documents: 48,
    });
  }

  getRecentActivities(): Observable<any[]> {
    // In a real app, this would be an API call
    // return this.http.get<any[]>(`${this.apiUrl}/api/cms/activities/recent`);

    // For now, just return mock data
    return of([
      {
        id: 'A-1234',
        type: 'article',
        title:
          'Nuovo articolo pubblicato: "Trasforma il tuo terrazzo in un elegante spazio estivo"',
        date: '24/12/2024 15:30',
        user: 'Redazione',
      },
      {
        id: 'P-5678',
        type: 'property',
        title: 'Nuovo annuncio: "Villa in viale Monteparasco, 14 Marina di Pulsano"',
        date: '23/12/2024 11:45',
        user: 'Mario Rossi',
      },
    ]);
  }
}
