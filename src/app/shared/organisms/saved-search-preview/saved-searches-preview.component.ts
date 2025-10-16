import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, input, WritableSignal } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { CommonModule } from '@angular/common';
import { emptyStateSavedSearches } from '../../../public/mock/data';
import { ApiError, Property, SavedSearches } from '../../../public/models';
import { Router, RouterModule } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NotLoggedCardComponent } from '../not-logged-card/not-logged-card.component';
import { SavedSearchesService } from '../../../public/services/saved-searches.service';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { finalize } from 'rxjs';
import { mapImage } from '../../../public/mock/data';
import { MeasureIconComponent } from '../../atoms/icons/measure-icon/measure-icon.component';
import { BathIconComponent } from '../../atoms/icons/bath-icon/bath-icon.component';
import { FloorplanIconComponent } from '../../atoms/icons/floorplan-icon/floorplan-icon.component';

@Component({
  selector: 'app-saved-search-preview',
  standalone: true,
  imports: [
    ButtonComponent,
    CommonModule,
    RouterModule,
    NotLoggedCardComponent,
    BathIconComponent,
    MeasureIconComponent,
    FloorplanIconComponent,
  ],
  templateUrl: './saved-searches-preview.component.html',
  styleUrl: './saved-searches-preview.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SavedSearchesPreviewComponent {
  constructor(
    private responsive: BreakpointObserver,
    private router: Router
  ) {}

  savedSearchesService = inject(SavedSearchesService);
  private apiService = inject(PropertyApiService);
  private savedSearchesListEndpoint: string = 'api/customers/saved-searches';
  activeTab: WritableSignal<string> = this.savedSearchesService.activeTab;
  savedSearchesList: WritableSignal<Property[]> = this.savedSearchesService.savedSearchList;
  isMobile: boolean = false;
  emptyStateSavedSearches = emptyStateSavedSearches;
  notLoggedSavedSearchesImg: string = 'assets/not-logged-saved-searches.png';
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;
  mapImage: string = mapImage;

  ngOnInit() {
    this.loadUserProperties();
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
      }
    });
  }

  async loadUserProperties() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    try {
      const observableResult = await this.apiService.getUserProperties<{
        pagination: any;
        result: Property[];
      }>(`${this.savedSearchesListEndpoint}/get-all`);

      observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }
          if (response.result) {
            this.savedSearchesList.set(response.result);
          } else {
            this.savedSearchesList.set([]);
          }
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

  async deleteUserSearch(event: Event, id: number) {
    event.stopPropagation();
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    try {
      const observableResult = await this.apiService.deleteUserProperties<SavedSearches>(
        this.savedSearchesListEndpoint,
        id
      );

      observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }

          if (response.ricerche_salvate) {
            this.savedSearchesList.set(response?.ricerche_salvate);
          }
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

  goToSavedSearches(activeTab: string) {
    console.log('activeTab', activeTab);
    this.activeTab.set(activeTab);
    this.router.navigate(['/ricerche-salvate']);
  }

  goToAnnunci() {
    this.router.navigate(['/annunci-immobili']);
  }
}
