import { Component, Input, effect } from '@angular/core';
import { LogoComponent } from '../logo/logo.component';
import { NewsletterComponent } from '../../shared/molecules/newsletter/newsletter.component';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../public/services/auth.service';
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [LogoComponent, RouterModule, NewsletterComponent, CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(
    public authService: AuthService, // Inietta AuthService
    private router: Router // Inietta Router
  ) {
    // Usa un effect per reagire ai cambiamenti del Signal
    effect(() => {
      this.authService.isAuthenticated().then(authenticated => {
        this.authenticated = authenticated;
      });
    });
  }
  authenticated = false;
  @Input() type: 'slim' | 'full' = 'full';
}
