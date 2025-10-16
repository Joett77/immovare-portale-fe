// publishing-stepper.component.ts - Updated with validation support
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ButtonComponent } from '../../../atoms/button/button.component';

@Component({
  selector: 'app-publishing-stepper',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './publishing-stepper.component.html',
})
export class PublishingStepperComponent {
  @Input() steps: { text: string; completed: boolean; step: number }[] = [
    { text: 'Indirizzo', completed: true, step: 0 },
    { text: 'Caratteristiche', completed: false, step: 1 },
    { text: 'Caratteristiche aggiuntive', completed: false, step: 2 },
    { text: 'Sottoscrizione piani', completed: false, step: 3 },
  ];

  @Input() currentStep: number = 0;
  @Input() canProceedToNextStep: boolean = true; // New input for validation
  @Output() stepChange = new EventEmitter<number>();

  isMobile: boolean = false;

  constructor(private responsive: BreakpointObserver) {}

  ngOnInit() {
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
      }
    });
  }

  backStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.stepChange.emit(this.currentStep);
    }
  }

  goNextStep() {
    // Check if we can proceed to next step (validation)
    if (!this.canProceedToNextStep) {
      console.warn('Cannot proceed: current step validation failed');
      return;
    }

    if (this.currentStep < this.steps.length - 1) {
      // Mark the current step as completed
      this.steps[this.currentStep].completed = true;

      // Move to the next step
      this.currentStep++;

      // Emit the new step
      this.stepChange.emit(this.currentStep);
    }
  }

  goToStep(stepNumber: number) {
    // Only allow navigation to completed steps or the next immediate step
    if (this.steps[stepNumber].completed || stepNumber <= this.currentStep + 1) {
      // If going forward, check validation
      if (stepNumber > this.currentStep && !this.canProceedToNextStep) {
        console.warn('Cannot proceed: current step validation failed');
        return;
      }

      this.currentStep = stepNumber;
      this.stepChange.emit(this.currentStep);
    }
  }

  /**
   * Check if the next button should be disabled
   */
  get isNextButtonDisabled(): boolean {
    return !this.canProceedToNextStep || this.currentStep >= this.steps.length - 1;
  }

  /**
   * Check if the back button should be disabled
   */
  get isBackButtonDisabled(): boolean {
    return this.currentStep <= 0;
  }
}
