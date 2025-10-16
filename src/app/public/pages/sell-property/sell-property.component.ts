import { Component, inject } from '@angular/core';
import { HeroBlockComponent } from '../../../shared/organisms/hero-block/hero-block.component';
import { HowItWorksComponent } from '../../components/sell-property/how-it-works/how-it-works.component';
import { ChooseAPlanComponent } from '../../components/sell-property/choose-a-plan/choose-a-plan.component';
import { BannerCtaComponent } from '../../../shared/organisms/banner-cta/banner-cta.component';
import { FaqSellPropertyComponent } from '../../components/sell-property/faq-sell-property/faq-sell-property.component';
import { SavingsCalculatorComponent } from '../../components/sell-property/savings-calculator/savings-calculator.component';
import { FAQItem } from '../../models';
import { faqSellItems } from '../../mock/data';
import { Router } from '@angular/router';
@Component({
  selector: 'app-sell-property',
  standalone: true,
  imports: [
    HeroBlockComponent,
    HowItWorksComponent,
    ChooseAPlanComponent,
    BannerCtaComponent,
    FaqSellPropertyComponent,
    SavingsCalculatorComponent,
  ],
  templateUrl: './sell-property.component.html',
})
export class SellPropertyComponent {
  faqSellItems: FAQItem[] = faqSellItems;

  private router = inject(Router);

  goToValutazioneImmobile() {
    this.router.navigate(['/']);
  }
}
