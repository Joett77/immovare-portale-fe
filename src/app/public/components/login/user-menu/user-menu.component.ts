// user-menu.component.ts
import { Component, ElementRef, HostListener, effect, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UserCircleIconComponent } from '../../../../shared/atoms/icons/user-circle-icon/user-circle-icon.component';
import { LogoutIconComponent } from '../../../../shared/atoms/icons/logout-icon/logout-icon.component';
import { ListIconComponent } from '../../../../shared/atoms/icons/list-icon/list-icon.component';
import { QuestionCircleIconComponent } from '../../../../shared/atoms/icons/question-circle-icon/question-circle-icon.component';
import { MessageLinesIconComponent } from '../../../../shared/atoms/icons/message-lines-icon/message-lines-icon.component';
import { UserIconComponent } from '../../../../shared/atoms/icons/user-icon/user-icon.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { HeartIconComponent } from '../../../../shared/atoms/icons/heart-icon/heart-icon.component';
import { MagnifyingGlassLocationIconComponent } from '../../../../shared/atoms/icons/magnifying-glass-location-icon/magnifying-glass-location-icon.component';
import { KeycloakService } from 'keycloak-angular';
import { TicketNotificationService } from '../../../services/ticket-notification.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { PaymentService } from '../../../service/payment.service';
import { PlanAndServiceService } from '../../../services/plan-and-service.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserCircleIconComponent,
    LogoutIconComponent,
    ListIconComponent,
    QuestionCircleIconComponent,
    MessageLinesIconComponent,
    UserIconComponent,
    PlusIconComponent,
    HeartIconComponent,
    MagnifyingGlassLocationIconComponent,
    FaIconComponent,
  ],
  templateUrl: './user-menu.component.html',
})
export class UserMenuComponent {
  isOpen = false;
  userData: any;
  authenticated = false;
  isAdmin = false;
  protected unreadTicketList: string[] = [];
  private ticketNotificationService = inject(TicketNotificationService);
  paymentService = inject(PaymentService);
  private _planService = inject(PlanAndServiceService);
  private toast = inject(ToastService);

  plans = this._planService.plansList$;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  private ticketEffect = effect(() => {
    this.unreadTicketList = this.ticketNotificationService.ticketsUnread$();
  });

  constructor(
    private _elementRef: ElementRef,
    private router: Router,
    private authService: AuthService
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isOpen = false;
      }
    });
    effect(() => {
      this.userData = this.authService.getUserData();
      this.authService.isAuthenticated().then(authenticated => {
        this.authenticated = authenticated;
        if (authenticated) {
          this.isAdmin =
            this.authService.hasRole('ADMIN') ||
            this.authService.hasRole('AGENT') ||
            this.authService.hasRole('OPERATOR');
        }
      });
    });
  }

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  goToCms() {
    this.router.navigate(['/cms']);
  }

  async goToFreePublish() {
    // Load plans
    if (this.plans().length === 0) {
      await this._planService.getPlan({ status: 'active' });
    }
    const freePlan = this.plans().find(p => p.free);
    if (freePlan) {
      this.paymentService.settings.set({
        planId: freePlan.id!,
      });
      this.router.navigate(['/property-publishing']);
    } else {
      this.toast.error('Nessun piano gratuito impostato');
    }
  }

  async logout() {
    await this.authService.logout();
    this.isOpen = false;
  }

  protected readonly faBell = faBell;
}
