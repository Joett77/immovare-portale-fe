import { Component, Input, OnInit, inject } from '@angular/core';
import { Post } from '../../../models';
import { RouterModule } from '@angular/router';
import { TagLabelComponent } from '../../../../shared/atoms/tag-label/tag-label.component';
import { CommonModule } from '@angular/common';
import { MarkdownService } from '../../../services/markdown.service';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [RouterModule, TagLabelComponent, CommonModule],
  templateUrl: './blog-card.component.html',
  styleUrl: './blog-card.component.scss',
})
export class BlogCardComponent implements OnInit {
  private markdownService = inject(MarkdownService);

  @Input() post: Post = {
    id: 0,
    author: '',
    tags: [],
    title: '',
    content: '',
    image: undefined,
  };

  excerpt: string = '';

  ngOnInit() {
    // Generate excerpt from Markdown content
    this.excerpt = this.markdownService.getExcerpt(this.post.content);
  }
}
