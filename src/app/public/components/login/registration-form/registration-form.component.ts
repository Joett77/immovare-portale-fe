// src/app/public/components/login/registration-form/registration-form.component.ts
import { Component, inject, Input } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { AuthModalService } from '../../../services/auth-modal.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment_dev } from '../../../../environments/env.dev';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Component({
  selector: 'app-registration-form',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './registration-form.component.html',
  styleUrl: './registration-form.component.scss',
})
export class RegistrationFormComponent {
  @Input() fromEvaluation = false;
  @Input() redirectUrl: null | string = null;
  @Input() step: null | string = null;

  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private headers = new HttpHeaders({
    Authorization: `Bearer ${apiToken}`,
  });

  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  private toastTimeout?: number;

  private showToastMessage(message: string, type: 'success' | 'error') {
    console.log('Showing toast message:', message, type);
    // Clear any existing timeout
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }

    this.toastMessage = message;
    this.toastType = type;
    this.showToast = true;

    // Hide toast after 2 seconds
    this.toastTimeout = window.setTimeout(() => {
      this.showToast = false;
    }, 2000);
  }

  registrationForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(2)]),
    surname: new FormControl('', [Validators.required, Validators.minLength(2)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', [Validators.required, Validators.pattern(/^\d{10}$/)]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(30),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,30}$/),
    ]),
    privacyConsent: new FormControl(false, [Validators.requiredTrue]),
  });

  constructor(private modalService: AuthModalService) {}

  getControl(name: string) {
    return this.registrationForm.get(name) as FormControl;
  }

  async onSubmit() {
    if (this.registrationForm.valid) {
      const user = {
        username: this.registrationForm.value.email,
        firstName: this.registrationForm.value.name,
        lastName: this.registrationForm.value.surname,
        email: this.registrationForm.value.email,
        phone: this.registrationForm.value.phone,
        password: this.registrationForm.value.password,
      };

      this.http.post(`${apiUrl}/api/customers`, { ...user }, { headers: this.headers }).subscribe({
        next: (data: any) => {
          this.showToastMessage(
            "Registrazione avvenuta con successo.\nControlla la mail per completare l'iscrizione",
            'success'
          );
          this.registrationForm.reset();

          setTimeout(() => {
            if (this.fromEvaluation) {
              this.authService.login({ redirectUri: environment_dev.homeUrl + '/property-publishing?step=' + this.step });
            } else {
              this.router.navigate(['/']);
            }
          }, 2150); // Redirect after 2 seconds */
        },
        error: error => {
          console.error('Registration failed:', error);
          if (error.status === 409) {
            this.showToastMessage('Questo indirizzo email è già in uso', 'error');
            this.getControl('email').setErrors({'incorrect': true});
          } else {
            this.showToastMessage('Registrazione fallita. Riprova.', 'error');
          }
        },
      });
    } else {
      this.registrationForm.markAllAsTouched();
    }
  }

  private handleGoogleRegistration(user: any) {
    console.log('Handling Google registration:', user);
  }
}
