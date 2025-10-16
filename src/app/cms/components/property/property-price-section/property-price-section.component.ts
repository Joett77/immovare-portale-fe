// property-price-section.component.ts
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
import { PropertyPriceModalComponent } from '../property-price-modal/property-price-modal.component';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { AdvertisementDraft } from '../../../../public/models';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-property-price-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent, PropertyPriceModalComponent],
  template: `
    <div class="mb-8 px-4 lg:px-0">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-black">Info sul prezzo</h2>
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
          <span class="text-sm text-black font-semibold">Prezzo</span>
          <span class="text-sm text-black">{{ formatPrice(property?.price) }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Prezzo al m²</span>
          <span class="text-sm text-black">{{ calculatePricePerSqm() }}</span>
        </div>
        <div class="flex justify-between pb-1 pt-3 border-b border-[#CBCCCD]">
          <span class="text-sm text-black font-semibold">Spese condominiali</span>
          <span class="text-sm text-black">
            {{ hasCommunityFees() ? formatCommunityFees() : 'Nessuna' }}
          </span>
        </div>
      </div>

      <app-property-price-modal
        [isOpen]="isModalOpen"
        [initialData]="property"
        (close)="closeModal()"
        (save)="savePriceInfo($event)"
      ></app-property-price-modal>
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
export class PropertyPriceSectionComponent implements OnInit, OnChanges {
  @Input() property: AdvertisementDraft | null = null;
  @Input() readonly = false;
  @Output() propertyUpdated = new EventEmitter<AdvertisementDraft>();

  isModalOpen = false;
  isSaving = false;

  private propertyApiService = inject(PropertyApiService);

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['property'] && changes['property'].currentValue) {
    }
  }

  openModal(): void {
    if (!this.readonly) {
      this.isModalOpen = true;
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  savePriceInfo(data: any): void {
    if (!this.property?.id) {
      console.error('Property ID is missing');
      return;
    }

    this.isSaving = true;

    const updateData: Partial<AdvertisementDraft> = {
      id: this.property.id,
      price: data.price,
      condoFees: data.condoFees,
    };

    this.propertyApiService
      .updateAdvertisement(updateData)
      .then(saveObservable => {
        saveObservable.pipe(finalize(() => (this.isSaving = false))).subscribe({
          next: () => {
            // Update the local property object with the new data
            const updatedProperty = {
              ...this.property!,
              price: data.price,
              condoFees: data.condoFees,
            };
            this.property = updatedProperty;

            // Emit the updated property to parent component
            this.propertyUpdated.emit(updatedProperty);

            console.log('Price information updated successfully');
            this.closeModal();
          },
          error: err => {
            console.error('Error saving price info:', err);
          },
        });
      })
      .catch(err => {
        this.isSaving = false;
        console.error('Error preparing save request:', err);
      });
  }

  // Helper method to format price
  formatPrice(price: number | undefined): string {
    if (!price) return '0,00 €';
    return price.toLocaleString('it-IT') + ',00 €';
  }

  formatCommunityFees(): string {
    if (!this.property?.condoFees) return '0,00 €';
    const fees = parseFloat(this.property.condoFees.toString());
    return fees.toLocaleString('it-IT') + ',00 € mensili';
  }

  hasCommunityFees(): boolean {
    if (!this.property?.condoFees) return false;
    const fees = parseFloat(this.property.condoFees.toString());
    return fees > 0;
  }

  calculatePricePerSqm(): string {
    if (!this.property?.price || !this.property?.squareMetres || this.property.squareMetres <= 0) {
      return '0,00 €';
    }

    const pricePerSqm = Math.round(this.property.price / this.property.squareMetres);
    return pricePerSqm.toLocaleString('it-IT') + ',00 €';
  }
}
