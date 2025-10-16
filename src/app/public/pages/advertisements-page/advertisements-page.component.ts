import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  effect,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { SelectComponent } from '../../../shared/molecules/select/select.component';
import { AdvertisementCardComponent } from '../../../shared/organisms/advertisement-card/advertisement-card.component';
import { FilterBarComponent } from '../../../shared/organisms/filter-bar/filter-bar.component';
import { ToastService } from '../../../shared/services/toast.service';
import { DrawMapModalComponent } from '../../components/draw-map-modal/draw-map-modal.component';
import { LeafletInputAutocompleteComponent } from '../../components/leaflet-input-autocomplete/leaflet-input-autocomplete.component';
import { LeafletMapComponent } from '../../components/leaflet-map/leaflet-map.component';
import { SideFilterBarComponent } from '../../components/side-filter-bar/side-filter-bar.component';
import { Property } from '../../models';
import { AdvertisementService } from '../../services/advertisement-service';
import { AutocompleteServiceService } from '../../services/autocomplete-service.service';

@Component({
  selector: 'app-advertisements-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FilterBarComponent,
    SideFilterBarComponent,
    LeafletMapComponent,
    LeafletInputAutocompleteComponent,
    DrawMapModalComponent,
    AdvertisementCardComponent,
    SelectComponent,
  ],
  templateUrl: './advertisements-page.component.html',
})
export class AdvertisementsPageComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(LeafletMapComponent) mapComponent?: LeafletMapComponent;
  @ViewChild(FilterBarComponent) filterBarComponent?: FilterBarComponent;

  // Service injections
  responsive = inject(BreakpointObserver);
  autocompleteService = inject(AutocompleteServiceService);
  advertisementService = inject(AdvertisementService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  titleService = inject(Title);
  metaService = inject(Meta);
  toastService = inject(ToastService);

  // Signals and reactive variables
  isMapVisible: WritableSignal<boolean> = this.autocompleteService.isMapVisible;
  isDrawMapModalOpen: WritableSignal<boolean> = this.autocompleteService.isDrawMapModalOpen;

  // Component state
  isMapShown: boolean = false;
  isMobile: boolean = false;
  isSideBarFilterOpen: boolean = false;
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string | null = null;

  // Property data
  properties: Property[] = [];
  visibleProperties: Property[] = []; // Properties visible in map view

  // For cleanup
  private destroy$ = new Subject<void>();

  // Sorting form control
  sortControl = new FormControl('', []);
  sortOptions = [
    { value: 'Più Recenti', label: 'Più Recenti' },
    { value: 'Meno Recenti', label: 'Meno Recenti' },
    { value: 'Più Costosi', label: 'Più Costosi' },
    { value: 'Meno Costosi', label: 'Meno Costosi' },
    { value: 'Più Grandi', label: 'Più Grandi' },
    { value: 'Meno Grandi', label: 'Meno Grandi' },
  ];

  // Current sort order
  currentSortOrder: string = 'Più Recenti';

  // Flag to track if initial data has been loaded
  private isInitialLoad: boolean = true;

  constructor() {
    // Use effect to subscribe to modal open/close events
    effect(() => {
      const isOpen = this.autocompleteService.isDrawMapModalOpen();

      // Only react to modal closing, not opening
      if (!isOpen && !this.isInitialLoad) {
        // When modal closes, check if polygon was applied and fetch properties
        const filterData = this.advertisementService.getFilterData();
        if (filterData.polygon_coordinates && filterData.polygon_coordinates.length > 0) {
          this.fetchAllProperties();
        }
      }
    });

    // Subscribe to debounced filter changes from the service to automatically fetch properties
    this.advertisementService.filterData$.pipe(takeUntil(this.destroy$)).subscribe(filterData => {
      // Only fetch if this is not the initial load
      if (!this.isInitialLoad) {
        console.log('Filter data changed, fetching properties:', filterData);
        this.fetchAllProperties();
      }
    });
  }

  ngOnInit() {
    // Set page title and meta
    this.titleService.setTitle('Case in vendita - Cerca immobili');
    this.metaService.updateTag({
      name: 'description',
      content: 'Cerca immobili in vendita, appartamenti, case e attici nella tua zona.',
    });

    // Monitor for responsive breakpoints
    this.responsive
      .observe(Breakpoints.HandsetPortrait)
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
        console.log('Mobile state changed:', this.isMobile);
      });

    // Check URL params to determine if map should be shown - DEFAULT is LIST VIEW
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const viewParam = params.get('view');
      // Only show map if explicitly requested via URL parameter
      this.isMapShown = this.isMobile === true ? viewParam === 'map' : true;
      console.log('View param from URL:', viewParam, 'isMapShown:', this.isMapShown);

      // Update autocomplete service signal based on view
      if (this.isMapShown) {
        this.autocompleteService.isMapVisible.set(true);
      } else {
        this.autocompleteService.isMapVisible.set(false);
      }
    });

    // Subscribe to query params to restore state from URL when navigating or refreshing
    this.route.queryParamMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      // Set the flag to indicate we're handling a URL change
      this.isInitialLoad = true;

      console.log('Advertisements page params', params);

      // Restore all relevant filters from URL parameters
      this.restoreFiltersFromUrl(params);

      // After restoring filters, fetch properties
      this.fetchAllProperties();
    });
  }

  ngAfterViewInit() {
    // After view init, check if we need to restore address in autocomplete from URL
    setTimeout(() => {
      this.restoreAutocompleteFromUrl();
    }, 500);
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
    if (params['address'] && this.filterBarComponent?.autocompleteComponent) {
      const address = decodeURIComponent(params['address']);

      // Set the value in the autocomplete component
      this.filterBarComponent.autocompleteComponent.searchControl.setValue(address, {
        emitEvent: false,
      });
      this.filterBarComponent.autocompleteComponent.selectedAddress = address;

      console.log('Restored autocomplete address from URL:', address);
    }
  }

  /**
   * Restore all filter values from URL parameters
   */
  private restoreFiltersFromUrl(params: any) {
    const filterData: Partial<Property> = {};
    let hasFilters = false;

    // Location parameters
    if (params.get('lat') && params.get('lng')) {
      const lat = parseFloat(params.get('lat'));
      const lng = parseFloat(params.get('lng'));
      const zoom = params.get('zoom') ? parseInt(params.get('zoom')) : 12;

      if (!isNaN(lat) && !isNaN(lng)) {
        filterData.latitude = lat;
        filterData.longitude = lng;
        filterData.zoom = zoom;
        hasFilters = true;
      }
    }

    // Address parameter - store it for autocomplete restoration
    if (params.get('address')) {
      const address = decodeURIComponent(params.get('address'));
      filterData.selectedAddress = address;
      hasFilters = true;
    }

    // Polygon coordinates
    if (params.get('polygon')) {
      try {
        const polygon = JSON.parse(params.get('polygon'));
        if (Array.isArray(polygon) && polygon.length > 0) {
          filterData.polygon_coordinates = polygon;
          hasFilters = true;
        }
      } catch (e) {
        console.error('Error parsing polygon coordinates from URL', e);
      }
    }

    // Property type
    if (params.get('type')) {
      filterData.type = params.get('type');
      hasFilters = true;
    }

    // Category (residential, commercial, etc.)
    if (params.get('category')) {
      filterData.category = params.get('category');
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
          filterData.price = priceRange;
          hasFilters = true;
        }
      }
    }

    // Area range (square meters)
    if (params.get('areaMin') || params.get('areaMax')) {
      const areaMin = params.get('areaMin') ? parseInt(params.get('areaMin')) : undefined;
      const areaMax = params.get('areaMax') ? parseInt(params.get('areaMax')) : undefined;

      if (areaMin !== undefined || areaMax !== undefined) {
        const areaRange = [];
        if (areaMin !== undefined) areaRange[0] = areaMin;
        if (areaMax !== undefined) areaRange[1] = areaMax;

        if (areaRange.length > 0) {
          filterData.square_metres = areaRange;
          hasFilters = true;
        }
      }
    }

    // Rooms
    if (params.get('roomsMin') || params.get('roomsMax')) {
      const roomsMin = params.get('roomsMin') ? parseInt(params.get('roomsMin')) : undefined;
      const roomsMax = params.get('roomsMax') ? parseInt(params.get('roomsMax')) : undefined;

      if (roomsMin !== undefined || roomsMax !== undefined) {
        const roomsRange = [];
        if (roomsMin !== undefined) roomsRange[0] = roomsMin;
        if (roomsMax !== undefined) roomsRange[1] = roomsMax;

        if (roomsRange.length > 0) {
          filterData.number_rooms = roomsRange;
          hasFilters = true;
        }
      }
    }

    // Bathrooms
    if (params.get('bathsMin') || params.get('bathsMax')) {
      const bathsMin = params.get('bathsMin') ? parseInt(params.get('bathsMin')) : undefined;
      const bathsMax = params.get('bathsMax') ? parseInt(params.get('bathsMax')) : undefined;

      if (bathsMin !== undefined || bathsMax !== undefined) {
        const bathsRange = [];
        if (bathsMin !== undefined) bathsRange[0] = bathsMin;
        if (bathsMax !== undefined) bathsRange[1] = bathsMax;

        if (bathsRange.length > 0) {
          filterData.number_baths = bathsRange;
          hasFilters = true;
        }
      }
    }

    // Property condition
    if (params.get('condition')) {
      filterData.property_condition = params.get('condition');
      hasFilters = true;
    }

    // Heating type
    if (params.get('heating')) {
      filterData.heating = params.get('heating');
      hasFilters = true;
    }

    // Floor
    if (params.get('floor')) {
      filterData.floor = params.get('floor');
      hasFilters = true;
    }

    // Sort order
    if (params.get('sort')) {
      const sort = params.get('sort');
      if (sort && this.sortOptions.some(option => option.value === sort)) {
        this.currentSortOrder = sort;
        this.sortControl.setValue(sort);
      }
    }
    if (
      params.get('lat_max') &&
      params.get('lat_min') &&
      params.get('long_max') &&
      params.get('long_min')
    ) {
      filterData.bbox = {
        lat_max: parseFloat(params.get('lat_max')),
        lat_min: parseFloat(params.get('lat_min')),
        long_max: parseFloat(params.get('long_max')),
        long_min: parseFloat(params.get('long_min')),
      };
      hasFilters = true;
    }

    // If we have filters, update the service with all filters at once
    if (hasFilters) {
      this.advertisementService.updateMultipleFilterData(filterData);
    }
  }

  /**
   * Fetch all properties based on current filters
   */
  fetchAllProperties() {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    console.log('Fetching properties...');

    this.advertisementService
      .fetchPropertyList()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Properties loading finished. Properties count:', this.properties.length);
        })
      )
      .subscribe({
        next: response => {
          console.log('Properties API response:', response);

          if (response && response.data) {
            this.properties = response.data;
            console.log('Properties loaded successfully:', this.properties.length, 'properties');

            // ALWAYS show all properties initially - let the map component handle filtering
            this.visibleProperties = this.properties;

            // Only update URL params if this is not the initial load
            if (!this.isInitialLoad) {
              this.updateUrlParams();
            }

            // Reset the initial load flag
            this.isInitialLoad = false;
          } else {
            console.warn('No data in API response:', response);
            this.properties = [];
            this.visibleProperties = [];
          }
        },
        error: error => {
          console.error('Error fetching properties:', error);
          this.hasError = true;
          this.errorMessage = 'Failed to load properties. Please try again.';
          this.properties = [];
          this.visibleProperties = [];
        },
      });
  }

  /**
   * Update URL parameters based on current filter state
   */
  updateUrlParams() {
    const filterData = this.advertisementService.getFilterData();
    const queryParams: any = {};

    // Map parameters
    if (filterData.latitude !== undefined && filterData.longitude !== undefined) {
      queryParams.lat = filterData.latitude;
      queryParams.lng = filterData.longitude;
      queryParams.zoom = filterData.zoom || 12;
    }

    // View parameter for mobile map toggle
    if (this.isMapShown) {
      queryParams.view = 'map';
    }

    // Address parameter - maintain it in URL (prioritize original selection)
    if (filterData.selectedAddress) {
      queryParams.address = encodeURIComponent(filterData.selectedAddress);
    }

    // Also maintain formatted address if available
    if (filterData.formattedAddress) {
      queryParams.formattedAddress = encodeURIComponent(filterData.formattedAddress);
    }

    // Polygon coordinates
    if (
      filterData.polygon_coordinates &&
      Array.isArray(filterData.polygon_coordinates) &&
      filterData.polygon_coordinates.length > 0
    ) {
      // Convert to string to avoid URL encoding issues
      queryParams.polygon = JSON.stringify(filterData.polygon_coordinates);
    }

    // Property type
    if (filterData.type) {
      queryParams.type = filterData.type;
    }

    // Category
    if (filterData.category) {
      queryParams.category = filterData.category;
    }

    // Price range
    if (Array.isArray(filterData.price) && filterData.price.length > 0) {
      if (filterData.price[0] !== undefined) queryParams.priceMin = filterData.price[0];
      if (filterData.price[1] !== undefined) queryParams.priceMax = filterData.price[1];
    }

    // Area range
    if (Array.isArray(filterData.square_metres) && filterData.square_metres.length > 0) {
      if (filterData.square_metres[0] !== undefined)
        queryParams.areaMin = filterData.square_metres[0];
      if (filterData.square_metres[1] !== undefined)
        queryParams.areaMax = filterData.square_metres[1];
    }

    // Rooms
    if (Array.isArray(filterData.number_rooms) && filterData.number_rooms.length > 0) {
      if (filterData.number_rooms[0] !== undefined)
        queryParams.roomsMin = filterData.number_rooms[0];
      if (filterData.number_rooms[1] !== undefined)
        queryParams.roomsMax = filterData.number_rooms[1];
    }

    // Bathrooms
    if (Array.isArray(filterData.number_baths) && filterData.number_baths.length > 0) {
      if (filterData.number_baths[0] !== undefined)
        queryParams.bathsMin = filterData.number_baths[0];
      if (filterData.number_baths[1] !== undefined)
        queryParams.bathsMax = filterData.number_baths[1];
    }

    // Property condition
    if (filterData.property_condition) {
      queryParams.condition = filterData.property_condition;
    }

    // Heating
    if (filterData.heating) {
      queryParams.heating = filterData.heating;
    }

    // Floor
    if (filterData.floor) {
      queryParams.floor = filterData.floor;
    }

    // Sort order
    if (this.currentSortOrder && this.currentSortOrder !== 'Più Recenti') {
      queryParams.sort = this.currentSortOrder;
    }

    // Update URL without reloading page
    // We're using replaceUrl:true to avoid creating new history entries for every map movement
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      replaceUrl: true,
    });
  }

  /**
   * Handle visible properties change from map component
   */
  handleVisiblePropertiesChange(properties: Property[]): void {
    console.log('Visible properties changed:', properties.length);
    // If we have a polygon filter, don't update visible properties from map
    if (!this.hasPolygonFilter()) {
      this.visibleProperties = properties;
    }
  }

  /**
   * Handle map bounds changes
   */
  handleMapBoundsChanged(bounds: any): void {
    if (this.isInitialLoad) return;

    console.log('Map bounds changed:', bounds);
    // Update URL with new map bounds
    this.updateUrlParams();
  }

  /**
   * Check if polygon filter is active
   */
  hasPolygonFilter(): boolean {
    const filterData = this.advertisementService.getFilterData();
    return !!(
      filterData.polygon_coordinates &&
      Array.isArray(filterData.polygon_coordinates) &&
      filterData.polygon_coordinates.length > 0
    );
  }

  /**
   * Clear polygon filter and refresh results
   */
  clearPolygonFilter(): void {
    // Remove polygon coordinates from filter
    this.advertisementService.updateFilterData('polygon_coordinates', null);
    this.advertisementService.updateFilterData('bbox', null);

    // If we have map component, tell it to clear the polygon
    if (this.mapComponent) {
      this.mapComponent.clearPolygonFromMap();
    }

    // Fetch properties without polygon filter
    this.fetchAllProperties();

    // Update URL to remove polygon parameter
    this.updateUrlParams();

    // Show confirmation toast
    this.toastService.success('Filtro area rimosso');
  }

  /**
   * Handle draw map modal close event
   */
  onDrawMapModalClose(): void {
    this.autocompleteService.isDrawMapModalOpen.set(false);

    // If we have a polygon filter after the modal closes, fetch properties
    if (this.hasPolygonFilter()) {
      this.fetchAllProperties();
    }
  }

  /**
   * Determine if properties displayed should be filtered by map
   */
  shouldFilterByMap(): boolean {
    return this.isMapVisible() && !this.hasPolygonFilter() && !this.isMobile;
  }

  /**
   * Get the properties to display based on map visibility and filters
   */
  getDisplayedProperties(): Property[] {
    // If polygon filter is active, always show all properties that match the polygon
    if (this.hasPolygonFilter()) {
      return this.properties;
    }

    // On mobile
    if (this.isMobile) {
      // If map is shown, show properties visible in map bounds
      // If list is shown, show all properties
      return this.isMapShown ? this.visibleProperties : this.properties;
    }

    // On desktop
    if (this.isMapVisible()) {
      // If map is visible on desktop, show properties visible in map bounds
      return this.visibleProperties;
    }

    // Default: show all properties (list view)
    return this.properties;
  }

  /**
   * Toggle favorite handler
   */
  toggleFavorite(property: Property) {
    // Implement logic to toggle favorite status
    console.log('Toggle favorite for property:', property.id);
  }

  /**
   * Handle sort change event
   */
  onSortChange(sortValue: string) {
    console.log('Sorting by:', sortValue);
    this.currentSortOrder = sortValue;

    // Create a copy of properties to sort
    let sortedProperties = [...this.properties];

    // Implement sorting logic here
    switch (sortValue) {
      case 'Più Recenti':
        // Sort by newest first (assuming creation date exists)
        sortedProperties.sort(
          (a, b) => new Date(b.creation || 0).getTime() - new Date(a.creation || 0).getTime()
        );
        break;
      case 'Meno Recenti':
        // Sort by oldest first
        sortedProperties.sort(
          (a, b) => new Date(a.creation || 0).getTime() - new Date(b.creation || 0).getTime()
        );
        break;
      case 'Più Costosi':
        // Sort by price high to low
        sortedProperties.sort((a, b) => {
          const priceA = Array.isArray(a.price) ? a.price[0] : a.price || 0;
          const priceB = Array.isArray(b.price) ? b.price[0] : b.price || 0;
          return Number(priceB) - Number(priceA);
        });
        break;
      case 'Meno Costosi':
        // Sort by price low to high
        sortedProperties.sort((a, b) => {
          const priceA = Array.isArray(a.price) ? a.price[0] : a.price || 0;
          const priceB = Array.isArray(b.price) ? b.price[0] : b.price || 0;
          return Number(priceA) - Number(priceB);
        });
        break;
      case 'Più Grandi':
        // Sort by size large to small
        sortedProperties.sort((a, b) => {
          const sizeA = Array.isArray(a.square_metres) ? a.square_metres[0] : a.square_metres || 0;
          const sizeB = Array.isArray(b.square_metres) ? b.square_metres[0] : b.square_metres || 0;
          return Number(sizeB) - Number(sizeA);
        });
        break;
      case 'Meno Grandi':
        // Sort by size small to large
        sortedProperties.sort((a, b) => {
          const sizeA = Array.isArray(a.square_metres) ? a.square_metres[0] : a.square_metres || 0;
          const sizeB = Array.isArray(b.square_metres) ? b.square_metres[0] : b.square_metres || 0;
          return Number(sizeA) - Number(sizeB);
        });
        break;
    }

    // Update properties with sorted array
    this.properties = sortedProperties;

    // Also update visible properties if needed
    if (!this.shouldFilterByMap()) {
      this.visibleProperties = [...this.properties];
    }

    // Update URL with sort parameter
    this.updateUrlParams();
  }

  closeSideFilter() {
    this.isSideBarFilterOpen = false;
  }

  openSideFilter() {
    this.isSideBarFilterOpen = true;
  }
}
