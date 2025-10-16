import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  OnInit,
  OnDestroy,
  effect,
  ViewChild,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { RangeInputComponent } from '../../../shared/atoms/range-input/range-input.component';
import {
  commercialTypeList,
  extraFeatures,
  propertyDestinations,
  propertyFloorList,
  propertyHeatingList,
  propertyStatusList,
  residentialCleanTypeList,
} from '../../../public/mock/data';
import { Property, PropertyFeature } from '../../../public/models';
import { FeatureButtonComponent } from '../../../shared/molecules/feature-button/feature-button.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { IncrementalButtonComponent } from '../../../shared/molecules/incremental-button/incremental-button.component';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { AdvertisementService } from '../../../public/services/advertisement-service';
import { RangeSelectorComponent } from '../../../shared/organisms/range-selector/range-selector.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-side-filter-bar',
  standalone: true,
  imports: [
    RangeInputComponent,
    FeatureButtonComponent,
    ReactiveFormsModule,
    IncrementalButtonComponent,
    ButtonComponent,
    RangeSelectorComponent,
  ],
  templateUrl: './side-filter-bar.component.html',
})
export class SideFilterBarComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closeSheet = new EventEmitter<void>();

  // ViewChild references to range input components
  @ViewChildren(RangeInputComponent) rangeInputs!: QueryList<RangeInputComponent>;
  @ViewChild('rangeSelector') rangeSelector!: RangeSelectorComponent;

  // Service injection
  private advertisementService = inject(AdvertisementService);

  // Reactive properties from service
  filterCount = this.advertisementService.filterCount;
  isReset = this.advertisementService.isReset;

  // Static data
  propertyDestinations = propertyDestinations;
  propertyStatusList = propertyStatusList;
  propertyHeatingList = propertyHeatingList;
  propertyFloorList = propertyFloorList;
  propertyExtraFeatureList = extraFeatures;

  // Component state
  propertyTypeList: PropertyFeature[] = [];
  selectedDestinationId: number | null = null;
  destinationChoice: string | null = null;
  selectedFeatureId: number | null = null;
  selectedStatusId: number | null = null;
  selectedHeatingId: number | null = null;
  selectedFloorId: number | null = null;
  selectedExtraFeatureId: number | null = null;
  currentYear: number = new Date().getFullYear();

  // Flag to prevent update loops
  private isProcessingFilterChange = false;
  private destroy$ = new Subject<void>();

  // Form group for side filter controls
  sideBarFilterForm = new FormGroup({
    number_rooms: new FormControl<number[] | []>([]),
    square_metres: new FormControl<number[] | []>([]),
    price: new FormControl<number[] | []>([]),
    category: new FormControl<string | null>(''),
    type: new FormControl<string | null>(''),
    property_status: new FormControl<string | null>(''),
    property_heating: new FormControl<string | null>(''),
    yearOfConstruction: new FormControl<number[] | []>([]),
    number_baths: new FormControl<number>(1),
    property_floor: new FormControl<string | null>(''),
    property_extraFeatures: new FormControl<string | null>(''),
  });

  constructor() {
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
        this.resetAllRangeInputs();
      }
    });

    // Track destination changes for property type updates
    this.sideBarFilterForm
      .get('category')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (!this.isProcessingFilterChange) {
          this.destinationChoice = value;
          this.setPropertyTypeList();

          // Clear type selection when category changes
          if (this.sideBarFilterForm.get('type')?.value) {
            this.sideBarFilterForm.patchValue({ type: '' });
            this.advertisementService.updateFilterData('type', null);
            this.selectedFeatureId = null;
          }
        }
      });
  }

  ngOnInit() {
    // Initialize current year
    this.currentYear = new Date().getFullYear();

    // Get initial filter data from service
    const filterData = this.advertisementService.getFilterData();
    this.syncFormWithFilterData(filterData);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Sync form controls with filter data from service
   */
  private syncFormWithFilterData(filterData: Property): void {
    if (this.isProcessingFilterChange) return;

    this.isProcessingFilterChange = true;

    // Update form controls without triggering events
    this.sideBarFilterForm.patchValue(
      {
        number_rooms: filterData.number_rooms || [],
        square_metres: filterData.square_metres || [],
        price: filterData.price || [],
        category: filterData.category || '',
        type: filterData.type || '',
        property_status: filterData.property_condition || '',
        property_heating: filterData.heating || '',
        yearOfConstruction: filterData.yearOfConstruction || [],
        number_baths: Array.isArray(filterData.number_baths)
          ? filterData.number_baths[0] || 1
          : filterData.number_baths || 1,
        property_floor: filterData.floor || '',
        property_extraFeatures: filterData.property_extraFeatures || '',
      },
      { emitEvent: false }
    );

    // Update selected states
    this.updateSelectedStates(filterData);

    // Update range inputs with current values
    this.updateRangeInputs(filterData);

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 100);
  }

  /**
   * Update range inputs with filter data
   */
  private updateRangeInputs(filterData: Property): void {
    setTimeout(() => {
      if (this.rangeInputs) {
        this.rangeInputs.forEach(rangeInput => {
          const rangeKey = rangeInput.rangeKey;
          const value = filterData[rangeKey as keyof Property];

          if (Array.isArray(value) && value.length === 2) {
            rangeInput.updateValues(value[0], value[1]);
          }
        });
      }
    }, 0);
  }

  /**
   * Reset all range input components
   */
  private resetAllRangeInputs(): void {
    setTimeout(() => {
      if (this.rangeInputs) {
        this.rangeInputs.forEach(rangeInput => {
          rangeInput.reset();
        });
      }
    }, 0);
  }

  /**
   * Update selected states based on filter data
   */
  private updateSelectedStates(filterData: Property): void {
    // Update destination selection
    if (filterData.category) {
      const destination = this.propertyDestinations.find(d => d.label === filterData.category);
      this.selectedDestinationId = destination?.id || null;
      this.destinationChoice = filterData.category;
      this.setPropertyTypeList();
    } else {
      this.selectedDestinationId = null;
      this.destinationChoice = null;
      this.propertyTypeList = [];
    }

    // Update property type selection
    if (filterData.type && this.propertyTypeList.length > 0) {
      const propertyType = this.propertyTypeList.find(p => p.label === filterData.type);
      this.selectedFeatureId = propertyType?.id || null;
    } else {
      this.selectedFeatureId = null;
    }

    // Update status selection
    if (filterData.property_condition) {
      const status = this.propertyStatusList.find(s => s.label === filterData.property_condition);
      this.selectedStatusId = status?.id || null;
    } else {
      this.selectedStatusId = null;
    }

    // Update heating selection
    if (filterData.heating) {
      const heating = this.propertyHeatingList.find(h => h.label === filterData.heating);
      this.selectedHeatingId = heating?.id || null;
    } else {
      this.selectedHeatingId = null;
    }

    // Update floor selection
    if (filterData.floor) {
      const floor = this.propertyFloorList.find(f => f.label === filterData.floor);
      this.selectedFloorId = floor?.id || null;
    } else {
      this.selectedFloorId = null;
    }

    // Update extra features selection
    if (filterData.property_extraFeatures) {
      const extraFeature = this.propertyExtraFeatureList.find(
        f => f.label === filterData.property_extraFeatures
      );
      this.selectedExtraFeatureId = extraFeature?.id || null;
    } else {
      this.selectedExtraFeatureId = null;
    }
  }

  /**
   * Handle range input changes
   */
  onRangeChange(controlName: string, value: number[]): void {
    if (this.isProcessingFilterChange) return;

    this.isProcessingFilterChange = true;

    // Update form control
    const control = this.sideBarFilterForm.get(controlName) as FormControl;
    if (control) {
      control.setValue(value);
    }

    // Update service - map control names to property keys
    const propertyKey = this.mapControlNameToPropertyKey(controlName);
    this.advertisementService.updateFilterData(propertyKey, value);

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 100);
  }

  /**
   * Handle incremental button changes (bathrooms)
   */
  onIncrementChange(value: number): void {
    if (this.isProcessingFilterChange) return;

    this.isProcessingFilterChange = true;

    // Update form control
    const control = this.sideBarFilterForm.get('number_baths') as FormControl<number>;
    if (control) {
      control.setValue(value);
    }

    // Update service
    this.advertisementService.updateFilterData('number_baths', value);

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 100);
  }

  /**
   * Handle feature button toggles
   */
  toggleFeatures(feature: PropertyFeature, fragmentKey: string): void {
    if (this.isProcessingFilterChange) return;

    this.isProcessingFilterChange = true;

    const currentValue = this.sideBarFilterForm.get(fragmentKey)?.value;
    let newValue: string | null = null;

    // Toggle selection
    if (currentValue === feature.label) {
      // Deselect
      newValue = null;
      this.clearSelectedState(fragmentKey);
    } else {
      // Select
      newValue = feature.label;
      this.setSelectedState(fragmentKey, feature);
    }

    // Update form
    this.sideBarFilterForm.patchValue({ [fragmentKey]: newValue });

    // Update service - map fragment key to property key
    const propertyKey = this.mapFragmentKeyToPropertyKey(fragmentKey);
    this.advertisementService.updateFilterData(propertyKey, newValue);

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 100);
  }

  /**
   * Set property type list based on category selection
   */
  private setPropertyTypeList(): void {
    this.propertyTypeList =
      this.destinationChoice === 'Residenziale' ? residentialCleanTypeList : commercialTypeList;
  }

  /**
   * Clear selected state for a feature type
   */
  private clearSelectedState(fragmentKey: string): void {
    switch (fragmentKey) {
      case 'category':
        this.selectedDestinationId = null;
        this.destinationChoice = null;
        this.propertyTypeList = [];
        break;
      case 'type':
        this.selectedFeatureId = null;
        break;
      case 'property_status':
        this.selectedStatusId = null;
        break;
      case 'property_heating':
        this.selectedHeatingId = null;
        break;
      case 'property_floor':
        this.selectedFloorId = null;
        break;
      case 'property_extraFeatures':
        this.selectedExtraFeatureId = null;
        break;
    }
  }

  /**
   * Set selected state for a feature type
   */
  private setSelectedState(fragmentKey: string, feature: PropertyFeature): void {
    switch (fragmentKey) {
      case 'category':
        this.selectedDestinationId = feature.id;
        this.destinationChoice = feature.label;
        this.setPropertyTypeList();
        break;
      case 'type':
        this.selectedFeatureId = feature.id;
        break;
      case 'property_status':
        this.selectedStatusId = feature.id;
        break;
      case 'property_heating':
        this.selectedHeatingId = feature.id;
        break;
      case 'property_floor':
        this.selectedFloorId = feature.id;
        break;
      case 'property_extraFeatures':
        this.selectedExtraFeatureId = feature.id;
        break;
    }
  }

  /**
   * Map control names to property keys
   */
  private mapControlNameToPropertyKey(controlName: string): keyof Property {
    const mapping: { [key: string]: keyof Property } = {
      number_rooms: 'number_rooms',
      square_metres: 'square_metres',
      price: 'price',
      yearOfConstruction: 'yearOfConstruction',
    };
    return mapping[controlName] || (controlName as keyof Property);
  }

  /**
   * Map fragment keys to property keys
   */
  private mapFragmentKeyToPropertyKey(fragmentKey: string): keyof Property {
    const mapping: { [key: string]: keyof Property } = {
      category: 'category',
      type: 'type',
      property_status: 'property_condition',
      property_heating: 'heating',
      property_floor: 'floor',
      property_extraFeatures: 'property_extraFeatures',
    };
    return mapping[fragmentKey] || (fragmentKey as keyof Property);
  }

  /**
   * Get form control helper
   */
  getControl(name: string): FormControl {
    const control = this.sideBarFilterForm.get(name);
    if (!(control instanceof FormControl)) {
      throw new Error(`Control ${name} is not a FormControl`);
    }
    return control;
  }

  /**
   * Reset all filters
   */
  onReset(): void {
    this.isProcessingFilterChange = true;

    // Reset service data (this will trigger the effect and reset the form)
    this.advertisementService.resetFilterData();

    setTimeout(() => {
      this.isProcessingFilterChange = false;
    }, 150);
  }

  /**
   * Apply filters and close sidebar
   */
  onApplyFilters(): void {
    // Validate filters before applying
    const validation = this.advertisementService.validateFilters();

    if (!validation.isValid) {
      console.warn('Filter validation failed:', validation.errors);
      // You could show validation errors to user here using toast service
      // this.toastService.error('Please check your filter values');
      return;
    }

    // Close the sidebar immediately for better UX
    this.closeSheet.emit();

    // The parent component (advertisements-page) should handle fetching
    // properties when filters change through the service subscription
    // No need to manually fetch here as the service will notify all subscribers
  }

  /**
   * Reset form controls
   */
  private resetForm(): void {
    this.sideBarFilterForm.reset();

    // Reset all selected states
    this.selectedDestinationId = null;
    this.selectedFeatureId = null;
    this.selectedStatusId = null;
    this.selectedHeatingId = null;
    this.selectedFloorId = null;
    this.selectedExtraFeatureId = null;
    this.destinationChoice = null;
    this.propertyTypeList = [];

    // Reset number of baths to default
    this.sideBarFilterForm.patchValue({ number_baths: 1 }, { emitEvent: false });
  }
}
