import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  effect,
  inject,
  input,
  OnInit,
  OnDestroy,
  signal,
  ViewChild,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { PropertyToolbarComponent } from '../../../shared/components/property-toolbar/property-toolbar.component';
import { PublishingStepperComponent } from '../../../shared/organisms/property-publishing/publishing-stepper/publishing-stepper.component';
import { PropertyPreviewComponent } from '../../components/property-publishing/property-preview/property-preview.component';
import { StepAddressComponent } from '../../components/property-publishing/step-address/step-address.component';
import { StepExtraFeaturesComponent } from '../../components/property-publishing/step-extra-features/step-extra-features.component';
import { StepFeaturesComponent } from '../../components/property-publishing/step-features/step-features.component';
import { StepFileUploadComponent } from '../../components/property-publishing/step-file-upload/step-file-upload.component';
import { StepPriceComponent } from '../../components/property-publishing/step-price/step-price.component';
import { AdvertisementDraft, ApiError } from '../../models';
import { PaymentService } from '../../service/payment.service';
import { AuthService } from '../../services/auth.service';
import { PlanAndServiceService } from '../../services/plan-and-service.service';
import { PropertyApiService } from '../../services/property-api.service';
import { PropertyPublishingService } from '../../services/property-publishing.service';
import { PropertyEvaluationService } from '../../services/property-evaluation.service';

@Component({
  selector: 'app-property-publishing',
  standalone: true,
  imports: [
    StepAddressComponent,
    StepFeaturesComponent,
    StepExtraFeaturesComponent,
    StepPriceComponent,
    StepFileUploadComponent,
    PublishingStepperComponent,
    PropertyPreviewComponent,
    ButtonComponent,
    PropertyToolbarComponent,
  ],
  templateUrl: './property-publishing.component.html',
})
export class PropertyPublishingComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy
{
  private previousStep = -1;
  private cdr = inject(ChangeDetectorRef);

  @ViewChild(StepAddressComponent) stepAddressComponent?: StepAddressComponent;
  @ViewChild(StepFeaturesComponent) stepFeaturesComponent?: StepFeaturesComponent;
  @ViewChild(StepExtraFeaturesComponent) stepExtraFeaturesComponent?: StepExtraFeaturesComponent;
  @ViewChild(StepPriceComponent) stepPriceComponent?: StepPriceComponent;
  @ViewChild(PropertyPreviewComponent) propertyPreviewComponent?: PropertyPreviewComponent;

  // Services
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private apiService = inject(PropertyApiService);
  private propertyDataService = inject(PropertyPublishingService);
  private propertyEvaluationService = inject(PropertyEvaluationService);
  private paymentService = inject(PaymentService);
  private planService = inject(PlanAndServiceService);

  plans = this.planService.plansList$;
  title = signal('Pubblica il tuo immobile gratuitamente');

  // State
  currentStep = signal(0);
  advertisementId = signal<string | null>(null);
  idAdvertisement = input('');

  // Form validation signals
  isCurrentStepValid = signal(false);

  // Computed property to determine if next button should be enabled
  canProceedToNextStep = computed(() => {
    // Always allow going back
    if (this.currentStep() === 6) {
      return true; // Preview step
    }

    // Check if current step is valid
    return this.isCurrentStepValid();
  });

  formData = signal<{
    address: any | null;
    features: any | null;
    extraFeatures: any | null;
    price: any | null;
  }>({
    address: null,
    features: null,
    extraFeatures: null,
    price: null,
  });

  draftPlan = signal<string | null>(null);

  titleEffect = effect(async () => {
    const planId = this.draftPlan();
    await this.planEffectFn(planId || this.paymentService.settings()?.planId || '');
  });

  // Loading and error states
  isLoading = signal(false);
  isPublishing = signal(false);
  hasError = signal(false);
  errorMessage = signal<string | null>(null);
  publishSuccess = signal(false);

  // UI text
  descFileUploader = 'Carica le foto del tuo immobile';
  descMapUploader = 'Carica la planimetria (Opzionale)';

  // Steps configuration
  steps = [
    { text: 'Indirizzo', completed: true, step: 0 },
    { text: 'Caratteristiche', completed: false, step: 1 },
    { text: 'Caratteristiche aggiuntive', completed: false, step: 2 },
    { text: 'Indicazioni di Prezzo', completed: false, step: 3 },
    { text: 'Carica foto', completed: false, step: 4 },
    { text: 'Carica planimetria', completed: false, step: 5 },
    { text: 'Anteprima', completed: false, step: 6 },
  ];

  // Property data for preview
  propertyDraft = signal<AdvertisementDraft | null>(null);

  constructor(private router: Router) {
    // Initial validation check
    this.validateCurrentStep();
  }

  async ngOnInit() {
    this.idAdvertisement();
    this.isLoading.set(true);
    try {
      const propertyId = this.idAdvertisement();
      if (propertyId) {
        this.advertisementId.set(propertyId);
        await this.loadDraft(propertyId);
        if (this.propertyDraft()?.adStatus === 'draft') {
          this.currentStep.set(1);
        } else {
          this.currentStep.set(6);
        }
      } else {
        const withEvaluation = this.route.snapshot.queryParamMap.get('withEvaluation');
        if (this.paymentService.settings()?.planId && withEvaluation != null) {
          this.draftPlan.set(this.paymentService.settings()?.planId || null);

          if (withEvaluation === 'true') {
            this.propertyDataService.updateStepData(
              'address',
              this.propertyEvaluationService.getStepData('address')
            );
            this.propertyDataService.updateStepData(
              'features',
              this.propertyEvaluationService.getStepData('extraFeatures')
            );
            this.propertyDataService.updateStepData(
              'extraFeatures',
              this.propertyEvaluationService.getStepData('features')
            );
            const serviceData = this.propertyDataService.getPropertyPublishingData();
            this.formData.set({
              address: serviceData.address || this.formData().address,
              features: serviceData.features || this.formData().features,
              extraFeatures: serviceData.extraFeatures || this.formData().extraFeatures,
              price: serviceData.price || this.formData().price,
            });
          } else {
            this.propertyDataService.resetPropertyPublishingData();
          }
        } else {
          this.propertyDataService.resetPropertyPublishingData();
        }
      }

      if (!this.paymentService.settings()?.planId) {
        const freePlan = this.plans().find(p => p.free);
        if (freePlan) {
          this.paymentService.settings.set({
            planId: freePlan.id!,
          });
          this.draftPlan.set(freePlan.id!);
        }
      }
    } catch (error) {
      this.handleError('Authentication check failed', error);
    } finally {
      this.isLoading.set(false);
      // Validate after initial load
      setTimeout(() => this.validateCurrentStep(), 100);
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.updateActiveComponentData();
      this.validateCurrentStep();
      this.setupCustomEventListeners();
    }, 0);
  }

  ngAfterViewChecked() {
    if (this.previousStep !== this.currentStep()) {
      this.previousStep = this.currentStep();
      setTimeout(() => {
        this.updateActiveComponentData();
        this.validateCurrentStep();
      }, 0);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('stepValidationUpdate', this.handleStepValidationUpdate);
      window.removeEventListener('propertyFeaturesUpdated', this.handlePropertyFeaturesUpdate);
      window.removeEventListener('featureButtonChanged', this.handleFeatureButtonChanged);
      window.removeEventListener('stepValidationTrigger', this.handleStepValidationTrigger);
    }
  }

  /**
   * Set up custom event listeners for cross-component validation updates
   */
  private setupCustomEventListeners() {
    if (typeof window !== 'undefined') {
      // Listen for step validation updates
      window.addEventListener('stepValidationUpdate', this.handleStepValidationUpdate);

      // Listen for property features updates
      window.addEventListener('propertyFeaturesUpdated', this.handlePropertyFeaturesUpdate);

      // Listen for feature button changes
      window.addEventListener('featureButtonChanged', this.handleFeatureButtonChanged);

      // Listen for general validation triggers
      window.addEventListener('stepValidationTrigger', this.handleStepValidationTrigger);
    }
  }

  // Event handler methods for cleanup
  private handleStepValidationUpdate = ((event: CustomEvent) => {
    if (event.detail.step === this.currentStep()) {
      console.log('Received step validation update:', event.detail);
      this.isCurrentStepValid.set(event.detail.isValid);
      this.cdr.detectChanges();
    }
  }) as EventListener;

  private handlePropertyFeaturesUpdate = ((event: CustomEvent) => {
    if (this.currentStep() === 1) {
      console.log('Received property features update:', event.detail);
      // Small delay to ensure all form updates are processed
      setTimeout(() => {
        this.validateCurrentStep();
        this.cdr.detectChanges();
      }, 150);
    }
  }) as EventListener;

  private handleFeatureButtonChanged = ((event: CustomEvent) => {
    if (this.currentStep() === 1) {
      console.log('Received feature button change:', event.detail);
      // Trigger validation after feature button selection
      setTimeout(() => {
        this.validateCurrentStep();
        this.cdr.detectChanges();
      }, 100);
    }
  }) as EventListener;

  private handleStepValidationTrigger = ((event: CustomEvent) => {
    console.log('Received validation trigger:', event.detail);
    // General validation trigger - validate current step
    setTimeout(() => {
      this.validateCurrentStep();
      this.cdr.detectChanges();
    }, 100);
  }) as EventListener;

  /**
   * Validate the current step based on form requirements
   */
  private validateCurrentStep() {
    let isValid = false;

    switch (this.currentStep()) {
      case 0: // Address step
        isValid = this.validateAddressStep();
        break;

      case 1: // Features step
        isValid = this.validateFeaturesStep();
        break;

      case 2: // Extra Features step
        isValid = this.validateExtraFeaturesStep();
        break;

      case 3: // Price step
        isValid = this.validatePriceStep();
        break;

      case 4: // File upload step
        isValid = this.validateFileUploadStep();
        break;

      case 5: // Floorplan upload step (optional)
        isValid = true; // Optional step
        break;

      case 6: // Preview step
        isValid = true; // Always valid
        break;

      default:
        isValid = false;
    }

    console.log(`Step ${this.currentStep()} validation result:`, isValid);
    this.isCurrentStepValid.set(isValid);
  }

  /**
   * Validate address step
   */
  private validateAddressStep(): boolean {
    if (!this.stepAddressComponent) {
      return false;
    }

    const form = this.stepAddressComponent.propertyAddressForm;
    const values = form.value;

    // Required fields: street, city, country
    const hasStreet = values.street && values.street.trim().length > 0;
    const hasCity = values.city && values.city.trim().length > 0;
    const hasCountry = values.country && values.country.trim().length > 0;
    const hasValidCoordinates = values.latitude && values.longitude;

    return !!(hasStreet && hasCity && hasCountry && hasValidCoordinates && form.valid);
  }

  /**
   * Validate features step - Enhanced version
   */
  private validateFeaturesStep(): boolean {
    if (!this.stepFeaturesComponent) {
      console.log('Features component not available');
      return false;
    }

    // Use the component's own validation method if available
    if (typeof this.stepFeaturesComponent.isStepValid === 'function') {
      return this.stepFeaturesComponent.isStepValid();
    }

    // Fallback to manual validation
    const destinationType =
      this.stepFeaturesComponent.propertyDestinationsForm.get('destinationType')?.value;
    const propertyType = this.stepFeaturesComponent.propertyFeatureForm.get('propertyType')?.value;
    const propertyFeatures = this.stepFeaturesComponent.propertyFeaturesData;

    console.log('Features validation data:', {
      destinationType,
      propertyType,
      propertyFeatures,
    });

    // Required: destination type, property type, and basic property features
    const hasDestinationType = destinationType && destinationType.trim().length > 0;
    const hasPropertyType = propertyType && propertyType.trim().length > 0;
    const hasSurface = propertyFeatures && propertyFeatures.surface && propertyFeatures.surface > 0;
    const hasPropertyState =
      propertyFeatures &&
      propertyFeatures.property_state &&
      propertyFeatures.property_state.trim().length > 0;

    const isValid = hasDestinationType && hasPropertyType && hasSurface && hasPropertyState;

    console.log('Features validation details:', {
      hasDestinationType,
      hasPropertyType,
      hasSurface,
      hasPropertyState,
      isValid,
    });

    return isValid;
  }

  /**
   * Validate extra features step (optional step)
   */
  private validateExtraFeaturesStep(): boolean {
    // This step is optional, so it's always valid
    return true;
  }

  /**
   * Validate price step
   */
  private validatePriceStep(): boolean {
    if (!this.stepPriceComponent) {
      return false;
    }

    // Use the component's own validation method
    return this.stepPriceComponent.isFormValid();
  }

  /**
   * Validate file upload step
   */
  private validateFileUploadStep(): boolean {
    // For photos step, we should have at least one photo
    // This could be enhanced to check the actual uploaded files
    // For now, we'll make it optional but recommend having photos
    return true; // Make photos optional for now
  }

  /**
   * Enhanced updateActiveComponentData method
   */
  private updateActiveComponentData() {
    const serviceData = this.propertyDataService.getPropertyPublishingData();
    console.log('Updating active component with data:', serviceData);

    switch (this.currentStep()) {
      case 0:
        if (this.stepAddressComponent) {
          this.stepAddressComponent.populateFormFromData(serviceData.address);
          // Set up validation listener for this step
          setTimeout(() => {
            this.stepAddressComponent?.propertyAddressForm.valueChanges.subscribe(() => {
              if (this.currentStep() === 0) {
                this.validateCurrentStep();
              }
            });
          }, 100);
        }
        break;

      case 1:
        if (this.stepFeaturesComponent) {
          this.stepFeaturesComponent.populateFormFromData(serviceData.features);
          // Set up validation listeners with proper debouncing
          setTimeout(() => {
            this.stepFeaturesComponent?.propertyDestinationsForm.valueChanges.subscribe(() => {
              if (this.currentStep() === 1) {
                setTimeout(() => this.validateCurrentStep(), 100);
              }
            });
            this.stepFeaturesComponent?.propertyFeatureForm.valueChanges.subscribe(() => {
              if (this.currentStep() === 1) {
                setTimeout(() => this.validateCurrentStep(), 100);
              }
            });
          }, 100);
        }
        break;

      case 2:
        if (this.stepExtraFeaturesComponent) {
          this.stepExtraFeaturesComponent.populateFormFromData(serviceData.extraFeatures);
        }
        break;

      case 3: // Price step
        if (this.stepPriceComponent) {
          this.stepPriceComponent.populateFormFromData(serviceData.price);

          // Set up validation listener for price changes
          setTimeout(() => {
            // Listen to propertyPrice changes specifically
            this.stepPriceComponent?.propertyPriceForm
              .get('propertyPrice')
              ?.valueChanges.subscribe(() => {
                if (this.currentStep() === 3) {
                  setTimeout(() => this.validateCurrentStep(), 50);
                }
              });

            // Also listen to hasCondoFees changes (though not required for validation)
            this.stepPriceComponent?.propertyPriceForm
              .get('hasCondoFees')
              ?.valueChanges.subscribe(() => {
                if (this.currentStep() === 3) {
                  setTimeout(() => this.validateCurrentStep(), 50);
                }
              });
          }, 100);
        }
        break;

      case 6:
        if (this.propertyPreviewComponent && this.propertyDraft()) {
          this.propertyPreviewComponent.property = this.propertyDraft() as any;
        }
        break;
    }
  }

  async planEffectFn(planId: string) {
    let plan = (await this.planService.getById(planId)) as any;
    if (plan) {
      this.title.set(
        `Pubblica il tuo immobile  ${plan?.plan?.title ? `- Piano ${plan?.plan?.title}` : 'gratuitamente'}`
      );
    }
  }

  private handleError(context: string, error: any) {
    console.error(`${context}:`, error);
    this.hasError.set(true);
    this.errorMessage.set(error?.message || 'An unexpected error occurred. Please try again.');
  }

  private async loadDraft(propertyId: any): Promise<void> {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    try {
      const draftObservable = await this.apiService.getDraftById(propertyId);

      return new Promise<void>((resolve, reject) => {
        draftObservable.pipe(finalize(() => this.isLoading.set(false))).subscribe({
          next: response => {
            if (this.isApiError(response)) {
              this.handleApiError(response);
              reject(response);
              return;
            }

            const draft = response as AdvertisementDraft;
            if (!draft || !draft.id) {
              resolve();
              return;
            }

            this.advertisementId.set(draft.id);
            if (draft.lastActiveSubscriptionId) {
              this.draftPlan.set(draft.lastActiveSubscriptionId);
            }

            this.mapDraftToFormData(draft);
            this.propertyDraft.set(draft);
            resolve();
          },
          error: err => {
            this.handleError('Error fetching draft', err);
            reject(err);
          },
        });
      });
    } catch (error) {
      this.handleError('Error loading draft', error);
      this.isLoading.set(false);
      return Promise.reject(error);
    }
  }

  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  private handleApiError(error: ApiError) {
    this.hasError.set(true);
    this.errorMessage.set(error.message);
    console.error(`API Error (${error.type}):`, error.message);
  }

  private updateCompletedSteps(completedStep: number) {
    this.steps.forEach(step => (step.completed = false));
    for (let i = 0; i <= completedStep && i < this.steps.length; i++) {
      this.steps[i].completed = true;
    }
  }

  private mapDraftToFormData(draft: AdvertisementDraft) {
    const updatedFormData = {
      address: {
        street: draft.address || '',
        street_number: draft.houseNumber || '',
        zip_code: draft.zipCode || '',
        city: draft.city || '',
        country: draft.country || 'Italia',
        latitude: draft.latitude ? parseFloat(String(draft.latitude)) : 45.4642,
        longitude: draft.longitude ? parseFloat(String(draft.longitude)) : 9.19,
      },
      draftPlanSelected: draft.draftPlanSelected
        ? draft.draftPlanSelected
        : this.paymentService.settings()?.planId
          ? this.paymentService.settings()?.planId
          : null,
      features: {
        destinationType: draft.category || '',
        propertyType: draft.type || '',
        propertyFeatures: {
          surface: draft.squareMetres || 0,
          rooms_number: draft.numberRooms || 1,
          bathroom_number: draft.numberBaths || 1,
          floor_number: draft.floor || 1,
          property_state: draft.propertyCondition || '',
          yearOfConstruction: draft.yearOfConstruction || new Date().getFullYear() - 2,
          deed_state: draft.deed_state || null,
          heating: draft.heating || null,
          energy_state: draft.energyClass || null,
        },
      },
      extraFeatures: {
        optionalDescription: draft.description || '',
        propertyExtraFeatures: draft.features
          ? draft.features
              .split(',')
              .map(f => f.trim())
              .filter(Boolean)
          : [],
      },
      price: {
        propertyPrice: draft.price || 0,
        hasCondoFees: draft.condoFees && parseFloat(String(draft.condoFees)) > 0 ? 'yes' : 'no',
        condoFees: draft.condoFees ? parseFloat(String(draft.condoFees)) : 0,
      },
    };

    if (draft.images && draft.images.length > 0) {
      const photoIds = draft.images.map(img => img.id.toString());
      if (photoIds.length > 0) {
        draft.photoIds = photoIds;
      }
    }

    this.formData.set(updatedFormData);

    Object.entries(updatedFormData).forEach(([key, value]) => {
      this.propertyDataService.updateStepData(key as any, value);
    });
  }

  async onStepChange(step: number) {
    const property = this.propertyDraft();
    if (step > this.currentStep()) {
      // Validate current step before proceeding
      if (!this.canProceedToNextStep()) {
        console.warn('Cannot proceed to next step: current step is not valid');
        return;
      }

      await this.collectAndSubmitCurrentStepData();

      if (step === 6 && property) {
        await this.loadDraft(property?.id);
      }

      setTimeout(() => {
        this.currentStep.set(step);
        this.updateCompletedSteps(step);
        this.validateCurrentStep();
      }, 300);
    } else {
      const serviceData = this.propertyDataService.getPropertyPublishingData();
      this.formData.set({
        address: serviceData.address || this.formData().address,
        features: serviceData.features || this.formData().features,
        extraFeatures: serviceData.extraFeatures || this.formData().extraFeatures,
        price: serviceData.price || this.formData().price,
      });

      this.currentStep.set(step);
      this.updateCompletedSteps(step);
      setTimeout(() => this.validateCurrentStep(), 100);
    }
  }

  private async collectAndSubmitCurrentStepData() {
    this.collectDataFromActiveComponent();
    const stepData = this.getStepData(this.currentStep());
    if (stepData) {
      await this.saveCurrentData({ ...stepData, draftStep: this.currentStep() });
    }
  }

  private collectDataFromActiveComponent() {
    switch (this.currentStep()) {
      case 0:
        if (this.stepAddressComponent) {
          const formValue = this.stepAddressComponent.propertyAddressForm.value;
          this.propertyDataService.updateStepData('address', formValue);
        }
        break;

      case 1:
        if (this.stepFeaturesComponent) {
          const destinationType =
            this.stepFeaturesComponent.propertyDestinationsForm.get('destinationType')?.value;
          const propertyType =
            this.stepFeaturesComponent.propertyFeatureForm.get('propertyType')?.value;
          const featuresData = {
            destinationType,
            propertyType,
            propertyFeatures: this.stepFeaturesComponent.propertyFeaturesData,
          };
          this.propertyDataService.updateStepData('features', featuresData);
        }
        break;

      case 2:
        if (this.stepExtraFeaturesComponent) {
          const formValue = this.stepExtraFeaturesComponent.propertyExtraFeatureForm.value;
          this.propertyDataService.updateStepData('extraFeatures', formValue);
        }
        break;

      case 3:
        if (this.stepPriceComponent) {
          const formValue = this.stepPriceComponent.propertyPriceForm.value;
          const priceData = {
            propertyPrice: formValue.propertyPrice || 0,
            hasCondoFees: formValue.hasCondoFees || 'no',
            condoFees: formValue.condoFees || 0,
          };
          this.propertyDataService.updateStepData('price', priceData);
        }
        break;
    }
  }

  private getStepData(step: number): Partial<AdvertisementDraft> | null {
    const serviceData = this.propertyDataService.getPropertyPublishingData();
    console.log(`Preparing data for step ${step}:`, serviceData);

    switch (step) {
      case 0:
        if (!serviceData.address) {
          console.warn('Address data missing');
          if (this.stepAddressComponent) {
            const formData = this.stepAddressComponent.propertyAddressForm.value;
            return {
              latitude: formData.latitude || 45.4642,
              longitude: formData.longitude || 9.19,
              address: formData.street || '',
              houseNumber: formData.street_number || '',
              zipCode: formData.zip_code || '',
              city: formData.city || '',
              country: formData.country || 'Italia',
            };
          }
          return null;
        }

        return {
          latitude: serviceData.address.latitude,
          longitude: serviceData.address.longitude,
          address: serviceData.address.street,
          houseNumber: serviceData.address.street_number,
          zipCode: serviceData.address.zip_code,
          city: serviceData.address.city,
          country: serviceData.address.country,
        };

      case 1:
        if (!serviceData.features) {
          console.warn('Features data missing');
          if (this.stepFeaturesComponent) {
            const destinationType =
              this.stepFeaturesComponent.propertyDestinationsForm.get('destinationType')?.value;
            const propertyType =
              this.stepFeaturesComponent.propertyFeatureForm.get('propertyType')?.value;
            const propertyFeatures = this.stepFeaturesComponent.propertyFeaturesData || {};

            return {
              category: destinationType || 'Residenziale',
              type: propertyType || '',
              squareMetres: propertyFeatures.surface || 0,
              numberRooms: propertyFeatures.rooms_number || 1,
              numberBaths: propertyFeatures.bathroom_number || 1,
              floor: propertyFeatures.floor_number || 1,
              propertyCondition: propertyFeatures.property_state || '',
              yearOfConstruction:
                propertyFeatures.yearOfConstruction || new Date().getFullYear() - 2,
              heating: propertyFeatures.heating || null,
              energyClass: propertyFeatures.energy_state || null,
            };
          }
          return null;
        }

        const features = serviceData.features;
        const propertyFeatures = features.propertyFeatures || {};
        return {
          category: features.destinationType || 'Residenziale',
          type: features.propertyType || '',
          squareMetres: propertyFeatures.surface || 0,
          numberRooms: propertyFeatures.rooms_number || 1,
          numberBaths: propertyFeatures.bathroom_number || 1,
          floor: propertyFeatures.floor_number || 1,
          propertyCondition: propertyFeatures.property_state || '',
          yearOfConstruction: propertyFeatures.yearOfConstruction || new Date().getFullYear() - 2,
          heating: propertyFeatures.heating || null,
          energyClass: propertyFeatures.energy_state || null,
        };

      case 2:
        if (!serviceData.extraFeatures) {
          console.warn('Extra features data missing');
          if (this.stepExtraFeaturesComponent) {
            const formData = this.stepExtraFeaturesComponent.propertyExtraFeatureForm.value;
            return {
              description: formData.optionalDescription || '',
              features:
                formData.propertyExtraFeatures && formData.propertyExtraFeatures.length > 0
                  ? formData.propertyExtraFeatures.join(',')
                  : '',
            };
          }
          return null;
        }

        const extra = serviceData.extraFeatures;
        return {
          description: extra.optionalDescription || '',
          features:
            extra.propertyExtraFeatures && extra.propertyExtraFeatures.length > 0
              ? extra.propertyExtraFeatures.join(',')
              : '',
        };

      case 3:
        if (!serviceData.price) {
          console.warn('Price data missing');
          if (this.stepPriceComponent) {
            const formData = this.stepPriceComponent.propertyPriceForm.value;
            return {
              price: formData.propertyPrice || 0,
              condoFees: formData.hasCondoFees === 'yes' ? formData.condoFees || 0 : 0,
            };
          }
          return null;
        }

        const price = serviceData.price;
        return {
          price: price.propertyPrice || 0,
          condoFees: price.hasCondoFees === 'yes' ? price.condoFees || 0 : 0,
        };

      case 4:
        return { draftStep: step };
      case 5:
        return { draftStep: step };
      case 6:
        return { draftStep: step };

      default:
        return null;
    }
  }

  private async saveCurrentData(data: Partial<AdvertisementDraft>): Promise<void> {
    if (!data) return;

    this.isLoading.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);

    try {
      data.draftStep = this.currentStep();

      if (!this.advertisementId()) {
        data.createdByKeycloakUser = this.authService.getUserData()?.id;
        data.adStatus = 'draft';
        data.draftPlanSelected = this.paymentService.settings()?.planId || undefined;
      } else {
        data.id = this.advertisementId() || '';
        data.draftPlanSelected = this.paymentService.settings()?.planId ?? data.draftPlanSelected;
      }

      console.log('Saving advertisement data:', data);
      if (this.currentStep() !== 4 && this.currentStep() !== 5) {
        const saveObservable = await this.apiService.saveAdvertisement(data);

        return new Promise<void>((resolve, reject) => {
          saveObservable.pipe(finalize(() => this.isLoading.set(false))).subscribe({
            next: response => {
              if (this.isApiError(response)) {
                this.handleApiError(response);
                reject(response);
                return;
              }

              const draft = response as AdvertisementDraft;
              if (draft?.id && !this.advertisementId()) {
                this.advertisementId.set(draft.id);
              }

              this.propertyDraft.set(draft);
              console.log('Advertisement saved successfully');
              resolve();
            },
            error: error => {
              this.handleError('Save failed', error);
              reject(error);
            },
          });
        });
      } else {
        this.isLoading.set(false);
        return Promise.resolve();
      }
    } catch (error) {
      this.handleError('Error saving data', error);
      this.isLoading.set(false);
      return Promise.reject(error);
    }
  }

  async publishListing() {
    if (!this.advertisementId()) {
      this.handleError('Publish failed', 'No draft ID available');
      return;
    }

    this.isPublishing.set(true);
    this.hasError.set(false);
    this.errorMessage.set(null);
    this.publishSuccess.set(false);

    try {
      const data: Partial<AdvertisementDraft> = {
        id: this.advertisementId() || '',
        adStatus: 'sent',
        draftStep: this.currentStep(),
      };

      const saveObservable = await this.apiService.saveAdvertisement(data);

      saveObservable.pipe(finalize(() => this.isPublishing.set(false))).subscribe({
        next: response => {
          if (this.isApiError(response)) {
            this.handleApiError(response);
            return;
          }

          console.log('Listing published successfully!');
          this.publishSuccess.set(true);

          const updatedDraft = response as AdvertisementDraft;
          this.propertyDraft.set(updatedDraft);
        },
        error: error => {
          this.handleError('Publication failed', error);
          this.publishSuccess.set(false);
        },
      });
    } catch (error) {
      this.handleError('Error publishing listing', error);
      this.isPublishing.set(false);
      this.publishSuccess.set(false);
    }
  }

  goToEdit() {
    this.currentStep.set(5);
    this.updateCompletedSteps(5);
  }

  goToMyAds() {
    this.router.navigate(['/annunci']);
  }
}
