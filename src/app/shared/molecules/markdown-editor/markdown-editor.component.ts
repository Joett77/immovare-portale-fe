import { Component, ElementRef, ViewChild, input, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './markdown-editor.component.html',
  styleUrls: ['./markdown-editor.component.scss'],
})
export class MarkdownEditorComponent implements OnInit, AfterViewInit {
  @ViewChild('editorContainer') editorContainer!: ElementRef;

  control = input<FormControl | null>(null);

  isPreviewMode = false;
  editorContent = '';
  rawContent = ''; // Store the raw content to preserve it during preview toggle

  toolbarOptions = [
    { icon: 'undo', title: 'Annulla', action: 'undo' },
    { icon: 'redo', title: 'Ripeti', action: 'redo' },
    { icon: 'bold', title: 'Grassetto', action: 'bold' },
    { icon: 'italic', title: 'Corsivo', action: 'italic' },
    { icon: 'underline', title: 'Sottolineato', action: 'underline' },
    { icon: 'strikethrough', title: 'Barrato', action: 'strikethrough' },
    { icon: 'code', title: 'Codice', action: 'code' },
    { icon: 'list-ol', title: 'Lista numerata', action: 'orderedList' },
    { icon: 'list-ul', title: 'Lista puntata', action: 'unorderedList' },
    { icon: 'code-block', title: 'Blocco di codice', action: 'codeBlock' },
    { icon: 'quote-right', title: 'Citazione', action: 'quote' },
  ];

  ngOnInit(): void {
    if (this.control()) {
      this.editorContent = this.control()?.value || '';
      this.rawContent = this.editorContent;
    }
  }

  ngAfterViewInit(): void {
    // Initialize the editor content
    if (this.control()) {
      // Set initial content if available
      this.updateEditorContent(this.control()?.value || '');

      // Subscribe to control value changes
      this.control()?.valueChanges.subscribe(value => {
        if (value !== this.editorContent) {
          this.updateEditorContent(value);
        }
      });
    }
  }

  updateEditorContent(content: string): void {
    this.editorContent = content;
    this.rawContent = content;
    if (this.editorContainer && !this.isPreviewMode) {
      this.editorContainer.nativeElement.innerHTML = content;
    }
  }

  onToolbarAction(action: string): void {
    if (this.isPreviewMode) return; // Don't perform actions in preview mode

    // Handle different toolbar actions
    switch (action) {
      case 'bold':
        this.insertMarkdown('**', '**');
        break;
      case 'italic':
        this.insertMarkdown('*', '*');
        break;
      case 'underline':
        this.insertMarkdown('<u>', '</u>');
        break;
      case 'strikethrough':
        this.insertMarkdown('~~', '~~');
        break;
      case 'code':
        this.insertMarkdown('`', '`');
        break;
      case 'orderedList':
        this.insertMarkdown('1. ', '');
        break;
      case 'unorderedList':
        this.insertMarkdown('- ', '');
        break;
      case 'codeBlock':
        this.insertMarkdown('```\n', '\n```');
        break;
      case 'quote':
        this.insertMarkdown('> ', '');
        break;
      case 'undo':
        document.execCommand('undo');
        break;
      case 'redo':
        document.execCommand('redo');
        break;
    }
  }

  insertMarkdown(prefix: string, suffix: string): void {
    if (!this.editorContainer) return;

    this.editorContainer.nativeElement.focus();
    const selection = window.getSelection();

    if (!selection || !selection.toString()) {
      // If no selection, just insert the markdown tags
      document.execCommand('insertHTML', false, prefix + suffix);
    } else {
      // Wrap the selected text with markdown tags
      const selectedText = selection.toString();
      document.execCommand('insertHTML', false, prefix + selectedText + suffix);
    }

    this.updateControlValue();
  }

  onContentChanged(): void {
    this.updateControlValue();
  }

  updateControlValue(): void {
    if (this.control() && this.editorContainer) {
      // Make sure we're updating the rawContent whenever content changes
      this.rawContent = this.editorContainer.nativeElement.innerHTML;
      this.editorContent = this.rawContent;
      this.control()?.setValue(this.rawContent, { emitEvent: false });

      // Log the content for debugging purposes
      console.log('Content updated:', this.rawContent);
    }
  }

  togglePreview(): void {
    if (this.isPreviewMode) {
      // Switching from preview to editor mode
      this.isPreviewMode = false;
      setTimeout(() => {
        if (this.editorContainer && this.editorContainer.nativeElement) {
          this.editorContainer.nativeElement.innerHTML = this.rawContent;
        }
      });
    } else {
      // Switching from editor to preview mode
      // Save the current content before switching
      if (this.editorContainer && this.editorContainer.nativeElement) {
        this.rawContent = this.editorContainer.nativeElement.innerHTML;
      }
      this.isPreviewMode = true;
    }
  }

  // Very simple markdown to HTML converter for preview
  // In a real app, use a proper markdown library
  renderMarkdown(text: string): string {
    let html = text;

    // Convert basic markdown syntax
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');

    // Lists
    html = html.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
    html = html.replace(/^\s*\d+\.\s+(.*?)$/gm, '<li>$1</li>');

    // Add more conversions as needed

    return html;
  }
}
