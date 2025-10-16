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
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-range-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="range-slider-wrapper">
      <!-- Input Fields Display -->
      <div class="input-fields-container">
        <div class="input-group">
          <span class="input-label">Da</span>
          <input
            type="number"
            class="value-input"
            [min]="globalMin"
            [max]="globalMax"
            [value]="minValue"
            (input)="onMinInputChange($event)"
            (blur)="onInputBlur()"
          />
        </div>
        <div class="input-group">
          <span class="input-label">a</span>
          <input
            type="number"
            class="value-input"
            [min]="globalMin"
            [max]="globalMax"
            [value]="maxValue"
            (input)="onMaxInputChange($event)"
            (blur)="onInputBlur()"
          />
        </div>
      </div>

      <!-- Range Slider Container -->
      <div
        class="range-slider-container"
        [style.width.px]="containerWidth"
      >
        <!-- Track Background -->
        <div
          class="track-bg"
          #trackBg
        ></div>

        <!-- Selected Range Track -->
        <div
          class="track-selected"
          #trackSelected
          [style.left.%]="leftPercent"
          [style.width.%]="widthPercent"
        >
        </div>

        <!-- Minimum Range Input -->
        <input
          type="range"
          class="range-input range-input-min"
          [min]="globalMin"
          [max]="globalMax"
          [step]="step"
          [(ngModel)]="minValue"
          (input)="onMinChange($event)"
          (mouseup)="onInteractionEnd()"
          (touchend)="onInteractionEnd()"
          #minInput
        />

        <!-- Maximum Range Input -->
        <input
          type="range"
          class="range-input range-input-max"
          [min]="globalMin"
          [max]="globalMax"
          [step]="step"
          [(ngModel)]="maxValue"
          (input)="onMaxChange($event)"
          (mouseup)="onInteractionEnd()"
          (touchend)="onInteractionEnd()"
          #maxInput
        />
      </div>
    </div>
  `,
  styleUrls: ['./range-input.component.scss'],
})
export class RangeInputComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('trackBg', { static: true }) trackBg!: ElementRef<HTMLDivElement>;
  @ViewChild('trackSelected', { static: true }) trackSelected!: ElementRef<HTMLDivElement>;
  @ViewChild('minInput', { static: true }) minInput!: ElementRef<HTMLInputElement>;
  @ViewChild('maxInput', { static: true }) maxInput!: ElementRef<HTMLInputElement>;

  @Input() globalMin: number = 0;
  @Input() globalMax: number = 100;
  @Input() resetMin: number = 0;
  @Input() resetMax: number = 100;
  @Input() step: number = 1;
  @Input() rangeKey: string = '';
  @Input() isRangeInput: boolean = true;
  @Input() control: FormControl<number[]> | null = null;
  @Input() um: string = '';
  @Input() showValues: boolean = false;
  @Input() containerWidth: number = 315;

  @Output() rangeChange = new EventEmitter<number[]>();
  @Output() minValueChange = new EventEmitter<number>();
  @Output() maxValueChange = new EventEmitter<number>();

  minValue: number = 0;
  maxValue: number = 100;

  // Calculated percentages for positioning
  leftPercent: number = 0;
  widthPercent: number = 100;

  private isInitialized = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Initialize values
    this.minValue = this.resetMin || this.globalMin;
    this.maxValue = this.resetMax || this.globalMax;

    // Check if control has existing values
    if (this.control && this.control.value && Array.isArray(this.control.value)) {
      const [min, max] = this.control.value;
      if (min !== undefined && max !== undefined) {
        this.minValue = Math.max(this.globalMin, Math.min(this.globalMax, min));
        this.maxValue = Math.max(this.globalMin, Math.min(this.globalMax, max));
      }
    }

    // Ensure min is never greater than max
    if (this.minValue > this.maxValue) {
      this.minValue = this.maxValue;
    }
  }

  ngAfterViewInit() {
    // Initial track update after view is initialized
    setTimeout(() => {
      this.updateTrack();
      this.isInitialized = true;
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Handle external changes to control value
    if (changes['control'] && this.control?.value && this.isInitialized) {
      const [min, max] = this.control.value;
      if (min !== undefined && max !== undefined) {
        this.minValue = Math.max(this.globalMin, Math.min(this.globalMax, min));
        this.maxValue = Math.max(this.globalMin, Math.min(this.globalMax, max));
        this.updateTrack();
      }
    }

    // Handle range limits changes
    if ((changes['globalMin'] || changes['globalMax']) && this.isInitialized) {
      this.minValue = Math.max(this.globalMin, Math.min(this.globalMax, this.minValue));
      this.maxValue = Math.max(this.globalMin, Math.min(this.globalMax, this.maxValue));
      this.updateTrack();
    }
  }

  onMinChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    // Ensure min doesn't exceed max
    if (value <= this.maxValue) {
      this.minValue = value;
    } else {
      this.minValue = this.maxValue;
      target.value = this.minValue.toString();
    }

    this.updateTrack();
    this.emitChanges();
  }

  onMaxChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    // Ensure max doesn't go below min
    if (value >= this.minValue) {
      this.maxValue = value;
    } else {
      this.maxValue = this.minValue;
      target.value = this.maxValue.toString();
    }

    this.updateTrack();
    this.emitChanges();
  }

  onInteractionEnd() {
    // Final update when user stops interacting
    this.updateTrack();
    this.emitChanges();
  }

  private updateTrack() {
    if (!this.trackSelected || !this.isInitialized) return;

    const range = this.globalMax - this.globalMin;

    // Calculate percentages
    this.leftPercent = ((this.minValue - this.globalMin) / range) * 100;
    this.widthPercent = ((this.maxValue - this.minValue) / range) * 100;

    // Ensure values are within bounds
    this.leftPercent = Math.max(0, Math.min(100, this.leftPercent));
    this.widthPercent = Math.max(0, Math.min(100 - this.leftPercent, this.widthPercent));
  }

  private emitChanges() {
    const rangeValues = [this.minValue, this.maxValue];

    this.rangeChange.emit(rangeValues);
    this.minValueChange.emit(this.minValue);
    this.maxValueChange.emit(this.maxValue);

    // Update form control if provided
    if (this.control) {
      this.control.setValue(rangeValues, { emitEvent: false });
    }
  }

  onMinInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    if (value >= this.globalMin && value <= this.maxValue) {
      this.minValue = value;
      this.updateTrack();
      this.emitChanges();
    }
  }

  onMaxInputChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);

    if (value <= this.globalMax && value >= this.minValue) {
      this.maxValue = value;
      this.updateTrack();
      this.emitChanges();
    }
  }

  onInputBlur() {
    // Validate and correct values on blur
    if (this.minValue > this.maxValue) {
      this.minValue = this.maxValue;
    }
    if (this.maxValue < this.minValue) {
      this.maxValue = this.minValue;
    }

    this.updateTrack();
    this.emitChanges();
  }

  reset() {
    this.minValue = this.resetMin || this.globalMin;
    this.maxValue = this.resetMax || this.globalMax;

    // Update the actual input elements
    if (this.minInput) {
      this.minInput.nativeElement.value = this.minValue.toString();
    }
    if (this.maxInput) {
      this.maxInput.nativeElement.value = this.maxValue.toString();
    }

    this.updateTrack();
    this.emitChanges();
  }

  // Public method to update values programmatically
  updateValues(min: number, max: number) {
    this.minValue = Math.max(this.globalMin, Math.min(this.globalMax, min));
    this.maxValue = Math.max(this.globalMin, Math.min(this.globalMax, max));

    // Ensure min <= max
    if (this.minValue > this.maxValue) {
      this.minValue = this.maxValue;
    }

    // Update input elements
    if (this.minInput) {
      this.minInput.nativeElement.value = this.minValue.toString();
    }
    if (this.maxInput) {
      this.maxInput.nativeElement.value = this.maxValue.toString();
    }

    this.updateTrack();
    this.cdr.detectChanges();
  }
}
