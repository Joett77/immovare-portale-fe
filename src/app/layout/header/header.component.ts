import {
  Component,
  Output,
  EventEmitter,
  Input,
  effect,
  WritableSignal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

import { AuthService } from '../../public/services/auth.service';
import { Router } from '@angular/router';

import { UserMenuComponent } from '../../public/components/login/user-menu/user-menu.component';
import { LoginIconComponent } from '../../shared/atoms/icons/login-icon/login-icon.component';
import { ButtonComponent } from '../../shared/atoms/button/button.component';
import { environment_dev } from '../../environments/env.dev';
import { PropertyBuyService } from '../../public/services/property-buy.service';
import { Property } from '../../public/models';
import { PaymentService } from '../../public/service/payment.service';
import { PlanAndServiceService } from '../../public/services/plan-and-service.service';
import { ToastService } from '../../shared/services/toast.service';

const homeUrl = environment_dev.homeUrl;
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LogoComponent,
    UserMenuComponent,
    LoginIconComponent,
    ButtonComponent,
  ],
  templateUrl: './header.component.html',
  styles: [],
})
export class HeaderComponent {
  propertyBuyService = inject(PropertyBuyService);
  paymentService = inject(PaymentService);
  private _planService = inject(PlanAndServiceService);
  private toast = inject(ToastService);

  @Input() type: 'slim' | 'full' = 'full';
  @Output() loginModalStateChange = new EventEmitter<boolean>();
  isOpen = false;
  plans = this._planService.plansList$;

  menuItems = [
    { href: '/voglio-vendere', label: 'Voglio vendere' },
    { href: '/voglio-acquistare', label: 'Voglio acquistare' },
    { href: '/blog', label: 'Blog' },
    { href: '/guide', label: 'Le nostre guide' },
  ];

  userData: any;
  authenticated = false;
  isAdmin = false;

  constructor(
    public authService: AuthService, // Inietta AuthService
    private router: Router // Inietta Router
  ) {
    // Usa un effect per reagire ai cambiamenti del Signal
    effect(() => {
      this.userData = this.authService.getUserData();
      this.authService.isAuthenticated().then(authenticated => {
        this.authenticated = authenticated;
        // Check if user has ADMIN role
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

  openLoginModal() {
    this.authService.login();
  }
  logout() {
    this.authService.logout();
  }
  goToPage(item: { href: string }) {
    if (this.propertyBuyService.propertiesList.value.length > 0) {
      this.resetFilter();
    }
    this.router.navigate([item.href]);
  }
  async goToFreePublish() {
    //if not login go to login
    if (!this.authenticated) {
      this.authService.login({ redirectUri: homeUrl + '/property-publishing' });
      return;
    } else {
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
  }
  resetFilter() {
    this.propertyBuyService.resetFilterData();
    this.propertyBuyService
      .fetchPropertyList(this.propertyBuyService.getPropertyBuyData())
      .subscribe(
        response => {
          this.propertyBuyService.propertiesList.next(response.data);
        },
        error => {
          console.error('Error fetching properties:', error);
        }
      );
  }
}
