// src/app/cms/components/property/property-address-section/property-address-section.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PropertyAddressModalComponent } from '../property-address-modal/property-address-modal.component';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { AdvertisementDraft } from '../../../../public/models';
import { finalize } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-property-address-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent, PropertyAddressModalComponent],
  template: `
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-black">Indirizzo</h2>
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
          <span class="text-sm text-black font-semibold">Via/Piazza</span>
          <span class="text-sm text-black">{{ property?.address || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Numero civico</span>
          <span class="text-sm text-black">{{ property?.houseNumber || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">CAP</span>
          <span class="text-sm text-black">{{ property?.zipCode || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Città</span>
          <span class="text-sm text-black">{{ property?.city || '-' }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Paese</span>
          <span class="text-sm text-black">{{ property?.country || '-' }}</span>
        </div>
      </div>

      <!-- Modal -->
      <app-property-address-modal
        [isOpen]="isModalOpen"
        [initialAddress]="property"
        (close)="closeModal()"
        (save)="saveAddress($event)"
      ></app-property-address-modal>
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
export class PropertyAddressSectionComponent implements OnInit {
  @Input() property: AdvertisementDraft | null = null;
  @Input() readonly = false;
  private toast = inject(ToastService);

  isModalOpen = false;
  isSaving = false;

  private propertyApiService = inject(PropertyApiService);

  ngOnInit(): void {}

  openModal(): void {
    if (!this.readonly) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  saveAddress(addressData: any): void {
    if (!this.property?.id) {
      console.error('Property ID is missing');
      return;
    }

    this.isSaving = true;

    // Ensure we have all the address data
    const city = addressData.city || '';
    const address = addressData.address || '';
    const houseNumber = addressData.houseNumber || '';

    // Create or update the title
    const title = addressData.title || `${city}: ${address} ${houseNumber}`.trim();

    const updateData: Partial<AdvertisementDraft> = {
      id: this.property.id,
      address: addressData.address,
      houseNumber: addressData.houseNumber,
      zipCode: addressData.zipCode,
      city: addressData.city,
      country: addressData.country,
      latitude: addressData.latitude,
      longitude: addressData.longitude,
      title: title, // Include the title in the update data
    };

    this.propertyApiService
      .updateAdvertisement(updateData)
      .then(saveObservable => {
        saveObservable.pipe(finalize(() => (this.isSaving = false))).subscribe({
          next: response => {
            this.property = {
              ...this.property!,
              ...updateData,
            };
            // toast success
            this.toast.success('Indirizzo aggiornato con successo');
          },
          error: err => {
            console.error('Error saving address:', err);
          },
        });
      })
      .catch(err => {
        this.isSaving = false;
        console.error('Error preparing save request:', err);
      });
  }
}
