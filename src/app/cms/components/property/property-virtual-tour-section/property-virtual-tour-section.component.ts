// src/app/cms/components/property/property-virtual-tour-section/property-virtual-tour-section.component.ts
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { PropertyApiService } from '../../../../public/services/property-api.service';
import { AdvertisementDraft } from '../../../../public/models';
import { finalize } from 'rxjs';
import { PropertyVirtualTourModalComponent } from '../property-virtual-tour-modal/property-virtual-tour-modal.component';
import { ToastService } from '../../../../shared/services/toast.service';
@Component({
  selector: 'app-property-virtual-tour-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent, PropertyVirtualTourModalComponent],
  template: `
    <div class="mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-bold text-black">Tour virtuale</h2>
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

      <div class="h-64 bg-gray-200 rounded-sm overflow-hidden">
        <!-- Show virtual tour if available -->
        <ng-container *ngIf="virtualTourUrl; else noTour">
          <iframe
            [src]="virtualTourUrl"
            width="100%"
            height="100%"
            frameborder="0"
            allowfullscreen
          ></iframe>
        </ng-container>

        <!-- No tour message -->
        <ng-template #noTour>
          <div class="h-full w-full flex items-center justify-center">
            <span class="text-gray-500">Nessun tour virtuale disponibile</span>
          </div>
        </ng-template>
      </div>

      <!-- Virtual Tour Modal -->
      <app-property-virtual-tour-modal
        [isOpen]="isModalOpen"
        [initialVirtualTourUrl]="property?.virtualTourFrameUrl || null"
        (close)="closeModal()"
        (save)="saveVirtualTour($event)"
      ></app-property-virtual-tour-modal>
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
export class PropertyVirtualTourSectionComponent {
  @Input() property: AdvertisementDraft | null = null;
  @Input() readonly = false;

  isModalOpen = false;
  isSaving = false;
  virtualTourUrl: SafeResourceUrl | null = null;

  private propertyApiService = inject(PropertyApiService);
  private sanitizer = inject(DomSanitizer);
  private toast = inject(ToastService);
  ngOnChanges(): void {
    this.updateVirtualTourUrl();
  }

  private updateVirtualTourUrl(): void {
    if (this.property?.virtualTourFrameUrl) {
      this.virtualTourUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        this.property.virtualTourFrameUrl
      );
    } else {
      this.virtualTourUrl = null;
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

  saveVirtualTour(url: string | null): void {
    if (!this.property?.id) {
      console.error('Property ID is missing');
      return;
    }

    this.isSaving = true;

    const updateData: Partial<AdvertisementDraft> = {
      id: this.property.id,
      virtualTourFrameUrl: url || '',
    };

    this.propertyApiService
      .updateAdvertisement(updateData)
      .then(saveObservable => {
        saveObservable.pipe(finalize(() => (this.isSaving = false))).subscribe({
          next: () => {
            // Update the local property object with the new virtual tour URL
            if (this.property) {
              this.property.virtualTourFrameUrl = url || '';
              this.updateVirtualTourUrl();
            }

            this.toast.success('Virtual tour URL aggiornato');
            this.closeModal();
          },
          error: err => {
            this.toast.error("Errore nell'aggiornamento del tour virtuale");
            console.error('Error saving virtual tour URL:', err);
          },
        });
      })
      .catch(err => {
        this.isSaving = false;
        this.toast.error("Errore nell'aggiornamento del tour virtuale");
        console.error('Error preparing save request:', err);
      });
  }
}
