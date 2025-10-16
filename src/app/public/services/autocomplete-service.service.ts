import {
  Injectable,
  Signal,
  signal,
  WritableSignal,
  effect,
  Injector,
  runInInjectionContext,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { GeoFeature } from '../models';
import { Observable, Subject, from, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Service to handle location autocomplete and geocoding functionalities using Google Maps
 */
@Injectable({
  providedIn: 'root',
})
export class AutocompleteServiceService {
  // Signal state for reactive components
  private readonly geoFeature = signal<GeoFeature | undefined>(undefined);

  // Signal for tracking silent updates
  private isSilentUpdate = signal<boolean>(false);

  // UI state signals
  isMapVisible: WritableSignal<boolean> = signal<boolean>(true);
  isDrawMapModalOpen: WritableSignal<boolean> = signal<boolean>(false);

  // Event subject for location changes that need to be broadcast
  locationChanged = new Subject<{ lat: number; lng: number; zoom?: number }>();

  // Google Maps services - these will be set from components that have access to the map
  private geocoder?: google.maps.Geocoder;
  private placesService?: google.maps.places.PlacesService;
  private autocompleteService?: google.maps.places.AutocompleteService;
  private isBrowser: boolean;

  constructor(
    private injector: Injector,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Set up effects to handle location changes
    runInInjectionContext(this.injector, () => {
      effect(() => {
        // Only trigger location changes when not a silent update
        if (this.isSilentUpdate()) {
          return;
        }

        const feature = this.geoFeature();
        if (feature && feature.geometry?.coordinates) {
          // GeoJSON uses [lng, lat] format
          const [lng, lat] = feature.geometry.coordinates;

          // Emit location changed event - ensure these are numbers
          this.locationChanged.next({ lat: Number(lat), lng: Number(lng), zoom: 15 });
        }
      });
    });
  }

  /**
   * Initialize Google Maps services from a map instance
   * This should be called from components that have access to a google.maps.Map instance
   */
  initializeServices(map: google.maps.Map): void {
    if (!this.isBrowser) return;

    this.geocoder = new google.maps.Geocoder();
    this.placesService = new google.maps.places.PlacesService(map);
    this.autocompleteService = new google.maps.places.AutocompleteService();
  }

  /**
   * Get the current GeoFeature signal as readonly
   */
  getGeoFeature(): Signal<GeoFeature | undefined> {
    return this.geoFeature.asReadonly();
  }

  /**
   * Set the GeoFeature signal value
   * @param feature The GeoFeature to set
   * @param silent Whether this should trigger effects
   */
  setGeoFeature(feature: GeoFeature | undefined, silent: boolean = false): void {
    if (silent) {
      this.isSilentUpdate.set(true);
    }

    this.geoFeature.set(feature);

    if (silent) {
      // Reset silent update flag after a short delay
      setTimeout(() => {
        this.isSilentUpdate.set(false);
      }, 100);
    }
  }

  /**
   * Search for places using Google Maps Places API
   * @param query The search query
   * @returns Observable of GeoFeature[]
   */
  searchPlaces(query: string): Observable<GeoFeature[]> {
    if (!this.isBrowser || !query || query.length < 3 || !this.autocompleteService) {
      return of([]);
    }

    const request: google.maps.places.AutocompletionRequest = {
      input: query,
      componentRestrictions: { country: 'it' },
      language: 'it',
      types: ['geocode'],
    };

    return from(
      new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
        this.autocompleteService!.getPlacePredictions(
          request,
          (
            predictions: google.maps.places.AutocompletePrediction[] | null,
            status: google.maps.places.PlacesServiceStatus
          ) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions);
            } else {
              resolve([]);
            }
          }
        );
      })
    ).pipe(
      map(predictions =>
        predictions.map(prediction => this.convertPredictionToGeoFeature(prediction))
      ),
      catchError(error => {
        console.error('Error searching places with Google Maps:', error);
        return of([]);
      })
    );
  }

  /**
   * Reverse geocode coordinates to an address using Google Maps Geocoding API
   * @param lat Latitude
   * @param lng Longitude
   * @returns Observable of GeoFeature
   */
  reverseGeocode(lat: number, lng: number): Observable<GeoFeature | null> {
    if (!this.isBrowser || !this.geocoder) {
      return of(null);
    }

    const latlng = new google.maps.LatLng(lat, lng);
    const request: google.maps.GeocoderRequest = { location: latlng };

    return from(
      new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        this.geocoder!.geocode(
          request,
          (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
            if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      })
    ).pipe(
      map(results =>
        results.length > 0 ? this.convertGoogleResultToGeoFeature(results[0]) : null
      ),
      catchError(error => {
        console.error('Error in reverse geocoding with Google Maps:', error);
        return of(null);
      })
    );
  }

  /**
   * Get place details by place_id
   * @param placeId Google Places place_id
   * @returns Observable of GeoFeature
   */
  getPlaceDetails(placeId: string): Observable<GeoFeature | null> {
    if (!this.isBrowser || !this.placesService || !placeId) {
      return of(null);
    }

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'address_components', 'name', 'place_id'],
    };

    return from(
      new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        this.placesService!.getDetails(
          request,
          (
            place: google.maps.places.PlaceResult | null,
            status: google.maps.places.PlacesServiceStatus
          ) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              resolve(place);
            } else {
              reject(new Error(`Place details request failed with status: ${status}`));
            }
          }
        );
      })
    ).pipe(
      map(place => this.convertGoogleResultToGeoFeature(place)),
      catchError(error => {
        console.error('Error getting place details:', error);
        return of(null);
      })
    );
  }

  /**
   * Convert Google Places prediction to GeoFeature format
   * @param prediction Google Places prediction
   * @returns GeoFeature
   */
  private convertPredictionToGeoFeature(
    prediction: google.maps.places.AutocompletePrediction
  ): GeoFeature {
    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [0, 0],
      },
      properties: {
        place_id: prediction.place_id,
        display_name: prediction.description,
        address: {} as any, // Address will be filled when place details are fetched
        type: 'place',
        structured_formatting: prediction.structured_formatting,
      },
    };
  }

  /**
   * Convert Google Geocoding result to GeoFeature format
   * @param result Google Geocoding result or Place result
   * @returns GeoFeature
   */
  private convertGoogleResultToGeoFeature(
    result: google.maps.GeocoderResult | google.maps.places.PlaceResult
  ): GeoFeature {
    if (!result.geometry || !result.geometry.location) {
      throw new Error('Result geometry or location is missing');
    }

    const lat = result.geometry.location.lat();
    const lng = result.geometry.location.lng();

    // Extract address components
    const addressComponents = result.address_components || [];
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
        place_id: (result as any).place_id,
        display_name: result.formatted_address || (result as any).name || '',
        address: address,
        type: 'house',
      },
    };
  }

  /**
   * Format an address from a GeoFeature
   * @param feature The GeoFeature containing address data
   * @returns Formatted address string
   */
  formatAddress(feature: GeoFeature): string {
    if (!feature || !feature.properties) {
      // If we just have coordinates, format them
      if (feature && feature.geometry && feature.geometry.coordinates) {
        const [lng, lat] = feature.geometry.coordinates;
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      }
      return '';
    }

    // If we have display_name (from Google Places), use it
    if (feature.properties.display_name) {
      return feature.properties.display_name;
    }

    // Otherwise, construct from address components
    if (feature.properties.address) {
      const addr = feature.properties.address;
      const parts = [];

      if (addr.road) parts.push(addr.road);
      if (addr.house_number) parts.push(addr.house_number);
      if (addr.postcode) parts.push(addr.postcode);
      if (addr.city || addr.town || addr.village) {
        parts.push(addr.city || addr.town || addr.village);
      }

      return parts.join(', ');
    }

    return '';
  }

  /**
   * Check if Google Maps services are available
   * @returns boolean indicating if services are initialized
   */
  areServicesAvailable(): boolean {
    return !!(this.geocoder && this.placesService && this.autocompleteService);
  }
}
