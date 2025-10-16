import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ServiceType } from '../../../../core/enums/serviceType';
import { PlanForm } from '../../../../public/interface/plan-form.interface';
import { Plan } from '../../../../public/interface/plan.interface';
import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [
    InputComponent,
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    ModalSmallComponent,
  ],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss',
})
export class ServiceDetailComponent {
  private _planService = inject(PlanAndServiceService);
  private _router = inject(Router);
  private toast = inject(ToastService);
  serviceType = Object.entries(ServiceType);
  protected modalType: "delete-service" | "update-service" | null = null;
  protected isLoading: boolean = false;

  service = input<any>();
  serviceEffect = effect(() => {
    if (this.service()) {
      this.serviceForm.patchValue(this.service().plan);
    }
  });

  isNewPlan = signal(true);

  serviceForm = new FormGroup<PlanForm>({
    id: new FormControl(undefined, { nonNullable: true }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    priceDescription: new FormControl('', { nonNullable: true }),
    type: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    isService: new FormControl(true, { nonNullable: true, validators: [Validators.required] }),
    tag: new FormControl('', { nonNullable: true }),
  });

  /**
   * Ottiene un form control tramite il suo nome.
   * @param formName - Il nome del form control da ottenere.
   * @returns Il form control se trovato, altrimenti undefined.
   */
  getControl(formName: string): FormControl | undefined {
    return (this.serviceForm.get(formName) as FormControl) ?? undefined;
  }

  async add() {
    await this._planService.add(this.serviceForm.value as Plan);
    this.toast.success('Piano aggiungo con successo!');
    this._router.navigate(['/cms/plans-and-service']);
  }

  async save() {
    this.modalType = "update-service"
  }

  async delete() {
    this.modalType = "delete-service"
  }

  async deactivatePlan() {
    await this._planService.deactivatePlan(this.service().plan.id);
    this.toast.success('Servizio disattivato con successo!');
    this._router.navigate(['/cms/plans-and-service']);
  }

  async activePlan() {
    await this._planService.activatePlan(this.service().plan.id);
    this.toast.success('Servizio Attivato con successo!');
    this._router.navigate(['/cms/plans-and-service']);
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected modalAction() {

    this.isLoading = true;
    if (this.modalType === 'update-service') {
      this._planService.updatePlanOrService(this.serviceForm.value as Plan)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
        })
        .then(() => {
          this.toast.success('Servizio modificato con successo!');
          this._router.navigate(['/cms/plans-and-service']);
        })
        .catch(err => {
          console.error('Error updating service:', err);
          this.toast.error("Errore durante la modifica del servizio. Riprova più tardi.");
        });
    } else if (this.modalType === 'delete-service') {
      this._planService.deletePlanOrService(this.service().plan.id)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
        })
        .then(() => {
          this.toast.success('Servizio eliminato con successo!');
          this._router.navigate(['/cms/plans-and-service']);
        })
        .catch(err => {
          console.error('Error disabling plan:', err);
          this.toast.error("Errore durante la cancellazione del servizio. Riprova più tardi.");
        });
    }
  }
}
