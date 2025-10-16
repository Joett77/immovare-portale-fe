// step-extra-features.component.ts
import { Component, inject, input, OnInit, effect } from '@angular/core';
import { FeatureButtonComponent } from '../../../../shared/molecules/feature-button/feature-button.component';
import { PropertyFeature } from '../../../models';
import { extraFeatures } from '../../../mock/data';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { PropertyEvaluationService } from '../../../services/property-evaluation.service';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { CommonModule } from '@angular/common';

export interface ExtraFeaturesFormData {
  optionalDescription?: string;
  propertyExtraFeatures?: string[];
}

@Component({
  selector: 'app-step-extra-features',
  standalone: true,
  imports: [FeatureButtonComponent, ReactiveFormsModule, InputComponent, CommonModule],
  templateUrl: './step-extra-features.component.html',
})
export class StepExtraFeaturesComponent implements OnInit {
  // Services

  // Inputs
  isFreePublishing = input<boolean>(false);
  title = input<string>('');
  formData = input<ExtraFeaturesFormData | null>(null);

  // Available features
  extraFeatures: PropertyFeature[] = extraFeatures;

  // Selected feature IDs
  selectedFeatureIds: number[] = [];

  // Form
  propertyExtraFeatureForm = new FormGroup({
    optionalDescription: new FormControl<string>(''),
    propertyExtraFeatures: new FormControl<string[] | null>(null),
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
  }

  // Form control accessor helper
  getControl(name: string) {
    return this.propertyExtraFeatureForm.get(name) as FormControl;
  }

  // Check if feature is selected
  isSelected(featureId: number): boolean {
    return this.selectedFeatureIds.includes(featureId);
  }

  // Populate form with data from parent
  public populateFormFromData(data: ExtraFeaturesFormData) {
    // Set description
    this.propertyExtraFeatureForm.patchValue({
      optionalDescription: data.optionalDescription || '',
      propertyExtraFeatures: data.propertyExtraFeatures || null,
    });

    // Reset selected feature IDs
    this.selectedFeatureIds = [];

    // Set selected feature IDs
    if (data.propertyExtraFeatures && data.propertyExtraFeatures.length > 0) {
      data.propertyExtraFeatures.forEach(featureName => {
        const feature = this.extraFeatures.find(f => f.label === featureName.trim());
        if (feature) {
          this.selectedFeatureIds.push(feature.id);
        }
      });
    }
  }

  // Toggle feature selection
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
          currentFeatures?.filter(feature => feature !== property.label) || null,
      });
    } else {
      // Add feature
      this.selectedFeatureIds.push(property.id);
      this.propertyExtraFeatureForm.patchValue({
        propertyExtraFeatures: [...(currentFeatures || []), property.label],
      });
    }
  }
}
