// step-features.component.ts
import { Component, inject, input, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { commercialTypeList, propertyDestinations, residentialTypeList } from '../../../mock/data';
import { PropertyFeature } from '../../../models';
import { FeatureButtonComponent } from '../../../../shared/molecules/feature-button/feature-button.component';
import { PropertyFeaturesComponent } from '../property-features/property-features.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyEvaluationService } from '../../../services/property-evaluation.service';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-step-features',
  standalone: true,
  imports: [CommonModule, FeatureButtonComponent, PropertyFeaturesComponent, ReactiveFormsModule],
  templateUrl: './step-features.component.html',
})
export class StepFeaturesComponent implements OnInit, OnDestroy {
  @ViewChild(PropertyFeaturesComponent) propertyFeaturesChild!: PropertyFeaturesComponent;

  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUrl: string = '';
  isFreePublishing = input<boolean>(false);
  title = input<string>('');
  property_evaluation_service = inject(PropertyEvaluationService);
  propertyTypeList: PropertyFeature[] = residentialTypeList;
  propertyDestinations: PropertyFeature[] = propertyDestinations;
  selectedDestinationId: number | null = null;
  selectedFeatureId: number | null = null;
  selectedPropertyType: boolean = false;
  propertyDestination: string | null = null;

  propertyDestinationsForm = new FormGroup({
    destinationType: new FormControl<string | null>(null, [Validators.required]),
    residential: new FormControl<string>('Residenziale'),
    commercial: new FormControl<string>('Commerciale'),
  });

  propertyFeatureForm = new FormGroup({
    propertyType: new FormControl<string | null>(null, [Validators.required]),
    propertyFeatures: new FormGroup({
      square_metres: new FormControl(0, [Validators.required, Validators.min(1)]),
      floor_number: new FormControl(1, [Validators.required, Validators.min(0)]),
      number_rooms: new FormControl(1, [Validators.required, Validators.min(1)]),
      bathroom_number: new FormControl(1, [Validators.required, Validators.min(1)]),
      property_state: new FormControl('', [Validators.required]),
      yearOfContruction: new FormControl<number>(2021, [
        Validators.required,
        Validators.min(1900),
        Validators.max(new Date().getFullYear()),
      ]),
      deed_state: new FormControl<string | null>(null),
      heating: new FormControl<string | null>(null),
      energy_state: new FormControl<string | null>(null),
    }),
  });

  ngOnInit() {
    this.trackDestinationChanges();
    this.currentUrl = this.router.url;

    // Try to restore data from previous evaluation
    this.restoreFormData();

    console.log('propertyFeatureForm', this.propertyFeatureForm.value);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Restore form data from previous evaluation
   */
  private restoreFormData(): void {
    const evaluationData = this.property_evaluation_service.getEvaluationData();
    if (evaluationData?.features) {
      const features = evaluationData.features;

      // Restore destination type
      if (features.destinationType) {
        this.propertyDestinationsForm.patchValue({
          destinationType: features.destinationType,
        });

        // Find and set the selected destination ID
        const destination = this.propertyDestinations.find(
          d => d.label === features.destinationType
        );
        if (destination) {
          this.selectedDestinationId = destination.id;
          this.propertyDestination = features.destinationType;
          this.setPropertyTypeList();
        }
      }

      // Restore property type
      if (features.propertyType) {
        this.propertyFeatureForm.patchValue({
          propertyType: features.propertyType,
        });

        // Find and set the selected feature ID
        const propertyType = this.propertyTypeList.find(p => p.label === features.propertyType);
        if (propertyType) {
          this.selectedFeatureId = propertyType.id;
        }
      }

      // Restore property features
      if (features.propertyFeatures) {
        this.propertyFeatureForm.patchValue({
          propertyFeatures: features.propertyFeatures,
        });
      }
    }
  }

  trackDestinationChanges() {
    this.propertyDestinationsForm
      .get('destinationType')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.propertyDestination = value;
        this.setPropertyTypeList();

        // Reset property type selection when destination changes
        if (
          this.propertyFeatureForm.get('propertyType')?.value &&
          value !== this.propertyDestination
        ) {
          this.propertyFeatureForm.patchValue({ propertyType: null });
          this.selectedFeatureId = null;
        }
      });
  }

  setPropertyTypeList = () => {
    this.propertyTypeList =
      this.propertyDestination === 'Residenziale' ? residentialTypeList : commercialTypeList;
  };

  toggleDestination(destination: PropertyFeature, fragment: any) {
    const currentValue = this.propertyDestinationsForm.get('destinationType')?.value;

    if (currentValue === destination.label) {
      this.propertyDestinationsForm.patchValue({ destinationType: null });
      this.selectedDestinationId = null;
      this.propertyDestination = null;

      // Also reset property type when destination is deselected
      this.propertyFeatureForm.patchValue({ propertyType: null });
      this.selectedFeatureId = null;
    } else {
      this.propertyDestinationsForm.patchValue({ destinationType: destination.label });
      this.selectedDestinationId = destination.id;
      this.propertyDestination = destination.label;
      this.setPropertyTypeList();
    }

    // Mark form as touched for validation
    this.propertyDestinationsForm.get('destinationType')?.markAsTouched();

    this.router.navigateByUrl(`${this.currentUrl}#${fragment}`);
  }

  toggleProperty(property: PropertyFeature, fragment: any) {
    const currentValue = this.propertyFeatureForm.get('propertyType')?.value;

    if (currentValue === property.label) {
      this.propertyFeatureForm.patchValue({ propertyType: null });
      this.selectedFeatureId = null;
    } else {
      this.propertyFeatureForm.patchValue({ propertyType: property.label });
      this.selectedFeatureId = property.id;
    }

    // Mark form as touched for validation
    this.propertyFeatureForm.get('propertyType')?.markAsTouched();

    this.router.navigateByUrl(`${this.currentUrl}#${fragment}`);
  }

  updatePropertyFeatures(formData: any) {
    this.propertyFeatureForm.patchValue({
      propertyFeatures: formData,
    });

    // Mark property features as touched for validation
    const propertyFeaturesGroup = this.propertyFeatureForm.get('propertyFeatures');
    if (propertyFeaturesGroup instanceof FormGroup) {
      Object.keys(propertyFeaturesGroup.controls).forEach(key => {
        propertyFeaturesGroup.get(key)?.markAsTouched();
      });
    }
  }

  /**
   * Check if the features form is valid
   */
  isFormValid(): boolean {
    const hasDestination = this.propertyDestinationsForm.get('destinationType')?.value;
    const hasPropertyType = this.propertyFeatureForm.get('propertyType')?.value;

    // Check property features sub-form
    const propertyFeaturesForm = this.propertyFeatureForm.get('propertyFeatures');
    const hasSquareMetres = (propertyFeaturesForm?.get('square_metres')?.value ?? 0) > 0;
    const hasRooms = (propertyFeaturesForm?.get('number_rooms')?.value ?? 1) >= 1;
    const hasBathrooms = (propertyFeaturesForm?.get('bathroom_number')?.value ?? 1) >= 1;

    return !!(
      hasDestination &&
      hasPropertyType &&
      hasSquareMetres &&
      hasRooms &&
      hasBathrooms &&
      this.propertyDestinationsForm.valid &&
      this.propertyFeatureForm.valid
    );
  }

  submitFeatureForm() {
    // Mark all fields as touched to show validation errors
    this.markAllFieldsAsTouched();

    if (this.isFormValid()) {
      console.log('submitFeatureForm', {
        destinationType: this.propertyDestinationsForm.get('destinationType')?.value,
        propertyType: this.propertyFeatureForm.get('propertyType')?.value,
        propertyFeatures: this.propertyFeatureForm.get('propertyFeatures')?.value,
      });

      const formData = {
        destinationType: this.propertyDestinationsForm.get('destinationType')?.value,
        ...this.propertyFeatureForm.value,
      };

      this.property_evaluation_service.updateStepData('features', formData);
    } else {
      console.log('Features form is invalid:', {
        destinationFormValid: this.propertyDestinationsForm.valid,
        propertyFormValid: this.propertyFeatureForm.valid,
        destinationFormErrors: this.getFormErrors(this.propertyDestinationsForm),
        propertyFormErrors: this.getFormErrors(this.propertyFeatureForm),
        destinationValue: this.propertyDestinationsForm.get('destinationType')?.value,
        propertyTypeValue: this.propertyFeatureForm.get('propertyType')?.value,
        propertyFeaturesValue: this.propertyFeatureForm.get('propertyFeatures')?.value,
      });
    }
  }

  /**
   * Mark all form fields as touched to trigger validation display
   */
  private markAllFieldsAsTouched(): void {
    // Mark destination form fields as touched
    Object.keys(this.propertyDestinationsForm.controls).forEach(key => {
      this.propertyDestinationsForm.get(key)?.markAsTouched();
    });

    // Mark property feature form fields as touched
    Object.keys(this.propertyFeatureForm.controls).forEach(key => {
      const control = this.propertyFeatureForm.get(key);
      control?.markAsTouched();

      // If it's a form group (like propertyFeatures), mark its children too
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(childKey => {
          control.get(childKey)?.markAsTouched();
        });
      }
    });
  }

  /**
   * Helper method to get form validation errors for debugging
   */
  private getFormErrors(form: FormGroup): any {
    const errors: any = {};
    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }

      // If it's a form group, get errors from its children too
      if (control instanceof FormGroup) {
        const childErrors: any = {};
        Object.keys(control.controls).forEach(childKey => {
          const childControl = control.get(childKey);
          if (childControl && childControl.errors) {
            childErrors[childKey] = childControl.errors;
          }
        });
        if (Object.keys(childErrors).length > 0) {
          errors[key] = childErrors;
        }
      }
    });
    return errors;
  }
}
