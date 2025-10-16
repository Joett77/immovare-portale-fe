// src/app/public/services/ticket-assistance.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, from, throwError } from 'rxjs';
import { environment_dev } from '../../environments/env.dev';
import { finalize, tap, map, catchError, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface TicketAttachment {
  id: number;
  name: string;
  url: string;
  mime: string;
  size: number;
  ext: string;
}

export interface TicketThread {
  id: number;
  message: string;
  createdByKeycloakUser: string;
  isInternal: boolean;
  threadType: 'USER_MESSAGE' | 'AGENT_RESPONSE' | 'SYSTEM_MESSAGE' | 'STATUS_UPDATE';
  creationDate: string;
  attachments?: TicketAttachment[];
  readBy: string[];
}

export interface Ticket {
  id: number;
  subject: string;
  description: string;
  ticketStatus: 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category:
    | 'TECHNICAL_SUPPORT'
    | 'BILLING'
    | 'PROPERTY_INQUIRY'
    | 'ACCOUNT_ISSUE'
    | 'FEATURE_REQUEST'
    | 'BUG_REPORT'
    | 'OTHER';
  creationDate: string;
  lastUpdate: string;
  closedDate?: string;
  createdByKeycloakUser: string;
  assignedToKeycloakUser?: string;
  advertisement?: {
    id: number;
    title: string;
    city: string;
    address: string;
  };
  attachments?: TicketAttachment[];
  threads?: TicketThread[];
  tags: string[];
  internalNotes?: string;
  customerSatisfactionRating?: number;
  resolutionTime?: number;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  category: string;
  priority?: string;
  advertisementId?: number;
  attachments?: File[];
}

export interface CreateThreadData {
  message: string;
  threadType?: string;
  attachments?: File[];
  newTicketStatus?: string;
}

export interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  waitingCustomer: number;
  resolved: number;
  closed: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  averageResolutionTime: number;
}

@Injectable({
  providedIn: 'root',
})
export class TicketAssistanceService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private readonly apiUrl = environment_dev.apiUrl;
  private readonly ticketsEndpoint = `${this.apiUrl}/api/ticket-assistances`;
  private readonly threadsEndpoint = `${this.apiUrl}/api/ticket-threads`;

  // Reactive state
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);
  public tickets$ = this.ticketsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  private getFormDataHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type for FormData, let browser set it with boundary
    });
  }

  /**
   * Create a new ticket with optional file attachments
   * @param ticketData The ticket data
   * @returns Observable with the created ticket
   */
  createTicket(ticketData: CreateTicketData): Observable<Ticket> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let the browser set it for multipart/form-data
        });

        // Create FormData to handle both data and files
        const formData = new FormData();

        // Add ticket data as individual fields (not as JSON string)
        formData.append('subject', ticketData.subject);
        formData.append('description', ticketData.description);
        formData.append('category', ticketData.category);

        if (ticketData.priority) {
          formData.append('priority', ticketData.priority);
        }

        if (ticketData.advertisementId) {
          formData.append('advertisementId', ticketData.advertisementId.toString());
        }

        // Add files if present - use 'files' as the key to match backend expectation
        if (ticketData.attachments && ticketData.attachments.length > 0) {
          ticketData.attachments.forEach(file => {
            formData.append('files', file, file.name);
          });
        }

        // Debug logging
        console.log('FormData contents:');
        for (let pair of (formData as any).entries()) {
          console.log(pair[0], pair[1]);
        }

        return this.http.post<Ticket>(`${this.apiUrl}/api/ticket-assistances`, formData, {
          headers,
        });
      }),
      catchError(error => {
        console.error('Error creating ticket:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Add a thread to an existing ticket with optional file attachments
   * @param ticketId The ticket ID
   * @param threadData The thread data
   * @returns Observable with the created thread
   */
  addThread(ticketId: number, threadData: CreateThreadData): Observable<TicketThread> {
    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type for multipart requests
        });

        // Create FormData to handle both data and files
        const formData = new FormData();

        // Add thread data
        const threadInfo = {
          message: threadData.message,
          threadType: threadData.threadType || 'USER_MESSAGE',
        };

        Object.keys(threadInfo).forEach(key => {
          const value = (threadInfo as any)[key];
          if (value !== undefined && value !== null) {
            formData.append(key, value.toString());
          }
        });

        // Add files if present
        if (threadData.attachments && threadData.attachments.length > 0) {
          threadData.attachments.forEach((file, index) => {
            formData.append('files', file, file.name);
          });
        }

        console.log('Sending thread data:', threadInfo);
        console.log('Sending thread files:', threadData.attachments);

        return this.http.post<TicketThread>(
          `${this.apiUrl}/api/ticket-assistances/${ticketId}/threads`,
          formData,
          { headers }
        );
      }),
      catchError(error => {
        console.error('Error adding thread:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all tickets for the current user
   */
  getMyTickets(page: number, pageSize: number, status?: string, priority?: string): Observable<any> {
    this.loadingSubject.next(true);

    let params: any = {
      page: page,
      pageSize: pageSize,
    };
    if (status) params.status = status;
    if (priority) params.priority = priority;

    return this.http
      .get<any>(`${this.ticketsEndpoint}/my-tickets`, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        tap(tickets => this.ticketsSubject.next(tickets.results)),
        finalize(() => this.loadingSubject.next(false))
      );
  }

  /**
   * Get all tickets with pagination and filters
   */
  getTickets(filters?: any, sort?: any, pagination?: any): Observable<any> {
    this.loadingSubject.next(true);

    // Build query parameters to match backend expectations
    let params = new HttpParams();

    // Add filters as JSON string if provided
    if (filters && Object.keys(filters).length > 0) {
      params = params.set('filters', JSON.stringify(filters));
    }

    // Add sort as JSON string if provided
    if (sort && Object.keys(sort).length > 0) {
      params = params.set('sort', JSON.stringify(sort));
    }

    // Add pagination as JSON string if provided
    if (pagination) {
      params = params.set('pagination', JSON.stringify(pagination));
    }

    return this.http
      .get<any>(this.ticketsEndpoint, {
        headers: this.getHeaders(),
        params,
      })
      .pipe(
        map(response => {
          return response || [];
        }),
        tap(tickets => this.ticketsSubject.next(tickets)),
        finalize(() => this.loadingSubject.next(false))
      );
  }
  /**
   * Get a specific ticket with all threads
   */
  getTicket(id: number): Observable<Ticket> {
    this.loadingSubject.next(true);

    return this.http
      .get<Ticket>(`${this.ticketsEndpoint}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(finalize(() => this.loadingSubject.next(false)));
  }

  /**
   * Update a ticket
   */
  updateTicket(id: number, data: Partial<Ticket>): Observable<Ticket> {
    this.loadingSubject.next(true);

    return this.http
      .put<Ticket>(
        `${this.ticketsEndpoint}/${id}`,
        { data },
        {
          headers: this.getHeaders(),
        }
      )
      .pipe(finalize(() => this.loadingSubject.next(false)));
  }

  /**
   * Delete a ticket
   */
  deleteTicket(id: number): Observable<void> {
    this.loadingSubject.next(true);

    return this.http
      .delete<void>(`${this.ticketsEndpoint}/${id}`, {
        headers: this.getHeaders(),
      })
      .pipe(finalize(() => this.loadingSubject.next(false)));
  }

  /**
   * Get threads for a specific ticket
   */
  getThreads(ticketId: number): Observable<TicketThread[]> {
    return this.http.get<TicketThread[]>(this.threadsEndpoint, {
      headers: this.getHeaders(),
      params: { ticketId: ticketId.toString() },
    });
  }

  /**
   * Mark threads as read
   */
  markThreadsAsRead(ticketId: number): Observable<any> {
    return this.http.post(
      `${this.threadsEndpoint}/${ticketId}/mark-read`,
      {},
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * Get unread count for a ticket
   */
  getUnreadCount(ticketId: number): Observable<{ unreadCount: number }> {
    return this.http.get<{ unreadCount: number }>(
      `${this.threadsEndpoint}/${ticketId}/unread-count`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  getTicketsUnread(): Observable<any> {
    return this.http.get<any>(
      `${this.ticketsEndpoint}/ticket/unread`,
      {
        headers: this.getHeaders(),
      }
    );
  }

  /**
   * Get ticket statistics for the current user
   */
  getTicketStats(): Observable<TicketStats> {
    return this.http.get<TicketStats>(`${this.ticketsEndpoint}/stats`, {
      headers: this.getHeaders(),
    });
  }

  /**
   * Upload attachments to a ticket
   */
  uploadAttachments(ticketId: number, files: File[]): Observable<{ files: TicketAttachment[] }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file, file.name);
    });

    return this.http.post<{ files: TicketAttachment[] }>(
      `${this.ticketsEndpoint}/${ticketId}/attachments`,
      formData,
      {
        headers: this.getFormDataHeaders(),
      }
    );
  }

  /**
   * Get category options for dropdown
   */
  getCategoryOptions() {
    return [
      { label: 'Supporto Tecnico', value: 'TECHNICAL_SUPPORT' },
      { label: 'Fatturazione', value: 'BILLING' },
      { label: 'Richiesta Immobile', value: 'PROPERTY_INQUIRY' },
      { label: 'Problema Account', value: 'ACCOUNT_ISSUE' },
      { label: 'Richiesta Funzionalità', value: 'FEATURE_REQUEST' },
      { label: 'Segnalazione Bug', value: 'BUG_REPORT' },
      { label: 'Altro', value: 'OTHER' },
    ];
  }

  /**
   * Get priority options for dropdown
   */
  getPriorityOptions() {
    return [
      { label: 'Bassa', value: 'LOW' },
      { label: 'Media', value: 'MEDIUM' },
      { label: 'Alta', value: 'HIGH' },
      { label: 'Urgente', value: 'URGENT' },
    ];
  }

  /**
   * Get status options for dropdown
   */
  getStatusOptions() {
    return [
      { label: 'Aperto', value: 'OPEN' },
      { label: 'In Corso', value: 'IN_PROGRESS' },
      { label: 'In Attesa Cliente', value: 'WAITING_CUSTOMER' },
      { label: 'Risolto', value: 'RESOLVED' },
      { label: 'Chiuso', value: 'CLOSED' },
    ];
  }

  /**
   * Format status for display
   */
  formatStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      OPEN: 'Aperto',
      IN_PROGRESS: 'In corso',
      WAITING_CUSTOMER: 'In attesa cliente',
      RESOLVED: 'Risolto',
      CLOSED: 'Chiuso',
    };
    return statusMap[status] || status;
  }

  /**
   * Format priority for display
   */
  formatPriority(priority: string): string {
    const priorityMap: { [key: string]: string } = {
      LOW: 'Bassa',
      MEDIUM: 'Media',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return priorityMap[priority] || priority;
  }

  /**
   * Format category for display
   */
  formatCategory(category: string): string {
    const categoryMap: { [key: string]: string } = {
      TECHNICAL_SUPPORT: 'Supporto Tecnico',
      BILLING: 'Fatturazione',
      PROPERTY_INQUIRY: 'Richiesta Immobile',
      ACCOUNT_ISSUE: 'Problema Account',
      FEATURE_REQUEST: 'Richiesta Funzionalità',
      BUG_REPORT: 'Segnalazione Bug',
      OTHER: 'Altro',
    };
    return categoryMap[category] || category;
  }

  /**
   * Get CSS class for status badge
   */
  getStatusBadgeClass(status: string): string {
    console.log('status', status);
    const classMap: { [key: string]: string } = {
      OPEN: 'bg-[#ECE81A] text-black',
      IN_PROGRESS: 'bg-[#ECE81A] text-black',
      WAITING_CUSTOMER: 'bg-[#FFA500] text-black',
      RESOLVED: 'bg-[#CCFCD4] text-black',
      CLOSED: 'bg-[#CCFCD4] text-black',
    };
    return classMap[status] || 'bg-gray-100 text-gray-800';
  }
}
