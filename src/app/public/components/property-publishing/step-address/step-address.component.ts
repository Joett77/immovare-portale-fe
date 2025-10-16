// step-address.component.ts
import {
  Component,
  effect,
  inject,
  input,
  Signal,
  PLATFORM_ID,
  Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { AutocompleteServiceService } from '../../../services/autocomplete-service.service';
import { PropertyEvaluationService } from '../../../services/property-evaluation.service';
import { CommonModule } from '@angular/common';
import { GeoFeature } from '../../../models';
import { LeafletMapLiteComponent } from '../../leaflet-map-lite/leaflet-map-lite.component';
import { isPlatformBrowser } from '@angular/common';
import { LInputAutocompleteComponent } from '../../l-input-autocomplete/l-input-autocomplete.component';
import { PropertyPublishingService } from '../../../services/property-publishing.service';

export interface AddressFormData {
  street: string;
  street_number: string;
  zip_code: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

@Component({
  selector: 'app-step-address',
  standalone: true,
  imports: [
    InputComponent,
    ReactiveFormsModule,
    CommonModule,
    LeafletMapLiteComponent,
    LInputAutocompleteComponent,
  ],
  templateUrl: './step-address.component.html',
})
export class StepAddressComponent implements OnInit {
  // ViewChild to access the autocomplete component
  @ViewChild(LInputAutocompleteComponent) autocompleteComponent!: LInputAutocompleteComponent;

  // Services
  private autocompleteService = inject(AutocompleteServiceService);
  private propertyPublishingService = inject(PropertyPublishingService);

  // Inputs
  title = input<string>('Titolo');
  description = input<string>("Indirizzo dell'abitazione");
  formData = input<AddressFormData | null>(null);

  // State
  geoFeature: Signal<GeoFeature | undefined> = this.autocompleteService.getGeoFeature();

  // Default map location
  currentLocation = {
    lat: 45.4642,
    lng: 9.19,
  };

  // Form
  propertyAddressForm = new FormGroup({
    street: new FormControl('', [Validators.required]),
    street_number: new FormControl(''),
    zip_code: new FormControl(''),
    city: new FormControl(''),
    country: new FormControl('Italia'),
    latitude: new FormControl(45.4642),
    longitude: new FormControl(9.19),
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Handle place selection from autocomplete
    effect(() => {
      //const selectedPlace = this.place();
      //if (selectedPlace) {
      //  this.updateLocationFromPlace(selectedPlace);
      //}
    });

    // Handle geolocation feature selection
    effect(() => {
      const feature = this.geoFeature();
      if (feature) {
        this.updateLocationFromGeoFeature(feature);
      }
    });

    // Handle form data updates from parent
    effect(() => {
      const data = this.formData();
      if (data) {
        this.populateFormFromData(data);
      }
    });

    // Update PropertyEvaluationService when form changes
    this.propertyAddressForm.valueChanges.subscribe(formValue => {
      if (formValue) {
        // this.propertyPublishingService.updateStepData('address', formValue);
      }
    });
  }

  ngOnInit() {
    // Initialize with data if available
    if (this.formData()) {
      this.populateFormFromData(this.formData()!);
    }
  }

  ngAfterViewInit() {
    // If we have data and autocomplete component is available,
    // set the search control with the full address
    setTimeout(() => {
      if (this.autocompleteComponent && this.formData()) {
        const data = this.formData()!;
        const addressParts = [];

        if (data.street) addressParts.push(data.street);
        if (data.street_number) addressParts.push(data.street_number);
        if (data.zip_code) addressParts.push(data.zip_code);
        if (data.city) addressParts.push(data.city);

        const fullAddress = addressParts.join(', ');

        if (fullAddress) {
          this.autocompleteComponent.searchControl.setValue(fullAddress);
        }
      }
    }, 0);
  }

  // Map rendering helper
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  // Form control accessor helper
  getControl(name: string): FormControl {
    return this.propertyAddressForm.get(name) as FormControl;
  }

  // Populate form with data from parent
  public populateFormFromData(data: AddressFormData) {
    // Update all form fields
    this.propertyAddressForm.patchValue({
      street: data.street || '',
      street_number: data.street_number || '',
      zip_code: data.zip_code || '',
      city: data.city || '',
      country: data.country || 'Italia',
      latitude: data.latitude || 45.4642,
      longitude: data.longitude || 9.19,
    });

    // Update currentLocation for the map component
    if (data.latitude && data.longitude) {
      this.currentLocation = {
        lat: data.latitude,
        lng: data.longitude,
      };
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
      this.propertyAddressForm.patchValue({
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
    this.propertyAddressForm.patchValue({
      street: addr?.road || '',
      street_number: addr?.house_number || '',
      zip_code: addr?.postcode || '',
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
    this.propertyAddressForm.patchValue({
      street: route,
      street_number: streetNumber,
      zip_code: postalCode,
      city: city,
      country: country,
    });
  }
}
