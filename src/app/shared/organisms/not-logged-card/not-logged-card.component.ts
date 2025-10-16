import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, input } from '@angular/core';
import { NotLoggedSection } from '../../../public/models';
import { CheckIconComponent } from '../../atoms/icons/check-icon/check-icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../public/services/auth.service';

@Component({
  selector: 'app-not-logged-card',
  standalone: true,
  imports: [CheckIconComponent, ButtonComponent],
  templateUrl: './not-logged-card.component.html',
})
export class NotLoggedCardComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  constructor(private responsive: BreakpointObserver) {}
  titleCard = input<string>('');
  imgUrl = input<string>('');
  sectionObj = input<NotLoggedSection>({
    titleSection: 'TitoloSeztione',
    emptySubTitle: 'Qui troverai le ricerche che hai salvato.',
    bulletPoints: ['Punto 1', 'Punto 2', 'Punto 3'],
    button: true,
  });
  isMobile: boolean = false;

  ngOnInit() {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
        console.log('screens matches Mobile', this.isMobile);
      }
    });
  }

  gotToSign() {
    console.log('Opening login modal');
    this.authService.login();
  }
}
