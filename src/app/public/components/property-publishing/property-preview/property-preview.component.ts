import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnChanges,
  OnInit,
  ViewChild,
} from '@angular/core';
import { LocationDotIconComponent } from '../../../../shared/atoms/icons/location-dot-icon/apartment-icon.component';
import { MapIconComponent } from '../../../../shared/atoms/icons/map-icon/map-icon.component';
import { FloorplanIconComponent } from '../../../../shared/atoms/icons/floorplan-icon/floorplan-icon.component';
import { MailIconComponent } from '../../../../shared/atoms/icons/mail-icon/mail-icon.component';
import { CalendarIconComponent } from '../../../../shared/atoms/icons/calendar-icon/calendar-icon.component';
import { PhoneIconComponent } from '../../../../shared/atoms/icons/phone-icon/phone-icon.component';
import { SidesheetComponent } from '../../property/sidesheet/sidesheet.component';
import { CalculateMortgageComponent } from '../../property/calculate-mortgage/calculate-mortgage.component';
import { RequestInfoComponent } from '../../property/request-info/request-info.component';
import { PropertyInfoComponent } from '../../property/property-info/property-info.component';
import { CloseIconComponent } from '../../../../shared/atoms/icons/close-icon/close-icon.component';
import { MeasureIconComponent } from '../../../../shared/atoms/icons/measure-icon/measure-icon.component';
import { BathIconComponent } from '../../../../shared/atoms/icons/bath-icon/bath-icon.component';
import { Property } from '../../../pages/property/property.model';
import { GalleryIconComponent } from '../../../../shared/atoms/icons/gallery-icon/gallery-icon.component';
import { LeafletMapLiteComponent } from '../../leaflet-map-lite/leaflet-map-lite.component';
import { AdvertisementDraft } from '../../../models';
import { FooterComponent } from '../../../../layout/footer/footer.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

type Tab = 'floorplan' | 'map' | 'gallery';

@Component({
  selector: 'app-property-preview',
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
    PropertyInfoComponent,
    CloseIconComponent,
    MeasureIconComponent,
    BathIconComponent,
    GalleryIconComponent,
    LeafletMapLiteComponent,
    FooterComponent,
    FontAwesomeModule,
  ],
  templateUrl: './property-preview.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PropertyPreviewComponent implements OnInit, OnChanges {
  @ViewChild(RequestInfoComponent) requestInfoComponent?: RequestInfoComponent;
  @ViewChild(PropertyInfoComponent) propertyInfoComponent?: PropertyInfoComponent;

  // Accept property input from parent component
  @Input() property: Property | AdvertisementDraft | null = null;

  mainImage = '/assets/placeholder-noimage.png';
  thumbnails: string[] = [];
  remainingPhotos = 0;
  photoCount = 0;
  visitCount = 0;
  isModalOpen = false;
  activeTab: Tab = 'gallery';
  isSidesheetOpen = false;
  faClose = faClose;

  ngOnInit() {
    this.initializePropertyData();
  }

  ngOnChanges() {
    this.initializePropertyData();
  }

  // Process property data when it changes
  private initializePropertyData() {
    if (this.property) {
      console.log('Property preview data:', this.property);

      // Set images if available
      if (this.property.images && this.property.images.length > 0) {
        console.log('Property images:', this.property.images);
        this.mainImage = this.property.images[0].url;

        // Set thumbnails array
        this.thumbnails = this.property.images.map(img => img.url);

        // Calculate remaining photos for the UI
        this.photoCount = this.property.images.length;
        this.remainingPhotos = Math.max(0, this.photoCount - 4);
      }
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
    this.isSidesheetOpen = true;
    document.body.classList.add('overflow-hidden');
  }

  closeSidesheet() {
    this.isSidesheetOpen = false;
    document.body.classList.remove('overflow-hidden');
  }

  scrollToRequestInfo() {
    if (this.requestInfoComponent) {
      this.requestInfoComponent.scrollIntoView();
    }
  }

  // Format price with thousand separator
  formatPrice(price: number): string {
    return price ? price.toLocaleString('it-IT') + ',00 €' : '';
  }

  // Get full address string
  getFullAddress(): string {
    if (!this.property) return '';

    // Handle both Property and AdvertisementDraft types
    const city = this.property.city || '';
    const address = this.property.address || '';
    const houseNumber = 'houseNumber' in this.property ? this.property.houseNumber : '';

    return `${city} | ${address} ${houseNumber}`;
  }

  // Get property title
  getPropertyTitle(): string {
    if (!this.property) return '';

    // Handle both Property and AdvertisementDraft types
    const city = this.property.city || '';
    const address = this.property.address || '';
    const houseNumber = 'houseNumber' in this.property ? this.property.houseNumber : '';

    return `${city}: ${address} ${houseNumber}`;
  }
}
