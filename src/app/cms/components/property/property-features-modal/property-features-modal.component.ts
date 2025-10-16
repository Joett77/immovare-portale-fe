// src/app/cms/components/property/property-features-modal/property-features-modal.component.ts
import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/molecules/input/input.component';
import { ButtonComponent } from '../../../../shared/atoms/button/button.component';
import { SelectComponent } from '../../../../shared/molecules/select/select.component';
import { IncrementalButtonComponent } from '../../../../shared/molecules/incremental-button/incremental-button.component';
import { AdvertisementDraft } from '../../../../public/models';
import { PropertyFeature } from '../../../../public/models';
import { propertySpaceFeatures } from '../../../../public/mock/data';

@Component({
  selector: 'app-property-features-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    IncrementalButtonComponent,
  ],
  template: `
    <div
      *ngIf="isOpen"
      class="fixed inset-0 z-50 bg-white flex flex-col"
    >
      <div class="p-4 border-b border-[#CBCCCD] ">
        <div class="container mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between  items-center">
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
      <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
        <form
          [formGroup]="propertyFeaturesForm"
          class="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <h3 class="text-xl text-primary-dark mb-6 font-montserrat">
              Caratteristiche dell'abitazione
            </h3>

            <div class="mb-6">
              <app-select
                [withBorder]="true"
                label="Tipologia"
                [control]="getControl('type')"
                [options]="propertyTypeOptions"
                (selectionChange)="onSelectChange($event)"
              ></app-select>
            </div>

            <div class="mb-6">
              <app-input
                label="Superficie"
                [control]="getControl('squareMetres')"
                type="number"
                placeholder="m²"
              ></app-input>
            </div>

            <div class="flex flex-col gap-y-6 mb-6">
              <div class="flex items-center space-x-4">
                <app-incremental-button
                  [label]="'Locali'"
                  [control]="getControl('numberRooms')"
                ></app-incremental-button>
              </div>

              <div class="flex items-center space-x-4">
                <app-incremental-button
                  [label]="'Bagni'"
                  [control]="getControl('numberBaths')"
                ></app-incremental-button>
              </div>

              <div class="flex items-center space-x-4">
                <app-incremental-button
                  [label]="'Piano'"
                  [control]="getControl('floorNumber')"
                ></app-incremental-button>
              </div>
            </div>

            <div class="mb-6">
              <app-select
                [withBorder]="true"
                label="Stato immobile"
                [control]="getControl('propertyCondition')"
                [options]="propertyStatusOptions"
                (selectionChange)="onSelectChange($event)"
              ></app-select>
            </div>

            <div class="mb-6">
              <app-input
                label="Anno di costruzione"
                [control]="getControl('constructionYear')"
                type="number"
                placeholder="Anno"
              ></app-input>
            </div>

            <div class="mb-6">
              <app-select
                [withBorder]="true"
                label="Stato del rogito"
                [control]="getControl('deedState')"
                [options]="deedStateOptions"
                (selectionChange)="onSelectChange($event)"
              ></app-select>
            </div>

            <div class="mb-6">
              <app-select
                [withBorder]="true"
                label="Riscaldamento"
                [control]="getControl('heating')"
                [options]="heatingStateOptions"
                (selectionChange)="onSelectChange($event)"
              ></app-select>
            </div>

            <div class="mb-6">
              <app-select
                [withBorder]="true"
                label="Classe energetica"
                [control]="getControl('energyClass')"
                [options]="energyStateOptions"
                (selectionChange)="onSelectChange($event)"
              ></app-select>
            </div>

            <div class="mt-8">
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
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class PropertyFeaturesModalComponent implements OnInit {
  @Input() isOpen = false;
  @Input() title = 'Modifica caratteristiche immobile';
  @Input() initialData: Partial<AdvertisementDraft> | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  // Form group for property features
  propertyFeaturesForm = new FormGroup({
    type: new FormControl<string>('', [Validators.required]), // Added type field
    squareMetres: new FormControl<number>(0, [Validators.required, Validators.min(1)]),
    numberRooms: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    numberBaths: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    floorNumber: new FormControl<number>(1, [Validators.required]),
    propertyCondition: new FormControl<string>('', [Validators.required]),
    constructionYear: new FormControl<number>(new Date().getFullYear(), [Validators.required]),
    deedState: new FormControl<string>(''),
    heating: new FormControl<string>(''),
    energyClass: new FormControl<string>(''),
  });

  // Property type options
  propertyTypeOptions = [
    { label: 'Qualsiasi', value: 'Qualsiasi' },
    { label: 'Appartamento', value: 'Appartamento' },
    { label: 'Villa Indipendente', value: 'Villa Indipendente' },
    { label: 'Villetta a schiera', value: 'Villetta a schiera' },
    { label: 'Loft/Open space', value: 'Loft/Open space' },
    { label: 'Mansarda', value: 'Mansarda' },
    { label: 'Attico', value: 'Attico' },
  ];

  propertyStatusOptions = [
    { label: 'Abitabile', value: 'Abitabile' },
    { label: 'Ristrutturato', value: 'Ristrutturato' },
    { label: 'Da ristrutturare', value: 'Da ristrutturare' },
    { label: 'Nuova costruzione', value: 'Nuova costruzione' },
  ];

  deedStateOptions = [
    { label: 'Libero', value: 'Libero' },
    { label: 'Occupato', value: 'Occupato' },
    { label: 'Nuda proprietà', value: 'Nuda proprietà' },
    { label: 'Affittato', value: 'Affittato' },
  ];

  heatingStateOptions = [
    { label: 'Autonomo', value: 'Autonomo' },
    { label: 'Centralizzato', value: 'Centralizzato' },
    { label: 'Gas', value: 'Gas' },
    { label: 'Elettrico', value: 'Elettrico' },
    { label: 'Combustibile', value: 'Combustibile' },
  ];

  energyStateOptions = [
    { label: 'A++++', value: 'Classe A4' },
    { label: 'A+++', value: 'Classe A3' },
    { label: 'A++', value: 'Classe A2' },
    { label: 'A+', value: 'Classe A1' },
    { label: 'A', value: 'Classe A' },
    { label: 'B', value: 'Classe B' },
    { label: 'C', value: 'Classe C' },
    { label: 'D', value: 'Classe D' },
    { label: 'E', value: 'Classe E' },
    { label: 'F', value: 'Classe F' },
    { label: 'G', value: 'Classe G' },
  ];

  ngOnInit(): void {
    if (this.initialData) {
      this.populateFormFromData(this.initialData);
    }
  }

  // Populate form with data from input
  private populateFormFromData(data: Partial<AdvertisementDraft>): void {
    this.propertyFeaturesForm.patchValue({
      type: data.type || '', // Added type field population
      squareMetres: data.squareMetres || 0,
      numberRooms: data.numberRooms || 1,
      numberBaths: data.numberBaths || 1,
      floorNumber: this.parseFloor(data.floor as string),
      propertyCondition: data.propertyCondition || '',
      constructionYear: data.constructionYear || new Date().getFullYear(),
      deedState: data.deedState || '',
      heating: data.heating || '',
      energyClass: data.energyClass || '',
    });
  }

  // Parse floor value (could be string like 'Terra' or a number)
  private parseFloor(floor: string | undefined): number {
    if (!floor) return 0;

    if (floor.toLowerCase() === 'terra') return 0;
    if (floor.toLowerCase() === 'rialzato') return 0;
    if (floor.toLowerCase() === 'seminterrato') return -1;
    if (floor.toLowerCase() === 'interrato') return -1;

    const parsed = parseInt(floor);
    return isNaN(parsed) ? 0 : parsed;
  }

  // Helper to get a form control
  getControl(name: string): FormControl {
    return this.propertyFeaturesForm.get(name) as FormControl;
  }

  // Handle select change
  onSelectChange(value: string): void {
    // Optional handler for select changes
  }

  // Close the modal
  onClose(): void {
    // When the modal closes, re-enable scrolling on the body
    document.body.classList.remove('overflow-hidden');
    this.close.emit();
  }

  // Save changes and close the modal
  saveChanges(): void {
    if (this.propertyFeaturesForm.valid) {
      const formData = this.propertyFeaturesForm.value;

      // Convert floor number to appropriate format
      let floorValue: string = formData.floorNumber?.toString() || '0';
      if (formData.floorNumber === 0) floorValue = 'Terra';
      if (formData.floorNumber === -1) floorValue = 'Seminterrato';

      // Prepare data for the parent component
      const propertyData = {
        type: formData.type, // Added type field to output
        squareMetres: formData.squareMetres,
        numberRooms: formData.numberRooms,
        numberBaths: formData.numberBaths,
        floor: floorValue,
        propertyCondition: formData.propertyCondition,
        constructionYear: formData.constructionYear,
        deedState: formData.deedState,
        heating: formData.heating,
        energyClass: formData.energyClass,
      };

      this.save.emit(propertyData);
      this.close.emit();
    } else {
      // Mark all fields as touched to display validation errors
      Object.keys(this.propertyFeaturesForm.controls).forEach(key => {
        this.propertyFeaturesForm.get(key)?.markAsTouched();
      });
    }
  }
}
