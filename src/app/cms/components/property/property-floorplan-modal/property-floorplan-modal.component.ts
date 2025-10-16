// src/app/cms/components/property/property-floorplan-modal/property-floorplan-modal.component.ts
import { Component, EventEmitter, Input, Output, inject, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { FileUploaderComponent } from '../../../../shared/molecules/file-uploader/file-uploader.component';
import { AdvertisementDraft } from '../../../../public/models';
import { UploadResponse } from '../../../../public/services/file-upload.service';

@Component({
  selector: 'app-property-floorplan-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonComponent, FileUploaderComponent],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col overflow-auto"
    >
      <div class="p-4 border-b border-[#CBCCCD] sticky top-0 bg-white z-10">
        <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h2 class="heading-md font-bold text-primary-dark">{{ title }}</h2>
          <button
            (click)="onClose()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8 flex-grow">
        <div class="mb-8">
          <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ subtitle }}</h3>
          <p class="text-gray-600 mb-6">
            Carica la planimetria della tua proprietà in formato JPG, PNG o PDF. Una planimetria
            chiara aiuta i potenziali acquirenti a comprendere meglio gli spazi.
          </p>

          <!-- File Uploader Component -->
          <app-file-uploader
            type="map"
            [description]="'Carica la planimetria della tua proprietà'"
            [propertyId]="propertyId"
            [initialFiles]="initialFloorplan ? [initialFloorplan] : []"
            (filesUploaded)="onFloorplanUploaded($event)"
            (uploadError)="onUploadError($event)"
          ></app-file-uploader>
        </div>

        <!-- Bottom Action Buttons -->
        <div class="mt-6 flex justify-end space-x-4">
          <app-button
            [type]="'secondary'"
            [text]="'Annulla'"
            [size]="'md'"
            (buttonClick)="onClose()"
          ></app-button>
          <app-button
            [type]="'primary'"
            [text]="'Conferma modifiche'"
            [size]="'md'"
            (buttonClick)="saveChanges()"
          ></app-button>
        </div>
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
export class PropertyFloorplanModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Modifica planimetria';
  @Input() subtitle = 'Carica la planimetria della tua proprietà';
  @Input() propertyId: string | null = null;
  @Input() initialFloorplan: UploadResponse | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<UploadResponse | null>();
  @Output() error = new EventEmitter<string>();

  uploadedFloorplan: UploadResponse | null = null;
  errorMessage: string | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.uploadedFloorplan = this.initialFloorplan;
  }

  ngOnChanges(): void {
    if (this.isOpen && isPlatformBrowser(this.platformId)) {
      document.body.classList.add('overflow-hidden');
    }
  }

  onClose(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('overflow-hidden');
    }
    this.close.emit();
  }

  saveChanges(): void {
    this.save.emit(this.uploadedFloorplan);
  }

  onFloorplanUploaded(floorplans: UploadResponse[]): void {
    // Take the first floorplan if available
    this.uploadedFloorplan = floorplans.length > 0 ? floorplans[0] : null;
    this.errorMessage = null;
  }

  onUploadError(message: string): void {
    this.errorMessage = message;
    this.error.emit(message);
  }
}
