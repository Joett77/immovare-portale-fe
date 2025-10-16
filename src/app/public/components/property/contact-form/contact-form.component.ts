import { Component, effect, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [InputComponent, ButtonComponent, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent {
  @Output() updatedForm = new EventEmitter<any>();
  keycloakService = inject(KeycloakService);
  isLoggedIn = false;

  protected contactForm = new FormGroup({
    name: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    lastname: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl<string | null>(null, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\d{6,15}$/)],
    }),
    countryCode: new FormControl('+39', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(public authService: AuthService) {
    this.isLoggedIn = this.keycloakService.isLoggedIn();

    this.contactForm.valueChanges.subscribe(() => {
      this.updatedForm.emit(this.contactForm);
    });

    effect(() => {
      this.authService.isAuthenticated().then(authenticated => {
        if (authenticated) {
          const loggedUser = this.authService.getUserData();

          this.contactForm.controls.name.setValue(loggedUser.firstName);
          this.contactForm.controls.lastname.setValue(loggedUser.lastName);
          this.contactForm.controls.email.setValue(loggedUser.email);
          this.contactForm.controls.phone.setValue(loggedUser.attributes?.phone?.[0]);
        }
      });
    });
  }

  gotoLogin() {
    this.authService.login();
  }

  selectedCountry: string = '+39';

  countries = [
    {
      code: '+39',
      name: 'Italy',
      flag: 'bg-[linear-gradient(to_right,#008C45_33%,#F4F9FF_33%_66%,#CD212A_66%)]',
    },
  ];
}
