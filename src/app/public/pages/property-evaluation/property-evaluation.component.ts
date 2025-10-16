// property-evaluation.component.ts
import {
  Component,
  inject,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { StepAddressComponent } from '../../components/property-evaluation/step-address/step-address.component';
import { StepExtraFeaturesComponent } from '../../components/property-evaluation/step-extra-features/step-extra-features.component';
import { StepFeaturesComponent } from '../../components/property-evaluation/step-features/step-features.component';
import { PropertyEvaluationService } from '../../services/property-evaluation.service';
import { StepEvaluationResultComponent } from '../../components/property-evaluation/step-evaluation-result/step-evaluation-result.component';
import { EvaluationStepperComponent } from '../../../shared/organisms/property-evaluation/evaluation-stepper/evaluation-stepper.component';
import { AuthService } from '../../services/auth.service';
import { EvaluationNavigationService } from '../../services/evaluation-navigation.service';

@Component({
  selector: 'app-property-evaluation',
  standalone: true,
  imports: [
    RouterModule,
    EvaluationStepperComponent,
    StepAddressComponent,
    StepFeaturesComponent,
    StepExtraFeaturesComponent,
    StepEvaluationResultComponent,
  ],
  templateUrl: './property-evaluation.component.html',
})
export class PropertyEvaluationComponent implements OnInit, AfterViewInit {
  @ViewChild(StepAddressComponent) stepAddressComponent!: StepAddressComponent;
  @ViewChild(StepFeaturesComponent) stepFeaturesComponent!: StepFeaturesComponent;
  @ViewChild(StepExtraFeaturesComponent) stepExtraFeaturesComponent!: StepExtraFeaturesComponent;

  property_evaluation_service = inject(PropertyEvaluationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private evaluationNavigationService = inject(EvaluationNavigationService);
  private cdr = inject(ChangeDetectorRef);

  title: string = 'Valutazione immobile';

  currentStep = 0;
  steps = [
    { text: 'Indirizzo', completed: false, step: 0 },
    { text: 'Caratteristiche', completed: false, step: 1 },
    { text: 'Caratteristiche aggiuntive', completed: false, step: 2 },
    { text: 'Risultato Valutazione', completed: false, step: 3 },
  ];

  ngOnInit(): void {
    console.log('property evaluation');

    // Check if this is a fresh evaluation start (coming from hero button or similar)
    const urlParams = new URLSearchParams(window.location.search);
    const stepParam = urlParams.get('step');
    const addressParam = urlParams.get('address');

    // If there's an address parameter, this is a fresh start from the hero button
    if (addressParam && !stepParam) {
      console.log('Starting fresh evaluation with address:', addressParam);

      // AGGRESSIVE CLEARING - Clear everything
      this.property_evaluation_service.clearEvaluationData('Fresh start with address');
      localStorage.removeItem('redirectToEvaluationResults');
      localStorage.removeItem('postVerificationRedirect');

      // Pre-populate the address step with the provided address
      this.prePopulateAddress(addressParam);

      // Force start from the beginning - no checks, just set it
      this.currentStep = 0;
      this.resetStepCompletion();

      console.log('Forced currentStep to 0 for fresh start');
      return;
    }

    // If there's no address parameter and no step parameter, also start fresh
    if (!addressParam && !stepParam) {
      console.log('Starting fresh evaluation without address');
      // Check if we should start fresh vs continue existing evaluation
      if (!this.property_evaluation_service.hasValidEvaluationData()) {
        this.currentStep = 0;
        this.resetStepCompletion();
        console.log('No valid data, starting from step 0');
        return;
      } else {
        console.log('Found existing valid data, continuing from stored position');
      }
    }

    if (stepParam === 'results') {
      // Check if we have valid evaluation data before showing results
      if (this.property_evaluation_service.hasValidEvaluationData()) {
        this.currentStep = 3; // Go to results step
        this.updateStepCompletionStatus();
      } else {
        console.warn('No evaluation data found for results step, redirecting to start');
        // Clear any redirect flags and start fresh
        localStorage.removeItem('redirectToEvaluationResults');
        this.router.navigate(['/property-evaluation']);
        return;
      }

      // Clear any localStorage flag if it exists
      localStorage.removeItem('redirectToEvaluationResults');
    } else {
      // Also check localStorage as fallback
      const shouldRedirectToResults = localStorage.getItem('redirectToEvaluationResults');
      if (shouldRedirectToResults === 'true') {
        if (this.property_evaluation_service.hasValidEvaluationData()) {
          localStorage.removeItem('redirectToEvaluationResults');
          this.currentStep = 3; // Go to results step
          this.updateStepCompletionStatus();
        } else {
          // Clear the flag but don't redirect, let user restart evaluation
          localStorage.removeItem('redirectToEvaluationResults');
          this.currentStep = 0;
          this.resetStepCompletion();
        }
      } else {
        // Normal flow - check what steps have been completed and set current step accordingly
        // Only do this if we don't have an address parameter (which indicates fresh start)
        if (!addressParam) {
          this.initializeStepFromStoredData();
        }
      }
    }

    console.log('Final currentStep:', this.currentStep);
  }

  ngAfterViewInit(): void {
    // Subscribe to form changes after view init to trigger validation updates
    this.setupValidationListeners();
  }

  /**
   * Setup validation listeners for all step forms
   */
  private setupValidationListeners(): void {
    // Set up listeners after a small delay to ensure components are fully initialized
    setTimeout(() => {
      if (this.stepAddressComponent?.propertyAddressForm) {
        this.stepAddressComponent.propertyAddressForm.valueChanges.subscribe(() => {
          this.cdr.detectChanges();
        });

        this.stepAddressComponent.propertyAddressForm.statusChanges.subscribe(() => {
          this.cdr.detectChanges();
        });
      }

      if (this.stepFeaturesComponent?.propertyDestinationsForm) {
        this.stepFeaturesComponent.propertyDestinationsForm.valueChanges.subscribe(() => {
          this.cdr.detectChanges();
        });
      }

      if (this.stepFeaturesComponent?.propertyFeatureForm) {
        this.stepFeaturesComponent.propertyFeatureForm.valueChanges.subscribe(() => {
          this.cdr.detectChanges();
        });
      }
    }, 100);
  }

  /**
   * Pre-populate address data from URL parameter
   */
  private prePopulateAddress(address: string): void {
    // Store the address for the address component to use
    sessionStorage.setItem('prePopulateAddress', address);
  }

  /**
   * Reset all step completion status
   */
  private resetStepCompletion(): void {
    this.steps.forEach(step => (step.completed = false));
  }

  /**
   * Initialize the current step based on stored evaluation data
   * Only proceed if we actually have valid data
   */
  private initializeStepFromStoredData(): void {
    // First check if we have any valid evaluation data at all
    if (!this.property_evaluation_service.hasValidEvaluationData()) {
      console.log('No valid evaluation data found, starting from step 0');
      this.currentStep = 0;
      this.resetStepCompletion();
      return;
    }

    // If we have valid data, then check step completion
    if (this.property_evaluation_service.isStepCompleted('address')) {
      this.steps[0].completed = true;

      if (this.property_evaluation_service.isStepCompleted('features')) {
        this.steps[1].completed = true;
        this.currentStep = Math.max(this.currentStep, 2);

        if (this.property_evaluation_service.isStepCompleted('extraFeatures')) {
          this.steps[2].completed = true;
        }
      } else {
        this.currentStep = Math.max(this.currentStep, 1);
      }
    } else {
      // No address data, start from beginning
      this.currentStep = 0;
      this.resetStepCompletion();
    }
  }

  /**
   * Update step completion status based on stored data
   */
  private updateStepCompletionStatus(): void {
    this.steps[0].completed = this.property_evaluation_service.isStepCompleted('address');
    this.steps[1].completed = this.property_evaluation_service.isStepCompleted('features');
    this.steps[2].completed = this.property_evaluation_service.isStepCompleted('extraFeatures');
  }

  // Check if current step is valid - IMPROVED VALIDATION
  isCurrentStepValid(): boolean {
    console.log('Checking validation for step:', this.currentStep);

    switch (this.currentStep) {
      case 0:
        return this.isAddressStepValid();
      case 1:
        return this.isFeaturesStepValid();
      case 2:
        return this.isExtraFeaturesStepValid();
      case 3:
        return true; // Results step is always valid
      default:
        return false;
    }
  }

  private isAddressStepValid(): boolean {
    if (!this.stepAddressComponent?.propertyAddressForm) {
      console.log('Address form not available');
      return false;
    }

    const form = this.stepAddressComponent.propertyAddressForm;
    const streetControl = form.get('street');
    const cityControl = form.get('city');

    // Check if required fields are filled
    const hasStreet = streetControl?.value && streetControl.value.trim().length > 0;
    const hasCity = cityControl?.value && cityControl.value.trim().length > 0;

    console.log('Address validation:', {
      hasStreet,
      hasCity,
      streetValue: streetControl?.value,
      cityValue: cityControl?.value,
      formValid: form.valid,
    });

    // At minimum, we need street and city
    return !!(hasStreet && hasCity);
  }

  private isFeaturesStepValid(): boolean {
    if (!this.stepFeaturesComponent) {
      console.log('Features component not available');
      return false;
    }

    const destinationForm = this.stepFeaturesComponent.propertyDestinationsForm;
    const featureForm = this.stepFeaturesComponent.propertyFeatureForm;

    if (!destinationForm || !featureForm) {
      console.log('Forms not available');
      return false;
    }

    const hasDestination = destinationForm.get('destinationType')?.value;
    const hasPropertyType = featureForm.get('propertyType')?.value;

    // Check property features sub-form
    const propertyFeaturesForm = featureForm.get('propertyFeatures');
    const hasSquareMetres = (propertyFeaturesForm?.get('square_metres')?.value ?? 0) > 0;
    const hasRooms = (propertyFeaturesForm?.get('number_rooms')?.value ?? 0) >= 1;
    const hasBathrooms = (propertyFeaturesForm?.get('bathroom_number')?.value ?? 0) >= 1;

    console.log('Features validation:', {
      hasDestination,
      hasPropertyType,
      hasSquareMetres,
      hasRooms,
      hasBathrooms,
      destinationValue: destinationForm.get('destinationType')?.value,
      propertyTypeValue: featureForm.get('propertyType')?.value,
      squareMetresValue: propertyFeaturesForm?.get('square_metres')?.value,
      roomsValue: propertyFeaturesForm?.get('number_rooms')?.value,
      bathroomsValue: propertyFeaturesForm?.get('bathroom_number')?.value,
    });

    // Need destination, property type, and basic property features
    return !!(hasDestination && hasPropertyType && hasSquareMetres && hasRooms && hasBathrooms);
  }

  private isExtraFeaturesStepValid(): boolean {
    // Extra features step is always valid as it's optional
    console.log('Extra features step validation: always true (optional)');
    return true;
  }

  formStepSubmissions = () => {
    switch (this.currentStep) {
      case 0:
        if (this.stepAddressComponent && this.isAddressStepValid()) {
          this.stepAddressComponent.submitAddressForm();
          this.steps[0].completed = true;
        }
        break;
      case 1:
        if (this.stepFeaturesComponent && this.isFeaturesStepValid()) {
          this.stepFeaturesComponent.submitFeatureForm();
          this.steps[1].completed = true;
        }
        break;
      case 2:
        if (this.stepExtraFeaturesComponent) {
          this.stepExtraFeaturesComponent.submitExtraFeatureForm();
          this.steps[2].completed = true;
        }
        break;
    }
  };

  onStepChange(step: number) {
    // Submit current step before changing
    if (step > this.currentStep) {
      this.formStepSubmissions();
    }

    this.currentStep = step;
    console.log('firingOnStepChange', this.currentStep);
    console.log('evaluationData', this.property_evaluation_service.getEvaluationData());
  }

  async onDiscoverEvaluation() {
    console.log('Discover evaluation clicked');

    // Submit the extra features form first
    if (this.stepExtraFeaturesComponent) {
      this.stepExtraFeaturesComponent.submitExtraFeatureForm();
      this.steps[2].completed = true;
    }

    // Check if user is authenticated
    const isLoggedIn = await this.authService.isAuthenticated();

    if (!isLoggedIn) {
      // Store the intention to see results after login/register
      localStorage.setItem('redirectToEvaluationResults', 'true');

      // Redirect to register page
      await this.router.navigate(['/register'], {
        queryParams: {
          returnUrl: '/property-evaluation',
          step: 'results',
          fromEvaluation: true,
        },
      });
      return;
    } else {
      // User is logged in, go to results
      this.currentStep = 3;
      this.steps[3].completed = true;
    }
  }

  /**
   * Start a fresh evaluation process
   */
  startFreshEvaluation(): void {
    this.evaluationNavigationService.startFreshEvaluation();
  }
}
