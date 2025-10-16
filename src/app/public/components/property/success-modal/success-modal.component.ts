import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';

@Component({
  selector: 'app-success-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './success-modal.component.html',
})
export class SuccessModalComponent {
  @Input() isOpen = false;
  @Input() isLogged = false;
  @Output() onClose = new EventEmitter<void>();
  private router = inject(Router);

  handleSignup() {
    this.router.navigate(['/register']);
    console.log('Signup clicked');
  }
}
