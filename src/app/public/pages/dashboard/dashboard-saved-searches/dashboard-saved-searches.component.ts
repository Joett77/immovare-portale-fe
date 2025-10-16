import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { TrashIconComponent } from '../../../../shared/atoms/icons/trash-icon/trash-icon.component';
import { SavedSearchCardComponent } from '../../../../shared/organisms/saved-search-card/saved-search-card.component';
import { SavedSearchesService } from '../../../../public/services/saved-searches.service';
import { ApiError, Property } from '../../../../public/models';
import { Router } from '@angular/router';
import { ModalSmallComponent } from '../../../components/modal-small/modal-small.component';
import { PropertyApiService } from '../../../services/property-api.service';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-dashboard-saved-searches',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    TrashIconComponent,
    SavedSearchCardComponent,
    ModalSmallComponent,
  ],
  templateUrl: './dashboard-saved-searches.component.html',
})
export class DashboardSavedSearchesComponent {
  savedSearchesService = inject(SavedSearchesService);
  private propertyService = inject(PropertyApiService);
  private toastService = inject(ToastService);

  savedSearchesList: WritableSignal<Property[]> = this.savedSearchesService.savedSearchList;
  currentPage: number = 1;
  private router = inject(Router);
  protected modalType: null | "delete-element" = null;
  isLoading = signal(false);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);


  deleteAll() {
    this.modalType = "delete-element";
  }

  showDeleteAll() {
    return this.savedSearchesList().length > 0;
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    this.currentPage++;
  }

  goToFavorites() {
    this.router.navigate(['/immobili-preferiti']);
  }
  goToVoglioAcquistare() {
    this.router.navigate(['/voglio-acquistare']);
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction() {
    this.isLoading.set(true);

    if (this.modalType === "delete-element") {

      try {
        const observableResult = await this.propertyService.deleteAllUserSavedSearch();

        observableResult.pipe(
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
            this.savedSearchesList.set([]);
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

  private handleError(context: string, error: any) {
    console.error(`${context}:`, error);
    this.hasError.set(true);
    this.errorMessage.set(error?.message || 'An unexpected error occurred. Please try again.');
  }

  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  private handleApiError(error: ApiError) {
    this.hasError.set(true);
    this.errorMessage.set(error.message);
    console.error(`API Error (${error.type}):`, error.message);
  }
}
