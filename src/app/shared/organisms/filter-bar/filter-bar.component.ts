import {
  Component,
  effect,
  EventEmitter,
  inject,
  OnDestroy,
  OnInit,
  Output,
  signal,
  ViewChild,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { RangeSelectorComponent } from '../range-selector/range-selector.component';
import { SelectComponent } from '../../molecules/select/select.component';
import { residentialCleanTypeList } from '../../../public/mock/data';
import { ButtonComponent } from '../../atoms/button/button.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdvertisementService } from '../../../public/services/advertisement-service';
import { AutocompleteServiceService } from '../../../public/services/autocomplete-service.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { LeafletInputAutocompleteComponent } from '../../../public/components/leaflet-input-autocomplete/leaflet-input-autocomplete.component';
import { Property } from '../../../public/models';
import { SavedSearchesService } from '../../../public/services/saved-searches.service';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { finalize, Subject, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../../public/services/auth.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [
    RangeSelectorComponent,
    SelectComponent,
    ButtonComponent,
    ReactiveFormsModule,
    LeafletInputAutocompleteComponent,
  ],
  templateUrl: './filter-bar.component.html',
})
export class FilterBarComponent implements OnInit, OnDestroy, AfterViewInit {
  // Service injections
  private advertisementService = inject(AdvertisementService);
  private autocompleteService = inject(AutocompleteServiceService);
  private apiService = inject(PropertyApiService);
  private savedSearchesService = inject(SavedSearchesService);
  private responsive = inject(BreakpointObserver);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  @ViewChild(LeafletInputAutocompleteComponent)
  autocompleteComponent?: LeafletInputAutocompleteComponent;

  @ViewChildren(RangeSelectorComponent) rangeSelectors!: QueryList<RangeSelectorComponent>;

  @Output() openSideFilter = new EventEmitter<void>();

  // Reactive properties from service
  filterCount = this.advertisementService.filterCount;
  filterApplied = this.advertisementService.filterApplied;
  isReset = this.advertisementService.isReset;

  // Component state
  residentialCleanTypeList = residentialCleanTypeList;
  isMobile: boolean = false;
  isMapShown: boolean = false;
  isLoading = signal(false);

  // Track which range selector is currently open
  private currentlyOpenRangeSelector: RangeSelectorComponent | null = null;

  // Flag to prevent filtering loops
  private isProcessingFilterChange = false;
  private destroy$ = new Subject<void>();

  // Form group for filter controls
  filterBarForm = new FormGroup({
    address: new FormGroup({
      street: new FormControl(''),
      street_number: new FormControl(''),
      zip_code: new FormControl(''),
      city: new FormControl(''),
      country: new FormControl(''),
    }),
    type: new FormControl<string | null>(''),
    number_rooms: new FormControl<number[] | []>([]),
    square_metres: new FormControl<number[] | []>([]),
    price: new FormControl<number[] | []>([]),
  });

  constructor() {
    // Monitor responsive breakpoints
    this.responsive
      .observe(Breakpoints.HandsetPortrait)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Subscribe to filter data changes from service (immediate for form syncing)
    this.advertisementService.filterDataImmediate$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filterData => {
        this.syncFormWithFilterData(filterData);
      });

    // Watch for reset signals
    effect(() => {
      if (this.isReset()) {
        this.resetForm();
        this.resetAllRangeSelectors();
      }
    });
  }

  ngOnInit() {
    // Subscribe to query params for initial state restoration
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.restoreFiltersFromUrl(params);
    });
  }

  ngAfterViewInit() {
    // After view init, restore autocomplete value from URL if available
    setTimeout(() => {
      this.restoreAutocompleteFromUrl();
    }, 100);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Restore autocomplete value from URL parameters
   */
  private restoreAutocompleteFromUrl(): void {
    const params = this.route.snapshot.queryParams;

    // Check if we have an address parameter from the URL (prioritize original selection)
    if (params['address'] && this.autocompleteComponent) {
      const address = decodeURIComponent(params['address']);

      // Set the value in the autocomplete component
      this.autocompleteComponent.searchControl.setValue(address, { emitEvent: false });
      this.autocompleteComponent.selectedAddress = address;

      console.log('Filter bar restored autocomplete address from URL:', address);
    }
  }

  /**
   * Handle range selector dropdown open/close events
   * Ensures only one range selector is open at a time
   */
  onRangeSelectorToggle(rangeSelector: RangeSelectorComponent, isOpening: boolean): void {
    if (isOpening) {
      // Close any currently open range selector
      if (this.currentlyOpenRangeSelector && this.currentlyOpenRangeSelector !== rangeSelector) {
        this.currentlyOpenRangeSelector.closeDropdown();
      }
      // Set the new currently open range selector
      this.currentlyOpenRangeSelector = rangeSelector;
    } else {
      // Clear the currently open reference if this one is closing
      if (this.currentlyOpenRangeSelector === rangeSelector) {
        this.currentlyOpenRangeSelector = null;
      }
    }
  }

  /**
   * Close all range selector dropdowns
   */
  closeAllRangeSelectors(): void {
    if (this.rangeSelectors) {
      this.rangeSelectors.forEach(rangeSelector => {
        rangeSelector.closeDropdown();
      });
    }
    this.currentlyOpenRangeSelector = null;
  }

  /**
   * Sync form controls with filter data from service
   */
  private syncFormWithFilterData(filterData: Property): void {
    if (this.isProcessingFilterChange) return;

    this.isProcessingFilterChange = true;

    // Update form controls without triggering events
    this.filterBarForm.patchValue(
      {
        type: filterData.type || '',
        number_rooms: filterData.number_rooms || [],
        square_metres: filterData.square_metres || [],
        price: filterData.price || [],
      },
      { emitEvent: false }
    );

    // Update range selectors with current values
    this.updateRangeSelectors(filterData);

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 100);
  }

  /**
   * Update range selectors with filter data
   */
  private updateRangeSelectors(filterData: Property): void {
    setTimeout(() => {
      if (this.rangeSelectors) {
        this.rangeSelectors.forEach(rangeSelector => {
          const rangeKey = rangeSelector.range;
          const value = filterData[rangeKey];

          if (Array.isArray(value) && value.length === 2) {
            rangeSelector.updateValues(value[0], value[1]);
            rangeSelector.setSavedState(true);
          } else {
            rangeSelector.setSavedState(false);
          }
        });
      }
    }, 0);
  }

  /**
   * Reset all range selector components
   */
  private resetAllRangeSelectors(): void {
    setTimeout(() => {
      if (this.rangeSelectors) {
        this.rangeSelectors.forEach(rangeSelector => {
          rangeSelector.onReset();
        });
      }
    }, 0);
  }

  /**
   * Handle form control changes and update service
   */
  onSelectChange(controlName: string, value: string): void {
    if (this.isProcessingFilterChange) return;

    // Close all range selectors when any other control changes
    this.closeAllRangeSelectors();

    this.isProcessingFilterChange = true;

    // Update form control
    const control = this.filterBarForm.get(controlName) as FormControl;
    if (control) {
      control.setValue(value);
    }

    // Update service
    this.advertisementService.updateFilterData(controlName as keyof Property, value);

    // Update URL
    this.updateQueryString();

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 150);
  }

  onRangeChange(controlName: string, value: number[]): void {
    if (this.isProcessingFilterChange) return;

    this.isProcessingFilterChange = true;

    // Update form control
    const control = this.filterBarForm.get(controlName) as FormControl;
    if (control) {
      control.setValue(value);
    }

    // Update service
    this.advertisementService.updateFilterData(controlName as keyof Property, value);

    // Update URL
    this.updateQueryString();

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 150);
  }

  /**
   * Reset all filters
   */
  onReset(): void {
    this.isProcessingFilterChange = true;

    // Close all range selectors
    this.closeAllRangeSelectors();

    // Reset service data
    this.advertisementService.resetFilterData();

    // Update URL to preserve only view and location if map is active
    this.updateQueryStringAfterReset();

    // Clear autocomplete
    if (this.autocompleteComponent) {
      this.autocompleteComponent.clearSearch();
    }

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 150);
  }

  /**
   * Reset form controls
   */
  private resetForm(): void {
    this.filterBarForm.reset();
  }

  /**
   * Open side filter bar
   */
  onOpenSideBarFilter(): void {
    // Close all range selectors when opening side filter
    this.closeAllRangeSelectors();
    this.openSideFilter.emit();
  }

  /**
   * Save current search
   */
  async onSaveSearch(): Promise<void> {
    // Close all range selectors
    this.closeAllRangeSelectors();

    const searchUrl = this.getCurrentUrlWithParams();
    const filterData = this.advertisementService.getFilterData();

    const searchData = {
      url: searchUrl,
      ...filterData,
    };

    const isLoggedIn = await this.authService.isAuthenticated();
    if (isLoggedIn) {
      this.postUserSearch(searchData);
    } else {
      this.toastService.error('Devi essere loggato per salvare una ricerca');
    }
  }

  /**
   * Show/hide map
   */
  onShowMap(): void {
    this.closeAllRangeSelectors();
    this.isMapShown = true;

    // Update the autocomplete service signal to show map
    this.autocompleteService.isMapVisible.set(true);

    // Navigate with map view parameter
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { view: 'map' },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });

    console.log('Map view activated');
  }

  /**
   * Hide map - Mobile toggle back to list view
   */
  onHideMap(): void {
    this.closeAllRangeSelectors();
    this.isMapShown = false;

    // Update the autocomplete service signal to hide map
    this.autocompleteService.isMapVisible.set(false);

    // Remove view parameter from URL to return to default list view
    const currentParams = { ...this.route.snapshot.queryParams };
    delete currentParams['view'];

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: currentParams,
      replaceUrl: true,
    });

    console.log('List view activated');
  }

  /**
   * Get form control helper
   */
  getControl(name: string): FormControl {
    const control = this.filterBarForm.get(name);
    if (!(control instanceof FormControl)) {
      throw new Error(`Control ${name} is not a FormControl`);
    }
    return control;
  }

  /**
   * Update URL query string based on current filters
   */
  private updateQueryString(): void {
    const queryParams: any = {};
    const filterData = this.advertisementService.getFilterData();

    // Always preserve map location parameters if they exist
    const currentParams = this.route.snapshot.queryParams;
    if (currentParams['lat']) queryParams.lat = currentParams['lat'];
    if (currentParams['lng']) queryParams.lng = currentParams['lng'];
    if (currentParams['zoom']) queryParams.zoom = currentParams['zoom'];

    // Preserve address parameter (prioritize original selection)
    if (currentParams['address']) {
      queryParams.address = currentParams['address'];
    } else if (filterData.selectedAddress) {
      queryParams.address = encodeURIComponent(filterData.selectedAddress);
    }

    // Also preserve formatted address if available
    if (currentParams['formattedAddress']) {
      queryParams.formattedAddress = currentParams['formattedAddress'];
    } else if (filterData.formattedAddress) {
      queryParams.formattedAddress = encodeURIComponent(filterData.formattedAddress);
    }

    // Property type
    if (filterData.type) {
      queryParams.type = filterData.type;
    }

    // Number of rooms range
    if (
      filterData.number_rooms &&
      Array.isArray(filterData.number_rooms) &&
      filterData.number_rooms.length === 2
    ) {
      queryParams.roomsMin = filterData.number_rooms[0];
      queryParams.roomsMax = filterData.number_rooms[1];
    }

    // Square meters range
    if (
      filterData.square_metres &&
      Array.isArray(filterData.square_metres) &&
      filterData.square_metres.length === 2
    ) {
      queryParams.sizeMin = filterData.square_metres[0];
      queryParams.sizeMax = filterData.square_metres[1];
    }

    // Price range
    if (filterData.price && Array.isArray(filterData.price) && filterData.price.length === 2) {
      queryParams.priceMin = filterData.price[0];
      queryParams.priceMax = filterData.price[1];
    }

    // Preserve view parameter if it exists
    if (currentParams['view']) {
      queryParams.view = currentParams['view'];
    }

    // Update the URL without triggering navigation
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
  }

  /**
   * Update URL after reset, preserving map state but clearing address
   */
  private updateQueryStringAfterReset(): void {
    const queryParams: any = {};
    const currentParams = this.route.snapshot.queryParams;

    if (currentParams['view']) {
      queryParams.view = currentParams['view'];
    }

    if (currentParams['lat']) queryParams.lat = currentParams['lat'];
    if (currentParams['lng']) queryParams.lng = currentParams['lng'];
    if (currentParams['zoom']) queryParams.zoom = currentParams['zoom'];

    // Don't preserve address on reset - let it be cleared

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
  }

  /**
   * Restore filters from URL parameters
   */
  private restoreFiltersFromUrl(params: any): void {
    const filterUpdates: Partial<Property> = {};
    let hasFilters = false;

    // Property type
    if (params.get('type')) {
      filterUpdates.type = params.get('type');
      hasFilters = true;
    }

    // Address parameter - store it for autocomplete restoration (prioritize original selection)
    if (params.get('address')) {
      const address = decodeURIComponent(params.get('address'));
      filterUpdates.selectedAddress = address;
      hasFilters = true;
    }

    // Also store formatted address if available
    if (params.get('formattedAddress')) {
      const formattedAddress = decodeURIComponent(params.get('formattedAddress'));
      filterUpdates.formattedAddress = formattedAddress;
      hasFilters = true;
    }

    // Price range
    if (params.get('priceMin') || params.get('priceMax')) {
      const priceMin = params.get('priceMin') ? parseInt(params.get('priceMin')) : undefined;
      const priceMax = params.get('priceMax') ? parseInt(params.get('priceMax')) : undefined;

      if (priceMin !== undefined || priceMax !== undefined) {
        const priceRange = [];
        if (priceMin !== undefined) priceRange[0] = priceMin;
        if (priceMax !== undefined) priceRange[1] = priceMax;

        if (priceRange.length > 0) {
          filterUpdates.price = priceRange;
          hasFilters = true;
        }
      }
    }

    // Area range
    if (params.get('sizeMin') || params.get('sizeMax')) {
      const sizeMin = params.get('sizeMin') ? parseInt(params.get('sizeMin')) : undefined;
      const sizeMax = params.get('sizeMax') ? parseInt(params.get('sizeMax')) : undefined;

      if (sizeMin !== undefined || sizeMax !== undefined) {
        const sizeRange = [];
        if (sizeMin !== undefined) sizeRange[0] = sizeMin;
        if (sizeMax !== undefined) sizeRange[1] = sizeMax;

        if (sizeRange.length > 0) {
          filterUpdates.square_metres = sizeRange;
          hasFilters = true;
        }
      }
    }

    // Rooms range
    if (params.get('roomsMin') || params.get('roomsMax')) {
      const roomsMin = params.get('roomsMin') ? parseInt(params.get('roomsMin')) : undefined;
      const roomsMax = params.get('roomsMax') ? parseInt(params.get('roomsMax')) : undefined;

      if (roomsMin !== undefined || roomsMax !== undefined) {
        const roomsRange = [];
        if (roomsMin !== undefined) roomsRange[0] = roomsMin;
        if (roomsMax !== undefined) roomsRange[1] = roomsMax;

        if (roomsRange.length > 0) {
          filterUpdates.number_rooms = roomsRange;
          hasFilters = true;
        }
      }
    }

    // Location parameters
    if (params.get('lat') && params.get('lng')) {
      const lat = parseFloat(params.get('lat'));
      const lng = parseFloat(params.get('lng'));
      const zoom = params.get('zoom') ? parseInt(params.get('zoom')) : 12;

      if (!isNaN(lat) && !isNaN(lng)) {
        filterUpdates.latitude = lat;
        filterUpdates.longitude = lng;
        filterUpdates.zoom = zoom;
        hasFilters = true;
      }
    }

    // Update service with all filters at once
    if (hasFilters) {
      this.advertisementService.updateMultipleFilterData(filterUpdates);
    }
  }

  /**
   * Post user search to API
   */
  private async postUserSearch(searchData: any): Promise<void> {
    this.isLoading.set(true);

    try {
      const observableResult = await this.apiService.postUserProperties(
        'api/customers/saved-searches/add',
        searchData
      );

      observableResult.pipe(finalize(() => this.isLoading.set(false))).subscribe({
        next: response => {
          this.toastService.success('Ricerca salvata con successo');
        },
        error: error => {
          this.toastService.error('Errore nel salvare la ricerca');
        },
      });
    } catch (error) {
      console.error('Error saving search:', error);
      this.isLoading.set(false);
    }
  }

  /**
   * Get current URL with query parameters
   */
  private getCurrentUrlWithParams(): string {
    const baseUrl = window.location.origin + window.location.pathname;
    const queryString = window.location.search;
    return baseUrl + queryString;
  }
}
