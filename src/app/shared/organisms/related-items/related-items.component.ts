import { CommonModule, AsyncPipe } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TagLabelComponent } from '../../atoms/tag-label/tag-label.component';
import { BlogService } from '../../../public/components/blog/blog.service';

interface Post {
  id: number;
  image: string;
  tags: string[];
  title: string;
  content: string;
  excerpt: string;
}

@Component({
  selector: 'app-related-items',
  standalone: true,
  imports: [CommonModule, AsyncPipe, RouterModule, TagLabelComponent],
  templateUrl: './related-items.component.html',
})
export class RelatedItemsComponent implements OnChanges {
  @Input() currentPostId: number | null = null;
  @Input() currentPostTags: string[] = [];

  posts: Post[] = [];
  isLoading = false;
  error: string | null = null;

  private blogService = inject(BlogService);

  ngOnChanges(changes: SimpleChanges): void {
    // Load related posts when either the post ID or tags change
    if (
      (changes['currentPostId'] || changes['currentPostTags']) &&
      this.currentPostTags.length > 0
    ) {
      this.loadRelatedPosts();
    }
  }

  loadRelatedPosts(): void {
    if (!this.currentPostTags.length) return;

    this.isLoading = true;

    // Use the first tag to find related posts (you could modify this to use all tags)
    const primaryTag = this.currentPostTags[0];

    this.blogService.getPosts(1, 4, '', primaryTag, 'live').subscribe({
      next: response => {
        if (response && response.data) {
          // Filter out the current post and map API response to our Post interface
          this.posts = response.data
            .filter((post: any) => post.id !== this.currentPostId)
            .map((post: any) => ({
              id: post.id,
              title: post.title || '',
              content: post.content || '',
              excerpt: post.excerpt || post.content?.substring(0, 150) + '...' || '',
              image: post.image?.url || '',
              tags: post.tags || [],
            }))
            .slice(0, 4); // Limit to 2 related posts
        } else {
          this.posts = [];
        }
        this.isLoading = false;
      },
      error: err => {
        console.error('Error loading related posts:', err);
        this.error = 'Failed to load related posts';
        this.isLoading = false;
        this.posts = [];
      },
    });
  }
}
