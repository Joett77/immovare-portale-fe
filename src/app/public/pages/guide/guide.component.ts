import { Component, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HeroBlockComponent } from '../../../shared/organisms/hero-block/hero-block.component';
import { NewsHpBlockComponent } from '../../../shared/organisms/news-hp-block/news-hp-block.component';
import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { Guide } from '../../models';
import { environment_dev } from '../../../environments/env.dev';
import { CommonModule } from '@angular/common';
import { PaginationComponent } from '../../../shared/organisms/pagination/pagination.component'; // Import CommonModule for *ngFor

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [
    CommonModule, // Add CommonModule for *ngFor
    HeroBlockComponent,
    NewsHpBlockComponent,
    ButtonComponent,
    PaginationComponent,
  ],
  templateUrl: './guide.component.html',
  styleUrl: './guide.component.scss',
})
export class GuideComponent {
  guides: Guide[] = [];
  currentPage: number = 1; // Track current page
  pageCount: number = 1; // Total pages available
  pageSize: number = 6; // Items per page
  http = inject(HttpClient);
  private apiUrl = environment_dev.apiUrl;
  private apiToken = environment_dev.strapiToken;

  ngOnInit() {
    this.loadGuides(this.currentPage); // Load initial page
  }

  downloadGuide(url: string) {
    window.open(url, '_blank');
  }

  loadGuides(page: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiToken}`,
    });

    this.http
      .get<any>(`${this.apiUrl}/api/guides`, {
        headers,
        params: {
          page: page.toString(),
          pageSize: this.pageSize.toString(),
          publicationState: 'published',
        },
      })
      .subscribe({
        next: response => {
          this.guides = response.data.map((item: any) => ({
            id: item.id,
            ...item, // Map Strapi attributes
          }));
          this.pageCount = response.meta.pagination.pageCount; // Update total pages
        },
        error: err => {
          console.error('Error loading guides:', err);
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage = page;
    const targetDiv = document.getElementById('guides');
    if (targetDiv) {
      targetDiv.scrollIntoView({ behavior: 'smooth' });
    }
    this.loadGuides(page);
  }
}
