// step-features.component.ts - Fixed validation binding
import { Component, effect, inject, input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { commercialTypeList, propertyDestinations, residentialTypeList } from '../../../mock/data';
import { PropertyFeature } from '../../../models';
import { FeatureButtonComponent } from '../../../../shared/molecules/feature-button/feature-button.component';
import { PropertyFeaturesComponent } from '../property-features/property-features.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertyPublishingService } from '../../../services/property-publishing.service';

export interface PropertyFeatures {
  surface: number;
  rooms_number: number;
  bathroom_number: number;
  floor_number: number;
  property_state: string;
  yearOfConstruction: number;
  deed_state?: string | null;
  heating?: string | null;
  energy_state?: string | null;
}

export interface FeaturesFormData {
  destinationType?: string;
  propertyType?: string;
  propertyFeatures?: PropertyFeatures;
}

@Component({
  selector: 'app-step-features',
  standalone: true,
  imports: [CommonModule, FeatureButtonComponent, PropertyFeaturesComponent, ReactiveFormsModule],
  templateUrl: './step-features.component.html',
})
export class StepFeaturesComponent implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  // Inputs
  isFreePublishing = input<boolean>(false);
  title = input<string>('');
  formData = input<FeaturesFormData | null>(null);

  // Property type lists
  propertyTypeList: PropertyFeature[] = residentialTypeList;
  propertyDestinations: PropertyFeature[] = propertyDestinations;

  // Selected items
  selectedDestinationId: number | null = null;
  selectedFeatureId: number | null = null;

  // Form data
  propertyFeaturesData: any = {};

  // Flag to track if property features data has been updated
  private propertyFeaturesUpdated = false;

  // Forms
  propertyDestinationsForm = new FormGroup({
    destinationType: new FormControl<string | null>(null),
  });

  propertyFeatureForm = new FormGroup({
    propertyType: new FormControl<string | null>(null),
    propertyFeatures: new FormGroup({
      surface: new FormControl(0),
      floor_number: new FormControl(1),
      rooms_number: new FormControl(1),
      bathroom_number: new FormControl(1),
      property_state: new FormControl(''),
      yearOfConstruction: new FormControl<number>(new Date().getFullYear() - 2),
      deed_state: new FormControl<string | null>(null),
      heating: new FormControl<string | null>(null),
      energy_state: new FormControl<string | null>(null),
    }),
  });

  constructor() {
    // Handle form data updates from parent
    effect(() => {
      const data = this.formData();
      if (data) {
        this.populateFormFromData(data);
      }
    });
  }

  ngOnInit() {
    // Initialize with data if available
    if (this.formData()) {
      this.populateFormFromData(this.formData()!);
    }

    // Track destination changes to update property type list
    this.propertyDestinationsForm.get('destinationType')?.valueChanges.subscribe(value => {
      if (value) {
        this.setPropertyTypeList(value);
      }
      // Trigger validation update in parent
      this.updateEvaluationService();
      // Force change detection
      this.cdr.detectChanges();
    });

    // Update evaluation service when forms change
    this.propertyDestinationsForm.valueChanges.subscribe(() => {
      this.updateEvaluationService();
    });

    this.propertyFeatureForm.valueChanges.subscribe(() => {
      this.updateEvaluationService();
    });
  }

  /**
   * Update the property evaluation service with the latest form data
   */
  private updateEvaluationService() {
    const formData: FeaturesFormData = {
      destinationType: this.propertyDestinationsForm.get('destinationType')?.value || undefined,
      propertyType: this.propertyFeatureForm.get('propertyType')?.value || undefined,
      propertyFeatures: this.propertyFeaturesData as PropertyFeatures,
    };

    // Emit a custom event to notify parent component that validation should be re-checked
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('stepValidationUpdate', {
          detail: { step: 1, isValid: this.isStepValid() },
        })
      );
    }

    // this.propertyPublishingService.updateStepData('features', formData);
  }

  /**
   * Check if the current step is valid
   */
  public isStepValid(): boolean {
    const destinationType = this.propertyDestinationsForm.get('destinationType')?.value;
    const propertyType = this.propertyFeatureForm.get('propertyType')?.value;

    // Required: destination type, property type, and basic property features
    const hasDestinationType = destinationType && destinationType.trim().length > 0;
    const hasPropertyType = propertyType && propertyType.trim().length > 0;
    const hasSurface =
      this.propertyFeaturesData &&
      this.propertyFeaturesData.surface &&
      this.propertyFeaturesData.surface > 0;
    const hasPropertyState =
      this.propertyFeaturesData &&
      this.propertyFeaturesData.property_state &&
      this.propertyFeaturesData.property_state.trim().length > 0;

    return hasDestinationType && hasPropertyType && hasSurface && hasPropertyState;
  }

  // Update property type list based on selected destination
  private setPropertyTypeList(destinationType: string) {
    this.propertyTypeList =
      destinationType === 'Residenziale' ? residentialTypeList : commercialTypeList;

    // Reset property type selection when destination changes
    this.propertyFeatureForm.patchValue({ propertyType: null });
    this.selectedFeatureId = null;

    // Force change detection
    this.cdr.detectChanges();
  }

  // Populate form with data from parent
  public populateFormFromData(data: FeaturesFormData) {
    console.log('Populating step-features with data:', data);

    // Set destination type
    if (data.destinationType) {
      this.propertyDestinationsForm.patchValue({
        destinationType: data.destinationType,
      });

      // Find and set destination ID
      const destination = this.propertyDestinations.find(d => d.label === data.destinationType);
      if (destination) {
        this.selectedDestinationId = destination.id;
      }

      // Update property type list
      this.setPropertyTypeList(data.destinationType);
    }

    // Set property type
    if (data.propertyType) {
      this.propertyFeatureForm.patchValue({
        propertyType: data.propertyType,
      });

      // Find and set property type ID
      const propertyType = this.propertyTypeList.find(type => type.label === data.propertyType);
      if (propertyType) {
        this.selectedFeatureId = propertyType.id;
      }
    }

    // Set property features
    if (data.propertyFeatures) {
      this.propertyFeaturesData = data.propertyFeatures;
      this.propertyFeaturesUpdated = true;

      // Ensure all fields from propertyFeatures are included even if empty
      this.propertyFeatureForm.patchValue({
        propertyFeatures: data.propertyFeatures,
      });
    }

    // Force change detection after all updates
    this.cdr.detectChanges();
  }

  // Handle destination selection
  toggleDestination(destination: PropertyFeature) {
    const currentValue = this.propertyDestinationsForm.get('destinationType')?.value;

    if (currentValue === destination.label) {
      this.propertyDestinationsForm.patchValue({ destinationType: null });
      this.selectedDestinationId = null;
    } else {
      this.propertyDestinationsForm.patchValue({ destinationType: destination.label });
      this.selectedDestinationId = destination.id;

      // Reset property type when destination changes
      this.propertyFeatureForm.patchValue({ propertyType: null });
      this.selectedFeatureId = null;
    }

    // Force change detection and validation update
    this.cdr.detectChanges();
    this.updateEvaluationService();
  }

  // Handle property type selection
  toggleProperty(property: PropertyFeature) {
    const currentValue = this.propertyFeatureForm.get('propertyType')?.value;

    if (currentValue === property.label) {
      this.propertyFeatureForm.patchValue({ propertyType: null });
      this.selectedFeatureId = null;
    } else {
      this.propertyFeatureForm.patchValue({ propertyType: property.label });
      this.selectedFeatureId = property.id;
    }

    // Force change detection and validation update
    this.cdr.detectChanges();
    this.updateEvaluationService();
  }

  // Update property features data from property-features component
  updatePropertyFeatures(formData: any) {
    this.propertyFeaturesData = formData;
    this.propertyFeaturesUpdated = true;

    // Update evaluation service with new data
    this.updateEvaluationService();

    // Force change detection
    this.cdr.detectChanges();
  }
}
