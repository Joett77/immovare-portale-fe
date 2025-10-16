// draw-map-modal.component.ts with fixed Signal handling
import {
  Component,
  OnInit,
  OnDestroy,
  WritableSignal,
  inject,
  signal,
  ViewChild,
  EventEmitter,
  Output,
  Input,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  effect,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { LeafletMapDrawComponent } from '../leaflet-map-draw/leaflet-map-draw.component';
import { LInputAutocompleteComponent } from '../l-input-autocomplete/l-input-autocomplete.component';
import { AutocompleteServiceService } from '../../services/autocomplete-service.service';
import { AdvertisementService } from '../../services/advertisement-service';
import { Router } from '@angular/router';
import { ToastService } from '../../../shared/services/toast.service';
import * as L from 'leaflet';
import 'leaflet-draw';
import { Subscription } from 'rxjs';
import { GeoFeature } from '../../models';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';

@Component({
  selector: 'app-draw-map-modal',
  standalone: true,
  imports: [CommonModule, LeafletMapDrawComponent, LInputAutocompleteComponent, ButtonComponent],
  templateUrl: './draw-map-modal.component.html',
})
export class DrawMapModalComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(LeafletMapDrawComponent) mapComponent?: LeafletMapDrawComponent;
  @ViewChild(LInputAutocompleteComponent) autocompleteComponent?: LInputAutocompleteComponent;

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();

  private autocompleteService = inject(AutocompleteServiceService);
  private advertisementService = inject(AdvertisementService);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private isBrowser: boolean = false;
  private subscriptions: Subscription[] = [];

  // Polygon data
  private polygonCoordinates: [number, number][] = [];
  propertiesCount: number = 0;
  showPropertyCountButton: boolean = false;

  // For the autocomplete
  initialSearchValue: string = '';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Use effect to track changes to the GeoFeature signal
    effect(() => {
      const feature = this.autocompleteService.getGeoFeature() as any;
      if (feature) {
        console.log('GeoFeature changed in DrawMapModal (from effect):', feature);
        // If we have an address field in the filter data, update it
        if (feature.properties && feature.properties.display_name) {
          this.advertisementService.updateFilterData('address', feature.properties.display_name);
        }
      }
    });
  }

  ngOnInit() {
    if (!this.isBrowser) return;

    // Get initial location from filter data to set in autocomplete
    const filterData = this.advertisementService.getFilterData();
    if (filterData.address) {
      this.initialSearchValue = filterData.address as string;
    }

    // Subscribe to location changes from autocomplete
    const locationSub = this.autocompleteService.locationChanged.subscribe(({ lat, lng, zoom }) => {
      console.log('Location changed in DrawMapModal:', lat, lng, zoom);
      if (this.mapComponent?.map) {
        this.mapComponent.map.setView([lat, lng], zoom || 15);
      }
    });
    this.subscriptions.push(locationSub);
  }

  async ngAfterViewInit() {
    // Ensure autocomplete is ready
    setTimeout(() => {
      if (this.autocompleteComponent && this.initialSearchValue) {
        console.log('Setting initial value in autocomplete:', this.initialSearchValue);
        this.autocompleteComponent.setValue(this.initialSearchValue);
      }
    }, 300);
  }

  /**
   * Handle polygon drawing completion event from LeafletMapDrawComponent
   */
  onDrawingComplete(data: { polygonCoordinates: [number, number][]; count: number }) {
    console.log('Drawing complete with coordinates:', data.polygonCoordinates);

    // Store the polygon coordinates - ensure correct format [lat, lng]
    this.polygonCoordinates = data.polygonCoordinates;
    this.propertiesCount = data.count;

    // Show the property count button
    this.showPropertyCountButton = this.propertiesCount > 0;

    // Notify user about the properties found
    if (this.propertiesCount > 0) {
      this.toastService.success(`Trovati ${this.propertiesCount} immobili nell'area selezionata`);
    }
  }

  /**
   * View properties in the selected area
   */
  viewPropertiesInArea() {
    // If we have polygon data and properties
    if (this.polygonCoordinates.length > 0 && this.propertiesCount > 0) {
      console.log('Navigating with polygon coordinates:', this.polygonCoordinates);

      // Update the advertisement service with the polygon data
      // Important: Make sure we're using the correct format consistently
      this.advertisementService.updateFilterData('polygon_coordinates', this.polygonCoordinates);

      // Calculate and set the bounding box from polygon for better map view
      const bounds = this.calculateBoundsFromPolygon(this.polygonCoordinates);
      if (bounds) {
        this.advertisementService.updateFilterData('bbox', bounds);

        // Set center of the polygon as the map center
        const center = {
          lat: (bounds.lat_max + bounds.lat_min) / 2,
          lng: (bounds.long_max + bounds.long_min) / 2,
        };

        this.advertisementService.updateMultipleFilterData({
          latitude: center.lat,
          longitude: center.lng,
          zoom: 13, // Reasonable zoom level to see the area
        });
      }

      // Close the modal
      this.close.emit();
      this.autocompleteService.isDrawMapModalOpen.set(false);

      // Navigate to the advertisements page with polygon filter
      this.router.navigate(['/annunci-immobili']);
    } else if (this.polygonCoordinates.length > 0) {
      this.toastService.error("Nessun immobile trovato nell'area selezionata");
    } else {
      this.toastService.error("Disegna un'area sulla mappa per continuare");
    }
  }

  /**
   * Calculate bounding box from polygon coordinates
   */
  private calculateBoundsFromPolygon(
    coordinates: [number, number][]
  ): { lat_min: number; lat_max: number; long_min: number; long_max: number } | null {
    if (!coordinates || coordinates.length === 0) return null;

    let lat_min = coordinates[0][0];
    let lat_max = coordinates[0][0];
    let long_min = coordinates[0][1];
    let long_max = coordinates[0][1];

    for (const [lat, lng] of coordinates) {
      lat_min = Math.min(lat_min, lat);
      lat_max = Math.max(lat_max, lat);
      long_min = Math.min(long_min, lng);
      long_max = Math.max(long_max, lng);
    }

    return { lat_min, lat_max, long_min, long_max };
  }

  /**
   * Apply filter - kept for backward compatibility
   */
  applyFilter() {
    this.viewPropertiesInArea();
  }

  closeModal() {
    // Reset autocomplete
    if (this.autocompleteComponent) {
      this.autocompleteComponent.setValue('');
    }

    // Clear polygon filters when canceling
    this.advertisementService.updateFilterData('polygon_coordinates', null);
    this.advertisementService.updateFilterData('bbox', null);

    // Emit close event
    this.close.emit();
    this.autocompleteService.isDrawMapModalOpen.set(false);
  }

  ngOnDestroy() {
    // Clean up
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
