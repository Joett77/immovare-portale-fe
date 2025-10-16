import { Component } from '@angular/core';
import { RegistrationFormComponent } from '../../components/login/registration-form/registration-form.component';
import { BannerLoginComponent } from '../../components/login/banner-login/banner-login.component';
import { AuthModalService } from '../../services/auth-modal.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RegistrationFormComponent, BannerLoginComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  protected fromEvaluation: boolean = false;
  protected redirectUrl: null | string = null;
  protected step: null | string = null;

  constructor(private authService: AuthService, private route: ActivatedRoute) {
    if (this.route.snapshot.queryParams['fromEvaluation']) {
      this.fromEvaluation = true;
    }
    if (this.route.snapshot.queryParams['redirectUrl']) {
      this.redirectUrl = this.route.snapshot.queryParams['redirectUrl'];
    }
    if (this.route.snapshot.queryParams['step']) {
      this.step = this.route.snapshot.queryParams['step'];
    }
  }

  openLoginModal() {
    console.log('Opening login modal');
    this.authService.login();
  }
}
