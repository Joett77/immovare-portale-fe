import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  input,
  Input,
  OnInit,
  WritableSignal,
  computed,
  signal,
} from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ButtonComponent } from '../../atoms/button/button.component';
import { Router, RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { emptyStateFavoriteProperties } from '../../../public/mock/data';
import { NotLoggedCardComponent } from '../not-logged-card/not-logged-card.component';
import { environment_dev } from '../../../environments/env.dev';
import { SavedSearchesService } from '../../../public/services/saved-searches.service';
import { ApiError, Property } from '../../../public/models';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { finalize } from 'rxjs';
import { BathIconComponent } from '../../atoms/icons/bath-icon/bath-icon.component';
import { FloorplanIconComponent } from '../../atoms/icons/floorplan-icon/floorplan-icon.component';
import { MeasureIconComponent } from '../../atoms/icons/measure-icon/measure-icon.component';

interface PaginatedResponse {
  results: any[];
  pagination: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

@Component({
  selector: 'app-already-immovated-block',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    RouterModule,
    NotLoggedCardComponent,
    BathIconComponent,
    MeasureIconComponent,
    FloorplanIconComponent,
  ],
  templateUrl: './already-immovated-block.component.html',
  styleUrl: './already-immovated-block.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AlreadyImmovatedBlockComponent implements OnInit {
  constructor(private responsive: BreakpointObserver) {}
  http = inject(HttpClient);
  savedSearchesService = inject(SavedSearchesService);
  apiService = inject(PropertyApiService);
  isHpBlock = input<boolean>(false);
  isEmptyState = input<boolean>(false);
  @Input() linkToPage!: () => void;
  HpBuildings: WritableSignal<Property[]> = signal([]);
  favoritePropertiesList: WritableSignal<Property[]> =
    this.savedSearchesService.favoritePropertiesList;
  isMobile: boolean = false;
  favoritePropertiesEndpoint: string = 'api/customers/favorites';
  emptyStateFavoriteProperties = emptyStateFavoriteProperties;
  notLoggedFavoritePropertiesImg = 'assets/not-logged-favourite-properties.png';
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;

  // Limit to 6 most recent buildings
  pageSize = 6; // Display up to 6 items in the carousel

  // API configuration
  private apiUrl = environment_dev.apiUrl;
  private apiToken = environment_dev.strapiToken;

  ngOnInit() {
    if (this.isHpBlock()) {
      this.getBuildings();
    } else {
      this.loadUserProperties();
    }
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
      }
    });
    console.log('isHpBlock', this.isHpBlock());
    console.log('buildings', this.buildings());
  }

  buildings = computed(() => {
    console.log('HpBuildings', this.HpBuildings);
    return this.isHpBlock() ? this.HpBuildings() : this.favoritePropertiesList();
  });

  getBuildings() {
    this.isLoading = true;
    this.hasError = false;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiToken}`,
    });

    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', this.pageSize.toString())
      .set('filters[adStatus][$eq]', 'published')
      .set('sort[0]', 'updatedAt:desc');

    this.http
      .get<PaginatedResponse>(`${this.apiUrl}/api/advertisements`, { headers, params })
      .subscribe({
        next: response => {
          this.isLoading = false;

          // Just log the total available items for debugging
          console.log(
            `Loaded ${response.results.length} of ${response.pagination.total} available buildings`
          );

          // Map API response to our Building interface
          this.HpBuildings.set(response.results.map(item => this.mapAdvertisementToBuilding(item)));
          console.log('HpBuildings', this.HpBuildings);
        },
        error: error => {
          console.error('Error fetching advertisements:', error);
          this.isLoading = false;
          this.hasError = true;

          // Fallback to mock data for development
          this.loadMockData();
        },
      });
  }

  // Fallback method to load mock data if API fails
  loadMockData() {
    this.http.get<any>('assets/mocks/buildings.json').subscribe(data => {
      this.HpBuildings = data.buildings;
      console.log('Mock data loaded:', this.HpBuildings);
    });
  }

  // Map the advertisement API response to our Building interface
  mapAdvertisementToBuilding(advert: any): Property {
    let status = null;
    if (advert.adStatus === 'published') {
      status = null;
    } else if (advert.adStatus === 'sent') {
      status = 'IN TRATTATIVA';
    } else if (advert.agent?.length > 0) {
      status = 'PIANO PRO';
    }

    // Format price as currency
    const formattedPrice = new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(advert.price_formatted || 0);

    // Get image URL if available
    const imageUrl = advert.images?.length > 0 ? advert.images[0].url : '';

    return {
      id: advert.id,
      images: imageUrl,
      status: advert.status,
      type: advert.type,
      address: advert.address,
      house_number: advert.house_number,
      zip_code: advert.zip_code,
      city: advert.city,
      district: advert.district,
      region: advert.region,
      country: advert.country,
      category: advert.category,
      price_formatted: formattedPrice,
      description: advert.description,
      number_rooms: advert.numberRooms || 0,
      square_metres: advert.squareMetres || 0,
      number_baths: advert.numberBaths || 0,
      property_condition: advert.propertyCondition || 'Nuovo',
      heating: advert.heating || 'Autonomo',
    };
  }

  // No pagination navigation needed

  getStatusContainerStyle(status: string | null): { [klass: string]: any } {
    if (!status) return {};
    switch (status) {
      case 'PIANO PRO':
        return {
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '1rem',
        };
      default:
        return {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        };
    }
  }

  getStatusPositionStyle(status: string | null): { [klass: string]: any } {
    if (!status) return {};
    switch (status) {
      case 'PIANO PRO':
        return {}; // No additional positioning needed as it's handled by the container
      default:
        return {}; // Centered by default, no additional styling needed
    }
  }

  getStatusClasses(status: string | null): string {
    if (!status) return '';
    const baseClasses = 'py-1 px-2 font-bold text-black text-shadow';

    switch (status) {
      case 'IN TRATTATIVA':
        return `${baseClasses} bg-primary-light bg-opacity-90 w-full`;
      case 'PIANO PRO':
        return `${baseClasses} bg-secondary rounded`;
      default:
        return `${baseClasses} bg-secondary bg-opacity-90  w-full`;
    }
  }

  async loadUserProperties() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    try {
      const observableResult = await this.apiService.getUserProperties<Property[]>(
        `${this.favoritePropertiesEndpoint}/get-all`
      );

      observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }

          // Map API response to our Building interface
          this.favoritePropertiesList.set(
            response.map(item => this.mapAdvertisementToBuilding(item))
          );
          console.log('favoritePropertiesList', this.favoritePropertiesList());
        },
        error: error => {
          this.handleError('Error loading properties', error);
        },
      });
    } catch (error) {
      this.handleError('Error requesting properties', error);
      this.isLoading = false;
    }
  }

  // Helper method to check if an API response is an error
  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  // Handle API-specific errors
  private handleApiError(error: ApiError) {
    this.hasError = true;
    this.errorMessage = error.message;
    console.error(`API Error (${error.type}):`, error.message);
  }

  // General error handler
  private handleError(context: string, error: any) {
    console.error(`${context}:`, error);
    this.hasError = true;
    this.errorMessage = error?.message || 'An unexpected error occurred. Please try again.';
  }
}
