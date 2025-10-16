// src/app/public/pages/dashboard/dashboard-add-message/dashboard-add-message.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, finalize } from 'rxjs';
import {
  SelectComponent,
  SelectOption,
} from '../../../../shared/molecules/select/select.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
// Import the correct file uploader component
import { SimpleFileUploaderComponent } from '../../../../shared/molecules/simple-file-uploader/simple-file-uploader.component';
import {
  TicketAssistanceService,
  CreateTicketData,
} from '../../../services/ticket-assistance.service';
import { PropertyApiService } from '../../../services/property-api.service';
import { ToastService } from '../../../../shared/services/toast.service';
import { AdvertisementDraft } from '../../../models';
import { ModalSmallComponent } from '../../../components/modal-small/modal-small.component';

interface SendTicketForm {
  subject: FormControl<string | null>;
  category: FormControl<string | null>;
  priority: FormControl<string | null>;
  message: FormControl<string | null>;
  attachments: FormControl<File[] | null>;
  advertisementId: FormControl<string | null>;
}

@Component({
  selector: 'app-dashboard-add-message',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    InputComponent,
    SelectComponent,
    ReactiveFormsModule,
    ButtonComponent,
    SimpleFileUploaderComponent,
    ModalSmallComponent,
    // Use the correct file uploader
  ],
  templateUrl: './dashboard-add-message.component.html',
})
export class DashboardAddMessageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private ticketService = inject(TicketAssistanceService);
  private propertyApiService = inject(PropertyApiService);
  private toastService = inject(ToastService);
  private destroy$ = new Subject<void>();
  protected modalType: null | "delete-element" = null;

  // Component state
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  // Form options
  categoryOptions: SelectOption[] = [];
  priorityOptions: SelectOption[] = [];
  propertyAdsOptions: SelectOption[] = [];

  // Form
  sendTicketForm = new FormGroup<SendTicketForm>({
    subject: new FormControl<string | null>(null, []),
    category: new FormControl<string | null>(null, [Validators.required]),
    priority: new FormControl<string | null>('MEDIUM'),
    message: new FormControl<string | null>(null, [Validators.required]),
    attachments: new FormControl<File[] | null>([]),
    advertisementId: new FormControl<string | null>(null),
  });

  ngOnInit() {
    this.initializeOptions();
    this.loadUserProperties();

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
   * Initialize form options
   */
  initializeOptions() {
    this.categoryOptions = this.ticketService.getCategoryOptions();
    this.priorityOptions = this.ticketService.getPriorityOptions();
  }

  /**
   * Load user properties for the advertisement dropdown
   */
  async loadUserProperties() {
    try {
      const propertiesObservable = await this.propertyApiService.getUserProperties<
        AdvertisementDraft[]
      >('api/advertisements/user-properties');

      propertiesObservable.pipe(takeUntil(this.destroy$)).subscribe({
        next: response => {
          if (Array.isArray(response)) {
            this.propertyAdsOptions = [
              { label: 'Nessun annuncio specifico', value: '' },
              ...response.map(property => ({
                label: `${property.city || ''}: ${property.address || ''} ${property.houseNumber || ''} (ID: ${property.id})`,
                value: property.id || '',
              })),
            ];
          } else if (response && 'data' in response) {
            // Handle paginated response
            const properties = (response as any).data;
            this.propertyAdsOptions = [
              { label: 'Nessun annuncio specifico', value: '' },
              ...properties.map((property: AdvertisementDraft) => ({
                label: `${property.city || ''}: ${property.address || ''} ${property.houseNumber || ''} (ID: ${property.id})`,
                value: property.id || '',
              })),
            ];
          }
        },
        error: error => {
          console.error('Error loading user properties:', error);
          // Set default option if loading fails
          this.propertyAdsOptions = [{ label: 'Nessun annuncio specifico', value: '' }];
        },
      });
    } catch (error) {
      console.error('Error setting up properties observable:', error);
      this.propertyAdsOptions = [{ label: 'Nessun annuncio specifico', value: '' }];
    }
  }

  /**
   * Get form control
   */
  getControl(name: keyof SendTicketForm): FormControl {
    return this.sendTicketForm.get(name) as FormControl;
  }

  /**
   * Handle file upload - Fixed to use the correct event name
   */
  handleFileUpload(files: File[]) {
    console.log('Files selected:', files); // Debug log
    this.sendTicketForm.patchValue({ attachments: files });
  }

  /**
   * Submit the ticket form
   */
  onSubmit() {
    console.log('Form submission started'); // Debug log
    console.log('Form valid:', this.sendTicketForm.valid); // Debug log
    console.log('Form value:', this.sendTicketForm.value); // Debug log

    if (this.sendTicketForm.invalid) {
      this.sendTicketForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.hasError = false;
    this.errorMessage = '';

    const formValue = this.sendTicketForm.value;

    const ticketData: CreateTicketData = {
      subject: formValue.category!,
      description: formValue.message!,
      category: formValue.category!,
      priority: formValue.priority || 'MEDIUM',
      attachments: formValue.attachments || [],
    };

    // Add advertisement ID if selected
    if (formValue.advertisementId && formValue.advertisementId !== '') {
      ticketData.advertisementId = parseInt(formValue.advertisementId);
    }

    console.log('Ticket data:', ticketData); // Debug log

    this.ticketService
      .createTicket(ticketData)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => (this.isSubmitting = false))
      )
      .subscribe({
        next: ticket => {
          console.log('Ticket created successfully:', ticket); // Debug log
          this.toastService.success('Ticket creato con successo');
          this.router.navigate(['/dashboard/messaggi/visualizza', ticket.id]);
        },
        error: error => {
          console.error('Error creating ticket:', error);
          this.hasError = true;
          this.errorMessage = 'Errore nella creazione del ticket. Riprova più tardi.';
          this.toastService.error('Errore nella creazione del ticket');
        },
      });
  }

  /**
   * Reset form
   */
  resetForm() {
    this.sendTicketForm.reset({
      priority: 'MEDIUM',
      attachments: [],
    });
    this.hasError = false;
    this.errorMessage = '';
  }

  /**
   * Navigate back to messages
   */
  goBack() {
    if (this.sendTicketForm.dirty) {
      this.modalType = 'delete-element';
    } else {
      this.router.navigate(['/dashboard/messaggi']);
    }
  }

  /**
   * Get validation error message for a field
   */
  getFieldError(fieldName: keyof SendTicketForm): string {
    const control = this.getControl(fieldName);

    if (control.errors && control.touched) {
      if (control.errors['required']) {
        return 'Questo campo è obbligatorio';
      }
      if (control.errors['minlength']) {
        return `Minimo ${control.errors['minlength'].requiredLength} caratteri`;
      }
      if (control.errors['maxlength']) {
        return `Massimo ${control.errors['maxlength'].requiredLength} caratteri`;
      }
    }

    return '';
  }

  /**
   * Check if field has error
   */
  hasFieldError(fieldName: keyof SendTicketForm): boolean {
    const control = this.getControl(fieldName);
    return !!(control.errors && control.touched);
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction() {
    if (this.modalType === "delete-element") {
      await this.router.navigate(['/dashboard/messaggi']);
    }

    this.modalClosed();
  }
}
