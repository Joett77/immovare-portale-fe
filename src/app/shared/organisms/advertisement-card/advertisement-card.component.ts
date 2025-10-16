// advertisement-card.component.ts
import {
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  HostListener,
  signal,
  OnInit,
} from '@angular/core';
import { ButtonComponent } from '../../atoms/button/button.component';
import { TrashIconComponent } from '../../atoms/icons/trash-icon/trash-icon.component';
import { CalendarIconComponent } from '../../atoms/icons/calendar-icon/calendar-icon.component';
import { MailIconComponent } from '../../atoms/icons/mail-icon/mail-icon.component';
import { ArrowRightIconComponent } from '../../atoms/icons/arrow-right-icon/arrow-right-icon.component';
import { BathIconComponent } from '../../atoms/icons/bath-icon/bath-icon.component';
import { MeasureIconComponent } from '../../atoms/icons/measure-icon/measure-icon.component';
import { FloorplanIconComponent } from '../../atoms/icons/floorplan-icon/floorplan-icon.component';
import { Property, ApiError } from '../../../public/models';
import { Router, RouterModule } from '@angular/router';
import { HeartIconComponent } from '../../atoms/icons/heart-icon/heart-icon.component';
import { CommonModule } from '@angular/common';
import { ShareIconComponent } from '../../atoms/icons/share-icon/share-icon.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCopy, faEnvelope, faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { ToastService } from '../../../shared/services/toast.service';
import { AuthService } from '../../../public/services/auth.service';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-advertisement-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    TrashIconComponent,
    CalendarIconComponent,
    MailIconComponent,
    ArrowRightIconComponent,
    BathIconComponent,
    MeasureIconComponent,
    FloorplanIconComponent,
    HeartIconComponent,
    ShareIconComponent,
    FontAwesomeModule,
  ],
  templateUrl: './advertisement-card.component.html',
})
export class AdvertisementCardComponent implements OnInit {
  @Input() property!: Property;
  @Input() showDeleteButton: boolean = false;

  @Output() deleteProperty = new EventEmitter<number>();
  @Output() favoriteToggle = new EventEmitter<Property>();

  // Injected services
  router = inject(Router);
  private toast = inject(ToastService);
  private authService = inject(AuthService);
  private apiService = inject(PropertyApiService);

  // FontAwesome icons
  faCopy = faCopy;
  faEnvelope = faEnvelope;
  faWhatsapp = faWhatsapp;
  faHeart = faHeart;
  faHeartRegular = faHeartRegular;

  // Share tooltip state
  isShareTooltipOpen = false;

  // Favorites state
  isFavorite = signal<boolean>(false);
  isLoadingFavorite = signal<boolean>(false);

  // API endpoints
  private addToFavoritePropertiesEndpoint: string = 'api/customers/favorites/add';
  private removeFromFavoritePropertiesEndpoint: string = 'api/customers/favorites';

  ngOnInit() {
    // Check if this property is already in favorites when component initializes
    this.checkIfPropertyInFavorites();
  }

  // Close tooltip when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative') || !target.closest('app-advertisement-card')) {
      this.isShareTooltipOpen = false;
    }
  }

  goToProperty() {
    this.router.navigate(['/property', this.property.id]);
  }

  /**
   * Navigate to property page with sidesheet open for appointment booking
   */
  goToPropertyWithAppointment(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.router.navigate(['/property', this.property.id], {
      queryParams: { openSidesheet: 'true' },
    });
  }

  /**
   * Navigate to property page and scroll to request info section
   */
  goToPropertyWithRequestInfo(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.router.navigate(['/property', this.property.id], {
      queryParams: { scrollToRequestInfo: 'true' },
    });
  }

  /**
   * Handle heart icon click - add/remove from favorites
   */
  async onToggleFavorite() {
    // Prevent the card click event from triggering
    event?.preventDefault();
    event?.stopPropagation();

    await this.addToFavorites();

    // Also emit the event for parent components that might need it
    this.favoriteToggle.emit(this.property);
  }

  /**
   * Check if the current property is in the user's favorites
   */
  async checkIfPropertyInFavorites() {
    // Only check if the user is authenticated and we have a property
    if (!this.authService.authenticated$() || !this.property?.id) {
      return;
    }

    try {
      const observableResult = await this.apiService.getUserProperties<Property[]>(
        'api/customers/favorites/get-all'
      );

      observableResult.subscribe({
        next: response => {
          if (this.isApiError(response)) {
            console.error('Error checking favorites:', response.message);
            return;
          }

          if (Array.isArray(response)) {
            // Check if current property ID exists in the favorites list
            const isInFavorites = response.some(p => p.id === this.property?.id);
            this.isFavorite.set(isInFavorites);
          }
        },
        error: error => {
          console.error('Error checking favorites:', error);
        },
      });
    } catch (error) {
      console.error('Error checking favorites:', error);
    }
  }

  /**
   * Toggle property in favorites (add if not in favorites, remove if already in favorites)
   */
  async addToFavorites() {
    // Check if user is authenticated
    if (!this.authService.authenticated$()) {
      this.toast.error("Devi effettuare l'accesso per aggiungere ai preferiti");
      return;
    }

    if (!this.property?.id) {
      this.toast.error('Errore: proprietà non trovata');
      return;
    }

    this.isLoadingFavorite.set(true);

    try {
      // If already in favorites, remove it
      if (this.isFavorite()) {
        const observableResult = await this.apiService.deleteUserProperties<Property>(
          this.removeFromFavoritePropertiesEndpoint,
          this.property.id
        );

        observableResult.pipe(finalize(() => this.isLoadingFavorite.set(false))).subscribe({
          next: response => {
            if (this.isApiError(response)) {
              this.handleApiError(response);
              return;
            }
            this.isFavorite.set(false);
            this.toast.success('Proprietà rimossa dai preferiti');
          },
          error: error => {
            this.toast.error('Errore nella rimozione dai preferiti');
          },
        });
      }
      // If not in favorites, add it
      else {
        const observableResult = await this.apiService.postUserProperties<Property>(
          this.addToFavoritePropertiesEndpoint,
          {
            customerId: this.authService.getUserId(),
            advertisementId: this.property.id.toString(),
          }
        );

        observableResult.pipe(finalize(() => this.isLoadingFavorite.set(false))).subscribe({
          next: response => {
            if (this.isApiError(response)) {
              this.handleApiError(response);
              return;
            }
            this.isFavorite.set(true);
            this.toast.success('Proprietà aggiunta ai preferiti');
          },
          error: error => {
            this.toast.error("Errore nell'aggiunta ai preferiti");
          },
        });
      }
    } catch (error: any) {
      this.toast.error('Errore nella gestione dei preferiti');
      this.isLoadingFavorite.set(false);
    }
  }

  /**
   * Helper method to check if an API response is an error
   */
  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  /**
   * Handle API-specific errors
   */
  private handleApiError(error: ApiError) {
    console.error(`API Error (${error.type}):`, error.message);
    this.toast.error('Errore nel server. Riprova più tardi.');
  }

  toggleShareTooltip(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isShareTooltipOpen = !this.isShareTooltipOpen;
  }

  copyUrl(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${this.property.id}`;

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

    this.isShareTooltipOpen = false;
  }

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

  private showCopySuccess() {
    this.toast.success('Link copiato negli appunti!');
  }

  shareViaEmail(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${this.property.id}`;
    const subject = `Guarda questo immobile: ${this.property.type} in ${this.property.city}`;
    const body = `Ciao,\n\nHo trovato questo interessante immobile che potrebbe interessarti:\n\n${this.property.type} in ${this.property.address}, ${this.property.city}\nPrezzo: ${this.property.price} €\n\nPuoi vedere tutti i dettagli qui: ${propertyUrl}\n\nSaluti!`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');

    this.isShareTooltipOpen = false;
  }

  shareViaWhatsApp(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${this.property.id}`;
    const message = `Guarda questo immobile: ${this.property.type} in ${this.property.city} - ${this.property.price} € - ${propertyUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    this.isShareTooltipOpen = false;
  }
}
