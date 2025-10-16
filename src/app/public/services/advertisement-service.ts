import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';

import { environment_dev } from '../../environments/env.dev';
import { Property } from '../models';

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Injectable({
  providedIn: 'root',
})
export class AdvertisementService {
  private http = inject<HttpClient>(HttpClient);
  private router = inject(Router);
  private headers = new HttpHeaders({
    Authorization: `Bearer ${apiToken}`,
  });

  // Central filter data state
  private filterData: Property = {};
  private filterDataSubject = new BehaviorSubject<Property>(this.filterData);

  // UI state signals
  isReset: WritableSignal<boolean> = signal<boolean>(false);
  propertiesList = new BehaviorSubject<Property[]>([]);
  filterApplied: WritableSignal<boolean> = signal<boolean>(false);
  filterSavedForBackButton: WritableSignal<any> = signal<any>(null);

  // Computed filter count signal
  filterCount: WritableSignal<number> = signal<number>(0);

  // Observable for filter data changes with debouncing
  filterData$ = this.filterDataSubject.asObservable().pipe(
    debounceTime(300), // Wait 300ms before emitting
    distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
  );

  // Immediate filter data observable (for form syncing)
  filterDataImmediate$ = this.filterDataSubject.asObservable();

  // Define pages where search context should be maintained
  private searchContextPages = [
    '/',
    '/annunci-immobili',
    '/property-evaluation',
    '/vendere-casa',
    '/comprare-casa',
  ];

  constructor() {
    // Initialize filter count
    this.updateFilterCounts();

    // Listen to navigation events to clear search context when leaving search-related pages
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(event => {
      const navigationEvent = event as NavigationEnd;
      if (!this.isSearchContextPage(navigationEvent.url)) {
        this.clearSearchContext();
      }
    });
  }

  /**
   * Check if the current page should maintain search context
   */
  private isSearchContextPage(url: string): boolean {
    return this.searchContextPages.some(path => {
      if (path === '/') {
        return url === path;
      }
      return url.startsWith(path);
    });
  }

  /**
   * Clear search context when navigating away from search-related pages
   */
  private clearSearchContext(): void {
    // Only clear location and search-related data, preserve other filters
    /* const searchContextKeys: (keyof Property)[] = [
      'latitude',
      'longitude',
      'zoom',
      'selectedAddress',
      'formattedAddress',
      'bbox',
      'polygon_coordinates',
    ];

    this.resetSpecificFilters(searchContextKeys); */
    console.log('Cleared search context due to navigation away from search pages');
  }

  /**
   * Update a single filter field
   * @param key The property key to update
   * @param value The value to set
   */
  updateFilterData(key: keyof Property, value: any): void {
    if (value === null || value === undefined || value === '') {
      // Remove the field if value is null/undefined/empty
      delete this.filterData[key];
    } else {
      this.filterData[key] = value;
    }

    this.emitFilterChanges();
  }

  /**
   * Update multiple filter fields at once
   * @param updates Object containing multiple filter updates
   */
  updateMultipleFilterData(updates: Partial<Property>): void {
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        delete this.filterData[key as keyof Property];
      } else {
        this.filterData[key as keyof Property] = value;
      }
    });

    this.emitFilterChanges();
  }

  /**
   * Get current filter data
   * @returns Copy of current filter data
   */
  getFilterData(): Property {
    return { ...this.filterData };
  }

  /**
   * Reset all filters
   */
  resetFilterData(): void {
    this.filterSavedForBackButton.set(null);
    this.filterData = {};
    this.emitFilterChanges();
    this.triggerReset();
  }

  /**
   * Reset specific filter fields
   * @param keys Array of keys to reset
   */
  resetSpecificFilters(keys: (keyof Property)[]): void {
    keys.forEach(key => {
      delete this.filterData[key];
    });

    this.emitFilterChanges();
  }

  /**
   * Check if a specific filter is set
   * @param key The filter key to check
   * @returns boolean indicating if filter is set
   */
  isFilterSet(key: keyof Property): boolean {
    const value = this.filterData[key];

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0;
    }

    return value !== null && value !== undefined && value !== '';
  }

  /**
   * Get the value of a specific filter
   * @param key The filter key
   * @returns The filter value or undefined
   */
  getFilterValue<T = any>(key: keyof Property): T | undefined {
    return this.filterData[key] as T;
  }

  /**
   * Check if any filters are applied
   * @returns boolean indicating if any filters are set
   */
  hasActiveFilters(): boolean {
    return this.getFilterCount() > 0;
  }

  /**
   * Get array of active filter keys
   * @returns Array of keys that have values
   */
  getActiveFilterKeys(): (keyof Property)[] {
    return Object.keys(this.filterData).filter(key =>
      this.isFilterSet(key as keyof Property)
    ) as (keyof Property)[];
  }

  /**
   * Clear location-based filters
   */
  clearLocationFilters(): void {
    const locationKeys: (keyof Property)[] = [
      'latitude',
      'longitude',
      'zoom',
      'address',
      'bbox',
      'polygon_coordinates',
      'selectedAddress',
      'formattedAddress',
    ];

    this.resetSpecificFilters(locationKeys);
  }

  /**
   * Clear range filters (price, rooms, size)
   */
  clearRangeFilters(): void {
    const rangeKeys: (keyof Property)[] = ['price', 'number_rooms', 'square_metres'];

    this.resetSpecificFilters(rangeKeys);
  }

  /**
   * Private method to emit filter changes
   */
  private emitFilterChanges(): void {
    this.filterDataSubject.next({ ...this.filterData });
    this.updateFilterCounts();
  }

  /**
   * Private method to update filter counts and state
   */
  private updateFilterCounts(): void {
    const count = this.getFilterCount();
    this.filterCount.set(count);
    this.filterApplied.set(count > 0);
  }

  /**
   * Calculate the number of active filters
   * @returns Number of active filters
   */
  getFilterCount(): number {
    // Define keys that should be counted as actual property filters
    const filterKeys: (keyof Property)[] = [
      'type',
      'category',
      'price',
      'number_rooms',
      'number_baths',
      'square_metres',
      'property_condition',
      'heating',
      'energy_class',
      'floor',
      'yearOfConstruction',
      'property_extraFeatures',
      'property_status',
      'property_heating',
      'property_floor',
      'features',
      'services',
      'utils',
    ];

    return Object.entries(this.filterData).filter(([key, value]) => {
      // Only count keys that are actual property filters
      if (!filterKeys.includes(key as keyof Property)) {
        return false;
      }

      // Check if value is meaningful for filtering
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0;
      }
      return value !== null && value !== undefined && value !== '';
    }).length;
  }

  /**
   * Trigger reset signal for components
   */
  private triggerReset(): void {
    this.isReset.set(true);

    // Reset the signal after a delay
    setTimeout(() => {
      this.isReset.set(false);
    }, 100);
  }

  /**
   * Fetch properties based on current filter data
   * @returns Observable of property list response
   */
  fetchPropertyList(): Observable<any> {
    const searchCriteria = this.getFilterData();
    this.filterSavedForBackButton.set(searchCriteria);

    return this.http.post<any>(`${apiUrl}/api/advertisements/paginated`, searchCriteria, {
      headers: this.headers,
    });
  }

  /**
   * Sync filter data with form controls
   * This method helps components sync their form state with the service
   * @param formData Partial form data to sync
   */
  syncWithFormData(formData: Partial<Property>): void {
    // Only update fields that are different
    let hasChanges = false;

    Object.entries(formData).forEach(([key, value]) => {
      const currentValue = this.filterData[key as keyof Property];

      // Deep comparison for arrays and objects
      if (JSON.stringify(currentValue) !== JSON.stringify(value)) {
        hasChanges = true;
        if (value === null || value === undefined || value === '') {
          delete this.filterData[key as keyof Property];
        } else {
          this.filterData[key as keyof Property] = value;
        }
      }
    });

    if (hasChanges) {
      this.emitFilterChanges();
    }
  }

  /**
   * Validate filter data before API calls
   * @returns Object with validation results
   */
  validateFilters(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check price range validity
    const price = this.getFilterValue<number[]>('price');
    if (price && Array.isArray(price) && price.length === 2) {
      if (price[0] > price[1]) {
        errors.push('Price minimum cannot be greater than maximum');
      }
    }

    // Check rooms range validity
    const rooms = this.getFilterValue<number[]>('number_rooms');
    if (rooms && Array.isArray(rooms) && rooms.length === 2) {
      if (rooms[0] > rooms[1]) {
        errors.push('Rooms minimum cannot be greater than maximum');
      }
    }

    // Check size range validity
    const size = this.getFilterValue<number[]>('square_metres');
    if (size && Array.isArray(size) && size.length === 2) {
      if (size[0] > size[1]) {
        errors.push('Size minimum cannot be greater than maximum');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get filter summary for display purposes
   * @returns Human-readable filter summary
   */
  getFilterSummary(): { [key: string]: string } {
    const summary: { [key: string]: string } = {};

    // Price range
    const price = this.getFilterValue<number[]>('price');
    if (price && price.length === 2) {
      summary['Price'] = `€${price[0].toLocaleString()} - €${price[1].toLocaleString()}`;
    }

    // Rooms
    const rooms = this.getFilterValue<number[]>('number_rooms');
    if (rooms && rooms.length === 2) {
      summary['Rooms'] = `${rooms[0]} - ${rooms[1]}`;
    }

    // Size
    const size = this.getFilterValue<number[]>('square_metres');
    if (size && size.length === 2) {
      summary['Size'] = `${size[0]}m² - ${size[1]}m²`;
    }

    // Property type
    const type = this.getFilterValue<string>('type');
    if (type) {
      summary['Type'] = type;
    }

    // Category
    const category = this.getFilterValue<string>('category');
    if (category) {
      summary['Category'] = category;
    }

    return summary;
  }
}
