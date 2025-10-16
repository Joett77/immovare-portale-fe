import { Component, EventEmitter, inject, input, Output, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../atoms/button/button.component';
import { TrashIconComponent } from '../../atoms/icons/trash-icon/trash-icon.component';
import { CalendarIconComponent } from '../../atoms/icons/calendar-icon/calendar-icon.component';
import { MailIconComponent } from '../../atoms/icons/mail-icon/mail-icon.component';
import { BathIconComponent } from '../../atoms/icons/bath-icon/bath-icon.component';
import { MeasureIconComponent } from '../../atoms/icons/measure-icon/measure-icon.component';
import { FloorplanIconComponent } from '../../atoms/icons/floorplan-icon/floorplan-icon.component';
import { Property } from '../../../public/models';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faShare, faCopy, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { ShareIconComponent } from '../../atoms/icons/share-icon/share-icon.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-large-property-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    TrashIconComponent,
    CalendarIconComponent,
    MailIconComponent,
    BathIconComponent,
    MeasureIconComponent,
    FloorplanIconComponent,
    FontAwesomeModule,
    ShareIconComponent,
  ],
  templateUrl: './large-property-card.component.html',
})
export class LargePropertyCardComponent {
  private router = inject(Router);
  private toast = inject(ToastService);

  properties = input<Property[]>([]);
  isOnPage = input<boolean>(false);

  faShare = faShare;
  faCopy = faCopy;
  faEnvelope = faEnvelope;
  faWhatsapp = faWhatsapp;

  // Track which property's share tooltip is open
  activeShareTooltip: number | null = null;

  @Output() delete = new EventEmitter<Property>();
  @Output() contact = new EventEmitter<Property>();
  @Output() schedule = new EventEmitter<Property>();

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.share-tooltip-container')) {
      this.activeShareTooltip = null;
    }
  }

  ngOnInit() {
    console.log('favorite properties card', this.properties());
  }

  /**
   * Toggle share tooltip for a specific property
   */
  toggleShareTooltip(event: MouseEvent, property: Property) {
    event.preventDefault();
    event.stopPropagation();

    if (this.activeShareTooltip === property.id) {
      this.activeShareTooltip = null;
    } else {
      this.activeShareTooltip = property.id ?? null;
    }
  }

  /**
   * Copy property URL to clipboard
   */
  copyUrl(event: MouseEvent, property: Property) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${property.id}`;

    if (navigator.clipboard && window.isSecureContext) {
      // Use the modern Clipboard API if available
      navigator.clipboard
        .writeText(propertyUrl)
        .then(() => {
          this.showCopySuccess();
        })
        .catch(() => {
          this.fallbackCopyTextToClipboard(propertyUrl);
        });
    } else {
      // Fallback for older browsers
      this.fallbackCopyTextToClipboard(propertyUrl);
    }

    this.activeShareTooltip = null;
  }

  /**
   * Fallback copy method for older browsers
   */
  private fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showCopySuccess();
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }

    document.body.removeChild(textArea);
  }

  /**
   * Show success message when URL is copied
   */
  private showCopySuccess() {
    this.toast.success('Link copiato negli appunti!');
  }

  /**
   * Share via email
   */
  shareViaEmail(event: MouseEvent, property: Property) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${property.id}`;
    const subject = `Guarda questo immobile: ${property.type} in ${property.city}`;
    const body = `Ciao,\n\nHo trovato questo interessante immobile che potrebbe interessarti:\n\n${property.type} in ${property.address}, ${property.city}\nPrezzo: ${property.price} €\n\nPuoi vedere tutti i dettagli qui: ${propertyUrl}\n\nSaluti!`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');

    this.activeShareTooltip = null;
  }

  /**
   * Share via WhatsApp
   */
  shareViaWhatsApp(event: MouseEvent, property: Property) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${property.id}`;
    const message = `Guarda questo immobile: ${property.type} in ${property.city} - ${property.price} € - ${propertyUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    this.activeShareTooltip = null;
  }

  deleteProperty(property: Property) {
    event?.preventDefault();
    event?.stopPropagation();
    this.delete.emit(property);
  }

  scheduleAppointment(property: Property) {
    event?.preventDefault();
    event?.stopPropagation();
    // Navigate to property page with openSidesheet query parameter
    this.router.navigate(['/property', property.id], {
      queryParams: { openSidesheet: 'true' },
    });
  }

  contactProperty(property: Property) {
    event?.preventDefault();
    event?.stopPropagation();
    // Navigate to property page with scrollToRequestInfo query parameter
    this.router.navigate(['/property', property.id], {
      queryParams: { scrollToRequestInfo: 'true' },
    });
  }
}
