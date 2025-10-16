// Polygon display fix in LeafletMapComponent
import 'leaflet-control-geocoder';
import 'leaflet-control-geocoder/dist/Control.Geocoder.js';
import 'leaflet-draw';

import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Inject,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  PLATFORM_ID,
  SimpleChanges,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import * as L from 'leaflet';

import { Property } from '../../models';
import { AdvertisementService } from '../../services/advertisement-service';

@Component({
  selector: 'app-leaflet-map',
  standalone: true,
  imports: [CommonModule],
  template: `<div
    id="map"
    [style.height]="height"
  ></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class LeafletMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  private advertisementService = inject(AdvertisementService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @Input() properties: Property[] = [];
  @Input() height: string = '100%';

  // Output event to notify parent component of visible properties
  @Output() visiblePropertiesChange = new EventEmitter<Property[]>();
  @Output() mapBoundsChanged = new EventEmitter<any>();

  private isBrowser: boolean = false;
  Leaflet: typeof L | null = null;

  public map!: L.Map;
  immoPing: L.Icon = L.icon({
    iconUrl: 'assets/icons/immo-ping.png',
    iconSize: [40, 60],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  private markers: L.Marker[] = [];
  private markersLayer: L.LayerGroup = L.layerGroup();

  // Flag to prevent update loops
  private isUpdatingMap = false;
  // Flag to track if map is initialized
  private isMapInitialized = false;
  // Debounce timers
  private boundsChangedTimer: any = null;
  private filterPropertiesTimer: any = null;
  // Add polygon property
  private drawnPolygon: L.Polygon | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnChanges(changes: SimpleChanges) {
    // Only update markers when properties change and map is ready
    if (changes['properties'] && this.map && this.isMapInitialized && this.properties) {
      this.handleInitialMapState();
    }
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    try {
      const L = await import('leaflet');
      this.Leaflet = L.default;
      await this.initMap();
      this.isMapInitialized = true;

      // Emit an event when the map is initialized to notify parent component
      this.visiblePropertiesChange.emit([]);

      // Handle initial map state after initialization
      this.handleInitialMapState();
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  }

  ngOnDestroy() {
    // Clean up resources
    if (this.map) {
      this.map.remove();
    }

    // Clear any pending timers
    if (this.boundsChangedTimer) {
      clearTimeout(this.boundsChangedTimer);
    }

    if (this.filterPropertiesTimer) {
      clearTimeout(this.filterPropertiesTimer);
    }
  }

  private async initMap() {
    const baseMapURl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    this.map = L.map('map', {
      zoomControl: false,
    });

    L.tileLayer(baseMapURl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(this.map);

    // Add markers layer to map
    this.markersLayer.addTo(this.map);

    // Add map event listeners - using a single handler for all map movement events
    this.map.on('moveend zoomend', () => this.handleMapMovement());

    // Also listen for drag events but with a longer debounce
    this.map.on('drag', () => {
      if (this.boundsChangedTimer) {
        clearTimeout(this.boundsChangedTimer);
      }

      this.boundsChangedTimer = setTimeout(() => {
        this.filterPropertiesByMapBounds();
      }, 200);
    });
  }

  /**
   * Handle all map movement events in one place
   */
  private handleMapMovement() {
    if (this.isUpdatingMap) return;

    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const bounds = this.map.getBounds();

    // Update filter data with current map state
    this.advertisementService.updateMultipleFilterData({
      latitude: center.lat,
      longitude: center.lng,
      zoom: zoom,
      bbox: {
        lat_max: bounds.getNorthEast().lat,
        lat_min: bounds.getSouthWest().lat,
        long_max: bounds.getNorthEast().lng,
        long_min: bounds.getSouthWest().lng,
      },
    });

    // Notify parent about map bounds change
    this.emitMapBoundsChanged();

    // Filter properties by the current bounds
    this.filterPropertiesByMapBounds();
  }

  public clearPolygonFromMap(): void {
    console.log('Clearing polygon from map');
    this.clearPolygon();

    // If we need to re-center the map after removing the polygon,
    // fit to markers or set a default view here
    if (this.markers.length > 0) {
      const bounds = L.featureGroup(this.markers).getBounds();
      this.isUpdatingMap = true;
      this.map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 15,
      });
      setTimeout(() => {
        this.isUpdatingMap = false;
        this.emitMapBoundsChanged();
        this.filterPropertiesByMapBounds();
      }, 100);
    }
  }

  /**
   * Emit map bounds changed event to parent
   */
  private emitMapBoundsChanged() {
    if (!this.map) return;

    const center = this.map.getCenter();
    const zoom = this.map.getZoom();

    this.mapBoundsChanged.emit({
      lat: center.lat,
      lng: center.lng,
      zoom: zoom,
    });
  }

  /**
   * Handle initial map state setup
   */
  private handleInitialMapState() {
    console.log('handleInitialMapState');
    // Get filter data that might have been restored from URL
    const filterData = this.advertisementService.getFilterData();

    // Check if we have a drawn polygon to display
    if (filterData.polygon_coordinates && filterData.polygon_coordinates.length > 0) {
      console.log('Displaying polygon from saved coordinates:', filterData.polygon_coordinates);
      this.displayPolygon(filterData.polygon_coordinates);
    }

    // If we have latitude and longitude in filter data, use them
    if (filterData.latitude !== undefined && filterData.longitude !== undefined) {
      const lat = filterData.latitude as number;
      const lng = filterData.longitude as number;
      const zoom = (filterData.zoom as number) || 12;

      this.isUpdatingMap = true;
      this.map.setView([lat, lng], zoom);
      setTimeout(() => {
        this.isUpdatingMap = false;
        // Update markers and filter properties once map is ready
        this.updateMarkers();
        // Ensure we filter properties by map bounds after markers are updated
        setTimeout(() => {
          this.filterPropertiesByMapBounds();
        }, 100);
      }, 100);
    } else {
      // Default fallback to Italy
      this.isUpdatingMap = true;
      this.map.setView([41.9028, 12.4964], 6);
      setTimeout(() => {
        this.isUpdatingMap = false;
        this.updateMarkers();
        // Ensure we filter properties by map bounds after markers are updated
        setTimeout(() => {
          this.filterPropertiesByMapBounds();
        }, 100);
      }, 100);
    }
  }

  /**
   * Display a polygon on the map
   */
  private displayPolygon(coordinates: [number, number][]) {
    if (!this.map || !this.Leaflet) return;

    // Remove any existing polygon
    this.clearPolygon();

    console.log('Drawing polygon with coordinates:', coordinates);

    // Convert coordinates to LatLng objects - use [lat, lng] format consistently
    const latLngs = coordinates.map(coord => {
      // Make sure we're using the correct format [lat, lng]
      return this.Leaflet!.latLng(coord[0], coord[1]);
    });

    // Create and add the polygon
    this.drawnPolygon = this.Leaflet.polygon(latLngs, {
      color: '#2E5D63',
      fillColor: '#2E5D63',
      fillOpacity: 0.2,
      weight: 2,
    }).addTo(this.map);

    // Fit the map to the polygon bounds
    const bounds = this.drawnPolygon.getBounds();
    this.map.fitBounds(bounds, { padding: [20, 20] });
  }

  /**
   * Clear any drawn polygon
   */
  private clearPolygon() {
    if (this.drawnPolygon) {
      this.map?.removeLayer(this.drawnPolygon);
      this.drawnPolygon = null;
    }
  }

  /**
   * Update map markers based on properties
   */
  public updateMarkers(): void {
    if (!this.map || !this.isMapInitialized) return;

    // Clear existing markers
    this.markersLayer.clearLayers();
    this.markers = [];

    if (!this.properties || this.properties.length === 0) {
      return;
    }

    // Create markers for each property with valid coordinates
    this.properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const marker = L.marker([property.latitude, property.longitude], {
          icon: this.immoPing,
        });

        // Add popup with property info
        const title = property.address || 'Property';
        const price = Array.isArray(property.price) ? property.price[0] : property.price || 0;

        marker.bindPopup(`
          <strong>${title}</strong><br>
          Price: ${price.toLocaleString('it-IT')} €
        `);

        this.markers.push(marker);
        marker.addTo(this.markersLayer);
      }
    });

    // If we have markers, fit the map bounds with some extra padding
    if (this.markers.length > 0 && !this.isFromUrlParams()) {
      const bounds = L.featureGroup(this.markers).getBounds();
      this.isUpdatingMap = true;
      this.map.fitBounds(bounds, {
        padding: [30, 30],
        maxZoom: 15,
      });
      setTimeout(() => {
        this.isUpdatingMap = false;
        this.emitMapBoundsChanged();
        this.filterPropertiesByMapBounds();
      }, 100);
    }
  }

  /**
   * Check if map position is from URL params
   */
  private isFromUrlParams(): boolean {
    const filterData = this.advertisementService.getFilterData();
    return filterData.latitude !== undefined && filterData.longitude !== undefined;
  }

  /**
   * Filter properties by the current map bounds
   */
  private filterPropertiesByMapBounds(): void {
    if (this.filterPropertiesTimer) {
      clearTimeout(this.filterPropertiesTimer);
    }

    this.filterPropertiesTimer = setTimeout(() => {
      if (!this.map || !this.properties || this.properties.length === 0) {
        this.visiblePropertiesChange.emit([]);
        return;
      }

      const bounds = this.map.getBounds();

      // Filter properties that are within the current map view
      const visibleProperties = this.properties.filter(property => {
        if (property.latitude && property.longitude) {
          const latLng = L.latLng(property.latitude, property.longitude);
          return bounds.contains(latLng);
        }
        return false;
      });

      // Emit the filtered properties to the parent component
      this.visiblePropertiesChange.emit(visibleProperties);
    }, 100);
  }

  /**
   * Public method to fit all markers in the view
   */
  public fitAllMarkers(): void {
    if (!this.map || this.markers.length === 0) {
      return;
    }

    this.isUpdatingMap = true;
    const bounds = L.featureGroup(this.markers).getBounds();
    this.map.fitBounds(bounds, {
      padding: [30, 30],
      maxZoom: 15,
    });

    setTimeout(() => {
      this.isUpdatingMap = false;
      this.emitMapBoundsChanged();
      this.filterPropertiesByMapBounds();
    }, 100);
  }

  /**
   * Public method to manually set map view
   */
  public setMapView(lat: number, lng: number, zoom: number): void {
    if (!this.map) return;

    this.isUpdatingMap = true;
    this.map.setView([lat, lng], zoom);

    setTimeout(() => {
      this.isUpdatingMap = false;
      this.filterPropertiesByMapBounds();
    }, 100);
  }

  /**
   * Public method to check if map is initialized
   */
  public isInitialized(): boolean {
    return this.isMapInitialized;
  }

  /**
   * Public method to get the current map bounds
   */
  public getCurrentMapBounds(): L.LatLngBounds | null {
    if (!this.map) {
      return null;
    }
    return this.map.getBounds();
  }
}
