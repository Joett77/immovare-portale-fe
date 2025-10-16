import { Component, input, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-google-map',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  templateUrl: './google-map.component.html',
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class GMapComponent {
  latitude = input.required<number>();
  longitude = input.required<number>();

  apiLoaded = false;
  zoom = 15;

  options = {
    disableDefaultUI: true,
    zoomControl: true,
    scrollwheel: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: true,
  };

  markerOptions = {
    draggable: false,
    animation: 2, // google.maps.Animation.DROP
  };

  get center(): { lat: number; lng: number } {
    return {
      lat: this.latitude(),
      lng: this.longitude(),
    };
  }

  constructor(
    private httpClient: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadGoogleMapsAPI();
    }
  }

  private loadGoogleMapsAPI() {
    this.httpClient
      .jsonp(
        'https://maps.googleapis.com/maps/api/js?key=AIzaSyDRNhFakaV14UMrI3Q9etrOTbW7cKc_ujU&libraries=places,marker',
        'callback'
      )
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
      .subscribe(loaded => {
        this.apiLoaded = loaded;
      });
  }
}
