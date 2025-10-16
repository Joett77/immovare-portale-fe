// registration-modal.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistrationFormComponent } from '../registration-form/registration-form.component';

@Component({
  selector: 'app-registration-modal',
  standalone: true,
  imports: [CommonModule, RegistrationFormComponent],
  templateUrl: './registration-modal.component.html',
})
export class RegistrationModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  closeModal() {
    this.onClose.emit();
  }
}
