import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';

import { PropertyApiService } from '../../../../public/services/property-api.service';
import { ActionsDropdownComponent } from '../../../../shared/action/app-actions-dropdown/app-actions-dropdown.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { ModalFullScreenComponent } from '../../../components/modal-full-screen/modal-full-screen.component';
import { ChooseAPlanComponent } from '../../../components/sell-property/choose-a-plan/choose-a-plan.component';
import { AdvertisementDraft, ApiError, PropertyListResponse } from '../../../models';
import { PaymentService, Subscription } from '../../../service/payment.service';
import { AuthService } from '../../../services/auth.service';
import { ModalSmallComponent } from '../../../components/modal-small/modal-small.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';
import { PaginationComponent } from '../../../../shared/organisms/pagination/pagination.component';

@Component({
  selector: 'app-dashboard-properties-ads',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ActionsDropdownComponent,
    RouterModule,
    PlusIconComponent,
    ModalFullScreenComponent,
    ChooseAPlanComponent,
    ModalSmallComponent,
    FaIconComponent,
    PaginationComponent,
  ],
  templateUrl: './dashboard-properties-ads.component.html',
  styleUrl: './dashboard-properties-ads.component.scss',
})
export class DashboardPropertiesAdsComponent implements OnInit {
  @Input() plan: 'exclusive' | 'free' | 'pro' = 'exclusive';

  // Services
  private router = inject(Router);
  private apiService = inject(PropertyApiService);
  private paymenytService = inject(PaymentService);
  private authservice = inject(AuthService);
  private userPropetiesEndpoint: string = 'api/advertisements/user-properties';
  protected modalType: null | 'delete-element' = null;
  protected propertyToDelete: string | null = null;

  // State
  userProperties: AdvertisementDraft[] = [];
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;
  currentPage = 1;
  pageSize = 10;
  pageCount: number = 1;

  subscription = signal<Subscription[]>([] as Subscription[]);
  modalOpen = signal(false);
  propertyId = signal<string | undefined>(undefined);
  propertyStatus = signal<string | undefined>(undefined);
  activePlan = signal<any>(undefined);

  // Default property (placeholder)
  annuncio = {
    image: 'assets/case.png',
    status: 'Pubblicato',
    number: '1/12',
    title: 'Villa in viale Monteparasco, 14 Marina di Pulsano TA Puglia, Italia',
    details: 'Marina di Pulsano TA, Puglia, Italia',
    visitors: 37,
    requests: 1,
    meeting: 1,
    renewalDate: '22/04/2025',
  };

  async ngOnInit() {
    this.loadUserProperties();

    this.subscription.set(
      await this.paymenytService.findSubscription({
        type: 'subscription',
        kcUserId: this.authservice.getUserId(),
      })
    );
  }

  async loadUserProperties() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    try {
      const observableResult = await this.apiService.getUserProperties<PropertyListResponse>(
        this.userPropetiesEndpoint,
        this.currentPage,
        this.pageSize
      );

      observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }

          this.userProperties = response.data;
          this.pageCount = response.meta.pageCount;
          console.log('User properties loaded:', this.userProperties);
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

  // Navigate to create a new property ad
  openNewPropertyAd() {
    this.router.navigate(['/property-publishing']);
  }

  // Navigate to edit an existing property ad
  editPropertySettings(propertyId: string) {
    console.log('Property ID:', propertyId);
    if (!propertyId) {
      console.error('Missing property ID for editing');
      return;
    }
    console.log('Navigating to edit property:', propertyId);
    this.router.navigate(['/dashboard/annuncio/', propertyId]);
  }

  editPropertySteps(propertyId: string) {
    console.log('Property ID:', propertyId);
    if (!propertyId) {
      console.error('Missing property ID for editing');
      return;
    }
    console.log('Navigating to edit property:', propertyId);
    this.router.navigate(['/property-publishing', propertyId]);
  }

  goToTicket() {
    this.router.navigate(['/dashboard/messaggi/nuovo']);
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

  haveSubsriptionPlan(arg0: string) {
    return this.subscription().some((sub: any) => sub.advertisementsId == arg0);
  }

  openPlanModal(property: any) {
    this.propertyId.set(property.id!);
    this.propertyStatus.set(property.status!);
    this.activePlan.set(property.lastActiveSubscriptionId!);
    this.modalOpen.set(true);
  }

  deleteProperty(propertyId: string) {
    this.propertyToDelete = propertyId;
    this.modalType = 'delete-element';
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction(event: any) {
    this.isLoading = true;
    if (this.modalType === 'delete-element') {
      this.apiService
        .deleteAdvertisement(event)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.propertyToDelete = null;
            this.modalClosed();
          })
        )
        .subscribe({
          next: () => {
            this.loadUserProperties();
            this.errorMessage = null;
            this.hasError = false;
          },
          error: err => {
            console.error('Error deleting advertisement:', err);
            this.errorMessage = "Errore durante l'eliminazione dell'annuncio. Riprova più tardi.";
            this.hasError = true;
          },
        });
    }
  }
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadUserProperties();
  }

  protected readonly faScrewdriverWrench = faScrewdriverWrench;
}
