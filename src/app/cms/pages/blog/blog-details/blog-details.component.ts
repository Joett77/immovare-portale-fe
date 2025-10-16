// /src/app/cms/pages/blog/blog-details/blog-details.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { SelectComponent } from '../../../../shared/molecules/select/select.component';
import { BlogService } from '../../../../public/components/blog/blog.service';
import { MarkdownEditorComponent } from '../../../../shared/molecules/markdown-editor/markdown-editor.component';
import { BlogImageUploaderComponent } from '../../../components/blog-image-uploader/blog-image-uploader.component';
import { finalize, of, switchMap } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';

interface ArticleData {
  title: string;
  content: string;
  tags: string[];
  author: string;
  publishedAt: string | null;
  image?: number;
}

@Component({
  selector: 'app-blog-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    SelectComponent,
    MarkdownEditorComponent,
    BlogImageUploaderComponent,
  ],
  templateUrl: './blog-details.component.html',
})
export class BlogDetailsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private blogService = inject(BlogService);
  private toast = inject(ToastService);

  blogForm!: FormGroup;
  articleId: string | null = null;
  isLoading = signal(false);
  isSaving = signal(false);
  error = signal<string | null>(null);
  isNewArticle = true;
  activeTab = signal<'content' | 'preview'>('content');

  // Options for select inputs
  categoryOptions = [
    { value: 'CASA', label: 'Casa' },
    { value: 'ESTATE', label: 'Estate' },
    { value: 'LIFESTYLE', label: 'Lifestyle' },
  ];

  statusOptions = [
    { value: 'draft', label: 'Bozza' },
    { value: 'published', label: 'Pubblicato' },
  ];

  uploadedImage: any = null;

  ngOnInit(): void {
    this.initForm();
    this.articleId = this.route.snapshot.paramMap.get('id');

    if (this.route.snapshot.paramMap.get('preview')) {
      this.setActiveTab('preview')
    }

    if (this.articleId) {
      this.isNewArticle = false;
      this.loadArticle(this.articleId);
    }
  }

  initForm(): void {
    this.blogForm = this.fb.group({
      title: ['', [Validators.required]],
      content: ['', [Validators.required]],
      category: ['CASA', [Validators.required]],
      image: [null],
      author: ['', [Validators.required]],
      status: ['draft', [Validators.required]],
      publicationDate: [new Date().toISOString().split('T')[0]],
      publicationTime: ['12:00'],
    });
  }

  loadArticle(id: string): void {
    this.isLoading.set(true);

    this.blogService
      .getPostById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: response => {
          if (response && response.data) {
            const articleData = response.data;

            // Format the date and time if available
            let publicationDate = '';
            let publicationTime = '12:00';

            if (articleData.publishedAt) {
              const date = new Date(articleData.publishedAt);
              publicationDate = date.toISOString().split('T')[0];
              publicationTime = date.toTimeString().substring(0, 5);
            } else {
              // If not published, set today's date as default
              publicationDate = new Date().toISOString().split('T')[0];
            }

            // Create a new form with the loaded values to ensure proper initialization
            this.blogForm = this.fb.group({
              title: [articleData.title || '', [Validators.required]],
              content: [articleData.content || '', [Validators.required]],
              category: [
                articleData.tags && articleData.tags.length > 0 ? articleData.tags[0] : 'CASA',
                [Validators.required],
              ],
              image: [null],
              author: [articleData.author || '', [Validators.required]],
              status: [articleData.publishedAt ? 'published' : 'draft', [Validators.required]],
              publicationDate: [publicationDate],
              publicationTime: [publicationTime],
            });

            // Log the form values for debugging
            console.log('Form initialized with values:', this.blogForm.value);

            // Load image if available
            if (articleData.image && articleData.image) {
              this.uploadedImage = {
                id: articleData.image.id,
                url: articleData.image.url,
                fileName: articleData.image.name,
              };
            }
          }
        },
        error: err => {
          console.error('Error loading article:', err);
          this.error.set("Errore nel caricamento dell'articolo. Riprova più tardi.");
        },
      });
  }

  onSubmit(): void {
    if (this.blogForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.blogForm.controls).forEach(key => {
        this.blogForm.get(key)?.markAsTouched();
      });
      this.error.set('Completa tutti i campi obbligatori prima di pubblicare.');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    // Get form data
    const formData = this.blogForm.value;

    // Create article data object
    const articleData: ArticleData = {
      title: formData.title,
      content: formData.content,
      tags: [formData.category],
      author: formData.author,
      publishedAt: `${formData.publicationDate}T${formData.publicationTime}:00.000Z`,
    };

    // Image handling - use the image ID from the uploadedImage
    if (this.uploadedImage && this.uploadedImage.id) {
      articleData['image'] = this.uploadedImage.id;
    }

    // Determine if we're creating a new article or updating an existing one
    const saveOperation = this.isNewArticle
      ? this.blogService.createPost(articleData)
      : this.blogService.updatePost(this.articleId!, articleData);

    saveOperation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: response => {
        // Redirect to blog management page after successful save
        this.router.navigate(['/cms/blog']);
      },
      error: err => {
        console.error('Error publishing article:', err);
        this.error.set("Errore durante la pubblicazione dell'articolo. Riprova più tardi.");
      },
    });
  }

  // Method to save a draft without publishing
  saveDraft(): void {
    if (this.blogForm.get('title')?.invalid) {
      this.blogForm.get('title')?.markAsTouched();
      this.error.set('Il titolo è obbligatorio anche per salvare una bozza.');
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);

    const formData = this.blogForm.value;

    // Create article data object with basic required fields
    const articleData: ArticleData = {
      title: formData.title || 'Bozza senza titolo',
      content: formData.content || '',
      tags: [formData.category],
      author: formData.author,
      publishedAt: null,
    };

    // Image handling - use proper image ID from the uploaded image object
    if (this.uploadedImage && this.uploadedImage.id) {
      articleData['image'] = this.uploadedImage.id;
    }

    // Determine if we're creating a new article or updating an existing one
    const saveOperation = this.isNewArticle
      ? this.blogService.createPost(articleData)
      : this.blogService.updatePost(this.articleId!, articleData);

    saveOperation.pipe(finalize(() => this.isSaving.set(false))).subscribe({
      next: response => {
        // If it was a new article, update the ID
        if (this.isNewArticle && response && response.data) {
          this.articleId = response.data.id;
          this.isNewArticle = false;

          // Update the URL without reloading
          history.replaceState({}, '', `/cms/blog/edit/${this.articleId}`);
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
    this.router.navigate(['/cms/blog']);
  }

  onImageUploaded(image: any): void {
    this.uploadedImage = image;

    // Auto-save the draft when an image is uploaded to associate it with the article
    if (image && this.articleId) {
      this.saveDraft();
    }
  }

  onNext(): void {
    // Validate form before proceeding to preview
    if (this.blogForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.blogForm.controls).forEach(key => {
        this.blogForm.get(key)?.markAsTouched();
      });
      this.error.set('Completa tutti i campi obbligatori prima di continuare.');
      return;
    }

    // Automatically save draft when moving to preview
    this.saveDraft();

    // Move to the preview tab
    this.setActiveTab('preview');
  }

  getControl(name: string): FormControl<string | null> {
    return this.blogForm.get(name) as FormControl<string | null>;
  }

  get estimatedReadingTime(): number {
    const content = this.blogForm?.value?.content || '';
    // Remove any HTML tags for word count
    const plainText = content.replace(/<[^>]*>/g, '');
    // Count words (approximately)
    const wordCount = plainText.split(/\s+/).filter((word: string) => word.length > 0).length;
    // Calculate reading time (average 200 words per minute)
    const wordsPerMinute = 200;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  }

  /**
   * Render markdown content as HTML for preview
   */
  renderContent(content: string): string {
    if (!content) return '';

    let formattedContent = content.replace(/\n\n/g, '</p><p>');
    formattedContent = '<p>' + formattedContent + '</p>';

    return formattedContent;
  }
}
