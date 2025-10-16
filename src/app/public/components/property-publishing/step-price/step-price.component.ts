// step-price.component.ts
import { Component, input, OnInit, effect, signal, computed } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonComponent } from '../../../../shared/molecules/radio-button/radio-button.component';
import { RadioButtonOption } from '../../../models';
import { CommonModule } from '@angular/common';

export interface PriceFormData {
  propertyPrice: number;
  hasCondoFees: string; // 'yes' or 'no'
  condoFees: number;
}

@Component({
  selector: 'app-step-price',
  standalone: true,
  imports: [ReactiveFormsModule, RadioButtonComponent, CommonModule],
  templateUrl: './step-price.component.html',
})
export class StepPriceComponent implements OnInit {
  // Inputs
  title = input<string>('');
  formData = input<PriceFormData | null>(null);

  // Form options
  communityFeesChoicesList: RadioButtonOption[] = [
    { label: 'Si', value: 'yes' },
    { label: 'No', value: 'no' },
  ];

  // Form
  propertyPriceForm = new FormGroup({
    propertyPrice: new FormControl(0, [Validators.required, Validators.min(1)]),
    hasCondoFees: new FormControl('no'),
    condoFees: new FormControl(0),
  });

  // Signal to track hasCondoFees value for template reactivity
  private _hasCondoFeesValue = signal('no');

  // Computed signal for showing condo fees input
  showCondoFeesInput = computed(() => this._hasCondoFeesValue() === 'yes');

  constructor() {
    // Handle form data updates from parent
    effect(
      () => {
        const data = this.formData();
        if (data) {
          this.populateFormFromData(data);
        }
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit() {
    // Initialize with data if available
    if (this.formData()) {
      this.populateFormFromData(this.formData()!);
    }

    // Handle hasCondoFees changes
    this.propertyPriceForm.get('hasCondoFees')?.valueChanges.subscribe(value => {
      const condoFeesControl = this.propertyPriceForm.get('condoFees');

      // Update signal for template reactivity
      this._hasCondoFeesValue.set(value || 'no');

      if (value === 'no') {
        // Clear validators and set to 0 when "no" is selected
        condoFeesControl?.clearValidators();
        condoFeesControl?.setValue(0);
        condoFeesControl?.disable();
        condoFeesControl?.updateValueAndValidity();
      } else if (value === 'yes') {
        // Enable the field with minimum 0 validation
        condoFeesControl?.clearValidators();
        condoFeesControl?.setValidators([Validators.min(0)]);
        condoFeesControl?.enable();
        condoFeesControl?.updateValueAndValidity();
      }
    });

    // Listen to propertyPrice changes and emit validation events
    this.propertyPriceForm.get('propertyPrice')?.valueChanges.subscribe(() => {
      this.emitValidationUpdate();
    });

    // Initialize the signal with current value
    const initialValue = this.propertyPriceForm.get('hasCondoFees')?.value || 'no';
    this._hasCondoFeesValue.set(initialValue);

    // Emit initial validation state
    setTimeout(() => this.emitValidationUpdate(), 100);
  }

  // Format number with Italian formatting
  formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || value === 0) return '';
    return value.toLocaleString('it-IT');
  }

  // Parse Italian formatted number string to number
  parseItalianNumber(value: string): number {
    if (!value || value.trim() === '') return 0;

    // Remove all dots (thousand separators) and replace comma with dot for parsing
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    const numericValue = parseFloat(cleanValue);

    return isNaN(numericValue) ? 0 : Math.round(numericValue);
  }

  // Handle price input change
  onPriceInputChange(event: any) {
    const input = event.target;
    const cursorPos = input.selectionStart;
    const inputValue = input.value;

    // Parse the Italian formatted number
    const numericValue = this.parseItalianNumber(inputValue);

    // Update form control and trigger validation
    this.propertyPriceForm.get('propertyPrice')?.setValue(numericValue);

    // Format the display value
    const formattedValue = this.formatNumber(numericValue);
    input.value = formattedValue;

    // Restore cursor position
    setTimeout(() => {
      const newPos = Math.min(cursorPos, formattedValue.length);
      input.setSelectionRange(newPos, newPos);
    }, 0);

    // Emit validation update
    this.emitValidationUpdate();
  }

  // Handle condo fees input change
  onCondoFeesInputChange(event: any) {
    const input = event.target;
    const cursorPos = input.selectionStart;
    const inputValue = input.value;

    // Parse the Italian formatted number
    const numericValue = this.parseItalianNumber(inputValue);

    // Update form control
    this.propertyPriceForm.get('condoFees')?.setValue(numericValue, { emitEvent: false });

    // Format the display value
    const formattedValue = this.formatNumber(numericValue);
    input.value = formattedValue;

    // Restore cursor position
    setTimeout(() => {
      const newPos = Math.min(cursorPos, formattedValue.length);
      input.setSelectionRange(newPos, newPos);
    }, 0);
  }

  // Form control accessor helper
  getControl(name: string) {
    return this.propertyPriceForm.get(name) as FormControl;
  }

  // Get form data for external access
  public getFormData(): PriceFormData {
    const formValue = this.propertyPriceForm.value;
    return {
      propertyPrice: formValue.propertyPrice || 0,
      hasCondoFees: formValue.hasCondoFees || 'no',
      condoFees: formValue.hasCondoFees === 'yes' ? formValue.condoFees || 0 : 0,
    };
  }

  // Check if form is valid - only propertyPrice > 0 is required
  public isFormValid(): boolean {
    const propertyPrice = this.propertyPriceForm.get('propertyPrice')?.value;
    return !!(propertyPrice && propertyPrice > 0);
  }

  // Populate form with data from parent
  public populateFormFromData(data: PriceFormData) {
    this.propertyPriceForm.patchValue({
      propertyPrice: data.propertyPrice || 0,
      hasCondoFees: data.hasCondoFees || 'no',
      condoFees: data.condoFees || 0,
    });

    // Emit validation update after populating
    setTimeout(() => this.emitValidationUpdate(), 50);
  }

  // Emit validation update to parent component
  public emitValidationUpdate() {
    const isValid = this.isFormValid();
    console.log(
      'Price step validation:',
      isValid,
      'Price:',
      this.propertyPriceForm.get('propertyPrice')?.value
    );

    // Emit custom event for parent component
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('stepValidationUpdate', {
          detail: { step: 3, isValid },
        })
      );
    }
  }
}
