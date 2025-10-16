import {
  Component,
  Output,
  EventEmitter,
  input,
  ElementRef,
  ViewChild,
  forwardRef,
  effect,
  computed,
  OnInit,
  AfterViewInit,
} from '@angular/core';
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EyeIconComponent } from '../../atoms/icons/eye-icon/eye-icon.component';
import { EyeSlashIconComponent } from '../../atoms/icons/eye-slash-icon/eye-slash-icon.component';

@Component({
  selector: 'app-input',
  standalone: true,
  templateUrl: './input.component.html',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    EyeSlashIconComponent,
    EyeIconComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor, OnInit, AfterViewInit {
  label = input<string>('');
  control = input<FormControl | undefined>(undefined);
  type = input<'text' | 'textarea' | 'number' | 'email' | 'password'>('text');
  rows = input<number>(5);
  min = input<number | undefined>(undefined);
  max = input<number | undefined>(undefined);
  step = input<number | string>(1);
  errorMessage = input<string>('Campo non valido');
  isDisabled = input<boolean>(false);

  isInputDisabled = computed(() => this.disabled || this.isDisabled());

  @ViewChild('inputElement') inputElement!: ElementRef;
  @Output() valueChange = new EventEmitter<string | number>();

  focused = false;
  disabled = false;
  innerValue: any = '';
  touched = false;
  showPassword = false;

  constructor() {
    effect(() => {
      const currentControl = this.control();
      if (currentControl) {
        // Subscribe to value changes from the form control
        currentControl.valueChanges.subscribe(value => {
          // console.log(`Value change detected for ${this.label()}:`, value);
          if (value !== this.innerValue) {
            this.innerValue = value;
            // Ensure the component updates visually
            this.updateVisualState();
          }
        });

        // Set initial value if it exists
        if (currentControl.value !== undefined && currentControl.value !== null) {
          this.innerValue = currentControl.value;
          // Ensure the component updates visually
          this.updateVisualState();
        }
      }
    });
  }

  ngOnInit() {
    // Initialize immediately if possible
    const currentControl = this.control();
    if (currentControl && currentControl.value) {
      console.log(`OnInit value for ${this.label()}:`, currentControl.value);
      this.innerValue = currentControl.value;
      this.updateVisualState();
    }
  }

  ngAfterViewInit() {
    // Check again after view is initialized
    setTimeout(() => {
      const currentControl = this.control();
      if (currentControl && currentControl.value) {
        console.log(`AfterViewInit value for ${this.label()}:`, currentControl.value);
        this.innerValue = currentControl.value;
        this.updateVisualState();
      }
    }, 0);
  }

  // Helper method to ensure visual state is updated
  private updateVisualState() {
    // Force change detection by triggering a state change
    if (this.innerValue) {
      this.focused = true;
      setTimeout(() => {
        this.focused = false;
      }, 10);
    }
  }

  // ControlValueAccessor methods
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    console.log(`Writing value for ${this.label()}:`, value);
    if (value !== undefined && value !== null) {
      this.innerValue = value;
      this.updateVisualState();
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

  get isInvalid(): boolean {
    if (!this.control()) return false;
    return this.control()!.invalid && (this.control()!.touched || this.control()!.dirty);
  }

  get isTextarea(): boolean {
    return this.type() === 'textarea';
  }

  get isNumber(): boolean {
    return this.type() === 'number';
  }

  get inputType(): string {
    if (this.type() === 'password') {
      return this.showPassword ? 'text' : 'password';
    }
    return this.type();
  }

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showPassword = !this.showPassword;
    this.inputElement?.nativeElement?.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (this.isNumber && event.key === ',') {
      event.preventDefault(); // Prevent comma input for numbers
    }
  }

  onInputChange(event: Event): void {
    const element = event.target as HTMLInputElement | HTMLTextAreaElement;
    const inputValue = element.value;

    this.innerValue = inputValue;
    this.onChange(inputValue);
    this.valueChange.emit(inputValue);

    if (this.control()) {
      this.control()!.markAsTouched();
      this.control()!.markAsDirty();
    }

    this.onTouched();
  }

  // Add this new method to handle validation on blur
  onBlur(): void {
    this.focused = false;
    this.touched = true;
    this.onTouched();

    // Now validate and convert comma to dot if needed
    if (
      this.isNumber &&
      this.innerValue &&
      typeof this.innerValue === 'string' &&
      this.innerValue.includes(',')
    ) {
      const normalizedValue = this.innerValue.replace(',', '.');
      const numberValue = Number(normalizedValue);

      if (!isNaN(numberValue)) {
        let constrainedValue = numberValue;

        // Apply min/max constraints
        if (this.min() !== undefined) {
          constrainedValue = Math.max(this.min()!, constrainedValue);
        }
        if (this.max() !== undefined) {
          constrainedValue = Math.min(this.max()!, constrainedValue);
        }

        // Update with the final validated value
        this.innerValue = constrainedValue;
        this.inputElement.nativeElement.value = constrainedValue.toString();
        this.onChange(constrainedValue);
        this.valueChange.emit(constrainedValue);

        if (this.control()) {
          this.control()!.setValue(constrainedValue, { emitEvent: false });
        }
      } else {
        // Invalid format, revert to previous valid value or empty
        this.innerValue = '';
        this.inputElement.nativeElement.value = '';
        this.onChange('');
        this.valueChange.emit('');

        if (this.control()) {
          this.control()!.setValue('', { emitEvent: false });
        }
      }
    }

    if (this.control()) {
      this.control()!.markAsTouched();
    }
  }

  onFocus(): void {
    this.focused = true;
  }
}
