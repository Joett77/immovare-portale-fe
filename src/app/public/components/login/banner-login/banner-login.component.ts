import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-banner-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner-login.component.html',
})
export class BannerLoginComponent {
  @Output() openLoginModal = new EventEmitter<void>();

  onLoginClick() {
    this.openLoginModal.emit();
  }
}
