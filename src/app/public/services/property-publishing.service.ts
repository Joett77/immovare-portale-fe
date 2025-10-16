import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PropertyEvaluation } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PropertyPublishingService {
  private propertyPublishingData: PropertyEvaluation = {};
  private propertyPublishingDataSubject = new BehaviorSubject<PropertyEvaluation>(
    this.propertyPublishingData
  );

  propertyPublishingData$ = this.propertyPublishingDataSubject.asObservable();

  updateStepData(stepKey: keyof PropertyEvaluation, data: any) {
    this.propertyPublishingData[stepKey] = data;
    this.propertyPublishingDataSubject.next(this.propertyPublishingData);
  }

  getPropertyPublishingData() {
    return this.propertyPublishingData;
  }

  resetPropertyPublishingData() {
    this.propertyPublishingData = {
      address: { },
      features: { },
      extraFeatures: { },
      price: { },
    };
  }

  // Add reset function
}
