// src/app/public/pages/dashboard/dashboard-favorites/dashboard-favorites.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { TrashIconComponent } from '../../../../shared/atoms/icons/trash-icon/trash-icon.component';
import { Property, ApiError } from '../../../../public/models';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LargePropertyCardComponent } from '../../../../shared/organisms/large-property-card/large-property-card.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ModalSmallComponent } from '../../../components/modal-small/modal-small.component';
import { PaginationComponent } from '../../../../shared/organisms/pagination/pagination.component';

@Component({
  selector: 'app-dashboard-favorites',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TrashIconComponent,
    LargePropertyCardComponent,
    ModalSmallComponent,
    PaginationComponent,
  ],
  templateUrl: './dashboard-favorites.component.html',
})
export class DashboardFavoritesComponent {
  private apiService = inject(PropertyApiService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  protected modalType: null | 'delete-element' = null;

  // Complete list of all properties
  allProperties: Property[] = [];

  // Properties for current page (paginated view)
  properties: Property[] = [];

  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  totalPages = 1;

  ngOnInit() {
    this.loadUserProperties();
  }

  async loadUserProperties() {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    try {
      const observableResult = await this.apiService.getUserProperties<Property[]>(
        `api/customers/favorites/get-all`
      );

      observableResult.pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }

          if (Array.isArray(response)) {
            // Store all properties
            this.allProperties = response;
            this.totalItems = this.allProperties.length;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

            // Apply pagination
            this.updatePaginatedProperties();
          } else if (response && response) {
            // Handle alternative response structure if needed
            this.allProperties = response;
            this.totalItems = this.allProperties.length;
            this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

            // Apply pagination
            this.updatePaginatedProperties();
          }
        },
        error: error => {
          this.handleError('Error loading properties', error);
        },
      });
    } catch (error) {
      this.handleError('Error requesting properties', error);
      this.isLoading.set(false);
    }
  }

  // Update properties to show based on pagination
  updatePaginatedProperties() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.allProperties.length);
    this.properties = this.allProperties.slice(startIndex, endIndex);
  }

  // Helper method to check if an API response is an error
  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  // Handle API-specific errors
  private handleApiError(error: ApiError) {
    this.hasError.set(true);
    this.errorMessage.set(error.message);
    console.error(`API Error (${error.type}):`, error.message);
  }

  // General error handler
  private handleError(context: string, error: any) {
    console.error(`${context}:`, error);
    this.hasError.set(true);
    this.errorMessage.set(error?.message || 'An unexpected error occurred. Please try again.');
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.updatePaginatedProperties();
  }

  goToSavedSearches() {
    this.router.navigate(['/ricerche-salvate']);
  }

  goToVoglioAcquistare() {
    this.router.navigate(['/voglio-acquistare']);
  }

  showDeleteAll() {
    return this.allProperties.length > 0;
  }

  async deleteAll() {
    this.modalType = 'delete-element';
  }

  async deleteFavoriteProperty(propertyToDelete: Property) {
    this.isLoading.set(true);

    if (!propertyToDelete.id) {
      this.handleError('Property ID is missing', new Error('Property ID is missing'));
      return;
    }

    try {
      const observableResult = await this.apiService.deleteUserProperties<Property>(
        'api/customers/favorites',
        propertyToDelete.id
      );

      observableResult.pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }

          // Remove the property from both arrays using the propertyToDelete.id
          this.allProperties = this.allProperties.filter(item => item.id !== propertyToDelete.id);
          this.properties = this.properties.filter(item => item.id !== propertyToDelete.id);

          // Recalculate pagination
          this.totalItems = this.allProperties.length;
          this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

          // If we removed the last item on the current page and we're not on the first page,
          // go to the previous page
          if (this.properties.length === 0 && this.currentPage > 1) {
            this.currentPage--;
          }

          // Update the paginated view
          this.updatePaginatedProperties();

          this.toastService.success('Proprietà rimossa dai preferiti');
        },
        error: error => {
          this.handleError('Error deleting property', error);
        },
      });
    } catch (error) {
      this.handleError('Error deleting property', error);
      this.isLoading.set(false);
    }
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction() {
    this.isLoading.set(true);

    if (this.modalType === 'delete-element') {
      try {
        const observableResult = await this.apiService.deleteAllUserProperties<Property>();

        observableResult
          .pipe(
            finalize(() => {
              this.isLoading.set(false);
              this.modalClosed();
            })
          )
          .subscribe({
            next: response => {
              if (this.isApiError(response)) {
                this.handleApiError(response);
                return;
              }

              this.allProperties = [];
              this.properties = [];
              this.totalItems = 0;
              this.totalPages = 1;
              this.currentPage = 1;
              this.toastService.success('Tutti i preferiti sono stati eliminati con successo');
            },
            error: error => {
              this.handleError('Error deleting all properties', error);
            },
          });
      } catch (error) {
        this.handleError('Error deleting all properties', error);
        this.isLoading.set(false);
        this.modalClosed();
      }
    }
  }
}
