// email-verification-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';

@Component({
  selector: 'app-email-verification-modal',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './email-verification-modal.component.html',
})
export class EmailVerificationModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onVerificationSuccess = new EventEmitter<void>();

  verificationForm = new FormGroup({
    code: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.maxLength(6),
    ]),
  });

  getControl(name: string) {
    return this.verificationForm.get(name) as FormControl;
  }

  closeModal() {
    this.verificationForm.reset();
    this.onClose.emit();
  }

  resendCode() {
    // Implement code resend logic
    console.log('Resending verification code');
  }

  onSubmit() {
    if (this.verificationForm.valid) {
      // Implement verification logic
      console.log('Verifying code:', this.verificationForm.value);
      // On successful verification:
      this.onVerificationSuccess.emit();
      this.closeModal();
    }
  }
}
