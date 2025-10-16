import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RadioButtonOption } from '../../../public/models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radio-button',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './radio-button.component.html',
})
export class RadioButtonComponent {
  @Input() label: string = '';
  @Input() radioButtonList: RadioButtonOption[] = [];
  @Input() control: FormControl | undefined = undefined;
  @Input() value: string = '';

  constructor() {}

  // Handle radio button selection
  onRadioChange(selectedValue: string) {
    if (this.control) {
      this.control.setValue(selectedValue);
      this.control.markAsTouched();
    }
  }

  // Check if a radio button is selected
  isSelected(value: string): boolean {
    return this.control?.value === value;
  }
}
