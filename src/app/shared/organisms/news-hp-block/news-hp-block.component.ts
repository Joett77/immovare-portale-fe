import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CardComponent } from '../card/card.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { environment_dev } from '../../../environments/env.dev';

interface Post {
  id: number;
  image: string;
  tags: string[];
  title: string;
  content: string;
  excerpt: string;
}

@Component({
  selector: 'app-news-hp-block',
  standalone: true,
  imports: [CommonModule, CardComponent, AsyncPipe, RouterOutlet, RouterModule],
  templateUrl: './news-hp-block.component.html',
  styleUrl: './news-hp-block.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewsHpBlockComponent implements OnInit {
  posts: Post[] = [];
  http = inject(HttpClient);
  private apiUrl = environment_dev.apiUrl;
  private apiToken = environment_dev.strapiToken;

  ngOnInit() {
    this.getPosts();
  }

  getPosts() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiToken}`,
    });

    let params = new HttpParams()
      .set('pagination[page]', '1')
      .set('pagination[pageSize]', '10')
      .set('sort', 'createdAt:desc')
      .set('publicationState', 'live');

    this.http
      .get<any>(`${this.apiUrl}/api/posts`, {
        headers,
        params,
      })
      .subscribe({
        next: response => {
          this.posts = response.data.map((item: any) => ({
            id: item.id,
            image: item.image?.url || '',
            tags: item.tags || [],
            title: item.title,
            content: item.content,
            //excerpt: item.content.substring(0, 150) + '...',
          }));
        },
        error: err => {
          console.error('Error loading news:', err);
        },
      });
  }
}
