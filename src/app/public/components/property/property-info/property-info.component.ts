import { CommonModule, NgComponentOutlet } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApartmentIconComponent } from '../../../../shared/atoms/icons/apartment-icon/apartment-icon.component';
import { FloorplanIconComponent } from '../../../../shared/atoms/icons/floorplan-icon/floorplan-icon.component';
import { MeasureIconComponent } from '../../../../shared/atoms/icons/measure-icon/measure-icon.component';
import { FloorIconComponent } from '../../../../shared/atoms/icons/floor-icon/floor-icon.component';
import { BathIconComponent } from '../../../../shared/atoms/icons/bath-icon/bath-icon.component';
import { ChevronDownIconComponent } from '../../../../shared/atoms/icons/chevron-down-icon/chevron-down-icon.component';
import { Property } from '../../../pages/property/property.model';
import { BalconyIconComponent } from '../../../../shared/atoms/icons/balcony-icon/balcony-icon.component';
import { ElevatorIconComponent } from '../../../../shared/atoms/icons/elevator-icon/elevator-icon.component';
import { GarageIconComponent } from '../../../../shared/atoms/icons/garage-icon/garage-icon.component';
import { GardenIconComponent } from '../../../../shared/atoms/icons/garden-icon/garden-icon.component';
import { BasementIconComponent } from '../../../../shared/atoms/icons/basement-icon/basement-icon.component';
import { PoolIconComponent } from '../../../../shared/atoms/icons/pool-icon/pool-icon.component';
import { TerraceIconComponent } from '../../../../shared/atoms/icons/terrace-icon/terrace-icon.component';
import { TurismLicenseIconComponent } from '../../../../shared/atoms/icons/turism-license-icon/turism-license-icon.component';
import { ParkIconComponent } from '../../../../shared/atoms/icons/park-icon/park-icon.component';
import { AdvertisementDraft } from '../../../models';

@Component({
  selector: 'app-property-info',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ApartmentIconComponent,
    FloorplanIconComponent,
    MeasureIconComponent,
    FloorIconComponent,
    BathIconComponent,
    ChevronDownIconComponent,
    NgComponentOutlet,
  ],
  templateUrl: './property-info.component.html',
  styleUrl: './property-info.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PropertyInfoComponent implements OnChanges {
  @Input() property: Property | AdvertisementDraft | null = null;
  isDescriptionExpanded = false;

  additionalFeatures = [
    { name: 'Balcone', icon: BalconyIconComponent, enabled: false },
    { name: 'Ascensore', icon: ElevatorIconComponent, enabled: false },
    { name: 'Garage', icon: GarageIconComponent, enabled: false },
    { name: 'Giardino', icon: GardenIconComponent, enabled: false },
    { name: 'Parcheggio', icon: ParkIconComponent, enabled: false },
    { name: 'Cantina', icon: BasementIconComponent, enabled: false },
    { name: 'Piscina', icon: PoolIconComponent, enabled: false },
    { name: 'Terrazzo', icon: TerraceIconComponent, enabled: false },
    { name: 'Licenza turistica', icon: TurismLicenseIconComponent, enabled: false },
  ];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && this.property) {
      this.updateAdditionalFeatures();
    }
  }

  // Update enabled status of additional features based on property data
  private updateAdditionalFeatures() {
    if (this.property && this.property.features) {
      // Enable features based on property.features (comma-separated string)
      const features = this.property.features.split(',').map((f: string) => f.trim().toLowerCase());

      this.additionalFeatures.forEach(feature => {
        feature.enabled = features.some(
          (f: string) =>
            f.includes(feature.name.toLowerCase()) || this.featureMatches(f, feature.name)
        );
      });

      // Special case for piscina - mentioned in description
      if (
        this.property.description &&
        this.property.description.toLowerCase().includes('piscina')
      ) {
        const poolFeature = this.additionalFeatures.find(f => f.name === 'Piscina');
        if (poolFeature) poolFeature.enabled = true;
      }
    }
  }

  // Helper method to match features with different spellings
  private featureMatches(apiFeature: string, uiFeature: string): boolean {
    const mappings: Record<string, string[]> = {
      balcone: ['balconi', 'balcony'],
      terrazzo: ['terrazza', 'terrace'],
      garage: ['box auto', 'posto auto coperto'],
      parcheggio: ['posto auto', 'parking'],
      giardino: ['garden'],
      ascensore: ['elevator', 'lift'],
      cantina: ['basement', 'storage'],
      piscina: ['pool', 'swimming'],
    };

    const featureName = uiFeature.toLowerCase();
    return mappings[featureName]?.some(synonym => apiFeature.includes(synonym)) || false;
  }

  // Toggle description expanded state
  toggleDescription() {
    this.isDescriptionExpanded = !this.isDescriptionExpanded;
  }

  // Format price with comma as decimal separator and euro symbol
  formatPrice(price: number | undefined): string {
    if (!price) return '';
    return price.toLocaleString('it-IT') + ',00 €';
  }

  // Calculate price per square meter
  calculatePricePerSqm(): string {
    if (!this.property || !this.property.price || !this.property.squareMetres) return '';
    const pricePerSqm = Math.round(this.property.price / this.property.squareMetres);
    return pricePerSqm.toLocaleString('it-IT') + ',00 €';
  }

  // Get construction year
  getConstructionYear(): string | number {
    return '2001';
  }
}
