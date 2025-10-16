// src/app/cms/pages/property/property-details/property-details.component.ts
import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowRight,
  faCheck, faClipboardList,
  faDownload,
  faEnvelope,
  faGear,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

import { LeafletMapLiteComponent } from '../../../../public/components/leaflet-map-lite/leaflet-map-lite.component';
import { AdvertisementDraft } from '../../../../public/models';
import { PaymentService, Subscription } from '../../../../public/service/payment.service';
import { UploadResponse } from '../../../../public/services/file-upload.service';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { ApartmentIconComponent } from '../../../../shared/atoms/icons/apartment-icon/apartment-icon.component';
import { BalconyIconComponent } from '../../../../shared/atoms/icons/balcony-icon/balcony-icon.component';
import { BasementIconComponent } from '../../../../shared/atoms/icons/basement-icon/basement-icon.component';
import { BathIconComponent } from '../../../../shared/atoms/icons/bath-icon/bath-icon.component';
import { ElevatorIconComponent } from '../../../../shared/atoms/icons/elevator-icon/elevator-icon.component';
import { FloorIconComponent } from '../../../../shared/atoms/icons/floor-icon/floor-icon.component';
import { FloorplanIconComponent } from '../../../../shared/atoms/icons/floorplan-icon/floorplan-icon.component';
import { GarageIconComponent } from '../../../../shared/atoms/icons/garage-icon/garage-icon.component';
import { GardenIconComponent } from '../../../../shared/atoms/icons/garden-icon/garden-icon.component';
import { MeasureIconComponent } from '../../../../shared/atoms/icons/measure-icon/measure-icon.component';
import { ParkIconComponent } from '../../../../shared/atoms/icons/park-icon/park-icon.component';
import { PoolIconComponent } from '../../../../shared/atoms/icons/pool-icon/pool-icon.component';
import { TerraceIconComponent } from '../../../../shared/atoms/icons/terrace-icon/terrace-icon.component';
import { TurismLicenseIconComponent } from '../../../../shared/atoms/icons/turism-license-icon/turism-license-icon.component';
import { FileUploaderComponent } from '../../../../shared/molecules/file-uploader/file-uploader.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { SelectComponent } from '../../../../shared/molecules/select/select.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { PropertyAddressSectionComponent } from '../../../components/property/property-address-section/property-address-section.component';
import { PropertyDetailsActionsDropdownComponent } from '../../../components/property/property-details-actions-dropdown/property-details-actions-dropdown.component';
import { PropertyExtraFeaturesSectionComponent } from '../../../components/property/property-extra-features-section/property-extra-features-section.component';
import { PropertyFeaturesSectionComponent } from '../../../components/property/property-features-section/property-features-section.component';
import { PropertyFloorplanModalComponent } from '../../../components/property/property-floorplan-modal/property-floorplan-modal.component';
import { PropertyImagesModalComponent } from '../../../components/property/property-images-modal/property-images-modal.component';
import { PropertyPriceSectionComponent } from '../../../components/property/property-price-section/property-price-section.component';
import { Agent, AgentsService } from '../../../services/agents.service';
import { Customer, CustomersService } from '../../../services/customers.service';
import { PropertyVirtualTourSectionComponent } from '../../../components/property/property-virtual-tour-section/property-virtual-tour-section.component';
import { AuthService } from '../../../../public/services/auth.service';
import { PlanDataPipe } from '../../../../core/pipes/plan-data.pipe';
import { faClipboard } from '@fortawesome/free-regular-svg-icons/faClipboard';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';

// Import services
// Import components
@Component({
  selector: 'app-property-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    LeafletMapLiteComponent,
    FileUploaderComponent,
    PropertyAddressSectionComponent,
    ApartmentIconComponent,
    FloorplanIconComponent,
    MeasureIconComponent,
    FloorIconComponent,
    BathIconComponent,
    FontAwesomeModule,
    PropertyExtraFeaturesSectionComponent,
    PropertyFeaturesSectionComponent,
    PropertyPriceSectionComponent,
    PropertyImagesModalComponent,
    PropertyFloorplanModalComponent,
    PropertyDetailsActionsDropdownComponent,
    PropertyVirtualTourSectionComponent,
    PlanDataPipe,
    ModalSmallComponent,
  ],
  templateUrl: './property-details.component.html',
})
export class PropertyDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyApiService = inject(PropertyApiService);
  private toast = inject(ToastService);
  private agentsService = inject(AgentsService);
  private customersService = inject(CustomersService);
  private _paymentService = inject(PaymentService);
  private authService = inject(AuthService);
  protected canSeeAll = false;
  protected modalType: "create-bpm" | null = null;


  faEnvelope = faEnvelope;
  faTimes = faTimes;
  faCheck = faCheck;
  faDownload = faDownload;
  faGear = faGear;
  // State signals
  isLoading = signal(false);
  isSaving = signal(false);
  transaction = signal([] as Subscription[]);
  error = signal<string | null>(null);
  activeTab = signal<'property' | 'plans'>('property');
  propertyForm!: FormGroup;

  // Modal state
  isImagesModalOpen = signal(false);
  isFloorplanModalOpen = signal(false);

  // Property data
  propertyId: string | null = null;
  property = signal<AdvertisementDraft | null>(null);
  uploadedImages: UploadResponse[] = [];
  uploadedFloorplan: UploadResponse | null = null;
  agents = signal<Agent[]>([]);
  selectedAgentId = signal<string>('');
  isLoadingAgents = signal(false);
  customer = signal<Customer | null>(null);
  isLoadingCustomer = signal(false);

  showEmail = signal(false);
  subscription = computed(
    () => this.transaction()?.filter(trans => trans.type === 'subscription') ?? []
  );
  payment = computed(
    () => this.transaction()?.filter(trans => trans.type === 'payment_intent') ?? []
  );

  toggleEmailDisplay(): void {
    this.showEmail.update(value => !value);
  }

  // Computed property for status text
  statusText = computed(() => {
    const status = this.property()?.adStatus;
    switch (status) {
      case 'draft':
      case 'sent':
        return 'In approvazione';
      case 'published':
        return 'Pubblicato';
      case 'rejected':
        return 'Rifiutato';
      case 'negotiation':
        return 'In trattativa';
      case 'sold':
        return 'Venduto';
      case 'hidden':
        return 'Nascosto';
      case 'archived':
        return 'Archiviato';
      default:
        return 'In approvazione';
    }
  });

  // Additional features checkboxes
  additionalFeatures = [
    { name: 'Balcone', icon: BalconyIconComponent, enabled: false },
    { name: 'Ascensore', icon: ElevatorIconComponent, enabled: false },
    { name: 'Garage', icon: GarageIconComponent, enabled: false },
    { name: 'Giardino', icon: GardenIconComponent, enabled: false },
    { name: 'Parcheggio', icon: ParkIconComponent, enabled: false },
    { name: 'Cantina', icon: BasementIconComponent, enabled: false },
    { name: 'Piscina', icon: PoolIconComponent, enabled: false },
    { name: 'Terrazzo', icon: TerraceIconComponent, enabled: false },
    { name: 'Licenza turistica', icon: TurismLicenseIconComponent, enabled: false },
  ];
  isDescriptionExpanded: any;

  constructor() {
    this.canSeeAll = this.authService.hasRole('ADMIN') || this.authService.hasRole('OPERATOR');
  }

  async ngOnInit() {
    this.initForm();
    this.propertyId = this.route.snapshot.paramMap.get('id');

    // Load agents
    this.loadAgents();

    if (this.propertyId) {
      this.loadProperty(this.propertyId);
      this.transaction.set(
        await this._paymentService.findSubscription({ advertisementsId: this.propertyId })
      );
    }
  }

  loadAgents(): void {
    this.isLoadingAgents.set(true);

    this.agentsService
      .getAgents()
      .pipe(finalize(() => this.isLoadingAgents.set(false)))
      .subscribe({
        next: (agents: Agent[]) => {
          this.agents.set(agents);
          console.log('Loaded agents:', agents);
        },
        error: err => {
          console.error('Failed to load agents:', err);
          this.error.set('Errore nel caricamento degli agenti. Riprova più tardi.');
        },
      });
  }

  loadCustomerInfo(keycloakId: string): void {
    if (!keycloakId) return;

    this.isLoadingCustomer.set(true);

    this.customersService
      .getCustomer(keycloakId)
      .pipe(finalize(() => this.isLoadingCustomer.set(false)))
      .subscribe({
        next: (customer: Customer) => {
          this.customer.set(customer);
        },
        error: err => {
          console.error('Failed to load customer details:', err);
        },
      });
  }

  initForm(): void {
    this.propertyForm = this.fb.group({
      // Basic details
      title: ['', [Validators.required]],
      adStatus: ['draft', [Validators.required]],
      type: ['villa', [Validators.required]],
      category: ['Residenziale', [Validators.required]],
      price: [0, [Validators.required, Validators.min(0)]],

      // Address
      address: ['', [Validators.required]],
      houseNumber: [''],
      zipCode: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: [''],
      region: [''],
      latitude: [45.4642],
      longitude: [9.19],

      // Characteristics
      squareMetres: [171, [Validators.required, Validators.min(0)]],
      numberRooms: [5, [Validators.required, Validators.min(0)]],
      numberBaths: [2, [Validators.required, Validators.min(0)]],
      floor: ['0'],
      propertyCondition: ['ristrutturato'],
      heating: ['autonomo'],
      energyClass: [''],
      yearOfConstruction: [new Date().getFullYear()],
      releaseStatus: ['libero'],

      // Additional information
      description: ['Descrizione', [Validators.required, Validators.maxLength(500)]],
      services: ['0'],

      // Additional features (checkboxes)
      balcony: [false],
      terrace: [false],
      garden: [false],
      garage: [false],
      parking: [false],
      pool: [false],
      elevator: [false],
      air_conditioning: [false],
      disabled_access: [false],
      furnished: [false],
    });
  }

  async loadProperty(id: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    (await this.propertyApiService.getProperty(id))
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          if (response && !('type' in response)) {
            console.log(response);
            const propertyData = response.data as AdvertisementDraft;
            this.property.set(propertyData);
            this.populateForm(propertyData);

            // Load images
            if (propertyData.images && propertyData.images.length > 0) {
              this.uploadedImages = propertyData.images.map((img: any) => ({
                id: img.id.toString(),
                url: img.url,
                fileName: img.name,
                type: img.mime,
              }));
            }

            if (propertyData.createdByKeycloakUser) {
              this.loadCustomerInfo(propertyData.createdByKeycloakUser);
            }

            // Load floorplan
            if (propertyData.floorplan && propertyData.floorplan.length > 0) {
              this.uploadedFloorplan = {
                id: propertyData.floorplan[0].id.toString(),
                url: propertyData.floorplan[0].url,
                fileName: propertyData.floorplan[0].name,
                type: propertyData.floorplan[0].mime,
              };
            }
          } else {
            this.error.set('Errore nel caricamento dei dati. Proprietà non trovata.');
          }
        },
        error: (err: any) => {
          console.error('Error loading property:', err);
          this.error.set('Errore nel caricamento della proprietà. Riprova più tardi.');
        },
      });
  }

  // Update the populateForm
  populateForm(propertyData: AdvertisementDraft): void {
    let title = '';
    if (propertyData.title) {
      title = propertyData.title;
    } else if (propertyData.city && propertyData.address) {
      // Only create auto-title if we have the required data
      const city = propertyData.city || '';
      const address = propertyData.address || '';
      const houseNumber = propertyData.houseNumber || '';
      title = `${city}: ${address}${houseNumber ? ' ' + houseNumber : ''}`;
    }
    // Basic details
    this.propertyForm.patchValue({
      title: title,
      adStatus: propertyData.adStatus || 'draft',
      type: propertyData.type || 'villa',
      category: propertyData.category || 'Residenziale',
      price: propertyData.price || 320000,
    });

    // Set selected agent ID if available from agentKeycloakUser array
    if (propertyData.agentKeycloakUser) {
      this.selectedAgentId.set(propertyData.agentKeycloakUser);
    }

    // Address
    this.propertyForm.patchValue({
      address: propertyData.address || 'Via Roma',
      houseNumber: propertyData.houseNumber || '22',
      zipCode: propertyData.zipCode || '10123',
      city: propertyData.city || 'Bari',
      country: propertyData.country || 'Italia',
      region: propertyData.region || '',
      latitude: propertyData.latitude || 45.4642,
      longitude: propertyData.longitude || 9.19,
    });

    // Characteristics
    this.propertyForm.patchValue({
      squareMetres: propertyData.squareMetres || 171,
      numberRooms: propertyData.numberRooms || 5,
      numberBaths: propertyData.numberBaths || 2,
      floor: propertyData.floor || '0',
      propertyCondition: propertyData.propertyCondition || 'ristrutturato',
      heating: propertyData.heating || 'autonomo',
      energyClass: propertyData.energyClass || 'G',
      yearOfConstruction: propertyData.yearOfConstruction || 2001,
      releaseStatus: 'libero',
    });

    // Additional information
    this.propertyForm.patchValue({
      description: propertyData.description || '',
      services: propertyData.services || '0',
    });

    // Parse features string and update checkboxes
    if (propertyData.features) {
      const features = propertyData.features.split(',').map((f: string) => f.trim().toLowerCase());

      this.additionalFeatures.forEach(feature => {
        feature.enabled = features.some(
          (f: string) =>
            f.includes(feature.name.toLowerCase()) || this.featureMatches(f, feature.name)
        );
      });
    }
  }

  handlePropertyAction(event: { actionId: string; propertyId: string }) {
    switch (event.actionId) {
      case 'negotiation':
        this.publishStatus('negotiation');
        break;
      case 'sold':
        this.publishStatus('sold');
        break;
      case 'hide':
        this.publishStatus('hidden');
        break;
      case 'archive':
        this.publishStatus('archived');
        break;
    }
  }

  // Helper method to match features with different spellings
  private featureMatches(apiFeature: string, uiFeature: string): boolean {
    const mappings: Record<string, string[]> = {
      balcone: ['balconi', 'balcony'],
      terrazzo: ['terrazza', 'terrace'],
      garage: ['box auto', 'posto auto coperto'],
      parcheggio: ['posto auto', 'parking'],
      giardino: ['garden'],
      ascensore: ['elevator', 'lift'],
      cantina: ['basement', 'storage'],
      piscina: ['pool', 'swimming'],
    };

    const featureName = uiFeature.toLowerCase();
    return mappings[featureName]?.some(synonym => apiFeature.includes(synonym)) || false;
  }

  calculatePricePerSqm(): string {
    const property = this.property();
    if (!property || !property.price || !property.squareMetres) return '';
    const pricePerSqm = Math.round(property.price / property.squareMetres);
    return pricePerSqm.toLocaleString('it-IT') + ',00 €';
  }

  formatPrice(price: number | undefined): string {
    if (!price) return '';
    return price.toLocaleString('it-IT') + ',00 €';
  }

  onSubmit(): void {
    if (this.propertyForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.propertyForm.controls).forEach(key => {
        this.propertyForm.get(key)?.markAsTouched();
      });
      this.error.set('Completa tutti i campi obbligatori prima di salvare.');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    // Prepare data for submission
    const formData = this.propertyForm.value;
    const propertyData: Partial<AdvertisementDraft> = {
      // Basic details
      adStatus: formData.adStatus,
      type: formData.type,
      category: formData.category,
      price: formData.price,

      // Address
      address: formData.address,
      houseNumber: formData.houseNumber,
      zipCode: formData.zipCode,
      city: formData.city,
      country: formData.country,
      region: formData.region,
      latitude: formData.latitude,
      longitude: formData.longitude,

      // Characteristics
      squareMetres: formData.squareMetres,
      numberRooms: formData.numberRooms,
      numberBaths: formData.numberBaths,
      floor: formData.floor,
      propertyCondition: formData.propertyCondition,
      heating: formData.heating,
      energyClass: formData.energyClass,
      yearOfConstruction: formData.yearOfConstruction,

      // Additional information
      description: formData.description,
      features: '',
      services: formData.services,
    };

    // If this is an update, include the ID
    if (this.propertyId) {
      propertyData.id = this.propertyId;
    }

    this.propertyApiService
      .saveAdvertisement(propertyData)
      .then(saveObservable => {
        saveObservable.pipe(finalize(() => this.isSaving.set(false))).subscribe({
          next: response => {
            if (!('type' in response)) {
              if (!this.propertyId) {
                // If it was a new property, navigate to the edit page with the new ID
                this.router.navigate(['/cms/annunci/', response.id]);
              } else {
                // Show success message
                this.error.set('Proprietà salvata con successo');

                // Clear success message after 3 seconds
                setTimeout(() => {
                  if (this.error() === 'Proprietà salvata con successo') {
                    this.error.set(null);
                  }
                }, 3000);
              }
            } else {
              this.error.set('Errore durante il salvataggio: ' + response);
            }
          },
          error: err => {
            console.error('Error saving property:', err);
            this.error.set('Errore durante il salvataggio della proprietà. Riprova più tardi.');
          },
        });
      })
      .catch(err => {
        console.error('Error preparing save request:', err);
        this.isSaving.set(false);
        this.error.set('Errore durante la preparazione della richiesta di salvataggio.');
      });
  }

  // Modal control methods for photos
  openImagesModal(): void {
    this.isImagesModalOpen.set(true);
  }

  closeImagesModal(): void {
    this.isImagesModalOpen.set(false);
  }

  saveImages(images: UploadResponse[]): void {
    this.uploadedImages = images;
    this.closeImagesModal();

    if (images.length > 0) {
      this.toast.success('Fotografie salvate con successo');
    }
  }

  // Modal control methods for floorplan
  openFloorplanModal(): void {
    this.isFloorplanModalOpen.set(true);
  }

  closeFloorplanModal(): void {
    this.isFloorplanModalOpen.set(false);
  }

  onPropertyUpdated(updatedProperty: AdvertisementDraft): void {
    // Update the signal with the new property data
    this.property.set(updatedProperty);

    // Also update the form if necessary
    if (this.propertyForm) {
      this.propertyForm.patchValue({
        // Update relevant form fields
        type: updatedProperty.type,
        squareMetres: updatedProperty.squareMetres,
        numberRooms: updatedProperty.numberRooms,
        numberBaths: updatedProperty.numberBaths,
        floor: updatedProperty.floor,
        propertyCondition: updatedProperty.propertyCondition,
        yearOfConstruction: updatedProperty.yearOfConstruction,
        deed_state: updatedProperty.deed_state,
        heating: updatedProperty.heating,
        energyClass: updatedProperty.energyClass,
        price: updatedProperty.price,
        condoFees: updatedProperty.condoFees,
      });
    }

    console.log('Property updated in parent component:', updatedProperty);
  }

  saveFloorplan(floorplan: UploadResponse | null): void {
    this.uploadedFloorplan = floorplan;
    this.closeFloorplanModal();

    if (floorplan) {
      this.toast.success('Planimetria salvata con successo');
    }
  }

  handleUploadError(error: string): void {
    this.error.set(error);
  }

  setActiveTab(tab: 'property' | 'plans'): void {
    this.activeTab.set(tab);
  }

  onCancel(): void {
    this.router.navigate(['/cms/annunci']);
  }

  getControl(name: string): FormControl<any> {
    return this.propertyForm.get(name) as FormControl<any>;
  }

  onImagesUploaded(images: UploadResponse[]): void {
    this.uploadedImages = images;
  }

  onFloorplanUploaded(floorplan: UploadResponse | null): void {
    this.uploadedFloorplan = floorplan;
  }

  getAgentName(agentId: string): string {
    const agent = this.agents().find(a => a.id === agentId);
    return agent ? `${agent.firstName} ${agent.lastName}` : 'Nessun agente selezionato';
  }

  updatePropertyAgent(agentId: string): void {
    if (!this.propertyId) return;

    this.isSaving.set(true);

    // Create an array with the agent ID or an empty array if no agent is selected
    const agentKeycloakUser = agentId ? agentId : '';

    const updateData: Partial<AdvertisementDraft> = {
      id: this.propertyId,
      agentKeycloakUser: agentKeycloakUser,
    };

    this.propertyApiService
      .updateAdvertisement(updateData)
      .then(saveObservable => {
        saveObservable.pipe(finalize(() => this.isSaving.set(false))).subscribe({
          next: () => {
            this.selectedAgentId.set(agentId);

            // Update the property object with the new agent
            this.property.update(property => {
              if (property) {
                return {
                  ...property,
                  agentKeycloakUser: agentKeycloakUser,
                };
              }
              return property;
            });

            this.toast.success('Agente associato aggiornato con successo');
          },
          error: err => {
            console.error('Error updating agent:', err);
            this.error.set("Errore durante l'aggiornamento dell'agente. Riprova più tardi.");
          },
        });
      })
      .catch(err => {
        console.error('Error preparing agent update request:', err);
        this.isSaving.set(false);
        this.error.set(
          "Errore durante la preparazione della richiesta di aggiornamento dell'agente."
        );
      });
  }

  publishStatus(
    status:
      | 'draft'
      | 'sent'
      | 'published'
      | 'rejected'
      | 'negotiation'
      | 'sold'
      | 'hidden'
      | 'archived'
  ): void {
    // Validate agent selection for publish and approve actions
    if ((status === 'published' || status === 'sent') && !this.selectedAgentId()) {
      this.toast.error("Seleziona un agente prima di pubblicare o approvare l'annuncio");
      return;
    }

    // Continue with existing logic
    if (this.propertyId) {
      this.isSaving.set(true);

      const updateData: Partial<AdvertisementDraft> = {
        id: this.propertyId,
        adStatus: status,
      };

      this.propertyApiService
        .updateAdvertisement(updateData)
        .then(saveObservable => {
          saveObservable.pipe(finalize(() => this.isSaving.set(false))).subscribe({
            next: response => {
              if (response) {
                // Update the property status in our local state
                this.property.update(current => {
                  if (current) {
                    return { ...current, adStatus: status };
                  }
                  return current;
                });

                if (status === 'published') {
                  this.toast.success('Annuncio approvato e pubblicato');
                } else if (status === 'rejected') {
                  this.toast.success('Annuncio rifiutato');
                } else if (status === 'hidden') {
                  this.toast.success('Annuncio nascosto');
                } else if (status === 'archived') {
                  this.toast.success('Annuncio archiviato');
                } else if (status === 'negotiation') {
                  this.toast.success('Annuncio in trattativa');
                } else if (status === 'sold') {
                  this.toast.success('Annuncio venduto');
                } else if (status === 'draft') {
                  this.toast.success('Annuncio in bozza');
                } else if (status === 'sent') {
                  this.toast.success('Annuncio in approvazione');
                }
              } else {
                this.error.set('Errore durante la pubblicazione: ' + response);
              }
            },
            error: err => {
              console.error('Error publishing property:', err);
              this.error.set('Errore durante la pubblicazione della proprietà. Riprova più tardi.');
            },
          });
        })
        .catch(err => {
          console.error('Error preparing publish request:', err);
          this.isSaving.set(false);
          this.error.set('Errore durante la preparazione della richiesta di pubblicazione.');
        });
    }
  }

  isAgentSelected = computed(() => {
    return this.selectedAgentId() !== '' && this.selectedAgentId() !== null;
  });

  canPublishOrApprove = computed(() => {
    return this.isAgentSelected() && this.property()?.adStatus !== 'published';
  });

  // Helper method to calculate price per square meter
  calculatePricePerMeter(): number {
    const price = this.propertyForm.get('price')?.value || 0;
    const squareMetres = this.propertyForm.get('squareMetres')?.value || 1;
    return Math.round(price / squareMetres);
  }

  // Helper method to format date
  formatDate(date: Date): string {
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Get construction year
  getConstructionYear(): string | number {
    return '2001';
  }

  editProperty(propertyId: string): void {
    this.router.navigate(['/cms/annunci/', propertyId]);
  }

  viewProperty(propertyId: string): void {
    window.open(`/property/${propertyId}`, '_blank');
  }

  approveProperty(propertyId: string): void {
    this.publishStatus('published');
  }

  deleteProperty(propertyId: string): void {
    console.log('Delete property:', propertyId);
  }

  formatCreationDate(isoDateString: any): string {
    const date = new Date(isoDateString);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ore ${hours}:${minutes}`;
  }

  getLastSubscriptionActive(): Subscription {
    let subscription = this.subscription()
      ?.filter(sub => !sub.cancel_at_period_end)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

    return subscription == undefined ? <Subscription>{} : subscription;
  }

  createDraftBspTransaction() {
    this.modalType = "create-bpm";
  }

  navigateToBpm(bpmId?: string) {
    if (bpmId) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/bpm/practice/id/', bpmId])
      );
      window.open(url, '_blank');
    }
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected modalAction() {
    if (this.modalType === "create-bpm") {
      if (this.propertyId) {
        this.isSaving.set(true);

        this.propertyApiService
          .createDraftBspTransaction(this.propertyId)
          .then(saveObservable => {
            saveObservable.pipe(finalize(() => {
              this.isSaving.set(false);
              this.modalClosed();
            })).subscribe({
              next: response => {
                if (response && this.propertyId) {
                  this.loadProperty(this.propertyId);
                  this.toast.success("Pratica creata con successo!")

                  this.navigateToBpm((response as AdvertisementDraft).bpmId);
                } else {
                  this.error.set('Errore durante la creazione della pratica: ' + response);
                }
              },
              error: err => {
                console.error('Error on bpm request:', err);
                this.error.set('Errore durante la creazione della pratica. Riprova più tardi.');
              },
            });
          })
          .catch(err => {
            console.error('Error on bpm request:', err);
            this.isSaving.set(false);
            this.modalClosed();
            this.error.set('Errore durante la creazione della pratica.');
          });
      }
    }
  }

  protected readonly faClipboard = faClipboard;
  protected readonly faClipboardList = faClipboardList;
  protected readonly faArrowRight = faArrowRight;
}
