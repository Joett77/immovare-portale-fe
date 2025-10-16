// src/app/cms/components/guide-file-uploader/guide-file-uploader.component.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { GuideService } from '../../services/guide.service';

@Component({
  selector: 'app-guide-file-uploader',
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
      } @else if (uploadedFile) {
        <div class="w-full flex items-center justify-between">
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-8 w-8 text-gray-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <div>
              <p class="text-sm font-medium text-black">{{ uploadedFile.fileName }}</p>
              <a
                [href]="uploadedFile.url"
                target="_blank"
                class="text-xs text-blue-600 hover:underline"
                >Visualizza</a
              >
            </div>
          </div>
          <button
            (click)="removeFile()"
            class="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
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
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="mt-1 text-sm text-gray-600">Trascina qui il file</p>
          <p class="text-xs text-gray-500">Oppure</p>
          <div class="mt-2">
            <label
              for="file-upload"
              class="cursor-pointer px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 text-sm font-medium text-gray-700"
            >
              Cercalo nel computer
              <input
                id="file-upload"
                type="file"
                class="sr-only"
                (change)="onFileSelected($event)"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
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
export class GuideFileUploaderComponent implements OnInit {
  @Input() guideId: string | null = null;
  @Input() initialFile: any = null;
  @Output() fileUploaded = new EventEmitter<any>();

  private guideService = inject(GuideService);

  isDragging = false;
  isUploading = false;
  uploadedFile: any = null;
  error: string | null = null;

  ngOnInit(): void {
    if (this.initialFile) {
      this.uploadedFile = this.initialFile;
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
      this.uploadFile(file);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.uploadFile(file);
    }
  }

  uploadFile(file: File): void {
    // Validate file before uploading
    if (!this.validateFile(file)) {
      return;
    }

    this.isUploading = true;
    this.error = null;

    // Use the guideService uploadFile method
    this.guideService
      .uploadFile(file, this.guideId, 'file')
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: (response: any) => {
          console.log('File upload response:', response);
          // Handle both possible response formats
          if (response && response.data && response.data[0]) {
            // Format used in the image uploader
            this.uploadedFile = {
              id: response.data[0].id,
              url: response.data[0].signedUrl || response.data[0].url,
              fileName: response.data[0].name,
            };
            this.fileUploaded.emit(this.uploadedFile);
          } else if (response && response[0]) {
            // Original format
            this.uploadedFile = {
              id: response[0].id,
              url: response[0].url,
              fileName: response[0].name,
            };
            this.fileUploaded.emit(this.uploadedFile);
          } else {
            console.error('Unexpected response format:', response);
            this.error = 'Formato di risposta non valido.';
          }
        },
        error: err => {
          console.error('Error uploading file:', err);
          this.error = 'Errore durante il caricamento del file. Riprova più tardi.';
        },
      });
  }

  validateFile(file: File): boolean {
    // Check file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      this.error = 'Il file è troppo grande. La dimensione massima è 20MB.';
      return false;
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    // Also check extension as MIME type can be unreliable
    const fileName = file.name.toLowerCase();
    const validExtension = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'].some(ext =>
      fileName.endsWith(ext)
    );

    if (!allowedTypes.includes(file.type) && !validExtension) {
      this.error = 'Formato file non supportato. Carica un file PDF, DOC, DOCX, XLS o XLSX.';
      return false;
    }

    return true;
  }

  removeFile(): void {
    if (!this.uploadedFile || !this.uploadedFile.id) {
      // If no ID, just clear the UI
      this.uploadedFile = null;
      this.fileUploaded.emit(null);
      return;
    }

    this.isUploading = true;
    this.error = null;

    this.guideService
      .deleteFile(this.uploadedFile.id)
      .pipe(finalize(() => (this.isUploading = false)))
      .subscribe({
        next: () => {
          this.uploadedFile = null;
          this.fileUploaded.emit(null);
        },
        error: err => {
          console.error('Error removing file:', err);
          this.error = 'Errore durante la rimozione del file. Riprova più tardi.';
        },
      });
  }
}
