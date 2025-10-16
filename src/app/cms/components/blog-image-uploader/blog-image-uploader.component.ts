// /src/app/cms/components/blog-image-uploader/blog-image-uploader.component.ts
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { BlogService } from '../../../public/components/blog/blog.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-blog-image-uploader',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './blog-image-uploader.component.html',
  styleUrls: ['./blog-image-uploader.component.scss'],
})
export class BlogImageUploaderComponent {
  private blogService = inject(BlogService);

  @Input() articleId: string | null = null;
  @Input() initialImage: any = null;
  @Output() imageUploaded = new EventEmitter<any>();

  isUploading = false;
  error: string | null = null;
  dragOver = false;
  image: any = null;

  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
  maxSizeMB = 10;

  ngOnInit() {
    if (this.initialImage) {
      this.image = this.initialImage;
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.handleFiles(input.files);
    }
  }

  handleFiles(files: FileList) {
    const file = files[0];

    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      this.error = 'Formato file non supportato. Utilizza JPG, PNG o GIF.';
      return;
    }

    // Validate file size
    if (file.size > this.maxSizeMB * 1024 * 1024) {
      this.error = `Il file è troppo grande. La dimensione massima è ${this.maxSizeMB}MB.`;
      return;
    }

    this.uploadImage(file);
  }

  uploadImage(file: File) {
    this.isUploading = true;
    this.error = null;

    // Create a preview
    const reader = new FileReader();
    reader.onload = e => {
      this.image = {
        url: e.target?.result,
        fileName: file.name,
        isUploading: true,
      };
    };
    reader.readAsDataURL(file);

    // Upload to server
    this.blogService
      .uploadImage(file, this.articleId)
      .pipe(
        finalize(() => {
          this.isUploading = false;
          if (this.image) {
            this.image.isUploading = false;
          }
        })
      )
      .subscribe({
        next: response => {
          console.log('response', response);
          console.log('response.signedUrl', response.data[0].signedUrl);
          this.image = {
            id: response.id,
            url: response.data[0].signedUrl,
            fileName: response.fileName,
          };
          this.imageUploaded.emit(this.image);
        },
        error: err => {
          console.error('Error uploading image:', err);
          this.error = "Errore durante il caricamento dell'immagine. Riprova più tardi.";
        },
      });
  }

  removeImage() {
    if (this.image && this.image.id) {
      this.isUploading = true;
      this.blogService
        .deleteImage(this.image.id)
        .pipe(finalize(() => (this.isUploading = false)))
        .subscribe({
          next: () => {
            this.image = null;
            this.imageUploaded.emit(null);
          },
          error: err => {
            console.error('Error deleting image:', err);
            this.error = "Errore durante la rimozione dell'immagine. Riprova più tardi.";
          },
        });
    } else {
      // Just remove the local preview
      this.image = null;
      this.imageUploaded.emit(null);
    }
  }
}
