// /src/app/cms/pages/property/property-list/property-list.component.ts
import { Component, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { ToastService } from '../../../../shared/services/toast.service';

import { AdvertisementDraft, ApiError } from '../../../../public/models';
import { async, finalize, firstValueFrom } from 'rxjs';
import { PropertyActionsDropdownComponent } from '../../../components/property/property-actions-dropdown/property-actions-dropdown.component';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';
import { CustomersService } from '../../../services/customers.service';
import { AuthService } from '../../../../public/services/auth.service';
import { PlanDataPipe } from '../../../../core/pipes/plan-data.pipe';
import { Agent, AgentsService } from '../../../services/agents.service';

interface PropertyItem {
  id: string;
  status: any;
  address: string;
  city: string;
  surface: string;
  rooms: string;
  agentData: any;
  uploadedBy: string;
  category: string;
  type: string;
  price: number;
  lastActiveSubscription: string;
  imageUrl?: string;
  renewal?: string;
}

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    PlusIconComponent,
    SearchIconComponent,
    PropertyActionsDropdownComponent,
    ModalSmallComponent,
    PlanDataPipe,
  ],
  templateUrl: './property-list.component.html',
})
export class PropertyListComponent implements OnInit {
  private router = inject(Router);
  private propertyApiService = inject(PropertyApiService);
  private toast = inject(ToastService);
  private customersService = inject(CustomersService);
  private authService = inject(AuthService);
  private agentsService = inject(AgentsService);
  protected modalType: null | 'delete-element' = null;
  protected propertyToDelete: string | null = null;
  protected canSeeAll = false;

  properties: PropertyItem[] = [];
  isLoading = true;
  error: string | null = null;

  // Filters
  searchQuery = '';
  selectedStatus = '';
  selectedAgent = '';
  priceFilter = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  Math = Math;

  // Filter options
  statusOptions = [
    {
      label: "",
      value: null,
    },
    {
      label: "Bozza",
      value: "draft",
    },
    {
      label: "In approvazione",
      value: "sent",
    },
    {
      label: "Pubblicato",
      value: "published",
    },
    {
      label: "Rifiutato",
      value: "rejected",
    },
    {
      label: "In trattativa",
      value: "negotiation",
    },
    {
      label: "Venduto",
      value: "sold",
    },
    {
      label: "Nascosto",
      value: "hidden",
    },
    {
      label: "Archiviato",
      value: "archived",
    }
  ]
  agentOptions: Agent[] = [];
  priceOption = [
    {
      min: 0,
      max: 100000
    },
    {
      min: 100001,
      max: 200000
    },
    {
      min: 200001,
      max: 500000
    },
    {
      min: 500001,
      max: null
    },
  ]

  constructor() {
    this.canSeeAll = this.authService.hasRole('ADMIN') || this.authService.hasRole('OPERATOR');
  }

  ngOnInit(): void {
    this.loadProperties(null);
    this.loadAgents();
  }

  loadAgents() {
    this.agentsService
      .getAgents()
      .subscribe({
        next: (agents: Agent[]) => {
          this.agentOptions = agents;
          console.log('Loaded agents:', agents);
        },
        error: err => {
          console.error('Failed to load agents:', err);
          this.error='Errore nel caricamento degli agenti. Riprova più tardi.';
        },
      });
  }

  loadProperties(filters: any): void {
    this.isLoading = true;
    this.error = null;

    this.propertyApiService
      .getAllProperties(this.currentPage, this.itemsPerPage, filters)
      .then(observableResult => {
        observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
          next: response => {
            if (this.isApiError(response)) {
              this.handleApiError(response);
              return;
            }

            if (response && response.results) {
              this.properties = this.mapApiResponseToProperties(response.results);
              this.totalItems = response.pagination.total;
            }
          },
          error: err => {
            console.error('Error loading properties:', err);
            this.error =
              'Si è verificato un errore durante il caricamento degli annunci. Riprova più tardi.';
            this.properties = [];
          },
        });
      })
      .catch(error => {
        console.error('Error requesting properties:', error);
        this.error = 'Errore di connessione al servizio. Riprova più tardi.';
        this.isLoading = false;
        this.properties = [];
      });
  }

  // Type guard for API errors
  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  // Handle API-specific errors
  private handleApiError(error: ApiError) {
    this.error = error.message;
    console.error(`API Error (${error.type}):`, error.message);
    this.properties = [];
  }

  applyFilters(resetPagination?:boolean): void {
    if (resetPagination) {
      this.currentPage = 1;
    }

    const filters: {
      text?: string;
      adStatus?: string;
      agent?: string;
      price?: string
    } = {};

    if (this.searchQuery) {
      filters.text = this.searchQuery;
    }

    if (this.selectedStatus) {
      filters.adStatus = this.selectedStatus;
    }

    if (this.selectedAgent && this.selectedAgent !== '') {
      filters.agent = this.selectedAgent;
    }

    if (this.priceFilter) {
      filters.price = this.priceFilter
    }

    this.loadProperties(filters);
  }

  /**
   * Create a new property advertisement
   * This function creates an empty draft and then navigates to the property edit page
   */
  createNewProperty(): void {
    this.isLoading = true;
    this.error = null;

    // Create an empty draft advertisement
    const emptyDraft: Partial<AdvertisementDraft> = {
      title: 'Nuovo annuncio',
      address: '',
      city: '',
      category: 'Residenziale',
      type: 'Appartamento',
      price: 0,
      description: '',
      adStatus: 'draft',
      draftStep: 0, // Start at the first step
    };

    // Save the empty draft to the server first
    this.propertyApiService
      .createAdvertisement({ data: emptyDraft })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          if (response && response.data && response.data.id) {
            // Navigate to edit the newly created advertisement
            this.router.navigate(['/cms/annunci/', response.data.id]);
          } else {
            this.error = "Errore nella creazione dell'annuncio. Dati di risposta non validi.";
          }
        },
        error: err => {
          console.error('Error creating new advertisement:', err);
          this.error = "Errore nella creazione dell'annuncio. Riprova più tardi.";
        },
      });
  }

  editProperty(id: string): void {
    this.router.navigate(['/cms/annunci/', id]);
  }

  viewProperty(id: string): void {
    // Open in a new tab
    window.open(`/property/${id}`, '_blank');
  }

  approveProperty(propertyId: string): void {
    this.isLoading = true;

    // Create data for updating the property status
    const updateData = {
      id: propertyId,
      adStatus: 'published',
    };

    this.propertyApiService
      .saveAdvertisement(updateData)
      .then(observableResult => {
        observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
          next: response => {
            if (this.isApiError(response)) {
              this.handleApiError(response);
              return;
            }

            // Update local state
            const propertyIndex = this.properties.findIndex(p => p.id === propertyId);
            if (propertyIndex !== -1) {
              this.properties[propertyIndex].status = 'Pubblicato';
              this.applyFilters();
            }

            // Show success message
            this.error = 'Annuncio pubblicato con successo';
            setTimeout(() => (this.error = null), 3000);
          },
          error: err => {
            console.error('Error approving property:', err);
            this.error = "Si è verificato un errore durante la pubblicazione dell'annuncio.";
          },
        });
      })
      .catch(error => {
        console.error('Error requesting approval:', error);
        this.error = 'Errore di connessione al servizio. Riprova più tardi.';
        this.isLoading = false;
      });
  }

  /**
   * Delete an advertisement
   */
  deleteProperty(propertyId: string): void {
    this.propertyToDelete = propertyId;
    this.modalType = 'delete-element';
  }

  // Map API response to our local interface - would be used in real implementation
  private mapApiResponseToProperties(apiData: any[]): PropertyItem[] {
    return apiData.map(item => {
      const data = item.attributes || item;

      // Map status
      let status = this.statusOptions.find(s => s.value === data.adStatus)

      // Get image URL if available
      let imageUrl = '';
      if (data.images && data.images.length > 0) {
        imageUrl = data.images[0].url;
      }

      return {
        id: `${item.id}`,
        status,
        address: `${data.address} ${data.houseNumber} - ${data.zipCode}`,
        city: `${data.city} (${data.country || '-'})`,
        surface: data.squareMetres ? `${data.squareMetres}m²` : '-',
        rooms: data.numberRooms ? `${data.numberRooms} locali` : '-',
        agentData: data.agentData
          ? data.agentData?.firstName + ' ' + data.agentData?.lastName
          : 'Da definire',
        uploadedBy: data.uploadedBy
          ? data.uploadedBy?.firstName + ' ' + data.uploadedBy?.lastName
          : 'Sistema',
        category: data.category || '-',
        type: data.type || '-',
        price: data.price || 0,
        lastActiveSubscription: data.lastActiveSubscription || "Free",
        imageUrl,
        renewal: data.expirationDate
          ? `Scadenza ${new Date(data.expirationDate).toLocaleDateString('it-IT')}`
          : undefined,
      };
    });
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction(event: any) {
    this.isLoading = true;

    if (this.modalType === 'delete-element') {
      this.propertyApiService
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
            this.applyFilters();
          },
          error: err => {
            console.error('Error deleting advertisement:', err);
            this.error = "Errore durante l'eliminazione dell'annuncio. Riprova più tardi.";
          },
        });
    }
  }

  protected readonly JSON = JSON;
}
