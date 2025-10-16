import { Component, input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { BannerCtaComponent } from '../../../../shared/organisms/banner-cta/banner-cta.component';
import { RouterModule, RouterOutlet } from '@angular/router';
import { RelatedItemsComponent } from '../../../../shared/organisms/related-items/related-items.component';
import { TagLabelComponent } from '../../../../shared/atoms/tag-label/tag-label.component';
import { StepperBlockComponent } from '../../../../shared/organisms/stepper-block/stepper-block.component';
import { environment_dev } from '../../../../environments/env.dev';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSearch, faShare, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import {
  faFacebookF,
  faTwitter,
  faLinkedinIn,
  faInstagram,
  faTiktok,
} from '@fortawesome/free-brands-svg-icons';

interface Post {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image: string;
  tags: string[];
  readingTime: number;
  nextPostId?: number | null;
  prevPostId?: number | null;
  nextPostTitle?: string | null;
  prevPostTitle?: string | null;
}

@Component({
  selector: 'app-blog-post',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet,
    BannerCtaComponent,
    CommonModule,
    RelatedItemsComponent,
    TagLabelComponent,
    FontAwesomeModule,
    StepperBlockComponent,
  ],
  templateUrl: './blog-post.component.html',
  styleUrl: './blog-post.component.scss',
})
export class BlogPostComponent implements OnInit, OnChanges {
  faSearch = faSearch;
  faShare = faShare;
  faArrowRight = faArrowRight;
  faArrowLeft = faArrowLeft;
  faFacebookF = faFacebookF;
  faTwitter = faTwitter;
  faLinkedinIn = faLinkedinIn;
  faInstagram = faInstagram;
  faTiktok = faTiktok;
  idPost = input<string | null>(null);
  post: Post | null = null;
  isLoading = false;
  error: string | null = null;

  private apiUrl = environment_dev.apiUrl;
  private apiToken = environment_dev.strapiToken;
  private wordsPerMinute = 200;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.idPost()) {
      // If no ID is provided via input, try to get it from the route
      const routeId = this.route.snapshot.paramMap.get('id');
      if (routeId) {
        this.loadPost(routeId);
      } else {
        console.error('Post ID is missing from both input and route.');
      }
    } else {
      this.loadPost(this.idPost()!);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Reload post if the idPost input changes
    if (changes['idPost'] && !changes['idPost'].firstChange && this.idPost()) {
      this.loadPost(this.idPost()!);
    }
  }

  // Calculate reading time in minutes
  private calculateReadingTime(content: string): number {
    // Remove HTML tags if present
    const plainText = content.replace(/<[^>]*>/g, '');

    // Count words (split by spaces and filter out empty strings)
    const wordCount = plainText.split(/\s+/).filter(word => word.length > 0).length;

    // Calculate reading time and round up to nearest minute
    return Math.ceil(wordCount / this.wordsPerMinute);
  }

  loadPost(postId: string) {
    this.isLoading = true;
    this.error = null;
    this.post = null;

    console.log('Loading post with ID:', postId);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.apiToken}`,
    });

    // Fetch the post from the API
    this.http.get<any>(`${this.apiUrl}/api/posts/${postId}`, { headers }).subscribe({
      next: response => {
        // Map the Strapi response to the Post interface
        this.post = {
          id: response.data.id,
          title: response.data.title,
          content: response.data.content,
          excerpt: response.data.content.substring(0, 150) + '...',
          image: response.data.image?.url || '',
          tags: response.data.tags || [],
          readingTime: this.calculateReadingTime(response.data.content),
          nextPostId: response.meta?.nextPost?.id || null,
          prevPostId: response.meta?.prevPost?.id || null,
          nextPostTitle: response.meta?.nextPost?.title || null,
          prevPostTitle: response.meta?.prevPost?.title || null,
        };
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading post:', err);
        this.error = 'Failed to load post. Please try again.';
        this.isLoading = false;
      },
    });
  }

  navigateToPost(postId: number | null | undefined) {
    if (postId) {
      // Update browser URL without reloading the component
      this.router
        .navigate(['/blog', postId], {
          replaceUrl: false,
          onSameUrlNavigation: 'reload',
        })
        .then(() => {
          // Manually load the post after navigation
          this.loadPost(postId.toString());

          // Scroll to top
          window.scrollTo(0, 0);
        });
    }
  }
}
