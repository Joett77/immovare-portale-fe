// /src/app/cms/pages/blog/blog-list/blog-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';
import { BlogActionsDropdownComponent } from '../../../../shared/action/blog-actions-dropdown/blog-actions-dropdown.component';
import { BlogService } from '../../../../public/components/blog/blog.service';
import { finalize } from 'rxjs';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';

interface BlogArticle {
  id: string;
  status: string;
  title: string;
  category: string;
  creationDate: string;
  publicationDate: string;
  author: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    PlusIconComponent,
    SearchIconComponent,
    BlogActionsDropdownComponent,
    ModalSmallComponent,
  ],
  templateUrl: './blog-list.component.html',
})
export class BlogListComponent implements OnInit {
  private blogService = inject(BlogService);
  private router = inject(Router);
  protected modalType: null | "delete-element" = null;
  protected blogToDelete: string | null = null;

  articles: BlogArticle[] = [];
  allArticles: BlogArticle[] = [];
  isLoading = true;
  selectedStatus: string = '';
  selectedCategory: string = '';
  selectedAuthor: string = '';
  searchQuery: string = '';
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  // Filter options
  statusOptions = [
    {
      label: "Stato",
      value: "",
    },
    {
      label: "Bozza",
      value: "draft",
    },
    {
      label: "Pubblicato",
      value: "published",
    },
    ];
  // Using actual tags from the schema
  categoryOptions = ['', 'CASA', 'ESTATE', 'LIFESTYLE'];
  authorOptions = ['', 'Redazione', 'Mario Rossi', 'Luigi Verdi'];
  Math = Math;

  ngOnInit(): void {
    this.loadArticles();
  }

  loadArticles(): void {
    this.isLoading = true;
    this.error = null;

    this.blogService
      .getPosts(
        this.currentPage,
        this.itemsPerPage,
        this.searchQuery,
        this.selectedCategory,
        this.selectedStatus
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          // Map the API response to our BlogArticle interface
          if (response && response.data) {
            this.allArticles = this.mapApiResponseToArticles(response.data);
            this.articles = [...this.allArticles];
            this.totalItems = response.meta?.pagination?.total || this.articles.length;
          } else {
            this.articles = [];
            this.allArticles = [];
            this.totalItems = 0;
          }
        },
        error: err => {
          console.error('Error fetching blog posts:', err);
          this.error =
            'Si è verificato un errore durante il caricamento degli articoli. Riprova più tardi.';
          this.articles = [];
          this.allArticles = [];
        },
      });
  }

  /**
   * Map the API response to our BlogArticle interface
   */
  private mapApiResponseToArticles(apiData: any[]): BlogArticle[] {
    return apiData.map(item => {
      // Extract data from the API response
      const data = item.attributes || item;

      // Map publication status from API to our UI status options
      let status = 'Bozza';
      if (data.publishedAt) {
        status = 'Pubblicato';
      }

      // Format dates
      const creationDate = this.formatDate(data.createdAt);
      const publicationDate = data.publishedAt ? this.formatDate(data.publishedAt) : '';

      // Get author directly from the author field
      // (In your schema, author is a string field, not a relation)
      const authorName = data.author || 'Redazione';

      // Get tags from the multi-select field
      // Use the first tag as the "category" for display purposes
      const tags = Array.isArray(data.tags) ? data.tags : [];
      const category = tags.length > 0 ? tags[0] : 'Altro';

      // Get image URL if available
      let imageUrl = '';
      if (data.image && data.image.data) {
        imageUrl = data.image.data.attributes?.url || '';
      }

      return {
        id: `${item.id}`,
        status,
        title: data.title || 'Titolo non disponibile',
        category,
        creationDate,
        publicationDate: publicationDate ? `${publicationDate}` : '',
        author: authorName,
        imageUrl,
      };
    });
  }

  /**
   * Format date string to dd/mm/yyyy
   */
  private formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  /**
   * Apply filters when search or filter inputs change
   */
  applyFilters(): void {
    this.currentPage = 1;
    this.loadArticles();
  }

  /**
   * Create new article and navigate to editor
   */
  createNewArticle(): void {
    this.isLoading = true;
    this.error = null;

    // Create an empty draft post first
    const emptyDraft = {
      title: 'Nuova bozza',
      content: '',
      tags: ['CASA'], // Default category
      author: 'Redazione', // Default author
      publishedAt: null, // Always create as draft
    };

    this.blogService
      .createPost(emptyDraft)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          if (response && response.data && response.data.id) {
            // Navigate to edit the newly created post
            this.router.navigate(['/cms/blog/', response.data.id]);
          } else {
            this.error = "Errore nella creazione dell'articolo. Dati di risposta non validi.";
          }
        },
        error: err => {
          console.error('Error creating new article:', err);
          this.error = "Errore nella creazione dell'articolo. Riprova più tardi.";
        },
      });
  }

  /**
   * Edit an existing article
   */
  editArticle(articleId: string): void {
    this.router.navigate(['/cms/blog/', articleId]);
  }

  /**
   * Preview an article
   */
  previewArticle(articleId: string): void {
    // Open in a new tab
    this.router.navigate(['/cms/blog/', articleId, { preview: true }]);
  }

  /**
   * Duplicate an article
   */
  duplicateArticle(articleId: string): void {
    this.isLoading = true;

    // First get the article to duplicate
    this.blogService
      .getPostById(articleId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          if (response && response.data) {
            const articleData = response.data.attributes;

            // Create a new article with the same data but a modified title
            const duplicatedData = {
              title: `${articleData.title} (Copia)`,
              content: articleData.content,
              tags: articleData.tags || [],
              author: articleData.author,
              // Always create as a draft
              publishedAt: null,
            };

            this.createDuplicate(duplicatedData);
          }
        },
        error: err => {
          console.error('Error fetching article to duplicate:', err);
          this.error = "Errore durante la duplicazione dell'articolo. Riprova più tardi.";
        },
      });
  }

  /**
   * Create a duplicate article
   */
  private createDuplicate(duplicatedData: any): void {
    this.isLoading = true;
    this.blogService
      .createPost(duplicatedData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.loadArticles();
        },
        error: err => {
          console.error('Error creating duplicate article:', err);
          this.error = "Errore durante la creazione dell'articolo duplicato. Riprova più tardi.";
        },
      });
  }

  /**
   * Delete an article
   */
  deleteArticle(articleId: string): void {
    this.blogToDelete = articleId;
    this.modalType = "delete-element";
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction(event: any) {
    this.isLoading = true;

    if (this.modalType === "delete-element") {
      this.blogService
        .deletePost(event)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.blogToDelete = null;
          this.modalClosed();
        }))
        .subscribe({
          next: () => {
            this.loadArticles();
          },
          error: err => {
            console.error('Error deleting article:', err);
            this.error = "Errore durante l'eliminazione dell'articolo. Riprova più tardi.";
          },
        });
    }
  }
}
