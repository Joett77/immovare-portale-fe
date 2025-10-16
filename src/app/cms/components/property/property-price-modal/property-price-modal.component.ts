// property-price-modal.component.ts
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { SelectComponent } from '../../../../shared/molecules/select/select.component';
import { AdvertisementDraft } from '../../../../public/models';

@Component({
  selector: 'app-property-price-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent, SelectComponent],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div class="p-4 border-b border-[#CBCCCD] ">
        <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h2 class="heading-md font-bold text-primary-dark">{{ title }}</h2>
          <button
            (click)="onClose()"
            class="text-gray-500 hover:text-gray-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
      <!-- Modal Body -->
      <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <form
          [formGroup]="priceForm"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <h3 class="text-xl text-primary-dark mb-6 font-montserrat">
              Inserisci il prezzo del tuo immobile
            </h3>
            <div class="mb-6">
              <app-input
                label="Prezzo in €"
                [control]="getControl('price')"
                type="number"
                placeholder="€"
              ></app-input>
            </div>
            <div class="mb-4">
              <span class="block text-sm font-medium text-gray-700 mb-2"
                >Sono previste spese condominiali?</span
              >
              <div class="flex items-center space-x-4">
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    class="form-radio"
                    formControlName="hasCommunityFees"
                    value="si"
                    (change)="onCommunityFeeChange($event)"
                  />
                  <span class="ml-2">Si</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    type="radio"
                    class="form-radio"
                    formControlName="hasCommunityFees"
                    value="no"
                    (change)="onCommunityFeeChange($event)"
                  />
                  <span class="ml-2">No</span>
                </label>
              </div>
            </div>
            <div
              class="mb-6"
              *ngIf="showCommunityFeeInput()"
            >
              <app-input
                label="Costo spese condominiali mensile in €"
                [control]="getControl('condoFees')"
                type="number"
                placeholder="€"
              ></app-input>
            </div>

            <div
              *ngIf="priceForm.get('price')?.value > 0"
              class="mb-6 bg-[#F6F6F6] p-4 rounded-sm"
            >
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-black">Prezzo al m²:</span>
                <span class="text-lg font-semibold text-black">{{ calculatePricePerSqm() }}</span>
              </div>
              <p class="text-xs text-gray-500 mt-1">
                Calcolato su {{ initialData?.squareMetres || 0 }} m²
              </p>
            </div>

            <div class="mt-8 w-full">
              <app-button
                [size]="'md'"
                [text]="isSaving ? 'Salvataggio...' : 'Conferma modifiche'"
                [type]="'primary'"
                [disabled]="priceForm.invalid || isSaving"
                (buttonClick)="saveChanges()"
              ></app-button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      input[type='radio'] {
        width: 16px;
        height: 16px;
      }
    `,
  ],
})
export class PropertyPriceModalComponent implements OnInit, OnChanges {
  @Input() isOpen = false;
  @Input() initialData: AdvertisementDraft | null = null;
  @Input() title = 'Modifica prezzo';
  @Input() isSaving = false;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  priceForm!: FormGroup;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && this.priceForm) {
      this.populateForm();
    }
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      this.populateForm();
    }
  }

  private initializeForm(): void {
    this.priceForm = new FormGroup({
      price: new FormControl(0, [Validators.required, Validators.min(0)]),
      condoFees: new FormControl(0, [Validators.min(0)]),
      hasCommunityFees: new FormControl('no'),
    });

    this.populateForm();
  }

  private populateForm(): void {
    if (this.initialData && this.priceForm) {
      const condoFees = this.initialData.condoFees || 0;
      const hasFees = condoFees > 0 ? 'si' : 'no';

      this.priceForm.patchValue({
        price: this.initialData.price || 0,
        condoFees: condoFees,
        hasCommunityFees: hasFees,
      });
    }
  }

  getControl(controlName: string): FormControl {
    return this.priceForm.get(controlName) as FormControl;
  }

  onCommunityFeeChange(event: any): void {
    const value = event.target.value;
    if (value === 'no') {
      // If "No" is selected, reset condo fees to 0
      this.priceForm.patchValue({ condoFees: 0 });
    }
  }

  showCommunityFeeInput(): boolean {
    return this.priceForm.get('hasCommunityFees')?.value === 'si';
  }

  onClose(): void {
    this.close.emit();
  }

  saveChanges(): void {
    if (this.priceForm.valid) {
      const formData = this.priceForm.value;
      const condoFees = formData.hasCommunityFees === 'si' ? formData.condoFees : 0;

      this.save.emit({
        price: formData.price,
        condoFees: condoFees,
      });
    }
  }

  calculatePricePerSqm(): string {
    const price = this.priceForm?.get('price')?.value || 0;
    const squareMetres = this.initialData?.squareMetres || 0;

    if (!price || !squareMetres || squareMetres <= 0) {
      return '0,00 €';
    }

    const pricePerSqm = Math.round(price / squareMetres);
    return pricePerSqm.toLocaleString('it-IT') + ',00 €';
  }
}
