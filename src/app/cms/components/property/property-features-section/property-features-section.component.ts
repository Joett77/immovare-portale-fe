// src/app/cms/components/property/property-features-section/property-features-section.component.ts
import {
  Component,
  Input,
  OnInit,
  inject,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PropertyFeaturesModalComponent } from '../property-features-modal/property-features-modal.component';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { AdvertisementDraft } from '../../../../public/models';
import { finalize } from 'rxjs';
import { parseEnergyClass } from '../../../../public/utils/parse-data';

@Component({
  selector: 'app-property-features-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent, PropertyFeaturesModalComponent],
  template: `
    <div class="mb-8 px-4 lg:px-0">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-black">Caratteristiche</h2>
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
      <div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Tipologia</span>
          <span class="text-sm text-black">{{ property?.type || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Locali</span>
          <span class="text-sm text-black">{{ property?.numberRooms || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Superficie</span>
          <span class="text-sm text-black">{{ property?.squareMetres || '-' }} m²</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Stato immobile</span>
          <span class="text-sm text-black">{{ property?.propertyCondition || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Riscaldamento</span>
          <span class="text-sm text-black">{{ property?.heating || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Anno di costruzione</span>
          <span class="text-sm text-black">{{
            property?.constructionYear || 'Non specificato'
          }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Bagni</span>
          <span class="text-sm text-black">{{ property?.numberBaths || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Piano</span>
          <span class="text-sm text-black">{{ property?.floor || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Classe energetica</span>
          <span class="text-sm text-black">{{
            parseEnergyClass(property?.energyClass || '-')
          }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Stato al rogito</span>
          <span class="text-sm text-black">{{ property?.deedState || '-' }}</span>
        </div>
      </div>

      <!-- Features Modal -->
      <app-property-features-modal
        [isOpen]="isModalOpen"
        [initialData]="property"
        (close)="closeModal()"
        (save)="saveFeatures($event)"
      ></app-property-features-modal>
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
export class PropertyFeaturesSectionComponent implements OnInit, OnChanges {
  @Input() property: AdvertisementDraft | null = null;
  @Input() readonly = false;

  // Output event to notify parent component of property updates
  @Output() propertyUpdated = new EventEmitter<AdvertisementDraft>();

  isModalOpen = false;
  isSaving = false;

  private propertyApiService = inject(PropertyApiService);

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && changes['property'].currentValue) {
    }
  }

  parseEnergyClass(energyClass: string): string {
    return parseEnergyClass(energyClass);
  }

  openModal(): void {
    if (!this.readonly) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveFeatures(data: any): void {
    if (!this.property?.id) {
      console.error('Property ID is missing');
      return;
    }

    this.isSaving = true;

    const updateData: Partial<AdvertisementDraft> = {
      id: this.property.id,
      type: data.type, // Added type field
      squareMetres: data.squareMetres,
      numberRooms: data.numberRooms,
      numberBaths: data.numberBaths,
      floor: data.floor,
      propertyCondition: data.propertyCondition,
      constructionYear: data.constructionYear,
      deedState: data.deedState,
      heating: data.heating,
      energyClass: data.energyClass,
    };

    this.propertyApiService
      .updateAdvertisement(updateData)
      .then(saveObservable => {
        saveObservable.pipe(finalize(() => (this.isSaving = false))).subscribe({
          next: (response: any) => {
            // Check if the response is an error
            if ('error' in response) {
              console.error('API Error:', response);
              return;
            }

            // If successful, response is AdvertisementDraft
            const updatedProperty = response as AdvertisementDraft;

            // Update the local property object with the complete updated data
            this.property = {
              ...this.property!,
              ...updateData,
            };

            // This will trigger updates in other components like price section
            this.propertyUpdated.emit(this.property);

            console.log('Property features updated successfully');
            this.closeModal();
          },
          error: err => {
            console.error('Error saving features:', err);
          },
        });
      })
      .catch(err => {
        this.isSaving = false;
        console.error('Error preparing save request:', err);
      });
  }
}
