// reset-password-modal.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { AuthModalService } from '../../../services/auth-modal.service';

@Component({
  selector: 'app-reset-password-modal',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule, ButtonComponent],
  template: `
    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        class="bg-white rounded-sm w-full h-screen lg:h-fit lg:max-w-xl lg:mx-4 relative py-8 px-12"
      >
        <button
          (click)="modalService.closeModal()"
          class="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <svg
            class="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 class="heading-md font-bold text-primary-dark mb-2">Reimposta password</h2>
        <p class="mb-8">Inserisci la tua email.</p>

        <form
          [formGroup]="resetForm"
          class="flex flex-col space-y-4"
          (ngSubmit)="onSubmit()"
        >
          <app-input
            label="Email"
            [control]="getControl('email')"
            type="email"
            class="mb-4"
          />

          <app-button
            type="primary"
            size="md"
            class="w-full"
          >
            Conferma
          </app-button>
        </form>
      </div>
    </div>
  `,
})
export class ResetPasswordModalComponent {
  resetForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  constructor(public modalService: AuthModalService) {}

  getControl(name: string) {
    return this.resetForm.get(name) as FormControl;
  }

  async onSubmit() {
    if (this.resetForm.valid) {
      try {
        // Implement password reset logic here
        console.log('Reset password for:', this.resetForm.value.email);
        this.modalService.closeModal();
      } catch (error) {
        console.error('Password reset failed:', error);
      }
    }
  }
}
