import { AsyncPipe } from '@angular/common';
import { Component, effect, EventEmitter, inject, input, Output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PlanDataPipe } from '../../../core/pipes/plan-data.pipe';
import { PaymentService } from '../../../public/service/payment.service';
import { ButtonComponent } from '../../atoms/button/button.component';
import { ActionsDropdownComponent } from '../../action/app-actions-dropdown/app-actions-dropdown.component';
import { finalize } from 'rxjs';
import { ChooseAPlanComponent } from '../../../public/components/sell-property/choose-a-plan/choose-a-plan.component';
import { ModalFullScreenComponent } from '../../../public/components/modal-full-screen/modal-full-screen.component';
import { ModalSmallComponent } from '../../../public/components/modal-small/modal-small.component';
import { PropertyApiService } from '../../../public/services/property-api.service';
import { ToastService } from '../../services/toast.service';
import { faScrewdriverWrench, faCog, faCopy } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-property-toolbar',
  standalone: true,
  imports: [
    ButtonComponent,
    RouterLink,
    PlanDataPipe,
    AsyncPipe,
    ActionsDropdownComponent,
    ChooseAPlanComponent,
    ModalFullScreenComponent,
    ModalSmallComponent,
    FaIconComponent,
  ],
  templateUrl: './property-toolbar.component.html',
  styleUrl: './property-toolbar.component.scss',
})
export class PropertyToolbarComponent {
  @Output() editEvent = new EventEmitter<void>();
  @Output() publishEvent = new EventEmitter<void>();
  @Output() goToMyAdsEvent = new EventEmitter<void>();
  goToEdit() {
    this.editEvent.emit();
  }
  publishListing() {
    this.publishEvent.emit();
  }
  goToMyAds() {
    this.goToMyAdsEvent.emit();
  }
  paymentService = inject(PaymentService);
  router = inject(Router);
  private apiService = inject(PropertyApiService);
  private toast = inject(ToastService);

  property = input<any>(undefined);
  subscription = signal<any>(undefined);
  modalOpen = signal(false);
  propertyId = signal<string | undefined>(undefined);
  activePlan = signal<any>(undefined);
  protected modalType: null | 'delete-element' = null;
  protected propertyToDelete: string | null = null;
  isLoading = false;

  propertyEffect = effect(() => {
    if (this.property()) this.findAndSetSubscription();
  });

  async findAndSetSubscription() {
    const subs = await this.paymentService.findSubscription({
      advertisementsId: this.property()?.id,
      type: 'subscription',
    });
    if (subs.length > 0) {
      this.subscription.set(subs.find(sub => sub.status === 'active'));
    }
  }
  payListing() {
    this.paymentService.settings.set({
      planId: this.property().draftPlanSelected!,
      advertismentId: this.property().id!,
    });

    //if (!this.advertisementId()) return this.router.navigate(['/property-publishing'], {});
    return this.router.navigate(['/checkout'], {});
  }

  openPlanModal(property: any) {
    this.propertyId.set(property.id!);
    this.activePlan.set(this.subscription()?.stripeProductId!);
    this.modalOpen.set(true);
  }

  deleteProperty(propertyId: string) {
    this.propertyToDelete = propertyId;
    this.modalType = 'delete-element';
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected async modalAction(event: any) {
    this.isLoading = true;
    if (this.modalType === 'delete-element') {
      this.apiService
        .deleteAdvertisement(event)
        .pipe(
          finalize(() => {
            this.isLoading = false;
            this.propertyToDelete = null;
            this.modalClosed();
          })
        )
        .subscribe({
          next: () => {
            this.goToMyAds();
          },
          error: err => {
            console.error('Error deleting advertisement:', err);
            this.toast.error("Errore durante l'eliminazione dell'annuncio. Riprova più tardi.");
          },
        });
    }
  }

  goToTicket() {
    this.router.navigate(['/dashboard/messaggi/nuovo']);
  }

  editPropertySettings(propertyId: string) {
    console.log('Property ID:', propertyId);
    if (!propertyId) {
      console.error('Missing property ID for editing');
      return;
    }
    console.log('Navigating to edit property:', propertyId);
    this.router.navigate(['/dashboard/annuncio/', propertyId]);
  }

  protected readonly faScrewdriverWrench = faScrewdriverWrench;
  protected readonly faCopy = faCopy;
}
