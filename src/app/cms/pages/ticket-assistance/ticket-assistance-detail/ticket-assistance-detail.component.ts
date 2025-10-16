// src/app/cms/pages/ticket-assistance/ticket-assistance-detail/ticket-assistance-detail.component.ts
import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { SimpleFileUploaderComponent } from '../../../../shared/molecules/simple-file-uploader/simple-file-uploader.component';
import {
  TicketAssistanceService,
  Ticket,
  TicketThread,
  CreateThreadData,
} from '../../../../public/services/ticket-assistance.service';
import { AgentsService, Agent } from '../../../services/agents.service';
import { Customer, CustomersService } from '../../../services/customers.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-ticket-assistance-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule,
    SimpleFileUploaderComponent,
  ],
  templateUrl: './ticket-assistance-detail.component.html',
})
export class TicketAssistanceDetailComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private ticketService = inject(TicketAssistanceService);
  private agentsService = inject(AgentsService);
  private customersService = inject(CustomersService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();

  // Component state
  ticketId: number | null = null;
  ticket = signal<Ticket | null>(null);
  agents = signal<Agent[]>([]);
  customer = signal<Customer | null>(null);
  isLoadingCustomer = signal(false);
  isLoading = signal(false);
  isLoadingAgents = signal(false);
  error = signal<string>('');
  isSubmittingResponse = signal(false);
  isUpdatingStatus = signal(false);
  isUpdatingPriority = signal(false);
  isAssigningAgent = signal(false);

  // Response form
  responseForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
    attachments: new FormControl<File[]>([]),
  });

  // Options
  statusOptions = [
    { value: 'OPEN', label: 'Aperto' },
    { value: 'IN_PROGRESS', label: 'In corso' },
    { value: 'WAITING_CUSTOMER', label: 'In attesa cliente' },
    { value: 'RESOLVED', label: 'Risolto' },
    { value: 'CLOSED', label: 'Chiuso' },
  ];

  priorityOptions = [
    { value: 'LOW', label: 'Bassa' },
    { value: 'MEDIUM', label: 'Media' },
    { value: 'HIGH', label: 'Alta' },
    { value: 'URGENT', label: 'Urgente' },
  ];

  ngOnInit() {
    // Get ticket ID from route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = parseInt(params['id']);
      if (id) {
        this.ticketId = id;
        this.loadTicket();
      } else {
        this.error.set('ID ticket non valido');
      }
    });

    this.loadAgents();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTicket() {
    if (!this.ticketId) return;

    this.isLoading.set(true);
    this.error.set('');

    this.ticketService
      .getTicket(this.ticketId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: ticket => {
          this.ticket.set(ticket);

          // Load customer info if available
          if (ticket.createdByKeycloakUser) {
            this.loadCustomerInfo(ticket.createdByKeycloakUser);
          }
        },
        error: error => {
          console.error('Error loading ticket:', error);
          this.error.set('Errore nel caricamento del ticket. Riprova più tardi.');
          this.toastService.error('Errore nel caricamento del ticket');
        },
      });
  }

  loadCustomerInfo(keycloakId: string): void {
    if (!keycloakId) return;

    this.isLoadingCustomer.set(true);

    this.customersService
      .getCustomer(keycloakId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingCustomer.set(false))
      )
      .subscribe({
        next: (customer: Customer) => {
          this.customer.set(customer);
        },
        error: err => {
          console.error('Failed to load customer details:', err);
          // Don't show error toast for customer loading failure as it's not critical
        },
      });
  }

  loadAgents() {
    this.isLoadingAgents.set(true);

    this.agentsService
      .getAgents()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoadingAgents.set(false))
      )
      .subscribe({
        next: agents => {
          this.agents.set(agents);
        },
        error: error => {
          console.error('Error loading agents:', error);
        },
      });
  }

  submitResponse() {
    if (!this.ticketId || this.responseForm.invalid) {
      this.responseForm.markAllAsTouched();
      return;
    }

    this.isSubmittingResponse.set(true);

    const responseData: CreateThreadData = {
      message: this.responseForm.value.message!,
      threadType: 'AGENT_RESPONSE',
      attachments: this.responseForm.value.attachments || [],
    };

    this.ticketService
      .addThread(this.ticketId, responseData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isSubmittingResponse.set(false))
      )
      .subscribe({
        next: thread => {
          // Check if the response actually indicates success
          if (thread && (thread.id || thread.message)) {
            this.toastService.success('Risposta inviata con successo');
            this.clearResponseForm();
            // Reload ticket to show new thread
            this.loadTicket();
          } else {
            // If the response doesn't have expected properties, it might be an error
            console.error('Unexpected response format:', thread);
            this.toastService.error(
              "Errore nell'invio della risposta - formato risposta non valido"
            );
          }
        },
        error: error => {
          console.error('Error submitting response:', error);
          this.toastService.error("Errore nell'invio della risposta");
        },
      });
  }

  clearResponseForm() {
    this.responseForm.reset();
    this.responseForm.patchValue({
      message: '',
      attachments: [],
    });
  }

  onFileUpload(files: File[]) {
    console.log('Files selected:', files); // Debug log
    this.responseForm.patchValue({ attachments: files });
  }

  updateTicketStatus(status: string) {
    if (!this.ticketId || !this.ticket()) return;

    this.isUpdatingStatus.set(true);

    this.ticketService
      .updateTicket(this.ticketId, {
        ticketStatus: status as 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED',
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isUpdatingStatus.set(false))
      )
      .subscribe({
        next: updatedTicket => {
          this.ticket.set(updatedTicket);
          this.toastService.success('Stato ticket aggiornato con successo');
        },
        error: error => {
          console.error('Error updating ticket status:', error);
          this.toastService.error("Errore nell'aggiornamento dello stato del ticket");
        },
      });
  }

  updateTicketPriority(priority: string) {
    if (!this.ticketId || !this.ticket()) return;

    this.isUpdatingPriority.set(true);

    this.ticketService
      .updateTicket(this.ticketId, {
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isUpdatingPriority.set(false))
      )
      .subscribe({
        next: updatedTicket => {
          this.ticket.set(updatedTicket);
          this.toastService.success('Priorità ticket aggiornata con successo');
        },
        error: error => {
          console.error('Error updating ticket priority:', error);
          this.toastService.error("Errore nell'aggiornamento della priorità del ticket");
        },
      });
  }

  assignAgent(agentId: string) {
    if (!this.ticketId || !this.ticket()) return;

    this.isAssigningAgent.set(true);

    this.ticketService
      .updateTicket(this.ticketId, { assignedToKeycloakUser: agentId })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isAssigningAgent.set(false))
      )
      .subscribe({
        next: updatedTicket => {
          this.ticket.set(updatedTicket);
          this.toastService.success('Agente assegnato con successo');
        },
        error: error => {
          console.error('Error assigning agent:', error);
          this.toastService.error("Errore nell'assegnazione dell'agente");
        },
      });
  }

  closeTicket() {
    this.updateTicketStatus('CLOSED');
  }

  reopenTicket() {
    this.updateTicketStatus('OPEN');
  }

  // Helper methods for display
  formatDate(dateString?: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCategory(category?: string): string {
    if (!category) return '';
    return this.ticketService.formatCategory(category);
  }

  formatPriority(priority?: string): string {
    if (!priority) return '';
    return this.ticketService.formatPriority(priority);
  }

  getStatusText(): string {
    const status = this.ticket()?.ticketStatus;
    if (!status) return '';
    return this.ticketService.formatStatus(status);
  }

  getStatusBadgeClass(): string {
    const status = this.ticket()?.ticketStatus;
    if (!status) return '';
    return this.ticketService.getStatusBadgeClass(status);
  }

  getPriorityColorClass(priority?: string): string {
    const classMap: { [key: string]: string } = {
      LOW: 'text-green-600',
      MEDIUM: 'text-yellow-600',
      HIGH: 'text-orange-600',
      URGENT: 'text-red-600',
    };
    return priority ? classMap[priority] || '' : '';
  }

  getPropertyReference(): string {
    const advertisement = this.ticket()?.advertisement;
    if (advertisement) {
      return `AP-${advertisement.id}`;
    }
    return 'Nessun riferimento';
  }

  getCustomerName(): string {
    const customer = this.customer();

    if (this.isLoadingCustomer()) {
      return 'Caricamento...';
    }

    if (customer) {
      return (
        `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
        customer.email ||
        'Utente'
      );
    }

    // Fallback to Keycloak ID if customer info couldn't be loaded
    const keycloakId = this.ticket()?.createdByKeycloakUser;
    return keycloakId || 'Utente sconosciuto';
  }

  getAssignedAgentName(): string {
    const agentId = this.ticket()?.assignedToKeycloakUser;
    if (!agentId) return 'Non assegnato';

    const agent = this.agents().find(a => a.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Agente sconosciuto';
  }

  getThreadTypeDisplay(thread: TicketThread): string {
    const typeMap: { [key: string]: string } = {
      USER_MESSAGE: 'Messaggio utente',
      AGENT_RESPONSE: 'Risposta assistenza',
      SYSTEM_MESSAGE: 'Messaggio di sistema',
      STATUS_UPDATE: 'Aggiornamento stato',
    };
    return typeMap[thread.threadType] || 'Messaggio';
  }

  getThreadClass(thread: TicketThread): string {
    if (thread.threadType === 'AGENT_RESPONSE') {
      return 'bg-secondary-light border-secondary-light';
    } else if (thread.threadType === 'SYSTEM_MESSAGE' || thread.threadType === 'STATUS_UPDATE') {
      return 'bg-primary-light border-primary-light';
    }
    return 'bg-white border-gray-200';
  }

  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toUpperCase() || '';
  }

  isImageFile(mimeType: string | boolean): boolean {
    return typeof mimeType === 'string' && mimeType.startsWith('image/');
  }

  downloadAttachment(attachment: any) {
    if (attachment.url) {
      const link = document.createElement('a');
      link.href = attachment.url;
      link.download = attachment.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  getControl(name: string): FormControl {
    return this.responseForm.get(name) as FormControl;
  }

  goBack() {
    this.router.navigate(['/cms/ticket-assistance']);
  }
}
