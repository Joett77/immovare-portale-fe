// src/app/shared/molecules/multi-feature-button/multi-feature-button.component.ts
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, Type } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';

interface FeatureItem {
  id: number;
  label: string;
  icon: Type<any>;
}

@Component({
  selector: 'app-multi-feature-button',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  template: `
    <div class="flex flex-col gap-y-2">
      <button
        *ngFor="let feature of features"
        type="button"
        class="w-full px-3 py-4 rounded-md border flex items-center justify-between transition-colors duration-200"
        [ngClass]="{
          'border-black bg-secondary': isSelected(feature.id),
          'border-[#CBCCCD] hover:bg-gray-100': !isSelected(feature.id),
        }"
        (click)="toggleSelection(feature)"
      >
        <span class="flex items-center">
          <ng-container *ngIf="feature.icon">
            <div class="h-6 w-6 mr-3">
              <ng-container *ngComponentOutlet="feature.icon"></ng-container>
            </div>
          </ng-container>
          <span>{{ feature.label }}</span>
        </span>

        <!-- Checkmark icon for selected state -->
        <span
          *ngIf="isSelected(feature.id)"
          class="text-black"
        >
          <fa-icon
            [icon]="faCheckCircle"
            size="lg"
          ></fa-icon>
        </span>
      </button>
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
export class MultiFeatureButtonComponent implements OnInit {
  @Input() features: FeatureItem[] = [];
  @Input() initialSelections: string[] = [];

  @Output() selectionsChanged = new EventEmitter<string[]>();

  faCheckCircle = faCheckCircle;
  private selectedIds: number[] = [];

  ngOnInit(): void {
    // Initialize selected IDs from initialSelections
    if (this.initialSelections && this.initialSelections.length > 0) {
      this.features.forEach(feature => {
        if (
          this.initialSelections.some(
            label =>
              label.toLowerCase() === feature.label.toLowerCase() ||
              this.featureMatches(label.toLowerCase(), feature.label.toLowerCase())
          )
        ) {
          this.selectedIds.push(feature.id);
        }
      });
    }
  }

  isSelected(featureId: number): boolean {
    return this.selectedIds.includes(featureId);
  }

  toggleSelection(feature: FeatureItem): void {
    const index = this.selectedIds.indexOf(feature.id);

    if (index > -1) {
      // Feature is already selected, remove it
      this.selectedIds.splice(index, 1);
    } else {
      // Feature is not selected, add it
      this.selectedIds.push(feature.id);
    }

    const selectedLabels = this.getSelectedLabels();
    this.selectionsChanged.emit(selectedLabels);
  }

  getSelectedLabels(): string[] {
    return this.selectedIds
      .map(id => {
        const feature = this.features.find(f => f.id === id);
        return feature ? feature.label : '';
      })
      .filter(label => label !== '');
  }

  // Helper method to match features with different spellings
  private featureMatches(apiFeature: string, uiFeature: string): boolean {
    const mappings: Record<string, string[]> = {
      balcone: ['balconi', 'balcony'],
      terrazzo: ['terrazza', 'terrace'],
      garage: ['box auto', 'posto auto coperto'],
      parcheggio: ['posto auto', 'parking'],
      giardino: ['garden'],
      ascensore: ['elevator', 'lift'],
      cantina: ['basement', 'storage'],
      piscina: ['pool', 'swimming'],
      'licenza turistica': ['tourist license', 'license'],
    };

    return mappings[uiFeature]?.some(synonym => apiFeature.includes(synonym)) || false;
  }
}
