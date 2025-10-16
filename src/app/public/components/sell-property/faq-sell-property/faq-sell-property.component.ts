import { Component, input } from '@angular/core';
import { FAQItem } from '../../../models';

@Component({
  selector: 'app-faq-sell-property',
  standalone: true,
  templateUrl: './faq-sell-property.component.html',
  styleUrl: './faq-sell-property.component.scss',
})
export class FaqSellPropertyComponent {
  faqItems = input<FAQItem[]>([])

  toggleItem(item: FAQItem): void {
    // Close all other items
    this.faqItems()?.forEach(faqItem => {
      if (faqItem !== item) {
        faqItem.isOpen = false;
      }
    });
    // Toggle the clicked item
    item.isOpen = !item.isOpen;
  }
}
