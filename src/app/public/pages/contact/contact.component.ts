import { Component, inject } from '@angular/core';
import { HeroBlockComponent } from '../../../shared/organisms/hero-block/hero-block.component';
import { BannerCtaComponent } from '../../../shared/organisms/banner-cta/banner-cta.component';
import { FaqSellPropertyComponent } from '../../components/sell-property/faq-sell-property/faq-sell-property.component';
import { RequestInfoComponent } from '../../components/property/request-info/request-info.component';
import { AssistanceIconComponent } from '../../../shared/atoms/icons/assistance-icon/assistance-icon.component';
import { TelephoneIconComponent } from '../../../shared/atoms/icons/telephone-icon/telephone-icon.component';
import { MailIconComponent } from '../../../shared/atoms/icons/mail-icon/mail-icon.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-consult',
  standalone: true,
  imports: [
    HeroBlockComponent,
    BannerCtaComponent,
    FaqSellPropertyComponent,
    RequestInfoComponent,
    AssistanceIconComponent,
    TelephoneIconComponent,
    MailIconComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  isUserLoggedIn: boolean = false;
  private router = inject(Router);

  goToVoglioVendere() {
    this.router.navigate(['/voglio-vendere']);
  }
}
