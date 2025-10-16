import { Component, effect, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';

import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { TrashIconComponent } from '../../../../shared/atoms/icons/trash-icon/trash-icon.component';
import { MastercardIconComponent } from '../../../../shared/atoms/icons/mastercard-icon/mastercard-icon.component';
import { VisaIconComponent } from '../../../../shared/atoms/icons/visa-icon/visa-icon.component';
import { SaveIconComponent } from '../../../../shared/atoms/icons/save-icon/save-icon.component';
import { EditIconComponent } from '../../../../shared/atoms/icons/edit-icon/edit-icon.component';
import { ModalSmallComponent } from '../../../components/modal-small/modal-small.component';
import { CustomersService } from '../../../../cms/services/customers.service';
import { faTiktok } from '@fortawesome/free-brands-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faExclamationTriangle, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  marketingConsent: boolean;
  thirdPartyConsent: boolean;
  newsletterConsent: boolean;
};

type ProfileFormControls = {
  [K in keyof ProfileForm]: FormControl<ProfileForm[K]>;
};

//visa icon svg export

@Component({
  selector: 'app-dashboard-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    TrashIconComponent,
    MastercardIconComponent,
    VisaIconComponent,
    SaveIconComponent,
    EditIconComponent,
    ModalSmallComponent,
    FaIconComponent,
  ],
  templateUrl: './dashboard-profile.component.html',
  styleUrl: './dashboard-profile.component.scss',
})
export class DashboardProfileComponent implements OnInit {
  private toast = inject(ToastService);

  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private customerService = inject(CustomersService);
  protected loading = false;
  protected modalLoading = false;
  protected modalType: null | 'delete-request' | 'restore' | 'update-password' | 'update-profile' =
    null;
  protected submitError: string | null = null;
  protected deletionDate: Date | null = null;
  protected isLoading = false;
  protected alertIcon = faExclamationTriangle;
  protected profileForm: FormGroup<ProfileFormControls>;

  private userEffect = effect(() => {
    const user = this.auth.userData$();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.attributes?.phone || '',
        email: user.email || '',
      });
    }
  });

  private customerEffect = effect(() => {
    const customer = this.customerService.customer$();

    if (customer) {
      this.deletionDate = customer.deletionDate;
    }
  });

  constructor() {
    this.customerService.getSelf();
    this.profileForm = this.fb.group<ProfileFormControls>({
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{6,15}$/)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      marketingConsent: new FormControl(true, {
        nonNullable: true,
      }),
      thirdPartyConsent: new FormControl(true, {
        nonNullable: true,
      }),
      newsletterConsent: new FormControl(true, {
        nonNullable: true,
      }),
    });
  }

  ngOnInit(): void {}

  protected getControl(name: keyof ProfileForm): FormControl<ProfileForm[typeof name]> {
    const control = this.profileForm.get(name);
    if (!control) {
      throw new Error(`Control ${name} not found in form`);
    }
    return control as FormControl<ProfileForm[typeof name]>;
  }

  protected hasError(controlName: keyof ProfileForm, errorType: string): boolean {
    const control = this.getControl(controlName);
    return control?.touched === true && control?.hasError(errorType) === true;
  }

  protected async saveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.modalType = 'update-profile';
  }

  isChangingPassword = false;

  protected passwordForm = this.fb.group(
    {
      currentPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: this.passwordMatchValidator }
  );

  protected getPasswordControl(
    name: 'currentPassword' | 'newPassword' | 'confirmPassword'
  ): FormControl {
    const control = this.passwordForm.get(name);
    if (!control) {
      throw new Error(`Control ${name} not found in form`);
    }

    return control as FormControl;
  }

  protected modifyPassword(): void {
    this.isChangingPassword = true;
  }

  protected async confirmPasswordChange(): Promise<void> {
    if (this.passwordForm.valid) {
      this.modalType = 'update-password';
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  private passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { passwordMismatch: true };
  }

  protected deleteAccount(): void {
    this.modalType = 'delete-request';
  }

  protected modifyPaymentMethod(): void {
    this.isModifyingPayment = true;
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected sendRestore() {
    this.modalType = 'restore';
  }

  protected async modalAction() {
    if (this.modalType === 'delete-request') {
      this.modalLoading = true;

      this.auth
        .deleteProfileRequest()
        .subscribe({
          next: (response: any) => {
            this.toast.success('Richiesta di cancellazione inviata');
            this.submitError = null;
          },
          error: error => {
            this.toast.error("Si è verificato un errore durante l'operazione");
            this.submitError = "Si è verificato un errore durante l'operazione. Riprova più tardi.";
          },
        })
        .add(async () => {
          this.modalLoading = false;
          this.modalClosed();
          await this.customerService.getSelf();
        });
    } else if (this.modalType === 'restore') {
      this.modalLoading = true;

      this.auth
        .restoreProfile()
        .subscribe({
          next: (response: any) => {
            this.submitError = null;
            this.toast.success('Account riattivato con successo');
          },
          error: error => {
            this.toast.error("Si è verificato un errore durante l'operazione");
            this.submitError = "Si è verificato un errore durante l'operazione. Riprova più tardi.";
          },
        })
        .add(async () => {
          this.modalLoading = false;
          this.modalClosed();
          await this.customerService.getSelf();
        });
    } else if (this.modalType === 'update-password') {
      const data = {
        currentPassword: this.passwordForm.get('currentPassword')?.value,
        newPassword: this.passwordForm.get('newPassword')?.value,
      };

      if (this.passwordForm.valid) {
        this.modalLoading = true;

        this.auth
          .updateChangePassword(data)
          .subscribe({
            next: (response: any) => {
              this.toast.success('Password cambiata con successo!');

              this.isChangingPassword = false;
              this.passwordForm.reset();
            },
            error: error => {
              this.toast.error('Si è verificato un errore durante il cambiamento della password');
              this.submitError =
                'Si è verificato un errore durante il salvataggio. Riprova più tardi.';
              console.error('Profile save error:', error);
              this.isChangingPassword = false;
              this.passwordForm.reset();
            },
          })
          .add(async () => {
            this.modalLoading = false;
            this.modalClosed();
          });
      } else {
        this.passwordForm.markAllAsTouched();
      }
    } else if (this.modalType === 'update-profile') {
      this.modalLoading = true;

      const data = {
        firstName: this.profileForm.get('firstName')?.value,
        lastName: this.profileForm.get('lastName')?.value,
        phone: this.profileForm.get('phone')?.value,
        email: this.profileForm.get('email')?.value,
      };

      try {
        this.loading = true;
        this.submitError = null;
        await this.auth.updateUserProfile(data);
        this.toast.success('Utente modificato con successo!');
      } catch (error) {
        this.submitError = 'Si è verificato un errore durante il salvataggio. Riprova più tardi.';
        console.error('Profile save error:', error);
        this.toast.error('Si è verificato un errore durante la modifica del profilo');
      } finally {
        this.loading = false;
        this.modalLoading = false;
        this.modalClosed();
        await this.customerService.getSelf();
      }
    }
  }

  // Add to component class:
  isModifyingPayment = false;
  protected readonly faTiktok = faTiktok;
}
