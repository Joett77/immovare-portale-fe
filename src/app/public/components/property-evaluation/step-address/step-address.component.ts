// step-address.component.ts

import {
  Component,
  effect,
  inject,
  input,
  Signal,
  PLATFORM_ID,
  Inject,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { AutocompleteServiceService } from '../../../services/autocomplete-service.service';
import { PropertyEvaluationService } from '../../../services/property-evaluation.service';
import { CommonModule } from '@angular/common';
import { LeafletMapLiteComponent } from '../../leaflet-map-lite/leaflet-map-lite.component';
import { isPlatformBrowser } from '@angular/common';
import { LInputAutocompleteComponent } from '../../l-input-autocomplete/l-input-autocomplete.component';
import { GeoFeature } from '../../../models';
import { Subject, takeUntil } from 'rxjs';

interface AddressFormControls {
  street: string;
  street_number: string;
  zip_code: string;
  city: string;
  country: string;
}

@Component({
  selector: 'app-step-address',
  standalone: true,
  imports: [
    InputComponent,
    ReactiveFormsModule,
    CommonModule,
    LeafletMapLiteComponent,
    LInputAutocompleteComponent,
  ],
  templateUrl: './step-address.component.html',
})
export class StepAddressComponent implements OnInit, OnDestroy {
  autocomplete_service = inject(AutocompleteServiceService);
  property_evaluation_service = inject(PropertyEvaluationService);
  title = input<string>('Titolo');
  description = input<string>("Indirizzo dell'abitazione");

  private destroy$ = new Subject<void>();

  // Only use GeoFeature signal from service - remove Google Maps place
  geoFeature: Signal<GeoFeature | undefined> = this.autocomplete_service.getGeoFeature();

  currentLocation = {
    lat: 45.4642,
    lng: 9.19,
  };

  propertyAddressForm = new FormGroup({
    street: new FormControl('', [Validators.required, Validators.minLength(2)]),
    street_number: new FormControl({ value: '', disabled: false }),
    zip_code: new FormControl({ value: '', disabled: false }),
    city: new FormControl('', [Validators.required, Validators.minLength(2)]),
    country: new FormControl({ value: 'Italy', disabled: false }, [Validators.required]), // Default to Italy
  });

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only use one effect for GeoFeature changes - remove Google Maps place effect
    effect(() => {
      const feature = this.geoFeature();
      if (feature && feature.properties && feature.geometry?.coordinates) {
        // Extract address details from GeoFeature
        const addr = feature.properties.address;

        // Update form controls with address details
        this.propertyAddressForm.patchValue(
          {
            street: addr?.road || '',
            street_number: addr?.house_number || '',
            zip_code: addr?.postcode || '',
            city: addr?.city || addr?.town || addr?.village || '',
            country: addr?.country || 'Italy', // Default to Italy if not specified
          },
          { emitEvent: true } // Changed to true to trigger validation
        );

        // Update map location using GeoFeature coordinates
        // GeoJSON uses [lng, lat] format
        const [lng, lat] = feature.geometry.coordinates;

        // Update location with numeric values
        this.currentLocation = {
          lat: Number(lat),
          lng: Number(lng),
        };

        // Mark form controls as touched to trigger validation
        Object.keys(this.propertyAddressForm.controls).forEach(key => {
          const control = this.propertyAddressForm.get(key);
          if (control) {
            control.markAsTouched();
            control.markAsDirty();
          }
        });
      }
    });

    // Subscribe to location changes from service
    this.autocomplete_service.locationChanged
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ lat, lng }) => {
        this.currentLocation = { lat, lng };
      });
  }

  ngOnInit() {
    // Check for pre-populated address from session storage
    const prePopulatedAddress = sessionStorage.getItem('prePopulateAddress');
    if (prePopulatedAddress) {
      // Set the street field with the pre-populated address
      this.propertyAddressForm.patchValue({
        street: prePopulatedAddress,
      });

      // Remove from session storage after use
      sessionStorage.removeItem('prePopulateAddress');

      // Mark the street field as touched to trigger validation
      this.propertyAddressForm.get('street')?.markAsTouched();
      this.propertyAddressForm.get('street')?.markAsDirty();
    }

    // Try to restore data from previous evaluation
    const evaluationData = this.property_evaluation_service.getEvaluationData();
    if (evaluationData?.address) {
      const addr = evaluationData.address;

      this.propertyAddressForm.patchValue({
        street: addr.street || '',
        street_number: addr.street_number || '',
        zip_code: addr.zip_code || '',
        city: addr.city || '',
        country: addr.country || 'Italy',
      });

      if (addr.latitude && addr.longitude) {
        this.currentLocation = {
          lat: addr.latitude,
          lng: addr.longitude,
        };
      }
    }

    // Initial setup if needed
    const feature = this.geoFeature();
    if (feature && feature.properties && feature.geometry?.coordinates) {
      // Form will be updated by the effect

      // Get coordinates for map
      const [lng, lat] = feature.geometry.coordinates;
      this.currentLocation = {
        lat: Number(lat),
        lng: Number(lng),
      };
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Determine if we're in a browser environment for map rendering
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getControl(name: keyof AddressFormControls): FormControl {
    const control = this.propertyAddressForm.get(name);
    if (!control) {
      throw new Error(`Control ${name} not found in form`);
    }
    return control as FormControl;
  }

  /**
   * Check if the address form is valid
   */
  isFormValid(): boolean {
    return !!(
      this.propertyAddressForm.valid &&
      this.propertyAddressForm.get('street')?.value?.trim() &&
      this.propertyAddressForm.get('city')?.value?.trim()
    );
  }

  submitAddressForm() {
    // Mark all fields as touched to show validation errors
    Object.keys(this.propertyAddressForm.controls).forEach(key => {
      const control = this.propertyAddressForm.get(key);
      control?.markAsTouched();
    });

    if (this.isFormValid()) {
      console.log('submitAddressForm', this.propertyAddressForm.value);
      const data = {
        ...this.propertyAddressForm.value,
        latitude: this.currentLocation.lat,
        longitude: this.currentLocation.lng,
      };
      this.property_evaluation_service.updateStepData('address', data);
    } else {
      console.log('Address form is invalid:', {
        formValid: this.propertyAddressForm.valid,
        formErrors: this.getFormErrors(),
        formValues: this.propertyAddressForm.value,
      });
    }
  }

  /**
   * Helper method to get form validation errors for debugging
   */
  private getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.propertyAddressForm.controls).forEach(key => {
      const control = this.propertyAddressForm.get(key);
      if (control && control.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }
}
