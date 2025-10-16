// l-input-autocomplete.component.ts with Google Maps and fixed autocomplete reopening
import {
  Component,
  Inject,
  inject,
  input,
  ViewChild,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  Input,
  ElementRef,
  NgZone,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, fromEvent, Subject, takeUntil } from 'rxjs';
import { GoogleMapsModule } from '@angular/google-maps';
import { InputComponent } from '../../../shared/molecules/input/input.component';
import { GeoFeature } from '../../models';
import { AutocompleteServiceService } from '../../services/autocomplete-service.service';

interface GooglePlaceResult {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
  terms?: Array<{ offset: number; value: string }>;
}

@Component({
  selector: 'app-l-input-autocomplete',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, GoogleMapsModule],
  templateUrl: './l-input-autocomplete.component.html',
})
export class LInputAutocompleteComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('searchInput') searchInput!: InputComponent;
  @ViewChild('resultsContainer') resultsContainer?: ElementRef;
  @ViewChild('mapContainer', { read: ElementRef }) mapContainer!: ElementRef;

  private autoCompleteService = inject(AutocompleteServiceService);
  private ngZone = inject(NgZone);

  // Input properties
  @Input() initialValue: string = '';
  @Input() citiesOnly: boolean = false;
  @Input() placeholder: string = '';

  searchControl = new FormControl('');
  results: GooglePlaceResult[] = [];
  isLoading = false;

  // Google Maps properties
  center: google.maps.LatLngLiteral = { lat: 41.9028, lng: 12.4964 }; // Rome center
  zoom = 6;
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeId: 'roadmap' as any,
    maxZoom: 20,
    minZoom: 5,
  };

  // Google Maps services
  private map?: google.maps.Map;
  private placesService?: google.maps.places.PlacesService;
  private autocompleteServiceGoogle?: google.maps.places.AutocompleteService;

  // Subject for cleanup
  private destroy$ = new Subject<void>();
  private isBrowser = false;

  // Track if Google Maps API is loaded
  private isGoogleMapsLoaded = false;

  // Flag to prevent search when programmatically setting value
  private isSettingValueProgrammatically = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (this.isBrowser) {
      this.checkGoogleMapsAvailability();
    }
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    console.log(
      'LInputAutocomplete init - initialValue:',
      this.initialValue,
      'citiesOnly:',
      this.citiesOnly
    );

    this.setupAutocomplete();
    this.watchInputChanges();

    // If we have an initial value, set it
    if (this.initialValue) {
      console.log('Setting initial value:', this.initialValue);
      this.isSettingValueProgrammatically = true;
      this.searchControl.setValue(this.initialValue, { emitEvent: false });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // If initialValue changes after component is initialized
    if (changes['initialValue'] && !changes['initialValue'].firstChange) {
      console.log('Initial value changed:', this.initialValue);
      this.isSettingValueProgrammatically = true;
      this.searchControl.setValue(this.initialValue, { emitEvent: false });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Check if Google Maps API is available
   */
  private checkGoogleMapsAvailability(): void {
    if (!this.isBrowser) return;

    if (typeof window !== 'undefined' && window['google'] && window['google']['maps']) {
      this.isGoogleMapsLoaded = true;
      this.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
    } else {
      console.warn('Google Maps API not loaded yet');
      setTimeout(() => {
        this.checkGoogleMapsAvailability();
      }, 1000);
    }
  }

  onMapReady(map: google.maps.Map) {
    if (!this.isBrowser) return;

    this.map = map;
    this.initializeGoogleMapsServices();
  }

  private initializeGoogleMapsServices() {
    if (!this.isBrowser || !this.map || !this.isGoogleMapsLoaded) {
      return;
    }

    try {
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.autocompleteServiceGoogle = new google.maps.places.AutocompleteService();
    } catch (error) {
      console.error('Error initializing Google Maps services:', error);
    }
  }

  private setupAutocomplete() {
    if (!this.isBrowser) return;

    this.searchControl.valueChanges
      .pipe(takeUntil(this.destroy$), debounceTime(300), distinctUntilChanged())
      .subscribe(input => {
        // Don't trigger search if we're setting the value programmatically
        if (this.isSettingValueProgrammatically) {
          this.isSettingValueProgrammatically = false;
          return;
        }

        if (input && input.length >= 2) {
          this.onSearch(input);
        } else {
          this.results = [];
        }
      });
  }

  private watchInputChanges() {
    if (!this.isBrowser) return;

    // Close dropdown when clicking outside
    fromEvent(document, 'click')
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: Event) => {
        const clickedElement = event.target as HTMLElement;
        if (!clickedElement.closest('.autocomplete-container')) {
          this.results = [];
        }
      });
  }

  // Public method to set the search control value
  setValue(value: string) {
    console.log('Setting value via setValue method:', value);
    this.isSettingValueProgrammatically = true;
    this.searchControl.setValue(value, { emitEvent: value.length >= 2 });
  }

  onSearch(currentValue: string) {
    if (!this.isBrowser || !this.autocompleteServiceGoogle || !this.isGoogleMapsLoaded) {
      return;
    }

    console.log('Searching for:', currentValue, 'citiesOnly:', this.citiesOnly);

    this.isLoading = true;

    const request: google.maps.places.AutocompletionRequest = {
      input: currentValue,
      componentRestrictions: { country: 'it' }, // Restrict to Italy
      language: 'it',
      types: this.citiesOnly ? ['(cities)'] : ['geocode'], // Use cities type for city-only search
    };

    this.autocompleteServiceGoogle.getPlacePredictions(
      request,
      (
        predictions: google.maps.places.AutocompletePrediction[] | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        this.ngZone.run(() => {
          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            this.results = predictions.slice(0, 5).map(pred => ({
              place_id: pred.place_id,
              description: pred.description,
              structured_formatting: pred.structured_formatting,
              terms: pred.terms,
            }));
            console.log('Search results:', this.results.length);
          } else {
            this.results = [];
          }
          this.isLoading = false;
        });
      }
    );
  }

  formatAddress(prediction: GooglePlaceResult): string {
    if (this.citiesOnly) {
      // For cities, show main text and secondary text if available
      if (prediction.structured_formatting) {
        const mainText = prediction.structured_formatting.main_text;
        const secondaryText = prediction.structured_formatting.secondary_text;
        return secondaryText ? `${mainText}, ${secondaryText}` : mainText;
      }
    }
    return prediction.description || '';
  }

  highlightMatch(text: string, search: string): string {
    if (!search) return text;
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(regex, match => `<strong>${match}</strong>`);
  }

  onSubmit(prediction: GooglePlaceResult) {
    if (!this.isBrowser || !prediction || !this.placesService || !this.isGoogleMapsLoaded) {
      return;
    }

    console.log('Address selected:', prediction);
    this.isLoading = true;

    // Get place details using place_id
    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: prediction.place_id,
      fields: ['geometry', 'formatted_address', 'address_components', 'name'],
    };

    this.placesService.getDetails(
      request,
      (
        place: google.maps.places.PlaceResult | null,
        status: google.maps.places.PlacesServiceStatus
      ) => {
        this.ngZone.run(() => {
          this.isLoading = false;

          if (
            status === google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry &&
            place.geometry.location
          ) {
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();

            // Convert Google Place to GeoFeature format for compatibility
            const geoFeature: GeoFeature = this.convertGooglePlaceToGeoFeature(place);

            // Save the feature in the autocomplete service
            this.autoCompleteService.setGeoFeature(geoFeature);

            // Clear results FIRST
            this.results = [];

            // Set flag to prevent search triggering
            this.isSettingValueProgrammatically = true;

            // Set the formatted address
            const displayAddress = this.formatAddress(prediction);
            this.searchControl.setValue(displayAddress, { emitEvent: false });
          } else {
            console.error('Error getting place details:', status);
          }
        });
      }
    );
  }

  private convertGooglePlaceToGeoFeature(place: google.maps.places.PlaceResult): GeoFeature {
    if (!place.geometry || !place.geometry.location) {
      throw new Error('Place geometry or location is missing');
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    // Extract address components
    const addressComponents = place.address_components || [];
    const address: any = {};

    addressComponents.forEach((component: google.maps.GeocoderAddressComponent) => {
      const types = component.types;
      if (types.includes('route')) {
        address.road = component.long_name;
      } else if (types.includes('street_number')) {
        address.house_number = component.long_name;
      } else if (types.includes('postal_code')) {
        address.postcode = component.long_name;
      } else if (types.includes('locality')) {
        address.city = component.long_name;
      } else if (types.includes('administrative_area_level_3')) {
        address.town = component.long_name;
      } else if (types.includes('administrative_area_level_2')) {
        address.province = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        address.state = component.long_name;
      } else if (types.includes('country')) {
        address.country = component.long_name;
      }
    });

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat], // GeoJSON format: [longitude, latitude]
      },
      properties: {
        place_id: place.place_id,
        display_name: place.formatted_address || place.name || '',
        address: address,
        type: this.citiesOnly ? 'city' : 'house',
      },
    };
  }
}
