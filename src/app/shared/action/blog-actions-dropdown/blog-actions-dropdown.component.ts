import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SettingsIconComponent } from '../../atoms/icons/settings-icon/settings-icon.component';

@Component({
  selector: 'app-blog-actions-dropdown',
  standalone: true,
  imports: [CommonModule, SettingsIconComponent],
  templateUrl: './blog-actions-dropdown.component.html',
})
export class BlogActionsDropdownComponent {
  @Input() articleId: string = '';
  @Output() editArticle = new EventEmitter<string>();
  @Output() previewArticle = new EventEmitter<string>();
  @Output() duplicateArticle = new EventEmitter<string>();
  @Output() deleteArticle = new EventEmitter<string>();

  isOpen = false;

  toggleMenu() {
    this.isOpen = !this.isOpen;
  }

  onEditArticle() {
    this.editArticle.emit(this.articleId);
    this.isOpen = false;
  }

  onPreviewArticle() {
    this.previewArticle.emit(this.articleId);
    this.isOpen = false;
  }

  onDuplicateArticle() {
    this.duplicateArticle.emit(this.articleId);
    this.isOpen = false;
  }

  onDeleteArticle() {
    this.deleteArticle.emit(this.articleId);
    this.isOpen = false;
  }
}
