import { Component, inject, ElementRef, Input, HostListener } from '@angular/core';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from '@angular/forms';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Country, RequestInfoForm } from './request-info.types';
import { environment_dev } from '../../../../environments/env.dev';
import { KeycloakService } from 'keycloak-angular';
import { ToastService } from '../../../../shared/services/toast.service';
import { AuthService } from '../../../../public/services/auth.service';

type RequestInfoFormControls = {
  [K in keyof RequestInfoForm]: FormControl<RequestInfoForm[K]>;
};

const apiUrl = environment_dev.apiUrl;

@Component({
  selector: 'app-request-info',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './request-info.component.html',
})
export class RequestInfoComponent {
  @Input() hasLogginBlock: boolean = true; // Set to true to show the login bar
  @Input() title: string = '';
  @Input() propertyId: any = null;
  keycloakService = inject(KeycloakService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private authService = inject(AuthService);

  protected isCountryDropdownOpen = false;
  protected selectedCountry: Country;

  protected countries: Country[] = [
    {
      code: '+39',
      name: 'Italia',
      flag: 'bg-[linear-gradient(to_right,#008C45_33%,#F4F9FF_33%_66%,#CD212A_66%)]',
    },
    {
      code: '+44',
      name: 'Regno Unito',
      flag: 'bg-[linear-gradient(to_right,#012169_50%,#C8102E_50%)]',
    },
    {
      code: '+1',
      name: 'Stati Uniti',
      flag: 'bg-[linear-gradient(to_right,#B22234_33%,#FFFFFF_33%_66%,#3C3B6E_66%)]',
    },
    {
      code: '+33',
      name: 'Francia',
      flag: 'bg-[linear-gradient(to_right,#0055A4_33%,#FFFFFF_33%_66%,#EF4135_66%)]',
    },
    {
      code: '+49',
      name: 'Germania',
      flag: 'bg-[linear-gradient(to_bottom,#000000_33%,#DD0000_33%_66%,#FFCE00_66%)]',
    },
    {
      code: '+34',
      name: 'Spagna',
      flag: 'bg-[linear-gradient(to_bottom,#AA151B_25%,#F1BF00_25%_75%,#AA151B_75%)]',
    },
  ];

  protected isLoggedIn = false;
  protected loading = false;
  protected submitError: string | null = null;

  protected contactForm: FormGroup<RequestInfoFormControls>;

  private elementRef = inject(ElementRef);

  scrollIntoView() {
    this.elementRef.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  constructor() {
    this.isLoggedIn = this.keycloakService.isLoggedIn();

    this.selectedCountry = this.countries[0]; //

    this.contactForm = this.fb.group<RequestInfoFormControls>({
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      lastname: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      phone: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/^\d{6,15}$/)],
      }),
      countryCode: new FormControl('+39', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      message: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(10)],
      }),
      privacyConsent: new FormControl(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
      title: new FormControl(this.title, { nonNullable: true }),
      propertyId: new FormControl(this.propertyId, { nonNullable: false }),
    });
  }

  protected async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    try {
      this.loading = true;
      this.submitError = null;

      const formData: RequestInfoForm = {
        ...(this.contactForm.value as RequestInfoForm),
        title: this.title,
        propertyId: this.propertyId,
      };

      // Replace with your actual API endpoint
      await this.http.post(apiUrl + '/api/contacts', formData).toPromise();

      this.toast.success('Richiesta inviata con successo.');

      this.contactForm.reset({
        countryCode: '+39',
      });

      // You might want to show a success message or redirect
    } catch (error) {
      this.submitError = "Si è verificato un errore durante l'invio. Riprova più tardi.";
      console.error('Form submission error:', error);
    } finally {
      this.loading = false;
    }
  }

  // Method to toggle dropdown visibility
  protected toggleCountryDropdown(): void {
    this.isCountryDropdownOpen = !this.isCountryDropdownOpen;
  }

  // Method to select a country
  protected selectCountry(country: Country): void {
    this.selectedCountry = country;
    this.contactForm.patchValue({ countryCode: country.code });
    this.isCountryDropdownOpen = false;
  }

  // TrackBy function for performance
  protected trackByCountry(index: number, country: Country): string {
    return country.code;
  }

  // Close dropdown when clicking outside (add to constructor or ngOnInit)
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const dropdown = target.closest('.relative');

    if (!dropdown && this.isCountryDropdownOpen) {
      this.isCountryDropdownOpen = false;
    }
  }

  gotoLogin() {
    this.authService.login();
  }

  protected getControl(name: keyof RequestInfoForm): FormControl<RequestInfoForm[typeof name]> {
    const control = this.contactForm.get(name);
    if (!control) {
      throw new Error(`Control ${name} not found in form`);
    }
    return control as FormControl<RequestInfoForm[typeof name]>;
  }

  protected hasError(controlName: keyof RequestInfoForm, errorType: string): boolean {
    const control = this.getControl(controlName);
    return control?.touched === true && control?.hasError(errorType) === true;
  }
}
