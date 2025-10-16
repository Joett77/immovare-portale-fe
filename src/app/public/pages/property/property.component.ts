import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faCamera, faClose, faCopy, faEnvelope, faHeart } from '@fortawesome/free-solid-svg-icons';
import { finalize } from 'rxjs';

import { ButtonComponent } from '../../../shared/atoms/button/button.component';
import { BathIconComponent } from '../../../shared/atoms/icons/bath-icon/bath-icon.component';
import { CalendarIconComponent } from '../../../shared/atoms/icons/calendar-icon/calendar-icon.component';
import { ChevronLeftIconComponent } from '../../../shared/atoms/icons/chevron-left-icon/chevron-left-icon.component';
import { FloorplanIconComponent } from '../../../shared/atoms/icons/floorplan-icon/floorplan-icon.component';
import { LocationDotIconComponent } from '../../../shared/atoms/icons/location-dot-icon/apartment-icon.component';
import { MailIconComponent } from '../../../shared/atoms/icons/mail-icon/mail-icon.component';
import { MapIconComponent } from '../../../shared/atoms/icons/map-icon/map-icon.component';
import { MeasureIconComponent } from '../../../shared/atoms/icons/measure-icon/measure-icon.component';
import { PhoneIconComponent } from '../../../shared/atoms/icons/phone-icon/phone-icon.component';
import { ShareIconComponent } from '../../../shared/atoms/icons/share-icon/share-icon.component';
import { ToastService } from '../../../shared/services/toast.service';
import { LeafletMapLiteComponent } from '../../components/leaflet-map-lite/leaflet-map-lite.component';
import { CalculateMortgageComponent } from '../../components/property/calculate-mortgage/calculate-mortgage.component';
import { PropertyInfoComponent } from '../../components/property/property-info/property-info.component';
import { RequestInfoComponent } from '../../components/property/request-info/request-info.component';
import { SidesheetComponent } from '../../components/property/sidesheet/sidesheet.component';
import { ApiError } from '../../models';
import { AdvertisementService } from '../../services/advertisement-service';
import { AuthService } from '../../services/auth.service';
import { PropertyApiService } from '../../services/property-api.service';
import { Property } from './property.model';

type Tab = 'floorplan' | 'map' | 'gallery';

@Component({
  selector: 'app-property',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    LocationDotIconComponent,
    MapIconComponent,
    FloorplanIconComponent,
    MailIconComponent,
    CalendarIconComponent,
    PhoneIconComponent,
    SidesheetComponent,
    CalculateMortgageComponent,
    RequestInfoComponent,
    ShareIconComponent,
    ChevronLeftIconComponent,
    PropertyInfoComponent,
    MeasureIconComponent,
    BathIconComponent,
    LeafletMapLiteComponent,
    FontAwesomeModule,
  ],
  templateUrl: './property.component.html',
  styleUrl: './property.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PropertyComponent implements OnInit {
  @ViewChild(RequestInfoComponent) requestInfoComponent?: RequestInfoComponent;
  @ViewChild(PropertyInfoComponent) propertyInfoComponent?: PropertyInfoComponent;
  @ViewChild('requestInfoSection', { static: false }) requestInfoSection?: ElementRef;

  authService = inject(AuthService);
  toast = inject(ToastService);
  router = inject(Router);

  property: Property | null = null;
  mainImage = '/assets/placeholder-noimage.png';
  thumbnails: string[] = [];
  remainingPhotos = 0;
  photoCount = 0;
  visitCount = 0;
  isModalOpen = false;
  activeTab: Tab = 'gallery';
  isSidesheetOpen = false;
  private advertisementService = inject(AdvertisementService);

  private apiService = inject(PropertyApiService);
  private addToFavoritePropertiesEndpoint: string = 'api/customers/favorites/add';
  private removeFromFavoritePropertiesEndpoint: string = 'api/customers/favorites';
  isLoading = false;
  hasError = false;
  errorMessage: string | null = null;
  faClose = faClose;
  faCamera = faCamera;
  faHeart = faHeart;
  faHeartRegular = faHeartRegular;
  faCopy = faCopy;
  faEnvelope = faEnvelope;
  faWhatsapp = faWhatsapp;
  virtualTourUrl: SafeResourceUrl | null = null;
  private shouldScrollToRequestInfo = false;

  // Share tooltip state
  isShareTooltipOpen = false;

  // Track if the property is in favorites
  isFavorite = signal<boolean>(false);

  // New signals for agent phone functionality
  showAgentPhone = signal(false);
  agentPhone = signal<string | null>(null);
  isLoadingAgent = signal(false);

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer
  ) {}

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.share-tooltip-container')) {
      this.isShareTooltipOpen = false;
    }
  }

  ngOnInit() {
    // Get the resolved data from the route
    this.route.data.subscribe(data => {
      // Add safety check for data structure
      if (data && data['data'] && data['data']['data']) {
        this.property = data['data']['data'] as Property;
        console.log('this.property', this.property);

        if (this.property) {
          // Set main image and thumbnails from the API response
          console.log('this.property.images', this.property.images);

          if (this.property.images && this.property.images.length > 0) {
            this.mainImage = this.property.images[0].url;

            // Set thumbnails array
            this.thumbnails = this.property.images.map(img => img.url);

            // Calculate remaining photos for the UI
            this.photoCount = this.property.images.length;
            this.remainingPhotos = Math.max(0, this.photoCount - 4);
          }

          if (this.property?.virtualTourFrameUrl) {
            this.virtualTourUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
              this.property.virtualTourFrameUrl
            );
          }

          // Check if this property is already in favorites
          this.checkIfPropertyInFavorites();
        }
      } else {
        console.error('Property data not found in route data');
        // Handle missing data case
        this.hasError = true;
        this.errorMessage = 'Property data could not be loaded';
      }
    });

    // Check for query parameters to auto-open sidesheet or scroll to request info
    this.route.queryParams.subscribe(params => {
      if (params['openSidesheet'] === 'true') {
        // Use setTimeout to ensure DOM is ready
        setTimeout(() => {
          this.openSidesheet();
          // Clean up the URL by removing the query parameter
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {},
            replaceUrl: true,
          });
        }, 100);
      } else if (params['scrollToRequestInfo'] === 'true') {
        // Set flag to scroll after view init
        this.shouldScrollToRequestInfo = true;
        // Clean up the URL by removing the query parameter
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true,
        });
      }
    });
  }

  ngAfterViewInit() {
    // Handle scrolling after view is fully initialized
    if (this.shouldScrollToRequestInfo) {
      // Use multiple timeouts to ensure everything is rendered
      setTimeout(() => {
        this.scrollToRequestInfo();
      }, 100);

      // Fallback attempt
      setTimeout(() => {
        this.scrollToRequestInfo();
      }, 500);

      // Final attempt
      setTimeout(() => {
        this.scrollToRequestInfo();
      }, 1000);

      this.shouldScrollToRequestInfo = false;
    }
  }

  // New method to show agent phone number
  showAgentPhoneNumber() {
    console.log('showAgentPhoneNumber called');
    console.log('this.showAgentPhone()', this.showAgentPhone());
    this.showAgentPhone.set(true);
  }

  onSelectChange($event: Event) {
    throw new Error('Method not implemented.');
  }

  /**
   * Toggle share tooltip
   */
  toggleShareTooltip(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isShareTooltipOpen = !this.isShareTooltipOpen;
  }

  /**
   * Copy property URL to clipboard
   */
  copyUrl(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${this.property?.id}`;

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
  shareViaEmail(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${this.property?.id}`;
    const subject = `Guarda questo immobile: ${this.property?.type} in ${this.property?.city}`;
    const body = `Ciao,\n\nHo trovato questo interessante immobile che potrebbe interessarti:\n\n${this.property?.type} in ${this.property?.address}, ${this.property?.city}\nPrezzo: ${this.property?.price} €\n\nPuoi vedere tutti i dettagli qui: ${propertyUrl}\n\nSaluti!`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');

    this.isShareTooltipOpen = false;
  }

  /**
   * Share via WhatsApp
   */
  shareViaWhatsApp(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const propertyUrl = `${window.location.origin}/property/${this.property?.id}`;
    const message = `Guarda questo immobile: ${this.property?.type} in ${this.property?.city} - ${this.property?.price} € - ${propertyUrl}`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');

    this.isShareTooltipOpen = false;
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

    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = null;

    try {
      // If already in favorites, remove it
      if (this.isFavorite()) {
        const observableResult = await this.apiService.deleteUserProperties<Property>(
          this.removeFromFavoritePropertiesEndpoint,
          this.property.id
        );

        observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
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

        observableResult.pipe(finalize(() => (this.isLoading = false))).subscribe({
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
      this.isLoading = false;
    }
  }

  openModal(tab: Tab) {
    this.isModalOpen = true;
    this.activeTab = tab;
    document.body.classList.add('modal-open');
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.classList.remove('modal-open');
  }

  setActiveTab(tab: Tab) {
    this.activeTab = tab;
  }

  openSidesheet() {
    this.closeModal();
    this.isSidesheetOpen = true;
    document.body.classList.add('overflow-hidden');
  }

  closeSidesheet() {
    this.isSidesheetOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  makePhoneCall(): void {
    if (!this.property?.agentData?.phone) {
      this.toast.error('Numero di telefono non disponibile');
      return;
    }

    // Clean the phone number (remove spaces, dashes, parentheses, etc.)
    const cleanPhoneNumber = this.property.agentData.phone.replace(/[\s\-\(\)]/g, '');

    // Create the tel: URL
    const telUrl = `tel:${cleanPhoneNumber}`;

    try {
      // Open the phone dialer
      window.location.href = telUrl;
    } catch (error) {
      console.error('Error making phone call:', error);
      this.toast.error('Impossibile effettuare la chiamata');
    }
  }

  /**
   * Improved scroll to request info method with better element detection
   */
  scrollToRequestInfo() {
    this.closeModal();

    console.log('scrollToRequestInfo called');

    const scrollToElement = () => {
      // Strategy 1: Try using ViewChild reference for the section
      if (this.requestInfoSection?.nativeElement) {
        console.log('Scrolling using ViewChild reference');
        this.requestInfoSection.nativeElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
        return true;
      }

      // Strategy 2: Try using ViewChild reference for the component
      if (this.requestInfoComponent) {
        console.log('Scrolling using component ViewChild');
        try {
          // Try to get the native element from the component
          const componentElement = (this.requestInfoComponent as any).elementRef?.nativeElement;
          if (componentElement) {
            componentElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest',
            });
            return true;
          }
        } catch (error) {
          console.warn('Component ViewChild scroll failed:', error);
        }
      }

      // Strategy 3: Try finding by ID
      const requestInfoById = document.getElementById('request-info-section');
      if (requestInfoById) {
        console.log('Scrolling using ID selector');
        requestInfoById.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
        return true;
      }

      // Strategy 4: Try finding by component selector
      const requestInfoElement = document.querySelector('app-request-info');
      if (requestInfoElement) {
        console.log('Scrolling using component selector');
        requestInfoElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
        return true;
      }

      // Strategy 5: Try finding by class
      const requestInfoByClass = document.querySelector('.request-info-section');
      if (requestInfoByClass) {
        console.log('Scrolling using class selector');
        requestInfoByClass.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
        return true;
      }

      // Strategy 6: Manual scroll calculation (fallback)
      const calculateManualScroll = () => {
        const element =
          document.querySelector('app-request-info') ||
          document.getElementById('request-info-section') ||
          document.querySelector('.request-info-section');

        if (element) {
          const elementRect = element.getBoundingClientRect();
          const offsetTop = elementRect.top + window.pageYOffset;

          // Subtract some offset for better positioning (header height, etc.)
          const finalScrollTop = offsetTop - 100;

          console.log('Manual scroll to position:', finalScrollTop);
          window.scrollTo({
            top: finalScrollTop,
            behavior: 'smooth',
          });
          return true;
        }
        return false;
      };

      if (calculateManualScroll()) {
        console.log('Scrolled using manual calculation');
        return true;
      }

      console.warn('Could not find request info element to scroll to');
      return false;
    };

    // Try immediately first
    if (!scrollToElement()) {
      console.log('Immediate scroll failed, trying with delay');
      // If immediate attempt fails, try again after a short delay
      setTimeout(() => {
        if (!scrollToElement()) {
          console.log('Delayed scroll failed, trying final attempt');
          // Final attempt with longer delay
          setTimeout(() => {
            scrollToElement();
          }, 1000);
        }
      }, 300);
    }
  }

  // Format price with thousand separator
  formatPrice(price: number): string {
    return price ? price.toLocaleString('it-IT') + ',00 €' : '';
  }

  // Get full address string
  getFullAddress(): string {
    if (!this.property) return '';
    return `${this.property.city || ''} | ${this.property.address || ''} ${this.property.houseNumber || ''}`;
  }

  // Get property title
  getPropertyTitle(): string {
    if (!this.property) return '';
    return `${this.property.city}: ${this.property.address} ${this.property.houseNumber}`;
  }

  // Helper method to check if an API response is an error
  private isApiError(response: any): response is ApiError {
    return response && 'type' in response && 'message' in response;
  }

  // Handle API-specific errors
  private handleApiError(error: ApiError) {
    this.hasError = true;
    this.errorMessage = error.message;
    console.error(`API Error (${error.type}):`, error.message);
  }

  async goVoglioAcquistare() {
    const savedFilters = this.advertisementService.filterSavedForBackButton();
    if (savedFilters) {
      console.log('Navigating with saved filters:', savedFilters);
      let queryParams: any = { ...savedFilters };
      delete queryParams.bbox;
      if (savedFilters.bbox) {
        queryParams['lat_max'] = savedFilters.bbox.lat_max;
        queryParams['lat_min'] = savedFilters.bbox.lat_min;
        queryParams['long_max'] = savedFilters.bbox.long_max;
        queryParams['long_min'] = savedFilters.bbox.long_min;
      }

      // Navigate to the property list with saved filters as query parameters
      this.router.navigate(['/annunci-immobili'], {
        queryParams: queryParams,
      });
    } else {
      console.warn('No saved filters found, navigating to property list without filters');
      // Navigate to the property list without any filters
      this.router.navigate(['/annunci-immobili']);
    }
  }
}
