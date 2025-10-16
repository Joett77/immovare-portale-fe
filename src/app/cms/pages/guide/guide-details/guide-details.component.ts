// src/app/cms/pages/guide/guide-details/guide-details.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { SelectComponent } from '../../../../shared/molecules/select/select.component';
import { finalize } from 'rxjs';
import { GuideFileUploaderComponent } from '../../../components/guide-file-uploader/guide-file-uploader.component';
import { GuideImageUploaderComponent } from '../../../components/guide-image-uploader/guide-image-uploader.component';
import { GuideService } from '../../../services/guide.service';
import { ToastService } from '../../../../shared/services/toast.service';

// Custom validator to limit words
export function wordLimitValidator(limit: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const words = control.value.trim().split(/\s+/);
    if (words.length > limit) {
      return { wordLimit: { actual: words.length, limit: limit } };
    }

    return null;
  };
}

@Component({
  selector: 'app-guide-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    GuideFileUploaderComponent,
    GuideImageUploaderComponent,
  ],
  templateUrl: './guide-details.component.html',
})
export class GuideDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private guideService = inject(GuideService);
  private toast = inject(ToastService);

  guideForm!: FormGroup;
  guideId: string | null = null;
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isNewGuide = true;
  activeTab = signal<'content' | 'preview'>('content');
  wordCount = signal(0);
  maxWords = 20;

  uploadedFile: any = null;
  uploadedImage: any = null;

  ngOnInit(): void {
    this.initForm();
    this.guideId = this.route.snapshot.paramMap.get('id');

    if (this.route.snapshot.paramMap.get('preview')) {
      this.setActiveTab('preview')
    }

    if (this.guideId) {
      this.isNewGuide = false;
      this.loadGuide(this.guideId);
    }

    // Track word count changes
    this.guideForm.get('description')?.valueChanges.subscribe(value => {
      if (value) {
        const words = value.trim().split(/\s+/);
        this.wordCount.set(words.length);
      } else {
        this.wordCount.set(0);
      }
    });
  }

  initForm(): void {
    this.guideForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required, wordLimitValidator(this.maxWords)]],
      file: [null, [Validators.required]],
      image: [null],
      status: ['draft'],
      publicationDate: [new Date().toISOString().split('T')[0]],
      publicationTime: ['12:00'],
    });
  }

  loadGuide(id: string): void {
    this.isLoading.set(true);

    this.guideService
      .getGuideById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            const guideData = response.data;

            // Format the date and time if available
            let publicationDate = '';
            let publicationTime = '12:00';

            if (guideData.publishedAt) {
              const date = new Date(guideData.publishedAt);
              publicationDate = date.toISOString().split('T')[0];
              publicationTime = date.toTimeString().substring(0, 5);
            } else {
              // If not published, set today's date as default
              publicationDate = new Date().toISOString().split('T')[0];
            }

            // Create a new form with the loaded values
            this.guideForm = this.fb.group({
              title: [guideData.title || '', [Validators.required]],
              description: [
                guideData.description || '',
                [Validators.required, wordLimitValidator(this.maxWords)],
              ],
              tags: [guideData.tags || ''],
              file: [guideData.file],
              image: [guideData.image],
              status: [guideData.publishedAt ? 'published' : 'draft'],
              publicationDate: [publicationDate],
              publicationTime: [publicationTime],
            });

            // Update word count for description
            const description = guideData.description || '';
            this.wordCount.set(description.trim().split(/\s+/).length);

            // Load image if available
            if (guideData.image) {
              this.uploadedImage = {
                id: guideData.image.id,
                url: guideData.image.url,
                fileName: guideData.image.name,
              };
            }

            // Load file if available
            if (guideData.file) {
              this.uploadedFile = {
                id: guideData.file.id,
                url: guideData.file.url,
                fileName: guideData.file.name,
              };
            }
          }
        },
        error: err => {
          console.error('Error loading guide:', err);
          this.error.set('Errore nel caricamento della guida. Riprova più tardi.');
        },
      });
  }

  onSubmit(): void {
    if (this.guideForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.guideForm.controls).forEach(key => {
        this.guideForm.get(key)?.markAsTouched();
      });
      this.error.set('Completa tutti i campi obbligatori prima di pubblicare.');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    // Get form data
    const formData = this.guideForm.value;

    // Format the publication date
    const publishedAt = `${formData.publicationDate}T${formData.publicationTime}:00.000Z`;

    // Create guide data object
    const guideData: any = {
      title: formData.title,
      description: formData.description,
      publishedAt: publishedAt,
      status: 'published',
    };

    // Image handling
    if (this.uploadedImage && this.uploadedImage.id) {
      guideData.image = this.uploadedImage.id;
    }

    // File handling
    if (this.uploadedFile && this.uploadedFile.id) {
      guideData.file = this.uploadedFile.id;
    }

    // Determine if we're creating a new guide or updating an existing one
    const saveOperation =
      this.guideId === 'create'
        ? this.guideService.createGuide(guideData)
        : this.guideService.updateGuide(this.guideId!, guideData);

    saveOperation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: response => {
        // Redirect to guide management page after successful save
        this.router.navigate(['/cms/guide']);
      },
      error: err => {
        console.error('Error publishing guide:', err);
        this.error.set('Errore durante la pubblicazione della guida. Riprova più tardi.');
      },
    });
  }

  // Method to save a draft without publishing
  saveDraft(): void {
    if (this.guideForm.get('title')?.invalid) {
      this.guideForm.get('title')?.markAsTouched();
      this.error.set('Il titolo è obbligatorio anche per salvare una bozza.');
      return;
    }

    // Check word limit
    if (this.guideForm.get('description')?.hasError('wordLimit')) {
      this.guideForm.get('description')?.markAsTouched();
      this.error.set(`La descrizione non può superare ${this.maxWords} parole.`);
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.guideForm.value;

    // Create guide data object with basic required fields
    const guideData: any = {
      title: formData.title || 'Bozza senza titolo',
      description: formData.description || '',
      publishedAt: null, // Always null for drafts
    };

    // Image handling
    if (this.uploadedImage && this.uploadedImage.id) {
      guideData.image = this.uploadedImage.id;
    }

    // File handling
    if (this.uploadedFile && this.uploadedFile.id) {
      guideData.file = this.uploadedFile.id;
    }

    // Determine if we're creating a new guide or updating an existing one
    const saveOperation =
      this.guideId === 'create'
        ? this.guideService.createGuide(guideData)
        : this.guideService.updateGuide(this.guideId!, guideData);

    saveOperation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: (response: any) => {
        // If it was a new guide, update the ID
        if (this.guideId === 'create' && response && response.data) {
          this.guideId = response.data.id;
          this.isNewGuide = false;

          // Update the URL without reloading
          history.replaceState({}, '', `/cms/guide/${this.guideId}`);
        }

        this.toast.success('Bozza salvata con successo');
      },
      error: err => {
        console.error('Error saving draft:', err);
        this.error.set('Errore durante il salvataggio della bozza. Riprova più tardi.');
      },
    });
  }

  setActiveTab(tab: 'content' | 'preview'): void {
    this.activeTab.set(tab);
  }

  onCancel(): void {
    this.router.navigate(['/cms/guide']);
  }

  onFileUploaded(file: any): void {
    this.uploadedFile = file;

    // Auto-save the draft when a file is uploaded
    if (file && this.guideId) {
      this.saveDraft();
    }
  }

  onImageUploaded(image: any): void {
    this.uploadedImage = image;

    // Auto-save the draft when an image is uploaded
    if (image && this.guideId) {
      this.saveDraft();
    }
  }

  onNext(): void {
    console.log("GUIDE ", this.guideForm)
    // Validate form before proceeding to preview
    if (this.guideForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.guideForm.controls).forEach(key => {
        this.guideForm.get(key)?.markAsTouched();
      });

      if (this.guideForm.get('description')?.hasError('wordLimit')) {
        this.error.set(`La descrizione non può superare ${this.maxWords} parole.`);
        return;
      }

      this.error.set('Completa tutti i campi obbligatori prima di continuare.');
      return;
    }

    // Automatically save draft when moving to preview
    this.saveDraft();

    // Move to the preview tab
    this.setActiveTab('preview');
  }

  getControl(name: string): FormControl<any> {
    return this.guideForm.get(name) as FormControl<any>;
  }
}
