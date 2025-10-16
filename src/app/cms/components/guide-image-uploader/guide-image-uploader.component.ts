// src/app/cms/components/guide-image-uploader/guide-image-uploader.component.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { GuideService } from '../../services/guide.service';

@Component({
  selector: 'app-guide-image-uploader',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div
      class="w-full border-2 border-dashed p-4 rounded-md bg-gray-50 min-h-[150px] flex flex-col items-center justify-center"
      [class.bg-gray-100]="isDragging"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      @if (isUploading) {
        <div class="flex flex-col items-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
          <p class="text-sm">Caricamento in corso...</p>
        </div>
      } @else if (uploadedImage) {
        <div class="relative w-full h-32">
          <img
            [src]="uploadedImage.url"
            alt="Immagine caricata"
            class="w-full h-full object-contain"
          />
          <button
            (click)="removeImage()"
            class="absolute top-2 right-2 p-1 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-gray-600"
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
      } @else {
        <div class="text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p class="mt-1 text-sm text-gray-600">Trascina qui l'immagine</p>
          <p class="text-xs text-gray-500">Oppure</p>
          <div class="mt-2">
            <label
              for="image-upload"
              class="cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              Cercala nel computer
              <input
                id="image-upload"
                type="file"
                class="sr-only"
                (change)="onFileSelected($event)"
                accept="image/jpeg,image/png,image/gif"
              />
            </label>
          </div>
        </div>
      }

      @if (error) {
        <div class="mt-3 text-sm text-red-600">{{ error }}</div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
    `,
  ],
})
export class GuideImageUploaderComponent implements OnInit {
  @Input() guideId: string | null = null;
  @Input() initialImage: any = null;
  @Output() imageUploaded = new EventEmitter<any>();

  private guideService = inject(GuideService);

  isDragging = false;
  isUploading = false;
  uploadedImage: any = null;
  error: string | null = null;

  ngOnInit(): void {
    if (this.initialImage) {
      this.uploadedImage = this.initialImage;
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.uploadImage(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadImage(file);
    }
  }

  uploadImage(file: File): void {
    // Check if file is valid (type, size)
    if (!this.validateImage(file)) {
      return;
    }

    this.isUploading = true;
    this.error = null;

    // Use the guideService uploadFile method instead of direct HTTP request
    this.guideService
      .uploadFile(file, this.guideId, 'image')
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: (response: any) => {
          console.log('response', response);
          if (response && response.data && response.data[0]) {
            this.uploadedImage = {
              id: response.data[0].id,
              url: response.data[0].signedUrl,
              fileName: response.data[0].name,
            };
            this.imageUploaded.emit(this.uploadedImage);
          }
        },
        error: err => {
          console.error('Error uploading image:', err);
          this.error = "Errore durante il caricamento dell'immagine. Riprova più tardi.";
        },
      });
  }

  validateImage(file: File): boolean {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      this.error = "L'immagine è troppo grande. La dimensione massima è 10MB.";
      return false;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      this.error = "Formato immagine non supportato. Carica un'immagine JPEG, PNG o GIF.";
      return false;
    }

    return true;
  }

  removeImage(): void {
    if (!this.uploadedImage || !this.uploadedImage.id) {
      return;
    }

    this.isUploading = true;
    this.error = null;

    this.guideService
      .deleteFile(this.uploadedImage.id)
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: () => {
          this.uploadedImage = null;
          this.imageUploaded.emit(null);
        },
        error: err => {
          console.error('Error removing image:', err);
          this.error = "Errore durante la rimozione dell'immagine. Riprova più tardi.";
        },
      });
  }
}
