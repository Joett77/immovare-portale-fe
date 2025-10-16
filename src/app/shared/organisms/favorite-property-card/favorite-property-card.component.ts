import { Component, computed, effect, inject, input, WritableSignal } from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { TrashIconComponent } from '../../atoms/icons/trash-icon/trash-icon.component';
import { CalendarIconComponent } from '../../atoms/icons/calendar-icon/calendar-icon.component';
import { MailIconComponent } from '../../atoms/icons/mail-icon/mail-icon.component';
import { ArrowRightIconComponent } from '../../atoms/icons/arrow-right-icon/arrow-right-icon.component';
import { BathIconComponent } from '../../atoms/icons/bath-icon/bath-icon.component';
import { MeasureIconComponent } from '../../atoms/icons/measure-icon/measure-icon.component';
import { FloorplanIconComponent } from '../../atoms/icons/floorplan-icon/floorplan-icon.component';
import { ApiError, Property } from '../../../public/models';
import { PropertyBuyService } from '../../../public/services/property-buy.service';
import { RouterModule } from '@angular/router';
import { HeartIconComponent } from '../../atoms/icons/heart-icon/heart-icon.component';
import { SelectComponent } from '../../molecules/select/select.component';
import { FormControl } from '@angular/forms';
import { SavedSearchesService } from '../../../public/services/saved-searches.service';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-favorite-property-card',
  standalone: true,
  imports: [
    RouterModule,
    ButtonComponent,
    TrashIconComponent,
    CalendarIconComponent,
    MailIconComponent,
    ArrowRightIconComponent,
    BathIconComponent,
    MeasureIconComponent,
    FloorplanIconComponent,
    HeartIconComponent,
    SelectComponent,
  ],
  templateUrl: './favorite-property-card.component.html',
})
export class FavoritePropertyCardComponent {
  private savedSearchesService = inject(SavedSearchesService);
  private propertyBuyService = inject(PropertyBuyService);
  apiService = inject(PropertyApiService);
  isAdvertismentePage = input<boolean>(false);
  favoritePropertiesList: WritableSignal<Property[]> =
    this.savedSearchesService.favoritePropertiesList;
  properties: WritableSignal<Property[]> = this.propertyBuyService.propertiesList;
  favoritePropertiesEndpoint: string = 'api/customers/favorites';
  sortControl = new FormControl('', []);
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;

  sortOptions = [
    { value: 'Più Recenti', label: 'Più Recenti' },
    { value: 'Meno Recenti', label: 'Meno Recenti' },
    { value: 'Più Costosi', label: 'Più Costosi' },
    { value: 'Meno Costosi', label: 'Meno Costosi' },
    { value: 'Più Grandi', label: 'Più Grandi' },
    { value: 'Meno Grandi', label: 'Meno Grandi' },
  ];

  ngOnInit() {
    if (!this.isAdvertismentePage()) this.loadUserProperties();
  }

  userProperties = computed(() => {
    return this.isAdvertismentePage() ? this.properties() : this.favoritePropertiesList();
  });

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

          this.favoritePropertiesList.set(response);
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

  deleteAll() {
    this.favoritePropertiesList.set([]);
  }

  async deleteFavoriteProperty(id: number) {
    console.log('delete', id);
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    try {
      const observableResult = await this.apiService.deleteUserProperties<Property>(
        this.favoritePropertiesEndpoint,
        id
      );

      this.favoritePropertiesList.set(
        this.favoritePropertiesList().filter(property => property.id !== id)
      );

      observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }

          if (response) {
            console.log('response', response);
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
  scheduleAppointment(property: Property) {}
  contactProperty(property: Property) {}
}
