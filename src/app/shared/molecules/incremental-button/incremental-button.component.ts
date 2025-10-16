import { Component, EventEmitter, input, Output, effect } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-incremental-button',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  template: `
    <div class="mb-4">
      <label
        [for]="label()"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        {{ label() }}
      </label>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="h-8 w-8 flex justify-center items-center border rounded-full transition-colors duration-200"
          [class.bg-gray-100]="canDecrease()"
          [class.bg-gray-50]="!canDecrease()"
          [class.text-gray-400]="!canDecrease()"
          [class.text-gray-700]="canDecrease()"
          [class.cursor-not-allowed]="!canDecrease()"
          [class.hover:bg-gray-200]="canDecrease()"
          [disabled]="!canDecrease()"
          (click)="decreaseValue()"
          aria-label="Decrease value"
        >
          -
        </button>

        <input
          type="text"
          [id]="label()"
          [name]="label()"
          class="w-20 p-2 text-center border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
          [class.bg-gray-100]="disabled()"
          [class.cursor-not-allowed]="disabled()"
          [formControl]="control()!"
          [disabled]="disabled()"
          (input)="onInputChange($event)"
          (blur)="onInputBlur($event)"
          (keydown)="onKeyDown($event)"
          [attr.aria-label]="label() + ' value'"
          [attr.min]="min()"
          [attr.max]="max()"
        />

        <button
          type="button"
          class="h-8 w-8 flex justify-center items-center border rounded-full transition-colors duration-200"
          [class.bg-gray-100]="canIncrease()"
          [class.bg-gray-50]="!canIncrease()"
          [class.text-gray-400]="!canIncrease()"
          [class.text-gray-700]="canIncrease()"
          [class.cursor-not-allowed]="!canIncrease()"
          [class.hover:bg-gray-200]="canIncrease()"
          [disabled]="!canIncrease()"
          (click)="increaseValue()"
          aria-label="Increase value"
        >
          +
        </button>
      </div>

      <!-- Optional: Display min/max constraints -->
      <div
        class="text-xs text-gray-500 mt-1"
        *ngIf="min() !== undefined || max() !== undefined"
      >
        <span *ngIf="min() !== undefined">Min: {{ min() }}</span>
        <span *ngIf="min() !== undefined && max() !== undefined"> | </span>
        <span *ngIf="max() !== undefined">Max: {{ max() }}</span>
      </div>
    </div>
  `,
  styles: [
    `
      /* Additional custom styles if needed */
      .incremental-input:focus {
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }

      button:disabled {
        opacity: 0.6;
      }

      button:not(:disabled):hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class IncrementalButtonComponent {
  label = input<string>('Incremental Button');
  control = input<FormControl | undefined>(undefined);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  step = input<number>(1);
  disabled = input<boolean>(false);

  @Output() incrementChange = new EventEmitter<number>();

  constructor() {
    // Initialize form control value if needed
    effect(() => {
      const ctrl = this.control();
      if (ctrl && (ctrl.value === null || ctrl.value === undefined)) {
        ctrl.setValue(0, { emitEvent: false });
      }
    });
  }

  // Get current value safely
  getCurrentValue(): number {
    const ctrl = this.control();
    if (!ctrl) return 0;

    const value = ctrl.value;
    // Handle string values that might come from input
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return typeof value === 'number' ? value : 0;
  }

  // Check if we can decrease
  canDecrease(): boolean {
    const minVal = this.min();
    const current = this.getCurrentValue();
    return !this.disabled() && (minVal === undefined || current > minVal);
  }

  // Check if we can increase
  canIncrease(): boolean {
    const maxVal = this.max();
    const current = this.getCurrentValue();
    return !this.disabled() && (maxVal === undefined || current < maxVal);
  }

  increaseValue() {
    const ctrl = this.control();
    if (!ctrl || !this.canIncrease()) return;

    const currentValue = this.getCurrentValue();
    const stepValue = this.step();
    const newValue = currentValue + stepValue;
    const maxVal = this.max();

    // Apply max constraint if exists
    const finalValue = maxVal !== undefined ? Math.min(newValue, maxVal) : newValue;

    // Update form control
    ctrl.setValue(finalValue);
    ctrl.markAsTouched();

    this.emitIncrementChange(finalValue);
  }

  decreaseValue() {
    const ctrl = this.control();
    if (!ctrl || !this.canDecrease()) return;

    const currentValue = this.getCurrentValue();
    const stepValue = this.step();
    const newValue = currentValue - stepValue;
    const minVal = this.min();

    // Apply min constraint if exists
    const finalValue = minVal !== undefined ? Math.max(newValue, minVal) : newValue;

    // Update form control
    ctrl.setValue(finalValue);
    ctrl.markAsTouched();

    this.emitIncrementChange(finalValue);
  }

  onInputChange(event: Event) {
    const ctrl = this.control();
    if (!ctrl || this.disabled()) return;

    const target = event.target as HTMLInputElement;
    const inputValue = target.value.trim();

    // Handle empty input
    if (inputValue === '') {
      ctrl.setValue(0);
      this.emitIncrementChange(0);
      return;
    }

    // Parse number
    const parsedValue = this.parseAndValidateNumber(inputValue);
    if (parsedValue !== null) {
      const clampedValue = this.clampValue(parsedValue);
      ctrl.setValue(clampedValue);
      ctrl.markAsTouched();
      this.emitIncrementChange(clampedValue);
    }
    // If invalid, the input will show the current form control value
  }

  onInputBlur(event: Event) {
    // Force sync with form control value on blur
    const target = event.target as HTMLInputElement;
    const currentValue = this.getCurrentValue();
    if (target.value !== currentValue.toString()) {
      target.value = currentValue.toString();
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (this.disabled()) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.increaseValue();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.decreaseValue();
        break;
      case 'Enter':
        event.preventDefault();
        (event.target as HTMLInputElement).blur();
        break;
      // Allow numeric keys, backspace, delete, arrow keys, tab
      case 'Backspace':
      case 'Delete':
      case 'Tab':
      case 'ArrowLeft':
      case 'ArrowRight':
      case 'Home':
      case 'End':
        break;
      // Allow minus sign at the beginning
      case '-':
        if ((event.target as HTMLInputElement).selectionStart !== 0) {
          event.preventDefault();
        }
        break;
      // Allow decimal point
      case '.':
        if ((event.target as HTMLInputElement).value.includes('.')) {
          event.preventDefault();
        }
        break;
      default:
        // Only allow numeric characters
        if (!/^\d$/.test(event.key)) {
          event.preventDefault();
        }
        break;
    }
  }

  private parseAndValidateNumber(value: string): number | null {
    // Remove any whitespace and handle edge cases
    const cleanValue = value.trim();
    if (cleanValue === '' || cleanValue === '-') return null;

    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  }

  private clampValue(value: number): number {
    const minVal = this.min();
    const maxVal = this.max();

    if (minVal !== undefined && value < minVal) {
      return minVal;
    }
    if (maxVal !== undefined && value > maxVal) {
      return maxVal;
    }
    return value;
  }

  private emitIncrementChange(value: number): void {
    this.incrementChange.emit(value);
  }
}
