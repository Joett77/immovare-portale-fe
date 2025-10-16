import { Component, effect, inject, input, WritableSignal } from '@angular/core';
import { HeroBlockComponent } from '../../../shared/organisms/hero-block/hero-block.component';
import { FormControl, FormGroup } from '@angular/forms';
import {
  faqBuyItems,
  notLoggedFavoriteProperties,
  notLoggedSavedSearches,
  propertyDestinations,
} from '../../mock/data';
import { SelectOption } from '../../../shared/molecules/select/select.component';
import { CitySelectionCardComponent } from '../../../shared/organisms/city-selection-card/city-selection-card.component';
import { AlreadyImmovatedBlockComponent } from '../../../shared/organisms/already-immovated-block/already-immovated-block.component';
import { FaqSellPropertyComponent } from '../../components/sell-property/faq-sell-property/faq-sell-property.component';
import { StepperBlockComponent } from '../../../shared/organisms/stepper-block/stepper-block.component';
import { SavedSearchesPreviewComponent } from '../../../shared/organisms/saved-search-preview/saved-searches-preview.component';
import { Router } from '@angular/router';
import { NotLoggedCardComponent } from '../../../shared/organisms/not-logged-card/not-logged-card.component';
import { DrawMapModalComponent } from '../../components/draw-map-modal/draw-map-modal.component';
import { AutocompleteServiceService } from '../../services/autocomplete-service.service';
import { SavedSearchesService } from '../../services/saved-searches.service';
import { environment_dev } from '../../../environments/env.dev';
import { AuthService } from '../../services/auth.service';

const homeUrl = environment_dev.homeUrl;
@Component({
  selector: 'app-property-buy',
  standalone: true,
  imports: [
    HeroBlockComponent,
    CitySelectionCardComponent,
    AlreadyImmovatedBlockComponent,
    FaqSellPropertyComponent,
    StepperBlockComponent,
    SavedSearchesPreviewComponent,
    NotLoggedCardComponent,
    DrawMapModalComponent,
  ],
  templateUrl: './property-buy.component.html',
})
export class PropertyBuyComponent {
  savedSearchesService = inject(SavedSearchesService);
  private router = inject(Router);
  private autocompleteService = inject(AutocompleteServiceService);
  activeTab: WritableSignal<string> = this.savedSearchesService.activeTab;
  isDrawMapModalOpen: WritableSignal<boolean> = this.autocompleteService.isDrawMapModalOpen;
  notLoggedSavedSearches = notLoggedSavedSearches;
  notLoggedFavoriteProperties = notLoggedFavoriteProperties;
  notLoggedSavedSearchesImg = 'assets/not-logged-saved-searches.png';
  notLoggedFavoritePropertiesImg = 'assets/not-logged-favourite-properties.png';
  faqBuyItems = faqBuyItems;
  authenticated = false;
  propertyBuyForm = new FormGroup({
    type: new FormControl<string | null>(''),
  });
  selectOptions: SelectOption[] = propertyDestinations.map(type => {
    return { label: type.label, value: type.label };
  });

  goToFreePublish() {
    console.log('goToFreePublish');
    //if not login go to login
    if (!this.authenticated) {
      this.authService.login({ redirectUri: homeUrl + '/property-publishing' });
      return;
    } else {
      this.router.navigate(['/property-publishing']);
    }
  }

  constructor(
    public authService: AuthService // Inietta AuthService
  ) {
    effect(() => {
      if (this.autocompleteService.isDrawMapModalOpen()) {
        console.log(
          'isDrawMapModalOpen Property Buy',
          this.autocompleteService.isDrawMapModalOpen()
        );
      }
      this.authService.isAuthenticated().then(authenticated => {
        this.authenticated = authenticated;
      });
    });
  }

  get propertyTypeControl(): FormControl {
    return this.propertyBuyForm.get('type') as FormControl;
  }
  goToFavoritePropertiesPage() {
    this.activeTab.set('favorite-realestate');
    this.router.navigate(['/immobili-preferiti']);
  }
  gotToSign() {
    console.log('Go to Sign');
  }

  closeDrawMapModal() {
    this.autocompleteService.isDrawMapModalOpen.set(false);
    console.log('Close draw map modal', this.autocompleteService.isDrawMapModalOpen());
  }
}
