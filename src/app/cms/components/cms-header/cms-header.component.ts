// /src/app/cms/components/cms-header/cms-header.component.ts
import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../public/services/auth.service';
import { faUserCircle, faUser, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-cms-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './cms-header.component.html',
})
export class CmsHeaderComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  faUserCircle = faUserCircle;
  faUser = faUser;
  faSignOutAlt = faSignOutAlt;

  currentSection: string = '';
  userName: string = '';
  isUserMenuOpen: boolean = false;

  constructor() {
    // Subscribe to route changes to update header title
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateCurrentSection();
    });

    // Initialize on component creation
    this.updateCurrentSection();
    this.loadUserData();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // Implement this more safely to avoid interference with the toggle function
    if (this.isUserMenuOpen) {
      const target = event.target as HTMLElement;
      const isMenuClick = target.closest('.user-menu-dropdown');
      const isButtonClick =
        target.closest('button') &&
        target.closest('button')?.contains(target) &&
        target.closest('.user-menu');

      if (!isMenuClick && !isButtonClick) {
        this.isUserMenuOpen = false;
      }
    }
  }

  toggleUserMenu(event: MouseEvent): void {
    // Stop propagation to prevent the document click handler from immediately closing the menu
    event.stopPropagation();
    this.isUserMenuOpen = !this.isUserMenuOpen;
    console.log('Menu toggled:', this.isUserMenuOpen);
  }

  private updateCurrentSection(): void {
    const path = this.router.url;

    if (path.includes('/cms/dashboard')) {
      this.currentSection = 'Dashboard';
    } else if (path.includes('/cms/blog')) {
      this.currentSection = 'Gestione blog';
    } else if (path.includes('/cms/annunci')) {
      this.currentSection = 'Gestione annunci';
    } else if (path.includes('/cms/gestione-library')) {
      this.currentSection = 'Gestione library';
    } else if (path.includes('/cms/iscrizioni-abbonamenti')) {
      this.currentSection = 'Iscrizioni e abbonamenti';
    } else if (path.includes('/cms/analytics')) {
      this.currentSection = 'Analytics';
    } else {
      this.currentSection = 'CMS';
    }
  }

  private loadUserData(): void {
    const userData = this.authService.getUserData();
    if (userData) {
      this.userName = userData.firstName || userData.username || 'Utente';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
