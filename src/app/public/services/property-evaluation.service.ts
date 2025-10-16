// property-evaluation.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PropertyEvaluation } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PropertyEvaluationService {
  private readonly STORAGE_KEY = 'propertyEvaluationData';
  private evaluationData: PropertyEvaluation = {};
  private evaluationDataSubject = new BehaviorSubject<PropertyEvaluation>(this.evaluationData);

  evaluationData$ = this.evaluationDataSubject.asObservable();

  constructor() {
    // Load data from localStorage on service initialization
    this.loadFromLocalStorage();
  }

  updateStepData(stepKey: keyof PropertyEvaluation, data: any) {
    this.evaluationData[stepKey] = data;
    this.evaluationDataSubject.next(this.evaluationData);

    // Save to localStorage whenever data is updated
    this.saveToLocalStorage();
  }

  getEvaluationData(): PropertyEvaluation {
    // Always try to get fresh data from localStorage first
    this.loadFromLocalStorage();
    return this.evaluationData;
  }

  /**
   * Save evaluation data to localStorage
   */
  private saveToLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.evaluationData));
        console.log('Evaluation data saved to localStorage:', this.evaluationData);
      } catch (error) {
        console.error('Error saving evaluation data to localStorage:', error);
      }
    }
  }

  /**
   * Load evaluation data from localStorage
   */
  private loadFromLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const storedData = localStorage.getItem(this.STORAGE_KEY);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          this.evaluationData = parsedData;
          this.evaluationDataSubject.next(this.evaluationData);
          console.log('Evaluation data loaded from localStorage:', this.evaluationData);
        }
      } catch (error) {
        console.error('Error loading evaluation data from localStorage:', error);
        this.evaluationData = {};
      }
    }
  }

  /**
   * Check if evaluation data exists and is valid
   */
  hasValidEvaluationData(): boolean {
    this.loadFromLocalStorage();

    // Check if we have at least address and features data
    return !!(
      this.evaluationData.address &&
      this.evaluationData.address.latitude &&
      this.evaluationData.address.longitude &&
      this.evaluationData.features
    );
  }

  /**
   * Clear evaluation data from both memory and localStorage
   * @param reason - Optional reason for clearing (for logging)
   */
  clearEvaluationData(reason?: string): void {
    if (reason) {
      console.log(`Clearing evaluation data: ${reason}`);
    }

    this.evaluationData = {};
    this.evaluationDataSubject.next(this.evaluationData);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Evaluation data cleared from localStorage');
    }
  }

  /**
   * Reset evaluation data (alias for clearEvaluationData for backward compatibility)
   */
  resetEvaluationData(): void {
    this.clearEvaluationData();
  }

  /**
   * Get specific step data with fallback
   */
  getStepData(stepKey: keyof PropertyEvaluation): any {
    this.loadFromLocalStorage();
    return this.evaluationData[stepKey] || null;
  }

  /**
   * Check if a specific step has been completed
   */
  isStepCompleted(stepKey: keyof PropertyEvaluation): boolean {
    this.loadFromLocalStorage();
    const stepData = this.evaluationData[stepKey];

    // More thorough check for step completion
    if (!stepData || stepData === null || stepData === undefined) {
      return false;
    }

    // For address step, check if we have required fields
    if (stepKey === 'address') {
      return !!(stepData && stepData.street && stepData.latitude && stepData.longitude);
    }

    // For features step, check if we have property type data
    if (stepKey === 'features') {
      return !!(stepData && stepData.propertyType);
    }

    // For extraFeatures, it's always considered complete if it exists
    return true;
  }
}
