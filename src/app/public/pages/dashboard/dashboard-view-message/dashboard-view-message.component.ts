// src/app/public/pages/dashboard/dashboard-view-message/dashboard-view-message.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { FileUploaderComponent } from '../../../../shared/molecules/file-uploader/file-uploader.component';
import {
  TicketAssistanceService,
  Ticket,
  TicketThread,
  CreateThreadData,
} from '../../../services/ticket-assistance.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { ModalSmallComponent } from '../../../components/modal-small/modal-small.component';

@Component({
  selector: 'app-dashboard-view-message',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    InputComponent,
    ReactiveFormsModule,
    FileUploaderComponent,
    ModalSmallComponent,
  ],
  templateUrl: './dashboard-view-message.component.html',
  styleUrl: './dashboard-view-message.component.scss',
})
export class DashboardViewMessageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  public ticketService = inject(TicketAssistanceService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();
  protected modalType: null | "delete-element" = null;

  // Component state
  ticketId: number | null = null;
  ticket: Ticket | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  isSubmittingReply: boolean = false;

  // Reply form (always visible now)
  replyForm = new FormGroup({
    message: new FormControl('', [Validators.required]),
    attachments: new FormControl<File[]>([]),
  });

  ngOnInit() {
    // Get ticket ID from route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const id = parseInt(params['id']);
      if (id) {
        this.ticketId = id;
        this.loadTicket();
      } else {
        this.hasError = true;
        this.errorMessage = 'ID ticket non valido';
      }
    });

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
   * Load ticket details from API
   */
  loadTicket() {
    if (!this.ticketId) return;

    this.hasError = false;
    this.errorMessage = '';

    this.ticketService
      .getTicket(this.ticketId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: ticket => {
          this.ticket = ticket;
          // Mark threads as read
          this.markAsRead();
        },
        error: error => {
          console.error('Error loading ticket:', error);
          this.hasError = true;
          this.errorMessage = 'Errore nel caricamento del ticket. Riprova più tardi.';
          this.toastService.error('Errore nel caricamento del ticket');
        },
      });
  }

  /**
   * Mark ticket threads as read
   */
  markAsRead() {
    if (!this.ticketId) return;

    this.ticketService
      .markThreadsAsRead(this.ticketId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: error => {
          console.error('Error marking as read:', error);
        },
      });
  }

  /**
   * Clear reply form
   */
  clearReplyForm() {
    this.replyForm.reset();
    this.replyForm.patchValue({
      message: '',
      attachments: [],
    });
  }

  /**
   * Submit reply to ticket
   */
  submitReply() {
    if (!this.ticketId || this.replyForm.invalid || !this.canUserReply()) {
      this.replyForm.markAllAsTouched();
      return;
    }

    this.isSubmittingReply = true;

    const replyData: CreateThreadData = {
      message: this.replyForm.value.message!,
      threadType: 'USER_MESSAGE',
      attachments: this.replyForm.value.attachments || [],
    };

    this.ticketService
      .addThread(this.ticketId, replyData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSubmittingReply = false))
      )
      .subscribe({
        next: thread => {
          this.toastService.success('Risposta inviata con successo');
          this.clearReplyForm();
          // Reload ticket to show new thread
          this.loadTicket();
        },
        error: error => {
          console.error('Error submitting reply:', error);
          this.toastService.error("Errore nell'invio della risposta");
        },
      });
  }

  /**
   * Handle file upload
   */
  onFileUpload(files: File[]) {
    this.replyForm.patchValue({ attachments: files });
  }

  /**
   * Reopen ticket (change status to OPEN)
   */
  reopenTicket() {
    if (!this.ticketId || !this.ticket) return;

    this.modalType = "delete-element";
  }

  /**
   * Check if user can reply to ticket
   * User can only reply after agent response and if ticket is not closed
   */
  canUserReply(): boolean {
    if (!this.ticket) return false;

    // Cannot reply if ticket is closed
    if (this.ticket.ticketStatus === 'CLOSED') {
      return false;
    }

    // Check if there's an agent response after the last user message
    return this.hasAgentResponse();
  }

  /**
   * Check if there's an agent response after the last user message
   */
  hasAgentResponse(): boolean {
    if (!this.ticket?.threads || this.ticket.threads.length === 0) {
      // If no threads yet, user can reply to initial ticket
      return true;
    }

    // Get the sorted threads by creation date
    const sortedThreads = [...this.ticket.threads].sort(
      (a, b) => new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime()
    );

    // Find the last user message
    let lastUserMessageIndex = -1;
    for (let i = sortedThreads.length - 1; i >= 0; i--) {
      if (sortedThreads[i].threadType === 'USER_MESSAGE') {
        lastUserMessageIndex = i;
        break;
      }
    }

    // If no user messages found, user can reply
    if (lastUserMessageIndex === -1) {
      return true;
    }

    // Check if there's an agent response after the last user message
    for (let i = lastUserMessageIndex + 1; i < sortedThreads.length; i++) {
      if (sortedThreads[i].threadType === 'AGENT_RESPONSE') {
        return true;
      }
    }

    // No agent response found after last user message
    return false;
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
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  /**
   * Format date for display (short version)
   */
  formatDateShort(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Get display status
   */
  getDisplayStatus(status: string): string {
    return this.ticketService.formatStatus(status);
  }

  /**
   * Get status badge class
   */
  getStatusBadgeClass(status: string): string {
    return this.ticketService.getStatusBadgeClass(status);
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: string): string {
    return this.ticketService.formatCategory(category);
  }

  /**
   * Get property reference display
   */
  getPropertyReference(): string {
    if (this.ticket?.advertisement) {
      return `ID#${this.ticket.advertisement.id} - ${this.ticket.advertisement.city}`;
    }
    return 'Nessun riferimento';
  }

  /**
   * Check if ticket can be reopened
   */
  canReopenTicket(): boolean {
    return this.ticket?.ticketStatus === 'CLOSED' || this.ticket?.ticketStatus === 'RESOLVED';
  }

  /**
   * Get file extension for display
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toUpperCase() || '';
  }

  /**
   * Check if file is an image
   */
  isImageFile(mimeType: string): any {
    return mimeType && mimeType.startsWith('image/');
  }

  /**
   * Download attachment
   */
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

  /**
   * Get form control
   */
  getControl(name: string): FormControl {
    return this.replyForm.get(name) as FormControl;
  }

  /**
   * Get thread type display
   */
  getThreadTypeDisplay(thread: TicketThread): string {
    const typeMap: { [key: string]: string } = {
      USER_MESSAGE: 'Il tuo messaggio',
      AGENT_RESPONSE: 'Risposta assistenza',
      SYSTEM_MESSAGE: 'Messaggio di sistema',
      STATUS_UPDATE: 'Aggiornamento stato',
    };
    return typeMap[thread.threadType] || 'Messaggio';
  }

  /**
   * Get thread CSS class
   */
  getThreadClass(thread: TicketThread): string {
    if (thread.threadType === 'AGENT_RESPONSE') {
      return 'bg-secondary-light border-black';
    } else if (thread.threadType === 'SYSTEM_MESSAGE' || thread.threadType === 'STATUS_UPDATE') {
      return 'bg-secondary-light border-black';
    }
    return 'bg-white border-gray-200';
  }

  /**
   * Navigate back to messages list
   */
  goBack() {
    this.router.navigate(['/dashboard/messaggi']);
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction() {
    if (!this.ticketId || !this.ticket) return;

    this.isLoading = true;

    if (this.modalType === "delete-element") {
      this.ticketService
        .updateTicket(this.ticketId, { ticketStatus: 'OPEN' })
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: updatedTicket => {
            this.ticket = updatedTicket;
            this.toastService.success('Ticket riaperto con successo');
          },
          error: error => {
            console.error('Error reopening ticket:', error);
            this.toastService.error('Errore nella riapertura del ticket');
          },
        }).add(() => {
          this.isLoading = false;
          this.modalClosed();

      });
    }
  }
}
