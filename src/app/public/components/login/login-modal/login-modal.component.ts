import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';

import { AuthModalService } from '../../../services/auth-modal.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, InputComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() openRegistration = new EventEmitter<void>();

  loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private authService: AuthService,
    public modalService: AuthModalService
  ) {}

  ngOnInit(): void {}

  onOpenRegistration() {
    this.modalService.openModal('register');
  }

  closeModal() {
    this.loginForm.reset(); // Reset form
    this.onClose.emit();
  }

  getControl(name: string) {
    return this.loginForm.get(name) as FormControl;
  }

  async onSubmit() {}
}
