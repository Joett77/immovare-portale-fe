import { Component, inject, WritableSignal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StepperHpBlockComponent } from '../../../shared/organisms/stepper-hp-block/stepper-hp-block.component';
import { PricingHpBlockComponent } from '../../../shared/organisms/pricing-hp-block/pricing-hp-block.component';
import { BannerCtaComponent } from '../../../shared/organisms/banner-cta/banner-cta.component';
import { ImageRightBlockComponent } from '../../../shared/organisms/image-right-block/image-right-block.component';
import { AlreadyImmovatedBlockComponent } from '../../../shared/organisms/already-immovated-block/already-immovated-block.component';
import { TalkAboutUsHpBlockComponent } from '../../../shared/organisms/talk-about-us-hp-block/talk-about-us-hp-block.component';
import { NewsHpBlockComponent } from '../../../shared/organisms/news-hp-block/news-hp-block.component';
import { HeroBlockComponent } from '../../../shared/organisms/hero-block/hero-block.component';
import { SavedSearchesService } from '../../services/saved-searches.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  standalone: true,
  imports: [
    RouterModule,
    StepperHpBlockComponent,
    PricingHpBlockComponent,
    BannerCtaComponent,
    ImageRightBlockComponent,
    AlreadyImmovatedBlockComponent,
    TalkAboutUsHpBlockComponent,
    NewsHpBlockComponent,
    HeroBlockComponent,
  ],
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  savedSearchesService = inject(SavedSearchesService);
  private router = inject(Router);
  activeTab: WritableSignal<string> = this.savedSearchesService.activeTab;

  goToPropertyEvaluation() {
    this.router.navigate(['/property-evaluation']);
  }
  goToVoglioVendere() {
    this.router.navigate(['/voglio-vendere']);
  }
  goToNews() {
    this.router.navigate(['/news']);
  }
  goToGuide() {
    this.router.navigate(['/guide']);
  }
  goToFavoritePropertiesPage() {
    this.activeTab.set('favorite-realestate');
    this.router.navigate(['/immobili-preferiti']);
  }
}
