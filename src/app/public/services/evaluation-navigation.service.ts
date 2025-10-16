// evaluation-navigation.service.ts
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PropertyEvaluationService } from './property-evaluation.service';

@Injectable({
  providedIn: 'root',
})
export class EvaluationNavigationService {
  private router = inject(Router);
  private propertyEvaluationService = inject(PropertyEvaluationService);

  /**
   * Start a fresh property evaluation, clearing any existing data
   * @param address - Optional address to pre-populate
   */
  startFreshEvaluation(address?: string): void {
    console.log('Starting fresh property evaluation');

    // Clear any existing evaluation data
    this.propertyEvaluationService.clearEvaluationData('Starting fresh evaluation');

    // Clear any redirect flags
    if (typeof window !== 'undefined') {
      localStorage.removeItem('redirectToEvaluationResults');
      localStorage.removeItem('postVerificationRedirect');
    }

    // Prepare query parameters
    const queryParams: any = {};
    if (address) {
      queryParams['address'] = address;
      console.log('Pre-populating evaluation with address:', address);
    }

    // Navigate to property evaluation
    this.router.navigate(['/property-evaluation'], {
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }

  /**
   * Continue to evaluation results (for authenticated users)
   */
  continueToResults(): void {
    console.log('Continuing to evaluation results');

    // Check if we have valid evaluation data
    if (!this.propertyEvaluationService.hasValidEvaluationData()) {
      console.warn('No valid evaluation data found, starting fresh evaluation');
      this.startFreshEvaluation();
      return;
    }

    // Navigate to results
    this.router.navigate(['/property-evaluation'], {
      queryParams: { step: 'results' },
    });
  }

  /**
   * Check if user can access evaluation results
   */
  canAccessResults(): boolean {
    return this.propertyEvaluationService.hasValidEvaluationData();
  }

  /**
   * Clear all evaluation related data
   */
  clearAllEvaluationData(): void {
    console.log('Clearing all evaluation data');

    this.propertyEvaluationService.clearEvaluationData('Manual clear all');

    if (typeof window !== 'undefined') {
      localStorage.removeItem('redirectToEvaluationResults');
      localStorage.removeItem('postVerificationRedirect');
    }
  }

  /**
   * Navigate to specific evaluation step
   * @param step - Step number (0-3)
   */
  navigateToStep(step: number): void {
    if (step < 0 || step > 3) {
      console.error('Invalid step number:', step);
      return;
    }

    const queryParams: any = {};

    if (step === 3) {
      // Going to results - check if we have valid data
      if (!this.canAccessResults()) {
        console.warn('Cannot access results without valid evaluation data');
        this.startFreshEvaluation();
        return;
      }
      queryParams['step'] = 'results';
    }

    this.router.navigate(['/property-evaluation'], {
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }

  /**
   * Get evaluation progress (percentage)
   */
  getEvaluationProgress(): number {
    const addressCompleted = this.propertyEvaluationService.isStepCompleted('address');
    const featuresCompleted = this.propertyEvaluationService.isStepCompleted('features');
    const extraFeaturesCompleted = this.propertyEvaluationService.isStepCompleted('extraFeatures');

    let completedSteps = 0;
    if (addressCompleted) completedSteps++;
    if (featuresCompleted) completedSteps++;
    if (extraFeaturesCompleted) completedSteps++;

    return Math.round((completedSteps / 3) * 100);
  }

  /**
   * Get current evaluation step based on completed data
   */
  getCurrentStep(): number {
    if (!this.propertyEvaluationService.isStepCompleted('address')) {
      return 0; // Address step
    }

    if (!this.propertyEvaluationService.isStepCompleted('features')) {
      return 1; // Features step
    }

    if (!this.propertyEvaluationService.isStepCompleted('extraFeatures')) {
      return 2; // Extra features step
    }

    return 3; // Can go to results
  }

  /**
   * Check if evaluation is ready for results
   */
  isReadyForResults(): boolean {
    return (
      this.propertyEvaluationService.isStepCompleted('address') &&
      this.propertyEvaluationService.isStepCompleted('features')
    );
  }
}
