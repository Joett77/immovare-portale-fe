// src/app/public/pages/dashboard/dashboard-messages/dashboard-messages.component.ts
import { Component, OnInit, OnDestroy, inject, effect } from '@angular/core';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import { TicketAssistanceService, Ticket } from '../../../services/ticket-assistance.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { PaginationComponent } from '../../../../shared/organisms/pagination/pagination.component';
import { TicketNotificationService } from '../../../services/ticket-notification.service';

@Component({
  selector: 'app-dashboard-messages',
  standalone: true,
  imports: [PlusIconComponent, ButtonComponent, CommonModule, RouterLink, PaginationComponent],
  templateUrl: './dashboard-messages.component.html',
  styleUrl: './dashboard-messages.component.scss',
})
export class DashboardMessagesComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  public ticketService = inject(TicketAssistanceService);
  private toastService = inject(ToastService);
  private ticketNotificationService = inject(TicketNotificationService);
  private destroy$ = new Subject<void>();
  protected unreadTicketList: string[] = [];

  // Component state
  activeTab: string = 'all-messages';
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Data
  tickets: Ticket[] = [];
  pagination: any = null;

  private ticketEffect = effect(() => {
    this.unreadTicketList = this.ticketNotificationService.ticketsUnread$()
  })

  ngOnInit() {
    this.loadTickets();

    // Subscribe to loading state
    this.ticketService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => (this.isLoading = loading));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load tickets from the API
   */
  loadTickets() {
    this.hasError = false;
    this.errorMessage = '';

    this.ticketService
      .getMyTickets(this.currentPage, this.pageSize, this.activeTab)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: tickets => {
          this.tickets = tickets.results;
          this.pagination = tickets.pagination;
          this.totalPages = tickets.pagination.pageCount;
        },
        error: error => {
          console.error('Error loading tickets:', error);
          this.hasError = true;
          this.errorMessage = 'Errore nel caricamento dei messaggi. Riprova più tardi.';
          this.toastService.error('Errore nel caricamento dei messaggi');
        },
      });
  }

  /**
   * Switch between tabs and reload data if needed
   */
  switchTab(tab: string) {
    this.activeTab = tab;
    this.currentPage = 1;

    this.loadTickets();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadTickets();
  }

  /**
   * Navigate to ticket detail view
   */
  goToTicket(ticketId: number) {
    this.router.navigate(['/dashboard/messaggi/visualizza/', ticketId]);
  }

  /**
   * Navigate to new message form
   */
  openNewMessage() {
    this.router.navigate(['/dashboard/messaggi/nuovo']);
  }

  /**
   * Refresh tickets
   */
  refreshTickets() {
    this.loadTickets();
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Get display status for ticket
   */
  getDisplayStatus(ticket: Ticket): string {
    return this.ticketService.formatStatus(ticket.ticketStatus);
  }

  /**
   * Get CSS class for status badge
   */
  getStatusBadgeClass(ticket: Ticket): string {
    return this.ticketService.getStatusBadgeClass(ticket.ticketStatus);
  }

  /**
   * Get property reference display
   */
  getPropertyReference(ticket: Ticket): string {
    if (ticket.advertisement) {
      return `ID#${ticket.advertisement.id}`;
    }
    return 'Nessun riferimento';
  }

  /**
   * Get ticket description preview (truncated)
   */
  getDescriptionPreview(description: string): string {
    if (!description) return '';

    // Remove HTML tags and truncate
    const plainText = description.replace(/<[^>]*>/g, '');
    return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
  }

  /**
   * Check if there are any unread messages (if API provides this info)
   */
  hasUnreadMessages(ticket: Ticket): boolean {
    // This would need to be implemented based on your API response
    // For now, return false
    return false;
  }

  isUnread(id: any ) {
    return this.unreadTicketList.includes(id)
  }
}
