import {
  Component,
  EventEmitter,
  Input,
  input,
  Output,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { IncrementalButtonComponent } from '../../../../shared/molecules/incremental-button/incremental-button.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../../shared/molecules/select/select.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PropertyFeature } from '../../../models';
import { propertySpaceFeatures } from '../../../mock/data';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-features',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    IncrementalButtonComponent,
    SelectComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './property-features.component.html',
})
export class PropertyFeaturesComponent implements OnInit, OnChanges {
  isFreePublishing = input<boolean>(false);
  @Input() formData: any = null;
  @Output() formUpdated = new EventEmitter<any>();

  propertySpaceFeatures: PropertyFeature[] = propertySpaceFeatures;
  featureKeyList: string[] = this.propertySpaceFeatures
    .map(feature => feature.key)
    .filter((key): key is string => key !== undefined);
  selectedValue: string = '';

  propertyFeaturesForm = new FormGroup({
    surface: new FormControl<string | null>(''),
    [this.featureKeyList[0]]: new FormControl<number>(1),
    [this.featureKeyList[1]]: new FormControl<number>(1),
    [this.featureKeyList[2]]: new FormControl<number>(1),
    property_state: new FormControl<string | null>(''),
    yearOfConstruction: new FormControl<string | null>(''),
    deed_state: new FormControl<string | null>(''),
    heating: new FormControl<string | null>(''),
    energy_state: new FormControl<string | null>(''),
  });

  propertyStatusOptions: SelectOption[] = [
    { label: 'Abitabile', value: 'Abitabile' },
    { label: 'Ristrutturato', value: 'Ristrutturato' },
    { label: 'Da ristrutturare', value: 'Da ristrutturare' },
    { label: 'Nuova costruzione', value: 'Nuova costruzione' },
  ];

  deedStateOptions: SelectOption[] = [
    { label: 'Libero', value: 'libero' },
    { label: 'Occupato', value: 'occupato' },
    { label: 'Nuda proprietà', value: 'nuda-proprietà' },
    { label: 'Affittato', value: 'affittato' },
  ];

  heatingStateOptions: SelectOption[] = [
    { label: 'Autonomo', value: 'Autonomo' },
    { label: 'Centralizzato', value: 'Centralizzato' },
    { label: 'Gas', value: 'Gas' },
    { label: 'Elettrico', value: 'Elettrico' },
    { label: 'Combustibile', value: 'Combustibile' },
  ];

  energyStateOptions: SelectOption[] = [
    { label: 'A++++', value: 'Classe A4' },
    { label: 'A+++', value: 'Classe A3' },
    { label: 'A++', value: 'Classe A2' },
    { label: 'A+', value: 'Classe A1' },
    { label: 'A', value: 'Classe A' },
    { label: 'B', value: 'Classe B' },
    { label: 'C', value: 'Classe C' },
    { label: 'D', value: 'Classe D' },
    { label: 'E', value: 'Classe E' },
    { label: 'F', value: 'Classe F' },
    { label: 'G', value: 'Classe G' },
  ];

  ngOnInit() {
    console.log('Property features component initialized');

    // Subscribe to form changes
    this.propertyFeaturesForm.valueChanges.subscribe(values => {
      this.formUpdated.emit(this.propertyFeaturesForm.value);
    });

    this.propertyFeaturesForm.get('property_state')?.valueChanges.subscribe(selectedState => {
      this.selectedValue = selectedState ?? '';
    });

    // Initialize with formData if available
    if (this.formData) {
      this.updateFormValues(this.formData);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['formData'] && this.formData) {
      this.updateFormValues(this.formData);
    }
  }

  /**
   * Update form values with external data
   */
  updateFormValues(data: any) {
    if (!data) return;

    try {
      // Create a patch object with the available values
      const patchObject: any = {};

      // Transform numeric values to strings for form controls that expect strings
      if (data.surface !== undefined) {
        patchObject.surface = data.surface.toString();
      }

      if (data.yearOfConstruction !== undefined) {
        patchObject.yearOfConstruction = data.yearOfConstruction.toString();
      }

      // Select fields
      if (data.property_state !== undefined) {
        patchObject.property_state = data.property_state;
      }

      if (data.deed_state !== undefined) {
        patchObject.deed_state = data.deed_state;
      }

      if (data.heating !== undefined) {
        patchObject.heating = data.heating;
      }

      if (data.energy_state !== undefined) {
        patchObject.energy_state = data.energy_state;
      }

      // Feature keys (rooms, bathrooms, floor)
      this.featureKeyList.forEach(key => {
        if (data[key] !== undefined) {
          patchObject[key] = data[key];
        }
      });

      // Force reset form controls before updating with new values
      // This ensures the select elements properly reflect the new values
      Object.keys(patchObject).forEach(key => {
        const control = this.propertyFeaturesForm.get(key);
        if (control) {
          // Mark the control as touched to ensure validation displays properly
          control.markAsTouched();
        }
      });

      // Update form without triggering events first, then trigger them after
      this.propertyFeaturesForm.patchValue(patchObject, { emitEvent: false });

      // Set selected value for UI updates
      this.selectedValue = patchObject.property_state || '';

      // Force change detection after a small delay
      setTimeout(() => {
        // Trigger a single value change to ensure UI updates
        this.propertyFeaturesForm.updateValueAndValidity({ emitEvent: true });
      }, 100);
    } catch (error) {
      console.error('Error updating form values:', error);
    }
  }

  /**
   * Reset the form to initial values
   */
  resetForm() {
    this.propertyFeaturesForm.reset({
      surface: '',
      [this.featureKeyList[0]]: 1,
      [this.featureKeyList[1]]: 1,
      [this.featureKeyList[2]]: 1,
      property_state: '',
      yearOfConstruction: '',
      deed_state: '',
      heating: '',
      energy_state: '',
    });
  }

  onSelectChange(value: string) {
    console.log('Select value changed to:', value);
    this.selectedValue = value;
  }

  getCurrentFormValues() {
    return this.propertyFeaturesForm.value;
  }

  getControl(name: string): FormControl {
    return this.propertyFeaturesForm.get(name) as FormControl;
  }
}
