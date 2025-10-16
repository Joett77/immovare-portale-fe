// src/app/shared/molecules/simple-file-uploader/simple-file-uploader.component.ts
import {
  Component,
  ElementRef,
  ViewChild,
  Output,
  EventEmitter,
  input,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';

@Component({
  selector: 'app-simple-file-uploader',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="w-full">
      <!-- File input (hidden) -->
      <input
        #fileInput
        type="file"
        multiple
        [accept]="acceptedTypes()"
        (change)="onFileSelected($event)"
        class="hidden"
      />

      <!-- Upload area -->
      <div
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        [class.border-blue-400]="isDragging()"
        [class.bg-blue-50]="isDragging()"
      >
        <div class="flex flex-col items-center">
          <svg
            class="w-12 h-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>

          <p class="text-gray-600 mb-2">
            Trascina i file qui o
            <span class="text-blue-600 hover:text-blue-800 cursor-pointer">
              clicca per selezionare
            </span>
          </p>

          <p class="text-sm text-gray-500">
            {{ acceptedTypesText() }}
          </p>
        </div>
      </div>

      <!-- Selected files list -->
      @if (selectedFiles().length > 0) {
        <div class="mt-4 space-y-2">
          <h4 class="text-sm font-medium text-gray-700">File selezionati:</h4>
          @for (file of selectedFiles(); track file.name) {
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ file.name }}</p>
                  <p class="text-xs text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                type="button"
                (click)="removeFile(file)"
                class="text-red-500 hover:text-red-700 p-1"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
          }
        </div>
      }

      <!-- Error message -->
      @if (errorMessage()) {
        <div class="mt-2 text-sm text-red-600">
          {{ errorMessage() }}
        </div>
      }
    </div>
  `,
})
export class SimpleFileUploaderComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() filesSelected = new EventEmitter<File[]>();

  // Inputs
  acceptedTypes = input<string>('image/*,.pdf,.doc,.docx,.xls,.xlsx');
  maxFileSize = input<number>(10 * 1024 * 1024); // 10MB default
  maxFiles = input<number>(5);
  acceptedTypesText = input<string>('PDF, Word, Excel, JPG, PNG, GIF (max 10 MB per file)');

  // State
  selectedFiles = signal<File[]>([]);
  isDragging = signal<boolean>(false);
  errorMessage = signal<string>('');

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging.set(false);

    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  private handleFiles(files: File[]) {
    this.errorMessage.set('');

    // Validate files
    const validFiles: File[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > this.maxFileSize()) {
        this.errorMessage.set(
          `File "${file.name}" è troppo grande. Dimensione massima: ${this.formatFileSize(this.maxFileSize())}`
        );
        continue;
      }

      // Check file type
      if (!this.isValidFileType(file)) {
        this.errorMessage.set(`Tipo di file "${file.name}" non supportato.`);
        continue;
      }

      validFiles.push(file);
    }

    // Check total file count
    const currentFiles = this.selectedFiles();
    if (currentFiles.length + validFiles.length > this.maxFiles()) {
      this.errorMessage.set(`Massimo ${this.maxFiles()} file consentiti.`);
      return;
    }

    // Add valid files
    const updatedFiles = [...currentFiles, ...validFiles];
    this.selectedFiles.set(updatedFiles);
    this.filesSelected.emit(updatedFiles);
  }

  private isValidFileType(file: File): boolean {
    const acceptedTypes = this.acceptedTypes()
      .split(',')
      .map(type => type.trim());

    return acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        // File extension check
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      } else if (type.includes('/*')) {
        // MIME type wildcard check (e.g., image/*)
        const [mainType] = type.split('/');
        return file.type.startsWith(mainType + '/');
      } else {
        // Exact MIME type check
        return file.type === type;
      }
    });
  }

  removeFile(fileToRemove: File) {
    const updatedFiles = this.selectedFiles().filter(file => file !== fileToRemove);
    this.selectedFiles.set(updatedFiles);
    this.filesSelected.emit(updatedFiles);
    this.errorMessage.set('');
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  clearFiles() {
    this.selectedFiles.set([]);
    this.filesSelected.emit([]);
    this.errorMessage.set('');

    // Clear the file input
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
