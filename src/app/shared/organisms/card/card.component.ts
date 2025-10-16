import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type Post = {
  image: string;
  title: string;
  tags: string[];
  excerpt: string;
};

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() post!: Post;
}
