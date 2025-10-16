// /src/app/public/services/markdown.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MarkdownService {
  /**
   * Convert Markdown content to HTML
   *
   * Note: This is a simplified implementation. For a production app,
   * consider using a dedicated library like marked.js, showdown, or remark
   */
  markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    // Process different Markdown elements
    let html = markdown;

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\_\_(.*?)\_\_/gim, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/\_(.*?)\_/gim, '<em>$1</em>');

    // Links
    html = html.replace(
      /\[(.*?)\]\((.*?)\)/gim,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Images
    html = html.replace(
      /!\[(.*?)\]\((.*?)\)/gim,
      '<img src="$2" alt="$1" class="w-full h-auto my-4 rounded">'
    );

    // Lists
    let inList = false;
    let listType = '';

    // Process line by line for lists
    html = html
      .split('\n')
      .map(line => {
        // Unordered lists
        if (line.match(/^\s*[\-\*]\s+/)) {
          const content = line.replace(/^\s*[\-\*]\s+/, '');
          if (!inList || listType !== 'ul') {
            inList = true;
            listType = 'ul';
            return `<ul><li>${content}</li>`;
          } else {
            return `<li>${content}</li>`;
          }
        }
        // Ordered lists
        else if (line.match(/^\s*\d+\.\s+/)) {
          const content = line.replace(/^\s*\d+\.\s+/, '');
          if (!inList || listType !== 'ol') {
            inList = true;
            listType = 'ol';
            return `<ol><li>${content}</li>`;
          } else {
            return `<li>${content}</li>`;
          }
        }
        // Close list tags if we're exiting a list
        else if (inList) {
          inList = false;
          return `</${listType}>${line}`;
        } else {
          return line;
        }
      })
      .join('\n');

    // Close any remaining open lists
    if (inList) {
      html += `</${listType}>`;
    }

    // Blockquotes
    html = html.replace(
      /^\> (.*$)/gim,
      '<blockquote class="border-l-4 border-gray-300 pl-4 italic">$1</blockquote>'
    );

    // Code blocks
    html = html.replace(
      /```([\s\S]*?)```/gm,
      '<pre class="bg-gray-100 p-4 rounded overflow-auto my-4"><code>$1</code></pre>'
    );

    // Inline code
    html = html.replace(/`(.*?)`/gim, '<code class="bg-gray-100 px-1 py-0.5 rounded">$1</code>');

    // Paragraphs
    html = html.replace(/^\s*(\n)?(.+)/gim, function (m) {
      // Don't wrap if it's inside a tag
      return /^<(\/)?(h[1-6]|p|li|div|pre|table|blockquote|ol|ul)/i.test(m)
        ? m
        : '<p>' + m + '</p>';
    });

    // Fix double paragraphs
    html = html.replace(/<p><p>/g, '<p>');
    html = html.replace(/<\/p><\/p>/g, '</p>');

    // Horizontal Rule
    html = html.replace(/^\-\-\-(\n)?/gim, '<hr class="my-4 border-t border-gray-300">');

    // Line Breaks (convert double newlines to paragraph breaks)
    html = html.replace(/\n\s*\n/g, '</p><p>');

    return html;
  }

  /**
   * Get a plain text excerpt from markdown content
   */
  getExcerpt(markdown: string, maxLength: number = 150): string {
    if (!markdown) return '';

    // Remove markdown formatting and HTML tags
    const plainText = markdown
      .replace(/!\[(.*?)\]\((.*?)\)/g, '') // Remove images
      .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Extract link text
      .replace(/[*_~`#]/g, '') // Remove formatting characters
      .replace(/<br\s*\/?>/gi, ' ') // Replace HTML line breaks with spaces
      .replace(/<[^>]*>/g, '') // Remove other HTML tags
      .replace(/(\r\n|\n|\r)/gm, ' ') // Replace all types of newlines with spaces
      .replace(/\s+/g, ' ') // Normalize whitespace (collapses multiple spaces)
      .trim();

    // Limit to maxLength characters
    if (plainText.length <= maxLength) {
      return plainText;
    }

    // Find a good breaking point
    const truncated = plainText.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > 0) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated + '...';
  }
}
