import { Component, inject, Input, WritableSignal } from '@angular/core';
import { TrashIconComponent } from '../../atoms/icons/trash-icon/trash-icon.component';
import { ButtonComponent } from '../../atoms/button/button.component';
import { FloorplanIconComponent } from '../../atoms/icons/floorplan-icon/floorplan-icon.component';
import { MeasureIconComponent } from '../../atoms/icons/measure-icon/measure-icon.component';
import { ApiError, Property, SavedSearches } from '../../../public/models';
import { SavedSearchesService } from '../../../public/services/saved-searches.service';
import { mapImage } from '../../../public/mock/data';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { finalize } from 'rxjs';
import { ToastService } from '../../../shared/services/toast.service';
import { PaginationComponent } from '../pagination/pagination.component';
@Component({
  selector: 'app-saved-search-card',
  standalone: true,
  imports: [
    TrashIconComponent,
    ButtonComponent,
    FloorplanIconComponent,
    MeasureIconComponent,
    PaginationComponent,
  ],
  templateUrl: './saved-search-card.component.html',
})
export class SavedSearchCardComponent {
  private savedSearchesService = inject(SavedSearchesService);
  private apiService = inject(PropertyApiService);
  private savedSearchesListEndpoint: string = 'api/customers/saved-searches';
  private toastService = inject(ToastService);
  @Input() savedSearches: SavedSearches[] = [];
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;
  mapImage: string = mapImage;
  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 10;
  savedSearchesList: WritableSignal<Property[]> = this.savedSearchesService.savedSearchList;

  ngOnInit() {
    this.loadUserProperties();
  }

  async loadUserProperties() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    try {
      const observableResult = await this.apiService.getSavedSearches(
        this.currentPage,
        this.pageSize
      );

      observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }
          this.savedSearchesList.set(response.result);
          this.totalPages = response.pagination.pageCount;

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

          this.toastService.success('Ricerca eliminata con successo');
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

  goToSavedSearch(url: string) {
    window.open(url, '_blank');
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUserProperties();
  }
}
