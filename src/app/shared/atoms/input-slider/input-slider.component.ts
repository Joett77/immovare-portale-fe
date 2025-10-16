// price-slider.component.ts
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSliderComponent),
      multi: true,
    },
  ],
  templateUrl: './input-slider.component.html',
})
export class InputSliderComponent implements ControlValueAccessor {
  @Input() label = 'Prezzo immobile';
  @Input() min = 50000;
  @Input() max = 1000000000;
  @Input() step = 1000;
  @Input() unit = '';

  value: number = 470000000;
  disabled = false;

  private onChange: any = () => {};
  private onTouched: any = () => {};

  get displayValue(): string {
    return this.formatPrice(this.value);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('it-IT').replace(/\./g, '');
  }

  parsePrice(value: string): number {
    // Remove euro symbol and any spaces, then parse
    return parseInt(value.replace(/[€\s.]/g, ''), 10) || 0;
  }

  onInputChange(value: string) {
    const numericValue = this.parsePrice(value);
    if (numericValue >= this.min && numericValue <= this.max) {
      this.value = numericValue;
      this.onChange(this.value);
    }
  }

  onSliderChange(value: number) {
    this.value = value;
    this.onChange(this.value);
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    if (value !== undefined) {
      this.value = value;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
