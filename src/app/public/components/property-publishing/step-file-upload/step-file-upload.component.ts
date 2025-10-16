// Fixed step-file-upload.component.ts
import { Component, input, inject, signal, computed } from '@angular/core';
import { FileUploaderComponent } from '../../../../shared/molecules/file-uploader/file-uploader.component';
import { PhotoShootCardComponent } from '../../photo-shoot-card/photo-shoot-card.component';
import { PropertyApiService} from '../../../services/property-api.service';
import { UploadResponse } from '../../../services/file-upload.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AdvertisementDraft, ApiError } from '../../../models';

@Component({
  selector: 'app-step-file-upload',
  standalone: true,
  imports: [FileUploaderComponent, PhotoShootCardComponent, CommonModule],
  templateUrl: './step-file-upload.component.html',
})
export class StepFileUploadComponent {
  private propertyApiService = inject(PropertyApiService);

  type = input<string>('');
  title = input<string>('');
  description = input<string>('');
  propertyId = input<string | null>(null);

  // Use a separate signal to track the property ID
  private propertyIdSignal = signal<string | null>(null);

  // Create a computed property that combines the input and the internal signal
  effectivePropertyId = computed(() => this.propertyId() || this.propertyIdSignal());

  uploadedFiles: UploadResponse[] = [];
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  async ngOnInit() {
    // Initialize the internal property ID signal with the input value
    this.propertyIdSignal.set(this.propertyId());

    if (this.effectivePropertyId()) {
      // If no property ID is provided, try to get it from the last draft
      this.isLoading.set(true);
      try {
        const draftObservable = await this.propertyApiService.getDraftById(this.propertyId() || '');
        const response = await firstValueFrom(draftObservable);

        if (!this.isApiError(response) && response.id) {
          // Update our internal signal - NOT the input property
          this.propertyIdSignal.set(response.id);

          // Check if there are images in the response and process them
          if (response.images && response.images.length > 0) {
            this.processExistingImages(response.images);
          }
        } else {
          console.error('No property ID available from the last draft');
        }
      } catch (error) {
        console.error('Error fetching property ID:', error);
      } finally {
        this.isLoading.set(false);
      }
    }
  }

  // Process images from the API response
  private processExistingImages(images: any[]) {
    // For now, assume all images are photos or floorplans based on component type
    const isPhoto = this.type() === 'file';

    // Convert API image format to our UploadResponse format
    const imageRecords = images.map(img => ({
      id: img.id.toString(),
      url: img.url,
      type: img.mime || 'image/jpeg', // Default to image/jpeg if mime is missing
      fileName: img.name,
    }));

    // Store these for passing to the file uploader
    this.uploadedFiles = imageRecords;
    console.log(`Processed existing ${isPhoto ? 'images' : 'floorplan'}:`, this.uploadedFiles);
  }

  /**
   * Type guard for API errors
   */
  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  /**
   * Handle uploaded files
   */
  handleFilesUploaded(files: UploadResponse[]) {
    this.uploadedFiles = files;
    this.errorMessage.set(null);

    // Update the property with the uploaded files
    this.updatePropertyWithFiles();
  }

  /**
   * Handle upload errors
   */
  handleUploadError(error: string) {
    this.errorMessage.set(error);
  }

  /**
   * Update the property with the uploaded files
   */
  private async updatePropertyWithFiles() {
    const propertyId = this.effectivePropertyId();
    if (!propertyId || this.uploadedFiles.length === 0) {
      return;
    }

    const isPhoto = this.type() === 'file';
    const fileIds = this.uploadedFiles.map(file => file.id);

    const updateData: Partial<AdvertisementDraft> = {
      id: propertyId,
      draftStep: isPhoto ? 4 : 5, // Update the draft step
    };

    // Set the appropriate field based on file type
    if (isPhoto) {
      updateData.photoIds = fileIds;
    } else {
      updateData.floorPlanIds = fileIds;
    }

    this.isLoading.set(true);
    try {
      const saveObservable = await this.propertyApiService.saveAdvertisement(updateData);
      const response = await firstValueFrom(saveObservable);

      if (!this.isApiError(response)) {
        console.log(`Successfully updated property with ${isPhoto ? 'photos' : 'floor plans'}`);
      } else {
        throw new Error(response.message);
      }
    } catch (error: any) {
      console.error(`Error updating property with ${isPhoto ? 'photos' : 'floor plans'}:`, error);
      this.errorMessage.set(
        `Failed to update property with ${isPhoto ? 'photos' : 'floor plans'}. Please try again.`
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
