// src/app/cms/components/property/property-extra-features-section/property-extra-features-section.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PropertyExtraFeaturesModalComponent } from '../property-extra-features-modal/property-extra-features-modal.component';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { AdvertisementDraft } from '../../../../public/models';
import { finalize } from 'rxjs';
import { BalconyIconComponent } from '../../../../shared/atoms/icons/balcony-icon/balcony-icon.component';
import { BasementIconComponent } from '../../../../shared/atoms/icons/basement-icon/basement-icon.component';
import { ElevatorIconComponent } from '../../../../shared/atoms/icons/elevator-icon/elevator-icon.component';
import { GarageIconComponent } from '../../../../shared/atoms/icons/garage-icon/garage-icon.component';
import { GardenIconComponent } from '../../../../shared/atoms/icons/garden-icon/garden-icon.component';
import { ParkIconComponent } from '../../../../shared/atoms/icons/park-icon/park-icon.component';
import { PoolIconComponent } from '../../../../shared/atoms/icons/pool-icon/pool-icon.component';
import { TerraceIconComponent } from '../../../../shared/atoms/icons/terrace-icon/terrace-icon.component';
import { TurismLicenseIconComponent } from '../../../../shared/atoms/icons/turism-license-icon/turism-license-icon.component';

@Component({
  selector: 'app-property-extra-features-section',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    PropertyExtraFeaturesModalComponent,
    BalconyIconComponent,
    BasementIconComponent,
    ElevatorIconComponent,
    GarageIconComponent,
    GardenIconComponent,
    ParkIconComponent,
    PoolIconComponent,
    TerraceIconComponent,
    TurismLicenseIconComponent,
  ],
  template: `
    <div>
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-black">Descrizione</h2>
          @if (!readonly) {
            <button
              type="button"
              class="px-3 py-1 border border-gray-300 rounded-sm text-xs"
              (click)="openModal()"
            >
              Modifica
            </button>
          }

        </div>
        <!-- Description display -->
        <div class="mb-6 px-4 lg:px-0">
          <div class="text-base">
            <p class="mb-4">
              {{ property?.description || 'Nessuna descrizione disponibile.' }}
            </p>
          </div>
        </div>
      </div>
      <div class="mb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-bold text-black">Caratteristiche aggiuntive</h2>
          @if (!readonly) {
            <button
              type="button"
              class="px-3 py-1 border border-gray-300 rounded-sm text-xs"
              (click)="openModal()"
            >
              Modifica
            </button>
          }
        </div>
        <!-- Features display -->
        <div class="flex flex-wrap gap-4">
          @if (getFeatureNames().length > 0) {
            @for (feature of getFeatureNames(); track feature) {
              <div class="flex items-center p-3 bg-[#F6F6F6]">
                <div class="flex items-center justify-center h-4 w-4">
                  <ng-container *ngComponentOutlet="getFeatureIcon(feature)" />
                </div>
                <span class="text-black text-sm ml-2">{{ feature }}</span>
              </div>
            }
          } @else {
            <div class="text-gray-500">Nessuna caratteristica aggiuntiva specificata.</div>
          }
        </div>

        <!-- Modal -->
        <app-property-extra-features-modal
          [isOpen]="isModalOpen"
          [initialData]="property"
          (close)="closeModal()"
          (save)="saveExtraFeatures($event)"
        ></app-property-extra-features-modal>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PropertyExtraFeaturesSectionComponent implements OnInit {
  @Input() property: AdvertisementDraft | null = null;
  @Input() readonly = false;

  isModalOpen = false;
  isSaving = false;

  private propertyApiService = inject(PropertyApiService);

  // Feature icons mapping
  private featureIcons: Record<string, any> = {
    Balcone: BalconyIconComponent,
    Cantina: BasementIconComponent,
    Ascensore: ElevatorIconComponent,
    Garage: GarageIconComponent,
    Giardino: GardenIconComponent,
    Parcheggio: ParkIconComponent,
    Piscina: PoolIconComponent,
    Terrazzo: TerraceIconComponent,
    'Licenza turistica': TurismLicenseIconComponent,
  };

  ngOnInit(): void {}

  openModal(): void {
    if (!this.readonly) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  getFeatureNames(): string[] {
    if (!this.property?.features) return [];
    return this.property.features
      .split(',')
      .map((f: string) => f.trim())
      .filter(Boolean);
  }

  getFeatureIcon(featureName: string): any {
    return this.featureIcons[featureName] || null;
  }

  saveExtraFeatures(data: any): void {
    if (!this.property?.id) {
      console.error('Property ID is missing');
      return;
    }

    this.isSaving = true;

    const updateData: Partial<AdvertisementDraft> = {
      id: this.property.id,
      description: data.description,
      features: data.features,
    };

    this.propertyApiService
      .updateAdvertisement(updateData)
      .then(saveObservable => {
        saveObservable.pipe(finalize(() => (this.isSaving = false))).subscribe({
          next: () => {
            // Update the local property object with the new data
            this.property = {
              ...this.property!,
              description: data.description,
              features: data.features,
            };

            console.log('Extra features updated successfully');
          },
          error: err => {
            console.error('Error saving extra features:', err);
          },
        });
      })
      .catch(err => {
        this.isSaving = false;
        console.error('Error preparing save request:', err);
      });
  }
}
