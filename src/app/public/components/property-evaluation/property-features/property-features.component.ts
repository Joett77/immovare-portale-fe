// property-features.component.ts
import { Component, EventEmitter, Input, input, Output, OnInit, OnChanges } from '@angular/core';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { IncrementalButtonComponent } from '../../../../shared/molecules/incremental-button/incremental-button.component';
import {
  SelectComponent,
  SelectOption,
} from '../../../../shared/molecules/select/select.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  styleUrl: './property-features.component.scss',
})
export class PropertyFeaturesComponent implements OnInit, OnChanges {
  isFreePublishing = input<boolean>(false);
  @Output() formUpdated = new EventEmitter<any>();

  propertySpaceFeatures: PropertyFeature[] = propertySpaceFeatures;
  featureKeyList: string[] = this.propertySpaceFeatures
    .map(feature => feature.key)
    .filter((key): key is string => key !== undefined);
  selectedValue: string = '';

  propertyFeaturesForm = new FormGroup({
    square_metres: new FormControl<string | null>('', [Validators.required, Validators.min(1)]),
    [this.featureKeyList[0]]: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    [this.featureKeyList[1]]: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    [this.featureKeyList[2]]: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    property_state: new FormControl<string | null>('', [Validators.required]),
    yearOfConstruction: new FormControl<string | null>('', [
      Validators.required,
      Validators.min(1900),
      Validators.max(new Date().getFullYear()),
    ]),
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
    console.log('freepub', this.isFreePublishing);

    // Subscribe to form changes and emit updates
    this.propertyFeaturesForm.valueChanges.subscribe(() => {
      this.formUpdated.emit(this.propertyFeaturesForm.value);
    });

    // Subscribe to property state changes
    this.propertyFeaturesForm.get('property_state')?.valueChanges.subscribe(selectedState => {
      this.selectedValue = selectedState ?? '';
    });

    // Set default values if not already set
    if (!this.propertyFeaturesForm.get('yearOfConstruction')?.value) {
      this.propertyFeaturesForm.patchValue({
        yearOfConstruction: new Date().getFullYear().toString(),
      });
    }
  }

  ngOnChanges() {
    console.log('isFreePublishing:', this.isFreePublishing);
  }

  onSelectChange(value: string) {
    this.selectedValue = value;

    // Mark the control as touched when user makes a selection
    this.propertyFeaturesForm.get('property_state')?.markAsTouched();
  }

  /**
   * Get current form values
   */
  getCurrentFormValues() {
    return this.propertyFeaturesForm.value;
  }

  /**
   * Get form control by name
   */
  getControl(name: string): FormControl {
    return this.propertyFeaturesForm.get(name) as FormControl;
  }

  /**
   * Check if the form is valid
   */
  isFormValid(): boolean {
    return this.propertyFeaturesForm.valid && this.hasRequiredValues();
  }

  /**
   * Check if all required values are present
   */
  private hasRequiredValues(): boolean {
    const squareMetres = this.propertyFeaturesForm.get('square_metres')?.value;
    const rooms = this.propertyFeaturesForm.get(this.featureKeyList[0])?.value; // number_rooms
    const bathrooms = this.propertyFeaturesForm.get(this.featureKeyList[2])?.value; // bathroom_number
    const propertyState = this.propertyFeaturesForm.get('property_state')?.value;
    const yearOfConstruction = this.propertyFeaturesForm.get('yearOfConstruction')?.value;

    return !!(
      squareMetres &&
      Number(squareMetres) > 0 &&
      rooms &&
      Number(rooms) >= 1 &&
      bathrooms &&
      Number(bathrooms) >= 1 &&
      propertyState &&
      yearOfConstruction &&
      Number(yearOfConstruction) >= 1900
    );
  }

  /**
   * Mark all fields as touched to show validation errors
   */
  markAllFieldsAsTouched(): void {
    Object.keys(this.propertyFeaturesForm.controls).forEach(key => {
      this.propertyFeaturesForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Set form values (useful for parent component to populate data)
   */
  setFormValues(values: any): void {
    this.propertyFeaturesForm.patchValue(values);
  }

  /**
   * Get form validation errors for debugging
   */
  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.propertyFeaturesForm.controls).forEach(key => {
      const control = this.propertyFeaturesForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
