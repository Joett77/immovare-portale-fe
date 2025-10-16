// city-icon.component.ts - Updated to handle click events
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface City {
  id: number;
  label: string;
  icon: any;
  coordinates: {
    lat: number;
    lng: number;
  };
  zoom: number;
  searchQuery: string;
}

@Component({
  selector: 'app-city-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center p-4 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors duration-200"
      (click)="onCityClick()"
    >
      <!-- Dynamic icon component -->
      <div class="mb-2">
        <ng-container *ngComponentOutlet="city.icon"></ng-container>
      </div>

      <!-- City name -->
      <span class="text-center font-semibold text-primary-dark">
        {{ city.label }}
      </span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1;
        min-width: 120px;
        max-width: 150px;
      }

      .flex {
        min-height: 100px;
      }
    `,
  ],
})
export class CityIconComponent {
  @Input() city!: City;
  @Output() citySelected = new EventEmitter<City>();

  onCityClick(): void {
    this.citySelected.emit(this.city);
  }
}
