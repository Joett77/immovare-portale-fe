// src/app/cms/pages/ticket-assistance/ticket-assistance-list/ticket-assistance-list.component.ts
import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';
import { TicketActionsDropdownComponent } from '../../../../shared/action/ticket-actions-dropdown/ticket-actions-dropdown.component';
import {
  TicketAssistanceService,
  Ticket,
} from '../../../../public/services/ticket-assistance.service';
import { AgentsService, Agent } from '../../../services/agents.service';
import { CustomersService, Customer } from '../../../services/customers.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { CalendarIconComponent } from '../../../../shared/atoms/icons/calendar-icon/calendar-icon.component';
import { TicketNotificationService } from '../../../../public/services/ticket-notification.service';

interface TicketListItem {
  id: number;
  ticketStatus: string;
  category: string;
  subject: string;
  creationDate: string;
  lastUpdate: string;
  priority: string;
  createdByKeycloakUser: string;
  assignedToKeycloakUser?: string;
  advertisement?: {
    id: number;
    title: string;
    city: string;
    address: string;
  };
  threads?: any[];
  // Add customer info
  customerName?: string;
  customerEmail?: string;
}

@Component({
  selector: 'app-ticket-assistance-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    SearchIconComponent,
    TicketActionsDropdownComponent,
    DatePipe,
    CalendarIconComponent,
  ],
  templateUrl: './ticket-assistance-list.component.html',
  styleUrls: ['./ticket-assistance-list.component.scss'],
})
export class TicketAssistanceListComponent implements OnInit {
  private ticketService = inject(TicketAssistanceService);
  private ticketNotificationService = inject(TicketNotificationService);
  private agentsService = inject(AgentsService);
  private customersService = inject(CustomersService);
  private router = inject(Router);
  private toast = inject(ToastService);
  protected unreadTicketList: string[] = [];

  tickets: TicketListItem[] = [];
  allTickets: TicketListItem[] = [];
  agents: Agent[] = [];
  customers: Map<string, Customer> = new Map(); // Cache for customer data
  isLoading = true;
  isLoadingCustomers = false;
  error: string | null = null;

  // Filters
  searchQuery: string = '';
  selectedStatus: string = '';
  selectedCategory: string = '';
  startSelectedDate: string = '';
  endSelectedDate: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  Math = Math;

  // Filter options
  statusOptions = [
    { value: 'OPEN', label: 'Aperto' },
    { value: 'IN_PROGRESS', label: 'In corso' },
    { value: 'WAITING_CUSTOMER', label: 'In attesa cliente' },
    { value: 'RESOLVED', label: 'Risolto' },
    { value: 'CLOSED', label: 'Chiuso' },
  ];

  categoryOptions = [
    { value: 'TECHNICAL_SUPPORT', label: 'Supporto Tecnico' },
    { value: 'BILLING', label: 'Fatturazione' },
    { value: 'PROPERTY_INQUIRY', label: 'Richiesta Immobile' },
    { value: 'ACCOUNT_ISSUE', label: 'Problema Account' },
    { value: 'FEATURE_REQUEST', label: 'Richiesta Funzionalità' },
    { value: 'BUG_REPORT', label: 'Segnalazione Bug' },
    { value: 'OTHER', label: 'Altro' },
  ];

  private ticketEffect = effect(() => {
    this.unreadTicketList = this.ticketNotificationService.ticketsUnread$()
  })

  ngOnInit(): void {
    this.loadTickets();
    this.loadAgents();
  }

  loadTickets(): void {
    this.isLoading = true;
    this.error = null;

    // Build filters object with only non-empty values
    const filters: any = {};
    if (this.selectedStatus) filters.ticketStatus = this.selectedStatus;
    if (this.selectedCategory) filters.category = this.selectedCategory;
    if (this.searchQuery && this.searchQuery.trim()) {
      // For subject search, use a pattern that your backend can handle
      filters.subject = this.searchQuery.trim();
    }

    if (this.startSelectedDate) {
      filters.startSelectedDate = this.startSelectedDate;
    }

    if (this.endSelectedDate) {
      filters.endSelectedDate = this.endSelectedDate;
    }

    // Build sort object
    const sort = { lastUpdate: 'desc' };

    // Build pagination object
    const pagination = {
      page: this.currentPage,
      pageSize: this.itemsPerPage,
    };

    this.ticketService
      .getTickets(filters, sort, pagination)
      .pipe(
        switchMap(tickets => {
          console.log('Received tickets:', tickets); // Debug log

          const mappedTickets = this.mapTicketsToListItems(tickets.data);
          this.totalItems = tickets.meta.pagination.total;

          // Get unique customer IDs for loading customer info
          const uniqueCustomerIds = [
            ...new Set(
              mappedTickets
                .map(ticket => ticket.createdByKeycloakUser)
                .filter(id => id && !this.customers.has(id))
            ),
          ];

          // Load customer information if there are new customer IDs
          if (uniqueCustomerIds.length > 0) {
            return this.loadCustomersInfo(uniqueCustomerIds).pipe(
              switchMap(() => of(mappedTickets))
            );
          }

          return of(mappedTickets);
        }),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: (mappedTickets: TicketListItem[]) => {
          // Update tickets with customer information
          this.allTickets = mappedTickets.map(ticket => ({
            ...ticket,
            customerName: this.getCustomerDisplayName(ticket.createdByKeycloakUser),
            customerEmail: this.customers.get(ticket.createdByKeycloakUser)?.email,
          }));

          this.tickets = [...this.allTickets];
        },
        error: err => {
          console.error('Error fetching tickets:', err);
          this.error =
            'Si è verificato un errore durante il caricamento dei tickets. Riprova più tardi.';
          this.tickets = [];
          this.allTickets = [];
        },
      });
  }

  loadCustomersInfo(customerIds: string[]) {
    this.isLoadingCustomers = true;

    // Create an array of observables for each customer ID
    const customerObservables = customerIds.map(customerId =>
      this.customersService.getCustomer(customerId).pipe(
        catchError(error => {
          console.error(`Error loading customer ${customerId}:`, error);
          // Return a default customer object on error
          return of({
            id: 0,
            keycloakId: customerId,
            username: 'Utente sconosciuto',
            email: '',
            firstName: 'Utente',
            lastName: 'Sconosciuto',
            subscriptions: [],
            deletionDate: null,
            enabled: true,
          } as Customer);
        })
      )
    );

    return forkJoin(customerObservables)
      .pipe(finalize(() => (this.isLoadingCustomers = false)))
      .pipe(
        switchMap(customers => {
          // Store customers in the cache
          customers.forEach(customer => {
            if (customer.keycloakId) {
              this.customers.set(customer.keycloakId, customer);
            }
          });
          return of(customers);
        })
      );
  }

  getCustomerDisplayName(keycloakId: string): string {
    if (!keycloakId) return 'Utente sconosciuto';

    const customer = this.customers.get(keycloakId);
    if (customer) {
      if (customer.firstName && customer.lastName) {
        return `${customer.firstName} ${customer.lastName}`;
      } else if (customer.username) {
        return customer.username;
      } else if (customer.email) {
        return customer.email;
      }
    }

    return 'Utente sconosciuto';
  }

  loadAgents(): void {
    this.agentsService.getAgents().subscribe({
      next: (agents: Agent[]) => {
        this.agents = agents;
      },
      error: err => {
        console.error('Error loading agents:', err);
      },
    });
  }

  private mapTicketsToListItems(apiTickets: Ticket[]): TicketListItem[] {
    return apiTickets.map(ticket => ({
      id: ticket.id,
      ticketStatus: ticket.ticketStatus,
      category: ticket.category,
      subject: ticket.subject,
      creationDate: ticket.creationDate,
      lastUpdate: ticket.lastUpdate,
      priority: ticket.priority,
      createdByKeycloakUser: ticket.createdByKeycloakUser,
      assignedToKeycloakUser: ticket.assignedToKeycloakUser,
      advertisement: ticket.advertisement,
      threads: ticket.threads,
    }));
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when applying filters
    this.loadTickets();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedStatus = '';
    this.selectedCategory = '';
    this.startSelectedDate = '';
    this.endSelectedDate = '';
    this.applyFilters();
  }

  viewTicket(ticketId: number): void {
    this.router.navigate(['/cms/ticket-assistance', ticketId]);
  }

  assignAgent(data: { ticketId: number; agentId: string }): void {
    this.ticketService
      .updateTicket(data.ticketId, { assignedToKeycloakUser: data.agentId })
      .subscribe({
        next: () => {
          this.toast.success('Agente assegnato con successo');
          this.loadTickets(); // Reload to reflect changes
        },
        error: err => {
          console.error('Error assigning agent:', err);
          this.toast.error("Errore nell'assegnazione dell'agente");
        },
      });
  }

  updateTicketStatus(ticketId: number, status: any): void {
    this.ticketService.updateTicket(ticketId, { ticketStatus: status }).subscribe({
      next: () => {
        this.toast.success('Stato ticket aggiornato con successo');
        this.loadTickets(); // Reload to reflect changes
      },
      error: err => {
        console.error('Error updating ticket status:', err);
        this.toast.error("Errore nell'aggiornamento dello stato del ticket");
      },
    });
  }

  deleteTicket(ticketId: number): void {
    this.ticketService.deleteTicket(ticketId).subscribe({
      next: () => {
        this.toast.success('Ticket eliminato con successo');
        this.loadTickets(); // Reload to reflect changes
      },
      error: err => {
        console.error('Error deleting ticket:', err);
        this.toast.error("Errore nell'eliminazione del ticket");
      },
    });
  }

  // Helper methods for display
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatStatus(status: string): string {
    return this.ticketService.formatStatus(status);
  }

  formatCategory(category: string): string {
    return this.ticketService.formatCategory(category);
  }

  getStatusBadgeClass(status: string): string {
    return this.ticketService.getStatusBadgeClass(status);
  }

  getPropertyReference(ticket: TicketListItem): string {
    if (ticket.advertisement) {
      return `AP-${ticket.advertisement.id}`;
    }
    return 'Nessun riferimento';
  }

  getPropertyLocation(ticket: TicketListItem): string {
    if (ticket.advertisement) {
      return `${ticket.advertisement.city}, ${ticket.advertisement.address}`;
    }
    return '';
  }

  getCustomerName(ticket: TicketListItem): string {
    // Use the cached customer name if available
    if (ticket.customerName) {
      return ticket.customerName;
    }

    // Fallback to the display name method
    return this.getCustomerDisplayName(ticket.createdByKeycloakUser);
  }

  getAgentName(agentId: string): string {
    const agent = this.agents.find(a => a.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Agente sconosciuto';
  }

  isUnread(id: any ) {
    return this.unreadTicketList.includes(id)
  }
}
