import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, OnInit, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { Intervals } from '../../../../core/enums/intervals';
import { ServiceType } from '../../../../core/enums/serviceType';
import { PlanForm } from '../../../../public/interface/plan-form.interface';
import { Plan } from '../../../../public/interface/plan.interface';
import { PlanAndServiceService } from '../../../../public/services/plan-and-service.service';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { SubscriptionPlanComponent } from '../../../../shared/organisms/subscription-plan/subscription-plan.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { ModalSmallComponent } from '../../../../public/components/modal-small/modal-small.component';

/**
 * Componente per gestire i dettagli di piani e servizi.
 * Permette la creazione e modifica di piani di sottoscrizione e relativi servizi.
 */
@Component({
  selector: 'app-plan-service-details',
  standalone: true,
  imports: [
    CommonModule,
    InputComponent,
    ReactiveFormsModule,
    ButtonComponent,
    SubscriptionPlanComponent,
    ModalSmallComponent,
  ],
  templateUrl: './plan-service-details.component.html',
  styleUrl: './plan-service-details.component.scss',
})
export class PlanServiceDetailsComponent implements OnInit {
  private _planService = inject(PlanAndServiceService);
  private toast = inject(ToastService);
  private _router = inject(Router);
  protected disabledForm = false;
  intervals = Object.entries(Intervals);
  serviceType = Object.entries(ServiceType);
  plan = input<any>();
  protected modalType: 'disable-plan' | 'enable-plan' | 'update-plan' | 'delete-plan' | null = null;
  protected isLoading: boolean = false;

  planEffect = effect(() => {
    if (this.plan()) {
      this.serviceList.clear();
      this.plansForm.patchValue(this.plan().plan);
      this.plan().plan.serviceList.forEach((service: any) => {
        this.serviceList.push(this._getNewServiceForm(service));
      });
      if (this.plan()?.plan.id) {
        this.disabledForm = true;
      }
    }
  });

  // Effect to handle free plan changes
  freePlanEffect = effect(() => {
    const freeControl = this.plansForm.get('free');
    const priceControl = this.plansForm.get('price');

    if (freeControl && priceControl) {
      if (freeControl.value) {
        priceControl.setValue(0);
        priceControl.disable();
      } else {
        priceControl.enable();
        // Set minimum value validation when not free
        priceControl.setValidators([Validators.required, Validators.min(0.01)]);
        priceControl.updateValueAndValidity();
      }
    }
  });

  /**
   * Signal che indica se si sta creando un nuovo piano.
   * `true` per nuovo piano, `false` per modifica di un piano esistente.
   */
  isNewPlan = signal(true);

  /**
   * Signal che traccia la tab attiva.
   * Valori possibili: 'info', ecc.
   */
  activeTab = signal('info');

  error = signal<string | null>(null);

  /**
   * Form group per gestire i dettagli del piano.
   * Contiene campi per le informazioni di base, array di info e array di servizi.
   */
  plansForm = new FormGroup<PlanForm>({
    id: new FormControl(undefined, { nonNullable: true }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    interval: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    price: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0.01)],
    }),
    priceDescription: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    isService: new FormControl(false, { nonNullable: true, validators: [Validators.required] }),
    serviceList: new FormArray([this._getNewServiceForm()]),
    tag: new FormControl('', { nonNullable: true }),
    free: new FormControl(false, { nonNullable: true }),
  });

  isSectionInfoValid() {
    const baseValidation =
      this.plansForm.get('title')?.valid &&
      this.plansForm.get('description')?.valid &&
      this.plansForm.get('interval')?.valid &&
      this.plansForm.get('priceDescription')?.valid &&
      this.plansForm.get('tag')?.valid &&
      this.plansForm.get('free')?.valid;

    // Check price validation based on free plan status
    const isFree = this.plansForm.get('free')?.value;
    const priceValid = isFree ? true : this.plansForm.get('price')?.valid;

    return baseValidation && priceValid;
  }

  get serviceList(): FormArray {
    return this.plansForm.get('serviceList') as FormArray;
  }

  ngOnInit(): void {
    // Set up the free plan change listener
    this.plansForm.get('free')?.valueChanges.subscribe(isFree => {
      const priceControl = this.plansForm.get('price');
      if (priceControl) {
        if (isFree) {
          priceControl.setValue(0);
          priceControl.disable();
          priceControl.clearValidators();
        } else {
          priceControl.enable();
          priceControl.setValidators([Validators.required, Validators.min(0.01)]);
        }
        priceControl.updateValueAndValidity();
      }
    });
  }

  /**
   * Imposta la tab attiva.
   * @param tadId - L'ID della tab da attivare.
   */
  setActiveTab(tadId: string) {
    this.activeTab.set(tadId);
  }

  /**
   * Ottiene un form control tramite il suo nome.
   * @param formName - Il nome del form control da ottenere.
   * @returns Il form control se trovato, altrimenti undefined.
   */
  getControl(formName: string): FormControl | undefined {
    return (this.plansForm.get(formName) as FormControl) ?? undefined;
  }

  /**
   * Ottiene un form array tramite il suo nome.
   * @param formName - Il nome del form array, di default 'info'.
   * @returns Il form array se trovato, altrimenti undefined.
   */
  getArrayControl(formName: string): FormArray | undefined {
    return (this.plansForm.get(formName) as FormArray) ?? undefined;
  }

  /**
   * Converte un controllo generico in FormControl.
   * @param control - Il controllo da convertire.
   * @returns Il controllo come FormControl.
   */
  asControl(control: any): FormControl {
    return control as FormControl;
  }

  /**
   * Aggiunge un nuovo form group all'array specificato.
   * Se non viene fornito un parametro, aggiunge un info form. Altrimenti aggiunge un service form.
   * @param string - Opzionale. Il nome del form array a cui aggiungere, di default 'info'.
   */
  addInArray(string: string) {
    this.getArrayControl(string)?.push(this._getNewServiceForm());
  }

  /**
   * Crea un nuovo service form group.
   * @returns Un FormGroup con controlli per nome, descrizione e tipo.
   * @private
   */
  private _getNewServiceForm(data?: any) {
    return new FormGroup({
      name: new FormControl(data?.name ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      description: new FormControl(data?.description ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      type: new FormControl(data?.type ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }

  /**
   * Rimuove un info form group all'indice specificato.
   * @param index - L'indice del form group da rimuovere.
   */
  removeInfo(index: number, arrayName: string) {
    this.getArrayControl(arrayName)?.removeAt(index);
  }

  async add(): Promise<void> {
    if (this.plansForm.invalid) {
      Object.values(this.plansForm.controls).forEach(control => control.markAsTouched());
      this.error.set('Completa tutti i campi obbligatori prima di continuare.');
      return;
    }

    const formValue = this.plansForm.value;
    // Ensure price is 0 for free plans
    if (formValue.free) {
      formValue.price = 0;
    }

    const plan = formValue as Plan;
    this.isLoading = true;
    this.error.set(null); // Clear previous errors

    try {
      const result = await this._planService.add(plan);

      console.log('Result from add:', result);
      // Check if the service returned an error
      if (result && typeof result === 'object' && 'error' in result) {
        throw new Error((result as any).message || 'Errore durante il salvataggio del piano.');
      }

      this.toast.success('Piano aggiunto con successo!');
      this._router.navigate(['/cms/plans-and-service']);
    } catch (err: any) {
      console.error('Error creating plan:', err);

      let errorMessage = 'Errore durante il salvataggio del piano.';

      if (err?.error?.error?.message) {
        errorMessage = err.error.error.message;
      } else if (err?.status === 500) {
        errorMessage = 'Errore interno del server. Riprova più tardi.';
      }

      this.error.set(errorMessage);
      this.toast.error(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  onNextOrBack(button: string, tab: string): void {
    // Move to the preview tab
    if (button === 'next') {
      if (tab === 'info') {
        this.setActiveTab('service');
      } else if (tab === 'service') {
        this.setActiveTab('view');
      }
    }
    if (button === 'back') {
      if (tab === 'service') {
        this.setActiveTab('info');
      } else if (tab === 'view') {
        this.setActiveTab('service');
      }
    }
  }

  async updatePlan() {
    this.modalType = 'update-plan';
  }

  async deactivatePlan() {
    this.modalType = 'disable-plan';
  }

  async activePlan() {
    this.modalType = 'enable-plan';
  }

  async deletePlan() {
    this.modalType = 'delete-plan';
  }

  protected modalClosed() {
    this.modalType = null;
  }

  protected modalAction() {
    this.isLoading = true;
    if (this.modalType === 'disable-plan') {
      this._planService
        .deactivatePlan(this.plan().plan.id)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
        })
        .then(() => {
          this.toast.success('Piano disattivato con successo!');
          this._router.navigate(['/cms/plans-and-service']);
        })
        .catch(err => {
          console.error('Error disabling plan:', err);
          this.toast.error('Errore durante la disabilitazione del piano. Riprova più tardi.');
        });
    } else if (this.modalType === 'enable-plan') {
      this._planService
        .activatePlan(this.plan().plan.id)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
        })
        .then(() => {
          this.toast.success('Piano attivato con successo!');
          this._router.navigate(['/cms/plans-and-service']);
        })
        .catch(err => {
          console.error('Error enabling plan:', err);
          this.toast.error("Errore durante l'attivazione del piano. Riprova più tardi.");
        });
    } else if (this.modalType === 'update-plan') {
      const formValue = this.plansForm.value;
      // Ensure price is 0 for free plans
      if (formValue.free) {
        formValue.price = 0;
      }

      this._planService
        .updatePlanOrService(formValue as Plan)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
        })
        .then(() => {
          this.toast.success('Piano salvato con successo!');
          this._router.navigate(['/cms/plans-and-service']);
        })
        .catch(err => {
          console.error('Error updating plan:', err);
          this.toast.error('Errore durante il salvataggio del piano. Riprova più tardi.');
        });
    } else if (this.modalType === 'delete-plan') {
      this._planService
        .deleteAndDeactivatePlanOrService(this.plan().plan.id)
        .finally(() => {
          this.isLoading = false;
          this.modalClosed();
        })
        .then(() => {
          this.toast.success('Piano eliminato con successo!');
          this._router.navigate(['/cms/plans-and-service']);
        })
        .catch(err => {
          console.error('Error deleting plan:', err);
          this.toast.error('Errore durante la cancellazione del piano. Riprova più tardi.');
        });
    }
  }
}
