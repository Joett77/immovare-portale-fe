// file-uploader.component.ts
import {
  Component,
  ElementRef,
  input,
  ViewChild,
  Output,
  EventEmitter,
  inject,
  effect,
  signal,
} from '@angular/core';
import { CameraIconComponent } from '../../atoms/icons/camera-icon/camera-icon.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { ButtonComponent } from '../../atoms/button/button.component';
import { FileUploadService, UploadResponse } from '../../../public/services/file-upload.service';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { firstValueFrom } from 'rxjs';
import { AdvertisementDraft, ApiError } from '../../../public/models';

interface DisplayFile extends UploadResponse {
  isUploading?: boolean;
  previewUrl?: string;
  isDefault?: boolean;
}

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml'];

@Component({
  selector: 'app-file-uploader',
  standalone: true,
  imports: [CameraIconComponent, NgxDropzoneModule, CommonModule, ButtonComponent],
  template: `
    <div class="file-uploader-container w-full">
      <!-- Loading state -->
      <div
        *ngIf="isUploading()"
        class="w-full py-8 flex justify-center items-center"
      >
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent text-green-500"
          role="status"
        >
          <span class="sr-only">Loading...</span>
        </div>
        <span class="ml-2">Caricamento in corso...</span>
      </div>

      <!-- Empty state - full width -->
      <div
        *ngIf="!isUploading() && allDisplayFiles.length === 0"
        class="empty-state w-full h-80 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-secondary-light hover:bg-gray-50 transition-all duration-200 py-16 px-4 text-center"
        [class.drag-over]="isDragOver"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <app-camera-icon class="w-16 h-16 text-gray-400 mb-4"></app-camera-icon>
        <p class="text-lg font-semibold text-gray-600 mb-2">{{ uploadFileText }}</p>
        <p class="text-sm text-gray-500 mb-4">Formati accettati: JPG, PNG, GIF max 10 mb</p>
        <p class="text-sm text-gray-500 mb-4">oppure</p>
        <app-button
          [size]="'md'"
          type="primary"
          [text]="buttonText"
          [iconType]="'upload'"
          iconPosition="left"
        ></app-button>
      </div>

      <!-- Main layout with files -->
      <div
        *ngIf="!isUploading() && allDisplayFiles.length > 0"
        class="main-layout flex flex-col md:flex-row gap-6 w-full"
      >
        <!-- Left side: Main photo with drag-drop -->
        <div class="left-section flex-1 max-w-md">
          <!-- Main photo container -->
          <div class="main-photo-container relative">
            <div
              class="main-photo-wrapper relative w-full h-80 bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 transition-all duration-200"
              [class.drag-over]="isDragOver"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
            >
              <!-- Loading overlay -->
              <div
                *ngIf="defaultImage?.isUploading"
                class="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-20"
              >
                <div
                  class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent text-green-500"
                  role="status"
                ></div>
                <span class="text-sm mt-2">Caricamento...</span>
              </div>

              <!-- Main image -->
              <img
                [src]="defaultImage?.url || defaultImage?.previewUrl"
                class="w-full h-full object-cover"
                (error)="onImageError($event)"
                alt="Foto principale"
              />

              <!-- Drag overlay -->
              <div
                class="absolute inset-0 bg-black bg-opacity-20 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200 cursor-pointer"
              >
                <app-camera-icon class="w-8 h-8 text-white mb-2"></app-camera-icon>
                <span class="text-white text-sm font-medium"
                  >Clicca o trascina per aggiungere foto</span
                >
              </div>

              <!-- Delete button -->
              <button
                *ngIf="!defaultImage?.isUploading"
                (click)="deleteFile(defaultImage?.id!); $event.stopPropagation()"
                class="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 opacity-80 hover:opacity-100"
                title="Elimina foto"
              >
                <span class="text-sm leading-none">×</span>
              </button>
            </div>

            <!-- Main photo label -->
            <div class="mt-3 flex items-center justify-between">
              <span class="text-sm font-semibold text-gray-700">Foto principale</span>
              <button
                *ngIf="!defaultImage?.isUploading"
                (click)="deleteFile(defaultImage?.id!)"
                class="flex items-center text-xs text-red-500 hover:text-red-700 transition-colors"
                title="Elimina foto principale"
              >
                <span class="mr-1">🗑</span>
                Elimina
              </button>
            </div>
          </div>
        </div>

        <!-- Right side: Additional photos -->
        <div class="right-section flex-1">
          <!-- Additional photos grid -->
          <div class="additional-photos">
            <div class="grid grid-cols-2 gap-4">
              <!-- Other images -->
              <div
                *ngFor="let file of otherImages; let i = index; trackBy: trackByFileId"
                class="additional-photo-item relative group"
              >
                <div
                  class="photo-wrapper relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden border-2 border-transparent hover:border-primary-light transition-all duration-200 cursor-pointer"
                  (click)="setAsDefault(file)"
                  [title]="'Clicca per impostare come foto principale'"
                >
                  <!-- Loading overlay -->
                  <div
                    *ngIf="file.isUploading"
                    class="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10"
                  >
                    <div
                      class="inline-block animate-spin rounded-full h-4 w-4 border-4 border-solid border-current border-r-transparent text-green-500"
                      role="status"
                    ></div>
                    <span class="text-xs mt-1">Caricamento...</span>
                  </div>

                  <!-- Image -->
                  <img
                    [src]="file.url || file.previewUrl"
                    class="w-full h-full object-cover"
                    (error)="onImageError($event)"
                    alt="Foto immobile"
                  />

                  <!-- Delete button -->
                  <button
                    *ngIf="!file.isUploading"
                    (click)="deleteFile(file.id); $event.stopPropagation()"
                    class="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100"
                    title="Elimina foto"
                  >
                    <span class="text-xs leading-none">×</span>
                  </button>
                </div>

                <!-- Delete button below -->
                <div class="mt-2 flex justify-end">
                  <button
                    *ngIf="!file.isUploading"
                    (click)="deleteFile(file.id)"
                    class="flex items-center text-xs text-red-500 hover:text-red-700 transition-colors"
                    title="Elimina foto"
                  >
                    Elimina
                  </button>
                </div>
              </div>

              <!-- Add more photos button -->
              <div
                class="add-photo-button w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-light hover:bg-gray-50 transition-all duration-200"
                [class.drag-over]="isDragOver"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                (click)="fileInput.click()"
              >
                <span class="text-2xl text-gray-400 mb-1">+</span>
                <span class="text-sm text-gray-600 font-medium">Foto</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hidden file input -->
      <input
        #fileInput
        type="file"
        multiple
        [accept]="allowedFileTypes.join(', ')"
        (change)="onFileSelect($event)"
        class="hidden"
      />
    </div>
  `,
  styles: [
    `
      .drag-over {
        @apply border-primary-light bg-primary bg-opacity-5;
      }

      .main-photo-wrapper.drag-over {
        @apply border-primary-light border-solid;
      }

      .add-photo-button.drag-over {
        @apply border-primary-light bg-primary bg-opacity-5;
      }

      .group:hover .opacity-0 {
        opacity: 1;
      }

      .main-layout.has-files {
        min-height: 400px;
      }

      .main-photo-wrapper,
      .add-photo-button {
        cursor: pointer;
      }

      .additional-photo-item {
        cursor: pointer;
      }

      .photo-wrapper img {
        transition: transform 0.2s ease;
      }

      .photo-wrapper:hover img {
        transform: scale(1.02);
      }
    `,
  ],
})
export class FileUploaderComponent {
  private fileUploadService = inject(FileUploadService);
  private propertyApiService = inject(PropertyApiService);
  private responsive = inject(BreakpointObserver);

  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  @Output() filesUploaded = new EventEmitter<UploadResponse[]>();
  @Output() uploadError = new EventEmitter<string>();

  description = input<string>('');
  type = input<string>(''); // 'file' for photos or 'map' for floorplan
  propertyId = input<string | null>(null);
  initialFiles = input<UploadResponse[]>([]);

  allowedFileTypes = ALLOWED_FILE_TYPES;
  isUploading = signal(false);
  uploadedFiles: DisplayFile[] = [];
  uploadFileText: string = '';
  buttonText: string = '';
  isMobile: boolean = false;
  isDragOver: boolean = false;

  constructor() {
    // Track changes to initialFiles
    effect(() => {
      const files = this.initialFiles();
      if (files && files.length > 0) {
        console.log('Effect detected initialFiles changed:', files);
        this.uploadedFiles = files.map((file, index) => ({
          ...file,
          isDefault: index === 0,
        }));
      }
    });

    // Responsive detection
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      this.isMobile = result.matches;
    });
  }

  ngOnInit() {
    console.log('File uploader initialized with type:', this.type());

    // Set text based on type
    const isPhoto = this.type() === 'file';
    this.uploadFileText = isPhoto
      ? 'Trascina qui le fotografie del tuo immobile'
      : 'Trascina qui le planimetrie del tuo immobile';
    this.buttonText = isPhoto ? 'Carica foto' : 'Carica planimetria';

    // Initialize with empty array
    this.uploadedFiles = [];

    // Load initial files or existing files
    if (this.initialFiles && this.initialFiles().length > 0) {
      this.uploadedFiles = this.initialFiles().map((file, index) => ({
        ...file,
        isDefault: index === 0,
      }));
    } else if (this.propertyId()) {
      this.loadExistingFiles();
    }
  }

  // Get default image (first image or marked as default)
  get defaultImage(): DisplayFile | undefined {
    return this.uploadedFiles.find(file => file.isDefault) || this.uploadedFiles[0];
  }

  // Get other images (not default)
  get otherImages(): DisplayFile[] {
    const defaultImg = this.defaultImage;
    return this.uploadedFiles.filter(file => file.id !== defaultImg?.id);
  }

  // Get all files for display
  get allDisplayFiles(): DisplayFile[] {
    return this.uploadedFiles;
  }

  // Track function for ngFor
  trackByFileId(index: number, file: DisplayFile): string {
    return file.id;
  }

  // Set a file as the default image
  setAsDefault(file: DisplayFile) {
    // Remove default flag from all files
    this.uploadedFiles.forEach(f => (f.isDefault = false));
    // Set the selected file as default
    file.isDefault = true;

    // Emit updated files list
    this.filesUploaded.emit(this.uploadedFiles);
  }

  // Handle file selection
  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const files = Array.from(input.files);
      this.processNewFiles(files);
    }
    // Reset input
    input.value = '';
  }

  // Handle drag events
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    // Only set to false if we're leaving the component entirely
    if (
      !event.relatedTarget ||
      !(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node)
    ) {
      this.isDragOver = false;
    }
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      this.processNewFiles(files);
    }
  }

  // Process new files
  private processNewFiles(files: File[]) {
    // Filter only allowed file types
    const validFiles = files.filter(file => this.allowedFileTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      this.uploadError.emit('Alcuni file non sono supportati. Usa solo JPG, PNG o GIF.');
    }

    if (validFiles.length === 0) return;

    // Add files with preview URLs and upload status
    const newFiles: DisplayFile[] = validFiles.map(file => ({
      id: this.generateTempId(),
      url: '',
      previewUrl: URL.createObjectURL(file),
      type: file.type,
      fileName: file.name,
      isUploading: true,
      isDefault: this.uploadedFiles.length === 0, // First file is default if no files exist
    }));

    // Add to uploaded files
    this.uploadedFiles = [...this.uploadedFiles, ...newFiles];

    // Upload files
    this.uploadFiles(validFiles, newFiles);
  }

  // Upload files to server
  private async uploadFiles(files: File[], displayFiles: DisplayFile[]) {
    if (!this.propertyId()) {
      this.uploadError.emit('No property ID available. Please save the property first.');
      return;
    }

    this.isUploading.set(true);

    try {
      const uploadPromises = files.map(file =>
        firstValueFrom(this.fileUploadService.uploadFile(file, this.propertyId()!, this.type()))
      );

      const responses = await Promise.all(uploadPromises);
      console.log(`Successfully uploaded ${responses.length} files`);

      // Update display files with actual URLs
      responses.forEach((response, index) => {
        const displayFile = displayFiles[index];
        if (displayFile) {
          displayFile.id = response.id;
          displayFile.url = response.url;
          displayFile.isUploading = false;
          // Clean up preview URL
          if (displayFile.previewUrl) {
            URL.revokeObjectURL(displayFile.previewUrl);
            delete displayFile.previewUrl;
          }
        }
      });

      // Refresh from server to ensure consistency
      await this.refreshImagesFromLastDraft();
    } catch (error) {
      console.error('Error uploading files:', error);
      this.uploadError.emit('Failed to upload files. Please try again.');

      // Remove failed uploads
      displayFiles.forEach(file => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      this.uploadedFiles = this.uploadedFiles.filter(file => !file.isUploading);
    } finally {
      this.isUploading.set(false);
    }
  }

  // Delete a file
  async deleteFile(fileId: string) {
    try {
      await firstValueFrom(this.fileUploadService.deleteFile(fileId));
      console.log('File deleted successfully');

      // Remove from local array
      const deletedFile = this.uploadedFiles.find(f => f.id === fileId);
      this.uploadedFiles = this.uploadedFiles.filter(f => f.id !== fileId);

      // If deleted file was default, set first remaining file as default
      if (deletedFile?.isDefault && this.uploadedFiles.length > 0) {
        this.uploadedFiles[0].isDefault = true;
      }

      this.filesUploaded.emit(this.uploadedFiles);
    } catch (error) {
      console.error('Error deleting file:', error);
      this.uploadError.emit('Failed to delete file. Please try again.');
    }
  }

  // Handle image load errors
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';

    // Show fallback
    const container = img.parentElement;
    if (container) {
      container.innerHTML = `
        <div class="w-full h-full flex flex-col items-center justify-center bg-gray-100">
          <app-camera-icon class="w-8 h-8 text-gray-500"></app-camera-icon>
          <span class="text-xs mt-2 text-gray-500">Image unavailable</span>
        </div>
      `;
    }
  }

  // Load existing files
  private async loadExistingFiles() {
    if (!this.propertyId()) return;

    this.isUploading.set(true);
    try {
      await this.refreshImagesFromLastDraft();
    } catch (error) {
      console.error('Error loading files:', error);
      this.uploadError.emit('Failed to load existing files');
    } finally {
      this.isUploading.set(false);
    }
  }

  // Refresh from server
  private async refreshImagesFromLastDraft() {
    if (!this.propertyId()) return;

    try {
      const draftObservable = await this.propertyApiService.getDraftById(this.propertyId() || '');
      const response = await firstValueFrom(draftObservable);

      if (!response || this.isApiError(response)) {
        console.error('Error fetching draft:', response?.message || 'Empty response');
        return;
      }

      const draft = response as AdvertisementDraft;
      const isPhoto = this.type() === 'file';

      if (isPhoto && draft.images && draft.images.length > 0) {
        this.uploadedFiles = draft.images.map((img, index) => ({
          id: img.id.toString(),
          url: img.url,
          type: img.mime || 'image/jpeg',
          fileName: img.name,
          isDefault: index === 0,
        }));
      } else if (!isPhoto && draft.floorplan && draft.floorplan.length > 0) {
        this.uploadedFiles = draft.floorplan.map((img, index) => ({
          id: img.id.toString(),
          url: img.url,
          type: img.mime || 'image/jpeg',
          fileName: img.name,
          isDefault: index === 0,
        }));
      } else {
        this.uploadedFiles = [];
      }

      this.filesUploaded.emit(this.uploadedFiles);
    } catch (error) {
      console.error('Error refreshing draft files:', error);
    }
  }

  // Generate temporary ID
  private generateTempId(): string {
    return 'temp-' + Math.random().toString(36).substring(2, 11);
  }

  // Type guard for API errors
  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  // Cleanup on destroy
  ngOnDestroy() {
    // Clean up object URLs
    this.uploadedFiles.forEach(file => {
      if (file.previewUrl && file.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(file.previewUrl);
      }
    });
  }
}
