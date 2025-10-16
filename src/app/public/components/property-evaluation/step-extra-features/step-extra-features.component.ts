// step-extra-features.component.ts
import { Component, inject, input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FeatureButtonComponent } from '../../../../shared/molecules/feature-button/feature-button.component';
import { PropertyFeature } from '../../../models';
import { extraFeatures } from '../../../mock/data';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { PropertyEvaluationService } from '../../../services/property-evaluation.service';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-step-extra-features',
  standalone: true,
  imports: [FeatureButtonComponent, ReactiveFormsModule, InputComponent, CommonModule],
  templateUrl: './step-extra-features.component.html',
})
export class StepExtraFeaturesComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private authService = inject(AuthService);
  property_evaluation_service = inject(PropertyEvaluationService);
  private destroy$ = new Subject<void>();

  isFreePublishing = input<boolean>(false);
  title = input<string>('');
  extraFeatures: PropertyFeature[] = extraFeatures;
  selectedFeatureIds: number[] = [];

  propertyExtraFeatureForm = new FormGroup({
    optionalDescription: new FormControl<string>(''),
    propertyExtraFeatures: new FormControl<string[] | null>(null),
  });

  ngOnInit(): void {
    // Try to restore data from previous evaluation
    this.restoreFormData();

    // Subscribe to form changes to track selection state
    this.propertyExtraFeatureForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      // Auto-save on changes (since this step is optional)
      this.property_evaluation_service.updateStepData(
        'extraFeatures',
        this.propertyExtraFeatureForm.value
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Restore form data from previous evaluation
   */
  private restoreFormData(): void {
    const evaluationData = this.property_evaluation_service.getEvaluationData();
    if (evaluationData?.extraFeatures) {
      const extraFeaturesData = evaluationData.extraFeatures;

      // Restore form values
      this.propertyExtraFeatureForm.patchValue({
        optionalDescription: extraFeaturesData.optionalDescription || '',
        propertyExtraFeatures: extraFeaturesData.propertyExtraFeatures || null,
      });

      // Restore selected feature IDs based on saved labels
      if (
        extraFeaturesData.propertyExtraFeatures &&
        Array.isArray(extraFeaturesData.propertyExtraFeatures)
      ) {
        this.selectedFeatureIds = [];
        extraFeaturesData.propertyExtraFeatures.forEach((featureLabel: string) => {
          const feature = this.extraFeatures.find(f => f.label === featureLabel);
          if (feature) {
            this.selectedFeatureIds.push(feature.id);
          }
        });
      }

      console.log('Restored extra features data:', {
        description: extraFeaturesData.optionalDescription,
        features: extraFeaturesData.propertyExtraFeatures,
        selectedIds: this.selectedFeatureIds,
      });
    }
  }

  toggleProperty(property: PropertyFeature) {
    const currentFeatures = this.propertyExtraFeatureForm.get('propertyExtraFeatures')?.value as
      | string[]
      | null;
    const index = this.selectedFeatureIds.indexOf(property.id);

    if (index > -1) {
      // Remove feature
      this.selectedFeatureIds.splice(index, 1);
      this.propertyExtraFeatureForm.patchValue({
        propertyExtraFeatures:
          currentFeatures?.filter((feature: string) => feature !== property.label) || null,
      });
    } else {
      // Add feature
      this.selectedFeatureIds.push(property.id);
      this.propertyExtraFeatureForm.patchValue({
        propertyExtraFeatures: [...(currentFeatures || []), property.label],
      });
    }

    // Mark as touched for validation purposes
    this.propertyExtraFeatureForm.get('propertyExtraFeatures')?.markAsTouched();

    console.log('Feature toggled:', {
      featureLabel: property.label,
      selected: this.isSelected(property.id),
      selectedIds: this.selectedFeatureIds,
      formValue: this.propertyExtraFeatureForm.get('propertyExtraFeatures')?.value,
    });
  }

  getControl(name: string) {
    return this.propertyExtraFeatureForm.get(name) as FormControl;
  }

  isSelected(featureId: number): boolean {
    return this.selectedFeatureIds.includes(featureId);
  }

  trackById(index: number, item: PropertyFeature): number {
    return item.id;
  }

  /**
   * Check if the form is valid (always true since this step is optional)
   */
  isFormValid(): boolean {
    // Extra features step is always valid as it's optional
    return true;
  }

  /**
   * Get current form values
   */
  getCurrentFormValues() {
    return {
      ...this.propertyExtraFeatureForm.value,
      selectedFeatureIds: this.selectedFeatureIds,
    };
  }

  /**
   * Set form values (useful for parent component to populate data)
   */
  setFormValues(values: any): void {
    if (values) {
      this.propertyExtraFeatureForm.patchValue({
        optionalDescription: values.optionalDescription || '',
        propertyExtraFeatures: values.propertyExtraFeatures || null,
      });

      // Restore selected IDs if available
      if (values.selectedFeatureIds && Array.isArray(values.selectedFeatureIds)) {
        this.selectedFeatureIds = [...values.selectedFeatureIds];
      }
    }
  }

  /**
   * Clear all selections
   */
  clearSelections(): void {
    this.selectedFeatureIds = [];
    this.propertyExtraFeatureForm.patchValue({
      optionalDescription: '',
      propertyExtraFeatures: null,
    });
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  markAllFieldsAsTouched(): void {
    Object.keys(this.propertyExtraFeatureForm.controls).forEach(key => {
      this.propertyExtraFeatureForm.get(key)?.markAsTouched();
    });
  }

  async submitExtraFeatureForm() {
    console.log('Submitting extra features form:', this.getCurrentFormValues());

    // Always save the form data first
    this.property_evaluation_service.updateStepData('extraFeatures', {
      ...this.propertyExtraFeatureForm.value,
      selectedFeatureIds: this.selectedFeatureIds, // Also save the IDs for easier restoration
    });

    if (this.isFreePublishing()) {
      // For free publishing, just save and return
      console.log('Free publishing - extra features saved');
      return;
    }

    // For paid publishing, the authentication check will be handled
    // by the parent component's onDiscoverEvaluation method
    console.log('Paid publishing - extra features saved, authentication will be checked by parent');
  }

  /**
   * Get form validation errors for debugging
   */
  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.propertyExtraFeatureForm.controls).forEach(key => {
      const control = this.propertyExtraFeatureForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
