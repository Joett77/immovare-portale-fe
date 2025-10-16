// leaflet-input-autocomplete.component.ts - Fixed SSR and Google Maps issues
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  effect,
  ElementRef,
  Inject,
  inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, fromEvent, Subject, takeUntil } from 'rxjs';

import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { MapIconComponent } from '../../../shared/atoms/icons/map-icon/map-icon.component';
import { InputComponent } from '../../../shared/molecules/input/input.component';
import { GeoFeature } from '../../models';
import { AdvertisementService } from '../../services/advertisement-service';
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
  selector: 'app-leaflet-input-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    GoogleMapsModule,
    MapIconComponent,
  ],
  templateUrl: './leaflet-input-autocomplete.component.html',
})
export class LeafletInputAutocompleteComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: InputComponent;
  @ViewChild('mapContainer', { read: ElementRef }) mapContainer!: ElementRef;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private autocompleteService = inject(AutocompleteServiceService);
  private advertisementService = inject(AdvertisementService);
  private ngZone = inject(NgZone);
  private responsive = inject(BreakpointObserver);

  @Input() initialValue: string = '';
  @Input() label: string = 'Inserisci un indirizzo o una città';
  @Input() redirectToAdvertisementsPage: boolean = false;
  @Input() redirectToPropertyEvaluation: boolean = false;
  @Input() btnText: string = 'Cerca';
  @Input() showDrawOption: boolean = true;

  searchControl = new FormControl('');
  results: GooglePlaceResult[] = [];
  isLoading = false;
  searchParams: any = {};
  selectedAddress: string = '';
  isMobile: boolean = false;

  // Google Maps properties
  center: google.maps.LatLngLiteral = { lat: 41.9028, lng: 12.4964 }; // Rome center
  zoom = 6;
  mapOptions: google.maps.MapOptions = {
    zoomControl: true,
    scrollwheel: true,
    disableDoubleClickZoom: false,
    mapTypeId: 'roadmap' as any, // Use string instead of enum during SSR
    maxZoom: 20,
    minZoom: 5,
  };

  // Google Maps services - will be initialized after map loads
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

    // Only run browser-specific code
    if (this.isBrowser) {
      // Check if Google Maps is available
      this.checkGoogleMapsAvailability();

      // Use effect to subscribe to geoFeature signal changes
      effect(() => {
        const feature = this.autocompleteService.getGeoFeature() as any;
        if (feature && feature.properties?.display_name) {
          this.isSettingValueProgrammatically = true;
          this.searchControl.setValue(feature.properties.display_name, { emitEvent: false });
          this.selectedAddress = feature.properties.display_name;
          this.results = [];
        }
      });

      // Listen to router events to clear input when navigating away from search-related pages
      this.router.events
        .pipe(
          filter(event => event instanceof NavigationEnd),
          takeUntil(this.destroy$)
        )
        .subscribe(event => {
          const navigationEvent = event as NavigationEnd;
          // Check if we're navigating away from search-related pages
          if (!this.isSearchRelatedPage(navigationEvent.url)) {
            this.clearSearchOnNavigation();
          }
        });
    }
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    this.setupAutocomplete();
    this.watchInputChanges();

    // If we have an initial value, set it
    if (this.initialValue) {
      this.isSettingValueProgrammatically = true;
      this.searchControl.setValue(this.initialValue, { emitEvent: false });
      this.selectedAddress = this.initialValue;
    } else {
      // Check if we have a stored search value from the filter service
      this.restoreSearchValueFromFilters();
    }

    this.responsive
      .observe(Breakpoints.HandsetPortrait)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });
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

    // Check if google object exists and has maps property
    if (typeof window !== 'undefined' && window['google'] && window['google']['maps']) {
      this.isGoogleMapsLoaded = true;
      // Set the correct map type after Google Maps is loaded
      this.mapOptions.mapTypeId = google.maps.MapTypeId.ROADMAP;
    } else {
      console.warn('Google Maps API not loaded yet');
      // Retry after a delay
      setTimeout(() => {
        this.checkGoogleMapsAvailability();
      }, 1000);
    }
  }

  /**
   * Restore search value from advertisement service filters
   * This helps maintain the search input when navigating between pages
   */
  private restoreSearchValueFromFilters(): void {
    if (!this.isBrowser) return;

    const filterData = this.advertisementService.getFilterData();

    // Check if we have location data that we can reverse geocode to get address
    if (filterData.latitude && filterData.longitude && !this.selectedAddress) {
      this.reverseGeocodeAndSetAddress(filterData.latitude, filterData.longitude);
    }
  }

  /**
   * Reverse geocode coordinates to get address and set it in the input
   */
  private reverseGeocodeAndSetAddress(lat: number, lng: number): void {
    if (!this.isBrowser || !this.isGoogleMapsLoaded) {
      // If Google Maps is not ready yet, wait a bit and try again
      setTimeout(() => {
        if (this.isGoogleMapsLoaded) {
          this.reverseGeocodeAndSetAddress(lat, lng);
        }
      }, 500);
      return;
    }

    if (!this.map) {
      // If map is not ready yet, wait a bit and try again
      setTimeout(() => {
        if (this.map) {
          this.reverseGeocodeAndSetAddress(lat, lng);
        }
      }, 500);
      return;
    }

    // First check if we already have the original selected address stored
    const filterData = this.advertisementService.getFilterData();
    if (filterData.selectedAddress) {
      this.isSettingValueProgrammatically = true;
      this.searchControl.setValue(filterData.selectedAddress, { emitEvent: false });
      this.selectedAddress = filterData.selectedAddress;
      return;
    }

    // If no stored selection, fall back to reverse geocoding
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(lat, lng);

    geocoder.geocode({ location: latlng }, (results, status) => {
      this.ngZone.run(() => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const address = results[0].formatted_address;
          this.isSettingValueProgrammatically = true;
          this.searchControl.setValue(address, { emitEvent: false });
          this.selectedAddress = address;
        }
      });
    });
  }

  onMapReady(map: google.maps.Map) {
    if (!this.isBrowser) return;

    this.map = map;
    this.initializeGoogleMapsServices();

    // After map is ready, check if we need to restore address from coordinates
    this.restoreSearchValueFromFilters();
  }

  private initializeGoogleMapsServices() {
    if (!this.isBrowser || !this.map || !this.isGoogleMapsLoaded) {
      return;
    }

    try {
      // Initialize Google Maps services using the map instance
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

  onSearch(currentValue: string) {
    if (!this.isBrowser || !this.autocompleteServiceGoogle || !this.isGoogleMapsLoaded) {
      return;
    }

    this.isLoading = true;

    const request: google.maps.places.AutocompletionRequest = {
      input: currentValue,
      componentRestrictions: { country: 'it' }, // Restrict to Italy
      language: 'it',
      types: ['geocode'], // Include all address types
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
          } else {
            this.results = [];
          }
          this.isLoading = false;
        });
      }
    );
  }

  onSubmit(prediction: GooglePlaceResult) {
    if (!this.isBrowser || !prediction || !this.placesService || !this.isGoogleMapsLoaded) {
      return;
    }

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
            const viewport = place.geometry.viewport?.toJSON();

            // Convert Google Place to GeoFeature format for compatibility
            const geoFeature: GeoFeature = this.convertGooglePlaceToGeoFeature(place);

            // Save the feature in the autocomplete service
            this.autocompleteService.setGeoFeature(geoFeature);

            // Store the original prediction description (what user selected) and the formatted address
            const originalSelection = prediction.description;
            const formattedAddress = place.formatted_address || prediction.description;

            // Use the original selection for display, but store both
            this.selectedAddress = originalSelection;

            // Clear results FIRST
            this.results = [];

            // Set flag to prevent search triggering
            this.isSettingValueProgrammatically = true;

            // Then set the value
            this.searchControl.setValue(this.selectedAddress, { emitEvent: false });
            let query: any = {
              latitude: lat,
              longitude: lng,
              zoom: 14,
              selectedAddress: this.selectedAddress, // Original user selection
              formattedAddress: formattedAddress, // Full Google formatted address
            };
            if (viewport) {
              query = {
                ...query,
                bbox: {
                  lat_max: viewport.north,
                  lat_min: viewport.south,
                  long_max: viewport.east,
                  long_min: viewport.west,
                },
              };
            }
            // Update advertisement service filter data
            this.advertisementService.updateMultipleFilterData(query);

            // Update map view
            this.center = { lat, lng };
            this.zoom = 14;

            // Prepare query params
            const queryParams = { ...this.route.snapshot.queryParams };
            queryParams['lat'] = lat;
            queryParams['lng'] = lng;
            queryParams['view'] = this.isMobile ? 'list' : 'map';
            queryParams['zoom'] = 14;
            queryParams['address'] = this.selectedAddress; // Use original selection for URL
            queryParams['formattedAddress'] = formattedAddress;
            if (viewport) {
              queryParams['lat_max'] = JSON.stringify(viewport.north);
              queryParams['lat_min'] = JSON.stringify(viewport.south);
              queryParams['long_max'] = JSON.stringify(viewport.east);
              queryParams['long_min'] = JSON.stringify(viewport.west);
            }

            if (this.redirectToAdvertisementsPage) {
              this.searchParams = queryParams;
              return;
            }

            if (this.redirectToPropertyEvaluation) {
              // Store original selection for property evaluation page
              queryParams['address'] = this.selectedAddress;
              queryParams['formattedAddress'] = formattedAddress;
              return;
            }

            // Navigate with new params
            this.router.navigate([], {
              relativeTo: this.route,
              queryParams: queryParams,
              queryParamsHandling: 'merge',
            });
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
        type: 'house', // Default type
      },
    };
  }

  formatAddress(prediction: GooglePlaceResult): string {
    return prediction.description || '';
  }

  highlightMatch(text: string, search: string): string {
    if (!search) return text;
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(regex, match => `<strong>${match}</strong>`);
  }

  clearSearch(): void {
    this.isSettingValueProgrammatically = true;
    this.searchControl.setValue('');
    this.selectedAddress = '';
    this.results = [];
  }

  goToAdvertisementsPage(): void {
    if (!this.isBrowser) return;

    // Include current search value in navigation if no place was selected
    const currentSearchValue = this.searchControl.value;
    if (currentSearchValue && !this.selectedAddress) {
      this.searchParams['searchQuery'] = currentSearchValue;
    }
    if (this.isMobile) this.searchParams = { ...this.searchParams, view: 'list' };

    // Navigate to advertisements page with search parameters
    this.router.navigate(['/annunci-immobili'], { queryParams: this.searchParams });
  }

  goToPropertyEvaluation(): void {
    if (!this.isBrowser) return;

    // Clear evaluation localStorage when starting fresh evaluation
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('propertyEvaluationData');
      localStorage.removeItem('redirectToEvaluationResults');
      localStorage.removeItem('postVerificationRedirect');
      console.log('Cleared evaluation localStorage for fresh start');
    }

    // Clear any step-related query parameters from current URL
    const currentParams = { ...this.route.snapshot.queryParams };
    delete currentParams['step'];
    delete currentParams['returnUrl'];

    // Navigate to property evaluation page with selected address
    const queryParams: any = {};
    if (this.selectedAddress) {
      queryParams['address'] = this.selectedAddress;
    }

    this.router.navigate(['/property-evaluation'], { queryParams });
  }

  isDrawModal(): boolean {
    if (!this.isBrowser) return false;

    // Check if we're inside the draw modal
    return this.autocompleteService.isDrawMapModalOpen();
  }

  /**
   * Check if draw option should be shown
   * Based on showDrawOption input and not being in draw modal
   */
  shouldShowDrawOption(): boolean {
    if (!this.isBrowser) return false;

    return this.showDrawOption && !this.isDrawModal();
  }

  openModal(): void {
    if (!this.isBrowser) return;

    // Open the draw map modal
    this.autocompleteService.isDrawMapModalOpen.set(true);

    // Clear search results when opening modal
    this.results = [];
  }

  /**
   * Public method to clear search - can be called externally
   */
  public clearSearchExternal(): void {
    this.clearSearch();
  }

  /**
   * Check if the current URL is a search-related page where the input should maintain its value
   */
  private isSearchRelatedPage(url: string): boolean {
    const searchRelatedPaths = ['/annunci-immobili'];

    return searchRelatedPaths.some(path => url.startsWith(path));
  }

  /**
   * Clear search input when navigating to non-search pages
   */
  private clearSearchOnNavigation(): void {
    // Clear the search input
    this.isSettingValueProgrammatically = true;
    this.searchControl.setValue('', { emitEvent: false });
    this.selectedAddress = '';
    this.results = [];

    console.log('Cleared autocomplete input due to navigation to non-search page');
  }
}
