import { Component } from '@angular/core';
import { FloorplanIconComponent } from '../../atoms/icons/floorplan-icon/floorplan-icon.component';
import { MeasureIconComponent } from '../../atoms/icons/measure-icon/measure-icon.component';
import { BathIconComponent } from '../../atoms/icons/bath-icon/bath-icon.component';
import { CommonModule } from '@angular/common';
import { Input } from '@angular/core';

@Component({
  selector: 'app-properties-map-details',
  standalone: true,
  imports: [CommonModule, MeasureIconComponent, BathIconComponent, FloorplanIconComponent],
  templateUrl: './properties-map-details.component.html',
  styleUrl: './properties-map-details.component.scss',
})
export class PropertiesMapDetailsComponent {
  @Input() street: string = 'Via Roma';
  @Input() street_number: string = '22';
  @Input() city: string = 'Torino';
  @Input() rooms: number = 3;
  @Input() bathrooms: number = 4;
  @Input() squareMeters: number = 1400;
  @Input() sellingPrice: number = 234000;
}
