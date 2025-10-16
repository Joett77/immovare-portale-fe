import { Component, inject, Input, input, Signal, ViewChild } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { Router } from '@angular/router';
import { AutocompleteServiceService } from '../../services/autocomplete-service.service';
import * as placeMockData from '../../mock/autocomplete.json';
import { InputComponent } from '../../../shared/molecules/input/input.component';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-input-autocomplete',
  standalone: true,
  imports: [GoogleMapsModule, ButtonComponent, InputComponent],
  templateUrl: './input-autocomplete.component.html',
})
export class InputAutocompleteComponent {
  @Input() isPropertyBuy: boolean = false;
  label = input<string>('');
  btnText = input<string>('Valuta');
  isFilterBar = input<boolean>(false);
  service = inject(AutocompleteServiceService);
  //place: Signal<google.maps.places.PlaceResult | undefined> = this.service.getPlace();
  placeMock: any = placeMockData;

  @ViewChild('inputAutocomplete') inputAutocomplete!: InputComponent;

  private router = inject(Router);
  autocomplete: google.maps.places.Autocomplete | undefined;

  goToPage() {
    !this.isPropertyBuy
      ? this.router.navigate(['/property-evaluation'])
      : this.router.navigate(['/favorite-properties']);
  }

  searchControl = new FormControl('', []);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    const inputElement = this.inputAutocomplete.inputElement.nativeElement;

    // Check if running in a browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.autocomplete = new google.maps.places.Autocomplete(inputElement);

      this.autocomplete.addListener('place_changed', () => {
        const place = this.autocomplete?.getPlace();

        if (place) {
          //this.service.setPlace(place);
        }
      });
    } else {
      console.warn('Google Maps API is not available in this environment.');
    }
  }
}
