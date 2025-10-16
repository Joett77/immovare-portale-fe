// leaflet-map-draw.component.ts with fixed Signal handling
import {
  Component,
  Inject,
  inject,
  PLATFORM_ID,
  OnDestroy,
  AfterViewInit,
  Output,
  EventEmitter,
  effect,
} from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-draw';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AutocompleteServiceService } from '../../services/autocomplete-service.service';
import { AdvertisementService } from '../../services/advertisement-service';
import { HttpClient } from '@angular/common/http';
import { environment_dev } from '../../../environments/env.dev';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GeoFeature } from '../../models';

@Component({
  selector: 'app-leaflet-map-draw',
  standalone: true,
  imports: [CommonModule],
  template: `<div
    id="draw-map"
    style="height: 100vh; width: 100%; z-index: 40;"
  ></div>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        position: relative;
      }
    `,
  ],
})
export class LeafletMapDrawComponent implements AfterViewInit, OnDestroy {
  private autocompleteService = inject(AutocompleteServiceService);
  private advertisementService = inject(AdvertisementService);
  private http = inject(HttpClient);

  private isBrowser: boolean = false;
  private Leaflet: typeof L | null = null;
  public map: L.Map | null = null;
  private drawnItems: L.FeatureGroup = new L.FeatureGroup();
  private drawControl: L.Control.Draw | null = null;
  private currentPolygon: L.Polygon | null = null;
  private currentPolygonCoordinates: [number, number][] = [];
  private subscriptions: Subscription[] = [];

  // Event emitter for when drawing is complete
  @Output() drawingComplete = new EventEmitter<{
    polygonCoordinates: [number, number][];
    count: number;
  }>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);

    // Use effect to track changes to the GeoFeature signal
    effect(() => {
      const feature = this.autocompleteService.getGeoFeature() as any;
      if (feature && feature.geometry && feature.geometry.coordinates && this.map) {
        const [lng, lat] = feature.geometry.coordinates;
        console.log('GeoFeature coordinates in map-draw (from effect):', lat, lng);
        this.map.setView([lat, lng], 15);
      }
    });
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    try {
      const L = await import('leaflet');
      this.Leaflet = L.default;

      // Add custom CSS to make the polygon vertices appear as red circles
      const style = document.createElement('style');
      style.textContent = `
        /* Make all vertex markers red circles */
        .leaflet-marker-icon.leaflet-div-icon.leaflet-editing-icon {
          background-color: #2E5D63 !important;
          border-radius: 50% !important;
          border: 2px solid white !important;
          width: 20px !important;
          height: 20px !important;
          margin-left: -10px !important;
          margin-top: -10px !important;
        }
      `;
      document.head.appendChild(style);

      await this.initMap();
      this.setupDrawingTools();
      this.setupLocationSubscription();
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  }

  private async initMap() {
    if (!this.Leaflet || !this.isBrowser) return;

    this.map = this.Leaflet.map('draw-map', {
      zoomControl: false,
    });

    // Add tile layer
    this.Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    // Add zoom control
    this.Leaflet.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(this.map);

    // Add drawn items layer
    this.map.addLayer(this.drawnItems);

    // Get initial position from filter data
    const filterData = this.advertisementService.getFilterData();
    if (filterData.latitude && filterData.longitude) {
      this.map.setView([filterData.latitude, filterData.longitude], filterData.zoom || 12);
    } else {
      // Default to center of Italy
      this.map.setView([41.9028, 12.4964], 6);
    }
  }

  private setupDrawingTools() {
    if (!this.map || !this.Leaflet) return;

    const options: L.Control.DrawConstructorOptions = {
      position: 'bottomright', // Position the drawing controls in the bottom right
      draw: {
        polyline: false,
        marker: false,
        circlemarker: false,
        circle: false,
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: '#2E5D63',
            fillColor: '#2E5D63',
            fillOpacity: 0.2,
          },
        },
      },
      edit: {
        featureGroup: this.drawnItems,
        remove: true,
      },
    };

    this.drawControl = new this.Leaflet.Control.Draw(options);
    this.map.addControl(this.drawControl);

    // Handle draw events
    this.map.on(this.Leaflet.Draw.Event.CREATED, (e: any) => {
      this.handleDrawCreated(e);
    });

    this.map.on(this.Leaflet.Draw.Event.EDITED, (e: any) => {
      this.handleDrawEdited(e);
    });

    this.map.on(this.Leaflet.Draw.Event.DELETED, (e: any) => {
      this.handleDrawDeleted(e);
    });
  }

  private setupLocationSubscription() {
    const locationSub = this.autocompleteService.locationChanged.subscribe(({ lat, lng, zoom }) => {
      console.log('Location changed in map-draw component:', lat, lng, zoom);
      if (this.map) {
        this.map.setView([lat, lng], zoom || 15);
      }
    });

    this.subscriptions.push(locationSub);
  }

  private handleDrawCreated(e: any) {
    const layer = e.layer;

    // Remove any existing polygon
    this.clearDrawnArea();

    // Add the new layer
    this.drawnItems.addLayer(layer);
    this.currentPolygon = layer;

    // Extract coordinates and update filter
    this.updatePolygonFilter(layer);

    // Check for properties in the polygon
    this.checkPropertiesInPolygon();
  }

  private handleDrawEdited(e: any) {
    const layers = e.layers;
    layers.eachLayer((layer: any) => {
      if (layer instanceof this.Leaflet!.Polygon || layer instanceof this.Leaflet!.Rectangle) {
        this.currentPolygon = layer;
        this.updatePolygonFilter(layer);

        // Check for properties in the polygon after editing
        this.checkPropertiesInPolygon();
      }
    });
  }

  private handleDrawDeleted(e: any) {
    this.currentPolygon = null;
    this.currentPolygonCoordinates = [];

    // Clear polygon filter
    this.advertisementService.updateFilterData('polygon_coordinates', null);
    this.advertisementService.updateFilterData('bbox', null);

    // Emit event with zero properties
    this.drawingComplete.emit({
      polygonCoordinates: [],
      count: 0,
    });
  }

  private updatePolygonFilter(layer: L.Polygon | L.Rectangle) {
    if (!layer || !this.Leaflet) return;

    // Get polygon coordinates
    const latLngs = layer.getLatLngs() as L.LatLng[][];
    const coordinates: [number, number][] = [];

    // Convert LatLng objects to coordinate pairs [lat, lng]
    // NOTE: This is critical - ensure consistent format
    if (Array.isArray(latLngs[0])) {
      // Polygon with holes (we'll use the outer ring)
      (latLngs[0] as L.LatLng[]).forEach(latLng => {
        coordinates.push([latLng.lat, latLng.lng]);
      });
    } else {
      // Simple polygon
      (latLngs as unknown as L.LatLng[]).forEach(latLng => {
        coordinates.push([latLng.lat, latLng.lng]);
      });
    }

    // Make sure polygon is closed (first point = last point)
    if (
      coordinates.length > 0 &&
      (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
        coordinates[0][1] !== coordinates[coordinates.length - 1][1])
    ) {
      coordinates.push([...coordinates[0]]);
    }

    console.log('Polygon coordinates:', coordinates);

    // Save current polygon coordinates
    this.currentPolygonCoordinates = coordinates;

    // Calculate bounding box
    const bounds = layer.getBounds();
    const bbox = {
      lat_min: bounds.getSouth(),
      lat_max: bounds.getNorth(),
      long_min: bounds.getWest(),
      long_max: bounds.getEast(),
    };

    // Update filters
    this.advertisementService.updateFilterData('polygon_coordinates', coordinates);
    this.advertisementService.updateFilterData('bbox', bbox);

    // Set map view to the center of the polygon
    const center = bounds.getCenter();
    this.advertisementService.updateMultipleFilterData({
      latitude: center.lat,
      longitude: center.lng,
      zoom: this.map?.getZoom(),
    });
  }

  /**
   * Check how many properties are in the drawn polygon
   */
  private checkPropertiesInPolygon() {
    if (!this.currentPolygonCoordinates || this.currentPolygonCoordinates.length < 3) {
      this.drawingComplete.emit({
        polygonCoordinates: [],
        count: 0,
      });
      return;
    }

    // Make API call to check properties in polygon
    const url = `${environment_dev.apiUrl}/api/advertisements/in-polygon`;

    // Format data as expected by the API
    const data = {
      polygonCoordinates: this.currentPolygonCoordinates,
    };

    console.log('Checking properties in polygon:', data);

    this.http.post<any>(url, data).subscribe({
      next: response => {
        const count = response.count || 0;
        console.log(`Found ${count} properties in polygon`);

        // Emit the event with the count and coordinates
        this.drawingComplete.emit({
          polygonCoordinates: this.currentPolygonCoordinates,
          count: count,
        });
      },
      error: error => {
        console.error('Error checking properties in polygon:', error);
        this.drawingComplete.emit({
          polygonCoordinates: this.currentPolygonCoordinates,
          count: 0,
        });
      },
    });
  }

  private clearDrawnArea() {
    if (this.drawnItems) {
      this.drawnItems.clearLayers();
    }
    this.currentPolygon = null;
    this.currentPolygonCoordinates = [];

    // Emit event with zero properties
    this.drawingComplete.emit({
      polygonCoordinates: [],
      count: 0,
    });
  }

  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());

    if (this.map && this.drawControl) {
      this.map.removeControl(this.drawControl);
    }

    if (this.map && this.drawnItems) {
      this.map.removeLayer(this.drawnItems);
    }

    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
