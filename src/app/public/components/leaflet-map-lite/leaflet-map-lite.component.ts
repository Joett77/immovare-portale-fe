import {
  Component,
  Input,
  AfterViewInit,
  OnChanges,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import type * as L from 'leaflet'; // Proper type import

@Component({
  selector: 'app-leaflet-map-lite',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      [id]="mapId"
      [style.height]="height"
      [style.zIndex]="20"
    ></div>
  `,
})
export class LeafletMapLiteComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() longitude: number = 9.19;
  @Input() latitude: number = 45.4642;
  @Input() height: string = '500px';
  @Input() mapId: string = 'map';

  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private Leaflet: typeof L | null = null;
  private isBrowser: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  async ngAfterViewInit() {
    if (!this.isBrowser) return;

    try {
      const L = await import('leaflet');
      this.Leaflet = L.default;
      this.initMap();
    } catch (error) {
      console.error('Error loading Leaflet:', error);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.map && (changes['latitude'] || changes['longitude'])) {
      this.updateMarkerPosition();
    }
  }

  private initMap() {
    if (!this.Leaflet || !this.isBrowser) return;

    this.map = this.Leaflet.map(this.mapId).setView([this.latitude, this.longitude], 16);

    this.Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.addMarker();
  }

  private addMarker() {
    if (!this.Leaflet || !this.map || !this.isBrowser) return;

    const icon = this.Leaflet.icon({
      iconUrl: 'assets/icons/immo-ping.png',
      iconSize: [40, 60],
      iconAnchor: [20, 40],
    });

    this.marker = this.Leaflet.marker([this.latitude, this.longitude], { icon }).addTo(this.map);
  }

  private updateMarkerPosition() {
    if (!this.Leaflet || !this.map || !this.marker || !this.isBrowser) return;

    this.marker.setLatLng([this.latitude, this.longitude]);
    this.map.setView([this.latitude, this.longitude]);
  }

  @Output() locationChanged = new EventEmitter<{ lat: number; lng: number }>();

  // In your marker dragend handler
  onMarkerDragEnd(e: any) {
    const newLatLng = e.target.getLatLng();
    this.locationChanged.emit({
      lat: newLatLng.lat,
      lng: newLatLng.lng,
    });
  }

  ngOnDestroy() {
    if (this.map && this.isBrowser) {
      this.map.remove();
      this.map = null;
    }
  }
}
