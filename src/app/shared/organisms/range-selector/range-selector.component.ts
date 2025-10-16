import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  HostListener,
  ElementRef,
} from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ArrowDownIconComponent } from '../../atoms/icons/arrow-down-icon/arrow-down-icon.component';
import { RangeInputComponent } from '../../atoms/range-input/range-input.component';
import { Property } from '../../../public/models';

@Component({
  selector: 'app-range-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ArrowDownIconComponent,
    RangeInputComponent,
  ],
  templateUrl: './range-selector.component.html',
})
export class RangeSelectorComponent implements OnInit, OnChanges {
  @ViewChild('rangeInput') rangeInput!: RangeInputComponent;

  @Input() range: keyof Property = '' as keyof Property;
  @Input() title: string = '';
  @Input() label: string = '';
  @Input() min: number = 0;
  @Input() max: number = 0;
  @Input() resetMin: number = 0;
  @Input() resetMax: number = 0;
  @Input() um: string = '';
  @Input() control: FormControl<number[] | null> | null = null;
  @Input() isReset: boolean = false;
  @Input() type: string = 'md';

  @Output() rangeChange = new EventEmitter<number[]>();
  @Output() dropdownToggle = new EventEmitter<boolean>();

  isDropdownOpen: boolean = false;
  rangeSaved: boolean = false;

  minValue: number = 0;
  maxValue: number = 0;

  sliderMin: number = 0;
  sliderMax: number = 0;

  constructor(private elementRef: ElementRef) {}

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isDropdownOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeDropdown();
    }
  }

  // Handle clicks on the component container
  onComponentClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleDropdown();
  }

  ngOnInit() {
    // Initialize values
    this.minValue = this.resetMin || this.min;
    this.maxValue = this.resetMax || this.max;
    this.sliderMin = this.resetMin || this.min;
    this.sliderMax = this.resetMax || this.max;

    // Check for existing value in control
    if (this.control && this.control.value && this.control.value.length === 2) {
      this.minValue = this.control.value[0];
      this.maxValue = this.control.value[1];
      this.rangeSaved = true;
      this.label = this.updateLabel(false);
    } else {
      // Set initial label
      this.label = this.title;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Handle reset input changes
    if (changes['isReset'] && changes['isReset'].currentValue === true) {
      this.onReset();
    }

    // Handle control value changes from external sources
    if (
      changes['control'] &&
      this.control &&
      this.control.value &&
      Array.isArray(this.control.value)
    ) {
      const [min, max] = this.control.value;
      if (min !== undefined && max !== undefined) {
        this.updateValues(min, max);
      }
    }

    // Handle min/max changes
    if (changes['min'] || changes['max'] || changes['resetMin'] || changes['resetMax']) {
      this.sliderMin = this.resetMin || this.min;
      this.sliderMax = this.resetMax || this.max;
    }
  }

  onMinValueChange(value: number): void {
    this.minValue = value;
  }

  onMaxValueChange(value: number): void {
    this.maxValue = value;
  }

  // Make updateLabel public so it can be called from parent components
  updateLabel(isReset: boolean): string {
    return !isReset ? `${this.minValue}${this.um} - ${this.maxValue}${this.um}` : this.title;
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
    // Emit the toggle event to parent component
    this.dropdownToggle.emit(this.isDropdownOpen);
  }

  /**
   * Public method to close dropdown - can be called by parent component
   */
  closeDropdown(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
      this.dropdownToggle.emit(false);
    }
  }

  /**
   * Public method to open dropdown - can be called by parent component
   */
  openDropdown(): void {
    if (!this.isDropdownOpen) {
      this.isDropdownOpen = true;
      this.dropdownToggle.emit(true);
    }
  }

  onReset(): void {
    this.minValue = this.resetMin;
    this.maxValue = this.resetMax;
    this.min = this.resetMin;
    this.max = this.resetMax;

    if (this.rangeInput) {
      this.rangeInput.reset();
    }

    this.label = this.title; // Reset to title
    this.rangeSaved = false;
    this.emitRangeChange();
  }

  onSaveChoice(): void {
    this.min = this.minValue;
    this.max = this.maxValue;
    this.label = this.updateLabel(false);
    this.closeDropdown(); // Use closeDropdown instead of toggleDropdown
    this.rangeSaved = true;
    this.emitRangeChange();
  }

  emitRangeChange(): void {
    const rangeValues = [this.minValue, this.maxValue];
    this.rangeChange.emit(rangeValues);
    if (this.control) {
      this.control.setValue(rangeValues);
    }
  }

  // Add method to update values programmatically
  updateValues(min: number, max: number): void {
    this.minValue = min;
    this.maxValue = max;
    this.min = min;
    this.max = max;
    this.label = this.updateLabel(false);
    this.rangeSaved = true;

    if (this.control) {
      this.control.setValue([min, max], { emitEvent: false });
    }
  }

  // Method to check if current values are at defaults
  isAtDefaultValues(): boolean {
    return (
      this.minValue === (this.resetMin || this.min) && this.maxValue === (this.resetMax || this.max)
    );
  }

  // Method to programmatically set saved state
  setSavedState(saved: boolean): void {
    this.rangeSaved = saved;
    if (!saved) {
      this.label = this.title;
    } else {
      this.label = this.updateLabel(false);
    }
  }
}
