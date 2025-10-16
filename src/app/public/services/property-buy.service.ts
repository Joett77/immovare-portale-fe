import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Property } from '../models';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment_dev } from '../../environments/env.dev';

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Injectable({
  providedIn: 'root',
})
export class PropertyBuyService {
  private http = inject<HttpClient>(HttpClient);
  private headers = new HttpHeaders({
    Authorization: `Bearer ${apiToken}`,
  });
  private reqApiUrl = `${apiUrl}/api/advertisements/paginated`;

  // Property data state
  private propertyBuyData: Property = {};
  private propertyBuyDataSubject = new BehaviorSubject<Property>(this.propertyBuyData);

  // UI state signals
  isReset: WritableSignal<boolean> = signal<boolean>(false);
  propertiesList = new BehaviorSubject<Property[]>([]);
  filterCount: WritableSignal<number> = signal<number>(0);
  filterApplied: WritableSignal<boolean> = signal<boolean>(false);

  // Observable for property buy data
  propertyBuyData$ = this.propertyBuyDataSubject.asObservable();

  /**
   * Update filter data for a specific property key
   * @param stepKey The property key to update
   * @param data The data to update
   */
  updateFilterData(stepKey: keyof Property, data: any) {
    console.log('updateFilterData', stepKey, data);
    this.propertyBuyData[stepKey] = data;
    this.propertyBuyDataSubject.next(this.propertyBuyData);
  }

  /**
   * Get the current property buy data
   */
  getPropertyBuyData(): Property {
    return this.propertyBuyData;
  }

  /**
   * Reset all filter data
   */
  resetFilterData() {
    this.propertyBuyData = {};
    this.propertyBuyDataSubject.next(this.propertyBuyData);
    this.filterCount.set(0);
    this.filterApplied.set(false);
    this.isReset.set(true);

    // Reset the reset signal after a short delay
    setTimeout(() => {
      this.isReset.set(false);
    }, 100);
  }

  /**
   * Count how many filters are applied
   */
  getFilterCount(): number {
    const filtersCount = Object.values(this.propertyBuyData).filter(value => {
      if (Array.isArray(value)) {
        return value.length > 0; // Count arrays with at least one element
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0; // Count non-empty objects
      }
      return value !== null && value !== undefined && value !== ''; // Count non-empty primitive values
    }).length;

    return filtersCount;
  }

  /**
   * Fetch property list based on search criteria
   * @param searchCriteria The search criteria
   */
  fetchPropertyList(searchCriteria: any): Observable<any> {
    return this.http.post<any>(this.reqApiUrl, searchCriteria, {
      headers: this.headers,
    });
  }
}
