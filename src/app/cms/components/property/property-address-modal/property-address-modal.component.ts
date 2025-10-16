// src/app/cms/components/property/property-address-modal/property-address-modal.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
  PLATFORM_ID,
  Inject,
  ViewChild,
  signal,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { LeafletMapLiteComponent } from '../../../../public/components/leaflet-map-lite/leaflet-map-lite.component';
import { LInputAutocompleteComponent } from '../../../../public/components/l-input-autocomplete/l-input-autocomplete.component';
import { AutocompleteServiceService } from '../../../../public/services/autocomplete-service.service';
import { AdvertisementDraft } from '../../../../public/models';
import { GeoFeature } from '../../../../public/models';

@Component({
  selector: 'app-property-address-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    LeafletMapLiteComponent,
    LInputAutocompleteComponent,
  ],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div class="p-4 border-b border-[#CBCCCD] ">
        <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h2 class="heading-md font-bold text-primary-dark">{{ title }}</h2>
          <button
            (click)="onClose()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form [formGroup]="addressForm">
          <h3 class="heading-sm text-primary-dark font-semibold mb-6">{{ subtitle }}</h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Left column with form inputs -->
            <div>
              <!-- Street with Autocomplete -->
              <div class="mb-4">
                <app-l-input-autocomplete
                  #autocompleteComponent
                  [initialValue]="addressForm.get('address')?.value || ''"
                ></app-l-input-autocomplete>
              </div>

              <!-- Street Number and ZIP Code -->
              <div class="grid grid-cols-2 gap-4 mb-4">
                <app-input
                  [label]="'Numero civico'"
                  [control]="getControl('houseNumber')"
                  type="text"
                ></app-input>

                <app-input
                  [label]="'CAP'"
                  [control]="getControl('zipCode')"
                  type="text"
                ></app-input>
              </div>

              <!-- City -->
              <div class="mb-4">
                <app-input
                  [label]="'Città'"
                  [control]="getControl('city')"
                  type="text"
                ></app-input>
              </div>

              <!-- Country -->
              <div class="mb-8">
                <app-input
                  [label]="'Paese'"
                  [control]="getControl('country')"
                  type="text"
                ></app-input>
              </div>

              <div class="mt-2">
                <app-button
                  [type]="'primary'"
                  [text]="'Conferma modifiche'"
                  [size]="'md'"
                  (buttonClick)="saveChanges()"
                ></app-button>
              </div>
            </div>

            <!-- Right column with map -->
            <div>
              <div class="h-64 bg-gray-100 rounded">
                <app-leaflet-map-lite
                  *ngIf="isBrowser"
                  [height]="'100%'"
                  [latitude]="currentLocation.lat"
                  [longitude]="currentLocation.lng"
                ></app-leaflet-map-lite>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PropertyAddressModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() title = 'Modifica informazioni annuncio';
  @Input() subtitle = "Indirizzo dell'abitazione";
  @Input() initialAddress: Partial<AdvertisementDraft> | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  @ViewChild('autocompleteComponent') autocompleteComponent!: LInputAutocompleteComponent;

  private autocompleteService = inject(AutocompleteServiceService);

  // State
  place = signal<google.maps.places.PlaceResult | undefined>(undefined);
  geoFeature = signal<GeoFeature | undefined>(undefined);

  addressForm = new FormGroup({
    title: new FormControl(''),
    address: new FormControl('', [Validators.required]),
    houseNumber: new FormControl('', [Validators.required]),
    zipCode: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    country: new FormControl('Italia', [Validators.required]),
    latitude: new FormControl(45.0703, []),
    longitude: new FormControl(7.6869, []),
  });

  currentLocation = {
    lat: 45.0703, // Turin coordinates
    lng: 7.6869,
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Handle place selection from autocomplete
    effect(() => {
      //const selectedPlace = this.autocompleteService.getPlace()();
      //if (selectedPlace) {
      //  this.updateLocationFromPlace(selectedPlace);
      //}
    });

    // Handle geolocation feature selection
    effect(() => {
      const feature = this.autocompleteService.getGeoFeature()();
      if (feature) {
        this.updateLocationFromGeoFeature(feature);
      }
    });
  }

  ngOnInit(): void {
    if (this.initialAddress) {
      this.addressForm.patchValue({
        address: this.initialAddress.address || '',
        houseNumber: this.initialAddress.houseNumber || '',
        zipCode: this.initialAddress.zipCode || '',
        city: this.initialAddress.city || '',
        country: this.initialAddress.country || 'Italia',
        latitude: this.initialAddress.latitude || 45.0703,
        longitude: this.initialAddress.longitude || 7.6869,
      });

      if (this.initialAddress.latitude && this.initialAddress.longitude) {
        this.currentLocation = {
          lat: this.initialAddress.latitude,
          lng: this.initialAddress.longitude,
        };
      }
    }
  }

  ngAfterViewInit() {
    // If we have address data and autocomplete component is available, set the search control
    setTimeout(() => {
      if (this.autocompleteComponent && this.initialAddress) {
        const addressParts = [];
        if (this.initialAddress.address) addressParts.push(this.initialAddress.address);
        if (this.initialAddress.houseNumber) addressParts.push(this.initialAddress.houseNumber);
        if (this.initialAddress.zipCode) addressParts.push(this.initialAddress.zipCode);
        if (this.initialAddress.city) addressParts.push(this.initialAddress.city);

        const fullAddress = addressParts.join(', ');
        if (fullAddress) {
          this.autocompleteComponent.searchControl.setValue(fullAddress);
        }
      }
    }, 0);
  }

  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getControl(name: string): FormControl {
    return this.addressForm.get(name) as FormControl;
  }

  onClose(): void {
    // When the modal closes, re-enable scrolling on the body
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('overflow-hidden');
    }
    this.close.emit();
  }

  saveChanges(): void {
    if (this.addressForm.valid) {
      const formData = {
        ...this.addressForm.value,
        latitude: this.currentLocation.lat,
        longitude: this.currentLocation.lng,
      };

      // Create title in the format city: address houseNumber
      const city = formData.city || '';
      const address = formData.address || '';
      const houseNumber = formData.houseNumber || '';

      // Format the title in the required format
      const title = `${city}: ${address} ${houseNumber}`.trim();

      // Include the title in the form data
      formData.title = title;

      this.save.emit(formData);
      this.close.emit();
    } else {
      // Mark all fields as touched to display validation errors
      Object.keys(this.addressForm.controls).forEach(key => {
        this.addressForm.get(key)?.markAsTouched();
      });
    }
  }

  // Update location from Google Places result
  private updateLocationFromPlace(place: google.maps.places.PlaceResult) {
    if (!place.geometry?.location) return;

    const location = place.geometry.location;
    const lat = typeof location.lat === 'function' ? location.lat() : location.lat;
    const lng = typeof location.lng === 'function' ? location.lng() : location.lng;

    if (typeof lat === 'number' && typeof lng === 'number') {
      // Update the map location
      this.currentLocation = { lat, lng };

      // Update the form with the new coordinates
      this.addressForm.patchValue({
        latitude: lat,
        longitude: lng,
      });

      // Update address components in form
      this.updateAddressComponentsFromPlace(place);
    }
  }

  // Update location from GeoFeature
  private updateLocationFromGeoFeature(feature: GeoFeature) {
    const addr = feature.properties.address;

    // Get coordinates
    const [lng, lat] = feature.geometry.coordinates;

    // Update form with address details and coordinates
    this.addressForm.patchValue({
      address: addr?.road || '',
      houseNumber: addr?.house_number || '',
      zipCode: addr?.postcode || '',
      city: addr?.city || addr?.town || addr?.village || '',
      country: addr?.country || 'Italia',
      latitude: lat,
      longitude: lng,
    });

    // Update map location
    this.currentLocation = { lat, lng };
  }

  // Update address form fields from place data
  private updateAddressComponentsFromPlace(place: google.maps.places.PlaceResult) {
    if (!place.address_components) return;

    // Extract address components
    const streetNumber =
      place.address_components.find(c => c.types.includes('street_number'))?.long_name || '';

    const route = place.address_components.find(c => c.types.includes('route'))?.long_name || '';

    const postalCode =
      place.address_components.find(c => c.types.includes('postal_code'))?.long_name || '';

    const city = place.address_components.find(c => c.types.includes('locality'))?.long_name || '';

    const country =
      place.address_components.find(c => c.types.includes('country'))?.long_name || 'Italia';

    // Update form
    this.addressForm.patchValue({
      address: route,
      houseNumber: streetNumber,
      zipCode: postalCode,
      city: city,
      country: country,
    });
  }
}
