// step-evaluation-result.component.ts
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Inject, inject, PLATFORM_ID } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { environment_dev } from '../../../../environments/env.dev';
import { ArrowLeftIconComponent } from '../../../../shared/atoms/icons/arrow-left-icon/arrow-left-icon.component';
import { InfoCircleIcon } from '../../../../shared/atoms/icons/info-icon/info-circle.component';
import { BreakLineComponent } from '../../../../shared/molecules/break-line/break-line.component';
import { PriceLabelComponent } from '../../../../shared/molecules/price-label/price-label.component';
import { PropertiesMapDetailsComponent } from '../../../../shared/organisms/properties-map-details/properties-map-details.component';
import { SubscriptionPlanComponent } from '../../../../shared/organisms/subscription-plan/subscription-plan.component';
import { PlanAndServiceService } from '../../../services/plan-and-service.service';
import { PropertyEvaluationService } from '../../../services/property-evaluation.service';
import { LeafletMapLiteComponent } from '../../leaflet-map-lite/leaflet-map-lite.component';
import { ChooseAPlanComponent } from '../../sell-property/choose-a-plan/choose-a-plan.component';
import { FooterComponent } from '../../../../layout/footer/footer.component';

const apiUrl = environment_dev.apiUrl;
const apiToken = environment_dev.strapiToken;

@Component({
  selector: 'app-step-evaluation-result',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PriceLabelComponent,
    ArrowLeftIconComponent,
    BreakLineComponent,
    PropertiesMapDetailsComponent,
    SubscriptionPlanComponent,
    InfoCircleIcon,
    LeafletMapLiteComponent,
    ChooseAPlanComponent,
    FooterComponent,
  ],
  templateUrl: './step-evaluation-result.component.html',
})
export class StepEvaluationResultComponent {
  property_evaluation_service = inject(PropertyEvaluationService);
  private _planService = inject(PlanAndServiceService);

  plans = this._planService.plansList$;

  private http = inject(HttpClient);
  private headers = new HttpHeaders({
    Authorization: `Bearer ${apiToken}`,
  });

  // Default values to prevent undefined errors
  latitude: number = 45.4642;
  longitude: number = 9.19;
  street: string = '';
  street_number: string = '';
  city: string = '';
  rooms: number = 1;
  bathrooms: number = 1;
  squareMeters: number = 100;
  sellingPrice: number = 0;
  suggestedPrice: number = 0;
  agencyFee: number = 0;
  immoFee: string = 'da 0 a € 39/mese';
  arrowSize: number = 35;

  // Loading state
  isLoadingValuation: boolean = false;
  valuationError: boolean = false;

  // Default data mapping
  dataMapped = {
    macroTypology: 1,
    typology: 1,
    rooms: 1,
    sqM: 100,
    latitude: 45.4642,
    longitude: 9.19,
    conditionType: 5,
    address: 'via giulio petroni',
  };

  // Error state
  hasEvaluationData: boolean = false;
  showDataMissingError: boolean = false;

  goToFreePublishing = () => {
    console.log('select free');
    this.router.navigate(['/property-publishing']);
  };

  goToProPublishing = () => {
    this.router.navigate(['/property-pro-publishing']);
  };

  goToExclusivePublishing = () => {
    this.router.navigate(['/property-exclusive-publishing']);
  };

  immoLabel: { label: string; info: string } = {
    label: 'Costo in abbonamento con uno dei',
    info: 'nostri piani',
  };

  agencyLabel: { label: string; info: string } = {
    label: 'Commissione agenzia tradizionale',
    info: 'In media il 3%',
  };

  priceLabel: { label: string; info: string } = {
    label: 'Prezzo di vendita',
    info: '',
  };

  isMobile: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private responsive: BreakpointObserver
  ) {}

  // Modify the template to conditionally render the map
  get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    this._planService.getPlan();

    // Check if we have valid evaluation data
    this.hasEvaluationData = this.property_evaluation_service.hasValidEvaluationData();

    if (!this.hasEvaluationData) {
      console.warn('No evaluation data found. User may need to restart the evaluation process.');
      this.showDataMissingError = true;

      // Redirect to start of evaluation after a delay
      setTimeout(() => {
        this.router.navigate(['/property-evaluation']);
      }, 3000);
      return;
    }

    const insertData = this.property_evaluation_service.getEvaluationData();
    console.log('evaluationData loaded:', insertData);

    try {
      // Safely extract address data with fallbacks
      if (insertData.address) {
        this.latitude = insertData.address.latitude || 45.4642;
        this.longitude = insertData.address.longitude || 9.19;
        this.street = insertData.address.street || '';
        this.street_number = insertData.address.street_number || '';
        this.city = insertData.address.city || '';
      }

      // Safely extract features data with fallbacks
      if (insertData.features && insertData.features.propertyFeatures) {
        this.rooms = insertData.features.propertyFeatures.number_rooms || 1;
        this.bathrooms = insertData.features.propertyFeatures.bathroom_number || 1;
        this.squareMeters = insertData.features.propertyFeatures.square_metres || 100;
      }

      // Update data mapping for API call
      this.dataMapped = {
        macroTypology: 1,
        typology: 1,
        rooms: this.rooms,
        sqM: this.squareMeters,
        conditionType: 1,
        address: `${this.street} ${this.street_number}, ${this.city}`.trim(),
        latitude: this.latitude,
        longitude: this.longitude,
      };

      // Make API call to get property valuation
      this.isLoadingValuation = true;
      this.valuationError = false;

      this.http
        .post(
          `${apiUrl}/api/property-valuation/calculate`,
          { ...this.dataMapped },
          { headers: this.headers }
        )
        .subscribe({
          next: (data: any) => {
            console.log('Valuation API response:', data);
            this.isLoadingValuation = false;

            // Calculate total price: prezzoMedio (per sqm) * square meters
            const prezzoMedioPerSqm = data.prezzoMedio || 2500; // Default €2500 per sqm if API fails
            this.suggestedPrice = Math.round(prezzoMedioPerSqm * this.squareMeters);

            // Calculate agency fee (3% of total price)
            this.agencyFee = Math.round(this.suggestedPrice * 0.03);

            console.log(
              `Calculation: €${prezzoMedioPerSqm}/sqm × ${this.squareMeters}sqm = €${this.suggestedPrice}`
            );
            console.log(`Agency fee (3%): €${this.agencyFee}`);
          },
          error: error => {
            console.error('Error calculating property valuation:', error);
            this.isLoadingValuation = false;
            this.valuationError = true;

            // Set fallback values if API fails
            const fallbackPricePerSqm = 2500; // €2500 per sqm as fallback
            this.suggestedPrice = Math.round(fallbackPricePerSqm * this.squareMeters);
            this.agencyFee = Math.round(this.suggestedPrice * 0.03);

            console.log(
              `Using fallback calculation: €${fallbackPricePerSqm}/sqm × ${this.squareMeters}sqm = €${this.suggestedPrice}`
            );
          },
        });
    } catch (error) {
      console.error('Error processing evaluation data:', error);
      this.showDataMissingError = true;
    }

    // Setup responsive breakpoints
    this.responsive.observe(Breakpoints.HandsetPortrait).subscribe(result => {
      if (result.matches) {
        this.isMobile = true;
        console.log('screens matches Mobile', this.isMobile);
      }
    });
  }

  /**
   * Restart the evaluation process
   */
  restartEvaluation() {
    this.property_evaluation_service.clearEvaluationData();
    this.router.navigate(['/property-evaluation']);
  }

  /**
   * Retry the valuation API call
   */
  retryValuation() {
    if (this.dataMapped) {
      this.isLoadingValuation = true;
      this.valuationError = false;

      this.http
        .post(
          `${apiUrl}/api/property-valuation/calculate`,
          { ...this.dataMapped },
          { headers: this.headers }
        )
        .subscribe({
          next: (data: any) => {
            console.log('Retry valuation API response:', data);
            this.isLoadingValuation = false;

            // Calculate total price: prezzoMedio (per sqm) * square meters
            const prezzoMedioPerSqm = data.prezzoMedio || 2500;
            this.suggestedPrice = Math.round(prezzoMedioPerSqm * this.squareMeters);
            this.agencyFee = Math.round(this.suggestedPrice * 0.03);
          },
          error: error => {
            console.error('Retry valuation failed:', error);
            this.isLoadingValuation = false;
            this.valuationError = true;
          },
        });
    }
  }
}
