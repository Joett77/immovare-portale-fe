// src/app/cms/components/property/property-extra-features-modal/property-extra-features-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { MultiFeatureButtonComponent } from '../../../../shared/molecules/multi-feature-button/multi-feature-button.component';
import { extraFeatures } from '../../../../public/mock/data';
import { AdvertisementDraft } from '../../../../public/models';

@Component({
  selector: 'app-property-extra-features-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    MultiFeatureButtonComponent,
  ],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <!-- Modal Header -->
      <div class="p-4 border-b border-[#CBCCCD]">
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

      <!-- Modal Body (scrollable) -->
      <div class="flex-1 overflow-y-auto">
        <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <form
            [formGroup]="propertyExtraFeatureForm"
            class="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <!-- Description field -->
              <div class="mb-8">
                <h3 class="text-xl text-primary-dark mb-4 font-montserrat">
                  Inserisci una descrizione (Opzionale)
                </h3>
                <app-input
                  class="w-full"
                  label="Descrizione"
                  [control]="getControl('optionalDescription')"
                  type="textarea"
                  [rows]="4"
                ></app-input>
              </div>

              <!-- Extra features selection -->
              <div class="mb-8">
                <h3 class="text-xl text-primary-dark mb-4 font-montserrat">
                  Caratteristiche aggiuntive (Opzionale)
                </h3>

                <app-multi-feature-button
                  [features]="availableFeatures"
                  [initialSelections]="initialFeatureSelections"
                  (selectionsChanged)="onFeaturesChanged($event)"
                ></app-multi-feature-button>
              </div>

              <!-- Save button -->
              <div class="mb-6">
                <app-button
                  [type]="'primary'"
                  [text]="'Conferma modifiche'"
                  [size]="'md'"
                  (buttonClick)="saveChanges()"
                ></app-button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PropertyExtraFeaturesModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() title = 'Modifica caratteristiche aggiuntive';
  @Input() initialData: Partial<AdvertisementDraft> | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  // Available features
  availableFeatures = extraFeatures;

  // Initial feature selections from input data
  initialFeatureSelections: string[] = [];

  selectedFeatures: string[] = [];

  // Form
  propertyExtraFeatureForm = new FormGroup({
    optionalDescription: new FormControl<string>(''),
  });

  ngOnInit(): void {
    if (this.initialData) {
      this.populateFormFromData(this.initialData);
    }
  }

  // Handle features selection changes from the multi-feature-button component
  onFeaturesChanged(selectedFeatures: string[]): void {
    this.selectedFeatures = selectedFeatures;
  }

  // Form control accessor helper
  getControl(name: string): FormControl {
    return this.propertyExtraFeatureForm.get(name) as FormControl;
  }

  // Populate form with data from input
  private populateFormFromData(data: Partial<AdvertisementDraft>): void {
    // Set description
    this.propertyExtraFeatureForm.patchValue({
      optionalDescription: data.description || '',
    });

    // Set initial features
    if (data.features) {
      this.initialFeatureSelections = data.features.split(',').map(f => f.trim());
      this.selectedFeatures = [...this.initialFeatureSelections];
    }
  }

  onClose(): void {
    // When the modal closes, re-enable scrolling on the body
    document.body.classList.remove('overflow-hidden');
    this.close.emit();
  }

  saveChanges(): void {
    const formData = {
      description: this.propertyExtraFeatureForm.get('optionalDescription')?.value || '',
      features: this.selectedFeatures.join(', '),
    };

    this.save.emit(formData);
    this.close.emit();
  }
}
