// evaluation-stepper.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ButtonComponent } from '../../../atoms/button/button.component';

@Component({
  selector: 'app-evaluation-stepper',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './evaluation-stepper.component.html',
})
export class EvaluationStepperComponent {
  @Input() steps: { text: string; completed: boolean; step: number }[] = [
    { text: 'Indirizzo', completed: false, step: 0 },
    { text: 'Caratteristiche', completed: false, step: 1 },
    { text: 'Caratteristiche aggiuntive', completed: false, step: 2 },
    { text: 'Risultato Valutazione', completed: false, step: 3 },
  ];

  @Input() currentStep: number = 0;
  @Input() isStepValid: boolean = true; // Input to check if current step is valid
  @Output() stepChange = new EventEmitter<number>();
  @Output() discoverEvaluation = new EventEmitter<void>(); // Output for "Scopri valutazione"

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
    // Check if we're on the last step before results
    if (this.currentStep === this.steps.length - 2) {
      // This is the "Caratteristiche aggiuntive" step, emit discover evaluation
      this.discoverEvaluation.emit();
      return;
    }

    // For other steps, check if current step is valid before proceeding
    if (!this.isStepValid) {
      console.log('Cannot proceed - current step is not valid');
      return; // Don't proceed if current step is not valid
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
    // Only allow navigation to completed steps or the current step
    if (stepNumber <= this.currentStep || this.steps[stepNumber - 1]?.completed) {
      this.currentStep = stepNumber;
      this.stepChange.emit(this.currentStep);
    }
  }

  // Helper method to get the button text
  getNextButtonText(): string {
    if (this.currentStep === this.steps.length - 2) {
      return 'Scopri valutazione';
    }
    return 'Avanti';
  }

  // Helper method to check if we should show the stepper
  shouldShowStepper(): boolean {
    return this.currentStep < this.steps.length - 1; // Hide on last step (results)
  }

  // Helper method to check if back button should be disabled
  isBackButtonDisabled(): boolean {
    return this.currentStep === 0;
  }

  // Helper method to check if next button should be disabled
  isNextButtonDisabled(): boolean {
    return !this.isStepValid;
  }
}
