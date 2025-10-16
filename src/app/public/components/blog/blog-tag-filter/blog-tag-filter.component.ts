import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-blog-tag-filter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-tag-filter.component.html',
  styleUrl: './blog-tag-filter.component.scss',
})
export class BlogTagFilterComponent {
  tagsList = input<string[]>();
  selectingTag = output<string>();
  selectedTag = input<string>(''); // Input to track the currently selected tag

  handleTagClick(element: EventTarget | null) {
    if (element instanceof HTMLElement) {
      // Check if it's an HTMLElement
      const tagContent = element.textContent ?? '';
      this.selectingTag.emit(tagContent);
    }
  }

  isSelected(tag: string): boolean {
    return this.selectedTag() === tag;
  }
}
