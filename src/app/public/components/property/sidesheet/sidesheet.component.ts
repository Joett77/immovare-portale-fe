import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef
} from '@angular/core';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { BookAppointmentComponent } from '../book-appointment/book-appointment.component';
import { ArrowLeftIconComponent } from '../../../../shared/atoms/icons/arrow-left-icon/arrow-left-icon.component';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { FormControl, FormGroup } from '@angular/forms';
import { environment_dev } from '../../../../environments/env.dev';
import { HttpClient } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

const apiUrl = environment_dev.apiUrl;

@Component({
  selector: 'app-sidesheet',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ContactFormComponent,
    BookAppointmentComponent,
    ArrowLeftIconComponent,
    SuccessModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidesheet.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SidesheetComponent {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  @Input() isOpen = false;
  @Input() propertyId: any = null;
  @Output() closeSheet = new EventEmitter<void>();

  protected dateForm = new FormGroup({});
  protected contactForm = new FormGroup({});
  protected submitError: string | null = null;
  isLoggedIn: boolean = false;

  constructor(keycloakService: KeycloakService) {
    this.isLoggedIn = keycloakService.isLoggedIn()
  }

  proceedWithAppointment() {
    console.log('Appointment booked:', {});
    this.showContactForm = true;
    //this.closeSheet.emit();
  }
  backStepAppointment() {
    this.showContactForm = false;
  }
  confirmFormData() {
    this.submitError = null;

    const data = {
      ...this.contactForm.value,
      ...this.dateForm.value,
      propertyId: this.propertyId,
    }

    this.http.post(apiUrl + '/api/contacts/appointment', data).subscribe({
      next: (resp) => {
        this.showSuccessModal = true;
        this.showContactForm = false;
        this.closeSheet.emit();
      }, error: (err) => {
        this.submitError = "Si è verificato un errore durante l'invio. Riprova più tardi.";
        this.cdr.detectChanges();
      }
    });

  }
  showContactForm = false;
  showSuccessModal = false;

  closeSuccessModal() {
    console.log('Close success modal');
    this.showSuccessModal = false;
    this.closeSheet.emit();
  }

  updateContactFormData(form: any) {
    this.contactForm = form;

  }

  updateDateFormData(form: any) {
    this.dateForm = form;

  }
}
