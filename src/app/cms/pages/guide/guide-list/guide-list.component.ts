// /src/app/cms/pages/guide/guide-list/guide-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { PlusIconComponent } from '../../../../shared/atoms/icons/plus-icon/plus-icon.component';
import { SearchIconComponent } from '../../../../shared/atoms/icons/search-icon/search-icon.component';
import { GuideActionsDropdownComponent } from '../../../../shared/action/guide-actions-dropdown/guide-actions-dropdown.component';
import { finalize } from 'rxjs';
import { GuideService } from '../../../services/guide.service';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';

interface GuideItem {
  id: string;
  status: string;
  title: string;
  tags: string;
  creationDate: string;
  description: string;
  imageUrl?: string;
  fileUrl?: string;
}

@Component({
  selector: 'app-guide-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    PlusIconComponent,
    SearchIconComponent,
    GuideActionsDropdownComponent,
    ModalSmallComponent,
  ],
  templateUrl: './guide-list.component.html',
})
export class GuideListComponent implements OnInit {
  private guideService = inject(GuideService);
  private router = inject(Router);
  protected modalType: null | "delete-element" = null;
  protected guideToDelete: string | null = null;

  guides: GuideItem[] = [];
  allGuides: GuideItem[] = [];
  isLoading = true;
  selectedStatus: string = '';
  selectedTags: string = '';
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
  tagsOptions = ['', 'VENDERE', 'ACQUISTARE', 'MUTUI', 'NORMATIVE'];
  Math = Math;

  ngOnInit(): void {
    this.loadGuides();
  }

  loadGuides(): void {
    this.isLoading = true;
    this.error = null;

    this.guideService
      .getGuides(
        this.currentPage,
        this.itemsPerPage,
        this.searchQuery,
        this.selectedTags,
        this.selectedStatus
      )
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.allGuides = this.mapApiResponseToGuides(response.data);
            this.guides = [...this.allGuides];
            this.totalItems = response.meta?.pagination?.total || this.guides.length;
          } else {
            this.guides = [];
            this.allGuides = [];
            this.totalItems = 0;
          }
        },
        error: err => {
          console.error('Error fetching guides:', err);
          this.error =
            'Si è verificato un errore durante il caricamento delle guide. Riprova più tardi.';
          this.guides = [];
          this.allGuides = [];
        },
      });
  }

  /**
   * Map the API response to our GuideItem interface
   */
  private mapApiResponseToGuides(apiData: any[]): GuideItem[] {
    return apiData.map(item => {
      // Extract data from the API response
      const data = item.attributes || item;

      // Map publication status from API to our UI status options
      let status = data.publishedAt ? 'Pubblicato' : 'Bozza';

      // Format dates
      const creationDate = this.formatDate(data.createdAt);

      // Get tags (could be a tag or tags field)
      const tags = data.tags || 'VENDERE';

      // Get image URL if available
      let imageUrl = '';
      if (data.image && data.image.data) {
        imageUrl = data.image.data.attributes?.url || '';
      }

      // Get file URL if available
      let fileUrl = '';
      if (data.file && data.file.data) {
        fileUrl = data.file.data.attributes?.url || '';
      }

      return {
        id: `${item.id}`,
        status,
        title: data.title || 'Titolo non disponibile',
        tags,
        creationDate,
        description: data.description || '',
        imageUrl,
        fileUrl,
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
    this.loadGuides();
  }

  /**
   * Create new guide and navigate to editor
   */
  createNewGuide(): void {
    this.isLoading = true;
    this.error = null;

    // Create an empty draft guide first
    const emptyDraft = {
      title: 'Nuova guida',
      description: 'Descrizione della guida',
      tags: 'VENDERE', // Default tag
      publishedAt: null, // Always create as draft
    };

    this.guideService
      .createGuide(emptyDraft)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: response => {
          if (response && response.data && response.data.id) {
            // Navigate to edit the newly created guide
            this.router.navigate(['/cms/guide/', response.data.id]);
          } else {
            this.error = 'Errore nella creazione della guida. Dati di risposta non validi.';
          }
        },
        error: err => {
          console.error('Error creating new guide:', err);
          this.error = 'Errore nella creazione della guida. Riprova più tardi.';
        },
      });
  }

  /**
   * Edit an existing guide
   */
  editGuide(guideId: string): void {
    this.router.navigate(['/cms/guide/', guideId]);
  }

  /**
   * Preview a guide
   */
  previewGuide(guideId: string): void {
    // Open in a new tab
    this.router.navigate(['/cms/guide/', guideId, { preview: true }]);
  }

  /**
   * Duplicate a guide
   */
  duplicateGuide(guideId: string): void {
    this.isLoading = true;

    // First get the guide to duplicate
    this.guideService
      .getGuideById(guideId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            const guideData = response.data;

            // Create a new guide with the same data but a modified title
            const duplicatedData = {
              title: `${guideData.title} (Copia)`,
              description: guideData.description,
              tags: guideData.tags,
              image: guideData.image,
              file: guideData.file,
              // Always create as a draft
              publishedAt: null,
            };

            this.createDuplicate(duplicatedData);
          }
        },
        error: err => {
          console.error('Error fetching guide to duplicate:', err);
          this.error = 'Errore durante la duplicazione della guida. Riprova più tardi.';
        },
      });
  }

  /**
   * Create a duplicate guide
   */
  private createDuplicate(duplicatedData: any): void {
    this.isLoading = true;

    this.guideService
      .createGuide(duplicatedData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.loadGuides();
        },
        error: err => {
          console.error('Error creating duplicate guide:', err);
          this.error = 'Errore durante la creazione della guida duplicata. Riprova più tardi.';
        },
      });
  }

  /**
   * Delete a guide
   */
  deleteGuide(guideId: string): void {
    this.guideToDelete = guideId;
    this.modalType = "delete-element";
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction(event: any) {
    this.isLoading = true;

    if (this.modalType === "delete-element") {
      this.guideService
        .deleteGuide(event)
        .pipe(finalize(() => {
          this.isLoading = false;
          this.guideToDelete = null;
          this.modalClosed();
        }))
        .subscribe({
          next: () => {
            this.loadGuides();
          },
          error: err => {
            console.error('Error deleting guide:', err);
            this.error = "Errore durante l'eliminazione della guida. Riprova più tardi.";
          },
        });
    }
  }
}
